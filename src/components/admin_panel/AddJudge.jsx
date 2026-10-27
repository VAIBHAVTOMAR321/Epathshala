import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Spinner, Modal, Form, Badge } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import { useAuth } from '../all_login/AuthContext'
import AdminHeader from './AdminHeader'
import '../../assets/css/Enrollments.css'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaClock, FaCalendar, FaBriefcase, FaLink, FaGraduationCap, FaTools } from 'react-icons/fa'

const API_URL = 'https://brjobsedu.com/epathshala/epathshala_backend/api/job-openings/'

const AddJudge = () => {
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
        <div className="">
          <Container fluid className="dashboard-box mt-3">
             Judges
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

export default AddJudge
