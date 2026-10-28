import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Modal,
  ListGroup,
  Table,
  Badge,
  Form,
  ProgressBar,
  Dropdown,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import "../../assets/css/userleftnav.css";
import {
  FaUsers,
  FaUser,
  FaCheckCircle,
  FaClock,
  FaLayerGroup,
  FaBook,
  FaChartBar,
  FaChartPie,
  FaFilter,
  FaEye,
  FaLightbulb,
  FaSortAmountDown,
  FaSortAmountDownAlt,
  FaGraduationCap,
  FaTasks,
  FaCalendarCheck,
  FaTrophy,
  FaClipboardList,
  FaAward,
  FaStar,
  FaTimesCircle,
} from "react-icons/fa";

import { useAuth } from "../all_login/AuthContext";
import JudgeLeftNav from "./JudgeLeftNav";
import JudgeTopNav from "./JudgeTopNav";


const JudgeDashBoard = () => {
  // Device width state
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [queries, setQueries] = useState([]);
  
  // Always call hooks at the top level
  const { user, accessToken, uniqueId } = useAuth();

  // Service requests state
  const [serviceLoading, setServiceLoading] = useState(true);
  const [serviceError, setServiceError] = useState("");
  const [serviceRequests, setServiceRequests] = useState([]);

  // Enrollments state
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);
  const [enrollmentError, setEnrollmentError] = useState("");

  // Module progress state
  const [moduleProgress, setModuleProgress] = useState([]);
  const [moduleLoading, setModuleLoading] = useState(true);
  const [moduleError, setModuleError] = useState("");

  const [showDetails, setShowDetails] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  // Analytics state
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsStatusFilter, setAnalyticsStatusFilter] = useState("all");

  // --- NEW QUIZ STATE ---
  const [quizzes, setQuizzes] = useState([]);
  const [quizLoading, setQuizLoading] = useState(true);
  const [quizError, setQuizError] = useState("");
  const [showQuizDetails, setShowQuizDetails] = useState(false);
  
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizParticipants, setQuizParticipants] = useState([]);
  const [participantLoading, setParticipantLoading] = useState(false);
  const [participantError, setParticipantError] = useState("");
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  // ----------------------

  // School Rank state
  const [schoolRanks, setSchoolRanks] = useState([]);
  const [schoolRankLoading, setSchoolRankLoading] = useState(false);

  const toggleSidebar = () => {
    if (isMobile || isTablet) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };



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
         

         Judge

         
        </Container>
      </div>
    </div>
  );
};

export default JudgeDashBoard;