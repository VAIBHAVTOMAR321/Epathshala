import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Spinner, Modal, Form, Badge } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import { useAuth } from '../all_login/AuthContext'
import AdminHeader from './AdminHeader'
import '../../assets/css/Enrollments.css'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaClock, FaCalendar, FaBriefcase, FaLink, FaGraduationCap, FaTools } from 'react-icons/fa'

const API_URL = 'https://brjobsedu.com/gyandhara/gyandhara_backend/api/job-openings/'

const AddJob = () => {
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
  const [editJobId, setEditJobId] = useState(null)

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
    location: '',
    job_type: 'full_time',
    experience_required: '',
    salary: '',
    qualifications_required: [],
    skills_required: [],
    apply_link: '',
    last_date_to_apply: '',
    is_active: true
  })

const [descriptionInput, setDescriptionInput] = useState('')
const [descriptionHindiInput, setDescriptionHindiInput] = useState('')
const [skillInput, setSkillInput] = useState('')
const [customQualInput, setCustomQualInput] = useState('')
const [customSkillInput, setCustomSkillInput] = useState('')

const qualificationOptions = [
  '10th Pass', '12th Pass', 'Graduate', 'Post Graduate', 'Diploma', 'ITI', 'Polytechnic'
]

const skillOptions = [
  'Python', 'JavaScript', 'React', 'Angular', 'Node.js', 'Django', 'Flask',
  'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin',
  'HTML', 'CSS', 'Bootstrap', 'Tailwind',
  'MySQL', 'MongoDB', 'PostgreSQL', 'SQLite',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
  'Machine Learning', 'Data Science', 'AI', 'Excel', 'Tally', 'Accounting'
]

  useEffect(() => {
    if (location.state?.editData) {
      const data = location.state.editData
      setEditMode(true)
      setEditJobId(data.job_id)
      setFormData({
        title: data.title || '',
        title_hindi: data.title_hindi || '',
        description: data.description || [],
        description_hindi: data.description_hindi || [],
        location: data.location || '',
        job_type: data.job_type || 'full_time',
        experience_required: data.experience_required || '',
        salary: data.salary || '',
        qualifications_required: data.qualifications_required || [],
        skills_required: data.skills_required || [],
        apply_link: data.apply_link || '',
        last_date_to_apply: data.last_date_to_apply ? data.last_date_to_apply.slice(0, 10) : '',
        status: data.status || 'active'
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

  const addQualification = () => {
    if (qualificationInput.trim()) {
      setFormData({
        ...formData,
        qualifications_required: [...formData.qualifications_required, qualificationInput.trim()]
      })
      setQualificationInput('')
    }
  }

  const removeQualification = (index) => {
    const newQualifications = formData.qualifications_required.filter((_, i) => i !== index)
    setFormData({ ...formData, qualifications_required: newQualifications })
  }

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData({
        ...formData,
        skills_required: [...formData.skills_required, skillInput.trim()]
      })
      setSkillInput('')
    }
  }

  const removeSkill = (index) => {
    const newSkills = formData.skills_required.filter((_, i) => i !== index)
    setFormData({ ...formData, skills_required: newSkills })
  }

  const toggleQualification = (qual) => {
    const exists = formData.qualifications_required.includes(qual)
    if (exists) {
      setFormData({
        ...formData,
        qualifications_required: formData.qualifications_required.filter(q => q !== qual)
      })
    } else {
      setFormData({
        ...formData,
        qualifications_required: [...formData.qualifications_required, qual]
      })
    }
  }

  const toggleSkill = (skill) => {
    const exists = formData.skills_required.includes(skill)
    if (exists) {
      setFormData({
        ...formData,
        skills_required: formData.skills_required.filter(s => s !== skill)
      })
    } else {
      setFormData({
        ...formData,
        skills_required: [...formData.skills_required, skill]
      })
    }
  }

  const addCustomQual = () => {
    if (customQualInput.trim() && !formData.qualifications_required.includes(customQualInput.trim())) {
      setFormData({
        ...formData,
        qualifications_required: [...formData.qualifications_required, customQualInput.trim()]
      })
      setCustomQualInput('')
    }
  }

  const addCustomSkill = () => {
    if (customSkillInput.trim() && !formData.skills_required.includes(customSkillInput.trim())) {
      setFormData({
        ...formData,
        skills_required: [...formData.skills_required, customSkillInput.trim()]
      })
      setCustomSkillInput('')
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
        location: formData.location?.trim() || '',
        job_type: formData.job_type,
        experience_required: formData.experience_required?.trim() || '',
        salary: formData.salary?.trim() || '',
        qualifications_required: formData.qualifications_required,
        skills_required: formData.skills_required,
        apply_link: formData.apply_link?.trim() || '',
        last_date_to_apply: formData.last_date_to_apply,
        status: formData.status === 'active' ? 'active' : 'inactive'
      }

      if (editMode && editJobId) {
        payload.job_id = editJobId
        await axios.put(API_URL, payload, getAuthConfig())
      } else {
        await axios.post(API_URL, payload, getAuthConfig())
      }

      setShowSuccessModal(true)
      resetForm()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to save job')
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
      location: '',
      job_type: 'full_time',
      experience_required: '',
      salary: '',
      qualifications_required: [],
      skills_required: [],
      apply_link: '',
      last_date_to_apply: '',
      status: 'active'
    })
    setEditMode(false)
    setEditJobId(null)
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
                  <h4 className="mb-0">{editMode ? 'Edit Job' : 'Add Job'}</h4>
                </div>
                <Button variant="outline-primary" size="sm" onClick={() => navigate('/ManageJobs')}>
                  <FaBriefcase className="me-1" /> Manage Jobs
                </Button>
              </div>

              <Row>
                <Col xs={12}>
                  <Card className="enrollments-table-card border p-3">
                    <Card.Header className="bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center paid-btn gap-2">
                        <h5 className="mb-0 fw-semibold text-secondary">
                          Job Details
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
                              <Form.Label>Job Title (English) *</Form.Label>
                              <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Backend Developer"
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Job Title (Hindi)</Form.Label>
                              <Form.Control
                                type="text"
                                name="title_hindi"
                                value={formData.title_hindi}
                                onChange={handleChange}
                                placeholder="e.g. बैकएंड डेवलपर"
                              />
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label><FaBriefcase className="me-1" /> Job Type</Form.Label>
                              <Form.Select
                                name="job_type"
                                value={formData.job_type}
                                onChange={handleChange}
                              >
                                <option value="full_time">Full Time</option>
                                <option value="part_time">Part Time</option>
                                <option value="internship">Internship</option>
                                <option value="contract">Contract</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label><FaClock className="me-1" /> Experience Required</Form.Label>
                              <Form.Control
                                type="text"
                                name="experience_required"
                                value={formData.experience_required}
                                onChange={handleChange}
                                placeholder="e.g. 1-3 years"
                              />
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Location</Form.Label>
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
                              <Form.Label>Salary</Form.Label>
                              <Form.Control
                                type="text"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                placeholder="e.g. 3-6 LPA"
                              />
                            </Form.Group>
                          </Col>

                          <Col md={12}>
                            <Form.Group className="mb-3">
                              <Form.Label><FaLink className="me-1" /> Apply Link</Form.Label>
                              <Form.Control
                                type="url"
                                name="apply_link"
                                value={formData.apply_link}
                                onChange={handleChange}
                                placeholder="e.g. https://example.com/apply"
                              />
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label><FaCalendar className="me-1" /> Last Date to Apply</Form.Label>
                              <Form.Control
                                type="date"
                                name="last_date_to_apply"
                                value={formData.last_date_to_apply}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Status</Form.Label>
                              <Form.Select
                                name="status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </Form.Select>
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
                                  placeholder="e.g. Develop REST APIs using Django"
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
                                  placeholder="e.g. Django का उपयोग करके API बनाना"
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
                              <Form.Label><FaGraduationCap className="me-1" /> Qualifications Required</Form.Label>
                              <div className="checkbox-grid">
                                {qualificationOptions.map(qual => (
                                  <Form.Check
                                    key={qual}
                                    type="checkbox"
                                    id={`qual-${qual}`}
                                    label={qual}
                                    checked={formData.qualifications_required.includes(qual)}
                                    onChange={() => toggleQualification(qual)}
                                    className="mb-1"
                                  />
                                ))}
                              </div>
                              <div className="d-flex gap-2 mt-2">
                                <Form.Control
                                  type="text"
                                  value={customQualInput}
                                  onChange={(e) => setCustomQualInput(e.target.value)}
                                  placeholder="Add custom qualification"
                                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomQual())}
                                />
                                <Button variant="outline-primary" onClick={addCustomQual}>
                                  <FaPlus />
                                </Button>
                              </div>
                            </Form.Group>
                          </Col>

                          <Col md={12}>
                            <Form.Group className="mb-3">
                              <Form.Label><FaTools className="me-1" /> Skills Required</Form.Label>
                              <div className="checkbox-grid">
                                {skillOptions.map(skill => (
                                  <Form.Check
                                    key={skill}
                                    type="checkbox"
                                    id={`skill-${skill}`}
                                    label={skill}
                                    checked={formData.skills_required.includes(skill)}
                                    onChange={() => toggleSkill(skill)}
                                    className="mb-1"
                                  />
                                ))}
                              </div>
                              <div className="d-flex gap-2 mt-2">
                                <Form.Control
                                  type="text"
                                  value={customSkillInput}
                                  onChange={(e) => setCustomSkillInput(e.target.value)}
                                  placeholder="Add custom skill"
                                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                                />
                                <Button variant="outline-primary" onClick={addCustomSkill}>
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
                                <FaPlus className="me-1" /> {editMode ? 'Update Job' : 'Add Job'}
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
          <p>Job has been {editMode ? 'updated' : 'added'} successfully!</p>
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

export default AddJob
