import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Spinner, Button, Badge, Nav } from 'react-bootstrap'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import UserHeader from './UserHeader'
import UserLeftNav from './UserLeftNav'
import '../../assets/css/userleftnav.css'
import { FaGraduationCap, FaArrowLeft, FaClock, FaUsers, FaCheckCircle, FaVideo, FaCalendarAlt, FaHistory } from 'react-icons/fa'
import { useAuth } from '../all_login/AuthContext'
import { useLanguage } from '../all_login/LanguageContext'

const translations = {
  en: {
    title: 'Grooming Classes',
    subtitle: 'Enhance your skills with professional grooming courses',
    backToDashboard: 'Back to Dashboard',
    loading: 'Loading...',
    noClasses: 'No grooming classes available at the moment.',
    enrolled: 'Enrolled',
    enrollNow: 'Enroll Now',
    joinClass: 'Join Class',
    upcoming: 'Upcoming',
    myClasses: 'My Classes',
    noEnrolledClasses: 'You have not enrolled in any class yet.',
    participants: 'Participants'
  },
  hi: {
    title: 'ग्रूमिंग क्लासेस',
    subtitle: 'पेशेवर ग्रूमिंग कोर्स से अपने कौशल को बढ़ाएं',
    backToDashboard: 'डैशबोर्ड पर वापस जाएं',
    loading: 'लोड हो रहा है...',
    noClasses: 'इस समय कोई ग्रूमिंग क्लास उपलब्ध नहीं है।',
    enrolled: 'नामांकित',
    enrollNow: 'अभी भर्ती करें',
    joinClass: 'क्लास में शामिल हों',
    upcoming: 'आगामी',
    myClasses: 'मेरी क्लासेस',
    noEnrolledClasses: 'आपने अभी तक किसी क्लास में भर्ती नहीं हुई है।',
    participants: 'प्रतिभागी'
  }
}

const GroomingClasses = () => {
  const { uniqueId, accessToken } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(null)
  const [groomingClasses, setGroomingClasses] = useState([])
  const [enrolledClasses, setEnrolledClasses] = useState([])
  const [participantCounts, setParticipantCounts] = useState({})
  const [activeTab, setActiveTab] = useState('upcoming')
  const t = translations[language] || translations.en

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, participationRes] = await Promise.all([
          axios.get('https://brjobsedu.com/gyandhara/gyandhara_backend/api/grooming-classes/', {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            timeout: 10000
          }),
          axios.get('https://brjobsedu.com/gyandhara/gyandhara_backend/api/grooming-participation/', {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            timeout: 10000
          })
        ])

        if (classesRes.data.success) {
          setGroomingClasses(classesRes.data.data || [])

          if (participationRes.data.success) {
            const allParticipation = participationRes.data.data
            const counts = {}
            allParticipation.forEach(p => {
              counts[p.class_id] = (counts[p.class_id] || 0) + 1
            })
            setParticipantCounts(counts)
            const userEnrolled = allParticipation
              .filter(p => p.student_id === uniqueId)
              .map(p => p.class_id)
            setEnrolledClasses(userEnrolled)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (accessToken && uniqueId) {
      fetchData()
    }
  }, [accessToken, uniqueId])

  const handleEnroll = async (classId) => {
    if (enrolling) return
    setEnrolling(classId)
    try {
      await axios.post(
        'https://brjobsedu.com/gyandhara/gyandhara_backend/api/grooming-participation/',
        { student_id: uniqueId, class_id: classId },
        { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
      )
      setEnrolledClasses(prev => [...prev, classId])
      setParticipantCounts(prev => ({ ...prev, [classId]: (prev[classId] || 0) + 1 }))
    } catch (error) {
      console.error('Error enrolling:', error)
    } finally {
      setEnrolling(null)
    }
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    })
  }

  const getDuration = (start, end) => {
    if (!start || !end) return ''
    const diffMs = new Date(end) - new Date(start)
    if (isNaN(diffMs)) return ''
    const totalSeconds = Math.floor(diffMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    let result = []
    if (hours > 0) result.push(`${hours}h`)
    if (minutes > 0) result.push(`${minutes}m`)
    if (seconds > 0 && hours === 0) result.push(`${seconds}s`)
    return result.join(' ') || '0s'
  }

  const activeClasses = groomingClasses.filter(c => c.is_active === true)
  const userEnrolledClasses = groomingClasses.filter(c => enrolledClasses.includes(c.class_id))

  return (
    <div className="dashboard-container">
      <UserLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <UserHeader toggleSidebar={toggleSidebar} />

        <Container className="dashboard-box mt-3">
          <div className="mb-4">
            <Button variant="outline-secondary" onClick={() => navigate('/UserDashboard')} className="d-flex align-items-center">
              <FaArrowLeft className="me-2" />
              {t.backToDashboard}
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: '60px', height: '60px' }} />
              <p className="mt-3">{t.loading}</p>
            </div>
          ) : (
            <>
              <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, rgb(94, 117, 223), rgb(230, 101, 10))', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
                <Card.Body className="py-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-white">
                      <h2 className="mb-2 fw-bold text-white"><FaGraduationCap className="me-2" />{t.title}</h2>
                      <p className="mb-0 opacity-75">{t.subtitle}</p>
                    </div>
                    <div className="text-white text-center">
                      <div className="fs-1 fw-bold">{activeClasses.length}</div>
                      <div className="small opacity-75">{t.upcoming}</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Nav variant="tabs" className="mb-3" activeKey={activeTab} onSelect={setActiveTab}>
                <Nav.Item>
                  <Nav.Link eventKey="upcoming"><FaCalendarAlt className="me-2" />{t.upcoming}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="myclasses"><FaHistory className="me-2" />{t.myClasses}</Nav.Link>
                </Nav.Item>
              </Nav>

              {activeTab === 'upcoming' && (
                <>
                  {activeClasses.length === 0 ? (
                    <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
                      <Card.Body className="text-center py-5">
                        <FaGraduationCap size={50} className="text-muted mb-3" />
                        <p className="text-muted mb-0">{t.noClasses}</p>
                      </Card.Body>
                    </Card>
                  ) : (
                    <Row>
                      {activeClasses.map((cls) => {
                        const isEnrolled = enrolledClasses.includes(cls.class_id)
                        const participantCount = participantCounts[cls.class_id] || 0
                        return (
                          <Col lg={4} md={6} className="mb-4" key={cls.class_id}>
                            <Card className="h-100 border-0" style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                              <div className="p-3" style={{ background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)' }}>
                                <FaVideo size={40} className="text-primary" />
                              </div>
                              <Card.Body className="p-3">
                                <h5 className="mb-2 fw-bold">{language === 'hi' ? cls.title_hindi || cls.title : cls.title}</h5>
                                <p className="text-muted small mb-3">{language === 'hi' ? cls.description_hindi || cls.description : cls.description}</p>
                                <div className="d-flex flex-wrap gap-2 mb-3">
                                  <Badge bg="light" text="dark"><FaCalendarAlt className="me-1" size={12} />{formatDateTime(cls.start_date_time)}</Badge>
                                  <Badge bg="light" text="dark"><FaClock className="me-1" size={12} />{getDuration(cls.start_date_time, cls.end_date_time)}</Badge>
                                  <Badge bg="info"><FaUsers className="me-1" size={12} />{participantCount}</Badge>
                                </div>
                                <div className="d-flex gap-2">
                                  {isEnrolled ? (
                                    (() => {
                                      const now = new Date()
                                      const start = cls.start_date_time ? new Date(cls.start_date_time) : null
                                      const end = cls.end_date_time ? new Date(cls.end_date_time) : null
                                      const isLive = start && end && now >= start && now <= end

                                      if (isLive && cls.class_link) {
                                        return (
                                          <Button
                                            className="w-100"
                                            style={{ background: '#667eea', border: 'none' }}
                                            onClick={() => window.open(cls.class_link, '_blank')}
                                          >
                                            <FaVideo className="me-2" />{t.joinClass}
                                          </Button>
                                        )
                                      }
                                      return (
                                        <Button className="w-100" disabled style={{ background: '#28a745', border: 'none' }}>
                                          <FaCheckCircle className="me-2" />{t.enrolled}
                                        </Button>
                                      )
                                    })()
                                  ) : (
                                    <Button className="w-100" onClick={() => handleEnroll(cls.class_id)} disabled={enrolling === cls.class_id}
                                      style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: 'none' }}>
                                      {enrolling === cls.class_id ? <Spinner size="sm" className="me-2" /> : null}
                                      {t.enrollNow}
                                    </Button>
                                  )}
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        )
                      })}
                    </Row>
                  )}
                </>
              )}

              {activeTab === 'myclasses' && (
                <>
                  {userEnrolledClasses.length === 0 ? (
                    <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
                      <Card.Body className="text-center py-5">
                        <FaHistory size={50} className="text-muted mb-3" />
                        <p className="text-muted mb-0">{t.noEnrolledClasses}</p>
                      </Card.Body>
                    </Card>
                  ) : (
                    <Row>
                      {userEnrolledClasses.map((cls) => (
                        <Col lg={4} md={6} className="mb-4" key={cls.class_id}>
                          <Card className="h-100 border-0" style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                            <div className="p-3" style={{ background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)' }}>
                              <FaVideo size={40} className="text-primary" />
                            </div>
                            <Card.Body className="p-3">
                              <h5 className="mb-2 fw-bold">{language === 'hi' ? cls.title_hindi || cls.title : cls.title}</h5>
                              <p className="text-muted small mb-3">{language === 'hi' ? cls.description_hindi || cls.description : cls.description}</p>
                              <div className="d-flex flex-wrap gap-2 mb-3">
                                <Badge bg="light" text="dark"><FaCalendarAlt className="me-1" size={12} />{formatDateTime(cls.start_date_time)}</Badge>
                                <Badge bg="success"><FaCheckCircle className="me-1" size={12} />{t.enrolled}</Badge>
                              </div>
                              {(() => {
                                const now = new Date()
                                const start = cls.start_date_time ? new Date(cls.start_date_time) : null
                                const end = cls.end_date_time ? new Date(cls.end_date_time) : null
                                const isLive = start && end && now >= start && now <= end

                                if (isLive && cls.class_link) {
                                  return (
                                    <Button
                                      className="w-100"
                                      style={{ background: '#667eea', border: 'none' }}
                                      onClick={() => window.open(cls.class_link, '_blank')}
                                    >
                                      <FaVideo className="me-2" />{t.joinClass}
                                    </Button>
                                  )
                                }
                                return null
                              })()}
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </>
              )}
            </>
          )}
        </Container>
      </div>
    </div>
  )
}

export default GroomingClasses