import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Form } from 'react-bootstrap'
import axios from 'axios'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import '../../assets/css/admindashboard.css'
import { useAuth } from '../all_login/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaChevronDown, FaChevronRight } from 'react-icons/fa'
import AdminLeftNav from './AdminLeftNav'
import AdminHeader from './AdminHeader'

const API_URL = 'https://brjobsedu.com/gyandhara/gyandhara_backend/api/course-feedback/'

const CourseFeedback = () => {
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
  const [feedbacks, setFeedbacks] = useState([])
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(15)
  const [expandedCards, setExpandedCards] = useState({})

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
      fetchFeedbacks()
    }
  }, [accessToken])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  useEffect(() => {
    let filtered = feedbacks || []

    if (searchTerm !== '') {
      filtered = filtered.filter(feedback => {
        if (!feedback) return false
        return (feedback.course_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (feedback.course_id || '').toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    setFilteredFeedbacks(filtered || [])
    setCurrentPage(1)
  }, [searchTerm, feedbacks])

  const fetchFeedbacks = async () => {
    if (!accessToken) {
      console.log('No access token, waiting...')
      return
    }

    const summarizeData = (data) => {
      const summaryMap = {}
      
      data.forEach(fb => {
        const cid = fb.course_id
        if (!summaryMap[cid]) {
          summaryMap[cid] = {
            course_id: cid,
            course_name: fb.course_name,
            total_stars: 0,
            total_questions: 0,
            feedback_count: 0
          }
        }
        
        const q1 = parseInt(fb.question_1) || 0
        const q2 = parseInt(fb.question_2) || 0
        const q3 = parseInt(fb.question_3) || 0
        const q4 = parseInt(fb.question_4) || 0
        const q5 = parseInt(fb.question_5) || 0
        
        summaryMap[cid].total_stars += (q1 + q2 + q3 + q4 + q5)
        summaryMap[cid].total_questions += 5
        summaryMap[cid].feedback_count += 1
      })
      
      return Object.values(summaryMap).map(item => ({
        ...item,
        average_rating: (item.total_stars / item.total_questions).toFixed(1)
      }))
    }

    try {
      setLoading(true)
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.data && response.data.data) {
        const summarized = summarizeData(response.data.data)
        setFeedbacks(summarized)
        setFilteredFeedbacks(summarized)
      } else if (Array.isArray(response.data)) {
        const summarized = summarizeData(response.data)
        setFeedbacks(summarized)
        setFilteredFeedbacks(summarized)
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
      setFeedbacks([])
      setFilteredFeedbacks([])
    } finally {
      setLoading(false)
    }
  }

  const toggleCardExpansion = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRatingStars = (rating) => {
    const num = parseInt(rating) || 0
    return (
      <span className="rating-stars" style={{ color: '#f39c12', fontSize: '1.15em', letterSpacing: '1px' }}>
        {'★'.repeat(num)}{'☆'.repeat(5 - num)}
      </span>
    )
  }

  const downloadExcel = () => {
    const dataToExport = filteredFeedbacks.map(feedback => ({
      'Course ID': feedback.course_id,
      'Course Name': feedback.course_name,
      'Average Rating': feedback.average_rating,
      'Total Feedback Count': feedback.feedback_count,
      'Total Stars': feedback.total_stars,
      'Total Questions': feedback.total_questions
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Course Feedback')
    XLSX.writeFile(wb, `course_feedback_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const downloadPDF = () => {
    const doc = new jsPDF()

    const tableColumn = [
      'Course ID',
      'Course Name',
      'Average Rating',
      'Total Feedback Count'
    ]

    const tableRows = filteredFeedbacks.map(feedback => [
      feedback.course_id,
      feedback.course_name,
      feedback.average_rating,
      feedback.feedback_count
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    })

    doc.text('Course Feedback Report', 14, 15)
    doc.save(`course_feedback_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredFeedbacks.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredFeedbacks.length / recordsPerPage)

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
                  <h4 className="mb-0">Course Feedback</h4>
                </div>
              </div>

              <Row>
                <Col xs={12}>
                  {/* Filter Section */}
                  <Card className="mb-4">
                    <Card.Body className="py-3">
                      <Row className="g-3 align-items-end">
                        <Col md={6} xs={12}>
                          <Form.Group controlId="searchTerm">
                            <Form.Label className="small fw-medium mb-1">Search</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Search by course name or ID..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              size="sm"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6} xs={12}>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setSearchTerm('')}
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
                           All Feedbacks
                         </h5>
                         <Button
                           variant="outline-success"
                           size="sm"
                           onClick={downloadExcel}
                           className="ms-2"
                           title="Download Excel"
                         >
                           <i className="bi bi-file-earmark-excel me-1"></i>
                           Excel
                         </Button>
                         <Button
                           variant="outline-danger"
                           size="sm"
                           onClick={downloadPDF}
                           title="Download PDF"
                         >
                           <i className="bi bi-file-earmark-pdf me-1"></i>
                           PDF
                         </Button>
                       </div>
                       <span className="text-muted small">
                         Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredFeedbacks.length)} of {filteredFeedbacks.length} records
                       </span>
                     </Card.Header>
                    <Card.Body className="p-0">
                      {/* Desktop Table View */}
                      <div className="table-responsive d-none d-lg-block">
                        <Table striped bordered hover responsive className="mb-0">
                          <thead className="bg-primary text-white">
                            <tr>
                              <th className="py-3 px-2">Course ID</th>
                              <th className="py-3 px-2">Course Name</th>
                              <th className="py-3 px-2">Average Rating</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentRecords.length === 0 ? (
                              <tr>
                                <td colSpan="11" className="text-center py-4 text-muted">
                                  No feedbacks found
                                </td>
                              </tr>
                            ) : (
                              currentRecords.map((feedback) => (
                                <tr key={feedback.course_id}>
                                  <td className="py-3 px-2 small">{feedback.course_id}</td>
                                  <td className="py-3 px-2 small">{feedback.course_name}</td>
                                  <td className="py-3 px-2 small">
                                    {getRatingStars(feedback.average_rating)} ({feedback.average_rating})
                                    <div className="text-muted extra-small">Based on {feedback.feedback_count} reviews</div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </Table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="d-lg-none">
                        {currentRecords.length === 0 ? (
                          <div className="text-center py-4 text-muted">
                            No feedbacks found
                          </div>
                        ) : (
                          currentRecords.map((feedback) => (
                            <Card key={feedback.course_id} className="mb-3 mx-2">
                              <Card.Body className="p-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <h6 className="mb-1 fw-semibold">{feedback.course_name}</h6>
                                    <small className="text-muted">Course ID: {feedback.course_id}</small>
                                  </div>
                                </div>

                                <div className="mb-2">
                                  <small className="text-muted d-block">Average Rating:</small>
                                  <span className="small fw-medium">{getRatingStars(feedback.average_rating)} ({feedback.average_rating})</span>
                                  <div className="text-muted small">From {feedback.feedback_count} reviews</div>
                                </div>
                              </Card.Body>
                            </Card>
                          ))
                        )}
                      </div>
                    </Card.Body>
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Card.Footer className="bg-light border-top py-2 px-3">
                        <nav aria-label="Feedbacks pagination">
                          <ul className="pagination justify-content-center pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={handlePreviousPage}>
                                <i className="fas fa-chevron-left"></i>
                              </button>
                            </li>

                            {/* Previous pages */}
                            {currentPage > 2 && (
                              <li className="page-item">
                                <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
                              </li>
                            )}
                            {currentPage > 3 && (
                              <li className="page-item disabled">
                                <span className="page-link">...</span>
                              </li>
                            )}

                            {/* Current and surrounding pages */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(page => {
                              return page >= currentPage - 1 && page <= currentPage + 1 && page <= totalPages && page >= 1
                            }).map(page => (
                              <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(page)}>
                                  {page}
                                </button>
                              </li>
                            ))}

                            {/* Next pages */}
                            {currentPage < totalPages - 2 && (
                              <li className="page-item disabled">
                                <span className="page-link">...</span>
                              </li>
                            )}
                            {currentPage < totalPages - 1 && (
                              <li className="page-item">
                                <button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
                              </li>
                            )}

                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={handleNextPage}>
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
    </>
  )
}

export default CourseFeedback
