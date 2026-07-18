import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import './login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    role: '9th-student',
    email_or_phone: '',
    aadhaar_no: '',
    school_id: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { language } = useLanguage();

  const navigate = useNavigate();
  const { login } = useAuth();

  const content = {
    en: {
      title: "Epathshala",
      subtitle: "Skill Today, Empower Tomorrow",
      welcome: "Welcome Back!",
      welcomeSub: "Continue your learning journey",
      roleLabel: "Select Your Role",
      emailPhone: "Email / Phone",
      emailPhonePlaceholder: "Enter email or phone",
      schoolId: "Institution ID",
      schoolIdPlaceholder: "Enter institution ID",
      aadhaar: "Aadhaar Number",
      aadhaarPlaceholder: "Enter 12-digit Aadhaar",
      password: "Password",
      passwordPlaceholder: "Enter password",
      remember: "Remember me",
      signIn: "Sign In",
      signingIn: "Signing in...",
      newStudent: "New student?",
      register: "Register here",
      highlights: {
        learn: { title: "Learn", desc: "Access quality education and new courses" },
        grow: { title: "Grow", desc: "Track your academic progress" },
        succeed: { title: "Succeed", desc: "Build your career from class 9 to 12" }
      },
      validation: {
        emailRequired: "Email/Phone is required",
        schoolIdRequired: "Institution ID is required",
        aadhaarRequired: "Aadhaar number is required",
        passwordRequired: "Password is required",
        loginSuccess: "Login successful!",
        loginFailed: "Login failed. Please try again."
      },
      roles: {
        '9th-student': '9th Student', '10th-student': '10th Student',
        '11th-student': '11th Student', '12th-student': '12th Student',
        'admin': 'Admin', 'school': 'School'
      }
    },
    hi: {
      title: "Epathshala",
      subtitle: "करियर बनाना, भविष्य संवारना",
      welcome: "आपका स्वागत है!",
      welcomeSub: "अपनी सीखने की यात्रा जारी रखें",
      roleLabel: "अपनी भूमिका चुनें",
      emailPhone: "ईमेल / फोन",
      emailPhonePlaceholder: "ईमेल या फोन दर्ज करें",
      schoolId: "शैक्षणिक संस्था आईडी",
      schoolIdPlaceholder: "शैक्षणिक संस्था आईडी दर्ज करें",
      aadhaar: "आधार नंबर",
      aadhaarPlaceholder: "12-अंकीय आधार दर्ज करें",
      password: "पासवर्ड",
      passwordPlaceholder: "पासवर्ड दर्ज करें",
      remember: "मुझे याद रखें",
      signIn: "साइन इन करें",
      signingIn: "साइन इन हो रहा है...",
      newStudent: "नए छात्र?",
      register: "यहाँ पंजीकरण करें",
      highlights: {
        learn: { title: "सीखें", desc: "गुणवत्तापूर्ण शिक्षा और नए पाठ्यक्रमों तक पहुंचें" },
        grow: { title: "बढ़ें", desc: "अपनी शैक्षणिक प्रगति को ट्रैक करें" },
        succeed: { title: "सफल हों", desc: "कक्षा 9 से 12 तक अपना करियर बनाएं" }
      },
      validation: {
        emailRequired: "ईमेल/फोन आवश्यक है",
        schoolIdRequired: "शैक्षणिक संस्था आईडी आवश्यक है",
        aadhaarRequired: "आधार नंबर आवश्यक है",
        passwordRequired: "पासवर्ड आवश्यक है",
        loginSuccess: "लॉगिन सफल!",
        loginFailed: "लॉगिन विफल रहा। कृपया पुनः प्रयास करें।"
      },
      roles: {
        '9th-student': '9वीं छात्र', '10th-student': '10वीं छात्र',
        '11th-student': '11वीं छात्र', '12th-student': '12वीं छात्र',
        'admin': 'एडमिन', 'institution': 'शैक्षणिक संस्था'
      }
    }
  };

  const t = content[language] || content.en;

  const roleOptions = [
    { value: '9th-student', label: t.roles['9th-student'], icon: 'bi-mortarboard' },
    { value: '10th-student', label: t.roles['10th-student'], icon: 'bi-mortarboard' },
    { value: '11th-student', label: t.roles['11th-student'], icon: 'bi-mortarboard' },
    { value: '12th-student', label: t.roles['12th-student'], icon: 'bi-mortarboard' },
    { value: 'admin', label: t.roles['admin'], icon: 'bi-shield-lock' },
    { value: 'school', label: t.roles['school'], icon: 'bi-building' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.role === 'admin' && !formData.email_or_phone) {
      setError(t.validation.emailRequired);
      return;
    }
    if (formData.role === 'school' && !formData.school_id) {
      setError(t.validation.schoolIdRequired);
      return;
    }
    if (formData.role !== 'admin' && formData.role !== 'school' && !formData.aadhaar_no) {
      setError(t.validation.aadhaarRequired);
      return;
    }
    if (!formData.password) {
      setError(t.validation.passwordRequired);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        role: formData.role,
        password: formData.password,
      };

      if (formData.role === 'admin') {
        payload.email_or_phone = formData.email_or_phone;
      } else if (formData.role === 'school') {
        payload.school_id = formData.school_id;
      } else {
        payload.aadhaar_no = formData.aadhaar_no;
      }

      const response = await axios.post(
        'https://brjobsedu.com/Epathshala/Epathshala_backend/api/login/',
        payload
      );

      if (response.data.access) {
        login({
          access: response.data.access,
          refresh: response.data.refresh,
          role: response.data.role,
          unique_id: response.data.unique_id,
          user: response.data.user || null,
        });
        alert(t.validation.loginSuccess);
        
        if (response.data.role === 'admin') {
          navigate('/DashBord');
        } else if (response.data.role === 'school') {
          navigate('/SchoolDashBoard');
        } else {
          navigate('/UserDashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || t.validation.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-pattern"></div>
      <div className="login-container">
        <div className="login-content">
          <div className="login-header">
            <div className="brand-logo">
              <i className="bi bi-mortarboard-fill"></i>
            </div>
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>

          <div className="welcome-section">
            <h2>{t.welcome}</h2>
            <p>{t.welcomeSub}</p>
          </div>

          <div className="role-selector">
            <label>{t.roleLabel}</label>
            <div className="role-tabs">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`role-tab ${formData.role === option.value ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role: option.value })}
                >
                  <i className={option.icon}></i>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="alert-message error">
                <i className="bi bi-exclamation-circle"></i>
                {error}
              </div>
            )}

            {formData.role === 'admin' ? (
              <div className="form-group">
                <label>{t.emailPhone}</label>
                <div className="input-wrapper-text">
                  <i className="bi bi-person"></i>
                  <input
                    type="text"
                    name="email_or_phone"
                    value={formData.email_or_phone}
                    onChange={handleChange}
                    placeholder={t.emailPhonePlaceholder}
                  />
                </div>
              </div>
            ) : formData.role === 'school' ? (
              <div className="form-group">
                <label>{t.schoolId}</label>
                <div className="input-wrapper-text">
                  <i className="bi bi-building"></i>
                  <input
                    type="text"
                    name="school_id"
                    value={formData.school_id}
                    onChange={handleChange}
                    placeholder={t.schoolIdPlaceholder}
                  />
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label>{t.aadhaar}</label>
                <div className="input-wrapper-text">
                  <i className="bi bi-person-badge"></i>
                  <input
                    type="text"
                    name="aadhaar_no"
                    value={formData.aadhaar_no}
                    onChange={handleChange}
                    placeholder={t.aadhaarPlaceholder}
                    maxLength="12"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>{t.password}</label>
              <div className="input-wrapper">
                <i className="bi bi-lock"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t.passwordPlaceholder}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>{t.remember}</span>
              </label>
              {/* <a href="/" className="forgot-link">Forgot password?</a> */}
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  {t.signingIn}
                </>
              ) : (
                t.signIn
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>{t.newStudent} <Link to="/register">{t.register}</Link></p>
          </div>
        </div>

        <div className="login-highlights">
          <div className="highlight-item">
            <i className="bi bi-book"></i>
              <h3>{t.highlights.learn.title}</h3>
              <p>{t.highlights.learn.desc}</p>
          </div>
          <div className="highlight-item">
            <i className="bi bi-graph-up"></i>
              <h3>{t.highlights.grow.title}</h3>
              <p>{t.highlights.grow.desc}</p>
          </div>
          <div className="highlight-item">
            <i className="bi bi-rocket-takeoff"></i>
              <h3>{t.highlights.succeed.title}</h3>
              <p>{t.highlights.succeed.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;