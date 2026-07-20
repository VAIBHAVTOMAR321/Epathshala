import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Spinner, Accordion, Alert } from 'react-bootstrap'
import { useAuth } from '../all_login/AuthContext'
import UserHeader from './UserHeader'
import UserLeftNav from './UserLeftNav'
import "../../assets/css/UserDashboard.css"
import "../../assets/css/userleftnav.css"
import { renderContentWithLineBreaks } from '../../utils/contentRenderer.jsx'
import { FaBook, FaCheckCircle, FaClock, FaEye, FaLock, FaUnlock, FaQuestionCircle, FaArrowLeft, FaFileAlt, FaImage, FaGraduationCap, FaChalkboardTeacher, FaCertificate, FaStar, FaPlay, FaAward, FaCalendarCheck, FaCrown, FaLayerGroup, FaExchangeAlt, FaUsers, FaTrophy } from 'react-icons/fa'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useLanguage } from '../all_login/LanguageContext'

const UserDashboard = () => {
  const { language } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [activeTab, setActiveTab] = useState('my-courses')

  const location = useLocation()
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab)
    }
  }, [location.state])
  const [courses, setCourses] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [allCoursesLoading, setAllCoursesLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseModules, setCourseModules] = useState(null)
  const [modulesLoading, setModulesLoading] = useState(false)
  const [completedModules, setCompletedModules] = useState([])
  const [activeAccordionKey, setActiveAccordionKey] = useState('0')
  const [error, setError] = useState(null)
  const [refundRequests, setRefundRequests] = useState([])

  const [currentExerciseModule, setCurrentExerciseModule] = useState(null)
  const [showExerciseView, setShowExerciseView] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)
  const [correctMatches, setCorrectMatches] = useState([])
  const [exerciseFeedback, setExerciseFeedback] = useState({ type: '', message: '' })
  const [shuffledTargets, setShuffledTargets] = useState({})

  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackCourse, setFeedbackCourse] = useState(null)
  const [feedbackData, setFeedbackData] = useState({
    question_1: '',
    question_2: '',
    question_3: '',
    question_4: '',
    question_5: '',
    comment: ''
  })
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackError, setFeedbackError] = useState(null)
  const [submittedFeedbackCourses, setSubmittedFeedbackCourses] = useState([])

  const [courseLanguage, setCourseLanguage] = useState('hindi')

  const navigate = useNavigate()
  const { uniqueId, accessToken, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
    }
  }, [isAuthenticated, navigate, location])

  useEffect(() => {
    if (location.state && location.state.testCompleted) {
      const { moduleIndex } = location.state
      fetchModuleProgress()
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

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

  const fetchCourses = async () => {
    if (!uniqueId || !accessToken) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await axios.get(
        `https://brjobsedu.com/epathshala/epathshala_backend/api/enrollment-unpaid/?student_id=${uniqueId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.data.success && Array.isArray(response.data.data)) {
        let coursesData = response.data.data
        
        try {
          const allCoursesResponse = await axios.get(
            'https://brjobsedu.com/epathshala/epathshala_backend/api/course-items/'
          )
          
          if (allCoursesResponse.data.success && Array.isArray(allCoursesResponse.data.data)) {
            coursesData = response.data.data.map(enrolledCourse => {
              const courseDetails = allCoursesResponse.data.data.find(
                c => c.course_id === enrolledCourse.course_id
              )
              return {
                ...enrolledCourse,
                start_date: courseDetails?.start_date || enrolledCourse.start_date || null,
                end_date: courseDetails?.end_date || enrolledCourse.end_date || null
              }
            })
          }
        } catch (courseError) {
          console.warn('Could not fetch course details for dates')
        }
        
        console.log('✅ Courses fetched successfully:', coursesData)
        setCourses(coursesData)
      } else {
        console.error('❌ Invalid response format:', response.data)
        setError(response.data.message || 'Failed to fetch courses')
        setCourses([])
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error)
      setError('Network error while fetching courses')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchRefundRequests = async () => {
    // Refund requests functionality removed
    setRefundRequests([])
  }

  const fetchAllCourses = async () => {
    console.log('🔄 Fetching all courses...')
    try {
      setAllCoursesLoading(true)
      const response = await axios.get(
        'https://brjobsedu.com/epathshala/epathshala_backend/api/course-items/'
      )
      console.log('📚 All courses API response:', response.data)
      
      if (response.data.success && Array.isArray(response.data.data)) {
        setAllCourses(response.data.data)
        console.log('✅ All courses set:', response.data.data)
      } else {
        console.warn('⚠️ Invalid response format for all courses:', response.data)
        setAllCourses([])
      }
    } catch (error) {
      console.error('❌ Error fetching all courses:', error)
      setAllCourses([])
    } finally {
      setAllCoursesLoading(false)
    }
  }

  const fetchFeedbackData = async () => {
    if (!uniqueId || !accessToken) {
      return
    }

    try {
      const response = await axios.get(
        `https://brjobsedu.com/epathshala/epathshala_backend/api/course-feedback/?student_id=${uniqueId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.data.success && Array.isArray(response.data.data)) {
        const submittedCourseIds = response.data.data.map(feedback => feedback.course_id)
        setSubmittedFeedbackCourses(submittedCourseIds)
      }
    } catch (error) {
      console.error('Error fetching feedback data:', error)
    }
  }

  useEffect(() => {
    console.log('📌 useEffect triggered, uniqueId:', uniqueId, 'accessToken:', !!accessToken)
    const fetchData = async () => {
      console.log('🔄 Starting data fetch for student:', uniqueId)
      await fetchCourses()
      await fetchModuleProgress()
      await fetchRefundRequests()
      await fetchAllCourses()
      await fetchFeedbackData()
      console.log('✅ Data fetch completed')
    }
    
    if (uniqueId && accessToken) {
      fetchData()
    } else {
      console.warn('⚠️ No uniqueId or accessToken, not fetching data')
    }
  }, [uniqueId, accessToken])

  const [userData, setUserData] = useState({
    full_name: 'Student'
  })

  const fetchCourseModules = async (courseId) => {
    try {
      setModulesLoading(true)
      setError(null)
      
      const response = await axios.get(
        `https://brjobsedu.com/epathshala/epathshala_backend/api/course-module/?course_id=${courseId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )
      
      if (response.data.success && response.data.data) {
        setCourseModules(response.data.data)
      } else {
        setError(response.data.message || 'Failed to fetch course modules')
        setCourseModules(null)
      }
    } catch (error) {
      setError('Network error while fetching modules')
      setCourseModules(null)
    } finally {
      setModulesLoading(false)
    }
  }

  const handleViewCourse = async (course) => {
    if (!course.course_id) {
      setError('Course ID not available')
      return
    }
    
    setSelectedCourse(course)
    setCourseModules(null)
    setCompletedModules([])
    setError(null)
    setActiveAccordionKey('0')
    await fetchCourseModules(course.course_id)
    await fetchModuleProgress()
  }

  const handleBackToCourses = () => {
    setSelectedCourse(null)
    setCourseModules(null)
    setCompletedModules([])
    setError(null)
    setActiveAccordionKey('0')
    setCourseLanguage('hindi')
  }

  const isModuleAccessible = (moduleIndex) => {
    if (!courseModules || !courseModules.modules || !selectedCourse) {
      return moduleIndex === 0
    }
    
    if (moduleIndex === 0) {
      return true
    }
    
    const previousModule = courseModules.modules[moduleIndex - 1]
    const previousModuleProgress = moduleProgress.find(
      progress => 
        progress.course_id === selectedCourse.course_id && 
        progress.module === previousModule.module_id
    )
    
    const isPreviousModuleTestPassed = previousModuleProgress?.test_status === 'passed'
    
    return isPreviousModuleTestPassed
  }

  const handleTestClick = (moduleIndex) => {
    if (!courseModules || !courseModules.modules || !selectedCourse) {
      return
    }
    
    const currentModule = courseModules.modules[moduleIndex]
    const isLastModule = moduleIndex === courseModules.modules.length - 1
    
    const moduleProgressData = moduleProgress.find(
      progress => 
        progress.course_id === selectedCourse.course_id && 
        progress.module_id === currentModule.module_id
    )
    
    const attemptCount = moduleProgressData?.attempt_count || 0
    
    navigate('/UserTest', {
      state: {
        course: selectedCourse,
        moduleIndex: moduleIndex,
        moduleId: currentModule.module_id,
        isLastModule: isLastModule,
        attemptCount: attemptCount
      }
    })
  }

  const areAllModulesCompleted = () => {
    if (!courseModules || !courseModules.modules) return false
    
    return courseModules.modules.every((module) => {
      const moduleProgressData = moduleProgress.find(
        progress => 
          progress.course_id === selectedCourse.course_id && 
          progress.module === module.module_id
      )
      
      const isTestPassed = moduleProgressData?.test_status === 'passed'
      
      return isTestPassed
    })
  }

  const isCertificateGenerated = () => {
    const course = courses.find(c => c.course_id === selectedCourse.course_id)
    return course && course.certificate_file
  }

  const generateCertificate = async (course) => {
    try {
      const endpoint = 'https://brjobsedu.com/epathshala/epathshala_backend/api/enrollment-unpaid/'
        
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
        const certificateFile = response.data.data?.certificate_file || response.data.certificate_file
        
        if (certificateFile) {
          await fetchCourses()
          alert('Certificate generated successfully!')
          window.open(
            `https://brjobsedu.com/epathshala/epathshala_backend${certificateFile}`,
            "_blank",
          );
        } else if (response.data.message && response.data.message.includes('already')) {
          await fetchCourses()
          alert(response.data.message || 'Certificate already exists!')
        } else {
          await fetchCourses()
          alert('Certificate generated successfully!')
        }
      } else {
        alert(response.data.message || 'Failed to generate certificate')
      }
    } catch (error) {
      console.error('Certificate generation error:', error)
      alert('Failed to generate certificate. Please try again.')
    }
  }

  const isAllModulesCompleted = (course) => {
    const courseModuleProgress = moduleProgress.filter(
      progress => progress.course_id === course.course_id
    )
    
    if (courseModuleProgress.length > 0) {
      const allModulesPassed = courseModuleProgress.every(progress => {
        return progress.test_status === 'passed'
      })
      if (allModulesPassed) return true
    }
    
    if (courseModules && courseModules.modules && selectedCourse?.course_id === course.course_id) {
      const allLocalModulesPassed = courseModules.modules.every((module) => {
        const moduleProgressData = moduleProgress.find(
          progress => 
            progress.course_id === course.course_id && 
            progress.module === module.module_id
        )
        const isTestPassed = moduleProgressData?.test_status === 'passed'
        return isTestPassed
      })
      if (allLocalModulesPassed) return true
    }
    
    if (course.is_completed) return true
    
    return false
  }

  const viewCertificate = () => {
    const course = courses.find(c => c.course_id === selectedCourse.course_id)
    if (course && course.certificate_file) {
      window.open(
        `https://brjobsedu.com/epathshala/epathshala_backend${course.certificate_file}`,
        "_blank",
      );
    }
  }

  const scrollToSubmodule = (submoduleIndex, moduleIndex) => {
    const elementId = `submodule-${moduleIndex}-${submoduleIndex}`
    const element = document.getElementById(elementId)
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      
      element.classList.add('highlight-submodule')
      setTimeout(() => {
        element.classList.remove('highlight-submodule')
      }, 2000)
    }
  }

  const [moduleProgress, setModuleProgress] = useState([])
  const [progressLoading, setProgressLoading] = useState(false)

  const fetchModuleProgress = async () => {
    try {
      setProgressLoading(true)
      
      const endpoint = `https://brjobsedu.com/epathshala/epathshala_backend/api/module-progress-unpaid/?student_id=${uniqueId}`
      
      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success && Array.isArray(response.data.data)) {
        setModuleProgress(response.data.data)
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setProgressLoading(false)
    }
  }

  const calculateTimeRemaining = (startDate, endDate) => {
    if (!startDate || !endDate) return null
    
    const now = new Date()
    const end = new Date(endDate)
    const start = new Date(startDate)
    
    if (now > end) {
      return { status: 'expired', text: 'Course Expired' }
    }
    
    if (now < start) {
      return { status: 'upcoming', text: 'Starts on ' + start.toLocaleDateString() }
    }
    
    const diffTime = end - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const months = Math.floor(diffDays / 30)
    const weeks = Math.floor((diffDays % 30) / 7)
    const days = diffDays % 7
    
    let timeText = ''
    if (months > 0) {
      timeText += `${months} month${months > 1 ? 's' : ''} `
    }
    if (weeks > 0) {
      timeText += `${weeks} week${weeks > 1 ? 's' : ''} `
    }
    if (days > 0 || (months === 0 && weeks === 0)) {
      timeText += `${days} day${days !== 1 ? 's' : ''}`
    }
    
    return { 
      status: 'active', 
      text: timeText.trim(),
      days: diffDays,
      months,
      weeks,
      daysLeft: days
    }
  }

  const isCourseExpired = (course) => {
    if (!course.start_date || !course.end_date) return false
    const time = calculateTimeRemaining(course.start_date, course.end_date)
    return time?.status === 'expired'
  }

  const handleOpenFeedbackModal = (course) => {
    setFeedbackCourse(course)
    setFeedbackData({
      question_1: '',
      question_2: '',
      question_3: '',
      question_4: '',
      question_5: '',
      comment: ''
    })
    setFeedbackError(null)
    setShowFeedbackModal(true)
  }

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false)
    setFeedbackCourse(null)
    setFeedbackData({
      question_1: '',
      question_2: '',
      question_3: '',
      question_4: '',
      question_5: '',
      comment: ''
    })
    setFeedbackError(null)
  }

  const handleFeedbackChange = (field, value) => {
    setFeedbackData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackCourse) return
    
    if (!feedbackData.question_1 || !feedbackData.question_2 || !feedbackData.question_3 || 
        !feedbackData.question_4 || !feedbackData.question_5) {
      setFeedbackError('Please answer all questions')
      return
    }
    
    try {
      setFeedbackSubmitting(true)
      setFeedbackError(null)
      
      const response = await axios.post(
        'https://brjobsedu.com/epathshala/epathshala_backend/api/course-feedback/',
        {
          course_id: feedbackCourse.course_id,
          student_id: uniqueId,
          full_name: userData?.full_name || 'Student',
          course_name: feedbackCourse.course_name,
          question_1: feedbackData.question_1,
          question_2: feedbackData.question_2,
          question_3: feedbackData.question_3,
          question_4: feedbackData.question_4,
          question_5: feedbackData.question_5,
          comment: feedbackData.comment
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.data.success) {
        alert('Thank you for your feedback!')
        setSubmittedFeedbackCourses(prev => [...prev, feedbackCourse.course_id])
        handleCloseFeedbackModal()
      } else {
        setFeedbackError(response.data.message || 'Failed to submit feedback')
      }
    } catch (error) {
      setFeedbackError('Failed to submit feedback. Please try again.')
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  const computeFirstIncompleteModule = () => {
    if (!courseModules || !courseModules.modules || courseModules.modules.length === 0) {
      return '0'
    }
    
    for (let i = 0; i < courseModules.modules.length; i++) {
      const module = courseModules.modules[i]
      
      const moduleProgressData = moduleProgress.find(
        progress => 
          progress.course_id === selectedCourse?.course_id && 
          progress.module === module.module_id
      )
      const isTestPassed = moduleProgressData?.test_status === 'passed'
      
      if (!isTestPassed) {
        return i.toString()
      }
    }
    
    return (courseModules.modules.length - 1).toString()
  }

  useEffect(() => {
    if (courseModules && selectedCourse && !modulesLoading) {
      const firstIncomplete = computeFirstIncompleteModule()
      setActiveAccordionKey(firstIncomplete)
    }
  }, [courseModules, completedModules, moduleProgress, selectedCourse, modulesLoading])

  const handleStartExercise = (module) => {
    setCurrentExerciseModule(module)
    setShowExerciseView(true)
    setCorrectMatches([])
    setExerciseFeedback({ type: '', message: '' })
  }

  const handleDragStart = (e, item) => {
    setDraggedItem(item)
    e.target.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 })
  const [touchDraggedItem, setTouchDraggedItem] = useState(null)

  const handleTouchStart = (e, item) => {
    setTouchDraggedItem(item)
    const touch = e.touches[0]
    setTouchPosition({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchMove = (e) => {
    if (!touchDraggedItem) return
    e.preventDefault()
    const touch = e.touches[0]
    setTouchPosition({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (e) => {
    if (!touchDraggedItem) return
    
    const touch = e.changedTouches[0]
    const target = document.elementFromPoint(touch.clientX, touch.clientY)
    
    const targetItem = target?.closest('.target-item')
    
    if (targetItem) {
      const targetName = targetItem.getAttribute('data-target')
      if (targetName) {
        handleDrop(e, targetName)
      }
    }
    
    setTouchDraggedItem(null)
    setTouchPosition({ x: 0, y: 0 })
  }

  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const handleDrop = (e, targetName) => {
    e.preventDefault()
    
    const itemToCheck = draggedItem || touchDraggedItem
    
    if (itemToCheck && itemToCheck.img_name === targetName) {
      setCorrectMatches(prev => [...prev, itemToCheck])
      setExerciseFeedback({
        type: 'success',
        message: `✓ Correct! "${itemToCheck.img_name}" matches.`
      })
    } else {
      setExerciseFeedback({
        type: 'error',
        message: `✗ Incorrect! "${itemToCheck?.img_name}" does not match "${targetName}"`
      })
    }

    setDraggedItem(null)
    setTouchDraggedItem(null)
    
    setTimeout(() => {
      setExerciseFeedback({ type: '', message: '' })
    }, 3000)
  }

  const markModuleComplete = async (moduleIndex) => {
    try {
      const currentModule = courseModules.modules[moduleIndex]
      
      const endpoint = `https://brjobsedu.com/epathshala/epathshala_backend/api/module-progress-unpaid/`
        
      const response = await axios.put(
        endpoint,
        {
          module_status: "ongoing",
          student_id: uniqueId,
          course_id: selectedCourse.course_id,
          module: currentModule.module_id
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        await fetchModuleProgress()
        alert('Module marked as in progress! Please take the test to complete this module.')
      }
    } catch (error) {
      alert('Failed to mark module as complete. Please try again.')
      setError('Failed to mark module as complete')
    }
  }

  const handleEnrollCourse = async (courseId) => {
    try {
      const response = await axios.post(
        'https://brjobsedu.com/epathshala/epathshala_backend/api/enroll-unpaid/',
        {
          student_id: uniqueId,
          course_id: courseId
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data && response.data.message) {
        alert(response.data.message)
        
        try {
          await fetchCourses()
        } catch (e) {
          console.error('Error fetching courses:', e)
        }
        
        setTimeout(() => {
          setActiveTab('my-courses')
        }, 800)
        
      } else {
        alert('Failed to enroll in course. Please try again.')
      }
    } catch (error) {
      console.error('Error enrolling in course:', error)
      alert('Failed to enroll in course. Please try again.')
    }
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

        <Container fluid className="dashboard-box mt-3 ">
          <Row>
            <Col xs={12}>
              <div className="mt-4">
                {error && (
                  <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}
                
                {selectedCourse ? (
                  <div>
                    <Button 
                      variant="outline-primary" 
                      onClick={handleBackToCourses}
                      className="mb-4 d-flex align-items-center back-btn"
                    >
                      <FaArrowLeft className="me-2" />
                      {language === 'hi' ? "पीछे" : "Back"}
                    </Button>
                    
                    <div className="d-flex justify-content-between align-items-center title-h mb-3">
                      <h4 className="mb-0">
                        <FaBook className="me-2 text-primary" />
                        {renderContentWithLineBreaks(selectedCourse.course_name)} - {language === 'hi' ? "मॉड्यूल्स" : "Modules"}
                      </h4>
                      
                      <div className="d-flex align-items-center gap-2">
                        <div className="btn-group" role="group" style={{ position: 'fixed', right: '20px', top: '12%', transform: 'translateY(-50%)', zIndex: 1050, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                          <Button 
                            variant={courseLanguage === 'hindi' ? 'dark' : 'outline-dark'}
                            size="sm"
                            onClick={() => setCourseLanguage('hindi')}
                            className="fw-semibold"
                            style={courseLanguage === 'hindi' ? { backgroundColor: 'black', borderColor: 'black', color: 'white' } : {}}
                          >
                            हिंदी
                          </Button>
                          <Button 
                            variant={courseLanguage === 'english' ? 'dark' : 'outline-dark'}
                            size="sm"
                            onClick={() => setCourseLanguage('english')}
                            className="fw-semibold"
                            style={courseLanguage === 'english' ? { backgroundColor: 'black', borderColor: 'black', color: 'white' } : {}}
                          >
                            English
                          </Button>
                        </div>

                        {isCertificateGenerated() ? (
                          <Button 
                            variant="success" 
                            onClick={viewCertificate}
                            className="d-flex align-items-center view-certificate-btn"
                          >
                            <FaCertificate className="me-2" />
                            {language === 'hi' ? "सर्टिफिकेट देखें" : "View Certificate"}
                          </Button>
                        ) : (
                          <Button 
                            variant="primary" 
                            onClick={async () => await generateCertificate(selectedCourse)}
                            disabled={!areAllModulesCompleted()}
                            className="d-flex align-items-center button-view"
                          >
                            <FaCertificate className="me-2" />
                            {language === 'hi' ? "सर्टिफिकेट प्राप्त करें" : "Generate Certificate"}
                          </Button>
                        )}
                      </div>
                    </div>

                    {areAllModulesCompleted() && (
                      <Alert variant="success" className="mb-4">
                        <FaCheckCircle className="me-2" />
                        <strong>{language === 'hi' ? "बधाई हो!" : "Congratulations!"}</strong> {language === 'hi' ? "आपने इस कोर्स के सभी मॉड्यूल्स पूरे कर लिए हैं।" : "You have completed all modules in this course."}
                        {isCertificateGenerated() ? (
                          <span className="ms-2">{language === 'hi' ? "आपका सर्टिफिकेट देखने के लिए तैयार है।" : "Your certificate is ready to view."}</span>
                        ) : (
                          <span className="ms-2">{language === 'hi' ? "सर्टिफिकेट प्राप्त करने के लिए 'सर्टिफिकेट प्राप्त करें' बटन पर क्लिक करें।" : "Click the \"Generate Certificate\" button to get your certificate."}</span>
                        )}
                      </Alert>
                    )}
                    
                    {modulesLoading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" style={{ width: '50px', height: '50px' }} />
                        <p className="mt-3">{language === 'hi' ? "मॉड्यूल्स लोड हो रहे हैं..." : "Loading modules..."}</p>
                      </div>
                    ) : courseModules && courseModules.modules ? (
                      <div>
                        <Accordion activeKey={activeAccordionKey} onSelect={(key) => setActiveAccordionKey(key)} className="course-accordion">
                          {courseModules.modules.map((module, moduleIndex) => {
                            const currentModule = courseModules.modules[moduleIndex]
                            const isAccessible = isModuleAccessible(moduleIndex)
                            const moduleProgressDataForDisplay = moduleProgress.find(
                              progress => 
                                progress.course_id === selectedCourse.course_id && 
                                progress.module === currentModule.module_id
                            )
                            const isTestPassed = moduleProgressDataForDisplay?.test_status === 'passed'
                            const isCompleted = isTestPassed
                            
                            const isOngoing = moduleProgress.some(
                              progress => 
                                progress.course_id === selectedCourse.course_id && 
                                progress.module === currentModule.module_id && 
                                progress.module_status === 'ongoing'
                            )

                            const moduleProgressData = moduleProgress.find(
                              progress => 
                                progress.course_id === selectedCourse.course_id && 
                                progress.module === currentModule.module_id
                            )

                            let isTestDisabled = false
                            let testButtonText = "Take Test"
                            let testButtonVariant = "primary"

                            if (moduleProgressData) {
                              if (moduleProgressData.test_status === 'passed') {
                                // Test is passed - module is completed
                              } else {
                                if (moduleProgressData.attempt_count >= 3) {
                                  if (moduleProgressData.locked_until) {
                                    const lockedUntil = new Date(moduleProgressData.locked_until)
                                    const currentTime = new Date()
                                    
                                    if (currentTime < lockedUntil) {
                                      isTestDisabled = true
                                      testButtonText = "Test Locked"
                                      testButtonVariant = "secondary"
                                    }
                                  } else {
                                    isTestDisabled = true
                                    testButtonText = "Test Locked"
                                    testButtonVariant = "secondary"
                                  }
                                } else {
                                  const attemptsLeft = 3 - moduleProgressData.attempt_count
                                  testButtonText = `Take Test (${attemptsLeft} attempts left)`
                                }
                              }
                            }

                            return (
                              <Accordion.Item
                                key={module.module_id}
                                eventKey={moduleIndex.toString()}
                                disabled={!isAccessible}
                                className={
                                  isTestPassed ? "completed-module" : ""
                                }
                              > 
                                <Accordion.Header className="fw-bold">
                                  <div className="d-flex align-items-center w-100">
                                    {isAccessible ? (
                                      isCompleted ? (
                                        <div className="module-icon me-1">
                                          <FaCertificate
                                            className="text-white"
                                            style={{ fontSize: "12px" }}
                                          />
                                        </div>
                                      ) : (
                                        <div className="module-icon me-1">
                                          <FaChalkboardTeacher
                                            className="text-white"
                                            style={{ fontSize: "12px" }}
                                          />
                                        </div>
                                      )
                                    ) : (
                                      <div className="module-icon me-1 opacity-50">
                                        <FaLock
                                          className="text-white"
                                          style={{ fontSize: "12px" }}
                                        />
                                      </div>
                                    )}
                                    <span
                                      className={
                                        !isAccessible
                                          ? "text-gray-300"
                                          : "text-white"
                                      }
                                    >
                                      {language === 'hi' ? "मॉड्यूल" : "Module"} {module.order}:{" "}
                                      {renderContentWithLineBreaks(
                                        courseLanguage === "english"
                                          ? module.mod_title
                                          : module.mod_title_hindi ||
                                              module.mod_title,
                                      )}
                                    </span>
                                    {!isAccessible && (
                                      <span className="ms-auto text-sm text-gray-300">
                                        {language === 'hi' ? "अनलॉक करने के लिए पिछला मॉड्यूल पूरा करें" : "Complete previous module to unlock"}
                                      </span>
                                    )}
                                  </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                  {/* <Row className="mb-4">
                                    <Col md={6}>
                                      <div className="p-3 bg-light rounded h-100">
                                        <h6
                                          className="mb-2 fw-semibold"
                                          style={{ fontSize: "12px" }}
                                        >
                                          <FaPlay className="me-1 text-primary" />{" "}
                                          {language === 'hi' ? "मॉड्यूल वीडियो" : "Module Video"}
                                        </h6>
                                        <div className="video-container">
                                          <iframe
                                            width="100%"
                                            height="315"
                                            src={(
                                              module.video_link ||
                                              "https://www.youtube.com/embed/dQw4w9WgXcQ"
                                            ).replace("watch?v=", "embed/")}
                                            title="Module Video"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          ></iframe>
                                        </div>
                                      </div>
                                    </Col>
                                     */}
                                    <Col md={12}>
                                      <div className="p-3 bg-light rounded h-100"> 
                                        <h6
                                          className="mb-2 fw-semibold"
                                          style={{ fontSize: "12px" }}
                                        >
                                          <FaLayerGroup className="me-1 text-primary" />{" "}
                                          {language === 'hi' ? "सब-मॉड्यूल्स" : "Submodules"}
                                        </h6>
                                        {module.sub_modules &&
                                        module.sub_modules.length > 0 ? (
                                          <div className="submodules-list">
                                            {module.sub_modules.map(
                                              (submod, subIndex) => (
                                                <div
                                                  key={submod.sub_module_id}
                                                  className="submodule-item p-2 mb-2 bg-white rounded border-left border-primary"
                                                  onClick={() =>
                                                    scrollToSubmodule(
                                                      subIndex,
                                                      moduleIndex,
                                                    )
                                                  }
                                                  style={{
                                                    cursor: "pointer",
                                                    transition: "all 0.3s ease",
                                                  }}
                                                  onMouseEnter={(e) =>
                                                    (e.currentTarget.style.boxShadow =
                                                      "0 4px 12px rgba(0,0,0,0.15)")
                                                  }
                                                  onMouseLeave={(e) =>
                                                    (e.currentTarget.style.boxShadow =
                                                      "none")
                                                  }
                                                >
                                                  <h6 className="mb-1 fw-semibold text-dark">
                                                    <span className="badge bg-primary me-2">
                                                      {subIndex + 1}
                                                    </span>
                                                    {renderContentWithLineBreaks(
                                                      courseLanguage ===
                                                        "english"
                                                        ? submod.sub_modu_title
                                                        : submod.sub_modu_title_hindi ||
                                                            submod.sub_modu_title,
                                                    )}
                                                  </h6>
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        ) : (
                                          <p className="text-muted text-center py-3 small">
                                            No submodules available
                                          </p>
                                        )}
                                      </div>
                                    </Col> 
                                  {/* </Row> */}

                                  {module.sub_modules &&
                                  module.sub_modules.length > 0 ? (
                                    <div className="sub-modules-container">
                                      {module.sub_modules.map(
                                        (subModule, subModuleIndex) => (
                                          <div
                                            key={subModule.sub_module_id}
                                            id={`submodule-${moduleIndex}-${subModuleIndex}`}
                                            className="book-card mb-4"
                                          >
                                            <div className="book-header d-flex align-items-center mb-3">
                                              <div className="book-icon me-3">
                                                {subModuleIndex % 3 === 0 ? (
                                                  <FaBook
                                                    className="text-primary"
                                                    style={{ fontSize: "24px" }}
                                                  />
                                                ) : subModuleIndex % 3 === 1 ? (
                                                  <FaChalkboardTeacher
                                                    className="text-primary"
                                                    style={{ fontSize: "24px" }}
                                                  />
                                                ) : (
                                                  <FaGraduationCap
                                                    className="text-primary"
                                                    style={{ fontSize: "24px" }}
                                                  />
                                                )}
                                              </div>
                                              <div className="book-title flex-grow-1">
                                                <h5 className="mb-1 fw-bold text-primary">
                                                  {language === 'hi' ? "सब-मॉड्यूल" : "Sub Module"} {subModule.order}:{" "}
                                                  {renderContentWithLineBreaks(
                                                    courseLanguage === "english"
                                                      ? subModule.sub_modu_title
                                                      : subModule.sub_modu_title_hindi ||
                                                          subModule.sub_modu_title,
                                                  )}
                                                </h5>
                                                {(courseLanguage === "english"
                                                  ? subModule.sub_modu_description
                                                  : subModule.sub_modu_description_hindi ||
                                                    subModule.sub_modu_description) && (
                                                  <p className="mb-0 small">
                                                    {renderContentWithLineBreaks(
                                                      courseLanguage ===
                                                        "english"
                                                        ? subModule.sub_modu_description
                                                        : subModule.sub_modu_description_hindi ||
                                                            subModule.sub_modu_description,
                                                    )}
                                                  </p>
                                                )}
                                              </div>
                                            </div>

                                            <Row className="g-4">
                                              {(() => {
                                                const hasImage =
                                                  subModule.image;
                                                let contentCol,
                                                  imageCol,
                                                  contentFirst;

                                                if (hasImage) {
                                                  contentCol = 8;
                                                  imageCol = 4;
                                                  contentFirst =
                                                    subModuleIndex % 2 === 0;
                                                } else {
                                                  contentCol = 12;
                                                  imageCol = 0;
                                                  contentFirst = true;
                                                }

                                                const contentElement = (
                                                  <Col lg={contentCol} md={12}>
                                                    <div className="content-wrapper">
                                                      {(
                                                        (courseLanguage ===
                                                        "english"
                                                          ? subModule.sub_mod
                                                          : subModule.sub_mod_hindi) ||
                                                        []
                                                      ).length > 0 ? (
                                                        <div className="content-section">
                                                          <div className="section-header d-flex align-items-center mb-2">
                                                            <FaFileAlt className="me-1 text-primary" />
                                                            <h6
                                                              className="mb-0 fw-semibold"
                                                              style={{
                                                                fontSize:
                                                                  "11px",
                                                              }}
                                                            >
                                                              {language === 'hi' ? "कोर्स कंटेंट" : "Course Content"}
                                                            </h6>
                                                          </div>
                                                          <div className="content-items">
                                                            {(courseLanguage ===
                                                            "english"
                                                              ? subModule.sub_mod
                                                              : subModule.sub_mod_hindi
                                                            ).map(
                                                              (
                                                                item,
                                                                itemIndex,
                                                              ) => (
                                                                <div
                                                                  key={
                                                                    itemIndex
                                                                  }
                                                                  className="content-item p-3 mb-3 bg-white rounded-3 shadow-sm border-l-4 border-primary"
                                                                >
                                                                  {Array.isArray(
                                                                    item,
                                                                  ) &&
                                                                  item.length ===
                                                                    2 ? (
                                                                    <div className="content-pair">
                                                                      {item[0].toLowerCase() ===
                                                                      "title" ? (
                                                                        <div className="content-title fw-bold text-dark mb-2">
                                                                          {renderContentWithLineBreaks(
                                                                            item[1],
                                                                          )}
                                                                        </div>
                                                                      ) : item[0].toLowerCase() ===
                                                                        "description" ? (
                                                                        <div className="content-description">
                                                                          {renderContentWithLineBreaks(
                                                                            item[1],
                                                                          )}
                                                                        </div>
                                                                      ) : (
                                                                        <div className="content-field">
                                                                          <span className="field-label fw-semibold text-primary me-2">
                                                                            {
                                                                              item[0]
                                                                            }
                                                                            :
                                                                          </span>
                                                                          <span className="field-value text-dark">
                                                                            {renderContentWithLineBreaks(
                                                                              item[1],
                                                                            )}
                                                                          </span>
                                                                        </div>
                                                                      )}
                                                                    </div>
                                                                  ) : typeof item ===
                                                                      "object" &&
                                                                    item !==
                                                                      null ? (
                                                                    <div className="content-object">
                                                                      {Object.entries(
                                                                        item,
                                                                      ).map(
                                                                        ([
                                                                          key,
                                                                          value,
                                                                        ]) => (
                                                                          <div
                                                                            key={
                                                                              key
                                                                            }
                                                                            className="content-entry mb-2"
                                                                          >
                                                                            {key.toLowerCase() ===
                                                                            "title" ? (
                                                                              <h6 className="content-title fw-bold text-dark mb-2">
                                                                                {renderContentWithLineBreaks(
                                                                                  value,
                                                                                )}
                                                                              </h6>
                                                                            ) : key.toLowerCase() ===
                                                                              "description" ? (
                                                                              <p className="content-description mb-0">
                                                                                {renderContentWithLineBreaks(
                                                                                  value,
                                                                                )}
                                                                              </p>
                                                                            ) : (
                                                                              <div className="content-field">
                                                                                <span className="field-label fw-semibold text-primary me-2">
                                                                                  {
                                                                                    key
                                                                                  }
                                                                                  :
                                                                                </span>
                                                                                <span className="field-value text-dark">
                                                                                  {renderContentWithLineBreaks(
                                                                                    value,
                                                                                  )}
                                                                                </span>
                                                                              </div>
                                                                            )}
                                                                          </div>
                                                                        ),
                                                                      )}
                                                                    </div>
                                                                  ) : (
                                                                    <div className="content-text text-dark">
                                                                      {renderContentWithLineBreaks(
                                                                        item,
                                                                      )}
                                                                    </div>
                                                                  )}
                                                                </div>
                                                              ),
                                                            )}
                                                          </div>
                                                        </div>
                                                      ) : (
                                                        <div className="no-content p-5 bg-gray-50 rounded-3 text-center">
                                                          <FaFileAlt
                                                            className="text-muted mb-3"
                                                            style={{
                                                              fontSize: "48px",
                                                            }}
                                                          />
                                                          <p className="text-muted mb-0">
                                                            {language === 'hi' ? "इस सब-मॉड्यूल के लिए कोई कंटेंट उपलब्ध नहीं है।" : "No content available for this sub-module."}
                                                          </p>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </Col>
                                                );

                                                const imageElement =
                                                  hasImage ? (
                                                    <Col lg={imageCol} md={12}>
                                                      <div className="image-wrapper">
                                                        <div className="book-image-container rounded-3 overflow-hidden shadow-lg">
                                                          <img
                                                            src={`https://brjobsedu.com/epathshala/epathshala_backend/${subModule.image}`}
                                                            alt={
                                                              subModule.sub_modu_title
                                                            }
                                                            className="book-image w-100 h-100"
                                                            style={{
                                                              objectFit:
                                                                "contain",
                                                              objectPosition:
                                                                "center",
                                                            }}
                                                            onError={(e) => {
                                                              e.target.onerror =
                                                                null;
                                                              e.target.src =
                                                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f8f9fa" width="400" height="300"/%3E%3Ctext fill="%236c757d" font-family="Arial" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Not Available%3C/text%3E%3C/svg%3E';
                                                            }}
                                                          />
                                                          <div className="image-overlay">
                                                            <div className="overlay-content">
                                                              <FaImage
                                                                className="text-white mb-2"
                                                                style={{
                                                                  fontSize:
                                                                    "32px",
                                                                }}
                                                              />
                                                              <p className="text-white mb-0 small">
                                                                {language === 'hi' ? "सब-मॉड्यूल" : "Sub Module"}{" "}
                                                                {
                                                                  subModule.order
                                                                }
                                                              </p>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </Col>
                                                  ) : null;

                                                return (
                                                  <Row
                                                    className={`align-items-center submodule-row ${contentFirst ? "" : "flex-row-reverse"}`}
                                                    key={
                                                      subModule.sub_module_id
                                                    }
                                                  >
                                                    {contentFirst ? (
                                                      <>
                                                        {contentElement}
                                                        {imageElement}
                                                      </>
                                                    ) : (
                                                      <>
                                                        {imageElement}
                                                        {contentElement}
                                                      </>
                                                    )}
                                                  </Row>
                                                );
                                              })()}
                                            </Row>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-center py-5">
                                      <FaFileAlt
                                        className="text-muted mb-3"
                                        style={{ fontSize: "48px" }}
                                      />
                                      <p className="text-muted">
                                        No sub-modules available for this
                                        module.
                                      </p>
                                    </div>
                                  )}

                                  {module.exercises &&
                                    module.exercises.length > 0 && (
                                      <div className="mt-4 exercise-section">
                                        <div className="bg-light p-3 rounded-3 border border-primary">
                                          <h6 className="fw-bold text-primary mb-3">
                                            <FaImage className="me-2" /> {language === 'hi' ? "मॉड्यूल अभ्यास: चित्रों को उनके नामों से मिलाएँ" : "Module Exercise: Match the Images to Their Names"}
                                          </h6>

                                          {exerciseFeedback.message && (
                                            <div
                                              className={`feedback ${exerciseFeedback.type} mb-3 p-2 rounded`}
                                            >
                                              {exerciseFeedback.message}
                                            </div>
                                          )}

                                          <div className="game-container">
                                            <div className="game-column images-column">
                                              <h6 className="mb-2 text-muted">
                                                {language === 'hi' ? "चित्र" : "Images"}
                                              </h6>
                                              {module.exercises.filter(
                                                (exercise) =>
                                                  !correctMatches.some(
                                                    (correct) =>
                                                      correct.img_name ===
                                                      exercise.img_name,
                                                  ),
                                              ).length === 0 ? (
                                                <div className="no-items text-center py-4">
                                                  <i className="bi bi-check-circle-fill text-success mb-2"></i>
                                                  <p className="mb-0 text-success">
                                                    {language === 'hi' ? "सभी अभ्यास पूरे हुए!" : "All exercises completed!"}
                                                  </p>
                                                  <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => {
                                                      setCorrectMatches([]);
                                                      setExerciseFeedback({
                                                        type: "",
                                                        message: "",
                                                      });
                                                    }}
                                                  >
                                                    {language === 'hi' ? "अभ्यास रीसेट करें" : "Reset Exercise"}
                                                  </Button>
                                                </div>
                                              ) : (
                                                <div className="items-grid images-grid">
                                                  {module.exercises
                                                    .filter(
                                                      (exercise) =>
                                                        !correctMatches.some(
                                                          (correct) =>
                                                            correct.img_name ===
                                                            exercise.img_name,
                                                        ),
                                                    )
                                                    .map((exercise, index) => (
                                                      <div
                                                        key={index}
                                                        className="draggable-item image-item p-2 bg-white rounded border"
                                                        draggable
                                                        onDragStart={(e) =>
                                                          handleDragStart(
                                                            e,
                                                            exercise,
                                                          )
                                                        }
                                                        onDragEnd={
                                                          handleDragEnd
                                                        }
                                                        onTouchStart={(e) =>
                                                          handleTouchStart(
                                                            e,
                                                            exercise,
                                                          )
                                                        }
                                                        onTouchMove={
                                                          handleTouchMove
                                                        }
                                                        onTouchEnd={
                                                          handleTouchEnd
                                                        }
                                                      >
                                                        <img
                                                          src={`https://brjobsedu.com/epathshala/epathshala_backend${exercise.img}`}
                                                          alt={
                                                            exercise.img_name
                                                          }
                                                          onError={(e) => {
                                                            e.target.style.display =
                                                              "none";
                                                            e.target.nextElementSibling.style.display =
                                                              "block";
                                                          }}
                                                        />
                                                        <div
                                                          className="no-image"
                                                          style={{
                                                            display: "none",
                                                          }}
                                                        >
                                                          No Image
                                                        </div>
                                                      </div>
                                                    ))}
                                                </div>
                                              )}
                                            </div>

                                            <div className="game-column targets-column">
                                              <h6 className="mb-2 text-muted">
                                                {language === 'hi' ? "नाम" : "Names"}
                                              </h6>
                                              <div className="items-grid targets-grid">
                                                {module.exercises.map(
                                                  (exercise, index) => {
                                                    const isMatched =
                                                      correctMatches.some(
                                                        (correct) =>
                                                          correct.img_name ===
                                                          exercise.img_name,
                                                      );

                                                    return (
                                                      <div
                                                        key={index}
                                                        className={`target-item p-3 bg-white rounded border ${isMatched ? "matched" : ""}`}
                                                        data-target={
                                                          exercise.img_name
                                                        }
                                                        onDragOver={
                                                          handleDragOver
                                                        }
                                                        onDrop={(e) =>
                                                          handleDrop(
                                                            e,
                                                            exercise.img_name,
                                                          )
                                                        }
                                                        onTouchEnd={
                                                          handleTouchEnd
                                                        }
                                                      >
                                                        {isMatched ? (
                                                          <div className="matched-content">
                                                            <i className="bi bi-check-circle text-success me-2"></i>
                                                            <span className="text-success">
                                                              {
                                                                exercise.img_name
                                                              }
                                                            </span>
                                                          </div>
                                                        ) : (
                                                          <span>
                                                            {exercise.img_name}
                                                          </span>
                                                        )}
                                                      </div>
                                                    );
                                                  },
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                  <div className="mt-4 d-flex justify-content-between align-items-center">
                                    <div>
                                      {isCompleted || isTestPassed ? (
                                        <div className="d-flex align-items-center text-success">
                                          <FaCheckCircle className="me-2" />
                                          <span className="fw-semibold">
                                            {language === 'hi' ? "मॉड्यूल पूरा हुआ" : "Module Completed"}
                                          </span>
                                          {isTestPassed &&
                                            moduleProgressData?.test_score !==
                                              null &&
                                            moduleProgressData?.test_score !==
                                              undefined && (
                                              <span className="ms-3 text-success">
                                                {language === 'hi' ? "स्कोर:" : "Score:"}{" "}
                                                {moduleProgressData.test_score}%
                                              </span>
                                            )}
                                        </div>
                                      ) : (
                                        !isCompleted && (
                                          <div className="d-flex align-items-center text-warning">
                                            <FaClock className="me-2" />
                                            <span className="fw-semibold">
                                              {language === 'hi' ? "मॉड्यूल प्रगति पर" : "Module In Progress"}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                    {isAccessible ? (
                                      <div className="d-flex gap-1">
                                        {isTestPassed ? null : !isCompleted &&
                                          !isOngoing ? (
                                          <>
                                            <Button
                                              variant="success"
                                              onClick={() =>
                                                markModuleComplete(moduleIndex)
                                              }
                                              className="d-flex align-items-center px-3 py-1"
                                              size="sm"
                                            >
                                              <FaCheckCircle className="me-2" />
                                              {language === 'hi' ? "पूरा करें" : "Complete"}
                                            </Button>
                                            <Button
                                              variant={testButtonVariant}
                                              onClick={() =>
                                                handleTestClick(moduleIndex)
                                              }
                                              className="d-flex align-items-center px-3 py-1"
                                              disabled={
                                                !isOngoing || isTestDisabled
                                              }
                                              size="sm"
                                            >
                                              <FaQuestionCircle className="me-2" />
                                              {language === 'hi' ? (testButtonText === "Take Test" ? "टेस्ट दें" : testButtonText) : testButtonText}
                                            </Button>
                                          </>
                                        ) : (
                                          <Button
                                            variant={testButtonVariant}
                                            onClick={() =>
                                              handleTestClick(moduleIndex)
                                            }
                                            className="d-flex align-items-center px-3 py-1"
                                            disabled={isTestDisabled}
                                            size="sm"
                                          >
                                            <FaCheckCircle className="me-2" />
                                            {language === 'hi' ? (testButtonText === "Take Test" ? "टेस्ट दें" : testButtonText) : testButtonText}
                                          </Button>
                                        )}
                                      </div>
                                    ) : (
                                      <Button
                                        variant="secondary"
                                        disabled
                                        className="d-flex align-items-center px-3 py-1"
                                        size="sm"
                                      >
                                        <FaLock className="me-2" />
                                        {language === 'hi' ? "लॉक है" : "Locked"}
                                      </Button>
                                    )}
                                  </div>
                                </Accordion.Body>
                              </Accordion.Item>
                            );
                          })}
                        </Accordion>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <FaBook className="text-muted mb-3" style={{ fontSize: '48px' }} />
                        <p className="text-muted fs-4">{language === 'hi' ? "इस कोर्स के लिए कोई मॉड्यूल उपलब्ध नहीं है" : "No modules available for this course"}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="d-flex gap-2 mb-4" style={{ borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>
                      <Button 
                        variant={activeTab === 'my-courses' ? 'primary' : 'outline-primary'}
                        onClick={() => setActiveTab('my-courses')}
                        className="fw-semibold my-courses-btn"
                      >
                        <FaBook className="me-2" />
                        {language === 'hi' ? "मेरे कोर्सेज" : "My Courses"}
                        ({courses.length})
                      </Button>
                      <Button 
                        variant={activeTab === 'all-courses' ? 'primary' : 'outline-primary'}
                        onClick={() => setActiveTab('all-courses')}
                        className="fw-semibold my-courses-btn"
                      >
                        <FaGraduationCap className="me-2" />
                        {language === 'hi' ? "सभी कोर्सेज" : "All Courses"}
                        ({allCourses.filter(c => !isCourseExpired(c)).length})
                      </Button>
                    </div>

                    {activeTab === 'my-courses' && (
                      <div className='my-courses-btn'>
                        <h4 className="mb-3">{language === 'hi' ? "मेरे कोर्सेज" : "My Courses"}</h4>
                        
                        {loading ? (
                          <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" style={{ width: '60px', height: '60px' }} />
                            <p className="mt-3">Loading...</p>
                          </div>
                        ) : courses.length > 0 ? (
                          <Row>
                            {courses
                              .slice()
                              .sort((a, b) => {
                                const aCompleted = isAllModulesCompleted(a);
                                const bCompleted = isAllModulesCompleted(b);
                                if (aCompleted && !bCompleted) return 1;
                                if (!aCompleted && bCompleted) return -1;
                                return 0;
                              })
                              .map((course, index) => (
                                <Col md={isAllModulesCompleted(course) ? 12 : 6} lg={4} key={course.id || index} className="mb-4">
                                  <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                    <div className="card-header-gradient" style={{ 
                                      height: '100%', 
                                      width: '100%',
                                      padding: '0',
                                      border: 'none',
                                      padding: '8px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      position: 'relative',
                                      background: isAllModulesCompleted(course) 
                                        ? 'linear-gradient(135deg, #10b981, #059669)'
                                        : 'linear-gradient(135deg, rgb(94 117 223), rgb(230, 101, 10))'
                                    }}>
                                      {isAllModulesCompleted(course) ? (
                                        <FaCertificate className="text-white" style={{ fontSize: '28px', animation: 'pulse 2s infinite' }} />
                                      ) : (
                                        <FaGraduationCap className="text-white" style={{ fontSize: '28px', animation: 'float 3s ease-in-out infinite' }} />
                                      )}
                                      {isAllModulesCompleted(course) && (
                                        <div className="top-2 end-2">
                                          <Badge bg="success" className="p-2 badge-custom fs-7">
                                            <FaCheckCircle className="me-1" /> {language === 'hi' ? "पूरा हुआ" : "Completed"}
                                          </Badge>
                                        </div>
                                      )}
                                      {!isAllModulesCompleted(course) && (
                                        <div className="position-absolute top-2 start-2">
                                          <Badge bg="warning" className="p-2 badge-custom in-prohrace fs-7">
                                            <FaClock className="me-1" /> {language === 'hi' ? "प्रगति पर" : "In Progress"}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                    <Card.Body>
                                      <div className="text-center mb-2">
                                        <h6 className="mb-1 course-title">{renderContentWithLineBreaks(course.course_name)}</h6>
                                      </div>
                                      
                                      <div className="course-stats mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                          <span className="text-muted small">
                                            <FaCalendarCheck className="me-1" /> {language === 'hi' ? "नामांकित" : "Enrolled"}
                                          </span>
                                          <span className="fw-semibold">
                                            {course.enrolled_at ? new Date(course.enrolled_at).toLocaleDateString() : 'N/A'}
                                          </span>
                                        </div>
                                        {(course.start_date || course.end_date) && (
                                          <div className="d-flex flex-column">
                                            <div className="d-flex justify-content-between align-items-center mb-1 date-style">
                                              <span className="text-muted small">
                                                <FaCalendarCheck className="me-1" /> {language === 'hi' ? "प्रारंभ तिथि" : "Start Date"}
                                              </span>
                                              <span className="fw-semibold">
                                                {course.start_date ? new Date(course.start_date).toLocaleDateString() : 'N/A'}
                                              </span>
                                            </div>
                                            {course.end_date && (
                                              <div className="d-flex justify-content-between align-items-center">
                                                <span className="text-muted small">
                                                  <FaClock className="me-1" /> {language === 'hi' ? "अंतिम तिथि" : "End Date"}
                                                </span>
                                                <span className="fw-semibold">
                                                  {new Date(course.end_date).toLocaleDateString()}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        {isAllModulesCompleted(course) && course.completed_at && (
                                          <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-muted small">
                                              <FaAward className="me-1" /> {language === 'hi' ? "पूरा हुआ" : "Completed"}
                                            </span>
                                            <span className="fw-semibold text-success">
                                              {new Date(course.completed_at).toLocaleDateString()}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                          
                                          <div className='student-name'>
                                            <p className="mb-0 fw-semibold">{course.student_name || 'Student'}</p>
                                            <small className="text-muted">{language === 'hi' ? "शिक्षार्थी" : "Learners"}</small>
                                          </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                          {isCourseExpired(course) ? (
                                            (() => {
                                              if (course.certificate_file) {
                                                return (
                                                  <Button 
                                                    variant="success" 
                                                    onClick={() => {
                                                      window.open(
                                                        `https://brjobsedu.com/epathshala/epathshala_backend${course.certificate_file}`,
                                                        "_blank",
                                                      );
                                                    }}
                                                    className="d-flex align-items-center btn-custom"
                                                    style={{
                                                      background: 'linear-gradient(135deg, #10b981, #059669)',
                                                      border: 'none'
                                                    }}
                                                  >
                                                    <FaCertificate className="me-2" />
                                                    {language === 'hi' ? "सर्टिफिकेट देखें" : "View Certificate"}
                                                  </Button>
                                                )
                                              } else {
                                                return (
                                                  <Button 
                                                    variant="success" 
                                                    onClick={async () => {
                                                      await generateCertificate(course)
                                                    }}
                                                    className="d-flex align-items-center btn-custom"
                                                    style={{
                                                      background: 'linear-gradient(135deg, #10b981, #059669)',
                                                      border: 'none'
                                                    }}
                                                  >
                                                    <FaCertificate className="me-2" />
                                                    {language === 'hi' ? "सर्टिफिकेट प्राप्त करें" : "Generate Certificate"}
                                                  </Button>
                                                )
                                              }
                                            })()
                                          ) : course.certificate_file ? (
                                            <Button 
                                              variant="success" 
                                              onClick={() => {
                                                window.open(
                                                  `https://brjobsedu.com/epathshala/epathshala_backend${course.certificate_file}`,
                                                  "_blank",
                                                );
                                              }}
                                              className="d-flex align-items-center btn-custom"
                                              style={{
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                border: 'none'
                                              }}
                                            >
                                              <FaCertificate className="me-2" />
                                              {language === 'hi' ? "सर्टिफिकेट देखें" : "View Certificate"}
                                            </Button>
                                          ) : isAllModulesCompleted(course) ? (
                                            <Button 
                                              variant="success" 
                                              onClick={async () => {
                                                await generateCertificate(course)
                                              }}
                                              className="d-flex align-items-center btn-custom"
                                              style={{
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                border: 'none'
                                              }}
                                            >
                                              <FaCertificate className="me-2" />
                                              {language === 'hi' ? "सर्टिफिकेट प्राप्त करें" : "Generate Certificate"}
                                            </Button>
                                          ) : (
                                            <Button 
                                              variant={isAllModulesCompleted(course) ? "success" : "primary"} 
                                              onClick={() => handleViewCourse(course)}
                                              className="d-flex align-items-center btn-custom "
                                              style={{
                                             background: 'linear-gradient(135deg, rgb(94 117 223), #e6650a)',
                                                border: 'none'
                                              }}
                                            >
                                              {isAllModulesCompleted(course) ? (
                                                <>
                                                  <FaCheckCircle className="me-2" />
                                                  {language === 'hi' ? "पूरा हुआ" : "Completed"}
                                                </>
                                              ) : (
                                                <>
                                                  <FaPlay className="me-2" />
                                                  {language === 'hi' ? "शुरू करें" : "Start"}
                                                </>
                                              )}
                                            </Button>
                                          )}
                                          {isAllModulesCompleted(course) && (
                                            <Button 
                                              variant={submittedFeedbackCourses.includes(course.course_id) ? "outline-success" : "outline-primary"} 
                                              onClick={() => handleOpenFeedbackModal(course)}
                                              className="d-flex align-items-center feedback-submitted-btn"
                                              disabled={submittedFeedbackCourses.includes(course.course_id)}
                                            >
                                              {submittedFeedbackCourses.includes(course.course_id) ? (
                                                <>{language === 'hi' ? "फीडबैक सबमिट किया गया" : "Feedback Submitted"}</>
                                              ) : (
                                                <>
                                                  <FaStar className="me-2" />
                                                  {language === 'hi' ? "फीडबैक" : "Feedback"}
                                                </>
                                              )}
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              ))}
                          </Row>
                        ) : (
                          <div className="text-center py-5">
                            <FaBook className="text-muted mb-3" style={{ fontSize: '48px' }} />
                            <p className="text-muted fs-4">{language === 'hi' ? "अभी तक कोई कोर्स नामांकित नहीं है" : "No courses enrolled yet"}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'all-courses' && (
                      <div className='my-courses-btn'>
                        <h4 className="mb-3">{language === 'hi' ? "सभी कोर्सेज" : "All Courses"}</h4>
                        
                        {allCoursesLoading ? (
                          <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" style={{ width: '60px', height: '60px' }} />
                            <p className="mt-3">Loading...</p>
                          </div>
                        ) : allCourses.filter(c => !isCourseExpired(c)).length > 0 ? (
                          <Row>
                            {allCourses
                              .filter(c => !isCourseExpired(c))
                              .slice()
                              .sort((a, b) => {
                                const aEnrolled = courses.some(ec => ec.course_id === a.course_id);
                                const bEnrolled = courses.some(ec => ec.course_id === b.course_id);
                                const aCompleted = aEnrolled && isAllModulesCompleted(courses.find(ec => ec.course_id === a.course_id));
                                const bCompleted = bEnrolled && isAllModulesCompleted(courses.find(ec => ec.course_id === b.course_id));
                                if (aCompleted && !bCompleted) return 1;
                                if (!aCompleted && bCompleted) return -1;
                                return 0;
                              })
                              .map((course, index) => {
                                const isEnrolled = courses.some(ec => ec.course_id === course.course_id)
                                const enrolledCourse = courses.find(ec => ec.course_id === course.course_id)
                                const isCompleted = enrolledCourse && isAllModulesCompleted(enrolledCourse)
                                return (
                                  <Col md={isCompleted ? 12 : 6} lg={4} key={course.id || index} className="mb-4">
                                    <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                      <div className="card-header-gradient" style={{ 
                                        height: '150px', 
                                        width: '100%',
                                        padding: '0',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        background: isEnrolled 
                                          ? 'linear-gradient(135deg, #10b981, #059669)'
                                          : 'linear-gradient(135deg, rgb(94 117 223), #e6650a)'
                                      }}>
                                        {isEnrolled ? (
                                          <div className="text-center all-ready">
                                            <FaCheckCircle className="text-white" style={{ fontSize: '40px', marginBottom: '8px' }} />
                                            <p className="text-white fw-bold mb-0">{isCompleted ? (language === 'hi' ? 'पूरा हुआ' : 'Completed') : (language === 'hi' ? 'पहले से नामांकित' : 'Already Enrolled')}</p>
                                          </div>
                                        ) : (
                                          <FaBook className="text-white" style={{ fontSize: '48px' }} />
                                        )}
                                      </div>
                                      <Card.Body>
                                        <div className="mb-3">
                                          <h6 className="mb-2 course-title">{renderContentWithLineBreaks(course.course_name)}</h6>
                                        </div>
                                        
                                        {(course.start_date || course.end_date) && (
                                          <div className="mb-2 p-2 bg-light rounded d-flex flex-column date-style">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                              <span className="text-muted small">
                                                <FaCalendarCheck className="me-1" /> {language === 'hi' ? "प्रारंभ तिथि" : "Start Date"}
                                              </span>
                                              <span className="fw-semibold">
                                                {course.start_date ? new Date(course.start_date).toLocaleDateString() : 'N/A'}
                                              </span>
                                            </div>
                                            {course.end_date && (
                                              <div className="d-flex justify-content-between align-items-center">
                                                <span className="text-muted small">
                                                  <FaClock className="me-1" /> {language === 'hi' ? "अंतिम तिथि" : "End Date"}
                                                </span>
                                                <span className="fw-semibold">
                                                  {new Date(course.end_date).toLocaleDateString()}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        
                                        {course.course_description && (
                                          <p className="text-muted small mb-3">{course.course_description.substring(0, 100)}...</p>
                                        )}
                                        
                                        <div className="d-flex gap-2 mt-3">
                                          {isEnrolled ? (
                                            isCourseExpired(course) ? (
                                              (() => {
                                                const foundEnrolledCourse = courses.find(ec => ec.course_id === course.course_id)
                                                if (foundEnrolledCourse && foundEnrolledCourse.certificate_file) {
                                                  return (
                                                    <Button 
                                                      variant="success" 
                                                      onClick={() => {
                                                        window.open(
                                                          `https://brjobsedu.com/epathshala/epathshala_backend${foundEnrolledCourse.certificate_file}`,
                                                          "_blank",
                                                        );
                                                      }}
                                                      className="w-100 d-flex align-items-center justify-content-center"
                                                      style={{
                                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                                        border: 'none'
                                                      }}
                                                    >
                                                      <FaCertificate className="me-2" />
                                                      {language === 'hi' ? "सर्टिफिकेट देखें" : "View Certificate"}
                                                    </Button>
                                                  )
                                                } else {
                                                  return (
                                                    <Button 
                                                      variant="success" 
                                                      onClick={async () => {
                                                        await generateCertificate(foundEnrolledCourse)
                                                      }}
                                                      className="w-100 d-flex align-items-center justify-content-center"
                                                      style={{
                                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                                        border: 'none'
                                                      }}
                                                    >
                                                      <FaCertificate className="me-2" />
                                                    {language === 'hi' ? "सर्टिफिकेट प्राप्त करें" : "Generate Certificate"}
                                                    </Button>
                                                  )
                                                }
                                              })()
                                            ) : (
                                              <Button 
                                                variant={isCompleted ? "success" : "primary"} 
                                                onClick={() => handleViewCourse(enrolledCourse)}
                                                className="w-100 d-flex align-items-center justify-content-center"
                                                style={{
                                                  background: isCompleted 
                                                    ? 'linear-gradient(135deg, #10b981, #059669)'
                                                    : 'linear-gradient(135deg, rgb(94 117 223), rgb(230, 101, 10));',
                                                  border: 'none'
                                                }}
                                              >
                                                <FaPlay className="me-2" />
                                                {isCompleted ? (language === 'hi' ? 'पूरा हुआ' : 'Completed') : (language === 'hi' ? 'सीखना जारी रखें' : 'Continue Learning')}
                                              </Button>
                                            )
                                          ) : (
                                            <Button 
                                              variant="primary" 
                                              onClick={() => handleEnrollCourse(course.course_id)}
                                              className="w-100 d-flex align-items-center justify-content-center"
                                            >
                                              <FaCheckCircle className="me-2" />
                                              {language === 'hi' ? "अभी नामांकन करें" : "Enroll Now"}
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
                          <div className="text-center py-5">
                            <FaGraduationCap className="text-muted mb-3" style={{ fontSize: '48px' }} />
                            <p className="text-muted fs-4">{language === 'hi' ? "कोई कोर्स उपलब्ध नहीं है" : "No courses available"}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {showExerciseView && renderExerciseView()}
      
      {showFeedbackModal && feedbackCourse && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, rgb(94 117 223), rgb(230, 101, 10));', border: 'none' }}>
                <h5 className="modal-title text-white">
                  <FaStar className="me-2" />
                  {language === 'hi' ? "कोर्स फीडबैक" : "Course Feedback"}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={handleCloseFeedbackModal}
                  disabled={feedbackSubmitting}
                ></button>
              </div>
              <div className="modal-body p-4">
                {feedbackError && (
                  <Alert variant="danger" className="mb-3">
                    {feedbackError}
                  </Alert>
                )}
                
                <div className="mb-4">
                  <h6 className="fw-bold text-primary mb-3">
                    {language === 'hi' ? "कोर्स:" : "Course:"} {feedbackCourse.course_name}
                  </h6>
                  {submittedFeedbackCourses.includes(feedbackCourse.course_id) ? (
                    <Alert variant="success" className="mb-3">
                      <FaCheckCircle className="me-2" />
                      <strong>{language === 'hi' ? "पहले ही सबमिट किया जा चुका है" : "Already Submitted"}</strong> {language === 'hi' ? "आपने इस कोर्स के लिए फीडबैक पहले ही सबमिट कर दिया है" : "You have already submitted feedback for this course"}
                    </Alert>
                  ) : (
                    <p className="text-muted small">{language === 'hi' ? "कृपया इस कोर्स के साथ अपने अनुभव को आंकें।" : "Please rate your experience with this course."}</p>
                  )}
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">{language === 'hi' ? "कोर्स की समग्र गुणवत्ता को आप कैसे आंकेंगे?" : "How would you rate the overall quality of the course?"}</label>
                  <div className="star-rating d-flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        size={28}
                        className="cursor-pointer"
                        style={{
                          color: feedbackData.question_1 && parseInt(feedbackData.question_1) >= star ? '#28a745' : '#ccc',
                          cursor: feedbackSubmitting ? 'not-allowed' : 'pointer',
                          transition: 'color 0.2s ease'
                        }}
                        onClick={() => {
                          if (!feedbackSubmitting) {
                            handleFeedbackChange('question_1', star.toString())
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">{language === 'hi' ? "कोर्स कंटेंट में स्पष्टीकरण कितने स्पष्ट थे?" : "How clear were the explanations in the course content?"}</label>
                  <div className="star-rating d-flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        size={28}
                        className="cursor-pointer"
                        style={{
                          color: feedbackData.question_2 && parseInt(feedbackData.question_2) >= star ? '#28a745' : '#ccc',
                          cursor: feedbackSubmitting ? 'not-allowed' : 'pointer',
                          transition: 'color 0.2s ease'
                        }}
                        onClick={() => {
                          if (!feedbackSubmitting) {
                            handleFeedbackChange('question_2', star.toString())
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">{language === 'hi' ? "कोर्स सामग्री आपके सीखने के लक्ष्यों के लिए कितनी प्रासंगिक थी?" : "How relevant was the course material to your learning goals?"}</label>
                  <div className="star-rating d-flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        size={28}
                        className="cursor-pointer"
                        style={{
                          color: feedbackData.question_3 && parseInt(feedbackData.question_3) >= star ? '#28a745' : '#ccc',
                          cursor: feedbackSubmitting ? 'not-allowed' : 'pointer',
                          transition: 'color 0.2s ease'
                        }}
                        onClick={() => {
                          if (!feedbackSubmitting) {
                            handleFeedbackChange('question_3', star.toString())
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">{language === 'hi' ? "कोर्स वीडियो और अभ्यास आपको कितने आकर्षक लगे?" : "How engaging did you find the course videos and exercises?"}</label>
                  <div className="star-rating d-flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        size={28}
                        className="cursor-pointer"
                        style={{
                          color: feedbackData.question_4 && parseInt(feedbackData.question_4) >= star ? '#28a745' : '#ccc',
                          cursor: feedbackSubmitting ? 'not-allowed' : 'pointer',
                          transition: 'color 0.2s ease'
                        }}
                        onClick={() => {
                          if (!feedbackSubmitting) {
                            handleFeedbackChange('question_4', star.toString())
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">{language === 'hi' ? "आप दूसरों को इस कोर्स की सिफारिश करने की कितनी संभावना रखते हैं?" : "How likely are you to recommend this course to others?"}</label>
                  <div className="star-rating d-flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        size={28}
                        className="cursor-pointer"
                        style={{
                          color: feedbackData.question_5 && parseInt(feedbackData.question_5) >= star ? '#28a745' : '#ccc',
                          cursor: feedbackSubmitting ? 'not-allowed' : 'pointer',
                          transition: 'color 0.2s ease'
                        }}
                        onClick={() => {
                          if (!feedbackSubmitting) {
                            handleFeedbackChange('question_5', star.toString())
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">{language === 'hi' ? "अतिरिक्त टिप्पणियाँ" : "Additional Comments"}</label>
                  <textarea 
                    className="form-control" 
                    rows="4"
                    placeholder={language === 'hi' ? "कोर्स के बारे में अपने विचार साझा करें..." : "Share your thoughts about the course..."}
                    value={feedbackData.comment}
                    onChange={(e) => handleFeedbackChange('comment', e.target.value)}
                    disabled={feedbackSubmitting}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #e0e0e0' }}>
                <Button 
                  variant="secondary" 
                  onClick={handleCloseFeedbackModal}
                  disabled={feedbackSubmitting}
                >
                  {language === 'hi' ? "रद्द करें" : "Cancel"}
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleSubmitFeedback}
                  disabled={feedbackSubmitting || submittedFeedbackCourses.includes(feedbackCourse.course_id)}
                  style={{
                    background: 'linear-gradient(135deg, rgb(94 117 223), rgb(230, 101, 10))',
                    border: 'none'
                  }}
                >
                  {feedbackSubmitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      {language === 'hi' ? "सबमिट हो रहा है..." : "Submitting..."}
                    </>
                  ) : submittedFeedbackCourses.includes(feedbackCourse.course_id) ? (
                    <>
                      <FaCheckCircle className="me-2" />
                      {language === 'hi' ? "पहले ही सबमिट किया जा चुका है" : "Already Submitted"}
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="me-2" />
                      {language === 'hi' ? "फीडबैक सबमिट करें" : "Submit Feedback"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  function renderExerciseView() {
    if (!currentExerciseModule) return null

    const remainingExercises = currentExerciseModule.exercises.filter(exercise => 
      !correctMatches.some(correct => correct.img_name === exercise.img_name)
    )

    return (
      <div className="exercise-view fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4 page-header">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowExerciseView(false)}
          >
            <FaArrowLeft /> Back to Module
          </Button>
          <h4 className="mb-0">{language === 'hi' ? "अभ्यास: चित्रों को उनके नामों से मिलाएँ" : "Exercise: Match the Images to Their Names"}</h4>
        </div>

        {exerciseFeedback.message && (
          <div className={`feedback ${exerciseFeedback.type}`}>
            {exerciseFeedback.message}
          </div>
        )}

        <div className="game-container">
          <div className="game-column images-column">
            <h3>{language === 'hi' ? "चित्र" : "Images"}</h3>
            {remainingExercises.length === 0 ? (
              <div className="no-items">
                <i className="bi bi-check-circle-fill"></i>
                <p>{language === 'hi' ? "सभी अभ्यास पूरे हुए!" : "All exercises completed!"}</p>
                <Button
                  className="reset-button"
                  onClick={() => {
                    setCorrectMatches([]);
                    setExerciseFeedback({ type: "", message: "" });
                  }}
                >
                  {language === 'hi' ? "अभ्यास रीसेट करें" : "Reset Exercise"}
                </Button>
              </div>
            ) : (
              <div className="items-grid images-grid">
                {remainingExercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="draggable-item image-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, exercise)}
                    onDragEnd={handleDragEnd}
                    onTouchStart={(e) => handleTouchStart(e, exercise)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <img
                      src={`https://brjobsedu.com/epathshala/epathshala_backend${exercise.img}`}
                      alt={exercise.img_name}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "block";
                      }}
                    />
                    <div className="no-image" style={{ display: "none" }}>
                      {language === 'hi' ? "चित्र नहीं है" : "No Image"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="game-column targets-column">
            <h3>{language === 'hi' ? "नाम" : "Names"}</h3>
            <div className="items-grid targets-grid">
              {currentExerciseModule.exercises.map((exercise, index) => {
                const isMatched = correctMatches.some(
                  (correct) => correct.img_name === exercise.img_name,
                );

                return (
                  <div
                    key={index}
                    className={`target-item ${isMatched ? "matched" : ""}`}
                    data-target={exercise.img_name}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, exercise.img_name)}
                    onTouchEnd={handleTouchEnd}
                  >
                    {isMatched ? (
                      <div className="matched-content">
                        <i className="bi bi-check-circle"></i>
                        <span>{exercise.img_name}</span>
                      </div>
                    ) : (
                      <span>{exercise.img_name}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default UserDashboard