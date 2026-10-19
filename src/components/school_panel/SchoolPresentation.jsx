import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Badge, Button, Card, Col, Container, Form, Modal,
  Pagination, Row, Spinner, Table
} from 'react-bootstrap';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  FaUserPlus, FaUsers, FaList, FaFileExcel, FaEdit, FaTrash,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../all_login/AuthContext';
import { useLanguage } from '../all_login/LanguageContext';
import SchoolLeftNav from './SchoolLeftNav';
import SchoolHeader from './SchoolHeader';
import '../../assets/css/SchoolPresentation.css';

const API_URL = 'https://brjobsedu.com/epathshala/epathshala_backend/api/student-presentation-reg/';
const PAGE_SIZE = 50;

const emptyStudentForm = { full_name: '', class_name: '', roll_no: '' };

const normalizeRollNo = (value) => String(value ?? '').trim();
const normalizeClassName = (value) => String(value ?? '').trim().toLowerCase();

const SchoolPresentation = () => {
  const { uniqueId: school_uni_id, accessToken } = useAuth();
  const { language } = useLanguage();
  const fileInputRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  ));
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [activeTab, setActiveTab] = useState('single');
  const [students, setStudents] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [singleForm, setSingleForm] = useState(emptyStudentForm);
  const [singleErrors, setSingleErrors] = useState({});
  const [bulkFile, setBulkFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [rowStatuses, setRowStatuses] = useState([]);
  const [previewReady, setPreviewReady] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [existingKeys, setExistingKeys] = useState(new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState(emptyStudentForm);
  const [editLoading, setEditLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteMultiple, setDeleteMultiple] = useState(false);

  const isHindi = language === 'hi';
  const text = useMemo(() => isHindi ? {
    title: 'छात्र प्रस्तुति पंजीकरण',
    single: 'एकल पंजीकरण',
    bulk: 'बल्क Excel अपलोड',
    list: 'छात्र सूची',
    fullName: 'छात्र का पूरा नाम',
    className: 'कक्षा',
    rollNo: 'रोल नंबर',
    register: 'छात्र पंजीकृत करें',
    registering: 'पंजीकरण हो रहा है...',
    template: 'टेम्प्लेट डाउनलोड करें',
    upload: 'Excel/CSV फ़ाइल अपलोड करें',
    preview: 'पूर्वावलोकन',
    submitAll: 'सभी नए छात्रों को पंजीकृत करें',
    registerNew: 'केवल नए छात्रों को पंजीकृत करें',
    registered: 'पंजीकृत',
    alreadyExists: 'पहले से मौजूद',
    failed: 'विफल',
    noStudents: 'अभी तक कोई छात्र पंजीकृत नहीं है।',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    deleteSelected: 'चयनित हटाएं',
    cancel: 'रद्द करें',
    save: 'परिवर्तन सहेजें',
    createdAt: 'पंजीकरण तिथि',
    actions: 'कार्रवाई',
    required: 'सभी फ़ील्ड आवश्यक हैं।',
    rollInvalid: 'रोल नंबर एक वैध संख्या होना चाहिए।',
    loadFailed: 'छात्रों को लोड करने में विफल।',
    fileInvalid: 'कृपया .xlsx, .xls या .csv फ़ाइल अपलोड करें।',
    fileFormat: 'फ़ाइल में full_name, class_name और roll_no कॉलम होने चाहिए।',
    noRows: 'फ़ाइल में कोई डेटा पंक्ति नहीं मिली।',
    fixErrors: 'सबमिट करने से पहले त्रुटियों को ठीक करें।',
    confirmDelete: 'क्या आप चयनित छात्र रिकॉर्ड हटाना चाहते हैं? यह कार्रवाई वापस नहीं की जा सकती।',
    status: 'स्थिति',
    schoolId: 'स्कूल आईडी',
    autoSchool: 'आपके लॉगिन से स्वतः भरी गई',
    selectAll: 'सभी चुनें',
    duplicateBatch: 'इस फ़ाइल में डुप्लीकेट कक्षा/रोल नंबर मिला।',
    duplicateExisting: 'यह कक्षा/रोल नंबर पहले से पंजीकृत है।',
  } : {
    title: 'Student Presentation Registration',
    single: 'Single Registration',
    bulk: 'Bulk Excel Upload',
    list: 'View Students',
    fullName: 'Full Name',
    className: 'Class Name',
    rollNo: 'Roll Number',
    register: 'Register Student',
    registering: 'Registering...',
    template: 'Download Template',
    upload: 'Upload Excel/CSV File',
    preview: 'Preview',
    submitAll: 'Register All New Students',
    registerNew: 'Register New Students Only',
    registered: 'Registered',
    alreadyExists: 'Already exists',
    failed: 'Failed',
    noStudents: 'No students registered yet.',
    edit: 'Edit',
    delete: 'Delete',
    deleteSelected: 'Delete Selected',
    cancel: 'Cancel',
    save: 'Save Changes',
    createdAt: 'Created At',
    actions: 'Actions',
    required: 'All fields are required.',
    rollInvalid: 'Roll number must be a valid number.',
    loadFailed: 'Failed to load students.',
    fileInvalid: 'Please upload an .xlsx, .xls, or .csv file.',
    fileFormat: 'File must contain full_name, class_name, and roll_no columns.',
    noRows: 'No data rows found in the file.',
    fixErrors: 'Please fix validation errors before submitting.',
    confirmDelete: 'Are you sure you want to delete the selected student record(s)? This cannot be undone.',
    status: 'Status',
    schoolId: 'School ID',
    autoSchool: 'Automatically filled from your login',
    selectAll: 'Select All',
    duplicateBatch: 'Duplicate class/roll number found in this file.',
    duplicateExisting: 'This class/roll number is already registered.',
  }, [isHindi]);

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

  const authConfig = useCallback(() => ({
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  }), [accessToken]);

  const fetchStudents = useCallback(async () => {
    if (!accessToken) return;
    setLoadingList(true);
    setError('');
    try {
      const url = school_uni_id
        ? `${API_URL}?school_uni_id=${encodeURIComponent(school_uni_id)}`
        : API_URL;
      const response = await axios.get(url, authConfig());
      const body = response.data;
      const records = Array.isArray(body?.data)
        ? body.data
        : (body?.data && body.data.student_id ? [body.data] : []);
      setStudents(records);
      setSelectedIds([]);
    } catch (err) {
      console.error('Fetch presentation students failed:', err);
      setError(err.response?.data?.message || text.loadFailed);
    } finally {
      setLoadingList(false);
    }
  }, [accessToken, school_uni_id, authConfig, text.loadFailed]);

  useEffect(() => {
    if (activeTab === 'list') fetchStudents();
  }, [activeTab, fetchStudents]);

  const clearNotices = () => {
    setError('');
    setSuccess('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    clearNotices();
    setSingleErrors({});
    setBulkErrors([]);
    setParsedData([]);
    setRowStatuses([]);
    setPreviewReady(false);
    setExistingKeys(new Set());
    setBulkFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateStudent = (student) => {
    const errors = {};
    if (!String(student.full_name ?? '').trim()) errors.full_name = text.required;
    if (!String(student.class_name ?? '').trim()) errors.class_name = text.required;
    const roll = normalizeRollNo(student.roll_no);
    if (!roll) errors.roll_no = text.required;
    else if (!/^\d+$/.test(roll) || Number(roll) < 0) errors.roll_no = text.rollInvalid;
    return errors;
  };

  const handleSingleChange = (event) => {
    const { name, value } = event.target;
    setSingleForm((prev) => ({ ...prev, [name]: value }));
    setSingleErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSingleSubmit = async (event) => {
    event.preventDefault();
    clearNotices();
    const errors = validateStudent(singleForm);
    setSingleErrors(errors);
    if (Object.keys(errors).length) return;
    if (!accessToken) {
      setError('Authentication token is missing. Please log in again.');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(API_URL, {
        full_name: singleForm.full_name.trim(),
        class_name: singleForm.class_name.trim(),
        roll_no: Number(singleForm.roll_no),
      }, authConfig());
      setSuccess(isHindi ? 'छात्र सफलतापूर्वक पंजीकृत हुआ।' : 'Student registered successfully.');
      setSingleForm(emptyStudentForm);
    } catch (err) {
      const message = err.response?.data?.message
        || err.response?.data?.errors
        || (isHindi ? 'पंजीकरण विफल रहा।' : 'Registration failed.');
      setError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setSubmitting(false);
    }
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      { 'Full Name': 'Riya Sharma', 'Class Name': '9th', 'Roll Number': 12 },
      { 'Full Name': 'Aman Verma', 'Class Name': '10th', 'Roll Number': 5 },
    ]);
    worksheet['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 14 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'student_presentation_template.xlsx');
  };

  const studentKey = (student) =>
    `${normalizeClassName(student.class_name)}::${normalizeRollNo(student.roll_no)}`;

  const validateBulkRows = (rows, existing = new Set()) => {
    const errors = [];
    const seen = new Set();
    rows.forEach((row, index) => {
      const rowErrors = validateStudent(row);
      Object.values(rowErrors).forEach((message) => errors.push({ index, message }));
      const key = studentKey(row);
      if (row.class_name && normalizeRollNo(row.roll_no)) {
        if (seen.has(key)) errors.push({ index, message: text.duplicateBatch });
        seen.add(key);
      }
    });
    setBulkErrors(errors);
    return errors;
  };

  const checkExistingStudents = async (rows) => {
    if (!accessToken) return;
    setCheckingExisting(true);
    try {
      const url = school_uni_id
        ? `${API_URL}?school_uni_id=${encodeURIComponent(school_uni_id)}`
        : API_URL;
      const response = await axios.get(url, authConfig());
      const data = Array.isArray(response.data?.data)
        ? response.data.data
        : (response.data?.data?.student_id ? [response.data.data] : []);
      const existing = new Set(data.map(studentKey));
      setExistingKeys(existing);
      validateBulkRows(rows, existing);
    } catch (err) {
      console.error('Could not check existing presentation students:', err);
      validateBulkRows(rows);
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    clearNotices();
    setBulkFile(file);
    setParsedData([]);
    setBulkErrors([]);
    setRowStatuses([]);
    setPreviewReady(false);
    const extension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(extension)) {
      setError(text.fileInvalid);
      event.target.value = '';
      setBulkFile(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const workbook = XLSX.read(loadEvent.target.result, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
        if (!rows.length) {
          setError(text.noRows);
          return;
        }
        const normalizedRows = rows.map((row) => {
          const normalized = {};
          Object.entries(row).forEach(([key, value]) => {
            normalized[String(key).trim().toLowerCase().replace(/[\s-]+/g, '_')] = value;
          });
          return {
            full_name: String(normalized.full_name ?? normalized.name ?? normalized.student_name ?? '').trim(),
            class_name: String(normalized.class_name ?? normalized.class ?? '').trim(),
            roll_no: String(normalized.roll_no ?? normalized.roll_number ?? normalized.roll ?? '').trim(),
          };
        }).filter((row) => row.full_name || row.class_name || row.roll_no);

        if (!normalizedRows.length) {
          setError(text.noRows);
          return;
        }
        const headers = Object.keys(rows[0]).map((key) => key.trim().toLowerCase().replace(/[\s-]+/g, '_'));
        const hasName = headers.some((key) => ['full_name', 'name', 'student_name'].includes(key));
        const hasClass = headers.some((key) => ['class_name', 'class'].includes(key));
        const hasRoll = headers.some((key) => ['roll_no', 'roll_number', 'roll'].includes(key));
        if (!hasName || !hasClass || !hasRoll) {
          setError(text.fileFormat);
          return;
        }
        setParsedData(normalizedRows);
        setPreviewReady(true);
        validateBulkRows(normalizedRows);
        checkExistingStudents(normalizedRows);
      } catch (err) {
        console.error('Excel parse failed:', err);
        setError(text.fileInvalid);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const getNewRows = () => parsedData.filter((row) => {
    const errorsForRow = bulkErrors.some((item) => item.index === parsedData.indexOf(row));
    return !errorsForRow && !existingKeys.has(studentKey(row));
  });

  const submitBulk = async (newOnly = false) => {
    clearNotices();
    if (!parsedData.length) {
      setError(text.noRows);
      return;
    }
    const errors = validateBulkRows(parsedData, existingKeys);
    if (errors.length) {
      setError(text.fixErrors);
      return;
    }
    // Existing class/roll combinations are skipped; never submit them again.
    const rows = parsedData.filter((row) => !existingKeys.has(studentKey(row)));
    if (!rows.length) {
      setError(text.fixErrors);
      return;
    }
    setSubmitting(true);
    const statuses = rows.map((row, index) => ({ index, status: 'pending', message: '' }));
    setRowStatuses(statuses);
    let successCount = 0;
    let failedCount = 0;
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      try {
        await axios.post(API_URL, {
          full_name: row.full_name.trim(),
          class_name: row.class_name.trim(),
          roll_no: Number(row.roll_no),
        }, authConfig());
        statuses[index] = { ...statuses[index], status: 'success', message: text.registered };
        successCount += 1;
      } catch (err) {
        const message = err.response?.data?.message || text.failed;
        statuses[index] = {
          ...statuses[index],
          status: 'failed',
          message: typeof message === 'string' ? message : JSON.stringify(message),
        };
        failedCount += 1;
      }
      setRowStatuses([...statuses]);
    }
    setSubmitting(false);
    setSuccess(`${isHindi ? 'पूर्ण' : 'Completed'}: ${successCount} ${text.registered}, ${failedCount} ${text.failed}.`);
    if (activeTab === 'list') fetchStudents();
  };

  const openEdit = (student) => {
    setEditingStudent(student);
    setEditForm({
      full_name: student.full_name || '',
      class_name: student.class_name || '',
      roll_no: student.roll_no == null ? '' : String(student.roll_no),
    });
    setShowEditModal(true);
    clearNotices();
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    const errors = validateStudent(editForm);
    if (Object.keys(errors).length) {
      setError(Object.values(errors).join(' '));
      return;
    }
    if (!editingStudent?.student_id) {
      setError('Student ID is missing; the record cannot be updated.');
      return;
    }
    setEditLoading(true);
    clearNotices();
    try {
      await axios.put(API_URL, {
        student_id: editingStudent.student_id,
        full_name: editForm.full_name.trim(),
        class_name: editForm.class_name.trim(),
        roll_no: Number(editForm.roll_no),
      }, authConfig());
      setShowEditModal(false);
      setSuccess(isHindi ? 'छात्र का विवरण अपडेट हो गया।' : 'Student updated successfully.');
      await fetchStudents();
    } catch (err) {
      const message = err.response?.data?.message || (isHindi ? 'अपडेट विफल रहा।' : 'Update failed.');
      setError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setEditLoading(false);
    }
  };

  const openDelete = (studentId = null, multiple = false) => {
    setDeleteTargetId(studentId);
    setDeleteMultiple(multiple);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const ids = deleteMultiple ? selectedIds : [deleteTargetId].filter(Boolean);
    if (!ids.length) return;
    setDeleteLoading(true);
    clearNotices();
    try {
      await axios.delete(API_URL, {
        data: { student_id: ids },
        ...authConfig(),
      });
      setShowDeleteModal(false);
      setSelectedIds([]);
      setSuccess(isHindi ? 'छात्र रिकॉर्ड सफलतापूर्वक हटाए गए।' : 'Student record(s) deleted successfully.');
      await fetchStudents();
    } catch (err) {
      const message = err.response?.data?.message || (isHindi ? 'हटाना विफल रहा।' : 'Delete failed.');
      setError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleSelected = (id) => setSelectedIds((prev) => (
    prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
  ));

  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const currentStudents = students.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <div className="dashboard-container school-presentation-fresh">
      <SchoolLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <main className="main-content-dash school-presentation-fresh__main">
        <SchoolHeader toggleSidebar={() => setSidebarOpen((open) => !open)} />
        <section className="dashboard-content school-presentation-fresh__content">
          <Container fluid className="presentation-registration">
            <div className="presentation-registration__heading">
              <div>
                <span className="presentation-registration__eyebrow">SCHOOL PORTAL</span>
                <h2>{text.title}</h2>
                <p>{isHindi ? 'छात्र विवरण दर्ज करें, Excel से अपलोड करें या पंजीकृत रिकॉर्ड देखें।' : 'Register students individually, upload an Excel sheet, or manage existing records.'}</p>
              </div>
              <Badge bg="primary" className="presentation-registration__school-badge">
                {school_uni_id || 'School account'}
              </Badge>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            <div className="presentation-registration__tabs" role="tablist">
              <Button variant="link" className={activeTab === 'single' ? 'active' : ''} onClick={() => handleTabChange('single')}>
                <FaUserPlus /> {text.single}
              </Button>
              <Button variant="link" className={activeTab === 'bulk' ? 'active' : ''} onClick={() => handleTabChange('bulk')}>
                <FaUsers /> {text.bulk}
              </Button>
              <Button variant="link" className={activeTab === 'list' ? 'active' : ''} onClick={() => handleTabChange('list')}>
                <FaList /> {text.list}
              </Button>
            </div>

            {activeTab === 'single' && (
              <Card className="presentation-registration__card">
                <Card.Header>
                  <div className="presentation-registration__card-icon"><FaUserPlus /></div>
                  <div><h5>{text.single}</h5><p>Enter the student details below.</p></div>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSingleSubmit} noValidate>
                    <Row className="g-3">
                      <Col xs={12} md={4}>
                        <Form.Group>
                          <Form.Label>{text.schoolId}</Form.Label>
                          <Form.Control value={school_uni_id || ''} disabled />
                          <Form.Text>{text.autoSchool}</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={4}>
                        <Form.Group>
                          <Form.Label>{text.fullName} <span className="text-danger">*</span></Form.Label>
                          <Form.Control name="full_name" value={singleForm.full_name} onChange={handleSingleChange} isInvalid={!!singleErrors.full_name} placeholder="e.g. Riya Sharma" />
                          <Form.Control.Feedback type="invalid">{singleErrors.full_name}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={2}>
                        <Form.Group>
                          <Form.Label>{text.className} <span className="text-danger">*</span></Form.Label>
                          <Form.Control name="class_name" value={singleForm.class_name} onChange={handleSingleChange} isInvalid={!!singleErrors.class_name} placeholder="e.g. 9th" />
                          <Form.Control.Feedback type="invalid">{singleErrors.class_name}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={2}>
                        <Form.Group>
                          <Form.Label>{text.rollNo} <span className="text-danger">*</span></Form.Label>
                          <Form.Control type="number" min="0" step="1" name="roll_no" value={singleForm.roll_no} onChange={handleSingleChange} isInvalid={!!singleErrors.roll_no} placeholder="e.g. 12" />
                          <Form.Control.Feedback type="invalid">{singleErrors.roll_no}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="presentation-registration__form-actions">
                      <Button type="submit" disabled={submitting}>
                        {submitting ? <><Spinner size="sm" className="me-2" />{text.registering}</> : <><FaUserPlus className="me-2" />{text.register}</>}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            )}

            {activeTab === 'bulk' && (
              <Card className="presentation-registration__card">
                <Card.Header>
                  <div className="presentation-registration__card-icon"><FaFileExcel /></div>
                  <div><h5>{text.bulk}</h5><p>Use the template to keep the required column names consistent.</p></div>
                </Card.Header>
                <Card.Body>
                  <div className="presentation-registration__upload">
                    <div className="presentation-registration__upload-icon"><FaFileExcel /></div>
                    <div className="flex-grow-1">
                      <h6>{text.upload}</h6>
                      <p>Required Excel columns: <code>Full Name</code>, <code>Class Name</code>, <code>Roll Number</code>.</p>
                      <Form.Control ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} disabled={submitting} />
                    </div>
                    <Button variant="outline-primary" onClick={downloadTemplate}><FaFileExcel className="me-2" />{text.template}</Button>
                  </div>

                  {checkingExisting && <div className="py-3"><Spinner size="sm" className="me-2" />Checking existing student records...</div>}

                  {previewReady && (
                    <div className="mt-4">
                      <div className="presentation-registration__table-heading">
                        <div><h5>{text.preview}</h5><span>{parsedData.length} rows · {parsedData.filter((row) => existingKeys.has(studentKey(row))).length} already registered</span></div>
                        <Badge bg={bulkErrors.length ? 'danger' : 'success'}>{bulkErrors.length} validation issue(s)</Badge>
                      </div>
                      <div className="table-responsive presentation-registration__table-wrap">
                        <Table bordered hover responsive className="presentation-registration__table">
                          <thead><tr><th>#</th><th>{text.fullName}</th><th>{text.className}</th><th>{text.rollNo}</th><th>{text.status}</th></tr></thead>
                          <tbody>
                            {parsedData.map((row, index) => {
                              const status = rowStatuses[index];
                              const rowError = bulkErrors.find((item) => item.index === index);
                              const alreadyExists = existingKeys.has(studentKey(row));
                              return (
                                <tr key={`${row.class_name}-${row.roll_no}-${index}`}>
                                  <td>{index + 1}</td><td>{row.full_name || '-'}</td><td>{row.class_name || '-'}</td><td>{row.roll_no || '-'}</td>
                                  <td>
                                    {status?.status === 'pending' ? <Spinner size="sm" /> :
                                      status?.status === 'success' ? <span className="text-success"><FaCheckCircle /> {status.message}</span> :
                                      status?.status === 'failed' ? <span className="text-danger"><FaTimesCircle /> {status.message}</span> :
                                      rowError ? <span className="text-danger"><FaTimesCircle /> {rowError.message}</span> :
                                      alreadyExists ? <span className="text-warning"><FaExclamationTriangle /> {text.alreadyExists}</span> :
                                      <span className="text-success"><FaCheckCircle /> Ready</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                      <div className="presentation-registration__form-actions">
                        <Button onClick={() => submitBulk(true)} disabled={submitting || checkingExisting || bulkErrors.length > 0 || parsedData.every((row) => existingKeys.has(studentKey(row)))}>
                          {submitting ? <><Spinner size="sm" className="me-2" />{text.registering}</> : text.submitAll}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}

            {activeTab === 'list' && (
              <Card className="presentation-registration__card">
                <Card.Header className="presentation-registration__list-header">
                  <div><div className="presentation-registration__card-icon"><FaList /></div><div><h5>{text.list}</h5><p>{students.length} student record(s)</p></div></div>
                  <div className="presentation-registration__list-actions">
                    {selectedIds.length > 0 && <Button variant="danger" size="sm" onClick={() => openDelete(null, true)}><FaTrash className="me-1" />{text.deleteSelected} ({selectedIds.length})</Button>}
                    <Button variant="outline-primary" size="sm" onClick={fetchStudents} disabled={loadingList}><FaList className="me-1" />Refresh</Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {loadingList ? <div className="presentation-registration__loading"><Spinner animation="border" /><span>Loading students...</span></div> :
                    students.length === 0 ? <Alert variant="info">{text.noStudents}</Alert> : (
                      <>
                        <div className="table-responsive presentation-registration__table-wrap">
                          <Table bordered hover responsive className="presentation-registration__table">
                            <thead><tr>
                              <th><Form.Check aria-label={text.selectAll} checked={students.length > 0 && selectedIds.length === students.length} onChange={() => setSelectedIds(selectedIds.length === students.length ? [] : students.map((s) => s.student_id).filter(Boolean))} /></th>
                              <th>#</th><th>Student ID</th><th>{text.fullName}</th><th>{text.className}</th><th>{text.rollNo}</th><th>{text.createdAt}</th><th>{text.status}</th><th>{text.actions}</th>
                            </tr></thead>
                            <tbody>
                              {currentStudents.map((student, index) => (
                                <tr key={student.student_id}>
                                  <td><Form.Check aria-label={`Select ${student.full_name}`} checked={selectedIds.includes(student.student_id)} onChange={() => toggleSelected(student.student_id)} /></td>
                                  <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                                  <td className="text-nowrap">{student.student_id}</td>
                                  <td>{student.full_name}</td><td>{student.class_name}</td><td>{student.roll_no}</td>
                                  <td className="text-nowrap">{student.created_at ? new Date(student.created_at).toLocaleDateString() : '-'}</td>
                                  <td><Badge bg={student.status === 'approved' ? 'success' : student.status === 'rejected' ? 'danger' : 'secondary'}>{student.status || 'pending'}</Badge></td>
                                  <td className="text-nowrap">
                                    <Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEdit(student)}><FaEdit className="me-1" />{text.edit}</Button>
                                    <Button size="sm" variant="outline-danger" onClick={() => openDelete(student.student_id)}><FaTrash className="me-1" />{text.delete}</Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                        {totalPages > 1 && <Pagination className="justify-content-center mt-3">
                          <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} />
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>{page}</Pagination.Item>
                          ))}
                          <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} />
                        </Pagination>}
                      </>
                    )}
                </Card.Body>
              </Card>
            )}
          </Container>
        </section>
      </main>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Form onSubmit={submitEdit}>
          <Modal.Header closeButton><Modal.Title>{text.edit} Student</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3"><Form.Label>{text.fullName}</Form.Label><Form.Control value={editForm.full_name} onChange={(e) => setEditForm((p) => ({ ...p, full_name: e.target.value }))} required /></Form.Group>
            <Row>
              <Col sm={6}><Form.Group className="mb-3"><Form.Label>{text.className}</Form.Label><Form.Control value={editForm.class_name} onChange={(e) => setEditForm((p) => ({ ...p, class_name: e.target.value }))} required /></Form.Group></Col>
              <Col sm={6}><Form.Group className="mb-3"><Form.Label>{text.rollNo}</Form.Label><Form.Control type="number" min="0" step="1" value={editForm.roll_no} onChange={(e) => setEditForm((p) => ({ ...p, roll_no: e.target.value }))} required /></Form.Group></Col>
            </Row>
            <small className="text-muted">Student ID: {editingStudent?.student_id}</small>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={() => setShowEditModal(false)}>{text.cancel}</Button><Button type="submit" disabled={editLoading}>{editLoading ? <Spinner size="sm" /> : text.save}</Button></Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>{text.delete}</Modal.Title></Modal.Header>
        <Modal.Body>{text.confirmDelete}</Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowDeleteModal(false)}>{text.cancel}</Button><Button variant="danger" onClick={confirmDelete} disabled={deleteLoading}>{deleteLoading ? <Spinner size="sm" /> : text.delete}</Button></Modal.Footer>
      </Modal>
    </div>
  );
};

export default SchoolPresentation;
