import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Form, Alert, Collapse, Modal } from 'react-bootstrap';
import axios from 'axios';
import '../../assets/css/admindashboard.css';
import '../../assets/css/AdminSchoolPresentation.css';
import { useAuth } from '../all_login/AuthContext';
import AdminLeftNav from './AdminLeftNav';
import AdminHeader from './AdminHeader';
import {
  FaSchool, FaUsers, FaLayerGroup, FaSearch, FaSyncAlt,
  FaChevronDown, FaChevronRight, FaExternalLinkAlt, FaFileAlt, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaList
} from 'react-icons/fa';

const SUBMISSIONS_API_URL =
  'https://brjobsedu.com/epathshala/epathshala_backend/api/student-presentation-submissions/';
const STUDENTS_API_URL =
  'https://brjobsedu.com/epathshala/epathshala_backend/api/student-presentation-reg/';
const TOPICS_API_URL =
  'https://brjobsedu.com/epathshala/epathshala_backend/api/presentation-topics/';

const asArray = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.results)) return response.results;
  return [];
};

const clean = (value) => String(value ?? '').trim();
const schoolKey = (item) => clean(item?.school_uni_id || item?.schoolUniId || item?.school_id || item?.school_name || item?.schoolName || 'unknown-school');
const studentKey = (item) => clean(item?.student_id || item?.id);
const getStudentIds = (group) => {
  if (Array.isArray(group?.student_ids)) return group.student_ids.map((id) => typeof id === 'object' ? studentKey(id) : clean(id)).filter(Boolean);
  if (Array.isArray(group?.student_details)) return group.student_details.map(studentKey).filter(Boolean);
  return [];
};

const AdminSchoolPresentation = () => {
  const { accessToken } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [groups, setGroups] = useState([]);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedSchools, setExpandedSchools] = useState({});
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  // Presentation topic management
  const [showTopicsModal, setShowTopicsModal] = useState(false);
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsSaving, setTopicsSaving] = useState(false);
  const [topicError, setTopicError] = useState('');
  const [topicSuccess, setTopicSuccess] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editingTopicName, setEditingTopicName] = useState('');
  const [editingTopicActive, setEditingTopicActive] = useState(true);
  const [deletingTopicId, setDeletingTopicId] = useState(null);

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

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (!accessToken) {
      setError('Authentication token is not available. Please sign in again.');
      setLoading(false);
      return;
    }
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    const config = { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } };

    const [groupsResult, studentsResult] = await Promise.allSettled([
      axios.get(SUBMISSIONS_API_URL, config),
      axios.get(STUDENTS_API_URL, config)
    ]);

    if (groupsResult.status === 'fulfilled') {
      const payload = groupsResult.value.data;
      setGroups(asArray(payload));
    } else {
      setGroups([]);
      const detail = groupsResult.reason?.response?.data;
      setError(detail?.detail || detail?.message || 'Unable to load presentation group submissions.');
    }

    if (studentsResult.status === 'fulfilled') {
      setRegisteredStudents(asArray(studentsResult.value.data));
    } else {
      setRegisteredStudents([]);
      setError((previous) => previous || 'Presentation submissions loaded, but registered student totals could not be fetched. Check the student registration API permissions.');
    }

    setLoading(false);
    setRefreshing(false);
  }, [accessToken]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const authConfig = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }), [accessToken]);

  const fetchTopics = useCallback(async () => {
    if (!accessToken) {
      setTopicError('Authentication token is not available. Please sign in again.');
      return;
    }
    setTopicsLoading(true);
    setTopicError('');
    try {
      const response = await axios.get(TOPICS_API_URL, authConfig);
      setTopics(asArray(response.data));
    } catch (requestError) {
      const responseData = requestError?.response?.data;
      setTopicError(responseData?.detail || responseData?.message || 'Unable to load presentation topics.');
    } finally {
      setTopicsLoading(false);
    }
  }, [accessToken, authConfig]);

  const openTopicsManager = () => {
    setShowTopicsModal(true);
    setNewTopic('');
    setEditingTopicId(null);
    setTopicError('');
    setTopicSuccess('');
    fetchTopics();
  };

  const addTopic = async (event) => {
    event.preventDefault();
    const topic = newTopic.trim();
    if (!topic) {
      setTopicError('Please enter a topic name.');
      return;
    }
    setTopicsSaving(true);
    setTopicError('');
    setTopicSuccess('');
    try {
      await axios.post(TOPICS_API_URL, { topic }, authConfig);
      setNewTopic('');
      setTopicSuccess('Presentation topic added successfully.');
      await fetchTopics();
    } catch (requestError) {
      const responseData = requestError?.response?.data;
      setTopicError(responseData?.detail || responseData?.message || JSON.stringify(responseData?.errors || {}) || 'Unable to add this topic.');
    } finally {
      setTopicsSaving(false);
    }
  };

  const startEditTopic = (topic) => {
    setEditingTopicId(topic.id);
    setEditingTopicName(topic.topic || '');
    setEditingTopicActive(Boolean(topic.is_active));
    setTopicError('');
    setTopicSuccess('');
  };

  const saveTopic = async (event) => {
    event.preventDefault();
    const topic = editingTopicName.trim();
    if (!topic) {
      setTopicError('Topic name cannot be empty.');
      return;
    }
    setTopicsSaving(true);
    setTopicError('');
    setTopicSuccess('');
    try {
      await axios.put(TOPICS_API_URL, {
        id: editingTopicId,
        topic,
        is_active: editingTopicActive
      }, authConfig);
      setEditingTopicId(null);
      setEditingTopicName('');
      setTopicSuccess('Presentation topic updated successfully.');
      await fetchTopics();
    } catch (requestError) {
      const responseData = requestError?.response?.data;
      setTopicError(responseData?.detail || responseData?.message || JSON.stringify(responseData?.errors || {}) || 'Unable to update this topic.');
    } finally {
      setTopicsSaving(false);
    }
  };

  const deleteTopic = async (topic) => {
    const confirmed = window.confirm(`Delete the topic "${topic.topic}"?`);
    if (!confirmed) return;
    setDeletingTopicId(topic.id);
    setTopicError('');
    setTopicSuccess('');
    try {
      await axios.delete(TOPICS_API_URL, {
        ...authConfig,
        data: { id: topic.id }
      });
      setTopicSuccess('Presentation topic deleted successfully.');
      if (editingTopicId === topic.id) setEditingTopicId(null);
      await fetchTopics();
    } catch (requestError) {
      const responseData = requestError?.response?.data;
      setTopicError(responseData?.detail || responseData?.message || JSON.stringify(responseData?.errors || {}) || 'Unable to delete this topic.');
    } finally {
      setDeletingTopicId(null);
    }
  };

  const schools = useMemo(() => {
    const schoolMap = new Map();
    const ensureSchool = (item = {}) => {
      const key = schoolKey(item);
      if (!schoolMap.has(key)) {
        schoolMap.set(key, {
          key,
          school_uni_id: clean(item.school_uni_id || item.schoolUniId || item.school_id),
          school_name: clean(item.school_name || item.schoolName) || 'School name unavailable',
          district: clean(item.district),
          block: clean(item.block),
          state: clean(item.state),
          students: new Map(),
          groups: []
        });
      }
      const school = schoolMap.get(key);
      if (school.school_name === 'School name unavailable' && (item.school_name || item.schoolName)) school.school_name = clean(item.school_name || item.schoolName);
      if (!school.district && item.district) school.district = clean(item.district);
      if (!school.block && item.block) school.block = clean(item.block);
      if (!school.state && item.state) school.state = clean(item.state);
      if (!school.school_uni_id && (item.school_uni_id || item.schoolUniId || item.school_id)) school.school_uni_id = clean(item.school_uni_id || item.schoolUniId || item.school_id);
      return school;
    };

    registeredStudents.forEach((student) => {
      const school = ensureSchool(student);
      const id = studentKey(student);
      if (id) school.students.set(id, student);
    });

    groups.forEach((group) => {
      const school = ensureSchool(group);
      school.groups.push(group);
      const details = Array.isArray(group.student_details) ? group.student_details : [];
      details.forEach((student) => {
        const id = studentKey(student);
        if (id && !school.students.has(id)) school.students.set(id, student);
      });
      getStudentIds(group).forEach((id) => {
        if (!school.students.has(id)) school.students.set(id, { student_id: id, full_name: id });
      });
    });

    return Array.from(schoolMap.values()).map((school) => ({
      ...school,
      studentCount: school.students.size,
      groupCount: school.groups.length,
      submittedGroupCount: school.groups.filter((group) => clean(group.submission_link) || clean(group.submission_file)).length
    })).sort((a, b) => a.school_name.localeCompare(b.school_name));
  }, [groups, registeredStudents]);

  const filteredSchools = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return schools;
    return schools.filter((school) => [
      school.school_name, school.school_uni_id, school.district, school.block, school.state
    ].some((value) => clean(value).toLowerCase().includes(query)));
  }, [schools, searchTerm]);

  useEffect(() => setCurrentPage(1), [searchTerm, recordsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredSchools.length / recordsPerPage));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const currentSchools = filteredSchools.slice((currentPageSafe - 1) * recordsPerPage, currentPageSafe * recordsPerPage);

  const totals = useMemo(() => ({
    schools: schools.length,
    students: registeredStudents.length || new Set(schools.flatMap((school) => Array.from(school.students.keys()))).size,
    groups: groups.length,
    submitted: groups.filter((group) => clean(group.submission_link) || clean(group.submission_file)).length
  }), [schools, registeredStudents, groups]);

  const toggleSchool = (key) => setExpandedSchools((previous) => ({ ...previous, [key]: !previous[key] }));
  const toggleSidebar = () => setSidebarOpen((previous) => !previous);

  const getStudentNames = (group) => {
    if (Array.isArray(group.student_details) && group.student_details.length) {
      return group.student_details.map((student) => `${student.full_name || student.student_id}${student.class_name ? ` · Class ${student.class_name}` : ''}${student.roll_no !== undefined && student.roll_no !== null ? ` · Roll ${student.roll_no}` : ''}`).join(', ');
    }
    return getStudentIds(group).join(', ') || 'No student details returned';
  };

  if (loading) {
    return (
      <div className="dashboard-container admin-school-presentation">
        <AdminLeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
        <main className="main-content-dash">
          <AdminHeader toggleSidebar={toggleSidebar} />
          <div className="dashboard-content">
            <Container fluid className="asp-content">
              <div className="asp-loading"><Spinner animation="border" role="status" /><span>Loading school presentation data…</span></div>
            </Container>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container admin-school-presentation">
      <AdminLeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
      <main className="main-content-dash">
        <AdminHeader toggleSidebar={toggleSidebar} />
        <div className="dashboard-content">
          <Container fluid className="asp-content">
            <div className="asp-page-heading">
              <div>
                <div className="asp-eyebrow">ADMINISTRATION · PRESENTATIONS</div>
                <h1>School Presentation Overview</h1>
                <p>Review registered students, presentation groups, and submissions school by school.</p>
              </div>
              <div className="asp-heading-actions">
                <Button className="asp-topic-manager-btn" onClick={openTopicsManager}>
                  <FaList /> <span>Manage Topics</span>
                </Button>
                <Button className="asp-refresh" onClick={() => fetchDashboardData(true)} disabled={refreshing}>
                {refreshing ? <Spinner size="sm" animation="border" /> : <FaSyncAlt />}
                  <span>{refreshing ? 'Refreshing' : 'Refresh data'}</span>
                </Button>
              </div>
            </div>

            {error && <Alert variant="warning" className="asp-alert" dismissible onClose={() => setError('')}>{error}</Alert>}

            <Row className="g-3 asp-stat-row">
              <Col xs={6} xl={3}>
                <Card className="asp-stat-card"><Card.Body><div className="asp-stat-icon asp-blue"><FaSchool /></div><div><div className="asp-stat-label">Schools</div><div className="asp-stat-value">{totals.schools}</div><div className="asp-stat-note">With registration or group data</div></div></Card.Body></Card>
              </Col>
              <Col xs={6} xl={3}>
                <Card className="asp-stat-card"><Card.Body><div className="asp-stat-icon asp-violet"><FaUsers /></div><div><div className="asp-stat-label">Registered students</div><div className="asp-stat-value">{totals.students}</div><div className="asp-stat-note">Unique student records</div></div></Card.Body></Card>
              </Col>
              <Col xs={6} xl={3}>
                <Card className="asp-stat-card"><Card.Body><div className="asp-stat-icon asp-teal"><FaLayerGroup /></div><div><div className="asp-stat-label">Presentation groups</div><div className="asp-stat-value">{totals.groups}</div><div className="asp-stat-note">Groups submitted by schools</div></div></Card.Body></Card>
              </Col>
              <Col xs={6} xl={3}>
                <Card className="asp-stat-card"><Card.Body><div className="asp-stat-icon asp-amber"><FaFileAlt /></div><div><div className="asp-stat-label">With submissions</div><div className="asp-stat-value">{totals.submitted}</div><div className="asp-stat-note">Link or file provided</div></div></Card.Body></Card>
              </Col>
            </Row>

            <Card className="asp-main-card">
              <Card.Header className="asp-table-header">
                <div><h2>Schools</h2><span>{filteredSchools.length} school{filteredSchools.length === 1 ? '' : 's'} found</span></div>
                <div className="asp-filters">
                  <div className="asp-search"><FaSearch /><Form.Control aria-label="Search schools" placeholder="Search school, ID, district…" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></div>
                  <Form.Select aria-label="Rows per page" value={recordsPerPage} onChange={(event) => setRecordsPerPage(Number(event.target.value))}>
                    <option value={10}>10 rows</option><option value={15}>15 rows</option><option value={25}>25 rows</option><option value={50}>50 rows</option>
                  </Form.Select>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {currentSchools.length === 0 ? (
                  <div className="asp-empty"><FaSchool /><h3>No schools found</h3><p>{searchTerm ? 'Try another search term.' : 'No school registrations or presentation submissions were returned by the APIs.'}</p></div>
                ) : (
                  <div className="table-responsive">
                    <Table className="asp-school-table align-middle mb-0">
                      <thead><tr><th className="asp-expand-col"></th><th>School</th><th>School ID</th><th>Location</th><th className="text-center">Registered students</th><th className="text-center">Groups</th><th className="text-center">Submitted</th></tr></thead>
                      <tbody>
                        {currentSchools.map((school) => (
                          <React.Fragment key={school.key}>
                            <tr className={expandedSchools[school.key] ? 'asp-school-row is-expanded' : 'asp-school-row'}>
                              <td><button className="asp-expand-btn" onClick={() => toggleSchool(school.key)} aria-label={`${expandedSchools[school.key] ? 'Collapse' : 'Expand'} ${school.school_name}`}>{expandedSchools[school.key] ? <FaChevronDown /> : <FaChevronRight />}</button></td>
                              <td><div className="asp-school-name">{school.school_name}</div><div className="asp-school-sub">{school.district || 'District unavailable'}{school.block ? ` · ${school.block}` : ''}</div></td>
                              <td><span className="asp-school-id">{school.school_uni_id || '—'}</span></td>
                              <td>{[school.district, school.state].filter(Boolean).join(', ') || '—'}</td>
                              <td className="text-center"><span className="asp-count-pill asp-count-students">{school.studentCount}</span></td>
                              <td className="text-center"><span className="asp-count-pill asp-count-groups">{school.groupCount}</span></td>
                              <td className="text-center"><Badge bg={school.submittedGroupCount ? 'success' : 'secondary'} className="asp-status-badge">{school.submittedGroupCount} / {school.groupCount}</Badge></td>
                            </tr>
                            <tr className="asp-detail-row"><td colSpan={7}><Collapse in={Boolean(expandedSchools[school.key])}><div className="asp-detail-panel">
                              <div className="asp-detail-heading"><div><h3>Presentation groups</h3><p>{school.groupCount} group{school.groupCount === 1 ? '' : 's'} · {school.studentCount} unique registered student{school.studentCount === 1 ? '' : 's'}</p></div></div>
                              {school.groups.length === 0 ? <div className="asp-no-groups">No presentation groups have been submitted by this school yet.</div> : (
                                <div className="table-responsive"><Table className="asp-groups-table mb-0">
                                  <thead><tr><th>Group / topic</th><th>Students in group</th><th>Presentation link</th><th>Presentation file</th><th>Points</th><th>Submitted on</th></tr></thead>
                                  <tbody>{school.groups.map((group, index) => {
                                    const file = clean(group.submission_file);
                                    const link = clean(group.submission_link);
                                    const fileUrl = file && (/^https?:\/\//i.test(file) ? file : `https://brjobsedu.com${file.startsWith('/') ? '' : '/'}${file}`);
                                    return <tr key={group.id ?? `${school.key}-${index}`}>
                                      <td><div className="asp-group-name">{group.group_name || 'Unnamed group'}</div><div className="asp-topic-name">{group.topic_name || 'Topic not provided'}</div></td>
                                      <td><div className="asp-member-count">{getStudentIds(group).length} students</div><div className="asp-member-list">{getStudentNames(group)}</div></td>
                                      <td>{link ? <a className="asp-resource-link" href={link} target="_blank" rel="noreferrer">Open link <FaExternalLinkAlt /></a> : <span className="asp-muted">Not provided</span>}</td>
                                      <td>{fileUrl ? <a className="asp-resource-link" href={fileUrl} target="_blank" rel="noreferrer">View file <FaExternalLinkAlt /></a> : <span className="asp-muted">Not provided</span>}</td>
                                      <td><Badge bg="light" text="dark" className="asp-points">{group.point ?? 0}</Badge></td>
                                      <td>{group.created_at ? new Date(group.created_at).toLocaleDateString() : '—'}</td>
                                    </tr>;
                                  })}</tbody>
                                </Table></div>
                              )}
                            </div></Collapse></td></tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
              <Card.Footer className="asp-pagination-footer">
                <span>Showing {filteredSchools.length ? (currentPageSafe - 1) * recordsPerPage + 1 : 0}–{Math.min(currentPageSafe * recordsPerPage, filteredSchools.length)} of {filteredSchools.length}</span>
                <div className="asp-pagination">
                  <Button variant="light" disabled={currentPageSafe <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>Previous</Button>
                  <span>Page {currentPageSafe} of {totalPages}</span>
                  <Button variant="light" disabled={currentPageSafe >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>Next</Button>
                </div>
              </Card.Footer>
            </Card>
            <div className="asp-footer-note">Student totals are calculated from the student registration API. Group and submission totals come from the presentation submissions API.</div>
          </Container>
        </div>
      </main>

      <Modal show={showTopicsModal} onHide={() => setShowTopicsModal(false)} centered size="lg" dialogClassName="asp-topics-dialog">
        <Modal.Header closeButton className="asp-topics-modal-header">
          <div>
            <div className="asp-eyebrow">PRESENTATION SETTINGS</div>
            <Modal.Title>Manage Presentation Topics</Modal.Title>
            <p>Add topics for schools or edit and remove existing topics.</p>
          </div>
        </Modal.Header>
        <Modal.Body className="asp-topics-modal-body">
          {topicError && <Alert variant="danger" className="asp-topic-alert">{topicError}</Alert>}
          {topicSuccess && <Alert variant="success" className="asp-topic-alert">{topicSuccess}</Alert>}

          <Card className="asp-topic-add-card">
            <Card.Body>
              <Form onSubmit={addTopic}>
                <Form.Group>
                  <Form.Label>Add a new topic</Form.Label>
                  <div className="asp-topic-add-row">
                    <Form.Control
                      value={newTopic}
                      onChange={(event) => setNewTopic(event.target.value)}
                      placeholder="Enter presentation topic name"
                      maxLength={250}
                      disabled={topicsSaving}
                    />
                    <Button type="submit" disabled={topicsSaving || !newTopic.trim()} className="asp-topic-add-btn">
                      {topicsSaving ? <Spinner size="sm" animation="border" /> : <FaPlus />}
                      <span>Add topic</span>
                    </Button>
                  </div>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>

          <div className="asp-topic-list-heading">
            <div><h3>Available topics</h3><span>{topics.length} topic{topics.length === 1 ? '' : 's'}</span></div>
            <Button variant="light" size="sm" onClick={fetchTopics} disabled={topicsLoading}><FaSyncAlt /> Refresh</Button>
          </div>

          {topicsLoading ? (
            <div className="asp-topics-loading"><Spinner animation="border" size="sm" /> Loading topics…</div>
          ) : topics.length === 0 ? (
            <div className="asp-topics-empty">No presentation topics found. Add the first topic above.</div>
          ) : (
            <div className="asp-topics-list">
              {topics.map((topic) => (
                <div className="asp-topic-item" key={topic.id}>
                  {editingTopicId === topic.id ? (
                    <Form className="asp-topic-edit-form" onSubmit={saveTopic}>
                      <Form.Control
                        autoFocus
                        value={editingTopicName}
                        onChange={(event) => setEditingTopicName(event.target.value)}
                        maxLength={250}
                        aria-label="Edit topic name"
                      />
                      <Form.Check
                        type="switch"
                        id={`topic-active-${topic.id}`}
                        label="Active"
                        checked={editingTopicActive}
                        onChange={(event) => setEditingTopicActive(event.target.checked)}
                      />
                      <div className="asp-topic-actions">
                        <Button type="submit" className="asp-topic-save-btn" disabled={topicsSaving || !editingTopicName.trim()}>
                          {topicsSaving ? <Spinner size="sm" animation="border" /> : <FaSave />} Save
                        </Button>
                        <Button type="button" variant="light" onClick={() => setEditingTopicId(null)} disabled={topicsSaving}><FaTimes /> Cancel</Button>
                      </div>
                    </Form>
                  ) : (
                    <>
                      <div className="asp-topic-item-main">
                        <div className="asp-topic-item-name">{topic.topic}</div>
                        <div className="asp-topic-item-meta">
                          <Badge bg={topic.is_active ? 'success' : 'secondary'}>{topic.is_active ? 'Active' : 'Inactive'}</Badge>
                          <span>Topic ID: {topic.id}</span>
                          {topic.created_at && <span>Added {new Date(topic.created_at).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div className="asp-topic-actions">
                        <Button variant="light" className="asp-topic-edit-btn" onClick={() => startEditTopic(topic)}><FaEdit /> Edit</Button>
                        <Button variant="light" className="asp-topic-delete-btn" onClick={() => deleteTopic(topic)} disabled={deletingTopicId === topic.id}>
                          {deletingTopicId === topic.id ? <Spinner size="sm" animation="border" /> : <FaTrash />} Delete
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="asp-topics-modal-footer">
          <Button variant="light" onClick={() => setShowTopicsModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminSchoolPresentation;
