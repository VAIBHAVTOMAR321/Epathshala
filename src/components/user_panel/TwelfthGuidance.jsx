import React, { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Card, Button, Form, ProgressBar, Badge, Modal, Alert, Nav, Tab } from 'react-bootstrap'
import axios from 'axios'

import { useNavigate } from 'react-router-dom'

import CounselingForm from './CounselingForm'

import { FaArrowLeft, FaGraduationCap, FaChartLine, FaLightbulb, FaRocket, FaBook, FaCode, FaPalette, FaCalculator, FaLanguage, FaMusic, FaHeartbeat, FaBusinessTime, FaPercentage, FaUniversity, FaTools, FaLaptopMedical, FaBriefcase, FaCog, FaFlask, FaBalanceScale, FaNewspaper, FaChalkboardTeacher, FaUserTie, FaPaintBrush, FaGuitar, FaRunning, FaHome, FaWrench, FaIndustry, FaPlane, FaCar, FaBuilding, FaHospital, FaSeedling, FaMicrochip, FaNetworkWired, FaDatabase, FaShieldAlt, FaRobot, FaBrain, FaChartBar, FaProjectDiagram, FaBookOpen, FaBolt, FaDna, FaCheckCircle, FaInfoCircle, FaTrain, FaLandmark, FaMoneyBillWave, FaUserShield, FaFlag } from 'react-icons/fa'
import '../../assets/css/12thclass.css'
import UserHeader from './UserHeader'
import UserLeftNav from './UserLeftNav'
import { useAuth } from '../all_login/AuthContext'
import { useLanguage } from '../all_login/LanguageContext'

const TwelfthGuidance = () => {
  const { uniqueId, userRoleType, accessToken } = useAuth()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [selectedStream, setSelectedStream] = useState('')
  const [percentage, setPercentage] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedCareerPath, setSelectedCareerPath] = useState(null)
  const [showCounseling, setShowCounseling] = useState(false)
  const [userData, setUserData] = useState(null)
  const [prepType, setPrepType] = useState('govtCollege')
  const [selectedGovtExam, setSelectedGovtExam] = useState('')
  const [selectedGovtCollege, setSelectedGovtCollege] = useState('')
  const [selectedCollegeTab, setSelectedCollegeTab] = useState('recommended')
  const [govtExamData, setGovtExamData] = useState({})
  const [govtCollegeData, setGovtCollegeData] = useState({})
  const { language } = useLanguage()
  const navigate = useNavigate()
  const resultsRef = useRef(null)
  const tabsRef = useRef(null)
  const examRoadmapRef = useRef(null)
  const collegeRoadmapRef = useRef(null)
  const courseDetailsRef = useRef(null)

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Check mobile/tablet view
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

  // Initialize data on mount
  useEffect(() => {
    const examData = getExamData()
    const collegeData = getCollegeData()
    setGovtExamData(examData)
    setGovtCollegeData(collegeData)
  }, [])

  // Update selected exam when stream changes
  useEffect(() => {
    const examTypes = getFilteredExamTypes()
    if (examTypes.length > 0 && (!selectedGovtExam || !examTypes.includes(selectedGovtExam))) {
      setSelectedGovtExam(examTypes[0])
    }
  }, [selectedStream])

  // Update selected college when stream changes
  useEffect(() => {
    const collegeTypes = getFilteredCollegeTypes()
    if (collegeTypes.length > 0 && (!selectedGovtCollege || !collegeTypes.includes(selectedGovtCollege))) {
      setSelectedGovtCollege(collegeTypes[0])
    }
  }, [selectedStream])

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let response

        const config = {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }

        if (userRoleType === 'student-unpaid') {
          response = await axios.get(`https://brjobsedu.com/epathshala/epathshala_backend/api/student-unpaid/?student_id=${uniqueId}`, config)
        } else {
          response = await axios.get(`https://brjobsedu.com/epathshala/epathshala_backend/api/all-registration/?student_id=${uniqueId}`, config)
        }

        const { data } = response

        if (data.success) {
          setUserData(data.data)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    if (uniqueId) {
      fetchUserData()
    }
  }, [uniqueId, userRoleType, accessToken])

  // Handle Counseling Form Submission
  const handleCounselingSubmit = async (formData) => {
    try {
      const payload = {
        student_id: uniqueId,
        category_consulting: formData.category_consulting
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }

      const response = await axios.post(
        'https://brjobsedu.com/epathshala/epathshala_backend/api/student-cousult/',
        payload,
        config
      )

      if (response.data.success || response.status === 200 || response.status === 201) {
        return response.data
      } else {
        throw new Error(response.data.message || 'Failed to submit counseling request')
      }
    } catch (error) {
      console.error('Counseling submission error:', error)
      throw error
    }
  }

  // Simulate loading
  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  // 12th Streams
  const streams = [
    { id: 'science', nameKey: 'notifications.scienceStream', icon: <FaRocket className="" />, subjectsKey: 'notifications.scienceSubjects' },
    { id: 'commerce', nameKey: 'notifications.commerceStream', icon: <FaChartLine className="" />, subjectsKey: 'notifications.commerceSubjects' },
    { id: 'arts', nameKey: 'notifications.artsStream', icon: <FaPalette className="" />, subjectsKey: 'notifications.artsSubjects' },
    { id: 'computer', nameKey: 'notifications.computerScience', icon: <FaCode className="" />, subjectsKey: 'notifications.computerSubjects' }
  ]

  const govtExamTypes = ['IIT-JEE', 'NEET', 'UPSC', 'GATE', 'SSC', 'Banking', 'Railway', 'StatePSC']

  const getFilteredExamTypes = () => {
    if (selectedStream === 'science') {
      return ['IIT-JEE', 'NEET', 'UPSC', 'GATE', 'Banking', 'SSC', 'Railway', 'StatePSC', 'NDA']
    } else if (selectedStream === 'commerce') {
      return ['UPSC', 'Banking', 'SSC', 'Railway', 'StatePSC', 'NDA']
    } else if (selectedStream === 'arts') {
      return ['UPSC', 'SSC', 'Banking', 'Railway', 'StatePSC', 'NDA']
    } else if (selectedStream === 'computer') {
      return ['IIT-JEE', 'NEET', 'UPSC', 'GATE', 'Banking', 'SSC', 'Railway', 'StatePSC', 'NDA']
    }
    return govtExamTypes
  }

  const filteredExamTypes = getFilteredExamTypes()

  // Get exam data - NOW INCLUDES NDA
  const getExamData = () => {
    return {
      'IIT-JEE': {
        title: 'IIT-JEE (Engineering)',
        icon: <FaCog />,
        fullPath: '12th (PCM) → JEE Main → JEE Advanced → IIT/NIT/IIIT → B.Tech',
        steps: [
          { step: 1, title: 'Complete 12th with PCM', description: 'Physics, Chemistry, Mathematics', duration: '2 Years' },
          { step: 2, title: 'Prepare for JEE Main', description: 'Cover complete syllabus of PCM', duration: '1-2 Years' },
          { step: 3, title: 'Appear for JEE Main', description: 'Clear JEE Main exam', duration: 'Exam' },
          { step: 4, title: 'Prepare for JEE Advanced', description: 'If qualified in JEE Main', duration: '6-12 Months' },
          { step: 5, title: 'JoSAA Counseling', description: 'Participate in counseling', duration: 'After Results' },
          { step: 6, title: 'Complete B.Tech', description: '4-year engineering degree', duration: '4 Years' }
        ]
      },
      'NEET': {
        title: 'NEET (Medical)',
        icon: <FaHeartbeat />,
        fullPath: '12th (PCB) → NEET → MBBS → Doctor',
        steps: [
          { step: 1, title: 'Complete 12th with PCB', description: 'Physics, Chemistry, Biology', duration: '2 Years' },
          { step: 2, title: 'Prepare for NEET', description: 'Cover complete PCB syllabus', duration: '1-2 Years' },
          { step: 3, title: 'Appear for NEET', description: 'Clear NEET exam', duration: 'Exam' },
          { step: 4, title: 'NEET Counseling', description: 'Participate in All India Quota', duration: 'After Results' },
          { step: 5, title: 'Complete MBBS', description: '5.5 years including internship', duration: '5.5 Years' }
        ]
      },
      'UPSC': {
        title: 'UPSC Civil Services',
        icon: <FaLandmark />,
        fullPath: 'Graduate → UPSC CSE → IAS/IPS/IFS',
        steps: [
          { step: 1, title: 'Complete Graduation', description: 'Graduate in any stream', duration: '3 Years' },
          { step: 2, title: 'Basic Preparation', description: 'Read NCERTs, basic books', duration: '6-12 Months' },
          { step: 3, title: 'Deep Preparation', description: 'Standard books, answer writing', duration: '1-2 Years' },
          { step: 4, title: 'Appear for Prelims', description: 'Clear UPSC Prelims', duration: 'Exam' },
          { step: 5, title: 'Appear for Mains', description: 'Clear Mains (9 papers)', duration: 'Exam' },
          { step: 6, title: 'Interview', description: 'Personality Test', duration: '30 Minutes' },
          { step: 7, title: 'Service Allocation', description: 'Get IAS/IPS/IFS service', duration: 'After Result' }
        ]
      },
      'SSC': {
        title: 'SSC Exams',
        icon: <FaUserShield />,
        fullPath: '12th/Graduate → SSC Exams → Government Job',
        steps: [
          { step: 1, title: 'Check Eligibility', description: 'Check education qualification', duration: 'Before Exam' },
          { step: 2, title: 'Basic Preparation', description: 'English, Math, Reasoning, GK', duration: '3-6 Months' },
          { step: 3, title: 'Deep Preparation', description: 'Solve previous papers', duration: '6-12 Months' },
          { step: 4, title: 'Appear for Tier 1', description: 'Clear CBT exam', duration: 'Exam' },
          { step: 5, title: 'Tier 2 & DV', description: 'Descriptive/Typing + Document Verification', duration: 'After Tier 1' },
          { step: 6, title: 'Joining', description: 'Get joining letter', duration: 'After DV' }
        ]
      },
      'Banking': {
        title: 'Banking Exams',
        icon: <FaMoneyBillWave />,
        fullPath: 'Graduate → PO/Clerk Exam → Bank Job',
        steps: [
          { step: 1, title: 'Complete Graduation', description: 'Graduate in any stream', duration: '3 Years' },
          { step: 2, title: 'Check Eligibility', description: 'Check age limit, percentage', duration: 'Before Exam' },
          { step: 3, title: 'Basic Preparation', description: 'Quant, Reasoning, English, GA', duration: '3-6 Months' },
          { step: 4, title: 'Appear for Prelims', description: 'Clear Prelims', duration: 'Exam' },
          { step: 5, title: 'Appear for Mains', description: 'Clear Mains', duration: 'After Prelims' },
          { step: 6, title: 'GD & Interview', description: 'Group Discussion + PI', duration: 'After Mains' },
          { step: 7, title: 'Joining', description: 'Get PO/Clerk position', duration: 'After Result' }
        ]
      },
      'Railway': {
        title: 'Railway Exams (RRB)',
        icon: <FaTrain />,
        fullPath: '12th/Graduate → RRB Exam → Railway Job',
        steps: [
          { step: 1, title: 'Check Eligibility', description: 'Check qualification, age', duration: 'Before Exam' },
          { step: 2, title: 'Basic Preparation', description: 'Math, Reasoning, GA', duration: '2-3 Months' },
          { step: 3, title: 'Deep Preparation', description: 'Solve previous papers', duration: '6-12 Months' },
          { step: 4, title: 'Appear for CBT', description: 'Clear Computer Based Test', duration: 'Exam' },
          { step: 5, title: 'Skill Test/DV', description: 'Typing + Document Verification', duration: 'After CBT' },
          { step: 6, title: 'Medical', description: 'Clear medical test', duration: 'After Skill Test' },
          { step: 7, title: 'Joining', description: 'Join Railway', duration: 'After Medical' }
        ]
      },
      'StatePSC': {
        title: 'State PSC Exams',
        icon: <FaFlag />,
        fullPath: 'Graduate → State PSC Exam → State Government Job',
        steps: [
          { step: 1, title: 'Complete Graduation', description: 'Graduate in any stream', duration: '3 Years' },
          { step: 2, title: 'Check Notification', description: 'Check state PSC notification', duration: 'When Notified' },
          { step: 3, title: 'Prepare for Preliminary', description: 'State syllabus, papers', duration: '3-6 Months' },
          { step: 4, title: 'Prepare for Mains', description: 'State-specific topics', duration: '6-12 Months' },
          { step: 5, title: 'Interview', description: 'Personality Test', duration: 'After Mains' },
          { step: 6, title: 'Joining', description: 'Join state department', duration: 'After Result' }
        ]
      },
      'GATE': {
        title: 'GATE (Graduate Aptitude Test in Engineering)',
        icon: <FaFlask />,
        fullPath: 'Graduate (Engineering) → GATE → M.Tech/PSU Job',
        steps: [
          { step: 1, title: 'Complete B.Tech', description: 'Complete engineering graduation', duration: '4 Years' },
          { step: 2, title: 'Study GATE Syllabus', description: 'Cover syllabus according to your stream', duration: '6-12 Months' },
          { step: 3, title: 'Prepare for GATE', description: 'Solve previous papers, take mock tests', duration: '6-12 Months' },
          { step: 4, title: 'Appear for GATE', description: 'Clear GATE exam', duration: 'Exam' },
          { step: 5, title: 'GATE Counseling', description: 'Participate in COAP/CCMT', duration: 'After Result' },
          { step: 6, title: 'Complete M.Tech', description: '2-year M.Tech course', duration: '2 Years' }
        ]
      },
      'NDA': {
        title: 'NDA (National Defence Academy)',
        icon: <FaFlag />,
        fullPath: '12th → NDA Exam → SSB Interview → Academy Training',
        steps: [
          { step: 1, title: 'Complete 12th', description: 'Pass 12th in any stream', duration: '2 Years' },
          { step: 2, title: 'Check Eligibility', description: 'Age 16.5-19.5 years', duration: 'Before Exam' },
          { step: 3, title: 'Apply for NDA', description: 'Fill NDA application form', duration: 'When Notified' },
          { step: 4, title: 'Appear for Written', description: 'Clear NDA written exam', duration: 'Exam' },
          { step: 5, title: 'SSB Interview', description: '5-day selection process', duration: 'After Result' },
          { step: 6, title: 'Training', description: '3-year training at NDA', duration: '3 Years' }
        ]
      }
    }
  }

  const govtCollegeTypes = ['IIT', 'NIT', 'IIIT', 'Medical', 'NDA', 'ArtsCollege', 'CommerceCollege']

  const getFilteredCollegeTypes = () => {
    if (selectedStream === 'science') {
      return ['IIT', 'NIT', 'IIIT', 'Medical']
    } else if (selectedStream === 'commerce') {
      return ['CommerceCollege', 'NDA', 'ArtsCollege']
    } else if (selectedStream === 'arts') {
      return ['ArtsCollege', 'NDA', 'CommerceCollege']
    } else if (selectedStream === 'computer') {
      return ['IIT', 'NIT', 'IIIT']
    }
    return govtCollegeTypes
  }

  const filteredCollegeTypes = getFilteredCollegeTypes()

  // Get govt college description based on selected stream
  const getGovtCollegeDescription = () => {
    if (!selectedStream) {
      return "Explore all streams and career options"
    }

    switch (selectedStream) {
      case 'science':
        return "Engineering, medical & research pathways"
      case 'commerce':
        return "Business, finance & professional careers"
      case 'arts':
        return "Humanities, creativity & civil services paths"
      case 'computer':
        return "Technology, coding & innovation careers"
      default:
        return "Explore all streams and career options"
    }
  }

  // Get college data
  const getCollegeData = () => {
    return {
      'IIT': {
        title: 'IIT (Indian Schools of Technology)',
        icon: <FaCog />,
        fullPath: '12th (PCM) → JEE Main → JEE Advanced → IIT Admission',
        eligibility: 'JEE Main + Advanced qualified',
        seats: '~17,000 seats across all IITs',
        steps: [
          { step: 1, title: 'Complete 12th with PCM', description: 'Physics, Chemistry, Mathematics', duration: '2 Years' },
          { step: 2, title: 'Prepare for JEE Main', description: 'Cover complete PCM syllabus', duration: '1-2 Years' },
          { step: 3, title: 'Appear for JEE Main', description: 'Clear JEE Main exam', duration: 'Exam' },
          { step: 4, title: 'Prepare for JEE Advanced', description: 'If qualified in JEE Main', duration: '6-12 Months' },
          { step: 5, title: 'JoSAA Counseling', description: 'Participate in counseling', duration: 'After Results' },
          { step: 6, title: 'Get IIT Seat', description: 'Lock seat in choice filling', duration: 'Process' }
        ]
      },
      'NIT': {
        title: 'NIT (National Schools of Technology)',
        icon: <FaUniversity />,
        fullPath: '12th (PCM) → JEE Main → CSAB Counseling → NIT Admission',
        eligibility: 'JEE Main qualified',
        seats: '~25,000 seats across all NITs',
        steps: [
          { step: 1, title: 'Complete 12th with PCM', description: 'Physics, Chemistry, Mathematics', duration: '2 Years' },
          { step: 2, title: 'Prepare for JEE Main', description: 'Cover complete PCM syllabus', duration: '1-2 Years' },
          { step: 3, title: 'Appear for JEE Main', description: 'Clear JEE Main exam', duration: 'Exam' },
          { step: 4, title: 'Check Result & Rank', description: 'Check your JEE Main rank', duration: 'After Result' },
          { step: 5, title: 'CSAB Counseling', description: 'Participate in counseling', duration: 'After Result' },
          { step: 6, title: 'Get NIT Seat', description: 'Lock seat in choice filling', duration: 'Process' }
        ]
      },
      'IIIT': {
        title: 'IIIT (Indian Schools of Information Technology)',
        icon: <FaMicrochip />,
        fullPath: '12th (PCM) → JEE Main → CSAB/JoSAA → IIIT Admission',
        eligibility: 'JEE Main qualified',
        seats: '~5000 seats across all IIITs',
        steps: [
          { step: 1, title: 'Complete 12th with PCM', description: 'Physics, Chemistry, Mathematics', duration: '2 Years' },
          { step: 2, title: 'Prepare for JEE Main', description: 'Focus on Mathematics and Physics', duration: '1-2 Years' },
          { step: 3, title: 'Appear for JEE Main', description: 'Clear JEE Main exam', duration: 'Exam' },
          { step: 4, title: 'Check Result & Rank', description: 'Check your JEE Main rank', duration: 'After Result' },
          { step: 5, title: 'Counseling', description: 'Participate in counseling', duration: 'After Result' },
          { step: 6, title: 'Get IIIT Seat', description: 'Lock seat in choice filling', duration: 'Process' }
        ]
      },
      'Medical': {
        title: 'Government Medical Colleges',
        icon: <FaHeartbeat />,
        fullPath: '12th (PCB) → NEET → AIQ/State Counseling → MBBS',
        eligibility: 'PCB, NEET qualified',
        seats: '~50,000 seats (Govt + Pvt)',
        steps: [
          { step: 1, title: 'Complete 12th with PCB', description: 'Physics, Chemistry, Biology', duration: '2 Years' },
          { step: 2, title: 'Prepare for NEET', description: 'Cover complete PCB syllabus', duration: '1-2 Years' },
          { step: 3, title: 'Appear for NEET', description: 'Clear NEET exam', duration: 'Exam' },
          { step: 4, title: 'Check Result', description: 'Check your NEET score and rank', duration: 'After Result' },
          { step: 5, title: 'AIQ Counseling', description: 'All India Quota counseling', duration: 'After Result' },
          { step: 6, title: 'Get Medical College', description: 'Lock seat in choice filling', duration: 'Process' }
        ]
      },
      'NDA': {
        title: 'NDA (National Defence Academy)',
        icon: <FaFlag />,
        fullPath: '12th → NDA Exam → SSB Interview → Academy Training',
        eligibility: '12th Pass (Science for Army), Age 16.5-19.5 years',
        seats: '~400 seats per course',
        steps: [
          { step: 1, title: 'Complete 12th', description: 'Pass 12th in any stream', duration: '2 Years' },
          { step: 2, title: 'Check Eligibility', description: 'Age 16.5-19.5 years', duration: 'Before Exam' },
          { step: 3, title: 'Apply for NDA', description: 'Fill NDA application form', duration: 'When Notified' },
          { step: 4, title: 'Appear for Written', description: 'Clear NDA written exam', duration: 'Exam' },
          { step: 5, title: 'SSB Interview', description: '5-day selection process', duration: 'After Result' },
          { step: 6, title: 'Training', description: '3-year training at NDA', duration: '3 Years' }
        ]
      },
      'ArtsCollege': {
        title: 'Government Arts & Science Colleges',
        icon: <FaBook />,
        fullPath: '12th (Arts) → CUET/State Admission → BA/B.Com Admission',
        eligibility: '12th Pass, CUET for some colleges',
        seats: 'Thousands of seats',
        steps: [
          { step: 1, title: 'Complete 12th', description: 'Pass 12th in any stream', duration: '2 Years' },
          { step: 2, title: 'Prepare for CUET', description: 'Apply for CUET', duration: '2-3 Months' },
          { step: 3, title: 'Appear for CUET', description: 'Clear CUET exam', duration: 'Exam' },
          { step: 4, title: 'Participate in Counseling', description: 'Choose college and get admission', duration: 'Process' },
          { step: 5, title: 'Complete Degree', description: '3-year BA/B.Com course', duration: '3 Years' }
        ]
      },
      'CommerceCollege': {
        title: 'Government Commerce Colleges',
        icon: <FaBriefcase />,
        fullPath: '12th (Commerce/Arts) → CUET/State Admission → B.Com Admission',
        eligibility: '12th Pass, CUET for some colleges',
        seats: 'Thousands of seats',
        steps: [
          { step: 1, title: 'Complete 12th', description: '12th in Commerce or Arts stream', duration: '2 Years' },
          { step: 2, title: 'Prepare for CUET', description: 'Apply for CUET', duration: '2-3 Months' },
          { step: 3, title: 'Appear for CUET', description: 'Clear CUET exam', duration: 'Exam' },
          { step: 4, title: 'Participate in Counseling', description: 'Choose college and get admission', duration: 'Process' },
          { step: 5, title: 'Complete Degree', description: '3-year B.Com course', duration: '3 Years' }
        ]
      }
    }
  }

  // Helper function to get stream display name
  const getStreamName = (streamId) => {
    const streamNames = {
      'science': language === 'hi' ? 'विज्ञान' : 'Science',
      'commerce': language === 'hi' ? 'वाणिज्य' : 'Commerce',
      'arts': language === 'hi' ? 'कला' : 'Arts',
      'computer': language === 'hi' ? 'कंप्यूटर विज्ञान' : 'Computer Science'
    }
    return streamNames[streamId] || 'Unknown'
  }

  // Helper function to get course name
  const getCourseName = (courseName) => {
    return courseName || ''
  }

  // Helper function to get course description
  const getCourseDescription = (courseName, fallbackDescription = '') => {
    return fallbackDescription
  }

  // Courses based on stream and percentage
  const getCoursesByStreamAndPercentage = (stream, perc) => {
    const userPerc = Number(perc)
    
    const coursesData = {
      science: {
        high: [
          { name: 'B.Tech (Bachelor of Technology)', duration: '4 Years', icon: <FaCog />, description: 'Engineering degree in various specializations', careers: ['Software Engineer', 'Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer'], careerPaths: [{ path: 'B.Tech → Software Engineer', steps: ['Complete B.Tech in CS/IT', 'Learn programming languages', 'Build projects', 'Apply for software jobs', 'Grow to senior roles'], salary: '₹6-25 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' }, { path: 'B.Tech → MBA → Manager', steps: ['Complete B.Tech', 'Work for 2-3 years', 'Pursue MBA', 'Get management role', 'Grow to leadership'], salary: '₹10-40 LPA', growth: 'Engineer → Manager → Director' }] },
          { name: 'MBBS (Bachelor of Medicine)', duration: '5.5 Years', icon: <FaHospital />, description: 'Medical degree to become a doctor', careers: ['Doctor', 'Surgeon', 'Medical Officer', 'Specialist'], careerPaths: [{ path: 'MBBS → MD → Specialist', steps: ['Complete MBBS', 'Intern for 1 year', 'Clear NEET PG', 'Pursue MD/MS (3 years)', 'Become specialist doctor'], salary: '₹10-50 LPA', growth: 'Junior Doctor → Senior Doctor → Head of Department' }] },
          { name: 'B.Sc (Bachelor of Science)', duration: '3 Years', icon: <FaFlask />, description: 'Science degree in various subjects', careers: ['Scientist', 'Researcher', 'Lab Technician', 'Teacher'], careerPaths: [{ path: 'B.Sc → M.Sc → Scientist', steps: ['Complete B.Sc', 'Pursue M.Sc', 'Clear NET/SET', 'Join research lab', 'Become scientist'], salary: '₹6-15 LPA', growth: 'Research Associate → Scientist → Senior Scientist' }] },
          { name: 'B.Pharma (Bachelor of Pharmacy)', duration: '4 Years', icon: <FaLaptopMedical />, description: 'Pharmacy degree for drug manufacturing', careers: ['Pharmacist', 'Medical Representative', 'Drug Inspector'], careerPaths: [{ path: 'B.Pharma → Pharmacist', steps: ['Complete B.Pharma', 'Register with Pharmacy Council', 'Join hospital/retail pharmacy', 'Manage pharmacy operations', 'Open own pharmacy'], salary: '₹4-12 LPA', growth: 'Pharmacist → Senior Pharmacist → Pharmacy Manager' }] },
          { name: 'BDS (Bachelor of Dental Surgery)', duration: '5 Years', icon: <FaHospital />, description: 'Dental degree for dental care', careers: ['Dentist', 'Dental Surgeon', 'Orthodontist'], careerPaths: [{ path: 'BDS → MDS → Specialist', steps: ['Complete BDS', 'Practice for 2-3 years', 'Pursue MDS (3 years)', 'Specialize in orthodontics', 'Open dental clinic'], salary: '₹8-30 LPA', growth: 'Dentist → Specialist → Head of Department' }] },
          { name: 'B.Sc Nursing', duration: '4 Years', icon: <FaHeartbeat />, description: 'Nursing degree for healthcare', careers: ['Nurse', 'Nursing Officer', 'Healthcare Administrator'], careerPaths: [{ path: 'B.Sc Nursing → Staff Nurse', steps: ['Complete B.Sc Nursing', 'Register with Nursing Council', 'Join hospital', 'Work as staff nurse', 'Promote to senior nurse'], salary: '₹3-8 LPA', growth: 'Staff Nurse → Senior Nurse → Nursing Superintendent' }] }
        ],
        medium: [
          { name: 'B.Sc (Bachelor of Science)', duration: '3 Years', icon: <FaFlask />, description: 'Science degree in various subjects', careers: ['Scientist', 'Researcher', 'Lab Technician', 'Teacher'], careerPaths: [{ path: 'B.Sc → M.Sc → Scientist', steps: ['Complete B.Sc', 'Pursue M.Sc', 'Clear NET/SET', 'Join research lab', 'Become scientist'], salary: '₹6-15 LPA', growth: 'Research Associate → Scientist → Senior Scientist' }] },
          { name: 'B.Pharma (Bachelor of Pharmacy)', duration: '4 Years', icon: <FaLaptopMedical />, description: 'Pharmacy degree for drug manufacturing', careers: ['Pharmacist', 'Medical Representative', 'Drug Inspector'], careerPaths: [{ path: 'B.Pharma → Pharmacist', steps: ['Complete B.Pharma', 'Register with Pharmacy Council', 'Join hospital/retail pharmacy', 'Manage pharmacy operations', 'Open own pharmacy'], salary: '₹4-12 LPA', growth: 'Pharmacist → Senior Pharmacist → Pharmacy Manager' }] },
          { name: 'B.Sc Nursing', duration: '4 Years', icon: <FaHeartbeat />, description: 'Nursing degree for healthcare', careers: ['Nurse', 'Nursing Officer', 'Healthcare Administrator'], careerPaths: [{ path: 'B.Sc Nursing → Staff Nurse', steps: ['Complete B.Sc Nursing', 'Register with Nursing Council', 'Join hospital', 'Work as staff nurse', 'Promote to senior nurse'], salary: '₹3-8 LPA', growth: 'Staff Nurse → Senior Nurse → Nursing Superintendent' }] },
          { name: 'B.Sc Agriculture', duration: '4 Years', icon: <FaSeedling />, description: 'Agriculture and farming science', careers: ['Agricultural Officer', 'Farm Manager', 'Agricultural Scientist'], careerPaths: [{ path: 'B.Sc Agriculture → Agricultural Officer', steps: ['Complete B.Sc Agriculture', 'Clear ICAR exam', 'Join government agriculture department', 'Work as agricultural officer', 'Promote to senior positions'], salary: '₹4-12 LPA', growth: 'Officer → Senior Officer → Director' }] }
        ],
        low: [
          { name: 'B.Sc (Bachelor of Science)', duration: '3 Years', icon: <FaFlask />, description: 'Science degree in various subjects', careers: ['Scientist', 'Researcher', 'Lab Technician', 'Teacher'], careerPaths: [{ path: 'B.Sc → M.Sc → Scientist', steps: ['Complete B.Sc', 'Pursue M.Sc', 'Clear NET/SET', 'Join research lab', 'Become scientist'], salary: '₹6-15 LPA', growth: 'Research Associate → Scientist → Senior Scientist' }] },
          { name: 'B.Sc Nursing', duration: '4 Years', icon: <FaHeartbeat />, description: 'Nursing degree for healthcare', careers: ['Nurse', 'Nursing Officer', 'Healthcare Administrator'], careerPaths: [{ path: 'B.Sc Nursing → Staff Nurse', steps: ['Complete B.Sc Nursing', 'Register with Nursing Council', 'Join hospital', 'Work as staff nurse', 'Promote to senior nurse'], salary: '₹3-8 LPA', growth: 'Staff Nurse → Senior Nurse → Nursing Superintendent' }] },
          { name: 'Diploma in Engineering', duration: '3 Years', icon: <FaTools />, description: 'Engineering diploma courses', careers: ['Technician', 'Supervisor', 'Junior Engineer'], careerPaths: [{ path: 'Diploma → Junior Engineer', steps: ['Complete Diploma in Engineering', 'Join manufacturing company', 'Work as technician', 'Gain experience', 'Promote to supervisor'], salary: '₹3-8 LPA', growth: 'Technician → Supervisor → Manager' }] }
        ]
      },
      commerce: {
        high: [
          { name: 'B.Com (Bachelor of Commerce)', duration: '3 Years', icon: <FaBriefcase />, description: 'Commerce degree for business and finance', careers: ['Accountant', 'Financial Analyst', 'Tax Consultant'], careerPaths: [{ path: 'B.Com → CA → Chartered Accountant', steps: ['Complete B.Com', 'Register for CA', 'Clear IPCC', 'Complete articleship', 'Clear CA Final'], salary: '₹8-30 LPA', growth: 'Junior CA → Senior CA → Partner' }] },
          { name: 'BBA (Bachelor of Business Administration)', duration: '3 Years', icon: <FaUserTie />, description: 'Business administration degree', careers: ['Manager', 'Business Analyst', 'HR Manager'], careerPaths: [{ path: 'BBA → MBA → Manager', steps: ['Complete BBA', 'Pursue MBA (2 years)', 'Specialize in HR/Marketing', 'Get placement', 'Grow to management roles'], salary: '₹6-25 LPA', growth: 'Executive → Manager → Director' }] },
          { name: 'CA (Chartered Accountancy)', duration: '4-5 Years', icon: <FaBalanceScale />, description: 'Professional accounting qualification', careers: ['Chartered Accountant', 'Auditor', 'Financial Advisor'], careerPaths: [{ path: 'CA → Practice → Senior CA', steps: ['Complete CA', 'Join CA firm', 'Handle client accounts', 'Build expertise', 'Start own practice'], salary: '₹8-50 LPA', growth: 'Junior CA → Senior CA → Partner' }] },
          { name: 'CS (Company Secretary)', duration: '3-4 Years', icon: <FaBuilding />, description: 'Corporate governance professional', careers: ['Company Secretary', 'Compliance Officer', 'Legal Advisor'], careerPaths: [{ path: 'CS → Practice → Senior CS', steps: ['Complete CS', 'Register with ICSI', 'Join company', 'Handle compliance', 'Become senior CS'], salary: '₹6-25 LPA', growth: 'Junior CS → Senior CS → Partner' }] }
        ],
        medium: [
          { name: 'B.Com (Bachelor of Commerce)', duration: '3 Years', icon: <FaBriefcase />, description: 'Commerce degree for business and finance', careers: ['Accountant', 'Financial Analyst', 'Tax Consultant'], careerPaths: [{ path: 'B.Com → M.Com → Professor', steps: ['Complete B.Com', 'Pursue M.Com', 'Clear NET/SET', 'Pursue PhD', 'Join college as professor'], salary: '₹6-15 LPA', growth: 'Assistant Professor → Professor → Dean' }] },
          { name: 'BBA (Bachelor of Business Administration)', duration: '3 Years', icon: <FaUserTie />, description: 'Business administration degree', careers: ['Manager', 'Business Analyst', 'HR Manager'], careerPaths: [{ path: 'BBA → MBA → Manager', steps: ['Complete BBA', 'Pursue MBA (2 years)', 'Specialize in HR/Marketing', 'Get placement', 'Grow to management roles'], salary: '₹6-25 LPA', growth: 'Executive → Manager → Director' }] }
        ],
        low: [
          { name: 'B.Com (Bachelor of Commerce)', duration: '3 Years', icon: <FaBriefcase />, description: 'Commerce degree for business and finance', careers: ['Accountant', 'Financial Analyst', 'Tax Consultant'], careerPaths: [{ path: 'B.Com → M.Com → Professor', steps: ['Complete B.Com', 'Pursue M.Com', 'Clear NET/SET', 'Pursue PhD', 'Join college as professor'], salary: '₹6-15 LPA', growth: 'Assistant Professor → Professor → Dean' }] },
          { name: 'Diploma in Accounting', duration: '1-2 Years', icon: <FaChartBar />, description: 'Accounting and bookkeeping', careers: ['Accountant', 'Bookkeeper', 'Accounts Assistant'], careerPaths: [{ path: 'Diploma → Accountant', steps: ['Complete Diploma in Accounting', 'Learn accounting software', 'Join company as accounts assistant', 'Handle bookkeeping', 'Promote to accountant'], salary: '₹2-6 LPA', growth: 'Assistant → Accountant → Senior Accountant' }] }
        ]
      },
      arts: {
        high: [
          { name: 'BA (Bachelor of Arts)', duration: '3 Years', icon: <FaBook />, description: 'Arts degree in various humanities subjects', careers: ['Teacher', 'Writer', 'Content Creator', 'Journalist'], careerPaths: [{ path: 'BA → B.Ed → Teacher', steps: ['Complete BA in your subject', 'Pursue B.Ed (2 years)', 'Clear CTET/TET exam', 'Apply for teaching positions'], salary: '₹3-8 LPA', growth: 'Senior Teacher → Head of Department → Principal' }] },
          { name: 'LLB (Bachelor of Laws)', duration: '3 Years', icon: <FaBalanceScale />, description: 'Law degree for legal practice', careers: ['Lawyer', 'Legal Advisor', 'Judge', 'Legal Consultant'], careerPaths: [{ path: 'LLB → Practice → Senior Advocate', steps: ['Complete LLB', 'Enroll with Bar Council', 'Practice under senior lawyer', 'Build client base', 'Become senior advocate'], salary: '₹5-50 LPA', growth: 'Junior Lawyer → Senior Lawyer → Senior Advocate' }] },
          { name: 'BJMC (Journalism & Mass Communication)', duration: '3 Years', icon: <FaNewspaper />, description: 'Journalism and media studies', careers: ['Journalist', 'News Anchor', 'Content Writer', 'PR Manager'], careerPaths: [{ path: 'BJMC → Reporter → News Anchor', steps: ['Complete BJMC', 'Intern with news channel', 'Work as reporter', 'Develop on-screen presence', 'Become news anchor'], salary: '₹4-20 LPA', growth: 'Reporter → Senior Reporter → News Anchor' }] },
          { name: 'B.Ed (Bachelor of Education)', duration: '2 Years', icon: <FaChalkboardTeacher />, description: 'Teaching degree for educators', careers: ['Teacher', 'Principal', 'Education Counselor'], careerPaths: [{ path: 'B.Ed → TET → Government Teacher', steps: ['Complete B.Ed', 'Clear CTET/TET exam', 'Apply for government schools', 'Get selected', 'Grow to senior positions'], salary: '₹4-10 LPA', growth: 'Teacher → Senior Teacher → Headmaster' }] }
        ],
        medium: [
          { name: 'BA (Bachelor of Arts)', duration: '3 Years', icon: <FaBook />, description: 'Arts degree in various humanities subjects', careers: ['Teacher', 'Writer', 'Content Creator', 'Journalist'], careerPaths: [{ path: 'BA → B.Ed → Teacher', steps: ['Complete BA in your subject', 'Pursue B.Ed (2 years)', 'Clear CTET/TET exam', 'Apply for teaching positions'], salary: '₹3-8 LPA', growth: 'Senior Teacher → Head of Department → Principal' }] },
          { name: 'BJMC (Journalism & Mass Communication)', duration: '3 Years', icon: <FaNewspaper />, description: 'Journalism and media studies', careers: ['Journalist', 'News Anchor', 'Content Writer', 'PR Manager'], careerPaths: [{ path: 'BJMC → Reporter → News Anchor', steps: ['Complete BJMC', 'Intern with news channel', 'Work as reporter', 'Develop on-screen presence', 'Become news anchor'], salary: '₹4-20 LPA', growth: 'Reporter → Senior Reporter → News Anchor' }] },
          { name: 'B.Ed (Bachelor of Education)', duration: '2 Years', icon: <FaChalkboardTeacher />, description: 'Teaching degree for educators', careers: ['Teacher', 'Principal', 'Education Counselor'], careerPaths: [{ path: 'B.Ed → TET → Government Teacher', steps: ['Complete B.Ed', 'Clear CTET/TET exam', 'Apply for government schools', 'Get selected', 'Grow to senior positions'], salary: '₹4-10 LPA', growth: 'Teacher → Senior Teacher → Headmaster' }] }
        ],
        low: [
          { name: 'BA (Bachelor of Arts)', duration: '3 Years', icon: <FaBook />, description: 'Arts degree in various humanities subjects', careers: ['Teacher', 'Writer', 'Content Creator', 'Journalist'], careerPaths: [{ path: 'BA → B.Ed → Teacher', steps: ['Complete BA in your subject', 'Pursue B.Ed (2 years)', 'Clear CTET/TET exam', 'Apply for teaching positions'], salary: '₹3-8 LPA', growth: 'Senior Teacher → Head of Department → Principal' }] },
          { name: 'B.Ed (Bachelor of Education)', duration: '2 Years', icon: <FaChalkboardTeacher />, description: 'Teaching degree for educators', careers: ['Teacher', 'Principal', 'Education Counselor'], careerPaths: [{ path: 'B.Ed → TET → Government Teacher', steps: ['Complete B.Ed', 'Clear CTET/TET exam', 'Apply for government schools', 'Get selected', 'Grow to senior positions'], salary: '₹4-10 LPA', growth: 'Teacher → Senior Teacher → Headmaster' }] },
          { name: 'Diploma in Journalism', duration: '1-2 Years', icon: <FaNewspaper />, description: 'Journalism and media', careers: ['Reporter', 'Content Writer', 'Media Assistant'], careerPaths: [{ path: 'Diploma → Reporter', steps: ['Complete Diploma in Journalism', 'Intern with local newspaper', 'Work as junior reporter', 'Cover local news', 'Become senior reporter'], salary: '₹2-8 LPA', growth: 'Junior Reporter → Reporter → Senior Reporter' }] }
        ]
      },
      computer: {
        high: [
          { name: 'BCA (Bachelor of Computer Applications)', duration: '3 Years', icon: <FaLaptopMedical />, description: 'Computer applications and programming', careers: ['Software Developer', 'Web Developer', 'System Administrator'], careerPaths: [{ path: 'BCA → MCA → Software Developer', steps: ['Complete BCA', 'Pursue MCA (3 years)', 'Learn programming languages', 'Build projects', 'Apply for software jobs'], salary: '₹4-15 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' }] },
          { name: 'B.Tech CSE (Computer Science)', duration: '4 Years', icon: <FaMicrochip />, description: 'Computer science engineering', careers: ['Software Engineer', 'Data Scientist', 'AI Engineer'], careerPaths: [{ path: 'B.Tech → Software Engineer', steps: ['Complete B.Tech CSE', 'Learn programming', 'Build projects', 'Apply for software jobs', 'Grow to senior roles'], salary: '₹6-25 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' }] },
          { name: 'B.Tech IT (Information Technology)', duration: '4 Years', icon: <FaNetworkWired />, description: 'Information technology engineering', careers: ['IT Manager', 'Network Engineer', 'System Analyst'], careerPaths: [{ path: 'B.Tech IT → IT Manager', steps: ['Complete B.Tech IT', 'Join IT company', 'Handle IT operations', 'Manage IT team', 'Become IT manager'], salary: '₹6-25 LPA', growth: 'IT Executive → IT Manager → CTO' }] },
          { name: 'B.Sc Computer Science', duration: '3 Years', icon: <FaCode />, description: 'Science degree in computer science', careers: ['Software Developer', 'Web Developer', 'IT Consultant'], careerPaths: [{ path: 'B.Sc CS → M.Sc CS → Software Developer', steps: ['Complete B.Sc CS', 'Pursue M.Sc CS', 'Learn programming', 'Build projects', 'Apply for software jobs'], salary: '₹4-15 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' }] },
          { name: 'B.Tech AI & ML', duration: '4 Years', icon: <FaRobot />, description: 'Artificial intelligence and machine learning', careers: ['AI Engineer', 'ML Engineer', 'Data Scientist'], careerPaths: [{ path: 'B.Tech AI → AI Engineer', steps: ['Complete B.Tech AI & ML', 'Learn AI/ML frameworks', 'Build AI projects', 'Apply for AI jobs', 'Grow to senior AI roles'], salary: '₹8-30 LPA', growth: 'AI Developer → AI Engineer → AI Architect' }] }
        ],
        medium: [
          { name: 'BCA (Bachelor of Computer Applications)', duration: '3 Years', icon: <FaLaptopMedical />, description: 'Computer applications and programming', careers: ['Software Developer', 'Web Developer', 'System Administrator'], careerPaths: [{ path: 'BCA → MCA → Software Developer', steps: ['Complete BCA', 'Pursue MCA (3 years)', 'Learn programming languages', 'Build projects', 'Apply for software jobs'], salary: '₹4-15 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' }] },
          { name: 'B.Sc Computer Science', duration: '3 Years', icon: <FaCode />, description: 'Science degree in computer science', careers: ['Software Developer', 'Web Developer', 'IT Consultant'], careerPaths: [{ path: 'B.Sc CS → M.Sc CS → Software Developer', steps: ['Complete B.Sc CS', 'Pursue M.Sc CS', 'Learn programming', 'Build projects', 'Apply for software jobs'], salary: '₹4-15 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' }] },
          { name: 'B.Sc IT (Information Technology)', duration: '3 Years', icon: <FaNetworkWired />, description: 'Information technology', careers: ['IT Support', 'Network Administrator', 'Web Developer'], careerPaths: [{ path: 'B.Sc IT → IT Support', steps: ['Complete B.Sc IT', 'Learn IT support skills', 'Join company as IT support', 'Handle technical issues', 'Promote to IT administrator'], salary: '₹3-10 LPA', growth: 'Support → Administrator → IT Manager' }] }
        ],
        low: [
          { name: 'BCA (Bachelor of Computer Applications)', duration: '3 Years', icon: <FaLaptopMedical />, description: 'Computer applications and programming', careers: ['Software Developer', 'Web Developer', 'System Administrator'], careerPaths: [{ path: 'BCA → MCA → Software Developer', steps: ['Complete BCA', 'Pursue MCA (3 years)', 'Learn programming languages', 'Build projects', 'Apply for software jobs'], salary: '₹4-15 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' }] },
          { name: 'B.Sc Computer Science', duration: '3 Years', icon: <FaCode />, description: 'Science degree in computer science', careers: ['Software Developer', 'Web Developer', 'IT Consultant'], careerPaths: [{ path: 'B.Sc CS → M.Sc CS → Software Developer', steps: ['Complete B.Sc CS', 'Pursue M.Sc CS', 'Learn programming', 'Build projects', 'Apply for software jobs'], salary: '₹4-15 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' }] },
          { name: 'Diploma in Computer Applications', duration: '1 Year', icon: <FaLaptopMedical />, description: 'Computer applications diploma', careers: ['Computer Operator', 'Data Entry', 'Office Assistant'], careerPaths: [{ path: 'Diploma → Computer Operator', steps: ['Complete Diploma in Computer Applications', 'Learn office software', 'Join company as computer operator', 'Handle data entry', 'Promote to office assistant'], salary: '₹2-5 LPA', growth: 'Operator → Assistant → Office Manager' }] }
        ]
      }
    }

    if (!coursesData[stream]) return []

    if (userPerc >= 75) {
      return coursesData[stream].high
    } else if (userPerc >= 60) {
      return coursesData[stream].medium
    } else {
      return coursesData[stream].low
    }
  }

  // Get all courses for the selected stream
  const getAllCoursesForStream = (stream) => {
    const coursesData = {
      science: [
        { name: 'B.Tech (Bachelor of Technology)', duration: '4 Years', icon: <FaCog />, description: 'Engineering degree in various specializations', careers: ['Software Engineer', 'Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer'], careerPaths: [{ path: 'B.Tech → Software Engineer', steps: ['Complete B.Tech in CS/IT', 'Learn programming languages', 'Build projects', 'Apply for software jobs', 'Grow to senior roles'], salary: '₹6-25 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' }] },
        { name: 'MBBS (Bachelor of Medicine)', duration: '5.5 Years', icon: <FaHospital />, description: 'Medical degree to become a doctor', careers: ['Doctor', 'Surgeon', 'Medical Officer', 'Specialist'], careerPaths: [{ path: 'MBBS → MD → Specialist', steps: ['Complete MBBS', 'Intern for 1 year', 'Clear NEET PG', 'Pursue MD/MS (3 years)', 'Become specialist doctor'], salary: '₹10-50 LPA', growth: 'Junior Doctor → Senior Doctor → Head of Department' }] },
        { name: 'B.Sc (Bachelor of Science)', duration: '3 Years', icon: <FaFlask />, description: 'Science degree in various subjects', careers: ['Scientist', 'Researcher', 'Lab Technician', 'Teacher'], careerPaths: [{ path: 'B.Sc → M.Sc → Scientist', steps: ['Complete B.Sc', 'Pursue M.Sc', 'Clear NET/SET', 'Join research lab', 'Become scientist'], salary: '₹6-15 LPA', growth: 'Research Associate → Scientist → Senior Scientist' }] },
        { name: 'B.Pharma (Bachelor of Pharmacy)', duration: '4 Years', icon: <FaLaptopMedical />, description: 'Pharmacy degree for drug manufacturing', careers: ['Pharmacist', 'Medical Representative', 'Drug Inspector'], careerPaths: [{ path: 'B.Pharma → Pharmacist', steps: ['Complete B.Pharma', 'Register with Pharmacy Council', 'Join hospital/retail pharmacy', 'Manage pharmacy operations', 'Open own pharmacy'], salary: '₹4-12 LPA', growth: 'Pharmacist → Senior Pharmacist → Pharmacy Manager' }] },
        { name: 'BDS (Bachelor of Dental Surgery)', duration: '5 Years', icon: <FaHospital />, description: 'Dental degree for dental care', careers: ['Dentist', 'Dental Surgeon', 'Orthodontist'], careerPaths: [{ path: 'BDS → MDS → Specialist', steps: ['Complete BDS', 'Practice for 2-3 years', 'Pursue MDS (3 years)', 'Specialize in orthodontics', 'Open dental clinic'], salary: '₹8-30 LPA', growth: 'Dentist → Specialist → Head of Department' }] },
        { name: 'B.Sc Nursing', duration: '4 Years', icon: <FaHeartbeat />, description: 'Nursing degree for healthcare', careers: ['Nurse', 'Nursing Officer', 'Healthcare Administrator'], careerPaths: [{ path: 'B.Sc Nursing → Staff Nurse', steps: ['Complete B.Sc Nursing', 'Register with Nursing Council', 'Join hospital', 'Work as staff nurse', 'Promote to senior nurse'], salary: '₹3-8 LPA', growth: 'Staff Nurse → Senior Nurse → Nursing Superintendent' }] },
        { name: 'B.Sc Agriculture', duration: '4 Years', icon: <FaSeedling />, description: 'Agriculture and farming science', careers: ['Agricultural Officer', 'Farm Manager', 'Agricultural Scientist'], careerPaths: [{ path: 'B.Sc Agriculture → Agricultural Officer', steps: ['Complete B.Sc Agriculture', 'Clear ICAR exam', 'Join government agriculture department', 'Work as agricultural officer', 'Promote to senior positions'], salary: '₹4-12 LPA', growth: 'Officer → Senior Officer → Director' }] },
        { name: 'Diploma in Engineering', duration: '3 Years', icon: <FaTools />, description: 'Engineering diploma courses', careers: ['Technician', 'Supervisor', 'Junior Engineer'], careerPaths: [{ path: 'Diploma → Junior Engineer', steps: ['Complete Diploma in Engineering', 'Join manufacturing company', 'Work as technician', 'Gain experience', 'Promote to supervisor'], salary: '₹3-8 LPA', growth: 'Technician → Supervisor → Manager' }] }
      ],
      commerce: [
        { name: 'B.Com (Bachelor of Commerce)', duration: '3 Years', icon: <FaBriefcase />, description: 'Commerce degree for business and finance', careers: ['Accountant', 'Financial Analyst', 'Tax Consultant'], careerPaths: [{ path: 'B.Com → CA → Chartered Accountant', steps: ['Complete B.Com', 'Register for CA', 'Clear IPCC', 'Complete articleship', 'Clear CA Final'], salary: '₹8-30 LPA', growth: 'Junior CA → Senior CA → Partner' }] },
        { name: 'BBA (Bachelor of Business Administration)', duration: '3 Years', icon: <FaUserTie />, description: 'Business administration degree', careers: ['Manager', 'Business Analyst', 'HR Manager'], careerPaths: [{ path: 'BBA → MBA → Manager', steps: ['Complete BBA', 'Pursue MBA (2 years)', 'Specialize in HR/Marketing', 'Get placement', 'Grow to management roles'], salary: '₹6-25 LPA', growth: 'Executive → Manager → Director' }] },
        { name: 'CA (Chartered Accountancy)', duration: '4-5 Years', icon: <FaBalanceScale />, description: 'Professional accounting qualification', careers: ['Chartered Accountant', 'Auditor', 'Financial Advisor'], careerPaths: [{ path: 'CA → Practice → Senior CA', steps: ['Complete CA', 'Join CA firm', 'Handle client accounts', 'Build expertise', 'Start own practice'], salary: '₹8-50 LPA', growth: 'Junior CA → Senior CA → Partner' }] },
        { name: 'CS (Company Secretary)', duration: '3-4 Years', icon: <FaBuilding />, description: 'Corporate governance professional', careers: ['Company Secretary', 'Compliance Officer', 'Legal Advisor'], careerPaths: [{ path: 'CS → Practice → Senior CS', steps: ['Complete CS', 'Register with ICSI', 'Join company', 'Handle compliance', 'Become senior CS'], salary: '₹6-25 LPA', growth: 'Junior CS → Senior CS → Partner' }] },
        { name: 'B.Com (Hons)', duration: '3 Years', icon: <FaBriefcase />, description: 'Honors commerce degree', careers: ['Accountant', 'Financial Analyst', 'Banker'], careerPaths: [{ path: 'B.Com Hons → Banker', steps: ['Complete B.Com Hons', 'Clear bank exams', 'Join bank as officer', 'Handle banking operations', 'Promote to manager'], salary: '₹4-12 LPA', growth: 'Officer → Manager → Branch Manager' }] },
        { name: 'Diploma in Accounting', duration: '1-2 Years', icon: <FaChartBar />, description: 'Accounting and bookkeeping', careers: ['Accountant', 'Bookkeeper', 'Accounts Assistant'], careerPaths: [{ path: 'Diploma → Accountant', steps: ['Complete Diploma in Accounting', 'Learn accounting software', 'Join company as accounts assistant', 'Handle bookkeeping', 'Promote to accountant'], salary: '₹2-6 LPA', growth: 'Assistant → Accountant → Senior Accountant' }] }
      ],
      arts: [
        { name: 'BA (Bachelor of Arts)', duration: '3 Years', icon: <FaBook />, description: 'Arts degree in various humanities subjects', careers: ['Teacher', 'Writer', 'Content Creator', 'Journalist'], careerPaths: [{ path: 'BA → B.Ed → Teacher', steps: ['Complete BA in your subject', 'Pursue B.Ed (2 years)', 'Clear CTET/TET exam', 'Apply for teaching positions'], salary: '₹3-8 LPA', growth: 'Senior Teacher → Head of Department → Principal' }] },
        { name: 'LLB (Bachelor of Laws)', duration: '3 Years', icon: <FaBalanceScale />, description: 'Law degree for legal practice', careers: ['Lawyer', 'Legal Advisor', 'Judge', 'Legal Consultant'], careerPaths: [{ path: 'LLB → Practice → Senior Advocate', steps: ['Complete LLB', 'Enroll with Bar Council', 'Practice under senior lawyer', 'Build client base', 'Become senior advocate'], salary: '₹5-50 LPA', growth: 'Junior Lawyer → Senior Lawyer → Senior Advocate' }] },
        { name: 'BJMC (Journalism & Mass Communication)', duration: '3 Years', icon: <FaNewspaper />, description: 'Journalism and media studies', careers: ['Journalist', 'News Anchor', 'Content Writer', 'PR Manager'], careerPaths: [{ path: 'BJMC → Reporter → News Anchor', steps: ['Complete BJMC', 'Intern with news channel', 'Work as reporter', 'Develop on-screen presence', 'Become news anchor'], salary: '₹4-20 LPA', growth: 'Reporter → Senior Reporter → News Anchor' }] },
        { name: 'B.Ed (Bachelor of Education)', duration: '2 Years', icon: <FaChalkboardTeacher />, description: 'Teaching degree for educators', careers: ['Teacher', 'Principal', 'Education Counselor'], careerPaths: [{ path: 'B.Ed → TET → Government Teacher', steps: ['Complete B.Ed', 'Clear CTET/TET exam', 'Apply for government schools', 'Get selected', 'Grow to senior positions'], salary: '₹4-10 LPA', growth: 'Teacher → Senior Teacher → Headmaster' }] },
        { name: 'BFA (Bachelor of Fine Arts)', duration: '4 Years', icon: <FaPaintBrush />, description: 'Fine arts and visual arts degree', careers: ['Artist', 'Designer', 'Animator', 'Art Director'], careerPaths: [{ path: 'BFA → Freelance Artist', steps: ['Complete BFA', 'Build portfolio', 'Exhibit work in galleries', 'Sell artwork', 'Build reputation'], salary: '₹3-20 LPA', growth: 'Emerging Artist → Established Artist → Master Artist' }] },
        { name: 'Diploma in Journalism', duration: '1-2 Years', icon: <FaNewspaper />, description: 'Journalism and media', careers: ['Reporter', 'Content Writer', 'Media Assistant'], careerPaths: [{ path: 'Diploma → Reporter', steps: ['Complete Diploma in Journalism', 'Intern with local newspaper', 'Work as junior reporter', 'Cover local news', 'Become senior reporter'], salary: '₹2-8 LPA', growth: 'Junior Reporter → Reporter → Senior Reporter' }] }
      ],
      computer: [
        { name: 'BCA (Bachelor of Computer Applications)', duration: '3 Years', icon: <FaLaptopMedical />, description: 'Computer applications and programming', careers: ['Software Developer', 'Web Developer', 'System Administrator'], careerPaths: [{ path: 'BCA → MCA → Software Developer', steps: ['Complete BCA', 'Pursue MCA (3 years)', 'Learn programming languages', 'Build projects', 'Apply for software jobs'], salary: '₹4-15 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' }] },
        { name: 'B.Tech CSE (Computer Science)', duration: '4 Years', icon: <FaMicrochip />, description: 'Computer science engineering', careers: ['Software Engineer', 'Data Scientist', 'AI Engineer'], careerPaths: [{ path: 'B.Tech → Software Engineer', steps: ['Complete B.Tech CSE', 'Learn programming', 'Build projects', 'Apply for software jobs', 'Grow to senior roles'], salary: '₹6-25 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' }] },
        { name: 'B.Tech IT (Information Technology)', duration: '4 Years', icon: <FaNetworkWired />, description: 'Information technology engineering', careers: ['IT Manager', 'Network Engineer', 'System Analyst'], careerPaths: [{ path: 'B.Tech IT → IT Manager', steps: ['Complete B.Tech IT', 'Join IT company', 'Handle IT operations', 'Manage IT team', 'Become IT manager'], salary: '₹6-25 LPA', growth: 'IT Executive → IT Manager → CTO' }] },
        { name: 'B.Sc Computer Science', duration: '3 Years', icon: <FaCode />, description: 'Science degree in computer science', careers: ['Software Developer', 'Web Developer', 'IT Consultant'], careerPaths: [{ path: 'B.Sc CS → M.Sc CS → Software Developer', steps: ['Complete B.Sc CS', 'Pursue M.Sc CS', 'Learn programming', 'Build projects', 'Apply for software jobs'], salary: '₹4-15 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' }] },
        { name: 'B.Tech AI & ML', duration: '4 Years', icon: <FaRobot />, description: 'Artificial intelligence and machine learning', careers: ['AI Engineer', 'ML Engineer', 'Data Scientist'], careerPaths: [{ path: 'B.Tech AI → AI Engineer', steps: ['Complete B.Tech AI & ML', 'Learn AI/ML frameworks', 'Build AI projects', 'Apply for AI jobs', 'Grow to senior AI roles'], salary: '₹8-30 LPA', growth: 'AI Developer → AI Engineer → AI Architect' }] },
        { name: 'Diploma in Computer Engineering', duration: '3 Years', icon: <FaCog />, description: 'Computer hardware and software', careers: ['Technician', 'Hardware Engineer', 'Network Support'], careerPaths: [{ path: 'Diploma → Hardware Engineer', steps: ['Complete Diploma in Computer Engineering', 'Learn hardware troubleshooting', 'Join IT company', 'Handle hardware repairs', 'Promote to senior engineer'], salary: '₹3-8 LPA', growth: 'Technician → Engineer → Senior Engineer' }] },
        { name: 'Diploma in Computer Applications', duration: '1 Year', icon: <FaLaptopMedical />, description: 'Computer applications diploma', careers: ['Computer Operator', 'Data Entry', 'Office Assistant'], careerPaths: [{ path: 'Diploma → Computer Operator', steps: ['Complete Diploma in Computer Applications', 'Learn office software', 'Join company as computer operator', 'Handle data entry', 'Promote to office assistant'], salary: '₹2-5 LPA', growth: 'Operator → Assistant → Office Manager' }] }
      ]
    }
    return coursesData[stream] || []
  }

  const handleStreamChange = (e) => {
    setSelectedStream(e.target.value)
    setShowResults(false)
    setPercentage('')
    setPrepType('govtCollege')
  }

  const handlePercentageChange = (e) => {
    const value = e.target.value
    if (value === '' || (Number(value) >= 1 && Number(value) <= 100)) {
      setPercentage(value)
    }
  }

  const handleGetGuidance = () => {
    if (!selectedStream) {
      alert('Please select a stream first.')
      return
    }
    if (!percentage || Number(percentage) <= 0) {
      alert('Please enter a valid percentage.')
      return
    }
    if (Number(percentage) > 100) {
      alert('Percentage cannot exceed 100%.')
      return
    }
    if (Number(percentage) < 33) {
      alert('You are not eligible for career guidance. You need at least 33% to get recommendations.')
      return
    }
    setShowResults(true)
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const handleCourseClick = (course) => {
    setSelectedCourse(course)
    setSelectedCareerPath(null)
    setShowModal(true)
  }

  const handleCareerPathClick = (path, courseName) => {
    setSelectedCareerPath(path)
    navigate('/OccupationDetails', { 
      state: { 
        occupation: path.path.split('→').pop().trim(),
        stream: selectedStream,
        percentage: percentage,
        course: courseName,
        prepType: prepType
      } 
    })
  }

  const getPerformanceLevel = () => {
    const perc = Number(percentage)
    if (perc >= 75) return { levelKey: language === 'hi' ? 'उत्कृष्ट' : 'Excellent', color: 'success', icon: <FaCheckCircle /> }
    if (perc >= 60) return { levelKey: language === 'hi' ? 'अच्छा' : 'Good', color: 'warning', icon: <FaInfoCircle /> }
    return { levelKey: language === 'hi' ? 'औसत' : 'Average', color: 'danger', icon: <FaInfoCircle /> }
   }

   const courses = showResults ? getCoursesByStreamAndPercentage(selectedStream, percentage) : []
  const performance = showResults ? getPerformanceLevel() : null
  const allCourses = showResults ? getAllCoursesForStream(selectedStream) : []

  // Safe access to current exam and college data
  const currentExamData = selectedGovtExam ? govtExamData[selectedGovtExam] : null
  const currentCollegeData = selectedGovtCollege ? govtCollegeData[selectedGovtCollege] : null

  return (
    <div className="dashboard-container">
      <UserLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash" style={{ padding: isMobile ? '0px' : '4px 0 0 0', minHeight: 'calc(100vh - 70px)' }}>
        <UserHeader toggleSidebar={toggleSidebar} />
        <Container fluid className='fixed-notifications mt-3'>
          {/* Back Button */}
          <div className="mb-4">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/UserDashboard')} 
              className="d-flex align-items-center"
            >
              <FaArrowLeft className="me-2" />
              {language === 'hi' ? "डैशबोर्ड पर वापस जाएं" : "Back to Dashboard"}
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: '60px', height: '60px' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading...</p>
            </div>
          ) : (
            <>
              {/* Header Card */}
              <Card className="shadow-sm mb-4 border-0 notifications-header-card" style={{ borderRadius: '10px', padding: '12px' }}>
                <Card.Body className="">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                    <div>
                      <h3 className="mb-2">
                        <FaGraduationCap className="me-2 text-primary" />
                    {language === 'hi' ? "12वीं कक्षा करियर मार्गदर्शन" : "12th Class Career Guidance"}
                      </h3>
                      <p className="text-muted mb-0">
                    {language === 'hi' ? "12वीं के बाद अपना रास्ता चुनें" : "Choose Your Path After 12th"}
                      </p>
                    </div>
                  </div>
                </Card.Body>
              <CounselingForm
                onSubmit={handleCounselingSubmit}
                showForm={showCounseling}
                onToggle={setShowCounseling}
                studentId={uniqueId}
              />
            </Card>

              {/* Step 1: Select Stream */}
              <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                <Card.Body className="">
                  <h5 className="mb-3">
                  <Badge bg="primary" className="me-2">{language === 'hi' ? "चरण 1" : "Step 1"}</Badge>
                  {language === 'hi' ? "अपनी स्ट्रीम चुनें" : "Select Your Stream"}
                  </h5>
                  <Row>
                    {streams.map((stream) => (
                      <Col lg={3} md={6} className="mb-3" key={stream.id}>
                        <Card 
                          className={`h-100 border stream-selection-card ${selectedStream === stream.id ? 'selected' : ''}`}
                          style={{ 
                            cursor: 'pointer',
                            borderColor: selectedStream === stream.id ? '#667eea' : '#dee2e6',
                            backgroundColor: selectedStream === stream.id ? '#f0f4ff' : 'white'
                          }}
                          onClick={() => handleStreamChange({ target: { value: stream.id } })}
                        >
                          <Card.Body className="p-3 text-center">
                            <div className="stream-icon-large mb-2">
                              {stream.icon}
                            </div>
                            <h6 className="mb-1">
                              {stream.id === 'science' ? (language === 'hi' ? 'विज्ञान' : 'Science') :
                               stream.id === 'commerce' ? (language === 'hi' ? 'वाणिज्य' : 'Commerce') :
                               stream.id === 'arts' ? (language === 'hi' ? 'कला' : 'Arts') :
                               stream.id === 'computer' ? (language === 'hi' ? 'कंप्यूटर विज्ञान' : 'Computer Science') : 'Unknown'}
                            </h6>
                            <small className="text-muted">
                              {stream.id === 'science' ? (language === 'hi' ? 'भौतिकी, रसायन विज्ञान, गणित' : 'Physics, Chemistry, Mathematics') :
                               stream.id === 'commerce' ? (language === 'hi' ? 'अकाउंटेंसी, बिजनेस स्टडीज, अर्थशास्त्र' : 'Accountancy, Business Studies, Economics') :
                               stream.id === 'arts' ? (language === 'hi' ? 'इतिहास, भूगोल, राजनीति विज्ञान' : 'History, Geography, Political Science') :
                               stream.id === 'computer' ? (language === 'hi' ? 'कंप्यूटर विज्ञान, गणित, भौतिकी' : 'Computer Science, Mathematics, Physics') : ''}
                            </small>
                            {selectedStream === stream.id && (
                              <Badge bg="primary" className="mt-2">
                                <FaCheckCircle className="me-1" /> {language === 'hi' ? "चयनित" : "Selected"}
                              </Badge>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>

              {/* Step 2: Enter Percentage */}
              {selectedStream && (
                <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                  <Card.Body className="p-4">
                    <h5 className="mb-3">
                      <Badge bg="primary" className="me-2">{language === 'hi' ? "चरण 2" : "Step 2"}</Badge>
                      {language === 'hi' ? "अपनी 12वीं की प्रतिशत दर्ज करें" : "Enter Your 12th Percentage"}
                    </h5>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <div className="percentage-input-wrapper">
                          <Form.Control
                            type="number"
                            placeholder={language === 'hi' ? "प्रतिशत दर्ज करें" : "Enter percentage"}
                            value={percentage}
                            onChange={handlePercentageChange}
                            min="0"
                            max="100"
                            className="percentage-input-large"
                          />
                          <FaPercentage className="percentage-icon-large" />
                        </div>
                      </Col>
                      <Col md={6} className='mobile-btn-sty'>
                        <Button 
                          variant="primary" 
                          size="lg"
                          onClick={handleGetGuidance}
                          disabled={!percentage}
                          className="w-100 mobile-btn-get"
                        >
                          <FaLightbulb className="me-2" />
                          {language === 'hi' ? "कोर्स मार्गदर्शन प्राप्त करें" : "Get Course Guidance"}
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              {/* Step 3: Results */}
              {showResults && courses.length > 0 && (
                <div ref={resultsRef}>
                  {/* Performance Summary */}
                  <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1">{language === 'hi' ? "आपका प्रदर्शन" : "Your Performance"}</h5>
                          <p className="text-muted mb-0">
                            {language === 'hi' ? `आपकी ${percentage}% के आधार पर ${getStreamName(selectedStream)} में` : `Based on your ${percentage}% in ${getStreamName(selectedStream)}`}
                          </p>
                        </div>
                        <div className="text-end govt-job-performance">
                          <Badge bg={performance.color} className="fs-5 p-3">
                            {performance.icon} <span>{performance.levelKey}</span>
                          </Badge>
                        </div>
                      </div>
                      <ProgressBar 
                        now={Number(percentage)} 
                        className="mt-3"
                        variant={performance.color}
                        style={{ height: '15px' }}
                        label={`${percentage}%`}
                      />
                    </Card.Body>
                  </Card>

                  {/* Private/Govt College/Govt Job Selection */}
                  <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                    <Card.Body className="p-4">
                      <h5 className="mb-3">{language === 'hi' ? "अपना रास्ता चुनें" : "Choose Your Path"}</h5>
                      <p className="text-muted mb-3">{language === 'hi' ? "अपनी पसंदीदा राह चुनें" : "Select your preferred path"}</p>
                      <Row className="g-3">
                        <Col lg={4} md={4} sm={12}>
                          <Card 
                            className={`h-100 border ${prepType === 'govtCollege' ? 'border-primary' : ''}`}
                            style={{ cursor: 'pointer', borderRadius: '10px', backgroundColor: prepType === 'govtCollege' ? '#4a90d9' : 'white', transition: 'all 0.3s ease' }}
                            onClick={() => { setPrepType('govtCollege'); setTimeout(() => { if (tabsRef.current) tabsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 100) }}
                          >
                            <Card.Body className="p-4 text-center">
                              <FaUniversity className={`fs-2 mb-2 ${prepType === 'govtCollege' ? 'text-white' : 'text-muted'}`} />
                              <h6 className={prepType === 'govtCollege' ? 'text-white fw-bold' : 'text-muted'}>{language === 'hi' ? "सरकारी कॉलेज" : "Government College"}</h6>
                              <small className={prepType === 'govtCollege' ? 'text-white' : 'text-muted'}>{language === 'hi' ? "इंजीनियरिंग, मेडिकल और रिसर्च पथ" : "Engineering, medical & research pathways"}</small>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col lg={4} md={4} sm={12}>
                          <Card 
                            className={`h-100 border ${prepType === 'govtJob' ? 'border-primary' : ''}`}
                            style={{ cursor: 'pointer', borderRadius: '10px', backgroundColor: prepType === 'govtJob' ? '#e7f1ff' : 'white' }}
                            onClick={() => { setPrepType('govtJob'); setTimeout(() => { if (tabsRef.current) tabsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 100) }}
                          >
                            <Card.Body className="p-4 text-center">
                              <FaShieldAlt className={`fs-2 mb-2 ${prepType === 'govtJob' ? 'text-primary' : 'text-muted'}`} />
                              <h6 className={prepType === 'govtJob' ? 'text-primary fw-bold' : 'text-muted'}>{language === 'hi' ? "सरकारी नौकरी" : "Government Job"}</h6>
                              <small className="text-muted">{language === 'hi' ? "प्रतियोगी परीक्षाओं की तैयारी करें" : "Prepare for competitive exams"}</small>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col lg={4} md={4} sm={12}>
                          <Card 
                            className={`h-100 border ${prepType === 'private' ? 'border-primary' : ''}`}
                            style={{ cursor: 'pointer', borderRadius: '10px', backgroundColor: prepType === 'private' ? '#e7f1ff' : 'white' }}
                            onClick={() => { setPrepType('private'); setTimeout(() => { if (tabsRef.current) tabsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 100) }}
                          >
                            <Card.Body className="p-4 text-center">
                              <FaBriefcase className={`fs-2 mb-2 ${prepType === 'private' ? 'text-primary' : 'text-muted'}`} />
                              <h6 className={prepType === 'private' ? 'text-primary fw-bold' : 'text-muted'}>{language === 'hi' ? "प्राइवेट कॉलेज" : "Private College"}</h6>
                              <small className="text-muted">{language === 'hi' ? "प्राइवेट कॉलेजों में सीधा प्रवेश" : "Direct admission in private colleges"}</small>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* Courses Tabs */}
                  <Card ref={tabsRef} className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                    <Card.Header className="bg-white border-0 pt-4 pb-0">
                      <h5 className="mb-0">
                        {prepType === 'govtJob' ? (
                          <><FaShieldAlt className="me-2 text-primary" />{language === 'hi' ? "सरकारी नौकरी रोडमैप" : "Government Job Roadmap"}</>
                        ) : prepType === 'govtCollege' ? (
                          <><FaUniversity className="me-2 text-primary" />{language === 'hi' ? "सरकारी कॉलेज रोडमैप" : "Government College Roadmap"}</>
                        ) : (
                          <><FaBriefcase className="me-2 text-primary" />{language === 'hi' ? "कोर्स अनुशंसाएँ" : "Course Recommendations"}</>
                        )}
                      </h5>
                      <p className="text-muted mb-0">
                        {language === 'hi' ? (prepType === 'govtJob' ? 'परीक्षा पथ चुनें' : prepType === 'govtCollege' ? 'कॉलेज पथ चुनें' : 'अपने प्रदर्शन के आधार पर कोर्स ब्राउज़ करें') : (prepType === 'govtJob' ? 'Select Exam Path' : prepType === 'govtCollege' ? 'Select College Path' : 'Browse courses based on your performance')}
                      </p>
                    </Card.Header>
                    <Card.Body className="p-4">
                      {prepType === 'govtJob' ? (
                        <div className="mb-4">
                          <Row className="mb-4">
                            {filteredExamTypes.map((examType, index) => {
                              const examInfo = govtExamData[examType]
                              if (!examInfo) return null
                              return (
                                <Col lg={4} md={6} sm={12} key={index} className="mb-4">
                                  <Card 
                                    className={`h-100 border ${selectedGovtExam === examType ? 'border-primary' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => { setSelectedGovtExam(examType); setTimeout(() => { if (examRoadmapRef.current) examRoadmapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 100) }}
                                  >
                                    <Card.Body className="">
                                      <div className="d-flex align-items-center gap-2 mb-2">
                                        <div className="course-icon-large">{examInfo.icon}</div>
                                        <h6 className="mb-0">{examInfo.title}</h6>
                                      </div>
                                      <p className="small text-muted mb-2">{examInfo.fullPath?.substring(0, 50)}...</p>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              )
                            })}
                          </Row>
                          
                          {currentExamData && (
                            <Card ref={examRoadmapRef} className="border bg-light">
                              <Card.Body className="">
                                <div className="mb-4">
                                  <h5 className="mb-3">{currentExamData.icon}<span className="ms-2">{currentExamData.title}</span></h5>
                                  <p className="text-muted mb-3"><strong>Complete Path:</strong> {currentExamData.fullPath}</p>
                                </div>
                                <h6 className="mb-3">Step-by-Step Roadmap</h6>
                                <Row className="mb-4">
                                  {currentExamData.steps?.map((step, idx) => (
                                    <Col md={6} key={idx} className="mb-3">
                                      <Card className="h-100 border">
                                        <Card.Body className="p-3">
                                          <div className="d-flex align-items-start gap-2">
                                            <Badge bg="primary" className="fs-6">{step.step}</Badge>
                                            <div>
                                              <h6 className="mb-1">{step.title}</h6>
                                              <p className="small text-muted mb-1">{step.description}</p>
                                              <Badge bg="secondary">{step.duration}</Badge>
                                            </div>
                                          </div>
                                        </Card.Body>
                                      </Card>
                                    </Col>
                                  ))}
                                </Row>
                              </Card.Body>
                            </Card>
                          )}
                        </div>
                      ) : prepType === 'govtCollege' ? (
                        <div className="mb-4">
                          <Tab.Container id="govt-college-tabs" defaultActiveKey="colleges">
                            <Nav variant="tabs" className="mb-4">
                              <Nav.Item><Nav.Link eventKey="colleges"><FaUniversity className="me-2" style={{ color: '#fff' }} />{language === 'hi' ? "शीर्ष कॉलेज" : "Top Colleges"}</Nav.Link></Nav.Item>
                              <Nav.Item><Nav.Link eventKey="universities"><FaBuilding className="me-2" style={{ color: '#fff' }} />{language === 'hi' ? "शीर्ष विश्वविद्यालय" : "Top Universities"}</Nav.Link></Nav.Item>
                              <Nav.Item><Nav.Link eventKey="recommended"><FaLightbulb className="me-2" />{language === 'hi' ? "अनुशंसित कोर्स" : "Recommended Courses"}</Nav.Link></Nav.Item>
                              <Nav.Item><Nav.Link eventKey="all"><FaBookOpen className="me-2" />{language === 'hi' ? "सभी उपलब्ध कोर्स" : "All Courses Available"}</Nav.Link></Nav.Item>
                            </Nav>
                            <Tab.Content>
                              <Tab.Pane eventKey="colleges">
                                {filteredCollegeTypes.length === 0 ? (
                                  <Alert variant="info">No college options available</Alert>
                                ) : (
                                  <>
                                    <Row className="mb-4">
                                      {filteredCollegeTypes.map((collegeType, index) => {
                                        const collegeInfo = govtCollegeData[collegeType]
                                        if (!collegeInfo) return null
                                        return (
                                          <Col lg={4} md={6} sm={12} key={index} className="mb-4">
                                            <Card 
                                              className={`h-100 border ${selectedGovtCollege === collegeType ? 'border-primary' : ''}`}
                                              style={{ cursor: 'pointer' }}
                                              onClick={() => { setSelectedGovtCollege(collegeType); setTimeout(() => { if (collegeRoadmapRef.current) collegeRoadmapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 100) }}
                                            >
                                              <Card.Body className="p-3">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                  <div className="course-icon-large">{collegeInfo.icon}</div>
                                                  <h6 className="mb-0">{collegeInfo.title}</h6>
                                                </div>
                                                <p className="small text-muted mb-2">{collegeInfo.fullPath?.substring(0, 50)}...</p>
                                              </Card.Body>
                                            </Card>
                                          </Col>
                                        )
                                      })}
                                    </Row>
                                    
                                    {currentCollegeData && (
                                      <Card ref={collegeRoadmapRef} className="border bg-light">
                                        <Card.Body className="p-4">
                                          <div className="mb-4">
                                            <h5 className="mb-3">{currentCollegeData.icon}<span className="ms-2">{currentCollegeData.title}</span></h5>
                                            <p className="text-muted mb-2"><strong>Complete Path:</strong> {currentCollegeData.fullPath}</p>
                                            <p className="text-muted mb-0"><strong>Eligibility:</strong> {currentCollegeData.eligibility}</p>
                                          </div>
                                          <h6 className="mb-3">Step-by-Step Roadmap</h6>
                                          <Row className="mb-4">
                                            {currentCollegeData.steps?.map((step, idx) => (
                                              <Col md={6} key={idx} className="mb-3">
                                                <Card className="h-100 border">
                                                  <Card.Body className="p-3">
                                                    <div className="d-flex align-items-start gap-2">
                                                      <Badge bg="primary" className="fs-6">{step.step}</Badge>
                                                      <div>
                                                        <h6 className="mb-1">{step.title}</h6>
                                                        <p className="small text-muted mb-1">{step.description}</p>
                                                        <Badge bg="secondary">{step.duration}</Badge>
                                                      </div>
                                                    </div>
                                                  </Card.Body>
                                                </Card>
                                              </Col>
                                            ))}
                                          </Row>
                                        </Card.Body>
                                      </Card>
                                    )}
                                  </>
                                )}
                              </Tab.Pane>
                              <Tab.Pane eventKey="universities">
                                <Row>
                                  {selectedStream === 'science' && (
                                    <>
                                      <Col lg={4} md={6} sm={12} className="mb-4"><Card className="h-100 border" style={{ cursor: 'pointer' }}><Card.Body className="p-3"><div className="d-flex align-items-center gap-2 mb-2"><div className="course-icon-large"><FaGraduationCap style={{ color: '#fff' }} /></div><h6 className="mb-0">IIT Bombay</h6></div><p className="small text-muted mb-2">Mumbai, Maharashtra</p></Card.Body></Card></Col>
                                      <Col lg={4} md={6} sm={12} className="mb-4"><Card className="h-100 border" style={{ cursor: 'pointer' }}><Card.Body className="p-3"><div className="d-flex align-items-center gap-2 mb-2"><div className="course-icon-large"><FaGraduationCap style={{ color: '#fff' }} /></div><h6 className="mb-0">IIT Delhi</h6></div><p className="small text-muted mb-2">New Delhi</p></Card.Body></Card></Col>
                                      <Col lg={4} md={6} sm={12} className="mb-4"><Card className="h-100 border" style={{ cursor: 'pointer' }}><Card.Body className="p-3"><div className="d-flex align-items-center gap-2 mb-2"><div className="course-icon-large"><FaGraduationCap style={{ color: '#fff' }} /></div><h6 className="mb-0">AIIMS Delhi</h6></div><p className="small text-muted mb-2">New Delhi</p></Card.Body></Card></Col>
                                    </>
                                  )}
                                  {selectedStream === 'commerce' && (
                                    <>
                                      <Col lg={4} md={6} sm={12} className="mb-4"><Card className="h-100 border" style={{ cursor: 'pointer' }}><Card.Body className="p-3"><div className="d-flex align-items-center gap-2 mb-2"><div className="course-icon-large"><FaGraduationCap style={{ color: '#fff' }} /></div><h6 className="mb-0">Delhi University</h6></div><p className="small text-muted mb-2">New Delhi</p></Card.Body></Card></Col>
                                      <Col lg={4} md={6} sm={12} className="mb-4"><Card className="h-100 border" style={{ cursor: 'pointer' }}><Card.Body className="p-3"><div className="d-flex align-items-center gap-2 mb-2"><div className="course-icon-large"><FaBriefcase /></div><h6 className="mb-0">SRCC</h6></div><p className="small text-muted mb-2">Delhi</p></Card.Body></Card></Col>
                                    </>
                                  )}
                                  {selectedStream === 'arts' && (
                                    <>
                                      <Col lg={4} md={6} sm={12} className="mb-4"><Card className="h-100 border" style={{ cursor: 'pointer' }}><Card.Body className="p-3"><div className="d-flex align-items-center gap-2 mb-2"><div className="course-icon-large"><FaGraduationCap style={{ color: '#fff' }} /></div><h6 className="mb-0">Delhi University</h6></div><p className="small text-muted mb-2">New Delhi</p></Card.Body></Card></Col>
                                      <Col lg={4} md={6} sm={12} className="mb-4"><Card className="h-100 border" style={{ cursor: 'pointer' }}><Card.Body className="p-3"><div className="d-flex align-items-center gap-2 mb-2"><div className="course-icon-large"><FaGraduationCap style={{ color: '#fff' }} /></div><h6 className="mb-0">JNU</h6></div><p className="small text-muted mb-2">Delhi</p></Card.Body></Card></Col>
                                    </>
                                  )}
                                  {selectedStream === 'computer' && (
                                    <>
                                      <Col lg={4} md={6} sm={12} className="mb-4"><Card className="h-100 border" style={{ cursor: 'pointer' }}><Card.Body className="p-3"><div className="d-flex align-items-center gap-2 mb-2"><div className="course-icon-large"><FaCode className="text-primary" /></div><h6 className="mb-0">IIT Bombay</h6></div><p className="small text-muted mb-2">Mumbai</p></Card.Body></Card></Col>
                                      <Col lg={4} md={6} sm={12} className="mb-4"><Card className="h-100 border" style={{ cursor: 'pointer' }}><Card.Body className="p-3"><div className="d-flex align-items-center gap-2 mb-2"><div className="course-icon-large"><FaMicrochip className="text-warning" /></div><h6 className="mb-0">IIIT Hyderabad</h6></div><p className="small text-muted mb-2">Telangana</p></Card.Body></Card></Col>
                                    </>
                                  )}
                                </Row>
                              </Tab.Pane>
                              <Tab.Pane eventKey="recommended">
                                {courses.length > 0 ? (
                                  <Row>
                                    {courses.map((course, index) => (
                                      <Col lg={4} md={6} className="mb-4" key={index}>
                                        <Card className="h-100 border course-card" style={{ cursor: 'pointer' }} onClick={() => handleCourseClick(course)}>
                                          <Card.Body className="p-4">
                                            <div className="d-flex align-items-start gap-3 mb-3">
                                              <div className="course-icon-large">{course.icon}</div>
                                              <div><h6 className="mb-1">{getCourseName(course.name)}</h6><Badge bg="info">{course.duration}</Badge></div>
                                            </div>
                                            <p className="text-muted small mb-3">{getCourseDescription(course.name, course.description)}</p>
                                            <div className="mt-auto">
                                              <small className="text-muted d-block mb-2">{language === 'hi' ? "करियर के अवसर" : "Career Opportunities"}</small>
                                              <div className="d-flex flex-wrap gap-1">
                                                {course.careers?.slice(0, 3).map((career, idx) => (
                                                  <Badge bg="light" text="dark" key={idx} className="small">{career}</Badge>
                                                ))}
                                              </div>
                                            </div>
                                          </Card.Body>
                                        </Card>
                                      </Col>
                                    ))}
                                  </Row>
                                ) : (
                                  <Alert variant="info"><FaInfoCircle className="me-2" />{language === 'hi' ? "कोई अनुशंसित कोर्स नहीं" : "No Recommended Courses"}</Alert>
                                )}
                              </Tab.Pane>
                              <Tab.Pane eventKey="all">
                                {allCourses.length > 0 ? (
                                  <Row>
                                    {allCourses.map((course, index) => (
                                      <Col lg={4} md={6} className="mb-4" key={index}>
                                        <Card className="h-100 border course-card" style={{ cursor: 'pointer' }} onClick={() => handleCourseClick(course)}>
                                          <Card.Body className="p-4">
                                            <div className="d-flex align-items-start gap-3 mb-3">
                                              <div className="course-icon-large">{course.icon}</div>
                                              <div><h6 className="mb-1">{getCourseName(course.name)}</h6><Badge bg="info">{course.duration}</Badge></div>
                                            </div>
                                            <p className="text-muted small mb-3">{getCourseDescription(course.name, course.description)}</p>
                                            <div className="mt-auto">
                                              <small className="text-muted d-block mb-2">{language === 'hi' ? "करियर के अवसर" : "Career Opportunities"}</small>
                                              <div className="d-flex flex-wrap gap-1">
                                                {course.careers?.slice(0, 3).map((career, idx) => (
                                                  <Badge bg="light" text="dark" key={idx} className="small">{career}</Badge>
                                                ))}
                                              </div>
                                            </div>
                                          </Card.Body>
                                        </Card>
                                      </Col>
                                    ))}
                                  </Row>
                                ) : (
                                  <Alert variant="info"><FaInfoCircle className="me-2" />{language === 'hi' ? "कोई कोर्स उपलब्ध नहीं" : "No Courses Available"}</Alert>
                                )}
                              </Tab.Pane>
                            </Tab.Content>
                          </Tab.Container>
                        </div>
                      ) : (
                        <Tab.Container id="courses-tabs" defaultActiveKey="recommended">
                          <Nav variant="tabs" className="mb-4">
                            <Nav.Item><Nav.Link eventKey="recommended"><FaUniversity className="me-2" />{language === 'hi' ? "अनुशंसित कोर्स" : "Recommended Courses"}</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="all"><FaBookOpen className="me-2" />{language === 'hi' ? "सभी उपलब्ध कोर्स" : "All Courses Available"}</Nav.Link></Nav.Item>
                          </Nav>
                          <Tab.Content>
                            <Tab.Pane eventKey="recommended">
                              {courses.length > 0 ? (
                                <Row>
                                  {courses.map((course, index) => (
                                    <Col lg={4} md={6} className="mb-4" key={index}>
                                      <Card className="h-100 border course-card" style={{ cursor: 'pointer' }} onClick={() => handleCourseClick(course)}>
                                        <Card.Body className="p-4">
                                          <div className="d-flex align-items-start gap-3 mb-3">
                                            <div className="course-icon-large">{course.icon}</div>
                                            <div><h6 className="mb-1">{getCourseName(course.name)}</h6><Badge bg="info">{course.duration}</Badge></div>
                                          </div>
                                          <p className="text-muted small mb-3">{getCourseDescription(course.name, course.description)}</p>
                                          <div className="mt-auto">
                                            <small className="text-muted d-block mb-2">{language === 'hi' ? "करियर के अवसर" : "Career Opportunities"}</small>
                                            <div className="d-flex flex-wrap gap-1">
                                              {course.careers?.slice(0, 3).map((career, idx) => (
                                                <Badge bg="light" text="dark" key={idx} className="small">{career}</Badge>
                                              ))}
                                            </div>
                                          </div>
                                        </Card.Body>
                                      </Card>
                                    </Col>
                                  ))}
                                </Row>
                              ) : (
                                <Alert variant="info"><FaInfoCircle className="me-2" />{language === 'hi' ? "कोई अनुशंसित कोर्स नहीं" : "No Recommended Courses"}</Alert>
                              )}
                            </Tab.Pane>
                            <Tab.Pane eventKey="all">
                              {allCourses.length > 0 ? (
                                <Row>
                                  {allCourses.map((course, index) => (
                                    <Col lg={4} md={6} className="mb-4" key={index}>
                                      <Card className="h-100 border course-card" style={{ cursor: 'pointer' }} onClick={() => handleCourseClick(course)}>
                                        <Card.Body className="p-4">
                                          <div className="d-flex align-items-start gap-3 mb-3">
                                            <div className="course-icon-large">{course.icon}</div>
                                            <div><h6 className="mb-1">{getCourseName(course.name)}</h6><Badge bg="info">{course.duration}</Badge></div>
                                          </div>
                                          <p className="text-muted small mb-3">{getCourseDescription(course.name, course.description)}</p>
                                          <div className="mt-auto">
                                            <small className="text-muted d-block mb-2">{language === 'hi' ? "करियर के अवसर" : "Career Opportunities"}</small>
                                            <div className="d-flex flex-wrap gap-1">
                                              {course.careers?.slice(0, 3).map((career, idx) => (
                                                <Badge bg="light" text="dark" key={idx} className="small">{career}</Badge>
                                              ))}
                                            </div>
                                          </div>
                                        </Card.Body>
                                      </Card>
                                    </Col>
                                  ))}
                                </Row>
                              ) : (
                                <Alert variant="info"><FaInfoCircle className="me-2" />{language === 'hi' ? "कोई कोर्स उपलब्ध नहीं" : "No Courses Available"}</Alert>
                              )}
                            </Tab.Pane>
                          </Tab.Content>
                        </Tab.Container>
                      )}
                    </Card.Body>
                  </Card>

                  {/* Additional Guidance */}
                  <Card className="shadow-sm border-0 guidance-card" style={{ borderRadius: '10px' }}>
                    <Card.Body className="p-4">
                      <h5 className="mb-3"><FaLightbulb className="me-2 text-warning" />{language === 'hi' ? "अतिरिक्त मार्गदर्शन" : "Additional Guidance"}</h5>
                      <Row>
                        <Col md={6}>
                          <h6>
                            {selectedStream === 'science' && (language === 'hi' ? "विज्ञान स्ट्रीम: इंजीनियरिंग, मेडिकल और रिसर्च पथ" : "Science Stream: Engineering, Medical & Research Pathways")}
                            {selectedStream === 'commerce' && (language === 'hi' ? "वाणिज्य स्ट्रीम: बिजनेस, फाइनेंस और प्रोफेशनल करियर" : "Commerce Stream: Business, Finance & Professional Careers")}
                            {selectedStream === 'arts' && (language === 'hi' ? "कला स्ट्रीम: मानविकी, रचनात्मकता और सिविल सेवा" : "Arts Stream: Humanities, Creativity & Civil Services")}
                            {selectedStream === 'computer' && (language === 'hi' ? "कंप्यूटर विज्ञान: प्रौद्योगिकी, कोडिंग और नवाचार" : "Computer Science: Technology, Coding & Innovation")}
                          </h6>
                          <ul className="text-muted">
                            <li>{language === 'hi' ? "अपनी चुनी हुई स्ट्रीम के विषयों पर ध्यान दें" : "Focus on your chosen stream subjects"}</li>
                            <li>{language === 'hi' ? "प्रवेश परीक्षाओं की तैयारी जल्दी शुरू करें" : "Start preparing for entrance exams early"}</li>
                            <li>{language === 'hi' ? "अपने क्षेत्र में करियर विकल्पों पर शोध करें" : "Research career options in your field"}</li>
                            <li>{language === 'hi' ? "परामर्शदाताओं से मार्गदर्शन लें" : "Seek guidance from counselors"}</li>
                          </ul>
                        </Col>
                        <Col md={6}>
                          <h6>{language === 'hi' ? "करियर टिप्स:" : "Career Tips:"}</h6>
                          <ul className="text-muted">
                            <li>{language === 'hi' ? "नवीनतम करियर रुझानों के साथ अपडेट रहें" : "Stay updated with latest career trends"}</li>
                            <li>{language === 'hi' ? "शिक्षा के साथ-साथ सॉफ्ट स्किल्स विकसित करें" : "Develop soft skills alongside academics"}</li>
                            <li>{language === 'hi' ? "व्यावहारिक अनुभव के लिए इंटर्नशिप पर विचार करें" : "Consider internships for practical experience"}</li>
                            <li>{language === 'hi' ? "एक मजबूत पेशेवर नेटवर्क बनाएं" : "Build a strong professional network"}</li>
                          </ul>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </div>
              )}

              {/* Instructions */}
              {!selectedStream && (
                <Card className="shadow-sm border-0 instructions-card" style={{ borderRadius: '10px' }}>
                  <Card.Body className="p-4">
                    <h4>{language === 'hi' ? "मार्गदर्शन कैसे प्राप्त करें" : "How to Get Guidance"}</h4>
                    <p className="text-muted mb-0">
                      <strong>{language === 'hi' ? "चरण 1:" : "Step 1:"}</strong> {language === 'hi' ? "अपनी स्ट्रीम चुनें और अपना प्रतिशत दर्ज करें" : "Select your stream and enter your percentage"}<br />
                      <strong>{language === 'hi' ? "चरण 2:" : "Step 2:"}</strong> {language === 'hi' ? "अपना पसंदीदा पथ चुनें (कॉलेज/नौकरी)" : "Choose your preferred path (College/Job)"}<br />
                      <strong>{language === 'hi' ? "चरण 3:" : "Step 3:"}</strong> {language === 'hi' ? "व्यक्तिगत कोर्स और करियर अनुशंसाएँ प्राप्त करें" : "Get personalized course and career recommendations"}
                    </p>
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Container>
      </div>

      {/* Course Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            {selectedCourse?.icon}
            <span className="ms-2">{getCourseName(selectedCourse?.name)}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCourse && (
            <div>
              <div className="mb-4">
                <h6 className="text-muted mb-2">{language === 'hi' ? "कोर्स की अवधि" : "Course Duration"}</h6>
                <Badge bg="info" className="fs-6">{selectedCourse.duration}</Badge>
              </div>
              
              <div className="mb-4">
                <h6 className="text-muted mb-2">{language === 'hi' ? "विवरण" : "Description"}</h6>
                <p>{getCourseDescription(selectedCourse.name, selectedCourse.description)}</p>
              </div>
              
              {selectedCourse.careerPaths && selectedCourse.careerPaths.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-muted mb-3"><FaLightbulb className="me-2 text-warning" />{language === 'hi' ? "कदम-दर-कदम करियर मार्गदर्शन" : "Step-by-Step Career Guidance"}</h6>
                  <Row>
                    {selectedCourse.careerPaths.map((path, index) => (
                      <Col md={6} key={index} className="mb-3">
                        <Card 
                          className={`h-100 border career-path-card ${selectedCareerPath === path ? 'selected' : ''}`}
                          style={{ cursor: 'pointer', borderRadius: '8px', overflow: 'hidden' }}
                          onClick={() => handleCareerPathClick(path, selectedCourse?.name)}
                        >
                          <Card.Body className="p-3">
                            <h6 className="mb-2 text-primary">{path.path}</h6>
                            <div className="d-flex justify-content-start mb-2">
                              <Badge bg="secondary">{path.growth}</Badge>
                            </div>
                            {selectedCareerPath === path && (
                              <div className="mt-3">
                                <h6 className="text-muted mb-2">{language === 'hi' ? "सफलता के चरण" : "Steps to Achieve"}</h6>
                                <ol className="ps-3 mb-0">
                                  {path.steps?.map((step, idx) => (
                                    <li key={idx} className="mb-1 small">{step}</li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
              
              <div className="mb-4">
                <h6 className="text-muted mb-2">{language === 'hi' ? "करियर के अवसर" : "Career Opportunities"}</h6>
                <Row>
                  {selectedCourse.careers?.map((career, index) => (
                    <Col md={6} key={index} className="mb-2">
                      <Badge bg="primary" className="w-100 py-2"><FaCheckCircle className="me-2" />{career}</Badge>
                    </Col>
                  ))}
                </Row>
              </div>
              
              <Alert variant="info"><FaInfoCircle className="me-2" />{language === 'hi' ? "विस्तृत मार्गदर्शन प्राप्त करने के लिए किसी भी करियर पथ पर क्लिक करें" : "Click on any career path to get detailed guidance"}</Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowModal(false)}>{language === 'hi' ? "बंद करें" : "Close"}</Button>
          <Button variant="primary" onClick={() => { setShowModal(false); navigate('/UserDashboard') }}>{language === 'hi' ? "डैशबोर्ड पर वापस जाएं" : "Back to Dashboard"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default TwelfthGuidance