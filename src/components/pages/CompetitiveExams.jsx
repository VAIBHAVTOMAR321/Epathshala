import React from 'react'
import { Row, Col, Modal, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

function CompetitiveExams({ language, filter }) {
  const content = {
    en: {
      title: "Competitive Exam Test Series",
      subtitle: "Prepare for your dream job with our comprehensive test series for all major competitive exams",
      exams: [
        { icon: "bi-journal-text", title: "UPSC", desc: "Civil Services Examination preparation with mock tests and study material", color: "blue", level: "graduation" },
        { icon: "bi-journal-text", title: "UKPSC", desc: "Uttarakhand Provincial Services exam series with practice tests", color: "orange", level: "graduation" },
        {
          icon: "bi-journal-text",
          title: "CHSL",
          desc: "Staff Selection Commission exams CHSL with complete test series",
          color: "green",
          level: "school" // CHSL has 10+2 level exams like CHSL
        },
        {
          icon: "bi-shield-fill",
          title: "Defence (NDA/CDS/AFCAT)",
          desc: "NDA, CDS, AFCAT preparation with subject-wise mock tests", color: "purple"
        },
        { icon: "bi-journal-medical", title: "CAT/MAT/CMAT", desc: "Management entrance exam preparation with mock tests and analysis", color: "blue", level: "graduation" },
        { icon: "bi-building", title: "State Recruitment Exams", desc: "State-wise recruitment exams with comprehensive test series", color: "orange", level: "school" },
        { icon: "bi-mortarboard-fill", title: "Teaching Eligibility Exams", desc: "CTET, UPTET, BEd entrance exam preparation", color: "green", level: "graduation" },
        { icon: "bi-person-badge-fill", title: "Police & Paramilitary", desc: "Police recruitment exams with mock tests", color: "purple" }
      ]
    },
    hi: {
      title: "प्रतियोगी परीक्षा टेस्ट सीरीज़",
      subtitle: "सभी प्रमुख प्रतियोगी परीक्षाओं के लिए हमारी व्यापक टेस्ट सीरीज़ के साथ अपने सपने की नौकरी की तैयारी करें",
      exams: [
        { icon: "bi-journal-text", title: "यूपीएससी", desc: "मॉक टेस्ट और स्टडी मैटेरियल के साथ सिविल सर्विसेज़ परीक्षा की तैयारी", color: "blue", level: "graduation" },
        { icon: "bi-journal-text", title: "यूकेपीएससी", desc: "उत्तराखंड प्रोविंसियल सर्विसेज़ एग्ज़ाम सीरीज़ के साथ प्रैक्टिस टेस्ट", color: "orange", level: "graduation" },
        {
          icon: "bi-journal-text",
          title: "एसएससी",
          desc: "कर्मचारी चयन आयोग परीक्षा सीज़ेल, चेचएसएल, जेए टेस्ट सीरीज़ के साथ पूर्ण तैयारी",
          color: "green",
          level: "school"
        },
        {
          icon: "bi-shield-fill",
          title: "रक्षा (एनडीए/सीडीएस/एएफसीएटी)",
          desc: "विषयवार मॉक टेस्ट के साथ एनडीए, सीडीएस, एएफसीएटी की तैयारी", color: "purple"
        },
        { icon: "bi-journal-medical", title: "कैट/एमएटी/सीएमएटी", desc: "प्रबंधन प्रवेश परीक्षा की तैयारी मॉक टेस्ट और विश्लेषण के साथ", color: "blue", level: "graduation" },
        { icon: "bi-building", title: "राज्य भर्ती परीक्षा", desc: "राज्य-वार भर्ती परीक्षा व्यापक टेस्ट सीरीज़ के साथ", color: "orange", level: "school" },
        { icon: "bi-mortarboard-fill", title: "शिक्षा योग्यता परीक्षा", desc: "सीटीईटी, यूपीटीईटी, बीएड प्रवेश परीक्षा की तैयारी", color: "green", level: "graduation" },
        { icon: "bi-person-badge-fill", title: "पुलिस और पैरामिलिट्री", desc: "भारी शारीरिक प्रशिक्षण और मॉक टेस्ट के साथ पुलिस भर्ती परीक्षा", color: "purple" }
      ]
    },
    modal: {
      en: { title: "Login Required", message: "Please log in to access the test series.", login: "Login Now", close: "Close" },
      hi: { title: "लॉगिन आवश्यक है", message: "टेस्ट सीरीज़ तक पहुंचने के लिए कृपया लॉगिन करें।", login: "अभी लॉगिन करें", close: "बंद करें" }
    }
  }

  const t = content[language] || content.en

  const schoolLevelExams = ["Defence (NDA/CDS/AFCAT)", "CHSL", "State Recruitment Exams", "Police & Paramilitary", "रक्षा (एनडीए/सीडीएस/एएफसीएटी)", "एसएससी", "राज्य भर्ती परीक्षा", "पुलिस और पैरामिलिट्री"];

  const examsToDisplay = filter === 'school'
    ? t.exams.filter(exam => schoolLevelExams.includes(exam.title))
    : t.exams;

  const navigate = useNavigate()
  const [showModal, setShowModal] = React.useState(false)
  const [selectedExam, setSelectedExam] = React.useState("")

  const handleCardClick = (examTitle) => {
    setSelectedExam(examTitle)
    setShowModal(true)
  }

  const handleLoginRedirect = () => {
    setShowModal(false)
    navigate('/login')
  }

  const modalText = content.modal[language] || content.modal.en

  return (
    <section className="competitive-exams-section role-section-school">
      <div className="role-header">
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </div>
      <Row className="g-4">
        {examsToDisplay.map((exam, index) => (
          <Col lg={3} md={6} sm={12} key={index}>
            <div
              className={`benefit-card card-${exam.color} h-100 border-0 shadow-sm exam-card`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleCardClick(exam.title)}
            >
              <div className={`benefit-icon icon-${exam.color}`}>
                <i className={`bi ${exam.icon}`}></i>
              </div>
              <h4>{exam.title}</h4>
              <p>{exam.desc}</p>
            </div>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-5 fw-bold w-100 text-center">
            {modalText.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center pt-2">
          <div className="mb-3">
            <i className="bi bi-lock-fill display-4 text-primary"></i>
          </div>
          <p className="text-muted">{modalText.message}</p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center pt-0">
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            {modalText.close}
          </Button>
          <Button variant="primary" onClick={handleLoginRedirect}>
            {modalText.login}
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  )
}

export default CompetitiveExams