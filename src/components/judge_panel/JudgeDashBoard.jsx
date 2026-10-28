import React, { useState, useEffect, useCallback } from "react";
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
  FaArrowLeft,
  FaEdit,
  FaSave,
  FaUserGraduate,
  FaLink,
} from "react-icons/fa";

import { useAuth } from "../all_login/AuthContext";
import JudgeLeftNav from "./JudgeLeftNav";
import JudgeTopNav from "./JudgeTopNav";

const EVAL_PARAMETERS_API_URL =
  "https://brjobsedu.com/epathshala/epathshala_backend/api/group-evaluation-parameters/";
const JUDGE_SUBMISSIONS_API_URL =
  "https://brjobsedu.com/epathshala/epathshala_backend/api/student-presentation-submissions-by-judge/";
const JUDGE_EVALUATION_GET_API_URL =
  "https://brjobsedu.com/epathshala/epathshala_backend/api/student-presentation-evaluations-byschl-judge/";
const JUDGE_EVALUATION_POST_API_URL =
  "https://brjobsedu.com/epathshala/epathshala_backend/api/student-presentation-evaluations-byschl-judge/";

const asArray = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.results)) return response.results;
  return [];
};

const mediaUrl = (file) => {
  if (!file) return null;
  if (/^https?:\/\//i.test(file)) return file;
  if (file.startsWith("http")) return file;
  return `https://brjobsedu.com/epathshala/epathshala_backend${file.startsWith("/") ? "" : "/"}${file}`;
};

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
  const [success, setSuccess] = useState("");
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

  // Evaluation marks state
  const [evaluations, setEvaluations] = useState([]);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evaluationParameters, setEvaluationParameters] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [evaluationDetails, setEvaluationDetails] = useState([]);
  const [totalMaxPoint, setTotalMaxPoint] = useState(0);
  const [saving, setSaving] = useState(false);

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const fetchParameters = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await axios.get(EVAL_PARAMETERS_API_URL, getAuthConfig());
      const params = asArray(response.data);
      setEvaluationParameters(params);
      setTotalMaxPoint(params.reduce((sum, p) => sum + Number(p.weightage || 0), 0));
    } catch (err) {
      console.error("Error fetching evaluation parameters:", err);
    }
  }, [accessToken]);

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
          JUDGE_SUBMISSIONS_API_URL,
          getAuthConfig()
        );

        if (isMounted) {
          setQueries(Array.isArray(response.data) ? response.data : asArray(response.data));
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

    const fetchEvaluations = async () => {
      if (!accessToken) return;
      setEvalLoading(true);
      try {
        const response = await axios.get(
          JUDGE_EVALUATION_GET_API_URL,
          getAuthConfig()
        );
        const res = response.data;
        let data = [];
        if (Array.isArray(res)) data = res;
        else if (Array.isArray(res?.data)) data = res.data;
        else if (Array.isArray(res?.data?.data)) data = res.data.data;
        else if (Array.isArray(res?.evaluations)) data = res.evaluations;
        else if (Array.isArray(res?.results)) data = res.results;
        if (isMounted) setEvaluations(data);
      } catch (err) {
        if (isMounted) setEvaluations([]);
      } finally {
        if (isMounted) setEvalLoading(false);
      }
    };

    fetchSubmissions();
    fetchEvaluations();
    fetchParameters();

    return () => {
      isMounted = false;
    };
  }, [accessToken, fetchParameters]);

  const toggleSidebar = () => {
    if (isMobile || isTablet) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const isEvaluated = (submissionId) =>
    evaluations.some((ev) => ev.submission === submissionId || ev.submission_id === submissionId);

  const handleSelectSubmission = async (submission) => {
    setSelectedSubmission(submission);
    setEvaluationDetails(
      (evaluationParameters || []).map((param) => ({
        criteria: param.parameter || param.criteria,
        obtained_point: "",
        max_point: Number(param.weightage || param.max_point || 0),
      }))
    );
    setSuccess("");
    setError("");
  };

  const handleBack = () => {
    setSelectedSubmission(null);
    setEvaluationDetails([]);
    setSuccess("");
    setError("");
  };

  const handleChange = (index, value) => {
    const next = [...evaluationDetails];
    const max = Number(next[index].max_point || 0);
    let v = value;
    if (v !== "" && Number(v) > max) v = String(max);
    next[index].obtained_point = v;
    setEvaluationDetails(next);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    for (const detail of evaluationDetails) {
      if (detail.obtained_point === "" || detail.obtained_point === null) {
        setError("Please enter points for all criteria.");
        return;
      }
      const points = Number(detail.obtained_point);
      if (points < 0 || points > detail.max_point) {
        setError(`Points for "${detail.criteria}" must be between 0 and ${detail.max_point}.`);
        return;
      }
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        submission: selectedSubmission.id,
        group_name: selectedSubmission.group_name,
        evaluation_details: evaluationDetails.map((d) => ({
          criteria: d.criteria,
          max_point: Number(d.max_point),
          obtained_point: Number(d.obtained_point),
        })),
        max_point: totalMaxPoint,
      };
      await axios.post(JUDGE_EVALUATION_POST_API_URL, payload, getAuthConfig());
      setSuccess("Evaluation submitted successfully.");
      const res = await axios.get(JUDGE_EVALUATION_GET_API_URL, getAuthConfig());
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      setEvaluations(data);
    } catch (err) {
      const detail = err?.response?.data;
      setError(detail?.detail || detail?.message || "Unable to submit evaluation.");
    } finally {
      setSaving(false);
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
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")} className="mb-3">
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess("")} className="mb-3">
              {success}
            </Alert>
          )}

          {selectedSubmission ? (
            <div>
              <Row className="mb-3">
                <Col>
                  <Button variant="outline-secondary" onClick={handleBack}>
                    <FaArrowLeft /> Back to submissions
                  </Button>
                </Col>
              </Row>
              <Card>
                <Card.Header>
                  <Row className="align-items-center">
                    <Col md={8}>
                      <FaUserGraduate className="me-2" /> Evaluation: <strong>{selectedSubmission.group_name}</strong>
                    </Col>
                    <Col md={4} className="text-end">
                      <Badge bg="primary">{selectedSubmission.school_name}</Badge>
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSave}>
                    <p className="text-muted small mb-3">
                      Enter points for each evaluation parameter. Total weightage: <strong>{totalMaxPoint}</strong>
                    </p>
                    <Table striped bordered hover className="mb-4">
                      <thead>
                        <tr>
                          <th>Evaluation Parameter</th>
                          <th className="text-center">Max Points (Weightage)</th>
                          <th className="text-center">Points Awarded</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluationDetails.map((detail, index) => (
                          <tr key={index}>
                            <td>{detail.criteria}</td>
                            <td className="text-center">{detail.max_point}</td>
                            <td className="text-center">
                              <Form.Control
                                type="number"
                                value={detail.obtained_point === "" ? "" : detail.obtained_point}
                                onChange={(e) => handleChange(index, e.target.value)}
                                min={0}
                                max={detail.max_point}
                                placeholder="0"
                                required
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        Total awarded:{" "}
                        <strong>
                          {evaluationDetails.reduce((sum, d) => sum + (Number(d.obtained_point) || 0), 0)} / {totalMaxPoint}
                        </strong>
                      </div>
                      <Button type="submit" variant="primary" disabled={saving || isEvaluated(selectedSubmission.id)}>
                        {saving ? <Spinner animation="border" size="sm" role="status" /> : <FaSave />} {isEvaluated(selectedSubmission.id) ? "Already Evaluated" : "Submit Evaluation"}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          ) : (
            <>
              {loading && (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              )}

              {!loading && !error && queries.length > 0 && (
                <>
                  <Row className="mb-3 align-items-center">
                    <Col md>
                      <h5>
                        <FaClipboardList /> Student Presentation Submissions
                      </h5>
                      <p className="text-muted small mb-0">
                        Total submissions: {queries.length}
                      </p>
                    </Col>
                  </Row>

                  <Table striped bordered hover responsive className="table-card align-middle">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>School</th>
                        <th>Group</th>
                        <th>Topic</th>
                        <th>Students</th>
                        <th>Submission Link</th>
                        <th>Submission File</th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queries.map((submission, index) => (
                        <tr key={submission.id}>
                          <td>{index + 1}</td>
                          <td>{submission.school_name}</td>
                          <td><strong>{submission.group_name}</strong></td>
                          <td>{submission.topic_name}</td>
                          <td>
                            {Array.isArray(submission.student_ids)
                              ? submission.student_ids.join(", ")
                              : Array.isArray(submission.students)
                                ? submission.students.map((s) => s.student_name || s.full_name || s.name).join(", ")
                                : "-"}
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
                                href={mediaUrl(submission.submission_file)}
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
                          <td className="text-center">
                            <Badge bg={isEvaluated(submission.id) ? "success" : "secondary"}>
                              {isEvaluated(submission.id) ? "Evaluated" : "Pending"}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleSelectSubmission(submission)}
                              disabled={isEvaluated(submission.id)}
                            >
                              <FaEdit /> {isEvaluated(submission.id) ? "Evaluated" : "Evaluate"}
                            </Button>
                          </td>
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

              {!evalLoading && (
                <>
                  <Row className="mb-3 mt-4">
                    <Col>
                      <h5 className="fw-bold">
                        <FaClipboardList /> Evaluation List
                      </h5>
                      <p className="text-muted small mb-0">
                        Total evaluations: {evaluations.length}
                      </p>
                    </Col>
                  </Row>
                  {evaluations.length === 0 ? (
                    <Alert variant="info">No evaluations found.</Alert>
                  ) : (
                    <Table striped bordered hover responsive className="table-card align-middle">
                      <thead>
                        <tr>
                          <th>School</th>
                          <th>Group Name</th>
                          <th>Parameters</th>
                          <th className="text-center">Points</th>
                          <th className="text-center">Max Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluations.map((ev) => {
                          const total = Array.isArray(ev.evaluation_details)
                            ? ev.evaluation_details.reduce(
                                (s, d) =>
                                  s +
                                  (Number(d.obtained_point) ||
                                    Number(d.points) ||
                                    0),
                                0
                              )
                            : 0;
                          const max = Number(ev.max_point) || 0;
                          const full = max > 0 && total === max;

                          return (
                            <tr key={ev.id} className={full ? "table-success" : ""}>
                              <td>{ev.school_name || "—"}</td>
                              <td>
                                <strong>{ev.group_name || "Unnamed"}</strong>
                              </td>
                              <td>
                                {Array.isArray(ev.evaluation_details)
                                  ? ev.evaluation_details
                                      .map(
                                        (d) =>
                                          `${d.criteria || d.parameter}: ${
                                            d.obtained_point ?? d.points
                                          }/${
                                            d.max_point ?? d.max_points ?? d.weightage
                                          }`
                                      )
                                      .join(", ")
                                  : "—"}
                              </td>
                              <td className="text-center">{total}</td>
                              <td className="text-center">{max || "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  )}
                </>
              )}
            </>
          )}
        </Container>
      </div>
    </div>
  );
};

export default JudgeDashBoard;