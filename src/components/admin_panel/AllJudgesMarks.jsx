import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Table, Badge, Spinner, Alert, Form
} from 'react-bootstrap';
import axios from 'axios';
import AdminLeftNav from './AdminLeftNav';
import AdminHeader from './AdminHeader';
import { useAuth } from '../all_login/AuthContext';

const OVERALL_LIST_API_URL =
  'https://brjobsedu.com/epathshala/epathshala_backend/api/student-presentation-evaluation-overall-list/';

const asArray = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.results)) return response.results;
  return [];
};

const AllJudgesMarks = () => {
  const { accessToken } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth >= 1024;
    return true;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [items, setItems] = useState([]);
  const [filterCase, setFilterCase] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  });

  const fetchList = useCallback(async () => {
    if (!accessToken) { setItems([]); return; }
    setError('');
    try {
      const response = await axios.get(OVERALL_LIST_API_URL, getAuthConfig());
      setItems(asArray(response.data));
    } catch (err) {
      const detail = err?.response?.data;
      setError(detail?.detail || detail?.message || 'Unable to load judge marks.');
      setItems([]);
    }
  }, [accessToken]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchList().then(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [fetchList]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <AdminLeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
        <div className="main-content-dash">
          <AdminHeader toggleSidebar={toggleSidebar} />
          <Container fluid className="dashboard-box mt-3">
            <div className="text-center py-5">
              <Spinner animation="border" role="status" />
              <span className="ms-2">Loading all judges marks…</span>
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
          <Row className="mb-3 align-items-center">
            <Col md>
              <h5>All Judges Marks</h5>
              <p className="text-muted small mb-0">Overall presentation evaluation list across judges.</p>
            </Col>
            <Col md="auto">
              <Form.Select value={filterCase} onChange={(e) => setFilterCase(e.target.value)}>
                <option value="all">All</option>
                <option value="evaluated">Evaluated</option>
                <option value="unevaluated">Not Evaluated</option>
              </Form.Select>
            </Col>
            <Col md="auto">
              <Form.Select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)}>
                <option value="all">All Schools</option>
                {[...new Set(items.map((i) => i.school_name).filter(Boolean))].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md="auto">
              <Form.Select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
                <option value="all">All Groups</option>
                {[...new Set(items.map((i) => i.group_name).filter(Boolean))].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          {(() => {
            const filtered = items.filter((item) => {
              const hasEval = (item.evaluations || []).length > 0;
              if (filterCase === 'evaluated' && !hasEval) return false;
              if (filterCase === 'unevaluated' && hasEval) return false;
              if (schoolFilter !== 'all' && item.school_name !== schoolFilter) return false;
              if (groupFilter !== 'all' && item.group_name !== groupFilter) return false;
              return true;
            });
            if (filtered.length === 0) return <Alert variant="info">No data found.</Alert>;
            return filtered.map((item) => (
              <Card key={item.id} className="mb-4">
                <Card.Header>
                  <Row className="align-items-center">
                    <Col md={8}>
                      <strong>{item.school_name}</strong> — {item.group_name}
                    </Col>
                    <Col md={4} className="text-end">
                      <Badge bg="secondary">{item.school_uni_id}</Badge>
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body>
                  <p className="mb-1"><strong>Topic:</strong> {item.topic_name || '—'}</p>
                  <p className="mb-3 text-muted small">Students: {(item.student_ids || []).join(', ')}</p>
                  {(item.evaluations || []).length === 0 ? (
                    <Alert variant="info" className="mb-0">No evaluations.</Alert>
                  ) : (
                    <Table striped bordered hover className="align-middle">
                      <thead>
                        <tr>
                          <th>Judge</th>
                          <th>Criteria</th>
                          <th className="text-center">Points</th>
                          <th className="text-center">Max</th>
                          <th className="text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(item.evaluations || []).map((ev) => (
                          <tr key={ev.id}>
                            <td>{ev.created_by || '—'}</td>
                            <td>
                              {Array.isArray(ev.evaluation_details)
                                ? ev.evaluation_details.map((d, i) => (
                                    <div key={i}>
                                      {d.criteria}: {d.obtained_point ?? d.points ?? '—'}/{d.max_point ?? d.max_points ?? '—'}
                                    </div>
                                  ))
                                : '—'}
                            </td>
                            <td className="text-center">
                              {Array.isArray(ev.evaluation_details)
                                ? ev.evaluation_details.reduce((s, d) => s + (Number(d.obtained_point ?? d.points) || 0), 0)
                                : (ev.point ?? '—')}
                            </td>
                            <td className="text-center">{ev.max_point ?? '—'}</td>
                            <td className="text-center"><strong>{ev.max_point ?? '—'}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            ));
          })()}
        </Container>
      </div>
    </div>
  );
};

export default AllJudgesMarks;
