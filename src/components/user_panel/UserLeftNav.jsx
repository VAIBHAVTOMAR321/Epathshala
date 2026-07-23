import React, { useState, useEffect } from "react";
import { Nav, Offcanvas, Collapse } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaImages,
  FaUsers,
  FaBook,
  FaBuilding,
  FaImage,
  FaTools,
  FaComments,
  FaCube,
  FaProjectDiagram,
  FaServer,
  FaUserCircle,
  FaCalendarAlt,
  FaPlusSquare,
  FaEdit,
  FaMusic,
  FaGlassCheers,
  FaChalkboardTeacher,
  FaIndustry,
  FaQuestionCircle,
  FaTrophy,
  FaBriefcase,
  FaGraduationCap,
  FaTasks,
  FaClock
} from "react-icons/fa";
import axios from "axios";

import "../../assets/css/UserLeftNav.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import gyandharaLogo from "../../assets/images/gyandharalogo.jpeg";
import {
  FaInfoCircle,
  FaBullseye,
  
} from "react-icons/fa";

import { useAuth } from "../all_login/AuthContext";
import { useLanguage } from "../all_login/LanguageContext";


const UserLeftNav = ({ sidebarOpen, setSidebarOpen, isMobile, isTablet, onNavClick }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  const [userRole, setUserRole] = useState(user ? user.role : null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  // Automatically close sidebar when navigating on mobile or tablet views
  useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile, isTablet, setSidebarOpen]);

  const handleItemClick = (e, path) => {
    if (onNavClick) {
      e.preventDefault();
      onNavClick(path);
    } else {
      setSidebarOpen(false);
    }
  };

const menuItems = [
     {
       icon: <FaTachometerAlt />,
       label: language === 'hi' ? "डैशबोर्ड" : "DASHBOARD",
       path: "/UserDashboard",
       active: true,
     },
     {
       icon: <FaUserCircle />,
       label: language === 'hi' ? "प्रोफाइल" : "PROFILE",
       path: "/UserProfile",
     },
   
      {
        icon: <FaChalkboardTeacher />,
        label: language === 'hi' ? "करियर मार्गदर्शन" : "Career Guidance",
        submenu: [
          {
            label: language === 'hi' ? "9वीं मार्गदर्शन" : "9th Guidance",
            path: "/NinthGuidance",
            icon: <FaPlusSquare />,
          },
          {
            label: language === 'hi' ? "10वीं मार्गदर्शन" : "10th Guidance",
            path: "/TenthGuidance",
            icon: <FaPlusSquare />,
          },
        
          {
            label: language === 'hi' ? "12वीं मार्गदर्शन" : "12th Guidance",
            path: "/TwelfthGuidance",
            icon: <FaPlusSquare />,
          },
        ],
      },
     {
       icon: <FaTasks />,
       label: language === 'hi' ? "ग्रूमिंग क्लासेस" : "Grooming Classes",
       path: "/GroomingClasses",
     },
     {
       icon: <FaGraduationCap />,
       label: language === 'hi' ? "क्विज़" : "Quiz",
       path: "/UserQuiz",
     },
     {
       icon: <FaTrophy />,
       label: language === 'hi' ? "प्रतियोगिता" : "Competition",
       path: "/Competition",
     },
     {
       icon: <FaUsers />,
       label: language === 'hi' ? "शैक्षणिक संस्था प्रतियोगिताएं" : "School Competitions",
       path: "/SchoolCompetitions",
     },
     {
       icon: <FaBriefcase />,
       label: language === 'hi' ? "नौकरियां और सेमिनार" : "Jobs & Seminars",
       path: "/JobOpenings",
     },
     {
       icon: <FaBuilding />,
       label: language === 'hi' ? "सरकारी योजनाएं" : "Government Schemes",
       path: "/GovernmentSchemes",
     },
     {
       icon: <FaCalendarAlt />,
       label: language === 'hi' ? "कार्यक्रम" : "Events",
       path: "/UserEvents",
     },
     
       {
  icon: <FaClock />,
  label: language === 'hi' ? "समय निर्देशिका" : "Time Schedule",
  path: "/Timeschedule",
},
     {
       icon: <FaComments />,
       label: language === 'hi' ? "प्रश्न भेजें" : "Send Query",
       path: "/SendQuery",
     },
     
     
      
     
     
    ];

  //  Auto-close sidebar when switching to mobile or tablet

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`user-left-nav ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div className="sidebar-header">
          {sidebarOpen ? (
            <div className="logo-container">
              <div className="logo">
               
                <img src={gyandharaLogo} alt="Gyan Dhara" className="header-logo" />
                 {language === 'hi' ? "छात्र डैशबोर्ड" : "Student DashBoard"}
              </div>
            </div>
          ) : (
            <div className="logo-container logo-collapsed">
              <img src={gyandharaLogo} alt="Gyan Dhara" className="header-logo" />
            </div>
          )}
        </div>

        <Nav className="sidebar-nav flex-column">
          
        {menuItems
  .filter(item =>
    item.allowedRoles ? item.allowedRoles.includes(userRole) : true
  )
  .map((item, index) => (
    <div key={index}>
      {/* If submenu exists */}
      {item.submenu ? (
        <Nav.Link
          className={`nav-item ${item.active ? "active" : ""}`}
          onClick={() => toggleSubmenu(index)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-text">{item.label}</span>
          <span className="submenu-arrow">
            {openSubmenu === index ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        </Nav.Link>
      ) : (
        <Link
          to={item.path}
          className={`nav-item nav-link ${item.active ? "active" : ""}`}
          onClick={(e) => handleItemClick(e, item.path)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-text">{item.label}</span>
        </Link>
      )}

      {/* Submenu */}
      {item.submenu && (
        <Collapse in={openSubmenu === index}>
          <div className="submenu-container-user">
            {item.submenu.map((subItem, subIndex) => (
              <Link
                key={subIndex}
                to={subItem.path}
                className="submenu-item-user nav-link"
                onClick={(e) => handleItemClick(e, subItem.path)}
              >
                <span className="submenu-icon">{subItem.icon}</span>
                <span className="nav-text br-text-sub">{subItem.label}</span>
              </Link>
            ))}
          </div>
        </Collapse>
      )}
    </div>
  ))}

        </Nav>

        <div className="sidebar-footer">
          <Nav.Link
            className="nav-item logout-btn"
            onClick={() => {
              if (typeof logout === "function") {
                logout();
                navigate("/login");
              }
            }}
          >
            <span className="nav-icon">
              <FaSignOutAlt />
            </span>
            <span className="nav-text">{language === 'hi' ? "लॉगआउट" : "Logout"}</span>
          </Nav.Link>
        </div>
      </div>

      {/*  Mobile / Tablet Sidebar (Offcanvas) */}
  <Offcanvas
  show={(isMobile || isTablet) && sidebarOpen}
  onHide={() => setSidebarOpen(false)}
  className="user-mobile-offcanvas"
  placement="start"
  backdrop={true}
  scroll={false}
  enforceFocus={false} //  ADD THIS LINE — fixes close button focus issue
>
  <Offcanvas.Header closeButton className="user-offcanvas-header">
    <Offcanvas.Title className="br-off-title">{language === 'hi' ? "मेनू" : "Menu"}</Offcanvas.Title>
  </Offcanvas.Header>

  <Offcanvas.Body className="user-offcanvas-body">
    <Nav className="flex-column">
      {menuItems.map((item, index) => (
        <div key={index}>
          {item.submenu ? (
            <Nav.Link
              className={`nav-item ${item.active ? "active" : ""}`}
              onClick={() => toggleSubmenu(index)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text br-nav-text-mob">{item.label}</span>
              <span className="submenu-arrow">
                {openSubmenu === index ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            </Nav.Link>
          ) : (
            <Link
              to={item.path}
              className={`nav-item nav-link ${item.active ? "active" : ""}`}
              onClick={(e) => handleItemClick(e, item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text br-nav-text-mob">{item.label}</span>
            </Link>
          )}

          {item.submenu && (
            <Collapse in={openSubmenu === index}>
              <div className="submenu-container-user">
                {item.submenu.map((subItem, subIndex) => (
                  <Link
                    key={subIndex}
                    to={subItem.path}
                    className="submenu-item nav-link"
                    onClick={(e) => handleItemClick(e, subItem.path)}
                  >
                    <span className="nav-text">{subItem.label}</span>
                  </Link>
                ))}
              </div>
            </Collapse>
          )}
        </div>
      ))}
    </Nav>
  </Offcanvas.Body>
</Offcanvas>

    </>
  );
};

export default UserLeftNav;