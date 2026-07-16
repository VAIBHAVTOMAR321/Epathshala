import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Spinner, Modal, Form, Badge } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import { useAuth } from '../all_login/AuthContext'
import AdminHeader from './AdminHeader'
import '../../assets/css/Enrollments.css'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaClock, FaCalendar, FaChalkboardTeacher, FaLink, FaGraduationCap, FaGift, FaUser, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa'

const API_URL = 'https://brjobsedu.com/gyandhara/gyandhara_backend/api/seminar-items/'

const AddSeminar = () => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editSeminarId, setEditSeminarId] = useState(null)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
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

  const [formData, setFormData] = useState({
    title: '',
    title_hindi: '',
    description: [],
    description_hindi: [],
    status: 'active',
    speaker_name: '',
    location: '',
    mode: 'offline',
    start_date_time: '',
    end_date_time: '',
    registration_link: '',
    eligibility: [],
    benefits: [],
    last_date_to_register: ''
  })

const [descriptionInput, setDescriptionInput] = useState('')
const [descriptionHindiInput, setDescriptionHindiInput] = useState('')
const [customElInput, setCustomElInput] = useState('')
const [customBenInput, setCustomBenInput] = useState('')

const eligibilityOptions = [
  '10th Pass', '12th Pass', 'Graduate', 'Post Graduate', 'Diploma', 'ITI', 'Polytechnic', 'Working Professional', 'Student', 'Unemployed'
]

const benefitOptions = [
  'Certificate', 'Networking', 'Free Study Materials', 'Hands-on Practice', 'Live Projects', 'Job Placement', 'Internship', 'Mentorship', 'Refreshments', 'Certificate of Participation'
]

  useEffect(() => {
    if (location.state?.editData) {
      const data = location.state.editData
      setEditMode(true)
      setEditSeminarId(data.seminar_id)
      setFormData({
        title: data.title || '',
        title_hindi: data.title_hindi || '',
        description: data.description || [],
        description_hindi: data.description_hindi || [],
        status: data.status || 'active',
        speaker_name: data.speaker_name || '',
        location: data.location || '',
        mode: data.mode || 'offline',
        start_date_time: data.start_date_time ? data.start_date_time.slice(0, 16) : '',
        end_date_time: data.end_date_time ? data.end_date_time.slice(0, 16) : '',
        registration_link: data.registration_link || '',
        eligibility: data.eligibility || [],
        benefits: data.benefits || [],
        last_date_to_register: data.last_date_to_register ? data.last_date_to_register.slice(0, 10) : ''
      })
    }
  }, [location.state])

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

  const addDescription = () => {
    if (descriptionInput.trim()) {
      setFormData({
        ...formData,
        description: [...formData.description, descriptionInput.trim()]
      })
      setDescriptionInput('')
    }
  }

  const removeDescription = (index) => {
    const newDescriptions = formData.description.filter((_, i) => i !== index)
    setFormData({ ...formData, description: newDescriptions })
  }

  const addDescriptionHindi = () => {
    if (descriptionHindiInput.trim()) {
      setFormData({
        ...formData,
        description_hindi: [...formData.description_hindi, descriptionHindiInput.trim()]
      })
      setDescriptionHindiInput('')
    }
  }

  const removeDescriptionHindi = (index) => {
    const newDescriptions = formData.description_hindi.filter((_, i) => i !== index)
    setFormData({ ...formData, description_hindi: newDescriptions })
  }

  const addEligibility = () => {
    if (eligibilityInput.trim()) {
      setFormData({
        ...formData,
        eligibility: [...formData.eligibility, eligibilityInput.trim()]
      })
      setEligibilityInput('')
    }
  }

  const removeEligibility = (index) => {
    const newEligibility = formData.eligibility.filter((_, i) => i !== index)
    setFormData({ ...formData, eligibility: newEligibility })
  }

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, benefitInput.trim()]
      })
      setBenefitInput('')
    }
  }

  const removeBenefit = (index) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== index)
    setFormData({ ...formData, benefits: newBenefits })
  }

  const toggleEligibility = (el) => {
    const exists = formData.eligibility.includes(el)
    if (exists) {
      setFormData({
        ...formData,
        eligibility: formData.eligibility.filter(e => e !== el)
      })
    } else {
      setFormData({
        ...formData,
        eligibility: [...formData.eligibility, el]
      })
    }
  }

  const toggleBenefit = (ben) => {
    const exists = formData.benefits.includes(ben)
    if (exists) {
      setFormData({
        ...formData,
        benefits: formData.benefits.filter(b => b !== ben)
      })
    } else {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, ben]
      })
    }
  }

  const addCustomEligibility = () => {
    if (customElInput.trim() && !formData.eligibility.includes(customElInput.trim())) {
      setFormData({
        ...formData,
        eligibility: [...formData.eligibility, customElInput.trim()]
      })
      setCustomElInput('')
    }
  }

  const addCustomBenefit = () => {
    if (customBenInput.trim() && !formData.benefits.includes(customBenInput.trim())) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, customBenInput.trim()]
      })
      setCustomBenInput('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Please enter title')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        title: formData.title.trim(),
        title_hindi: formData.title_hindi?.trim() || '',
        description: formData.description,
        description_hindi: formData.description_hindi,
        status: formData.status,
        speaker_name: formData.speaker_name?.trim() || '',
        location: formData.location?.trim() || '',
        mode: formData.mode,
        start_date_time: formData.start_date_time ? new Date(formData.start_date_time).toISOString() : '',
        end_date_time: formData.end_date_time ? new Date(formData.end_date_time).toISOString() : '',
        registration_link: formData.registration_link?.trim() || '',
        eligibility: formData.eligibility,
        benefits: formData.benefits,
        last_date_to_register: formData.last_date_to_register
      }

      if (editMode && editSeminarId) {
        payload.seminar_id = editSeminarId
        await axios.put(API_URL, payload, getAuthConfig())
      } else {
        await axios.post(API_URL, payload, getAuthConfig())
      }

      setShowSuccessModal(true)
      resetForm()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save seminar')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      title_hindi: '',
      description: [],
      description_hindi: [],
      status: 'active',
      speaker_name: '',
      location: '',
      mode: 'offline',
      start_date_time: '',
      end_date_time: '',
      registration_link: '',
      eligibility: [],
      benefits: [],
      last_date_to_register: ''
    })
    setEditMode(false)
    setEditSeminarId(null)
  }

  if (loading) {
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
              <div className="loading-spinner">
                <Spinner animation="border" variant="primary" />
              </div>
            </Container>
          </div>
        </div>
      </div>
      </>
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
                  <h4 className="mb-0">{editMode ? 'Edit Seminar' : 'Add Seminar'}</h4>
                </div>
                <Button variant="outline-primary" size="sm" onClick={() => navigate('/ManageJobs')}>
                  <FaChalkboardTeacher className="me-1" /> Manage Seminars
                </Button>
              </div>

              <Row>
                <Col xs={12}>
                  <Card className="enrollments-table-card border p-3">
                    <Card.Header className="bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center paid-btn gap-2">
                        <h5 className="mb-0 fw-semibold text-secondary">
                          Seminar Details
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
                              <Form.Label>Seminar Title (English) *</Form.Label>
                              <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. AI & Future Technology Seminar"
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Seminar Title (Hindi)</Form.Label>
                              <Form.Control
                                type="text"
                                name="title_hindi"
                                value={formData.title_hindi}
                                onChange={handleChange}
                                placeholder="e.g. एआई और भविष्य की तकनीक सेमिनार"
                              />
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label><FaUser className="me-1" /> Speaker Name</Form.Label>
                              <Form.Control
                                type="text"
                                name="speaker_name"
                                value={formData.speaker_name}
                                onChange={handleChange}
                                placeholder="e.g. Dr. Amit Sharma"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label><FaGlobe className="me-1" /> Mode</Form.Label>
                              <Form.Select
                                name="mode"
                                value={formData.mode}
                                onChange={handleChange}
                              >
                                <option value="offline">Offline</option>
                                <option value="online">Online</option>
                                <option value="hybrid">Hybrid</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label><FaMapMarkerAlt className="me-1" /> Location</Form.Label>
                              <Form.Control
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Dehradun"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Status</Form.Label>
                              <Form.Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label><FaClock className="me-1" /> Start Date & Time</Form.Label>
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
                              <Form.Label><FaClock className="me-1" /> End Date & Time</Form.Label>
                              <Form.Control
                                type="datetime-local"
                                name="end_date_time"
                                value={formData.end_date_time}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label><FaCalendar className="me-1" /> Last Date to Register</Form.Label>
                              <Form.Control
                                type="date"
                                name="last_date_to_register"
                                value={formData.last_date_to_register}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label><FaLink className="me-1" /> Registration Link</Form.Label>
                              <Form.Control
                                type="url"
                                name="registration_link"
                                value={formData.registration_link}
                                onChange={handleChange}
                                placeholder="e.g. https://example.com/register"
                              />
                            </Form.Group>
                          </Col>

                          <Col md={12}>
                            <Form.Group className="mb-3">
                              <Form.Label>Description (English) - Add multiple items</Form.Label>
                              <div className="d-flex gap-2 mb-2">
                                <Form.Control
                                  type="text"
                                  value={descriptionInput}
                                  onChange={(e) => setDescriptionInput(e.target.value)}
                                  placeholder="e.g. Introduction to Artificial Intelligence"
                                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDescription())}
                                />
                                <Button variant="outline-primary" onClick={addDescription}>
                                  <FaPlus />
                                </Button>
                              </div>
                              <div className="d-flex flex-wrap gap-2">
                                {formData.description.map((desc, index) => (
                                  <Badge key={index} bg="primary" className="d-flex align-items-center gap-1 p-2">
                                    {desc}
                                    <button type="button" className="btn-close btn-close-white ms-1" style={{ fontSize: '10px' }} onClick={() => removeDescription(index)}></button>
                                  </Badge>
                                ))}
                              </div>
                            </Form.Group>
                          </Col>

                          <Col md={12}>
                            <Form.Group className="mb-3">
                              <Form.Label>Description (Hindi) - Add multiple items</Form.Label>
                              <div className="d-flex gap-2 mb-2">
                                <Form.Control
                                  type="text"
                                  value={descriptionHindiInput}
                                  onChange={(e) => setDescriptionHindiInput(e.target.value)}
                                  placeholder="e.g. आर्टिफिशियल इंटेलिजेंस का परिचय"
                                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDescriptionHindi())}
                                />
                                <Button variant="outline-primary" onClick={addDescriptionHindi}>
                                  <FaPlus />
                                </Button>
                              </div>
                              <div className="d-flex flex-wrap gap-2">
                                {formData.description_hindi.map((desc, index) => (
                                  <Badge key={index} bg="success" className="d-flex align-items-center gap-1 p-2">
                                    {desc}
                                    <button type="button" className="btn-close btn-close-white ms-1" style={{ fontSize: '10px' }} onClick={() => removeDescriptionHindi(index)}></button>
                                  </Badge>
                                ))}
                              </div>
                            </Form.Group>
                          </Col>

                          <Col md={12}>
                            <Form.Group className="mb-3">
                              <Form.Label><FaGraduationCap className="me-1" /> Eligibility</Form.Label>
                              <div className="checkbox-grid">
                                {eligibilityOptions.map(el => (
                                  <Form.Check
                                    key={el}
                                    type="checkbox"
                                    id={`el-${el}`}
                                    label={el}
                                    checked={formData.eligibility.includes(el)}
                                    onChange={() => toggleEligibility(el)}
                                    className="mb-1"
                                  />
                                ))}
                              </div>
                              <div className="d-flex gap-2 mt-2">
                                <Form.Control
                                  type="text"
                                  value={customElInput}
                                  onChange={(e) => setCustomElInput(e.target.value)}
                                  placeholder="Add custom eligibility"
                                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomEligibility())}
                                />
                                <Button variant="outline-primary" onClick={addCustomEligibility}>
                                  <FaPlus />
                                </Button>
                              </div>
                            </Form.Group>
                          </Col>

                          <Col md={12}>
                            <Form.Group className="mb-3">
                              <Form.Label><FaGift className="me-1" /> Benefits</Form.Label>
                              <div className="checkbox-grid">
                                {benefitOptions.map(ben => (
                                  <Form.Check
                                    key={ben}
                                    type="checkbox"
                                    id={`ben-${ben}`}
                                    label={ben}
                                    checked={formData.benefits.includes(ben)}
                                    onChange={() => toggleBenefit(ben)}
                                    className="mb-1"
                                  />
                                ))}
                              </div>
                              <div className="d-flex gap-2 mt-2">
                                <Form.Control
                                  type="text"
                                  value={customBenInput}
                                  onChange={(e) => setCustomBenInput(e.target.value)}
                                  placeholder="Add custom benefit"
                                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomBenefit())}
                                />
                                <Button variant="outline-primary" onClick={addCustomBenefit}>
                                  <FaPlus />
                                </Button>
                              </div>
                            </Form.Group>
                          </Col>
                        </Row>

                        <div className="d-flex gap-2 mt-4">
                          <Button variant="primary" type="submit" disabled={submitting}>
                            {submitting ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <>
                                <FaPlus className="me-1" /> {editMode ? 'Update Seminar' : 'Add Seminar'}
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
          <p>Seminar has been {editMode ? 'updated' : 'added'} successfully!</p>
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

export default AddSeminar