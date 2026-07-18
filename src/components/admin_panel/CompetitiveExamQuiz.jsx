import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Form, Badge, Nav, Tab, InputGroup, Alert } from 'react-bootstrap'

import axios from 'axios'


import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaEye, FaTimes, FaTrophy, FaMedal, FaChartBar, FaUsers, FaClock, FaCheckCircle, FaSearch, FaChevronLeft, FaChevronRight, FaInfoCircle, FaList } from 'react-icons/fa'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'
import { useAuth } from '../all_login/AuthContext'

import AdminLeftNav from './AdminLeftNav'
import "../../assets/css/admindashboard.css";
import AdminHeader from './AdminHeader'

const API_URL = 'https://brjobsedu.com/Epathshala/Epathshala_backend/api/open-quiz-questions/'
const RANKING_API_URL = 'https://brjobsedu.com/Epathshala/Epathshala_backend/api/open-quiz/rank/'

const CompetitiveExamQuiz = () => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [showSidebar, setShowSidebar] = useState(true)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('postQuestions') // 'postQuestions' or 'allTests'

  // State for Questions Management
  const [questions, setQuestions] = useState([])
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    question_text_hindi: '',
    options: ['', '', '', ''], // Default 4 options
    options_hindi: ['', '', '', ''], // Default 4 options
    correct_answer: 0, // Index of the correct option
    marks: 1
  })
  const [editingQuestion, setEditingQuestion] = useState(null) // Stores the question being edited
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null) // For delete confirmation

  // State for Rankings and Analysis
  const [rankings, setRankings] = useState([])
  const [pendingCandidates, setPendingCandidates] = useState([])
  const [stats, setStats] = useState({
    avgScore: 0,
    completionRate: 0,
    totalRanked: 0,
    totalPending: 0
  })

  // Pagination and Analysis State
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 20
  const [showSingleAnalysisModal, setShowSingleAnalysisModal] = useState(false)
  const [showOverallAnalysisModal, setShowOverallAnalysisModal] = useState(false)
  const [selectedCandidateAnalysis, setSelectedCandidateAnalysis] = useState(null)

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    if (activeTab === 'postQuestions') {
      fetchQuestions()
    } else if (activeTab === 'allTests') {
      fetchRankings()
    }
  }, [activeTab, accessToken]) // Re-fetch when tab changes or token changes

  const getAuthConfig = () => ({
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const config = getAuthConfig()
      const response = await axios.get(API_URL, config)
      if (response.data && response.data.success) {
        setQuestions(response.data.data)
      } else {
        setQuestions([])
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchRankings = async () => {
    setLoading(true)
    try {
      const config = getAuthConfig()
      const response = await axios.get(RANKING_API_URL, config)
      if (response.data && response.data.success) {
        const rankData = response.data.rankings || []
        const pendingData = response.data.pending_candidates || []
        setRankings(rankData)
        setPendingCandidates(pendingData)

        // Calculate simple stats
        const totalRanked = rankData.length
        const totalPending = pendingData.length
        const totalAttempted = totalRanked + totalPending
        
        const avgScore = totalRanked > 0 
          ? (rankData.reduce((acc, curr) => acc + curr.score, 0) / totalRanked).toFixed(1) 
          : 0
        
        const completionRate = totalAttempted > 0 
          ? ((totalRanked / totalAttempted) * 100).toFixed(1) 
          : 0

        setStats({ avgScore, completionRate, totalRanked, totalPending })
      }
    } catch (error) {
      console.error('Error fetching rankings:', error)
      setRankings([])
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionFormChange = (e) => {
    const { name, value } = e.target
    setQuestionFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleOptionChange = (index, value, isHindi = false) => {
    setQuestionFormData(prev => {
      const newOptions = isHindi ? [...prev.options_hindi] : [...prev.options]
      newOptions[index] = value
      return { ...prev, [isHindi ? 'options_hindi' : 'options']: newOptions }
    })
  }

  const handleAddOption = (isHindi = false) => {
    setQuestionFormData(prev => ({
      ...prev,
      [isHindi ? 'options_hindi' : 'options']: [...(isHindi ? prev.options_hindi : prev.options), '']
    }))
  }

  const handleRemoveOption = (index, isHindi = false) => {
    setQuestionFormData(prev => {
      const newOptions = isHindi ? [...prev.options_hindi] : [...prev.options]
      if (newOptions.length > 1) { // Ensure at least one option remains
        newOptions.splice(index, 1)
      }
      return { ...prev, [isHindi ? 'options_hindi' : 'options']: newOptions }
    })
  }

  const handleOpenQuestionModal = (question = null) => {
    if (question) {
      setEditingQuestion(question)
      setQuestionFormData({
        question_text: question.question_text || '',
        question_text_hindi: question.question_text_hindi || '',
        options: question.options || ['', '', '', ''],
        options_hindi: question.options_hindi || ['', '', '', ''],
        correct_answer: question.correct_answer ?? 0,
        marks: question.marks ?? 1
      })
    } else {
      setEditingQuestion(null)
      setQuestionFormData({
        question_text: '',
        question_text_hindi: '',
        options: ['', '', '', ''],
        options_hindi: ['', '', '', ''],
        correct_answer: 0,
        marks: 1
      })
    }
    setShowQuestionModal(true)
  }

  const handleCloseQuestionModal = () => {
    setShowQuestionModal(false)
    setEditingQuestion(null)
    setQuestionFormData({
      question_text: '',
      question_text_hindi: '',
      options: ['', '', '', ''],
      options_hindi: ['', '', '', ''],
      correct_answer: 0,
      marks: 1
    })
  }

  const handleSubmitQuestion = async (e) => {
    e.preventDefault()
    setLoading(true) // Set loading for submission

    try {
      const config = getAuthConfig()
      const payload = {
        question_text: questionFormData.question_text,
        question_text_hindi: questionFormData.question_text_hindi,
        options: questionFormData.options,
        options_hindi: questionFormData.options_hindi,
        correct_answer: questionFormData.correct_answer,
        marks: questionFormData.marks
      }

      if (editingQuestion) {
        payload.id = editingQuestion.id // Add ID for PUT request
        await axios.put(API_URL, payload, config)
        alert('Question updated successfully!')
      } else {
        await axios.post(API_URL, payload, config)
        alert('Question added successfully!')
      }
      
      handleCloseQuestionModal()
      fetchQuestions() // Refresh list
    } catch (error) {
      console.error('Error submitting question:', error)
      alert('Failed to submit question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = (question) => {
    setSelectedQuestion(question)
    setShowDeleteModal(true)
  }

  const confirmDeleteQuestion = async () => {
    setLoading(true)
    try {
      const config = getAuthConfig()
      await axios.delete(API_URL, { data: { id: selectedQuestion.id }, ...config })
      alert('Question deleted successfully!')
      setShowDeleteModal(false)
      fetchQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Failed to delete question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderRankIcon = (rank) => {
    switch(rank) {
      case 1: return <FaTrophy className="text-success me-1" />;
      case 2: return <FaMedal className="text-primary me-1" />;
      case 3: return <FaMedal className="text-warning me-1" />;
      default: return <FaMedal className="text-danger me-1" />;
    }
  }

  const handleAnalyzeCandidate = (candidate) => {
    setSelectedCandidateAnalysis(candidate)
    setShowSingleAnalysisModal(true)
  }

  // Combined list for display: Ranked candidates followed by Pending candidates
  const allDisplayRecords = [
    ...rankings.map(r => ({ ...r, isPending: false })),
    ...pendingCandidates.map(p => ({ ...p, isPending: true, rank: '-', score: 'In Progress', total_questions: '-', submitted_at: null }))
  ];

  const totalPages = Math.ceil(allDisplayRecords.length / recordsPerPage)
  const currentRecords = allDisplayRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)

  // Data for Overall Batch Analysis Graphs
  const completionChartData = [
    { name: 'Completed', value: rankings.length, color: '#28a745' },
    { name: 'Pending', value: pendingCandidates.length, color: '#ffc107' }
  ];

  const performanceLevelsData = [
    { name: 'High (>=75%)', value: rankings.filter(r => (r.score / (r.total_questions || 1)) >= 0.75).length, color: '#28a745' },
    { name: 'Average (40-74%)', value: rankings.filter(r => {
        const pct = (r.score / (r.total_questions || 1));
        return pct >= 0.4 && pct < 0.75;
      }).length, color: '#0dcaf0' },
    { name: 'Low (<40%)', value: rankings.filter(r => (r.score / (r.total_questions || 1)) < 0.4).length, color: '#dc3545' }
  ];

  const getRankColor = (rank) => {
    if (rank === 1) return '#28a745'; // Green
    if (rank === 2) return '#0d6efd'; // Blue
    if (rank === 3) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  }

  const formatTime = (isoString) => {
    if (!isoString) return 'N/A'
    const date = new Date(isoString)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateDuration = (start, end) => {
    if (!start || !end) return 'N/A'
    const duration = new Date(end) - new Date(start)
    const minutes = Math.floor(duration / 60000)
    const seconds = ((duration % 60000) / 1000).toFixed(0)
    return `${minutes}m ${seconds}s`
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="dashboard-container">
       <AdminLeftNav
        sidebarOpen={showSidebar}
        setSidebarOpen={setShowSidebar}
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
                  <h4 className="mb-0">Participants Quiz Management</h4>
                </div>
                <Button variant="primary" onClick={() => handleOpenQuestionModal()}>
                  <FaPlus className="me-2" /> Add New Question
                </Button>
              </div>

              <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav variant="tabs" className="mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="postQuestions">
                      <FaPlus className="me-1" /> Post Questions
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="allTests">
                      <FaChartBar className="me-1" /> Rankings & Analysis
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="postQuestions">
                    {loading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2">Loading questions...</p>
                      </div>
                    ) : (
                      <Card className="shadow-sm border-0">
                        <Card.Header className="bg-light border-bottom py-2 px-3">
                          <h6 className="mb-0 fw-semibold text-secondary">Existing Questions</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                          {questions.length === 0 ? (
                            <div className="text-center text-muted py-4">
                              No questions found. Add one using the button above!
                            </div>
                          ) : (
                            <Table hover responsive className="mb-0">
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Question (English)</th>
                                  <th>Question (Hindi)</th>
                                  <th>Marks</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {questions.map(q => (
                                  <tr key={q.id}>
                                    <td>{q.id}</td>
                                    <td>{q.question_text}</td>
                                    <td>{q.question_text_hindi}</td>
                                    <td>{q.marks}</td>
                                    <td>
                                      <Button variant="outline-warning" size="sm" className="me-2" onClick={() => handleOpenQuestionModal(q)}>
                                        <FaEdit />
                                      </Button>
                                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteQuestion(q)}>
                                        <FaTrash />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          )}
                        </Card.Body>
                      </Card>
                    )}
                  </Tab.Pane>
                  <Tab.Pane eventKey="allTests">
                    {loading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2">Loading ranking data...</p>
                      </div>
                    ) : (
                      <div className="ranking-dashboard">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="mb-0 text-dark fw-bold">Performance Analytics</h5>
                          <Button variant="outline-primary" onClick={() => setShowOverallAnalysisModal(true)}>
                            <FaChartBar className="me-2" /> View Overall Analysis
                          </Button>
                        </div>

                        {/* Stats Summary Cards */}
                        <Row className="mb-4 g-3">
                          <Col md={3}>
                            <Card className="border-0 shadow-sm text-center p-4 py-3 bg-primary text-white">
                              <FaUsers className="mb-2 fs-3" />
                              <h6 className="small text-uppercase">Total Participated</h6>
                              <h4>{stats.totalRanked}</h4>
                            </Card>
                          </Col>
                          <Col md={3}>
                            <Card className="border-0 shadow-sm text-center p-4 py-3 bg-success text-white">
                              <FaCheckCircle className="mb-2 fs-3" />
                              <h6 className="small text-uppercase">Avg. Score</h6>
                              <h4>{stats.avgScore}</h4>
                            </Card>
                          </Col>
                          <Col md={3}>
                            <Card className="border-0 shadow-sm text-center p-4 py-3 bg-info text-white">
                              <FaClock className="mb-2 fs-3" />
                              <h6 className="small text-uppercase">Completion Rate</h6>
                              <h4>{stats.completionRate}%</h4>
                            </Card>
                          </Col>
                          <Col md={3}>
                            <Card className="border-0 shadow-sm text-center p-4 py-3 bg-warning text-dark">
                              <FaClock className="mb-2 fs-3" />
                              <h6 className="small text-uppercase">Pending Tests</h6>
                              <h4>{stats.totalPending}</h4>
                            </Card>
                          </Col>
                        </Row>

                        {/* Top 3 Podium and Chart */}
                        <Row className="mb-4 g-4">
                          <Col lg={4}>
                            <h5 className="mb-3 text-secondary"><FaTrophy className="text-warning me-2"/>Top Performers</h5>
                            {rankings.slice(0, 3).map((candidate, idx) => (
                              <Card key={candidate.candidate_id} className={`mb-3 border-0 shadow-sm border-start border-4 ${idx === 0 ? 'border-success' : idx === 1 ? 'border-primary' : 'border-warning'}`}>
                                <Card.Body className="d-flex align-items-center py-3">
                                  <div className="rank-badge me-3" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getRankColor(idx + 1) }}>
                                    #{idx + 1}
                                  </div>
                                  <div className="flex-grow-1">
                                    <h6 className="mb-0 fw-bold">{candidate.full_name}</h6>
                                    <small className="text-muted">{candidate.candidate_id}</small>
                                  </div>
                                  <div className="text-end">
                                    <h5 className="mb-0 text-primary">{candidate.score}</h5>
                                    <small className="text-muted">/{candidate.total_questions} Pts</small>
                                  </div>
                                </Card.Body>
                              </Card>
                            ))}
                            {rankings.length === 0 && <div className="text-center py-4 bg-light rounded text-muted">No data available yet</div>}
                          </Col>
                          <Col lg={8}>
                            <Card className="h-100 border-0 shadow-sm">
                              <Card.Header className="bg-white py-3 border-0">
                                <h6 className="mb-0 text-secondary">Score Distribution (Top 10)</h6>
                              </Card.Header>
                              <Card.Body>
                                <div style={{ width: '100%', height: 300 }}>
                                  <ResponsiveContainer>
                                    <BarChart data={rankings.slice(0, 10)} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                      <XAxis dataKey="full_name" hide />
                                      <YAxis />
                                      <Tooltip 
                                        cursor={{fill: 'transparent'}}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                      />
                                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                        {rankings.slice(0, 10).map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={getRankColor(index + 1)} />
                                        ))}
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>

                        {/* Full Rankings Table */}
                        <Card className="border-0 shadow-sm overflow-hidden mb-4">
                          <Card.Header className="bg-light py-3">
                            <h6 className="mb-0 fw-semibold text-secondary">Full Leaderboard</h6>
                          </Card.Header>
                          <Card.Body className="p-0">
                            <Table hover responsive className="mb-0">
                              <thead className="bg-light">
                                <tr>
                                  <th className="ps-4">Rank</th>
                                  <th>Candidate Name</th>
                                  <th>Candidate ID</th>
                                  <th>Score</th>
                                  <th>Total Questions</th>
                                  <th>Submitted At</th>
                                  <th className="text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentRecords.length > 0 ? currentRecords.map((r, index) => (
                                  <tr key={r.candidate_id || index} className={r.isPending ? 'table-danger' : ''}>
                                    <td className="ps-4 fw-bold">
                                      {renderRankIcon(r.rank)} {r.rank}
                                    </td>
                                    <td>{r.full_name}</td>
                                    <td><Badge bg="light" text="dark" className="border">{r.candidate_id}</Badge></td>
                                    <td className={r.isPending ? "text-danger fst-italic small" : "text-primary fw-semibold"}>{r.score}</td>
                                    <td>{r.total_questions}</td>
                                    <td><small className="text-muted">{formatTime(r.submitted_at)}</small></td>
                                    <td className="text-center">
                                      {!r.isPending && (
                                        <Button variant="link" size="sm" onClick={() => handleAnalyzeCandidate(r)} className="text-decoration-none p-0">
                                          <FaEye className="me-1" /> Analyze
                                        </Button>
                                      )}
                                    </td>
                                  </tr>
                                )) : (
                                  <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">No completed tests found.</td>
                                  </tr>
                                )}
                              </tbody>
                            </Table>
                          </Card.Body>
                          {totalPages > 1 && (
                            <Card.Footer className="bg-white border-top py-3 d-flex justify-content-center">
                              <Button 
                                variant="light" 
                                className="me-2" 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                              >
                                <FaChevronLeft />
                              </Button>
                              <div className="d-flex align-items-center px-3 fw-medium">
                                {currentPage} / {totalPages}
                              </div>
                              <Button 
                                variant="light" 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                              >
                                <FaChevronRight />
                              </Button>
                            </Card.Footer>
                          )}
                        </Card>

                        {pendingCandidates.length > 0 && (
                          <Alert variant="warning" className="border-0 shadow-sm d-flex align-items-center">
                            <FaClock className="me-2" />
                            Currently, there are <strong>{pendingCandidates.length}</strong> candidates with tests in progress.
                          </Alert>
                        )}
                      </div>
                    )}
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Container>
          </div>
      </div>

      {/* Single ParticipantsAnalysis Modal */}
      <Modal show={showSingleAnalysisModal} onHide={() => setShowSingleAnalysisModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-5">Candidate Performance Analysis</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedCandidateAnalysis && (
            <Row>
              <Col md={6}>
                <h6 className="text-primary border-bottom pb-2 mb-3">Basic Information</h6>
                <p className="mb-2"><strong>Name:</strong> {selectedCandidateAnalysis.full_name}</p>
                <p className="mb-2"><strong>Candidate ID:</strong> {selectedCandidateAnalysis.candidate_id}</p>
                <p className="mb-2"><strong>Phone:</strong> {selectedCandidateAnalysis.phone}</p>
                <p className="mb-2"><strong>Rank:</strong> <Badge bg="success">#{selectedCandidateAnalysis.rank}</Badge></p>
              </Col>
              <Col md={6}>
                <h6 className="text-primary border-bottom pb-2 mb-3">Test Metrics</h6>
                <p className="mb-2"><strong>Score:</strong> {selectedCandidateAnalysis.score} / {selectedCandidateAnalysis.total_questions}</p>
                <p className="mb-2"><strong>Accuracy:</strong> {((selectedCandidateAnalysis.score / selectedCandidateAnalysis.total_questions) * 100).toFixed(1)}%</p>
                <p className="mb-2"><strong>Time Taken:</strong> {calculateDuration(selectedCandidateAnalysis.started_at, selectedCandidateAnalysis.submitted_at)}</p>
                <p className="mb-2"><strong>Submitted:</strong> {formatTime(selectedCandidateAnalysis.submitted_at)}</p>
              </Col>
              <Col md={12} className="mt-4">
                <Alert variant="info" className="d-flex align-items-center border-0 shadow-sm">
                  <FaInfoCircle className="me-3 fs-4" />
                  <div>
                    <strong>Performance Verdict:</strong> {selectedCandidateAnalysis.full_name} performed 
                    {selectedCandidateAnalysis.score >= stats.avgScore ? ' above ' : ' below '} 
                    the current participant average score of <strong>{stats.avgScore}</strong>.
                  </div>
                </Alert>
              </Col>
            </Row>
          )}

          {selectedCandidateAnalysis && (
            <div className="mt-4">
              <h6 className="text-secondary fw-bold mb-3 d-flex align-items-center">
                <FaList className="me-2" /> Question Breakdown
              </h6>
              
              {/* Incorrect Questions Section */}
              {selectedCandidateAnalysis.wrong_questions && selectedCandidateAnalysis.wrong_questions.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-danger">Incorrect Answers ({selectedCandidateAnalysis.wrong_questions.length})</span>
                  </div>
                  <div className="breakdown-scroll-area border rounded p-2 bg-light" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedCandidateAnalysis.wrong_questions.map((q, idx) => (
                      <Card key={idx} className="mb-2 border-0 shadow-sm">
                        <Card.Body className="p-3 border-start border-danger border-4 rounded">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <p className="mb-0 fw-bold small text-dark">
                              Q{idx + 1}: {q.question}
                            </p>
                            <Badge bg="danger" pill style={{ fontSize: '0.65rem' }}>Failed</Badge>
                          </div>
                          
                          {q.question_hindi && (
                            <p className="text-muted small fst-italic mb-2">{q.question_hindi}</p>
                          )}

                          <Row className="g-2 mt-1">
                            <Col sm={6}>
                              <div className="p-2 rounded bg-danger bg-opacity-10 border border-danger border-opacity-25">
                                <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>Candidate Answer:</small>
                                <span className="text-danger fw-bold small">
                                  {q.options[q.your_answer_index] || 'No Answer'}
                                </span>
                              </div>
                            </Col>
                            <Col sm={6}>
                              <div className="p-2 rounded bg-success bg-opacity-10 border border-success border-opacity-25">
                                <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>Correct Answer:</small>
                                <span className="text-success fw-bold small">
                                  {q.correct_answer}
                                </span>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Correct Questions Section */}
              {selectedCandidateAnalysis.correct_questions && selectedCandidateAnalysis.correct_questions.length > 0 && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-success">Correct Answers ({selectedCandidateAnalysis.correct_questions.length})</span>
                  </div>
                  <div className="breakdown-scroll-area border rounded p-2 bg-light" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedCandidateAnalysis.correct_questions.map((q, idx) => (
                      <Card key={idx} className="mb-2 border-0 shadow-sm">
                        <Card.Body className="p-3 border-start border-success border-4 rounded">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <p className="mb-0 fw-bold small text-dark">
                              Q{idx + 1}: {q.question}
                            </p>
                            <Badge bg="success" pill style={{ fontSize: '0.65rem' }}>Passed</Badge>
                          </div>
                          
                          {q.question_hindi && (
                            <p className="text-muted small fst-italic mb-2">{q.question_hindi}</p>
                          )}

                          <div className="mt-2 p-2 rounded bg-success bg-opacity-10 border border-success border-opacity-25">
                            <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>Validated Answer:</small>
                            <span className="text-success fw-bold small">
                              {q.correct_answer}
                            </span>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {( (!selectedCandidateAnalysis.correct_questions?.length) && (!selectedCandidateAnalysis.wrong_questions?.length) ) && (
                <div className="text-center py-4 text-muted border rounded bg-light">
                  No question breakdown available for this candidate.
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSingleAnalysisModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Overall Analysis Modal */}
      <Modal 
        show={showOverallAnalysisModal} 
        onHide={() => setShowOverallAnalysisModal(false)} 
        centered 
        size="lg"
        className="analysis-modal"
      >
        <style>
          {`
            @media print {
              body * { visibility: hidden; }
              .analysis-modal, .analysis-modal * { visibility: visible; }
              .analysis-modal { position: absolute; left: 0; top: 0; width: 100%; }
              .modal-header .btn-close, .modal-footer { display: none !important; }
              .modal-content { border: none !important; }
              .modal-body { padding: 0 !important; }
              .card { border: 1px solid #eee !important; box-shadow: none !important; }
              .recharts-responsive-container { min-height: 250px !important; }
            }
          `}
        </style>
        <Modal.Header closeButton className="bg-primary text-white border-0">
          <Modal.Title className="fs-5">Workshop Batch Analysis</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 print-analysis-area">
          <Row className="g-4 text-center">
            <Col md={4}>
              <div className="p-3 bg-light rounded shadow-sm h-100">
                <h3 className="text-primary fw-bold mb-1">{rankings.length}</h3>
                <small className="text-uppercase text-muted">Successful Submissions</small>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-3 bg-light rounded shadow-sm h-100">
                <h3 className="text-success fw-bold mb-1">{stats.avgScore}</h3>
                <small className="text-uppercase text-muted">Average Marks Scored</small>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-3 bg-light rounded shadow-sm h-100">
                <h3 className="text-info fw-bold mb-1">{stats.completionRate}%</h3>
                <small className="text-uppercase text-muted">Total Completion Rate</small>
              </div>
            </Col>
          </Row>

          {/* Batch Visual Analysis */}
          <Row className="g-3 border-top pt-4 mt-3">
            <Col md={6} sm={6} className="print-col-6">
              <div className="text-center mb-3">
                <h6 className="fw-bold text-secondary">Test Completion Status</h6>
                <small className="text-muted">Proportion of completed vs pending tests</small>
              </div>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={completionChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {completionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Col>
            <Col md={6} sm={6} className="print-col-6">
              <div className="text-center mb-3">
                <h6 className="fw-bold text-secondary">Score Performance Levels</h6>
                <small className="text-muted">Participants performance based on accuracy</small>
              </div>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={performanceLevelsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {performanceLevelsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>

          <div className="mt-4">
            <h6 className="fw-bold mb-3 border-bottom pb-2">Insights & Observations</h6>
            <ul className="text-secondary">
              <li className="mb-2">The highest score in this batch is <strong>{rankings[0]?.score || 0}</strong>.</li>
              <li className="mb-2">There are currently <strong>{stats.totalPending}</strong> tests in an incomplete state.</li>
              <li className="mb-2">Based on current trends, the average participant is scoring approximately <strong>{((stats.avgScore / (rankings[0]?.total_questions || 1)) * 100).toFixed(1)}%</strong>.</li>
            </ul>
          </div>
          <div className="mt-3 bg-light p-3 rounded small text-muted">
            <FaInfoCircle className="me-2" />
            Note: Rankings are updated in real-time as candidates submit their tests.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowOverallAnalysisModal(false)}>Close</Button>
          <Button variant="primary" onClick={() => { setTimeout(() => window.print(), 100); }}>
            <FaEdit className="me-1" /> Export Report
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Question Add/Edit Modal */}
      <Modal show={showQuestionModal} onHide={handleCloseQuestionModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingQuestion ? 'Edit Question' : 'Add New Question'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitQuestion}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Question Text (English) *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="question_text"
                value={questionFormData.question_text}
                onChange={handleQuestionFormChange}
                placeholder="Enter question text in English"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Question Text (Hindi)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="question_text_hindi"
                value={questionFormData.question_text_hindi}
                onChange={handleQuestionFormChange}
                placeholder="Enter question text in Hindi"
              />
            </Form.Group>

            <h6 className="mt-4 mb-2">Options (English)</h6>
            {questionFormData.options.map((option, index) => (
              <InputGroup key={index} className="mb-2">
                <InputGroup.Text>{String.fromCharCode(65 + index)}</InputGroup.Text>
                <Form.Control
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  required
                />
                <Button variant="outline-danger" onClick={() => handleRemoveOption(index)} disabled={questionFormData.options.length <= 1}>
                  <FaTimes />
                </Button>
              </InputGroup>
            ))}
            <Button variant="outline-primary" size="sm" className="mt-2" onClick={() => handleAddOption()}>
              <FaPlus className="me-1" /> Add Option
            </Button>

            <h6 className="mt-4 mb-2">Options (Hindi)</h6>
            {questionFormData.options_hindi.map((option, index) => (
              <InputGroup key={index} className="mb-2">
                <InputGroup.Text>{String.fromCharCode(65 + index)}</InputGroup.Text>
                <Form.Control
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value, true)}
                  placeholder={`विकल्प ${String.fromCharCode(65 + index)}`}
                />
                <Button variant="outline-danger" onClick={() => handleRemoveOption(index, true)} disabled={questionFormData.options_hindi.length <= 1}>
                  <FaTimes />
                </Button>
              </InputGroup>
            ))}
            <Button variant="outline-primary" size="sm" className="mt-2" onClick={() => handleAddOption(true)}>
              <FaPlus className="me-1" /> Add Option (Hindi)
            </Button>

            <Form.Group className="mb-3 mt-4">
              <Form.Label>Correct Answer *</Form.Label>
              <Form.Select
                name="correct_answer"
                value={questionFormData.correct_answer}
                onChange={handleQuestionFormChange}
                required
              >
                {questionFormData.options.map((_, index) => (
                  <option key={index} value={index}>
                    {String.fromCharCode(65 + index)} - {questionFormData.options[index]}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Marks *</Form.Label>
              <Form.Control
                type="number"
                name="marks"
                value={questionFormData.marks}
                onChange={handleQuestionFormChange}
                min="1"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseQuestionModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingQuestion ? 'Update Question' : 'Add Question'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the question: <strong>"{selectedQuestion?.question_text}"</strong>?</p>
          <p className="text-muted small">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteQuestion}>
            <FaTrash className="me-1" /> Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default CompetitiveExamQuiz