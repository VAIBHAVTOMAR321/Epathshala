import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Modal, Button } from 'react-bootstrap'
import { useLanguage } from '../all_login/LanguageContext'
import '../../assets/css/home.css'
import Logo2 from "../../assets/images/gyandharalogo2.png";
import CompetitiveExams from './CompetitiveExams'
import LMSStudent from "../../assets/images/lms_student.jpeg";

function Home() {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const content = {
    en: {
    platformBadge: "🎓 ePathshala - Educational Platform",
    heroTitle: "Objective of ePathshala",
     heroTitleHTML: "Objective of <span class=\"hero-title-word\">ePathshala</span>",
  heroSubtitle: "Your all-in-one educational ecosystem designed to bridge the gap between academic learning and real-world success. We empower students and institutions with the tools and guidance needed to thrive.",
  heroImg: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
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
      schoolSubtitle: "Transform your institution's learning experience with ePathshala's comprehensive platform",
      schoolFeatures: [
        { icon: "bi-house-check", title: "Institution Registration", desc: "Register your institution and get a dedicated dashboard", color: "blue" },
        { icon: "bi-people-fill", title: "Student Management", desc: "Efficiently manage student registrations and profiles", color: "orange" },
        { icon: "bi-question-circle-fill", title: "Events And Activities", desc: "Create and manage events and activities for your students", color: "green" },
        { icon: "bi-bar-chart-line-fill", title: "Performance Tracking", desc: "Monitor student progress and learning outcomes", color: "purple" }
      ],
      
      // Platform Benefits
      benefitsTitle: "Why Choose ePathshala?",
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
      readyTitle: "Ready to Join ePathshala?",
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
      platformBadge: "🎓 ePathshala - शैक्षिक मंच",
      heroTitle: "ePathshala का उद्देश्य",
      heroTitleHTML: "ePathshala का <span class=\"hero-title-word\">उद्देश्य</span>",
      heroSubtitle: "ePathshala में आपका स्वागत है, आपका ऑल-इन-वन शैक्षिक पारिस्थितिकी तंत्र जो शैक्षणिक शिक्षण और वास्तविक दुनिया की सफलता के बीच की खाई को पाटने के लिए डिज़ाइन किया गया है। हम छात्रों और संस्थानों को आगे बढ़ने के लिए आवश्यक उपकरण और मार्गदर्शन के साथ सशक्त बनाते हैं।",
      heroImg: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
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
      schoolSubtitle: "ePathshala के व्यापक मंच के साथ अपने संस्थान के शिक्षण अनुभव को बदलें",
      schoolFeatures: [
        { icon: "bi-house-check", title: "शैक्षणिक संस्था पंजीकरण", desc: "अपने संस्थान को पंजीकृत करें और समर्पित डैशबोर्ड प्राप्त करें", color: "blue" },
        { icon: "bi-people-fill", title: "छात्र प्रबंधन", desc: "छात्र पंजीकरण और प्रोफाइल को कुशलतापूर्वक प्रबंधित करें", color: "orange" },
        { icon: "bi-question-circle-fill", title: "प्रश्नोत्तरी निर्माण", desc: "अपने छात्रों के लिए प्रश्नोत्तरी बनाएं और प्रबंधित करें", color: "green" },
        { icon: "bi-bar-chart-line-fill", title: "प्रदर्शन ट्रैकिंग", desc: "छात्र की प्रगति और सीखने के परिणामों की निगरानी करें", color: "purple" }
      ],
      
      // Platform Benefits
      benefitsTitle: "ePathshala को क्यों चुनें?",
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
      readyTitle: "क्या आप ePathshala से जुड़ने के लिए तैयार हैं?",
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
        <section className="new-hero-section">
          <Container>
            <Row className="align-items-center g-5">
              <Col lg={6} className="hero-text-content order-lg-1 order-2">
                <h1 dangerouslySetInnerHTML={{ __html: t.heroTitleHTML }} />
                <p className="hero-subtitle-new">{t.heroSubtitle}</p>
                <div className="hero-features-list">
                  <span><i className="bi bi-check-circle-fill"></i> Interactive Learning</span>
                  <span><i className="bi bi-check-circle-fill"></i> Competitive Exams</span>
                  <span><i className="bi bi-check-circle-fill"></i> Career Guidance</span>
                </div>
                <div className="hero-buttons">
                  <Link to="/register" className="btn-gyandhara btn-primary-custom">
                    <i className="bi bi-person-plus-fill"></i>
                    <span>{t.joinBtn}</span>
                  </Link>
                  <Link
                    to="/CourseItems"
                    className="btn-gyandhara btn-outline-custom-btn"
                    onClick={() => window.scrollTo(0, 0)}>
                    <i className="bi bi-book-fill"></i>
                    <span>{t.exploreBtn}</span>
                  </Link>
                </div>
              </Col>
              <Col lg={6} className="order-lg-2 order-1">
                <div className="hero-image-container-new">
                  <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80" alt="ePathshala for students" className="hero-image-new" />
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Section Separator */}
        <div className="section-separator"></div>

        {/* For Students Section */}
        <section className="role-section-new student-section-new">
          <Row className="align-items-center g-5">
            <Col lg={7}>
              <div className="role-header-new">
                <h2>{t.studentTitle}</h2>
                <p>{t.studentSubtitle}</p>
              </div>
              <Row className="g-3">
                {t.studentFeatures.slice(0, 6).map((feature, index) => (
                  <Col md={6} key={index}>
                    <div className="feature-item-new" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
                      <div className={`feature-icon-new icon-${feature.color}`}>
                        <i className={`bi ${feature.icon}`}></i>
                      </div>
                      <div className="feature-text-new">
                        <h5>{feature.title}</h5>
                        <p>{feature.desc}</p>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>
            <Col lg={5}>
              <div className="role-image-container-new">
                <img src={LMSStudent} alt="student Learning"
                 
                  alt="Students learning" 
                  className="img-fluid rounded-3 shadow-lg"
                />
              </div>
            </Col>
          </Row>
        </section>

        {/* Section Separator */}
        <div className="section-separator separator-flip"></div>

        {/* For Schools Section */}
        <section className="role-section-new school-section-new">
          <Row className="align-items-center g-5">
            <Col lg={5}>
              <div className="role-image-container-new">
                <img src="https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80" alt="Institution" className="img-fluid rounded-3 shadow-lg" />
              </div>
            </Col>
            <Col lg={7}>
              <div className="role-header-new">
                <h2>{t.schoolTitle}</h2>
                <p>{t.schoolSubtitle}</p>
              </div>
              <Row className="g-3">
                {t.schoolFeatures.map((feature, index) => (
                  <Col md={6} key={index}>
                    <div className="feature-item-new" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
                      <div className={`feature-icon-new icon-${feature.color}`}>
                        <i className={`bi ${feature.icon}`}></i>
                      </div>
                      <div className="feature-text-new">
                        <h5>{feature.title}</h5>
                        <p>{feature.desc}</p>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </section>

        {/* Competitive Exams Test Series Section */}
        <CompetitiveExams language={language} />

        {/* Quick Link to Competitive Test */}
        <section className="competitive-cta-section">
          <Row className="g-0">
            <Col md={8}>
              <div className="competitive-cta-content">
                <h3>Ready to test yourself?</h3>
                <p>Take our competitive mock test and assess your preparation.</p>
                <Link to="/Competitive" className="btn-gyandhara btn-primary-custom">
                  <i className="bi bi-pencil-square"></i> Start Test
                </Link>
              </div>
            </Col>
          </Row>
          <div className="competitive-cta-decoration">
            <i className="bi bi-trophy-fill"></i>
          </div>
        </section>

        {/*Why Choose gyandhara? section*/}
        <section className="benefits-section-new why-choose-us-section">
          <div className="role-header-new text-center">
            <h2>{t.benefitsTitle}</h2>
          </div>
          <div className="timeline-container">
            {t.benefits.map((benefit, index) => (
              <div key={index} className="timeline-item" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
                <div className="timeline-icon-wrapper">
                  <div className={`timeline-icon icon-${benefit.color}`}>
                    <i className={`bi ${benefit.icon}`}></i>
                  </div>
                </div>
                <div className="timeline-content">
                  <h5 className="timeline-title">{benefit.title}</h5>
                  <p className="timeline-desc">{benefit.desc}</p>
                </div>
              </div>
            ))}
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