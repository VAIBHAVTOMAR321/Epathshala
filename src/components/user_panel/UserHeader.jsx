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
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../all_login/AuthContext";
import { useLanguage } from "../all_login/LanguageContext";

function UserHeader({ toggleSidebar }) {
  const navigate = useNavigate();

  // Access Auth Context similar to UserProfile
  const { accessToken, uniqueId, logout } = useAuth();

  const { language, setLanguage } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // State to track if the API itself failed (404/500)
  const [apiError, setApiError] = useState(null);

  // Fetch Notifications on mount or when auth changes
  useEffect(() => {
    fetchNotifications();
  }, [uniqueId, accessToken]);

  const fetchNotifications = async () => {
    if (!uniqueId || !accessToken) {
      setNotificationsLoading(false);
      return;
    }

    try {
      setNotificationsLoading(true);
      setApiError(null); // Reset error

      const response = await axios.get(
        `https://brjobsedu.com/gyandhara/gyandhara_backend/api/notifications/?student_id=${uniqueId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 5000,
        }
      );

      console.log("Notifications Response:", response.data);

      // --- FIX: Handle the specific API structure you provided ---
      // Expected: { status: true, unseen_notifications: [...], seen_notifications: [...], unseen_count: 1 }
      if (response.data && response.data.status) {
        const unseen = response.data.unseen_notifications || [];
        const seen = response.data.seen_notifications || [];
        
        // Merge unseen and seen into one list for the dropdown
        const combinedNotifications = [...unseen, ...seen];

        // Sort by time (newest first)
        combinedNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));

        setNotifications(combinedNotifications);
        setUnreadCount(response.data.unseen_count || 0);
      } 
      // Fallback for older formats if necessary
      else if (Array.isArray(response.data)) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter((n) => !n.seen).length);
      }
      else {
        console.warn("Unknown notification data format:", response.data);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Notifications API Error:", error);
      if (error.response && error.response.status === 404) {
        setApiError("Notifications URL not found (404)");
      } else {
        setApiError("Failed to load notifications");
      }
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString("en-GB");
  };

  const handleNotificationClick = async (notification) => {
    setShowNotificationDropdown(false);

    // Determine navigation based on type
    let path = "";
    let state = {};

    switch (notification.type) {
      case "course":
        path = "/UserDashboard";
        state = { activeTab: "my-courses" }; 
        break;
      case "scheme":
        path = "/GovernmentSchemes";
        break;
      case "quiz":
        path = "/UserQuiz";
        break;
      case "grooming":
        path = "/GroomingClasses";
        break;
      case "job":
        path = "/JobOpenings";
        state = { activeTab: "jobs" };
        break;
      case "seminar":
        path = "/JobOpenings";
        state = { activeTab: "seminars" };
        break;
      case "workshop":
        path = "/JobOpenings";
        state = { activeTab: "workshops" };
        break;
      case "issue_reply":
        path = "/SendQuery";
        break;
      case "school-competition":
        path = "/SchoolCompetitions";
        break;
      case "quiz-competition":
        path = "/Competition";
        break;
      default:
        // If admin or unknown, do nothing
        return;
    }

    if (path) {
      navigate(path, { state });
    }

    // Mark as seen if unread
    if (!notification.seen) {
      try {
        await axios.put(
          `https://brjobsedu.com/gyandhara/gyandhara_backend/api/notifications/multi-seen/`,
          { student_id: uniqueId, notification_ids: [notification.id] },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, seen: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as seen:", error);
      }
    }
  };

  const handleMarkAllSeen = async () => {
    try {
      const unseenIds = notifications.filter((n) => !n.seen).map((n) => n.id);

      if (unseenIds.length === 0) return;

      await axios.put(
        `https://brjobsedu.com/gyandhara/gyandhara_backend/api/notifications/multi-seen/`,
        { student_id: uniqueId, notification_ids: unseenIds },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as seen:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      quiz: "bi-journal-check",
      issue_reply: "bi-chat-dots",
      job: "bi-briefcase",
      scheme: "bi-gift",
      seminar: "bi-people",
      workshop: "bi-tools",
      admin: "bi-shield-exclamation",
      course: "bi-book",
      competition: "bi-trophy",
    };
    return icons[type] || "bi-bell";
  };

  // User Profile State
  const [userDetails, setUserDetails] = useState({
    full_name: "",
    profile_picture: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!uniqueId || !accessToken) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `https://brjobsedu.com/gyandhara/gyandhara_backend/api/student-reg/?student_id=${uniqueId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.data.success && response.data.data) {
          const data = response.data.data;
          setUserDetails({
            full_name: data.full_name || "",
            profile_picture: data.profile_picture || null,
          });
          setError(null);
        } else if (Array.isArray(response.data) && response.data.length > 0) {
           // Fallback if API returns array
             setUserDetails({
                full_name: response.data[0].full_name || "",
                profile_picture: response.data[0].profile_picture || null,
             });
        } else {
             setError("Failed to fetch user profile");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Error fetching user profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, [uniqueId, accessToken]);

  const getDisplayName = () => {
    return userDetails.full_name || (language === 'hi' ? "यूजर" : "User");
  };

  const getUserPhotoUrl = () => {
    const profilePicture = userDetails.profile_picture;
    if (profilePicture && !imageError) {
      return profilePicture;
    }
    return null;
  };

  const handleImageError = (e) => {
    console.error("Error loading profile image:", e);
    setImageError(true);
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      getDisplayName()
    )}&background=0d6efd&color=fff&size=40`;
  };

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
             <div className="header-actions d-flex align-items-center">
               
               {/* Language Toggle - Visible on all screens now */}
               <div className="btn-group me-1 me-sm-2" role="group">
                 <Button
                   variant={language === 'hi' ? "dark" : "outline-dark"}
                   size="sm"
                   onClick={() => setLanguage('hi')}
                   className="fw-semibold"
                   style={{
                      ...(language === 'hi' ? { backgroundColor: 'black', borderColor: 'black', color: 'white' } : {}),
                      fontSize: '0.75rem', // Smaller font on mobile to fit
                      padding: '0.25rem 0.5rem'
                   }}
                 >
                   हिन्दी
                 </Button>
                 <Button
                   variant={language === 'en' ? "dark" : "outline-dark"}
                   size="sm"
                   onClick={() => setLanguage('en')}
                   className="fw-semibold"
                   style={{
                      ...(language === 'en' ? { backgroundColor: 'black', borderColor: 'black', color: 'white' } : {}),
                      fontSize: '0.75rem', // Smaller font on mobile to fit
                      padding: '0.25rem 0.5rem'
                   }}
                 >
                   EN
                 </Button>
               </div>

               {/* Grooming Class Button - Visible on all screens now */}
               <div
                  onClick={() => navigate("/GroomingClasses")}
                  style={{
                    background: "#383be8",
                    color: "#fff",
                    padding: "4px 10px", // Tighter padding
                    borderRadius: "6px",
                    fontSize: "0.7rem", // Smaller font on mobile
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "inline-block",
                    marginRight: "8px",
                    whiteSpace: "nowrap",
                    textAlign: "center"
                  }}
               >
                  {language === 'hi' ? "ग्रूमिंग क्लास" : "Grooming Class"}
               </div>

               {/* Notifications Dropdown */}
              <Dropdown
                show={showNotificationDropdown}
                onToggle={(isOpen) => setShowNotificationDropdown(isOpen)}
                align="end"
                className="me-2"
              >
                <Dropdown.Toggle variant="light" className="notification-btn border-0 bg-transparent">
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <FaBell size={20} />
                    {unreadCount > 0 && (
                      <Badge 
                        pill 
                        bg="danger" 
                        className="notification-badge" 
                        style={{ 
                          position: 'absolute', 
                          top: '4px', 
                          right: '-8px',
                          fontSize: '0.6rem',
                          transform: 'translate(50%, -50%)'
                        }}
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu
                  className="notification-dropdown shadow border-0"
                  style={{ width: "350px", maxHeight: "450px", overflowY: "auto", zIndex: 1050 }}
                >
                  <div
                    className="d-flex justify-content-between align-items-center p-2 border-bottom bg-light"
                    style={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "#f8f9fa",
                      zIndex: 1,
                    }}
                  >
                    <span style={{ fontWeight: "600", color: "#333" }}>
                      {language === 'hi' ? "सूचनाएं" : "Notifications"}
                    </span>
                    {unreadCount > 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={handleMarkAllSeen}
                        style={{ padding: "0", fontSize: "0.8rem", color: "#007bff" }}
                      >
                        {language === 'hi' ? "सब पढ़ा हुआ" : "Mark all read"}
                      </Button>
                    )}
                  </div>

                  {notificationsLoading ? (
                    <div className="p-4 text-center">
                      <Spinner animation="border" size="sm" />
                    </div>
                  ) : apiError ? (
                    <div className="p-3 text-center text-danger small">
                      {apiError}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted">
                      <small>{language === 'hi' ? "कोई सूचना नहीं मिली" : "No notifications found"}</small>
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notification) => (
                      <Dropdown.Item
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        style={{
                          backgroundColor: notification.type === "admin"
                            ? notification.seen
                              ? "#fff3cd"
                              : "#fff8e1"
                            : notification.seen
                            ? "white"
                            : "#f0f7ff",
                          borderBottom: "1px solid #eee",
                          padding: "12px",
                          whiteSpace: "normal",
                          borderLeft:
                            notification.type === "admin"
                              ? "4px solid #dc3545"
                              : "none",
                        }}
                      >
                        <div className="d-flex align-items-start">
                          <div
                            className="me-2 d-flex align-items-center justify-content-center text-white"
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              backgroundColor:
                                notification.type === "admin"
                                  ? notification.seen
                                    ? "#ffc107"
                                    : "#dc3545"
                                  : notification.seen
                                  ? "#6c757d"
                                  : "#667eea",
                              flexShrink: 0,
                            }}
                          >
                            <i
                              className={`bi ${getNotificationIcon(notification.type)}`}
                            ></i>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              className="fw-bold"
                              style={{
                                fontSize: "0.85rem",
                                color: notification.seen ? "#555" : "#000",
                              }}
                            >
                              {notification.title || (language === 'hi' ? "सूचना" : "Notification")}
                            </div>
                            <div
                              className="text-muted"
                              style={{
                                fontSize: "0.8rem",
                                marginBottom: "2px",
                              }}
                            >
                              {notification.message || (language === 'hi' ? "कोई विवरण उपलब्ध नहीं है।" : "No details available.")}
                            </div>
                            <div
                              className="text-muted"
                              style={{
                                fontSize: "0.7rem",
                                marginTop: "2px",
                                fontStyle: "italic",
                              }}
                            >
                              {formatTime(notification.time)}
                            </div>
                          </div>
                          {!notification.seen && (
                            <div
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: "#dc3545",
                                flexShrink: 0,
                                marginLeft: "8px",
                                marginTop: "4px",
                              }}
                            />
                          )}
                        </div>
                      </Dropdown.Item>
                    ))
                  )}
                </Dropdown.Menu>
              </Dropdown>

              {/* User Profile Dropdown */}
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  className="user-profile-btn d-flex align-items-center"
                  style={{
                    gap: "4px",
                    border: "1px solid #e5e7eb",
                    padding: "2px 6px",
                  }}
                >
                  {getUserPhotoUrl() ? (
                    <Image
                      src={getUserPhotoUrl()}
                      roundedCircle
                      className="user-avatar"
                      onError={handleImageError}
                      style={{
                        width: 28,
                        height: 28,
                        objectFit: "cover",
                      }}
                      alt="User"
                    />
                  ) : (
                    <FaUserCircle style={{ fontSize: 24, color: "rgb(250 93 77)" }} />
                  )}
                  {/* Name hidden on mobile to save space for other buttons, but Avatar remains visible */}
                  <span style={{ fontWeight: 500, fontSize: "0.85rem" }} className="d-none d-md-inline">
                    {getDisplayName()}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> {language === 'hi' ? "लॉगआउट" : "Logout"}
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

export default UserHeader;