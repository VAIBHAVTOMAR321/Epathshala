import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Button, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserHeader from './UserHeader';
import UserLeftNav from './UserLeftNav';
import '../../assets/css/userleftnav.css';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaUserTie, FaVideo, FaInfoCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '../all_login/AuthContext';
import { useLanguage } from '../all_login/LanguageContext';

const translations = {
  en: {
    title: 'My Counseling Sessions',
    subtitle: 'Check the status and details of your counseling requests.',
    backToDashboard: 'Back to Dashboard',
    loading: 'Loading...',
    noRequests: 'You have not made any counseling requests yet.',
    status: 'Status',
    category: 'Category',
    counselor: 'Counselor',
    dateTime: 'Date & Time',
    joinMeeting: 'Join Meeting',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    counselorNotAssigned: 'Not Assigned Yet',
  },
  hi: {
    title: 'मेरे परामर्श सत्र',
    subtitle: 'अपने परामर्श अनुरोधों की स्थिति और विवरण देखें।',
    backToDashboard: 'डैशबोर्ड पर वापस जाएं',
    loading: 'लोड हो रहा है...',
    noRequests: 'आपने अभी तक कोई परामर्श अनुरोध नहीं किया है।',
    status: 'स्थिति',
    category: 'श्रेणी',
    counselor: 'परामर्शदाता',
    dateTime: 'दिनांक और समय',
    joinMeeting: 'मीटिंग में शामिल हों',
    pending: 'लंबित',
    approved: 'स्वीकृत',
    rejected: 'अस्वीकृत',
    completed: 'पूर्ण',
    counselorNotAssigned: 'अभी तक असाइन नहीं किया गया है',
  },
};

const CounselingDetails = () => {
  const { uniqueId, accessToken } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [counselingData, setCounselingData] = useState([]);
  const t = translations[language] || translations.en;

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!uniqueId || !accessToken) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`https://brjobsedu.com/epathshala/epathshala_backend/api/student-cousult/?student_id=${uniqueId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 10000,
        });
        if (response.data.status) {
          setCounselingData(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching counseling data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken, uniqueId]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      year: 'numeric', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return <Badge bg="success"><FaCheckCircle className="me-1" />{t.approved}</Badge>;
      case 'pending': return <Badge bg="warning"><FaClock className="me-1" />{t.pending}</Badge>;
      case 'rejected': return <Badge bg="danger"><FaTimesCircle className="me-1" />{t.rejected}</Badge>;
      case 'completed': return <Badge bg="primary">{t.completed}</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="dashboard-container">
      <UserLeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
      <div className="main-content-dash">
        <UserHeader toggleSidebar={toggleSidebar} />

        <Container className="dashboard-box mt-3">
          <div className="mb-4">
            <Button variant="outline-secondary" onClick={() => navigate('/UserDashboard')} className="d-flex align-items-center">
              <FaArrowLeft className="me-2" />
              {t.backToDashboard}
            </Button>
          </div>

          <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, rgb(94, 117, 223), rgb(42, 15, 132))' }}>
            <Card.Body className="py-4 text-white">
              <h2 className="mb-2 fw-bold"><FaUserTie className="me-2" />{t.title}</h2>
              <p className="mb-0 opacity-75">{t.subtitle}</p>
            </Card.Body>
          </Card>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
              <p className="mt-3">{t.loading}</p>
            </div>
          ) : counselingData.length === 0 ? (
            <Card className="text-center py-5 shadow-sm border-0">
              <Card.Body>
                <FaInfoCircle size={40} className="text-muted mb-3" />
                <h4>{t.noRequests}</h4>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {counselingData.map((item) => (
                <Col md={6} lg={4} key={item.id} className="mb-4">
                  <Card className="h-100 shadow-sm border-0">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <strong>{t.category}: {item.category_consulting.join(', ')}</strong>
                      {getStatusBadge(item.status)}
                    </Card.Header>
                    <Card.Body>
                      {item.counselor_details ? (
                        <div className="mb-3">
                          <strong><FaUserTie className="me-2" />{t.counselor}:</strong> {item.counselor_details.name}
                        </div>
                      ) : (
                        <div className="mb-3 text-muted">
                          <strong><FaUserTie className="me-2" />{t.counselor}:</strong> {t.counselorNotAssigned}
                        </div>
                      )}
                      {item.con_datetime && (
                        <div className="mb-3">
                          <strong><FaCalendarAlt className="me-2" />{t.dateTime}:</strong> {formatDateTime(item.con_datetime)}
                        </div>
                      )}
                      {item.status.toLowerCase() === 'approved' && item.meeting_link && (() => {
                        const now = new Date();
                        const startTime = item.con_datetime ? new Date(item.con_datetime) : null;
                        // Assuming a 1-hour duration for the meeting as no end time is provided by the API.
                        const assumedEndTime = startTime ? new Date(startTime.getTime() + 60 * 60 * 1000) : null;
                        // The button should be enabled only when the current time is within the meeting window.
                        const isMeetingActive = startTime && assumedEndTime && now >= startTime && now <= assumedEndTime;

                        return (
                          <Button 
                            variant="primary" 
                            href={isMeetingActive ? item.meeting_link : null}
                            target="_blank" 
                            className="w-100"
                            disabled={!isMeetingActive}>
                            <FaVideo className="me-2" />{t.joinMeeting}
                          </Button>
                        );
                      })()}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>
    </div>
  );
};

export default CounselingDetails;