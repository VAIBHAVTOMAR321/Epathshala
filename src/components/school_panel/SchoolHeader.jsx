import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Dropdown,
  Image,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../all_login/AuthContext";


// 1. Accept searchTerm and setSearchTerm as props
function SchoolHeader({ toggleSidebar, searchTerm, setSearchTerm }) {
  
  const navigate = useNavigate();


   // Use AuthContext (matching UserProfile)
   const { accessToken, uniqueId, logout } = useAuth();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "New employee joined - Rahul Sharma",
      time: "10 min ago",
      read: false,
    },
    {
      id: 2,
      text: "HR meeting scheduled at 4 PM",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      text: "Payroll processed successfully",
      time: "3 hours ago",
      read: true,
    },
  ]);

  const [unreadCount, setUnreadCount] = useState(2);
  
  // State for user details - matching UserProfile
  const [userDetails, setUserDetails] = useState({
    full_name: "",
    profile_picture: null,
  });
   // State for loading and error handling
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);
   const [imageError, setImageError] = useState(false);



    const getDisplayName = () => {
      return userDetails.full_name || "School";
    };

  // Function to fetch user data with auth handling


  // Fetch user data when component mounts
 

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => prev - 1);
  };
  
   // Get user photo URL
   const getUserPhotoUrl = () => {
     const profilePicture = userDetails.profile_picture;
     if (profilePicture && !imageError) {
       return profilePicture;
     }
     return null;
   };
  
  // Handle image loading error
  const handleImageError = (e) => {
    console.error('Error loading profile image:', e);
    setImageError(true);
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}&background=0d6efd&color=fff&size=40`;
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };
  return (
    <header className="dashboard-header">
      <Container fluid>
        <Row className="align-items-center">
          <Col xs="auto">
            <Button
              variant="light"
              className="sidebar-toggle"
              onClick={toggleSidebar}
            >
              <FaBars />
            </Button>
          </Col>

           <Col>
             {error && (
               <Alert variant="warning" className="mb-0 py-1">
                 <small>{error}</small>
               </Alert>
             )}
           </Col>
          <Col xs="auto">
            <div className="header-actions">
              <Dropdown align="end">
                {/* <Dropdown.Toggle variant="light" className="notification-btn">
                  <FaBell />
                  {unreadCount > 0 && (
                    <Badge pill bg="danger" className="notification-badge">
                      {unreadCount}
                    </Badge>
                  )}
                </Dropdown.Toggle> */}

                {/* <Dropdown.Menu className="notification-dropdown">
                  <div className="notification-header">
                    <h6>Notifications</h6>
                  </div>

                  {notifications.map((notif) => (
                    <Dropdown.Item
                      key={notif.id}
                      className={`notification-item ${
                        !notif.read ? "unread" : ""
                      }`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <p>{notif.text}</p>
                      <small>{notif.time}</small>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu> */}
              </Dropdown>

              <Dropdown align="end">
  <Dropdown.Toggle variant="light" className="user-profile-btn" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    {getUserPhotoUrl() ? (
      <Image
        src={getUserPhotoUrl()}
        roundedCircle
        className="user-avatar"
        onError={handleImageError}
        style={{ width: 40, height: 40, objectFit: "cover", border: "2px solid #e5e7eb" }}
        alt="User"
      />
    ) : (
      <FaUserCircle style={{ fontSize: 40, color: "#6366f1" }} />
    )}
    <span style={{ fontWeight: 600, color: "#1e293b" }}>
      {getDisplayName()}
    </span>
  </Dropdown.Toggle>
  <Dropdown.Menu>
    <Dropdown.Item onClick={handleLogout}>
      <FaSignOutAlt className="me-2" /> Logout
    </Dropdown.Item>
  </Dropdown.Menu>
</Dropdown>
            </div>
          </Col>
        </Row>
      </Container>
    </header>
  );
}

export default SchoolHeader;