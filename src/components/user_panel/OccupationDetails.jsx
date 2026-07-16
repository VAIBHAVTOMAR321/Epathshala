import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Button, Badge, Alert, Accordion, Tab, Nav } from "react-bootstrap";
import { useAuth } from "../all_login/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft, FaGraduationCap, FaChalkboardTeacher, FaBalanceScale, FaHospital, FaCode,
  FaCheckCircle, FaChartLine, FaUsers, FaMapMarkerAlt, FaUniversity, FaShieldAlt, FaLandmark,
  FaFlask, FaMoneyBillWave, FaUserShield, FaFlag, FaTrain, FaClipboardList, FaRocket, FaLightbulb,
  FaInfoCircle, FaCog, FaUserTie, FaBuilding, FaBook, FaAward, FaCertificate, FaClock, FaBookOpen,
  FaStar, FaTrophy, FaNewspaper, FaPaintBrush, FaHeartbeat, FaMicrochip, FaNetworkWired, FaDatabase,
  FaRobot, FaDna, FaSeedling, FaLaptopMedical, FaBusAlt, FaUserGraduate, FaBriefcase, FaChartBar
} from 'react-icons/fa';
import UserHeader from "./UserHeader";
import UserLeftNav from "./UserLeftNav";
import { useLanguage } from "../all_login/LanguageContext";
import '../../assets/css/OccupationDetails.css';

const OccupationDetails = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const { uniqueId, accessToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);

  const { occupation, course, prepType: initialPrepType, stream, percentage } = location.state || {};
  const [prepType, setPrepType] = useState(initialPrepType || 'private');
  const [selectedGovtExam, setSelectedGovtExam] = useState('UPSC');
  const examRoadmapRef = useRef(null);

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
    setLoading(false);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Occupation details data
  const getOccupationDetails = (occupationName) => {
    const occupations = {
      'Teacher': {
        title: language === 'hi' ? 'शिक्षक' : 'Teacher',
        icon: <FaChalkboardTeacher className="text-primary" />,
        description: language === 'hi' ? 'शिक्षक प्राथमिक शैक्षणिक संस्था से लेकर विश्वविद्यालयों तक विभिन्न स्तरों पर छात्रों को शिक्षित करते हैं। वे छात्रों के भविष्य को आकार देने में महत्वपूर्ण भूमिका निभाते हैं।' : 'Teachers educate students at various levels, from primary schools to universities. They play a crucial role in shaping the future of students.',
        growthPotential: language === 'hi' ? 'उच्च' : 'High',
        demandLevel: language === 'hi' ? 'बहुत उच्च' : 'Very High',
        steps: [
          { step: 1, title: language === 'hi' ? '12वीं कक्षा पूरी करें' : 'Complete 12th Standard', description: language === 'hi' ? 'अच्छे प्रतिशत के साथ अपनी 12वीं कक्षा पूरी करें' : 'Complete your 12th standard with good percentage', duration: language === 'hi' ? '2 वर्ष' : '2 Years', tips: language === 'hi' ? ['पसंदीदा विषयों पर ध्यान दें', 'शिक्षण गतिविधियों में भाग लें', 'संचार कौशल विकसित करें'] : ['Focus on favorite subjects', 'Participate in teaching activities', 'Develop communication skills'] },
          { step: 2, title: language === 'hi' ? 'स्नातक की डिग्री प्राप्त करें' : 'Pursue Bachelor\'s Degree', description: language === 'hi' ? 'अपने पसंदीदा विषय में बीए/बीएससी/बीकॉम पूरा करें' : 'Complete BA/B.Sc/B.Com in your preferred subject', duration: language === 'hi' ? '3 वर्ष' : '3 Years', tips: language === 'hi' ? ['प्रासंगिक विषय चुनें', 'अच्छा रिकॉर्ड बनाए रखें', 'कॉलेज कार्यक्रमों में भाग लें'] : ['Choose relevant subjects', 'Maintain good record', 'Participate in college events'] },
          { step: 3, title: language === 'hi' ? 'बी.एड पूरा करें' : 'Complete B.Ed', description: language === 'hi' ? 'किसी मान्यता प्राप्त विश्वविद्यालय से शिक्षा स्नातक (बी.एड) करें' : 'Pursue Bachelor of Education (B.Ed) from a recognized university', duration: language === 'hi' ? '2 वर्ष' : '2 Years', tips: language === 'hi' ? ['एक अच्छा बी.एड कॉलेज चुनें', 'शिक्षण पद्धतियां सीखें', 'शिक्षण का अभ्यास करें'] : ['Choose a good B.Ed college', 'Learn teaching methodologies', 'Practice teaching'] },
          { step: 4, title: language === 'hi' ? 'शिक्षण परीक्षा उत्तीर्ण करें' : 'Clear Teaching Exams', description: language === 'hi' ? 'अपनी राज्य की आवश्यकताओं के अनुसार CTET/TET/STET परीक्षा उत्तीर्ण करें' : 'Clear CTET/TET/STET exams as per your state requirements', duration: language === 'hi' ? '3-6 महीने' : '3-6 Months', tips: language === 'hi' ? ['पिछले पेपर्स का अध्ययन करें', 'बाल मनोविज्ञान सीखें', 'मॉक टेस्ट दें'] : ['Study previous papers', 'Learn child psychology', 'Take mock tests'] },
          { step: 5, title: language === 'hi' ? 'शिक्षण पदों के लिए आवेदन करें' : 'Apply for Teaching Positions', description: language === 'hi' ? 'सरकारी या निजी स्कूल शिक्षण पदों के लिए आवेदन करें' : 'Apply for government or private school teaching positions', duration: language === 'hi' ? 'जारी' : 'Ongoing', tips: language === 'hi' ? ['साक्षात्कार के लिए तैयारी करें', 'एक अच्छा बायोडाटा बनाएं', 'कई शैक्षणिक संस्था में आवेदन करें'] : ['Prepare for interviews', 'Create a good resume', 'Apply to multiple schools'] }
        ],
        exams: [
          { name: 'CTET (Central Teacher Eligibility Test)', eligibility: language === 'hi' ? 'बी.एड योग्य' : 'B.Ed qualified', frequency: language === 'hi' ? 'वर्ष में दो बार' : 'Twice a year', difficulty: language === 'hi' ? 'मध्यम' : 'Moderate' },
          { name: 'TET (Teacher Eligibility Test)', eligibility: language === 'hi' ? 'बी.एड योग्य' : 'B.Ed qualified', frequency: language === 'hi' ? 'राज्यवार' : 'State-wise', difficulty: language === 'hi' ? 'मध्यम' : 'Moderate' },
          { name: 'STET (State Teacher Eligibility Test)', eligibility: language === 'hi' ? 'बी.एड योग्य' : 'B.Ed qualified', frequency: language === 'hi' ? 'राज्यवार' : 'State-wise', difficulty: language === 'hi' ? 'मध्यम' : 'Moderate' },
          { name: 'UGC NET (for College Teachers)', eligibility: language === 'hi' ? 'स्नातकोत्तर' : 'Post-Graduation', frequency: language === 'hi' ? 'वर्ष में दो बार' : 'Twice a year', difficulty: language === 'hi' ? 'उच्च' : 'High' }
        ],
        skills: language === 'hi' 
          ? ['संचार कौशल', 'धैर्य', 'विषय ज्ञान', 'कक्षा प्रबंधन', 'रचनात्मकता', 'अनुकूलनशीलता'] 
          : ['Communication Skills', 'Patience', 'Subject Knowledge', 'Classroom Management', 'Creativity', 'Adaptability'],
        careerPath: [
          { level: language === 'hi' ? 'प्राथमिक शिक्षक' : 'Primary Teacher', experience: '0-5 years' },
          { level: language === 'hi' ? 'टीजीटी (प्रशिक्षित स्नातक शिक्षक)' : 'TGT (Trained Graduate Teacher)', experience: '5-10 years' },
          { level: language === 'hi' ? 'पीजीटी (स्नातकोत्तर शिक्षक)' : 'PGT (Post Graduate Teacher)', experience: '10-15 years' },
          { level: language === 'hi' ? 'उप प्रधानाचार्य' : 'Vice Principal', experience: '15-20 years' },
          { level: language === 'hi' ? 'प्रधानाचार्य' : 'Principal', experience: '20+ years' }
        ],
        topColleges: [
          { name: language === 'hi' ? 'दिल्ली विश्वविद्यालय' : 'Delhi University', location: 'Delhi', ranking: 'Top 10' },
          { name: language === 'hi' ? 'जामिया मिलिया इस्लामिया' : 'Jamia Millia Islamia', location: 'Delhi', ranking: 'Top 20' },
          { name: language === 'hi' ? 'बनारस हिंदू विश्वविद्यालय' : 'Banaras Hindu University', location: 'Varanasi', ranking: 'Top 10' },
          { name: language === 'hi' ? 'मुंबई विश्वविद्यालय' : 'University of Mumbai', location: 'Mumbai', ranking: 'Top 20' }
        ]
      },
      'Lawyer': {
        title: language === 'hi' ? 'वकील' : 'Lawyer',
        icon: <FaBalanceScale className="text-primary" />,
        description: language === 'hi' ? 'वकील व्यक्तियों, व्यवसायों और सरकारी एजेंसियों को कानूनी सलाह और प्रतिनिधित्व प्रदान करते हैं। वे न्याय प्रणाली में महत्वपूर्ण भूमिका निभाते हैं।' : 'Lawyers provide legal advice and representation to individuals, businesses, and government agencies. They play a vital role in the justice system.',
        growthPotential: language === 'hi' ? 'बहुत उच्च' : 'Very High',
        demandLevel: language === 'hi' ? 'उच्च' : 'High',
        steps: [
          { step: 1, title: language === 'hi' ? '12वीं कक्षा पूरी करें' : 'Complete 12th Standard', description: language === 'hi' ? 'अच्छे प्रतिशत के साथ अपनी 12वीं कक्षा पूरी करें' : 'Complete your 12th standard with good percentage', duration: language === 'hi' ? '2 वर्ष' : '2 Years', tips: language === 'hi' ? ['मानविकी विषयों पर ध्यान दें', 'पढ़ने की आदतें विकसित करें', 'वाद-विवाद में भाग लें'] : ['Focus on humanities subjects', 'Develop reading habits', 'Participate in debates'] },
          { step: 2, title: language === 'hi' ? 'एलएलबी करें' : 'Pursue LLB', description: language === 'hi' ? 'एलएलबी (स्नातक के बाद 3 वर्ष) या बीए एलएलबी (5 वर्ष एकीकृत) पूरा करें' : 'Complete LLB (3 years after graduation) or BA LLB (5 years integrated)', duration: language === 'hi' ? '3-5 वर्ष' : '3-5 Years', tips: language === 'hi' ? ['एक अच्छा लॉ कॉलेज चुनें', 'केस कानूनों का अध्ययन करें', 'मूट कोर्ट में भाग लें'] : ['Choose a good law college', 'Study case laws', 'Participate in moot courts'] },
          { step: 3, title: language === 'hi' ? 'बार काउंसिल में पंजीकरण करें' : 'Enroll with Bar Council', description: language === 'hi' ? 'एलएलबी पूरा करने के बाद राज्य बार काउंसिल के साथ पंजीकरण करें' : 'Register with State Bar Council after completing LLB', duration: language === 'hi' ? '1-2 महीने' : '1-2 Months', tips: language === 'hi' ? ['बार काउंसिल की औपचारिकताएं पूरी करें', 'बार काउंसिल पंजीकरण प्राप्त करें', 'इंटर्नशिप शुरू करें'] : ['Complete bar council formalities', 'Get bar council registration', 'Start internship'] },
          { step: 4, title: language === 'hi' ? 'इंटर्नशिप पूरी करें' : 'Complete Internship', description: language === 'hi' ? 'व्यावहारिक अनुभव प्राप्त करने के लिए एक वरिष्ठ वकील के अधीन इंटर्नशिप करें' : 'Intern under a senior lawyer to gain practical experience', duration: language === 'hi' ? '1-2 वर्ष' : '1-2 Years', tips: language === 'hi' ? ['अदालती प्रक्रियाओं को सीखें', 'दस्तावेज तैयार करें', 'पेशेवर नेटवर्क बनाएं'] : ['Learn court procedures', 'Draft documents', 'Build professional network'] },
          { step: 5, title: language === 'hi' ? 'अभ्यास शुरू करें' : 'Start Practice', description: language === 'hi' ? 'स्वतंत्र अभ्यास शुरू करें या लॉ फर्म में शामिल हों' : 'Start independent practice or join a law firm', duration: language === 'hi' ? 'जारी' : 'Ongoing', tips: language === 'hi' ? ['क्लाइंट बेस बनाएं', 'किसी क्षेत्र में विशेषज्ञता हासिल करें', 'सीखना जारी रखें'] : ['Build client base', 'Specialize in a field', 'Continue learning'] }
        ],
        exams: [
          { name: 'CLAT (Common Law Admission Test)', eligibility: language === 'hi' ? '12वीं पास' : '12th Pass', frequency: language === 'hi' ? 'वर्ष में एक बार' : 'Once a year', difficulty: language === 'hi' ? 'उच्च' : 'High' },
          { name: 'AILET (All India Law Entrance Test)', eligibility: language === 'hi' ? '12वीं पास' : '12th Pass', frequency: language === 'hi' ? 'वर्ष में एक बार' : 'Once a year', difficulty: language === 'hi' ? 'उच्च' : 'High' },
          { name: 'LSAT (Law School Admission Test)', eligibility: language === 'hi' ? '12वीं पास' : '12th Pass', frequency: language === 'hi' ? 'कई बार' : 'Multiple times', difficulty: language === 'hi' ? 'मध्यम' : 'Moderate' }
        ],
        skills: language === 'hi'
          ? ['विश्लेषणात्मक कौशल', 'संचार कौशल', 'अनुसंधान कौशल', 'बातचीत कौशल', 'नैतिकता', 'समस्या समाधान']
          : ['Analytical Skills', 'Communication Skills', 'Research Skills', 'Negotiation Skills', 'Ethics', 'Problem Solving'],
        careerPath: [
          { level: language === 'hi' ? 'कनिष्ठ वकील' : 'Junior Lawyer', experience: '0-5 years' },
          { level: language === 'hi' ? 'वरिष्ठ वकील' : 'Senior Lawyer', experience: '5-10 years' },
          { level: language === 'hi' ? 'एसोसिएट पार्टनर' : 'Associate Partner', experience: '10-15 years' },
          { level: language === 'hi' ? 'सीनियर पार्टनर' : 'Senior Partner', experience: '15-20 years' },
          { level: language === 'hi' ? 'न्यायाधीश' : 'Judge', experience: '20+ years' }
        ],
        topColleges: [
          { name: language === 'hi' ? 'नेशनल लॉ स्कूल ऑफ इंडिया यूनिवर्सिटी' : 'National Law School of India University', location: 'Bangalore', ranking: 'Top 1' },
          { name: language === 'hi' ? 'नालसार विधि विश्वविद्यालय' : 'NALSAR University of Law', location: 'Hyderabad', ranking: 'Top 3' },
          { name: language === 'hi' ? 'नेशनल लॉ यूनिवर्सिटी' : 'National Law University', location: 'Delhi', ranking: 'Top 5' },
          { name: language === 'hi' ? 'विधि संकाय, दिल्ली विश्वविद्यालय' : 'Faculty of Law, Delhi University', location: 'Delhi', ranking: 'Top 10' }
        ]
      },
      'Software Engineer': {
        title: language === 'hi' ? 'सॉफ्टवेयर इंजीनियर' : 'Software Engineer',
        icon: <FaCode className="text-primary" />,
        description: language === 'hi' ? 'सॉफ्टवेयर इंजीनियर सॉफ्टवेयर एप्लिकेशन डिजाइन, विकसित और रखरखाव करते हैं। वे आईटी उद्योग की रीढ़ हैं।' : 'Software engineers design, develop, and maintain software applications. They are the backbone of the IT industry.',
        growthPotential: language === 'hi' ? 'बहुत उच्च' : 'Very High',
        demandLevel: language === 'hi' ? 'बहुत उच्च' : 'Very High',
        steps: [
          { step: 1, title: language === 'hi' ? '12वीं कक्षा पूरी करें' : 'Complete 12th Standard', description: language === 'hi' ? 'भौतिकी, रसायन विज्ञान और गणित के साथ अपनी 12वीं कक्षा पूरी करें' : 'Complete your 12th standard with Physics, Chemistry, and Mathematics', duration: language === 'hi' ? '2 वर्ष' : '2 Years', tips: language === 'hi' ? ['गणित पर ध्यान दें', 'बुनियादी प्रोग्रामिंग सीखें', 'कोडिंग प्रतियोगिताओं में भाग लें'] : ['Focus on mathematics', 'Learn basic programming', 'Participate in coding competitions'] },
          { step: 2, title: language === 'hi' ? 'बी.टेक/बीसीए करें' : 'Pursue B.Tech/BCA', description: language === 'hi' ? 'कंप्यूटर साइंस/आईटी या बीसीए में बी.टेक पूरा करें' : 'Complete B.Tech in Computer Science/IT or BCA', duration: language === 'hi' ? '3-4 वर्ष' : '3-4 Years', tips: language === 'hi' ? ['प्रोग्रामिंग भाषाएं सीखें', 'प्रोजेक्ट बनाएं', 'हैकाथॉन में भाग लें'] : ['Learn programming languages', 'Build projects', 'Participate in hackathons'] },
          { step: 3, title: language === 'hi' ? 'प्रोग्रामिंग भाषाएं सीखें' : 'Learn Programming Languages', description: language === 'hi' ? 'जावा, पायथन, जावास्क्रिप्ट जैसी प्रोग्रामिंग भाषाओं में महारत हासिल करें' : 'Master programming languages like Java, Python, JavaScript, etc.', duration: language === 'hi' ? 'जारी' : 'Ongoing', tips: language === 'hi' ? ['रोजाना अभ्यास करें', 'वास्तविक प्रोजेक्ट बनाएं', 'ओपन सोर्स में योगदान दें'] : ['Practice daily', 'Build real projects', 'Contribute to open source'] },
          { step: 4, title: language === 'hi' ? 'पोर्टफोलियो बनाएं' : 'Build Portfolio', description: language === 'hi' ? 'अपने कौशल को दिखाने के लिए प्रोजेक्ट्स का पोर्टफोलियो बनाएं' : 'Create a portfolio of projects to showcase your skills', duration: language === 'hi' ? '6-12 महीने' : '6-12 Months', tips: language === 'hi' ? ['विविध प्रोजेक्ट्स पर काम करें', 'अपने काम का दस्तावेजीकरण करें', 'GitHub पर कोड होस्ट करें'] : ['Work on diverse projects', 'Document your work', 'Host code on GitHub'] },
          { step: 5, title: language === 'hi' ? 'नौकरियों के लिए आवेदन करें' : 'Apply for Jobs', description: language === 'hi' ? 'आईटी कंपनियों में सॉफ्टवेयर इंजीनियरिंग पदों के लिए आवेदन करें' : 'Apply for software engineering positions in IT companies', duration: language === 'hi' ? 'जारी' : 'Ongoing', tips: language === 'hi' ? ['साक्षात्कार के लिए तैयारी करें', 'कोडिंग समस्याओं का अभ्यास करें', 'पेशेवरों के साथ नेटवर्क बनाएं'] : ['Prepare for interviews', 'Practice coding problems', 'Network with professionals'] }
        ],
        exams: [
          { name: 'GATE (Graduate Aptitude Test in Engineering)', eligibility: language === 'hi' ? 'बी.टेक' : 'B.Tech', frequency: language === 'hi' ? 'वर्ष में एक बार' : 'Once a year', difficulty: language === 'hi' ? 'उच्च' : 'High' },
          { name: 'Company-specific Tests', eligibility: language === 'hi' ? 'बी.टेक/बीसीए' : 'B.Tech/BCA', frequency: language === 'hi' ? 'भर्ती के अनुसार' : 'As per recruitment', difficulty: language === 'hi' ? 'मध्यम से उच्च' : 'Moderate to High' }
        ],
        skills: language === 'hi'
          ? ['प्रोग्रामिंग भाषाएं', 'समस्या समाधान', 'डेटा स्ट्रक्चर', 'एल्गोरिदम', 'डेटाबेस प्रबंधन', 'वर्जन कंट्रोल']
          : ['Programming Languages', 'Problem Solving', 'Data Structures', 'Algorithms', 'Database Management', 'Version Control'],
        careerPath: [
          { level: language === 'hi' ? 'कनिष्ठ डेवलपर' : 'Junior Developer', experience: '0-3 years' },
          { level: language === 'hi' ? 'वरिष्ठ डेवलपर' : 'Senior Developer', experience: '3-6 years' },
          { level: language === 'hi' ? 'टेक लीड' : 'Tech Lead', experience: '6-10 years' },
          { level: language === 'hi' ? 'इंजीनियरिंग मैनेजर' : 'Engineering Manager', experience: '10-15 years' },
          { level: language === 'hi' ? 'सीटीओ' : 'CTO', experience: '15+ years' }
        ],
        topColleges: [
          { name: language === 'hi' ? 'आईआईटी बॉम्बे' : 'IIT Bombay', location: 'Mumbai', ranking: 'Top 1' },
          { name: language === 'hi' ? 'आईआईटी दिल्ली' : 'IIT Delhi', location: 'Delhi', ranking: 'Top 2' },
          { name: language === 'hi' ? 'आईआईटी मद्रास' : 'IIT Madras', location: 'Chennai', ranking: 'Top 3' },
          { name: language === 'hi' ? 'बिट्स पिलानी' : 'BITS Pilani', location: 'Pilani', ranking: 'Top 5' }
        ]
      },
      'Doctor': {
        title: language === 'hi' ? 'डॉक्टर' : 'Doctor',
        icon: <FaHospital className="text-primary" />,
        description: language === 'hi' ? 'डॉक्टर बीमारियों, चोटों और रोगों का निदान और उपचार करते हैं। वे आवश्यक स्वास्थ्य देखभाल पेशेवर हैं।' : 'Doctors diagnose and treat illnesses, injuries, and diseases. They are essential healthcare professionals.',
        growthPotential: language === 'hi' ? 'बहुत उच्च' : 'Very High',
        demandLevel: language === 'hi' ? 'बहुत उच्च' : 'Very High',
        steps: [
          { step: 1, title: language === 'hi' ? '12वीं कक्षा पूरी करें' : 'Complete 12th Standard', description: language === 'hi' ? 'भौतिकी, रसायन विज्ञान और जीव विज्ञान के साथ अपनी 12वीं कक्षा पूरी करें' : 'Complete your 12th standard with Physics, Chemistry, and Biology', duration: language === 'hi' ? '2 वर्ष' : '2 Years', tips: language === 'hi' ? ['जीव विज्ञान पर ध्यान दें', 'सहानुभूति विकसित करें', 'स्वास्थ्य देखभाल सेटिंग्स में स्वयंसेवा करें'] : ['Focus on biology', 'Develop empathy', 'Volunteer in healthcare settings'] },
          { step: 2, title: language === 'hi' ? 'नीट परीक्षा उत्तीर्ण करें' : 'Clear NEET Exam', description: language === 'hi' ? 'नीट (राष्ट्रीय पात्रता सह प्रवेश परीक्षा) पास करें' : 'Qualify NEET (National Eligibility cum Entrance Test)', duration: language === 'hi' ? '1 वर्ष' : '1 Year', tips: language === 'hi' ? ['NCERT को अच्छी तरह समझें', 'पिछले पेपर्स हल करें', 'मॉक टेस्ट दें'] : ['Understand NCERT thoroughly', 'Solve previous papers', 'Take mock tests'] },
          { step: 3, title: language === 'hi' ? 'एमबीबीएस पूरा करें' : 'Complete MBBS', description: language === 'hi' ? 'एमबीबीएस (बैचलर ऑफ मेडिसिन और बैचलर ऑफ सर्जरी) करें' : 'Pursue MBBS (Bachelor of Medicine and Bachelor of Surgery)', duration: language === 'hi' ? '5.5 वर्ष' : '5.5 Years', tips: language === 'hi' ? ['पढ़ाई पर ध्यान दें', 'नैदानिक अनुभव प्राप्त करें', 'अच्छे व्यवहार विकसित करें'] : ['Focus on studies', 'Gain clinical experience', 'Develop bedside manners'] },
          { step: 4, title: language === 'hi' ? 'इंटर्नशिप पूरी करें' : 'Complete Internship', description: language === 'hi' ? 'अस्पताल में अनिवार्य इंटर्नशिप पूरी करें' : 'Complete mandatory internship in hospital', duration: language === 'hi' ? '1 वर्ष' : '1 Year', tips: language === 'hi' ? ['पेशेवरों से सीखें', 'वास्तविक मामलों को संभालें', 'रोगी संबंध बनाएं'] : ['Learn from professionals', 'Handle real cases', 'Build patient relationships'] },
          { step: 5, title: language === 'hi' ? 'विशेषज्ञता हासिल करें (वैकल्पिक)' : 'Specialize (Optional)', description: language === 'hi' ? 'विशेषज्ञता के लिए एमडी/एमएस करें' : 'Pursue MD/MS for specialization', duration: language === 'hi' ? '3 वर्ष' : '3 Years', tips: language === 'hi' ? ['विशेषज्ञता बुद्धिमानी से चुनें', 'नीट पीजी पास करें', 'अच्छे अस्पताल में शामिल हों'] : ['Choose specialization wisely', 'Clear NEET PG', 'Join good hospital'] }
        ],
        exams: [
          { name: 'NEET (National Eligibility cum Entrance Test)', eligibility: language === 'hi' ? 'PCB के साथ 12वीं' : '12th with PCB', frequency: language === 'hi' ? 'वर्ष में एक बार' : 'Once a year', difficulty: language === 'hi' ? 'बहुत उच्च' : 'Very High' },
          { name: 'NEET PG', eligibility: language === 'hi' ? 'एमबीबीएस' : 'MBBS', frequency: language === 'hi' ? 'वर्ष में एक बार' : 'Once a year', difficulty: language === 'hi' ? 'बहुत उच्च' : 'Very High' },
          { name: 'AIIMS PG', eligibility: language === 'hi' ? 'एमबीबीएस' : 'MBBS', frequency: language === 'hi' ? 'वर्ष में एक बार' : 'Once a year', difficulty: language === 'hi' ? 'बहुत उच्च' : 'Very High' }
        ],
        skills: language === 'hi'
          ? ['चिकित्सा ज्ञान', 'सहानुभूति', 'संचार कौशल', 'समस्या समाधान', 'निर्णय लेना', 'धैर्य']
          : ['Medical Knowledge', 'Empathy', 'Communication Skills', 'Problem Solving', 'Decision Making', 'Patience'],
        careerPath: [
          { level: language === 'hi' ? 'कनिष्ठ रेजिडेंट' : 'Junior Resident', experience: '0-3 years', salary: '₹10-15 LPA' },
          { level: language === 'hi' ? 'वरिष्ठ रेजिडेंट' : 'Senior Resident', experience: '3-6 years', salary: '₹15-25 LPA' },
          { level: language === 'hi' ? 'कंसल्टेंट' : 'Consultant', experience: '6-10 years', salary: '₹25-40 LPA' },
          { level: language === 'hi' ? 'वरिष्ठ कंसल्टेंट' : 'Senior Consultant', experience: '10-15 years', salary: '₹40-60 LPA' },
          { level: language === 'hi' ? 'विभागाध्यक्ष' : 'Head of Department', experience: '15+ years', salary: '₹60-100 LPA' }
        ],
        topColleges: [
          { name: language === 'hi' ? 'एम्स दिल्ली' : 'AIIMS Delhi', location: 'Delhi', ranking: 'Top 1' },
          { name: language === 'hi' ? 'सीएमसी वेल्लोर' : 'CMC Vellore', location: 'Vellore', ranking: 'Top 3' },
          { name: language === 'hi' ? 'एएफएमसी पुणे' : 'AFMC Pune', location: 'Pune', ranking: 'Top 5' },
          { name: language === 'hi' ? 'मौलाना आज़ाद मेडिकल कॉलेज' : 'Maulana Azad Medical College', location: 'Delhi', ranking: 'Top 10' }
        ]
      }
    };

    return occupations[occupationName] || {
      title: occupationName,
      icon: <FaGraduationCap className="text-primary" />,
      description: `Detailed information about ${occupationName} career path.`,
      salaryRange: 'Varies',
      growthPotential: 'High',
      demandLevel: 'High',
      steps: [
        { step: 1, title: 'Complete 12th Standard', description: 'Complete your 12th standard with good percentage', duration: '2 Years', tips: ['Focus on academics', 'Develop skills'] },
        { step: 2, title: 'Pursue Degree', description: 'Complete relevant bachelor\'s degree', duration: '3-4 Years', tips: ['Choose a good college', 'Build skills'] },
        { step: 3, title: 'Gain Experience', description: 'Gain practical experience through internships', duration: '1-2 Years', tips: ['Learn from professionals', 'Build network'] },
        { step: 4, title: 'Start Career', description: 'Start your professional career', duration: 'Ongoing', tips: ['Apply for jobs', 'Continue learning'] }
      ],
      exams: [],
      skills: ['Communication Skills', 'Problem Solving', 'Teamwork', 'Adaptability'],
      careerPath: [
        { level: 'Entry Level', experience: '0-3 years', salary: 'Varies' },
        { level: 'Mid Level', experience: '3-7 years', salary: 'Varies' },
        { level: 'Senior Level', experience: '7-12 years', salary: 'Varies' },
        { level: 'Leadership', experience: '12+ years', salary: 'Varies' }
      ],
      topColleges: []
    };
  };

  const getLocalizedOccupationName = (name) => {
    const names = {
      'Teacher': language === 'hi' ? 'शिक्षक' : 'Teacher',
      'Lawyer': language === 'hi' ? 'वकील' : 'Lawyer',
      'Software Engineer': language === 'hi' ? 'सॉफ्टवेयर इंजीनियर' : 'Software Engineer',
      'Doctor': language === 'hi' ? 'डॉक्टर' : 'Doctor'
    };
    return names[name] || name;
  };

  const occupationDetails = occupation ? getOccupationDetails(occupation) : null;

   // Get related occupations based on course
   const getRelatedOccupations = () => {
     const allOccupations = ['Teacher', 'Lawyer', 'Software Engineer', 'Doctor'];
     if (!course) {
       return allOccupations.filter(occ => occ !== occupation);
     }
     const courseLower = course.toLowerCase();
     const courseOccupationMap = {
       'mbbs': ['Doctor'],
       'medicine': ['Doctor'],
       'medical': ['Doctor'],
       'b.tech': ['Software Engineer'],
       'b.sc': ['Teacher', 'Software Engineer'],
       'bca': ['Software Engineer'],
       'm.sc': ['Teacher', 'Software Engineer'],
       'engineering': ['Software Engineer'],
       'bba': ['Teacher', 'Lawyer'],
       'b.com': ['Teacher', 'Lawyer'],
       'b com': ['Teacher', 'Lawyer'],
       'ba': ['Teacher', 'Lawyer'],
       'b a': ['Teacher', 'Lawyer'],
       'llb': ['Lawyer'],
       'law': ['Lawyer'],
       'b.ed': ['Teacher'],
       'b ed': ['Teacher'],
       'education': ['Teacher'],
     };
     let related = [];
     for (const [key, occs] of Object.entries(courseOccupationMap)) {
       if (courseLower.includes(key)) {
         related = [...related, ...occs];
       }
     }
     if (related.length === 0) {
       return allOccupations.filter(occ => occ !== occupation);
     }
     return [...new Set(related)].filter(occ => occ !== occupation);
   };

   // Government Exam Details
   const getGovtExamDetails = (examType) => {
     const govtExams = {
       'IIT-JEE': {
         title: language === 'hi' ? 'आईआईटी-जेईई (संयुक्त प्रवेश परीक्षा)' : 'IIT-JEE (Joint Entrance Examination)',
         icon: <FaCog className="text-warning" />,
         description: language === 'hi' ? 'बी.टेक के लिए आईआईटी, एनआईटी और अन्य शीर्ष सरकारी इंजीनियरिंग कॉलेजों में प्रवेश पाने के लिए जेईई क्रैक करें' : 'Crack JEE to get admission in IITs, NITs, and other top government engineering colleges for B.Tech',
         fullPath: language === 'hi' ? '12वीं (PCM) → जेईई मेन → जेईई एडवांस → आईआईटी/एनआईटी/आईआईआईटी में प्रवेश → बी.टेक → कैंपस प्लेसमेंट → शीर्ष कंपनियों में नौकरी' : '12th (PCM) → JEE Main → JEE Advanced → Admission in IIT/NIT/IIIT → B.Tech → Campus Placement → Job in Top Companies',
         steps: [
           { step: 1, title: language === 'hi' ? 'PCM के साथ 12वीं पूरी करें' : 'Complete 12th with PCM', description: language === 'hi' ? 'भौतिकी, रसायन विज्ञान, गणित (PCM) के साथ 12वीं पूरी करें' : 'Complete 12th with Physics, Chemistry, Mathematics (PCM)', duration: language === 'hi' ? '2 वर्ष' : '2 Years', tips: language === 'hi' ? ['NCERT अवधारणाओं पर ध्यान दें', 'संख्यात्मक समस्याओं का अभ्यास करें', 'कोचिंग में शामिल होने पर विचार करें'] : ['Focus on NCERT concepts', 'Practice numerical problems', 'Consider joining coaching'] },
           { step: 2, title: language === 'hi' ? 'जेईई मेन की तैयारी' : 'Prepare for JEE Main', description: language === 'hi' ? 'जेईई मेन के लिए PCM का पूरा पाठ्यक्रम कवर करें' : 'Cover complete syllabus of Physics, Chemistry, Mathematics for JEE Main', duration: language === 'hi' ? '1-2 वर्ष' : '1-2 Years', tips: language === 'hi' ? ['पिछले पेपर्स हल करें', 'मॉक टेस्ट लें', 'गति और सटीकता पर काम करें'] : ['Solve previous papers', 'Take mock tests', 'Work on speed and accuracy'] },
           { step: 3, title: language === 'hi' ? 'जेईई मेन में उपस्थित हों' : 'Appear for JEE Main', description: language === 'hi' ? 'जेईई मेन परीक्षा दें (वर्ष में दो बार आयोजित)' : 'Appear for JEE Main exam (conducted twice a year)', duration: language === 'hi' ? 'परीक्षा सत्र' : 'Exam Season', tips: language === 'hi' ? ['समय का प्रभावी ढंग से प्रबंधन करें', 'पहले आसान प्रश्नों का प्रयास करें', 'शांत रहें'] : ['Manage time effectively', 'Attempt easier questions first', 'Stay calm'] },
           { step: 4, title: language === 'hi' ? 'जेईई एडवांस की तैयारी' : 'Prepare for JEE Advanced', description: language === 'hi' ? 'यदि योग्य हों, तो आईआईटी के लिए जेईई एडवांस की तैयारी करें' : 'If qualified in JEE Main, prepare for JEE Advanced for IITs', duration: language === 'hi' ? '6-12 महीने' : '6-12 Months', tips: language === 'hi' ? ['वैचारिक स्पष्टता पर ध्यान दें', 'उन्नत समस्याओं को हल करें', 'मॉक टेस्ट लें'] : ['Focus on conceptual clarity', 'Solve advanced problems', 'Take mock tests'] },
           { step: 5, title: language === 'hi' ? 'काउंसलिंग में भाग लें' : 'Participate in Counseling', description: language === 'hi' ? 'कॉलेज आवंटन के लिए JoSAA काउंसलिंग में भाग लें' : 'Participate in JoSAA counseling for college allocation', duration: language === 'hi' ? 'परिणाम के बाद' : 'After Results', tips: language === 'hi' ? ['विकल्प सोच-समझकर भरें', 'कॉलेजों पर शोध करें', 'शाखा प्राथमिकताओं पर विचार करें'] : ['Fill choices wisely', 'Research colleges', 'Consider branch preferences'] },
           { step: 6, title: language === 'hi' ? 'बी.टेक पूरा करें' : 'Complete B.Tech', description: language === 'hi' ? 'आवंटित कॉलेज से बी.टेक पूरा करें' : 'Complete B.Tech from allocated college', duration: language === 'hi' ? '4 वर्ष' : '4 Years', tips: language === 'hi' ? ['पढ़ाई पर ध्यान दें', 'इंटर्नशिप करें', 'प्रोजेक्ट बनाएं'] : ['Focus on studies', 'Do internships', 'Build projects'] },
           { step: 7, title: language === 'hi' ? 'कैंपस प्लेसमेंट' : 'Campus Placement', description: language === 'hi' ? 'शीर्ष कंपनियों में कैंपस प्लेसमेंट के लिए उपस्थित हों' : 'Appear for campus placement in top companies', duration: language === 'hi' ? 'अंतिम वर्ष' : 'Final Year', tips: language === 'hi' ? ['बायोडाटा तैयार करें', 'दैनिक अभ्यास करें', 'कई कंपनियों में आवेदन करें'] : ['Prepare resume', 'Practice daily', 'Apply to multiple companies'] }
         ],
         colleges: [
           { name: language === 'hi' ? 'आईआईटी बॉम्बे' : 'IIT Bombay', location: 'Mumbai', ranking: 'Top 1', seats: 'Total ~1000' },
           { name: language === 'hi' ? 'आईआईटी दिल्ली' : 'IIT Delhi', location: 'Delhi', ranking: 'Top 2', seats: 'Total ~900' },
           { name: language === 'hi' ? 'आईआईटी मद्रास' : 'IIT Madras', location: 'Chennai', ranking: 'Top 3', seats: 'Total ~800' },
           { name: language === 'hi' ? 'आईआईटी खड़गपुर' : 'IIT Kharagpur', location: 'Kharagpur', ranking: 'Top 4', seats: 'Total ~900' },
           { name: language === 'hi' ? 'आईआईटी कानपुर' : 'IIT Kanpur', location: 'Kanpur', ranking: 'Top 5', seats: 'Total ~800' },
         ],
         skills: ['Physics', 'Chemistry', 'Mathematics', 'Problem Solving', 'Analytical Thinking', 'Time Management']
       },
       'NEET': {
         title: language === 'hi' ? 'नीट (राष्ट्रीय पात्रता सह प्रवेश परीक्षा)' : 'NEET (National Eligibility cum Entrance Test)',
         icon: <FaHospital className="text-danger" />,
         description: language === 'hi' ? 'एमबीबीएस/बीडीएस के लिए सरकारी मेडिकल कॉलेजों में प्रवेश पाने के लिए नीट पास करें' : 'Crack NEET to get admission in Government Medical Colleges for MBBS/BDS',
         fullPath: language === 'hi' ? '12वीं (PCB) → नीट → सरकारी मेडिकल कॉलेज में प्रवेश → एमबीबीएस → इंटर्नशिप → लाइसेंस → नौकरी/पीजी' : '12th (PCB) → NEET → Admission in Government Medical College → MBBS → Internship → License → Job/PG',
         steps: [
           { step: 1, title: language === 'hi' ? 'PCB के साथ 12वीं पूरी करें' : 'Complete 12th with PCB', description: language === 'hi' ? 'भौतिकी, रसायन विज्ञान, जीव विज्ञान (PCB) के साथ 12वीं पूरी करें' : 'Complete 12th with Physics, Chemistry, Biology (PCB)', duration: language === 'hi' ? '2 वर्ष' : '2 Years', tips: language === 'hi' ? ['जीव विज्ञान पर ध्यान दें', 'NCERT को अच्छी तरह समझें', 'आरेखों का अभ्यास करें'] : ['Focus on biology', 'Understand NCERT thoroughly', 'Practice diagrams'] },
           { step: 2, title: language === 'hi' ? 'नीट की तैयारी' : 'Prepare for NEET', description: language === 'hi' ? 'नीट के लिए PCB का पूरा पाठ्यक्रम कवर करें' : 'Cover complete syllabus of PCB for NEET', duration: language === 'hi' ? '1-2 वर्ष' : '1-2 Years', tips: language === 'hi' ? ['NCERT किताबें पढ़ें', 'पिछले पेपर्स हल करें', 'मॉक टेस्ट लें'] : ['Study NCERT books', 'Solve previous papers', 'Take mock tests'] },
           { step: 3, title: language === 'hi' ? 'नीट में उपस्थित हों' : 'Appear for NEET', description: language === 'hi' ? 'नीट परीक्षा दें (वर्ष में एक बार आयोजित)' : 'Appear for NEET exam (conducted once a year)', duration: language === 'hi' ? 'परीक्षा सत्र' : 'Exam Season', tips: language === 'hi' ? ['समय प्रबंधन', 'सटीकता बनाए रखें', 'शांत रहें'] : ['Manage time', 'Maintain accuracy', 'Stay calm'] },
           { step: 4, title: language === 'hi' ? 'काउंसलिंग में भाग लें' : 'Participate in Counseling', description: language === 'hi' ? 'कॉलेज आवंटन के लिए ऑल इंडिया कोटा काउंसलिंग में भाग लें' : 'Participate in All India Quota counseling for college allocation', duration: language === 'hi' ? 'परिणाम के बाद' : 'After Results', tips: language === 'hi' ? ['विकल्प बुद्धिमानी से भरें', 'कॉलेजों पर शोध करें', 'स्थान पर विचार करें'] : ['Fill choices wisely', 'Research colleges', 'Consider location'] },
           { step: 5, title: language === 'hi' ? 'एमबीबीएस पूरा करें' : 'Complete MBBS', description: language === 'hi' ? 'एमबीबीएस कोर्स पूरा करें (इंटर्नशिप सहित 5.5 वर्ष)' : 'Complete MBBS course (5.5 years including internship)', duration: language === 'hi' ? '5.5 वर्ष' : '5.5 Years', tips: language === 'hi' ? ['पढ़ाई पर ध्यान दें', 'नैदानिक अनुभव प्राप्त करें', 'कौशल विकसित करें'] : ['Focus on studies', 'Gain clinical experience', 'Build skills'] },
           { step: 6, title: language === 'hi' ? 'इंटर्नशिप पूरी करें' : 'Complete Internship', description: language === 'hi' ? 'अस्पताल में अनिवार्य इंटर्नशिप पूरी करें' : 'Complete mandatory internship in hospital', duration: language === 'hi' ? '1 वर्ष' : '1 Year', tips: language === 'hi' ? ['पेशेवरों से सीखें', 'वास्तविक मामलों को संभालें', 'रोगी संबंध बनाएं'] : ['Learn from professionals', 'Handle real cases', 'Build patient relationships'] },
           { step: 7, title: language === 'hi' ? 'करियर शुरू करें' : 'Start Career', description: language === 'hi' ? 'डॉक्टर के रूप में काम करना शुरू करें या पीजी करें' : 'Start working as doctor or pursue PG', duration: language === 'hi' ? 'जारी' : 'Ongoing', tips: language === 'hi' ? ['मेडिकल लाइसेंस प्राप्त करें', 'नौकरियों के लिए आवेदन करें', 'विशेषज्ञता पर विचार करें'] : ['Get medical license', 'Apply for jobs', 'Consider specialization'] }
         ],
         colleges: [
           { name: language === 'hi' ? 'एम्स दिल्ली' : 'AIIMS Delhi', location: 'Delhi', ranking: 'Top 1', seats: 'Total ~100' },
           { name: language === 'hi' ? 'मौलाना आज़ाद मेडिकल कॉलेज' : 'Maulana Azad Medical College', location: 'Delhi', ranking: 'Top 2', seats: 'Total ~250' },
           { name: language === 'hi' ? 'वीएमएमसी और सफदरजंग अस्पताल' : 'VMMC & Safdarjung Hospital', location: 'Delhi', ranking: 'Top 3', seats: 'Total ~200' },
           { name: language === 'hi' ? 'लेडी हार्डिंग मेडिकल कॉलेज' : 'Lady Hardinge Medical College', location: 'Delhi', ranking: 'Top 10', seats: 'Total ~200' },
         ],
         skills: ['Biology', 'Physics', 'Chemistry', 'Medical Knowledge', 'Empathy', 'Communication Skills']
       },
       'UPSC': {
         title: language === 'hi' ? 'यूपीएससी (संघ लोक सेवा आयोग)' : 'UPSC (Union Public Service Commission)',
         icon: <FaLandmark className="text-primary" />,
         description: language === 'hi' ? 'आईएएस, आईपीएस, आईएफएस और अन्य ग्रुप ए सेवाओं में शामिल होने के लिए सिविल सेवा परीक्षा पास करें' : 'Crack Civil Services Exam to become IAS, IPS, IFS and other Group A services',
         fullPath: language === 'hi' ? 'स्नातक → यूपीएससी सीएसई (प्री+मेंस+इंटरव्यू) → आईएएस/आईपीएस/आईएफएस → सेवा' : 'Graduate → UPSC CSE (Pre+Mains+Interview) → IAS/IPS/IFS → Service',
         steps: [
           { step: 1, title: language === 'hi' ? 'स्नातक पूरा करें' : 'Complete Graduation', description: language === 'hi' ? 'किसी भी विषय में स्नातक पूरा करें' : 'Complete graduation in any stream', duration: language === 'hi' ? '3 वर्ष' : '3 Years', tips: language === 'hi' ? ['रुचिकर विषय चुनें', 'नियमित रूप से समाचार पत्र पढ़ें', 'विश्लेषणात्मक कौशल विकसित करें'] : ['Choose interesting subjects', 'Read newspapers regularly', 'Develop analytical skills'] },
           { step: 2, title: language === 'hi' ? 'बुनियादी तैयारी' : 'Basic Preparation', description: language === 'hi' ? 'बुनियादी तैयारी शुरू करें - NCERT और बुनियादी किताबें पढ़ें' : 'Start basic preparation - read NCERTs, basic books', duration: language === 'hi' ? '6-12 महीने' : '6-12 Months', tips: language === 'hi' ? ['NCERT बुनियादी बातों से शुरू करें', 'समसामयिक मामलों पर ध्यान दें', 'उत्तर लेखन का अभ्यास करें'] : ['Start with NCERT basics', 'Focus on current affairs', 'Practice answer writing'] },
           { step: 3, title: language === 'hi' ? 'गहन तैयारी' : 'Deep Preparation', description: language === 'hi' ? 'सभी विषयों के लिए गहन तैयारी' : 'Deep preparation for all subjects', duration: language === 'hi' ? '1-2 वर्ष' : '1-2 Years', tips: language === 'hi' ? ['मानक किताबें पढ़ें', 'उत्तर लेखन का अभ्यास करें', 'टेस्ट सीरीज जॉइन करें'] : ['Read standard books', 'Practice answer writing', 'Join test series'] },
           { step: 4, title: language === 'hi' ? 'यूपीएससी प्रीलिम्स' : 'Appear for UPSC Prelims', description: language === 'hi' ? 'यूपीएससी प्रीलिम्स (CSAT + GS) दें' : 'Appear for UPSC Prelims (CSAT + GS)', duration: language === 'hi' ? 'परीक्षा सत्र' : 'Exam Season', tips: language === 'hi' ? ['कटऑफ पास करें', 'समय का सही प्रबंधन करें', 'केंद्रित रहें'] : ['Clear cutoff', 'Manage time well', 'Stay focused'] },
           { step: 5, title: language === 'hi' ? 'यूपीएससी मेंस' : 'Appear for UPSC Mains', description: language === 'hi' ? 'यूपीएससी मेंस परीक्षा (9 पेपर) दें' : 'Appear for UPSC Mains (9 papers)', duration: language === 'hi' ? 'परीक्षा सत्र' : 'Exam Season', tips: language === 'hi' ? ['उत्तरों को सही ढंग से संरेखित करें', 'साफ-सुथरा लिखें', 'समय का ध्यान रखें'] : ['Structure answers properly', 'Write neatly', 'Manage time'] },
           { step: 6, title: language === 'hi' ? 'साक्षात्कार' : 'Interview', description: language === 'hi' ? 'व्यक्तित्व परीक्षण/साक्षात्कार में शामिल हों' : 'Appear for Personality Test/Interview', duration: language === 'hi' ? '30-45 मिनट' : '30-45 Minutes', tips: language === 'hi' ? ['आत्मविश्वासी बनें', 'समसामयिक मामलों पर अपडेट रहें', 'ईमानदार रहें'] : ['Be confident', 'Stay updated on current affairs', 'Be honest'] },
           { step: 7, title: language === 'hi' ? 'सेवा आवंटन' : 'Service Allocation', description: language === 'hi' ? 'रैंक के आधार पर सेवा प्राप्त करें' : 'Get allocated to service based on rank', duration: language === 'hi' ? 'परिणाम के बाद' : 'After Result', tips: language === 'hi' ? ['सेवा प्राथमिकताएं भरें', 'अपडेट रहें', 'प्रशिक्षण पूरा करें'] : ['Fill service preferences', 'Stay updated', 'Complete training'] }
         ],
         skills: ['Current Affairs', 'Analytical Skills', 'Communication', 'Leadership', 'Decision Making', 'Time Management']
       },
       'SSC': {
         title: language === 'hi' ? 'एसएससी (कर्मचारी चयन आयोग)' : 'SSC (Staff Selection Commission)',
         icon: <FaUserShield className="text-success" />,
         description: language === 'hi' ? 'ग्रुप बी और सी सरकारी नौकरियां पाने के लिए एसएससी परीक्षा पास करें' : 'Crack SSC exams to get Group B and C government jobs',
         fullPath: language === 'hi' ? '12वीं/स्नातक → एसएससी परीक्षा → दस्तावेज सत्यापन → नियुक्ति' : '12th/Graduate → SSC Exams → Document Verification → Joining',
         steps: [
           { step: 1, title: language === 'hi' ? 'पात्रता जांचें' : 'Check Eligibility', description: language === 'hi' ? 'एसएससी परीक्षा के लिए पात्रता जांचें' : 'Check eligibility for SSC exams (10th/12th/Graduate as per exam)', duration: language === 'hi' ? 'परीक्षा से पहले' : 'Before Exam', tips: language === 'hi' ? ['पात्रता मानदंड जांचें', 'सही परीक्षा चुनें', 'आयु सीमा सत्यापित करें'] : ['Check eligibility criteria', 'Choose correct exam', 'Verify age limit'] },
           { step: 2, title: language === 'hi' ? 'बुनियादी तैयारी' : 'Basic Preparation', description: language === 'hi' ? 'अंग्रेजी, गणित, रीजनिंग, जीके के साथ तैयारी शुरू करें' : 'Start preparation with basics of English, Math, Reasoning, GK', duration: language === 'hi' ? '3-6 महीने' : '3-6 Months', tips: language === 'hi' ? ['NCERT बुनियादी बातों से शुरू करें', 'दैनिक अभ्यास करें', 'सूत्र सीखें'] : ['Start with NCERT basics', 'Practice daily', 'Learn formulas'] },
           { step: 3, title: language === 'hi' ? 'गहन तैयारी' : 'Deep Preparation', description: language === 'hi' ? 'सभी वर्गों के लिए गहन तैयारी' : 'Deep preparation for all sections', duration: language === 'hi' ? '6-12 महीने' : '6-12 Months', tips: language === 'hi' ? ['पिछले पेपर्स हल करें', 'मॉक टेस्ट लें', 'कमजोर क्षेत्रों की पहचान करें'] : ['Solve previous papers', 'Take mock tests', 'Identify weak areas'] },
           { step: 4, title: language === 'hi' ? 'टियर 1 परीक्षा' : 'Appear for Tier 1', description: language === 'hi' ? 'CBT परीक्षा (वस्तुनिष्ठ) दें' : 'Appear for CBT exam (Objective)', duration: language === 'hi' ? 'परीक्षा सत्र' : 'Exam Season', tips: language === 'hi' ? ['कटऑफ पास करें', 'समय प्रबंधन', 'सभी प्रश्नों का प्रयास करें'] : ['Clear cutoff', 'Manage time', 'Attempt all questions'] },
           { step: 5, title: language === 'hi' ? 'टियर 2 और स्किल टेस्ट' : 'Appear for Tier 2', description: language === 'hi' ? 'वर्णनात्मक/टाइपिंग टेस्ट दें' : 'Appear for Descriptive/Typing test', duration: language === 'hi' ? 'टियर 1 के बाद' : 'After Tier 1', tips: language === 'hi' ? ['टाइपिंग का अभ्यास करें', 'निबंध लिखें', 'अंग्रेजी/हिंदी का अभ्यास करें'] : ['Practice typing', 'Write essays', 'Practice English/Hindi'] },
           { step: 6, title: language === 'hi' ? 'दस्तावेज सत्यापन' : 'Document Verification', description: language === 'hi' ? 'सत्यापन के लिए दस्तावेज जमा करें' : 'Submit documents for verification', duration: language === 'hi' ? 'टियर 2 के बाद' : 'After Tier 2', tips: language === 'hi' ? ['दस्तावेज तैयार रखें', 'विवरण सत्यापित करें', 'मूल प्रतियां साथ ले जाएं'] : ['Keep documents ready', 'Verify details', 'Carry originals'] },
           { step: 7, title: language === 'hi' ? 'नियुक्ति' : 'Joining', description: language === 'hi' ? 'नियुक्ति पत्र प्राप्त करें और विभाग में शामिल हों' : 'Get joining letter and join department', duration: language === 'hi' ? 'सत्यापन के बाद' : 'After DV', tips: language === 'hi' ? ['आधिकारिक वेबसाइट देखें', 'समय पर रिपोर्ट करें', 'औपचारिकताएं पूरी करें'] : ['Check official website', 'Report on time', 'Complete formalities'] }
         ],
         skills: ['Quantitative Aptitude', 'English', 'General Awareness', 'Reasoning', 'Computer Knowledge', 'Time Management']
       },
       'Banking': {
         title: language === 'hi' ? 'बैंकिंग परीक्षा (IBPS/SBI)' : 'Banking Exams (IBPS/SBI)',
         icon: <FaMoneyBillWave className="text-success" />,
         description: language === 'hi' ? 'सार्वजनिक क्षेत्र के बैंकों में अधिकारी/क्लर्क पद पाने के लिए बैंकिंग परीक्षा पास करें' : 'Crack Banking exams to get Officer/Clerk positions in Public Sector Banks',
         fullPath: language === 'hi' ? 'स्नातक → पीओ/क्लर्क परीक्षा → जीडी/इंटरव्यू → बैंक में नियुक्ति' : 'Graduate → PO/Clerk Exam → GD/Interview → Appointment in Bank',
         steps: [
           { step: 1, title: language === 'hi' ? 'स्नातक पूरा करें' : 'Complete Graduation', description: language === 'hi' ? 'किसी भी विषय में स्नातक पूरा करें' : 'Complete graduation in any stream', duration: language === 'hi' ? '3 वर्ष' : '3 Years', tips: language === 'hi' ? ['अच्छा प्रतिशत बनाए रखें', 'बैंकिंग समाचारों पर अपडेट रहें', 'वित्तीय समाचार पढ़ें'] : ['Maintain good percentage', 'Stay updated on banking news', 'Read financial news'] },
           { step: 2, title: language === 'hi' ? 'पात्रता जांचें' : 'Check Eligibility', description: language === 'hi' ? 'बैंकिंग परीक्षाओं के लिए पात्रता जांचें' : 'Check eligibility for Banking exams', duration: language === 'hi' ? 'परीक्षा से पहले' : 'Before Exam', tips: language === 'hi' ? ['आयु सीमा जांचें', 'आवश्यक प्रतिशत सत्यापित करें', 'राष्ट्रीयता की पुष्टि करें'] : ['Check age limit', 'Verify required percentage', 'Confirm nationality'] },
           { step: 3, title: language === 'hi' ? 'बुनियादी तैयारी' : 'Basic Preparation', description: language === 'hi' ? 'क्वांट, रीजनिंग, अंग्रेजी, जीए के साथ तैयारी शुरू करें' : 'Start preparation with basics of Quant, Reasoning, English, GA', duration: language === 'hi' ? '3-6 महीने' : '3-6 Months', tips: language === 'hi' ? ['सूत्र सीखें', 'तालिकाओं का अभ्यास करें', 'समाचार पत्र पढ़ें'] : ['Learn formulas', 'Practice tables', 'Read newspapers'] },
           { step: 4, title: language === 'hi' ? 'प्रारंभिक परीक्षा' : 'Appear for Preliminary', description: language === 'hi' ? 'प्रीलिम्स (क्वांट, रीजनिंग, अंग्रेजी) दें' : 'Appear for Prelims (Quant, Reasoning, English)', duration: language === 'hi' ? 'परीक्षा सत्र' : 'Exam Season', tips: language === 'hi' ? ['कटऑफ पास करें', 'समय प्रबंधन', 'सटीकता बनाए रखें'] : ['Clear cutoff', 'Manage time', 'Maintain accuracy'] },
           { step: 5, title: language === 'hi' ? 'मेंस परीक्षा' : 'Appear for Mains', description: language === 'hi' ? 'मेंस परीक्षा (सभी खंड + कंप्यूटर) दें' : 'Appear for Mains (All sections + Computer)', duration: language === 'hi' ? 'प्रीलिम्स के बाद' : 'After Prelims', tips: language === 'hi' ? ['गहन अध्ययन करें', 'मॉक टेस्ट लें', 'गति सुधारें'] : ['Study thoroughly', 'Take mock tests', 'Improve speed'] },
           { step: 6, title: 'Group Discussion', description: 'Appear for Group Discussion', duration: 'After Mains', tips: ['Read current topics', 'Form opinions', 'Be polite'] },
           { step: 7, title: 'Personal Interview', description: 'Appear for Personal Interview', duration: 'After GD', tips: ['Be confident', 'Know about bank', 'Dress formally'] },
           { step: 8, title: 'Joining', description: 'Get joining and become PO/Clerk', duration: 'After Result', tips: ['Check website', 'Report on time', 'Complete training'] }
         ],
         skills: ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness', 'Computer Knowledge', 'Communication']
       },
       'Railway': {
         title: language === 'hi' ? 'रेलवे परीक्षा (RRB)' : 'Railway Exams (RRB)',
         icon: <FaTrain className="text-warning" />,
         description: language === 'hi' ? 'भारतीय रेलवे (ग्रुप सी/डी) में नौकरी पाने के लिए आरआरबी परीक्षा पास करें' : 'Crack RRB exams to get jobs in Indian Railways (Group C/D)',
         fullPath: language === 'hi' ? '12वीं/स्नातक → आरआरबी परीक्षा → दस्तावेज सत्यापन → नियुक्ति' : '12th/Graduate → RRB Exam → Document Verification → Joining',
         steps: [
           { step: 1, title: language === 'hi' ? 'पात्रता जांचें' : 'Check Eligibility', description: language === 'hi' ? 'आरआरबी परीक्षाओं के लिए पात्रता जांचें' : 'Check eligibility for RRB exams (10th/12th/Graduate)', duration: language === 'hi' ? 'परीक्षा से पहले' : 'Before Exam', tips: language === 'hi' ? ['अधिसूचना जांचें', 'आयु सीमा सत्यापित करें', 'योग्यता की पुष्टि करें'] : ['Check notification', 'Verify age limit', 'Confirm qualification'] },
           { step: 2, title: language === 'hi' ? 'बुनियादी तैयारी' : 'Basic Preparation', description: language === 'hi' ? 'बुनियादी बातों के साथ तैयारी शुरू करें' : 'Start preparation with basics', duration: language === 'hi' ? '2-3 महीने' : '2-3 Months', tips: language === 'hi' ? ['NCERT पढ़ें', 'गणित का अभ्यास करें', 'रीजनिंग पर काम करें'] : ['Study NCERT', 'Practice math', 'Work on reasoning'] },
           { step: 3, title: language === 'hi' ? 'गहन तैयारी' : 'Deep Preparation', description: language === 'hi' ? 'सभी विषयों की अच्छी तैयारी करें' : 'Prepare for all subjects thoroughly', duration: language === 'hi' ? '6-12 महीने' : '6-12 Months', tips: language === 'hi' ? ['पिछले पेपर्स हल करें', 'मॉक टेस्ट लें', 'कमजोर क्षेत्रों में सुधार करें'] : ['Solve previous papers', 'Take mock tests', 'Improve weak areas'] },
           { step: 4, title: language === 'hi' ? 'CBT में उपस्थित हों' : 'Appear for CBT', description: language === 'hi' ? 'कंप्यूटर आधारित टेस्ट दें' : 'Appear for Computer Based Test', duration: language === 'hi' ? 'परीक्षा सत्र' : 'Exam Season', tips: language === 'hi' ? ['कटऑफ पास करें', 'समय प्रबंधन', 'सटीकता बनाए रखें'] : ['Clear cutoff', 'Manage time', 'Maintain accuracy'] },
           { step: 5, title: language === 'hi' ? 'स्किल टेस्ट' : 'Skill Test (if applicable)', description: language === 'hi' ? 'टाइपिंग/दस्तावेज सत्यापन के लिए उपस्थित हों' : 'Appear for Typing/Document verification', duration: language === 'hi' ? 'CBT के बाद' : 'After CBT', tips: language === 'hi' ? ['टाइपिंग का अभ्यास करें', 'दस्तावेज तैयार रखें'] : ['Practice typing', 'Keep documents ready'] },
           { step: 6, title: language === 'hi' ? 'चिकित्सा परीक्षण' : 'Medical Examination', description: language === 'hi' ? 'चिकित्सा परीक्षण पास करें' : 'Clear medical examination', duration: language === 'hi' ? 'स्किल टेस्ट के बाद' : 'After Skill Test', tips: language === 'hi' ? ['चिकित्सा मानक जानें', 'फिट रहें', 'ईमानदार रहें'] : ['Know medical standards', 'Stay fit', 'Be honest'] },
           { step: 7, title: 'Joining', description: 'Get joining and join Railway', duration: 'After Medical', tips: ['Check website', 'Report on time', 'Complete training'] }
         ],
         skills: ['Mathematics', 'General Intelligence', 'Reasoning', 'General Awareness', 'Basic English', 'Physical Fitness']
       },
       'StatePSC': {
         title: language === 'hi' ? 'राज्य पीएससी परीक्षा' : 'State PSC Exams',
         icon: <FaFlag className="text-info" />,
         description: language === 'hi' ? 'राज्य सरकार की नौकरियां पाने के लिए राज्य पीएससी परीक्षा पास करें' : 'Crack State PSC exams to get state government jobs',
         fullPath: language === 'hi' ? 'स्नातक → राज्य पीएससी परीक्षा → साक्षात्कार → नियुक्ति' : 'Graduate → State PSC Exam → Interview → Joining',
         steps: [
           { step: 1, title: language === 'hi' ? 'स्नातक पूरा करें' : 'Complete Graduation', description: language === 'hi' ? 'किसी भी विषय में स्नातक पूरा करें' : 'Complete graduation in any stream', duration: language === 'hi' ? '3 वर्ष' : '3 Years', tips: language === 'hi' ? ['रणनीतिक अध्ययन करें', 'राज्य-विशिष्ट ज्ञान प्राप्त करें', 'अपडेट रहें'] : ['Study strategically', 'Gain state-specific knowledge', 'Stay updated'] },
           { step: 2, title: language === 'hi' ? 'राज्य PSC अधिसूचना' : 'Check State PSC Notification', description: language === 'hi' ? 'अपने राज्य की PSC अधिसूचना जांचें' : 'Check notification for your state PSC exam', duration: language === 'hi' ? 'जब अधिसूचित हो' : 'When Notified', tips: language === 'hi' ? ['PSC वेबसाइट देखें', 'पात्रता जांचें', 'परीक्षा पैटर्न जानें'] : ['Visit PSC website', 'Check eligibility', 'Know exam pattern'] },
           { step: 3, title: language === 'hi' ? 'प्रारंभिक तैयारी' : 'Prepare for Preliminary', description: language === 'hi' ? 'प्रारंभिक परीक्षा (यदि लागू हो) की तैयारी करें' : 'Prepare for Preliminary exam (if applicable)', duration: language === 'hi' ? '3-6 महीने' : '3-6 Months', tips: language === 'hi' ? ['राज्य पाठ्यक्रम पढ़ें', 'पिछले पेपर्स हल करें', 'मॉक टेस्ट लें'] : ['Study state syllabus', 'Solve previous papers', 'Take mock tests'] },
           { step: 4, title: language === 'hi' ? 'मेंस की तैयारी' : 'Prepare for Mains', description: language === 'hi' ? 'मुख्य परीक्षा की तैयारी करें' : 'Prepare for Mains exam', duration: language === 'hi' ? '6-12 महीने' : '6-12 Months', tips: language === 'hi' ? ['राज्य-विशिष्ट विषयों पर ध्यान दें', 'उत्तर लेखन का अभ्यास करें', 'राज्य के मुद्दों का अध्ययन करें'] : ['Focus on state-specific topics', 'Practice answer writing', 'Study state issues'] },
           { step: 5, title: language === 'hi' ? 'साक्षात्कार' : 'Interview', description: language === 'hi' ? 'व्यक्तित्व परीक्षण दें' : 'Appear for Personality Test', duration: language === 'hi' ? 'मेंस के बाद' : 'After Mains', tips: language === 'hi' ? ['अपने राज्य को जानें', 'आत्मविश्वासी बनें', 'राज्य के मुद्दों पर अपडेट रहें'] : ['Know your state', 'Be confident', 'Stay updated on state issues'] },
           { step: 6, title: language === 'hi' ? 'नियुक्ति' : 'Joining', description: language === 'hi' ? 'राज्य विभाग में शामिल हों' : 'Get joining in state department', duration: language === 'hi' ? 'परिणाम के बाद' : 'After Result', tips: language === 'hi' ? ['वेबसाइट जांचें', 'समय पर रिपोर्ट करें', 'औपचारिकताएं पूरी करें'] : ['Check website', 'Report on time', 'Complete formalities'] }
         ],
         skills: ['State-specific Knowledge', 'Current Affairs', 'General Studies', 'Communication', 'Leadership', 'Time Management']
       },
       'NDA': {
         title: language === 'hi' ? 'एनडीए (राष्ट्रीय रक्षा अकादमी)' : 'NDA (National Defense Academy)',
         icon: <FaShieldAlt className="text-primary" />,
         description: language === 'hi' ? 'भारतीय रक्षा बलों (सेना, नौसेना, वायु सेना) में शामिल होने के लिए एनडीए पास करें' : 'Crack NDA to join Indian Defense Forces (Army, Navy, Air Force)',
         fullPath: language === 'hi' ? '12वीं → एनडीए परीक्षा → एसएसबी इंटरव्यू → मेडिकल → नियुक्ति → प्रशिक्षण' : '12th → NDA Exam → SSB Interview → Medical → Joining → Training',
         steps: [
           { step: 1, title: language === 'hi' ? '12वीं पूरी करें' : 'Complete 12th', description: language === 'hi' ? 'किसी भी विषय में 12वीं पूरी करें' : 'Complete 12th in any stream (Science for Air Force/Navy)', duration: language === 'hi' ? '2 वर्ष' : '2 Years', tips: language === 'hi' ? ['फिटनेस पर ध्यान दें', 'पढ़ाई पर केंद्रित रहें', 'रक्षा समाचारों पर अपडेट रहें'] : ['Focus on fitness', 'Stay focused on studies', 'Stay updated on defense news'] },
           { step: 2, title: language === 'hi' ? 'एनडीए के लिए आवेदन करें' : 'Apply for NDA', description: language === 'hi' ? 'अधिसूचना आने पर आवेदन करें' : 'Apply for NDA when notification is out', duration: language === 'hi' ? 'जब अधिसूचित हो' : 'When Notified', tips: language === 'hi' ? ['पात्रता जांचें', 'परीक्षा पैटर्न जानें', 'दस्तावेज तैयार करें'] : ['Check eligibility', 'Know exam pattern', 'Prepare required documents'] },
           { step: 3, title: language === 'hi' ? 'लिखित परीक्षा की तैयारी' : 'Prepare for Written Exam', description: language === 'hi' ? 'गणित और सामान्य योग्यता की तैयारी करें' : 'Prepare for Mathematics and General Ability', duration: language === 'hi' ? '6-12 महीने' : '6-12 Months', tips: language === 'hi' ? ['NCERT पढ़ें', 'पिछले पेपर्स का अभ्यास करें', 'मॉक टेस्ट लें'] : ['Study NCERT', 'Practice previous papers', 'Take mock tests'] },
           { step: 4, title: language === 'hi' ? 'लिखित परीक्षा दें' : 'Appear for Written Exam', description: language === 'hi' ? 'एनडीए की लिखित परीक्षा में बैठें' : 'Appear for NDA written exam', duration: language === 'hi' ? 'परीक्षा सत्र' : 'Exam Season', tips: language === 'hi' ? ['समय प्रबंधन', 'सभी प्रश्नों का प्रयास करें', 'शांत रहें'] : ['Manage time', 'Attempt all questions', 'Stay calm'] },
           { step: 5, title: language === 'hi' ? 'एसएसबी इंटरव्यू' : 'SSB Interview', description: language === 'hi' ? 'एसएसबी (SSB) साक्षात्कार दें' : 'Appear for Services Selection Board (SSB) interview', duration: language === 'hi' ? '5 दिन' : '5 Days', tips: language === 'hi' ? ['आत्मविश्वासी बनें', 'नेतृत्व के गुण दिखाएं', 'स्वाभाविक रहें'] : ['Be confident', 'Show leadership qualities', 'Be natural'] },
           { step: 6, title: language === 'hi' ? 'चिकित्सा परीक्षण' : 'Medical Examination', description: language === 'hi' ? 'चिकित्सा परीक्षण पास करें' : 'Clear medical examination', duration: language === 'hi' ? 'SSB के दौरान' : 'During SSB', tips: language === 'hi' ? ['चिकित्सा मानक जानें', 'फिट रहें', 'ईमानदार रहें'] : ['Know medical standards', 'Stay fit', 'Be honest'] },
           { step: 7, title: language === 'hi' ? 'ट्रेनिंग' : 'Joining & Training', description: language === 'hi' ? 'ट्रेनिंग के लिए एनडीए जॉइन करें' : 'Join NDA for training', duration: language === 'hi' ? '3 वर्ष' : '3 Years', tips: language === 'hi' ? ['अनुशासित रहें', 'प्रशिक्षण पर ध्यान दें', 'भाईचारा बनाएं'] : ['Stay disciplined', 'Focus on training', 'Build camaraderie'] }
         ],
         skills: ['Mathematics', 'General Knowledge', 'English', 'Physical Fitness', 'Leadership', 'Discipline']
       },
       'GATE': {
         title: language === 'hi' ? 'गेट (इंजीनियरिंग में स्नातक योग्यता परीक्षा)' : 'GATE (Graduate Aptitude Test in Engineering)',
         icon: <FaFlask className="text-info" />,
         description: language === 'hi' ? 'एम.टेक या पीएसयू नौकरियों में प्रवेश पाने के लिए गेट पास करें' : 'Crack GATE to get admission in M.Tech or PSU jobs',
         fullPath: language === 'hi' ? 'स्नातक (इंजीनियरिंग) → गेट → एम.टेक/पीएसयू नौकरी' : 'Graduate (Engineering) → GATE → M.Tech/PSU Job',
         steps: [
           { step: 1, title: language === 'hi' ? 'बी.टेक पूरा करें' : 'Complete B.Tech', description: language === 'hi' ? 'अपनी स्ट्रीम में इंजीनियरिंग स्नातक पूरा करें' : 'Complete engineering graduation in your stream', duration: language === 'hi' ? '4 वर्ष' : '4 Years', tips: language === 'hi' ? ['पढ़ाई पर ध्यान दें', 'मजबूत आधार बनाएं', 'बुनियादी बातें सीखें'] : ['Focus on studies', 'Build strong foundation', 'Learn basics'] },
           { step: 2, title: language === 'hi' ? 'पात्रता जांचें' : 'Check Eligibility', description: language === 'hi' ? 'अपनी स्ट्रीम के लिए गेट पात्रता जांचें' : 'Check GATE eligibility for your stream', duration: language === 'hi' ? 'परीक्षा से पहले' : 'Before Exam', tips: language === 'hi' ? ['पात्रता सत्यापित करें', 'प्रासंगिक पेपर जांचें', 'परीक्षा पैटर्न जानें'] : ['Verify GATE eligibility', 'Check relevant paper', 'Know exam pattern'] },
           { step: 3, title: language === 'hi' ? 'गेट सिलेबस' : 'Study GATE Syllabus', description: language === 'hi' ? 'अपनी स्ट्रीम के अनुसार सिलेबस कवर करें' : 'Cover complete syllabus according to your stream', duration: language === 'hi' ? '6-12 महीने' : '6-12 Months', tips: language === 'hi' ? ['सभी अवधारणाएं स्पष्ट करें', 'मानक किताबों का उपयोग करें', 'नोट्स बनाएं'] : ['Clear all concepts', 'Use standard books', 'Make notes'] },
           { step: 4, title: language === 'hi' ? 'गेट की तैयारी' : 'Prepare for GATE', description: language === 'hi' ? 'पिछले पेपर्स हल करें, मॉक टेस्ट लें' : 'Solve previous papers, take mock tests', duration: language === 'hi' ? '6-12 महीने' : '6-12 Months', tips: language === 'hi' ? ['पिछले साल के पेपर हल करें', 'मॉक टेस्ट लें', 'समय प्रबंधन'] : ['Solve previous year papers', 'Take mock tests', 'Manage time'] },
           { step: 5, title: language === 'hi' ? 'गेट में उपस्थित हों' : 'Appear for GATE', description: language === 'hi' ? 'गेट परीक्षा दें' : 'Appear for GATE exam', duration: language === 'hi' ? 'परीक्षा सत्र' : 'Exam Season', tips: language === 'hi' ? ['समय प्रबंधन', 'सटीकता बनाए रखें', 'शांत रहें'] : ['Manage time', 'Maintain accuracy', 'Stay calm'] },
           { step: 6, title: language === 'hi' ? 'गेट काउंसलिंग' : 'GATE Counseling', description: language === 'hi' ? 'COAP/CCMT काउंसलिंग में भाग लें' : 'Participate in COAP/CCMT counseling', duration: language === 'hi' ? 'परिणाम के बाद' : 'After Result', tips: language === 'hi' ? ['विकल्प भरें', 'कॉलेजों पर शोध करें', 'शाखा प्राथमिकताएं सेट करें'] : ['Fill choices', 'Research colleges', 'Set branch preferences'] },
           { step: 7, title: language === 'hi' ? 'एम.टेक पूरा करें' : 'Complete M.Tech', description: language === 'hi' ? 'एम.टेक पूरा करें या पीएसयू में शामिल हों' : 'Complete M.Tech or join PSU', duration: language === 'hi' ? '2 वर्ष' : '2 Years', tips: language === 'hi' ? ['एक क्षेत्र में विशेषज्ञता प्राप्त करें', 'प्रोजेक्ट्स करें', 'नेटवर्क बनाएं'] : ['Specialize in a field', 'Do projects', 'Build network'] }
         ],
         skills: ['Technical Knowledge', 'Problem Solving', 'Analytical Skills', 'Time Management', 'Core Engineering Concepts', 'Mathematics']
       }
     };
     return govtExams[examType] || null;
   };

   const govtExamTypes = ['IIT-JEE', 'NEET', 'UPSC', 'GATE', 'SSC', 'Banking', 'Railway', 'StatePSC', 'NDA'];

   const getFilteredExamTypesByStream = () => {
     if (stream === 'science') {
       return ['IIT-JEE', 'NEET', 'UPSC', 'GATE', 'Banking', 'SSC', 'Railway', 'StatePSC', 'NDA'];
     } else if (stream === 'commerce') {
       return ['UPSC', 'Banking', 'SSC', 'Railway', 'StatePSC', 'NDA'];
     } else if (stream === 'arts') {
       return ['UPSC', 'SSC', 'Banking', 'Railway', 'StatePSC', 'NDA'];
     } else if (stream === 'computer') {
       return ['IIT-JEE', 'NEET', 'UPSC', 'GATE', 'Banking', 'SSC', 'Railway', 'StatePSC', 'NDA'];
     }
     return govtExamTypes;
   };

   const filteredExamTypes = stream ? getFilteredExamTypesByStream() : govtExamTypes;

   // Translation object for UI elements
   const labels = {
     en: {
       noOccupation: "No occupation selected. Please go back and select an occupation.",
       backToGuidance: "Back to Guidance",
       loading: "Loading occupation details...",
       growth: "Growth",
       demand: "Demand",
       salary: "Salary",
       govtExamPrep: "Government Exam Prep",
       careerOpp: "Career Opportunities",
       stepPath: "Step-by-Step Path",
       skillsExams: "Skills & Exams",
       topColleges: "Top Colleges",
       govtPrepDesc: "Select an exam type to see the complete roadmap and details.",
       backToSelection: "Back to Career Selection",
       completePath: "Complete Path:",
       stepByStepPrep: "Step-by-Step Preparation", // UI Header
       completeRoadmap: "Complete Roadmap", // UI Header
       availableCareerOpp: "Available Career Opportunities",
       relatedToCourse: "Related to your course",
       exploreInterests: "Explore different career paths based on your interests:",
       exploreMoreRelated: "Explore More Related Occupations",
       careerProgression: "Career Progression",
       careerPathTitle: "Career Path",
       followSteps: "Follow these steps to build your career:",
       requiredSkills: "Required Skills",
       entranceExams: "Entrance Exams",
       eligibility: "Eligibility",
       frequency: "Frequency",
       difficulty: "Difficulty",
       location: "Location",
       ranking: "Ranking",
       tips: "Tips:",
     },
     hi: {
       noOccupation: "कोई पेशा नहीं चुना गया है। कृपया वापस जाएं और एक पेशा चुनें।",
       backToGuidance: "मार्गदर्शन पर वापस जाएं",
       loading: "पेशे का विवरण लोड हो रहा है...",
       growth: "विकास",
       demand: "मांग",
       salary: "वेतन",
       govtExamPrep: "सरकारी परीक्षा की तैयारी",
       careerOpp: "करियर के अवसर",
       stepPath: "चरण-दर-चरण पथ",
       skillsExams: "कौशल और परीक्षा",
       topColleges: "शीर्ष कॉलेज",
       govtPrepDesc: "पूरा रोडमैप और विवरण देखने के लिए परीक्षा का प्रकार चुनें।",
       backToSelection: "करियर चयन पर वापस जाएं",
       completePath: "पूरा पथ:",
       stepByStepPrep: "चरण-दर-चरण तैयारी", // UI Header
       completeRoadmap: "पूर्ण रोडमैप", // UI Header
       availableCareerOpp: "उपलब्ध करियर के अवसर",
       relatedToCourse: "आपके कोर्स से संबंधित",
       exploreInterests: "अपनी रुचियों के आधार पर विभिन्न करियर पथों का अन्वेषण करें:",
       exploreMoreRelated: "अधिक संबंधित व्यवसायों का अन्वेषण करें",
       careerProgression: "करियर की प्रगति",
       careerPathTitle: "करियर पथ",
       followSteps: "अपना करियर बनाने के लिए इन चरणों का पालन करें:",
       requiredSkills: "आवश्यक कौशल",
       entranceExams: "प्रवेश परीक्षा",
       eligibility: "पात्रता",
       frequency: "आवृत्ति",
       difficulty: "कठिनाई",
       location: "स्थान",
       ranking: "रैंकिंग",
       tips: "सुझाव:",
     }
   };
   const t = labels[language] || labels.en;

   // Update selectedGovtExam when stream or occupation changes
   useEffect(() => {
     const validExamTypes = ['IIT-JEE', 'NEET', 'UPSC', 'SSC', 'Banking', 'Railway', 'StatePSC', 'NDA', 'GATE'];
     if (stream && validExamTypes.includes(stream)) {
       setSelectedGovtExam(stream);
     } else if (occupation) {
       const occupationExamMap = {
         'Teacher': 'UPSC',
         'Doctor': 'NEET',
         'Software Engineer': 'IIT-JEE',
         'Lawyer': 'UPSC'
       };
       const defaultExam = occupationExamMap[occupation] || 'UPSC';
       setSelectedGovtExam(defaultExam);
     }
   }, [stream, occupation]);

  if (!occupation) {
    return (
      <div className="dashboard-container">
        <UserLeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
        <div className="main-content-dash">
          <UserHeader toggleSidebar={toggleSidebar} />
          <Container fluid className="dashboard-box mt-3">
            <Alert variant="warning">
              {t.noOccupation}
            </Alert>
             <Button variant="outline-primary" onClick={() => navigate('/UserNotifications')}>
               <FaArrowLeft className="me-2" />
               {t.backToGuidance}
             </Button>
          </Container>
        </div>
      </div>
    );
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
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">{t.loading}</p>
            </div>
          ) : (
            <>
              {/* Occupation Header */}
              <Row className="mb-4">
                <Col>
                  <Card className="shadow-box">
                    <Card.Body>
                       <div className="d-flex align-items-center">
                         <div className="occupation-icon-large me-4">
                           {occupationDetails.icon}
                         </div>
                         <div className="flex-grow-1">
                           <h2>{occupationDetails.title}</h2>
                           <p className="text-muted mb-2" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>{occupationDetails.description}</p>
                           <div className="header-stats">
                             <div className="stat-item">
                               <FaChartLine className="me-1" /> {t.growth}: {occupationDetails.growthPotential}
                             </div>
                             <div className="stat-item">
                               <FaUsers className="me-1" /> {t.demand}: {occupationDetails.demandLevel}
                             </div>
                           </div>
                         </div>
                       </div>
                    </Card.Body>
                  </Card>
                </Col>
               </Row>

               {/* Tabs Section */}
               <Card className="shadow-box">
                 <Card.Body className="p-4">
                   <Tab.Container id="occupation-tabs" defaultActiveKey={prepType === 'govtJob' || prepType === 'govtCollege' ? 'govt-exams' : 'career-opportunities'}>
                     <Nav variant="tabs" className="mb-4">
                       {(prepType === 'govtJob' || prepType === 'govtCollege') && (
                         <Nav.Item>
                           <Nav.Link eventKey="govt-exams">
                             <FaShieldAlt className="me-2" />
                             {t.govtExamPrep}
                           </Nav.Link>
                         </Nav.Item>
                       )}
                       <Nav.Item>
                         <Nav.Link eventKey="career-opportunities">
                           <FaRocket className="me-2" />
                           {t.careerOpp}
                         </Nav.Link>
                       </Nav.Item>
                       <Nav.Item>
                         <Nav.Link eventKey="step-by-step">
                           <FaClipboardList className="me-2" />
                           {t.stepPath}
                         </Nav.Link>
                       </Nav.Item>
                       <Nav.Item>
                         <Nav.Link eventKey="skills-exams">
                           <FaStar className="me-2" />
                           {t.skillsExams}
                         </Nav.Link>
                       </Nav.Item>
                       <Nav.Item>
                         <Nav.Link eventKey="colleges">
                           <FaUniversity className="me-2" />
                           {t.topColleges}
                         </Nav.Link>
                       </Nav.Item>
                     </Nav>

                     <Tab.Content>
                       {/* Government Exams Tab */}
                       {(prepType === 'govtJob' || prepType === 'govtCollege') && (
                         <Tab.Pane eventKey="govt-exams">
                           <div className="mb-4">
                             <h5 className="mb-3">{t.govtExamPrep}</h5>
                             <p className="text-muted mb-4">
                               {t.govtPrepDesc}
                             </p>
                             <Row>
                               {filteredExamTypes.map((examType, index) => {
                                 const examDetails = getGovtExamDetails(examType);
                                 if (!examDetails) return null;
                                 return (
                                   <Col lg={4} md={6} sm={12} key={index} className="mb-4">
                                     <Card
                                       className="h-100 border exam-card"
                                       style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                       onClick={() => {
                                         setSelectedGovtExam(examType);
                                         setTimeout(() => {
                                           if (examRoadmapRef.current) {
                                             examRoadmapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                           }
                                         }, 100);
                                       }}
                                     >
                                       <Card.Body className="p-3">
                                         <div className="d-flex align-items-center gap-2 mb-2">
                                           <div className="icon-wrapper" style={{
                                             width: '45px', height: '45px', borderRadius: '8px',
                                             display: 'flex', alignItems: 'center', justifyContent: 'center',
                                             background: 'linear-gradient(135deg, #13539d 0%, #1d71ce 100%)',
                                             fontSize: '1.2rem', color: 'white'
                                           }}>
                                             {examDetails.icon}
                                           </div>
                                           <h6 className="mb-0">{examDetails.title}</h6>
                                         </div>
                                         <p className="small text-muted mb-2">
                                           {examDetails.fullPath ? examDetails.fullPath.substring(0, 100) + '...' : ''}
                                         </p>
                                         <div className="d-flex justify-content-between align-items-center">
                                           <Badge bg="info">
                                             <FaChartLine className="me-1" />
                                             {examDetails.growthPotential || 'High'}
                                           </Badge>
                                         </div>
                                       </Card.Body>
                                     </Card>
                                   </Col>
                                 );
                               })}
                             </Row>
                           </div>

                           {selectedGovtExam && getGovtExamDetails(selectedGovtExam) && (
                             <div ref={examRoadmapRef} className="mt-4 pt-4 border-top">
                               <h5 className="mb-3">
                                 {selectedGovtExam} - Complete Roadmap
                               </h5>
                               <Card className="shadow-sm border-0" style={{ borderRadius: '10px' }}>
                                 <Card.Body className="p-4">
                                   <Alert variant="info" className="mb-4">
                                     <FaLightbulb className="me-2" />
                                     <strong>{t.completePath}</strong> {getGovtExamDetails(selectedGovtExam).fullPath}
                                   </Alert>
                                   <p className="text-muted mb-4">{getGovtExamDetails(selectedGovtExam).description}</p>

                                   <h5 className="mb-3">{selectedGovtExam} - {t.completeRoadmap}</h5>
                                   <h6 className="mb-3">{t.stepByStepPrep}</h6>
                                   <Row>
                                     {getGovtExamDetails(selectedGovtExam).steps.map((step, idx) => (
                                       <Col md={6} key={idx}>
                                         <Card className="mb-3 border step-card">
                                           <Card.Body className="p-3">
                                             <div className="d-flex align-items-start gap-3">
                                               <div className="step-number">
                                                 <Badge bg="primary" className="rounded-circle p-3">
                                                   {step.step}
                                                 </Badge>
                                               </div>
                                               <div className="flex-grow-1">
                                                 <h6 className="mb-1">{step.title}</h6>
                                                 <p className="mb-2 fw-bold" style={{ fontSize: '1.1rem' }}>{step.description}</p>
                                                 <Badge bg="info" className="mb-2">{step.duration}</Badge>
                                                 <div className="mt-2">
                                                   <small className="text-muted d-block mb-1">{t.tips}</small>
                                                   <ul className="mb-0 ps-3 tips-list">
                                                     {step.tips.map((tip, tipIdx) => (
                                                       <li key={tipIdx} className="small text-muted">{tip}</li>
                                                     ))}
                                                   </ul>
                                                 </div>
                                               </div>
                                             </div>
                                           </Card.Body>
                                         </Card>
                                       </Col>
                                     ))}
                                   </Row>
                                 </Card.Body>
                               </Card>

                               {getGovtExamDetails(selectedGovtExam).colleges && getGovtExamDetails(selectedGovtExam).colleges.length > 0 && (
                                 <Card className="shadow-sm mb-4 border-0 mt-4" style={{ borderRadius: '10px' }}>
                                   <Card.Header className="bg-white border-0 pt-4 pb-0">
                                     <div className="d-flex align-items-center gap-2">
                                       <FaUniversity className="text-primary" />
                                       <h5 className="mb-0">{t.topColleges}</h5>
                                     </div>
                                   </Card.Header>
                                   <Card.Body className="p-4">
                                     <Row>
                                       {getGovtExamDetails(selectedGovtExam).colleges.map((college, idx) => (
                                         <Col lg={6} md={6} sm={12} key={idx} className="mb-4">
                                           <Card className="h-100 border college-card">
                                             <Card.Body className="p-3">
                                               <div className="d-flex justify-content-between align-items-start">
                                                 <div>
                                                   <h6 className="mb-1">{college.name}</h6>
                                                   <small className="text-muted">
                                                     <FaMapMarkerAlt className="me-1" /> {college.location}
                                                   </small>
                                                 </div>
                                                 <Badge bg="warning">{college.ranking}</Badge>
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
                           )}

                           {!selectedGovtExam && (
                             <Alert variant="info">
                               <FaInfoCircle className="me-2" />
                               Please select an exam type to view details.
                             </Alert>
                           )}
                         </Tab.Pane>
                       )}

                       {/* Career Opportunities Tab */}
                       <Tab.Pane eventKey="career-opportunities">
                         <div className="mb-4">
                           <h5 className="mb-3">{t.availableCareerOpp}</h5>
                           <p className="text-muted mb-4">
                             {course ? `${t.relatedToCourse} (${course}):` : t.exploreInterests}
                           </p>
                           <Row>
                             {getRelatedOccupations().map((occ, index) => {
                               const details = getOccupationDetails(occ);
                               return (
                                 <Col lg={4} md={6} sm={12} key={index} className="mb-4">
                                   <Card
                                     className="h-100 border career-opportunity-card"
                                     style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                     onClick={() => navigate('/OccupationDetails', { state: { occupation: occ, stream, percentage, course } })}
                                   >
                                     <Card.Body className="p-3">
                                       <div className="d-flex align-items-center gap-2 mb-2">
                                         <div className="icon-wrapper">
                                           {details.icon}
                                         </div>
                                         <h6 className="mb-0">{details.title}</h6>
                                       </div>
                                       <p className="small text-muted mb-2">
                                         {details.description.substring(0, 80)}...
                                       </p>
                                       <div className="d-flex justify-content-between align-items-center">
                                         <Badge bg="info">
                                           <FaChartLine className="me-1" />
                                           {details.growthPotential}
                                         </Badge>
                                       </div>
                                     </Card.Body>
                                   </Card>
                                 </Col>
                               );
                             })}
                           </Row>
                         </div>

                         {course && (
                           <div className="mb-4">
                             <h5 className="mb-3">{t.exploreMoreRelated}</h5>
                             <div className="d-flex flex-wrap gap-2">
                               {getRelatedOccupations().map((occ, idx) => (
                                 <Button
                                   key={idx}
                                   variant="outline-primary"
                                   size="sm"
                                   onClick={() => navigate('/OccupationDetails', {
                                     state: { occupation: occ, stream, percentage, course }
                                   })}
                                 >
                                   {getLocalizedOccupationName(occ)}
                                 </Button>
                               ))}
                             </div>
                           </div>
                         )}

                         <div className="mb-4">
                           <h5 className="mb-3">{t.careerProgression}: {occupationDetails.title}</h5>
                           <Row>
                             {occupationDetails.careerPath.map((level, index) => (
                               <Col lg={4} md={6} sm={12} key={index} className="mb-4">
                                 <Card className="h-100 border career-level-card">
                                   <Card.Body className="p-3 text-center">
                                     <div className="icon-wrapper">
                                       <FaTrophy />
                                     </div>
                                     <h6 className="mb-1">{level.level}</h6>
                                     <small className="text-muted d-block">{level.experience}</small>
                                   </Card.Body>
                                 </Card>
                               </Col>
                             ))}
                           </Row>
                         </div>
                       </Tab.Pane>

                       {/* Step-by-Step Guidance Tab */}
                       <Tab.Pane eventKey="step-by-step">
                         <h5 className="mb-3">{t.careerPathTitle}: {occupationDetails.title}</h5>
                         <p className="text-muted mb-4">{t.followSteps}</p>
                         <Row>
                           {occupationDetails.steps.map((step, index) => (
                             <Col lg={6} md={6} sm={12} key={index}>
                               <Card className="mb-3 border step-card">
                                 <Card.Body className="p-3">
                                   <div className="d-flex align-items-start gap-3">
                                     <div className="step-number">
                                       <Badge bg="primary" className="rounded-circle p-3">
                                         {step.step}
                                       </Badge>
                                     </div>
                                     <div className="flex-grow-1">
                                       <h6 className="mb-1">{step.title}</h6>
                                       <p className="mb-2 fw-bold" style={{ fontSize: '1.1rem' }}>{step.description}</p>
                                       <Badge bg="info" className="mb-2">{step.duration}</Badge>
                                       <div className="mt-2">
                                         <small className="text-muted d-block mb-1">{t.tips}</small>
                                         <ul className="mb-0 ps-3 tips-list">
                                           {step.tips.map((tip, idx) => (
                                             <li key={idx} className="small text-muted">{tip}</li>
                                           ))}
                                         </ul>
                                       </div>
                                     </div>
                                   </div>
                                 </Card.Body>
                               </Card>
                             </Col>
                           ))}
                         </Row>
                       </Tab.Pane>

                       {/* Skills & Exams Tab */}
                       <Tab.Pane eventKey="skills-exams">
                         <Row>
                           <Col md={6}>
                             <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                               <Card.Header className="bg-white border-0 pt-4 pb-0">
                                 <div className="d-flex align-items-center gap-2">
                                   <FaStar className="text-warning" />
                                   <h5 className="mb-0">{t.requiredSkills}</h5>
                                 </div>
                               </Card.Header>
                               <Card.Body className="p-4">
                                 <div className="d-flex flex-wrap gap-2">
                                   {occupationDetails.skills.map((skill, index) => (
                                     <Badge key={index} bg="light" text="dark" className="p-2 fs-6" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                       <FaCheckCircle className="me-1 text-success" />
                                       {skill}
                                     </Badge>
                                   ))}
                                 </div>
                               </Card.Body>
                             </Card>
                           </Col>
                           <Col md={6}>
                             {occupationDetails.exams.length > 0 && (
                               <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                                 <Card.Header className="bg-white border-0 pt-4 pb-0">
                                   <div className="d-flex align-items-center gap-2">
                                     <FaClipboardList className="text-info" />
                                     <h5 className="mb-0">{t.entranceExams}</h5>
                                   </div>
                                 </Card.Header>
                                 <Card.Body className="p-4">
                                   {occupationDetails.exams.map((exam, index) => (
                                     <div key={index} className="mb-3 pb-3 border-bottom">
                                       <h6>{exam.name}</h6>
                                       <div className="d-flex flex-wrap gap-2">
                                         <Badge bg="info">{t.eligibility}: {exam.eligibility}</Badge>
                                         <Badge bg="success">{t.frequency}: {exam.frequency}</Badge>
                                         <Badge bg="warning">{t.difficulty}: {exam.difficulty}</Badge>
                                       </div>
                                     </div>
                                   ))}
                                 </Card.Body>
                               </Card>
                             )}
                           </Col>
                         </Row>
                       </Tab.Pane>

                       {/* Top Colleges Tab */}
                       <Tab.Pane eventKey="colleges">
                         {occupationDetails.topColleges.length > 0 && (
                           <Row>
                             {occupationDetails.topColleges.map((college, index) => (
                               <Col md={6} lg={3} key={index} className="mb-4">
                                 <Card className="h-100 border college-card">
                                   <Card.Body className="p-3">
                                     <h6 className="mb-2">{college.name}</h6>
                                     <p className="mb-1 small text-muted">
                                       <FaMapMarkerAlt className="me-1" /> {college.location}
                                     </p>
                                     <Badge bg="success">{college.ranking}</Badge>
                                   </Card.Body>
                                 </Card>
                               </Col>
                             ))}
                           </Row>
                         )}
                       </Tab.Pane>
                     </Tab.Content>
                   </Tab.Container>
                 </Card.Body>
               </Card>

               {/* Back Button */}
               <div className="mt-4 text-left">
                 <Button variant="outline-secondary" size="lg" onClick={() => navigate(-1)}>
                   <FaArrowLeft className="me-2" /> {t.backToSelection}
                 </Button>
               </div>
            </>
          )}
        </Container>
      </div>
    </div>
  );
};

export default OccupationDetails;
