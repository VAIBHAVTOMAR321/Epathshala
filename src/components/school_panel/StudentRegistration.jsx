import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Button, Form, Alert, Table, Spinner, Modal, Pagination } from "react-bootstrap";
import axios from "axios";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf'; 
import autoTable from 'jspdf-autotable';
import { FaFileExcel, FaFilePdf, FaUserPlus, FaUsers, FaList, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

import { useAuth } from "../all_login/AuthContext";
import { useLanguage } from "../all_login/LanguageContext";
import SchoolHeader from "./SchoolHeader";
import SchoolLeftNav from "./SchoolLeftNav";
import "../../assets/css/userleftnav.css";
import "../../assets/css/StudentRegistration.css";

const StudentRegistration = () => {
  const { uniqueId: school_uni_id, accessToken } = useAuth();
  const { language } = useLanguage();
  const fileInputRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const [activeTab, setActiveTab] = useState('single');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const content = {
    en: {
      title: "Student Aadhaar Registration",
      singleTab: "Single Registration",
      bulkTab: "Bulk Excel Upload",
      listTab: "View Students",
      fullName: "Full Name",
      aadhaar: "Aadhaar Number",
      register: "Register Student",
      registering: "Registering...",
      edit: "Edit",
      delete: "Delete",
      save: "Save Changes", // Added comma
      cancel: "Cancel", // Added comma
      schoolId: "School ID",
      autoFilled: "Auto-filled from your account",
      autoFilledSub: "Automatically filled from your login",
      fullNamePlaceholder: "Enter student's full name",
      aadhaarPlaceholder: "12-digit Aadhaar number",
      uploadTitle: "Upload Excel File (.xlsx, .xls, .csv)",
      downloadTemplate: "Download Template",
      uploadNote: "File must contain columns: \"aadhaar_no\" and \"full_name\" (or \"name\"). School ID will be auto-attached.",
      validationErrorMsg: "validation error(s) found. Please fix before submitting.",
      previewTitle: "Preview",
      checkingExisting: "Checking for existing students...",
      alreadyRegisteredBatch: "students already registered.",
      onlyNewMsg: "Only {count} new students will be registered.",
      registerNewOnly: "Register {count} New Students Only",
      submitAll: "Submit All",
      processingBulk: "Processing bulk upload...",
      studentList: "Students List",
      deleteSelected: "Delete Selected",
      noStudents: "No students registered yet.",
      createdAt: "Created At",
      confirmDeleteTitle: "Confirm Delete",
      deleteMultipleMsg: "Are you sure you want to delete {count} selected students? This action cannot be undone.",
      deleteSingleMsg: "Are you sure you want to delete this student? This action cannot be undone.",
      successSingle: "Student registered successfully!",
      successUpdate: "Student updated successfully",
      successDeleteSingle: "Student deleted successfully",
      successDeleteMultiple: "students deleted successfully",
      errorLoad: "Failed to load students",
      errorReq: "All fields are required",
      errorAadhaar12: "Aadhaar must be 12 digits",
      errorExcelRows: "Excel file must have header row and at least one data row",
      errorExcelCols: "Excel must contain columns: \"aadhaar_no\" and \"full_name\" (or \"name\")",
      errorNoRows: "No valid data rows found",
      errorParse: "Failed to parse Excel file. Please check the format.",
      errorNoNew: "No new students to register",
      errorDataSubmit: "No data to submit",
      errorFixData: "Please fix errors in the data before submitting"
    },
    hi: {
      title: "छात्र आधार पंजीकरण",
      singleTab: "एकल पंजीकरण",
      bulkTab: "बल्क एक्सेल अपलोड",
      listTab: "छात्रों को देखें",
      fullName: "पूरा नाम",
      aadhaar: "आधार नंबर",
      register: "छात्र का पंजीकरण करें",
      registering: "पंजीकरण हो रहा है...",
      edit: "संपादित करें",
      delete: "हटाएं",
      save: "परिवर्तन सहेजें", // Added comma
      cancel: "रद्द करें", // Added comma
      schoolId: "शैक्षणिक संस्था आईडी",
      autoFilled: "आपके खाते से स्वतः भरा गया",
      autoFilledSub: "आपके लॉगिन से स्वतः भरा गया",
      fullNamePlaceholder: "छात्र का पूरा नाम दर्ज करें",
      aadhaarPlaceholder: "12-अंकीय आधार संख्या",
      uploadTitle: "एक्सेल फ़ाइल अपलोड करें (.xlsx, .xls, .csv)",
      downloadTemplate: "टेम्प्लेट डाउनलोड करें",
      uploadNote: "फ़ाइल में कॉलम होने चाहिए: \"aadhaar_no\" और \"full_name\" (या \"name\")। शैक्षणिक संस्था आईडी स्वतः संलग्न हो जाएगी।",
      validationErrorMsg: "सत्यापन त्रुटियाँ मिलीं। कृपया सबमिट करने से पहले ठीक करें।",
      previewTitle: "पूर्वावलोकन",
      checkingExisting: "मौजूदा छात्रों की जाँच की जा रही है...",
      alreadyRegisteredBatch: "छात्र पहले से पंजीकृत हैं।",
      onlyNewMsg: "केवल {count} नए छात्र पंजीकृत किए जाएंगे।",
      registerNewOnly: "केवल {count} नए छात्र पंजीकृत करें",
      submitAll: "सभी सबमिट करें",
      processingBulk: "बल्क अपलोड संसाधित किया जा रहा है...",
      studentList: "छात्र सूची",
      deleteSelected: "चयनित हटाएं",
      noStudents: "अभी तक कोई छात्र पंजीकृत नहीं है।",
      createdAt: "पंजीकरण तिथि",
      confirmDeleteTitle: "हटाने की पुष्टि करें",
      deleteMultipleMsg: "क्या आप वाकई {count} चयनित छात्रों को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।",
      deleteSingleMsg: "क्या आप वाकई इस छात्र को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।",
      successSingle: "छात्र सफलतापूर्वक पंजीकृत!",
      successUpdate: "छात्र सफलतापूर्वक अपडेट किया गया",
      successDeleteSingle: "छात्र सफलतापूर्वक हटा दिया गया",
      successDeleteMultiple: "छात्र सफलतापूर्वक हटा दिए गए",
      errorLoad: "छात्रों को लोड करने में विफल",
      errorReq: "सभी फ़ील्ड आवश्यक हैं",
      errorAadhaar12: "आधार नंबर 12 अंकों का होना चाहिए",
      errorExcelRows: "एक्सेल फ़ाइल में हेडर पंक्ति और कम से कम एक डेटा पंक्ति होनी चाहिए",
      errorExcelCols: "एक्सेल में कॉलम होने चाहिए: \"aadhaar_no\" और \"full_name\" (या \"name\")",
      errorNoRows: "कोई वैध डेटा पंक्ति नहीं मिली",
      errorParse: "एक्सेल फ़ाइल पार्स करने में विफल। कृपया प्रारूप की जाँच करें।",
      errorNoNew: "पंजीकरण के लिए कोई नया छात्र नहीं है",
      errorDataSubmit: "सबमिट करने के लिए कोई डेटा नहीं है",
      errorFixData: "कृपया सबमिट करने से पहले डेटा में त्रुटियों को ठीक करें"
    }
  };

  const t = content[language] || content.en;

  // Students list state
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const recordsPerPage = 50;

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', aadhaar_no: '' });
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState(null);
  const [deletingMultiple, setDeletingMultiple] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Single registration state
  const [singleForm, setSingleForm] = useState({
    full_name: '',
    aadhaar_no: '',
  });
  const [singleErrors, setSingleErrors] = useState({});

  // Bulk registration state
  const [bulkFile, setBulkFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [existingStudents, setExistingStudents] = useState(new Set());
  const [bulkErrors, setBulkErrors] = useState([]);
  const [submittingBulk, setSubmittingBulk] = useState(false);
  const [rowStatuses, setRowStatuses] = useState([]);
  const [previewReady, setPreviewReady] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);

  // Generate and download template
  const downloadTemplate = () => {
    const templateData = [
      { aadhaar_no: '123456789012', full_name: 'Sample Student Name' },
      { aadhaar_no: '987654321098', full_name: 'Another Student' }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 20 }, // aadhaar_no column
      { wch: 30 }  // full_name column
    ];
    
    XLSX.writeFile(workbook, 'student_aadhaar_template.xlsx');
  };

  // Fetch students with pagination
  const fetchStudents = async (page = 1) => {
    setStudentsLoading(true);
    try {
      const response = await axios.get(
        `https://brjobsedu.com/epathshala/epathshala_backend/api/school-aadhaar-reg/?school_uni_id=${school_uni_id}`,
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
        }
      );
      
      let studentsData = [];
      
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        if (Array.isArray(data)) {
          studentsData = data;
        } else if (data.id) {
          studentsData = [data];
        }
      }
      
      setStudents(studentsData);
      setTotalStudents(studentsData.length);
      setCurrentPage(1);
    } catch (err) {
      console.error('Fetch students error:', err);
      setError('Failed to load students');
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
      fetchStudents();
    }
  }, [activeTab, school_uni_id]);

  // Toggle tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    setSingleErrors({});
    setBulkErrors([]);
    setParsedData([]);
    setPreviewReady(false);
    setRowStatuses([]);
    setBulkFile(null);
    setExistingStudents(new Set());
    setSelectedIds([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Edit student
  const handleEditClick = (student) => {
    setEditingStudent(student);
    setEditForm({ full_name: student.full_name, aadhaar_no: student.aadhaar_no });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    if (!editForm.full_name.trim() || !editForm.aadhaar_no.trim()) {
        setError(t.errorReq);
      return;
    }
    if (!/^\d{12}$/.test(editForm.aadhaar_no)) {
        setError(t.errorAadhaar12);
      return;
    }

    setEditLoading(true);
    setError('');
    try {
      await axios.put(
        `https://brjobsedu.com/epathshala/epathshala_backend/api/school-aadhaar-reg/`,
        {
          id: editingStudent.id,
          school_uni_id,
          aadhaar_no: editForm.aadhaar_no,
          full_name: editForm.full_name
        },
        { headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        } }
      );
      setSuccess(t.successUpdate);
      setShowEditModal(false);
      fetchStudents(currentPage);
    } catch (err) {
      console.error('Edit error:', err);
      const message = err.response?.data?.message || (language === 'hi' ? 'अपडेट विफल' : 'Update failed');
      setError(message);
    } finally {
      setEditLoading(false);
    }
  };

  // Delete single student
  const handleDeleteClick = (id) => {
    setDeletingStudentId(id);
    setDeletingMultiple(false);
    setShowDeleteModal(true);
  };

  // Delete multiple students
  const handleDeleteMultiple = () => {
    if (selectedIds.length === 0) return;
    setDeletingMultiple(true);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    setError('');
    try {
      if (deletingMultiple) {
        await axios.delete(
          'https://brjobsedu.com/epathshala/epathshala_backend/api/school-aadhaar-reg/',
          {
            data: { id: selectedIds },
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        setSuccess(`${selectedIds.length} ${t.successDeleteMultiple}`);
        setSelectedIds([]);
      } else {
        await axios.delete(
          'https://brjobsedu.com/epathshala/epathshala_backend/api/school-aadhaar-reg/',
          {
            data: { id: [deletingStudentId] },
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        setSuccess(t.successDeleteSingle);
      }
      setShowDeleteModal(false);
      fetchStudents(currentPage);
    } catch (err) {
      console.error('Delete error:', err);
      const message = err.response?.data?.message || (language === 'hi' ? 'हटाना विफल' : 'Delete failed');
      setError(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Toggle selection
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s.id));
    }
  };

  // Client-side pagination
  const totalPages = Math.ceil(totalStudents / recordsPerPage);
  const getCurrentPageData = () => {
    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    return students.slice(start, end);
  };
  
  const renderPagination = () => {
    const items = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <Pagination.Item key={i} active={i === currentPage} onClick={() => setCurrentPage(i)} className="mx-1">
          {i}
        </Pagination.Item>
      );
    }
    return <Pagination className="justify-content-center">{items}</Pagination>;
  };

  // Download Excel for students
  const downloadStudentsExcel = () => {
    const dataToExport = students.map((student, index) => ({
      '#': index + 1,
      'Aadhaar Number': student.aadhaar_no ? '******' + student.aadhaar_no.slice(-4) : '-',
      'Full Name': student.full_name,
      'Date Created': student.created_at ? new Date(student.created_at).toLocaleDateString() : '-'
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Students')
    XLSX.writeFile(wb, `students_${school_uni_id}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Download PDF for students
  const downloadStudentsPDF = () => {
    const doc = new jsPDF()

    const tableColumn = [
      '#',
      'Aadhaar Number',
      'Full Name',
      'Date Created'
    ]

    const tableRows = students.map((student, index) => [
      index + 1,
      student.aadhaar_no ? '******' + student.aadhaar_no.slice(-4) : '-',
      student.full_name,
      student.created_at ? new Date(student.created_at).toLocaleDateString() : '-'
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    })

    doc.text('Students Report', 14, 15)
    doc.save(`students_${school_uni_id}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Single form validation
  const validateSingleForm = () => {
    const errors = {};
    if (!singleForm.full_name.trim()) {
        errors.full_name = t.validation.fullNameReq;
    }
    if (!singleForm.aadhaar_no.trim()) {
        errors.aadhaar_no = t.validation.aadhaarReq;
    } else if (!/^\d{12}$/.test(singleForm.aadhaar_no)) {
        errors.aadhaar_no = t.errorAadhaar12;
    }
    setSingleErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle single form input
  const handleSingleChange = (e) => {
    const { name, value } = e.target;
    setSingleForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (singleErrors[name]) {
      setSingleErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Submit single registration
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!validateSingleForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        school_uni_id,
        aadhaar_no: singleForm.aadhaar_no,
        full_name: singleForm.full_name
      };

      await axios.post(
        `https://brjobsedu.com/epathshala/epathshala_backend/api/school-aadhaar-reg/`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
        }
      );

      setSuccess(t.successSingle);
      setSingleForm({ full_name: '', aadhaar_no: '' });
} catch (err) {
      const message = err.response?.data?.errors?.aadhaar_no?.[0] || err.response?.data?.errors || err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setBulkErrors([]);
    setParsedData([]);
    setPreviewReady(false);
    setRowStatuses([]);

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/vnd.ms-excel'
    ];

    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'csv', 'xls'].includes(fileExt)) {
      setError(language === 'hi' ? 'कृपया एक वैध एक्सेल फ़ाइल अपलोड करें (.xlsx, .xls, या .csv)' : 'Please upload a valid Excel file (.xlsx, .xls, or .csv)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setBulkFile(file);
    parseExcelFile(file);
  };

  // Parse Excel file
  const parseExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (jsonData.length < 2) {
          setError(t.errorExcelRows);
          return;
        }

        // Extract headers from first row
        const headers = jsonData[0].map(h => String(h).trim().toLowerCase());
        const aadhaarIdx = headers.findIndex(h => h === 'aadhaar_no' || h === 'aadhaar' || h === 'aadhaar number');
        const nameIdx = headers.findIndex(h => h === 'full_name' || h === 'name' || h === 'student name');

        if (aadhaarIdx === -1 || nameIdx === -1) {
          setError(t.errorExcelCols);
          return;
        }

        // Parse data rows
        const rows = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const aadhaar = String(row[aadhaarIdx] || '').trim();
          const name = String(row[nameIdx] || '').trim();

          if (aadhaar || name) {
            rows.push({
              aadhaar_no: aadhaar,
              full_name: name,
              rowIndex: i + 1
            });
          }
        }

        if (rows.length === 0) {
          setError(t.errorNoRows);
          return;
        }

        setParsedData(rows);
        setPreviewReady(true);
        validateBulkData(rows);
        
        // Check for existing students
        checkExistingStudents(rows);
      } catch (err) {
        console.error('Parse error:', err);
        setError(t.errorParse);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Check existing students in database
  const checkExistingStudents = async (rows) => {
    const aadhaarNumbers = rows.map(r => r.aadhaar_no).filter(a => a);
    if (aadhaarNumbers.length === 0) return;

    setCheckingExisting(true);
    try {
      const response = await axios.get(
        `https://brjobsedu.com/epathshala/epathshala_backend/api/school-aadhaar-reg/?school_uni_id=${school_uni_id}`,
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
        }
      );

      let existingAadhaars = new Set();
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        if (Array.isArray(data)) {
          data.forEach(s => {
            if (s.aadhaar_no) existingAadhaars.add(s.aadhaar_no);
          });
        } else if (data.id && data.aadhaar_no) {
          existingAadhaars.add(data.aadhaar_no);
        }
      }

      // Mark duplicates in current batch
      const batchDuplicates = new Set();
      aadhaarNumbers.forEach(a => {
        if (existingAadhaars.has(a)) batchDuplicates.add(a);
      });

      setExistingStudents(batchDuplicates);
      
      // Update bulk errors to include existing students
      if (batchDuplicates.size > 0) {
        const existingErrors = [...bulkErrors];
        rows.forEach((row, idx) => {
          if (batchDuplicates.has(row.aadhaar_no)) {
            if (!existingErrors.find(e => e.index === idx)) {
              existingErrors.push({ index: idx, message: language === 'hi' ? 'पहले से पंजीकृत' : 'Already registered' });
            }
          }
        });
        setBulkErrors(existingErrors);
      }
    } catch (err) {
      console.error('Check existing error:', err);
    } finally {
      setCheckingExisting(false);
    }
  };

  // Get filtered data - only new students (not existing)
  const getNewStudents = () => {
    return parsedData.filter(row => !existingStudents.has(row.aadhaar_no));
  };

  // Register only new students
  const handleRegisterNewOnly = async () => {
    const newStudents = getNewStudents();
    if (newStudents.length === 0) {
      setError(t.errorNoNew);
      return;
    }

    setSubmittingBulk(true);
    setError('');
    setSuccess('');

    const newRowStatuses = newStudents.map((row, idx) => ({
      index: parsedData.findIndex(p => p.aadhaar_no === row.aadhaar_no),
      status: 'pending',
      message: ''
    }));
    setRowStatuses(newRowStatuses);

    const statusResults = [...newRowStatuses];

    for (let i = 0; i < newStudents.length; i++) {
      const row = newStudents[i];
      const originalIndex = parsedData.findIndex(p => p.aadhaar_no === row.aadhaar_no);
      const statusIndex = statusResults.findIndex(s => s.index === originalIndex);
      const payload = {
        school_uni_id,
        aadhaar_no: row.aadhaar_no,
        full_name: row.full_name
      };

      try {
        await axios.post(
          `https://brjobsedu.com/epathshala/epathshala_backend/api/school-aadhaar-reg/`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
          }
        );

        statusResults[statusIndex] = { ...statusResults[statusIndex], status: 'success', message: language === 'hi' ? 'पंजीकृत' : 'Registered' };
        setRowStatuses([...statusResults]);
      } catch (err) {
        const isDuplicate = err.response?.data?.errors?.aadhaar_no?.some(e => 
          e.toLowerCase().includes('already exists')
        );
        
        if (isDuplicate) {
          statusResults[statusIndex] = { ...statusResults[statusIndex], status: 'skipped', message: language === 'hi' ? 'पहले से मौजूद है' : 'Already exists' };
        } else {
          const message = err.response?.data?.errors?.aadhaar_no?.[0] || err.response?.data?.errors || (language === 'hi' ? 'विफल' : 'Failed');
          statusResults[statusIndex] = { ...statusResults[statusIndex], status: 'failed', message };
        }
        setRowStatuses([...statusResults]);
      }
    }

    setSubmittingBulk(false);
    
    const successCount = statusResults.filter(s => s.status === 'success').length;
    const skippedCount = statusResults.filter(s => s.status === 'skipped').length;
    const failedCount = statusResults.filter(s => s.status === 'failed').length;
    
    setSuccess(`${language === 'hi' ? 'पूरा हुआ' : 'Completed'}: ${successCount} ${language === 'hi' ? 'पंजीकृत' : 'registered'}, ${skippedCount} ${language === 'hi' ? 'पहले से मौजूद' : 'already exists'}, ${failedCount} ${language === 'hi' ? 'विफल' : 'failed'}`);
  };

  // Validate bulk data (Aadhaar format and duplicates)
  const validateBulkData = (rows) => {
    const errors = [];
    const aadhaarSet = new Set();
    const duplicates = new Set();

    rows.forEach((row, idx) => {
      // Check empty aadhaar
      if (!row.aadhaar_no) {
        errors.push({ index: idx, message: t.validation.aadhaarReq });
      } else if (!/^\d{12}$/.test(row.aadhaar_no)) {
        errors.push({ index: idx, message: t.errorAadhaar12 });
      }

      // Check duplicate within batch
      if (row.aadhaar_no) {
        if (aadhaarSet.has(row.aadhaar_no)) {
          duplicates.add(row.aadhaar_no);
          errors.push({ index: idx, message: language === 'hi' ? 'इस बैच में डुप्लीकेट आधार' : 'Duplicate Aadhaar in this batch' });
        } else {
          aadhaarSet.add(row.aadhaar_no);
        }
      }
    });

    setBulkErrors(errors);
  };

  // Submit bulk registration
  const handleBulkSubmit = async () => {
    if (parsedData.length === 0) {
      setError(t.errorDataSubmit);
      return;
    }

    // Re-validate before submit
    validateBulkData(parsedData);
    if (bulkErrors.length > 0) {
      setError(t.errorFixData);
      return;
    }

    setSubmittingBulk(true);
    setError('');
    setSuccess('');

    const newRowStatuses = parsedData.map((row, idx) => ({
      index: idx,
      status: 'pending',
      message: ''
    }));
    setRowStatuses(newRowStatuses);

    const statusResults = [...newRowStatuses];

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      const payload = {
        school_uni_id,
        aadhaar_no: row.aadhaar_no,
        full_name: row.full_name
      };

      try {
        await axios.post(
          `https://brjobsedu.com/epathshala/epathshala_backend/api/school-aadhaar-reg/`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
          }
        );

        statusResults[i] = { ...statusResults[i], status: 'success', message: language === 'hi' ? 'पंजीकृत' : 'Registered' };
        setRowStatuses([...statusResults]);
      } catch (err) {
        const isDuplicate = err.response?.data?.errors?.aadhaar_no?.some(e => 
          e.toLowerCase().includes('already exists')
        );
        
        if (isDuplicate) {
          statusResults[i] = { ...statusResults[i], status: 'skipped', message: language === 'hi' ? 'पहले से मौजूद है' : 'Already exists' };
        } else {
          const message = err.response?.data?.errors?.aadhaar_no?.[0] || err.response?.data?.errors || (language === 'hi' ? 'विफल' : 'Failed');
          statusResults[i] = { ...statusResults[i], status: 'failed', message };
        }
        setRowStatuses([...statusResults]);
      }
    }

    setSubmittingBulk(false);
    
    const successCount = statusResults.filter(s => s.status === 'success').length;
    const skippedCount = statusResults.filter(s => s.status === 'skipped').length;
    const failedCount = statusResults.filter(s => s.status === 'failed').length;
    
    setSuccess(`${language === 'hi' ? 'पूरा हुआ' : 'Completed'}: ${successCount} ${language === 'hi' ? 'पंजीकृत' : 'registered'}, ${skippedCount} ${language === 'hi' ? 'छोड़ा गया' : 'skipped'}, ${failedCount} ${language === 'hi' ? 'विफल' : 'failed'}`);
  };

   return (
    <div className="dashboard-container">
      <SchoolLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <SchoolHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-box mt-3 student-registration-page">
          <h4 className="mb-4 font-weight-bold">{t.title}</h4>

          {/* Alert Messages */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Tabs */}
          <div className="nav nav-tabs">
            <Button
              variant="link"
              className={`nav-link ${activeTab === 'single' ? 'active' : ''}`}
              onClick={() => handleTabChange('single')}
            >
              <FaUserPlus /> {t.singleTab}
            </Button>
            <Button
              variant="link"
              className={`nav-link ${activeTab === 'bulk' ? 'active' : ''}`}
              onClick={() => handleTabChange('bulk')}
            >
              <FaUsers /> {t.bulkTab}
            </Button>
            <Button
              variant="link"
              className={`nav-link ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => handleTabChange('list')}
            >
              <FaList /> {t.listTab}
            </Button>
          </div>

          {/* Single Registration Form */}
          {activeTab === 'single' && (
            <Card className="registration-card">
              <Card.Header>
                <h5>{t.singleTab}</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSingleSubmit}>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>{t.schoolId} <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          value={school_uni_id || ''}
                          disabled
                          placeholder={t.autoFilled}
                        />
                        <Form.Text className="text-muted">
                          {t.autoFilledSub}
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>{t.fullName} <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="full_name"
                          value={singleForm.full_name}
                          onChange={handleSingleChange}
                          placeholder={t.fullNamePlaceholder}
                          isInvalid={!!singleErrors.full_name}
                        />
                        <Form.Control.Feedback type="invalid">
                          {singleErrors.full_name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>{t.aadhaar} <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="aadhaar_no"
                          value={singleForm.aadhaar_no}
                          onChange={handleSingleChange}
                          placeholder={t.aadhaarPlaceholder}
                          maxLength={12}
                          isInvalid={!!singleErrors.aadhaar_no}
                        />
                        <Form.Control.Feedback type="invalid">
                          {singleErrors.aadhaar_no}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button variant="success" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        {t.registering}
                      </>
                    ) : (
                      <><FaUserPlus className="me-2" />{t.register}</>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}

                  {/* Bulk Registration */}
                  {activeTab === 'bulk' && (
                    <Card className="registration-card">
                      <Card.Header>
                        <h5>{t.bulkTab}</h5>
                      </Card.Header>
                      <Card.Body>
                      <div className="mb-4">
                        <Form.Group className="mb-3">
                          <Form.Label>{t.uploadTitle}</Form.Label>
                          <Form.Control
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            disabled={submittingBulk}
                          />
                          <div className="mt-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={downloadTemplate}
                              className="me-2 template-btn"
                            >
                              Download Template
                            </Button>
                          </div>
                          <Form.Text className="text-muted">
                            {t.uploadNote}
                          </Form.Text>
                          {bulkErrors.length > 0 && (
                            <div className="mt-2 text-danger">
                              {bulkErrors.length} {t.validationErrorMsg}
                            </div>
                          )}
                        </Form.Group>
                      </div>

                      {/* Preview Table */}
                      {previewReady && parsedData.length > 0 && (
                        <div className="mt-4">
                          <h5>{t.previewTitle} ({parsedData.length} {language === 'hi' ? 'छात्र' : 'students'})</h5>
                          <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <Table striped bordered hover responsive className="preview-table">
                              <thead className="table-school">
                                <tr>
                                  <th>#</th>
                                  <th>{t.aadhaar}</th>
                                  <th>{t.fullName}</th>
                                  <th>{language === 'hi' ? 'स्थिति' : 'Status'}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {parsedData.map((row, idx) => {
                                  const rowStatus = rowStatuses.find(s => s.index === idx);
                                  const rowError = bulkErrors.find(e => e.index === idx);
                                  const isExisting = existingStudents.has(row.aadhaar_no);
                                  return (
                                    <tr key={idx}>
                                      <td>{idx + 1}</td>
                                      <td>{row.aadhaar_no}</td>
                                      <td>{row.full_name}</td>
                                      <td>
                                        {submittingBulk ? (
                                          rowStatus ? (
                                            rowStatus.status === 'pending' ? (
                                              <Spinner animation="border" size="sm" variant="primary" />
                                            ) : rowStatus.status === 'success' ? (
                                              <span className="text-success"><FaCheckCircle className="status-icon" /> {rowStatus.message}</span>
                                            ) : rowStatus.status === 'skipped' ? (
                                              <span className="text-warning"><FaExclamationTriangle className="status-icon" /> {rowStatus.message}</span>
                                            ) : (
                                              <span className="text-danger"><FaTimesCircle className="status-icon" /> {rowStatus.message}</span>
                                            )
                                          ) : null
                                        ) : isExisting ? (
                                          <span className="text-warning"><FaExclamationTriangle className="status-icon" /> {language === 'hi' ? 'पहले से पंजीकृत' : 'Already registered'}</span>
                                        ) : rowError ? (
                                          <span className="text-danger"><FaTimesCircle className="status-icon" /> {rowError.message}</span>
                                        ) : (
                                          <span className="text-success"><FaCheckCircle className="status-icon" /> {language === 'hi' ? 'नया' : 'New'}</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </Table>
                          </div>

                          {checkingExisting && (
                            <div className="mt-3">
                              <Spinner animation="border" size="sm" />
                              <span className="ms-2">{t.checkingExisting}</span>
                            </div>
                          )}

                          {!submittingBulk && !checkingExisting && existingStudents.size > 0 && (
                            <div className="mt-3 alert alert-info">
                              <strong>{existingStudents.size} {t.alreadyRegisteredBatch}</strong>
                              <p className="mb-2">{t.onlyNewMsg.replace('{count}', getNewStudents().length)}</p>
                              <Button 
                                variant="success" 
                                onClick={handleRegisterNewOnly}
                                disabled={getNewStudents().length === 0}
                              >
                                {t.registerNewOnly.replace('{count}', getNewStudents().length)}
                              </Button>
                            </div>
                          )}

                          {!submittingBulk && !checkingExisting && existingStudents.size === 0 && (
                            <Button 
                              variant="success" 
                              onClick={handleBulkSubmit}
                              disabled={bulkErrors.length > 0}
                              className="mt-3"
                            >
                              {t.submitAll}
                            </Button>
                          )}

                          {submittingBulk && (
                            <div className="mt-3">
                              <Spinner animation="border" />
                              <span className="ms-2">{t.processingBulk}</span>
                            </div>
                          )}
                        </div>
                      )}
                      </Card.Body>
                    </Card>
                  )}

                  {/* View Students Tab */}
                  {activeTab === 'list' && (
                    <Card className="registration-card">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <h5>{t.studentList} ({totalStudents} {language === 'hi' ? 'कुल' : 'total'})</h5>
                        <div className="d-flex gap-2 align-items-center">
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={downloadStudentsExcel}
                            title="Download Excel"
                            disabled={students.length === 0}
                          >
                            <FaFileExcel className="me-1" /> Excel
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={downloadStudentsPDF}
                            title="Download PDF"
                            disabled={students.length === 0}
                          >
                            <FaFilePdf className="me-1" /> PDF
                          </Button>
                          {selectedIds.length > 0 && (
                            <Button variant="danger" size="sm" onClick={handleDeleteMultiple}>
                              {t.deleteSelected} ({selectedIds.length})
                            </Button>
                          )}
                        </div>
                      </Card.Header>
                      <Card.Body>

                      {studentsLoading ? (
                        <div className="text-center py-4">
                          <Spinner animation="border" />
                          <p className="mt-2">{language === 'hi' ? 'छात्रों को लोड किया जा रहा है...' : 'Loading students...'}</p>
                        </div>
                      ) : students.length === 0 ? (
                        <Alert variant="info">{t.noStudents}</Alert>
                      ) : (
                        <>
                          <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            <Table striped bordered hover responsive className="student-list-table">
                              <thead className="table-school">
                                <tr>
                                  <th>
                                    <Form.Check
                                      type="checkbox"
                                      checked={selectedIds.length === students.length && students.length > 0}
                                      onChange={toggleSelectAll}
                                    />
                                  </th>
                                  <th>#</th>
                                  <th>{t.aadhaar}</th>
                                  <th>{t.fullName}</th>
                                  <th>{t.createdAt}</th>
                                  <th>{language === 'hi' ? 'कार्रवाई' : 'Actions'}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getCurrentPageData().map((student, idx) => (
                                  <tr key={student.id}>
                                    <td>
                                      <Form.Check
                                        type="checkbox"
                                        checked={selectedIds.includes(student.id)}
                                        onChange={() => toggleSelect(student.id)}
                                      />
                                    </td>
                                    <td>{(currentPage - 1) * recordsPerPage + idx + 1}</td>
                                    <td>{student.aadhaar_no ? '******' + student.aadhaar_no.slice(-4) : '-'}</td>
                                    <td>{student.full_name}</td>
                                    <td>{student.created_at ? new Date(student.created_at).toLocaleDateString() : '-'}</td>
                                    <td className="student-list-actions">
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEditClick(student)}
                                      >
                                        {t.edit}
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDeleteClick(student.id)}
                                      >
                                        {t.delete}
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                          {totalPages > 1 && <div className="mt-3">{renderPagination()}</div>}
                        </>
                      )}
                      </Card.Body>
                    </Card>
                  )}
        </Container>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{language === 'hi' ? 'छात्र को संपादित करें' : 'Edit Student'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t.fullName}</Form.Label>
              <Form.Control
                type="text"
                name="full_name"
                value={editForm.full_name}
                onChange={handleEditChange}
                placeholder="Enter full name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t.aadhaar}</Form.Label>
              <Form.Control
                type="text"
                name="aadhaar_no"
                value={editForm.aadhaar_no}
                onChange={handleEditChange}
                placeholder="12-digit Aadhaar"
                maxLength={12}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            {t.cancel}
          </Button>
          <Button variant="primary" onClick={handleEditSubmit} disabled={editLoading}>
            {editLoading ? <Spinner animation="border" size="sm" /> : t.save}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t.confirmDeleteTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deletingMultiple ? (
            <p>{t.deleteMultipleMsg.replace('{count}', selectedIds.length)}</p>
          ) : (
            <p>{t.deleteSingleMsg}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t.cancel}
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleteLoading}>
            {deleteLoading ? <Spinner animation="border" size="sm" /> : t.delete}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StudentRegistration;
