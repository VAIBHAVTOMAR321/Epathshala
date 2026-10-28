import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Modal,
  ListGroup,
  Table,
  Badge,
  Form,
  ProgressBar,
  Dropdown,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import "../../assets/css/userleftnav.css";
import {
  FaUsers,
  FaUser,
  FaCheckCircle,
  FaClock,
  FaLayerGroup,
  FaBook,
  FaChartBar,
  FaChartPie,
  FaFilter,
  FaEye,
  FaFileAlt,
  FaLightbulb,
  FaSortAmountDown,
  FaSortAmountDownAlt,
  FaGraduationCap,
  FaTasks,
  FaCalendarCheck,
  FaTrophy,
  FaClipboardList,
  FaAward,
  FaStar,
  FaTimesCircle,
} from "react-icons/fa";

import { useAuth } from "../all_login/AuthContext";
import JudgeLeftNav from "./JudgeLeftNav";
import JudgeTopNav from "./JudgeTopNav";


const JudgeDashBoard = () => {
  // Device width state
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [queries, setQueries] = useState([]);
  
  // Always call hooks at the top level
  const { user, accessToken, uniqueId } = useAuth();

  // Service requests state
  const [serviceLoading, setServiceLoading] = useState(true);
  const [serviceError, setServiceError] = useState("");
  const [serviceRequests, setServiceRequests] = useState([]);

  // Enrollments state
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);
  const [enrollmentError, setEnrollmentError] = useState("");

  // Module progress state
  const [moduleProgress, setModuleProgress] = useState([]);
  const [moduleLoading, setModuleLoading] = useState(true);
  const [moduleError, setModuleError] = useState("");

  const [showDetails, setShowDetails] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  // Analytics state
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsStatusFilter, setAnalyticsStatusFilter] = useState("all");

  // --- NEW QUIZ STATE ---
  const [quizzes, setQuizzes] = useState([]);
  const [quizLoading, setQuizLoading] = useState(true);
  const [quizError, setQuizError] = useState("");
  const [showQuizDetails, setShowQuizDetails] = useState(false);
  
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizParticipants, setQuizParticipants] = useState([]);
  const [participantLoading, setParticipantLoading] = useState(false);
  const [participantError, setParticipantError] = useState("");
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  // ----------------------

  // School Rank state
  const [schoolRanks, setSchoolRanks] = useState([]);
  const [schoolRankLoading, setSchoolRankLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchSubmissions = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          "https://brjobsedu.com/epathshala/epathshala_backend/api/student-presentation-submissions-by-judge/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (isMounted) {
          setQueries(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching submissions:", err);
          setError("Failed to load presentation submissions");
          setQueries([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSubmissions();

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  const toggleSidebar = () => {
    if (isMobile || isTablet) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };



  return (
    <div className="dashboard-container">
      <JudgeLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <JudgeTopNav toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-box mt-3">
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}

          {error && !loading && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {!loading && !error && queries.length > 0 && (
            <>
              <Row className="mb-3">
                <Col>
                  <h4 className="fw-bold">Student Presentation Submissions</h4>
                  <p className="text-muted">
                    Total submissions: {queries.length}
                  </p>
                </Col>
              </Row>

              <Table striped bordered hover responsive className="table-card">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>School</th>
                    <th>Group</th>
                    <th>Topic</th>
                    <th>Students</th>
                    <th>Point</th>
                    <th>Submission Link</th>
                    <th>Submission File</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {queries.map((submission, index) => (
                    <tr key={submission.id}>
                      <td>{index + 1}</td>
                      <td>{submission.school_name}</td>
                      <td>{submission.group_name}</td>
                      <td>{submission.topic_name}</td>
                      <td>
                        {Array.isArray(submission.student_ids)
                          ? submission.student_ids.join(", ")
                          : "-"}
                      </td>
                      <td>
                        <Badge
                          variant={
                            submission.point >= 80
                              ? "success"
                              : submission.point >= 50
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {submission.point}
                        </Badge>
                      </td>
                      <td>
                        {submission.submission_link ? (
                          <a
                            href={submission.submission_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none"
                          >
                            <FaEye /> View
                          </a>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {submission.submission_file ? (
                          <a
                            href={`https://brjobsedu.com/epathshala/epathshala_backend${submission.submission_file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none"
                          >
                            <FaFileAlt /> Download
                          </a>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>{new Date(submission.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}

          {!loading && !error && queries.length === 0 && (
            <Alert variant="info" className="mt-4">
              No presentation submissions found.
            </Alert>
          )}
        </Container>
      </div>
    </div>
  );
};

export default JudgeDashBoard;