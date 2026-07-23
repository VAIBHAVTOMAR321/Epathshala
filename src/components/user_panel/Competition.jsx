import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, ProgressBar, Modal } from 'react-bootstrap'
import axios from 'axios'
import { useAuth } from '../all_login/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../all_login/LanguageContext'

import { FaArrowLeft, FaClock, FaQuestion, FaTrophy, FaCheckCircle, FaTimesCircle, FaChevronRight, FaLock, FaSchool, FaUsers } from 'react-icons/fa'
import '../../assets/css/userleftnav.css'
import UserLeftNav from './UserLeftNav'
import UserHeader from './UserHeader';
import "../../assets/css/Competition.css"

const Competition = () => {
  const { uniqueId, accessToken } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

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
  
  const [quizzes, setQuizzes] = useState([])
  const [registeredQuizIds, setRegisteredQuizIds] = useState(new Set())
  const [attemptedQuizIds, setAttemptedQuizIds] = useState(new Set())
  const [quizRanks, setQuizRanks] = useState({})
  const [schoolRanks, setSchoolRanks] = useState({})
  const [showSchoolRankModal, setShowSchoolRankModal] = useState(false)
  const [showStudentRankModal, setShowStudentRankModal] = useState(false)
  const [studentRankData, setStudentRankData] = useState([])
  const [schoolRankData, setSchoolRankData] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  
  const [takingQuiz, setTakingQuiz] = useState(false)
  const [quizStarting, setQuizStarting] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [attemptId, setAttemptId] = useState(null)
  
  const [showResults, setShowResults] = useState(false)
  const [quizResults, setQuizResults] = useState(null)

  const [showNavigationWarning, setShowNavigationWarning] = useState(false)
  const [navigationWarningShown, setNavigationWarningShown] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState(null)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const contentArea = document.querySelector('.flex-grow-1')
    if (contentArea) {
      if (isMobile) {
        contentArea.style.marginLeft = '0px'
      } else {
        contentArea.style.marginLeft = '220px'
      }
    }
  }, [isMobile])

  const handleNavFromLeftNav = (path) => {
    if (!takingQuiz) {
      navigate(path)
      return
    }

    if (navigationWarningShown) {
      confirmSubmitQuiz()
      setTimeout(() => navigate(path), 500)
      return
    }

    setNavigationWarningShown(true)
    setShowNavigationWarning(true)
    setPendingNavigation(() => () => navigate(path))
  }

  useEffect(() => {
    if (!takingQuiz) return

    const handleBeforeUnload = (e) => {
      if (navigationWarningShown) {
        confirmSubmitQuiz()
        e.preventDefault()
        e.returnValue = ''
        return
      } else {
        setNavigationWarningShown(true)
        setShowNavigationWarning(true)
        e.preventDefault()
        e.returnValue = ''
        return
      }
    }

    const handlePopState = (e) => {
      if (navigationWarningShown) {
        confirmSubmitQuiz()
      } else {
        setNavigationWarningShown(true)
        setShowNavigationWarning(true)
        window.history.pushState(null, null, window.location.href)
      }
    }

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault()
        if (navigationWarningShown) {
          confirmSubmitQuiz()
        } else {
          setNavigationWarningShown(true)
          setShowNavigationWarning(true)
        }
        return
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        if (navigationWarningShown) {
          confirmSubmitQuiz()
        } else {
          setNavigationWarningShown(true)
          setShowNavigationWarning(true)
        }
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault()
        if (navigationWarningShown) {
          confirmSubmitQuiz()
        } else {
          setNavigationWarningShown(true)
          setShowNavigationWarning(true)
        }
        return
      }

      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault()
        if (navigationWarningShown) {
          confirmSubmitQuiz()
        } else {
          setNavigationWarningShown(true)
          setShowNavigationWarning(true)
        }
        return
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('keydown', handleKeyDown)
    window.history.pushState(null, null, window.location.href)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [takingQuiz, navigationWarningShown, answers, currentQuiz])

  useEffect(() => {
    if (!takingQuiz) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!navigationWarningShown) {
          setNavigationWarningShown(true)
          setShowNavigationWarning(true)
        }
      }
    }

    const handleWindowBlur = () => {
      if (!navigationWarningShown && takingQuiz) {
        console.log('User left the tab/window')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [takingQuiz, navigationWarningShown])

  const handleLeftNavClick = (callback) => {
    if (!takingQuiz) {
      callback && callback()
      return
    }

    if (navigationWarningShown) {
      confirmSubmitQuiz()
      return
    }

    setNavigationWarningShown(true)
    setShowNavigationWarning(true)
    setPendingNavigation(callback)
  }

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true)
        const config = {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
        const response = await axios.get('https://brjobsedu.com/epathshala/epathshala_backend/api/quiz-competition-items/', config)
        
        if (response.data.success) {
          setQuizzes(response.data.data || [])
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchRegisteredQuizzes = async () => {
      try {
        if (!uniqueId) return

        const config = {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
        const response = await axios.get(
          `https://brjobsedu.com/epathshala/epathshala_backend/api/quiz-competition-participants/?student_id=${uniqueId}`,
          config
        )
        
        if (response.data.success && response.data.data) {
          const registeredIds = new Set()
          const attemptedIds = new Set()
          response.data.data.forEach(participant => {
            registeredIds.add(participant.quiz_id)
            if (participant.attempt?.score !== undefined) {
              attemptedIds.add(participant.quiz_id)
            }
          })
          setRegisteredQuizIds(registeredIds)
          setAttemptedQuizIds(attemptedIds)
        }
      } catch (error) {
        console.error('Error fetching registered quizzes:', error)
      }
    }

    fetchQuizzes()
    fetchRegisteredQuizzes()
  }, [accessToken, uniqueId, refreshKey])

  // Fetch ranks when registered quizzes are loaded
  useEffect(() => {
    const fetchQuizRanks = async () => {
      if (!uniqueId || registeredQuizIds.size === 0 || !accessToken) return

      const config = {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }

      const ranks = {}
      for (const quizId of registeredQuizIds) {
        try {
          const response = await axios.get(
            `https://brjobsedu.com/epathshala/epathshala_backend/api/quiz/rank/?quiz_id=${quizId}`,
            config
          )
          
          if (response.data.success && response.data.data) {
            const userEntry = response.data.data.find(entry => 
              entry.student?.student_id === uniqueId && entry.attempt === true
            )
            if (userEntry) {
              ranks[quizId] = {
                rank: userEntry.rank,
                score: userEntry.score,
                status: userEntry.status,
                attempted: userEntry.attempt
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching rank for quiz ${quizId}:`, error)
        }
      }
      setQuizRanks(ranks)

      // Fetch school ranks
      const schoolRanks = {}
      for (const quizId of registeredQuizIds) {
        try {
          const schoolResponse = await axios.get(
            `https://brjobsedu.com/epathshala/epathshala_backend/api/quiz/school-rank/?quiz_id=${quizId}`,
            config
          )
          
          if (schoolResponse.data.success && schoolResponse.data.data) {
            schoolRanks[quizId] = schoolResponse.data.data
          }
        } catch (error) {
          console.error(`Error fetching school rank for quiz ${quizId}:`, error)
        }
      }
      setSchoolRanks(schoolRanks)
    }

    fetchQuizRanks()
  }, [registeredQuizIds, accessToken, uniqueId])

  useEffect(() => {
    if (!takingQuiz || !currentQuiz || timeRemaining === null) return

    if (timeRemaining === 0) {
      handleSubmitQuiz()
      return
    }

    const timer = setTimeout(() => {
      setTimeRemaining(timeRemaining - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeRemaining, takingQuiz])

  const handleContinueNavigation = () => {
    setShowNavigationWarning(false)
    if (pendingNavigation) {
      confirmSubmitQuiz()
    } else {
      confirmSubmitQuiz()
    }
  }

  const handleStayOnQuiz = () => {
    setShowNavigationWarning(false)
    setPendingNavigation(null)
  }

  const formatDateDDMMYY = (date) => {
    const d = String(date.getDate()).padStart(2, '0')
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const y = String(date.getFullYear()).slice(-2)
    return `${d}/${m}/${y}`
  }

  const fetchStudentRanks = async (quizId) => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
      const response = await axios.get(
        `https://brjobsedu.com/epathshala/epathshala_backend/api/quiz/rank/?quiz_id=${quizId}`,
        config
      )
      
      if (response.data.success && response.data.data) {
        const sortedData = response.data.data
          .filter(entry => entry.attempt === true)
          .sort((a, b) => a.rank - b.rank)
          .slice(0, 10)
        setStudentRankData(sortedData)
        setShowStudentRankModal(true)
      }
    } catch (error) {
      console.error('Error fetching student ranks:', error)
    }
  }

  const fetchSchoolRanks = async (quizId) => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
      const response = await axios.get(
        `https://brjobsedu.com/epathshala/epathshala_backend/api/quiz/school-rank/?quiz_id=${quizId}`,
        config
      )
      
      if (response.data.success && response.data.data) {
        const sortedData = response.data.data
          .sort((a, b) => a.rank - b.rank)
          .slice(0, 3)
        setSchoolRankData(sortedData)
        setShowSchoolRankModal(true)
      }
    } catch (error) {
      console.error('Error fetching school ranks:', error)
    }
  }

  const startQuiz = async (quiz) => {
    try {
      setQuizStarting(true)
      const startData = {
        quiz_id: quiz.quiz_id,
        student_id: uniqueId
      }

      const response = await axios.post(
        'https://brjobsedu.com/epathshala/epathshala_backend/api/quiz-competition/start/',
        startData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const responseData = response.data

      if (!responseData.success) {
        alert(responseData.message || 'Failed to start quiz. Please try again.')
        return
      }

      const quizData = {
        id: quiz.quiz_id,
        quiz_id: quiz.quiz_id,
        title: quiz.title,
        description: quiz.description,
        start_date_time: quiz.start_date_time,
        end_date_time: quiz.end_date_time,
        questions: responseData.questions || [],
        total_questions: responseData.total_questions || (responseData.questions ? responseData.questions.length : 0),
        attempt_id: responseData.attempt_id
      }

      setAttemptId(responseData.attempt_id)
      setCurrentQuiz(quizData)
      setTakingQuiz(true)
      setCurrentQuestionIndex(0)
      setAnswers({})
      setTimeRemaining(600)
      setQuizStarting(false)
    } catch (error) {
      console.error('Error starting quiz:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message
      
      if (error.response?.status === 404) {
        alert('Quiz endpoint not found. ' + errorMessage)
      } else if (error.response?.status === 401) {
        alert('Unauthorized. ' + errorMessage)
      } else if (error.response?.status === 400) {
        alert(errorMessage)
      } else if (error.response?.status === 403) {
        alert('Access denied. ' + errorMessage)
      } else if (error.response?.status === 500) {
        alert('Server error. ' + errorMessage)
      } else {
        alert(errorMessage || 'Failed to start quiz. Please try again.')
      }
      setQuizStarting(false)
      return
    }
  }

  const getCurrentQuestion = () => {
    if (!currentQuiz || !currentQuiz.questions) return null
    return currentQuiz.questions[currentQuestionIndex]
  }

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: optionIndex
    })
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitQuiz = () => {
    if (Object.keys(answers).length !== currentQuiz.questions.length) {
      alert('Please answer all questions before submitting.')
      return
    }

    confirmSubmitQuiz()
  }

  const confirmSubmitQuiz = async () => {
    try {
      const allAnswers = []
      for (let i = 0; i < currentQuiz.questions.length; i++) {
        const question = currentQuiz.questions[i]
        const selectedOption = answers[i] !== undefined ? answers[i] : -1
        allAnswers.push({
          question_id: question.id,
          selected_option: selectedOption
        })
      }

      const submissionData = {
        student_id: uniqueId,
        quiz_id: currentQuiz.quiz_id,
        answers: allAnswers
      }

      const submitResponse = await axios.post(
        'https://brjobsedu.com/epathshala/epathshala_backend/api/quiz-competition/submit/',
        submissionData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const responseData = submitResponse.data

      if (!responseData.status) {
        alert(responseData.message || 'Failed to submit quiz. Please try again.')
        return
      }

      const score = responseData.score || 0
      const totalMarks = responseData.total_marks || currentQuiz.total_questions
      const percentage = ((score / totalMarks) * 100).toFixed(2)
      const passed = responseData.result === 'passed'

      setQuizResults({
        quizTitle: currentQuiz.title,
        correctAnswers: score,
        wrongAnswers: totalMarks - score,
        totalQuestions: totalMarks,
        score: score,
        totalMarks: totalMarks,
        percentage: percentage,
        status: passed ? 'passed' : 'failed',
        rank: responseData.rank || null
      })

      setShowResults(true)
      setTakingQuiz(false)
      
      setShowNavigationWarning(false)
      setNavigationWarningShown(false)
      setPendingNavigation(null)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message
      
      if (error.response?.status === 401) {
        alert('Unauthorized. ' + errorMessage)
      } else if (error.response?.status === 400) {
        alert(errorMessage)
      } else if (error.response?.status === 404) {
        alert('Endpoint not found. ' + errorMessage)
      } else if (error.response?.status === 500) {
        alert('Server error. ' + errorMessage)
      } else {
        alert(errorMessage || 'Failed to submit quiz. Please try again.')
      }
    }
  }

  const handleRetakeQuiz = () => {
    setShowResults(false)
    setQuizResults(null)
    setAnswers({})
    const originalQuiz = quizzes.find(q => q.quiz_id === currentQuiz.quiz_id)
    if (originalQuiz) {
      startQuiz(originalQuiz)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = getCurrentQuestion()

  const registeredQuizzes = quizzes.filter(quiz => registeredQuizIds.has(quiz.quiz_id))

  const NavigationWarningModal = () => (
    <Modal show={showNavigationWarning} onHide={handleStayOnQuiz} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton={false}>
        <Modal.Title style={{ color: '#dc3545', fontWeight: 'bold' }}>
          Quiz In Progress
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-3">
          <p style={{ fontSize: '16px', fontWeight: '500' }}>
            ⚠️ You are currently taking a quiz!
          </p>
        </div>
        <Alert variant="warning" className="mb-3">
          <strong>Important:</strong> If you navigate away now, your quiz will be automatically submitted with your current answers.
          {navigationWarningShown && (
            <div className="mt-2">
              <strong className="text-danger">This is your final warning. Any further navigation will auto-submit your quiz.</strong>
            </div>
          )}
        </Alert>
        <p className="text-muted">
          {navigationWarningShown 
            ? 'Are you sure you want to continue and submit the quiz?' 
            : 'Would you like to continue taking the quiz or submit now?'}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="primary" 
          onClick={handleStayOnQuiz}
          className="fw-bold"
        >
          Continue Quiz
        </Button>
        <Button 
          variant={navigationWarningShown ? "danger" : "warning"} 
          onClick={handleContinueNavigation}
          className="fw-bold"
        >
          {navigationWarningShown ? '⚠️ Submit & Leave' : 'Submit Now'}
        </Button>
      </Modal.Footer>
    </Modal>
  )

  

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

        <Container fluid className="dashboard-box mt-3">
          {!takingQuiz && !showResults ? (
            <>
              <div className="mb-4">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate('/UserDashboard')} 
                  className="d-flex align-items-center competition-btn-back"
                >
                  <FaArrowLeft className="me-1" />
                  {language === 'hi' ? "पीछे" : "Back"}
                </Button>
              </div>

              <h5 className="competition-heading">{language === 'hi' ? "क्विज़ प्रतियोगिता" : "Quiz Competition"}</h5>

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" style={{ width: '60px', height: '60px' }} />
                  <p className="mt-3">Loading...</p>
                </div>
              ) : registeredQuizzes.length > 0 ? (
                <Row>
                  {registeredQuizzes.map((quiz) => {
                    const startTime = new Date(quiz.start_date_time)
                    const endTime = new Date(quiz.end_date_time)

                    return (
                      <Col md={6} lg={4} key={quiz.quiz_id} className="mb-4">
                        <Card className="h-100 competition-card shadow-sm">
                          <Card.Body className="d-flex flex-column competition-card-body">
                            <div className="mb-2">
                              <h6 className="competition-card-title">{language === 'hi' && quiz.title_hindi ? quiz.title_hindi : quiz.title}</h6>
                              <p className="text-muted competition-card-desc mb-1">{language === 'hi' && quiz.description_hindi ? quiz.description_hindi : quiz.description}</p>
                            </div>

                            <div className="mb-2">
                              <div className="d-flex justify-content-between mb-1">
                                <small className="competition-meta">
                                  <FaQuestion className="me-1" />
                                  {language === 'hi' ? "प्रश्न" : "Questions"}: {quiz.number_of_questions || quiz.questions?.length || 0}
                                </small>
                                <Badge bg="info competition-badge">{quiz.quiz_category}</Badge>
                              </div>
                              <small className="text-muted d-block mb-1 competition-meta">
                                {language === 'hi' ? "प्रारंभ" : "Start"}: {formatDateDDMMYY(startTime)} {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </small>
                              <small className="text-muted d-block mb-1 competition-meta">
                                {language === 'hi' ? "समाप्ति" : "End"}: {formatDateDDMMYY(endTime)} {endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </small>
                            </div>

                            <div className="mb-1">
                              <div className="d-flex justify-content-between">
                                <small 
                                  className="text-primary competition-rank-link"
                                  onClick={() => fetchSchoolRanks(quiz.quiz_id)}
                                >
                                  <FaSchool className="me-1" />
                                  {language === 'hi' ? "शैक्षणिक संस्था रैंकिंग" : "School Rankings"}
                                </small>
                                <small 
                                  className="text-primary competition-rank-link"
                                  onClick={() => fetchStudentRanks(quiz.quiz_id)}
                                >
                                  <FaUsers className="me-1" />
                                  {language === 'hi' ? "शीर्ष 10" : "Top 10"}
                                </small>
                              </div>
                            </div>

                            <div className="mt-auto">
                              {quizRanks[quiz.quiz_id]?.attempted ? (
                                <Button
                                  variant="success"
                                  className="w-100 competition-btn-completed"
                                  disabled
                                >
                                  <FaCheckCircle className="me-1" />
                                  {language === 'hi' ? "पूर्ण" : "Done"}
                                  {quizRanks[quiz.quiz_id]?.score !== undefined && (
                                    <span className="ms-1">| {language === 'hi' ? "स्कोर" : "score"} : {quizRanks[quiz.quiz_id].score}</span>
                                  )}
                                  {quizRanks[quiz.quiz_id]?.rank && (
                                    <span className="ms-1">|{language === 'hi' ? "रैंक" : "Rank"} #{quizRanks[quiz.quiz_id].rank}</span>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  variant="primary"
                                  className="w-100 competition-btn-start"
                                  onClick={() => startQuiz(quiz)}
                                  disabled={quizStarting}
                                >
                                  {quizStarting ? (
                                    <>
                                      <Spinner animation="border" size="sm" className="me-1" />
                                      {language === 'hi' ? "प्रतीक्षा करें..." : "Wait..."}
                                    </>
                                  ) : (
                                    <>
                                      {language === 'hi' ? "शुरू करें" : "Start"}
                                      <FaChevronRight className="ms-1" />
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    )
                  })}
                </Row>
              ) : (
                <Alert variant="info" className="text-center">
                  <FaLock className="me-2" />
                  {language === 'hi' ? "आप अभी तक किसी क्विज़ प्रतियोगिता के लिए पंजीकृत नहीं हैं।" : "You are not registered for any quiz competition yet."}
                  <br />
                  <small className="text-muted">{language === 'hi' ? "क्विज़ प्रतियोगिताओं के लिए पंजीकरण करने के लिए अपने शैक्षणिक संस्था से संपर्क करें।" : "Contact your school to register for quiz competitions."}</small>
                </Alert>
              )}
            </>
          ) : showResults ? (
            <>
              <div className="text-center competition-result-container">
                <div className="mb-3">
                  <FaTrophy className="text-warning competition-result-icon" />
                </div>
                <h5 className="competition-result-title">{quizResults.status === 'passed' ? (language === 'hi' ? "बधाई हो!" : "Congratulations!") : (language === 'hi' ? "कोशिश जारी रखें!" : "Keep Trying!")}</h5>
                <p className="text-muted competition-result-score">
                  {language === 'hi' ? "स्कोर:" : "Score:"} {quizResults.score}/{quizResults.totalMarks || quizResults.totalQuestions}
                  {quizResults.rank && (
                    <span className="ms-1">| {language === 'hi' ? "रैंक" : "Rank"}: #{quizResults.rank}</span>
                  )}
                </p>

                <Card className="shadow-sm mb-3" style={{ maxWidth: '500px', margin: '0 auto' }}>
                  <Card.Body>
                    <Row className="mb-3">
                      <Col md={6} className="mb-2">
                        <div className="result-item">
                          <h5 className="competition-result-correct">{quizResults.correctAnswers}</h5>
                          <small className="text-muted competition-result-label">
                            <FaCheckCircle className="me-1 text-success" />
                            {language === 'hi' ? "सही" : "Correct"}
                          </small>
                        </div>
                      </Col>
                      <Col md={6} className="mb-2">
                        <div className="result-item">
                          <h5 className="competition-result-wrong">{quizResults.wrongAnswers}</h5>
                          <small className="text-muted competition-result-label">
                            <FaTimesCircle className="me-1 text-danger" />
                            {language === 'hi' ? "गलत" : "Wrong"}
                          </small>
                        </div>
                      </Col>
                    </Row>

                    <div className="mb-2">
                      <small className="text-muted competition-result-label">{language === 'hi' ? "प्रतिशत" : "Percentage"}</small>
                      <h5 className={`mb-1 ${quizResults.percentage >= 60 ? 'competition-result-percentage-pass' : 'competition-result-percentage-fail'}`}>
                        {quizResults.percentage}%
                      </h5>
                      <ProgressBar 
                        now={quizResults.percentage} 
                        variant={quizResults.percentage >= 60 ? 'success' : 'danger'}
                        label={`${quizResults.percentage}%`}
                      />
                    </div>
                  </Card.Body>
                </Card>

                 <div className="d-flex gap-2 justify-content-center mt-2 flex-wrap">
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setShowResults(false)
                        setCurrentQuiz(null)
                        setQuizResults(null)
                        setRefreshKey(prev => prev + 1)
                        navigate('/Competition', { state: { fromQuiz: true } })
                      }}
                      className="d-flex align-items-center competition-btn-back-result"
                    >
                      {language === 'hi' ? "पीछे" : "Back"}
                    </Button>
                 </div>
              </div>
            </>
          ) : (
            <>
              <div className="quiz-taking-container">
<div className="competition-header">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 competition-title">{language === 'hi' && currentQuiz.title_hindi ? currentQuiz.title_hindi : currentQuiz.title}</h6>
                    <div className="timer competition-timer" style={{ 
                      fontSize: '2rem', 
                      fontWeight: 'bold', 
                      color: '#dc3545',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <FaClock className="me-2" />
                      {formatTime(timeRemaining)}
                    </div>
                  </div>
                  <ProgressBar 
                    now={((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100} 
                    label={`${currentQuestionIndex + 1} / ${currentQuiz.questions.length}`}
                  />
                </div>

                {currentQuestion && (
                  <Card className="shadow-sm mb-3">
                    <Card.Body>
                      <div className="mb-2">
                          <h6 className="competition-question-num mb-1">
                            {language === 'hi' ? "प्रश्न" : "Question"} {currentQuestionIndex + 1} / {currentQuiz.questions.length}
                          </h6>
                          <div className="mb-1">
                            {language === 'hi' ? (
                               <p className="competition-question-text mb-1">{currentQuestion.question_hindi || currentQuestion.question}</p>
                            ) : (
                               <p className="competition-question-text mb-1">{currentQuestion.question}</p>
                            )}
                          </div>
                        </div>

                      <div className="competition-options">
                        {currentQuestion.options && currentQuestion.options.map((option, idx) => {
                          const isSelected = answers[currentQuestionIndex] === idx
                          const displayText = language === 'hi' && currentQuestion.options_hindi?.[idx] 
                            ? currentQuestion.options_hindi[idx] 
                            : option
                          return (
                            <div key={idx} className="competition-option-item">
                              <Button 
                                className={`w-100 text-start competition-option-btn ${isSelected ? 'competition-option-btn-selected' : 'competition-option-btn-default'}`}
                                onClick={() => handleAnswerSelect(idx)}
                              >
                                <div className="d-flex align-items-center">
                                  <span className="competition-option-letter me-1">{String.fromCharCode(65 + idx)}.</span>
                                  <span>{displayText}</span>
                                </div>
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </Card.Body>
                  </Card>
                )}

                <div className="d-flex justify-content-between gap-2 mb-3 competition-nav-buttons">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => {
                      handlePreviousQuestion()
                    }}
                    disabled={currentQuestionIndex === 0}
                    className="competition-btn-prev"
                  >
                    {language === 'hi' ? "पिछला" : "Previous"}
                  </Button>
                  
                  <div style={{ flex: 1 }} />
                  
                  {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
                    <Button 
                      variant="primary" 
                      onClick={() => {
                        handleNextQuestion()
                      }}
                      className="competition-btn-next"
                    >
                      {language === 'hi' ? "अगला" : "Next"}
                    </Button>
                  ) : (
                    <Button 
                      variant="success" 
                      onClick={() => {
                        handleSubmitQuiz()
                      }}
                      className="competition-btn-submit"
                    >
                      {language === 'hi' ? "सबमिट" : "Submit"}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </Container>
      </div>

      <NavigationWarningModal />

      {/* School Rank Modal */}
      <Modal show={showSchoolRankModal} onHide={() => setShowSchoolRankModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaSchool className="me-2" />
            School Rankings
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {schoolRankData.length > 0 ? (
            schoolRankData.map((entry, idx) => (
              <Card key={idx} className={`mb-2 ${idx === 0 ? 'competition-school-rank-gold' : idx === 1 ? 'competition-school-rank-silver' : 'competition-school-rank-bronze'}`}>
                <Card.Body className="py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>#{entry.rank}</strong>
                      <span className="ms-2">{entry.school?.school_name}</span>
                    </div>
                    <div className="text-end">
                      <small className="text-muted">Avg Score: {entry.avg_score}</small>
                      <br />
                      <small className="text-muted">Students: {entry.total_students}</small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted">No school rankings available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSchoolRankModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Student Rank Modal */}
      <Modal show={showStudentRankModal} onHide={() => setShowStudentRankModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUsers className="me-2" />
            Top 10 Student Rankings
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {studentRankData.length > 0 ? (
            studentRankData.map((entry, idx) => (
              <Card key={idx} className={`mb-2 ${idx === 0 ? 'competition-student-rank-gold' : idx === 1 ? 'competition-student-rank-silver' : idx === 2 ? 'competition-student-rank-bronze' : 'competition-student-rank-card'}`}>
                <Card.Body className="py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>#{entry.rank}</strong>
                      <span className="ms-2">{entry.student?.full_name}</span>
                      <br />
                      <small className="text-muted">{entry.student?.student_id}</small>
                    </div>
                    <div className="text-end">
                      <strong>Score: {entry.score}</strong>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted">No student rankings available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStudentRankModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Competition
