import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Table, Button, Badge, Spinner,
  Form, Alert
} from 'react-bootstrap';
import axios from 'axios';
import AdminLeftNav from './AdminLeftNav';
import AdminHeader from './AdminHeader';
import { useAuth } from '../all_login/AuthContext';
import { useLocation } from 'react-router-dom';
import {
  FaArrowLeft, FaPlus, FaEdit, FaTrash, FaUserTie, FaBuilding, FaListUl
} from 'react-icons/fa';

const JUDGE_API_URL = 'https://brjobsedu.com/epathshala/epathshala_backend/api/school-judge/';
const SCHOOL_LIST_API_URL = 'https://brjobsedu.com/epathshala/epathshala_backend/api/school-list/';

const asArray = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.results)) return response.results;
  return [];
};

const getErrorMessage = (error) => {
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'object') {
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('; ');
    }
    return String(data);
  }
  return error.message || 'An error occurred';
};

const AddJudge = () => {
  const { accessToken } = useAuth();
  const location = useLocation();
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

  const [judges, setJudges] = useState([]);
  const [schools, setSchools] = useState([]);
  const [formData, setFormData] = useState({
    school_uni_id: '',
    school_name: '',
    judge_name: '',
    phone: '',
    password: '',
    achivement: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getAuthConfig = useCallback(() => ({
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }), [accessToken]);

  const fetchSchools = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await axios.get(SCHOOL_LIST_API_URL, getAuthConfig());
      setSchools(asArray(response.data));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [accessToken, getAuthConfig]);

  const fetchJudges = useCallback(async () => {
    if (!accessToken) {
      setJudges([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(JUDGE_API_URL, getAuthConfig());
      setJudges(asArray(response.data));
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
      setJudges([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, getAuthConfig]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      await Promise.allSettled([fetchSchools(), fetchJudges()]);
      if (mounted) setLoading(false);
    };
    loadData();
    return () => { mounted = false; };
  }, [fetchSchools, fetchJudges]);

  useEffect(() => {
    if (location.state?.editData) {
      const data = location.state.editData;
      setEditMode(true);
      setEditId(data.id);
      setShowForm(true);
      setFormData({
        school_uni_id: data.school_uni_id || '',
        school_name: data.school_name || '',
        judge_name: data.judge_name || '',
        phone: data.phone || '',
        password: data.password || '',
        achivement: data.achivement || ''
      });
      setError('');
      setSuccess('');
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSchoolChange = (e) => {
    const schoolUniId = e.target.value;
    const school = schools.find((s) => s.school_uni_id === schoolUniId);
    setFormData({
      ...formData,
      school_uni_id: schoolUniId,
      school_name: school ? school.school_name : ''
    });
  };

  const openAddForm = () => {
    setEditMode(false);
    setEditId(null);
    setFormData({
      school_uni_id: '',
      school_name: '',
      judge_name: '',
      phone: '',
      password: '',
      achivement: ''
    });
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditMode(false);
    setEditId(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.school_uni_id || !formData.judge_name || !formData.phone || !formData.password) {
      setError('Please fill school, judge name, phone and password.');
      return;
    }
    setSaving(true);
    try {
      if (editMode && editId) {
        await axios.put(`${JUDGE_API_URL}${editId}/`, formData, getAuthConfig());
      } else {
        await axios.post(JUDGE_API_URL, formData, getAuthConfig());
      }
      closeForm();
      setSuccess(editMode ? 'Judge updated successfully.' : 'Judge added successfully.');
      await fetchJudges();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (judge) => {
    setEditMode(true);
    setEditId(judge.id);
    setFormData({
      school_uni_id: judge.school_uni_id || '',
      school_name: judge.school_name || '',
      judge_name: judge.judge_name || '',
      phone: judge.phone || '',
      password: judge.password || '',
      achivement: judge.achivement || ''
    });
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this judge?')) return;
    setSaving(true);
    try {
      await axios.delete(`${JUDGE_API_URL}${id}/`, {
        ...getAuthConfig(),
        data: { id }
      });
      setSuccess('Judge deleted successfully.');
      await fetchJudges();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
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
              <span className="ms-2">Loading judges…</span>
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

          {!showForm ? (
            <>
              <Row className="mb-3 align-items-center">
                <Col md="auto">
                  <h5><FaUserTie /> Manage Judges</h5>
                </Col>
                <Col className="text-end">
                  <Button variant="primary" onClick={openAddForm} disabled={saving}>
                    <FaPlus /> Add Judge
                  </Button>
                </Col>
              </Row>

              <h6 className="mt-4">Judge List</h6>
              {judges.length === 0 ? (
                <Alert variant="info">No judges found.</Alert>
              ) : (
                <Table striped bordered hover className="align-middle">
                  <thead>
                    <tr>
                      <th>School</th>
                      <th>Judge Name</th>
                      <th>Phone</th>
                      <th>Achievement</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {judges.map((judge) => (
                      <tr key={judge.id}>
                        <td>{judge.school_name || '—'}</td>
                        <td><strong>{judge.judge_name || '—'}</strong></td>
                        <td>{judge.phone || '—'}</td>
                        <td>{judge.achivement || '—'}</td>
                        <td className="text-center">
                          <Button variant="outline-primary" size="sm" onClick={() => handleEdit(judge)} disabled={saving}>
                            <FaEdit /> Edit
                          </Button>
                          {' '}
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(judge.id)} disabled={saving}>
                            <FaTrash /> Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          ) : (
            <Card>
              <Card.Header>
                <Row className="align-items-center">
                  <Col md={8}>
                    {editMode ? <><FaEdit /> Edit Judge</> : <><FaPlus /> Add Judge</>}
                  </Col>
                  <Col md={4} className="text-end">
                    <Button variant="outline-secondary" onClick={closeForm} disabled={saving}>
                      <FaArrowLeft /> Back to list
                    </Button>
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Label>School <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        as="select"
                        name="school_uni_id"
                        value={formData.school_uni_id}
                        onChange={handleSchoolChange}
                        required
                      >
                        <option value="">Select a school</option>
                        {schools.map((school) => (
                          <option key={school.school_uni_id} value={school.school_uni_id}>
                            {school.school_name} ({school.school_uni_id})
                          </option>
                        ))}
                      </Form.Control>
                    </Col>
                    <Col md={6}>
                      <Form.Label>School Name</Form.Label>
                      <Form.Control name="school_name" value={formData.school_name} readOnly />
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Label>Judge Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control name="judge_name" value={formData.judge_name} onChange={handleChange} required />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Achievement</Form.Label>
                      <Form.Control name="achivement" value={formData.achivement} onChange={handleChange} placeholder="e.g. District-level science competition judge" />
                    </Col>
                  </Row>
                  <Button type="submit" variant="primary" disabled={saving} className="w-auto">
                    {saving ? <Spinner animation="border" size="sm" role="status" /> : ''}
                    {editMode ? 'Update Judge' : 'Add Judge'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Container>
      </div>
    </div>
  );
};

export default AddJudge;
