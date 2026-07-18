import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Spinner, Modal, Form, Badge, Table } from 'react-bootstrap'

import axios from 'axios'
import '../../assets/css/admindashboard.css'
import { useAuth } from '../all_login/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronUp, FaTimes, FaEye, FaImage as FaImageIcon } from 'react-icons/fa'
import AdminLeftNav from './AdminLeftNav'
import AdminHeader from './AdminHeader'

const API_URL = 'https://brjobsedu.com/Epathshala/Epathshala_backend/api/course-items/'

const Managecourse = () => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  })
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(10)
  const [filterStatus, setFilterStatus] = useState('all')
  const [isEditing, setIsEditing] = useState(false)

  const [courseForm, setCourseForm] = useState({
    course_name: '',
    course_desc: '',
    course_name_hindi: '',
    course_desc_hindi: '',
    course_status: 'unpaid',
    price: '0.0',
    start_date: '',
    end_date: '',
    course_img: null
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

  useEffect(() => {
    if (accessToken) {
      fetchCourses()
    }
  }, [accessToken])

  useEffect(() => {
    let filtered = courses || []

    if (searchTerm !== '') {
      filtered = filtered.filter(course => {
        if (!course) return false
        return (course.course_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (course.course_desc || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (course.course_status || '').toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(course => course && course.course_status === filterStatus)
    }

    setFilteredCourses(filtered || [])
    setCurrentPage(1)
  }, [searchTerm, courses, filterStatus])

  const fetchCourses = async () => {
    if (!accessToken) {
      console.log('No access token, waiting...')
      return
    }
    
    try {
      setLoading(true)
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      let fetchedCourses = []
      if (response.data && response.data.data) {
        fetchedCourses = response.data.data
      } else if (Array.isArray(response.data)) {
        fetchedCourses = response.data
      }

      setCourses(fetchedCourses)
      setFilteredCourses(fetchedCourses)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setCourses([])
      setFilteredCourses([])
    } finally {
      setLoading(false)
    }
  }

  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredCourses.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredCourses.length / recordsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleAddCourse = () => {
    setIsEditing(false)
    setCourseForm({
      course_name: '',
      course_desc: '',
      course_name_hindi: '',
      course_desc_hindi: '',
      course_status: 'unpaid',
      price: '0.0',
      start_date: '',
      end_date: '',
      course_img: null
    })
    setShowModal(true)
  }

  const handleEditCourse = (course) => {
    setIsEditing(true)
    setSelectedCourse(course)
    setCourseForm({
      course_name: course.course_name || '',
      course_desc: course.course_desc || '',
      course_name_hindi: course.course_name_hindi || '',
      course_desc_hindi: course.course_desc_hindi || '',
      course_status: course.course_status || 'unpaid',
      price: course.price || '0.0',
      start_date: course.start_date ? course.start_date.split('T')[0] : '',
      end_date: course.end_date ? course.end_date.split('T')[0] : '',
      course_img: null
    })
    setShowModal(true)
  }

  const handleDelete = (course) => {
    setSelectedCourse(course)
    setShowDeleteModal(true)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
  }

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target
    if (type === 'file') {
      setCourseForm(prev => ({
        ...prev,
        [name]: files[0] || null
      }))
    } else {
      setCourseForm(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const submitCourse = async () => {
    if (!accessToken) {
      alert('Authentication required')
      return
    }

    if (!courseForm.course_name || !courseForm.course_status) {
      alert("Please fill in required fields (Course Name, Status)")
      return
    }

    try {
      const payload = {
        course_id: isEditing ? selectedCourse.course_id : undefined,
        course_name: courseForm.course_name,
        course_desc: courseForm.course_desc,
        course_name_hindi: courseForm.course_name_hindi,
        course_desc_hindi: courseForm.course_desc_hindi,
        course_status: courseForm.course_status,
        price: parseFloat(courseForm.price) || 0.0,
        start_date: courseForm.start_date ? new Date(courseForm.start_date).toISOString().split('T')[0] : null,
        end_date: courseForm.end_date ? new Date(courseForm.end_date).toISOString().split('T')[0] : null
      }

       if (isEditing) {
        await axios.put(`${API_URL}`, payload, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
      } else {
        await axios.post(API_URL, payload, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
      }

      setShowModal(false)
      fetchCourses()
      alert(isEditing ? 'Course updated successfully!' : 'Course created successfully!')
    } catch (error) {
      console.error('Error saving course:', error)
      console.error('Response data:', error.response?.data)
      alert(error.response?.data?.message || 'Failed to save course. Check console for details.')
    }
  }

  const confirmDelete = async () => {
    if (!accessToken) {
      alert('Authentication required')
      return
    }
    
    try {
      await axios.delete(`${API_URL}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      setShowDeleteModal(false)
      fetchCourses()
      alert('Course deleted successfully!')
    } catch (error) {
      console.error('Error deleting course:', error)
      alert('Failed to delete course')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
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
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => navigate("/AdminDashboard")}
                    className="me-2"
                  >
                    <FaArrowLeft /> Dashboard
                  </Button>
                  <h4 className="mb-0">Course Management</h4>
                </div>
                <Button variant="primary" onClick={handleAddCourse}>
                  <FaPlus className="me-1" /> Add New Course
                </Button>
              </div>

              <Row>
                <Col xs={12}>
                  <Card className="mb-4">
                    <Card.Body className="py-3">
                      <Row className="g-3 align-items-end">
                        <Col md={4} xs={12}>
                          <Form.Group controlId="searchTerm">
                            <Form.Label className="small fw-medium mb-1">
                              Search
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Search by name, description..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              size="sm"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4} xs={6}>
                          <Form.Group controlId="filterStatus">
                            <Form.Label className="small fw-medium mb-1">
                              Status
                            </Form.Label>
                            <Form.Select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                              size="sm"
                            >
                              <option value="all">All Status</option>
                              <option value="unpaid">Unpaid</option>
                              <option value="paid">Paid</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4} xs={6}>
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
                        <h5 className="mb-0 fw-semibold">All Courses</h5>
                      </div>
                      <span className="text-muted small">
                        Showing {indexOfFirstRecord + 1} to{" "}
                        {Math.min(indexOfLastRecord, filteredCourses.length)} of{" "}
                        {filteredCourses.length} records
                      </span>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive d-none d-lg-block">
                        <table className="table table-striped table-bordered table-hover mb-0">
                          <thead className="bg-primary text-white">
                            <tr>
                              <th className="py-3 px-2">Course ID</th>
                              <th className="py-3 px-2">Image</th>
                              <th className="py-3 px-2">Course Name</th>
                              <th className="py-3 px-2">Description</th>
                              <th className="py-3 px-2">Status</th>
                              <th className="py-3 px-2">Price</th>
                              <th className="py-3 px-2">Start Date</th>
                              <th className="py-3 px-2">End Date</th>
                              <th className="py-3 px-2 text-end">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentRecords.length === 0 ? (
                              <tr>
                                <td
                                  colSpan="9"
                                  className="text-center py-4 text-muted"
                                >
                                  No courses found
                                </td>
                              </tr>
                            ) : (
                              currentRecords.map((course) => (
                                <tr key={course.id}>
                                  <td className="py-3 px-2 fw-medium text-dark">
                                    {course.course_id || '-'} 
                                  </td>
                                  <td className="py-3 px-2">
                                    {course.course_img ? (
                                      <img 
                                        src={course.course_img} 
                                        alt={course.course_name}
                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <FaImageIcon className="text-muted" style={{ fontSize: '24px' }} />
                                    )}
                                  </td>
                                  <td className="py-3 px-2 fw-medium text-dark">
                                    {course.course_name}
                                    {course.course_name_hindi && (
                                      <div className="text-muted small">
                                        {course.course_name_hindi}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 px-2 small">
                                    <div className="text-truncate" style={{ maxWidth: '250px' }}>
                                      {course.course_desc || '-'}
                                    </div>
                                    {course.course_desc_hindi && (
                                      <div className="text-muted small">
                                        {course.course_desc_hindi}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 px-2 small">
                                    <Badge
                                      bg={
                                        course.course_status === 'paid'
                                          ? "success"
                                          : "warning"
                                      }
                                      className="text-dark"
                                    >
                                      {course.course_status || 'unpaid'}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-2 small fw-medium">
                                    ₹{course.price || '0.00'}
                                  </td>
                                  <td className="py-3 px-2 small">
                                    {formatDate(course.start_date)}
                                  </td>
                                  <td className="py-3 px-2 small">
                                    {formatDate(course.end_date)}
                                  </td>
                                  <td className="py-3 px-2 text-end">
                                    <div className="d-flex gap-2 justify-content-end">
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className=""
                                        style={{ padding: "4px 10px" }}
                                        onClick={() => handleEditCourse(course)}
                                        title="Edit Course"
                                      >
                                        <FaEdit /> Edit
                                      </Button>
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        className="text-white"
                                        style={{ padding: "4px 10px" }}
                                        onClick={() => handleDelete(course)}
                                        title="Delete Course"
                                      >
                                        <FaTrash /> Delete
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="d-lg-none">
                        {currentRecords.length === 0 ? (
                          <div className="text-center py-4 text-muted">
                            No courses found
                          </div>
                        ) : (
                          currentRecords.map((course) => (
                            <Card key={course.id} className="mb-3 mx-2">
                              <Card.Body className="p-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <h6 className="mb-1 fw-semibold">
                                      {course.course_name}
                                    </h6>
                                    <small className="text-muted">
                                      ID: {course.course_id || '-'}
                                    </small>
                                  </div>
                                  <Badge
                                    bg={
                                      course.course_status === 'paid'
                                        ? "success"
                                        : "warning"
                                    }
                                    className="text-dark"
                                  >
                                    {course.course_status || 'unpaid'}
                                  </Badge>
                                </div>

                                {course.course_img && (
                                  <div className="mb-2 text-center">
                                    <img 
                                      src={course.course_img} 
                                      alt={course.course_name}
                                      style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}

                                {course.course_desc && (
                                  <div className="mb-2">
                                    <small className="text-muted d-block">
                                      Description:
                                    </small>
                                    <span className="small">
                                      {course.course_desc}
                                    </span>
                                  </div>
                                )}

                                <div className="mb-2">
                                  <small className="text-muted d-block">
                                    Price:
                                  </small>
                                  <span className="small fw-medium">
                                    ₹{course.price || '0.00'}
                                  </span>
                                </div>

                                <div className="mb-2">
                                  <small className="text-muted d-block">
                                    Duration:
                                  </small>
                                  <span className="small">
                                    {formatDate(course.start_date)} - {formatDate(course.end_date)}
                                  </span>
                                </div>

                                <div className="d-flex gap-2 mt-3 pt-3 border-top">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="flex-fill"
                                    onClick={() => handleEditCourse(course)}
                                  >
                                    <FaEdit className="me-1" /> Edit
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="flex-fill"
                                    onClick={() => handleDelete(course)}
                                  >
                                    <FaTrash className="me-1" /> Delete
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          ))
                        )}
                      </div>
                    </Card.Body>
                    {totalPages > 1 && (
                      <Card.Footer className="bg-light border-top py-2 px-3">
                        <nav aria-label="Courses pagination">
                          <ul className="pagination justify-content-center pagination-sm mb-0">
                            <li
                              className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                            >
                              <button
                                className="page-link"
                                onClick={handlePreviousPage}
                              >
                                <i className="fas fa-chevron-left"></i>
                              </button>
                            </li>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter((page) => {
                                return (
                                  page >= currentPage - 1 &&
                                  page <= currentPage + 1 &&
                                  page <= totalPages &&
                                  page >= 1
                                );
                              })
                              .map((page) => (
                                <li
                                  key={page}
                                  className={`page-item ${
                                    page === currentPage ? "active" : ""
                                  }`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() => handlePageChange(page)}
                                  >
                                    {page}
                                  </button>
                                </li>
                              ))}

                            <li
                              className={`page-item ${
                                currentPage === totalPages ? "disabled" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={handleNextPage}
                              >
                                <i className="fas fa-chevron-right"></i>
                              </button>
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

      {/* Add/Edit Course Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="xl"
      >
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">
            {isEditing ? "Edit Course" : "Add New Course"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          <Form>
            <Row className="mb-3">
              <Col md={6} xs={12}>
                <Form.Group>
                  <Form.Label>Course Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="course_name"
                    value={courseForm.course_name}
                    onChange={handleInputChange}
                    placeholder="Enter course name"
                  />
                </Form.Group>
              </Col>
              <Col md={6} xs={12}>
                <Form.Group>
                  <Form.Label>Course Name (Hindi)</Form.Label>
                  <Form.Control
                    type="text"
                    name="course_name_hindi"
                    value={courseForm.course_name_hindi}
                    onChange={handleInputChange}
                    placeholder="कोर्स का नाम"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6} xs={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="course_desc"
                    value={courseForm.course_desc}
                    onChange={handleInputChange}
                    placeholder="Enter course description"
                  />
                </Form.Group>
              </Col>
              <Col md={6} xs={12}>
                <Form.Group>
                  <Form.Label>Description (Hindi)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="course_desc_hindi"
                    value={courseForm.course_desc_hindi}
                    onChange={handleInputChange}
                    placeholder="कोर्स विवरण"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={3} xs={12}>
                <Form.Group>
                  <Form.Label>Status *</Form.Label>
                  <Form.Select
                    name="course_status"
                    value={courseForm.course_status}
                    onChange={handleInputChange}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} xs={12}>
                <Form.Group>
                  <Form.Label>Price (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="price"
                    value={courseForm.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={3} xs={12}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={courseForm.start_date}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3} xs={12}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={courseForm.end_date}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6} xs={12}>
                <Form.Group>
                  <Form.Label>Course Image</Form.Label>
                  <Form.Control
                    type="file"
                    name="course_img"
                    onChange={handleInputChange}
                    accept="image/*"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-top py-2 px-3">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitCourse}>
            {isEditing ? "Update Course" : "Create Course"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          <p>Are you sure you want to delete this course?</p>
          <p className="text-muted">
            Course: {selectedCourse?.course_name}
            {selectedCourse?.course_name_hindi && (
              <>
                <br />
                {selectedCourse.course_name_hindi}
              </>
            )}
          </p>
        </Modal.Body>
        <Modal.Footer className="border-top py-2 px-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <FaTrash className="me-1" /> Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Managecourse