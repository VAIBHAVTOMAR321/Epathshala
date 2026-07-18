import React from "react";
import { Link } from "react-router-dom";
import gyandharaLogo from "../../assets/images/gyandharalogo.jpeg";
import { useLanguage } from "../all_login/LanguageContext";
import "../../assets/css/footer.css";

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function Footer() {
  const { language } = useLanguage();

  const content = {
    en: {
      description: "Your comprehensive educational platform delivering knowledge, career guidance, skill development, and academic excellence for students, schools, and administrators",
      quickLinks: "Quick Links",
      home: "Home",
      login: "Login",
      register: "Register",
      services: "Services",
      careerGuidance: "Career Guidance",
      govSchemes: "Government Schemes",
      groomingClasses: "Grooming Classes",
      competitions: "Competitions",
      jobOpenings: "Job Openings",
      contactUs: "Contact Us",
      india: "India",
      copyright: "© 2026 epathshala. All rights reserved. | Designed by BrainRock.",
      backToTop: "Back to Top"
    },
    hi: {
      description: "छात्रों, शैक्षणिक संस्था और प्रशासकों के लिए ज्ञान, करियर मार्गदर्शन, कौशल विकास और शैक्षणिक उत्कृष्टता प्रदान करने वाला आपका व्यापक शैक्षिक मंच gyandhara",
      quickLinks: "त्वरित लिंक",
      home: "होम",
      login: "लॉगिन",
      register: "पंजीकरण",
      services: "सेवाएं",
      careerGuidance: "करियर मार्गदर्शन",
      govSchemes: "सरकारी योजनाएं",
      groomingClasses: "व्यक्तित्व विकास कक्षाएं",
      competitions: "प्रतियोगिताएं",
      jobOpenings: "नौकरी के अवसर",
      contactUs: "हमसे संपर्क करें",
      india: "भारत",
      copyright: "© 2026 gyandhara। सर्वाधिकार सुरक्षित। | BrainRock द्वारा डिज़ाइन किया गया।",
      backToTop: "ऊपर वापस जाएं"
    }
  };

  const t = content[language] || content.en;

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          {/* Logo and Brand Section */}
          <div className="footer-brand-section">
            <div className="footer-logo-section">
              <img src={gyandharaLogo} alt="gyandhara Logo" className="footer-logo" />
             
            </div>
            <p className="footer-description">
              {t.description}
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links-section">
            <h4 className="footer-section-title">{t.quickLinks}</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link" onClick={scrollToTop}>{t.home}</Link></li>
              <li><Link to="/login" className="footer-link" onClick={scrollToTop}>{t.login}</Link></li>
              <li><Link to="/StudentRegistration" className="footer-link" onClick={scrollToTop}>{t.register}</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-services-section">
            <h4 className="footer-section-title">{t.services}</h4>
            <ul className="footer-links">
              <li><span className="footer-link-text clickable" onClick={scrollToTop}>{t.careerGuidance}</span></li>
              <li><span className="footer-link-text clickable" onClick={scrollToTop}>{t.govSchemes}</span></li>
              <li><span className="footer-link-text clickable" onClick={scrollToTop}>{t.groomingClasses}</span></li>
              <li><span className="footer-link-text clickable" onClick={scrollToTop}>{t.competitions}</span></li>
              <li><span className="footer-link-text clickable" onClick={scrollToTop}>{t.jobOpenings}</span></li>
            </ul>
          </div>

          {/* Contact Info */}
           <div className="footer-services-section">
            <h4 className="footer-section-title">{t.contactUs}</h4>
            <ul className="footer-links">
              <li><span className="footer-link-text">91-8193991148</span></li>
              <li><span className="footer-link-text">admin@brainrock.in</span></li>
              <li><span className="footer-link-text">{t.india}</span></li>
            </ul>
          </div>
        
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            {t.copyright}
          </div>
          <div className="footer-bottom-links">
            <span className="footer-scroll-top" onClick={scrollToTop}>
              <i className="bi bi-arrow-up-circle"></i> {t.backToTop}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
