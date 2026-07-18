import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../all_login/AuthContext";
import "../../assets/css/userleftnav.css"
import { useLanguage } from "../all_login/LanguageContext";
import UserHeader from "./UserHeader";
import UserLeftNav from "./UserLeftNav";
import "./UserProfile.css";

const UserProfile = () => {
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  const { uniqueId, accessToken } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    const fetchProfile = async () => {
      if (!uniqueId) {
        setLoading(false);
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

        if (response.data.success) {
          setProfile(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uniqueId, accessToken]);

   const toggleSidebar = () => {
     setSidebarOpen(!sidebarOpen);
   };

   return (
    <div className="dashboard-container">
      <UserLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <UserHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-box mt-3">
          {loading ? (
            <div className="profile-loading">
              <Spinner animation="border" variant="primary" />
              <p>Loading profile...</p>
            </div>
          ) : (
            <Row>
              <Col>
                <Card className="shadow-box mb-3">
                  <Card.Body className="profile-header-card">
                    <div className="profile-header-row">
                      <div className="profile-avatar">
                        {profile?.profile_picture ? (
                          <img src={profile.profile_picture} alt={profile.full_name} />
                        ) : (
                          <i className="bi bi-person-fill"></i>
                        )}
                      </div>
                       <div className="profile-info">
                         <h2>{profile?.full_name || (language === 'hi' ? "यूजर" : "User")}</h2>
                         <p className="student-id">
                           <i className="bi bi-person-badge"></i>
                           {profile?.student_id}
                         </p>
                       </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {!loading && (
            <Row>
              <Col lg={8}>
                <Card className="shadow-box mb-3">
                  <Card.Body>
                    <h5 className="section-title">{language === 'hi' ? "व्यक्तिगत जानकारी" : "Personal Information"}</h5>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>{language === 'hi' ? "पूरा नाम" : "Full Name"}</label>
                        <span>{profile?.full_name || "-"}</span>
                      </div>
                       <div className="info-item">
                         <label>{language === 'hi' ? "आधार संख्या" : "Aadhaar Number"}</label>
                         <span>{profile?.aadhaar_no ? profile.aadhaar_no.length > 4 ? 'xxxx-xxxx-' + profile.aadhaar_no.slice(-4) : profile.aadhaar_no : "-"}</span>
                       </div>
                      <div className="info-item">
                        <label>{language === 'hi' ? "फोन" : "Phone"}</label>
                        <span>{profile?.phone || "-"}</span>
                      </div>
                      <div className="info-item">
                        <label>{language === 'hi' ? "ईमेल" : "Email"}</label>
                        <span>{profile?.email || "-"}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="shadow-box mb-3">
                  <Card.Body>
                    <h5 className="section-title">{language === 'hi' ? "शैक्षणिक विवरण" : "Academic Details"}</h5>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>{language === 'hi' ? "कक्षा" : "Class"}</label>
                        <span>{profile?.class_name || "-"}</span>
                      </div>
                      <div className="info-item">
                        <label>{language === 'hi' ? "एसोसिएट विंग" : "Associate Wing"}</label>
                        <span>{profile?.associate_wings || "-"}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="shadow-box mb-3 location-card">
                  <Card.Body>
                    <h5 className="section-title">{language === 'hi' ? "स्थान विवरण" : "Location Details"}</h5>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>{language === 'hi' ? "राज्य" : "State"}</label>
                        <span>{profile?.state || "-"}</span>
                      </div>
                      <div className="info-item">
                        <label>{language === 'hi' ? "ज़िला" : "District"}</label>
                        <span>{profile?.district || "-"}</span>
                      </div>
                      <div className="info-item">
                        <label>{language === 'hi' ? "ब्लॉक" : "Block"}</label>
                        <span>{profile?.block || "-"}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="shadow-box mb-3">
                  <Card.Body>
                    <h5 className="section-title">{language === 'hi' ? "खाता जानकारी" : "Account Info"}</h5>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>{language === 'hi' ? "पंजीकरण तिथि" : "Registered On"}</label>
                        <span>
                          {profile?.created_at
                            ? new Date(profile.created_at).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </div>
  );
};

export default UserProfile;