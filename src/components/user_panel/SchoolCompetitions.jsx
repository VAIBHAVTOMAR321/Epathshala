import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner, Button } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../all_login/AuthContext";
import { useLanguage } from "../all_login/LanguageContext";
import UserHeader from "./UserHeader";
import UserLeftNav from "./UserLeftNav";
import "./UserProfile.css";

const SchoolCompetitions = () => {
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const { accessToken, user, uniqueId } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolledCompetitions, setEnrolledCompetitions] = useState(new Set());

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch competitions
  useEffect(() => {
    const fetchCompetitions = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "https://brjobsedu.com/Epathshala/Epathshala_backend/api/offline-competition/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        // Handle multiple possible API formats
        let competitionsData = [];
        if (response.data?.success && Array.isArray(response.data.data)) {
          competitionsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          competitionsData = response.data;
        } else {
          competitionsData = [];
        }

        // Filter to only include active competitions
        const activeCompetitions = competitionsData.filter(
          comp => comp.is_active !== false
        );
        setCompetitions(activeCompetitions);

        // Fetch enrolled competitions for the student
        await fetchEnrolledCompetitions();

      } catch (err) {
        console.error("Error fetching competitions:", err);
        setError("Failed to load competitions");
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, [accessToken, user, uniqueId]);

  // Fetch enrolled competitions for the current student
  const fetchEnrolledCompetitions = async () => {
    try {
      // Get student ID from user object or uniqueId
      const studentId = user?.student_id || uniqueId;
      
      if (!studentId) {
        console.warn("Unable to identify student for enrollment check");
        return;
      }

      const response = await axios.get(
        `https://brjobsedu.com/Epathshala/Epathshala_backend/api/offline-competition-participation/?student_id=${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      let enrolledIds = new Set();
      if (response.data?.success && Array.isArray(response.data.data)) {
        response.data.data.forEach(item => {
          enrolledIds.add(item.completion_id);
        });
      } else if (Array.isArray(response.data)) {
        response.data.forEach(item => {
          enrolledIds.add(item.completion_id);
        });
      }
      
      setEnrolledCompetitions(enrolledIds);
    } catch (err) {
      console.error("Error fetching enrolled competitions:", err);
      // Don't set error here as it's not critical for the main competition list
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleEnroll = async (comp) => {
    try {
      // Get student ID from user object or uniqueId
      const studentId = user?.student_id || uniqueId;
      
      if (!studentId) {
        alert('Unable to identify student. Please log in again.');
        return;
      }

      const response = await axios.post(
        'https://brjobsedu.com/Epathshala/Epathshala_backend/api/offline-competition-participation/',
        {
          student_id: studentId,
          completion_id: comp.completion_id
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data?.success) {
        alert('Successfully enrolled in competition!');
        // Update enrolled competitions state
        setEnrolledCompetitions(prev => new Set(prev).add(comp.completion_id));
      } else {
        alert(response.data?.message || 'Failed to enroll in competition');
      }
    } catch (err) {
      console.error('Error enrolling in competition:', err);
      alert('Failed to enroll in competition. Please try again.');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <UserLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content */}
      <div className="main-content-dash">
        <UserHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-box mt-3">
          
          {/* Loading */}
          {loading && (
            <div className="profile-loading">
              <Spinner animation="border" variant="primary" />
              <p>Loading competitions...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center text-danger p-4">
              {error}
            </div>
          )}

          {/* Data */}
          {!loading && !error && (
            <>
              <h2 className="mb-4">Institutional Competitions</h2>

              <Row className="g-4">
                {competitions.length > 0 ? (
                  competitions.map((comp) => (
                    <Col
                      key={comp.id || comp.completion_id}
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                    >
                      <Card className="competition-card h-100 shadow-box">
                        <Card.Body>

                          <Card.Title>
                            {language === 'hi' && comp.title_hindi ? comp.title_hindi : (comp.title || (language === 'hi' ? "बिना शीर्षक" : "Untitled"))}
                          </Card.Title>

                          <Card.Text className="mt-2">
                            {language === 'hi' && comp.description_hindi ? comp.description_hindi : (comp.description || "-")}
                          </Card.Text>

                          <div className="mt-3">
                            <p>
                              <strong>{language === 'hi' ? "शैक्षणिक संस्था:" : "Institution:"}</strong>{" "}
                              {comp.school_name || "-"}
                            </p>

                            <p>
                              <strong>{language === 'hi' ? "स्थान:" : "Location:"}</strong>{" "}
                              {comp.location || "-"}
                            </p>

                            <p>
                              <strong>{language === 'hi' ? "तिथि:" : "Date:"}</strong>{" "}
                              {comp.comp_date_time
                                ? new Date(
                                    comp.comp_date_time
                                  ).toLocaleDateString()
                                : "-"}
                            </p>
                          </div>

                          {enrolledCompetitions.has(comp.completion_id) ? (
                            <Button
                              variant="success"
                              className="w-100 mt-3"
                              disabled
                            >
                              {language === 'hi' ? "नामांकित" : "Enrolled"}
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              className="w-100 mt-3"
                              onClick={() => handleEnroll(comp)}
                            >
                              {language === 'hi' ? "अभी शामिल हों" : "Enroll Now"}
                            </Button>
                          )}

                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col>
                    <div className="text-center p-4">
                      No competitions available
                    </div>
                  </Col>
                )}
              </Row>
            </>
          )}

        </Container>
      </div>
    </div>
  );
};

export default SchoolCompetitions;