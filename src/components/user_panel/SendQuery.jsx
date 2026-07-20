import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Alert, Form, Button } from 'react-bootstrap'
import { useAuth } from "../all_login/AuthContext";

import { useNavigate } from 'react-router-dom'

import { FaArrowLeft, FaPaperPlane, FaHistory, FaClock } from 'react-icons/fa'
import UserLeftNav from './UserLeftNav'
import UserHeader from './UserHeader'
import { useLanguage } from '../all_login/LanguageContext'


const API_URL = 'https://brjobsedu.com/epathshala/epathshala_backend/api/student-issue/'

function SendQuery() {
  const { language } = useLanguage()
  const { uniqueId, accessToken, userRoleType } = useAuth()
  const navigate = useNavigate()
  
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: '',
    student_id: '',
    title: '',
    issue: ''
  })
  
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)


  // Check admin role and redirect
  useEffect(() => {
    if (userRoleType === 'admin') {
      navigate('/AdminDashboard')
    }
  }, [userRoleType, navigate])

  // Check mobile view
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
    if (isMobile || isTablet) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setSidebarOpen(!sidebarOpen)
    }
  }

  // Load student profile and auto-fill name from profile data
  useEffect(() => {
    const loadStudentProfile = async () => {
      if (!uniqueId || !accessToken) return

      try {
        const response = await fetch(
          `https://brjobsedu.com/epathshala/epathshala_backend/api/student-reg/?student_id=${uniqueId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (response.ok) {
          const result = await response.json()
          const profileData = result?.data || result
          const student = Array.isArray(profileData) ? profileData[0] : profileData

          if (student?.full_name) {
            setFormData(prev => ({ ...prev, full_name: student.full_name }))
          }
        }
      } catch (error) {
        console.error('Error fetching student profile:', error)
      }
    }

    loadStudentProfile()
  }, [uniqueId, accessToken])

  // Fetch all queries on component mount and initialize student_id from auth
  useEffect(() => {
    if (uniqueId) {
      setFormData(prev => ({ ...prev, student_id: uniqueId }))
      fetchQueries()
    }
  }, [uniqueId, accessToken])

  const fetchQueries = async () => {
    setLoading(true)
    try {
      console.log('Fetching queries with student_id:', uniqueId)
      const response = await fetch(`${API_URL}?student_id=${uniqueId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('API Response:', result)
        
        // Handle both response formats - with status/data or direct array
        let userQueries = []
        if (result.status && result.data) {
          userQueries = result.data
        } else if (Array.isArray(result)) {
          userQueries = result
        }
        console.log('Filtered queries:', userQueries)
        setQueries(userQueries)
      } else {
        console.error('Failed to fetch queries, status:', response.status)
      }
    } catch (error) {
      console.error('Error fetching queries:', error)
      alert('Failed to load queries. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Query submitted successfully!')
        setFormData({
          full_name: formData.full_name,
          student_id: uniqueId,
          title: '',
          issue: ''
        })
        fetchQueries()
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to submit query')
      }
    } catch (error) {
      console.error('Error submitting query:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatus = (status) => {
    if (!status || status.trim() === '' || status === 'pending') {
      return language === 'hi' ? 'लंबित' : 'Pending'
    }
    if (status.toLowerCase() === 'resolved') {
      return language === 'hi' ? 'हल' : 'Resolved'
    }
    if (status.toLowerCase() === 'completed') {
      return language === 'hi' ? 'पूरा' : 'Completed'
    }
    if (status.toLowerCase() === 'rejected') {
      return language === 'hi' ? 'अस्वीकृत' : 'Rejected'
    }
    if (status.toLowerCase() === 'cancelled') {
      return language === 'hi' ? 'रद्द' : 'Cancelled'
    }
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

  const getStatusBadgeClass = (status) => {
    if (!status || status.trim() === '' || status === 'pending') {
      return 'bg-warning'
    }
    if (status.toLowerCase() === 'resolved' || status.toLowerCase() === 'completed') {
      return 'bg-success'
    }
    if (status.toLowerCase() === 'rejected' || status.toLowerCase() === 'cancelled') {
      return 'bg-danger'
    }
    return 'bg-info'
  }

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

        <Container fluid className="dashboard-box mt-3">
          <div className="mb-4 ">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/UserDashboard')} 
              className="d-flex align-items-center"
            >
              <FaArrowLeft className="me-2" />
              {language === 'hi' ? "डैशबोर्ड पर वापस जाएं" : "Back to Dashboard"}
            </Button>
          </div>

          <Row>
            <Col lg={12}>
              {/* Query Form Card */}
              <div className="mb-4" style={{ borderRadius: '10px', border: '1px solid #dee2e6', backgroundColor: '#fff' }}>
                <div className="bg-white border-bottom-0 pt-3 px-3">
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaPaperPlane className="me-2 text-primary" />
                    {language === 'hi' ? "प्रश्न पूछें" : "Raise a Query"}
                  </h5>
                </div>
                <div className="p-3">
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>{language === 'hi' ? "पूरा नाम" : "Full Name"}</Form.Label>
                          <Form.Control
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            placeholder={language === 'hi' ? "अपना पूरा नाम दर्ज करें" : "Enter your full name"}
                            disabled
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>{language === 'hi' ? "शीर्षक" : "Title"}</Form.Label>
                          <Form.Control
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder={language === 'hi' ? "शीर्षक दर्ज करें" : "Enter query title"}
                            required
                          />
                        </Form.Group>
                      </Col>
                       <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>{language === 'hi' ? "समस्या का विवरण" : "Issue Description"}</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            name="issue"
                            value={formData.issue}
                            onChange={handleInputChange}
                            placeholder={language === 'hi' ? "अपनी समस्या या प्रश्न का विस्तार से वर्णन करें..." : "Describe your issue or query in detail..."}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <div className='dashbord-btn'>
                      <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={submitting}
                        className="d-flex align-items-center"
                        style={{ background: 'linear-gradient(135deg, rgb(94 117 223), rgb(75 101 218))', border: 'none' }}
                      >
                        <FaPaperPlane className="me-2" />
                        {submitting ? (language === 'hi' ? 'सबमिट हो रहा है...' : 'Submitting...') : (language === 'hi' ? 'प्रश्न सबमिट करें' : 'Submit Query')}
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>

              {/* Queries Table Card */}
              <Card className="shadow-sm border-0" style={{ borderRadius: '10px' }}>
                <Card.Header className="bg-white border-bottom-0 pt-3">
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaHistory className="me-2 text-primary" />
                    {language === 'hi' ? "मेरे प्रश्न" : "My Queries"}
                  </h5>
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <div className="text-center py-4">
                      <p className="text-muted">{language === 'hi' ? "प्रश्न लोड हो रहे हैं..." : "Loading queries..."}</p>
                    </div>
                  ) : queries.length === 0 ? (
                    <Alert variant="info" className="d-flex align-items-center">
                      <FaClock className="me-2" />
                      {language === 'hi' ? "कोई प्रश्न नहीं मिला।" : "No queries found."}
                    </Alert>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="d-none d-md-block table-responsive">
                        <Table hover className="mb-0">
                          <thead className="text-white table-thead" >
                            <tr>
                              <th className="py-3 px-2">{language === 'hi' ? "आईडी" : "ID"}</th>
                              <th className="py-3 px-2">{language === 'hi' ? "शीर्षक" : "Title"}</th>
                              <th className="py-3 px-2">{language === 'hi' ? "समस्या" : "Issue"}</th>
                              <th className="py-3 px-2">{language === 'hi' ? "स्थिति" : "Status"}</th>
                              <th className="py-3 px-2">{language === 'hi' ? "रिमार्क" : "Remark"}</th>
                              <th className="py-3 px-2">{language === 'hi' ? "दिनांक" : "Date"}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {queries.map((query) => (
                              <tr key={query.id}>
                                <td className="py-3 px-2">{query.query_id || query.id}</td>
                                <td className="py-3 px-2">{query.title}</td>
                                <td className="py-3 px-2" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {query.issue}
                                </td>
                                <td className="py-3 px-2">
                                  <span className={`badge ${getStatusBadgeClass(query.status)}`}>
                                    {getStatus(query.status)}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-muted">{query.extra_remark || '-'}</td>
                                <td className="py-3 px-2">{query.created_at ? new Date(query.created_at).toLocaleDateString() : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="d-md-none">
                        {queries.map((query) => (
                          <Card key={query.id} className="mb-3 mx-1">
                            <Card.Body className="p-3">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="mb-1 fw-semibold">{query.title}</h6>
                                  <small className="text-muted">{language === 'hi' ? "आईडी" : "ID"}: {query.query_id || query.id}</small>
                                </div>
                                <span className={`badge ${getStatusBadgeClass(query.status)}`}>
                                  {getStatus(query.status)}
                                </span>
                              </div>
                              <div className="mb-2">
                                <small className="text-muted d-block">{language === 'hi' ? "समस्या:" : "Issue:"}</small>
                                <p className="small mb-0 mt-1">{query.issue}</p>
                              </div>
                              {query.extra_remark && (
                                <div className="mb-2">
                                  <small className="text-muted d-block">{language === 'hi' ? "रिमार्क:" : "Remark:"}</small>
                                  <p className="small mb-0 mt-1">{query.extra_remark}</p>
                                </div>
                              )}
                              <div className="mb-2">
                                <small className="text-muted d-block">{language === 'hi' ? "दिनांक:" : "Date:"}</small>
                                <span className="small">{query.created_at ? new Date(query.created_at).toLocaleDateString() : '-'}</span>
                              </div>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  )
}

export default SendQuery