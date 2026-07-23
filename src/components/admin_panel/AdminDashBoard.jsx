import React, { useState, useEffect } from "react";
import { Container, Table, Badge, Spinner, Pagination, Card, Row, Col, Form, Button, Modal } from "react-bootstrap";
import axios from "axios";
import { FaSchool, FaFilePdf, FaFileExcel } from "react-icons/fa"; // Added import
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useAuth } from "../all_login/AuthContext";
import AdminLeftNav from "./AdminLeftNav";
import AdminHeader from "./AdminHeader";
import "../../assets/css/admindashboard.css";

const AdminDashBoard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [quizParticipants, setQuizParticipants] = useState([]);
  const [quizItems, setQuizItems] = useState([]);
   
  // Added state for quiz stats
  const [quizStats, setQuizStats] = useState({
    totalQuizParticipants: 0,
    totalQuizAttempts: 0,
    averageScore: 0,
    passRate: 0,
    totalQuizzes: 0,
    activeQuizzes: 0
  });

  // Added totalQuizParticipants to the stats object
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSchools: 0,
    totalEnrollments: 0,
    totalUniqueCourses: 0,
    totalQuizParticipants: 0
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showQuizTable, setShowQuizTable] = useState(false);
  const [quizSchoolFilter, setQuizSchoolFilter] = useState('');
  const [quizDistrictFilter, setQuizDistrictFilter] = useState('');

  // Added missing states for filters
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState('all');

  // Modal states for student details
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(false);

   // Modal states for quiz participants
   const [selectedQuiz, setSelectedQuiz] = useState(null);
   const [showQuizModal, setShowQuizModal] = useState(false);

   // Modal state for rank participants
   const [selectedRank, setSelectedRank] = useState(null);
   const [showRankModal, setShowRankModal] = useState(false);

   const { accessToken } = useAuth();

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

  useEffect(() => {
    console.log('Access token available:', !!accessToken);
    if (accessToken) {
      fetchData();
    }
  }, [accessToken]);

   const fetchData = async () => {
     if (!accessToken) {
       console.log('No access token, waiting...');
       return;
     }
     
     setLoading(true);
     console.log('Fetching data with token:', accessToken.substring(0, 20) + '...');
     try {
       const [studentsRes, schoolsRes, enrollmentsRes, quizRes, quizItemsRes] = await Promise.all([
         axios.get(
           'https://brjobsedu.com/epathshala/epathshala_backend/api/student-reg/',
           {
             headers: {
               Authorization: `Bearer ${accessToken}`,
             },
           }
         ),
         axios.get(
           'https://brjobsedu.com/epathshala/epathshala_backend/api/school-reg/',
           {
             headers: {
               Authorization: `Bearer ${accessToken}`,
             },
           }
         ),
         axios.get(
           'https://brjobsedu.com/epathshala/epathshala_backend/api/enrollment-unpaid/',
           {
             headers: {
               Authorization: `Bearer ${accessToken}`,
             },
           }
         ),
         axios.get(
           'https://brjobsedu.com/epathshala/epathshala_backend/api/quiz-participants/',
           {
             headers: {
               Authorization: `Bearer ${accessToken}`,
             },
           }
         ),
         axios.get(
           'https://brjobsedu.com/epathshala/epathshala_backend/api/quiz-items/',
           {
             headers: {
               Authorization: `Bearer ${accessToken}`,
             },
           }
         )
       ]);

       console.log('Students Response:', studentsRes.data);
       console.log('Schools Response:', schoolsRes.data);
       console.log('Enrollments Response:', enrollmentsRes.data);
       console.log('Quiz Response:', quizRes.data);
       console.log('Quiz Items Response:', quizItemsRes.data);


      let studentData = [];
      if (studentsRes.data && studentsRes.data.data) {
        studentData = studentsRes.data.data;
      } else if (studentsRes.data && Array.isArray(studentsRes.data)) {
        studentData = studentsRes.data;
      }
      
      let schoolData = [];
      if (schoolsRes.data && schoolsRes.data.data) {
        schoolData = schoolsRes.data.data;
      } else if (schoolsRes.data && Array.isArray(schoolsRes.data)) {
        schoolData = schoolsRes.data;
      }
      
      let enrollmentData = [];
      if (enrollmentsRes.data && enrollmentsRes.data.data) {
        enrollmentData = enrollmentsRes.data.data;
      } else if (enrollmentsRes.data && Array.isArray(enrollmentsRes.data)) {
        enrollmentData = enrollmentsRes.data;
      }

       let quizData = [];
       if (quizRes.data && quizRes.data.data) {
         quizData = quizRes.data.data;
       } else if (quizRes.data && Array.isArray(quizRes.data)) {
         quizData = quizRes.data;
       }

       let quizItemsData = [];
       if (quizItemsRes.data && quizItemsRes.data.data) {
         quizItemsData = quizItemsRes.data.data;
       } else if (quizItemsRes.data && Array.isArray(quizItemsRes.data)) {
         quizItemsData = quizItemsRes.data;
       }

       setStudents(studentData);
       setSchools(schoolData);
       setEnrollments(enrollmentData);
       setQuizParticipants(quizData);
       setQuizItems(quizItemsData);
       
       // Calculate quiz statistics
       const totalQuizParticipants = quizData.length;
       const totalQuizAttempts = quizData.reduce((sum, item) => sum + (item.attempt?.length || 0), 0);
       const totalScore = quizData.reduce((sum, item) => 
         sum + (item.attempt?.reduce((attemptSum, attempt) => attemptSum + (attempt.score || 0), 0) || 0), 0
       );
       const averageScore = totalQuizAttempts > 0 ? (totalScore / totalQuizAttempts).toFixed(1) : 0;
       const passRate = totalQuizParticipants > 0 
         ? ((quizData.filter(item => 
             item.attempt?.some(attempt => attempt.status === 'passed')
           ).length / totalQuizParticipants) * 100
         ).toFixed(1) : 0;
       
       const totalQuizzes = quizItemsData.length;
       const activeQuizzes = quizItemsData.filter(q => q.is_active).length;
       
       setQuizStats({
         totalQuizParticipants,
         totalQuizAttempts,
         averageScore,
         passRate,
         totalQuizzes,
         activeQuizzes
       });
       
       // Update general stats to include quiz participants
       setStats({
         totalStudents: studentData.length,
         totalSchools: schoolData.length,
         totalEnrollments: enrollmentData.length,
         totalUniqueCourses: new Set(enrollmentData.map(e => e.course_id)).size,
         totalQuizParticipants: totalQuizParticipants // Properly setting the count here
       });
    } catch (err) {
      console.error("Error fetching data:", err);
      console.error("Error response:", err.response);
      console.error("Error status:", err.response?.status);
      setStudents([]);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetail = (studentId) => {
    const student = students.find(s => s.student_id === studentId);
    if (student) {
      setSelectedStudent(student);
      setShowStudentModal(true);
    } else {
      alert('Student details not found');
    }
  };

  const getStudentQuizHistory = () => {
    if (!selectedStudent) return [];
    return quizParticipants.filter(p => p.student?.student_id === selectedStudent.student_id);
  };

  const getQuizParticipants = (quizId) => {
    return quizParticipants.filter(p => p.quiz_id === quizId);
  };

  const openQuizModal = (quizId) => {
    setSelectedQuiz(quizId);
    setShowQuizModal(true);
  };

  const openRankModal = (rank) => {
    setSelectedRank(rank);
    setShowRankModal(true);
  };

  const openRankRangeModal = (rangeLabel, minRank, maxRank) => {
    setSelectedRank({ rangeLabel, minRank, maxRank });
    setShowRankModal(true);
  };

  const closeRankModal = () => {
    setShowRankModal(false);
    setSelectedRank(null);
  };

  const getStudentsWithRank = (rankOrRange) => {
    if (typeof rankOrRange === 'object') {
      const { minRank, maxRank } = rankOrRange;
      return quizParticipants.filter(p =>
        p.attempt?.some(attempt => {
          const r = attempt.rank;
          if (minRank !== undefined && maxRank !== undefined) return r >= minRank && r <= maxRank;
          if (maxRank !== undefined && minRank === undefined) return r <= maxRank;
          if (minRank !== undefined && maxRank === undefined) return r >= minRank;
          return false;
        })
      );
    }
    return quizParticipants.filter(p =>
      p.attempt?.some(attempt => attempt.rank === rankOrRange)
    );
  };

  const getAllQuizAttempts = () => {
    return quizParticipants;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleStatusChange = async (schoolId, newStatus) => {
    if (!accessToken) {
      alert('Authentication token not available');
      return;
    }

    try {
      await axios.put(
        'https://brjobsedu.com/epathshala/epathshala_backend/api/school-reg/',
        {
          school_uni_id: schoolId,
          status: newStatus
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSchools(prevSchools =>
        prevSchools.map(school =>
          school.school_uni_id === schoolId ? { ...school, status: newStatus } : school
        )
      );

      setStats(prevStats => ({
        ...prevStats,
        totalSchools: schools.length
      }));
    } catch (err) {
      console.error("Error updating school status:", err);
      alert('Failed to update school status');
    }
  };

  const renderQuizChart = () => {
    const districts = ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar",
      "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal",
      "Udham Singh Nagar", "Uttarkashi"];
    
    const districtQuizData = districts.map(district => {
      const participants = quizParticipants.filter(p => p.student?.district === district).length;
      const attempts = quizParticipants
        .filter(p => p.student?.district === district)
        .reduce((sum, p) => sum + (p.attempt?.length || 0), 0);
      return { district, participants, attempts };
    });
    
    const maxParticipants = Math.max(...districtQuizData.map(d => d.participants), 1);
    
    const quizColors = {
      students: '#4361ee',
      schools: '#2ecc71', 
      enrollments: '#f39c12',
      uniqueCourses: '#e84393',
      quiz: '#7209b7'
    };
    
    return (
      <Card className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
        <Card.Body className="p-4">
          <h5 className="mb-4 fw-bold text-dark d-flex align-items-center">
            <i className="bi bi-question-diamond me-2" style={{ color: quizColors.quiz }}></i>
            Quiz Participants Distribution by District
          </h5>
          <div className="district-chart-outer" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ minWidth: '950px', height: '340px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '20px 10px 70px 10px' }}>
              {districtQuizData.map((item, index) => {
                const barHeight = (item.participants / maxParticipants) * 220;
                const tooltipText = `${item.district}: ${item.participants} participants, ${item.attempts} Total Participation`;
                
                return (
                  <div key={index} className="flex-grow-1 d-flex flex-column align-items-center position-relative" style={{ width: '0' }}>
                    <div className="fw-bold mb-1" style={{ fontSize: '12px', color: quizColors.quiz, opacity: item.participants > 0 ? 1 : 0.3 }}>
                      {item.participants}
                    </div>
                    <div className="district-bar" 
                      style={{ 
                        height: `${barHeight}px`, 
                        width: '100%', 
                        maxWidth: '40px', 
                        background: `linear-gradient(to top, ${quizColors.quiz}, ${quizColors.quiz}aa)`,
                        borderRadius: '8px 8px 0 0',
                        transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        boxShadow: '0 4px 15px rgba(114, 9, 183, 0.1)'
                      }}
                      title={tooltipText}
                    ></div>
                    <div className="position-absolute text-center text-truncate" 
                      style={{ 
                        bottom: '-60px', 
                        width: '130px', 
                        fontSize: '11px', 
                        fontWeight: '700',
                        transform: 'rotate(-30deg)',
                        transformOrigin: 'top center',
                        color: '#555',
                        letterSpacing: '0.2px'
                      }}
                    >
                      {item.district}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const renderRankDistributionChart = () => {
     const allRanks = quizParticipants.flatMap(p => 
       p.attempt?.map(a => a.rank).filter(r => r && r > 0) || []
     ).sort((a, b) => a - b);

     if (allRanks.length === 0) {
       return (
         <Card className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
           <Card.Body className="p-4 text-center text-muted">
             <i className="bi bi-graph-up fs-1 mb-2 d-block"></i>
             <p className="mb-0">No rank data available</p>
           </Card.Body>
         </Card>
       );
     }
    
     const minRank = Math.min(...allRanks);
     const maxRank = Math.max(...allRanks);
     const totalParticipants = allRanks.length;

     const rankRanges = [
       { label: 'Top 10', max: 10, color: '#2ecc71' },
       { label: '11-50', min: 11, max: 50, color: '#3498db' },
       { label: '51-100', min: 51, max: 100, color: '#f39c12' },
       { label: '100+', min: 100, color: '#e74c3c' }
     ];

     const rankDistribution = rankRanges.map(range => {
       const count = allRanks.filter(r => {
         if (range.max && !range.min) return r <= range.max;
         if (range.min && range.max) return r >= range.min && r <= range.max;
         if (range.min && !range.max) return r >= range.min;
         return false;
       }).length;
       const percentage = totalParticipants > 0 ? ((count / totalParticipants) * 100).toFixed(1) : 0;
       return { ...range, count, percentage };
     });

     const maxCount = Math.max(...rankDistribution.map(r => r.count), 1);

     return (
       <Card className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
         <Card.Body className="p-4">
           <h5 className="mb-4 fw-bold text-dark d-flex align-items-center">
             <i className="bi bi-trophy me-2" style={{ color: '#f39c12' }}></i>
             Rank Distribution Across All Quiz Attempts
           </h5>
             <Row className="mb-3">
               <Col md={3} sm={6}>
                 <div
                   className="text-center p-3 bg-light rounded-3 clickable-rank-card"
                   onClick={() => openRankModal(minRank)}
                   style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                   title="Click to view students with best rank"
                 >
                   <div className="h4 fw-bold text-primary">{minRank}</div>
                   <div className="text-muted small">Best Rank</div>
                 </div>
               </Col>
               <Col md={3} sm={6}>
                 <div
                   className="text-center p-3 bg-light rounded-3 clickable-rank-card"
                   onClick={() => openRankModal(maxRank)}
                   style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                   title="Click to view students with lowest rank"
                 >
                   <div className="h4 fw-bold text-primary">{maxRank}</div>
                   <div className="text-muted small">Lowest Rank</div>
                 </div>
               </Col>
               <Col md={3} sm={6}>
                 <div
                   className="text-center p-3 bg-light rounded-3 clickable-rank-card"
                   onClick={() => {
                     // Show all quiz attempts/participants
                     setSelectedRank('all-attempts');
                     setShowRankModal(true);
                   }}
                   style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                   title="Click to view all quiz attempts"
                 >
                   <div className="h4 fw-bold text-primary">{totalParticipants}</div>
                   <div className="text-muted small">Total Participation</div>
                 </div>
               </Col>
               <Col md={3} sm={6}>
                 <div
                   className="text-center p-3 bg-light rounded-3 clickable-rank-card"
                   onClick={() => {
                     // Show students around average rank (avg ± 10)
                     const avg = totalParticipants > 0 ? allRanks.reduce((a, b) => a + b, 0) / totalParticipants : 0;
                     const avgRounded = Math.round(avg);
                     openRankRangeModal(`Avg (${avgRounded-10}–${avgRounded+10})`, avgRounded - 10, avgRounded + 10);
                   }}
                   style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                   title="Click to view students around average rank"
                 >
                   <div className="h4 fw-bold text-primary">{((totalParticipants > 0 ? allRanks.reduce((a, b) => a + b, 0) / totalParticipants : 0)).toFixed(1)}</div>
                   <div className="text-muted small">Avg Rank</div>
                 </div>
               </Col>
             </Row>
           <div className="district-chart-outer" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ minWidth: '700px', height: '320px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '40px 20px 60px 20px' }}>
                {rankDistribution.map((item, index) => {
                  const barHeight = (item.count / maxCount) * 200;

                  // Get tooltip content showing top students with quiz IDs
                  const participantsInRange = quizParticipants.filter(p =>
                    p.attempt?.some(att => {
                      const r = att.rank;
                      if (item.min && item.max) return r >= item.min && r <= item.max;
                      if (item.max && !item.min) return r <= item.max;
                      if (item.min && !item.max) return r >= item.min;
                      return false;
                    })
                  );

                  const tooltipLines = participantsInRange.slice(0, 5).map(p => {
                    const bestRank = p.attempt?.reduce((best, curr) =>
                      curr.rank && curr.rank > 0 && (!best || curr.rank < best) ? curr.rank : best, null
                    );
                    return `${p.student?.full_name || 'Unknown'} - ${p.quiz_id} (Rank: ${bestRank || 'N/A'})`;
                  });

                  if (participantsInRange.length > 5) {
                    tooltipLines.push(`...and ${participantsInRange.length - 5} more`);
                  }

                  const tooltipText = tooltipLines.length > 0 ? tooltipLines.join('\n') : `${item.label}: ${item.count} attempts`;

                  return (
                    <div key={index} className="flex-grow-1 d-flex flex-column align-items-center position-relative" style={{ width: '0' }}>
                      <div
                        className="fw-bold mb-1 clickable-rank-count"
                        style={{
                          fontSize: '12px',
                          color: item.color,
                          opacity: item.count > 0 ? 1 : 0.3,
                          cursor: 'pointer',
                          transition: 'transform 0.2s'
                        }}
                        onClick={() => {
                          if (item.count > 0) {
                            openRankRangeModal(item.label, item.min, item.max);
                          }
                        }}
                        title={`Click to view all ${item.label} rank holders`}
                      >
                        {item.count}
                      </div>
                      <div
                        className="district-bar"
                        style={{
                          height: `${barHeight}px`,
                          width: '100%',
                          maxWidth: '80px',
                          background: `linear-gradient(to top, ${item.color}, ${item.color}aa)`,
                          borderRadius: '8px 8px 0 0',
                          transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          boxShadow: `0 4px 15px ${item.color}30`,
                          cursor: 'pointer'
                        }}
                        title={tooltipText}
                      ></div>
                     <div className="position-absolute text-center text-truncate fw-bold" 
                       style={{ 
                         bottom: '-50px', 
                         width: '80px', 
                         fontSize: '11px',
                         color: '#333',
                         letterSpacing: '0.2px'
                       }}>
                       {item.label}
                     </div>
                     <div className="position-absolute text-center small" 
                       style={{ 
                         top: '-20px', 
                         width: '80px',
                         fontSize: '10px',
                         color: '#666'
                       }}>
                       {item.percentage}%
       </div>

        <Modal
          show={showStudentModal}
          onHide={() => setShowStudentModal(false)}
          centered
          size="md"
          contentClassName="student-detail-modal"
          backdropClassName="modal-backdrop-custom"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="bi bi-person-circle me-2"></i>
              Student Details
            </Modal.Title>
          </Modal.Header>
         <Modal.Body>
           {loadingStudent ? (
             <div className="text-center p-4">
               <Spinner animation="border" variant="primary" />
               <p className="mt-2">Loading student details...</p>
             </div>
            ) : selectedStudent ? (
              <div>
                <div className="mb-4">
                  <h6 className="modal-section-title">Personal Information</h6>
                  <div className="student-info-row">
                    <div className="d-flex">
                      <span className="student-info-label" style={{width: '140px'}}>Student ID:</span>
                      <span className="student-info-value">{selectedStudent.student_id || '-'}</span>
                    </div>
                  </div>
                  <div className="student-info-row">
                    <div className="d-flex">
                      <span className="student-info-label" style={{width: '140px'}}>Full Name:</span>
                      <span className="student-info-value">{selectedStudent.full_name || '-'}</span>
                    </div>
                  </div>
                  <div className="student-info-row">
                    <div className="d-flex">
                      <span className="student-info-label" style={{width: '140px'}}>Email:</span>
                      <span className="student-info-value">{selectedStudent.email || '-'}</span>
                    </div>
                  </div>
                  <div className="student-info-row">
                    <div className="d-flex">
                      <span className="student-info-label" style={{width: '140px'}}>Phone:</span>
                      <span className="student-info-value">{selectedStudent.phone || '-'}</span>
                    </div>
                  </div>
                  <div className="student-info-row">
                    <div className="d-flex">
                      <span className="student-info-label" style={{width: '140px'}}>District:</span>
                      <span className="student-info-value">{selectedStudent.district || '-'}</span>
                    </div>
                  </div>
                  <div className="student-info-row">
                    <div className="d-flex">
                      <span className="student-info-label" style={{width: '140px'}}>School Name:</span>
                      <span className="student-info-value">{selectedStudent.school_name || '-'}</span>
                    </div>
                  </div>
                  <div className="student-info-row">
                    <div className="d-flex">
                      <span className="student-info-label" style={{width: '140px'}}>School ID:</span>
                      <span className="student-info-value">{selectedStudent.school_uni_id || '-'}</span>
                    </div>
                  </div>
                  <div className="student-info-row">
                    <div className="d-flex">
                      <span className="student-info-label" style={{width: '140px'}}>Aadhaar No:</span>
                      <span className="student-info-value">{selectedStudent.aadhaar_no ? `****${selectedStudent.aadhaar_no.slice(-4)}` : '-'}</span>
                    </div>
                  </div>
                  <div className="student-info-row">
                    <div className="d-flex">
                      <span className="student-info-label" style={{width: '140px'}}>Class:</span>
                      <span className="student-info-value">{selectedStudent.class_name || '-'}</span>
                    </div>
                  </div>
                  <div className="student-info-row">
                    <div className="d-flex">
                      <span className="student-info-label" style={{width: '140px'}}>Status:</span>
                      <span className="student-info-value">
                        <Badge bg={selectedStudent.status === "approved" ? "success" : selectedStudent.status === "rejected" ? "danger" : "warning"}>
                          {selectedStudent.status || "pending"}
                        </Badge>
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h6 className="modal-section-title">Quiz Participation History</h6>
                  {getStudentQuizHistory().length > 0 ? (
                    <div className="table-responsive quiz-history-table">
                      <Table striped bordered hover size="sm">
                        <thead>
                          <tr>
                            <th>Quiz ID</th>
                            <th>Attempts</th>
                            <th>Best Score</th>
                            <th>Best Rank</th>
                            <th>Last Attempt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getStudentQuizHistory().map((quizParticipant, index) => {
                            const bestAttempt = quizParticipant.attempt?.reduce((best, curr) =>
                              (curr.score || 0) > (best.score || 0) ? curr : best,
                              quizParticipant.attempt?.[0] || {}
                            );
                            const bestRank = quizParticipant.attempt?.reduce((best, curr) =>
                              curr.rank && curr.rank > 0 && (!best || curr.rank < best) ? curr.rank : best,
                              null
                            );
                            const lastAttempt = quizParticipant.attempt?.[quizParticipant.attempt.length - 1];
                            const percentage = bestAttempt?.total_questions
                              ? ((bestAttempt.score / bestAttempt.total_questions) * 100).toFixed(1)
                              : 0;

                            return (
                              <tr key={index}>
                                <td><Badge bg="info">{quizParticipant.quiz_id}</Badge></td>
                                <td>{quizParticipant.attempt?.length || 0}</td>
                                <td>
                                  <Badge bg={
                                    percentage >= 90 ? 'success' :
                                    percentage >= 75 ? 'primary' :
                                    percentage >= 60 ? 'info' : 'warning'
                                  }>
                                    {bestAttempt?.score || 0}/{bestAttempt?.total_questions || 0}
                                    {percentage > 0 && ` (${percentage}%)`}
                                  </Badge>
                                </td>
                                <td>
                                  {bestRank ? (
                                    <Badge bg={bestRank <= 10 ? 'success' : bestRank <= 50 ? 'primary' : bestRank <= 100 ? 'warning' : 'danger'}>
                                      #{bestRank}
                                    </Badge>
                                  ) : '-'}
                                </td>
                                <td className="small">
                                  {lastAttempt?.submitted_at
                                    ? new Date(lastAttempt.submitted_at).toLocaleString()
                                    : '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-center text-muted">No quiz participation history found</p>
                  )}
                </div>
              </div>
            ) : (
             <p className="text-center text-muted">No student data available</p>
           )}
         </Modal.Body>
         <Modal.Footer>
           <Button variant="secondary" onClick={() => setShowStudentModal(false)}>
             Close
           </Button>
          </Modal.Footer>
        </Modal>

         <Modal
           show={showQuizModal}
           onHide={() => setShowQuizModal(false)}
           centered
           size="md"
           contentClassName="quiz-participants-modal"
           backdropClassName="modal-backdrop-custom"
         >
           <Modal.Header closeButton>
             <Modal.Title>
               <i className="bi bi-people-fill me-2"></i>
               Quiz Participants - {selectedQuiz}
               <span className="ms-2 badge bg-secondary">
                 {getQuizParticipants(selectedQuiz).length} participant(s)
               </span>
             </Modal.Title>
           </Modal.Header>
          <Modal.Body>
            {getQuizParticipants(selectedQuiz).length > 0 ? (
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student Name</th>
                      <th>District</th>
                      <th>School</th>
                      <th>Attempts</th>
                      <th>Best Score</th>
                      <th>Best Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getQuizParticipants(selectedQuiz).map((participant, index) => {
                      const bestAttempt = participant.attempt?.reduce((best, curr) =>
                        (curr.score || 0) > (best.score || 0) ? curr : best,
                        participant.attempt?.[0] || {}
                      );
                      const bestRank = participant.attempt?.reduce((best, curr) =>
                        curr.rank && curr.rank > 0 && (!best || curr.rank < best) ? curr.rank : best,
                        null
                      );
                      const percentage = bestAttempt?.total_questions
                        ? ((bestAttempt.score / bestAttempt.total_questions) * 100).toFixed(1)
                        : 0;

                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className="fw-bold">{participant.student?.full_name || '-'}</td>
                          <td>{participant.student?.district || '-'}</td>
                          <td>{participant.student?.school_name || '-'}</td>
                          <td>{participant.attempt?.length || 0}</td>
                          <td>
                            <Badge bg={
                              percentage >= 90 ? 'success' :
                              percentage >= 75 ? 'primary' :
                              percentage >= 60 ? 'info' : 'warning'
                            }>
                              {bestAttempt?.score || 0}/{bestAttempt?.total_questions || 0}
                              {percentage > 0 && ` (${percentage}%)`}
                            </Badge>
                          </td>
                          <td>
                            {bestRank ? (
                              <Badge bg={bestRank <= 10 ? 'success' : bestRank <= 50 ? 'primary' : bestRank <= 100 ? 'warning' : 'danger'}>
                                #{bestRank}
                              </Badge>
                            ) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted">No participants found for this quiz</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowQuizModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
                 );
               })}
             </div>
           </div>
         </Card.Body>
       </Card>
     );
   };
  
  const renderQuizItemsRankDistribution = () => {
    // Get all quiz attempts with ranks from quizParticipants
    const allRanks = quizParticipants.flatMap(p => 
      p.attempt?.map(a => ({ 
        rank: a.rank, 
        quiz_id: p.quiz_id,
        student_name: p.student?.full_name,
        score: a.score,
        total_questions: a.total_questions
      })).filter(a => a.rank && a.rank > 0) || []
    ).sort((a, b) => a.rank - b.rank);

    if (allRanks.length === 0) {
      return (
        <Card className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
          <Card.Body className="p-4 text-center text-muted">
            <i className="bi bi-graph-up fs-1 mb-2 d-block"></i>
            <p className="mb-0">No rank data available for quizzes</p>
          </Card.Body>
        </Card>
      );
    }

    const minRank = Math.min(...allRanks.map(a => a.rank));
    const maxRank = Math.max(...allRanks.map(a => a.rank));
    const totalAttempts = allRanks.length;

    const rankRanges = [
      { label: 'Top 10', max: 10, color: '#2ecc71' },
      { label: '11-50', min: 11, max: 50, color: '#3498db' },
      { label: '51-100', min: 51, max: 100, color: '#f39c12' },
      { label: '100+', min: 100, color: '#e74c3c' }
    ];

    const rankDistribution = rankRanges.map(range => {
      const count = allRanks.filter(a => {
        if (range.max && !range.min) return a.rank <= range.max;
        if (range.min && range.max) return a.rank >= range.min && a.rank <= range.max;
        if (range.min && !range.max) return a.rank >= range.min;
        return false;
      }).length;
      const percentage = totalAttempts > 0 ? ((count / totalAttempts) * 100).toFixed(1) : 0;
      return { ...range, count, percentage };
    });

    const maxCount = Math.max(...rankDistribution.map(r => r.count), 1);

    return (
      <Card className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
        <Card.Body className="p-4">
          <h5 className="mb-4 fw-bold text-dark d-flex align-items-center">
            <i className="bi bi-trophy me-2" style={{ color: '#f39c12' }}></i>
            Rank Distribution Across All Quizzes
          </h5>
            <Row className="mb-3">
              <Col md={3} sm={6}>
                <div
                  className="text-center p-3 bg-light rounded-3 clickable-rank-card"
                  onClick={() => openRankModal(minRank)}
                  style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  title="Click to view students with best rank"
                >
                  <div className="h4 fw-bold text-primary">{minRank}</div>
                  <div className="text-muted small">Best Rank</div>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div
                  className="text-center p-3 bg-light rounded-3 clickable-rank-card"
                  onClick={() => openRankModal(maxRank)}
                  style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  title="Click to view students with lowest rank"
                >
                  <div className="h4 fw-bold text-primary">{maxRank}</div>
                  <div className="text-muted small">Lowest Rank</div>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div
                  className="text-center p-3 bg-light rounded-3 clickable-rank-card"
                  onClick={() => {
                    setSelectedRank('all-attempts');
                    setShowRankModal(true);
                  }}
                  style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  title="Click to view all quiz attempts"
                >
                  <div className="h4 fw-bold text-primary">{totalAttempts}</div>
                  <div className="text-muted small">Total Participation</div>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div
                  className="text-center p-3 bg-light rounded-3 clickable-rank-card"
                  onClick={() => {
                    const avg = totalAttempts > 0 ? allRanks.reduce((a, b) => a + b.rank, 0) / totalAttempts : 0;
                    const avgRounded = Math.round(avg);
                    openRankRangeModal(`Avg (${avgRounded-10}–${avgRounded+10})`, avgRounded - 10, avgRounded + 10);
                  }}
                  style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  title="Click to view students around average rank"
                >
                  <div className="h4 fw-bold text-primary">{((totalAttempts > 0 ? allRanks.reduce((a, b) => a + b.rank, 0) / totalAttempts : 0)).toFixed(1)}</div>
                  <div className="text-muted small">Avg Rank</div>
                </div>
              </Col>
            </Row>
          <div className="district-chart-outer" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
             <div style={{ minWidth: '700px', height: '320px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '40px 20px 60px 20px' }}>
               {rankDistribution.map((item, index) => {
                 const barHeight = (item.count / maxCount) * 200;

                 // Get tooltip content showing top students with quiz IDs
                 const participantsInRange = allRanks.filter(a => {
                   if (item.min && item.max) return a.rank >= item.min && a.rank <= item.max;
                   if (item.max && !item.min) return a.rank <= item.max;
                   if (item.min && !item.max) return a.rank >= item.min;
                   return false;
                 });

                 const tooltipLines = participantsInRange.slice(0, 5).map(a => {
                   return `${a.student_name || 'Unknown'} - ${a.quiz_id} (Rank: ${a.rank}, Score: ${a.score}/${a.total_questions})`;
                 });

                 if (participantsInRange.length > 5) {
                   tooltipLines.push(`...and ${participantsInRange.length - 5} more`);
                 }

                 const tooltipText = tooltipLines.length > 0 ? tooltipLines.join('\n') : `${item.label}: ${item.count} attempts`;

                 return (
                   <div key={index} className="flex-grow-1 d-flex flex-column align-items-center position-relative" style={{ width: '0' }}>
                     <div
                       className="fw-bold mb-1 clickable-rank-count"
                       style={{
                         fontSize: '12px',
                         color: item.color,
                         opacity: item.count > 0 ? 1 : 0.3,
                         cursor: 'pointer',
                         transition: 'transform 0.2s'
                       }}
                       onClick={() => {
                         if (item.count > 0) {
                           openRankRangeModal(item.label, item.min, item.max);
                         }
                       }}
                       title={`Click to view all ${item.label} rank holders`}
                     >
                       {item.count}
                     </div>
                     <div
                       className="district-bar"
                       style={{
                         height: `${barHeight}px`,
                         width: '100%',
                         maxWidth: '80px',
                         background: `linear-gradient(to top, ${item.color}, ${item.color}aa)`,
                         borderRadius: '8px 8px 0 0',
                         transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                         position: 'relative',
                         boxShadow: `0 4px 15px ${item.color}30`,
                         cursor: 'pointer'
                       }}
                       title={tooltipText}
                     ></div>
                    <div className="position-absolute text-center text-truncate fw-bold" 
                      style={{ 
                        bottom: '-50px', 
                        width: '80px', 
                        fontSize: '11px',
                        color: '#333',
                        letterSpacing: '0.2px'
                      }}>
                      {item.label}
                    </div>
                    <div className="position-absolute text-center small" 
                      style={{ 
                        top: '-20px', 
                        width: '80px',
                        fontSize: '10px',
                        color: '#666'
                      }}>
                      {item.percentage}%
        </div>
  
                   </div>
                 );
               })}
             </div>
           </div>
        </Card.Body>
      </Card>
    );
  };
  
  const exportToPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      let title = "";
      let headers = [];
      let data = [];

      if (activeTab === 'students') {
        title = "Student List Report";
        headers = [['#', 'Student ID', 'Name', 'Aadhaar', 'Phone', 'Email', 'Class', 'School', 'District', 'Status']];
        data = students.map((s, i) => [
          i + 1,
          s.student_id || '-',
          s.full_name || '-',
          s.aadhaar_no ? `****${s.aadhaar_no.slice(-4)}` : '-',
          s.phone || '-',
          s.email || '-',
          s.class_name || '-',
          s.school_name || '-',
          s.district || '-',
          s.status || 'pending'
        ]);
      } else if (activeTab === 'schools') {
        title = "School List Report";
        headers = [['#', 'School ID', 'School Name', 'District', 'State', 'Status']];
        data = schools.map((s, i) => [
          i + 1,
          s.school_uni_id || '-',
          s.school_name || '-',
          s.district || '-',
          s.state || 'Uttarakhand',
          s.status || 'pending'
        ]);
      } else if (activeTab === 'enrollments') {
        title = "Enrollment List Report";
        headers = [['#', 'Student ID', 'Student Name', 'School Name', 'Class', 'Course ID', 'Course Name', 'Enrolled At', 'Status']];
        data = enrollments.map((e, i) => [
          i + 1,
          e.student_id || '-',
          e.student_name || '-',
          e.school_name || '-',
          e.class_name || '-',
          e.course_id || '-',
          e.course_name || '-',
          e.enrolled_at ? new Date(e.enrolled_at).toLocaleString() : '-',
          e.is_completed ? 'Completed' : 'Ongoing'
        ]);
       } else if (activeTab === 'quiz-participants') {
         title = "Quiz Participants Report";
         headers = [['#', 'Student', 'District', 'School', 'Quiz ID', 'Participants', 'Attempts', 'Best Score', 'Best Rank']];
         const filteredQuizData = quizParticipants.filter(p => {
           const matchSchool = !quizSchoolFilter || (p.student?.school_name || '').toLowerCase().includes(quizSchoolFilter.toLowerCase());
           const matchDistrict = !quizDistrictFilter || (p.student?.district || '').toLowerCase().includes(quizDistrictFilter.toLowerCase());
           return matchSchool && matchDistrict;
         });
         data = filteredQuizData.map((p, i) => {
           const bestAttempt = p.attempt?.reduce((best, curr) => (curr.score || 0) > (best.score || 0) ? curr : best, p.attempt?.[0] || {});
           const bestRank = p.attempt?.reduce((best, curr) => curr.rank && curr.rank > 0 && (!best || curr.rank < best) ? curr.rank : best, null);
           const percentage = bestAttempt?.total_questions ? ((bestAttempt.score / bestAttempt.total_questions) * 100).toFixed(1) : 0;
           return [
             i + 1,
             p.student?.full_name || '-',
             p.student?.district || '-',
             p.student?.school_name || '-',
             p.quiz_id || '-',
             quizParticipants.filter(qp => qp.quiz_id === p.quiz_id).length,
             p.attempt?.length || 0,
             `${bestAttempt?.score || 0}/${bestAttempt?.total_questions || 0} (${percentage}%)`,
             bestRank ? `#${bestRank}` : '-'
           ];
         });
       } else if (activeTab === 'quiz-items') {
         title = "Quiz Items Report";
         headers = [['#', 'Quiz ID', 'Title', 'Category', 'Questions', 'Status', 'Start Date', 'End Date']];
         data = quizItems.map((q, i) => [
           i + 1,
           q.quiz_id || '-',
           q.title || '-',
           q.quiz_category || '-',
           q.number_of_questions || 0,
           q.is_active ? 'Active' : 'Inactive',
           q.start_date_time ? new Date(q.start_date_time).toLocaleDateString() : '-',
           q.end_date_time ? new Date(q.end_date_time).toLocaleDateString() : '-'
         ]);
       }

      doc.setFontSize(14);
      doc.text(title, 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
      autoTable(doc, { 
        startY: 28, 
        head: headers, 
        body: data, 
        theme: 'grid', 
        styles: { fontSize: 8 }, 
        headStyles: { fillColor: [67, 97, 238], textColor: 255 } 
      });
      doc.save(`${activeTab || 'admin'}-report.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("Failed to generate PDF. Check console for details.");
    }
  };

  const exportToExcel = () => {
    try {
      let title = "";
      let data = [];
      if (activeTab === 'students') {
        title = "Student_List";
        data = students.map((s, i) => ({ '#': i + 1, 'Student ID': s.student_id || '-', 'Name': s.full_name || '-', 'Aadhaar': s.aadhaar_no ? `****${s.aadhaar_no.slice(-4)}` : '-', 'Phone': s.phone || '-', 'Email': s.email || '-', 'Class': s.class_name || '-', 'School': s.school_name || '-', 'District': s.district || '-', 'Status': s.status || 'pending' }));
      } else if (activeTab === 'schools') {
        title = "School_List";
        data = schools.map((s, i) => ({ '#': i + 1, 'School ID': s.school_uni_id || '-', 'School Name': s.school_name || '-', 'District': s.district || '-', 'State': s.state || 'Uttarakhand', 'Status': s.status || 'pending' }));
      } else if (activeTab === 'enrollments') {
        title = "Enrollment_List";
        data = enrollments.map((e, i) => ({ '#': i + 1, 'Student ID': e.student_id || '-', 'Student Name': e.student_name || '-', 'School Name': e.school_name || '-', 'Class': e.class_name || '-', 'Course ID': e.course_id || '-', 'Course Name': e.course_name || '-', 'Enrolled At': e.enrolled_at ? new Date(e.enrolled_at).toLocaleString() : '-', 'Status': e.is_completed ? 'Completed' : 'Ongoing' }));
      } else if (activeTab === 'quiz-participants') {
        title = "Quiz_Participants";
        const filteredQuizData = quizParticipants.filter(p => {
          const matchSchool = !quizSchoolFilter || (p.student?.school_name || '').toLowerCase().includes(quizSchoolFilter.toLowerCase());
          const matchDistrict = !quizDistrictFilter || (p.student?.district || '').toLowerCase().includes(quizDistrictFilter.toLowerCase());
          return matchSchool && matchDistrict;
        });
        data = filteredQuizData.map((p, i) => {
          const bestAttempt = p.attempt?.reduce((best, curr) => (curr.score || 0) > (best.score || 0) ? curr : best, p.attempt?.[0] || {});
          const bestRank = p.attempt?.reduce((best, curr) => curr.rank && curr.rank > 0 && (!best || curr.rank < best) ? curr.rank : best, null);
          const percentage = bestAttempt?.total_questions ? ((bestAttempt.score / bestAttempt.total_questions) * 100).toFixed(1) : 0;
          return { '#': i + 1, 'Student': p.student?.full_name || '-', 'District': p.student?.district || '-', 'School': p.student?.school_name || '-', 'Quiz ID': p.quiz_id || '-', 'Participants': quizParticipants.filter(qp => qp.quiz_id === p.quiz_id).length, 'Attempts': p.attempt?.length || 0, 'Best Score': `${bestAttempt?.score || 0}/${bestAttempt?.total_questions || 0} (${percentage}%)`, 'Best Rank': bestRank ? `#${bestRank}` : '-' };
        });
      }
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, title);
      XLSX.writeFile(wb, `${title}.xlsx`);
    } catch (error) {
      console.error("Excel Export failed:", error);
    }
  };

   const renderQuizTable = () => {
      const filteredQuizData = quizParticipants.filter(p => {
        const matchSchool = !quizSchoolFilter || 
          (p.student?.school_name || '').toLowerCase().includes(quizSchoolFilter.toLowerCase());
        const matchDistrict = !quizDistrictFilter || 
          (p.student?.district || '').toLowerCase().includes(quizDistrictFilter.toLowerCase());
        return matchSchool && matchDistrict;
      });
 
      const uniqueSchools = [...new Set(quizParticipants.map(p => p.student?.school_name).filter(Boolean))];
      const uniqueDistricts = [...new Set(quizParticipants.map(p => p.student?.district).filter(Boolean))];
 
      return (
        <Card className="table-card">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Quiz Participants</h5>
            </div>
            
            <Row className="mb-3">
              <Col md={3} sm={6}>
                <Form.Group>
                  <Form.Label>School</Form.Label>
                  <Form.Select
                    value={quizSchoolFilter}
                    onChange={(e) => setQuizSchoolFilter(e.target.value)}
                    size="sm"
                  >
                    <option value="">All Schools</option>
                    {uniqueSchools.map((school, i) => (
                      <option key={i} value={school}>{school}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} sm={6}>
                <Form.Group>
                  <Form.Label>District</Form.Label>
                  <Form.Select
                    value={quizDistrictFilter}
                    onChange={(e) => setQuizDistrictFilter(e.target.value)}
                    size="sm"
                  >
                    <option value="">All Districts</option>
                    {uniqueDistricts.map((district, i) => (
                      <option key={i} value={district}>{district}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="score-legend">
              <span className="score-legend-item">
                <span className="score-legend-color excellent"></span>
                Excellent (90-100%)
              </span>
              <span className="score-legend-item">
                <span className="score-legend-color good"></span>
                Good (75-89%)
              </span>
              <span className="score-legend-item">
                <span className="score-legend-color average"></span>
                Average (60-74%)
              </span>
              <span className="score-legend-item">
                <span className="score-legend-color needs-improvement"></span>
                Needs Improvement (0-59%)
              </span>
            </div>

            <div className="table-responsive">
             <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>District</th>
                    <th>School</th>
                    <th>Quiz</th>
                    <th>Participants</th>
                    <th>Attempts</th>
                    <th>Best Score</th>
                    <th>Best Rank</th>
                  </tr>
                </thead>
               <tbody>
                 {filteredQuizData.length > 0 ? (
                   filteredQuizData.map((p, index) => {
                     const bestAttempt = p.attempt?.reduce((best, curr) => 
                       (curr.score || 0) > (best.score || 0) ? curr : best, 
                       p.attempt?.[0] || {}
                     );
                     const bestRank = p.attempt?.reduce((best, curr) => 
                       curr.rank && curr.rank > 0 && (!best || curr.rank < best) ? curr.rank : best, 
                       null
                     );
                     const percentage = bestAttempt?.total_questions 
                       ? ((bestAttempt.score / bestAttempt.total_questions) * 100).toFixed(1)
                       : 0;
                     let scoreBadgeColor = 'warning';
                     if (percentage >= 90) scoreBadgeColor = 'success';
                     else if (percentage >= 75) scoreBadgeColor = 'primary';
                     else if (percentage >= 60) scoreBadgeColor = 'info';
                     
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className="fw-bold">{p.student?.full_name}</td>
                          <td>{p.student?.district}</td>
                          <td>{p.student?.school_name}</td>
                           <td>
                             <Badge
                               bg="info"
                               className="clickable-rank-badge"
                               onClick={() => openQuizModal(p.quiz_id)}
                               style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                               title={`Click to view all ${quizParticipants.filter(qp => qp.quiz_id === p.quiz_id).length} participant(s)`}
                             >
                               {p.quiz_id}
                             </Badge>
                           </td>
                          <td className="text-center">
                            <Badge bg="secondary" style={{ fontSize: '0.85rem' }}>
                              {quizParticipants.filter(qp => qp.quiz_id === p.quiz_id).length}
                            </Badge>
                          </td>
                          <td>{p.attempt?.length || 0}</td>
                          <td>
                            <Badge bg={scoreBadgeColor}>
                              {bestAttempt?.score || 0}/{bestAttempt?.total_questions || 0}
                              {percentage > 0 && ` (${percentage}%)`}
                            </Badge>
                          </td>
                          <td>
                            {bestRank ? (
                              <Badge
                                bg={bestRank <= 10 ? 'success' : bestRank <= 50 ? 'primary' : bestRank <= 100 ? 'warning' : 'danger'}
                                className="clickable-rank-badge"
                                onClick={() => p.student?.student_id && fetchStudentDetail(p.student.student_id)}
                                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                title="Click to view student details"
                              >
                                #{bestRank}
                              </Badge>
                            ) : '-'}
                          </td>
                        </tr>
                     );
                   })
                 ) : (
                    <tr>
                      <td colSpan="9" className="text-center">No quiz participants found</td>
                    </tr>
                 )}
               </tbody>
             </Table>
           </div>
         </Card.Body>
       </Card>
     );
   };

  const statCards = [
    {
      key: "students",
      icon: "bi-people",
      number: stats.totalStudents,
      label: "Total Students",
      className: ""
    },
    {
      key: "schools",
      icon: "bi-mortarboard",
      number: stats.totalSchools,
      label: "Total Schools",
      className: "schools"
    },
    {
      key: "enrollments",
      icon: "bi-book",
      number: stats.totalEnrollments,
      label: "Total Enrollments",
      className: "enrollments"
    },
    {
      key: "unique-courses",
      icon: "bi-layers",
      number: stats.totalUniqueCourses,
      label: "Unique Courses",
      className: "unique-courses"
    },
    {
      key: "quiz-participants",
      icon: "bi-trophy",
      number: stats.totalQuizParticipants,
      label: "Total Quiz Participants",
      className: "quiz-participants"
    },
   
   
    {
      key: "quiz-items",
      icon: "bi-journal-text",
      number: quizStats.totalQuizzes,
      label: "Total Quizzes",
      className: "total-quizzes"
    }
  ];

   const renderTable = () => {
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;

      const currentStudents = students.slice(indexOfFirstItem, indexOfLastItem);
      const currentSchools = schools.slice(indexOfFirstItem, indexOfLastItem);
      const currentEnrollments = enrollments.slice(indexOfFirstItem, indexOfLastItem);
      
      // Use the local filteredQuizData logic inside renderQuizTable, 
      // but for pagination we need a global filter reference or calculate here.
      // For simplicity in this component structure, we will rely on renderQuizTable handling its own pagination/filtering
      // or just use the full list if pagination isn't strictly enforced on the specific quiz view in the original logic.
      // However, to be consistent:
      const filteredQuizParticipants = quizParticipants.filter(p => {
        const matchSchool = !quizSchoolFilter || 
          (p.student?.school_name || '').toLowerCase().includes(quizSchoolFilter.toLowerCase());
        const matchDistrict = !quizDistrictFilter || 
          (p.student?.district || '').toLowerCase().includes(quizDistrictFilter.toLowerCase());
        return matchSchool && matchDistrict;
      });
      const currentQuizParticipants = filteredQuizParticipants.slice(indexOfFirstItem, indexOfLastItem);
     
     const renderPagination = (totalItems, currentPage) => {
       const totalPages = Math.ceil(totalItems / itemsPerPage);
       if (totalPages <= 1) return null;
       
       const items = [];
       const maxVisiblePages = 5;
       let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
       let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
       
       if (endPage - startPage + 1 < maxVisiblePages) {
         startPage = Math.max(1, endPage - maxVisiblePages + 1);
       }
       
       items.push(
         <Pagination.Prev 
           key="prev" 
           disabled={currentPage === 1} 
           onClick={() => setCurrentPage(currentPage - 1)} 
         />
       );
       
       if (startPage > 1) {
         items.push(<Pagination.Item key={1} onClick={() => setCurrentPage(1)}>{1}</Pagination.Item>);
         if (startPage > 2) items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
       }
       
       for (let i = startPage; i <= endPage; i++) {
         items.push(
           <Pagination.Item 
             key={i} 
             active={i === currentPage} 
             onClick={() => setCurrentPage(i)}
           >
             {i}
           </Pagination.Item>
         );
       }
       
       if (endPage < totalPages) {
         if (endPage < totalPages - 1) items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
         items.push(<Pagination.Item key={totalPages} onClick={() => setCurrentPage(totalPages)}>{totalPages}</Pagination.Item>);
       }
       
       items.push(
         <Pagination.Next 
           key="next" 
           disabled={currentPage === totalPages} 
           onClick={() => setCurrentPage(currentPage + 1)} 
         />
       );
       
       return <div className="pagination-wrapper"><Pagination>{items}</Pagination></div>;
     };

     if (activeTab === "students") {
       return (
         <>
           <Table striped bordered hover responsive>
             <thead>
               <tr>
                 <th>#</th>
                 <th>Student ID</th>
                 <th>Name</th>
                 <th>Aadhaar</th>
                 <th>Phone</th>
                 <th>Email</th>
                 <th>Class</th>
                 <th>School</th>
                 <th>District</th>
                 <th>Status</th>
               </tr>
             </thead>
             <tbody>
               {currentStudents.length > 0 ? (
                 currentStudents.map((student, index) => (
                   <tr key={index}>
                     <td>{indexOfFirstItem + index + 1}</td>
                     <td>{student.student_id || "-"}</td>
                     <td>{student.full_name || "-"}</td>
                     <td>{student.aadhaar_no ? `****${student.aadhaar_no.slice(-4)}` : "-"}</td>
                     <td>{student.phone || "-"}</td>
                     <td>{student.email || "-"}</td>
                     <td>{student.class_name || "-"}</td>
                     <td>{student.school_name || "-"}</td>
                     <td>{student.district || "-"}</td>
                     <td>
                       <Badge bg={student.status === "approved" ? "success" : student.status === "rejected" ? "danger" : "warning"}>
                         {student.status || "pending"}
                       </Badge>
                     </td>
                   </tr>
                 ))
               ) : (
                 <tr>
                   <td colSpan="10" className="text-center">No students found</td>
                 </tr>
               )}
             </tbody>
           </Table>
           {renderPagination(students.length, currentPage)}
         </>
       );
     } else if (activeTab === "schools") {
       return (
         <>
           <Table striped bordered hover responsive>
             <thead>
               <tr>
                 <th>#</th>
                 <th>School ID</th>
                 <th>School Name</th>
                 <th>District</th>
                 <th>State</th>
                 <th>Status</th>
                 <th>Actions</th>
               </tr>
             </thead>
             <tbody>
               {currentSchools.length > 0 ? (
                 currentSchools.map((school, index) => (
                   <tr key={index}>
                     <td>{indexOfFirstItem + index + 1}</td>
                     <td>{school.school_uni_id || "-"}</td>
                     <td>{school.school_name || "-"}</td>
                     <td>{school.district || "-"}</td>
                     <td>{school.state || "Uttarakhand"}</td>
                        <td>
                          <Badge bg={school.status === "approved" ? "success" : school.status === "rejected" ? "danger" : "warning"}>
                            {school.status || "pending"}
                          </Badge>
                        </td>
                        <td>
                          <select
                            className="status-select form-select form-select-sm"
                            value={school.status || "pending"}
                            onChange={(e) => handleStatusChange(school.school_uni_id, e.target.value)}
                            style={{ cursor: 'pointer', minWidth: '120px' }}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                   </tr>
                 ))
               ) : (
                  <tr>
                    <td colSpan="7" className="text-center">No School found</td>
                  </tr>
               )}
             </tbody>
           </Table>
           {renderPagination(schools.length, currentPage)}
         </>
       );
     } else if (activeTab === "enrollments") {
       return (
         <>
           <Table striped bordered hover responsive>
             <thead>
               <tr>
                 <th>#</th>
                 <th>Student ID</th>
                 <th>Student Name</th>
                 <th>School Name</th>
                 <th>Class</th>
                 <th>Course ID</th>
                 <th>Course Name</th>
                 <th>Enrolled At</th>
                 <th>Status</th>
               </tr>
             </thead>
             <tbody>
               {currentEnrollments.length > 0 ? (
                 currentEnrollments.map((enrollment, index) => (
                   <tr key={index}>
                     <td>{indexOfFirstItem + index + 1}</td>
                     <td><Badge bg="secondary">{enrollment.student_id}</Badge></td>
                     <td className="fw-bold">{enrollment.student_name}</td>
                     <td>{enrollment.school_name || '-'}</td>
                     <td><Badge bg="info">{enrollment.class_name || '-'}</Badge></td>
                     <td><Badge bg="info">{enrollment.course_id}</Badge></td>
                     <td>{enrollment.course_name}</td>
                     <td className="small">
                       {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleString() : '-'}
                     </td>
                     <td>
                       <Badge bg={enrollment.is_completed ? 'success' : 'warning'}>
                         {enrollment.is_completed ? 'Completed' : 'Ongoing'}
                       </Badge>
                     </td>
                   </tr>
                 ))
               ) : (
                 <tr>
                   <td colSpan="9" className="text-center">No enrollments found</td>
                 </tr>
               )}
             </tbody>
           </Table>
           {renderPagination(enrollments.length, currentPage)}
         </>
       );
     } else if (activeTab === "quiz-participants") {
       // Return the custom quiz table
       return renderQuizTable();
      } else if (activeTab === "quiz-items") {
        // New: Quiz Items Table with Rank Distribution
        const currentQuizItems = quizItems.slice(indexOfFirstItem, indexOfLastItem);
        return (
          <>
            {/* Rank Distribution Chart for Quiz Items */}
            {renderQuizItemsRankDistribution()}
            
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Quiz ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Questions</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {currentQuizItems.length > 0 ? (
                  currentQuizItems.map((quiz, index) => (
                    <tr key={index}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td><Badge bg="info">{quiz.quiz_id || '-'}</Badge></td>
                      <td className="fw-bold">{quiz.title || '-'}</td>
                      <td><Badge bg="secondary">{quiz.quiz_category || '-'}</Badge></td>
                      <td>{quiz.number_of_questions || 0}</td>
                      <td>
                        <Badge bg={quiz.is_active ? "success" : "secondary"}>
                          {quiz.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="small">
                        {quiz.start_date_time ? new Date(quiz.start_date_time).toLocaleDateString() : '-'}
                      </td>
                      <td className="small">
                        {quiz.end_date_time ? new Date(quiz.end_date_time).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">No quiz items found</td>
                  </tr>
                )}
              </tbody>
            </Table>
            {renderPagination(quizItems.length, currentPage)}
          </>
        );
      } else {
       return (
         <div className="text-center py-5 text-muted">
           {/* <p>This tab displays district-wise unique course distribution in the graph above.</p> */}
         </div>
       );
     }
   };

  const renderDistrictChart = () => {
    const districts = [
      "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar",
      "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal",
      "Udham Singh Nagar", "Uttarkashi"
    ];

    const studentDistrictMap = students.reduce((acc, s) => {
      if (s.student_id) {
        acc[s.student_id] = s.district?.trim().toLowerCase();
      }
      return acc;
    }, {});

    const stats = districts.map(district => {
      const dLower = district.toLowerCase();
      const studentCount = students.filter(s => s.district?.trim().toLowerCase() === dLower).length;
      const schoolCount = schools.filter(s => s.district?.trim().toLowerCase() === dLower).length;
      
      const districtEnrollments = enrollments.filter(e => studentDistrictMap[e.student_id] === dLower);
      const enrollmentCount = districtEnrollments.length;
      
      const districtUniqueCourses = [...new Set(districtEnrollments.map(e => e.course_name))].filter(Boolean);
      const uniqueCourseCount = districtUniqueCourses.length;

      return { 
        district, 
        studentCount, 
        schoolCount, 
        enrollmentCount, 
        uniqueCourseCount, 
        courseNames: districtUniqueCourses.join(', ') 
      };
    });

    const maxCount = Math.max(...stats.map(s => {
      if (activeTab === 'students') return s.studentCount;
      if (activeTab === 'schools') return s.schoolCount;
      if (activeTab === 'enrollments') return s.enrollmentCount;
      if (activeTab === 'unique-courses') return s.uniqueCourseCount;
      return 0;
    }), 1);

    const chartColor = 
      activeTab === 'students' ? '#4361ee' : 
      activeTab === 'schools' ? '#2ecc71' : 
      activeTab === 'enrollments' ? '#f39c12' : 
      '#e84393'; 

    return (
      <Card className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
        <Card.Body className="p-4">
          <h5 className="mb-4 fw-bold text-dark d-flex align-items-center">
            <i className={`bi bi-bar-chart-fill me-2`} style={{ color: chartColor }}></i>
            {activeTab === 'students' ? 'Student' : activeTab === 'schools' ? 'School' : activeTab === 'enrollments' ? 'Course Enrollment' : 'Unique Course'} Distribution by District
          </h5>
          <div className="district-chart-outer" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ minWidth: '950px', height: '340px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '20px 10px 70px 10px' }}>
              {stats.map((item, index) => {
                const currentCount = 
                  activeTab === 'students' ? item.studentCount : 
                  activeTab === 'schools' ? item.schoolCount : 
                  activeTab === 'enrollments' ? item.enrollmentCount : 
                  item.uniqueCourseCount;

                const barHeight = (currentCount / maxCount) * 220;
                const tooltipText = activeTab === 'unique-courses' 
                  ? `${item.district}: ${currentCount} Unique Courses\nCourses: ${item.courseNames || 'None'}`
                  : `${item.district}: ${currentCount}`;

                return (
                  <div key={index} className="flex-grow-1 d-flex flex-column align-items-center position-relative" style={{ width: '0' }}>
                    <div className="fw-bold mb-1" style={{ fontSize: '12px', color: chartColor, opacity: currentCount > 0 ? 1 : 0.3 }}>{currentCount}</div>
                    <div className="district-bar" style={{ height: `${barHeight}px`, width: '100%', maxWidth: '40px', background: `linear-gradient(to top, ${chartColor}, ${chartColor}aa)`, borderRadius: '8px 8px 0 0', transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} title={tooltipText}></div>
                    <div className="position-absolute text-center text-truncate" style={{ bottom: '-60px', width: '130px', fontSize: '11px', fontWeight: '700', transform: 'rotate(-30deg)', transformOrigin: 'top center', color: '#555', letterSpacing: '0.2px' }}>
                      {item.district}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card.Body>
      </Card>
    );
   };

   return (
    <div className="dashboard-container">
      <AdminLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <AdminHeader toggleSidebar={toggleSidebar} />
        <div className="dashboard-content">
          <Container fluid className="dashboard-box">
            {loading ? (
              <div className="loading-spinner">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <>
                  <Row className="g-4 mb-4">
                    {statCards.map((stat) => (
                      <Col key={stat.key} lg={3} md={6} sm={12}>
                        <div
                          className={`stat-card h-100 mb-0 ${stat.className} ${activeTab === stat.key ? 'active' : ''}`}
                          onClick={() => {
                            setActiveTab(stat.key);
                            setCurrentPage(1);
                          }}
                        >
                          <div className="stat-icon">
                            <i className={`bi ${stat.icon}`}></i>
                          </div>
                          <div className="stat-content card-content-mob-box">
                            <h2>{stat.number}</h2>
                            <h6>{stat.label}</h6>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>

                  {activeTab ? (
                    <>
               {activeTab === "quiz-participants" ? (
                         <>
                           {renderRankDistributionChart()}
                           {renderQuizChart()}
                         </>
                       ) : (
                         renderDistrictChart()
                       )}

               <div className="table-card">
                         <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                           <h4 className="mb-0">
                             {activeTab === "students" && "Student List"}
                             {activeTab === "schools" && "School List"}
                             {activeTab === "enrollments" && "Enrollment List"}
                             {activeTab === "quiz-participants" && "Quiz Participants List"}
                             {activeTab === "quiz-items" && "Quiz Items List"}
                           </h4>
                           <div className="d-flex gap-2">
                             <Button variant="outline-primary" size="sm" onClick={exportToPDF}>
                               <FaFilePdf className="me-1" /> Export PDF
                             </Button>
                             <Button variant="outline-success" size="sm" onClick={exportToExcel}>
                               <FaFileExcel className="me-1" /> Export Excel
                             </Button>
                           </div>
                         </div>
                         <div className="table-responsive">
                           {renderTable()}
                         </div>
                        {/* Mobile Table Wrapper Logic kept as is for students/schools */}
                        <div className="mobile-table-wrapper">
                          {activeTab === "students" && students.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((student, index) => (
                            <div key={index} className="mobile-card">
                              <div className="mobile-card-header">
                                <span className="mobile-card-id">{student.student_id || `#${(currentPage - 1) * itemsPerPage + index + 1}`}</span>
                                <span className={`mobile-status ${student.status || 'pending'}`}>
                                  {student.status || "pending"}
                                </span>
                              </div>
                              <div className="mobile-card-row">
                                <span className="mobile-card-label">Name</span>
                                <span className="mobile-card-value">{student.full_name || "-"}</span>
                              </div>
                              <div className="mobile-card-row">
                                <span className="mobile-card-label">Aadhaar</span>
                                <span className="mobile-card-value">{student.aadhaar_no ? `****${student.aadhaar_no.slice(-4)}` : "-"}</span>
                              </div>
                              <div className="mobile-card-row">
                                <span className="mobile-card-label">Phone</span>
                                <span className="mobile-card-value">{student.phone || "-"}</span>
                              </div>
                              <div className="mobile-card-row">
                                <span className="mobile-card-label">Email</span>
                                <span className="mobile-card-value">{student.email || "-"}</span>
                              </div>
                              <div className="mobile-card-row">
                                <span className="mobile-card-label">Class</span>
                                <span className="mobile-card-value">{student.class_name || "-"}</span>
                              </div>
                              <div className="mobile-card-row">
                                <span className="mobile-card-label">School</span>
                                <span className="mobile-card-value">{student.school_name || "-"}</span>
                              </div>
                              <div className="mobile-card-row">
                                <span className="mobile-card-label">District</span>
                                <span className="mobile-card-value">{student.district || "-"}</span>
                              </div>
                            </div>
                          ))}
                          {activeTab === "schools" && schools.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((school, index) => (
                            <div key={index} className="mobile-card">
                              <div className="mobile-card-header">
                                <span className="mobile-card-id">{school.school_uni_id || `#${(currentPage - 1) * itemsPerPage + index + 1}`}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span className={`mobile-status ${school.status || 'pending'}`}>
                                    {school.status || "pending"}
                                  </span>
                                  <select
                                    className="status-select-mobile form-select form-select-sm"
                                    value={school.status || "pending"}
                                    onChange={(e) => handleStatusChange(school.school_uni_id, e.target.value)}
                                    style={{ cursor: 'pointer', padding: '2px 4px', fontSize: '12px', minWidth: '80px' }}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                  </select>
                                </div>
                              </div>
                              <div className="mobile-card-row">
                                <span className="mobile-card-label">School Name</span>
                                <span className="mobile-card-value">{school.school_name || "-"}</span>
                              </div>
                              <div className="mobile-card-row">
                                <span className="mobile-card-label">District</span>
                                <span className="mobile-card-value">{school.district || "-"}</span>
                              </div>
                              <div className="mobile-card-row">
                                <span className="mobile-card-label">State</span>
                                <span className="mobile-card-value">{school.state || "Uttarakhand"}</span>
                              </div>
                            </div>
                          ))}
                          {(activeTab === "students" && students.length === 0) || (activeTab === "schools" && schools.length === 0) ? (
                            <div className="mobile-card text-center">No data found</div>
                          ) : null}
                          {students.length > itemsPerPage && activeTab === "students" && (
                            <div className="mobile-pagination">
                              <button 
                                className="mobile-page-btn" 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                              >
                                Previous
                              </button>
                              <span className="mobile-page-info">
                                Page {currentPage} of {Math.ceil(students.length / itemsPerPage)}
                              </span>
                              <button 
                                className="mobile-page-btn"
                                disabled={currentPage === Math.ceil(students.length / itemsPerPage)}
                                onClick={() => setCurrentPage(currentPage + 1)}
                              >
                                Next
                              </button>
                            </div>
                          )}
                          {schools.length > itemsPerPage && activeTab === "schools" && (
                            <div className="mobile-pagination">
                              <button 
                                className="mobile-page-btn" 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                              >
                                Previous
                              </button>
                              <span className="mobile-page-info">
                                Page {currentPage} of {Math.ceil(schools.length / itemsPerPage)}
                              </span>
                              <button 
                                className="mobile-page-btn"
                                disabled={currentPage === Math.ceil(schools.length / itemsPerPage)}
                                onClick={() => setCurrentPage(currentPage + 1)}
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-arrow-up-circle fs-1 mb-3 d-block"></i>
                      <h5>Select a summary card above to view detailed reports and graphs</h5>
                    </div>
                  )}
              </>
            )}
           </Container>
         </div>
       </div>

       {/* Rank Participants Modal */}
       <Modal
         show={showRankModal}
         onHide={closeRankModal}
         centered
         size="md"
         contentClassName="rank-participants-modal"
         backdropClassName="modal-backdrop-custom"
       >
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="bi bi-trophy-fill me-2"></i>
              {typeof selectedRank === 'object' && selectedRank?.rangeLabel ?
                `Students with Rank ${selectedRank.rangeLabel}`
              : selectedRank === 'all-attempts' ?
                `All Quiz Attempts (${quizParticipants.length} participants)`
              : `Students with Rank #${selectedRank}`
              }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedRank && (() => {
              // Handle "All Attempts" view
              if (selectedRank === 'all-attempts') {
                const allAttempts = getAllQuizAttempts();
                if (allAttempts.length > 0) {
                  return (
                    <div>
                      <p className="text-muted mb-3">
                        Showing all <strong>{allAttempts.length}</strong> quiz participant(s) with their attempts
                      </p>
                      <div className="table-responsive">
                        <Table striped bordered hover size="sm">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Student Name</th>
                              <th>District</th>
                              <th>School</th>
                              <th>Quiz ID</th>
                              <th>Attempts</th>
                              <th>Best Score</th>
                              <th>Best Rank</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allAttempts.map((participant, index) => {
                              const bestAttempt = participant.attempt?.reduce((best, curr) =>
                                (curr.score || 0) > (best.score || 0) ? curr : best,
                                participant.attempt?.[0] || {}
                              );
                              const bestRank = participant.attempt?.reduce((best, curr) =>
                                curr.rank && curr.rank > 0 && (!best || curr.rank < best) ? curr.rank : best,
                                null
                              );
                              const percentage = bestAttempt?.total_questions
                                ? ((bestAttempt.score / bestAttempt.total_questions) * 100).toFixed(1)
                                : 0;
                              const scoreBadgeColor = percentage >= 90 ? 'success' :
                                                    percentage >= 75 ? 'primary' :
                                                    percentage >= 60 ? 'info' : 'warning';

                              return (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td className="fw-bold">{participant.student?.full_name || '-'}</td>
                                  <td>{participant.student?.district || '-'}</td>
                                  <td>{participant.student?.school_name || '-'}</td>
                                  <td><Badge bg="info">{participant.quiz_id}</Badge></td>
                                  <td>{participant.attempt?.length || 0}</td>
                                  <td>
                                    <Badge bg={scoreBadgeColor}>
                                      {bestAttempt?.score || 0}/{bestAttempt?.total_questions || 0}
                                      {percentage > 0 && ` (${percentage}%)`}
                                    </Badge>
                                  </td>
                                  <td>
                                    {bestRank ? (
                                      <Badge bg={bestRank <= 10 ? 'success' : bestRank <= 50 ? 'primary' : bestRank <= 100 ? 'warning' : 'danger'}>
                                        #{bestRank}
                                      </Badge>
                                    ) : '-'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                  );
                } else {
                  return <p className="text-center text-muted">No quiz attempts found</p>;
                }
              }

              // Handle rank-based views (exact rank or range)
              const studentsWithRank = getStudentsWithRank(selectedRank);

              if (studentsWithRank.length > 0) {
                const uniqueStudents = studentsWithRank.reduce((acc, curr) => {
                  if (!acc.find(s => s.student?.student_id === curr.student?.student_id)) {
                    acc.push(curr);
                  }
                  return acc;
                }, []).sort((a, b) => {
                  let aRank, bRank;
                  if (typeof selectedRank === 'object') {
                    aRank = a.attempt?.find(att => {
                      const r = att.rank;
                      return r >= selectedRank.minRank && r <= selectedRank.maxRank;
                    })?.rank || 0;
                    bRank = b.attempt?.find(att => {
                      const r = att.rank;
                      return r >= selectedRank.minRank && r <= selectedRank.maxRank;
                    })?.rank || 0;
                  } else {
                    aRank = a.attempt?.find(att => att.rank === selectedRank)?.rank || 0;
                    bRank = b.attempt?.find(att => att.rank === selectedRank)?.rank || 0;
                  }
                  const aScore = a.attempt?.find(att => att.rank === aRank)?.score || 0;
                  const bScore = b.attempt?.find(att => att.rank === bRank)?.score || 0;
                  return aRank !== bRank ? aRank - bRank : bScore - aScore;
                });

                return (
                  <div>
                    {typeof selectedRank === 'object' && selectedRank?.rangeLabel ? (
                      <p className="text-muted mb-3">
                        Found <strong>{studentsWithRank.length}</strong> attempt(s) with Rank {selectedRank.rangeLabel} from <strong>{uniqueStudents.length}</strong> student(s)
                      </p>
                    ) : selectedRank === 'all-attempts' ? null : (
                      <p className="text-muted mb-3">
                        Found <strong>{studentsWithRank.length}</strong> attempt(s) with Rank #{selectedRank} from <strong>{uniqueStudents.length}</strong> student(s)
                      </p>
                    )}
                    <div className="table-responsive">
                      <Table striped bordered hover size="sm">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Student Name</th>
                            <th>District</th>
                            <th>School</th>
                            <th>Quiz ID</th>
                            <th>Score</th>
                            <th>Rank</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uniqueStudents.map((participant, index) => {
                            let rankAttempt;
                            if (typeof selectedRank === 'object') {
                              rankAttempt = participant.attempt?.find(att => {
                                const r = att.rank;
                                return r >= selectedRank.minRank && r <= selectedRank.maxRank;
                              });
                            } else {
                              rankAttempt = participant.attempt?.find(att => att.rank === selectedRank);
                            }

                            const percentage = rankAttempt?.total_questions
                              ? ((rankAttempt.score / rankAttempt.total_questions) * 100).toFixed(1)
                              : 0;
                            const scoreBadgeColor = percentage >= 90 ? 'success' :
                                                  percentage >= 75 ? 'primary' :
                                                  percentage >= 60 ? 'info' : 'warning';

                            return (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td className="fw-bold">{participant.student?.full_name || '-'}</td>
                                <td>{participant.student?.district || '-'}</td>
                                <td>{participant.student?.school_name || '-'}</td>
                                <td><Badge bg="info">{participant.quiz_id}</Badge></td>
                                <td>
                                  <Badge bg={scoreBadgeColor}>
                                    {rankAttempt?.score || 0}/{rankAttempt?.total_questions || 0}
                                    {percentage > 0 && ` (${percentage}%)`}
                                  </Badge>
                                </td>
                                <td>
                                  <Badge bg={
                                    rankAttempt?.rank <= 10 ? 'success' :
                                    rankAttempt?.rank <= 50 ? 'primary' :
                                    rankAttempt?.rank <= 100 ? 'warning' : 'danger'
                                  }>
                                    #{rankAttempt?.rank || '-'}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                );
              } else {
                return (
                  <p className="text-center text-muted">
                    {typeof selectedRank === 'object' && selectedRank?.rangeLabel
                      ? `No students found with Rank ${selectedRank.rangeLabel}`
                      : selectedRank === 'all-attempts'
                      ? `No quiz attempts found`
                      : `No students found with Rank #${selectedRank}`
                    }
                  </p>
                );
              }
            })()}
          </Modal.Body>
         <Modal.Footer>
           <Button variant="secondary" onClick={closeRankModal}>
             Close
           </Button>
         </Modal.Footer>
       </Modal>
     </div>
  );
};

export default AdminDashBoard;