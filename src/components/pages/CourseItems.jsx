import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Spinner, Form, Modal } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../../assets/css/courseitems.css'
import { useLanguage } from '../all_login/LanguageContext'
import { FaSearch, FaFilter, FaArrowRight, FaBookOpen } from 'react-icons/fa'

function CourseItems() {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)

  const content = {
    en: {
      title: "Our Courses",
      loading: "Loading courses...",
      noResults: "No courses found",
      noMatch: (term) => `No courses match "${term}"`,
      noAvailable: "No courses available at the moment",
      searchPlaceholder: "Search for a course...",
      allCategories: "All Categories",
      exploreBtn: "Explore Course",
      resultsFound: (count) => `Showing ${count} courses`,
      modalTitle: "Access Restricted",
      modalMessage: "Please login or register for more information and features.",
      modalLogin: "Login",
      modalRegister: "Register Today"
    },
    hi: {
      title: "हमारे पाठ्यक्रम",
      loading: "पाठ्यक्रम लोड हो रहे हैं...",
      noResults: "कोई पाठ्यक्रम नहीं मिला",
      noMatch: (term) => `"${term}" से मेल खाने वाला कोई पाठ्यक्रम नहीं मिला`,
      noAvailable: "फिलहाल कोई पाठ्यक्रम उपलब्ध नहीं है",
      searchPlaceholder: "पाठ्यक्रम खोजें...",
      allCategories: "सभी श्रेणियां",
      exploreBtn: "पाठ्यक्रम देखें",
      resultsFound: (count) => `${count} पाठ्यक्रम दिखाए जा रहे हैं`,
      modalTitle: "पहुंच प्रतिबंधित",
      modalMessage: "अधिक जानकारी और सुविधाओं के लिए कृपया लॉगिन या पंजीकरण करें।",
      modalLogin: "लॉगिन",
      modalRegister: "आज ही पंजीकरण करें"
    }
  }

  const t = content[language] || content.en

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await axios.get('https://brjobsedu.com/gyandhara/gyandhara_backend/api/course-items/')
      let courseData = []
      if (response.data && response.data.data) {
        courseData = response.data.data
      } else if (response.data && Array.isArray(response.data)) {
        courseData = response.data
      }
      setCourses(courseData)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching courses:', err)
      setLoading(false)
    }
  }

  const handleCardClick = () => setShowModal(true)
  const handleClose = () => setShowModal(false)

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.course_desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.course_name_hindi?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="course-loading">
        <Spinner animation="border" variant="primary" />
        <p>{t.loading}</p>
      </div>
    )
  }

  return (
    <div className="course-items-page">
      
      <div className="course-hero-banner mt-5 mb-1" >
        <Container className='box-shadow p-4 rounded-3 ' style={{ backgroundColor: 'rgba(255, 255, 255, 0.9) ',marginTop:'80px' }}>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <div className="mb-3 text-black" style={{ fontSize: '1.8rem' }}>{t.title}</div>
              <div className="search-filter-container p-3 bg-white shadow-lg rounded-pill d-flex align-items-center">
                <div className="flex-grow-1 d-flex align-items-center px-3 border-end">
                  <FaSearch className="text-muted me-2" />
                  <Form.Control 
                    type="text" 
                    placeholder={t.searchPlaceholder}
                    className="border-0 shadow-none p-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button 
                  variant="primary" 
                  className="rounded-pill px-4 ms-2 py-2 fw-bold"
                  onClick={() => { /* Trigger search if needed, currently handled by onChange */ }}
                  aria-label="Search"
                >
                  <FaSearch className="me-1" />
                </Button>
              </div>
            </Col>
          </Row>
          <Container className="course-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0 text-muted small fw-bold">
            {t.resultsFound(filteredCourses.length)}
          </h5>
          {searchTerm && (
            <Button 
              variant="link" 
              size="sm" 
              className="text-decoration-none fw-bold"
              onClick={() => setSearchTerm('')}
            >
              Clear Search
            </Button>
          )}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <Row className="courses-grid">
            {filteredCourses.map((course) => (
              <Col key={course.id} lg={3} md={4} sm={6} className="mb-3">
                <Card className="course-card h-100" style={{ fontSize: '0.8rem' }}>
                  {course.course_img && (
                    <div className="course-image-container" style={{ height: '140px' }}>
                      <Card.Img 
                        variant="top" 
                        src={course.course_img.startsWith('http') ? course.course_img : `https://brjobsedu.com/gyandhara/gyandhara_backend${course.course_img}`}
                        alt={course.course_name}
                        className="course-image"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = '/placeholder-course.png'
                        }}
                      />
                    </div>
                  )}
                  <Card.Body className="course-card-body p-2">
                    <div className="course-category">
                      <Badge bg="primary" className="course-badge py-1 px-2" style={{ fontSize: '0.7rem' }}>
                        {course.course_category || ''}
                      </Badge>
                    </div>
                    <Card.Title className="fw-bold mb-1" style={{ fontSize: '0.9rem' }}>
                      {language === 'hi' && course.course_name_hindi ? course.course_name_hindi : course.course_name}
                    </Card.Title>
                  
                    <Card.Text className="course-description">
                      {language === 'hi' && course.course_desc_hindi ? (course.course_desc_hindi.length > 80 ? course.course_desc_hindi.substring(0, 80) + '...' : course.course_desc_hindi) : (course.course_desc?.length > 80 ? course.course_desc.substring(0, 80) + '...' : course.course_desc)}
                    </Card.Text>
                    
                    {language !== 'hi' && course.course_name_hindi && (
                      <div className="course-hindi-info">
                        <small className="text-muted">{course.course_name_hindi}</small>
                      </div>
                    )}
               
                  </Card.Body>
                  <Card.Footer className="bg-transparent border-0 p-2 pt-0">
                    <Button 
                      className="w-100 explore-btn btn-sm d-flex align-items-center justify-content-center gap-2" style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                      onClick={handleCardClick}
                    >
                      {t.exploreBtn} <FaArrowRight size={12} />
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card className="no-results-card">
            <Card.Body className="text-center py-5">
              <i className="bi bi-search display-4 text-muted mb-3"></i>
              <h4>{t.noResults}</h4>
              <p className="text-muted">
                {searchTerm ? t.noMatch(searchTerm) : t.noAvailable}
              </p>
              <Button variant="outline-primary" onClick={() => {
                setSearchTerm('')
                // setFilter('all') // Filter state removed
              }}>
                {t.clearFilters}
              </Button>
            </Card.Body>
          </Card>
        )}
      </Container>
        </Container>
      </div>

      

      {/* Auth Prompt Modal */}
      <Modal show={showModal} onHide={handleClose} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-5 fw-bold text-primary w-100 text-center">{t.modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center pt-2">
          <p className="mb-4 text-muted">{t.modalMessage}</p>
          <div className="d-grid gap-2">
            <Button variant="primary" className="rounded-pill py-2" onClick={() => { handleClose(); navigate('/login'); }}>
              <i className="bi bi-box-arrow-in-right me-2"></i> {t.modalLogin}
            </Button>
            <Button variant="outline-primary" className="rounded-pill py-2" onClick={() => { handleClose(); navigate('/register'); }}>
              <i className="bi bi-person-plus me-2"></i> {t.modalRegister}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default CourseItems