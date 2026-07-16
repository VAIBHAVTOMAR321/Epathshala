import React, { useState, useEffect, useRef } from 'react'
import { 
  Container, Row, Col, Card, Spinner, Button, Modal, Form, 
  Accordion, Badge, InputGroup, FormControl, Image, Nav, Tab, Table 
} from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminHeader from './AdminHeader'
// import EventsManagement from './EventsManagement'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../../assets/css/AdminDashboard.css'
import { renderContentWithLineBreaks } from '../../utils/contentRenderer'
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import {
  FaPlus, FaArrowLeft, FaBook, FaUsers, FaLayerGroup,
  FaTrash, FaImage, FaList, FaEye, FaEdit, FaComments, FaQuestionCircle, FaBell, FaCalendarAlt, FaFilePdf, FaFileExcel, FaFilter, FaChartBar,
  FaCheckCircle, FaClock, FaChartPie, FaSchool, FaBuilding, FaLightbulb, FaExclamationTriangle, FaChartLine, FaTrophy, FaInfoCircle, FaCalculator
} from 'react-icons/fa'
import { useAuth } from '../all_login/AuthContext'


const DashBord = () => {
  const navigate = useNavigate()
  const isMounted = useRef(true)
  
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  
  const { accessToken } = useAuth()
  const authToken = accessToken

  // Analytics helper function
  const getEnrollmentAnalytics = (enrollments) => {
    if (!enrollments || enrollments.length === 0) return null

    // Count unique students
    const uniqueStudents = new Set(enrollments.filter(e => e.student_id).map(e => e.student_id)).size
    const total = enrollments.length
    const completed = enrollments.filter(e => e.is_completed).length
    const ongoing = total - completed

    // Class distribution - count UNIQUE students per class
    const classStudents = {}
    enrollments.forEach(e => {
      const cls = String(e.class_name || 'Unknown')
      if (!classStudents[cls]) classStudents[cls] = new Set()
      if (e.student_id) classStudents[cls].add(e.student_id)
    })
    const classDist = Object.entries(classStudents)
      .map(([cls, studentSet]) => [cls, studentSet.size])
      .sort(([,a], [,b]) => b - a)
      .map(([cls, count]) => [cls, count])

    // School distribution (top 10) - count UNIQUE students per school
    const schoolStudents = {}
    enrollments.forEach(e => {
      const school = e.school_name || 'Unknown'
      if (!schoolStudents[school]) schoolStudents[school] = new Set()
      if (e.student_id) schoolStudents[school].add(e.student_id)
    })
    const schoolDist = Object.entries(schoolStudents)
      .map(([school, studentSet]) => [school, studentSet.size])
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([school, count]) => [school, count])

    return { total, uniqueStudents, completed, ongoing, classDist, schoolDist }
  }

// State for Data
    const [unpaidEnrollmentCount, setUnpaidEnrollmentCount] = useState(0)
    const [unpaidEnrollments, setUnpaidEnrollments] = useState([])
    const [courses, setCourses] = useState([])
    const [courseType, setCourseType] = useState('unpaid') // 'paid' or 'unpaid'
    const [loading, setLoading] = useState(true)
  
  // State for Views
  const [currentView, setCurrentView] = useState('dashboard')
  
   // State for Course Detail Modal
   const [selectedCourse, setSelectedCourse] = useState(null)
   const [showModal, setShowModal] = useState(false)

   // State for Module Progress Modal
   const [selectedProgress, setSelectedProgress] = useState(null)
   const [showProgressModal, setShowProgressModal] = useState(false)
   const [progressLoading, setProgressLoading] = useState(false)

    // State for Simple Course Form
    const [courseFormData, setCourseFormData] = useState({
      course_name: '',
      start_date: '',
      end_date: '',
      course_img: null,
      existing_course_img: null
    })
  
  // Prevent double submission
  const [submitting, setSubmitting] = useState(false)

  // State for Module Management
  const [moduleViewData, setModuleViewData] = useState(null) // { course }
  const [modules, setModules] = useState([])
  const [moduleFormData, setModuleFormData] = useState({
    mod_title: '',
    mod_title_hindi: '',
    order: 1,
    video_link: ''
  })
  const [loadingModules, setLoadingModules] = useState(false)

  // State for Submodules Management
  const [submodulesViewData, setSubmodulesViewData] = useState(null) // { course, module }
  const [submodules, setSubmodules] = useState([])
  const [submoduleFormData, setSubmoduleFormData] = useState({
    sub_modu_title: '',
    sub_modu_title_hindi: '',
    sub_modu_description: '',
    sub_modu_description_hindi: '',
    sub_mod: [{ title: '', description: '' }],
    sub_mod_hindi: [{ title: '', description: '' }],
    image: null,
    order: 1
  })
  const [loadingSubmodules, setLoadingSubmodules] = useState(false)

  // State for Questions Management
  const [questionsViewData, setQuestionsViewData] = useState(null) // { course, module }
  const [questions, setQuestions] = useState([])
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    question_text_hindi: '',
    options: ['', '', '', ''],
    options_hindi: ['', '', '', ''],
    correct_answer: 0,
    marks: 1
  })
  const [loadingQuestions, setLoadingQuestions] = useState(false)

  // State for Exercises Management
  const [exercisesViewData, setExercisesViewData] = useState(null) // { course, module }
  const [exercises, setExercises] = useState([])
  const [exerciseFormData, setExerciseFormData] = useState({
    img_name: '',
    img: null
  })
  const [loadingExercises, setLoadingExercises] = useState(false)

   // State for Counseling Management
   const [counselingData, setCounselingData] = useState([])
   const [selectedCounseling, setSelectedCounseling] = useState(null)
   const [showCounselingModal, setShowCounselingModal] = useState(false)
   const [counselingPage, setCounselingPage] = useState(1)
   const counselingItemsPerPage = 100

   // State for Enrollment Filters
   const [enrollmentSelectedSchools, setEnrollmentSelectedSchools] = useState([])
   const [enrollmentUniqueSchools, setEnrollmentUniqueSchools] = useState([])
   const [enrollmentSelectedClasses, setEnrollmentSelectedClasses] = useState([])
   const [enrollmentUniqueClasses, setEnrollmentUniqueClasses] = useState([])

   // State for Admin Notifications
   const [adminNotifications, setAdminNotifications] = useState([])
   const [adminNotificationCount, setAdminNotificationCount] = useState(0)
   const [showNotificationModal, setShowNotificationModal] = useState(false)
   const [notificationFormData, setNotificationFormData] = useState({ title: '', message: '' })
   const [submittingNotification, setSubmittingNotification] = useState(false)
   const [showNotificationsListModal, setShowNotificationsListModal] = useState(false)

   // State for Enrollment Filters
  const [selectedSchools, setSelectedSchools] = useState([])
  const [uniqueSchools, setUniqueSchools] = useState([])
  const [selectedClasses, setSelectedClasses] = useState([])
  const [uniqueClasses, setUniqueClasses] = useState([])
  const [eventsCount, setEventsCount] = useState(0)
  const [showGraphModal, setShowGraphModal] = useState(false)
  const [analyticsStatusFilter, setAnalyticsStatusFilter] = useState('all') // 'all', 'completed', 'ongoing'
  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [eventFormData, setEventFormData] = useState({
    event_name: '',
    description: '',
    event_date_time: '',
    end_date_time: '',
    venue: '',
    event_type: '',
    event_name_hindi: '',
    description_hindi: '',
    venue_hindi: ''
  })
   const [eventImage, setEventImage] = useState(null)
   const [isEditingEvent, setIsEditingEvent] = useState(false)
   const [isAddingEvent, setIsAddingEvent] = useState(false)

   // State for Performance Score
   const [showPerformanceModal, setShowPerformanceModal] = useState(false)
   const [showPerformanceHelpModal, setShowPerformanceHelpModal] = useState(false)

    // Calculate School Performance Scores from existing data
    const calculateSchoolPerformance = (enrollments) => {
      if (!enrollments || enrollments.length === 0) return []

      // Group by school and track unique students with their course participation
      const schoolGroups = {}
      enrollments.forEach(e => {
        const school = e.school_name || 'Unknown School'
        const studentId = e.student_id

        // Skip enrollments without valid student_id
        if (!studentId) return

        if (!schoolGroups[school]) {
          schoolGroups[school] = {
            students: new Map(), // student_id -> { courses: Set, completedCourses: Set }
            totalStudents: 0,
            totalCompletedCourses: 0
          }
        }

        if (!schoolGroups[school].students.has(studentId)) {
          schoolGroups[school].students.set(studentId, {
            courses: new Set(),
            completedCourses: new Set()
          })
          schoolGroups[school].totalStudents++
        }

        // Track course participation for this student
        schoolGroups[school].students.get(studentId).courses.add(e.course_id)
        if (e.is_completed) {
          schoolGroups[school].students.get(studentId).completedCourses.add(e.course_id)
          schoolGroups[school].totalCompletedCourses++
        }
      })

      // Calculate metrics for each school
      const schoolStats = Object.entries(schoolGroups).map(([schoolName, data]) => {
        const uniqueStudents = data.totalStudents
        const totalCoursesParticipated = Array.from(data.students.values())
          .reduce((sum, student) => sum + student.courses.size, 0)
        const totalCompletedCourses = data.totalCompletedCourses

        // Average courses per student
        const avgCoursesPerStudent = uniqueStudents > 0 ? totalCoursesParticipated / uniqueStudents : 0

        // Completion rate based on course participations
        const completionRate = totalCoursesParticipated > 0 ? (totalCompletedCourses / totalCoursesParticipated) * 100 : 0

        return {
          schoolName,
          uniqueStudents,
          totalCoursesParticipated,
          totalCompletedCourses,
          avgCoursesPerStudent: Math.round(avgCoursesPerStudent * 100) / 100,
          completionRate: Math.round(completionRate * 100) / 100
        }
      })

      // Find max values for normalization
      const maxAvgCourses = Math.max(...schoolStats.map(s => s.avgCoursesPerStudent))

      // Calculate balanced performance scores
      const rankedSchools = schoolStats
        .map(stats => {
          // Balanced Performance Score formula considering unique students and course participation
          let balancedScore = 0
          if (stats.uniqueStudents > 0) {
            const component1 = maxAvgCourses > 0 ? (stats.avgCoursesPerStudent / maxAvgCourses) * 100 : 0
            const component2 = stats.completionRate
            const component3 = Math.min(stats.uniqueStudents / 10, 1) * 100 // Bonus for student engagement (capped at 100 for 10+ students)
            balancedScore = (0.4 * component1 + 0.4 * component2 + 0.2 * component3)
          }
          balancedScore = Math.round(balancedScore * 100) / 100

          return {
            schoolName: stats.schoolName,
            uniqueStudents: stats.uniqueStudents,
            totalCoursesParticipated: stats.totalCoursesParticipated,
            totalCompletedCourses: stats.totalCompletedCourses,
            avgCoursesPerStudent: stats.avgCoursesPerStudent,
            completionRate: stats.completionRate,
            balancedScore
          }
        })
        .sort((a, b) => b.balancedScore - a.balancedScore)
        .map((school, index) => ({
          ...school,
          rank: index + 1
        }))

      return rankedSchools
    }

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
    if (isMounted.current) {
      fetchData()
    }
    return () => { isMounted.current = false }
  }, [authToken, currentView])

  const getAuthConfig = () => {
    const headers = {}
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    // Note: Do NOT set Content-Type here manually when using FormData. 
    // Axios sets it automatically with the correct boundary.
    return { headers }
  }

  const fetchData = async () => {
    if (!authToken) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const config = getAuthConfig()
      
       // Fetch unpaid enrollment data
         try {
           const unpaidEnrollRes = await axios.get('https://brjobsedu.com/gyandhara/gyandhara_backend/api/enrollment-unpaid/', config)
           if (unpaidEnrollRes.data && unpaidEnrollRes.data.success) {
             const enrollments = unpaidEnrollRes.data.data
             setUnpaidEnrollmentCount(enrollments.length)
             setUnpaidEnrollments(enrollments)
             
             // Extract unique school names
             const schools = [...new Set(enrollments
               .map(item => item.school_name)
               .filter(name => name && name.trim() !== '')
             )].sort()
             setEnrollmentUniqueSchools(schools)
             
             // Extract unique class names (as strings to handle both string and number types)
             const classes = [...new Set(enrollments
               .map(item => String(item.class_name))
               .filter(cls => cls && cls.trim() !== '')
             )].sort((a, b) => parseInt(a) - parseInt(b))
             console.log('Extracted unique classes:', classes)
             setEnrollmentUniqueClasses(classes)
           }
         } catch (unpaidEnrollError) {
           setUnpaidEnrollmentCount(0)
           setUnpaidEnrollments([])
           setEnrollmentUniqueSchools([])
           setEnrollmentUniqueClasses([])
         }

     // Fetch courses data from new endpoint
     try {
        const courseRes = await axios.get('https://brjobsedu.com/gyandhara/gyandhara_backend/api/course-items/', config)
        if (courseRes.data && courseRes.data.success) {
          setCourses(courseRes.data.data)
        }
      } catch (courseError) {
        setCourses([])
      }

       // Fetch counseling data
       try {
         const counselingRes = await axios.get('https://brjobsedu.com/gyandhara/gyandhara_backend/api/student-cousult/', config)
         if (counselingRes.data && counselingRes.data.status) {
           const data = counselingRes.data.data
           setCounselingData(data)
           
           // Extract unique school names
           const schools = [...new Set(data
             .map(item => item.student_details?.school_name)
             .filter(name => name && name.trim() !== '')
           )].sort()
           setUniqueSchools(schools)
           
           // Extract unique classes
           const classes = [...new Set(data
             .map(item => item.student_details?.class_name)
             .filter(cls => cls && cls.trim() !== '')
           )].sort()
           console.log('Extracted unique classes:', classes) // Debug log
           setUniqueClasses(classes)
         }
        } catch (counselingError) {
          console.error('Error fetching counseling data:', counselingError)
          setCounselingData([])
          setUniqueSchools([])
          setUniqueClasses([])
        }

       // Fetch admin notifications count
      try {
        const notifRes = await axios.get('https://brjobsedu.com/gyandhara/gyandhara_backend/api/admin-notifications/', config)
        if (notifRes.data && notifRes.data.status) {
          setAdminNotificationCount(notifRes.data.count || 0)
        }
      } catch (notifError) {
        setAdminNotificationCount(0)
      }

      // Fetch events count
      try {
        const eventsRes = await axios.get('https://brjobsedu.com/gyandhara/gyandhara_backend/api/event-item/')
        if (eventsRes.data && eventsRes.data.success) {
          setEventsCount(eventsRes.data.data.length)
        }
      } catch (eventsError) {
        setEventsCount(0)
      }

    } catch (error) {
      // Fallback data in case of error
      setUnpaidEnrollmentCount(0)
      setCourses([])
      setCounselingData([])
    } finally {
      setLoading(false)
    }
  }

   // --- Navigation Handlers ---
   const handleEnrollmentsClick = () => {
     setCurrentView('unpaidEnrollments')
     // Clear filters when navigating to enrollments
     setEnrollmentSelectedSchools([])
     setEnrollmentSelectedClasses([])
   }
   const handleCounselingClick = () => {
     setCounselingPage(1)
     setCurrentView('counseling')
   }
  const handleEventsClick = () => {
    setCurrentView('events')
    fetchEvents()
  }

  const fetchEvents = async () => {
    setLoadingEvents(true)
    try {
      const response = await axios.get('https://brjobsedu.com/gyandhara/gyandhara_backend/api/event-item/')
      if (response.data && response.data.success) {
        setEvents(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    } finally {
      setLoadingEvents(false)
    }
  }

  const handleDeleteEvent = async (event) => {
    if (window.confirm(`Are you sure you want to delete the event "${event.event_name}"?`)) {
      try {
        await axios.delete('https://brjobsedu.com/gyandhara/gyandhara_backend/api/event-item/', {
          data: { event_id: event.event_id }
        })
        alert('Event deleted successfully!')
        fetchEvents()
        fetchData()
      } catch (error) {
        alert('Failed to delete event. Please check the console for details.')
      }
    }
  }

  const handleViewEvent = (event) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const handleAddEvent = () => {
    setEventFormData({
      event_name: '',
      description: '',
      event_date_time: '',
      end_date_time: '',
      venue: '',
      event_type: '',
      event_name_hindi: '',
      description_hindi: '',
      venue_hindi: ''
    })
    setEventImage(null)
    setIsEditingEvent(false)
    setIsAddingEvent(true)
  }

  const handleEditEvent = (event) => {
    setEventFormData({
      event_id: event.event_id,
      event_name: event.event_name || '',
      description: event.description || '',
      event_name_hindi: event.event_name_hindi || '',
      description_hindi: event.description_hindi || '',
      event_date_time: event.event_date_time ? event.event_date_time.slice(0, 16) : '',
      end_date_time: event.end_date_time ? event.end_date_time.slice(0, 16) : '',
      venue: event.venue || '',
      venue_hindi: event.venue_hindi || '',
      event_type: event.event_type || ''
    })
    setEventImage(null)
    setSelectedEvent(event)
    setIsEditingEvent(true)
    setIsAddingEvent(false)
    setShowEventModal(false)
  }

  const handleEventSubmit = async (e) => {
    e.preventDefault()
    try {
      const config = getAuthConfig()
      const formData = new FormData()
      if (isEditingEvent) {
        formData.append('event_id', eventFormData.event_id)
      }
      formData.append('event_name', eventFormData.event_name)
      formData.append('description', eventFormData.description)
      formData.append('event_name_hindi', eventFormData.event_name_hindi)
      formData.append('description_hindi', eventFormData.description_hindi)
      formData.append('event_date_time', eventFormData.event_date_time)
      formData.append('end_date_time', eventFormData.end_date_time)
      formData.append('venue', eventFormData.venue)
      formData.append('venue_hindi', eventFormData.venue_hindi)
      formData.append('event_type', eventFormData.event_type)
      if (eventImage) {
        formData.append('event_image', eventImage)
      }

      if (isAddingEvent) {
        await axios.post('https://brjobsedu.com/gyandhara/gyandhara_backend/api/event-item/', formData, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Event added successfully!')
      } else {
        await axios.put('https://brjobsedu.com/gyandhara/gyandhara_backend/api/event-item/', formData, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Event updated successfully!')
      }

      setIsAddingEvent(false)
      setIsEditingEvent(false)
      setEventFormData({
        event_name: '',
        description: '',
        event_name_hindi: '',
        description_hindi: '',
        event_date_time: '',
        end_date_time: '',
        venue: '',
        venue_hindi: '',
        event_type: ''
      })
      setEventImage(null)
      fetchEvents()
      fetchData()
    } catch (error) {
      alert('Failed to update event. Please check the console for details.')
    }
  }

  const handleEventImageChange = (e) => {
    const file = e.target.files[0]
    setEventImage(file)
  }

  const cancelEventEdit = () => {
    setIsEditingEvent(false)
    setIsAddingEvent(false)
    setEventFormData({
      event_name: '',
      description: '',
      event_name_hindi: '',
      description_hindi: '',
      event_date_time: '',
      end_date_time: '',
      venue: '',
      venue_hindi: '',
      event_type: ''
    })
    setEventImage(null)
  }

  const handleViewCounseling = (counseling) => {
    setSelectedCounseling(counseling)
    setShowCounselingModal(true)
  }

  const handleCloseCounselingModal = () => {
    setShowCounselingModal(false)
    setSelectedCounseling(null)
  }

  const handleNotificationsClick = async () => {
    try {
      const config = getAuthConfig()
      const response = await axios.get('https://brjobsedu.com/gyandhara/gyandhara_backend/api/admin-notifications/', config)
      if (response.data && response.data.status) {
        setAdminNotifications(response.data.data || [])
        setShowNotificationsListModal(true)
      }
    } catch (error) {
      setAdminNotifications([])
    }
  }

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        const config = getAuthConfig()
        await axios.delete('https://brjobsedu.com/gyandhara/gyandhara_backend/api/admin-notifications/', {
          data: { notification_ids: [notificationId] },
          ...config
        })
        handleNotificationsClick()
        fetchData()
      } catch (error) {
        alert('Failed to delete notification.')
      }
    }
  }

  const handleSubmitNotification = async (e) => {
    e.preventDefault()
    if (submittingNotification) return
    setSubmittingNotification(true)

    try {
      const config = getAuthConfig()
      await axios.post('https://brjobsedu.com/gyandhara/gyandhara_backend/api/admin-notifications/', {
        title: notificationFormData.title,
        message: notificationFormData.message
      }, config)
      
      alert('Notification sent successfully!')
      setShowNotificationModal(false)
      setNotificationFormData({ title: '', message: '' })
      fetchData()
    } catch (error) {
      alert('Failed to send notification.')
    } finally {
      setSubmittingNotification(false)
    }
  }

  const formatNotificationTime = (timeStr) => {
    try {
      const date = new Date(timeStr)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins} min ago`
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      const hours = date.getHours()
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const formattedHours = hours % 12 || 12
      return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`
    } catch {
      return timeStr
    }
  }
   const handleCoursesClick = () => {
     setCourseType('unpaid')
     setCurrentView('list')
   }
  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    fetchData() // Refresh data when returning to dashboard
  }
  const handleAddCourseClick = () => {
    setCourseFormData({ course_name: '', start_date: '', end_date: '', course_img: null, existing_course_img: null })
    setCurrentView('form')
  }
   const handleViewCourse = async (course) => {
     try {
       const config = getAuthConfig()
       const response = await axios.get(`https://brjobsedu.com/gyandhara/gyandhara_backend/api/course-module/?course_id=${course.course_id}`, config)
       if (response.data && response.data.success) {
         setSelectedCourse(response.data.data)
       }
     } catch (error) {
       alert('Failed to fetch course details. Please check the console for details.')
     }
     setShowModal(true)
   }

   const fetchModuleProgress = async (studentId) => {
     setProgressLoading(true)
     try {
       const config = getAuthConfig()
       const response = await axios.get(`https://brjobsedu.com/gyandhara/gyandhara_backend/api/module-progress-unpaid/?student_id=${studentId}`, config)
       if (response.data && response.data.success) {
         return response.data.data
       }
       return []
     } catch (error) {
       console.error('Error fetching module progress:', error)
       return []
     } finally {
       setProgressLoading(false)
     }
   }

   const handleViewProgress = async (studentId, studentName) => {
     setSelectedProgress({ studentId, studentName, modules: [] })
     setShowProgressModal(true)
     const progressData = await fetchModuleProgress(studentId)
     setSelectedProgress(prev => ({ ...prev, modules: progressData }))
   }

  const handleEditCourse = (course) => {
    setCourseFormData({
      course_id: course.course_id,
      course_name: course.course_name,
      start_date: course.start_date || '',
      end_date: course.end_date || '',
      course_img: null, // Reset file input for new upload
      existing_course_img: course.course_img || null // Store existing image path
    })
    setCurrentView('form')
  }

  const handleDeleteCourse = async (course) => {
    if (window.confirm(`Are you sure you want to delete the course "${course.course_name}"?`)) {
      try {
        const config = getAuthConfig()
        await axios.delete('https://brjobsedu.com/gyandhara/gyandhara_backend/api/course-items/', {
          data: { course_id: course.course_id },
          ...config
        })
        fetchData()
      } catch (error) {
        alert('Failed to delete course. Please check the console for details.')
      }
    }
  }

  const handleAddModule = (course) => {
    setModuleViewData({ course })
    setCurrentView('modules')
    setModules([])
    fetchModules(course.course_id)
  }

  const fetchModules = async (course_id) => {
    setLoadingModules(true)
    try {
      const config = getAuthConfig()
      const response = await axios.get(`https://brjobsedu.com/gyandhara/gyandhara_backend/api/course-module/?course_id=${course_id}`, config)
      if (response.data && response.data.success) {
        const fetchedModules = response.data.data.modules || []
        setModules(fetchedModules)
        // Set initial order to next sequential number
        setModuleFormData(prev => ({
          ...prev,
          order: fetchedModules.length + 1
        }))
      }
    } catch (error) {
      alert('Failed to fetch modules. Please check the console for details.')
    } finally {
      setLoadingModules(false)
    }
  }

  const handleAddModuleSubmit = async (e) => {
    e.preventDefault()
    if (!moduleViewData?.course) {
      alert('Please select a course first')
      return
    }

    try {
      const config = getAuthConfig()
      const dataToSend = {
        course_id: moduleViewData.course.course_id,
        mod_title: moduleFormData.mod_title,
        mod_title_hindi: moduleFormData.mod_title_hindi,
        order: moduleFormData.order,
        video_link: moduleFormData.video_link
      }

      if (moduleFormData.module_id) {
        // Update existing module (PUT request)
        await axios.put('https://brjobsedu.com/gyandhara/gyandhara_backend/api/module-items/', {
          ...dataToSend,
          module_id: moduleFormData.module_id
        }, config)
        alert('Module updated successfully!')
        
      } else {
        // Create new module (POST request)
        await axios.post('https://brjobsedu.com/gyandhara/gyandhara_backend/api/module-items/', dataToSend, config)
        alert('Module added successfully!')
      }
      
      // Reset form and fetch updated modules
      setModuleFormData({
        mod_title: '',
        mod_title_hindi: '',
        order: 1,
        video_link: ''
      })
      fetchModules(moduleViewData.course.course_id)
    } catch (error) {
      if (error.response) {
        alert(`Failed: ${error.response.data.message || error.response.data.detail || 'Check console for details'}`)
      } else {
        alert('Failed: ' + error.message)
      }
    }
  }

  const handleEditModule = (module) => {
    setModuleFormData({
      module_id: module.module_id,
      mod_title: module.mod_title,
      mod_title_hindi: module.mod_title_hindi || '',
      order: module.order,
      video_link: module.video_link || ''
    })
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteModule = async (module) => {
    if (window.confirm(`Are you sure you want to delete the module "${module.mod_title}"?`)) {
      try {
        const config = getAuthConfig()
        await axios.delete('https://brjobsedu.com/gyandhara/gyandhara_backend/api/module-items/', {
          data: { module_id: module.module_id },
          ...config
        })
        fetchModules(moduleViewData.course.course_id)
      } catch (error) {
        alert('Failed to delete module. Please check the console for details.')
      }
    }
  }

  const handleAddSubmodules = (course, module) => {
    setSubmodulesViewData({ course, module })
    setCurrentView('submodules')
    setSubmodules([])
    setSubmoduleFormData({
      sub_modu_title: '',
      sub_modu_title_hindi: '',
      sub_modu_description: '',
      sub_modu_description_hindi: '',
      sub_mod: [{ title: '', description: '' }],
      sub_mod_hindi: [{ title: '', description: '' }],
      image: null,
      order: 1
    })
    fetchSubmodules(course.course_id, module.module_id)
  }

  const fetchSubmodules = async (course_id, module_id) => {
    setLoadingSubmodules(true)
    try {
      const config = getAuthConfig()
      const response = await axios.get(`https://brjobsedu.com/gyandhara/gyandhara_backend/api/course-module/?course_id=${course_id}`, config)
      if (response.data && response.data.success) {
        // Find the module and get its submodules
        const targetModule = response.data.data.modules.find(m => m.module_id === module_id)
        const parsedSubmodules = targetModule?.sub_modules?.map(submodule => ({
          ...submodule,
          sub_mod: typeof submodule.sub_mod === 'string' ? JSON.parse(submodule.sub_mod) : (submodule.sub_mod || []),
          sub_mod_hindi: typeof submodule.sub_mod_hindi === 'string' ? JSON.parse(submodule.sub_mod_hindi) : (submodule.sub_mod_hindi || [])
        })) || []
        setSubmodules(parsedSubmodules)
        // Set initial order to next sequential number
        setSubmoduleFormData(prev => ({
          ...prev,
          order: parsedSubmodules.length + 1
        }))
      }
    } catch (error) {
      alert('Failed to fetch submodules. Please check the console for details.')
    } finally {
      setLoadingSubmodules(false)
    }
  }

  const handleAddSubmoduleSubmit = async (e) => {
    e.preventDefault()
    if (!submodulesViewData?.course || !submodulesViewData?.module) {
      alert('Please select a module first')
      return
    }

    try {
      const config = getAuthConfig()
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('course_id', submodulesViewData.course.course_id)
      formData.append('module_id', submodulesViewData.module.module_id)
      formData.append('sub_modu_title', submoduleFormData.sub_modu_title)
      formData.append('sub_modu_title_hindi', submoduleFormData.sub_modu_title_hindi)
      formData.append('sub_modu_description', submoduleFormData.sub_modu_description)
      formData.append('sub_modu_description_hindi', submoduleFormData.sub_modu_description_hindi)
      formData.append('sub_mod', JSON.stringify(submoduleFormData.sub_mod))
      formData.append('sub_mod_hindi', JSON.stringify(submoduleFormData.sub_mod_hindi))
      formData.append('order', submoduleFormData.order)
      if (submoduleFormData.image) {
        formData.append('image', submoduleFormData.image)
      }
      if (submoduleFormData.sub_module_id) {
        formData.append('sub_module_id', submoduleFormData.sub_module_id)
      }

      if (submoduleFormData.sub_module_id) {
        // Update existing submodule (PUT request)
        await axios.put('https://brjobsedu.com/gyandhara/gyandhara_backend/api/submodule-items/', formData, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Submodule updated successfully!')
      } else {
        // Create new submodule (POST request)
        await axios.post('https://brjobsedu.com/gyandhara/gyandhara_backend/api/submodule-items/', formData, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Submodule added successfully!')
      }
      
      // Reset form and fetch updated submodules
      setSubmoduleFormData({
        sub_modu_title: '',
        sub_modu_title_hindi: '',
        sub_modu_description: '',
        sub_modu_description_hindi: '',
        sub_mod: [{ title: '', description: '' }],
        sub_mod_hindi: [{ title: '', description: '' }],
        image: null,
        order: 1
      })
      fetchSubmodules(submodulesViewData.course.course_id, submodulesViewData.module.module_id)
    } catch (error) {
      if (error.response) {
        alert(`Failed: ${error.response.data.message || error.response.data.detail || 'Check console for details'}`)
      } else {
        alert('Failed: ' + error.message)
      }
    }
  }

  const handleEditSubmodule = (submodule) => {
    setSubmoduleFormData({
      sub_module_id: submodule.sub_module_id,
      sub_modu_title: submodule.sub_modu_title,
      sub_modu_title_hindi: submodule.sub_modu_title_hindi || '',
      sub_modu_description: submodule.sub_modu_description,
      sub_modu_description_hindi: submodule.sub_modu_description_hindi || '',
      sub_mod: submodule.sub_mod || [{ title: '', description: '' }],
      sub_mod_hindi: submodule.sub_mod_hindi || [{ title: '', description: '' }],
      image: null,
      order: submodule.order
    })
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteSubmodule = async (submodule) => {
    if (window.confirm(`Are you sure you want to delete the submodule "${submodule.sub_modu_title}"?`)) {
      try {
        const config = getAuthConfig()
        await axios.delete('https://brjobsedu.com/gyandhara/gyandhara_backend/api/submodule-items/', {
          data: { sub_module_id: submodule.sub_module_id },
          ...config
        })
        fetchSubmodules(submodulesViewData.course.course_id, submodulesViewData.module.module_id)
      } catch (error) {
        alert('Failed to delete submodule. Please check the console for details.')
      }
    }
  }

  const handleAddSubModSection = () => {
    setSubmoduleFormData({
      ...submoduleFormData,
      sub_mod: [...submoduleFormData.sub_mod, { title: '', description: '' }],
      sub_mod_hindi: [...(submoduleFormData.sub_mod_hindi || []), { title: '', description: '' }]
    })
  }

  const handleRemoveSubModSection = (index) => {
    if (submoduleFormData.sub_mod.length > 1) {
      const newSubMod = [...submoduleFormData.sub_mod]
      newSubMod.splice(index, 1)
      const newSubModHindi = [...(submoduleFormData.sub_mod_hindi || [])]
      newSubModHindi.splice(index, 1)
      setSubmoduleFormData({
        ...submoduleFormData,
        sub_mod: newSubMod,
        sub_mod_hindi: newSubModHindi
      })
    }
  }

  const handleSubModSectionChange = (index, field, value) => {
    const newSubMod = [...submoduleFormData.sub_mod]
    newSubMod[index][field] = value
    setSubmoduleFormData({
      ...submoduleFormData,
      sub_mod: newSubMod
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setSubmoduleFormData({
      ...submoduleFormData,
      image: file
    })
  }

  const handleAddQuestions = (course, module) => {
    setQuestionsViewData({ course, module })
    setCurrentView('questions')
    setQuestions([])
    setQuestionFormData({
      question_text: '',
      question_text_hindi: '',
      options: ['', '', '', ''],
      options_hindi: ['', '', '', ''],
      correct_answer: 0,
      marks: 1
    })
    if (module) {
      fetchQuestions(course.course_id, module.module_id)
    }
  }

  const handleAddExercises = (course, module) => {
    console.log('handleAddExercises called with:', { course, module })
    setExercisesViewData({ course, module })
    setCurrentView('exercises')
    setExercises([])
    setExerciseFormData({
      img_name: '',
      img: null
    })
    fetchExercises(module.module_id)
  }

  const fetchExercises = async (module_id) => {
    setLoadingExercises(true)
    try {
      console.log('Fetching exercises for module_id:', module_id)
      
      // Validate module_id
      if (!module_id || module_id === 'undefined') {
        console.error('Invalid module_id:', module_id)
        setExercises([])
        return
      }
      
      const config = getAuthConfig()
      const response = await axios.get(`https://brjobsedu.com/gyandhara/gyandhara_backend/api/exercise-img/?module_id=${module_id}`, config)
      console.log('API Response:', response)
      if (response.data && response.data.success) {
        setExercises(response.data.data)
      } else {
        console.log('API returned success: false or no data')
        setExercises([])
      }
    } catch (error) {
      console.error('Error fetching exercises:', error)
      alert('Failed to fetch exercises. Please check the console for details.')
      setExercises([])
    } finally {
      setLoadingExercises(false)
    }
  }

  const handleAddExerciseSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const config = getAuthConfig()
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('course_id', exercisesViewData.course.course_id)
      formData.append('module_id', exercisesViewData.module.module_id)
      formData.append('img_name', exerciseFormData.img_name)
      if (exerciseFormData.img) {
        formData.append('img', exerciseFormData.img)
      }
      if (exerciseFormData.id) {
        formData.append('id', exerciseFormData.id)
      }

      if (exerciseFormData.id) {
        // Update existing exercise
        await axios.put('https://brjobsedu.com/gyandhara/gyandhara_backend/api/exercise-img/', formData, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Exercise updated successfully!')
      } else {
        // Create new exercise
        await axios.post('https://brjobsedu.com/gyandhara/gyandhara_backend/api/exercise-img/', formData, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Exercise added successfully!')
      }
      
      // Reset form and fetch updated exercises
      setExerciseFormData({
        img_name: '',
        img: null
      })
      fetchExercises(exercisesViewData.module.module_id)
    } catch (error) {
      if (error.response) {
        alert(`Failed: ${error.response.data.message || error.response.data.detail || 'Check console for details'}`)
      } else {
        alert('Failed: ' + error.message)
      }
    }
  }

  const handleEditExercise = (exercise) => {
    setExerciseFormData({
      id: exercise.id,
      img_name: exercise.img_name,
      img: null
    })
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteExercise = async (exercise) => {
    if (window.confirm(`Are you sure you want to delete the exercise "${exercise.img_name}"?`)) {
      try {
        const config = getAuthConfig()
        await axios.delete('https://brjobsedu.com/gyandhara/gyandhara_backend/api/exercise-img/', {
          data: { id: exercise.id },
          ...config
        })
        fetchExercises(exercisesViewData.module.module_id)
      } catch (error) {
        alert('Failed to delete exercise. Please check the console for details.')
      }
    }
  }

  const handleExerciseImageChange = (e) => {
    const file = e.target.files[0]
    setExerciseFormData({
      ...exerciseFormData,
      img: file
    })
  }

  const fetchQuestions = async (course_id, module_id) => {
    setLoadingQuestions(true)
    try {
      const config = getAuthConfig()
      const response = await axios.get(`https://brjobsedu.com/gyandhara/gyandhara_backend/api/module-questions/?course_id=${course_id}&module_id=${module_id}`, config)
      if (response.data && response.data.success) {
        setQuestions(response.data.data)
      }
    } catch (error) {
      alert('Failed to fetch questions. Please check the console for details.')
    } finally {
      setLoadingQuestions(false)
    }
  }

  const handleAddQuestion = async (e) => {
    e.preventDefault()
    if (!questionsViewData?.course || !questionsViewData?.module) {
      alert('Please select a module first')
      return
    }

    try {
      const config = getAuthConfig()
      const dataToSend = {
        course_id: questionsViewData.course.course_id,
        module_id: questionsViewData.module.module_id,
        question_text: questionFormData.question_text,
        question_text_hindi: questionFormData.question_text_hindi,
        options: questionFormData.options,
        options_hindi: questionFormData.options_hindi,
        correct_answer: questionFormData.correct_answer,
        marks: questionFormData.marks
      }

      if (questionFormData.id) {
        dataToSend.id = questionFormData.id
        await axios.put('https://brjobsedu.com/gyandhara/gyandhara_backend/api/module-questions/', dataToSend, config)
        alert('Question updated successfully!')
      } else {
        await axios.post('https://brjobsedu.com/gyandhara/gyandhara_backend/api/module-questions/', dataToSend, config)
        alert('Question added successfully!')
      }
      
      // Reset form and fetch updated questions
      setQuestionFormData({
        question_text: '',
        question_text_hindi: '',
        options: ['', '', '', ''],
        options_hindi: ['', '', '', ''],
        correct_answer: 0,
        marks: 1
      })
      fetchQuestions(questionsViewData.course.course_id, questionsViewData.module.module_id)
    } catch (error) {
      if (error.response) {
        alert(`Failed: ${error.response.data.message || error.response.data.detail || 'Check console for details'}`)
      } else {
        alert('Failed: ' + error.message)
      }
    }
  }

  const handleEditQuestion = (question) => {
    setQuestionFormData({
      id: question.id,
      question_text: question.question_text,
      question_text_hindi: question.question_text_hindi || '',
      options: question.options || ['', '', '', ''],
      options_hindi: question.options_hindi || ['', '', '', ''],
      correct_answer: question.correct_answer,
      marks: question.marks
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteQuestion = async (question) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const config = getAuthConfig()
        await axios.delete('https://brjobsedu.com/gyandhara/gyandhara_backend/api/module-questions/', {
          data: { id: question.id },
          ...config
        })
        fetchQuestions(questionsViewData.course.course_id, questionsViewData.module.module_id)
        alert('Question deleted successfully!')
      } catch (error) {
        alert('Failed to delete question. Please check the console for details.')
      }
    }
  }

  // --- Course Form Handler ---
  const handleCourseFormSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return // Prevent double click
    setSubmitting(true)

    try {
      const config = getAuthConfig()

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('course_name', courseFormData.course_name)
      formData.append('start_date', courseFormData.start_date)
      formData.append('end_date', courseFormData.end_date)
      if (courseFormData.course_img) {
        formData.append('course_img', courseFormData.course_img)
      }

      if (courseFormData.course_id) {
        // Update existing course
        formData.append('course_id', courseFormData.course_id)
        formData.append('course_status', courseFormData.course_status || 'unpaid')
        await axios.put('https://brjobsedu.com/gyandhara/gyandhara_backend/api/course-items/', formData, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Course updated successfully!')
      } else {
        // Create new course - only create unpaid courses
        formData.append('course_status', 'unpaid') // Explicitly set to unpaid
        await axios.post('https://brjobsedu.com/gyandhara/gyandhara_backend/api/course-items/', formData, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Unpaid course created successfully!')
      }

      fetchData()
      setCurrentView('list')
      // Reset form
      setCourseFormData({
        course_name: '',
        start_date: '',
        end_date: '',
        course_img: null,
        existing_course_img: null
      })
    } catch (error) {
      if (error.response) {
        alert(`Failed: ${error.response.data.message || error.response.data.detail || 'Check console for details'}`);
      } else {
        alert('Failed: ' + error.message);
      }
    } finally {
      setSubmitting(false)
    }
  }

  // --- Render Helpers ---

  const renderUnpaidEnrollmentsView = () => {
    // Filter enrollments based on selected filters
    const filteredEnrollments = unpaidEnrollments.filter(enrollment => {
      const schoolMatch = enrollmentSelectedSchools.length === 0 || 
        enrollmentSelectedSchools.includes(enrollment.school_name)
      const classMatch = enrollmentSelectedClasses.length === 0 || 
        enrollmentSelectedClasses.includes(String(enrollment.class_name))
      return schoolMatch && classMatch
    })

    // Handle school filter change
    const handleSchoolFilterChange = (e) => {
      const school = e.target.value
      if (school && !enrollmentSelectedSchools.includes(school)) {
        setEnrollmentSelectedSchools(prev => [...prev, school])
      }
      // Reset select to placeholder
      e.target.value = ''
    }

    // Handle class filter change
    const handleClassFilterChange = (e) => {
      const cls = e.target.value
      if (cls && !enrollmentSelectedClasses.includes(cls)) {
        setEnrollmentSelectedClasses(prev => [...prev, cls])
      }
      // Reset select to placeholder
      e.target.value = ''
    }

    // Clear school filter
    const clearSchoolFilter = (school) => {
      setEnrollmentSelectedSchools(prev => prev.filter(s => s !== school))
    }

    // Clear class filter
    const clearClassFilter = (cls) => {
      setEnrollmentSelectedClasses(prev => prev.filter(c => c !== cls))
    }

    // Clear all filters
    const clearAllFilters = () => {
      setEnrollmentSelectedSchools([])
      setEnrollmentSelectedClasses([])
    }

    // Export to PDF
    const exportToPDF = () => {
      try {
        const doc = new jsPDF({ orientation: 'landscape' })
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        const margin = 8
        const availableWidth = pageWidth - (margin * 2)
        
        // Title
        doc.setFontSize(14)
        doc.text('Enrollment Details Report', margin, 12)
        doc.setFontSize(9)
        doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, 18)
        doc.text(`Total Records: ${filteredEnrollments.length}`, margin, 23)
        
        // Column definitions (Excluding Action)
        const headers = ['#', 'Student ID', 'Name', 'School Name', 'Class', 'Course ID', 'Course Name', 'Enrolled At', 'Status', 'Cert ID']
        const colWidths = [8, 25, 35, 40, 15, 20, 45, 35, 25, 32]
        const totalWidth = colWidths.reduce((a, b) => a + b, 0)
        
        // Scale columns to fit available width
        const scaleFactor = availableWidth / totalWidth
        const scaledColWidths = colWidths.map(w => w * scaleFactor)
        
        let y = 28
        const startX = margin
        const rowHeight = 5.5
        const headerHeight = 6.5
        
        // Function to draw a row
        const drawRow = (cells, yPos, isHeader = false) => {
          let x = startX
          const rowHeightToUse = isHeader ? headerHeight : rowHeight
          
          if (isHeader) {
            doc.setFillColor(41, 128, 185)
            doc.rect(startX, yPos - 4, availableWidth, rowHeightToUse, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(7.5)
          } else {
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(6.5)
            // Draw alternating row colors
            if (cells[0] % 2 === 0) {
              doc.setFillColor(240, 245, 250)
              doc.rect(startX, yPos - 4, availableWidth, rowHeightToUse, 'F')
            }
          }
          
          cells.forEach((cell, i) => {
            let text = typeof cell === 'string' ? cell : String(cell)
            const colWidth = scaledColWidths[i]
            
            const maxChars = Math.floor(colWidth / 1.8)
            if (text.length > maxChars) {
              text = text.substring(0, maxChars - 1) + '..'
            }
            
            doc.setDrawColor(200, 200, 200)
            doc.rect(x, yPos - 4, colWidth, rowHeightToUse)
            doc.text(text, x + 1.5, yPos + (isHeader ? 0.5 : 0.3), { maxWidth: colWidth - 3 })
            x += colWidth
          })
          
          doc.setTextColor(0, 0, 0)
          return yPos + rowHeightToUse
        }
        
        y = drawRow(headers, y, true) + 1
        
        filteredEnrollments.forEach((enrollment, index) => {
          if (y > pageHeight - 15) {
            doc.addPage()
            y = 12
            y = drawRow(headers, y, true) + 1
          }
          
          const cells = [
            index + 1,
            (enrollment.student_id || '-'),
            (enrollment.student_name || '-'),
            (enrollment.school_name || '-'),
            (enrollment.class_name || '-'),
            (enrollment.course_id || '-'),
            (enrollment.course_name || '-'),
            enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString() : '-',
            enrollment.is_completed ? 'Completed' : 'Ongoing',
            (enrollment.certificate_id || '-')
          ]
          
          y = drawRow(cells, y)
        })
        
        const totalPages = doc.internal.getNumberOfPages()
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i)
          doc.setFontSize(7)
          doc.setTextColor(150, 150, 150)
          doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 5)
        }
        
        doc.save('enrollment-details.pdf')
      } catch (error) {
        console.error('PDF export error:', error)
        alert('Failed to generate PDF. Error: ' + error.message)
      }
    }

    // Export to Excel
    const exportToExcel = () => {
      try {
        const data = filteredEnrollments.map((enrollment, index) => ({
          '#': index + 1,
          'Student ID': enrollment.student_id || '-',
          'Student Name': enrollment.student_name || '-',
          'School Name': enrollment.school_name || '-',
          'Class': enrollment.class_name || '-',
          'Course ID': enrollment.course_id || '-',
          'Course Name': enrollment.course_name || '-',
          'Enrolled At': enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleString() : '-',
          'Status': enrollment.is_completed ? 'Completed' : 'Ongoing',
          'Certificate ID': enrollment.certificate_id || '-'
        }))
        
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Enrollment Details')
        XLSX.writeFile(wb, 'enrollment-details.xlsx')
      } catch (error) {
        console.error('Excel export error:', error)
        alert('Failed to generate Excel file.')
      }
    }

    return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 page-header">
        <Button variant="outline-secondary" size="sm" onClick={handleBackToDashboard}>
          <FaArrowLeft /> Dashboard
        </Button>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm" onClick={handleBackToDashboard}>
            <FaArrowLeft /> Dashboard
          </Button>
          <Button variant="outline-primary" size="sm" onClick={() => setShowGraphModal(true)}>
            <FaChartBar className="me-1" /> View Analytics
          </Button>
        </div>
        <h4 className="mb-0">Total Enrollments</h4>
      </div>

      {/* Filter Card - Matching Counseling Style */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <FaFilter className="text-muted me-2" />
                <strong>Filter by Institutions:</strong>
                <Form.Control
                  as="select"
                  size="sm"
                  style={{ minWidth: '250px' }}
                  onChange={handleSchoolFilterChange}
                  value=""
                >
                  <option value="">Select school to filter...</option>
                  {enrollmentUniqueSchools.map((school, index) => (
                    <option key={index} value={school}>{school}</option>
                  ))}
                </Form.Control>
                {enrollmentSelectedSchools.length > 0 && (
                  <>
                    <Button variant="outline-secondary" size="sm" onClick={() => setEnrollmentSelectedSchools([])}>
                      Clear
                    </Button>
                    <div className="d-flex flex-wrap gap-1">
                      {enrollmentSelectedSchools.map(school => (
                        <Badge key={school} bg="secondary" className="d-flex align-items-center">
                          {school}
                          <span 
                            style={{ cursor: 'pointer', marginLeft: '5px' }}
                            onClick={() => clearSchoolFilter(school)}
                          >
                            ×
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <FaFilter className="text-muted me-2" />
                <strong>Filter by Class:</strong>
                <Form.Control
                  as="select"
                  size="sm"
                  style={{ minWidth: '200px' }}
                  onChange={handleClassFilterChange}
                  value=""
                >
                  <option value="">Select class to filter...</option>
                  {enrollmentUniqueClasses.map((cls, index) => (
                    <option key={index} value={cls}>{cls}</option>
                  ))}
                </Form.Control>
                {enrollmentSelectedClasses.length > 0 && (
                  <>
                    <Button variant="outline-secondary" size="sm" onClick={() => setEnrollmentSelectedClasses([])}>
                      Clear
                    </Button>
                    <div className="d-flex flex-wrap gap-1">
                      {enrollmentSelectedClasses.map(cls => (
                        <Badge key={cls} bg="secondary" className="d-flex align-items-center">
                          {cls}
                          <span 
                            style={{ cursor: 'pointer', marginLeft: '5px' }}
                            onClick={() => clearClassFilter(cls)}
                          >
                            ×
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Col>
            {(enrollmentSelectedSchools.length > 0 || enrollmentSelectedClasses.length > 0) && (
              <Col md={12} className="mt-2">
                <Button variant="outline-danger" size="sm" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
                <span className="text-muted ms-2 small">
                  Showing {filteredEnrollments.length} of {unpaidEnrollments.length} records
                </span>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

       <Card className="shadow-sm border-0">
         <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
           <span><FaUsers className="me-2" /> Enrollment Details</span>
          <div className="d-flex gap-2 align-items-center">
            <Badge bg="light" text="dark" className="d-flex align-items-center h-100">{filteredEnrollments.length} Records</Badge>
            <Button variant="light" size="sm" onClick={exportToPDF}>
              <FaFilePdf className="me-1" /> Export PDF
            </Button>
            <Button variant="success" size="sm" onClick={exportToExcel}>
              <FaFileExcel className="me-1" /> Export Excel
            </Button>
          </div>
         </Card.Header>
         <Card.Body>
           {loading ? (
             <div className="text-center py-4">
               <Spinner animation="border" variant="primary" />
               <p className="mt-2">Loading enrollments...</p>
             </div>
           ) : filteredEnrollments.length === 0 ? (
             <p className="text-muted text-center mb-0">No enrollments found</p>
           ) : (
             <div className="table-responsive">
               <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>School Name</th>
                      <th>Class</th>
                      <th>Course ID</th>
                      <th>Course Name</th>
                      <th>Enrolled At</th>
                      <th>Status</th>
                      <th>Certificate ID</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                 <tbody>
                   {filteredEnrollments.map((enrollment, index) => (
                     <tr key={enrollment.id || index}>
                       <td>{index + 1}</td>
                       <td><Badge bg="secondary">{enrollment.student_id}</Badge></td>
                       <td className="fw-bold">{enrollment.student_name}</td>
                       <td>{enrollment.school_name || '-'}</td>
                       <td><Badge bg="info">{enrollment.class_name || '-'}</Badge></td>
                       <td><Badge bg="info">{enrollment.course_id}</Badge></td>
                       <td>{enrollment.course_name}</td>
                       <td className="small">
                         {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleString() : '-'}
                       </td>
                       <td>
                         <Badge bg={enrollment.is_completed ? 'success' : 'warning'}>
                           {enrollment.is_completed ? 'Completed' : 'Ongoing'}
                         </Badge>
                       </td>
                        <td>{enrollment.certificate_id || '-'}</td>
                        <td>
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleViewProgress(enrollment.student_id, enrollment.student_name)}
                          >
                            <FaEye className="me-1" /> View Progress
                          </Button>
                        </td>
                      </tr>
                   ))}
                 </tbody>
               </Table>
             </div>
           )}
         </Card.Body>
       </Card>
     </div>
   )
 }

  const renderDashboardView = () => (
    <div className="fade-in">
     <Row className="g-4 mob-top-view">
         <Col xs={12} sm={12} md={6} lg={4}>
           <Card className="stat-card h-100 shadow-sm border-0" onClick={handleEnrollmentsClick}>
             <Card.Body className="d-flex align-items-center card-box-mob" >
               <div className="stat-icon-wrapper users me-3">
                 <FaUsers className="stat-icon" />
               </div>
               <div className="card-content-mob-box">
                 <h6 className="stat-label text-muted mb-1">Total Enrollments</h6>
                 <h2 className="stat-value mb-0">{loading ? <Spinner size="sm" animation="border" /> : unpaidEnrollmentCount}</h2>
               </div>
             </Card.Body>
           </Card>
 </Col>
         <Col xs={12} sm={12} md={6} lg={4}>
            <Card className="stat-card h-100 shadow-sm border-0" onClick={handleCoursesClick}>
             <Card.Body className="d-flex align-items-center">
               <div className="stat-icon-wrapper courses me-3">
                 <FaBook className="stat-icon" />
               </div>
               <div className="card-content-mob-box">
                 <h6 className="stat-label text-muted mb-1">Total Courses</h6>
                 <h2 className="stat-value mb-0">{loading ? <Spinner size="sm" animation="border" /> : courses.filter(c => c.course_status === 'unpaid').length}</h2>
               </div>
             </Card.Body>
           </Card>
 </Col>
         <Col xs={12} sm={12} md={6} lg={4}>
            <Card className="stat-card h-100 shadow-sm border-0" onClick={handleCounselingClick} style={{ cursor: 'pointer' }}>
             <Card.Body className="d-flex align-items-center">
               <div className="stat-icon-wrapper courses me-3">
                 <FaComments className="stat-icon" />
               </div>
               <div className="card-content-mob-box">
                 <h6 className="stat-label text-muted mb-1">Counseling Requests</h6>
                 <h2 className="stat-value mb-0">{loading ? <Spinner size="sm" animation="border" /> : counselingData.length}</h2>
               </div>
             </Card.Body>
           </Card>
 </Col>
         <Col xs={12} sm={12} md={6} lg={4}>
            <Card className="stat-card h-100 shadow-sm border-0" onClick={() => { handleNotificationsClick(); setShowNotificationsListModal(true) }} style={{ cursor: 'pointer' }}>
             <Card.Body className="d-flex align-items-center">
               <div className="stat-icon-wrapper courses me-3" style={{ backgroundColor: '#17a2b8' }}>
                 <FaBell className="stat-icon" />
               </div>
               <div className="card-content-mob-box">
                 <h6 className="stat-label text-muted mb-1">Notifications</h6>
                 <h2 className="stat-value mb-0">{loading ? <Spinner size="sm" animation="border" /> : adminNotificationCount}</h2>
               </div>
             </Card.Body>
           </Card>
 </Col>
         <Col xs={12} sm={12} md={6} lg={4}>
            <Card className="stat-card h-100 shadow-sm border-0" onClick={handleEventsClick} style={{ cursor: 'pointer' }}>
             <Card.Body className="d-flex align-items-center">
               <div className="stat-icon-wrapper courses me-3" style={{ backgroundColor: '#6f42c1' }}>
                 <FaCalendarAlt className="stat-icon" />
               </div>
               <div className="card-content-mob-box">
                 <h6 className="stat-label text-muted mb-1">Events</h6>
                 <h2 className="stat-value mb-0">{loading ? <Spinner size="sm" animation="border" /> : eventsCount}</h2>
               </div>
             </Card.Body>
           </Card>
         </Col>
       </Row>
    </div>
  )

  const renderCoursesListView = () => {
    // Filter courses based on selected type
    const filteredCourses = courses.filter(course => course.course_status === courseType)

    return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 page-header">
        <div>
          <Button variant="outline-secondary" size="sm" onClick={handleBackToDashboard} className="me-2">
            <FaArrowLeft /> Dashboard
          </Button>
          <h4 className="d-inline-block align-middle mb-0">All Courses</h4>
        </div>
        {courseType === 'unpaid' && (
          <Button variant="primary" onClick={handleAddCourseClick}>
            <FaPlus className="me-2" /> Add New Course
          </Button>
        )}
      </div>

      <Card className="courses-table-card border">
        <Card.Header className="bg-light border-bottom py-2 px-3">
          <Nav variant="tabs" activeKey={courseType} onSelect={(eventKey) => setCourseType(eventKey)}>
            <Nav.Item>
              <Nav.Link eventKey="unpaid">
                <FaBook className="me-2" /> Courses
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        
        <Card.Header className="bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center paid-btn gap-2">
            <h5 className="mb-0 fw-semibold text-secondary">
              {courseType === 'paid' ? 'Paid' : 'Unpaid'} Courses
            </h5>
          </div>
          <span className="text-muted small">
            Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
          </span>
        </Card.Header>
        
        <Card.Body className="">
          <Row className="g-4">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                 <Col key={course.id} xs={12} md={6} lg={4}>
                   <Card className="course-card h-100 shadow-sm border-0">
                     <Card.Body className="d-flex flex-column">
                       <div className="mb-3">
                         {course.course_img ? (
                           <div className="mb-3">
                             <Image
                               src={`https://brjobsedu.com/gyandhara/gyandhara_backend${course.course_img}`}
                               alt={course.course_name}
                               thumbnail
                               className="img-fluid"
                               style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                             />
                           </div>
                         ) : (
                           <div className="mb-3 bg-light d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
                             <FaBook className="text-muted" style={{ fontSize: '3rem' }}
/>
                           </div>
                         )}
                         <div className="d-flex justify-content-between align-items-start mb-2">
                           <Badge bg="primary" className="">ID: {course.course_id}</Badge>
                           <Badge bg={course.course_status === 'paid' ? 'success' : 'info'} className="">
                             {course.course_status === 'paid' ? 'Paid' : 'Free'}
                           </Badge>
                         </div>
                         {course.start_date && course.end_date && (
                           <div className="mb-2 text-muted small">
                             <i className="far fa-calendar-alt me-1"></i>
                             {course.start_date} to {course.end_date}
                           </div>
                         )}
                         <Card.Title className="fw-bold">{renderContentWithLineBreaks(course.course_name)}</Card.Title>
                       </div>
                       <div className="mt-auto pt-3 border-top">
                         <div className="d-flex flex-wrap gap-1">
                           <Button variant="light" size="sm" className="flex-shrink-0 text-primary" onClick={() => handleViewCourse(course)}>
                             <FaEye className="me-1" /> View
                           </Button>
                           <Button variant="outline-warning" size="sm" className="flex-shrink-0 text-warning" onClick={() => handleEditCourse(course)}>
                             <FaEdit className="me-1" /> Edit
                           </Button>
                           <Button variant="outline-danger" size="sm" className="flex-shrink-0 text-danger" onClick={() => handleDeleteCourse(course)}>
                             <FaTrash className="me-1" /> Delete
                           </Button>
                           <Button variant="outline-info" size="sm" className="flex-shrink-0 text-info" onClick={() => handleAddModule(course)}>
                             <FaLayerGroup className="me-1" /> Add Module
                           </Button>
                         </div>
                       </div>
                     </Card.Body>
                   </Card>
                 </Col>
              ))
            ) : (
              <Col xs={12}>
                <Card className="shadow-sm border-0 text-center p-5">
                  <p className="text-muted mb-0">No {courseType} courses found</p>
                </Card>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>
    </div>
  )
  }

  const renderModulesView = () => (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 page-header">
        <Button variant="outline-secondary" size="sm" onClick={() => setCurrentView('list')}>
          <FaArrowLeft /> Back to Courses
        </Button>
        <h4 className="mb-0">Module Management</h4>
      </div>

      {/* Course Information */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h5 className="mb-3">
            <FaBook className="me-2" /> {renderContentWithLineBreaks(moduleViewData?.course?.course_name)}
          </h5>
          <p className="text-muted small">
            Course ID: {moduleViewData?.course?.course_id}
          </p>
        </Card.Body>
      </Card>

      {/* Add Module Form */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-primary text-white">
          <FaPlus className="me-2" /> Add New Module
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleAddModuleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Module Title (English)</Form.Label>
              <Form.Control
                type="text"
                value={moduleFormData.mod_title}
                onChange={(e) => setModuleFormData({ ...moduleFormData, mod_title: e.target.value })}
                placeholder="e.g. Introduction to Python"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Module Title (Hindi)</Form.Label>
              <Form.Control
                type="text"
                value={moduleFormData.mod_title_hindi}
                onChange={(e) => setModuleFormData({ ...moduleFormData, mod_title_hindi: e.target.value })}
                placeholder="e.g. पायथन का परिचय"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Module Order</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={moduleFormData.order}
                onChange={(e) => setModuleFormData({ ...moduleFormData, order: parseInt(e.target.value) })}
                required
              />
            </Form.Group>

            {moduleViewData?.course?.course_status === 'unpaid' && (
              <Form.Group className="mb-3">
                <Form.Label>Video Link</Form.Label>
                <Form.Control
                  type="url"
                  value={moduleFormData.video_link}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, video_link: e.target.value })}
                  placeholder="e.g. https://youtube.com/watch?v=..."
                />
              </Form.Group>
            )}

            <Button variant="primary" type="submit">
              <FaPlus className="me-2" /> {moduleFormData.module_id ? 'Update Module' : 'Add Module'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Modules List */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-info text-white">
          <FaLayerGroup className="me-2" /> Modules ({modules.length})
        </Card.Header>
        <Card.Body>
          {loadingModules ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading modules...</p>
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center text-muted">
              <p>No modules found for this course.</p>
              <p>Add your first module above!</p>
            </div>
          ) : (
            <div className="modules-list">
              {modules.map((module, index) => (
                <Card key={module.module_id} className="mb-3 border-left-primary">
                  <Card.Body>
                     <div className="d-flex justify-content-between align-items-start mb-3">
                       <div className="flex-grow-1">
                         <h6 className="fw-bold mb-1">
                           Module {module.order}: {renderContentWithLineBreaks(module.mod_title)}
                         </h6>
                         {module.mod_title_hindi && (
                           <p className="small text-muted mb-0 fst-italic">
                             {renderContentWithLineBreaks(module.mod_title_hindi)}
                           </p>
                         )}
                       </div>
                       <Badge bg="secondary">ID: {module.module_id}</Badge>
                     </div>
                     {module.video_link && (
                       <div className="mb-2">
                         <a href={module.video_link} target="_blank" rel="noopener noreferrer" className="text-info small">
                           <FaEye className="me-1" /> Watch Video
                         </a>
                       </div>
                     )}
                     {module.sub_modules && module.sub_modules.length > 0 && (
                       <div className="mb-3 p-2 border rounded bg-light">
                         <h6 className="small fw-bold mb-2">Submodules ({module.sub_modules.length})</h6>
                         {module.sub_modules.map((submod, subIndex) => (
                           <div key={subIndex} className="mb-2 p-2 border rounded bg-white">
                             <p className="small fw-bold mb-1">{renderContentWithLineBreaks(submod.sub_modu_title)}</p>
                             {submod.sub_modu_title_hindi && (
                               <p className="small text-muted mb-1 fst-italic">{renderContentWithLineBreaks(submod.sub_modu_title_hindi)}</p>
                             )}
                             <p className="small mb-1">{renderContentWithLineBreaks(submod.sub_modu_description)}</p>
                             {submod.sub_modu_description_hindi && (
                               <p className="small text-muted mb-2 fst-italic">{renderContentWithLineBreaks(submod.sub_modu_description_hindi)}</p>
                             )}
                           </div>
                         ))}
                       </div>
                     )}
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        onClick={() => handleAddSubmodules(moduleViewData.course, module)}
                      >
                        <FaLayerGroup className="me-1" /> Add Submodule
                      </Button>
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        onClick={() => handleAddQuestions(moduleViewData.course, module)}
                      >
                        <FaList className="me-1" /> Add Questions
                      </Button>
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        onClick={() => handleAddExercises(moduleViewData.course, module)}
                      >
                        <FaImage className="me-1" /> Add Exercises
                      </Button>
                      <Button 
                        variant="outline-warning" 
                        size="sm"
                        onClick={() => handleEditModule(module)}
                      >
                        <FaEdit className="me-1" /> Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteModule(module)}
                      >
                        <FaTrash className="me-1" /> Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )

  const renderCourseForm = () => (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 page-header">
        <Button variant="outline-secondary" size="sm" onClick={() => setCurrentView('list')}>
          <FaArrowLeft /> Back to List
        </Button>
        <h4 className="mb-0">{courseFormData.course_id ? 'Edit Course' : 'Create New Course'}</h4>
      </div>

      <Card className="shadow-sm border-0 form-card">
        <Card.Body>
          <Form onSubmit={handleCourseFormSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Course Name</Form.Label>
              <Form.Control 
                type="text" 
                value={courseFormData.course_name}
                onChange={(e) => setCourseFormData({...courseFormData, course_name: e.target.value})}
                placeholder="e.g. Python Full Stack"
                required 
                disabled={submitting}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Start Date</Form.Label>
              <Form.Control 
                type="date" 
                value={courseFormData.start_date}
                onChange={(e) => setCourseFormData({...courseFormData, start_date: e.target.value})}
                required 
                disabled={submitting}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={courseFormData.end_date}
                onChange={(e) => setCourseFormData({...courseFormData, end_date: e.target.value})}
                required
                disabled={submitting}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Course Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    setCourseFormData({ ...courseFormData, course_img: file })
                  }
                }}
                disabled={submitting}
              />
              {(courseFormData.course_img || courseFormData.existing_course_img) && (
                <div className="mt-2">
                  <Image
                    src={courseFormData.course_img 
                      ? URL.createObjectURL(courseFormData.course_img)
                      : `https://brjobsedu.com/gyandhara/gyandhara_backend${courseFormData.existing_course_img}`
                    }
                    alt="Course preview"
                    thumbnail
                    className="img-fluid"
                    style={{ maxWidth: '200px' }}
                  />
                  {courseFormData.existing_course_img && !courseFormData.course_img && (
                    <p className="small text-muted mt-1">Current image (upload new file to replace)</p>
                  )}
                </div>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="primary" type="submit" size="lg" disabled={submitting}>
                {submitting ? <Spinner as="span" animation="border" size="sm" /> : (courseFormData.course_id ? 'Update Course' : 'Create Course')}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )

  const renderSubmodulesView = () => (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 page-header">
        <Button variant="outline-secondary" size="sm" onClick={() => setCurrentView('modules')}>
          <FaArrowLeft /> Back to Modules
        </Button>
        <h4 className="mb-0">Submodule Management</h4>
      </div>

      {/* Course and Module Information */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h5 className="mb-3">
            <FaBook className="me-2" /> {renderContentWithLineBreaks(submodulesViewData?.course?.course_name)}
          </h5>
          <p className="text-muted small">
            Course ID: {submodulesViewData?.course?.course_id}
          </p>
          <p className="text-muted small">
            Module: {renderContentWithLineBreaks(submodulesViewData?.module?.mod_title)} (ID: {submodulesViewData?.module?.module_id})
          </p>
        </Card.Body>
      </Card>

      {/* Add Submodule Form */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-primary text-white">
          <FaPlus className="me-2" /> Add New Submodule
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleAddSubmoduleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Submodule Title (English)</Form.Label>
              <Form.Control
                type="text"
                value={submoduleFormData.sub_modu_title}
                onChange={(e) => setSubmoduleFormData({ ...submoduleFormData, sub_modu_title: e.target.value })}
                placeholder="e.g. Introduction"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Submodule Title (Hindi)</Form.Label>
              <Form.Control
                type="text"
                value={submoduleFormData.sub_modu_title_hindi}
                onChange={(e) => setSubmoduleFormData({ ...submoduleFormData, sub_modu_title_hindi: e.target.value })}
                placeholder="e.g. परिचय"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Submodule Description (English)</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={submoduleFormData.sub_modu_description}
                onChange={(e) => setSubmoduleFormData({ ...submoduleFormData, sub_modu_description: e.target.value })}
                placeholder="e.g. Basic concepts"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Submodule Description (Hindi)</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={submoduleFormData.sub_modu_description_hindi}
                onChange={(e) => setSubmoduleFormData({ ...submoduleFormData, sub_modu_description_hindi: e.target.value })}
                placeholder="e.g. मूल अवधारणाएं"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Order</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={submoduleFormData.order}
                onChange={(e) => setSubmoduleFormData({ ...submoduleFormData, order: parseInt(e.target.value) })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label>Sections</Form.Label>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={handleAddSubModSection}
                >
                  <FaPlus className="me-1" /> Add Section
                </Button>
              </div>
              {submoduleFormData.sub_mod.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-4 p-3 border rounded bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Label className="small fw-bold">Section {sectionIndex + 1}</Form.Label>
                    {submoduleFormData.sub_mod.length > 1 && (
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleRemoveSubModSection(sectionIndex)}
                      >
                        <FaTrash className="me-1" /> Remove
                      </Button>
                    )}
                  </div>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="small">Section Title (English)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Introduction to Python"
                      value={section.title}
                      onChange={(e) => handleSubModSectionChange(sectionIndex, 'title', e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small">Section Title (Hindi)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. पायथन का परिचय"
                      value={submoduleFormData.sub_mod_hindi && submoduleFormData.sub_mod_hindi[sectionIndex]?.title || ''}
                      onChange={(e) => {
                        const newSubModHindi = [...(submoduleFormData.sub_mod_hindi || [])]
                        if (!newSubModHindi[sectionIndex]) {
                          newSubModHindi[sectionIndex] = { title: '', description: '' }
                        }
                        newSubModHindi[sectionIndex].title = e.target.value
                        setSubmoduleFormData({ ...submoduleFormData, sub_mod_hindi: newSubModHindi })
                      }}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="small">Section Description (English)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      placeholder="e.g. Basic concepts and fundamentals"
                      value={section.description}
                      onChange={(e) => handleSubModSectionChange(sectionIndex, 'description', e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small">Section Description (Hindi)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      placeholder="e.g. मूल अवधारणाएं और बुनियादी बातें"
                      value={submoduleFormData.sub_mod_hindi && submoduleFormData.sub_mod_hindi[sectionIndex]?.description || ''}
                      onChange={(e) => {
                        const newSubModHindi = [...(submoduleFormData.sub_mod_hindi || [])]
                        if (!newSubModHindi[sectionIndex]) {
                          newSubModHindi[sectionIndex] = { title: '', description: '' }
                        }
                        newSubModHindi[sectionIndex].description = e.target.value
                        setSubmoduleFormData({ ...submoduleFormData, sub_mod_hindi: newSubModHindi })
                      }}
                    />
                  </Form.Group>
                </div>
              ))}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {submoduleFormData.image && (
                <div className="mt-2">
                  <Image 
                    src={URL.createObjectURL(submoduleFormData.image)} 
                    alt="Preview" 
                    thumbnail 
                    className="img-fluid" 
                    style={{ maxWidth: '200px' }}
                  />
                </div>
              )}
            </Form.Group>

            <Button variant="primary" type="submit">
              <FaPlus className="me-2" /> {submoduleFormData.sub_module_id ? 'Update Submodule' : 'Add Submodule'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Submodules List */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-info text-white">
          <FaLayerGroup className="me-2" /> Submodules ({submodules.length})
        </Card.Header>
        <Card.Body>
          {loadingSubmodules ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading submodules...</p>
            </div>
          ) : submodules.length === 0 ? (
            <div className="text-center text-muted">
              <p>No submodules found for this module.</p>
              <p>Add your first submodule above!</p>
            </div>
          ) : (
            <div className="submodules-list">
              {submodules.map((submodule, index) => (
                <Card key={submodule.sub_module_id} className="mb-3 border-left-primary">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1">
                          Submodule {submodule.order}: {renderContentWithLineBreaks(submodule.sub_modu_title)}
                        </h6>
                        {submodule.sub_modu_title_hindi && (
                          <p className="small text-muted mb-0 fst-italic">{renderContentWithLineBreaks(submodule.sub_modu_title_hindi)}</p>
                        )}
                      </div>
                      <Badge bg="secondary">ID: {submodule.sub_module_id}</Badge>
                    </div>
                    
                    <div className="mb-3">
                      <p className="mb-1">{renderContentWithLineBreaks(submodule.sub_modu_description)}</p>
                      {submodule.sub_modu_description_hindi && (
                        <p className="text-muted small fst-italic mb-0">{renderContentWithLineBreaks(submodule.sub_modu_description_hindi)}</p>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="small fw-bold mb-2">Sections (English):</h6>
                      {submodule.sub_mod && submodule.sub_mod.length > 0 ? (
                        submodule.sub_mod.map((section, sectionIndex) => (
                          <div key={sectionIndex} className="mb-2 p-2 border rounded bg-light">
                            <h6 className="small fw-bold mb-1">
                              Section {sectionIndex + 1}: {renderContentWithLineBreaks(section.title || 'Untitled Section')}
                            </h6>
                            {section.description && (
                              <p className="small mb-0">{renderContentWithLineBreaks(section.description)}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="small text-muted">No English sections found</p>
                      )}
                    </div>

                    {submodule.sub_mod_hindi && submodule.sub_mod_hindi.length > 0 && (
                      <div className="mb-3">
                        <h6 className="small fw-bold mb-2">Sections (हिंदी):</h6>
                        {submodule.sub_mod_hindi.map((section, sectionIndex) => (
                          <div key={sectionIndex} className="mb-2 p-2 border rounded bg-light">
                            <h6 className="small fw-bold mb-1">
                              Section {sectionIndex + 1}: {renderContentWithLineBreaks(section.title || 'Untitled Section')}
                            </h6>
                            {section.description && (
                              <p className="small mb-0">{renderContentWithLineBreaks(section.description)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {submodule.image && (
                      <div className="mb-3">
                        <Image 
                          src={`https://brjobsedu.com/gyandhara/gyandhara_backend${submodule.image}`} 
                          alt="Submodule" 
                          thumbnail 
                          className="img-fluid"
                          style={{ maxWidth: '200px' }}
                        />
                      </div>
                    )}
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-warning" 
                        size="sm"
                        onClick={() => handleEditSubmodule(submodule)}
                      >
                        <FaEdit className="me-1" /> Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteSubmodule(submodule)}
                      >
                        <FaTrash className="me-1" /> Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )

  const renderExercisesView = () => (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 page-header">
        <Button variant="outline-secondary" size="sm" onClick={() => setCurrentView('modules')}>
          <FaArrowLeft /> Back to Modules
        </Button>
        <h4 className="mb-0">Exercises Management</h4>
      </div>

      {/* Course and Module Information */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h5 className="mb-3">
            <FaBook className="me-2" /> {renderContentWithLineBreaks(exercisesViewData?.course?.course_name)}
          </h5>
          <p className="text-muted small">
            Course ID: {exercisesViewData?.course?.course_id}
          </p>
          <p className="text-muted small">
            Module: {renderContentWithLineBreaks(exercisesViewData?.module?.mod_title)} (ID: {exercisesViewData?.module?.module_id})
          </p>
        </Card.Body>
      </Card>

      {/* Add Exercise Form */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-primary text-white">
          <FaPlus className="me-2" /> {exerciseFormData.id ? 'Edit Exercise' : 'Add New Exercise'}
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleAddExerciseSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Image Name</Form.Label>
              <Form.Control
                type="text"
                value={exerciseFormData.img_name}
                onChange={(e) => setExerciseFormData({ ...exerciseFormData, img_name: e.target.value })}
                placeholder="e.g. bike"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleExerciseImageChange}
              />
              {exerciseFormData.img && (
                <div className="mt-2">
                  <Image 
                    src={URL.createObjectURL(exerciseFormData.img)} 
                    alt="Preview" 
                    thumbnail 
                    className="img-fluid" 
                    style={{ maxWidth: '200px' }}
                  />
                </div>
              )}
            </Form.Group>

            <Button variant="primary" type="submit">
              <FaPlus className="me-2" /> {exerciseFormData.id ? 'Update Exercise' : 'Add Exercise'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Exercises List */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-info text-white">
          <FaImage className="me-2" /> Exercises ({exercises.length})
        </Card.Header>
        <Card.Body>
          {loadingExercises ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading exercises...</p>
            </div>
          ) : exercises.length === 0 ? (
            <div className="text-center text-muted">
              <p>No exercises found.</p>
              <p>Add your first exercise above!</p>
            </div>
          ) : (
            <div className="exercises-list">
              {exercises.map((exercise) => (
                <Card key={exercise.id} className="mb-2 border-left-primary">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1">
                          {renderContentWithLineBreaks(exercise.img_name)}
                        </h6>
                        <Badge bg="secondary" className="small">ID: {exercise.id}</Badge>
                      </div>
                      {exercise.img && (
                        <div className="me-3">
                          <Image 
                            src={`https://brjobsedu.com/gyandhara/gyandhara_backend${exercise.img}`} 
                            alt={exercise.img_name} 
                            thumbnail 
                            className="img-fluid"
                            style={{ maxWidth: '80px', maxHeight: '60px' }}
                          />
                        </div>
                      )}
                      <div className="d-flex gap-1">
                        <Button 
                          variant="outline-warning" 
                          size="sm"
                          onClick={() => handleEditExercise(exercise)}
                        >
                          <FaEdit className="me-1" /> Edit
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteExercise(exercise)}
                        >
                          <FaTrash className="me-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )

  const renderQuestionsView = () => (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 page-header">
        <Button variant="outline-secondary" size="sm" onClick={() => setCurrentView('list')}>
          <FaArrowLeft /> Back to Courses
        </Button>
        <h4 className="mb-0">Questions Management</h4>
      </div>

      {/* Course and Module Selection */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h5 className="mb-3">
            <FaBook className="me-2" /> {renderContentWithLineBreaks(questionsViewData?.course?.course_name)}
          </h5>
          <div className="mb-3">
            <label className="form-label fw-bold">Select Module:</label>
            <div className="d-flex flex-wrap gap-2">
              {questionsViewData?.course?.modules?.map((module, index) => (
                <Button
                  key={index}
                  variant={questionsViewData.module?.module_id === module.module_id ? 'primary' : 'outline-primary'}
                  onClick={() => {
                    setQuestionsViewData({ ...questionsViewData, module })
                    fetchQuestions(questionsViewData.course.course_id, module.module_id)
                  }}
                >  
                  {renderContentWithLineBreaks(module.mod_title)}
                </Button>
              ))}
            </div>
          </div>
        </Card.Body>
      </Card>

      {questionsViewData?.module && (
        <>
          {/* Add Question Form */}
          <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-primary text-white">
              <FaPlus className="me-2" /> {questionFormData.id ? 'Edit Question' : 'Add New Question'}
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAddQuestion}>
                <Form.Group className="mb-3">
                  <Form.Label>Question Text (English)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={questionFormData.question_text}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, question_text: e.target.value })}
                    placeholder="Enter your question here..."
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Question Text (Hindi)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={questionFormData.question_text_hindi}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, question_text_hindi: e.target.value })}
                    placeholder="अपना प्रश्न यहाँ दर्ज करें..."
                    required
                  />
                </Form.Group>

                <div className="mb-3">
                  <Form.Label>Options (English)</Form.Label>
                  {questionFormData.options.map((option, index) => (
                    <Form.Group key={index} className="mb-2">
                      <InputGroup>
                        <InputGroup.Text>{String.fromCharCode(65 + index)}</InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...questionFormData.options]
                            newOptions[index] = e.target.value
                            setQuestionFormData({ ...questionFormData, options: newOptions })
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          required
                        />
                      </InputGroup>
                    </Form.Group>
                  ))}
                </div>

                <div className="mb-3">
                  <Form.Label>Options (Hindi)</Form.Label>
                  {questionFormData.options_hindi.map((option, index) => (
                    <Form.Group key={index} className="mb-2">
                      <InputGroup>
                        <InputGroup.Text>{String.fromCharCode(65 + index)}</InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...questionFormData.options_hindi]
                            newOptions[index] = e.target.value
                            setQuestionFormData({ ...questionFormData, options_hindi: newOptions })
                          }}
                          placeholder={`विकल्प ${String.fromCharCode(65 + index)}`}
                          required
                        />
                      </InputGroup>
                    </Form.Group>
                  ))}
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Correct Answer</Form.Label>
                  <Form.Select
                    value={questionFormData.correct_answer}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, correct_answer: parseInt(e.target.value) })}
                    required
                  >
                    {questionFormData.options.map((_, index) => (
                      <option key={index} value={index}>
                        {String.fromCharCode(65 + index)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Marks</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={questionFormData.marks}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, marks: parseInt(e.target.value) })}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit">
                  <FaPlus className="me-2" /> {questionFormData.id ? 'Update Question' : 'Add Question'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Questions List */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-info text-white">
              <FaList className="me-2" /> Questions ({questions.length})
            </Card.Header>
            <Card.Body>
              {loadingQuestions ? (
                <div className="text-center">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading questions...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center text-muted">
                  <p>No questions found for this module.</p>
                  <p>Add your first question above!</p>
                </div>
              ) : (
                <div className="questions-list">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="mb-3 border-left-primary">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h6 className="fw-bold mb-0">
                            Question {index + 1} ({question.marks} mark{question.marks > 1 ? 's' : ''})
                          </h6>
                        </div>
                        <p className="mb-1 fw-bold">{question.question_text}</p>
                        {question.question_text_hindi && (
                          <p className="mb-3 text-muted small fst-italic">{question.question_text_hindi}</p>
                        )}
                        <div className="mb-3">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="mb-2">
                              <div className={`d-inline-block px-2 py-1 rounded ${
                                optIndex === question.correct_answer 
                                  ? 'bg-success text-white' 
                                  : 'bg-light'
                              }`}>
                                {String.fromCharCode(65 + optIndex)}. 
                              </div>
                              <span className="ms-2">{option}</span>
                              {question.options_hindi && question.options_hindi[optIndex] && (
                                <span className="ms-2 text-muted small fst-italic">({question.options_hindi[optIndex]})</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="text-muted small mb-2">
                          Correct Answer: <span className="fw-bold text-success">
                            {String.fromCharCode(65 + question.correct_answer)}
                          </span>
                        </div>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-warning" 
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                          >
                            <FaEdit className="me-1" /> Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteQuestion(question)}
                          >
                            <FaTrash className="me-1" /> Delete
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  )

    const renderCounselingView = () => {
      // Filter data based on selected schools and classes
      const filteredData = counselingData.filter(item => {
        const schoolMatch = selectedSchools.length === 0 || 
          (item.student_details?.school_name && selectedSchools.includes(item.student_details.school_name))
        const classMatch = selectedClasses.length === 0 || 
          (item.student_details?.class_name && selectedClasses.includes(item.student_details.class_name))
        return schoolMatch && classMatch
      })
      
      const totalPages = Math.ceil(filteredData.length / counselingItemsPerPage)
      const startIndex = (counselingPage - 1) * counselingItemsPerPage
      const endIndex = startIndex + counselingItemsPerPage
      const currentItems = filteredData.slice(startIndex, endIndex)

      // Export to PDF - Manual table drawing (no plugin dependency)
      const exportToPDF = () => {
        try {
          const doc = new jsPDF({ orientation: 'landscape' })
          const pageWidth = doc.internal.pageSize.getWidth()
          const pageHeight = doc.internal.pageSize.getHeight()
          const margin = 8
          const availableWidth = pageWidth - (margin * 2)
          
          // Title
          doc.setFontSize(14)
          doc.text('Counseling Requests Report', margin, 12)
          doc.setFontSize(9)
          doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, 18)
          doc.text(`Total Records: ${filteredData.length}`, margin, 23)
          
          // Column definitions - optimized proportional widths for landscape
          const headers = ['#', 'ID', 'Name', 'School', 'S.ID', 'Phone', 'Dist', 'Block', 'Class', 'Category', 'Status']
          // Total = 280 units (fits better in landscape)
          const colWidths = [8, 20, 35, 40, 25, 28, 22, 22, 12, 40, 28]
          const totalWidth = colWidths.reduce((a, b) => a + b, 0)
          
          // Scale columns to fit available width
          const scaleFactor = availableWidth / totalWidth
          const scaledColWidths = colWidths.map(w => w * scaleFactor)
          
          let y = 28
          const startX = margin
          const rowHeight = 5.5
          const headerHeight = 6.5
          
          // Function to draw a row
          const drawRow = (cells, yPos, isHeader = false) => {
            let x = startX
            const rowHeightToUse = isHeader ? headerHeight : rowHeight
            
            if (isHeader) {
              doc.setFillColor(41, 128, 185)
              doc.rect(startX, yPos - 4, availableWidth, rowHeightToUse, 'F')
              doc.setTextColor(255, 255, 255)
              doc.setFontSize(7.5)
            } else {
              doc.setTextColor(0, 0, 0)
              doc.setFontSize(6.5)
              // Draw alternating row colors
              if (cells[0] % 2 === 0) {
                doc.setFillColor(240, 245, 250)
                doc.rect(startX, yPos - 4, availableWidth, rowHeightToUse, 'F')
              }
            }
            
            cells.forEach((cell, i) => {
              let text = typeof cell === 'string' ? cell : String(cell)
              const colWidth = scaledColWidths[i]
              
              // Better text truncation based on column width
              const maxChars = Math.floor(colWidth / 1.8)
              if (text.length > maxChars) {
                text = text.substring(0, maxChars - 1) + '..'
              }
              
              // Draw cell border
              doc.setDrawColor(200, 200, 200)
              doc.rect(x, yPos - 4, colWidth, rowHeightToUse)
              
              // Add text with padding
              doc.text(text, x + 1.5, yPos + (isHeader ? 0.5 : 0.3), { maxWidth: colWidth - 3 })
              x += colWidth
            })
            
            doc.setTextColor(0, 0, 0)
            return yPos + rowHeightToUse
          }
          
          // Draw header
          y = drawRow(headers, y, true) + 1
          
          // Draw data rows
          filteredData.forEach((counseling, index) => {
            const student = counseling.student_details || {}
            
            // Check for page break (leave room for page number)
            if (y > pageHeight - 15) {
              doc.addPage()
              y = 12
              y = drawRow(headers, y, true) + 1
            }
            
            const cells = [
              index + 1,
              (student.student_id || counseling.student_id || '-').substring(0, 8),
              (student.full_name || student.candidate_name || '-').substring(0, 20),
              (student.school_name || '-').substring(0, 15),
              (student.school_uni_id || '-').substring(0, 10),
              (student.phone || student.mobile_no || '-').substring(0, 10),
              (student.district || '-').substring(0, 8),
              (student.block || '-').substring(0, 8),
              (student.class_name || '-').substring(0, 5),
              Array.isArray(counseling.category_consulting) 
                ? counseling.category_consulting.join(', ').substring(0, 15)
                : (counseling.category_consulting || '-').substring(0, 15),
              (counseling.status || 'pending').substring(0, 8)
            ]
            
            y = drawRow(cells, y)
          })
          
          // Add footer with page numbers
          const totalPages = doc.internal.getNumberOfPages()
          for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i)
            doc.setFontSize(7)
            doc.setTextColor(150, 150, 150)
            doc.text(
              `Page ${i} of ${totalPages}`,
              pageWidth - margin - 20,
              pageHeight - 5
            )
          }
          
          doc.save('counseling-requests.pdf')
        } catch (error) {
          console.error('PDF export error:', error)
          alert('Failed to generate PDF. Error: ' + error.message)
        }
      }

      // Export to Excel
      const exportToExcel = () => {
        const data = filteredData.map((counseling, index) => {
          const student = counseling.student_details || {}
          return {
            '#': index + 1,
            'Student ID': student.student_id || counseling.student_id || '-',
            'Full Name': student.full_name || student.candidate_name || '-',
            'School Name': student.school_name || '-',
            'School ID': student.school_uni_id || '-',
            'Phone': student.phone || student.mobile_no || '-',
            'Email': student.email || 'N/A',
            'District': student.district || '-',
            'Block': student.block || '-',
            'State': student.state || '-',
            'Class': student.class_name || '-',
            'Category': Array.isArray(counseling.category_consulting) 
              ? counseling.category_consulting.join(', ') 
              : (counseling.category_consulting || '-'),
            'Status': counseling.status || 'pending',
            'Requested At': new Date(counseling.created_at || student.created_at || Date.now()).toLocaleString()
          }
        })
        
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Counseling Requests')
        XLSX.writeFile(wb, 'counseling-requests.xlsx')
      }

      const handleSchoolFilterChange = (e) => {
        const value = e.target.value
        if (value) {
          setSelectedSchools(prev => 
            prev.includes(value) 
              ? prev.filter(s => s !== value)
              : [...prev, value]
          )
          setCounselingPage(1) // Reset to first page when filter changes
        }
      }

      const handleClassFilterChange = (e) => {
        const value = e.target.value
        if (value) {
          setSelectedClasses(prev => 
            prev.includes(value) 
              ? prev.filter(c => c !== value)
              : [...prev, value]
          )
          setCounselingPage(1) // Reset to first page when filter changes
        }
      }

      const clearSchoolFilter = () => {
        setSelectedSchools([])
        setCounselingPage(1) // Reset to first page when filter cleared
      }

      const clearClassFilter = () => {
        setSelectedClasses([])
        setCounselingPage(1) // Reset to first page when filter cleared
      }

      const clearAllFilters = () => {
        setSelectedSchools([])
        setSelectedClasses([])
        setCounselingPage(1)
      }

     return (
       <div className="fade-in">
         <div className="d-flex justify-content-between align-items-center mb-4 page-header">
           <Button variant="outline-secondary" size="sm" onClick={handleBackToDashboard}>
             <FaArrowLeft /> Dashboard
           </Button>
           <h4 className="mb-0">Counseling Requests</h4>
         </div>

          <Card className="shadow-sm border-0 mb-3">
            <Card.Body>
              <Row className="g-3 align-items-center">
                <Col md={6}>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <FaFilter className="text-muted me-2" />
                    <strong>Filter by Institution:</strong>
                    <Form.Control
                      as="select"
                      size="sm"
                      style={{ minWidth: '250px' }}
                      onChange={handleSchoolFilterChange}
                      value=""
                    >
                      <option value="">Select school to filter...</option>
                      {uniqueSchools.map((school, index) => (
                        <option key={index} value={school}>{school}</option>
                      ))}
                    </Form.Control>
                    {selectedSchools.length > 0 && (
                      <>
                        <Button variant="outline-secondary" size="sm" onClick={clearSchoolFilter}>
                          Clear
                        </Button>
                        <div className="d-flex flex-wrap gap-1">
                          {selectedSchools.map(school => (
                            <Badge key={school} bg="secondary" className="d-flex align-items-center">
                              {school}
                              <span 
                                style={{ cursor: 'pointer', marginLeft: '5px' }}
                                onClick={() => setSelectedSchools(prev => prev.filter(s => s !== school))}
                              >
                                ×
                              </span>
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    <FaFilter className="text-muted me-2" />
                    <strong>Filter by Class:</strong>
                    <Form.Control
                      as="select"
                      size="sm"
                      style={{ minWidth: '200px' }}
                      onChange={handleClassFilterChange}
                      value=""
                    >
                      <option value="">Select class to filter...</option>
                      {uniqueClasses.map((cls, index) => (
                        <option key={index} value={cls}>{cls}</option>
                      ))}
                    </Form.Control>
                    {selectedClasses.length > 0 && (
                      <>
                        <Button variant="outline-secondary" size="sm" onClick={clearClassFilter}>
                          Clear
                        </Button>
                        <div className="d-flex flex-wrap gap-1">
                          {selectedClasses.map(cls => (
                            <Badge key={cls} bg="secondary" className="d-flex align-items-center">
                              {cls}
                              <span 
                                style={{ cursor: 'pointer', marginLeft: '5px' }}
                                onClick={() => setSelectedClasses(prev => prev.filter(c => c !== cls))}
                              >
                                ×
                              </span>
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </Col>
                {(selectedSchools.length > 0 || selectedClasses.length > 0) && (
                  <Col md={12} className="mt-2">
                    <Button variant="outline-danger" size="sm" onClick={clearAllFilters}>
                      Clear All Filters
                    </Button>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>

         <Card className="shadow-sm border-0">
           <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
             <span><FaComments className="me-2" /> Counseling Details</span>
             <div className="d-flex gap-2">
               <Button variant="light" size="sm" onClick={exportToPDF}>
                 <FaFilePdf className="me-1" /> Export PDF
               </Button>
               <Button variant="success" size="sm" onClick={exportToExcel}>
                 <FaFileExcel className="me-1" /> Export Excel
               </Button>
             </div>
           </Card.Header>
           <Card.Body>
             {loading ? (
               <div className="text-center">
                 <Spinner animation="border" variant="primary" />
                 <p className="mt-2">Loading...</p>
               </div>
             ) : filteredData.length === 0 ? (
               <p className="text-muted text-center mb-0">No counseling requests found</p>
             ) : (
               <>
                 <div className="table-responsive">
                   <Table striped bordered hover responsive>
                     <thead>
                       <tr>
                         <th>#</th>
                         <th>Student ID</th>
                         <th>Full Name</th>
                         <th>School Name</th>
                         <th>School ID</th>
                         <th>Phone</th>
                         <th>District</th>
                         <th>Block</th>
                         <th>Class</th>
                         <th>Category</th>
                         <th>Status</th>
                         <th>Action</th>
                       </tr>
                     </thead>
                     <tbody>
                       {currentItems.map((counseling, index) => {
                         const student = counseling.student_details || {}
                         return (
                           <tr key={counseling.id}>
                             <td>{startIndex + index + 1}</td>
                             <td>{student.student_id || counseling.student_id || '-'}</td>
                             <td>{student.full_name || student.candidate_name || '-'}</td>
                             <td>{student.school_name || '-'}</td>
                             <td>{student.school_uni_id || '-'}</td>
                             <td>{student.phone || student.mobile_no || '-'}</td>
                             <td>{student.district || '-'}</td>
                             <td>{student.block || '-'}</td>
                             <td>{student.class_name || '-'}</td>
                             <td>
                               {Array.isArray(counseling.category_consulting) 
                                 ? counseling.category_consulting.join(', ') 
                                 : (counseling.category_consulting || '-')}
                             </td>
                             <td>
                               <Badge bg={counseling.status === 'pending' ? 'warning' : counseling.status === 'approved' ? 'success' : 'danger'}>
                                 {counseling.status || 'pending'}
                               </Badge>
                             </td>
                             <td>
                               <Button variant="info" size="sm" onClick={() => handleViewCounseling(counseling)}>
                                 <FaEye className="me-1" /> View
                               </Button>
                             </td>
                           </tr>
                         )
                       })}
                     </tbody>
                   </Table>
                 </div>
                 {totalPages > 1 && (
                   <div className="d-flex justify-content-between align-items-center mt-3">
                     <span className="text-muted small">
                       Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} 
                       {selectedSchools.length > 0 && ` (filtered from ${counselingData.length} total)`}
                     </span>
                     <div className="d-flex gap-2">
                       <Button
                         variant="outline-primary"
                         size="sm"
                         onClick={() => setCounselingPage(prev => Math.max(1, prev - 1))}
                         disabled={counselingPage === 1}
                       >
                         Previous
                       </Button>
                       <span className="d-flex align-items-center px-2">
                         Page {counselingPage} of {totalPages}
                       </span>
                       <Button
                         variant="outline-primary"
                         size="sm"
                         onClick={() => setCounselingPage(prev => Math.min(totalPages, prev + 1))}
                         disabled={counselingPage === totalPages}
                       >
                         Next
                       </Button>
                     </div>
                   </div>
                 )}
               </>
             )}
           </Card.Body>
        </Card>
      </div>
    )
  }

  const renderEventsView = () => (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 page-header">
        <Button variant="outline-secondary" size="sm" onClick={() => { cancelEventEdit(); handleBackToDashboard() }}>
          <FaArrowLeft /> Dashboard
        </Button>
        <div className="d-flex gap-2">
          <Button variant="primary" size="sm" onClick={handleAddEvent}>
            <FaPlus className="me-1" /> Add New Event
          </Button>
          <h4 className="mb-0">Events Management</h4>
        </div>
      </div>

      {(isEditingEvent || isAddingEvent) && (
        <Card className="shadow-sm border-0 mb-4">
          <Card.Header className={isEditingEvent ? "bg-warning text-dark" : "bg-primary text-white"}>
            {isEditingEvent ? <><FaEdit className="me-2" /> Edit Event</> : <><FaPlus className="me-2" /> Add New Event</>}
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleEventSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Event Name</Form.Label>
                <Form.Control
                  type="text"
                  value={eventFormData.event_name}
                  onChange={(e) => setEventFormData({ ...eventFormData, event_name: e.target.value })}
                  placeholder="e.g. Tech Innovation Summit 2026"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Event Name (Hindi)</Form.Label>
                <Form.Control
                  type="text"
                  value={eventFormData.event_name_hindi}
                  onChange={(e) => setEventFormData({ ...eventFormData, event_name_hindi: e.target.value })}
                  placeholder="e.g. वार्षिक टेक सम्मेलन 2026"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Event Type</Form.Label>
                <Form.Control
                  type="text"
                  value={eventFormData.event_type}
                  onChange={(e) => setEventFormData({ ...eventFormData, event_type: e.target.value })}
                  placeholder="e.g. Adventure Event, Technical Event"
                />
              </Form.Group>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Start Date & Time</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={eventFormData.event_date_time}
                      onChange={(e) => setEventFormData({ ...eventFormData, event_date_time: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>End Date & Time</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={eventFormData.end_date_time}
                      onChange={(e) => setEventFormData({ ...eventFormData, end_date_time: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Venue</Form.Label>
                <Form.Control
                  type="text"
                  value={eventFormData.venue}
                  onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })}
                  placeholder="e.g. India Expo Centre, Greater Noida"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Venue (Hindi)</Form.Label>
                <Form.Control
                  type="text"
                  value={eventFormData.venue_hindi}
                  onChange={(e) => setEventFormData({ ...eventFormData, venue_hindi: e.target.value })}
                  placeholder="e.g. दिल्ली कन्वेंशन सेंटर"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  placeholder="Enter event description"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description (Hindi)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={eventFormData.description_hindi}
                  onChange={(e) => setEventFormData({ ...eventFormData, description_hindi: e.target.value })}
                  placeholder="हिंदी में विवरण दर्ज करें"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Event Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleEventImageChange}
                />
                {eventImage && (
                  <div className="mt-2">
                    <Image 
                      src={URL.createObjectURL(eventImage)} 
                      alt="Preview" 
                      thumbnail 
                      className="img-fluid" 
                      style={{ maxWidth: '200px' }}
                    />
                  </div>
                )}
              </Form.Group>

              <div className="d-flex gap-2">
                <Button variant={isEditingEvent ? "warning" : "primary"} type="submit">
                  {isEditingEvent ? <><FaEdit className="me-2" /> Update Event</> : <><FaPlus className="me-2" /> Post Event</>}
                </Button>
                <Button variant="secondary" onClick={cancelEventEdit}>
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
          <div>
            <FaCalendarAlt className="me-2" /> All Events
          </div>
          <Badge bg="light text-dark">{events.length} Events</Badge>
        </Card.Header>
        <Card.Body>
          {loadingEvents ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center text-muted">
              <p>No events found</p>
            </div>
          ) : (
            <Row className="g-4">
              {events.map((event) => (
                <Col key={event.event_id} xs={12} md={6} lg={4}>
                  <Card className="h-100 shadow-sm border-0">
                    {event.event_image && (
                      <Card.Img 
                        variant="top" 
                        src={`https://brjobsedu.com/gyandhara/gyandhara_backend${event.event_image}`} 
                        alt={event.event_name}
                        style={{ height: '160px', objectFit: 'cover' }}
                      />
                    )}
                    <Card.Body className="d-flex flex-column">
                      <div className="mb-2">
                        <Badge bg="primary" className="me-2">ID: {event.event_id}</Badge>
                        {event.event_type && <Badge bg="info">{event.event_type}</Badge>}
                      </div>
                      <Card.Title className="fw-bold">{renderContentWithLineBreaks(event.event_name)}</Card.Title>
                      {event.event_date_time && (
                        <p className="small text-muted mb-1">
                          <FaCalendarAlt className="me-1" />
                          {new Date(event.event_date_time).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                      {event.venue && (
                        <p className="small text-muted mb-2">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {event.venue}
                        </p>
                      )}
                      {event.description && (
                        <p className="small mb-3">{event.description.substring(0, 100)}{event.description.length > 100 ? '...' : ''}</p>
                      )}
                      <div className="mt-auto pt-3 border-top d-flex gap-2 flex-wrap">
                        <Button variant="light" size="sm" className="text-primary" onClick={() => handleViewEvent(event)}>
                          <FaEye className="me-1" /> View
                        </Button>
                        <Button variant="outline-warning" size="sm" onClick={() => handleEditEvent(event)}>
                          <FaEdit className="me-1" /> Edit
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteEvent(event)}>
                          <FaTrash className="me-1" /> Delete
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>
    </div>
  )

  return (
    <div className="dashboard-container">
      <AdminLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <AdminHeader toggleSidebar={toggleSidebar} />
        <div className="dashboard-content">
          <Container fluid className="dashboard-box">
            {currentView === 'dashboard' && renderDashboardView()}
            {currentView === 'unpaidEnrollments' && renderUnpaidEnrollmentsView()}
            {currentView === 'list' && renderCoursesListView()}
            {currentView === 'form' && renderCourseForm()}
            {currentView === 'modules' && renderModulesView()}
            {currentView === 'submodules' && renderSubmodulesView()}
            {currentView === 'questions' && renderQuestionsView()}
            {currentView === 'exercises' && renderExercisesView()}
            {currentView === 'counseling' && renderCounselingView()}
            {currentView === 'events' && renderEventsView()}
          </Container>
        </div>
      </div>

{/* Course Details Modal */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          style={{
            padding: 0
          }}
          contentClassName="border-0"
          dialogClassName="m-0"
        >        <Modal.Header closeButton className="border-bottom py-2 d-flex justify-content-between align-items-center">
            <Modal.Title className="fw-bold fs-5">{renderContentWithLineBreaks(selectedCourse?.course_name)}</Modal.Title>
            <Button variant="light" size="sm" onClick={() => setShowModal(false)} className="rounded-circle" style={{ width: '32px', height: '32px', padding: 0, lineHeight: 1 }}>
              &times;
            </Button>
          </Modal.Header>
          <Modal.Body className="">
            {selectedCourse && (
              <div>
                <div className="mb-3">
                  {selectedCourse.course_img ? (
                    <Image
                      src={`https://brjobsedu.com/gyandhara/gyandhara_backend${selectedCourse.course_img}`}
                      alt={selectedCourse.course_name}
                      thumbnail
                      className="img-fluid"
                      style={{ maxWidth: '300px', height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="bg-light d-flex align-items-center justify-content-center" style={{ width: '300px', height: '200px' }}>
                      <FaBook className="text-muted" style={{ fontSize: '4rem' }} />
                    </div>
                  )}
                </div>
                <p><strong>Course ID:</strong> {selectedCourse.course_id}</p>
                <p><strong>Course Name:</strong> {renderContentWithLineBreaks(selectedCourse.course_name)}</p>
               {selectedCourse.modules && selectedCourse.modules.length > 0 && (
                 <div className="mt-4">
                   <h5>Modules ({selectedCourse.modules.length})</h5>
                   <div className="modules-list">
                     {selectedCourse.modules.map((mod, index) => (
                       <div key={index} className="module-item mb-4 p-3 border rounded">
                         <h6 className="fw-bold mb-1">
                           Module {mod.order}: {renderContentWithLineBreaks(mod.mod_title)}
                           <Badge bg="secondary" className="ms-2">ID: {mod.module_id}</Badge>
                         </h6>
                         {mod.mod_title_hindi && (
                           <p className="small text-muted mb-2 fst-italic">{renderContentWithLineBreaks(mod.mod_title_hindi)}</p>
                         )}
                         
                         {mod.sub_modules && mod.sub_modules.length > 0 && (
                           <div className="mt-3">
                             <h7 className="fw-bold text-muted">Sub-modules ({mod.sub_modules.length})</h7>
                             <div className="submodules-list mt-2">
                               {mod.sub_modules.map((subMod, subIndex) => (
                                 <div key={subIndex} className="submodule-item mb-3 p-2 border rounded bg-light">
                                   <h7 className="fw-bold mb-1">
                                     {renderContentWithLineBreaks(subMod.sub_modu_title)}
                                     <Badge bg="secondary" className="ms-2">ID: {subMod.sub_module_id}</Badge>
                                   </h7>
                                   {subMod.sub_modu_title_hindi && (
                                     <p className="small text-muted mb-1 fst-italic">{renderContentWithLineBreaks(subMod.sub_modu_title_hindi)}</p>
                                   )}
                                   
                                   {subMod.sub_modu_description && (
                                     <p className="small mt-1">{renderContentWithLineBreaks(subMod.sub_modu_description)}</p>
                                   )}
                                   {subMod.sub_modu_description_hindi && (
                                     <p className="small text-muted fst-italic mt-1">{renderContentWithLineBreaks(subMod.sub_modu_description_hindi)}</p>
                                   )}
                                   
                                   {subMod.image && (
                                     <div className="mt-2">
                                       <Image 
                                         src={`https://brjobsedu.com/gyandhara/gyandhara_backend${subMod.image}`} 
                                         alt={subMod.sub_modu_title} 
                                         thumbnail 
                                         className="img-fluid"
                                         style={{ maxWidth: '200px' }}
                                       />
                                     </div>
                                   )}
                                   
                                   {subMod.sub_mod && subMod.sub_mod.length > 0 && (
                                     <div className="mt-2">
                                       <h8 className="fw-bold text-muted small">Sections (English):</h8>
                                       <div className="sections-list mt-1">
                                         {subMod.sub_mod.map((section, sectionIndex) => (
                                           <div key={sectionIndex} className="section-item mb-2 p-1 border rounded">
                                             <h8 className="fw-bold small">
                                               {renderContentWithLineBreaks(section.title || 'Untitled Section')}
                                             </h8>
                                             {section.description && (
                                               <p className="small mt-1">{renderContentWithLineBreaks(section.description)}</p>
                                             )}
                                           </div>
                                         ))}
                                       </div>
                                     </div>
                                   )}

                                   {subMod.sub_mod_hindi && subMod.sub_mod_hindi.length > 0 && (
                                     <div className="mt-2">
                                       <h8 className="fw-bold text-muted small">Sections (हिंदी):</h8>
                                       <div className="sections-list mt-1">
                                         {subMod.sub_mod_hindi.map((section, sectionIndex) => (
                                           <div key={sectionIndex} className="section-item mb-2 p-1 border rounded">
                                             <h8 className="fw-bold small">
                                               {renderContentWithLineBreaks(section.title || 'Untitled Section')}
                                             </h8>
                                             {section.description && (
                                               <p className="small mt-1">{renderContentWithLineBreaks(section.description)}</p>
                                             )}
                                           </div>
                                         ))}
                                       </div>
                                     </div>
                                   )}
                                 </div>
                               ))}
                             </div>
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>
           )}
         </Modal.Body>
       </Modal>

        {/* Student Module Progress Modal */}
        <Modal show={showProgressModal} onHide={() => setShowProgressModal(false)} size="lg" centered>
          <Modal.Header className="bg-info text-white">
            <Modal.Title className="w-100 d-flex justify-content-between align-items-center">
              <span><FaEye className="me-2" /> Student Progress Details</span>
              <Button variant="light" size="sm" onClick={() => setShowProgressModal(false)} className="rounded-circle" style={{ width: '32px', height: '32px', padding: 0, lineHeight: 1 }}>
                &times;
              </Button>
            </Modal.Title>
          </Modal.Header>
         <Modal.Body>
           {selectedProgress && (
             <div>
               <Card className="mb-3">
                 <Card.Body>
                   <Row>
                     <Col md={6}>
                       <p><strong>Student ID:</strong> {selectedProgress.studentId}</p>
                       <p><strong>Student Name:</strong> {selectedProgress.studentName}</p>
                     </Col>
                     <Col md={6} className="text-end">
                       <Badge bg="primary">Total Modules: {selectedProgress.modules.length}</Badge>
                     </Col>
                   </Row>
                 </Card.Body>
               </Card>

               {progressLoading ? (
                 <div className="text-center py-4">
                   <Spinner animation="border" variant="primary" />
                   <p className="mt-2">Loading progress...</p>
                 </div>
               ) : selectedProgress.modules.length === 0 ? (
                 <p className="text-muted text-center">No progress data available for this student.</p>
               ) : (
                 <div className="table-responsive">
                   <Table striped bordered hover responsive>
                     <thead className="table-light">
                       <tr>
                         <th>#</th>
                         <th>Module ID</th>
                         <th>Module Status</th>
                         <th>Test Status</th>
                         <th>Test Score</th>
                         <th>Attempts</th>
                         <th>Completed At</th>
                       </tr>
                     </thead>
                     <tbody>
                       {selectedProgress.modules.map((progress, index) => (
                         <tr key={progress.id || index}>
                           <td>{index + 1}</td>
                           <td><Badge bg="secondary">{progress.module}</Badge></td>
                           <td>
                             <Badge bg={progress.module_status === 'completed' ? 'success' : progress.module_status === 'in_progress' ? 'warning' : 'secondary'}>
                               {progress.module_status || 'not_started'}
                             </Badge>
                           </td>
                           <td>
                             <Badge bg={
                               progress.test_status === 'passed' ? 'success' :
                               progress.test_status === 'failed' ? 'danger' :
                               progress.test_status === 'attempted' ? 'warning' : 'secondary'
                             }>
                               {progress.test_status || 'not_attempted'}
                             </Badge>
                           </td>
                           <td>
                             {progress.test_score !== null && progress.test_score !== undefined
                               ? `${progress.test_score}%`
                               : '-'
                             }
                           </td>
                           <td>{progress.attempt_count || 0}</td>
                           <td className="small">
                             {progress.completed_at
                               ? new Date(progress.completed_at).toLocaleString()
                               : '-'
                             }
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </Table>
                 </div>
               )}
             </div>
           )}
         </Modal.Body>
         <Modal.Footer>
           <Button variant="secondary" onClick={() => setShowProgressModal(false)}>
             Close
           </Button>
         </Modal.Footer>
       </Modal>

       <Modal show={showCounselingModal} onHide={handleCloseCounselingModal} size="lg" centered>
         <Modal.Header closeButton className="bg-info text-white">
           <Modal.Title>
             <FaComments className="me-2" /> Counseling Details
           </Modal.Title>
         </Modal.Header>
         <Modal.Body>
           {selectedCounseling && (
             <div>
               <Row className="g-3">
                 <Col md={6}>
                   <Card className="h-100 shadow-sm border-0">
                     <Card.Header className="bg-light">
                       <h6 className="mb-0">Personal Information</h6>
                     </Card.Header>
                     <Card.Body>
                       <p><strong>Student ID:</strong> {selectedCounseling.student_details?.student_id || selectedCounseling.student_id || '-'}</p>
                       <p><strong>Full Name:</strong> {selectedCounseling.student_details?.full_name || selectedCounseling.student_details?.candidate_name || '-'}</p>
                       <p><strong>Aadhaar No:</strong> {selectedCounseling.student_details?.aadhaar_no ? `****${selectedCounseling.student_details.aadhaar_no.slice(-4)}` : '-'}</p>
                       <p><strong>Phone:</strong> {selectedCounseling.student_details?.phone || selectedCounseling.student_details?.mobile_no || '-'}</p>
                       <p><strong>Email:</strong> {selectedCounseling.student_details?.email || 'N/A'}</p>
                       <p><strong>Class:</strong> {selectedCounseling.student_details?.class_name || '-'}</p>
                       <p><strong>Status:</strong> <Badge bg={selectedCounseling.status === 'pending' ? 'warning' : selectedCounseling.status === 'approved' ? 'success' : 'danger'}>{selectedCounseling.status || 'pending'}</Badge></p>
                     </Card.Body>
                   </Card>
                 </Col>
                 <Col md={6}>
                   <Card className="h-100 shadow-sm border-0">
                     <Card.Header className="bg-light">
                       <h6 className="mb-0">Institution & Location Details</h6>
                     </Card.Header>
                     <Card.Body>
                       <p><strong>Institution Name:</strong> {selectedCounseling.student_details?.school_name || '-'}</p>
                       <p><strong>Institution ID:</strong> {selectedCounseling.student_details?.school_uni_id || '-'}</p>
                       <p><strong>State:</strong> {selectedCounseling.student_details?.state || '-'}</p>
                       <p><strong>District:</strong> {selectedCounseling.student_details?.district || '-'}</p>
                       <p><strong>Block:</strong> {selectedCounseling.student_details?.block || '-'}</p>
                     </Card.Body>
                   </Card>
                 </Col>
                 <Col md={12}>
                   <Card className="shadow-sm border-0 mt-2">
                     <Card.Header className="bg-light">
                       <h6 className="mb-0">Counseling Information</h6>
                     </Card.Header>
                     <Card.Body>
                       <p><strong>Category:</strong> {Array.isArray(selectedCounseling.category_consulting) ? selectedCounseling.category_consulting.join(', ') : selectedCounseling.category_consulting}</p>
                       <p><strong>Requested At:</strong> {new Date(selectedCounseling.created_at || selectedCounseling.student_details?.created_at || Date.now()).toLocaleString()}</p>
                     </Card.Body>
                   </Card>
                 </Col>
               </Row>
             </div>
           )}
         </Modal.Body>
         <Modal.Footer>
           <Button variant="secondary" onClick={handleCloseCounselingModal}>
             Close
           </Button>
         </Modal.Footer>
       </Modal>

      {/* Create Notification Modal */}
      <Modal show={showNotificationModal} onHide={() => setShowNotificationModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title><FaPlus className="me-2" /> Send Notification</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitNotification}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={notificationFormData.title}
                onChange={(e) => setNotificationFormData({ ...notificationFormData, title: e.target.value })}
                placeholder="Enter notification title"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={notificationFormData.message}
                onChange={(e) => setNotificationFormData({ ...notificationFormData, message: e.target.value })}
                placeholder="Enter notification message"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNotificationModal(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={submittingNotification}>
              {submittingNotification ? <Spinner size="sm" animation="border" /> : 'Send Notification'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Notifications List Modal */}
      <Modal show={showNotificationsListModal} onHide={() => { setShowNotificationsListModal(false); setAdminNotifications([]) }} size="lg" centered>
        <Modal.Header closeButton className="bg-info text-white">
          <div className="d-flex justify-content-between align-items-center w-100">
            <Modal.Title className="mb-0"><FaBell className="me-2" /> Notifications ({adminNotificationCount})</Modal.Title>
            <Button variant="light" size="sm" onClick={() => { setShowNotificationsListModal(false); setShowNotificationModal(true) }}>
              <FaPlus className="me-1" /> Send New
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body>
          {adminNotifications.length === 0 ? (
            <p className="text-center text-muted">No notifications</p>
          ) : (
            adminNotifications.map((notif) => (
              <Card key={notif.id} className="mb-2">
                <Card.Body className="py-2">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{notif.title}</h6>
                      <p className="mb-0 text-muted small">{notif.message}</p>
                      <small className="text-muted">{formatNotificationTime(notif.time)}</small>
                    </div>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteNotification(notif.id)}>
                      <FaTrash />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowNotificationsListModal(false); setAdminNotifications([]) }}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Event Details Modal */}
      <Modal show={showEventModal} onHide={() => setShowEventModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title><FaCalendarAlt className="me-2" /> Event Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <div>
              {selectedEvent.event_image && (
                <div className="mb-3">
                  <Image 
                    src={`https://brjobsedu.com/gyandhara/gyandhara_backend${selectedEvent.event_image}`} 
                    alt={selectedEvent.event_name}
                    fluid
                    className="rounded"
                  />
                </div>
              )}
              <div className="mb-3">
                <Badge bg="primary" className="me-2">ID: {selectedEvent.event_id}</Badge>
                {selectedEvent.event_type && <Badge bg="info">{selectedEvent.event_type}</Badge>}
              </div>
              <h4 className="mb-3">{renderContentWithLineBreaks(selectedEvent.event_name)}</h4>
              {selectedEvent.event_date_time && (
                <p className="mb-2">
                  <strong><FaCalendarAlt className="me-2" />Start Date & Time:</strong>{' '}
                  {new Date(selectedEvent.event_date_time).toLocaleDateString('en-IN', { 
                    weekday: 'long',
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
              {selectedEvent.end_date_time && (
                <p className="mb-2">
                  <strong>End Date & Time:</strong>{' '}
                  {new Date(selectedEvent.end_date_time).toLocaleDateString('en-IN', { 
                    weekday: 'long',
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
              {selectedEvent.venue && (
                <p className="mb-3">
                  <strong><i className="fas fa-map-marker-alt me-2"></i>Venue:</strong>{' '}
                  {selectedEvent.venue}
                </p>
              )}
              {selectedEvent.description && (
                <div className="mt-3">
                  <strong>Description:</strong>
                  <p className="mt-2">{selectedEvent.description}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEventModal(false)}>Close</Button>
          <Button variant="danger" onClick={() => { setShowEventModal(false); handleDeleteEvent(selectedEvent) }}>
            <FaTrash className="me-1" /> Delete Event
          </Button>
        </Modal.Footer>
      </Modal>

{/* Analytics Graph Modal */}
        {showGraphModal && (
          <Modal show={showGraphModal} onHide={() => setShowGraphModal(false)} centered size="xl" dialogClassName="analytics-modal-dialog">
            <Modal.Header closeButton className="bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Modal.Title className="d-flex align-items-center gap-3 text-white">
                <FaChartBar className="me-2" /> Enrollment Analytics Dashboard
              </Modal.Title>
             <div className="d-flex gap-2">
               {/* <Button variant="light" size="sm" onClick={() => setShowPerformanceModal(true)}>
                 <FaTrophy className="me-1" /> Performance Ranking
               </Button> */}
               <Button variant="outline-light" size="sm" onClick={() => setShowPerformanceHelpModal(true)} title="How is performance calculated?">
                 Performance Ranking
               </Button>
             </div>
           </Modal.Header>
          <Modal.Body className="p-4">
            {(() => {
              const filteredData = unpaidEnrollments.filter(enrollment => {
                const schoolMatch = enrollmentSelectedSchools.length === 0 || enrollmentSelectedSchools.includes(enrollment.school_name)
                const classMatch = enrollmentSelectedClasses.length === 0 || enrollmentSelectedClasses.includes(String(enrollment.class_name))
                const statusMatch = analyticsStatusFilter === 'all' ||
                  (analyticsStatusFilter === 'completed' && enrollment.is_completed) ||
                  (analyticsStatusFilter === 'ongoing' && !enrollment.is_completed)
                return schoolMatch && classMatch && statusMatch
              })
               const stats = getEnrollmentAnalytics(filteredData)
               if (!stats || stats.total === 0) return <p className="text-center text-muted py-5">No data available for analytics.</p>

               const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

               // Export to PDF
               const exportToPDF = () => {
                 try {
                   const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' })
                   const pageWidth = doc.internal.pageSize.getWidth()
                   const pageHeight = doc.internal.pageSize.getHeight()
                   const margin = 14
                   let yPos = 20

                   doc.setFontSize(18)
                   doc.text('Enrollment Analytics Report', margin, yPos)
                   yPos += 7
                   doc.setFontSize(10)
                   doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPos)
                   yPos += 6
                   const filterSummary = `Filters: ${enrollmentSelectedSchools.length > 0 ? enrollmentSelectedSchools.join(', ') : 'All institutes'} | Classes: ${enrollmentSelectedClasses.length > 0 ? enrollmentSelectedClasses.join(', ') : 'All classes'} | Status: ${analyticsStatusFilter}`
                   doc.text(filterSummary, margin, yPos)
                   yPos += 10

                   doc.setFontSize(12)
                   doc.text('Summary', margin, yPos)
                   yPos += 7
                   doc.setFontSize(10)
                   doc.text(`Unique Students: ${stats.uniqueStudents}`, margin, yPos)
                   yPos += 6
                   doc.text(`Total Enrollments: ${stats.total}`, margin, yPos)
                   yPos += 6
                   doc.text(`Completed: ${stats.completed} (${completionRate}%)`, margin, yPos)
                   yPos += 6
                   doc.text(`Ongoing: ${stats.ongoing} (${100 - completionRate}%)`, margin, yPos)
                   yPos += 6
                   const completionLabel = completionRate >= 75 ? 'Excellent' : completionRate >= 50 ? 'Good' : 'Needs Improvement'
                   doc.text(`Completion Status: ${completionLabel}`, margin, yPos)
                   yPos += 10

                   const insights = []
                   if (completionRate >= 75) {
                     insights.push('Majority of students are successfully completing their enrollments.')
                   } else if (completionRate >= 50) {
                     insights.push('Good progress, but there is room for improvement in completion.')
                   } else {
                     insights.push('Action required: many students are still in progress.')
                   }
                   insights.push(`${stats.uniqueStudents} unique students are enrolled across ${stats.classDist.length} classes and ${stats.schoolDist.length} schools.`)
                   insights.push(`${stats.ongoing} students are still ongoing; consider follow-up engagement.`)

                   if (yPos > pageHeight - 60) {
                     doc.addPage()
                     yPos = 20
                   }

                   doc.setFontSize(12)
                   doc.text('Key Insights', margin, yPos)
                   yPos += 7
                   doc.setFontSize(10)
                   insights.forEach((insight, idx) => {
                     if (yPos > pageHeight - 25) {
                       doc.addPage()
                       yPos = 20
                     }
                     doc.text(`• ${insight}`, margin, yPos)
                     yPos += 6
                   })
                   yPos += 6

                   const classRows = stats.classDist.slice(0, 8).map(([cls, count]) => [cls, count.toString(), `${stats.uniqueStudents > 0 ? Math.round((count / stats.uniqueStudents) * 100) : 0}%`])
                   if (classRows.length > 0) {
                     if (yPos > pageHeight - 70) {
                       doc.addPage()
                       yPos = 20
                     }
                     doc.setFontSize(12)
                     doc.text('Top Class Distribution', margin, yPos)
                     yPos += 7
                     autoTable(doc, {
                       head: [['Class', 'Unique Students', '% of Students']],
                       body: classRows,
                       startY: yPos,
                       margin: { left: margin, right: margin },
                       styles: { fontSize: 8, cellPadding: 0.5 },
                       headStyles: { fillColor: [23, 162, 184], textColor: 255 }
                     })
                     yPos = (doc.lastAutoTable?.finalY || yPos) + 10
                   }

                   const schoolRows = stats.schoolDist.slice(0, 8).map(([school, count]) => [school, count.toString(), `${stats.uniqueStudents > 0 ? Math.round((count / stats.uniqueStudents) * 100) : 0}%`])
                   if (schoolRows.length > 0) {
                     if (yPos > pageHeight - 70) {
                       doc.addPage()
                       yPos = 20
                     }
                     doc.setFontSize(12)
                     doc.text('Top Institution Distribution', margin, yPos)
                     yPos += 7
                     autoTable(doc, {
                       head: [['Institution', 'Unique Students', '% of Students']],
                       body: schoolRows,
                       startY: yPos,
                       margin: { left: margin, right: margin },
                       styles: { fontSize: 8, cellPadding: 0.5 },
                       headStyles: { fillColor: [111, 66, 193], textColor: 255 }
                     })
                     yPos = (doc.lastAutoTable?.finalY || yPos) + 10
                   }

                   const performanceRanked = calculateSchoolPerformance(filteredData)
                   const topSchools = performanceRanked.slice(0, 5).map(s => [ `#${s.rank}`, s.schoolName.substring(0, 30), s.uniqueStudents.toString(), s.balancedScore.toFixed(2) ])
                   if (topSchools.length > 0) {
                     if (yPos > pageHeight - 70) {
                       doc.addPage()
                       yPos = 20
                     }
                     doc.setFontSize(12)
                     doc.text('Top Performing Institutions', margin, yPos)
                     yPos += 7
                     autoTable(doc, {
                       head: [['Rank', 'Institution Name', 'Unique Students', 'Balanced Score']],
                       body: topSchools,
                       startY: yPos,
                       margin: { left: margin, right: margin },
                       styles: { fontSize: 8, cellPadding: 0.5 },
                       headStyles: { fillColor: [40, 167, 69], textColor: 255 }
                     })
                     yPos = (doc.lastAutoTable?.finalY || yPos) + 10
                   }

                   const studentRows = filteredData.slice(0, 25).map((e, idx) => [
                     idx + 1,
                     e.student_id || '-',
                     e.student_name || '-',
                     e.school_name || '-',
                     e.class_name || '-',
                     e.is_completed ? 'Completed' : 'Ongoing',
                     e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString() : '-'
                   ])
                   if (studentRows.length > 0) {
                     if (yPos > pageHeight - 90) {
                       doc.addPage()
                       yPos = 20
                     }
                     doc.setFontSize(12)
                     doc.text(`Student List Preview (first ${studentRows.length} of ${filteredData.length})`, margin, yPos)
                     yPos += 7
                     autoTable(doc, {
                       head: [['#', 'Student ID', 'Name', 'Institution', 'Class', 'Status', 'Enrolled Date']],
                       body: studentRows,
                       startY: yPos,
                       margin: { left: margin, right: margin },
                       styles: { fontSize: 7.5, cellPadding: 0.4 },
                       headStyles: { fillColor: [33, 37, 41], textColor: 255 }
                     })
                     yPos = (doc.lastAutoTable?.finalY || yPos) + 8
                     if (filteredData.length > studentRows.length) {
                       if (yPos > pageHeight - 20) {
                         doc.addPage()
                         yPos = 20
                       }
                       doc.setFontSize(9)
                       doc.text(`Displayed first ${studentRows.length} rows of ${filteredData.length}. Apply filters for a smaller list.`, margin, yPos)
                       yPos += 6
                     }
                   }

                   doc.save(`enrollment-analytics-${new Date().toISOString().split('T')[0]}.pdf`)
                 } catch (err) {
                   console.error('PDF export error:', err)
                   alert('Failed to export PDF. Check console for details.')
                 }
               }

               // Export to Excel
               const exportToExcel = () => {
                 try {
                   // Sheet 1: Student Details
                   const studentData = [
                     ['Student ID', 'Name', 'Institution', 'Class', 'Status', 'Enrolled Date'],
                     ...filteredData.map(e => [
                       e.student_id || '',
                       e.student_name || '',
                       e.school_name || '',
                       e.class_name?.toString() || '',
                       e.is_completed ? 'Completed' : 'Ongoing',
                       e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString() : ''
                     ])
                   ]

                   // Sheet 2: School-wise Breakdown
                   const schoolGroups = {}
                   filteredData.forEach(e => {
                     const school = e.school_name || 'Unknown institution'
                     const cls = String(e.class_name || 'Unknown')
                     if (!schoolGroups[school]) schoolGroups[school] = {}
                     if (!schoolGroups[school][cls]) schoolGroups[school][cls] = { total: 0, completed: 0 }
                     schoolGroups[school][cls].total++
                     if (e.is_completed) schoolGroups[school][cls].completed++
                   })

                   const schoolData = [
                     ['Institution Name', 'Class', 'Total', 'Completed', 'Ongoing'],
                     ...Object.entries(schoolGroups)
                       .sort((a, b) => {
                         const totalA = Object.values(a[1]).reduce((sum, c) => sum + c.total, 0)
                         const totalB = Object.values(b[1]).reduce((sum, c) => sum + c.total, 0)
                         return totalB - totalA
                       })
                       .flatMap(([school, classes]) =>
                         Object.entries(classes)
                           .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                           .map(([cls, stats], idx, arr) => [
                             idx === 0 ? school : '',
                             `Class ${cls}`,
                             stats.total,
                             stats.completed,
                             stats.total - stats.completed
                           ])
                       )
                   ]

                   const wsStudents = XLSX.utils.aoa_to_sheet(studentData)
                   const wsSchools = XLSX.utils.aoa_to_sheet(schoolData)

                   // Set column widths
                   wsStudents['!cols'] = [
                     { wch: 12 }, { wch: 25 }, { wch: 25 }, { wch: 8 }, { wch: 10 }, { wch: 14 }
                   ]
                   wsSchools['!cols'] = [
                     { wch: 25 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 8 }
                   ]

                   const wb = XLSX.utils.book_new()
                   XLSX.utils.book_append_sheet(wb, wsStudents, 'Student Details')
                   XLSX.utils.book_append_sheet(wb, wsSchools, 'Institution-wise Summary')
                   XLSX.writeFile(wb, `enrollment-analytics-${new Date().toISOString().split('T')[0]}.xlsx`)
                 } catch (err) {
                   console.error('Excel export error:', err)
                   alert('Failed to export Excel. Check console for details.')
                 }
               }

              return (
                <div>
                  {/* Header Actions */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h4 className="mb-1 fw-bold text-primary">Analytics Overview</h4>
                      <p className="text-muted small mb-0">Comprehensive enrollment progress and distribution analysis</p>
                    </div>
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm" onClick={exportToPDF}>
                        <FaFilePdf className="me-1" /> Export PDF
                      </Button>
                      <Button variant="outline-success" size="sm" onClick={exportToExcel}>
                        <FaFileExcel className="me-1" /> Export Excel
                      </Button>
                    </div>
                  </div>

                  {/* Status Filter */}
                  <Row className="mb-4">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="fw-bold"><FaFilter className="me-1" /> Filter by Status:</Form.Label>
                        <Form.Select
                          value={analyticsStatusFilter}
                          onChange={(e) => setAnalyticsStatusFilter(e.target.value)}
                          className="form-select-sm"
                        >
                          <option value="all">All Students</option>
                          <option value="completed">Completed Only</option>
                          <option value="ongoing">Ongoing Only</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="fw-bold"><FaChartBar className="me-1" /> Completion Rate:</Form.Label>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: '24px', borderRadius: '12px' }}>
                              <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: `${completionRate}%` }}
                              >
                                {completionRate}%
                             </div>
                          </div>
                          <Badge bg={completionRate >= 75 ? 'success' : completionRate >= 50 ? 'warning' : 'danger'} className="fs-6">
                            {completionRate >= 75 ? 'Excellent' : completionRate >= 50 ? 'Good' : 'Needs Improvement'}
                          </Badge>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Summary Cards */}
                  <Row className="g-3 mb-4">
                    <Col xs={12} sm={4}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="text-center py-4">
                          <div className="rounded-circle bg-primary bg-opacity-10 p-3 mb-2 d-inline-flex">
                            <FaUsers className="text-primary fs-2" />
                          </div>
                          <h2 className="fw-bold text-primary mb-0">{stats.uniqueStudents}</h2>
                          <p className="text-muted small mb-0 text-uppercase fw-bold">Unique Students</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col xs={12} sm={4}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="text-center py-4">
                          <div className="rounded-circle bg-success bg-opacity-10 p-3 mb-2 d-inline-flex">
                            <FaCheckCircle className="text-success fs-2" />
                          </div>
                          <h2 className="fw-bold text-success mb-0">{stats.completed}</h2>
                          <p className="text-muted small mb-0 text-uppercase fw-bold">Completed</p>
                           <small className="text-success">{completionRate}% enrollment completion rate</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col xs={12} sm={4}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Body className="text-center py-4">
                          <div className="rounded-circle bg-warning bg-opacity-10 p-3 mb-2 d-inline-flex">
                            <FaClock className="text-warning fs-2" />
                          </div>
                          <h2 className="fw-bold text-warning mb-0">{stats.ongoing}</h2>
                          <p className="text-muted small mb-0 text-uppercase fw-bold">Ongoing</p>
                           <small className="text-warning">{100 - completionRate}% enrollments still in progress</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Status Distribution Chart */}
                  <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0 fw-bold"><FaChartPie className="me-2" /> Completion Status Distribution</h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="row align-items-center">
                        <div className="col-md-6">
                          <div className="d-flex justify-content-center position-relative" style={{ height: '200px' }}>
                            {/* Simple CSS donut chart */}
                            <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
                              <circle cx="100" cy="100" r="80" fill="#e9ecef" />
                              <circle
                                cx="100" cy="100" r="80"
                                fill="none"
                                stroke="#28a745"
                                strokeWidth="40"
                                strokeDasharray={`${completionRate / 100 * 502.65} ${502.65}`}
                                transform="rotate(-90 100 100)"
                              />
                              <circle
                                cx="100" cy="100" r="80"
                                fill="none"
                                stroke="#ffc107"
                                strokeWidth="40"
                                strokeDasharray={`${(100 - completionRate) / 100 * 502.65} ${502.65}`}
                                transform="rotate(-90 100 100)"
                                strokeDashoffset={`-${completionRate / 100 * 502.65}`}
                              />
                              <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" fontSize="24" fontWeight="bold" fill="#333">
                                {completionRate}%
                              </text>
                            </svg>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex flex-column gap-3">
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center gap-2">
                                <div className="rounded bg-success" style={{ width: '20px', height: '20px' }}></div>
                                <span className="fw-bold">Completed</span>
                              </div>
                               <div className="text-end">
                                 <h4 className="fw-bold text-success mb-0">{stats.completed}</h4>
                                  <small className="text-muted">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% of enrollments</small>
                               </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center gap-2">
                                <div className="rounded bg-warning" style={{ width: '20px', height: '20px' }}></div>
                                <span className="fw-bold">Ongoing</span>
                              </div>
                               <div className="text-end">
                                 <h4 className="fw-bold text-warning mb-0">{stats.ongoing}</h4>
                                  <small className="text-muted">{stats.total > 0 ? Math.round((stats.ongoing / stats.total) * 100) : 0}% of enrollments</small>
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Class & School Distribution */}
                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-info text-white">
                          <h6 className="mb-0 fw-bold"><FaLayerGroup className="me-2" /> Distribution by Class</h6>
                        </Card.Header>
                        <Card.Body>
                          {stats.classDist.length > 0 ? (
                            <div className="d-flex flex-column gap-2">
                              {stats.classDist.map(([cls, count]) => {
                                const percentage = stats.uniqueStudents > 0 ? Math.round((count / stats.uniqueStudents) * 100) : 0
                                return (
                                  <div key={cls} className="border-bottom pb-2">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                      <Badge bg="info" className="fs-6">Class {cls}</Badge>
                                      <span className="fw-bold">{count} unique students</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                                      <div className="progress-bar bg-info" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                    <small className="text-muted">{percentage}% of unique students</small>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-muted text-center py-3 mb-0">No class data available</p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="text-white" style={{ backgroundColor: '#6f42c1' }}>
                          <h6 className="mb-0 fw-bold"><FaSchool className="me-2" /> Top 10 Performing Schools</h6>
                        </Card.Header>
                        <Card.Body>
                          {(() => {
                            const performanceRanked = calculateSchoolPerformance(filteredData)
                            return performanceRanked.slice(0, 10).length > 0 ? (
                              <div className="d-flex flex-column gap-2">
                                {performanceRanked.slice(0, 10).map((school, idx) => (
                                  <div key={school.schoolName} className="border-bottom pb-2">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                      <span className="fw-bold small text-truncate" style={{ maxWidth: '120px' }}>
                                        #{school.rank} {school.schoolName}
                                      </span>
                                      <span className="fw-bold">{school.balancedScore}</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                                      <div
                                        className="progress-bar"
                                        style={{ width: `${school.balancedScore}%`, backgroundColor: '#6f42c1' }}
                                      ></div>
                                    </div>
                                    <small className="text-muted">{school.uniqueStudents} students, {school.avgCoursesPerStudent} avg courses</small>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted text-center py-3 mb-0">No performance data available</p>
                            )
                          })()}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* School-wise Detailed Breakdown */}
                  {enrollmentSelectedSchools.length > 0 && filteredData.length > 0 && (
                    <Card className="shadow-sm border-0 mb-4">
                      <Card.Header className="bg-secondary text-white">
                        <h6 className="mb-0 fw-bold"><FaBuilding className="me-2" /> Institution-wise Detailed Breakdown</h6>
                      </Card.Header>
                      <Card.Body>
                        {(() => {
                          // Group by school and class with unique students
                          const schoolGroups = {}
                          filteredData.forEach(enrollment => {
                            const school = enrollment.school_name || 'Unknown School'
                            const className = String(enrollment.class_name || 'Unknown')
                            const studentId = enrollment.student_id
                            
                            if (!schoolGroups[school]) schoolGroups[school] = {}
                            if (!schoolGroups[school][className]) {
                              schoolGroups[school][className] = {
                                students: new Set(),
                                completed: new Set(),
                                enrollments: []
                              }
                            }
                            
                            if (studentId) {
                              schoolGroups[school][className].students.add(studentId)
                              if (enrollment.is_completed) {
                                schoolGroups[school][className].completed.add(studentId)
                              }
                            }
                            schoolGroups[school][className].enrollments.push(enrollment)
                          })

                          return Object.entries(schoolGroups).map(([schoolName, classes]) => {
                            // Calculate total unique students in school
                            const schoolUniqueStudents = new Set()
                            Object.values(classes).forEach(classData => {
                              classData.students.forEach(sid => schoolUniqueStudents.add(sid))
                            })
                            
                            return (
                              <div key={schoolName} className="mb-4 p-3 border rounded bg-light">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h6 className="fw-bold text-dark mb-0">
                                    <FaSchool className="me-2 text-primary" /> {schoolName}
                                  </h6>
                                  <Badge bg="primary" className="fs-6">
                                    {schoolUniqueStudents.size} unique students
                                  </Badge>
                                </div>

                                <Row className="g-2">
                                  {Object.entries(classes).map(([className, classData]) => {
                                    const uniqueCount = classData.students.size
                                    const completedCount = classData.completed.size
                                    const ongoingCount = uniqueCount - completedCount
                                    return (
                                      <Col md={6} lg={4} key={className} className="mb-2">
                                        <div className="p-2 border rounded bg-white">
                                          <div className="d-flex justify-content-between align-items-center mb-2">
                                            <Badge bg="info" className="fs-6">Class {className}</Badge>
                                            <span className="fw-bold small">{uniqueCount} unique students</span>
                                          </div>
                                          <div className="d-flex justify-content-between small mb-1">
                                            <span className="text-success"><FaCheckCircle className="me-1" /> {completedCount} Done</span>
                                            <span className="text-warning"><FaClock className="me-1" /> {ongoingCount} Ongoing</span>
                                          </div>
                                           <div className="progress" style={{ height: '6px', borderRadius: '3px' }}>
                                             <div className="bg-success" style={{ width: `${uniqueCount > 0 ? (completedCount / uniqueCount) * 100 : 0}%` }}></div>
                                             <div className="bg-warning" style={{ width: `${uniqueCount > 0 ? (ongoingCount / uniqueCount) * 100 : 0}%` }}></div>
                                           </div>
                                        </div>
                                      </Col>
                                    )
                                  })}
                                </Row>
                              </div>
                            )
                          })
                        })()}
                      </Card.Body>
                    </Card>
                  )}

                  {/* Student List Table when specific filters applied */}
                  {(enrollmentSelectedSchools.length > 0 || enrollmentSelectedClasses.length > 0) && filteredData.length > 0 && (
                    <Card className="shadow-sm border-0 mb-4">
                      <Card.Header className="bg-light">
                        <h6 className="mb-0 fw-bold"><FaList className="me-2" /> Student Details</h6>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <div className="table-responsive">
                          <Table striped hover size="sm" className="mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>#</th>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Institution</th>
                                <th>Class</th>
                                <th>Status</th>
                                <th>Enrolled</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredData.slice(0, 50).map((enrollment, idx) => (
                                <tr key={enrollment.id || idx}>
                                  <td>{idx + 1}</td>
                                  <td><Badge bg="secondary">{enrollment.student_id}</Badge></td>
                                  <td className="fw-bold">{enrollment.student_name}</td>
                                  <td>{enrollment.school_name || '-'}</td>
                                  <td><Badge bg="info">{enrollment.class_name || '-'}</Badge></td>
                                  <td>
                                    <Badge bg={enrollment.is_completed ? 'success' : 'warning'}>
                                      {enrollment.is_completed ? 'Completed' : 'Ongoing'}
                                    </Badge>
                                  </td>
                                  <td className="small">
                                    {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString() : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                          {filteredData.length > 50 && (
                            <div className="p-2 text-center text-muted small">
                              Showing first 50 of {filteredData.length} students. Apply filters to narrow results.
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                  {/* Insights Section */}
                  <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0 fw-bold"><FaLightbulb className="me-2" /> Key Insights</h6>
                    </Card.Header>
                    <Card.Body>
                      <Row className="g-3">
                        <Col md={4}>
                          <div className="d-flex align-items-start gap-2">
                            <div className="bg-info bg-opacity-10 p-2 rounded">
                              <FaChartLine className="text-info" />
                            </div>
                            <div>
                              <h6 className="fw-bold mb-0">Completion Rate</h6>
                              <p className="small text-muted mb-0">
                                {completionRate >= 75 ? 'Excellent! Most students are completing their courses.' :
                                 completionRate >= 50 ? 'Good progress, but room for improvement.' :
                                 'Attention needed - many students are behind.'}
                              </p>
                            </div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="d-flex align-items-start gap-2">
                            <div className="bg-success bg-opacity-10 p-2 rounded">
                              <FaUsers className="text-success" />
                            </div>
                            <div>
                              <h6 className="fw-bold mb-0">Total Enrollment</h6>
                              <p className="small text-muted mb-0">
                                {stats.total} students enrolled across {stats.classDist.length} classes and {stats.schoolDist.length} schools.
                              </p>
                            </div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="d-flex align-items-start gap-2">
                            <div className="bg-warning bg-opacity-10 p-2 rounded">
                              <FaExclamationTriangle className="text-warning" />
                            </div>
                            <div>
                              <h6 className="fw-bold mb-0">Ongoing Students</h6>
                              <p className="small text-muted mb-0">
                                {stats.ongoing} students still in progress. Consider sending follow-up notifications.
                              </p>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </div>
              )
            })()}
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="secondary" onClick={() => setShowGraphModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Performance Ranking Modal */}
      {showPerformanceModal && (
        <Modal show={showPerformanceModal} onHide={() => setShowPerformanceModal(false)} fullscreen={true}>
          <Modal.Header closeButton className="bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
            <Modal.Title><FaTrophy className="me-2" /> Institution Performance Ranking</Modal.Title>
            <div className="d-flex gap-2">
              <Button variant="light" size="sm" onClick={exportPerformancePDF}>
                <FaFilePdf className="me-1" /> Export PDF
              </Button>
              <Button variant="light" size="sm" onClick={exportPerformanceExcel}>
                <FaFileExcel className="me-1" /> Export Excel
              </Button>
              <Button variant="outline-light" size="sm" onClick={() => setShowPerformanceHelpModal(true)} title="How is performance calculated?">
                <FaQuestionCircle />
              </Button>
            </div>
          </Modal.Header>
          <Modal.Body className="p-4">
            {(() => {
              const rankedSchools = calculateSchoolPerformance(unpaidEnrollments)

              // Export to PDF
              const exportPerformancePDF = () => {
                try {
                  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' })
                  const pageWidth = doc.internal.pageSize.getWidth()
                  const margin = 14

                  // Title
                  doc.setFontSize(18)
                  doc.text('Institution Performance Ranking Report', margin, 20)
                  doc.setFontSize(11)
                  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 28)
                  doc.text(`Total Schools: ${rankedSchools.length}`, margin, 36)

                  let yPos = 44

                  // Performance Table
                  const columns = ['Rank', 'Institution Name', 'Unique Students', 'Total Courses', 'Avg Courses/Student', 'Completion %', 'Balanced Score']
                  const rows = rankedSchools.map(s => [
                     `#${s.rank}`,
                     s.schoolName.substring(0, 25),
                     s.uniqueStudents,
                     s.totalCoursesParticipated,
                     s.avgCoursesPerStudent.toFixed(2),
                     `${s.completionRate}%`,
                     s.balancedScore.toFixed(2)
                   ])

                  autoTable(doc, {
                    head: [columns],
                    body: rows,
                    startY: yPos,
                    margin: { left: margin, right: margin },
                    styles: { fontSize: 8, cellPadding: 0.5 },
                    headStyles: { fillColor: [40, 167, 69], textColor: 255 }
                  })

                  doc.save(`institution-performance-ranking-${new Date().toISOString().split('T')[0]}.pdf`)
                } catch (err) {
                  console.error('Performance PDF export error:', err)
                  alert('Failed to export PDF')
                }
              }

              // Export to Excel
              const exportPerformanceExcel = () => {
                try {
                  const wsData = [
                     ['Rank', 'Institution Name', 'Unique Students', 'Total Courses', 'Avg Courses/Student', 'Completion Rate (%)', 'Balanced Score'],
                     ...rankedSchools.map(s => [
                       s.rank,
                       s.schoolName,
                       s.uniqueStudents,
                       s.totalCoursesParticipated,
                       s.avgCoursesPerStudent,
                       s.completionRate,
                       s.balancedScore
                     ])
                   ]

                  const ws = XLSX.utils.aoa_to_sheet(wsData)
                  ws['!cols'] = [
                     { wch: 6 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 14 }
                   ]

                  const wb = XLSX.utils.book_new()
                  XLSX.utils.book_append_sheet(wb, ws, 'Performance Ranking')
                  XLSX.writeFile(wb, `institution-performance-ranking-${new Date().toISOString().split('T')[0]}.xlsx`)
                } catch (err) {
                  console.error('Performance Excel export error:', err)
                  alert('Failed to export Excel')
                }
              }

              if (rankedSchools.length === 0) {
                return <p className="text-center text-muted py-5">No performance data available.</p>
              }

              return (
                <div>
                  <Card className="shadow-sm border-0 mb-4">
                    <Card.Body>
                      <p className="text-muted small mb-0">
                        Institutions are ranked by Balanced Performance Score considering unique students and course participation.
                        Score = 0.4 × (avg courses/student relative) + 0.4 × completion rate + 0.2 × student engagement.
                        Higher score indicates better overall performance.
                      </p>
                    </Card.Body>
                  </Card>

                   <Row className="g-3 mb-4">
                     {rankedSchools.slice(0, 3).map((school, idx) => (
                       <Col md={4} key={school.schoolName}>
                         <Card className={`shadow-sm border-0 h-100 ${idx === 0 ? 'border-warning' : idx === 1 ? 'border-secondary' : 'border-success'}`}>
                           <Card.Body className="text-center py-4">
                             <div className={`rounded-circle p-3 mb-2 d-inline-flex ${idx === 0 ? 'bg-warning bg-opacity-10' : idx === 1 ? 'bg-secondary bg-opacity-10' : 'bg-success bg-opacity-10'}`}>
                               <FaTrophy className={`fs-2 ${idx === 0 ? 'text-warning' : idx === 1 ? 'text-secondary' : 'text-success'}`} />
                             </div>
                             <Badge bg={idx === 0 ? 'warning' : idx === 1 ? 'secondary' : 'success'} className="mb-2">Rank #{school.rank}</Badge>
                             <h5 className="fw-bold mb-1 text-truncate" title={school.schoolName}>{school.schoolName}</h5>
                             <p className="text-muted small mb-2">
                               {school.uniqueStudents} students | {school.avgCoursesPerStudent} avg courses
                             </p>
                             <h3 className="fw-bold text-success">{school.balancedScore}</h3>
                             <small className="text-muted">Performance Score</small>
                           </Card.Body>
                         </Card>
                       </Col>
                     ))}
                   </Row>

                  <Card className="shadow-sm border-0">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0 fw-bold"><FaTrophy className="me-2" /> Complete Performance Ranking</h6>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <Table striped bordered hover responsive size="sm">
                           <thead className="table-light">
                             <tr>
                               <th>Rank</th>
                               <th>Institution Name</th>
                               <th>Unique Students</th>
                               <th>Total Courses</th>
                               <th>Avg Courses/Student</th>
                               <th>Completion Rate</th>
                               <th>Balanced Score</th>
                             </tr>
                           </thead>
                           <tbody>
                             {rankedSchools.map((school) => (
                               <tr key={school.schoolName}>
                                 <td>
                                   <Badge bg={school.rank <= 3 ? 'success' : 'secondary'}>#{school.rank}</Badge>
                                 </td>
                                 <td className="fw-bold">{school.schoolName}</td>
                                 <td>{school.uniqueStudents}</td>
                                 <td>{school.totalCoursesParticipated}</td>
                                 <td>{school.avgCoursesPerStudent}</td>
                                 <td>
                                   <div className="d-flex align-items-center gap-2">
                                     <div className="progress flex-grow-1" style={{ height: '6px', borderRadius: '3px' }}>
                                       <div className="bg-success" style={{ width: `${school.completionRate}%` }}></div>
                                     </div>
                                     <span className="small">{school.completionRate}%</span>
                                   </div>
                                 </td>
                                 <td>
                                   <span className="fw-bold text-success">{school.balancedScore}</span>
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                         </Table>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              )
            })()}
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="secondary" onClick={() => setShowPerformanceModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Performance Calculation Help Modal */}
      {showPerformanceHelpModal && (
        <Modal show={showPerformanceHelpModal} onHide={() => setShowPerformanceHelpModal(false)} centered>
          <Modal.Header closeButton className="bg-info text-white">
            <Modal.Title><FaInfoCircle className="me-2" /> How Performance Score is Calculated</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="py-2">
              <h6 className="fw-bold mb-3">Balanced Performance Score Formula</h6>

               <Card className="bg-light border-0 mb-4">
                 <Card.Body>
                   <p className="fw-bold text-center mb-0" style={{ fontSize: '1.1em' }}>
                     Score = 0.4 × ((AvgCourses/Student / MaxAvgCourses) × 100) + 0.4 × (CompletionRate) + 0.2 × (StudentEngagement × 100)
                   </p>
                 </Card.Body>
               </Card>

               <Row className="g-3 mb-4">
                 <Col md={4}>
                   <Card className="border-0 shadow-sm h-100">
                     <Card.Header className="bg-primary text-white">
                       <h6 className="mb-0 fw-bold">Component 1 (Weight: 40%)</h6>
                     </Card.Header>
                     <Card.Body>
                       <p className="mb-1"><strong>Course Participation:</strong></p>
                       <code className="d-block mb-2 p-2 bg-light rounded small">
                         (AvgCourses/Student / MaxAvgCourses) × 100
                       </code>
                       <p className="small text-muted mb-0">
                         Compares the institution's average courses per student <strong>against the highest average across all schools</strong>.
                         Rewards institution encouraging more course participation.
                       </p>
                     </Card.Body>
                   </Card>
                 </Col>
                 <Col md={4}>
                   <Card className="border-0 shadow-sm h-100">
                     <Card.Header className="bg-success text-white">
                       <h6 className="mb-0 fw-bold">Component 2 (Weight: 40%)</h6>
                     </Card.Header>
                     <Card.Body>
                       <p className="mb-1"><strong>Completion Rate:</strong></p>
                       <code className="d-block mb-2 p-2 bg-light rounded small">
                         (CompletedCourses / TotalCoursesParticipated) × 100
                       </code>
                       <p className="small text-muted mb-0">
                         Measures the <strong>actual completion percentage</strong> of courses participated by students.
                         Rewards institutions for high completion rates.
                       </p>
                     </Card.Body>
                   </Card>
                 </Col>
                 <Col md={4}>
                   <Card className="border-0 shadow-sm h-100">
                     <Card.Header className="bg-warning text-white">
                       <h6 className="mb-0 fw-bold">Component 3 (Weight: 20%)</h6>
                     </Card.Header>
                     <Card.Body>
                       <p className="mb-1"><strong>Student Engagement:</strong></p>
                       <code className="d-block mb-2 p-2 bg-light rounded small">
                         min(UniqueStudents / 10, 1) × 100
                       </code>
                       <p className="small text-muted mb-0">
                         Rewards institutions for having more <strong>unique participating students</strong>.
                         Capped at 100 points for 10+ students.
                       </p>
                     </Card.Body>
                   </Card>
                 </Col>
               </Row>

               <Card className="border-0 shadow-sm mb-4">
                 <Card.Header className="bg-warning">
                   <h6 className="mb-0 fw-bold"><FaLightbulb className="me-2" /> Why This Formula?</h6>
                 </Card.Header>
                 <Card.Body>
                   <ul className="mb-0">
                     <li><strong>40% weight on course participation</strong> rewards institutions that encourage students to take multiple courses.</li>
                     <li><strong>40% weight on completion rate</strong> ensures institutions are rewarded for actual course completion and learning outcomes.</li>
                     <li><strong>20% weight on student engagement</strong> gives bonus points for having more unique participating students.</li>
                     <li>This <strong>balanced approach</strong> considers both quantity (participation) and quality (completion) of education delivery.</li>
                   </ul>
                 </Card.Body>
               </Card>

               <Card className="border-0 shadow-sm">
                 <Card.Header className="bg-light">
                   <h6 className="mb-0 fw-bold"><FaCalculator className="me-2" /> Example Calculation</h6>
                 </Card.Header>
                 <Card.Body>
                   <p className="small mb-2">
                     <strong>Scenario:</strong> Institution A: 25 unique students, total 75 course participations (avg 3 courses/student), 60 courses completed. MaxAvgCourses = 4.2, StudentEngagement = min(25/10, 1) = 1.0.
                   </p>
                   <div className="small">
                     <ul className="mb-1">
                       <li>Component 1: (3.0 / 4.2) × 100 = 71.43 → 0.4 × 71.43 = <strong>28.57</strong></li>
                       <li>Component 2: (60 / 75) × 100 = 80.0 → 0.4 × 80.0 = <strong>32.00</strong></li>
                       <li>Component 3: 1.0 × 100 = 100 → 0.2 × 100 = <strong>20.00</strong></li>
                     </ul>
                     <p className="fw-bold text-success border-top pt-2 mt-2">
                       Total Balanced Score = 28.57 + 32.00 + 20.00 = 80.57
                     </p>
                   </div>
                 </Card.Body>
               </Card>

              <div className="mt-4">
                <h6 className="fw-bold mb-2">Rules</h6>
                <ul className="small text-muted mb-0">
                  <li>If a institution has 0 enrolled students, its balanced score is 0.</li>
                  <li>Scores are rounded to 2 decimal places.</li>
                  <li>Institutions are ranked from highest to lowest score.</li>
                </ul>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPerformanceHelpModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}

    </div>
  )
}

export default DashBord