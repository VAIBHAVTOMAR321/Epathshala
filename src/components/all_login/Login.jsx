import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Assuming axios is installed and configured
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
      title: "Welcome to ePathshala",
      subtitle: "Your gateway to knowledge and success. Please sign in.",
      welcome: "Welcome Back!",
      welcomeSub: "Continue your learning journey",
      roleLabel: "Select Your Role",
      emailPhone: "Email or Phone",
      emailPhonePlaceholder: "Enter email or phone",
      schoolId: "Institution ID",
      schoolIdPlaceholder: "Enter institution ID",
      aadhaar: "Aadhaar Number",
      aadhaarPlaceholder: "Enter 12-digit Aadhaar",
      password: "Password",
      passwordPlaceholder: "Enter password",
      remember: "Remember me",
      signIn: "Sign In",      signingIn: "Signing In...",
      newHere: "New here?",
      createAccount: "Create an account",
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
        'admin': 'Admin', 'school': 'Institution'
      }
    },
    hi: {
      title: "ePathshala में आपका स्वागत है",
      subtitle: "ज्ञान और सफलता का आपका प्रवेश द्वार। कृपया साइन इन करें।",
      welcome: "पुनः स्वागत है!",
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
      newHere: "यहाँ नए हैं?",
      createAccount: "खाता बनाएं",
      validation: {
        emailRequired: "ईमेल/फोन आवश्यक है",
        schoolIdRequired: "शैक्षणिक संस्था आईडी आवश्यक है",
        aadhaarRequired: "आधार नंबर आवश्यक है",
        passwordRequired: "पासवर्ड आवश्यक है",
        loginSuccess: "लॉगिन सफल!",
        loginFailed: "लॉगिन विफल। कृपया पुनः प्रयास करें।"
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
    { value: 'school', label: t.roles['school'], icon: 'bi-building' },
    { value: 'admin', label: t.roles['admin'], icon: 'bi-person-workspace' },
  ];

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData({
      ...formData,
      role: newRole,
      // Reset other fields when role changes
      email_or_phone: '',
      aadhaar_no: '',
      school_id: '',
      password: '',
    });
    setError('');
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let currentError = '';
    switch (formData.role) {
      case 'admin':
        if (!formData.email_or_phone) currentError = t.validation.emailRequired;
        break;
      case 'school':
        if (!formData.school_id) currentError = t.validation.schoolIdRequired;
        break;
      default:
        if (!formData.aadhaar_no) currentError = t.validation.aadhaarRequired;
        break;
    }
    if (!formData.password && !currentError) currentError = t.validation.passwordRequired;
    if (currentError) {
      setError(currentError); return;
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
        'https://brjobsedu.com/epathshala/epathshala_backend/api/login/',
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
      <div className="login-container">
        <div className="login-header">
          <i className="bi bi-mortarboard-fill login-logo"></i>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="role-selector">
            <label>{t.roleLabel}</label>
            <div className="role-radio-group">
              {roleOptions.map((option) => (
                <div key={option.value} className="role-radio-item">
                  <input
                    type="radio"
                    id={option.value}
                    name="role"
                    value={option.value}
                    checked={formData.role === option.value}
                    onChange={handleRoleChange}
                  />
                  <label htmlFor={option.value}>
                    <i className={option.icon}></i>
                    <span>{option.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="alert-message error">
              <i className="bi bi-x-circle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          {formData.role === 'admin' && (
            <div className="form-group">
              <label>{t.emailPhone}</label>
              <div className="input-wrapper">
                <i className="bi bi-person-fill"></i>
                <input type="text" name="email_or_phone" value={formData.email_or_phone} onChange={handleChange} placeholder={t.emailPhonePlaceholder} />
              </div>
            </div>
          )}
          {formData.role === 'school' && (
              <div className="form-group">
                <label>{t.schoolId}</label>
                <div className="input-wrapper">
                  <i className="bi bi-building-fill"></i>
                  <input
                    type="text"
                    name="school_id"
                    value={formData.school_id}
                    onChange={handleChange}
                    placeholder={t.schoolIdPlaceholder}
                  />
                </div>
              </div>
          )}
          {formData.role.includes('student') && (
              <div className="form-group">
                <label>{t.aadhaar}</label>
                <div className="input-wrapper">
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
              <i className="bi bi-lock-fill"></i>
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
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i className={showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : t.signIn}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {t.newHere}{' '}
            <Link to="/register">{t.createAccount}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;