import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Modal, Button } from 'react-bootstrap'
import { useLanguage } from '../all_login/LanguageContext'
import heroImg from "../../assets/images/CBSEimg.png";
import '../../assets/css/home.css'
import Logo2 from "../../assets/images/gyandharalogo2.png";
import CompetitiveExams from './CompetitiveExams'

function Home() {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const content = {
    en: {
    platformBadge: "🎓 Epathshala - Educational Platform",
    heroTitle: "Objective of Epathshala",
     heroTitleHTML: "Objective of <span class=\"hero-title-word\">Epathshala</span>",
  heroSubtitle: "Welcome to Epathshala, your all-in-one educational ecosystem designed to bridge the gap between academic learning and real-world success. We believe that education is not just about passing exams; it is about acquiring the skills, confidence, and direction necessary to thrive in a rapidly evolving global landscape. Whether you are a student looking to master new technologies or a institution aiming to streamline academic management, Epathshala provides the tools you need to succeed.",
  heroImg: heroImg,
  exploreBtn: "Explore Now",
  joinBtn: "Register Today",
      
      // For Students Section
      studentTitle: "LMS For Students 🎓",
      studentSubtitle: "Empower your future with comprehensive career guidance and learning resources",
      studentFeatures: [
        { icon: "bi-book", title: "Course Content", desc: "Access high-quality educational materials and resources", color: "blue" },
        { icon: "bi-trophy-fill", title: "Competitions", desc: "Participate in competitions and showcase your talents", color: "orange" },
        { icon: "bi-journal-check", title: "Career Guidance", desc: "Expert guidance for your academic and career journey", color: "green" },
        { icon: "bi-pencil-square", title: "Quiz & Tests", desc: "Assess your knowledge with interactive quizzes", color: "purple" },
        { icon: "bi-graph-up", title: "Grooming Classes", desc: "Develop professional and soft skills", color: "blue" },
        { icon: "bi-chat-left-quote-fill", title: "Counseling", desc: "Get personalized career counseling from experts", color: "orange" },
        { icon: "bi-bookmark-check", title: "Govt Schemes", desc: "Learn about educational schemes and benefits", color: "green" },
        { icon: "bi-briefcase-fill", title: "Job Opportunities", desc: "Discover career opportunities across various sectors", color: "blue" },
        { icon: "bi-calendar-event", title: "Seminar & Workshop", desc: "Attend training events and skill development workshops", color: "purple" },
        { icon: "bi-camera-video-fill", title: "Live Session", desc: "Join interactive live sessions with experts", color: "orange" }
      ],

      // For Schools Section
      schoolTitle: "LMS For Institutions 🏫",
      schoolSubtitle: "Transform your institution's learning experience with Epathshala's comprehensive platform",
      schoolFeatures: [
        { icon: "bi-house-check", title: "Institution Registration", desc: "Register your institution and get a dedicated dashboard", color: "blue" },
        { icon: "bi-people-fill", title: "Student Management", desc: "Efficiently manage student registrations and profiles", color: "orange" },
        { icon: "bi-question-circle-fill", title: "Events And Activities", desc: "Create and manage events and activities for your students", color: "green" },
        { icon: "bi-bar-chart-line-fill", title: "Performance Tracking", desc: "Monitor student progress and learning outcomes", color: "purple" }
      ],
      
      // Platform Benefits
      benefitsTitle: "Why Choose Epathshala?",
      benefits: [
        { icon: "bi-collection-play", title: "Multi-Role Platform", desc: "Dedicated interfaces for students, institutions, and administrators", color: "blue" },
        { icon: "bi-people-fill", title: "Comprehensive Services", desc: "Career guidance, academic support, and skill development", color: "orange" },
        { icon: "bi-lightbulb", title: "Career Oriented", desc: "Focus on job opportunities and professional growth", color: "green" },
        { icon: "bi-shield-check", title: "Secure & Reliable", desc: "Safe platform for educational and career information", color: "purple" },
        { icon: "bi-book-half", title: "Multiple Courses", desc: "Access a wide range of academic and skill-based courses", color: "blue" },
        { icon: "bi-chat-dots-fill", title: "24/7 Text Support", desc: "Round-the-clock text assistance for all your queries", color: "orange" },
        { icon: "bi-bar-chart-fill", title: "Data Analysis", desc: "Detailed insights and analytics for your learning journey", color: "green" },
        { icon: "bi-award-fill", title: "Rewards & Certification", desc: "Get recognized for your success with verified certificates", color: "purple" }
      ],

      // CTA
      readyTitle: "Ready to Join Epathshala?",
      readySub: "Start your journey towards career excellence and academic success",
      getStartedBtn: "Get Started Today",
      learnMoreBtn: "Learn More",
      signInBtn: "Sign In",
      modalTitle: "Access Restricted",
      modalMessage: "Please login or register for more information and features.",
      modalLogin: "Login",
      modalRegister: "Register Today"
    },
    hi: {
      platformBadge: "🎓 Epathshala - शैक्षिक मंच",
      heroTitle: "Epathshala का उद्देश्य",
      heroTitleHTML: "<span class=\"hero-title-word\">Epathshala</span> का उद्देश्य",
      heroSubtitle: "Epathshala में आपका स्वागत है, आपका ऑल-इन-वन शैक्षिक पारिस्थितिकी तंत्र जो शैक्षणिक शिक्षण और वास्तविक दुनिया की सफलता के बीच की खाई को पाटने के लिए डिज़ाइन किया गया है। हमारा मानना है कि शिक्षा केवल परीक्षा पास करने के बारे में नहीं है; यह एक तेजी से विकसित हो रहे वैश्विक परिदृश्य में उन्नति के लिए आवश्यक कौशल, आत्मविश्वास और दिशा प्राप्त करने के बारे में है। चाहे आप नई तकनीकों में महारत हासिल करने के इच्छुक छात्र हों या शैक्षणिक प्रबंधन को सुव्यवस्थित करने का लक्ष्य रखने वाला शैक्षणिक संस्था, Epathshala आपको सफल होने के लिए आवश्यक उपकरण प्रदान करता है।",
      heroImg: heroImg,
      exploreBtn: "अब खोजें",
      joinBtn: "आज पंजीकृत करें",
      
      // For Students Section
      studentTitle: "छात्रों के लिए 🎓",
      studentSubtitle: "व्यापक करियर मार्गदर्शन और सीखने के संसाधनों से अपने भविष्य को सशक्त बनाएं",
      studentFeatures: [
        { icon: "bi-book", title: "पाठ्यक्रम सामग्री", desc: "उच्च गुणवत्ता वाली शैक्षिक सामग्री और संसाधनों तक पहुंच प्राप्त करें", color: "blue" },
        { icon: "bi-trophy-fill", title: "प्रतियोगिताएं", desc: "प्रतियोगिताओं में भाग लें और प्रतिभा प्रदर्शन करें", color: "orange" },
        { icon: "bi-journal-check", title: "करियर मार्गदर्शन", desc: "आपकी शैक्षणिक और करियर यात्रा के लिए विशेषज्ञ मार्गदर्शन", color: "green" },
        { icon: "bi-pencil-square", title: "प्रश्नोत्तरी और परीक्षण", desc: "प्रश्नोत्तरी के साथ अपना ज्ञान मूल्यांकन करें", color: "purple" },
        { icon: "bi-graph-up", title: "व्यक्तित्व विकास कक्षाएं", desc: "व्यावसायिक और सॉफ्ट स्किल्स विकसित करें", color: "blue" },
        { icon: "bi-chat-left-quote-fill", title: "परामर्श", desc: "विशेषज्ञों से व्यक्तिगत करियर परामर्श प्राप्त करें", color: "orange" },
        { icon: "bi-bookmark-check", title: "सरकारी योजनाएं", desc: "शैक्षिक योजनाओं और लाभों के बारे में जानें", color: "green" },
        { icon: "bi-briefcase-fill", title: "नौकरी के अवसर", desc: "विभिन्न क्षेत्रों में करियर के अवसर खोजें", color: "blue" },
        { icon: "bi-calendar-event", title: "सेमिनार और कार्यशाला", desc: "प्रशिक्षण कार्यक्रमों में भाग लें", color: "purple" },
        { icon: "bi-camera-video-fill", title: "लाइव सेशन", desc: "विशेषज्ञों के साथ इंटरैक्टिव लाइव सत्रों में शामिल हों", color: "orange" }
      ],

      // For Schools Section
      schoolTitle: "शैक्षणिक संस्था के लिए 🏫",
      schoolSubtitle: "Epathshala के व्यापक मंच के साथ अपने संस्थान के शिक्षण अनुभव को बदलें",
      schoolFeatures: [
        { icon: "bi-house-check", title: "शैक्षणिक संस्था पंजीकरण", desc: "अपने संस्थान को पंजीकृत करें और समर्पित डैशबोर्ड प्राप्त करें", color: "blue" },
        { icon: "bi-people-fill", title: "छात्र प्रबंधन", desc: "छात्र पंजीकरण और प्रोफाइल को कुशलतापूर्वक प्रबंधित करें", color: "orange" },
        { icon: "bi-question-circle-fill", title: "प्रश्नोत्तरी निर्माण", desc: "अपने छात्रों के लिए प्रश्नोत्तरी बनाएं और प्रबंधित करें", color: "green" },
        { icon: "bi-bar-chart-line-fill", title: "प्रदर्शन ट्रैकिंग", desc: "छात्र की प्रगति और सीखने के परिणामों की निगरानी करें", color: "purple" }
      ],
      
      // Platform Benefits
      benefitsTitle: "Epathshala को क्यों चुनें?",
      benefits: [
        { icon: "bi-collection-play", title: "बहु-भूमिका मंच", desc: "छात्रों, शैक्षणिक संस्था और प्रशासकों के लिए समर्पित इंटरफेस", color: "blue" },
        { icon: "bi-people-fill", title: "व्यापक सेवाएं", desc: "करियर मार्गदर्शन, शैक्षणिक सहायता और कौशल विकास", color: "orange" },
        { icon: "bi-lightbulb", title: "करियर केंद्रित", desc: "नौकरी के अवसरों और व्यावसायिक वृद्धि पर ध्यान केंद्रित", color: "green" },
        { icon: "bi-shield-check", title: "सुरक्षित और विश्वसनीय", desc: "शैक्षिक और करियर जानकारी के लिए सुरक्षित मंच", color: "purple" },
        { icon: "bi-book-half", title: "एकाधिक पाठ्यक्रम", desc: "शैक्षणिक और कौशल-आधारित पाठ्यक्रमों की विस्तृत श्रृंखला तक पहुँचें", color: "blue" },
        { icon: "bi-chat-dots-fill", title: "24/7 टेक्स्ट सपोर्ट", desc: "आपके सभी प्रश्नों के लिए चौबीसों घंटे टेक्स्ट सहायता", color: "orange" },
        { icon: "bi-bar-chart-fill", title: "डेटा विश्लेषण", desc: "आपकी सीखने की यात्रा के लिए विस्तृत जानकारी और विश्लेषण", color: "green" },
        { icon: "bi-award-fill", title: "पुरस्कार और प्रमाणन", desc: "सत्यापित प्रमाणपत्रों के साथ अपनी सफलता के लिए पहचान प्राप्त करें", color: "purple" }
      ],

      // CTA
      readyTitle: "क्या आप Epathshala से जुड़ने के लिए तैयार हैं?",
      readySub: "करियर की उत्कृष्टता और शैक्षणिक सफलता की ओर अपनी यात्रा शुरू करें",
      getStartedBtn: "आज शुरुआत करें",
      learnMoreBtn: "अधिक जानें",
      signInBtn: "साइन इन करें",
      modalTitle: "पहुंच प्रतिबंधित",
      modalMessage: "अधिक जानकारी और सुविधाओं के लिए कृपया लॉगिन या पंजीकरण करें।",
      modalLogin: "लॉगिन",
      modalRegister: "आज ही पंजीकरण करें"
    }
  }

  const t = content[language] || content.en

  const handleCardClick = () => setShowModal(true)
  const handleClose = () => setShowModal(false)

  return (
    <div className="home-wrapper">
      <div className="home-container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-image-wrapper">
            <div className="hero-decoration hero-cap-decoration">
              <i className="bi bi-mortarboard-fill"></i>
            </div>
            <img src={t.heroImg} alt="Epathshala Education" className="hero-image" />
            <div className="hero-decoration hero-logo-decoration">
              <img src={Logo2} alt="Epathshala Logo" className="hero-logo" />
            </div>
          </div>
          <div className="hero-content">
            <div className="hero-badge">{t.platformBadge}</div>
            <h1 dangerouslySetInnerHTML={{ __html: t.heroTitleHTML }}></h1>
            <p>{t.heroSubtitle}</p>
            <div className="hero-buttons">
              <Link to="/register" className="btn-Epathshala btn-primary-custom">
                <i className="bi bi-person-plus"></i> {t.joinBtn}
              </Link>
              <Link to="/login" className="btn-Epathshala btn-outline-custom-btn">
                <i className="bi bi-box-arrow-in-right"></i> {t.learnMoreBtn}
              </Link>
            </div>
          </div>
        </div>

        {/* For Students Section */}
        <section className="role-section ">
          <div className="role-header">
            <h2>{t.studentTitle}</h2>
            <p>{t.studentSubtitle}</p>
          </div>
          <div className="role-features-grid">
            {t.studentFeatures.map((feature, index) => (
              <div 
                className={`role-feature-card card-${feature.color}`} 
                key={index} 
                onClick={handleCardClick}
                style={{ cursor: 'pointer' }}
              >
                <div className={`role-feature-icon-wrapper icon-${feature.color}`}>
                  <i className={`bi ${feature.icon}`}></i>
                </div>
                <h4>{feature.title}</h4>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* For Schools Section */}
        <section className="role-section-school ">
          <div className="role-header">
            <h2>{t.schoolTitle}</h2>
            <p>{t.schoolSubtitle}</p>
          </div>
          <div className="role-features-grid">
            {t.schoolFeatures.map((feature, index) => (
              <div 
                className={`role-feature-card card-${feature.color}`} 
                key={index} 
                onClick={handleCardClick}
                style={{ cursor: 'pointer' }}
              >
                <div className={`role-feature-icon-wrapper icon-${feature.color}`}>
                  <i className={`bi ${feature.icon}`}></i>
                </div>
                <h4>{feature.title}</h4>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Competitive Exams Test Series Section */}
        <CompetitiveExams language={language} />

        {/* Quick Link to Competitive Test */}
        <section className="competitive-cta-section">
          <div className="competitive-cta-content">
            <h3>Ready to test yourself?</h3>
            <p>Take our competitive mock test and assess your preparation</p>
            <Link to="/Competitive" className="btn-Epathshala btn-primary-custom btn-lg">
              <i className="bi bi-pencil-square"></i> Start  Test
            </Link>
          </div>
        </section>

        {/*Why Choose Epathshala? section*/}
        <section className="benefits-section role-header role-section-school ">
          <div className="role-header">
            <h2>{t.benefitsTitle}</h2>
        
          </div>
            <Row className="g-4">
                {t.benefits.map((benefit, index) => (
                    <Col lg={3} md={6} sm={12} key={index}>
                        <div 
                          className={`benefit-card card-${benefit.color} h-100 border-0 shadow-sm`}
                          onClick={handleCardClick}
                          style={{ cursor: 'pointer' }}
                        >
                            <div className={`benefit-icon icon-${benefit.color}`}>
                                <i className={`bi ${benefit.icon}`}></i>
                            </div>
                            <h4>{benefit.title}</h4>
                            <p>{benefit.desc}</p>
                        </div>
                    </Col>
                ))}
            </Row>
         
        </section>

        {/* Final CTA */}
        <section className="final-cta-section role-section-school">
          <h2>{t.readyTitle}</h2>
          <p>{t.readySub}</p>
        
          <div className="cta-buttons mt-4">
            <Link to="/register" className="btn-Epathshala btn-primary-custom btn-lg">
              <i className="bi bi-rocket-fill"></i> {t.getStartedBtn}
            </Link>
            <Link to="/login" className="btn-Epathshala btn-outline-custom-btn btn-lg">
              <i className="bi bi-box-arrow-in-right"></i> {t.signInBtn}
            </Link>
          </div>
        </section>
      </div>

      {/* Auth Prompt Modal */}
       <Modal show={showModal} onHide={handleClose} centered size="sm">
         <Modal.Header closeButton className="border-0 pb-0">
           <Modal.Title className="fs-5 fw-bold w-100 text-center modal-title-style">{t.modalTitle}</Modal.Title>
         </Modal.Header>
         <Modal.Body className="text-center pt-2">
           <p className="mb-4 text-muted">{t.modalMessage}</p>
           <div className="d-grid gap-2">
              <Button variant="primary" className="rounded-pill py-2" onClick={() => { handleClose(); navigate('/login'); window.scrollTo(0, 0); }}>
                <i className="bi bi-box-arrow-in-right me-2"></i> {t.modalLogin}
              </Button>
             <Button variant="outline-primary" className="rounded-pill py-2" onClick={() => { handleClose(); navigate('/register');window.scrollTo(0, 0); }}>
               <i className="bi bi-person-plus me-2"></i> {t.modalRegister}
             </Button>
           </div>
         </Modal.Body>
       </Modal>
    </div>
  )
}

export default Home