import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Spinner, Modal, Form, Badge, Table } from 'react-bootstrap'

import axios from 'axios'
import '../../assets/css/admindashboard.css'
import { useAuth } from '../all_login/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronUp, FaTimes, FaEye } from 'react-icons/fa'
import AdminLeftNav from './AdminLeftNav'
import AdminHeader from './AdminHeader'

const API_URL = 'https://brjobsedu.com/epathshala/epathshala_backend/api/quiz-competition-items/'

const SchoolQuiz = () => {
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
  const [quizzes, setQuizzes] = useState([])
  const [filteredQuizzes, setFilteredQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(10)
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedCards, setExpandedCards] = useState({})
  const [isEditing, setIsEditing] = useState(false)

  // State for Rank Modal
  const [showRankModal, setShowRankModal] = useState(false)
  const [rankData, setRankData] = useState([])
  const [rankLoading, setRankLoading] = useState(false)
  const [modalSchoolFilter, setModalSchoolFilter] = useState('all')

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    title_hindi: '',
    description_hindi: '',
    quiz_category: '',
    start_date_time: '',
    end_date_time: '',
    is_active: true,
    class_allowed: [],
    school_allowed: [],
    total_participants: 8,
    questions: []
  })

  const [schools, setSchools] = useState([])
  const [schoolsLoading, setSchoolsLoading] = useState(false)

  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_text_hindi: '',
    options: ['', '', '', ''],
    options_hindi: ['', '', '', ''],
    correct_answer: 0,
    marks: 1
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
      fetchQuizzes()
      fetchSchools()
    }
  }, [accessToken])

  const fetchSchools = async () => {
    if (!accessToken) return
    try {
      setSchoolsLoading(true)
      const response = await axios.get('https://brjobsedu.com/epathshala/epathshala_backend/api/school-list/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      if (response.data && response.data.data) {
        setSchools(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching schools:', error)
    } finally {
      setSchoolsLoading(false)
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  useEffect(() => {
    let filtered = quizzes || []

    if (searchTerm !== '') {
      filtered = filtered.filter(quiz => {
        if (!quiz) return false
        return (quiz.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (quiz.quiz_category || '').toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(quiz => quiz && quiz.is_active === (filterStatus === 'active'))
    }

    setFilteredQuizzes(filtered || [])
    setCurrentPage(1)
  }, [searchTerm, quizzes, filterStatus])

  const fetchQuizzes = async () => {
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

      let fetchedQuizzes = []
      if (response.data && response.data.data) {
        fetchedQuizzes = response.data.data
      } else if (Array.isArray(response.data)) {
        fetchedQuizzes = response.data
      }

      // Enrich quiz data with accurate participant count from the rank API
      const enrichedQuizzes = await Promise.all(
        fetchedQuizzes.map(async (quiz) => {
          try {
            const rankRes = await axios.get(`https://brjobsedu.com/epathshala/epathshala_backend/api/quiz/rank/?quiz_id=${quiz.quiz_id}`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            })
            let actualCount = 0
            if (rankRes.data && rankRes.data.success && rankRes.data.data?.length > 0) {
              actualCount = rankRes.data.data[0].participant_count || 0
            }
            return { ...quiz, participant_count: actualCount }
          } catch (e) {
            return { ...quiz, participant_count: 0 }
          }
        })
      )

      setQuizzes(enrichedQuizzes)
      setFilteredQuizzes(enrichedQuizzes)
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      setQuizzes([])
      setFilteredQuizzes([])
    } finally {
      setLoading(false)
    }
  }

  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredQuizzes.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredQuizzes.length / recordsPerPage)

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

  const handleAddQuiz = () => {
    setIsEditing(false)
    setQuizForm({
      title: '',
      description: '',
      title_hindi: '',
      description_hindi: '',
      quiz_category: '',
      start_date_time: '',
      end_date_time: '',
      is_active: true,
      class_allowed: [],
      school_allowed: [],
      total_participants: 8,
      questions: []
    })
    setNewQuestion({
      question_text: '',
      question_text_hindi: '',
      options: ['', '', '', ''],
      options_hindi: ['', '', '', ''],
      correct_answer: 0,
      marks: 1
    })
    if (schools.length === 0) {
      fetchSchools()
    }
    setShowModal(true)
  }

  const handleEditQuiz = (quiz) => {
    setIsEditing(true)
    setSelectedQuiz(quiz)
    setQuizForm({
      title: quiz.title || '',
      description: quiz.description || '',
      title_hindi: quiz.title_hindi || '',
      description_hindi: quiz.description_hindi || '',
      quiz_category: quiz.quiz_category || '',
      start_date_time: quiz.start_date_time ? quiz.start_date_time.slice(0, 16) : '',
      end_date_time: quiz.end_date_time ? quiz.end_date_time.slice(0, 16) : '',
      is_active: quiz.is_active ?? true,
      class_allowed: quiz.class_allowed || [],
      school_allowed: quiz.school_allowed || [],
      total_participants: quiz.total_participants || 8,
      questions: quiz.questions || []
    })
    if (schools.length === 0) {
      fetchSchools()
    }
    setShowModal(true)
  }

  const handleDelete = (quiz) => {
    setSelectedQuiz(quiz)
    setShowDeleteModal(true)
  }

  const handleViewRanks = async (quiz) => {
    setSelectedQuiz(quiz)
    setShowRankModal(true)
    setModalSchoolFilter('all')
    setRankLoading(true)
    try {
      const response = await axios.get(`https://brjobsedu.com/epathshala/epathshala_backend/api/quiz/rank/?quiz_id=${quiz.quiz_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      if (response.data && response.data.success) {
        setRankData(response.data.data)
      } else {
        setRankData([])
      }
    } catch (error) {
      console.error('Error fetching quiz ranks:', error)
      setRankData([])
    } finally {
      setRankLoading(false)
    }
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setQuizForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleClassChange = (e) => {
    const value = e.target.value
    setQuizForm(prev => ({
      ...prev,
      class_allowed: prev.class_allowed.includes(value)
        ? prev.class_allowed.filter(c => c !== value)
        : [...prev.class_allowed, value]
    }))
  }

  const handleSchoolChange = (e) => {
    const value = e.target.value
    setQuizForm(prev => ({
      ...prev,
      school_allowed: prev.school_allowed.includes(value)
        ? prev.school_allowed.filter(s => s !== value)
        : [...prev.school_allowed, value]
    }))
  }

  const handleQuestionChange = (e) => {
    const { name, value } = e.target
    setNewQuestion(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleOptionChange = (index, value) => {
    setNewQuestion(prev => {
      const newOptions = [...prev.options]
      newOptions[index] = value
      return { ...prev, options: newOptions }
    })
  }

  const handleOptionHindiChange = (index, value) => {
    setNewQuestion(prev => {
      const newOptions = [...prev.options_hindi]
      newOptions[index] = value
      return { ...prev, options_hindi: newOptions }
    })
  }

  const addQuestion = () => {
    if (!newQuestion.question_text || newQuestion.options.some(o => !o)) {
      alert('Please fill in all question fields')
      return
    }

    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, { ...newQuestion }]
    }))

    setNewQuestion({
      question_text: '',
      question_text_hindi: '',
      options: ['', '', '', ''],
      options_hindi: ['', '', '', ''],
      correct_answer: 0,
      marks: 1
    })
  }

  const removeQuestion = (index) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const submitQuiz = async () => {
    if (!accessToken) {
      alert('Authentication required')
      return
    }

    if (!quizForm.title || !quizForm.quiz_category || quizForm.questions.length === 0) {
      alert(
        "Please fill in required fields (title, Activity Type, at least one question)",
      );
      return
    }

    try {
      // Clean questions array - only include fields expected by API
      const cleanedQuestions = quizForm.questions.map(q => ({
        question_text: q.question_text || '',
        question_text_hindi: q.question_text_hindi || '',
        options: q.options || ['', '', '', ''],
        options_hindi: q.options_hindi || ['', '', '', ''],
        correct_answer: q.correct_answer ?? 0,
        marks: q.marks || 1
      }))

      const payload = {
        title: quizForm.title,
        description: quizForm.description,
        title_hindi: quizForm.title_hindi,
        description_hindi: quizForm.description_hindi,
        quiz_category: quizForm.quiz_category,
        start_date_time: quizForm.start_date_time ? new Date(quizForm.start_date_time).toISOString() : null,
        end_date_time: quizForm.end_date_time ? new Date(quizForm.end_date_time).toISOString() : null,
        is_active: quizForm.is_active,
        class_allowed: quizForm.class_allowed,
        school_allowed: quizForm.school_allowed,
        total_participants: quizForm.total_participants,
        questions: cleanedQuestions
      }

      if (isEditing) {
        // Use quiz_id from selectedQuiz for PUT request
        await axios.put(API_URL, {
          quiz_id: selectedQuiz.quiz_id,
          ...payload
        }, {
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
      fetchQuizzes()
      alert(isEditing ? 'Quiz updated successfully!' : 'Quiz created successfully!')
    } catch (error) {
      console.error('Error saving quiz:', error)
      console.error('Response data:', error.response?.data)
      alert(error.response?.data?.message || 'Failed to save quiz. Check console for details.')
    }
  }

  const confirmDelete = async () => {
    if (!accessToken) {
      alert('Authentication required')
      return
    }
    
    try {
      await axios.delete(API_URL, {
        data: { quiz_id: selectedQuiz.quiz_id },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      setShowDeleteModal(false)
      fetchQuizzes()
      alert('Quiz deleted successfully!')
    } catch (error) {
      console.error('Error deleting quiz:', error)
      alert('Failed to delete quiz')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const classOptions = ['9th', '10th', '11th', '12th']

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
                  <h4 className="mb-0">Institution Quiz Competition</h4>
                </div>
                <Button variant="primary" onClick={handleAddQuiz}>
                  <FaPlus className="me-1" /> Add New Quiz
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
                              placeholder="Search by title, activity type..."
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
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
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
                        <h5 className="mb-0 fw-semibold">All Quizzes</h5>
                      </div>
                      <span className="text-muted small">
                        Showing {indexOfFirstRecord + 1} to{" "}
                        {Math.min(indexOfLastRecord, filteredQuizzes.length)} of{" "}
                        {filteredQuizzes.length} records
                      </span>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive d-none d-lg-block">
                        <table className="table table-striped table-bordered table-hover mb-0">
                          <thead className="bg-primary text-white">
                            <tr>
                              <th className="py-3 px-2">Title</th>
                              <th className="py-3 px-2">Activity Type</th>
                              <th className="py-3 px-2">Classes</th>
                              <th className="py-3 px-2">Institutions</th>
                              <th className="py-3 px-2">Participants</th>
                              <th className="py-3 px-2">Questions</th>
                              <th className="py-3 px-2">Participated</th>
                              <th className="py-3 px-2">Start Date</th>
                              <th className="py-3 px-2">End Date</th>
                              <th className="py-3 px-2">Status</th>
                              <th className="py-3 px-2 text-end">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentRecords.length === 0 ? (
                              <tr>
                                <td
                                  colSpan="10"
                                  className="text-center py-4 text-muted"
                                >
                                  No quizzes found
                                </td>
                              </tr>
                            ) : (
                              currentRecords.map((quiz) => (
                                <tr key={quiz.id}>
                                  <td className="py-3 px-2 fw-medium text-dark">
                                    {quiz.title}
                                  </td>
                                  <td className="py-3 px-2 small">
                                    {quiz.quiz_category}
                                  </td>
                                  <td className="py-3 px-2 small">
                                    {quiz.class_allowed?.map((c) => (
                                      <Badge key={c} bg="info" className="me-1">
                                        {c}
                                      </Badge>
                                    ))}
                                  </td>
                                  <td className="py-3 px-2 small">
                                    {quiz.school_allowed?.length || 0}
                                  </td>
                                  <td className="py-3 px-2 small">
                                    {quiz.total_participants || 0}
                                  </td>
                                  <td className="py-3 px-2 small">
                                    {quiz.questions?.length || 0}
                                  </td>
                                  <td className="py-3 px-2 small text-center">
                                    <Badge bg="secondary">
                                      {quiz.participant_count || 0}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-2 small">
                                    {formatDate(quiz.start_date_time)}
                                  </td>
                                  <td className="py-3 px-2 small">
                                    {formatDate(quiz.end_date_time)}
                                  </td>
                                  <td className="py-3 px-2 small">
                                    <Badge
                                      bg={
                                        quiz.is_active ? "success" : "secondary"
                                      }
                                    >
                                      {quiz.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-2 text-end">
                                    <div className="d-flex gap-2 justify-content-end">
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className=""
                                        style={{ padding: "4px 10px" }}
                                        onClick={() => handleViewRanks(quiz)}
                                        title="View Participants & Ranks"
                                      >
                                        <FaEye /> View
                                      </Button>
                                      <Button
                                        variant="info"
                                        size="sm"
                                        className="text-white"
                                        style={{ padding: "4px 10px" }}
                                        onClick={() => handleEditQuiz(quiz)}
                                        title="Edit Quiz"
                                      >
                                        <FaEdit /> Edit
                                      </Button>
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        className="text-white"
                                        style={{ padding: "4px 10px" }}
                                        onClick={() => handleDelete(quiz)}
                                        title="Delete Quiz"
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
                            No quizzes found
                          </div>
                        ) : (
                          currentRecords.map((quiz) => (
                            <Card key={quiz.id} className="mb-3 mx-2">
                              <Card.Body className="p-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <h6 className="mb-1 fw-semibold">
                                      {quiz.title}
                                    </h6>
                                    <small className="text-muted">
                                      {quiz.quiz_category}
                                    </small>
                                  </div>
                                  <Badge
                                    bg={
                                      quiz.is_active ? "success" : "secondary"
                                    }
                                  >
                                    {quiz.is_active ? "Active" : "Inactive"}
                                  </Badge>
                                </div>

                                <div className="mb-2">
                                  <small className="text-muted d-block">
                                    Classes:
                                  </small>
                                  <div>
                                    {quiz.class_allowed?.map((c) => (
                                      <Badge key={c} bg="info" className="me-1">
                                        {c}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                <div className="mb-2">
                                  <small className="text-muted d-block">
                                    Institutions:
                                  </small>
                                  <span className="small fw-medium">
                                    {quiz.school_allowed?.length || 0}
                                  </span>
                                </div>

                                <div className="mb-2">
                                  <small className="text-muted d-block">
                                    Participants:
                                  </small>
                                  <span className="small fw-medium">
                                    {quiz.total_participants || 0}
                                  </span>
                                </div>

                                <div className="mb-2">
                                  <small className="text-muted d-block">
                                    Participated:
                                  </small>
                                  <span className="small fw-medium">
                                    {quiz.participant_count || 0}
                                  </span>
                                </div>

                                <div className="mb-2">
                                  <small className="text-muted d-block">
                                    Questions:
                                  </small>
                                  <span className="small fw-medium">
                                    {quiz.questions?.length || 0}
                                  </span>
                                </div>

                                <div className="mb-2">
                                  <small className="text-muted d-block">
                                    Start Date:
                                  </small>
                                  <span className="small">
                                    {formatDate(quiz.start_date_time)}
                                  </span>
                                </div>

                                <div className="d-flex gap-2 mt-3 pt-3 border-top">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="flex-fill"
                                    onClick={() => handleViewRanks(quiz)}
                                  >
                                    <FaEye className="me-1" /> View
                                  </Button>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="flex-fill"
                                    onClick={() => handleEditQuiz(quiz)}
                                  >
                                    <FaEdit className="me-1" /> Edit
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="flex-fill"
                                    onClick={() => handleDelete(quiz)}
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
                        <nav aria-label="Quizzes pagination">
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
                                  className={`page-item ${page === currentPage ? "active" : ""}`}
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
                              className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
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

      {/* Add/Edit Quiz Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="xl"
      >
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">
            {isEditing ? "Edit Quiz" : "Add New Quiz"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          <Form>
            <Row className="mb-3">
              <Col md={6} xs={12}>
                <Form.Group>
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={quizForm.title}
                    onChange={handleInputChange}
                    placeholder="Enter quiz title"
                  />
                </Form.Group>
              </Col>
              <Col md={6} xs={12}>
                <Form.Group>
                  <Form.Label>Title (Hindi)</Form.Label>
                  <Form.Control
                    type="text"
                    name="title_hindi"
                    value={quizForm.title_hindi}
                    onChange={handleInputChange}
                    placeholder="क्विज़ का शीर्षक"
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
                    rows={2}
                    name="description"
                    value={quizForm.description}
                    onChange={handleInputChange}
                    placeholder="Enter description"
                  />
                </Form.Group>
              </Col>
              <Col md={6} xs={12}>
                <Form.Group>
                  <Form.Label>Description (Hindi)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description_hindi"
                    value={quizForm.description_hindi}
                    onChange={handleInputChange}
                    placeholder="विवरण"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4} xs={12}>
                <Form.Group>
                  <Form.Label>Activity Type *</Form.Label>
                  <Form.Control
                    type="text"
                    name="quiz_category"
                    value={quizForm.quiz_category}
                    onChange={handleInputChange}
                    placeholder="e.g., Computer, Science, Math"
                  />
                </Form.Group>
              </Col>
              <Col md={4} xs={12}>
                <Form.Group>
                  <Form.Label>Start Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="start_date_time"
                    value={quizForm.start_date_time}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4} xs={12}>
                <Form.Group>
                  <Form.Label>End Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="end_date_time"
                    value={quizForm.end_date_time}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4} xs={12}>
                <Form.Group>
                  <Form.Label>Enrolled Classes</Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {classOptions.map((cls) => (
                      <Form.Check
                        key={cls}
                        type="checkbox"
                        label={cls}
                        value={cls}
                        checked={quizForm.class_allowed.includes(cls)}
                        onChange={handleClassChange}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
              <Col md={4} xs={12}>
                <Form.Group>
                  <Form.Label>Enrolled Institutions</Form.Label>

                  <div className="border rounded p-2 bg-white">
                    {/* Selected Items with Scroll */}
                    <div
                      className="d-flex flex-wrap gap-2 mb-2"
                      style={{
                        maxHeight: "100px",
                        overflowY: "auto",
                      }}
                    >
                      {quizForm.school_allowed.map((id) => {
                        const school = schools.find(
                          (s) => s.school_uni_id === id,
                        );

                        return (
                          <span
                            key={id}
                            className="badge bg-primary d-flex align-items-center"
                          >
                            {school?.school_name}

                            <span
                              style={{
                                cursor: "pointer",
                                marginLeft: "8px",
                              }}
                              onClick={() =>
                                setQuizForm((prev) => ({
                                  ...prev,
                                  school_allowed: prev.school_allowed.filter(
                                    (item) => item !== id,
                                  ),
                                }))
                              }
                            >
                              ✕
                            </span>
                          </span>
                        );
                      })}
                    </div>

                    {/* Dropdown with Scroll */}
                    <Form.Select
                      size={8}
                      style={{
                        overflowY: "auto",
                      }}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value === "all") {
                          setQuizForm((prev) => ({
                            ...prev,
                            school_allowed: schools.map(
                              (school) => school.school_uni_id,
                            ),
                          }));
                        } else if (
                          value &&
                          !quizForm.school_allowed.includes(value)
                        ) {
                          setQuizForm((prev) => ({
                            ...prev,
                            school_allowed: [...prev.school_allowed, value],
                          }));
                        }

                        e.target.value = "";
                      }}
                    >
                      <option value="">Select Institution</option>

                      <option value="all">Select All Institutions</option>

                      {schools
                        .filter(
                          (school) =>
                            !quizForm.school_allowed.includes(
                              school.school_uni_id,
                            ),
                        )
                        .map((school) => (
                          <option
                            key={school.school_uni_id}
                            value={school.school_uni_id}
                          >
                            {school.school_name}
                          </option>
                        ))}
                    </Form.Select>

                    {/* Clear All */}
                    {quizForm.school_allowed.length > 0 && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() =>
                            setQuizForm((prev) => ({
                              ...prev,
                              school_allowed: [],
                            }))
                          }
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>
              <Col md={4} xs={12}>
                <Form.Group>
                  <Form.Label>Total Participants</Form.Label>
                  <Form.Control
                    type="number"
                    name="total_participants"
                    value={quizForm.total_participants}
                    onChange={handleInputChange}
                    min="1"
                  />
                </Form.Group>
                <Form.Group className="mt-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Check
                    type="switch"
                    name="is_active"
                    label={quizForm.is_active ? "Active" : "Inactive"}
                    checked={quizForm.is_active}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr />
            <h6 className="mb-3">Questions</h6>

            {quizForm.questions.length > 0 && (
              <div className="mb-3">
                {quizForm.questions.map((q, idx) => (
                  <Card key={idx} className="mb-2">
                    <Card.Body className="py-2 px-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>Q{idx + 1}:</strong> {q.question_text}
                          <br />
                          <small className="text-muted">
                            Correct Answer: {q.options[q.correct_answer]}
                          </small>
                        </div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeQuestion(idx)}
                        >
                          <FaTimes />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}

            <Card className="mb-3">
              <Card.Header className="bg-light py-2">
                Add New Question
              </Card.Header>
              <Card.Body>
                <Row className="mb-2">
                  <Col md={6} xs={12}>
                    <Form.Group>
                      <Form.Label>Question Text *</Form.Label>
                      <Form.Control
                        type="text"
                        name="question_text"
                        value={newQuestion.question_text}
                        onChange={handleQuestionChange}
                        placeholder="Enter question"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} xs={12}>
                    <Form.Group>
                      <Form.Label>Question Text (Hindi)</Form.Label>
                      <Form.Control
                        type="text"
                        name="question_text_hindi"
                        value={newQuestion.question_text_hindi}
                        onChange={handleQuestionChange}
                        placeholder="प्रश्न"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-2">
                  <Col md={6} xs={12}>
                    <Form.Group>
                      <Form.Label>Options *</Form.Label>
                      {newQuestion.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className="d-flex align-items-center mb-2"
                        >
                          <Form.Check
                            type="radio"
                            name="correct_answer"
                            checked={newQuestion.correct_answer === idx}
                            onChange={() =>
                              setNewQuestion((prev) => ({
                                ...prev,
                                correct_answer: idx,
                              }))
                            }
                          />
                          <Form.Control
                            type="text"
                            value={opt}
                            onChange={(e) =>
                              handleOptionChange(idx, e.target.value)
                            }
                            placeholder={`Option ${idx + 1}`}
                            className="ms-2"
                          />
                        </div>
                      ))}
                    </Form.Group>
                  </Col>
                  <Col md={6} xs={12}>
                    <Form.Group>
                      <Form.Label>Options (Hindi)</Form.Label>
                      {newQuestion.options_hindi.map((opt, idx) => (
                        <Form.Control
                          key={idx}
                          type="text"
                          value={opt}
                          onChange={(e) =>
                            handleOptionHindiChange(idx, e.target.value)
                          }
                          placeholder={`विकल्प ${idx + 1}`}
                          className="mb-2"
                        />
                      ))}
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-2">
                  <Col md={3} xs={6}>
                    <Form.Group>
                      <Form.Label>Marks</Form.Label>
                      <Form.Control
                        type="number"
                        name="marks"
                        value={newQuestion.marks}
                        onChange={handleQuestionChange}
                        min="1"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button variant="secondary" onClick={addQuestion}>
                  <FaPlus className="me-1" /> Add Question
                </Button>
              </Card.Body>
            </Card>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-top py-2 px-3">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitQuiz}>
            {isEditing ? "Update Quiz" : "Create Quiz"}
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
          <p>Are you sure you want to delete this quiz?</p>
          <p className="text-muted">Title: {selectedQuiz?.title}</p>
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

      {/* Rank Details Modal */}
      <Modal show={showRankModal} onHide={() => setShowRankModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">
            Participants & Rankings - {selectedQuiz?.title}
            {!rankLoading && rankData.length > 0 && <Badge bg="secondary" className="ms-2">{rankData[0]?.participant_count || rankData.length} Participated</Badge>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          {rankLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 small text-muted">Fetching participation details...</p>
            </div>
          ) : rankData.length === 0 ? (
            <div className="text-center py-4 text-muted small">
              No student participation data found for this quiz.
            </div>
          ) : (
            <>
            <div className="mb-3 p-2 border rounded bg-light">
              <Row className="align-items-center g-2">
                <Col md={6}>
                  <Form.Group className="d-flex align-items-center">
                    <Form.Label className="mb-0 me-2 fw-medium small text-nowrap">Filter by Institution:</Form.Label>
                    <Form.Select 
                      size="sm" 
                      value={modalSchoolFilter} 
                      onChange={(e) => setModalSchoolFilter(e.target.value)}
                    >
                      <option value="all">All Participating Institutions</option>
                      {[...new Set(rankData.map(item => item.school?.school_name))]
                        .filter(Boolean)
                        .sort()
                        .map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))
                      }
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <Badge bg="primary" className="py-2 px-3">
                Total Students: {modalSchoolFilter === 'all' ? (rankData[0]?.participant_count || rankData.length) : rankData.filter(item => item.school?.school_name === modalSchoolFilter).length}
              </Badge>
              <Badge bg="info" className="py-2 px-3">
                Total Institutions: {new Set(rankData.map(item => item.school?.school_uni_id)).size}
              </Badge>
            </div>
            <div className="table-responsive">
              <Table striped bordered hover responsive size="sm" className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="py-2">Rank</th>
                    <th className="py-2">Student Name</th>
                    <th className="py-2">Student ID</th>
                    <th className="py-2">Institution</th>
                    <th className="py-2">Score</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {rankData
                    .filter(item => modalSchoolFilter === 'all' || item.school?.school_name === modalSchoolFilter)
                    .map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2"><Badge bg={item.rank <= 3 ? "success" : "info"}>#{item.rank || (idx + 1)}</Badge></td>
                      <td className="py-2 fw-medium">{item.student?.full_name}</td>
                      <td className="py-2 small">{item.student?.student_id}</td>
                      <td className="py-2 small">{item.school?.school_name}</td>
                      <td className="py-2 fw-bold text-primary">{item.score}</td>
                      <td className="py-2">
                        <Badge bg={item.status === 'passed' ? 'success' : 'danger'}>
                          {item.status || 'failed'}
                        </Badge>
                      </td>
                      <td className="py-2 small">
                        {item.submitted_at ? new Date(item.submitted_at).toLocaleString('en-IN') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top py-2 px-3">
          <Button variant="secondary" onClick={() => setShowRankModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default SchoolQuiz
