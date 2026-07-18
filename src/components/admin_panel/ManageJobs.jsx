import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Badge, Nav, Tab } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import axios from 'axios'
import { useAuth } from '../all_login/AuthContext'
import AdminHeader from './AdminHeader'
import '../../assets/css/Enrollments.css'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaCalendar, FaClock, FaBriefcase, FaLink, FaMapMarkerAlt, FaMoneyBillWave, FaGraduationCap, FaTools, FaToggleOn, FaToggleOff, FaChalkboardTeacher, FaUser, FaVideo } from 'react-icons/fa'

const JOB_API_URL = 'https://brjobsedu.com/gyandhara/gyandhara_backend/api/job-openings/'
const SEMINAR_API_URL = 'https://brjobsedu.com/gyandhara/gyandhara_backend/api/seminar-items/'
const WORKSHOP_API_URL = 'https://brjobsedu.com/gyandhara/gyandhara_backend/api/workshop-items/'

const statusLabels = {
  active: 'Active',
  inactive: 'Inactive'
}

const ManageJobs = () => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [seminars, setSeminars] = useState([])
  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [selectedSeminar, setSelectedSeminar] = useState(null)
  const [selectedWorkshop, setSelectedWorkshop] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(10)
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('jobs')
  const [seminarFilter, setSeminarFilter] = useState('all')
  const [seminarCurrentPage, setSeminarCurrentPage] = useState(1)
  const [workshopFilter, setWorkshopFilter] = useState('all')
  const [workshopCurrentPage, setWorkshopCurrentPage] = useState(1)

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

  const isJobActive = (job) => job.status === 'active' || job.status === true || job.status === 1 || job.status === '1'

  useEffect(() => {
    fetchJobs()
    fetchSeminars()
    fetchWorkshops()
  }, [])

  const getAuthConfig = () => ({
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await axios.get(JOB_API_URL + '?_t=' + new Date().getTime(), getAuthConfig())
      if (response.data && response.data.data) {
        console.log('Jobs API response:', JSON.stringify(response.data.data))
        setJobs(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSeminars = async () => {
    try {
      const response = await axios.get(SEMINAR_API_URL, getAuthConfig())
      if (response.data && response.data.data) {
        setSeminars(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching seminars:', error)
      setSeminars([])
    }
  }

  const fetchWorkshops = async () => {
    try {
      const response = await axios.get(WORKSHOP_API_URL, getAuthConfig())
      if (response.data && response.data.data) {
        setWorkshops(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching workshops:', error)
      setWorkshops([])
    }
  }

  const handleEdit = (job) => {
    navigate('/AddJob', { state: { editData: job } })
  }

  const handleDelete = (job) => {
    setSelectedJob(job)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      if (activeTab === 'jobs') {
        await axios.delete(JOB_API_URL, {
          data: { job_id: selectedJob.job_id },
          ...getAuthConfig()
        })
        fetchJobs()
      } else if (activeTab === 'seminars') {
        await axios.delete(SEMINAR_API_URL, {
          data: { seminar_id: selectedSeminar.seminar_id },
          ...getAuthConfig()
        })
        fetchSeminars()
      } else {
        await axios.delete(WORKSHOP_API_URL, {
          data: { workshop_id: selectedWorkshop.workshop_id },
          ...getAuthConfig()
        })
        fetchWorkshops()
      }
      setShowDeleteModal(false)
      alert(`${activeTab === 'jobs' ? 'Job' : activeTab === 'seminars' ? 'Seminar' : 'Workshop'} deleted successfully!`)
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Failed to delete')
    }
  }

  const toggleJobStatus = async (job) => {
    try {
      const currentStatus = isJobActive(job)
      const newStatus = !currentStatus
      console.log('Toggle job:', job.job_id, 'from status:', job.status, 'to', newStatus)
      
      await axios.put(JOB_API_URL, {
        job_id: job.job_id,
        status: newStatus ? 'active' : 'inactive'
      }, getAuthConfig())
      
      fetchJobs()
      alert(`Job ${newStatus ? 'activated' : 'deactivated'} successfully!`)
    } catch (error) {
      console.error('Error toggling job status:', error)
      alert('Failed to update job status')
    }
  }

  const toggleSeminarStatus = async (seminar) => {
    try {
      const newStatus = seminar.status === 'active' ? 'inactive' : 'active'
      await axios.put(SEMINAR_API_URL, {
        seminar_id: seminar.seminar_id,
        status: newStatus
      }, getAuthConfig())
      fetchSeminars()
      alert(`Seminar ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`)
    } catch (error) {
      console.error('Error toggling seminar status:', error)
      alert('Failed to update seminar status')
    }
  }

  const handleView = (job) => {
    setSelectedJob(job)
    setShowViewModal(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    })
  }

  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  
  const filteredJobs = statusFilter === 'all' 
    ? jobs 
    : jobs.filter(job => {
      const isActive = isJobActive(job)
      return statusFilter === 'active' ? isActive : !isActive
    })
  
  const currentRecords = filteredJobs.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredJobs.length / recordsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  const handleFilterChange = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleSeminarFilterChange = (status) => {
    setSeminarFilter(status)
    setSeminarCurrentPage(1)
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const seminarIndexOfLastRecord = seminarCurrentPage * recordsPerPage
  const seminarIndexOfFirstRecord = seminarIndexOfLastRecord - recordsPerPage
  
  const filteredSeminars = seminarFilter === 'all' 
    ? seminars 
    : seminars.filter(seminar => seminarFilter === 'active' ? seminar.status === 'active' : seminar.status === 'inactive')
  
  const seminarCurrentRecords = filteredSeminars.slice(seminarIndexOfFirstRecord, seminarIndexOfLastRecord)
  const seminarTotalPages = Math.ceil(filteredSeminars.length / recordsPerPage)

  const handleSeminarPageChange = (pageNumber) => {
    setSeminarCurrentPage(pageNumber)
  }

  const handleSeminarPreviousPage = () => {
    if (seminarCurrentPage > 1) setSeminarCurrentPage(seminarCurrentPage - 1)
  }

  const handleSeminarNextPage = () => {
    if (seminarCurrentPage < seminarTotalPages) setSeminarCurrentPage(seminarCurrentPage + 1)
  }

  const handleEditSeminar = (seminar) => {
    navigate('/AddSeminar', { state: { editData: seminar } })
  }

  const handleViewSeminar = (seminar) => {
    setSelectedSeminar(seminar)
    setShowViewModal(true)
  }

  const handleDeleteSeminar = (seminar) => {
    setSelectedSeminar(seminar)
    setShowDeleteModal(true)
  }

  const toggleSeminarStatusNew = async (seminar) => {
    try {
      const newStatus = seminar.status === 'active' ? 'inactive' : 'active'
      await axios.put(SEMINAR_API_URL, {
        seminar_id: seminar.seminar_id,
        status: newStatus
      }, getAuthConfig())
      fetchSeminars()
      alert(`Seminar ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`)
    } catch (error) {
      console.error('Error toggling seminar status:', error)
      alert('Failed to update seminar status')
    }
  }

  const handleEditWorkshop = (workshop) => {
    navigate('/AddWorkshop', { state: { editData: workshop } })
  }

  const handleViewWorkshop = (workshop) => {
    setSelectedWorkshop(workshop)
    setShowViewModal(true)
  }

  const handleDeleteWorkshop = (workshop) => {
    setSelectedWorkshop(workshop)
    setShowDeleteModal(true)
  }

  const toggleWorkshopStatus = async (workshop) => {
    try {
      const newStatus = workshop.status === 'active' ? 'inactive' : 'active'
      await axios.put(WORKSHOP_API_URL, {
        workshop_id: workshop.workshop_id,
        status: newStatus
      }, getAuthConfig())
      fetchWorkshops()
      alert(`Workshop ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`)
    } catch (error) {
      console.error('Error toggling workshop status:', error)
      alert('Failed to update workshop status')
    }
  }

  const workshopIndexOfLastRecord = workshopCurrentPage * recordsPerPage
  const workshopIndexOfFirstRecord = workshopIndexOfLastRecord - recordsPerPage
  
  const filteredWorkshops = workshopFilter === 'all' 
    ? workshops 
    : workshops.filter(workshop => workshopFilter === 'active' ? workshop.status === 'active' : workshop.status === 'inactive')
  
  const workshopCurrentRecords = filteredWorkshops.slice(workshopIndexOfFirstRecord, workshopIndexOfLastRecord)
  const workshopTotalPages = Math.ceil(filteredWorkshops.length / recordsPerPage)

  const handleWorkshopPageChange = (pageNumber) => {
    setWorkshopCurrentPage(pageNumber)
  }

  const handleWorkshopPreviousPage = () => {
    if (workshopCurrentPage > 1) setWorkshopCurrentPage(workshopCurrentPage - 1)
  }

  const handleWorkshopNextPage = () => {
    if (workshopCurrentPage < workshopTotalPages) setWorkshopCurrentPage(workshopCurrentPage + 1)
  }

  const handleWorkshopFilterChange = (status) => {
    setWorkshopFilter(status)
    setWorkshopCurrentPage(1)
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
                  <h4 className="mb-0">Manage Jobs, Seminars & Workshops</h4>
                </div>
                <Button variant="primary" size="sm" onClick={() => activeTab === 'jobs' ? navigate('/AddJob') : activeTab === 'seminars' ? navigate('/AddSeminar') : navigate('/AddWorkshop')}>
                  <FaPlus className="me-1" /> {activeTab === 'jobs' ? 'Add New Job' : activeTab === 'seminars' ? 'Add New Seminar' : 'Add New Workshop'}
                </Button> 
              </div>

              <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                <Nav.Item>
                  <Nav.Link eventKey="jobs">
                    <FaBriefcase className="me-1" /> Jobs ({jobs.length})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="seminars">
                    <FaChalkboardTeacher className="me-1" /> Seminars ({seminars.length})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="workshops">
                    <FaTools className="me-1" /> Workshops ({workshops.length})
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              {activeTab === 'jobs' && (
              <Row>
                <Col xs={12}>
                  <Card className="enrollments-table-card border">
                    <Card.Header className="bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center flex-wrap">
                      <div className="d-flex align-items-center paid-btn gap-2">
                        <h5 className="mb-0 fw-semibold text-secondary">
                          All Jobs ({filteredJobs.length})
                        </h5>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            type="button"
                            className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleFilterChange('all')}
                          >
                            All
                          </button>
                          <button
                            type="button"
                            className={`btn ${statusFilter === 'active' ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => handleFilterChange('active')}
                          >
                            Active
                          </button>
                          <button
                            type="button"
                            className={`btn ${statusFilter === 'inactive' ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => handleFilterChange('inactive')}
                          >
                            Inactive
                          </button>
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive d-none d-md-block">
                        <Table hover className="custom-table align-middle mb-0">
                          <thead className="table-light custom-table">
                            <tr>
                              <th className="ps-2">Job ID</th>
                              <th>Title</th>
                              <th><FaMapMarkerAlt className="me-1" /> Location</th>
                              <th><FaBriefcase className="me-1" /> Type</th>
                              <th><FaMoneyBillWave className="me-1" /> Salary</th>
                              <th><FaCalendar className="me-1" /> Last Date</th>
                              <th>Status</th>
                              <th className="text-end pe-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentRecords.length === 0 ? (
                              <tr>
                                <td colSpan="8" className="text-center py-4 text-muted">
                                  No jobs found
                                </td>
                              </tr>
                            ) : (
                              currentRecords.map((job) => (
                                <tr key={job.job_id}>
                                  <td className="ps-2">
                                    <span className="text-muted small fw-medium">{job.job_id}</span>
                                  </td>
                                  <td className="fw-medium text-dark">
                                    {job.title}
                                    {job.title_hindi && (
                                      <div className="small text-muted">{job.title_hindi}</div>
                                    )}
                                  </td>
                                  <td className="small">
                                    {job.location || '-'}
                                  </td>
                                  <td className="small">
                                    <Badge bg={job.job_type === 'full_time' ? 'success' : job.job_type === 'part_time' ? 'info' : job.job_type === 'internship' ? 'warning' : 'secondary'}>
                                      {job.job_type?.replace('_', ' ')}
                                    </Badge>
                                  </td>
                                  <td className="small">
                                    {job.salary || '-'}
                                  </td>
                                  <td className="small">
                                    {formatDate(job.last_date_to_apply)}
                                  </td>
                                  <td className="small">
                                    <Badge bg={isJobActive(job) ? 'success' : 'danger'}>
                                      {isJobActive(job) ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </td>
                                  <td className="text-end pe-3">
                                    <div className="d-flex gap-1 justify-content-end">
                                      <Button
                                        variant={isJobActive(job) ? 'outline-success' : 'outline-secondary'}
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => toggleJobStatus(job)}
                                        title={isJobActive(job) ? 'Deactivate' : 'Activate'}
                                      >
                                        {isJobActive(job) ? <FaToggleOn style={{ fontSize: '12px', color: 'green' }} /> : <FaToggleOff style={{ fontSize: '12px', color: 'gray' }} />}
                                      </Button>
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleView(job)}
                                        title="View"
                                      >
                                        <i className="bi bi-eye" style={{ fontSize: '12px' }}></i>
                                      </Button>
                                      <Button
                                        variant="outline-warning"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleEdit(job)}
                                        title="Edit"
                                      >
                                        <FaEdit style={{ fontSize: '12px' }} />
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleDelete(job)}
                                        title="Delete"
                                      >
                                        <FaTrash style={{ fontSize: '12px' }} />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </Table>
                      </div>
                      <div className="mobile-card-view d-md-none">
                        {currentRecords.length === 0 ? (
                          <div className="text-center py-4 text-muted">
                            No jobs found
                          </div>
                        ) : (
                          currentRecords.map((job) => (
                            <div key={job.job_id} className="grooming-class-card">
                              <div className="card-header">
                                <span className="class-id">ID: {job.job_id}</span>
                              </div>
                              <div className="class-title">{job.title}</div>
                              {job.title_hindi && (
                                <div className="class-title-hindi">{job.title_hindi}</div>
                              )}
                              <div className="class-info">
                                <div className="info-item">
                                  <span className="label"><FaMapMarkerAlt className="me-1" />Location:</span>{' '}
                                  <span className="value">{job.location || '-'}</span>
                                </div>
                                <div className="info-item">
                                  <span className="label"><FaBriefcase className="me-1" />Type:</span>{' '}
                                  <span className="value">{job.job_type?.replace('_', ' ')}</span>
                                </div>
                                <div className="info-item">
                                  <span className="label"><FaMoneyBillWave className="me-1" />Salary:</span>{' '}
                                  <span className="value">{job.salary || '-'}</span>
                                </div>
                                <div className="info-item">
                                  <span className="label"><FaCalendar className="me-1" />Last Date:</span>{' '}
                                  <span className="value">{formatDate(job.last_date_to_apply)}</span>
                                </div>
<div className="info-item">
                                   <span className="label">Status:</span>{' '}
                                   <Badge bg={isJobActive(job) ? 'success' : 'danger'}>{isJobActive(job) ? 'Active' : 'Inactive'}</Badge>
                                 </div>
                               </div>
                               <div className="card-actions">
                                 <Button
                                   variant={isJobActive(job) ? 'outline-success' : 'outline-secondary'}
                                   size="sm"
                                   onClick={() => toggleJobStatus(job)}
                                 >
                                   {isJobActive(job) ? <FaToggleOn className="me-1" /> : <FaToggleOff className="me-1" />} 
                                   {isJobActive(job) ? 'Active' : 'Inactive'}
                                 </Button>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleView(job)}
                                >
                                  <i className="bi bi-eye me-1"></i> View
                                </Button>
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleEdit(job)}
                                >
                                  <FaEdit className="me-1" /> Edit
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDelete(job)}
                                >
                                  <FaTrash className="me-1" /> Delete
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card.Body>
                    {totalPages > 1 && (
                      <Card.Footer className="bg-light border-top py-2 px-3">
                        <nav aria-label="Jobs pagination">
                          <ul className="pagination justify-content-center pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={handlePreviousPage}>‹</button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(page => {
                              return page >= currentPage - 1 && page <= currentPage + 1 && page <= totalPages && page >= 1
                            }).map(page => (
                              <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(page)}>{page}</button>
                              </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={handleNextPage}>›</button>
                            </li>
                          </ul>
                        </nav>
                      </Card.Footer>
                    )}
                  </Card>
                </Col>
              </Row>
              )}

              {activeTab === 'seminars' && (
              <Row>
                <Col xs={12}>
                  <Card className="enrollments-table-card border">
                    <Card.Header className="bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center flex-wrap">
                      <div className="d-flex align-items-center paid-btn gap-2">
                        <h5 className="mb-0 fw-semibold text-secondary">
                          All Seminars ({filteredSeminars.length})
                        </h5>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            type="button"
                            className={`btn ${seminarFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleSeminarFilterChange('all')}
                          >
                            All
                          </button>
                          <button
                            type="button"
                            className={`btn ${seminarFilter === 'active' ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => handleSeminarFilterChange('active')}
                          >
                            Active
                          </button>
                          <button
                            type="button"
                            className={`btn ${seminarFilter === 'inactive' ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => handleSeminarFilterChange('inactive')}
                          >
                            Inactive
                          </button>
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive d-none d-md-block">
                        <Table hover className="custom-table align-middle mb-0">
                          <thead className="table-light custom-table">
                            <tr>
                              <th className="ps-2">Seminar ID</th>
                              <th>Title</th>
                              <th><FaUser className="me-1" /> Speaker</th>
                              <th><FaMapMarkerAlt className="me-1" /> Location</th>
                              <th><FaVideo className="me-1" /> Mode</th>
                              <th><FaCalendar className="me-1" /> Date</th>
                              <th>Status</th>
                              <th className="text-end pe-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {seminarCurrentRecords.length === 0 ? (
                              <tr>
                                <td colSpan="8" className="text-center py-4 text-muted">
                                  No seminars found
                                </td>
                              </tr>
                            ) : (
                              seminarCurrentRecords.map((seminar) => (
                                <tr key={seminar.seminar_id}>
                                  <td className="ps-2">
                                    <span className="text-muted small fw-medium">{seminar.seminar_id}</span>
                                  </td>
                                  <td className="fw-medium text-dark">
                                    {seminar.title}
                                    {seminar.title_hindi && (
                                      <div className="small text-muted">{seminar.title_hindi}</div>
                                    )}
                                  </td>
                                  <td className="small">
                                    {seminar.speaker_name || '-'}
                                  </td>
                                  <td className="small">
                                    {seminar.location || '-'}
                                  </td>
                                  <td className="small">
                                    <Badge bg={seminar.mode === 'online' ? 'info' : 'secondary'}>
                                      {seminar.mode || '-'}
                                    </Badge>
                                  </td>
                                  <td className="small">
                                    {formatDate(seminar.start_date_time)}
                                  </td>
                                  <td className="small">
                                    <Badge bg={seminar.status === 'active' ? 'success' : 'danger'}>
                                      {seminar.status === 'active' ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </td>
                                  <td className="text-end pe-3">
                                    <div className="d-flex gap-1 justify-content-end">
                                      <Button
                                        variant={seminar.status === 'active' ? 'outline-success' : 'outline-secondary'}
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => toggleSeminarStatus(seminar)}
                                        title={seminar.status === 'active' ? 'Deactivate' : 'Activate'}
                                      >
                                        {seminar.status === 'active' ? <FaToggleOn style={{ fontSize: '12px' }} /> : <FaToggleOff style={{ fontSize: '12px' }} />}
                                      </Button>
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleViewSeminar(seminar)}
                                        title="View"
                                      >
                                        <i className="bi bi-eye" style={{ fontSize: '12px' }}></i>
                                      </Button>
                                      <Button
                                        variant="outline-warning"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleEditSeminar(seminar)}
                                        title="Edit"
                                      >
                                        <FaEdit style={{ fontSize: '12px' }} />
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleDeleteSeminar(seminar)}
                                        title="Delete"
                                      >
                                        <FaTrash style={{ fontSize: '12px' }} />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </Table>
                      </div>
                      <div className="mobile-card-view d-md-none">
                        {seminarCurrentRecords.length === 0 ? (
                          <div className="text-center py-4 text-muted">
                            No seminars found
                          </div>
                        ) : (
                          seminarCurrentRecords.map((seminar) => (
                            <div key={seminar.seminar_id} className="grooming-class-card">
                              <div className="card-header">
                                <span className="class-id">ID: {seminar.seminar_id}</span>
                              </div>
                              <div className="class-title">{seminar.title}</div>
                              {seminar.title_hindi && (
                                <div className="class-title-hindi">{seminar.title_hindi}</div>
                              )}
                              <div className="class-info">
                                <div className="info-item">
                                  <span className="label"><FaUser className="me-1" />Speaker:</span>{' '}
                                  <span className="value">{seminar.speaker_name || '-'}</span>
                                </div>
                                <div className="info-item">
                                  <span className="label"><FaMapMarkerAlt className="me-1" />Location:</span>{' '}
                                  <span className="value">{seminar.location || '-'}</span>
                                </div>
                                <div className="info-item">
                                  <span className="label"><FaVideo className="me-1" />Mode:</span>{' '}
                                  <span className="value">{seminar.mode || '-'}</span>
                                </div>
                                <div className="info-item">
                                  <span className="label"><FaCalendar className="me-1" />Date:</span>{' '}
                                  <span className="value">{formatDate(seminar.start_date_time)}</span>
                                </div>
                                <div className="info-item">
                                  <span className="label">Status:</span>{' '}
                                  <Badge bg={seminar.status === 'active' ? 'success' : 'danger'}>{seminar.status === 'active' ? 'Active' : 'Inactive'}</Badge>
                                </div>
                              </div>
                              <div className="card-actions">
                                <Button
                                  variant={seminar.status === 'active' ? 'outline-success' : 'outline-secondary'}
                                  size="sm"
                                  onClick={() => toggleSeminarStatus(seminar)}
                                >
                                  {seminar.status === 'active' ? <FaToggleOn className="me-1" /> : <FaToggleOff className="me-1" />} 
                                  {seminar.status === 'active' ? 'Active' : 'Inactive'}
                                </Button>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleViewSeminar(seminar)}
                                >
                                  <i className="bi bi-eye me-1"></i> View
                                </Button>
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleEditSeminar(seminar)}
                                >
                                  <FaEdit className="me-1" /> Edit
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteSeminar(seminar)}
                                >
                                  <FaTrash className="me-1" /> Delete
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card.Body>
                    {seminarTotalPages > 1 && (
                      <Card.Footer className="bg-light border-top py-2 px-3">
                        <nav aria-label="Seminars pagination">
                          <ul className="pagination justify-content-center pagination-sm mb-0">
                            <li className={`page-item ${seminarCurrentPage === 1 ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={handleSeminarPreviousPage}>‹</button>
                            </li>
                            {Array.from({ length: seminarTotalPages }, (_, i) => i + 1).filter(page => {
                              return page >= seminarCurrentPage - 1 && page <= seminarCurrentPage + 1 && page <= seminarTotalPages && page >= 1
                            }).map(page => (
                              <li key={page} className={`page-item ${page === seminarCurrentPage ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => handleSeminarPageChange(page)}>{page}</button>
                              </li>
                            ))}
                            <li className={`page-item ${seminarCurrentPage === seminarTotalPages ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={handleSeminarNextPage}>›</button>
                            </li>
                          </ul>
                        </nav>
                      </Card.Footer>
                    )}
                  </Card>
                </Col>
              </Row>
              )}

              {activeTab === 'workshops' && (
              <Row>
                <Col xs={12}>
                  <Card className="enrollments-table-card border">
                    <Card.Header className="bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center flex-wrap">
                      <div className="d-flex align-items-center paid-btn gap-2">
                        <h5 className="mb-0 fw-semibold text-secondary">
                          All Workshops ({filteredWorkshops.length})
                        </h5>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            type="button"
                            className={`btn ${workshopFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleWorkshopFilterChange('all')}
                          >
                            All
                          </button>
                          <button
                            type="button"
                            className={`btn ${workshopFilter === 'active' ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => handleWorkshopFilterChange('active')}
                          >
                            Active
                          </button>
                          <button
                            type="button"
                            className={`btn ${workshopFilter === 'inactive' ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => handleWorkshopFilterChange('inactive')}
                          >
                            Inactive
                          </button>
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive d-none d-md-block">
                        <Table hover className="custom-table align-middle mb-0">
                          <thead className="table-light custom-table">
                            <tr>
                              <th className="ps-2">Workshop ID</th>
                              <th>Title</th>
                              <th><FaUser className="me-1" /> Instructor</th>
                              <th><FaMapMarkerAlt className="me-1" /> Location</th>
                              <th><FaVideo className="me-1" /> Mode</th>
                              <th><FaCalendar className="me-1" /> Date</th>
                              <th>Status</th>
                              <th className="text-end pe-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {workshopCurrentRecords.length === 0 ? (
                              <tr>
                                <td colSpan="8" className="text-center py-4 text-muted">
                                  No workshops found
                                </td>
                              </tr>
                            ) : (
                              workshopCurrentRecords.map((workshop) => (
                                <tr key={workshop.workshop_id}>
                                  <td className="ps-2">
                                    <span className="text-muted small fw-medium">{workshop.workshop_id}</span>
                                  </td>
                                  <td className="fw-medium text-dark">
                                    {workshop.title}
                                    {workshop.title_hindi && (
                                      <div className="small text-muted">{workshop.title_hindi}</div>
                                    )}
                                  </td>
                                  <td className="small">
                                    {workshop.instructor_name || '-'}
                                  </td>
                                  <td className="small">
                                    {workshop.location || '-'}
                                  </td>
                                  <td className="small">
                                    <Badge bg={workshop.mode === 'online' ? 'info' : 'secondary'}>
                                      {workshop.mode || '-'}
                                    </Badge>
                                  </td>
                                  <td className="small">
                                    {formatDate(workshop.start_date_time)}
                                  </td>
                                  <td className="small">
                                    <Badge bg={workshop.status === 'active' ? 'success' : 'danger'}>
                                      {workshop.status === 'active' ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </td>
                                  <td className="text-end pe-3">
                                    <div className="d-flex gap-1 justify-content-end">
                                      <Button
                                        variant={workshop.status === 'active' ? 'outline-success' : 'outline-secondary'}
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => toggleWorkshopStatus(workshop)}
                                        title={workshop.status === 'active' ? 'Deactivate' : 'Activate'}
                                      >
                                        {workshop.status === 'active' ? <FaToggleOn style={{ fontSize: '12px' }} /> : <FaToggleOff style={{ fontSize: '12px' }} />}
                                      </Button>
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleViewWorkshop(workshop)}
                                        title="View"
                                      >
                                        <i className="bi bi-eye" style={{ fontSize: '12px' }}></i>
                                      </Button>
                                      <Button
                                        variant="outline-warning"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleEditWorkshop(workshop)}
                                        title="Edit"
                                      >
                                        <FaEdit style={{ fontSize: '12px' }} />
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleDeleteWorkshop(workshop)}
                                        title="Delete"
                                      >
                                        <FaTrash style={{ fontSize: '12px' }} />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </Table>
                      </div>
                      <div className="mobile-card-view d-md-none">
                        {workshopCurrentRecords.length === 0 ? (
                          <div className="text-center py-4 text-muted">
                            No workshops found
                          </div>
                        ) : (
                          workshopCurrentRecords.map((workshop) => (
                            <div key={workshop.workshop_id} className="grooming-class-card">
                              <div className="card-header">
                                <span className="class-id">ID: {workshop.workshop_id}</span>
                              </div>
                              <div className="class-title">{workshop.title}</div>
                              {workshop.title_hindi && (
                                <div className="class-title-hindi">{workshop.title_hindi}</div>
                              )}
                              <div className="class-info">
                                <div className="info-item">
                                  <span className="label"><FaUser className="me-1" />Instructor:</span>{' '}
                                  <span className="value">{workshop.instructor_name || '-'}</span>
                                </div>
                                <div className="info-item">
                                  <span className="label"><FaMapMarkerAlt className="me-1" />Location:</span>{' '}
                                  <span className="value">{workshop.location || '-'}</span>
                                </div>
                                <div className="info-item">
                                  <span className="label"><FaVideo className="me-1" />Mode:</span>{' '}
                                  <span className="value">{workshop.mode || '-'}</span>
                                </div>
                                <div className="info-item">
                                  <span className="label"><FaCalendar className="me-1" />Date:</span>{' '}
                                  <span className="value">{formatDate(workshop.start_date_time)}</span>
                                </div>
                                <div className="info-item">
                                  <span className="label">Status:</span>{' '}
                                  <Badge bg={workshop.status === 'active' ? 'success' : 'danger'}>{workshop.status === 'active' ? 'Active' : 'Inactive'}</Badge>
                                </div>
                              </div>
                              <div className="card-actions">
                                <Button
                                  variant={workshop.status === 'active' ? 'outline-success' : 'outline-secondary'}
                                  size="sm"
                                  onClick={() => toggleWorkshopStatus(workshop)}
                                >
                                  {workshop.status === 'active' ? <FaToggleOn className="me-1" /> : <FaToggleOff className="me-1" />} 
                                  {workshop.status === 'active' ? 'Active' : 'Inactive'}
                                </Button>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleViewWorkshop(workshop)}
                                >
                                  <i className="bi bi-eye me-1"></i> View
                                </Button>
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleEditWorkshop(workshop)}
                                >
                                  <FaEdit className="me-1" /> Edit
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteWorkshop(workshop)}
                                >
                                  <FaTrash className="me-1" /> Delete
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card.Body>
                    {workshopTotalPages > 1 && (
                      <Card.Footer className="bg-light border-top py-2 px-3">
                        <nav aria-label="Workshops pagination">
                          <ul className="pagination justify-content-center pagination-sm mb-0">
                            <li className={`page-item ${workshopCurrentPage === 1 ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={handleWorkshopPreviousPage}>‹</button>
                            </li>
                            {Array.from({ length: workshopTotalPages }, (_, i) => i + 1).filter(page => {
                              return page >= workshopCurrentPage - 1 && page <= workshopCurrentPage + 1 && page <= workshopTotalPages && page >= 1
                            }).map(page => (
                              <li key={page} className={`page-item ${page === workshopCurrentPage ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => handleWorkshopPageChange(page)}>{page}</button>
                              </li>
                            ))}
                            <li className={`page-item ${workshopCurrentPage === workshopTotalPages ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={handleWorkshopNextPage}>›</button>
                            </li>
                          </ul>
                        </nav>
                      </Card.Footer>
                    )}
                  </Card>
                </Col>
              </Row>
              )}
            </Container>
          </div>
        </div>
      </div>
 
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this {activeTab === 'jobs' ? 'job' : activeTab === 'seminars' ? 'seminar' : 'workshop'}?</p>
          <p className="text-muted">{activeTab === 'jobs' ? 'Job ID: ' : activeTab === 'seminars' ? 'Seminar ID: ' : 'Workshop ID: '}{activeTab === 'jobs' ? selectedJob?.job_id : activeTab === 'seminars' ? selectedSeminar?.seminar_id : selectedWorkshop?.workshop_id}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <FaTrash className="me-1" /> Delete
          </Button>
        </Modal.Footer>
      </Modal>
 
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{activeTab === 'jobs' ? 'Job' : activeTab === 'seminars' ? 'Seminar' : 'Workshop'} Details - {activeTab === 'jobs' ? selectedJob?.title : activeTab === 'seminars' ? selectedSeminar?.title : selectedWorkshop?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {activeTab === 'jobs' && selectedJob && (
            <div className="job-details">
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Job ID:</strong> {selectedJob.job_id}</p>
                  <p><strong><FaBriefcase className="me-1" />Job Type:</strong> {selectedJob.job_type?.replace('_', ' ')}</p>
                  <p><strong><FaMapMarkerAlt className="me-1" />Location:</strong> {selectedJob.location || '-'}</p>
                  <p><strong><FaMoneyBillWave className="me-1" />Salary:</strong> {selectedJob.salary || '-'}</p>
                  <p><strong><FaClock className="me-1" />Experience:</strong> {selectedJob.experience_required || '-'}</p>
                </Col>
                <Col md={6}>
                  <p><strong><FaCalendar className="me-1" />Last Date to Apply:</strong> {formatDate(selectedJob.last_date_to_apply)}</p>
                  <p><strong>Status:</strong> <Badge bg={isJobActive(selectedJob) ? 'success' : 'danger'}>{isJobActive(selectedJob) ? 'Active' : 'Inactive'}</Badge></p>
                  {selectedJob.apply_link && (
                    <p><strong><FaLink className="me-1" />Apply Link:</strong> <a href={selectedJob.apply_link} target="_blank" rel="noopener noreferrer">Apply Here</a></p>
                  )}
                </Col>
              </Row>
              
              {selectedJob.description && selectedJob.description.length > 0 && (
                <div className="mb-3">
                  <h6>Description (English)</h6>
                  <ul>
                    {selectedJob.description.map((desc, index) => (
                      <li key={index}>{desc}</li>
                    ))}
                  </ul>
                </div>
              )}
 
              {selectedJob.description_hindi && selectedJob.description_hindi.length > 0 && (
                <div className="mb-3">
                  <h6>Description (Hindi)</h6>
                  <ul>
                    {selectedJob.description_hindi.map((desc, index) => (
                      <li key={index}>{desc}</li>
                    ))}
                  </ul>
                </div>
              )}
 
              {selectedJob.qualifications_required && selectedJob.qualifications_required.length > 0 && (
                <div className="mb-3">
                  <h6><FaGraduationCap className="me-1" />Qualifications Required</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedJob.qualifications_required.map((qual, index) => (
                      <Badge key={index} bg="info">{qual}</Badge>
                    ))}
                  </div>
                </div>
              )}
 
              {selectedJob.skills_required && selectedJob.skills_required.length > 0 && (
                <div className="mb-3">
                  <h6><FaTools className="me-1" />Skills Required</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedJob.skills_required.map((skill, index) => (
                      <Badge key={index} bg="warning" text="dark">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'seminars' && selectedSeminar && (
            <div className="seminar-details">
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Seminar ID:</strong> {selectedSeminar.seminar_id}</p>
                  <p><strong><FaUser className="me-1" />Speaker:</strong> {selectedSeminar.speaker_name || '-'}</p>
                  <p><strong><FaMapMarkerAlt className="me-1" />Location:</strong> {selectedSeminar.location || '-'}</p>
                  <p><strong><FaVideo className="me-1" />Mode:</strong> {selectedSeminar.mode || '-'}</p>
                </Col>
                <Col md={6}>
                  <p><strong><FaCalendar className="me-1" />Start DateTime:</strong> {formatDateTime(selectedSeminar.start_date_time)}</p>
                  <p><strong><FaClock className="me-1" />End DateTime:</strong> {formatDateTime(selectedSeminar.end_date_time)}</p>
                  <p><strong>Status:</strong> <Badge bg={selectedSeminar.status === 'active' ? 'success' : 'danger'}>{selectedSeminar.status === 'active' ? 'Active' : 'Inactive'}</Badge></p>
                  {selectedSeminar.registration_link && (
                    <p><strong><FaLink className="me-1" />Registration Link:</strong> <a href={selectedSeminar.registration_link} target="_blank" rel="noopener noreferrer">Register Here</a></p>
                  )}
                </Col>
              </Row>
              
              {selectedSeminar.description && selectedSeminar.description.length > 0 && (
                <div className="mb-3">
                  <h6>Description (English)</h6>
                  <ul>
                    {selectedSeminar.description.map((desc, index) => (
                      <li key={index}>{desc}</li>
                    ))}
                  </ul>
                </div>
              )}
 
              {selectedSeminar.description_hindi && selectedSeminar.description_hindi.length > 0 && (
                <div className="mb-3">
                  <h6>Description (Hindi)</h6>
                  <ul>
                    {selectedSeminar.description_hindi.map((desc, index) => (
                      <li key={index}>{desc}</li>
                    ))}
                  </ul>
                </div>
              )}
 
              {selectedSeminar.eligibility && selectedSeminar.eligibility.length > 0 && (
                <div className="mb-3">
                  <h6><FaGraduationCap className="me-1" />Eligibility</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedSeminar.eligibility.map((elg, index) => (
                      <Badge key={index} bg="info">{elg}</Badge>
                    ))}
                  </div>
                </div>
              )}
 
              {selectedSeminar.benefits && selectedSeminar.benefits.length > 0 && (
                <div className="mb-3">
                  <h6><FaTools className="me-1" />Benefits</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedSeminar.benefits.map((ben, index) => (
                      <Badge key={index} bg="success">{ben}</Badge>
                    ))}
                  </div>
                </div>
              )}
 
              <p><strong><FaCalendar className="me-1" />Last Date to Register:</strong> {formatDate(selectedSeminar.last_date_to_register)}</p>
            </div>
          )}
          {activeTab === 'workshops' && selectedWorkshop && (
            <div className="workshop-details">
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Workshop ID:</strong> {selectedWorkshop.workshop_id}</p>
                  <p><strong><FaUser className="me-1" />Instructor:</strong> {selectedWorkshop.instructor_name || '-'}</p>
                  <p><strong><FaMapMarkerAlt className="me-1" />Location:</strong> {selectedWorkshop.location || '-'}</p>
                  <p><strong><FaVideo className="me-1" />Mode:</strong> {selectedWorkshop.mode || '-'}</p>
                </Col>
                <Col md={6}>
                  <p><strong><FaCalendar className="me-1" />Start DateTime:</strong> {formatDateTime(selectedWorkshop.start_date_time)}</p>
                  <p><strong><FaClock className="me-1" />End DateTime:</strong> {formatDateTime(selectedWorkshop.end_date_time)}</p>
                  <p><strong>Status:</strong> <Badge bg={selectedWorkshop.status === 'active' ? 'success' : 'danger'}>{selectedWorkshop.status === 'active' ? 'Active' : 'Inactive'}</Badge></p>
                  {selectedWorkshop.registration_link && (
                    <p><strong><FaLink className="me-1" />Registration Link:</strong> <a href={selectedWorkshop.registration_link} target="_blank" rel="noopener noreferrer">Register Here</a></p>
                  )}
                </Col>
              </Row>
              
              {selectedWorkshop.description && selectedWorkshop.description.length > 0 && (
                <div className="mb-3">
                  <h6>Description (English)</h6>
                  <ul>
                    {selectedWorkshop.description.map((desc, index) => (
                      <li key={index}>{desc}</li>
                    ))}
                  </ul>
                </div>
              )}
 
              {selectedWorkshop.description_hindi && selectedWorkshop.description_hindi.length > 0 && (
                <div className="mb-3">
                  <h6>Description (Hindi)</h6>
                  <ul>
                    {selectedWorkshop.description_hindi.map((desc, index) => (
                      <li key={index}>{desc}</li>
                    ))}
                  </ul>
                </div>
              )}
 
              {selectedWorkshop.eligibility && selectedWorkshop.eligibility.length > 0 && (
                <div className="mb-3">
                  <h6><FaGraduationCap className="me-1" />Eligibility</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedWorkshop.eligibility.map((elg, index) => (
                      <Badge key={index} bg="info">{elg}</Badge>
                    ))}
                  </div>
                </div>
              )}
 
              {selectedWorkshop.benefits && selectedWorkshop.benefits.length > 0 && (
                <div className="mb-3">
                  <h6><FaGift className="me-1" />Benefits</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedWorkshop.benefits.map((ben, index) => (
                      <Badge key={index} bg="success">{ben}</Badge>
                    ))}
                  </div>
                </div>
              )}
 
              <p><strong><FaCalendar className="me-1" />Last Date to Register:</strong> {formatDate(selectedWorkshop.last_date_to_register)}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default ManageJobs
