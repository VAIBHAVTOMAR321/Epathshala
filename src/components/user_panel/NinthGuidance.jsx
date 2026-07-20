import React, { useState, useEffect, useRef } from 'react'
import { Container, Card, Button, Row, Col, Badge, Form, Modal, Alert, Tab, Nav } from 'react-bootstrap'
import { FaGraduationCap, FaLightbulb, FaArrowLeft, FaFlask, FaCalculator, FaBook, FaBrain, FaWrench, FaSeedling, FaCheckCircle, FaInfoCircle, FaUniversity, FaBookOpen, FaChartLine, FaTrophy, FaStar, FaUsers, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import CounselingForm from './CounselingForm'
import { useAuth } from '../all_login/AuthContext'
import { useLanguage } from '../all_login/LanguageContext'
import '../../assets/css/9thclass.css'
import UserHeader from './UserHeader'
import UserLeftNav from './UserLeftNav'

const NinthGuidance = () => {
  const navigate = useNavigate()
  const { uniqueId, accessToken } = useAuth()
  const { language } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  })
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [selectedStream, setSelectedStream] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null) // This is the selected subject card
  const [loading, setLoading] = useState(true)
  const [showCounseling, setShowCounseling] = useState(false)
  const resultsRef = useRef(null)
  const [expandedSubSections, setExpandedSubSections] = useState({
    strategy: true,
    resources: true,
  });

  // Simulate loading
  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

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

  const ninthStreams = [
    { 
      id: 'foundation-science', 
      name: language === 'hi' ? 'विज्ञान फाउंडेशन' : 'Science Foundation', 
      icon: <FaFlask />, 
      focus: language === 'hi' ? 'गणित, भौतिकी, रसायन विज्ञान, जीव विज्ञान' : 'Mathematics, Physics, Chemistry, Biology',
      description: language === 'hi' ? '10वीं के लिए मजबूत विज्ञान अवधारणाएं' : 'Strong science concepts for 10th'
    }, 
    { 
      id: 'foundation-commerce', 
      name: language === 'hi' ? 'वाणिज्य फाउंडेशन' : 'Commerce Foundation', 
      icon: <FaCalculator />, 
      focus: language === 'hi' ? 'गणित, अर्थशास्त्र, बुकीपीडिंग' : 'Mathematics, Economics, Bookkeeping',
      description: language === 'hi' ? '10वीं के लिए वाणिज्य अवधारणाएं' : 'Commerce concepts for 10th'
    }, 
    { 
      id: 'foundation-arts', 
      name: language === 'hi' ? 'कला फाउंडेशन' : 'Arts Foundation', 
      icon: <FaBook />, 
      focus: language === 'hi' ? 'इतिहास, भूगोल, सामाजिक विज्ञान' : 'History, Geography, Social Science',
      description: language === 'hi' ? '10वीं के लिए कला विषयों की तैयारी' : 'Arts subjects preparation for 10th'
    },
    { 
      id: 'foundation-vocational', 
      name: language === 'hi' ? 'कौशल फाउंडेशन' : 'Skills Foundation', 
      icon: <FaWrench />, 
      focus: language === 'hi' ? 'तकनीकी, IT, कंप्यूटर' : 'Technical, IT, Computer',
      description: language === 'hi' ? 'व्यावसायिक कौशल विकास' : 'Vocational skills development'
    }
  ]

  const getFoundationPlan = (streamId) => {
    const plans = {
      'foundation-science': {
        title: language === 'hi' ? 'विज्ञान फाउंडेशन प्लान' : 'Science Foundation Plan',
        subjects: [
          { 
            name: language === 'hi' ? 'गणित (Mathematics)' : 'Mathematics', 
            icon: <FaCalculator />,
            importance: language === 'hi' ? 'उच्च' : 'High', 
            topics: language === 'hi' ? 'संख्या पद्धति, बीजगणित, ज्यामिति, सांख्यिकी' : 'Number Systems, Algebra, Geometry, Statistics',
            description: language === 'hi' ? '9वीं का गणित 10वीं बोर्ड और NTSE/JEE जैसी परीक्षाओं का आधार है।' : 'Class 9 Math is the cornerstone for 10th Boards and exams like NTSE/JEE.',
            outcomes: language === 'hi' ? ['तार्किक सोच', 'समस्या समाधान', '10वीं बीजगणित आधार'] : ['Logical Reasoning', 'Problem Solving', '10th Algebra Base'],
            academicRoadmap: [
              { 
                path: language === 'hi' ? '9वीं बुनियादी → 10वीं बोर्ड तैयारी' : '9th Basics → 10th Board Mastery', 
                steps: [language === 'hi' ? 'बीजगणित के मजबूत सिद्धांत' : 'Master Algebra basics', language === 'hi' ? 'ज्यामितीय प्रमेयों का अभ्यास' : 'Practice Geometry theorems'], 
                growth: language === 'hi' ? 'गणितीय दक्षता' : 'Mathematical Proficiency',
                strategy: language === 'hi' ? 'प्रतिदिन 1 घंटा अभ्यास करें। सूत्रों को याद करने के बजाय उनके पीछे के तर्क को समझें।' : 'Practice for 1 hour daily. Focus on the logic behind formulas rather than rote memorization.',
                resources: language === 'hi' ? 'NCERT गणित, आर.डी. शर्मा (अतिरिक्त अभ्यास के लिए), और खान एकेडमी।' : 'NCERT Mathematics, R.D. Sharma (for extra practice), and Khan Academy.'
              }
            ]
          },
          { 
            name: language === 'hi' ? 'भौतिकी (Physics)' : 'Physics', 
            icon: <FaFlask />,
            importance: language === 'hi' ? 'उच्च' : 'High', 
            topics: language === 'hi' ? 'गति, ऊर्जा, प्रकाश, विद्युत' : 'Motion, Energy, Light, Electricity',
            description: language === 'hi' ? 'ब्रह्मांड के नियमों को समझना शुरू करें।' : 'Start understanding the fundamental laws of the universe.',
            outcomes: language === 'hi' ? ['वैज्ञानिक दृष्टिकोण', 'विश्लेषणात्मक कौशल'] : ['Scientific Aptitude', 'Analytical Skills'],
            academicRoadmap: [{ 
              path: language === 'hi' ? '9वीं अवधारणा → 10वीं संख्यात्मक प्रश्न' : '9th Concepts → 10th Numericals', 
              steps: ['Conceptual Clarity', 'Numerical Practice'], 
              growth: 'Physics Foundation',
              strategy: language === 'hi' ? 'अवधारणाओं को वास्तविक जीवन के उदाहरणों से जोड़ें। एक अलग सूत्र चार्ट बनाएं।' : 'Relate concepts to real-life examples. Maintain a dedicated formula sheet.',
              resources: language === 'hi' ? 'NCERT विज्ञान, लखमीर सिंह (भौतिकी), और PhET सिमुलेशन।' : 'NCERT Science, Lakhmir Singh (Physics), and PhET Simulations.'
            }]
          },
          { 
            name: language === 'hi' ? 'रसायन विज्ञान (Chemistry)' : 'Chemistry', 
            icon: <FaFlask />,
            importance: language === 'hi' ? 'उच्च' : 'High', 
            topics: language === 'hi' ? 'रासायनिक अभिक्रिया, तत्व, यौगिक' : 'Chemical reactions, Elements, Compounds',
            description: language === 'hi' ? 'पदार्थों की संरचना और परिवर्तनों का अध्ययन।' : 'Study of matter structure and chemical changes.',
            outcomes: language === 'hi' ? ['प्रायोगिक ज्ञान', 'तत्वों की समझ'] : ['Experimental Knowledge', 'Elemental Mastery'],
            academicRoadmap: [{ 
              path: language === 'hi' ? '9वीं तत्व → 10वीं रासायनिक अभिक्रियाएं' : '9th Elements → 10th Chemical Reactions', 
              steps: ['Learn Periodic Table', 'Balance Equations'], 
              growth: 'Chemistry Foundation',
              strategy: language === 'hi' ? 'आवर्त सारणी के पहले 20 तत्वों को याद करें। रासायनिक समीकरणों को संतुलित करने का अभ्यास करें।' : 'Memorize the first 20 elements. Practice balancing chemical equations regularly.',
              resources: language === 'hi' ? 'NCERT विज्ञान और मॉडर्न एबीसी ऑफ केमिस्ट्री।' : 'NCERT Science and Modern’s abc of Chemistry.'
            }]
          },
          { 
            name: language === 'hi' ? 'जीव विज्ञान (Biology)' : 'Biology', 
            icon: <FaSeedling />,
            importance: language === 'hi' ? 'मध्यम' : 'Medium', 
            topics: language === 'hi' ? 'कोशिका, पोषण, श्वसन' : 'Cell, Nutrition, Respiration',
            description: language === 'hi' ? 'जीवन की जटिलताओं और जैविक प्रणालियों को जानें।' : 'Explore life complexities and biological systems.',
            outcomes: language === 'hi' ? ['जैविक प्रक्रियाएं', 'स्वास्थ्य जागरूकता'] : ['Biological Processes', 'Health Awareness'],
            academicRoadmap: [{ 
              path: language === 'hi' ? '9वीं कोशिका विज्ञान → 10वीं मानव प्रणाली' : '9th Cell Biology → 10th Human Systems', 
              steps: ['Diagram Excellence', 'Taxonomy Basics'], 
              growth: 'Biology Foundation',
              strategy: language === 'hi' ? 'चित्रों का नियमित अभ्यास करें। जैविक प्रक्रियाओं को समझने के लिए फ्लोचार्ट का उपयोग करें।' : 'Practice diagrams frequently. Use flowcharts to summarize biological processes.',
              resources: language === 'hi' ? 'NCERT विज्ञान और प्रदीप की बायोलॉजी।' : 'NCERT Science and Pradeep’s Biology.'
            }]
          }
        ],
        studyTips: [
          language === 'hi' ? 'प्रत्येक दिन 2 घंटे विज्ञान अध्ययन करें' : 'Study science for 2 hours daily',
          language === 'hi' ? 'प्रायोगिक कक्षाओं में भाग लें' : 'Attend practical classes regularly',
          language === 'hi' ? 'डायग्राम और सूत्रों का अभ्यास करें' : 'Practice diagrams and formulas',
          language === 'hi' ? 'NTSE और ओलंपियाड के लिए तैयारी शुरू करें' : 'Start foundation for NTSE and Olympiads'
        ],
        timeline: language === 'hi' ? '10वीं तक का विकास' : 'Development until 10th'
      },
      'foundation-commerce': {
        title: language === 'hi' ? 'वाणिज्य फाउंडेशन प्लान' : 'Commerce Foundation Plan',
        subjects: [
          { 
            name: language === 'hi' ? 'गणित (Mathematics)' : 'Mathematics', 
            icon: <FaCalculator />,
            importance: language === 'hi' ? 'उच्च' : 'High', 
            topics: language === 'hi' ? 'बीजगणित, ज्यामिती, वाणिज्य गणित' : 'Algebra, Geometry, Commercial Math',
            description: language === 'hi' ? 'वाणिज्यिक गणनाओं और सांख्यिकी के लिए गणित का आधार।' : 'Foundation of Math for commercial calculations and statistics.',
            outcomes: language === 'hi' ? ['वित्तीय साक्षरता', 'डेटा विश्लेषण'] : ['Financial Literacy', 'Data Analysis'],
            academicRoadmap: [{ 
              path: '9th Math → 10th Commercial Math', 
              steps: ['Percentage & Ratio mastery', 'Statistical Analysis'], 
              growth: 'Calculation Speed',
              strategy: language === 'hi' ? 'प्रतिशत और अनुपात पर ध्यान दें। मानसिक गणना कौशल विकसित करें।' : 'Focus on Percentages and Ratios. Develop mental calculation skills.',
              resources: language === 'hi' ? 'NCERT और वाणिज्यिक गणित संदर्भ पुस्तकें।' : 'NCERT and Commercial Math reference books.'
            }]
          },
          { 
            name: language === 'hi' ? 'अर्थशास्त्र (Economics)' : 'Economics', 
            icon: <FaChartLine />,
            importance: language === 'hi' ? 'उच्च' : 'High', 
            topics: language === 'hi' ? 'बाजार, मांग-प्रसार, संसाधन' : 'Market, Demand-Supply, Resources',
            description: language === 'hi' ? 'संसाधनों के प्रबंधन और आर्थिक प्रणालियों की समझ।' : 'Understanding resource management and economic systems.',
            outcomes: language === 'hi' ? ['आर्थिक समझ', 'संसाधन प्रबंधन'] : ['Economic Insight', 'Resource Management'],
            academicRoadmap: [{ 
              path: '9th Concepts → 10th Economy Base', 
              steps: ['Understand GDP basics', 'Supply-Demand logic'], 
              growth: 'Market Understanding',
              strategy: language === 'hi' ? 'आर्थिक समाचार पत्र पढ़ें। बुनियादी मांग और आपूर्ति के सिद्धांतों को समझें।' : 'Read business news. Understand basic demand and supply principles.',
              resources: language === 'hi' ? 'NCERT अर्थशास्त्र और संदीप गर्ग।' : 'NCERT Economics and Sandeep Garg.'
            }]
          },
          { 
            name: language === 'hi' ? 'बुकीपीडिंग (Bookkeeping)' : 'Bookkeeping', 
            icon: <FaBook />,
            importance: language === 'hi' ? 'मध्यम' : 'Medium', 
            topics: language === 'hi' ? 'लेखा, वितरण, लाभ-हानि' : 'Accounting, Distribution, Profit-Loss',
            description: language === 'hi' ? 'वित्तीय रिकॉर्ड रखने की बुनियादी कला।' : 'Basic art of keeping financial records.',
            outcomes: language === 'hi' ? ['लेखांकन कौशल', 'सटीकता'] : ['Accounting Skills', 'Accuracy'],
            academicRoadmap: [{ 
              path: '9th Basics → 11th Accountancy Base', 
              steps: ['Learn Debit/Credit', 'Ledger creation'], 
              growth: 'Financial Accuracy',
              strategy: language === 'hi' ? 'लेन-देन की रिकॉर्डिंग का अभ्यास करें। शुद्धता और फॉर्मेटिंग पर ध्यान दें।' : 'Practice recording transactions. Focus on precision and formatting.',
              resources: language === 'hi' ? 'बुनियादी लेखांकन हैंडबुक और एनसीईआरटी।' : 'Basic Accounting handbooks and NCERT.'
            }]
          }
        ],
        studyTips: [
          language === 'hi' ? 'अर्थशास्त्र के सिद्धांत समझें' : 'Understand economics concepts',
          language === 'hi' ? 'गणित की नियमित अभ्यास करें' : 'Practice mathematics regularly',
          language === 'hi' ? 'व्यावहारिक उदाहरणों का अध्ययन करें' : 'Study practical examples',
          language === 'hi' ? 'अखबार के व्यापार पन्ने पढ़ें' : 'Read business section of newspapers'
        ],
        timeline: language === 'hi' ? 'व्यावसायिक सफलता का आधार' : 'Foundation for business success'
      },
      'foundation-arts': {
        title: language === 'hi' ? 'कला फाउंडेशन प्लान' : 'Arts Foundation Plan',
        subjects: [
          { 
            name: language === 'hi' ? 'इतिहास (History)' : 'History', 
            icon: <FaBook />,
            importance: language === 'hi' ? 'उच्च' : 'High', 
            topics: language === 'hi' ? 'संस्कृति, साम्राज्य, सामाजिक बदलाव' : 'Culture, Empires, Social Change',
            description: language === 'hi' ? 'अतीत की घटनाओं से भविष्य की समझ।' : 'Understanding future from past events.',
            outcomes: language === 'hi' ? ['आलोचनात्मक सोच', 'ऐतिहासिक ज्ञान'] : ['Critical Thinking', 'Historical Knowledge'],
            academicRoadmap: [{ 
              path: '9th World History → 10th Indian History', 
              steps: ['Timeline Analysis', 'Source Verification'], 
              growth: 'Analytical Power',
              strategy: language === 'hi' ? 'इतिहास को कहानियों के रूप में पढ़ें। घटनाओं का एक कालक्रम (Timeline) बनाएं।' : 'Read history as a series of stories. Create a timeline of major events.',
              resources: language === 'hi' ? 'NCERT इतिहास और विश्व इतिहास एटलस।' : 'NCERT History and World History Atlas.'
            }]
          },
          { 
            name: language === 'hi' ? 'भूगोल (Geography)' : 'Geography', 
            icon: <FaUniversity />,
            importance: language === 'hi' ? 'उच्च' : 'High', 
            topics: language === 'hi' ? 'क्षेत्रशास्त्र, जलवायु, संसाधन' : 'Regional Studies, Climate, Resources',
            description: language === 'hi' ? 'पृथ्वी और उसकी प्राकृतिक प्रणालियों का अध्ययन।' : 'Study of Earth and its natural systems.',
            outcomes: language === 'hi' ? ['मानचित्र कौशल', 'पर्यावरण जागरूकता'] : ['Map Reading', 'Environmental Awareness'],
            academicRoadmap: [{ 
              path: '9th Physical Geo → 10th Resource Geo', 
              steps: ['Map Reading skills', 'Climate Study'], 
              growth: 'Spatial Awareness',
              strategy: language === 'hi' ? 'नियमित मानचित्र अभ्यास करें। भौगोलिक घटनाओं को समझने के लिए एटलस का उपयोग करें।' : 'Do regular map practice. Use an atlas to visualize geographical features.',
              resources: language === 'hi' ? 'NCERT भूगोल और ऑक्सफोर्ड छात्र एटलस।' : 'NCERT Geography and Oxford Student Atlas.'
            }]
          },
          { 
            name: language === 'hi' ? 'सामाजिक विज्ञान (Social Science)' : 'Social Science', 
            icon: <FaUsers />,
            importance: language === 'hi' ? 'मध्यम' : 'Medium', 
            topics: language === 'hi' ? 'समाज, शासन, अधिकार' : 'Society, Governance, Rights',
            description: language === 'hi' ? 'नागरिक जीवन और शासन प्रणालियों की समझ।' : 'Understanding civic life and governance systems.',
            outcomes: language === 'hi' ? ['नागरिक जागरूकता', 'प्रशासनिक समझ'] : ['Civic Awareness', 'Governance Knowledge'],
            academicRoadmap: [{ 
              path: '9th Civics → 10th Democracy Base', 
              steps: ['Learn Constitution basics', 'Active Debating'], 
              growth: 'Civic Duty Awareness',
              strategy: language === 'hi' ? 'संविधान की प्रस्तावना और मौलिक अधिकारों को समझें। वाद-विवाद में भाग लें।' : 'Understand the Preamble and Fundamental Rights. Participate in debates.',
              resources: language === 'hi' ? 'NCERT राजनीति विज्ञान और समाचार पत्र संपादकीय।' : 'NCERT Political Science and Newspaper editorials.'
            }]
          }
        ],
        studyTips: [
          language === 'hi' ? 'कालावधि और घटनाओं का अध्ययन करें' : 'Study timelines and events',
          language === 'hi' ? 'मानचित्रों पर ध्यान दें' : 'Focus on maps',
          language === 'hi' ? 'सामाजिक मुद्दों को समझें' : 'Understand social issues',
          language === 'hi' ? 'लिखने और विश्लेषण करने का अभ्यास करें' : 'Practice writing and analysis'
        ],
        timeline: language === 'hi' ? 'मानवीय और सांस्कृतिक विकास' : 'Human and cultural development'
      },
      'foundation-vocational': {
        title: language === 'hi' ? 'कौशल फाउंडेशन प्लान' : 'Skills Foundation Plan',
        subjects: [
          { 
            name: language === 'hi' ? 'कंप्यूटर कौशल (Computer Skills)' : 'Computer Skills', 
            icon: <FaBrain />,
            importance: language === 'hi' ? 'उच्च' : 'High', 
            topics: language === 'hi' ? 'MS Office, इंटरनेट, बुनियादी IT' : 'MS Office, Internet, Basic IT',
            description: language === 'hi' ? 'डिजिटल दुनिया के लिए आवश्यक कौशल।' : 'Essential skills for the digital world.',
            outcomes: language === 'hi' ? ['डिजिटल साक्षरता', 'आईटी कौशल'] : ['Digital Literacy', 'IT Proficiency'],
            academicRoadmap: [{ 
              path: '9th IT Basics → 10th Application Base', 
              steps: ['Master MS Office', 'Learn logic/coding basics'], 
              growth: 'Digital Efficiency',
              strategy: language === 'hi' ? 'सॉफ्टवेयर टूल्स का व्यावहारिक अभ्यास करें। छोटे कोडिंग प्रोजेक्ट्स का प्रयास करें।' : 'Hands-on practice with software tools. Attempt small coding projects.',
              resources: language === 'hi' ? 'कक्षा 9 आईटी पाठ्यपुस्तक और यूट्यूब ट्यूटोरियल।' : 'Class 9 IT Textbook and YouTube tutorials.'
            }]
          }
        ],
        studyTips: [
          language === 'hi' ? 'कंप्यूटर कौशल विकसित करें' : 'Develop computer skills',
          language === 'hi' ? 'व्यावहारिक कार्यक्षेत्र में हिस्सा लें' : 'Engage in practical work',
          language === 'hi' ? 'तकनीकी पुस्तकें पढ़ें' : 'Read technical books'
        ],
        timeline: language === 'hi' ? 'तकनीकी प्रगति का मार्ग' : 'Path to technical advancement'
      }
    }
    return plans[streamId] || plans['foundation-science']
  }

  const handleStreamChange = (e) => {
    setSelectedStream(e.target.value)
    setShowResults(false)
  }

  const handleGetGuidance = () => {
    if (!selectedStream) {
      alert(language === 'hi' ? 'कृपया एक स्ट्रीम चुनें' : 'Please select a stream')
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
    console.log('Subject card clicked:', course.name); // Debugging line to confirm click event
    setSelectedCourse(course)
    setSelectedAcademicPath(null) // Reset selection when opening a new subject
    setShowModal(true)
  }

  const handleRoadmapClick = (roadmap) => {
    // Toggle the selected academic path to show/hide details
    setSelectedAcademicPath(selectedAcademicPath === roadmap ? null : roadmap);
  };

  const foundationData = selectedStream ? getFoundationPlan(selectedStream) : null
  const [selectedAcademicPath, setSelectedAcademicPath] = useState(null) // This is the selected academic roadmap within the modal
  const [quizAnswers, setQuizAnswers] = useState({ q1: '', q2: '', q3: '' })
  const [showQuizResult, setShowQuizResult] = useState(false)
  const [quizSummary, setQuizSummary] = useState([])

  const handleQuizAnswer = (question, value) => {
    setQuizAnswers((prev) => ({ ...prev, [question]: value }))
    setShowQuizResult(false)
  }

  const getQuizSuggestions = (answers) => {
    const displayAnswer = (value) => {
      if (!value) return language === 'hi' ? 'कोई चयन नहीं' : 'No selection'
      if (value === 'yes') return language === 'hi' ? 'हाँ' : 'Yes'
      if (value === 'no') return language === 'hi' ? 'नहीं' : 'No'
      if (value === 'sometimes') return language === 'hi' ? 'कभी-कभी' : 'Sometimes'
      return value
    }

    return [
      {
        question: language === 'hi' ? '1. क्या आप अपनी पढ़ाई के लिए एक नियमित समय सारिणी का पालन करते हैं?' : '1. Do you follow a regular study schedule?',
        answer: displayAnswer(answers.q1),
        suggestion: answers.q1 === 'yes'
          ? (language === 'hi' ? 'बहुत बढ़िया! लगातार अभ्यास बनाए रखें और दिन की योजना बनाएं।' : 'Great! Keep the routine and plan your day consistently.')
          : (language === 'hi' ? 'छोटे से शुरू करें: हर दिन 30 मिनट पढ़ाई के लिए तय करें।' : 'Start small: set aside 30 minutes each day to study.')
      },
      {
        question: language === 'hi' ? '2. क्या आप पाठ्यक्रम को समझने पर प्रश्न पूछते हैं?' : '2. Do you ask questions when you do not understand the syllabus?',
        answer: displayAnswer(answers.q2),
        suggestion: answers.q2 === 'yes'
          ? (language === 'hi' ? 'उत्तम! अपनी शंकाओं को तुरंत स्पष्ट रखें।' : 'Excellent! Keep clearing your doubts promptly.')
          : (language === 'hi' ? 'जब कुछ स्पष्ट न हो, तो शिक्षक या सहपाठी से पूछें।' : 'When unsure, ask a teacher or peer for clarification.')
      },
      {
        question: language === 'hi' ? '3. क्या आप पढ़ाई के साथ अपने भावनात्मक स्वास्थ्य का ध्यान रखते हैं?' : '3. Do you take care of your emotional health alongside studies?',
        answer: displayAnswer(answers.q3),
        suggestion: answers.q3 === 'yes'
          ? (language === 'hi' ? 'बहुत अच्छा! नियमित ब्रेक और आराम जारी रखें।' : 'Very good! Continue taking breaks and resting.')
          : answers.q3 === 'sometimes'
            ? (language === 'hi' ? 'कभी-कभी अच्छा है, लेकिन थोड़ी नियमितता से और बेहतर होगा।' : 'Sometimes is a start, but more consistency will help.')
            : (language === 'hi' ? 'स्वस्थ दिनचर्या के लिए रोज थोड़ा समय आराम और ध्यान के लिए निकालें।' : 'For a healthy balance, take a little time each day for rest and mindfulness.')
      }
    ]
  }

  const evaluateQuiz = () => {
    setQuizSummary(getQuizSuggestions(quizAnswers))
    setShowQuizResult(true)
  }

  const toggleSubSection = (section) => {
    setExpandedSubSections((prev) => ({ ...prev, [section]: !prev[section] }))
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
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: '60px', height: '60px' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading...</p>
            </div>
          ) : (
            <div>
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

              {/* Header Card */}
              <Card className="shadow-sm mb-4 border-0 notifications-header-card " style={{ borderRadius: '10px' }}>
                <Card.Body>
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                    <div>
                      <h3 className="mb-2">
                        <FaGraduationCap className="me-2 text-primary" />
                        {language === 'hi' ? "9वीं करियर मार्गदर्शन" : "9th Career Guidance"}
                      </h3>
                      <p className="text-muted mb-0">
                        {language === 'hi' ? "10वीं की तैयारी और विषयों के फाउंडेशन के लिए मार्गदर्शन" : "Guidance for 10th preparation and subject foundations"}
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <CounselingForm
                onSubmit={handleCounselingSubmit}
                showForm={showCounseling}
                onToggle={setShowCounseling}
                studentId={uniqueId}
              />

              {/* Step 1: Select Stream */}
              <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                <Card.Body>
                  <h5 className="mb-3">
                    <Badge bg="primary" className="me-2">{language === 'hi' ? "चरण 1:" : "Step 1:"}</Badge>
                    {language === 'hi' ? "अपना फाउंडेशन स्ट्रीम चुनें" : "Select Your Foundation Stream"}
                  </h5>
                  <Row>
                    {ninthStreams.map((stream) => (
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
                            <h6 className="mb-1">{stream.name}</h6>
                            <small className="text-muted">{stream.focus}</small>
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

              {/* Step 2: Get Guidance */}
              {selectedStream && (
                <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                  <Card.Body>
                    <h5 className="mb-3">
                      <Badge bg="primary" className="me-2">{language === 'hi' ? "चरण 2:" : "Step 2:"}</Badge>
                      {language === 'hi' ? "पाठ्यक्रम और अध्ययन योजना प्राप्त करें" : "Get Curriculum and Study Plan"}
                    </h5>
                    <Row className="align-items-center">
                      <Col md={8}>
                        <p className="mb-0">
                          {language === 'hi' 
                            ? "अपने चयनित फाउंडेशन के आधार पर विस्तृत अध्ययन योजना और विषय गाइड प्राप्त करें" 
                            : "Get detailed study plan and subject guide based on your selected foundation"}
                        </p>
                      </Col>
                      <Col md={4} className='mobile-btn-sty'>
                        <Button 
                          variant="primary" 
                          size="lg"
                          onClick={handleGetGuidance}
                          className="w-100 mobile-btn-get"
                        >
                          <FaLightbulb className="me-2" />
                          {language === 'hi' ? "मार्गदर्शन प्राप्त करें" : "Get Guidance"}
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              {/* Step 3: Results */}
              {showResults && foundationData && (
                <div ref={resultsRef}>
                  {/* Foundation Plan */}
                  <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                          <h5 className="mb-1">{foundationData.title}</h5>
                          <p className="text-muted mb-0">
                            {language === 'hi' ? "10वीं तक का पूर्ण फाउंडेशन विकास" : "Complete foundation development until 10th"}
                          </p>
                        </div>
                        <div className="text-end">
                          <Badge bg="success" className="fs-5 p-3">
                            <FaBookOpen className="me-1" />
                            {language === 'hi' ? "अध्ययन योजना" : "Study Plan"}
                          </Badge>
                        </div>
                      </div>

                      <Row>
                        {foundationData.subjects.map((subject, index) => (
                          <Col md={4} key={index} className="mb-3">
                            <Card 
                              className="h-100 border-0 subject-card-ninth" 
                              style={{ backgroundColor: '#f8f9fa', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                              onClick={() => handleCourseClick(subject)}
                            >
                              <Card.Body>
                                <div className="d-flex align-items-center gap-3 mb-3">
                                  <div className="course-icon-small" style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%',
                                    backgroundColor: '#667eea', display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '1rem'
                                  }}>
                                    {subject.icon || <FaBook />}
                                  </div>
                                  <div>
                                    <h6 className="mb-0 fw-bold">{subject.name}</h6>
                                    <Badge bg={subject.importance === (language === 'hi' ? 'उच्च' : 'High') ? 'success' : 
                                                         subject.importance === (language === 'hi' ? 'मध्यम' : 'Medium') ? 'warning' : 'info'}>
                                      {subject.importance}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="mb-2"><small className="text-primary">{language === 'hi' ? 'विवरण के लिए क्लिक करें' : 'Click for details'}</small></div>
                                <p className="text-muted small mb-0">
                                  {language === 'hi' ? 'विषय:' : 'Topics:'} {subject.topics}
                                </p>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>

                      <hr />

                      <div className="mt-4">
                        <h6 className="mb-3">
                          <FaLightbulb className="me-2 text-warning" />
                          {language === 'hi' ? "अध्ययन योजना के लिए सुझाव" : "Study Plan Tips"}
                        </h6>
                        <Row>
                          {foundationData.studyTips.map((tip, index) => (
                            <Col md={6} lg={4} key={index} className="mb-2">
                              <div className="d-flex align-items-start">
                                <Badge bg="primary" className="me-2 mt-1">{index + 1}</Badge>
                                <span>{tip}</span>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Competitive Exams Focus */}
                  <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }}>
                    <Card.Body>
                      <h5 className="mb-3">
                        <FaTrophy className="me-2 text-warning" />
                        {language === 'hi' ? "9वीं से प्रतियोगी परीक्षा की तैयारी" : "Competitive Outlook from Class 9"}
                      </h5>
                      <Row>
                        <Col md={6}>
                          <div className="p-3 bg-white rounded shadow-sm h-100">
                            <h6 className="fw-bold"><FaStar className="text-primary me-2" />NTSE (National Talent Search Exam)</h6>
                            <p className="small text-muted">
                              {language === 'hi' 
                                ? "9वीं का पाठ्यक्रम NTSE स्टेज 1 के लिए आधार है। गणित और मानसिक योग्यता (MAT) पर विशेष ध्यान दें।" 
                                : "Class 9 syllabus is the base for NTSE Stage 1. Focus on Math and Mental Ability Test (MAT)."}
                            </p>
                            <Badge bg="light" text="dark">{language === 'hi' ? "छात्रवृत्ति अवसर" : "Scholarship Opportunity"}</Badge>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="p-3 bg-white rounded shadow-sm h-100">
                            <h6 className="fw-bold"><FaStar className="text-primary me-2" />Olympiads (NSO/IMO)</h6>
                            <p className="small text-muted">
                              {language === 'hi' 
                                ? "विज्ञान और गणित में वैचारिक गहराई के लिए। यह राष्ट्रीय स्तर पर आपकी रैंकिंग सुधारने में मदद करता है।" 
                                : "For conceptual depth in Science and Math. Helps improve your national-level standing early."}
                            </p>
                            <Badge bg="light" text="dark">{language === 'hi' ? "वैश्विक प्रतिस्पर्धा" : "Global Standing"}</Badge>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* 10th Stream Recommendations */}
                  <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                    <Card.Header className="bg-white border-0 pt-4 pb-0">
                      <h5 className="mb-0">
                        <FaUniversity className="me-2 text-primary" />
                        {language === 'hi' ? "10वीं स्ट्रीम के लिए तैयारी" : "10th Stream Preparation"}
                      </h5>
                      <p className="text-muted mb-0">
                        {language === 'hi' ? "अगले स्तर के लिए मजबूत आधार बनाएं" : "Build strong foundation for next level"}
                      </p>
                    </Card.Header>
                    <Card.Body>
                      <Tab.Container id="ninth-tabs" defaultActiveKey="recommended">
                        <Nav variant="tabs" className="mb-4">
                          <Nav.Item>
                            <Nav.Link eventKey="recommended">
                              <FaUniversity className="me-2" />
                              {language === 'hi' ? "अनुशंसित पाठ्यक्रम" : "Recommended Curriculum"}
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link eventKey="timeline">
                              <FaChartLine className="me-2" />
                              {language === 'hi' ? "विकास अनुसूची" : "Development Timeline"}
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                        <Tab.Content>
                          <Tab.Pane eventKey="recommended">
                            <Alert variant="info">
                              <FaInfoCircle className="me-2" />
                              <strong>{language === 'hi' ? "10वीं के लिए महत्वपूर्ण विषय:" : "Key Subjects for 10th:"}</strong><br />
                              {language === 'hi' 
                                ? "• गणित: बीजगणित, ज्यामिती, त्रिकोणमिति\n• विज्ञान: भौतिकी, रसायन विज्ञान, जीव विज्ञान\n• सामाजिक विज्ञान: इतिहास, भूगोल, अर्थशास्त्र\n• भाषा: हिंदी/अंग्रेजी, साहित्य" 
                                : "• Mathematics: Algebra, Geometry, Trigonometry\n• Science: Physics, Chemistry, Biology\n• Social Science: History, Geography, Economics\n• Language: Hindi/English, Literature"}
                            </Alert>
                          </Tab.Pane>
                          <Tab.Pane eventKey="timeline">
                            <Card>
                              <Card.Body>
                                <h6 className="fw-bold">{foundationData.timeline}</h6>
                                <div className="timeline mt-3">
                                  <div className="timeline-item">
                                    <Badge bg="primary">1-6 माह</Badge>
                                    <span className="ms-2">{language === 'hi' ? "मूल अवधारणाओं की समझ" : "Understanding core concepts"}</span>
                                  </div>
                                  <div className="timeline-item">
                                    <Badge bg="success">7-10 माह</Badge>
                                    <span className="ms-2">{language === 'hi' ? "विषयों का गहरा अध्ययन" : "Deep dive into subjects"}</span>
                                  </div>
                                  <div className="timeline-item">
                                    <Badge bg="info">11-12 माह</Badge>
                                    <span className="ms-2">{language === 'hi' ? "परीक्षा तैयारी और अभ्यास" : "Exam preparation and practice"}</span>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </Tab.Pane>
                        </Tab.Content>
                      </Tab.Container>
                    </Card.Body>
                  </Card>

                  {/* Additional Guidance */}
                  <Card className="shadow-sm border-0 guidance-card" style={{ borderRadius: '10px' }}>
                    <Card.Body>
                      <h5 className="mb-3">
                        <FaLightbulb className="me-2 text-warning" />
                        {language === 'hi' ? "अतिरिक्त मार्गदर्शन" : "Additional Guidance"}
                      </h5>
                      <Row>
                        <Col md={6}>
                          <h6>
                            {language === 'hi' ? '9वीं छात्रों के लिए सुझाव' : 'Tips for 9th Students'}</h6>
                          <ul className="text-muted">
                            <li>{language === 'hi' ? "मूल अवधारणाओं पर ध्यान केंद्रित करें" : "Focus on understanding core concepts"}</li>
                            <li>{language === 'hi' ? "नियमित रूप से पढ़ाई करें" : "Study regularly and consistently"}</li>
                            <li>{language === 'hi' ? "नोट्स बनाएं और समीक्षा करें" : "Make notes and review regularly"}</li>
                            <li>{language === 'hi' ? "प्रश्न पूछें और समझें" : "Ask questions and clarify doubts"}</li>
                          </ul>
                        </Col>
                        <Col md={6}>
                          <h6>{language === 'hi' ? "10वीं तक की तैयारी:" : "Preparation for 10th:"}</h6>
                          <ul className="text-muted">
                            <li>{language === 'hi' ? "विषयों की गहराई से समझ बनाएं" : "Build deep understanding of subjects"}</li>
                            <li>{language === 'hi' ? "समय प्रबंधन कौशल विकसित करें" : "Develop time management skills"}</li>
                            <li>{language === 'hi' ? "प्रैक्टिकल वर्क में भाग लें" : "Participate in practical work"}</li>
                            <li>{language === 'hi' ? "अच्छे अध्ययन आदतें बनाएं" : "Develop good study habits"}</li>
                          </ul>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                    <Card.Body>
                      <h5 className="mb-3">
                        <FaBrain className="me-2 text-success" />
                        {language === 'hi' ? 'शैक्षणिक समर्थन और करियर जागरूकता' : 'Academic Support & Career Awareness'}
                      </h5>
                      <Row>
                        <Col md={6}>
                          <h6>{language === 'hi' ? 'अकादमिक समर्थन' : 'Academic Support'}</h6>
                          <ul className="text-muted">
                            <li>{language === 'hi' ? 'प्रतिदिन पाठ्यक्रम की समीक्षा करें और समय सारिणी बनाएं।' : 'Review curriculum daily and follow a timetable.'}</li>
                            <li>{language === 'hi' ? 'मजबूत नोट्स बनाएं ताकि परीक्षा से पहले तेज समीक्षा हो सके।' : 'Create strong notes for quick revision before exams.'}</li>
                            <li>{language === 'hi' ? 'संकट की स्थिति में शिक्षकों या मेंटर्स से मार्गदर्शन लें।' : 'Seek help from teachers or mentors when in doubt.'}</li>
                          </ul>
                        </Col>
                        <Col md={6}>
                          <h6>{language === 'hi' ? 'करियर जागरूकता' : 'Career Awareness'}</h6>
                          <ul className="text-muted">
                            <li>{language === 'hi' ? 'अपने रुचियों और क्षमताओं की पहचान करें।' : 'Identify your interests and strengths.'}</li>
                            <li>{language === 'hi' ? '10वीं के बाद कौशल-आधारित और अकादमिक मार्ग दोनों पर विचार करें।' : 'Consider both skill-based and academic paths after 10th.'}</li>
                            <li>{language === 'hi' ? 'पेशे के रुझानों और भविष्य की नौकरियों के बारे में जानकारी इकट्ठा करें।' : 'Gather information about career trends and future jobs.'}</li>
                          </ul>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                    <Card.Body>
                      <h5 className="mb-3">
                        <FaSeedling className="me-2 text-info" />
                        {language === 'hi' ? 'कौशल विकास और मानसिक स्वास्थ्य' : 'Skill Development & Mental Well-being'}
                      </h5>
                      <Row>
                        <Col md={6}>
                          <h6>{language === 'hi' ? 'कौशल विकास' : 'Skill Development'}</h6>
                          <ul className="text-muted">
                            <li>{language === 'hi' ? 'लेखन, संचार, समय प्रबंधन जैसे सॉफ्ट स्किल्स पर काम करें।' : 'Work on soft skills like writing, communication, and time management.'}</li>
                            <li>{language === 'hi' ? 'टेक्नोलॉजी और डिजिटल उपकरणों का परिचय प्राप्त करें।' : 'Get comfortable with technology and digital tools.'}</li>
                            <li>{language === 'hi' ? 'किसी नए विषय पर छोटे प्रोजेक्ट करें ताकि सीखने की क्षमता बढ़े।' : 'Try a small project on a new topic to boost learning ability.'}</li>
                          </ul>
                        </Col>
                        <Col md={6}>
                          <h6>{language === 'hi' ? 'मानसिक स्वास्थ्य' : 'Mental Well-being'}</h6>
                          <ul className="text-muted">
                            <li>{language === 'hi' ? 'दिन में ब्रेक लें और पर्याप्त नींद लें।' : 'Take breaks and get enough sleep every day.'}</li>
                            <li>{language === 'hi' ? 'तनाव को कम करने के लिए ध्यान या हल्की एक्सरसाइज करें।' : 'Practice mindfulness or light exercise to reduce stress.'}</li>
                            <li>{language === 'hi' ? 'दोस्तों और परिवार से बातें करें जब आप दबाव महसूस करें।' : 'Talk to friends or family when you feel pressure.'}</li>
                          </ul>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  <Card className="shadow-sm border-0" style={{ borderRadius: '10px' }}>
                    <Card.Body>
                      <h5 className="mb-3">
                        <FaLightbulb className="me-2 text-primary" />
                        {language === 'hi' ? 'त्वरित आत्म-जांच' : 'Quick Self-Check'}
                      </h5>
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">{language === 'hi' ? '1. क्या आप अपनी पढ़ाई के लिए एक नियमित समय सारिणी का पालन करते हैं?' : '1. Do you follow a regular study schedule?'}</Form.Label>
                          <div>
                            <Form.Check inline label={language === 'hi' ? 'हाँ' : 'Yes'} name="q1" type="radio" id="q1-yes" value="yes" checked={quizAnswers.q1 === 'yes'} onChange={() => handleQuizAnswer('q1', 'yes')} />
                            <Form.Check inline label={language === 'hi' ? 'नहीं' : 'No'} name="q1" type="radio" id="q1-no" value="no" checked={quizAnswers.q1 === 'no'} onChange={() => handleQuizAnswer('q1', 'no')} />
                          </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">{language === 'hi' ? '2. क्या आप पाठ्यक्रम को समझने पर प्रश्न पूछते हैं?' : '2. Do you ask questions when you do not understand the syllabus?'}</Form.Label>
                          <div>
                            <Form.Check inline label={language === 'hi' ? 'हाँ' : 'Yes'} name="q2" type="radio" id="q2-yes" value="yes" checked={quizAnswers.q2 === 'yes'} onChange={() => handleQuizAnswer('q2', 'yes')} />
                            <Form.Check inline label={language === 'hi' ? 'नहीं' : 'No'} name="q2" type="radio" id="q2-no" value="no" checked={quizAnswers.q2 === 'no'} onChange={() => handleQuizAnswer('q2', 'no')} />
                          </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">{language === 'hi' ? '3. क्या आप पढ़ाई के साथ अपने भावनात्मक स्वास्थ्य का ध्यान रखते हैं?' : '3. Do you take care of your emotional health alongside studies?'}</Form.Label>
                          <div>
                            <Form.Check inline label={language === 'hi' ? 'हाँ' : 'Yes'} name="q3" type="radio" id="q3-yes" value="yes" checked={quizAnswers.q3 === 'yes'} onChange={() => handleQuizAnswer('q3', 'yes')} />
                            <Form.Check inline label={language === 'hi' ? 'कभी-कभी' : 'Sometimes'} name="q3" type="radio" id="q3-sometimes" value="sometimes" checked={quizAnswers.q3 === 'sometimes'} onChange={() => handleQuizAnswer('q3', 'sometimes')} />
                            <Form.Check inline label={language === 'hi' ? 'नहीं' : 'No'} name="q3" type="radio" id="q3-no" value="no" checked={quizAnswers.q3 === 'no'} onChange={() => handleQuizAnswer('q3', 'no')} />
                          </div>
                        </Form.Group>
                        <Button variant="outline-primary" onClick={evaluateQuiz}>
                          {language === 'hi' ? 'परिणाम देखें' : 'See Result'}
                        </Button>
                      </Form>
                      {showQuizResult && (
                        <div className="mt-3">
                          <Alert variant="secondary">
                            <strong>{language === 'hi' ? 'आपका स्कोर:' : 'Your score:'}</strong> {quizSummary.filter((item) => item.answer !== (language === 'hi' ? 'कोई चयन नहीं' : 'No selection')).length} / 3
                          </Alert>
                          {quizSummary.map((item, index) => (
                            <Alert variant="light" className="mt-2" key={index}>
                              <div className="fw-bold">{item.question}</div>
                              <div className="small text-muted mb-2">
                                {language === 'hi' ? 'उत्तर:' : 'Answer:'} {item.answer}
                              </div>
                              <div>{item.suggestion}</div>
                            </Alert>
                          ))}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              )}

              {/* Instructions */}
              {!selectedStream && (
                <Card className="shadow-sm border-0 instructions-card" style={{ borderRadius: '10px' }}>
                  <Card.Body>
                    <h4>{language === 'hi' ? "मार्गदर्शन कैसे प्राप्त करें" : "How to Get Guidance"}</h4>
                    <p className="text-muted mb-0">
                      <strong>{language === 'hi' ? "चरण 1:" : "Step 1:"}</strong> {language === 'hi' ? "अपनी रुचियों और लक्ष्यों के आधार पर स्ट्रीम चुनें" : "Select stream based on your interests and goals"}<br />
                      <strong>{language === 'hi' ? "चरण 2:" : "Step 2:"}</strong> {language === 'hi' ? "'मार्गदर्शन प्राप्त करें' पर क्लिक करें" : "Click 'Get Guidance' button"}<br />
                      <strong>{language === 'hi' ? "चरण 3:" : "Step 3:"}</strong> {language === 'hi' ? "विस्तृत अध्ययन योजना और सुझाव पढ़ें" : "Read detailed study plan and tips"}
                    </p>
                  </Card.Body>
                </Card>
              )}
            </div>
          )}
        </Container>
      </div>

      {/* Stream Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            {selectedCourse?.icon}
            <span className="ms-2">{selectedCourse?.name}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCourse && (
            <div>
              <div className="mb-4">
                <h6 className="text-muted mb-2">{language === 'hi' ? "विवरण" : "Description"}</h6>
                <p>{selectedCourse.description}</p>
              </div>
               
               {/* Academic Path Section */}
               {selectedCourse.academicRoadmap && selectedCourse.academicRoadmap.length > 0 && (
                 <div className="mb-4">
                   <h6 className="text-muted mb-3 fw-bold">
                     <FaChartLine className="me-2 text-primary" />
                     {language === 'hi' ? "शैक्षणिक पथ" : "Academic Path"}
                   </h6>
                   {selectedCourse.academicRoadmap.map((roadmap, index) => (
                     <Card 
                       key={index}
                       className={`mb-3 border roadmap-card ${selectedAcademicPath === roadmap ? 'selected' : ''}`}
                       style={{ borderRadius: '8px', backgroundColor: '#f8f9fa', cursor: 'pointer', transition: 'all 0.3s ease' }}
                       onClick={() => handleRoadmapClick(roadmap)}
                     >
                       <Card.Body className="p-3" style={{ maxHeight: selectedAcademicPath === roadmap ? '800px' : '80px', overflowY: 'hidden', transition: 'max-height 0.3s ease-in-out' }}>
                         <div className="d-flex justify-content-between align-items-center mb-2">
                           <h6 className="mb-0 text-primary fw-bold">
                             <FaUniversity className="me-2" /> {roadmap.path}
                           </h6>
                           <div className="d-flex align-items-center">
                             <Badge bg="secondary" className="me-2">{roadmap.growth}</Badge>
                             {selectedAcademicPath === roadmap ? <FaChevronUp className="text-muted" /> : <FaChevronDown className="text-muted" />}
                           </div>
                         </div>
                         {selectedAcademicPath === roadmap && (
                           <>
                             <div className="mt-3">
                               <h6 className="text-muted mb-2 fw-bold">
                                 <FaStar className="me-2 text-warning" />
                                 {language === 'hi' ? "महत्वपूर्ण चरण:" : "Key Steps:"}
                               </h6>
                               <ol className="ps-3 mb-0">
                                 {roadmap.steps.map((step, idx) => (
                                   <li key={idx} className="mb-2 small" style={{ lineHeight: '1.6' }}>
                                     <div className="d-flex align-items-start">
                                       <span className="me-2 mt-1" style={{ color: '#667eea' }}>
                                         <FaCheckCircle />
                                       </span>
                                       <div>
                                         <span className="fw-bold text-dark">{step}</span>
                                         <div className="text-muted small mt-1">
                                           {language === 'hi' 
                                           ? '🛠️ फाउंडेशन और अवधारणा निर्माण के लिए आवश्यक' 
                                           : '🛠️ Essential for foundation and concept building'}
                                         </div>
                                       </div>
                                     </div>
                                   </li>
                                 ))}
                               </ol>
                             </div>
                             <div className="row g-2 mt-3">
                               <Col md={12}>
                                 <div className="p-3 bg-white rounded border-start border-3 border-success shadow-sm">
                                   <div 
                                     className="d-flex justify-content-between align-items-center cursor-pointer"
                                     onClick={() => toggleSubSection('strategy')}
                                   >
                                     <h6 className="fw-bold text-success mb-0" style={{ fontSize: '0.9rem' }}>
                                       <FaChartLine className="me-2" />
                                       {language === 'hi' ? "रणनीति" : "Strategy"}
                                     </h6>
                                     {expandedSubSections.strategy ? <FaChevronUp className="text-muted" /> : <FaChevronDown className="text-muted" />}
                                   </div>
                                   {expandedSubSections.strategy && (
                                     <p className="text-muted small mb-0 mt-2">{roadmap.strategy}</p>
                                   )}
                                 </div>
                               </Col>
                               <Col md={12}>
                                 <div className="p-3 bg-white rounded border-start border-3 border-info shadow-sm mt-2">
                                   <div 
                                     className="d-flex justify-content-between align-items-center cursor-pointer"
                                     onClick={() => toggleSubSection('resources')}
                                   >
                                     <h6 className="fw-bold text-info mb-0" style={{ fontSize: '0.9rem' }}>
                                       <FaBookOpen className="me-2" />
                                       {language === 'hi' ? "संसाधन" : "Resources"}
                                     </h6>
                                     {expandedSubSections.resources ? <FaChevronUp className="text-muted" /> : <FaChevronDown className="text-muted" />}
                                   </div>
                                   {expandedSubSections.resources && (
                                     <p className="text-muted small mb-0 mt-2">{roadmap.resources}</p>
                                   )}
                                 </div>
                               </Col>
                             </div>
                             <div className="mt-3">
                               <Alert variant="info" className="mb-0">
                                 <FaLightbulb className="me-2 mb-1" />
                                 <small>
                                   {language === 'hi' 
                                     ? '💡 इन चरणों को पूरा करके आप अपनी मूल अवधारणाएं मजबूत बना सकते हैं और 10वीं की तैयारी में सफल हो सकते हैं।'
                                     : '💡 By completing these steps, you can strengthen your core concepts and succeed in your 10th grade preparation.'}
                                 </small>
                               </Alert>
                             </div>
                           </>
                         )}
                       </Card.Body>
                     </Card>
                   ))}
                 </div>
               )}
              
              {/* Foundational Outcomes */}
              <div className="mb-4">
                <h6 className="text-muted mb-2">{language === 'hi' ? "मुख्य सीखने के परिणाम" : "Key Learning Outcomes"}</h6>
                <Alert variant="light" className="border-0 bg-light p-2 mb-3">
                  <small className="text-muted">
                    <FaInfoCircle className="me-1" />
                    {language === 'hi' 
                      ? "9वीं में इस विषय को मास्टर करने से आपको ये लाभ होंगे:" 
                      : "Mastering this subject in Class 9 provides these foundational benefits:"}
                  </small>
                </Alert>
                <Row>
                  {selectedCourse.outcomes.map((outcome, index) => (
                    <Col md={6} key={index} className="mb-2">
                      <Badge bg="primary" className="w-100 py-2">
                        <FaCheckCircle className="me-2" />
                        {outcome}
                      </Badge>
                    </Col>
                  ))}
                </Row>
              </div>
              
              <Alert variant="info">
                <FaInfoCircle className="me-2" />
                <strong>{language === 'hi' ? "सुझाव:" : "Tip:"}</strong> {language === 'hi' ? "विस्तृत फाउंडेशन चरणों को देखने के लिए पथ पर क्लिक करें" : "Click on a path to see detailed foundation steps"}
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {language === 'hi' ? "बंद करें" : "Close"}
          </Button>
          <Button variant="primary" onClick={() => {
            setShowModal(false)
            navigate('/UserDashboard')
          }}>
            {language === 'hi' ? "डैशबोर्ड पर जाएं" : "Go to Dashboard"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default NinthGuidance