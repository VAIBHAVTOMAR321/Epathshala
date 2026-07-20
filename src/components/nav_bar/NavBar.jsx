import React, { useState, useEffect } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../all_login/LanguageContext";
import "../../assets/css/navbar.css"
import gyandharaLogo from "../../assets/images/gyandharalogo.jpeg";

function NavBar() {
  const [expanded, setExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

   return (
     <Navbar expand="lg" expanded={expanded} onToggle={setExpanded} fixed="top" className={`custom-navbar ${scrolled ? "scrolled" : ""}`}>
       <Container>
         <Navbar.Brand as={Link} to="/" className="brand-logo-wrapper">
           <img 
             src={gyandharaLogo} 
             alt="gyandhara Logo" 
             className="navbar-logo"
           />
          <span style={{
  fontWeight: '800',
  fontSize: '18px', // Increased slightly for logo visibility, adjust as needed
  marginLeft: '10px',
  verticalAlign: 'middle',
  display: 'inline-flex',
  alignItems: 'center',

}}>
  <span style={{ 
    color: '#3d3fac', 
     fontWeight: '800',// Golden Amber color for 'e' to make it pop
   // Optional: italicizes the 'e' for a modern logo look
    marginRight: '2px'
    
  }}>
    e
  </span>
  <span style={{ 
    color: '#010508' // Navy Blue for 'Pathshala'
  }}>
    Pathshala
  </span>
</span>
         </Navbar.Brand>

          {/* Mobile Language Toggle - Visible only on mobile */}
          <Button 
            variant="outline-primary" 
            size="sm"
            className="mobile-language-toggle"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            style={{ color: '#000', borderColor: '#000', backgroundColor: 'white' }}
          >
            <i className="bi bi-translate"></i>
            {language === 'en' ? 'हिन्दी' : 'English'}
          </Button>

         <Navbar.Toggle aria-controls="basic-navbar-nav" className="navbar-toggler-custom">
           <span className="toggler-line"></span>
           <span className="toggler-line"></span>
           <span className="toggler-line"></span>
         </Navbar.Toggle>

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto nav-links">
              <Nav.Link as={Link} to="/" className={`nav-link-item ${location.pathname === "/" ? "active" : ""}`} onClick={() => setExpanded(false)}>
                <span className="nav-link-dot"></span>
                {language === 'hi' ? 'होम' : 'Home'}
              </Nav.Link>

              <Nav.Link as={Link} to="/CourseItems" className={`nav-link-item ${location.pathname === "/CourseItems" ? "active" : ""}`} onClick={() => setExpanded(false)}>
                <span className="nav-link-dot"></span>
                {language === 'hi' ? 'कोर्स' : 'Courses'}
              </Nav.Link>
            </Nav>

            <Nav className="ms-auto nav-actions">
               <Nav.Link as={Link} to="/login" className="login-btn-nav" onClick={() => setExpanded(false)}>
                 <i className="bi bi-box-arrow-in-right"></i>
                 {language === 'hi' ? 'लॉगिन' : 'Login'}
               </Nav.Link>

               <Nav.Link as={Link} to="/StudentRegistration" className="register-btn" onClick={() => setExpanded(false)}>
                 <i className="bi bi-person-plus-fill"></i>
                 {language === 'hi' ? 'अभी पंजीकरण करें' : 'Register Now'}
                 <span className="register-btn-arrow">→</span>
               </Nav.Link>

              {/* Desktop Language Toggle - Hidden on mobile */}
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="language-toggle-btn desktop-language-toggle"
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              >
                <i className="bi bi-translate me-1"></i>
                {language === 'en' ? 'हिन्दी' : 'English'}
              </Button>
            </Nav>
          </Navbar.Collapse>
       </Container>
     </Navbar>
   );
}

export default NavBar;