import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Form, Badge, Tabs, Tab } from 'react-bootstrap'

import axios from 'axios'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import '../../assets/css/admindashboard.css'
import { useAuth } from '../all_login/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaReply, FaCheck, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import AdminLeftNav from './AdminLeftNav'
import AdminHeader from './AdminHeader'

const STUDENT_API_URL = 'https://brjobsedu.com/epathshala/epathshala_backend/api/student-issue/'
const SCHOOL_API_URL = 'https://brjobsedu.com/epathshala/epathshala_backend/api/school-issues/'

const StudentIssue = () => {
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
  const [queries, setQueries] = useState([])
  const [filteredQueries, setFilteredQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(15)
  const [filterStatus, setFilterStatus] = useState('all')
  const [activeTab, setActiveTab] = useState('student')
  const [expandedCards, setExpandedCards] = useState({})

  // Reply form state
  const [replyData, setReplyData] = useState({
    extra_remark: '',
    status: ''
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
      fetchQueries()
    }
  }, [accessToken, activeTab])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  useEffect(() => {
    // Filter queries based on search term and status
    let filtered = queries || []

    // Apply search filter
    if (searchTerm !== '') {
      filtered = filtered.filter(query => {
        if (!query) return false
        const search = searchTerm.toLowerCase()
        if (activeTab === 'student') {
          return (query.full_name || '').toLowerCase().includes(search) ||
            (query.student_id || '').toLowerCase().includes(search) ||
            (query.school_name || '').toLowerCase().includes(search) ||
            (query.school_uni_id || '').toLowerCase().includes(search) ||
            (query.title || '').toLowerCase().includes(search) ||
            (query.query_id || '').toLowerCase().includes(search)
        } else {
          return (query.school_name || '').toLowerCase().includes(search) ||
            (query.school_id || '').toLowerCase().includes(search) ||
            (query.student_uni_id || '').toLowerCase().includes(search) ||
            (query.title || '').toLowerCase().includes(search) ||
            (query.query_id || '').toLowerCase().includes(search)
        }
      })
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(query => query && query.status === filterStatus)
    }

    setFilteredQueries(filtered || [])
    setCurrentPage(1)
  }, [searchTerm, queries, filterStatus, activeTab])

  const fetchQueries = async () => {
    if (!accessToken) {
      console.log('No access token, waiting...')
      return
    }
    
    try {
      setLoading(true)
      const url = activeTab === 'student' ? STUDENT_API_URL : SCHOOL_API_URL
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.data && response.data.data) {
        setQueries(response.data.data)
        setFilteredQueries(response.data.data)
      } else if (Array.isArray(response.data)) {
        setQueries(response.data)
        setFilteredQueries(response.data)
      }
    } catch (error) {
      console.error('Error fetching queries:', error)
      setQueries([])
      setFilteredQueries([])
    } finally {
      setLoading(false)
    }
  }

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredQueries.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredQueries.length / recordsPerPage)

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

  const handleReply = (query) => {
    setSelectedQuery(query)
    setReplyData({
      extra_remark: query.extra_remark || '',
      status: query.status || 'pending'
    })
    setShowReplyModal(true)
  }

  const handleDelete = (query) => {
    setSelectedQuery(query)
    setShowDeleteModal(true)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
  }

  const toggleCardExpansion = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const submitReply = async () => {
    if (!accessToken) {
      alert('Authentication required')
      return
    }
    
    try {
      const payload = {
        query_id: selectedQuery.query_id,
        extra_remark: replyData.extra_remark,
        status: replyData.status
      }

      const url = activeTab === 'student' ? STUDENT_API_URL : SCHOOL_API_URL
      await axios.put(url, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      setShowReplyModal(false)
      fetchQueries()
      alert('Query updated successfully!')
    } catch (error) {
      console.error('Error updating query:', error)
      alert('Failed to update query')
    }
  }

  const confirmDelete = async () => {
    if (!accessToken) {
      alert('Authentication required')
      return
    }
    
    try {
      const url = activeTab === 'student' ? STUDENT_API_URL : SCHOOL_API_URL
      await axios.delete(url, {
        data: { query_id: selectedQuery.query_id },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      setShowDeleteModal(false)
      fetchQueries()
      alert('Query deleted successfully!')
    } catch (error) {
      console.error('Error deleting query:', error)
      alert('Failed to delete query')
    }
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

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge bg="warning" text="dark">Pending</Badge>
      case 'accepted':
      case 'resolved':
        return <Badge bg="success">Resolved</Badge>
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>
      default:
        return <Badge bg="secondary">{status || 'Pending'}</Badge>
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-warning text-dark'
      case 'accepted':
      case 'resolved':
        return 'bg-success'
      case 'rejected':
        return 'bg-danger'
      default:
        return 'bg-secondary'
    }
  }

  const downloadExcel = () => {
    const dataToExport = filteredQueries.map(query => ({
      'Query ID': query.query_id,
      [activeTab === 'student' ? 'Student Name' : 'School Name']: activeTab === 'student' ? query.full_name : query.school_name,
      [activeTab === 'student' ? 'Student ID' : 'School/Uni ID']: activeTab === 'student' ? query.student_id : (query.school_id || query.student_uni_id),
      ...(activeTab === 'student' ? {
        'School Name': query.school_name || '-',
        'School ID': query.school_uni_id || '-'
      } : {}),
      'Title': query.title,
      'Issue': query.issue,
      'Status': query.status || 'pending',
      'Extra Remark': query.extra_remark || '-',
      'Date': formatDate(query.created_at)
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, `${activeTab === 'student' ? 'Student' : 'School'} Queries`)
    XLSX.writeFile(wb, `${activeTab}_queries_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const downloadPDF = () => {
    const doc = new jsPDF()

    const tableColumn = [
      'Query ID',
      activeTab === 'student' ? 'Student Name' : 'School Name',
      activeTab === 'student' ? 'Student ID' : 'School/Uni ID',
      ...(activeTab === 'student' ? ['School Name', 'School ID'] : []),
      'Title',
      'Issue',
      'Status',
      'Extra Remark',
      'Date'
    ]

    const tableRows = filteredQueries.map(query => [
      query.query_id,
      activeTab === 'student' ? query.full_name : query.school_name,
      activeTab === 'student' ? query.student_id : (query.school_id || query.student_uni_id),
      ...(activeTab === 'student' ? [query.school_name || '-', query.school_uni_id || '-'] : []),
      query.title,
      query.issue,
      query.status || 'pending',
      query.extra_remark || '-',
      formatDate(query.created_at)
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

    doc.text(`${activeTab === 'student' ? 'Student' : 'School'} Queries Report`, 14, 15)
    doc.save(`${activeTab}_queries_${new Date().toISOString().split('T')[0]}.pdf`)
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
                <h4 className="mb-0">Issues / Queries</h4>
              </div>
            </div>

            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
              <Tab eventKey="student" title="Student Queries" />
              <Tab eventKey="school" title="School Queries" />
            </Tabs>

            <Row>
              <Col xs={12}>
                  {/* Filter Section */}
                  <Card className="mb-4">
                    <Card.Body className="py-3">
                      <Row className="g-3 align-items-end">
                        <Col md={4} xs={12}>
                          <Form.Group controlId="searchTerm">
                            <Form.Label className="small fw-medium mb-1">Search</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Search by name, ID, title..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              size="sm"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4} xs={6}>
                          <Form.Group controlId="filterStatus">
                            <Form.Label className="small fw-medium mb-1">Status</Form.Label>
                            <Form.Select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                              size="sm"
                            >
                              <option value="all">All Status</option>
                              <option value="pending">Pending</option>
                              <option value="accepted">Accepted</option>
                              <option value="resolved">Resolved</option>
                              <option value="rejected">Rejected</option>
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
                         <h5 className="mb-0 fw-semibold">
                           All Queries
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
                         Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredQueries.length)} of {filteredQueries.length} records
                       </span>
                     </Card.Header>
                    <Card.Body className="p-0">
                      {/* Desktop Table View */}
                      <div className="table-responsive d-none d-lg-block">
                        <Table striped bordered hover responsive className="mb-0">
                          <thead className="bg-primary text-white">
                            <tr>
                              <th className="py-3 px-2">Query ID</th>
                              <th className="py-3 px-2">{activeTab === 'student' ? 'Student Name' : 'Institution Name'}</th>
                              <th className="py-3 px-2">{activeTab === 'student' ? 'Student ID' : 'Institution/Uni ID'}</th>
                              {activeTab === 'student' && (
                                <>
                                  <th className="py-3 px-2">Institution Name</th>
                                  <th className="py-3 px-2">Institution ID</th>
                                </>
                              )}
                              <th className="py-3 px-2">Title</th>
                              <th className="py-3 px-2">Issue</th>
                              <th className="py-3 px-2">Status</th>
                              <th className="py-3 px-2">Extra Remark</th>
                              <th className="py-3 px-2">Date</th>
                              <th className="py-3 px-2 text-end">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentRecords.length === 0 ? (
                              <tr>
                                <td colSpan={activeTab === 'student' ? 11 : 9} className="text-center py-4 text-muted">
                                  No {activeTab} queries found
                                </td>
                              </tr>
                            ) : (
                              currentRecords.map((query) => (
                                <tr key={query.id}>
                                  <td className="py-3 px-2"><span className="text-muted small fw-medium">{query.query_id}</span></td>
                                  <td className="py-3 px-2 fw-medium text-dark">{activeTab === 'student' ? query.full_name : query.school_name}</td>
                                  <td className="py-3 px-2 small">{activeTab === 'student' ? query.student_id : (query.school_id || query.student_uni_id)}</td>
                                  {activeTab === 'student' && (
                                    <>
                                      <td className="py-3 px-2 small">{query.school_name || '-'}</td>
                                      <td className="py-3 px-2 small">{query.school_uni_id || '-'}</td>
                                    </>
                                  )}
                                  <td className="py-3 px-2 small">{query.title}</td>
                                  <td className="py-3 px-2 small" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {query.issue}
                                  </td>
                                  <td className="py-3 px-2 small">
                                    {getStatusBadge(query.status)}
                                  </td>
                                  <td className="py-3 px-2 small text-muted" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {query.extra_remark || '-'}
                                  </td>
                                  <td className="py-3 px-2 small">{formatDate(query.created_at)}</td>
                                  <td className="py-3 px-2 text-end">
                                    <div className="d-flex gap-1 justify-content-end">
                                     <Button
                                       variant="outline-primary"
                                       size="sm"
                                       className="p-1"
                                       style={{ width: '28px', height: '28px' }}
                                       onClick={() => handleReply(query)}
                                       title="Reply"
                                     >
                                       <FaReply style={{ fontSize: '12px' }} />
                                     </Button>
                                     <Button
                                       variant="outline-danger"
                                       size="sm"
                                       className="p-1"
                                       style={{ width: '28px', height: '28px' }}
                                       onClick={() => handleDelete(query)}
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

                      {/* Mobile Card View */}
                      <div className="d-lg-none">
                        {currentRecords.length === 0 ? (
                          <div className="text-center py-4 text-muted">
                            No queries found
                          </div>
                        ) : (
                          currentRecords.map((query) => (
                            <Card key={query.id} className="mb-3 mx-2">
                              <Card.Body className="p-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <h6 className="mb-1 fw-semibold">{activeTab === 'student' ? query.full_name : query.school_name}</h6>
                                    <small className="text-muted">ID: {activeTab === 'student' ? query.student_id : (query.school_id || query.student_uni_id)}</small>
                                    {activeTab === 'student' && (
                                      <div className="mt-1 border-top pt-1">
                                        <small className="text-muted d-block">Institution: {query.school_name}</small>
                                        <small className="text-muted d-block">Inst. ID: {query.school_uni_id}</small>
                                      </div>
                                    )}
                                  </div>
                                  {getStatusBadge(query.status)}
                                </div>
                                
                                <div className="mb-2">
                                  <small className="text-muted d-block">Title:</small>
                                  <span className="small fw-medium">{query.title}</span>
                                </div>

                                <div className="mb-2">
                                  <small className="text-muted d-block">Date:</small>
                                  <span className="small">{formatDate(query.created_at)}</span>
                                </div>

                                {/* Expandable Details */}
                                <div className="mt-3">
                                  <Button 
                                    variant="link" 
                                    className="p-0 text-decoration-none d-flex align-items-center gap-1"
                                    onClick={() => toggleCardExpansion(query.id)}
                                  >
                                    {expandedCards[query.id] ? <FaChevronUp /> : <FaChevronDown />}
                                    <small>{expandedCards[query.id] ? 'Hide Details' : 'Show Details'}</small>
                                  </Button>
                                  
                                  {expandedCards[query.id] && (
                                    <div className="mt-3 pt-3 border-top">
                                      <Row className="g-2">
                                        <Col xs={12}>
                                          <small className="text-muted d-block">Issue:</small>
                                          <p className="small mb-0 mt-1">{query.issue}</p>
                                        </Col>
                                        {query.extra_remark && (
                                          <Col xs={12}>
                                            <small className="text-muted d-block">Extra Remark:</small>
                                            <p className="small mb-0 mt-1">{query.extra_remark}</p>
                                          </Col>
                                        )}
                                      </Row>
                                    </div>
                                  )}
                                </div>

                                 {/* Action Buttons */}
                                 <div className="d-flex gap-2 mt-3 pt-3 border-top">
                                   <Button
                                     variant="primary"
                                     size="sm"
                                     className="flex-fill"
                                     onClick={() => handleReply(query)}
                                   >
                                     <FaReply className="me-1" /> Reply
                                   </Button>
                                   <Button
                                     variant="danger"
                                     size="sm"
                                     className="flex-fill"
                                     onClick={() => handleDelete(query)}
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
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Card.Footer className="bg-light border-top py-2 px-3">
                        <nav aria-label="Queries pagination">
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

      {/* Reply Modal */}
      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">
            Reply to Query - {selectedQuery?.query_id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          {selectedQuery && (
            <div>
              <Row className="mb-3">
                <Col md={6} xs={12}>
                  <p className="mb-1"><strong>{activeTab === 'student' ? 'Student Name:' : 'Institution Name:'}</strong></p>
                  <p className="text-muted">{activeTab === 'student' ? selectedQuery.full_name : selectedQuery.school_name}</p>
                </Col>
                <Col md={6} xs={12}>
                  <p className="mb-1"><strong>{activeTab === 'student' ? 'Student ID:' : 'Institution/Uni ID:'}</strong></p>
                  <p className="text-muted">{activeTab === 'student' ? selectedQuery.student_id : (selectedQuery.school_id || selectedQuery.student_uni_id)}</p>
                </Col>
              </Row>
              {activeTab === 'student' && (
                <Row className="mb-3">
                  <Col md={6} xs={12}>
                    <p className="mb-1"><strong>Institution Name:</strong></p>
                    <p className="text-muted">{selectedQuery.school_name}</p>
                  </Col>
                  <Col md={6} xs={12}>
                    <p className="mb-1"><strong>Institution ID:</strong></p>
                    <p className="text-muted">{selectedQuery.school_uni_id}</p>
                  </Col>
                </Row>
              )}
              <Row className="mb-3">
                <Col md={12}>
                  <p className="mb-1"><strong>Title:</strong></p>
                  <p className="text-muted">{selectedQuery.title}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <p className="mb-1"><strong>Issue:</strong></p>
                  <p className="text-muted">{selectedQuery.issue}</p>
                </Col>
              </Row>
              <hr />
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label><strong>Update Status</strong></Form.Label>
                  <Form.Select
                    value={replyData.status}
                    onChange={(e) => setReplyData({ ...replyData, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label><strong>Reply / Extra Remark</strong></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={replyData.extra_remark}
                    onChange={(e) => setReplyData({ ...replyData, extra_remark: e.target.value })}
                    placeholder="Enter your reply or remark..."
                  />
                </Form.Group>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top py-2 px-3">
          <Button variant="secondary" onClick={() => setShowReplyModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitReply}>
            <FaCheck className="me-1" /> Submit Reply
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          <p>Are you sure you want to delete this query?</p>
          <p className="text-muted">Query ID: {selectedQuery?.query_id}</p>
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

export default StudentIssue
