import React, { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Card, Button, Spinner, Modal, Form, Badge, Alert, Table } from 'react-bootstrap'
import axios from 'axios'
import { useAuth } from '../all_login/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaCalendar, FaUsers, FaClock, FaBook, FaCheck, FaTimes, FaTrophy, FaBuilding, FaMedal } from 'react-icons/fa'
import SchoolLeftNav from './SchoolLeftNav'
import SchoolHeader from './SchoolHeader'

const API_URL = 'https://brjobsedu.com/epathshala/epathshala_backend/api/quiz-competition-items/'
const API_URL_RANK = 'https://brjobsedu.com/epathshala/epathshala_backend/api/quiz/rank/'
const API_URL_SCHOOL_RANK = 'https://brjobsedu.com/epathshala/epathshala_backend/api/quiz/school-rank/'
const API_URL_REGISTRATION = 'https://brjobsedu.com/epathshala/epathshala_backend/api/quiz-competition-participants/'
const API_URL_STUDENTS = 'https://brjobsedu.com/epathshala/epathshala_backend/api/student-schoolwise/'

// Helper to normalize class names for comparison (e.g., "9th" -> 9, 9 -> 9)
const normalizeClass = (cls) => {
  if (typeof cls === 'number') return cls
  const match = String(cls).match(/\d+/)
  return match ? parseInt(match[0], 10) : NaN
}

const SchoolQuizList = () => {
  const { accessToken, uniqueId: school_uni_id } = useAuth()
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
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [registerLoading, setRegisterLoading] = useState(false)
   const [students, setStudents] = useState({})
   const [studentsLoading, setStudentsLoading] = useState(false)
   const [allStudentsFlat, setAllStudentsFlat] = useState([])
   const [selectedStudents, setSelectedStudents] = useState([])
   const [registeredStudents, setRegisteredStudents] = useState({})
   const [selectedClassFilter, setSelectedClassFilter] = useState('all')
   const [showRegistered, setShowRegistered] = useState(true)
   const [maxParticipants, setMaxParticipants] = useState(null)
   const [showResultsModal, setShowResultsModal] = useState(false)
   const [resultsLoading, setResultsLoading] = useState(false)
   const [quizResults, setQuizResults] = useState(null)
   const [resultsSchoolFilter, setResultsSchoolFilter] = useState('all')
   const [schoolRanks, setSchoolRanks] = useState(null)

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

  const schoolStats = useMemo(() => {
    if (!quizResults || !Array.isArray(quizResults)) return []
    const stats = {}
    quizResults.forEach(item => {
      const schoolName = item.school?.school_name || 'Unknown Institution'
      stats[schoolName] = (stats[schoolName] || 0) + 1
    })
    return Object.entries(stats).map(([name, count]) => ({ name, count }))
  }, [quizResults])

  const uniqueSchoolsCount = useMemo(() => {
    if (!quizResults || !Array.isArray(quizResults)) return 0
    return new Set(quizResults.map(r => r.school?.school_uni_id)).size
  }, [quizResults])

  useEffect(() => {
    if (accessToken) {
      fetchQuizzes()
    }
  }, [accessToken])

  const fetchQuizzes = async () => {
    if (!accessToken) {
      console.log('No access token, waiting...')
      return
    }
    
    try {
      setLoading(true)
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.data && response.data.data) {
        setQuizzes(response.data.data)
      } else if (Array.isArray(response.data)) {
        setQuizzes(response.data)
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      setQuizzes([])
    } finally {
      setLoading(false)
    }
  }

   const fetchSchoolStudents = async () => {
     if (!accessToken || !school_uni_id) return
     
     try {
       setStudentsLoading(true)
       const response = await axios.get(
         `${API_URL_STUDENTS}?school_uni_id=${school_uni_id}`,
         {
           headers: {
             'Authorization': `Bearer ${accessToken}`
           }
         }
       )

       if (response.data.success && response.data.data) {
         const data = response.data.data
         setStudents(data)
         
         // Create a flat array of all students with class info
         const flatStudents = []
         Object.keys(data).forEach(className => {
           if (Array.isArray(data[className])) {
             data[className].forEach(student => {
               flatStudents.push({
                 ...student,
                 class_name: className
               })
             })
           }
         })
         setAllStudentsFlat(flatStudents)
       } else {
         setStudents({})
         setAllStudentsFlat([])
       }
     } catch (error) {
       console.error('Error fetching students:', error)
       setStudents({})
       setAllStudentsFlat([])
     } finally {
       setStudentsLoading(false)
     }
   }

    const checkRegisteredStudents = async (quizId) => {
      if (!accessToken) return []
      
      try {
        const response = await axios.get(
          `${API_URL_REGISTRATION}?quiz_id=${quizId}&school_uni_id=${school_uni_id}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        )

        if (response.data.success && response.data.data) {
          const data = response.data.data
          const registered = Array.isArray(data)
            ? data.map(d => d.student?.student_id || d.student_id)
            : [data.student?.student_id || data.student_id]
          return registered.filter(Boolean)
        }
      } catch (error) {
        console.error('Error checking registrations:', error)
      }
      return []
    }

    const fetchQuizResults = async (quizId) => {
      setResultsLoading(true)
      setError('')
      try {
        const [studentRes, schoolRes] = await Promise.all([
          axios.get(`${API_URL_RANK}?quiz_id=${quizId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }),
          axios.get(`${API_URL_SCHOOL_RANK}?quiz_id=${quizId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          })
        ])

        if (studentRes.data.success) {
          setQuizResults(studentRes.data.data)
        }
        if (schoolRes.data.success) {
          setSchoolRanks(schoolRes.data.data)
          setResultsSchoolFilter('all')
          setShowResultsModal(true)
        }
      } catch (error) {
        console.error('Error fetching quiz results:', error)
        setError('Failed to fetch quiz results. Please try again.')
      } finally {
        setResultsLoading(false)
      }
    }

const handleRegisterClick = async (quiz) => {
      setSelectedQuiz(quiz)
      setSelectedStudents([])
      setError('')
      setSuccess('')
      setSelectedClassFilter('all')
      setMaxParticipants(quiz.total_participants || null)
      await fetchSchoolStudents()
      
      const registered = await checkRegisteredStudents(quiz.quiz_id || quiz.id)
      setRegisteredStudents(prev => ({ ...prev, [quiz.quiz_id || quiz.id]: registered }))
      
      setShowRegisterModal(true)
    }

const toggleStudentSelection = (studentId) => {
      setError('')
      
      if (selectedStudents.includes(studentId)) {
        setSelectedStudents(prev => prev.filter(id => id !== studentId))
      } else {
        if (maxParticipants && selectedStudents.length >= maxParticipants) {
          setError(`You can only select up to ${maxParticipants} participants for this quiz.`)
          return
        }
        setSelectedStudents(prev => [...prev, studentId])
      }
    }

    const registerStudents = async () => {
      if (!selectedQuiz || selectedStudents.length === 0) {
        setError('Please select at least one student')
        return
      }

      setRegisterLoading(true)
      setError('')
      setSuccess('')

      try {
        const payload = {
          student_id: selectedStudents,
          quiz_id: selectedQuiz.quiz_id || selectedQuiz.id,
          school_uni_id: school_uni_id
        }

        await axios.post(API_URL_REGISTRATION, payload, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        setSuccess(`${selectedStudents.length} student(s) registered for ${selectedQuiz.title}`)
        setShowRegisterModal(false)
        fetchQuizzes()
      } catch (error) {
        console.error('Error registering students:', error)
        setError(error.response?.data?.message || 'Failed to register students')
      } finally {
        setRegisterLoading(false)
      }
    }

    const removeStudents = async () => {
      if (!selectedQuiz || selectedStudents.length === 0) {
        setError('Please select at least one student to remove')
        return
      }

      setRegisterLoading(true)
      setError('')
      setSuccess('')

      try {
        await axios.delete(API_URL_REGISTRATION, {
          data: {
            student_id: selectedStudents,
            quiz_id: selectedQuiz.quiz_id || selectedQuiz.id
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        setSuccess(`${selectedStudents.length} student(s) removed from ${selectedQuiz.title}`)
        setShowRegisterModal(false)
        fetchQuizzes()
      } catch (error) {
        console.error('Error removing students:', error)
        setError(error.response?.data?.message || 'Failed to remove students')
      } finally {
        setRegisterLoading(false)
      }
    }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isQuizActive = (quiz) => {
    if (!quiz.is_active) return false
    const now = new Date()
    if (quiz.end_date_time && new Date(quiz.end_date_time) < now) return false
    return true
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <SchoolLeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />
        <div className="main-content-dash">
          <SchoolHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="dashboard-content">
            <Container  className="dashboard-box">
              <div className="loading-spinner">
                <Spinner animation="border" variant="primary" />
              </div>
            </Container>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="dashboard-container">
        <SchoolLeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />
        <div className="main-content-dash">
          <SchoolHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="dashboard-content">
            <Container fluid className="dashboard-box">
<div className="d-flex justify-content-between align-items-center mb-2 page-header">
                 <div className="d-flex align-items-center all-en-box gap-3">
                   <Button variant="outline-secondary" size="sm" onClick={() => navigate('/SchoolDashBoard')} className="me-2">
                     <FaArrowLeft /> <span className="small">Dashboard</span>
                   </Button>
                   <h5 className="mb-0 small fw-bold">Quiz Competitions</h5>
                 </div>
                 <span className="text-muted small">
                   {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} available
                 </span>
               </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              )}

              {quizzes.length === 0 ? (
                <Card className="shadow-box">
                  <Card.Body className="text-center py-5">
                    <p className="text-muted mb-0">No quizzes available at the moment.</p>
                    <small className="text-muted">Check back later for new competitions.</small>
                  </Card.Body>
                </Card>
              ) : (
                <Row>
                  {quizzes.map((quiz) => (
                    <Col key={quiz.id} md={6} lg={3} className="mb-3 px-2">
                      <Card className="shadow-sm h-100 quiz-card" style={{ fontSize: '0.75rem' }}>
                        <Card.Header className="bg-white d-flex justify-content-between align-items-center py-1 px-2 border-bottom-0">
                          <Badge pill bg={isQuizActive(quiz) ? 'success' : 'secondary'} style={{ fontSize: '0.6rem' }}>
                            {isQuizActive(quiz) ? 'Active' : 'Inactive'}
                          </Badge>
                          <small className="text-muted fw-bold" style={{ fontSize: '0.6rem' }}>{quiz.questions?.length || 0} Questions</small>
                        </Card.Header>
                        <Card.Body className="p-2 pt-0">
                          <Card.Title className="fw-bold mb-1 text-primary text-truncate" style={{ fontSize: '0.8rem' }} title={quiz.title}>
                            {quiz.title}
                          </Card.Title>
                          {quiz.title_hindi && (
                            <Card.Subtitle className=" text-muted " style={{ fontSize: '0.7rem' }}>{quiz.title_hindi}</Card.Subtitle>
                          )}
                          
                          {quiz.description && (
                            <Card.Text className="text-muted mb-2" style={{ fontSize: '0.68rem', lineHeight: '1.2' }}>
                              {quiz.description.length > 50 
                                ? quiz.description.substring(0, 50) + '...' 
                                : quiz.description}
                            </Card.Text>
                          )}

                          <div className="mb-2 p-1 bg-light rounded" style={{ fontSize: '0.62rem' }}>
                            <div className="d-flex align-items-center mb-1">
                              <FaClock className="me-1 text-secondary" size={9} />
                              <span className="fw-bold me-1">Start:</span> {formatDate(quiz.start_date_time)}
                            </div>
                            <div className="d-flex align-items-center">
                              <FaClock className="me-1 text-secondary" size={9} />
                              <span className="fw-bold me-1">End:</span> {formatDate(quiz.end_date_time)}
                            </div>
                          </div>

                          <div style={{ fontSize: '0.68rem' }}>
                            <div className="d-flex align-items-center mb-1">
                              <FaBook className="me-1 text-info" size={10} />
                              <span className="text-muted me-1">Category:</span>
                              <span className="fw-semibold text-truncate">{quiz.quiz_category}</span>
                              {quiz.total_participants && (
                                <span className="ms-auto text-muted" style={{ fontSize: '0.6rem' }}>Max: {quiz.total_participants}</span>
                              )}
                            </div>
                            <div className="d-flex align-items-center">
                              <FaUsers className="me-1 text-primary" size={10} />
                              <span className="text-muted me-1">Classes:</span>
                              <span className="fw-bold text-dark">{quiz.class_allowed?.join(', ')}</span>
                            </div>
                          </div>
                        </Card.Body>
                        <Card.Footer className="bg-white py-2 px-2 border-top-0">
                          <div className="d-flex gap-1">
                            <Button 
                              variant="primary" 
                              className="flex-fill py-1 px-1 border-0"
                              style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}
                              onClick={() => handleRegisterClick(quiz)}
                              disabled={!isQuizActive(quiz)}
                            >
                              Register
                            </Button>
                            <Button 
                              variant="outline-info" 
                              className="flex-fill py-1 px-1"
                              style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}
                              onClick={() => fetchQuizResults(quiz.quiz_id || quiz.id)}
                              disabled={resultsLoading}
                            >
                              {resultsLoading ? <Spinner animation="border" size="sm" /> : 'Results'}
                            </Button>
                          </div>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Container>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <Modal show={showRegisterModal} onHide={() => setShowRegisterModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6 small">
            Register Students for Quiz
          </Modal.Title>
        </Modal.Header>
         <Modal.Body className="">
           {selectedQuiz && (
             <>
<Alert variant="info" className="mb-3 small">
                           <strong>Quiz:</strong> {selectedQuiz.title}<br />
                           <strong>Category:</strong> {selectedQuiz.quiz_category}<br />
                           <strong>Eligible Classes:</strong> {selectedQuiz.class_allowed?.join(', ')}
                           {maxParticipants && (
                             <><br />
                             <strong>Max Participants:</strong> {maxParticipants}</>
                           )}
                         </Alert>

               {error && (
                 <Alert variant="danger" dismissible onClose={() => setError('')}>
                   {error}
                 </Alert>
               )}

               {studentsLoading ? (
                 <div className="text-center py-4">
                   <Spinner animation="border" variant="primary" />
                   <p className="mt-2">Loading students...</p>
                 </div>
                ) : allStudentsFlat.length === 0 ? (
                  <Alert variant="warning">
                    No students registered in your Institution yet.
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => navigate('/SchoolStudentRegistration')}
                      className="p-0 ms-2"
                    >
                      Register students here
                    </Button>
                  </Alert>
                ) : (
                  <>
                    <div className="mb-3">
                        <Form.Select 
                          value={selectedClassFilter}
                          onChange={(e) => {
                            setSelectedClassFilter(e.target.value)
                            setSelectedStudents([])
                            setError('')
                          }}
                          style={{ width: '200px', fontSize: '0.85rem' }}
                          size="sm"
                        >
                          <option value="all">All Classes</option>
                          {selectedQuiz.class_allowed?.map(cls => {
                            const classNum = normalizeClass(cls)
                            return (
                              <option key={cls} value={classNum}>Class {cls}</option>
                            )
                          })}
                        </Form.Select>
                      <small className="text-muted ms-2 small">
                        Showing eligible students only
                      </small>
                    </div>

<div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <span className="small text-muted">
                          {selectedClassFilter === 'all' 
                            ? `All students (${selectedStudents.length} selected)`
                            : `Class ${selectedClassFilter} students (${selectedStudents.length} selected)`
                          }
                          {maxParticipants && (
                            <span className="ms-2 text-danger">
                              (Max: {maxParticipants})
                            </span>
                          )}
                        </span>
                       <Form.Check 
                         type="checkbox"
                         id="show-registered"
                         label="Show registered"
                         checked={selectedClassFilter !== 'all' || showRegistered}
                         onChange={(e) => {
                           if (e.target.checked) {
                             setShowRegistered(true)
                           } else {
                             setShowRegistered(false)
                             // Optionally also uncheck the filter or handle differently
                           }
                         }}
                       />
                     </div>
                     <div className="d-flex gap-2">
<Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => {
                            const registeredList = registeredStudents[selectedQuiz?.quiz_id || selectedQuiz?.id] || []
                            const filterNum = selectedClassFilter === 'all' ? null : parseInt(selectedClassFilter, 10)
                            
                            const eligibleStudents = allStudentsFlat.filter(s => {
                              const studentClassNum = normalizeClass(s.class_name)
                              const isEligible = selectedQuiz.class_allowed?.some(allowed => 
                                normalizeClass(allowed) === studentClassNum
                              )
                              const matchesFilter = filterNum === null || studentClassNum === filterNum
                              return isEligible && matchesFilter
                            })
                            
                            if (maxParticipants) {
                              const availableSlots = maxParticipants - selectedStudents.length
                              const toSelect = eligibleStudents.slice(0, availableSlots).map(s => s.student_id)
                              setSelectedStudents(prev => [...prev, ...toSelect])
                            } else {
                              setSelectedStudents(eligibleStudents.map(s => s.student_id))
                            }
                          }}
                        >
                          Select All Eligible
                        </Button>
<Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => {
                            setSelectedStudents([])
                            setError('')
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

<div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                       <table className="table table-bordered table-hover table-sm">
                         <thead className="table-school">
                           <tr>
                             <th style={{ width: '40px', fontSize: '0.75rem' }}>Select</th>
                             <th style={{ fontSize: '0.75rem' }}>Student ID</th>
                             <th style={{ fontSize: '0.75rem' }}>Full Name</th>
                             <th style={{ fontSize: '0.75rem' }}>Class</th>
                             <th style={{ fontSize: '0.75rem' }}>Status</th>
                           </tr>
                         </thead>
                         <tbody>
                           {allStudentsFlat
                             .filter(student => {
                               const studentClassNum = normalizeClass(student.class_name)
                               // Only show students from eligible classes
                               const isEligible = selectedQuiz.class_allowed?.some(allowed => 
                                 normalizeClass(allowed) === studentClassNum
                               )
                               // Apply class filter
                               const filterNum = selectedClassFilter === 'all' ? null : parseInt(selectedClassFilter, 10)
                               const classMatch = filterNum === null || studentClassNum === filterNum
                               return isEligible && classMatch
                             })
                             .map((student) => {
                               const registeredList = registeredStudents[selectedQuiz?.quiz_id || selectedQuiz?.id] || []
                               const isRegistered = registeredList.includes(student.student_id)
                               const isSelected = selectedStudents.includes(student.student_id)
                               return (
                                 <tr key={student.student_id} className={isSelected ? 'table-primary' : ''}>
                                   <td>
                                     <Form.Check
                                       type="checkbox"
                                       checked={isSelected}
                                       onChange={() => toggleStudentSelection(student.student_id)}
                                     />
                                   </td>
                                   <td style={{ fontSize: '0.8rem' }}>{student.student_id}</td>
                                   <td style={{ fontSize: '0.8rem' }}>{student.full_name}</td>
                                   <td>
                                     <Badge bg="secondary" className="small">{student.class_name}</Badge>
                                   </td>
                                   <td>
                                     {isRegistered ? (
                                       <Badge bg="success" className="small">
                                         <FaCheck className="me-1" /> Registered
                                       </Badge>
                                     ) : (
                                       <Badge bg="secondary" className="small">Not Registered</Badge>
                                     )}
                                   </td>
                                 </tr>
                               )
                             })}
                         </tbody>
                       </table>
                     </div>
                  </>
               )}
             </>
           )}
         </Modal.Body>
         <Modal.Footer className="border-top py-2 px-3">
           <Button variant="secondary" onClick={() => setShowRegisterModal(false)}>
             Cancel
           </Button>
           
           {selectedStudents.length > 0 && (
             <>
               <Button 
                 variant="success" 
                 onClick={registerStudents} 
                 disabled={registerLoading}
                 className="me-2"
               >
                 {registerLoading ? (
                   <>
                     <Spinner animation="border" size="sm" className="me-2" />
                     Registering...
                   </>
                 ) : (
                   `Register ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`
                 )}
               </Button>
               
               {(() => {
                const registeredCount = selectedStudents.filter(id => 
                  (registeredStudents[selectedQuiz?.quiz_id || selectedQuiz?.id] || []).includes(id)
                ).length
                if (registeredCount > 0) {
                  return (
                    <Button 
                      variant="danger" 
                      onClick={removeStudents} 
                      disabled={registerLoading}
                    >
                      {registerLoading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Removing...
                        </>
                      ) : (
                        `Remove ${registeredCount} Registered`
                      )}
                    </Button>
                  )
                }
                return null
              })()}
             </>
           )}
         </Modal.Footer>
      </Modal>

      {/* Results Modal */}
      <Modal show={showResultsModal} onHide={() => setShowResultsModal(false)} size="xl" centered>
        <Modal.Header closeButton className="py-2 px-3">
          <Modal.Title className="fw-semibold fs-6 d-flex align-items-center">
            <FaTrophy className="text-warning me-2" /> Quiz Results & Standings
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          {quizResults && (
            <>
              <Row className="mb-4 g-3">
                <Col xs={6}>
                  <Card className="bg-light border-0 text-center py-2">
                    <Card.Body className="p-2">
                      <FaUsers className="mb-1 text-primary" size={20} />
                      <h5 className="mb-0 fw-bold">{quizResults.length}</h5>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>Participants</div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={6}>
                  <Card className="bg-light border-0 text-center py-2">
                    <Card.Body className="p-2">
                      <FaBuilding className="mb-1 text-success" size={20} />
                      <h5 className="mb-0 fw-bold">{uniqueSchoolsCount}</h5>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>Institutions</div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0 small d-flex align-items-center">
                  <FaMedal className="text-warning me-2" /> 
                  {resultsSchoolFilter === 'all' ? 'Top 10 Global Rankers' : `Top Rankers - ${resultsSchoolFilter}`}
                </h6>
                <Form.Group className="d-flex align-items-center">
                  <Form.Label className="mb-0 me-2 small fw-bold text-muted">Institution Filter:</Form.Label>
                  <Form.Select 
                    size="sm" 
                    style={{ width: '250px', fontSize: '0.75rem' }}
                    value={resultsSchoolFilter} 
                    onChange={(e) => setResultsSchoolFilter(e.target.value)}
                  >
                    <option value="all">All Institutions (Overall Standings)</option>
                    {schoolStats.map((school, idx) => (
                      <option key={idx} value={school.name}>{school.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="table-responsive mb-4">
                <Table bordered hover size="sm" className="small align-middle mb-0">
                  <thead className="table-school">
                    <tr style={{ fontSize: '0.75rem' }}>
                      <th style={{ width: '60px' }}>Rank</th>
                      <th>Student Info</th>
                      <th>Institution</th>
                      <th className="text-center">Score</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizResults
                      .filter(ranker => resultsSchoolFilter === 'all' || ranker.school?.school_name === resultsSchoolFilter)
                      .slice(0, 10)
                      .map((ranker, idx) => (
                        <tr key={idx} className={resultsSchoolFilter === 'all' && idx < 3 ? 'table-warning' : ''}>
                          <td className="fw-bold text-center">#{ranker.rank}</td>
                          <td>
                            <div className="fw-bold">{ranker.student?.full_name}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>{ranker.student?.student_id}</div>
                          </td>
                          <td className="text-truncate" style={{ maxWidth: '150px', fontSize: '0.75rem' }}>
                            {ranker.school?.school_name}
                          </td>
                          <td className="text-center fw-bold">{ranker.score}</td>
                          <td className="text-center">
                            <Badge bg={ranker.status === 'passed' ? 'success' : 'danger'} style={{ fontSize: '0.65rem' }}>
                              {ranker.status?.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </div>

              <h6 className="fw-bold mb-2 small d-flex align-items-center">
                <FaBuilding className="text-info me-2" /> Institution Performance & Rankings
              </h6>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <Table bordered hover size="sm" className="small mb-0">
                  <thead className="table-school">
                    <tr style={{ fontSize: '0.75rem' }}>
                      <th className="text-center" style={{ width: '60px' }}>Rank</th>
                      <th>Institution Name</th>
                      <th className="text-center" style={{ width: '100px' }}>Students</th>
                      <th className="text-center" style={{ width: '100px' }}>Avg. Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schoolRanks?.map((item, idx) => (
                      <tr key={idx} className={item.school?.school_uni_id === school_uni_id ? 'table-danger' : ''}>
                        <td className="text-center fw-bold">#{item.rank}</td>
                        <td style={{ fontSize: '0.75rem' }}>{item.school?.school_name}</td>
                        <td className="text-center fw-bold">{item.total_students}</td>
                        <td className="text-center fw-bold text-primary">{item.avg_score?.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="py-2 px-3">
          <Button variant="secondary" onClick={() => setShowResultsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default SchoolQuizList