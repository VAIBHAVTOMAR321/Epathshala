import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, ProgressBar, Modal } from 'react-bootstrap'
import axios from 'axios'
import { useAuth } from '../all_login/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../all_login/LanguageContext'

import { FaArrowLeft, FaClock, FaQuestion, FaTrophy, FaCheckCircle, FaTimesCircle, FaChevronRight, FaMedal, FaUsers } from 'react-icons/fa'
import '../../assets/css/userleftnav.css'
import '../../assets/css/UserQuiz.css'
import UserLeftNav from './UserLeftNav'
import UserHeader from './UserHeader'

const UserQuiz = () => {
  const { uniqueId, accessToken } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [showRankModal, setShowRankModal] = useState(false)
  const [selectedQuizRank, setSelectedQuizRank] = useState(null)

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
  const [loading, setLoading] = useState(true)
  const [participatedQuizzes, setParticipatedQuizzes] = useState({})
  const [quizRanks, setQuizRanks] = useState({})
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Quiz taking state
  const [takingQuiz, setTakingQuiz] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [attemptId, setAttemptId] = useState(null)
  
  // Results state
  const [showResults, setShowResults] = useState(false)
  const [quizResults, setQuizResults] = useState(null)
  const [showWrongAnswersModal, setShowWrongAnswersModal] = useState(false)
  const [wrongAnswers, setWrongAnswers] = useState([])

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle responsive margin for mobile
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

  // Fetch quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true)
        const config = {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
        const response = await axios.get('https://brjobsedu.com/epathshala/epathshala_backend/api/quiz-items/', config)
        
        if (response.data.success) {
          setQuizzes(response.data.data || [])
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error)
        alert('Failed to load quizzes. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    const fetchParticipatedQuizzes = async () => {
      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
        const response = await axios.get('https://brjobsedu.com/epathshala/epathshala_backend/api/quiz-participants/', config)
        
        if (response.data.status && response.data.data) {
          const allParticipants = response.data.data;
          const participated = {};
          const ranks = {};

          // Group participants by quiz_id
          const participantsByQuiz = allParticipants.reduce((acc, participant) => {
            if (!acc[participant.quiz_id]) {
              acc[participant.quiz_id] = [];
            }
            acc[participant.quiz_id].push(participant);
            return acc;
          }, {});
          
          // Process each quiz group
          for (const quizId in participantsByQuiz) {
            const participants = participantsByQuiz[quizId];
            const completedParticipants = participants.filter(p => {
              const attempt = Array.isArray(p.attempt) ? p.attempt[0] : p.attempt;
              return attempt && (attempt.status === 'passed' || attempt.status === 'failed');
            });
            
            const userParticipant = participants.find(p => p.student?.student_id === uniqueId);
            const userAttempt = userParticipant ? (Array.isArray(userParticipant.attempt) ? userParticipant.attempt[0] : userParticipant.attempt) : null;

            if (userAttempt && (userAttempt.status === 'passed' || userAttempt.status === 'failed')) {
              participated[quizId] = true;
            }

            const sorted = completedParticipants
              .map(p => ({
                ...p,
                currentAttempt: Array.isArray(p.attempt) ? p.attempt[0] : p.attempt
              }))
              .filter(p => p.currentAttempt?.rank)
              .sort((a, b) => a.currentAttempt.rank - b.currentAttempt.rank)
              .slice(0, 3);

            ranks[quizId] = {
              userRank: userAttempt?.rank,
              userScore: userAttempt?.score,
              totalParticipants: completedParticipants.length,
              topThree: sorted.map(p => ({
                student_id: p.student?.student_id,
                full_name: p.student?.full_name,
                rank: p.currentAttempt?.rank,
                score: p.currentAttempt?.score,
                status: p.currentAttempt?.status
              }))
            };
          }
          setParticipatedQuizzes(participated);
          setQuizRanks(ranks);
        }
      } catch (error) {
        console.error('Error fetching participated quizzes:', error)
      }
    }

    fetchQuizzes()
    fetchParticipatedQuizzes()
  }, [accessToken, uniqueId, refreshKey])

  // Quiz timer
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

  const handleMenuToggle = () => {
    setShowOffcanvas(!showOffcanvas)
  }
  
  const formatDateDDMMYY = (date) => {
    const d = String(date.getDate()).padStart(2, '0')
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const y = String(date.getFullYear()).slice(-2)
    return `${d}/${m}/${y}`
  }

  const startQuiz = async (quiz) => {
    try {
      // Register as quiz participant and fetch questions 
      const participantData = {
        quiz_id: quiz.quiz_id,
        student_id: uniqueId
      }

      console.log('Registering quiz participant:', participantData)

      const participantResponse = await axios.post(
        'https://brjobsedu.com/epathshala/epathshala_backend/api/quiz-participants/',
        participantData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('Quiz participant response:', participantResponse.data)
      const responseData = participantResponse.data

      // Validate response
      if (!responseData.status) {
        if (responseData.message && responseData.message.toLowerCase().includes('already')) {
          alert('Already participated.')
        } else {
          alert(responseData.message || 'Failed to start quiz. Please try again.')
        }
        return
      }

      // Extract data from response
      const now = new Date()
      const endTime = new Date(quiz.end_date_time)

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

      console.log('Quiz data loaded:', {
        quiz_id: quizData.quiz_id,
        student_id: uniqueId,
        attempt_id: quizData.attempt_id,
        total_questions: quizData.total_questions,
        questions_received: quizData.questions.length
      })

      // Store attempt ID for submission
      setAttemptId(responseData.attempt_id)

      // Initialize quiz with data from API response
      setCurrentQuiz(quizData)
      setTakingQuiz(true)
      setCurrentQuestionIndex(0)
      setAnswers({})

      // Set 10 minute timer for each quiz
      setTimeRemaining(600) // 10 min = 600 seconds
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
    console.log('Next clicked, current index:', currentQuestionIndex)
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      const newIndex = currentQuestionIndex + 1
      console.log('Moving to index:', newIndex)
      setCurrentQuestionIndex(newIndex)
    }
  }

  const handlePreviousQuestion = () => {
    console.log('Previous clicked, current index:', currentQuestionIndex)
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1
      console.log('Moving to index:', newIndex)
      setCurrentQuestionIndex(newIndex)
    }
  }

  const handleSubmitQuiz = () => {
    console.log('Submit quiz clicked, answers:', answers)
    if (Object.keys(answers).length !== currentQuiz.questions.length) {
      alert('Please answer all questions before submitting.')
      return
    }

    confirmSubmitQuiz()
  }

  const confirmSubmitQuiz = async () => {
    try {
      // Collect all answers (including unanswered questions)
      const allAnswers = []
      for (let i = 0; i < currentQuiz.questions.length; i++) {
        const question = currentQuiz.questions[i]
        const selectedOption = answers[i] !== undefined ? answers[i] : -1
        allAnswers.push({
          question_id: question.id,
          selected_option: selectedOption
        })
      }

      // Prepare submission payload with all answers
      const submissionData = {
        student_id: uniqueId,
        quiz_id: currentQuiz.quiz_id,
        answers: allAnswers
      }

      console.log('Submitting quiz:', submissionData)

      // Submit quiz to backend
      const submitResponse = await axios.post(
        'https://brjobsedu.com/epathshala/epathshala_backend/api/submit-quiz/',
        submissionData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const responseData = submitResponse.data
      console.log('Submit quiz response:', responseData)

      // Handle server response for scoring
      let correctCount = responseData.correct_answers || responseData.score || 0
      let totalQuestions = responseData.total_questions || currentQuiz.total_questions
      let serverScore = responseData.score !== undefined ? responseData.score : correctCount
      let serverPercentage = responseData.percentage || ((correctCount / totalQuestions) * 100).toFixed(2)

      // Collect wrong answers
      let wrongAnswersArray = []
      if (!responseData.correct_answers && responseData.score === undefined) {
        currentQuiz.questions.forEach((question, index) => {
          if (answers[index] !== question.correct_answer) {
            wrongAnswersArray.push({
              questionIndex: index,
              question_text: question.question_text,
              question_text_hindi: question.question_text_hindi,
              options: question.options,
              options_hindi: question.options_hindi,
              userAnswer: answers[index],
              correctAnswer: question.correct_answer
            })
          }
        })
        totalQuestions = currentQuiz.questions.length
        correctCount = totalQuestions - wrongAnswersArray.length
        serverScore = correctCount
        serverPercentage = ((correctCount / totalQuestions) * 100).toFixed(2)
      } else if (!responseData.correct_answers) {
        // If score provided but not correct_answers, calculate wrong answers for display
        currentQuiz.questions.forEach((question, index) => {
          if (answers[index] !== question.correct_answer) {
            wrongAnswersArray.push({
              questionIndex: index,
              question_text: question.question_text,
              question_text_hindi: question.question_text_hindi,
              options: question.options,
              options_hindi: question.options_hindi,
              userAnswer: answers[index],
              correctAnswer: question.correct_answer
            })
          }
        })
      }

      setQuizResults({
        quizTitle: currentQuiz.title,
        correctAnswers: correctCount,
        wrongAnswers: totalQuestions - correctCount,
        totalQuestions,
        score: serverScore,
        totalMarks: totalQuestions,
        percentage: serverPercentage,
        status: correctCount >= (totalQuestions * 0.6) ? 'passed' : 'failed'
      })

      // Store wrong answers for potential viewing
      if (wrongAnswersArray.length > 0) {
        setWrongAnswers(wrongAnswersArray)
      }

      setShowResults(true)
      setTakingQuiz(false)
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
    // Call startQuiz with original quiz object from state
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

  // Wrong Answers Modal Component
  const WrongAnswersModal = () => (
    <Modal show={showWrongAnswersModal} onHide={() => setShowWrongAnswersModal(false)} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Wrong Answers Review</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {wrongAnswers.length > 0 ? (
          wrongAnswers.map((wrongAnswer, idx) => (
            <Card key={idx} className="mb-3" style={{ borderLeft: '4px solid #dc3545' }}>
              <Card.Body>
                <h6 style={{ color: '#dc3545', fontWeight: 'bold' }}>
                  Question {wrongAnswer.questionIndex + 1}
                </h6>
                
                {wrongAnswer.question_text && (
                  <p className="mb-2">
                    <strong>{wrongAnswer.question_text}</strong>
                  </p>
                )}
                {wrongAnswer.question_text_hindi && (
                  <p className="mb-2 text-muted">
                    <strong>{wrongAnswer.question_text_hindi}</strong>
                  </p>
                )}
                
                <div className="mb-2">
                  <small style={{ color: '#6c757d' }}>Your Answer:</small>
                  <p style={{ 
                    backgroundColor: '#f8d7da', 
                    padding: '8px 12px', 
                    borderRadius: '4px',
                    marginBottom: '8px',
                    color: '#721c24'
                  }}>
                    <strong>
                      {String.fromCharCode(65 + wrongAnswer.userAnswer)}.{' '}
                      {wrongAnswer.options[wrongAnswer.userAnswer]}
                      {wrongAnswer.options_hindi?.[wrongAnswer.userAnswer] && (
                        <span className="ms-1">({wrongAnswer.options_hindi[wrongAnswer.userAnswer]})</span>
                      )}
                    </strong>
                  </p>
                </div>

                <div>
                  <small style={{ color: '#6c757d' }}>Correct Answer:</small>
                  <p style={{ 
                    backgroundColor: '#d4edda', 
                    padding: '8px 12px', 
                    borderRadius: '4px',
                    color: '#155724'
                  }}>
                    <strong>
                      {String.fromCharCode(65 + wrongAnswer.correctAnswer)}.{' '}
                      {wrongAnswer.options[wrongAnswer.correctAnswer]}
                      {wrongAnswer.options_hindi?.[wrongAnswer.correctAnswer] && (
                        <span className="ms-1">({wrongAnswer.options_hindi[wrongAnswer.correctAnswer]})</span>
                      )}
                    </strong>
                  </p>
                </div>
              </Card.Body>
            </Card>
          ))
        ) : (
          <Alert variant="success">All answers are correct! / सभी उत्तर सही हैं!</Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowWrongAnswersModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )

  // Rank Modal Component
  const RankModal = () => (
    <Modal show={showRankModal} onHide={() => setShowRankModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaMedal className="me-2 text-warning" />
          Quiz Rankings
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedQuizRank && (
          <>
            {selectedQuizRank.userRank ? (
              <div className="mb-4 p-3 bg-primary text-white rounded" style={{ backgroundColor: '#0d6efd' }}>
                <div className="text-center">
                  <h5 className="mb-1">Your Rank</h5>
                  <h2 className="mb-0">#{selectedQuizRank.userRank}</h2>
                  <small>Score: {selectedQuizRank.userScore}</small>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-info text-white rounded">
                <div className="text-center">
                  <h5 className="mb-1">Top Participants</h5>
                  <small>Participants: {selectedQuizRank.totalParticipants}</small>
                </div>
              </div>
            )}
            
            {selectedQuizRank.topThree && selectedQuizRank.topThree.length > 0 && (
              <>
                <h6 className="mb-3">
                  {selectedQuizRank.userRank ? 'Top Three' : 'Top Rankers'}
                </h6>
                {selectedQuizRank.topThree
                  .filter(p => p.rank >= 1 && p.rank <= 3)
                  .map((participant, idx) => {
                  const isUser = participant.student_id === uniqueId
                  const medalColor = participant.rank === 1 ? '#FFD700' : participant.rank === 2 ? '#C0C0C0' : '#CD7F32'
                  return (
                    <div 
                      key={idx} 
                      className={`d-flex align-items-center p-3 mb-2 rounded ${isUser ? 'bg-info bg-opacity-10' : 'bg-light'}`}
                      style={{ borderLeft: `4px solid ${medalColor}` }}
                    >
                      <div className="me-3" style={{ width: '30px', textAlign: 'center', fontSize: '20px' }}>
                        {participant.rank === 1 ? '🥇' : participant.rank === 2 ? '🥈' : '🥉'}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold">
                          {participant.full_name}
                          {isUser && <Badge bg="primary" className="ms-2">You</Badge>}
                        </div>
                        <small className="text-muted">{participant.student_id}</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">Score: {participant.score}</div>
                         <small className={participant.status === 'passed' ? 'text-success' : 'text-danger'}>
                           {participant.status === 'passed' ? 'Passed' : 'Failed'}
                         </small>
                      </div>
                    </div>
                  )
                })}
                
                {selectedQuizRank.userRank && selectedQuizRank.userRank > 3 && (
                  <div className="mt-3 p-3 bg-light rounded text-center">
                    <small className="text-muted">Rank: #{selectedQuizRank.userRank}</small>
                  </div>
                )}
              </>
            )}
            
            {selectedQuizRank.totalParticipants && (
              <div className="text-center mt-3 text-muted">
                <small>Total Participants: {selectedQuizRank.totalParticipants}</small>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowRankModal(false)}>
          Close
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
                  className="d-flex align-items-center quiz-btn-back"
                >
                  <FaArrowLeft className="me-1" />
                  {language === 'hi' ? "पीछे" : "Back"}
                </Button>
              </div>

              <h5 className="quiz-heading">{language === 'hi' ? "क्विज़" : "Quizzes"}</h5>

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" style={{ width: '60px', height: '60px' }} />
                  <p className="mt-3">Loading...</p>
                </div>
              ) : quizzes.length > 0 ? (
                <Row>
                  {quizzes.map((quiz) => {
                    const startTime = new Date(quiz.start_date_time)
                    const endTime = new Date(quiz.end_date_time)

                    return (
                      <Col md={6} lg={4} key={quiz.quiz_id} className="mb-4">
                        <Card className="h-100 quiz-card shadow-sm">
                          <Card.Body className="d-flex flex-column quiz-card-body">
                            <div className="mb-2">
                              <h6 className="quiz-card-title">{language === 'hi' && quiz.title_hindi ? quiz.title_hindi : quiz.title}</h6>
                              <p className="text-muted quiz-card-desc mb-1">{language === 'hi' && quiz.description_hindi ? quiz.description_hindi : quiz.description}</p>
                            </div>

                            <div className="mb-2">
                              <div className="d-flex justify-content-between mb-1">
                                <small className="quiz-meta">
                                  <FaQuestion className="me-1" />
                                  {language === 'hi' ? "प्रश्न: 10" : "Questions: 10"}
                                </small>
                                <Badge bg="info quiz-badge">{quiz.quiz_category}</Badge>
                              </div>
                              <small className="text-muted d-block mb-1 quiz-meta">
                                {language === 'hi' ? "प्रारंभ" : "Start"}: {formatDateDDMMYY(startTime)} {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </small>
                              <small className="text-muted d-block mb-1 quiz-meta">
                                {language === 'hi' ? "समाप्ति" : "End"}: {formatDateDDMMYY(endTime)} {endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </small>
                            </div>

                            <div className="mt-auto">
                              {participatedQuizzes[quiz.quiz_id] ? (
                                <div className="d-flex flex-column gap-2">
                                  <div className="d-flex justify-content-between gap-2">
                                    <Badge bg="primary" className="flex-fill py-2 quiz-badge-primary">
                                      {language === 'hi' ? "प्रतिभागी" : "Participants"}: {quizRanks[quiz.quiz_id]?.totalParticipants || 0}
                                    </Badge>
                                    {quizRanks[quiz.quiz_id]?.userRank && (
                                      <Badge bg="warning" className="flex-fill py-2 quiz-badge-warning">
                                        {language === 'hi' ? "रैंक" : "Rank"}: #{quizRanks[quiz.quiz_id].userRank}
                                      </Badge>
                                    )}
                                   
                                  </div>
                                  <div className="d-flex justify-content-between gap-2">
                                  
                                   {quizRanks[quiz.quiz_id]?.userScore !== undefined && (
                                      <Badge bg="success" className="flex-fill py-2 quiz-badge-success">
                                        {language === 'hi' ? "स्कोर" : "Score"}: {quizRanks[quiz.quiz_id].userScore}
                                      </Badge>
                                    )}
                              
                                  <Button
                                    variant="info"
                                    className=" quiz-btn-view-rank"
                                    onClick={() => {
                                      setSelectedQuizRank({ quizId: quiz.quiz_id, ...quizRanks[quiz.quiz_id] })
                                      setShowRankModal(true)
                                    }}
                                  >
                                    {language === 'hi' ? "रैंक देखें" : "View Rank"}
                                  </Button>
                                  <Button
                                      variant="secondary"
                                      className=""
                                      disabled
                                      style={{ fontSize: '10px', padding: '6px 12px' }}
                                    >
                                      {language === 'hi' ? "प्रयास किया गया" : "Attempted"}
                                    </Button>
                                    </div>


                                </div>
                              ) : (
                                <div className="d-flex justify-content-between align-items-center">
                                  <Badge bg="light" text="dark" className="quiz-badge-participants">
                                    <FaUsers className="me-1" />
                                    {quizRanks[quiz.quiz_id]?.totalParticipants ?? 0} {language === 'hi' ? 'प्रतिभागी' : 'Participants'}
                                  </Badge>
                                  <Button
                                    variant="primary"
                                    className="w-100 quiz-btn-start"
                                    onClick={() => startQuiz(quiz)}
                                  >
                                    {language === 'hi' ? "क्विज़ शुरू करें" : "Start Quiz"}
                                    <FaChevronRight className="ms-1" />
                                  </Button>
                                </div>
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
                  {language === 'hi' ? "कोई क्विज़ उपलब्ध नहीं है" : "No quizzes available"}
                </Alert>
              )}
            </>
          ) : showResults ? (
            <>
              <div className="text-center quiz-result-container">
                <div className="mb-3">
                  <FaTrophy className="text-warning quiz-result-icon" />
                </div>
                <h5 className="quiz-result-title">{language === 'hi' ? "बधाई हो!" : "Congratulations!"}</h5>
                <p className="text-muted quiz-result-score">{language === 'hi' ? "शानदार काम! आपका स्कोर:" : "Great job! Your score:"} {quizResults.score}/{quizResults.totalMarks || quizResults.totalQuestions}</p>

                <Card className="shadow-sm mb-3" style={{ maxWidth: '500px', margin: '0 auto' }}>
                  <Card.Body>
                    <Row className="mb-3">
                      <Col md={6} className="mb-2">
                        <div className="result-item">
                          <h5 className="quiz-result-correct">{quizResults.correctAnswers}</h5>
                          <small className="text-muted quiz-result-label">
                            <FaCheckCircle className="me-1 text-success" />
                            {language === 'hi' ? "सही" : "Correct"}
                          </small>
                        </div>
                      </Col>
                      <Col md={6} className="mb-2">
                        <div className="result-item">
                          <h5 className="quiz-result-wrong">{quizResults.wrongAnswers}</h5>
                          <small className="text-muted quiz-result-label">
                            <FaTimesCircle className="me-1 text-danger" />
                            {language === 'hi' ? "गलत" : "Wrong"}
                          </small>
                        </div>
                      </Col>
                    </Row>

                    <div className="mb-2">
                      <small className="text-muted quiz-result-label">{language === 'hi' ? "प्रतिशत" : "Percentage"}</small>
                      <h5 className={`mb-1 ${quizResults.percentage >= 60 ? 'quiz-result-percentage-pass' : 'quiz-result-percentage-fail'}`}>
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
                    {wrongAnswers.length > 0 && (
                      <Button
                        variant="warning"
                        onClick={() => setShowWrongAnswersModal(true)}
                        className="d-flex align-items-center quiz-btn-view-wrong"
                      >
                        <FaTimesCircle className="me-1" />
                        {language === 'hi' ? "गलत उत्तर देखें" : "View Wrong"}
                      </Button>
                    )}
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setShowResults(false)
                        setCurrentQuiz(null)
                        setQuizResults(null)
                        setRefreshKey(prev => prev + 1)
                        navigate('/UserQuiz', { state: { fromQuiz: true } })
                      }}
                      className="d-flex align-items-center quiz-btn-back-result"
                    >
                      {language === 'hi' ? "पीछे" : "Back"}
                    </Button>
                 </div>
              </div>
            </>
          ) : (
            <>
              <div className="quiz-taking-container">
                <div className="quiz-header">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 quiz-title">{language === 'hi' && currentQuiz.title_hindi ? currentQuiz.title_hindi : currentQuiz.title}</h6>
                    <div className="timer quiz-timer" style={{ 
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
                        <h6 className="quiz-question-num mb-1">
                          {language === 'hi' ? "प्रश्न" : "Question"} {currentQuestionIndex + 1} / {currentQuiz.questions.length}
                        </h6>
                        <div className="mb-1">
                          {language === 'hi' ? (
                            <p className="quiz-question-text mb-1">{currentQuestion.question_text_hindi || currentQuestion.question_text}</p>
                          ) : (
                            <p className="quiz-question-text mb-1">{currentQuestion.question_text}</p>
                          )}
                        </div>
                      </div>

                      <div className="quiz-options">
                        {currentQuestion.options && currentQuestion.options.map((option, idx) => {
                          const isSelected = answers[currentQuestionIndex] === idx
                          const displayText = language === 'hi' && currentQuestion.options_hindi?.[idx] 
                            ? currentQuestion.options_hindi[idx] 
                            : option
                          return (
                            <div key={idx} className="quiz-option-item">
                              <Button 
                                className={`w-100 text-start quiz-option-btn ${isSelected ? 'quiz-option-btn-selected' : 'quiz-option-btn-default'}`}
                                onClick={() => handleAnswerSelect(idx)}
                              >
                                <span className="quiz-option-letter me-1">{String.fromCharCode(65 + idx)}.</span>
                                {displayText}
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </Card.Body>
                  </Card>
                )}

                <div className="d-flex justify-content-between gap-2 mb-3 quiz-nav-buttons">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => {
                      handlePreviousQuestion()
                    }}
                    disabled={currentQuestionIndex === 0}
                    className="quiz-btn-prev"
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
                      className="quiz-btn-next"
                    >
                      {language === 'hi' ? "अगला" : "Next"}
                    </Button>
                  ) : (
                    <Button 
                      variant="success" 
                      onClick={() => {
                        handleSubmitQuiz()
                      }}
                      className="quiz-btn-submit"
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

      <WrongAnswersModal />
      <RankModal />
    </div>
  )
}

export default UserQuiz
