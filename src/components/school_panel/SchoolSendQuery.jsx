import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Table, Alert, Form, Button, Spinner, Badge } from "react-bootstrap";
import { useAuth } from "../all_login/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPaperPlane, FaHistory, FaClock, FaQuestionCircle } from "react-icons/fa";
import SchoolLeftNav from "./SchoolLeftNav";
import SchoolHeader from "./SchoolHeader";
import { useLanguage } from "../all_login/LanguageContext";

const API_URL = 'https://brjobsedu.com/Epathshala/Epathshala_backend/api/school-issues/';

const SchoolSendQuery = () => {
  const { language } = useLanguage();
  const { uniqueId, accessToken, user } = useAuth();
  const navigate = useNavigate();

  // Layout state following StudentRegistration.jsx pattern
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [formData, setFormData] = useState({
    school_name: '',
    student_uni_id: uniqueId || '',
    title: '',
    issue: ''
  });

  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [schoolLoading, setSchoolLoading] = useState(false);

  const content = {
    en: {
      title: "Institution Support & Query",
      back: "Back to Dashboard",
      raiseTitle: "Raise a Query",
      historyTitle: "My Queries",
      schoolName: "Institution Name",
      queryTitle: "Title",
      description: "Issue Description",
      submit: "Submit Query",
      submitting: "Submitting...",
      loading: "Loading queries...",
      noQueries: "No queries found.",
      success: "Query submitted successfully!",
      errorSubmit: "Failed to submit query. Please check all fields.",
      table: {
        id: "Query ID",
        title: "Title",
        issue: "Issue",
        status: "Status",
        remark: "Remark",
        date: "Date"
      }
    },
    hi: {
      title: "शैक्षणिक संस्था सहायता और प्रश्न",
      back: "डैशबोर्ड पर वापस जाएं",
      raiseTitle: "प्रश्न पूछें",
      historyTitle: "मेरे प्रश्न",
      schoolName: "शैक्षणिक संस्था का नाम",
      queryTitle: "शीर्षक",
      description: "समस्या का विवरण",
      submit: "प्रश्न सबमिट करें",
      submitting: "सबमिट हो रहा है...",
      loading: "प्रश्न लोड हो रहे हैं...",
      noQueries: "कोई प्रश्न नहीं मिला।",
      success: "प्रश्न सफलतापूर्वक सबमिट किया गया!",
      errorSubmit: "प्रश्न सबमिट करने में विफल रहा। कृपया सभी फ़ील्ड जांचें।",
      table: {
        id: "प्रश्न आईडी",
        title: "शीर्षक",
        issue: "समस्या",
        status: "स्थिति",
        remark: "रिमार्क",
        date: "दिनांक"
      }
    }
  };

  const t = content[language] || content.en;

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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchQueries = useCallback(async () => {
    if (!uniqueId || !accessToken) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?student_uni_id=${uniqueId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (response.ok) {
        const result = await response.json();
        setQueries(result.status ? result.data : (Array.isArray(result) ? result : []));
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoading(false);
    }
  }, [uniqueId, accessToken]);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  // Auto-fill school name when user data is available
  useEffect(() => {
    const fetchSchoolDetails = async () => {
      if (!uniqueId) return;
      
      // First try to get from user object
      if (user?.school_name) {
        setFormData(prev => ({
          ...prev,
          school_name: user.school_name
        }));
        return;
      }
      
      // If not in user object, fetch from API
      setSchoolLoading(true);
      try {
        const response = await fetch(`https://brjobsedu.com/Epathshala/Epathshala_backend/api/school-reg/?school_uni_id=${uniqueId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.school_name) {
            setFormData(prev => ({
              ...prev,
              school_name: result.data.school_name
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching institution details:', error);
      } finally {
        setSchoolLoading(false);
      }
    };
    
    fetchSchoolDetails();
  }, [uniqueId, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(t.success);
        setFormData(prev => ({ ...prev, title: '', issue: '' }));
        fetchQueries();
      } else {
        alert(t.errorSubmit);
      }
    } catch (error) {
      console.error('Error submitting query:', error);
      alert(t.errorSubmit);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'pending') return 'bg-warning text-dark';
    if (s === 'resolved' || s === 'completed') return 'bg-success';
    if (s === 'rejected' || s === 'cancelled') return 'bg-danger';
    return 'bg-info';
  };

  return (
    <div className="dashboard-container">
      <SchoolLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <SchoolHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-box mt-3">
          <div className="mb-4">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/SchoolDashBoard')} 
              className="d-flex align-items-center"
            >
              <FaArrowLeft className="me-2" /> {t.back}
            </Button>
          </div>

          <Row>
            <Col lg={12}>
              {/* Query Form */}
              <Card className="shadow-box mb-4">
                <Card.Header className="bg-white py-3">
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaQuestionCircle className="me-2 text-primary" />
                    {t.raiseTitle}
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      {/* <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>{t.schoolName}</Form.Label>
                          <Form.Control
                            type="text"
                            name="school_name"
                            value={formData.school_name}
                            onChange={handleInputChange}
                            placeholder="Enter school name"
                            required
                          />
                        </Form.Group>
                      </Col> */}
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>{t.queryTitle}</Form.Label>
                          <Form.Control
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter query title"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>{t.description}</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="issue"
                            value={formData.issue}
                            onChange={handleInputChange}
                            placeholder="Describe your concern in detail..."
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={submitting}
                      className="d-flex align-items-center"
                    >
                      {submitting ? (
                        <><Spinner animation="border" size="sm" className="me-2" /> {t.submitting}</>
                      ) : (
                        <><FaPaperPlane className="me-2" /> {t.submit}</>
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>

              {/* Queries List */}
              <Card className="shadow-box">
                <Card.Header className="bg-white py-3">
                  <h5 className="mb-0 d-flex align-items-center">
                    <FaHistory className="me-2 text-primary" />
                    {t.historyTitle}
                  </h5>
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" variant="primary" />
                      <p className="text-muted mt-2">{t.loading}</p>
                    </div>
                  ) : queries.length === 0 ? (
                    <Alert variant="info" className="d-flex align-items-center">
                      <FaClock className="me-2" /> {t.noQueries}
                    </Alert>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className="align-middle">
                        <thead className="table-school">
                          <tr>
                            <th>{t.table.id}</th>
                            <th>{t.table.title}</th>
                            <th>{t.table.issue}</th>
                            <th>{t.table.status}</th>
                            <th>{t.table.remark}</th>
                            <th>{t.table.date}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {queries.map((q) => (
                            <tr key={q.id}>
                              <td className="fw-bold">{q.query_id || q.id}</td>
                              <td>{q.title}</td>
                              <td style={{ maxWidth: '250px' }} className="text-truncate" title={q.issue}>
                                {q.issue}
                              </td>
                              <td>
                                <Badge className={getStatusBadge(q.status)}>
                                  {q.status?.toUpperCase()}
                                </Badge>
                              </td>
                              <td className="text-muted">{q.extra_remark || '-'}</td>
                              <td>{q.created_at ? new Date(q.created_at).toLocaleDateString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default SchoolSendQuery;