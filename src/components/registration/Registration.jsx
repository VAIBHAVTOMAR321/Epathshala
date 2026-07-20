import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useLanguage } from '../all_login/LanguageContext';
import './registration.css';

const Registration = () => {
  const [activeTab, setActiveTab] = useState('school');
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Registration",
      subtitle: "Skill today, empower tomorrow",
      schoolTab: "Institution Registration",
      studentTab: "Student Registration",
      schoolId: "Institution ID",
      state: "State",
      district: "District",
      block: "Block",
      schoolName: "Institution Name",
      password: "Password",
      confirmPassword: "Confirm Password",
      registerSchool: "Register Institution",
      alreadyAccount: "Already have an account? Login here",
      aadhaarNo: "Aadhaar Number",
      aadhaarPlaceholder: "12 digits",
      checkBtn: "Check",
      verifyingBtn: "Verifying...",
      changeBtn: "Change",
      alreadyRegistered: "Already Registered!",
      alreadyRegisteredMsg: "This Aadhaar number is already associated with a student account.",
      verifiedDetails: "Verified Aadhaar Details",
      fullName: "Full Name",
      mobileLabel: "Mobile Number",
      mobilePlaceholder: "10 digits",
      emailLabel: "Email",
      emailPlaceholder: "Email",
      classLabel: "Class",
      selectClass: "Select class",
      selectSchool: "Select Institution",
      additionalInfo: "Additional Information",
      registerStudentBtn: "Register as Student",
      registeringBtn: "Registering...",
      validation: {
        fullNameReq: "Full name is required",
        aadhaarReq: "Aadhaar number is required",
        aadhaar12: "Aadhaar number must be 12 digits",
        phoneReq: "Phone number is required",
        phone10: "Phone number must be 10 digits",
        emailReq: "Email is required",
        emailValid: "Please enter a valid email",
        passReq: "Password is required",
        pass6: "Password must be at least 6 characters",
        passMatch: "Passwords do not match",
        classReq: "Please select a class",
        schoolReq: "Institution name is required",
        districtReq: "Please select a district",
        blockReq: "Please select a block",
        studentSuccess: "Student Registration successful! You can now login.",
        schoolSuccess: "Institution Registration successful! You can now login.",
        failed: "Registration failed. Please try again."
      }
    },
    hi: {
      title: "पंजीकरण",
      subtitle: "आज कौशल, कल सशक्त",
      schoolTab: "शैक्षणिक संस्था पंजीकरण",
      studentTab: "छात्र पंजीकरण",
      schoolId: "शैक्षणिक संस्था आईडी",
      state: "राज्य",
      district: "जिला",
      block: "ब्लॉक",
      schoolName: "शैक्षणिक संस्था का नाम",
      password: "पासवर्ड",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      registerSchool: "शैक्षणिक संस्था पंजीकृत करें",
      alreadyAccount: "क्या आपके पास पहले से खाता है? यहाँ लॉगिन करें",
      aadhaarNo: "आधार नंबर",
      aadhaarPlaceholder: "12 अंक",
      checkBtn: "जांचें",
      verifyingBtn: "सत्यापित किया जा रहा है...",
      changeBtn: "बदलें",
      alreadyRegistered: "पहले से पंजीकृत!",
      alreadyRegisteredMsg: "यह आधार नंबर पहले से ही एक छात्र खाते से जुड़ा हुआ है।",
      verifiedDetails: "सत्यापित आधार विवरण",
      fullName: "पूरा नाम",
      mobileLabel: "मोबाइल नंबर",
      mobilePlaceholder: "10 अंक",
      emailLabel: "ईमेल",
      emailPlaceholder: "ईमेल",
      classLabel: "कक्षा",
      selectClass: "कक्षा चुनें",
      selectSchool: "शैक्षणिक संस्था का चयन करें",
      additionalInfo: "अतिरिक्त जानकारी",
      registerStudentBtn: "छात्र के रूप में पंजीकरण करें",
      registeringBtn: "पंजीकरण हो रहा है...",
      validation: {
        fullNameReq: "पूरा नाम आवश्यक है",
        aadhaarReq: "आधार नंबर आवश्यक है",
        aadhaar12: "आधार नंबर 12 अंकों का होना चाहिए",
        phoneReq: "फोन नंबर आवश्यक है",
        phone10: "फोन नंबर 10 अंकों का होना चाहिए",
        emailReq: "ईमेल आवश्यक है",
        emailValid: "कृपया एक वैध ईमेल दर्ज करें",
        passReq: "पासवर्ड आवश्यक है",
        pass6: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
        passMatch: "पासवर्ड मेल नहीं खाते",
        classReq: "कृपया एक कक्षा चुनें",
        schoolReq: "शैक्षणिक संस्था का नाम आवश्यक है",
        districtReq: "कृपया एक जिला चुनें",
        blockReq: "कृपया एक ब्लॉक चुनें",
        studentSuccess: "छात्र पंजीकरण सफल! अब आप लॉगिन कर सकते हैं।",
        schoolSuccess: "शैक्षणिक संस्था पंजीकरण सफल! अब आप लॉगिन कर सकते हैं।",
        failed: "पंजीकरण विफल रहा। कृपया पुनः प्रयास करें।"
      }
    }
  };

  const t = content[language] || content.en;
  
  const [studentData, setStudentData] = useState({
    full_name: '',
    aadhaar_no: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: '',
    state: 'Uttarakhand',
    district: '',
    block: '',
    class_name: '',
    school_name: '',
    school_uni_id: '',
  });

  const [schoolData, setSchoolData] = useState({
    school_id: '',
    school_name: '',
    password: '',
    confirm_password: '',
    state: 'Uttarakhand',
    district: '',
    block: '',
  });

  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [schools, setSchools] = useState([]);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [verifyingAadhaar, setVerifyingAadhaar] = useState(false);
  const [aadhaarExists, setAadhaarExists] = useState(null);
  const [checkingAadhaar, setCheckingAadhaar] = useState(false);

  const classOptions = ['9th', '10th', '11th', '12th'];

  React.useEffect(() => {
    fetchDistricts();
  }, []);

  React.useEffect(() => {
    if (studentData.district) {
      fetchBlocks(studentData.district);
    } else {
      setBlocks([]);
    }
  }, [studentData.district]);

  React.useEffect(() => {
    if (schoolData.district) {
      fetchBlocks(schoolData.district);
    } else {
      setBlocks([]);
    }
  }, [schoolData.district]);

  const fetchDistricts = async () => {
    setLoadingDistricts(true);
    try {
      const response = await axios.get(
        'https://brjobsedu.com/epathshala/epathshala_backend/api/district-blocks/'
      );
      if (response.data.status && response.data.data.districts) {
        setDistricts(response.data.data.districts);
      }
    } catch (err) {
      console.error('Error fetching districts:', err);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const fetchBlocks = async (district) => {
    setLoadingBlocks(true);
    try {
      const response = await axios.get(
        `https://brjobsedu.com/epathshala/epathshala_backend/api/district-blocks/?district=${district}`
      );
      if (response.data.status && response.data.data.blocks) {
        setBlocks(response.data.data.blocks);
      }
    } catch (err) {
      console.error('Error fetching blocks:', err);
    } finally {
      setLoadingBlocks(false);
    }
  };

   const fetchSchools = async (searchTerm = '') => {
     try {
       const response = await axios.get(
         'https://brjobsedu.com/epathshala/epathshala_backend/api/school-list/'
       );
       if (response.data.success && response.data.data) {
         setSchools(response.data.data);
       }
     } catch (err) {
       console.error('Error fetching institutions:', err);
     }
   };

    const verifyAadhaar = async () => {
      if (!studentData.aadhaar_no.trim()) {
        setError(language === 'hi' ? 'कृपया आधार नंबर दर्ज करें' : 'Please enter Aadhaar number');
        return;
      }
      if (!/^\d{12}$/.test(studentData.aadhaar_no)) {
        setError(t.validation.aadhaar12);
        return;
      }

      if (aadhaarExists) {
        setError(language === 'hi' ? 'यह आधार नंबर पहले से ही पंजीकृत है। कृपया दूसरा आधार उपयोग करें या लॉगिन करें।' : 'This Aadhaar number is already registered. Please use a different Aadhaar or login.');
        return;
      }

      setVerifyingAadhaar(true);
      setError('');

      try {
        const response = await axios.get(
          `https://brjobsedu.com/epathshala/epathshala_backend/api/school-details/`,
          { params: { aadhaar_no: studentData.aadhaar_no } }
        );

        if (response.data.success && response.data.data) {
          const data = response.data.data;
          setStudentData(prev => ({
            ...prev,
            full_name: data.full_name || '',
            school_name: data.school_name || '',
            state: data.state || 'Uttarakhand',
            district: data.district || '',
            block: data.block || '',
          }));
          setAadhaarVerified(true);
          setAadhaarExists(false);
        } else {
          setError(language === 'hi' ? 'इस आधार नंबर के लिए कोई छात्र डेटा नहीं मिला' : 'No student data found for this Aadhaar number');
        }
      } catch (err) {
        console.error('Aadhaar verification error:', err);
        setError(
          err.response?.data?.message || (language === 'hi' ? 'आधार सत्यापित करने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to verify Aadhaar. Please try again.')
        );
      } finally {
        setVerifyingAadhaar(false);
      }
    };

    const checkAadhaarExists = async (aadhaarNo) => {
      if (!aadhaarNo || !/^\d{12}$/.test(aadhaarNo)) {
        setAadhaarExists(null);
        return;
      }

      setCheckingAadhaar(true);
      try {
        const response = await axios.get(
          'https://brjobsedu.com/epathshala/epathshala_backend/api/student-aadhaar-list/'
        );

        if (response.data.success && response.data.aadhaar_nos) {
          const exists = response.data.aadhaar_nos.includes(aadhaarNo);
          setAadhaarExists(exists);
        }
      } catch (err) {
        console.error('Error checking Aadhaar list:', err);
        setAadhaarExists(null);
      } finally {
        setCheckingAadhaar(false);
      }
  };

  React.useEffect(() => {
    fetchSchools();
  }, []);

  React.useEffect(() => {
    if (studentData.aadhaar_no.length === 12 && !aadhaarVerified) {
      checkAadhaarExists(studentData.aadhaar_no);
    } else {
      setAadhaarExists(null);
    }
  }, [studentData.aadhaar_no]);

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentData({
      ...studentData,
      [name]: value,
    });
    setError('');
  };

  const handleSchoolChange = (e) => {
    const { name, value } = e.target;
    setSchoolData({
      ...schoolData,
      [name]: value,
    });
    if (name === 'district') {
      setSchoolData(prev => ({ ...prev, block: '' }));
    }
    setError('');
  };

   const validateStudentForm = () => {
     if (!studentData.full_name.trim()) {
       setError(t.validation.fullNameReq);
       return false;
     }
     if (!studentData.aadhaar_no.trim()) {
       setError(t.validation.aadhaarReq);
       return false;
     }
     if (!/^\d{12}$/.test(studentData.aadhaar_no)) {
       setError(t.validation.aadhaar12);
       return false;
     }
     if (!studentData.phone.trim()) {
       setError(t.validation.phoneReq);
       return false;
     }
     if (!/^\d{10}$/.test(studentData.phone)) {
       setError(t.validation.phone10);
       return false;
     }
     if (!studentData.email.trim()) {
       setError(t.validation.emailReq);
       return false;
     }
     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentData.email)) {
       setError(t.validation.emailValid);
       return false;
     }
     if (!studentData.password) {
       setError(t.validation.passReq);
       return false;
     }
     if (studentData.password.length < 6) {
       setError(t.validation.pass6);
       return false;
     }
     if (studentData.password !== studentData.confirm_password) {
       setError(t.validation.passMatch);
       return false;
     }
     if (!studentData.class_name) {
       setError(t.validation.classReq);
       return false;
     }
     if (!studentData.school_name) {
       setError(t.validation.schoolReq);
       return false;
     }
     return true;
   };

  const validateSchoolForm = () => {
    if (!schoolData.school_id.trim()) {
      setError(t.validation.aadhaarReq); // Reusing logic for required field
      return false;
    }
    if (!schoolData.district) {
      setError(t.validation.districtReq);
      return false;
    }
    if (!schoolData.block) {
      setError(t.validation.blockReq);
      return false;
    }
    if (!schoolData.school_name.trim()) {
      setError(t.validation.schoolReq);
      return false;
    }
    if (!schoolData.password) {
      setError(t.validation.passReq);
      return false;
    }
    if (schoolData.password.length < 6) {
      setError(t.validation.pass6);
      return false;
    }
    if (schoolData.password !== schoolData.confirm_password) {
      setError(t.validation.passMatch);
      return false;
    }
    return true;
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStudentForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Find school_uni_id from schools list based on school_name
      const selectedSchool = schools.find(
        school => school.school_name === studentData.school_name
      );

      const registrationData = {
        full_name: studentData.full_name,
        aadhaar_no: studentData.aadhaar_no,
        school_uni_id: selectedSchool?.school_uni_id || '',
        school_name: studentData.school_name,
        phone: studentData.phone,
        email: studentData.email,
        password: studentData.password,
        district: studentData.district,
        block: studentData.block,
        state: studentData.state,
        class_name: studentData.class_name,
      };

      await axios.post(
        'https://brjobsedu.com/epathshala/epathshala_backend/api/student-reg/',
        registrationData
      );

      alert(t.validation.studentSuccess);
      setStudentData({
        full_name: '',
        aadhaar_no: '',
        phone: '',
        email: '',
        password: '',
        confirm_password: '',
        state: 'Uttarakhand',
        district: '',
        block: '',
        class_name: '',
        school_name: '',
        school_uni_id: '',
      });
      setBlocks([]);
      setAadhaarVerified(false);
      setSuccess(t.validation.studentSuccess);
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message ||
        t.validation.failed
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateSchoolForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(
        'https://brjobsedu.com/epathshala/epathshala_backend/api/school-reg/',
        {
          school_id: schoolData.school_id,
          school_name: schoolData.school_name,
          district: schoolData.district,
          block: schoolData.block,
          state: schoolData.state,
          password: schoolData.password,
        }
      );

      alert(t.validation.schoolSuccess);
      setSchoolData({
        school_id: '',
        school_name: '',
        password: '',
        confirm_password: '',
        state: 'Uttarakhand',
        district: '',
        block: '',
      });
      setBlocks([]);
      setSuccess(t.validation.schoolSuccess);
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message ||
        t.validation.failed
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-wrapper">
        <div className="registration-header">
          <h1>{t.title}</h1>
          <p className="registration-subtitle">{t.subtitle}</p>
        </div>

        <div className="registration-tabs">
          <button 
            className={`tab-btn ${activeTab === 'school' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('school');
              setError('');
              setSuccess('');
            }}
          >
            {t.schoolTab}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('student');
              setError('');
              setSuccess('');
              // Reset student form state when switching to student tab
              setStudentData({
                full_name: '',
                aadhaar_no: '',
                phone: '',
                email: '',
                password: '',
                confirm_password: '',
                state: 'Uttarakhand',
                district: '',
                block: '',
                class_name: '',
                school_name: '',
                school_uni_id: '',
              });
              setAadhaarVerified(false);
              setBlocks([]);
            }}
          >
            {t.studentTab}
          </button>
        </div>

        {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>{language === 'hi' ? 'त्रुटि!' : 'Error!'}</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>}

        {success && <div className="alert alert-success alert-dismissible fade show" role="alert">
          <strong>{language === 'hi' ? 'सफलता!' : 'Success!'}</strong> {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>}

        {activeTab === 'school' ? (
          <form onSubmit={handleSchoolSubmit} className="registration-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="school_id" className="form-label">
                  {t.schoolId} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="school_id"
                  name="school_id"
                  value={schoolData.school_id}
                  onChange={handleSchoolChange}
                  placeholder="e.g., greenvalley123"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state" className="form-label">
                  {t.state} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="state"
                  name="state"
                  value={schoolData.state}
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="district" className="form-label">
                  {t.district} <span className="required">*</span>
                </label>
                <select
                  className="form-control"
                  id="district"
                  name="district"
                  value={schoolData.district}
                  onChange={handleSchoolChange}
                  disabled={loadingDistricts}
                >
                  <option value="">
                    {loadingDistricts ? 'Loading...' : (language === 'hi' ? 'जिला चुनें' : 'Select district')}
                  </option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="block" className="form-label">
                  {t.block} <span className="required">*</span>
                </label>
                <select
                  className="form-control"
                  id="block"
                  name="block"
                  value={schoolData.block}
                  onChange={handleSchoolChange}
                  disabled={!schoolData.district || loadingBlocks}
                >
                  <option value="">
                    {loadingBlocks ? 'Loading...' : (language === 'hi' ? 'ब्लॉक चुनें' : 'Select block')}
                  </option>
                  {blocks.map((block) => (
                    <option key={block} value={block}>
                      {block}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="school_name" className="form-label">
                  {t.schoolName} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="school_name"
                  name="school_name"
                  value={schoolData.school_name}
                  onChange={handleSchoolChange}
                  placeholder={t.schoolName}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  {t.password} <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={schoolData.password}
                  onChange={handleSchoolChange}
                  placeholder={language === 'hi' ? 'कम से कम 6 अक्षर' : 'Min. 6 chars'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password" className="form-label">
                  {t.confirmPassword} <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="confirm_password"
                  name="confirm_password"
                  value={schoolData.confirm_password}
                  onChange={handleSchoolChange}
                  placeholder={language === 'hi' ? 'पुष्टि करें' : 'Confirm'}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span> {language === 'hi' ? 'पंजीकरण हो रहा है...' : 'Registering...'}
                  </>
                ) : (
                  t.registerSchool
                )}
              </button>
            </div>

            <p className="login-link">
              {language === 'hi' ? 'क्या आपके पास पहले से खाता है?' : 'Already have an account?'} <Link to="/login">{language === 'hi' ? 'यहाँ लॉगिन करें' : 'Login here'}</Link>
            </p>
          </form>
        ) : (
           <form onSubmit={handleStudentSubmit} className="registration-form">
              {/* Aadhaar Verification Section - Always visible first */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="aadhaar_no" className="form-label">
                    {t.aadhaarNo} <span className="required">*</span>
                  </label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      className="form-control"
                      id="aadhaar_no"
                      name="aadhaar_no"
                      value={studentData.aadhaar_no}
                      onChange={handleStudentChange}
                      placeholder={t.aadhaarPlaceholder}
                      maxLength="12"
                      disabled={aadhaarVerified || verifyingAadhaar}
                    />
                    {aadhaarVerified ? (
                      <button
                        type="button"
                        className="btn-aadhaar-check btn-reset"
                        onClick={() => {
                          setAadhaarVerified(false);
                          setAadhaarExists(null);
                          setStudentData(prev => ({
                            ...prev,
                            full_name: '',
                            school_name: '',
                            state: 'Uttarakhand',
                            district: '',
                            block: '',
                          }));
                        }}
                      >
                        {t.changeBtn}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-aadhaar-check"
                        onClick={verifyAadhaar}
                        disabled={verifyingAadhaar || aadhaarExists === true}
                      >
                        {verifyingAadhaar ? t.verifyingBtn : t.checkBtn}
                      </button>
                    )}
                  </div>
                  {aadhaarExists === true && (
                    <div className="alert alert-warning" style={{ marginTop: '6px', padding: '8px 10px', fontSize: '11px' }}>
                      <strong>{t.alreadyRegistered}</strong> {t.alreadyRegisteredMsg}
                    </div>
                  )}
                </div>
              </div>

              {/* Full Registration Form - Visible only after Aadhaar verification */}
              {aadhaarVerified && (
                <>
                  {/* Prefilled Information Section - Read Only */}
                  <div className="prefilled-section">
                    <h3 className="section-title">{t.verifiedDetails}</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="full_name" className="form-label">
                          {t.fullName}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="full_name"
                          name="full_name"
                          value={studentData.full_name}
                          disabled
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="state" className="form-label">
                          {t.state}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="state"
                          name="state"
                          value={studentData.state}
                          disabled
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="district" className="form-label">
                          {t.district}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="district"
                          name="district"
                          value={studentData.district}
                          disabled
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="block" className="form-label">
                          {t.block}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="block"
                          name="block"
                          value={studentData.block}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group full-width">
                        <label htmlFor="school_name" className="form-label">
                          {t.schoolName}
                        </label>
                        <select
                          className="form-control"
                          id="school_name"
                          name="school_name"
                          value={studentData.school_name}
                          onChange={handleStudentChange}
                          disabled
                        >
                          <option value="">{t.selectSchool}</option>
                          {schools.map((school) => (
                            <option key={school.school_uni_id} value={school.school_name}>
                              {school.school_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information Section - Editable */}
                  <div className="editable-section">
                    <h3 className="section-title">{t.additionalInfo}</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="phone" className="form-label">
                          {t.mobileLabel} <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="phone"
                          name="phone"
                          value={studentData.phone}
                          onChange={handleStudentChange}
                          placeholder={t.mobilePlaceholder}
                          maxLength="10"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="email" className="form-label">
                          {t.emailLabel} <span className="required">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={studentData.email}
                          onChange={handleStudentChange}
                          placeholder={t.emailPlaceholder}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="password" className="form-label">
                          Password <span className="required">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="password"
                          name="password"
                          value={studentData.password}
                          onChange={handleStudentChange}
                          placeholder={language === 'hi' ? 'कम से कम 6 अक्षर' : 'Min. 6 chars'}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="confirm_password" className="form-label">
                          Confirm Password <span className="required">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="confirm_password"
                          name="confirm_password"
                          value={studentData.confirm_password}
                          onChange={handleStudentChange}
                          placeholder={language === 'hi' ? 'पुष्टि करें' : 'Confirm'}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group full-width">
                        <label htmlFor="class_name" className="form-label">
                          {t.classLabel} <span className="required">*</span>
                        </label>
                        <select
                          className="form-control"
                          id="class_name"
                          name="class_name"
                          value={studentData.class_name}
                          onChange={handleStudentChange}
                        >
                          <option value="">{t.selectClass}</option>
                          {classOptions.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

             <div className="form-actions">
               {aadhaarVerified && (
                 <button
                   type="submit"
                   className="btn-submit"
                   disabled={loading}
                 >
                   {loading ? (
                     <>
                       <span className="spinner"></span> {t.registeringBtn}
                     </>
                   ) : (
                     t.registerStudentBtn
                   )}
                 </button>
               )}
             </div>
           </form>
         )}
      </div>
    </div>
  );
};

export default Registration;