import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Badge, Form } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminHeader from './AdminHeader'
import axios from 'axios'

import { useAuth } from '../all_login/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaCalendar, FaClock, FaUsers, FaLink } from 'react-icons/fa'

const API_URL = 'https://brjobsedu.com/gyandhara/gyandhara_backend/api/grooming-classes/'
const PARTICIPATION_URL = 'https://brjobsedu.com/gyandhara/gyandhara_backend/api/grooming-participation/'

const ManageGroomingClasses = () => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(10)
  const [showParticipantsModal, setShowParticipantsModal] = useState(false)
  const [participants, setParticipants] = useState([])
  const [loadingParticipants, setLoadingParticipants] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredClasses, setFilteredClasses] = useState([])

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

  useEffect(() => {
    fetchClasses()
  }, [accessToken])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const getAuthConfig = () => ({
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  useEffect(() => {
    let filtered = classes || []

    if (searchTerm !== '') {
      filtered = filtered.filter(gc => {
        if (!gc) return false
        return (gc.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (gc.class_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (gc.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    setFilteredClasses(filtered || [])
    setCurrentPage(1)
  }, [searchTerm, classes])

  const handleClearFilters = () => {
    setSearchTerm('')
  }

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_URL, getAuthConfig())
      if (response.data && response.data.data) {
        setClasses(response.data.data)
        setFilteredClasses(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      setClasses([])
      setFilteredClasses([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (groomingClass) => {
    navigate('/CreateGroomingClass', { state: { editData: groomingClass } })
  }

  const handleDelete = (groomingClass) => {
    setSelectedClass(groomingClass)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(API_URL, {
        data: { class_id: selectedClass.class_id },
        ...getAuthConfig()
      })
      setShowDeleteModal(false)
      fetchClasses()
      alert('Class deleted successfully!')
    } catch (error) {
      console.error('Error deleting class:', error)
      alert('Failed to delete class')
    }
  }

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-'
    const date = new Date(dateTimeString)
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const fetchParticipants = async (classId) => {
    try {
      setLoadingParticipants(true)
      const response = await axios.get(PARTICIPATION_URL, getAuthConfig())
      if (response.data && response.data.data) {
        const filteredParticipants = response.data.data.filter(p => p.class_id === classId)
        setParticipants(filteredParticipants)
        setShowParticipantsModal(true)
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
      setParticipants([])
    } finally {
      setLoadingParticipants(false)
    }
  }

  const handleViewParticipants = (groomingClass) => {
    setSelectedClass(groomingClass)
    fetchParticipants(groomingClass.class_id)
  }

  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredClasses.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredClasses.length / recordsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
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
                  <h4 className="mb-0">Manage Grooming Classes</h4>
                </div>
                <Button variant="primary" size="sm" onClick={() => navigate('/CreateGroomingClass')}>
                  <FaPlus className="me-1" /> Create New Class
                </Button>
              </div>

              <Row>
                <Col xs={12}>
                  <Card className="mb-4">
                    <Card.Body className="py-3">
                      <Row className="g-3 align-items-end">
                        <Col md={6} xs={12}>
                          <Form.Group controlId="searchTerm">
                            <Form.Label className="small fw-medium mb-1">Search</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Search by title, ID, description..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              size="sm"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6} xs={6}>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={handleClearFilters}
                            className="w-100"
                          >
                            Clear Filters
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  <Card className="table-card border">
                    <Card.Header className="bg-white border-bottom py-3 px-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center paid-btn gap-2">
                        <h5 className="mb-0 fw-semibold">
                          All Grooming Classes
                        </h5>
                      </div>
                      <span className="text-muted small">
                        Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredClasses.length)} of {filteredClasses.length} records
                      </span>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive d-none d-lg-block">
                        <Table striped bordered hover responsive className="mb-0">
                          <thead className="bg-primary text-white">
                            <tr>
                              <th className="py-3 px-2">Class ID</th>
                              <th className="py-3 px-2">Title</th>
                              <th className="py-3 px-2">Description</th>
                              <th className="py-3 px-2"><FaLink className="me-1" /> Link</th>
                              <th className="py-3 px-2"><FaCalendar className="me-1" /> Start Time</th>
                              <th className="py-3 px-2"><FaClock className="me-1" /> End Time</th>
                              <th className="py-3 px-2"><FaUsers className="me-1" /> Participants</th>
                              <th className="py-3 px-2 text-end">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentRecords.length === 0 ? (
                              <tr>
                                <td colSpan="8" className="text-center py-4 text-muted">
                                  No grooming classes found
                                </td>
                              </tr>
                            ) : (
                              currentRecords.map((groomingClass) => (
                                <tr key={groomingClass.class_id}>
                                  <td className="py-3 px-2"><span className="text-muted small fw-medium">{groomingClass.class_id}</span></td>
                                  <td className="py-3 px-2 fw-medium text-dark">
                                    {groomingClass.title}
                                    {groomingClass.title_hindi && (
                                      <div className="small text-muted">{groomingClass.title_hindi}</div>
                                    )}
                                  </td>
                                  <td className="py-3 px-2 small" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {groomingClass.description || '-'}
                                  </td>
                                  <td className="py-3 px-2">
                                    {groomingClass.class_link ? (
                                      <a href={groomingClass.class_link} target="_blank" rel="noopener noreferrer" className="text-primary">
                                        <FaLink />
                                      </a>
                                    ) : '-'}
                                  </td>
                                  <td className="py-3 px-2 small">
                                    {formatDateTime(groomingClass.start_date_time)}
                                  </td>
                                  <td className="py-3 px-2 small">
                                    {formatDateTime(groomingClass.end_date_time)}
                                  </td>
                                  <td className="py-3 px-2 text-center">
                                    <Button
                                      variant="outline-dark"
                                      size="sm"
                                      className="p-1"
                                      style={{ width: '28px', height: '28px' }}
                                      onClick={() => handleViewParticipants(groomingClass)}
                                      title="View Participants"
                                    >
                                      <FaUsers style={{ fontSize: '12px' }} />
                                    </Button>
                                  </td>
                                  <td className="py-3 px-2 text-end">
                                    <div className="d-flex gap-1 justify-content-end">
                                      <Button
                                        variant="outline-dark"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleEdit(groomingClass)}
                                        title="Edit"
                                      >
                                        <FaEdit style={{ fontSize: '12px' }} />
                                      </Button>
                                      <Button
                                        variant="outline-dark"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleDelete(groomingClass)}
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
                      <div className="d-lg-none">
                        {currentRecords.length === 0 ? (
                          <div className="text-center py-4 text-muted">
                            No grooming classes found
                          </div>
                        ) : (
                          currentRecords.map((groomingClass) => (
                            <div key={groomingClass.class_id} className="grooming-class-card">
                              <div className="card-header">
                                <span className="class-id">ID: {groomingClass.class_id}</span>
                              </div>
                              <div className="class-title">{groomingClass.title}</div>
                              {groomingClass.title_hindi && (
                                <div className="class-title-hindi">{groomingClass.title_hindi}</div>
                              )}
                              <div className="class-description">
                                {groomingClass.description || 'No description'}
                              </div>
                              <div className="class-info">
                                <div className="info-item">
                                  <span className="label">Link:</span>{' '}
                                  <span className="value">
                                    {groomingClass.class_link ? (
                                      <a href={groomingClass.class_link} target="_blank" rel="noopener noreferrer" className="text-primary">
                                        View
                                      </a>
                                    ) : '-'}
                                  </span>
                                </div>
                                <div className="info-item">
                                  <span className="label">Start:</span>{' '}
                                  <span className="value">{formatDateTime(groomingClass.start_date_time)}</span>
                                </div>
                                <div className="info-item">
                                  <span className="label">End:</span>{' '}
                                  <span className="value">{formatDateTime(groomingClass.end_date_time)}</span>
                                </div>
                              </div>
                              <div className="card-actions">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleViewParticipants(groomingClass)}
                                >
                                  <FaUsers className="me-1" /> Participants
                                </Button>
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleEdit(groomingClass)}
                                >
                                  <FaEdit className="me-1" /> Edit
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDelete(groomingClass)}
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
                        <nav aria-label="Grooming classes pagination">
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
            </Container>
          </div>
        </div>
      </div>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this grooming class?</p>
          <p className="text-muted">Class ID: {selectedClass?.class_id}</p>
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

      <Modal show={showParticipantsModal} onHide={() => setShowParticipantsModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Participants - {selectedClass?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingParticipants ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : participants.length === 0 ? (
            <p className="text-center text-muted py-4">No participants found for this class</p>
          ) : (
            <Table hover responsive>
              <thead className="table-light">
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined At</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.id}>
                    <td>{participant.student_details?.student_id || '-'}</td>
                    <td>{participant.student_details?.full_name || '-'}</td>
                    <td>{participant.student_details?.email || '-'}</td>
                    <td>{participant.student_details?.phone || '-'}</td>
                    <td>{formatDateTime(participant.joined_at)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowParticipantsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default ManageGroomingClasses