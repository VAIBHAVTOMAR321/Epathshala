import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Table, Spinner, Alert, Form, Modal, Button
} from 'react-bootstrap';
import axios from 'axios';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import AdminLeftNav from './AdminLeftNav';
import AdminHeader from './AdminHeader';
import { useAuth } from '../all_login/AuthContext';

const OVERALL_LIST_API_URL =
  'https://brjobsedu.com/epathshala/epathshala_backend/api/student-presentation-summary/';

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
  const [topicFilter, setTopicFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

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

  const getFiltered = () => items.filter((item) => {
    const hasEval = (item.evaluations || []).length > 0;
    if (filterCase === 'evaluated' && !hasEval) return false;
    if (filterCase === 'unevaluated' && hasEval) return false;
    if (schoolFilter !== 'all' && item.school_name !== schoolFilter) return false;
    if (groupFilter !== 'all' && item.group_name !== groupFilter) return false;
    if (topicFilter !== 'all' && item.topic_name !== topicFilter) return false;
    return true;
  });

  const flattenRows = () => {
    const rows = [];
    getFiltered().forEach((item) => {
      const evals = item.evaluations || [];
      if (evals.length === 0) {
        rows.push({ school: item.school_name, group: item.group_name, topic: item.topic_name, judge: '—', criteria: '—', points: '—', max: '—', total: '—' });
      } else {
        evals.forEach((ev) => {
          const points = Array.isArray(ev.evaluation_details)
            ? ev.evaluation_details.reduce((s, d) => s + (Number(d.obtained_point ?? d.points) || 0), 0)
            : (ev.point ?? '—');
          rows.push({
            school: item.school_name,
            group: item.group_name,
            topic: item.topic_name,
            judge: ev.created_by || '—',
            criteria: Array.isArray(ev.evaluation_details) ? ev.evaluation_details.map((d) => `${d.criteria}: ${d.obtained_point ?? d.points ?? '—'}/${d.max_point ?? d.max_points ?? '—'}`).join('; ') : '—',
            points,
            max: ev.max_point ?? '—',
            total: ev.max_point ?? '—'
          });
        });
      }
    });
    return rows;
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['School','Group','Topic','Judge','Criteria','Points','Max','Total']],
      body: flattenRows().map((r) => [r.school, r.group, r.topic, r.judge, r.criteria, r.points, r.max, r.total]),
    });
    doc.save('all-judges-marks.pdf');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(flattenRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Marks');
    XLSX.writeFile(wb, 'all-judges-marks.xlsx');
  };
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
             <Col md="auto">
               <Form.Select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)}>
                 <option value="all">All Topics</option>
                 {[...new Set(items.map((i) => i.topic_name).filter(Boolean))].map((t) => (
                   <option key={t} value={t}>{t}</option>
                 ))}
               </Form.Select>
             </Col>
            <Col md="auto">
              <button className="btn btn-danger btn-sm me-2" onClick={exportPDF}>Export PDF</button>
              <button className="btn btn-success btn-sm" onClick={exportExcel}>Export Excel</button>
            </Col>
          </Row>
          {(() => {
            const filtered = items.filter((item) => {
              const hasEval = (item.evaluations || []).length > 0;
              if (filterCase === 'evaluated' && !hasEval) return false;
              if (filterCase === 'unevaluated' && hasEval) return false;
              if (schoolFilter !== 'all' && item.school_name !== schoolFilter) return false;
              if (groupFilter !== 'all' && item.group_name !== groupFilter) return false;
              if (topicFilter !== 'all' && item.topic_name !== topicFilter) return false;
              return true;
            });
             if (filtered.length === 0) return <Alert variant="info">No data found.</Alert>;
             return (
               <>
                <div style={{ overflowX: 'auto' }}>
                <Table striped bordered hover className="align-middle" style={{ whiteSpace: 'nowrap' }}>
                <thead style={{ backgroundColor: '#0d6efd', color: '#fff' }}>
                   <tr>
                     <th>School</th>
                     <th>Group</th>
                     <th>Topic</th>
                     <th>Rank</th>
                     <th>Total Obtained</th>
                     <th>Action</th>
                   </tr>
                </thead>
                <tbody>
                   {filtered.map((item) => {
                     const evals = item.evaluations || [];
                     if (evals.length === 0) {
                       return (
                         <tr key={`empty-${item.submission_id}`}>
                           <td>{item.school_name || '—'}</td>
                           <td>{item.group_name || '—'}</td>
                           <td>{item.topic_name || '—'}</td>
                           <td className="text-center">{item.rank ?? '—'}</td>
                           <td className="text-center">{item.total_obtained_point ?? '—'}</td>
                           <td><Button size="sm" onClick={() => setSelected(item)}>View</Button></td>
                         </tr>
                       );
                     }
                     return (
                       <tr key={item.submission_id}>
                         <td>{item.school_name || '—'}</td>
                         <td>{item.group_name || '—'}</td>
                         <td>{item.topic_name || '—'}</td>
                         <td className="text-center">{item.rank ?? '—'}</td>
                         <td className="text-center">{item.total_obtained_point ?? '—'}</td>
                         <td><Button size="sm" onClick={() => setSelected(item)}>View</Button></td>
                       </tr>
                     );
                   })}
                </tbody>
               </Table>
               </div>
               </>
            );
           })()}
          <Modal show={!!selected} onHide={() => setSelected(null)} size="lg">
            <Modal.Header closeButton><Modal.Title>Submission Details</Modal.Title></Modal.Header>
            <Modal.Body>
              {selected && (
                <div>
                  <h6 className="mb-2">School & Submission</h6>
                  <p><strong>School:</strong> {selected.school_name} ({selected.school_uni_id})</p>
                  <p><strong>Group:</strong> {selected.group_name}</p>
                  <p><strong>Topic:</strong> {selected.topic_name}</p>
                  <p><strong>Students ({(selected.student_ids || []).length}):</strong> {(selected.student_ids || []).map((s) => typeof s === 'object' ? (s.full_name || s.student_id || JSON.stringify(s)) : s).join(', ')}</p>
                  <p><strong>Rank:</strong> {selected.rank}</p>
                  <p><strong>Total Obtained:</strong> {selected.total_obtained_point} / {selected.total_max_point}</p>
                  <p><strong>Average:</strong> {selected.average_obtained_point}</p>
                  <p><strong>Submission Link:</strong> {selected.submission_link ? <a href={selected.submission_link} target="_blank" rel="noreferrer">Open</a> : '—'}</p>
                  <p><strong>Submission File:</strong> {selected.submission_file ? <a href={`https://brjobsedu.com/epathshala/epathshala_backend${selected.submission_file}`} target="_blank" rel="noreferrer">Download</a> : '—'}</p>
                  <p><strong>Judges:</strong> {(selected.evaluations || []).map(e => e.created_by).join(', ') || '—'}</p>
                
                  <hr />
                  <h6 className="mb-2">Evaluations</h6>
                  {(selected.evaluations || []).length === 0 && <p className="text-muted">No evaluations.</p>}
                  {(selected.evaluations || []).map((ev) => (
                    <div key={ev.id} className="mb-3 border rounded p-2">
                      <p className="mb-1"><strong>Judge:</strong> <span style={{ color: '#0d6efd', fontWeight: 600 }}>{ev.created_by}</span></p>
                      <p className="mb-1"><strong>Obtained:</strong> {ev.obtained_point} / {ev.max_point}</p>
                      <Table size="sm" bordered>
                        <thead><tr><th>Criteria</th><th>Obtained</th><th>Max</th></tr></thead>
                        <tbody>
                          {(ev.evaluation_details || []).map((d, i) => (
                            <tr key={i}>
                              <td>{d.criteria}</td>
                              <td>{d.obtained_point ?? d.points ?? '—'}</td>
                              <td>{d.max_point ?? d.max_points ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ))}
                </div>
              )}
            </Modal.Body>
          </Modal>
         </Container>
      </div>
    </div>
  );
};

export default AllJudgesMarks;
