import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Badge, Button, Card, Col, Container, Dropdown, Form, Modal,
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
const SUBMISSIONS_API_URL = 'https://brjobsedu.com/epathshala/epathshala_backend/api/student-presentation-submissions/';
const TOPICS_API_URL = 'https://brjobsedu.com/epathshala/epathshala_backend/api/presentation-topics/';
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
  const [groups, setGroups] = useState([]);
const [topics, setTopics] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupSaving, setGroupSaving] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({ group_name: '', student_ids: [], topic_name: '', submission_link: '', submission_file: null });
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
    if (activeTab === 'list' || activeTab === 'groups') fetchStudents();
  }, [activeTab, fetchStudents]);

  const fetchGroups = useCallback(async () => {
    if (!accessToken) return;
    setLoadingGroups(true);
    try {
      const response = await axios.get(SUBMISSIONS_API_URL, authConfig());
      const body = response.data;
      const records = Array.isArray(body?.data) ? body.data : (body?.data ? [body.data] : []);
      setGroups(records);
    } catch (err) {
      console.error('Fetch presentation groups failed:', err);
      setError(err.response?.data?.message || 'Unable to load presentation groups.');
    } finally {
      setLoadingGroups(false);
    }
  }, [accessToken, authConfig]);

  const fetchTopics = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await axios.get(TOPICS_API_URL, authConfig());
      const body = response.data;
      const records = Array.isArray(body?.data) ? body.data : (body?.data ? [body.data] : []);
      setTopics(records.filter((t) => t.is_active));
    } catch (err) {
      console.error('Fetch presentation topics failed:', err);
    }
  }, [accessToken, authConfig]);

  useEffect(() => {
    if (activeTab === 'groups') {
      fetchStudents();
      fetchGroups();
      fetchTopics();
    }
  }, [activeTab, fetchStudents, fetchGroups, fetchTopics]);

  const groupedStudentIds = useMemo(() => {
    const ids = new Set();
    groups.forEach((group) => {
      (Array.isArray(group.student_ids) ? group.student_ids : []).forEach((id) => ids.add(String(id)));
    });
    return ids;
  }, [groups]);

  const availableStudents = useMemo(() => students.filter((student) => {
    const id = String(student.student_id || '');
    return id && (!groupedStudentIds.has(id) || (editingGroup && (editingGroup.student_ids || []).map(String).includes(id)));
  }), [students, groupedStudentIds, editingGroup]);

  const resetGroupForm = () => {
    setEditingGroup(null);
    setGroupForm({ group_name: '', student_ids: [], topic_name: '', submission_link: '', submission_file: null });
  };

  const toggleGroupStudent = (studentId) => {
    setGroupForm((previous) => {
      const selected = previous.student_ids.map(String);
      const id = String(studentId);
      if (selected.includes(id)) return { ...previous, student_ids: selected.filter((item) => item !== id) };
      if (selected.length >= 8) return previous;
      return { ...previous, student_ids: [...selected, id] };
    });
  };

  const openGroupEdit = (group) => {
    setEditingGroup(group);
    setGroupForm({
      group_name: group.group_name || '',
      student_ids: Array.isArray(group.student_ids) ? group.student_ids.map(String) : [],
      topic_name: group.topic_name || '',
      submission_link: group.submission_link || '',
      submission_file: null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitGroup = async (event) => {
    event.preventDefault();
    clearNotices();
    const selectedIds = groupForm.student_ids.map(String);
    if (!groupForm.group_name.trim() || !groupForm.topic_name.trim()) {
      setError('Group Name and Presentation Topic are required.');
      return;
    }
    if (selectedIds.length < 3 || selectedIds.length > 8) {
      setError('Each presentation group must contain at least 3 and at most 8 students.');
      return;
    }
    if (!groupForm.submission_link.trim() && !groupForm.submission_file) {
      setError('Provide a presentation link or upload a presentation file.');
      return;
    }
    const payload = {
      group_name: groupForm.group_name.trim(),
      student_ids: selectedIds,
      topic_name: groupForm.topic_name.trim(),
      submission_link: groupForm.submission_link.trim(),
      submission_file: groupForm.submission_file,
    };
    setGroupSaving(true);
    try {
      let config = authConfig();
      let data = payload;
      if (groupForm.submission_file) {
        data = new FormData();
        data.append('group_name', payload.group_name);
        data.append('student_ids', JSON.stringify(selectedIds));
        data.append('topic_name', payload.topic_name);
        data.append('submission_link', payload.submission_link);
        data.append('submission_file', groupForm.submission_file);
        config = { headers: { Authorization: `Bearer ${accessToken}` } };
      }
      if (editingGroup) {
        const updatePayload = {
          id: Number(editingGroup.id),
          group_name: payload.group_name,
          student_ids: selectedIds,
          topic_name: payload.topic_name,
          submission_link: payload.submission_link,
          // Do not send the existing file URL as though it were an uploaded file.
          // If no new file is selected, send null as in the documented API example.
          submission_file: groupForm.submission_file || null,
        };
        if (groupForm.submission_file) {
          const formData = new FormData();
          formData.append('id', String(editingGroup.id));
          formData.append('group_name', updatePayload.group_name);
          formData.append('student_ids', JSON.stringify(selectedIds));
          formData.append('topic_name', updatePayload.topic_name);
          formData.append('submission_link', updatePayload.submission_link);
          formData.append('submission_file', groupForm.submission_file);
          await axios.put(SUBMISSIONS_API_URL, formData, { headers: { Authorization: `Bearer ${accessToken}` } });
        } else {
          await axios.put(SUBMISSIONS_API_URL, updatePayload, authConfig());
        }
        setSuccess('Presentation group updated successfully.');
      } else {
        await axios.post(SUBMISSIONS_API_URL, data, config);
        setSuccess('Presentation group and submission saved successfully.');
      }
      resetGroupForm();
      await fetchGroups();
      await fetchStudents();
    } catch (err) {
      console.error('Save presentation group failed:', {
        status: err.response?.status,
        response: err.response?.data,
        request: err.config?.data,
        error: err.message,
      });
      const apiError = err.response?.data;
      const readableError = typeof apiError === 'string'
        ? apiError
        : apiError
          ? Object.entries(apiError).map(([field, message]) => `${field}: ${Array.isArray(message) ? message.join(', ') : typeof message === 'string' ? message : JSON.stringify(message)}`).join(' | ')
          : '';
      setError(readableError || 'Unable to save the presentation group. Please check the details and try again.');
    } finally {
      setGroupSaving(false);
    }
  };

  const clearNotices = () => {
    setError('');
    setSuccess('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    clearNotices();
    if (tab !== 'groups') resetGroupForm();
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
              <Button variant="link" className={activeTab === 'groups' ? 'active' : ''} onClick={() => handleTabChange('groups')}>
                <FaUsers /> Groups & Presentation
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

            {activeTab === 'groups' && (
              <>
                <Card className="presentation-registration__card mb-4">
                  <Card.Header>
                    <div className="presentation-registration__card-icon"><FaUsers /></div>
                    <div><h5>{editingGroup ? 'Edit Presentation Group' : 'Create Group & Submit Presentation'}</h5><p>Choose 3–8 registered students. Students already assigned to another group are not available.</p></div>
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={submitGroup}>
                      <Row className="g-3">
                        <Col xs={12} md={6}><Form.Group><Form.Label>Group Name *</Form.Label><Form.Control value={groupForm.group_name} onChange={(e) => setGroupForm((p) => ({ ...p, group_name: e.target.value }))} placeholder="e.g. Digital Innovators" required /></Form.Group></Col>
                        <Col xs={12} md={6}><Form.Group><Form.Label>Presentation Topic *</Form.Label><Form.Select value={groupForm.topic_name} onChange={(e) => setGroupForm((p) => ({ ...p, topic_name: e.target.value }))} required><option value="">Select a topic</option>{topics.map((t) => <option key={t.id} value={t.topic}>{t.topic}</option>)}</Form.Select></Form.Group></Col>
                        <Col xs={12} md={6}><Form.Group><Form.Label>Presentation Link</Form.Label><Form.Control type="url" value={groupForm.submission_link} onChange={(e) => setGroupForm((p) => ({ ...p, submission_link: e.target.value }))} placeholder="https://..." /></Form.Group></Col>
                        <Col xs={12} md={6}><Form.Group><Form.Label>Presentation File</Form.Label><Form.Control type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4" onChange={(e) => setGroupForm((p) => ({ ...p, submission_file: e.target.files?.[0] || null }))} /><Form.Text>Provide a link or upload a file.</Form.Text></Form.Group></Col>
                      </Row>
                      <div className="presentation-registration__group-picker mt-4">
                        <div className="presentation-registration__table-heading"><div><h5>Select Students *</h5><span>{groupForm.student_ids.length} of 8 selected · minimum 3 students</span></div><Badge bg={groupForm.student_ids.length >= 3 && groupForm.student_ids.length <= 8 ? 'success' : 'secondary'}>{groupForm.student_ids.length}/8</Badge></div>
                        {loadingList ? <div className="presentation-registration__loading"><Spinner size="sm" /> Loading registered students…</div> : availableStudents.length === 0 ? <Alert variant="info" className="mb-0">No unassigned registered students are available. Register students first or review existing groups.</Alert> : (
                          <div className="presentation-registration__student-dropdown-wrap">
                            <Dropdown autoClose="outside" className="presentation-registration__student-dropdown">
                              <Dropdown.Toggle variant="outline-secondary" id="presentation-student-dropdown" className="presentation-registration__student-dropdown-toggle">
                                <span>{groupForm.student_ids.length ? `${groupForm.student_ids.length} student${groupForm.student_ids.length === 1 ? '' : 's'} selected` : 'Select registered students'}</span>
                                <span className="presentation-registration__dropdown-caret" aria-hidden="true">▾</span>
                              </Dropdown.Toggle>
                              <Dropdown.Menu className="presentation-registration__student-dropdown-menu">
                                <div className="presentation-registration__student-dropdown-hint">Select 3 to 8 students</div>
                                {availableStudents.map((student) => {
                                  const checked = groupForm.student_ids.map(String).includes(String(student.student_id));
                                  const disabled = !checked && groupForm.student_ids.length >= 8;
                                  return <Dropdown.Item as="div" key={student.student_id} className={`presentation-registration__student-dropdown-item ${checked ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`} onClick={(event) => event.stopPropagation()}>
                                    <Form.Check
                                      type="checkbox"
                                      id={`presentation-student-${student.student_id}`}
                                      checked={checked}
                                      disabled={disabled}
                                      onChange={() => toggleGroupStudent(student.student_id)}
                                      label={<span className="presentation-registration__dropdown-student-label"><strong>{student.full_name}</strong><small>{student.class_name} · Roll No. {student.roll_no} · {student.student_id}</small></span>}
                                    />
                                  </Dropdown.Item>;
                                })}
                              </Dropdown.Menu>
                            </Dropdown>
                            {groupForm.student_ids.length > 0 && <div className="presentation-registration__selected-students-summary">{availableStudents.filter((student) => groupForm.student_ids.map(String).includes(String(student.student_id))).map((student) => student.full_name).join(', ')}</div>}
                          </div>
                        )}
                      </div>
                      <div className="presentation-registration__form-actions">
                        {editingGroup && <Button type="button" variant="outline-secondary" className="me-2" onClick={resetGroupForm}>Cancel Edit</Button>}
                        <Button type="submit" disabled={groupSaving || groupForm.student_ids.length < 3 || groupForm.student_ids.length > 8 || (!groupForm.submission_link.trim() && !groupForm.submission_file)}>{groupSaving ? <><Spinner size="sm" className="me-2" />Saving…</> : editingGroup ? 'Update Group Submission' : 'Create Group & Submit'}</Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>

                <Card className="presentation-registration__card">
                  <Card.Header className="presentation-registration__list-header">
                    <div><div className="presentation-registration__card-icon"><FaList /></div><div><h5>Submitted Presentation Groups</h5><p>Group-wise submission details and enrolled students.</p></div></div>
                    <Button variant="outline-primary" size="sm" onClick={fetchGroups} disabled={loadingGroups}><FaList className="me-1" />Refresh</Button>
                  </Card.Header>
                  <Card.Body>
                    {loadingGroups ? <div className="presentation-registration__loading"><Spinner /> Loading groups…</div> : groups.length === 0 ? <Alert variant="info" className="mb-0">No presentation groups have been submitted yet.</Alert> : <div className="table-responsive presentation-registration__table-wrap"><Table bordered hover className="presentation-registration__table"><thead><tr><th>Group Name</th><th>Presentation Topic</th><th>Students</th><th>Presentation Link</th><th>Presentation File</th><th>Points</th><th>Remark</th><th>Submitted</th><th>Action</th></tr></thead><tbody>{groups.map((group) => {
                      const fileValue = group.submission_file;
                      const filePath = typeof fileValue === 'string' ? fileValue : (fileValue?.url || fileValue?.file || fileValue?.download_url || '');
                      const fileHref = filePath ? (/^https?:\/\//i.test(filePath) ? filePath : `https://brjobsedu.com/epathshala/epathshala_backend${filePath.startsWith('/') ? '' : '/'}${filePath}`) : '';
                      return <tr key={group.id}><td><strong>{group.group_name}</strong></td><td>{group.topic_name || '—'}</td><td><div className="presentation-registration__group-students">{(Array.isArray(group.student_details) ? group.student_details : (group.student_ids || []).map((id) => ({ student_id: id }))).map((student) => <span key={student.student_id}>{student.full_name || student.student_id}{student.class_name ? ` · ${student.class_name}` : ''}</span>)}</div></td><td>{group.submission_link ? <a href={group.submission_link} target="_blank" rel="noreferrer">Open link</a> : '—'}</td><td>{fileHref ? <a href={fileHref} target="_blank" rel="noreferrer" download><FaFileExcel className="me-1" />View file</a> : '—'}</td><td>{group.point ?? 0}</td><td>{group.remark || '—'}</td><td>{group.created_at ? new Date(group.created_at).toLocaleDateString() : '—'}</td><td><Button size="sm" variant="outline-primary" onClick={() => openGroupEdit(group)}><FaEdit className="me-1" />Edit</Button></td></tr>;
                    })}</tbody></Table></div>}
                  </Card.Body>
                </Card>
              </>
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
