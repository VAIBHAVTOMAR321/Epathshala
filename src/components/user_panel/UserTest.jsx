import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Modal, Spinner, Alert } from 'react-bootstrap'
import { useAuth } from "../all_login/AuthContext";
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import UserHeader from "./UserHeader";
import UserLeftNav from "./UserLeftNav";
import { FaCheckCircle, FaClock, FaTimesCircle, FaCertificate, FaArrowLeft } from 'react-icons/fa'
import "./UserProfile.css";

const UserTest = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testCompleted, setTestCompleted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(30);
  const [userAnswers, setUserAnswers] = useState([]);
  const [testLoading, setTestLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(0);

  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [navigationWarningShown, setNavigationWarningShown] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  const location = useLocation()
  const navigate = useNavigate()
  const { uniqueId, accessToken, isAuthenticated } = useAuth()
  
  const { course, moduleIndex, isLastModule, attemptCount } = location.state || {}

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
    }
  }, [isAuthenticated, navigate, location])

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchTestQuestions = async () => {
      if (!uniqueId || !accessToken) {
        setLoading(false)
        setTestLoading(false)
        return
      }

      try {
        setTestLoading(true)
        let moduleId = null
        if (location.state && location.state.moduleId) {
          moduleId = location.state.moduleId
        } else if (course && course.modules && course.modules[moduleIndex]) {
          moduleId = course.modules[moduleIndex].module_id
        }

        if (!moduleId) {
          setLoading(false)
          setTestLoading(false)
          return
        }

        console.log('📝 Fetching test for module:', moduleId)
        const response = await axios.post(
          'https://brjobsedu.com/gyandhara/gyandhara_backend/api/module-test/start/',
          {
            module_id: moduleId,
            student_id: uniqueId
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )

        console.log('📝 Test API response:', response.data)

        if (response.data.success) {
          setQuestions(response.data.questions || [])
          setUserAnswers(new Array(response.data.questions?.length || 0).fill(null))
          setTimer((response.data.questions?.length || 0) * 30)
          if (response.data.attempt_count !== undefined) {
            setTestResult(prev => ({ ...prev, attempt_count: response.data.attempt_count }))
          }
          if (response.data.attempts_left !== undefined) {
            setAttemptsLeft(response.data.attempts_left)
          } else if (response.data.attempt_count !== undefined) {
            setAttemptsLeft(3 - response.data.attempt_count)
          }
        }
      } catch (error) {
        console.error('❌ Error fetching test:', error)
      } finally {
        setTestLoading(false)
        setLoading(false)
      }
    }

    if (course && moduleIndex !== undefined && uniqueId && accessToken) {
      fetchTestQuestions()
    }
  }, [course, moduleIndex, location.state, uniqueId, accessToken])

  useEffect(() => {
    if (timer > 0 && !testCompleted) {
      const timerInterval = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timerInterval)
    } else if (timer === 0 && !testCompleted) {
      handleTestComplete()
    }
  }, [timer, testCompleted])

  const [navigationAttempts, setNavigationAttempts] = useState(0)

  useEffect(() => {
    const handleLinkClick = (e) => {
      if (testCompleted) return
      const href = e.target.closest('a')?.href
      if (href && !href.includes(window.location.pathname)) {
        e.preventDefault()
        if (navigationAttempts === 0) {
          alert('Are you sure you want to leave? Your test will be submitted automatically if you leave again.')
          setNavigationAttempts(1)
        } else {
          handleTestComplete()
        }
      }
    }
    
    document.addEventListener('click', handleLinkClick, true)
    return () => document.removeEventListener('click', handleLinkClick, true)
  }, [testCompleted, navigationAttempts])

  useEffect(() => {
    if (testCompleted) return

    const handlePopState = (e) => {
      if (!testCompleted) {
        if (navigationAttempts === 0) {
          alert('Are you sure you want to leave? Your test will be submitted automatically if you leave again.')
          setNavigationAttempts(1)
          window.history.pushState(null, '', window.location.href)
        } else {
          handleTestComplete()
        }
      }
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [testCompleted, navigationAttempts])

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!testCompleted) {
        if (navigationAttempts === 0) {
          e.preventDefault()
          e.returnValue = ''
          setNavigationAttempts(1)
          alert('Are you sure you want to leave? Your test will be submitted automatically if you leave again.')
          return ''
        } else {
          handleTestComplete()
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [testCompleted, navigationAttempts])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !testCompleted) {
        if (navigationAttempts === 0) {
          alert('Are you sure you want to leave? Your test will be submitted automatically if you leave again.')
          setNavigationAttempts(1)
        } else {
          handleTestComplete()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [testCompleted, navigationAttempts])

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setUserAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleTestComplete = async () => {
    try {
      const submissionData = {
        module_id: location.state.moduleId,
        student_id: uniqueId,
        answers: questions.map((question, index) => ({
          question_id: question.id,
          selected: userAnswers[index]
        }))
      }

      console.log('📝 Submitting test:', submissionData)
      const endpoint = 'https://brjobsedu.com/gyandhara/gyandhara_backend/api/submit-test-unpaid/'
        
      const response = await axios.post(
        endpoint,
        submissionData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('📝 Submit response:', response.data)
      if (response.data.success) {
        setTestCompleted(true)
        setTestResult(response.data)
        
        if (response.data.attempts_left !== undefined) {
          setAttemptsLeft(response.data.attempts_left)
        } else if (response.data.attempt_count !== undefined) {
          setAttemptsLeft(3 - response.data.attempt_count)
        }
        
        if (response.data.test_status === 'passed' && isLastModule) {
          setShowCelebrationModal(true)
        }
      } else {
        alert(response.data.message || 'Failed to submit test')
      }
    } catch (error) {
      console.error('❌ Submit error:', error.response?.data || error.message)
      alert('Failed to submit test. Please try again.')
    }
  }

  const generateCertificate = async () => {
    try {
      const endpoint = 'https://brjobsedu.com/gyandhara/gyandhara_backend/api/enrollment-unpaid/'
        
      const response = await axios.post(
        endpoint,
        {
          student_id: uniqueId,
          course_id: course.course_id
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        alert('Certificate generated successfully!')
        
        if (response.data.data && response.data.data.certificate_file) {
          window.open(`https://brjobsedu.com/gyandhara/gyandhara_backend${response.data.data.certificate_file}`, '_blank')
        } else {
          const coursesEndpoint = `https://brjobsedu.com/gyandhara/gyandhara_backend/api/enrollment-unpaid/?student_id=${uniqueId}`
            
          const coursesResponse = await axios.get(
            coursesEndpoint,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          )
          
          if (coursesResponse.data.success) {
            const updatedCourse = coursesResponse.data.data.find(
              c => c.course_id === course.course_id
            )
            
            if (updatedCourse && updatedCourse.certificate_file) {
              window.open(`https://brjobsedu.com/gyandhara/gyandhara_backend${updatedCourse.certificate_file}`, '_blank')
            }
          }
        }
      } else {
        alert('Failed to generate certificate')
      }
    } catch (error) {
      alert('Failed to generate certificate. Please try again.')
    }
  }

  const handleGoBack = () => {
    if (testCompleted) {
      navigate('/UserDashboard')
      return
    }
    handleNavFromLeftNav('/UserDashboard')
  }

  const handleNavFromLeftNav = (path) => {
    if (!testCompleted) {
      if (navigationAttempts === 0) {
        alert('Are you sure you want to leave? Your test will be submitted automatically if you leave again.');
        setNavigationAttempts(1);
      } else {
        handleTestComplete();
      }
    } else {
      navigate(path);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dashboard-container">
      <UserLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
        onNavClick={handleNavFromLeftNav}
      />
      <div className="main-content-dash">
        <UserHeader toggleSidebar={toggleSidebar} />

        <Container className="dashboard-box mt-3">
          {loading || testLoading ? (
            <div className="profile-loading">
              <Spinner animation="border" variant="primary" />
              <p>Loading test questions...</p>
            </div>
          ) : !course || moduleIndex === undefined ? (
            <div className="text-center py-5">
              <p className="text-muted fs-4">No test data available</p>
              <Button variant="primary" onClick={handleGoBack}>
                Go Back
              </Button>
            </div>
          ) : testCompleted && testResult ? (
            <div className="text-center py-5">
              <div className={`success-animation mb-4 ${testResult.test_status === 'passed' ? 'text-success' : 'text-danger'}`}>
                {testResult.test_status === 'passed' ? (
                  <FaCheckCircle style={{ fontSize: '80px', color: '#28a745' }} />
                ) : (
                  <FaTimesCircle style={{ fontSize: '80px', color: '#dc3545' }} />
                )}
              </div>
              <h2 className="mb-2">
                {testResult.test_status === 'passed' ? 'Test Passed!' : 'Test Failed!'}
              </h2>
              <p className="text-muted mb-4">
                You scored {testResult.percentage}%
              </p>
              <div className="d-flex justify-content-center gap-4 mb-4">
                <div className="bg-light p-3 rounded">
                  <p className="mb-0 text-muted small">Attempts Left</p>
                  <p className="mb-0 fw-bold">{testResult?.attempts_left !== undefined ? testResult.attempts_left : (attemptsLeft > 0 ? attemptsLeft : '0')}</p>
                </div>
                {testResult.locked_until && (
                  <div className="bg-light p-3 rounded">
                    <p className="mb-0 text-muted small">Locked Until</p>
                    <p className="mb-0 fw-bold">{new Date(testResult.locked_until).toLocaleString()}</p>
                  </div>
                )}
              </div>
              <Button 
                variant="primary" 
                onClick={handleGoBack}
                className="d-flex align-items-center mx-auto"
              >
                <FaArrowLeft className="me-2" />
                Back to Course
              </Button>
            </div>
          ) : questions.length > 0 ? (
            <Row>
              <Col>
                <Card className="shadow-box mb-3">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-4">
                      <Button 
                        variant="outline-secondary" 
                        onClick={handleGoBack}
                        className="me-3"
                      >
                        <FaArrowLeft className="me-2" />
                        Back to Course
                      </Button>
                      <h4 className="mb-0">Module Test</h4>
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="mb-1">{course.course_name}</h6>
                      <p className="text-muted small">
                        Module {moduleIndex + 1} Test - Question {currentQuestionIndex + 1} of {questions.length}
                      </p>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="timer" style={{ 
                          fontSize: '2rem', 
                          fontWeight: 'bold', 
                          color: '#dc3545',
                        }}>
                          <FaClock className="me-2" />
                          {formatTime(timer)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="mb-2">
                        <span className="fw-bold">Q{currentQuestionIndex + 1}. </span>
                        <span>{questions[currentQuestionIndex].question_text}</span>
                      </div>
                      {questions[currentQuestionIndex].question_text_hindi && (
                        <div className="mb-3 text-muted small fst-italic">
                          प्र{currentQuestionIndex + 1}. {questions[currentQuestionIndex].question_text_hindi}
                        </div>
                      )}
                      <div className="space-y-3">
                        {questions[currentQuestionIndex].options.map((option, index) => (
                          <div key={index} className="form-check d-flex align-items-start mb-2">
                            <input 
                              type="radio" 
                              className="form-check-input mt-1" 
                              id={`q${currentQuestionIndex}a${index}`} 
                              name={`q${currentQuestionIndex}`}
                              checked={userAnswers[currentQuestionIndex] === index}
                              onChange={() => handleAnswerSelect(index)}
                            />
                            <label className="form-check-label ms-2" htmlFor={`q${currentQuestionIndex}a${index}`}>
                              <span className="fw-bold">{String.fromCharCode(65 + index)}.</span> {option}
                              {questions[currentQuestionIndex].options_hindi && questions[currentQuestionIndex].options_hindi[index] && (
                                <span className="text-muted small fst-italic ms-1">({questions[currentQuestionIndex].options_hindi[index]})</span>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-2">
                        <Button 
                          variant="secondary" 
                          onClick={handlePreviousQuestion}
                          disabled={currentQuestionIndex === 0}
                          className="me-2"
                        >
                          Previous
                        </Button>
                        {currentQuestionIndex < questions.length - 1 ? (
                          <Button 
                            variant="primary" 
                            onClick={handleNextQuestion}
                          >
                            Next
                          </Button>
                        ) : (
                          <Button 
                            variant="success" 
                            onClick={handleTestComplete}
                          >
                            Submit Test {attemptsLeft > 0 && `(Attempts left: ${attemptsLeft})`}
                          </Button>
                        )}
                      </div>
                      {testResult && (
                        <div className="text-muted small">
                          <span>Attempts Left: {attemptsLeft > 0 ? attemptsLeft : '0'}</span>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted fs-4">No questions available for this test</p>
              <Button variant="primary" onClick={handleGoBack}>
                Go Back
              </Button>
            </div>
          )}
        </Container>
      </div>

      <Modal
        show={showCelebrationModal}
        onHide={() => setShowCelebrationModal(false)}
        centered
        size="lg"
      >
        <Modal.Body className="text-center p-5">
          <div className="celebration-content">
            <div className="celebration-animation mb-4">
              <FaCheckCircle style={{ fontSize: '100px', color: '#28a745', animation: 'pulse 2s infinite' }} />
            </div>
            
            <h2 className="mb-4 text-success">Congratulations!</h2>
            <p className="text-muted mb-4 fs-5">
              You have successfully completed all modules and passed the final test!
            </p>
            
            <div className="mb-4">
              <Badge bg="success" className="p-2 fs-6">
                Course Completed
              </Badge>
            </div>
            
            <Button 
              variant="success" 
              onClick={generateCertificate}
              className="d-flex align-items-center mx-auto px-3 py-2 fs-6 mt-2"
              style={{ borderRadius: '50px' }}
            >
              <FaCertificate className="me-2" />
              Generate Certificate
            </Button>
            
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowCelebrationModal(false)}
              className="mt-3"
            >
              Close
            </Button>
          </div>
        </Modal.Body>
         </Modal>
      </div>
   )
}

export default UserTest