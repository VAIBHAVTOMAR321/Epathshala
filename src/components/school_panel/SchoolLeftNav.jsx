import React, { useState, useContext, useEffect } from "react";
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
  FaListUl,
  FaEdit,
  FaMusic,
  FaGlassCheers,
  FaChalkboardTeacher,
  FaIndustry,
  FaQuestionCircle,
  FaClipboardList,
  FaGraduationCap
} from "react-icons/fa";
import axios from "axios";

import "../../assets/css/schoolleftnav.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import gyandharaLogo from "../../assets/images/gyandharalogo2.png";
import {
  FaInfoCircle,
  FaBullseye,
  FaTasks
} from "react-icons/fa";

import { useAuth } from "../all_login/AuthContext";

const SchoolLeftNav = ({ sidebarOpen, setSidebarOpen, isMobile, isTablet }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

    const [userRole, setUserRole] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  // Automatically close sidebar when navigating on mobile or tablet views
  // This fixes the "opening again after clicking" and "two clicks" issues
  useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile, isTablet, setSidebarOpen]);

const menuItems = [
  {
    icon: <FaTachometerAlt />,
    label: "DashBorad",
    path: "/SchoolDashBoard",
    active: true,
  },
  {
    icon: <FaUsers />,
    label: "Add Student",
    path: "/SchoolStudentRegistration",
  },
  {
    icon: <FaGraduationCap />,
    label: "Quiz Participants",
    path: "/SchoolQuizList",
  },
  {
    icon: <FaUsers />,
    label: "Offline Competition",
    path: "/Offlinecompetition",
  },
  {
    icon: <FaQuestionCircle />,
    label: "Feedback & Queries",
    path: "/SchoolSendQuery",
  },
  ];

  //  Auto-close sidebar when switching to mobile or tablet

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`school-Left ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div className="sidebar-header">
          {sidebarOpen ? (
            <div className="logo-container">
              <div className="logo">
                <img src={gyandharaLogo} alt="Gyan Dhara" className="header-logo" />
                <div className="logo-text">Institution Dashboard</div>
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
          onClick={() => setSidebarOpen(false)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-text">{item.label}</span>
        </Link>
      )}

      {/* Submenu */}
      {item.submenu && (
        <Collapse in={openSubmenu === index}>
          <div className="submenu-container-school">
            {item.submenu.map((subItem, subIndex) => (
              <Link
                key={subIndex}
                to={subItem.path}
                className="submenu-item-user nav-link"
                onClick={() => setSidebarOpen(false)}
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
            <span className="nav-text">Logout</span>
          </Nav.Link>
        </div>
      </div>

      {/*  Mobile / Tablet Sidebar (Offcanvas) */}
  <Offcanvas
  show={(isMobile || isTablet) && sidebarOpen}
  onHide={() => setSidebarOpen(false)}
  className="school-mobile-offcanvas"
  placement="start"
  backdrop={true}
  scroll={false}
  enforceFocus={false} //  ADD THIS LINE — fixes close button focus issue
>
  <Offcanvas.Header closeButton className="school-offcanvas-header">
    <Offcanvas.Title className="br-off-title">Menu</Offcanvas.Title>
  </Offcanvas.Header>

  <Offcanvas.Body className="school-offcanvas-body">
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
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text br-nav-text-mob">{item.label}</span>
            </Link>
          )}

          {item.submenu && (
            <Collapse in={openSubmenu === index}>
              <div className="submenu-container-school">
                {item.submenu.map((subItem, subIndex) => (
                  <Link
                    key={subIndex}
                    to={subItem.path}
                    className="submenu-item nav-link"
                    onClick={() => setSidebarOpen(false)}
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

export default SchoolLeftNav;