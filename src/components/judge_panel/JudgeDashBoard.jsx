import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Table,
  Badge,
  Form,
} from "react-bootstrap";
import axios from "axios";
import "../../assets/css/userleftnav.css";
import {
  FaEdit,
  FaSave,
  FaArrowLeft,
  FaEye,
  FaFileAlt,
  FaClipboardList,
  FaUserGraduate,
  FaUserCheck,
} from "react-icons/fa";

import { useAuth } from "../all_login/AuthContext";
import JudgeLeftNav from "./JudgeLeftNav";
import JudgeTopNav from "./JudgeTopNav";

// ---------- API endpoints ----------
const EVAL_PARAMETERS_API_URL =
  "https://brjobsedu.com/epathshala/epathshala_backend/api/group-evaluation-parameters/";
const JUDGE_SUBMISSIONS_API_URL =
  "https://brjobsedu.com/epathshala/epathshala_backend/api/student-presentation-submissions-by-judge/";
const JUDGE_EVALUATION_GET_API_URL =
  "https://brjobsedu.com/epathshala/epathshala_backend/api/student-presentation-evaluations-byschl-judge/";
const JUDGE_EVALUATION_POST_API_URL =
  "https://brjobsedu.com/epathshala/epathshala_backend/api/student-presentation-evaluations-byschl-judge/";

// ---------- helpers ----------
const asArray = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.results)) return response.results;
  return [];
};

// Normalise the GET evaluations response.
// Backend returns (after fix):
// { success, role, school_uni_id, data: [ { id, submission, judge_name, judge_unique_id, school_uni_id, school_name, group_name, evaluation_details, max_point, ... } ] }
const extractEvaluations = (res) => {
  const r = res?.data ?? res;
  if (Array.isArray(r)) return r;
  if (Array.isArray(r?.data)) return r.data;
  if (Array.isArray(r?.data?.data)) return r.data.data;
  if (Array.isArray(r?.evaluations)) return r.evaluations;
  if (Array.isArray(r?.results)) return r.results;
  if (r?.data && typeof r.data === "object" && !Array.isArray(r.data)) {
    return [r.data];
  }
  return [];
};

const mediaUrl = (file) => {
  if (!file) return null;
  if (/^https?:\/\//i.test(file)) return file;
  return `https://brjobsedu.com/epathshala/epathshala_backend${file.startsWith("/") ? "" : "/"}${file}`;
};

const safeJoin = (arr, sep = ", ") =>
  Array.isArray(arr) ? arr.join(sep) : "";

// ---------- component ----------
const JudgeDashBoard = () => {
  // Device width state
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // submissions
  const [queries, setQueries] = useState([]);

  // evaluations
  const [evaluations, setEvaluations] = useState([]);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evaluationParameters, setEvaluationParameters] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [evaluationDetails, setEvaluationDetails] = useState([]);
  const [totalMaxPoint, setTotalMaxPoint] = useState(0);
  const [saving, setSaving] = useState(false);

  const { user, accessToken, uniqueId } = useAuth();

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  // ---------- fetchers ----------
  const fetchParameters = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await axios.get(EVAL_PARAMETERS_API_URL, getAuthConfig());
      const params = asArray(response.data);
      setEvaluationParameters(params);
      setTotalMaxPoint(
        params.reduce(
          (sum, p) => sum + Number(p.weightage || p.max_point || 0),
          0
        )
      );
    } catch (err) {
      console.error("Error fetching evaluation parameters:", err);
    }
  }, [accessToken]);

  const fetchSubmissions = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(JUDGE_SUBMISSIONS_API_URL, {
       ...getAuthConfig(),
       params: { judge: uniqueId, judge_id: uniqueId },
     });
      const list = Array.isArray(response.data)
        ? response.data
        : asArray(response.data);
      setQueries(list);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Failed to load presentation submissions");
      setQueries([]);
    } finally {
setLoading(false);
     }
   }, [accessToken, uniqueId]);

  const fetchEvaluations = useCallback(async () => {
    if (!accessToken || !uniqueId) return;
    setEvalLoading(true);
    try {
      const response = await axios.get(JUDGE_EVALUATION_GET_API_URL, {
       ...getAuthConfig(),
       params: { judge: uniqueId, judge_id: uniqueId },
      });
      console.log("GET EVAL RESPONSE:", response);
      const data = extractEvaluations(response);
      console.log("GET EVAL EXTRACTED:", data);
      setEvaluations(data);
    } catch (err) {
      console.error("GET EVAL ERR:", err);
      setEvaluations([]);
    } finally {
      setEvalLoading(false);
    }
  }, [accessToken, uniqueId]);

  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      await Promise.all([
        fetchSubmissions(),
        fetchEvaluations(),
        fetchParameters(),
      ]);
    })();
  }, [accessToken, fetchSubmissions, fetchEvaluations, fetchParameters]);

  // ---------- device-width detection ----------
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  // ---------- isEvaluated ----------
  // Match by submission ID first (robust, after backend fix).
  // Fallback to group_name + school_uni_id for older backend versions.
  const isEvaluated = (submission) => {
    if (!submission) return false;
    const sid = submission.id;
    const groupName = submission.group_name;
    const schoolUniId = submission.school_uni_id;
    const schoolName = submission.school_name;

    return evaluations.some((ev) => {
      // PRIMARY: exact match by submission foreign-key id
      if (sid && (ev.submission === sid || ev.submission_id === sid)) {
        return true;
      }
      // FALLBACK: group_name + school match (only if backend doesn't return `submission`)
      if (
        groupName &&
        ev.group_name === groupName &&
        (ev.school_uni_id === schoolUniId ||
          ev.school_name === schoolName)
      ) {
        return true;
      }
      return false;
    });
  };

  // Get the judge name who evaluated a particular submission (for the submissions table)
  const getEvaluatorName = (submission) => {
    if (!submission) return null;
    const sid = submission.id;
    const ev = evaluations.find(
      (e) =>
        (sid && (e.submission === sid || e.submission_id === sid)) ||
        (submission.group_name &&
          e.group_name === submission.group_name &&
          (e.school_uni_id === submission.school_uni_id ||
            e.school_name === submission.school_name))
    );
    return ev?.judge_name || ev?.judge_unique_id || null;
  };

  // ---------- handlers ----------
  const handleSelectSubmission = (submission) => {
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
    if (v !== "" && Number(v) < 0) v = "0";
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
        setError(
          `Points for "${detail.criteria}" must be between 0 and ${detail.max_point}.`
        );
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

      // Re-fetch fresh evaluations list (now school-wide after backend fix)
      await fetchEvaluations();

      // Reset the form
      setSelectedSubmission(null);
      setEvaluationDetails([]);
    } catch (err) {
      const detail = err?.response?.data;
      setError(
        detail?.detail ||
          detail?.message ||
          (typeof detail === "string" ? detail : "Unable to submit evaluation.")
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------- computed totals ----------
  const getEvalTotal = (ev) =>
    Array.isArray(ev.evaluation_details)
      ? ev.evaluation_details.reduce(
          (s, d) => s + (Number(d.obtained_point) || Number(d.points) || 0),
          0
        )
      : 0;

  const getEvalMax = (ev) => {
    if (Number(ev.max_point) > 0) return Number(ev.max_point);
    return Array.isArray(ev.evaluation_details)
      ? ev.evaluation_details.reduce(
          (s, d) =>
            s +
            (Number(d.max_point) ||
              Number(d.max_points) ||
              Number(d.weightage) ||
              0),
          0
        )
      : 0;
  };

  // Stats for header
  const stats = useMemo(() => {
    const total = queries.length;
    const evaluated = queries.filter(isEvaluated).length;
    const pending = total - evaluated;
    return { total, evaluated, pending };
  }, [queries, evaluations]);

  // ---------- UI ----------
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
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError("")}
              className="mb-3"
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              variant="success"
              dismissible
              onClose={() => setSuccess("")}
              className="mb-3"
            >
              {success}
            </Alert>
          )}

          {selectedSubmission ? (
            /* ---------- EVALUATION FORM ---------- */
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
                      <FaUserGraduate className="me-2" /> Evaluation:{" "}
                      <strong>{selectedSubmission.group_name}</strong>
                      <span className="text-muted ms-2">
                        (Topic: {selectedSubmission.topic_name || "—"})
                      </span>
                    </Col>
                    <Col md={4} className="text-end">
                      <Badge bg="primary">{selectedSubmission.school_name}</Badge>
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSave}>
                    <p className="text-muted small mb-3">
                      Enter points for each evaluation parameter. Total weightage:{" "}
                      <strong>{totalMaxPoint}</strong>
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
                                value={
                                  detail.obtained_point === ""
                                    ? ""
                                    : detail.obtained_point
                                }
                                onChange={(e) =>
                                  handleChange(index, e.target.value)
                                }
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
                          {evaluationDetails.reduce(
                            (sum, d) => sum + (Number(d.obtained_point) || 0),
                            0
                          )}{" "}
                          / {totalMaxPoint}
                        </strong>
                      </div>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={saving || isEvaluated(selectedSubmission)}
                      >
                        {saving ? (
                          <Spinner animation="border" size="sm" role="status" />
                        ) : (
                          <FaSave />
                        )}{" "}
                        {isEvaluated(selectedSubmission)
                          ? "Already Evaluated"
                          : "Submit Evaluation"}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          ) : (
            <>
              {/* ---------- STATS BANNER ---------- */}
              {!loading && queries.length > 0 && (
                <Row className="mb-4">
                  <Col md={4} sm={6} className="mb-2">
                    <Card className="text-center bg-light">
                      <Card.Body>
                        <h3 className="mb-0 text-primary">{stats.total}</h3>
                        <small className="text-muted">Total Submissions</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4} sm={6} className="mb-2">
                    <Card className="text-center bg-light">
                      <Card.Body>
                        <h3 className="mb-0 text-success">{stats.evaluated}</h3>
                        <small className="text-muted">Evaluated</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4} sm={6} className="mb-2">
                    <Card className="text-center bg-light">
                      <Card.Body>
                        <h3 className="mb-0 text-warning">{stats.pending}</h3>
                        <small className="text-muted">Pending</small>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* ---------- SUBMISSIONS LIST ---------- */}
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
                        Total submissions: {queries.length} · Evaluated:{" "}
                        {stats.evaluated} · Pending: {stats.pending}
                      </p>
                    </Col>
                  </Row>

                  <Table
                    striped
                    bordered
                    hover
                    responsive
                    className="table-card align-middle"
                  >
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
                      {queries.map((submission, index) => {
                        const evaluated = isEvaluated(submission);
                        const evaluator = getEvaluatorName(submission);
                        return (
                          <tr key={submission.id}>
                            <td>{index + 1}</td>
                            <td>{submission.school_name}</td>
                            <td>
                              <strong>{submission.group_name}</strong>
                            </td>
                            <td>{submission.topic_name}</td>
                            <td>
                              {Array.isArray(submission.student_ids)
                                ? submission.student_ids.join(", ")
                                : Array.isArray(submission.students)
                                ? submission.students
                                    .map(
                                      (s) =>
                                        s.student_name || s.full_name || s.name
                                    )
                                    .join(", ")
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
                              <Badge bg={evaluated ? "success" : "secondary"}>
                                {evaluated ? "Evaluated" : "Pending"}
                              </Badge>
                            </td>
                            <td className="text-center small">
                              {evaluator ? (
                                <span title={evaluator}>
                                  <FaUserCheck className="me-1 text-success" />
                                  {evaluator}
                                </span>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td className="text-center">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleSelectSubmission(submission)}
                                disabled={evaluated}
                              >
                                <FaEdit />{" "}
                                {evaluated ? "Evaluated" : "Evaluate"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </>
              )}

              {!loading && !error && queries.length === 0 && (
                <Alert variant="info" className="mt-4">
                  No presentation submissions found.
                </Alert>
              )}

              {/* ---------- EVALUATIONS LIST ---------- */}
              {!evalLoading && (
                <>
                  <Row className="mb-3 mt-4">
                    <Col>
                      <h5 className="fw-bold">
                        <FaClipboardList /> Evaluation List
                      </h5>
                      <p className="text-muted small mb-0">
                        Total evaluations: {evaluations.length}
                        {evaluations.length > 0 &&
                          " · Shows all evaluations by every judge in your school"}
                      </p>
                    </Col>
                  </Row>
                  {evaluations.length === 0 ? (
                    <Alert variant="info">No evaluations found.</Alert>
                  ) : (
                    <Table
                      striped
                      bordered
                      hover
                      responsive
                      className="table-card align-middle"
                    >
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>School</th>
                          <th>Group Name</th>
                         
                          <th>Parameters</th>
                          <th className="text-center">Points</th>
                          <th className="text-center">Max Points</th>
                          <th className="text-center">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluations.map((ev, idx) => {
                          const total = getEvalTotal(ev);
                          const max = getEvalMax(ev);
                          const full = max > 0 && total === max;
                          const pct = max > 0 ? Math.round((total / max) * 100) : 0;
                          const isMine =
                            ev.judge_unique_id === uniqueId ||
                            ev.judge_unique_id === user?.uniqueId;
                          return (
                            <tr
                              key={ev.id ?? idx}
                              className={full ? "table-success" : ""}
                            >
                              <td>{idx + 1}</td>
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
                                            d.obtained_point ?? d.points ?? 0
                                          }/${
                                            d.max_point ??
                                            d.max_points ??
                                            d.weightage ??
                                            0
                                          }`
                                      )
                                      .join(", ")
                                  : "—"}
                              </td>
                              <td className="text-center">
                                <strong>{total}</strong>
                              </td>
                              <td className="text-center">{max || "—"}</td>
                              <td className="text-center">
                                <Badge
                                  bg={
                                    pct >= 75
                                      ? "success"
                                      : pct >= 50
                                      ? "warning"
                                      : "danger"
                                  }
                                >
                                  {pct}%
                                </Badge>
                              </td>
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
