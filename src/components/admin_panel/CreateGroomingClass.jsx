import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Spinner, Modal, Form, Badge } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminHeader from './AdminHeader'
import axios from 'axios'

import { useAuth } from '../all_login/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaClock, FaCalendar, FaUsers, FaLink } from 'react-icons/fa'

const API_URL = 'https://brjobsedu.com/gyandhara/gyandhara_backend/api/grooming-classes/'

const CreateGroomingClass = () => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editClassId, setEditClassId] = useState(null)

  useEffect(() => {
    if (location.state?.editData) {
      const data = location.state.editData
      setEditMode(true)
      setEditClassId(data.class_id)
      setFormData({
        title: data.title || '',
        title_hindi: data.title_hindi || '',
        description: data.description || '',
        description_hindi: data.description_hindi || '',
        class_link: data.class_link || '',
        start_date_time: data.start_date_time ? data.start_date_time.slice(0, 16) : '',
        end_date_time: data.end_date_time ? data.end_date_time.slice(0, 16) : ''
      })
    }
  }, [location.state])

  const [formData, setFormData] = useState({
    title: '',
    title_hindi: '',
    description: '',
    description_hindi: '',
    class_link: '',
    start_date_time: '',
    end_date_time: ''
  })

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

  const getAuthConfig = () => ({
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Please enter title')
      return
    }

    setSubmitting(true)

    try {
      const formatDateTimeForAPI = (dateTimeStr) => {
        if (!dateTimeStr) return null
        const date = new Date(dateTimeStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`
      }

      const payload = {
        title: formData.title.trim(),
        title_hindi: formData.title_hindi?.trim() || '',
        description: formData.description?.trim() || '',
        description_hindi: formData.description_hindi?.trim() || '',
        class_link: formData.class_link?.trim() || '',
        start_date_time: formatDateTimeForAPI(formData.start_date_time),
        end_date_time: formatDateTimeForAPI(formData.end_date_time)
      }

      if (editMode && editClassId) {
        payload.class_id = editClassId
        await axios.put(API_URL, payload, getAuthConfig())
        setShowSuccessModal(true)
        resetForm()
        setTimeout(() => {
          navigate('/ManageGroomingClasses')
        }, 1500)
      } else {
        await axios.post(API_URL, payload, getAuthConfig())
        setShowSuccessModal(true)
        resetForm()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save grooming class')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      title_hindi: '',
      description: '',
      description_hindi: '',
      class_link: '',
      start_date_time: '',
      end_date_time: ''
    })
    setEditMode(false)
    setEditClassId(null)
  }

  if (loading) {
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
              <div className="loading-spinner">
                <Spinner animation="border" variant="primary" />
              </div>
            </Container>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
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
              <div className="d-flex justify-content-between align-items-center mb-4 page-header">
                <div className="d-flex align-items-center all-en-box gap-3">
                  <Button variant="outline-secondary" size="sm" onClick={() => navigate('/AdminDashboard')} className="me-2">
                    <FaArrowLeft /> Dashboard
                  </Button>
                  <h4 className="mb-0">{editMode ? 'Edit Grooming Class' : 'Create Grooming Class'}</h4>
                </div>
                <Button variant="outline-primary" size="sm" onClick={() => navigate('/ManageGroomingClasses')}>
                  <FaUsers className="me-1" /> Manage Classes
                </Button>
              </div>

              <Row>
                <Col xs={12}>
                  <Card className="enrollments-table-card border">
                    <Card.Header className="bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center paid-btn gap-2">
                        <h5 className="mb-0 fw-semibold text-secondary">
                          Class Details
                        </h5>
                      </div>
                      {editMode && (
                        <Button variant="outline-secondary" size="sm" onClick={resetForm}>
                          Cancel Edit
                        </Button>
                      )}
                    </Card.Header>
                    <Card.Body className="p-4">
                      <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Title (English) *</Form.Label>
                              <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Personality Development Session"
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Title (Hindi)</Form.Label>
                              <Form.Control
                                type="text"
                                name="title_hindi"
                                value={formData.title_hindi}
                                onChange={handleChange}
                                placeholder="e.g. व्यक्तित्व विकास सत्र"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Description (English)</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="e.g. Improve communication and confidence"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Description (Hindi)</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={3}
                                name="description_hindi"
                                value={formData.description_hindi}
                                onChange={handleChange}
                                placeholder="e.g. संचार और आत्मविश्वास में सुधार करें"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={12}>
                            <Form.Group className="mb-3">
                              <Form.Label><FaLink className="me-1" /> Class Link</Form.Label>
                              <Form.Control
                                type="url"
                                name="class_link"
                                value={formData.class_link}
                                onChange={handleChange}
                                placeholder="e.g. https://meet.google.com/abc-xyz"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label><FaCalendar className="me-1" /> Start Date & Time</Form.Label>
                              <Form.Control
                                type="datetime-local"
                                name="start_date_time"
                                value={formData.start_date_time}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label><FaCalendar className="me-1" /> End Date & Time</Form.Label>
                              <Form.Control
                                type="datetime-local"
                                name="end_date_time"
                                value={formData.end_date_time}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <div className="d-flex gap-2 mt-4">
                          <Button variant="primary" type="submit" disabled={submitting}>
                            {submitting ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <>
                                <FaPlus className="me-1" /> {editMode ? 'Update Class' : 'Create Class'}
                              </>
                            )}
                          </Button>
                          <Button variant="outline-secondary" onClick={resetForm}>
                            Reset
                          </Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </div>

      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Grooming class has been {editMode ? 'updated' : 'created'} successfully!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CreateGroomingClass