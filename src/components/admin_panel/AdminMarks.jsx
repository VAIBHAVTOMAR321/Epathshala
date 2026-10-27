import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Table, Button, Badge, Spinner,
  Form, Alert
} from 'react-bootstrap';
import axios from 'axios';
import AdminLeftNav from './AdminLeftNav';
import AdminHeader from './AdminHeader';
import { useAuth } from '../all_login/AuthContext';
import {
  FaArrowLeft, FaClipboardList, FaEdit, FaSave, FaUserGraduate,
  FaLink, FaFileAlt
} from 'react-icons/fa';

const EVAL_PARAMETERS_API_URL =
  'https://brjobsedu.com/epathshala/epathshala_backend/api/group-evaluation-parameters/';
const SUBMISSIONS_API_URL =
  'https://brjobsedu.com/epathshala/epathshala_backend/api/student-presentation-submissions/';
const EVALUATION_API_URL =
  'https://brjobsedu.com/epathshala/epathshala_backend/api/student-presentation-evaluation/';

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
  return `https://brjobsedu.com${file.startsWith('/') ? '' : '/'}${file}`;
};

const AdminMarks = () => {
  const { accessToken } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth >= 1024;
    return true;
  });
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

  const toggleSidebar = () => setSidebarOpen((p) => !p);

  const [submissions, setSubmissions] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [evaluationParameters, setEvaluationParameters] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [evaluationDetails, setEvaluationDetails] = useState([]);
  const [totalMaxPoint, setTotalMaxPoint] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  });

  const fetchParameters = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await axios.get(EVAL_PARAMETERS_API_URL, getAuthConfig());
      const params = asArray(response.data);
      setEvaluationParameters(params);
      setTotalMaxPoint(params.reduce((sum, p) => sum + Number(p.weightage || 0), 0));
    } catch (err) {
      setError('Unable to load evaluation parameters.');
    }
  }, [accessToken]);

  const fetchEvaluations = useCallback(async () => {
    if (!accessToken) {
      setEvaluations([]);
      return;
    }
    try {
      const response = await axios.get(EVALUATION_API_URL, getAuthConfig());
      setEvaluations(asArray(response.data));
    } catch (err) {
      setEvaluations([]);
    }
  }, [accessToken]);
  const fetchSubmissions = useCallback(async () => {
    if (!accessToken) {
      setSubmissions([]);
      return;
    }
    setError('');
    try {
      const response = await axios.get(SUBMISSIONS_API_URL, getAuthConfig());
      setSubmissions(asArray(response.data));
    } catch (err) {
      const detail = err?.response?.data;
      setError(detail?.detail || detail?.message || 'Unable to load presentation submissions.');
      setSubmissions([]);
    }
  }, [accessToken]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    Promise.allSettled([fetchParameters(), fetchSubmissions(), fetchEvaluations()]).then(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [fetchParameters, fetchSubmissions, fetchEvaluations]);

  const fetchExistingEvaluation = useCallback(async (submissionId) => {
    if (!accessToken) return null;
    try {
      const response = await axios.get(EVALUATION_API_URL, {
        ...getAuthConfig(),
        params: { submission: submissionId }
      });
      return response.data;
    } catch (err) {
      return null;
    }
  }, [accessToken]);

  const handleSelectSubmission = async (submission) => {
    setSelectedSubmission(submission);
    setEvaluationDetails(
      (evaluationParameters || []).map((param) => ({
        criteria: param.parameter,
        points: '',
        max_points: Number(param.weightage || 0)
      }))
    );
    setSuccess('');
    setError('');
    const existing = await fetchExistingEvaluation(submission.id);
    const existingRecord = Array.isArray(existing?.data)
      ? existing.data[0]
      : (Array.isArray(existing?.results) ? existing.results[0] : existing);
    if (existingRecord && Array.isArray(existingRecord.evaluation_details)) {
      setEvaluationDetails(
        (evaluationParameters || []).map((param) => {
          const found = existingRecord.evaluation_details.find(
            (d) => d.criteria === param.parameter
          );
          return {
            criteria: param.parameter,
            points: found != null ? found.points : '',
            max_points: Number(param.weightage || 0)
          };
        })
      );
    }
  };

  const handleBack = () => {
    setSelectedSubmission(null);
    setEvaluationDetails([]);
    setSuccess('');
    setError('');
  };

  const handleChange = (index, value) => {
    const next = [...evaluationDetails];
    next[index].points = value;
    setEvaluationDetails(next);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    for (const detail of evaluationDetails) {
      if (detail.points === '' || detail.points === null) {
        setError('Please enter points for all criteria.');
        return;
      }
      const points = Number(detail.points);
      if (points < 0 || points > detail.max_points) {
        setError(`Points for "${detail.criteria}" must be between 0 and ${detail.max_points}.`);
        return;
      }
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        submission: selectedSubmission.id,
        school_uni_id: selectedSubmission.school_uni_id,
        school_name: selectedSubmission.school_name,
        group_name: selectedSubmission.group_name,
        evaluation_details: evaluationDetails.map((d) => ({
          criteria: d.criteria,
          points: Number(d.points),
          max_points: d.max_points
        })),
        max_point: totalMaxPoint
      };
      await axios.post(EVALUATION_API_URL, payload, getAuthConfig());
      setSuccess('Evaluation submitted successfully.');
    } catch (err) {
      const detail = err?.response?.data;
      setError(detail?.detail || detail?.message || 'Unable to submit evaluation.');
    } finally {
      setSaving(false);
    }
  };

  const isEvaluated = (submissionId) =>
    evaluations.some((ev) => ev.submission === submissionId || ev.submission_id === submissionId);

  const getStudentNames = (group) => {
    if (Array.isArray(group.student_details) && group.student_details.length) {
      return group.student_details.map((s) => s.full_name || s.student_id).join(', ');
    }
    return '';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <AdminLeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
        <div className="main-content-dash">
          <AdminHeader toggleSidebar={toggleSidebar} />
          <Container fluid className="dashboard-box mt-3">
            <div className="text-center py-5">
              <Spinner animation="border" role="status" />
              <span className="ms-2">Loading marks data…</span>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <AdminLeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
      <div className="main-content-dash">
        <AdminHeader toggleSidebar={toggleSidebar} />
        <Container fluid className="dashboard-box mt-3">
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

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
                            <td className="text-center">{detail.max_points}</td>
                            <td className="text-center">
                              <Form.Control
                                type="number"
                                value={detail.points === '' ? '' : detail.points}
                                onChange={(e) => handleChange(index, e.target.value)}
                                min={0}
                                max={detail.max_points}
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
                        Total awarded:
                        <strong>
                          {evaluationDetails.reduce((sum, d) => sum + (Number(d.points) || 0), 0)} / {totalMaxPoint}
                        </strong>
                      </div>
                      <Button type="submit" variant="primary" disabled={saving}>
                        {saving ? <Spinner animation="border" size="sm" role="status" /> : <FaSave />} Submit Evaluation
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          ) : (
            <>
              <Row className="mb-3 align-items-center">
                <Col md>
                  <h5>
                    <FaClipboardList /> Student Presentation Evaluation
                  </h5>
                  <p className="text-muted small mb-0">Select a group submission to evaluate.</p>
                </Col>
              </Row>
              {submissions.length === 0 ? (
                <Alert variant="info">No presentation submissions found.</Alert>
              ) : (
                <Table striped bordered hover className="align-middle">
                  <thead>
                    <tr>
                      <th>School</th>
                      <th>Group Name</th>
                      <th>Topic</th>
                      <th>Students</th>
                      <th>Submission</th>
                      <th className="text-center">Points</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td>{submission.school_name || '—'}</td>
                        <td><strong>{submission.group_name || 'Unnamed'}</strong></td>
                        <td>{submission.topic_name || '—'}</td>
                        <td>{getStudentNames(submission)}</td>
                        <td>
                          {submission.submission_link ? (
                            <a href={submission.submission_link} target="_blank" rel="noreferrer" className="text-decoration-none">
                              <FaLink /> Link
                            </a>
                          ) : null}
                          {submission.submission_file ? (
                            <>
                              {' '}
                              <a href={mediaUrl(submission.submission_file)} target="_blank" rel="noreferrer" className="text-decoration-none ms-2">
                                <FaFileAlt /> File
                              </a>
                            </>
                          ) : null}
                          {!submission.submission_link && !submission.submission_file ? <span className="text-muted">None</span> : null}
                        </td>
                        <td className="text-center">
                          <Badge bg={submission.point || isEvaluated(submission.id) ? 'success' : 'secondary'}>
                            {submission.point ?? (isEvaluated(submission.id) ? 'Done' : '—')}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleSelectSubmission(submission)}
                            disabled={saving || isEvaluated(submission.id)}
                          >
                            <FaEdit /> {isEvaluated(submission.id) ? 'Evaluated' : 'Evaluate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              <h6 className="mt-4">Evaluation List</h6>
              {evaluations.length === 0 ? (
                <Alert variant="info">No evaluations found.</Alert>
              ) : (
                <Table striped bordered hover className="align-middle">
                  <thead>
                    <tr>
                      <th>School</th>
                      <th>Group Name</th>
                      <th>Points</th>
                      <th>Max Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.map((ev) => (
                      <tr key={ev.id}>
                        <td>{ev.school_name || '—'}</td>
                        <td><strong>{ev.group_name || 'Unnamed'}</strong></td>
                        <td className="text-center">
                          {Array.isArray(ev.evaluation_details)
                            ? ev.evaluation_details.reduce((s, d) => s + (Number(d.points) || 0), 0)
                            : (ev.point ?? '—')}
                        </td>
                        <td className="text-center">{ev.max_point ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}
        </Container>
      </div>
    </div>
  );
};

export default AdminMarks;
