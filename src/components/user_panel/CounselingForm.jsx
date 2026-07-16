import React, { useState } from 'react'
import { Card, Button, Form, Row, Col, Modal } from 'react-bootstrap'
import { FaLightbulb } from 'react-icons/fa'
import { useLanguage } from '../all_login/LanguageContext'

const CounselingForm = ({ onSubmit, studentId = '', showForm: propShowForm, onToggle }) => {
  const [internalShowForm, setInternalShowForm] = useState(false)
  const showForm = propShowForm !== undefined ? propShowForm : internalShowForm
  const setShowForm = (value) => {
    if (onToggle) {
      onToggle(value)
    } else {
      setInternalShowForm(value)
    }
  }
  const { language } = useLanguage()
  
  const [formData, setFormData] = useState({
    student_id: studentId,
    category_consulting: 'Career Guidance'
  })
  
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const counselingCategories = [
    language === 'hi' ? 'करियर मार्गदर्शन' : 'Career Guidance',
    language === 'hi' ? 'कोर्स चयन' : 'Course Selection',
    language === 'hi' ? 'प्रवेश प्रक्रिया' : 'Admission Process',
    language === 'hi' ? 'वित्तीय सहायता' : 'Financial Aid',
    language === 'hi' ? 'विदेश में अध्ययन' : 'Study Abroad',
    language === 'hi' ? 'नौकरी प्लेसमेंट' : 'Job Placement',
    language === 'hi' ? 'कौशल विकास' : 'Skill Development',
    language === 'hi' ? 'व्यक्तिगत परामर्श' : 'Personal Counseling',
    language === 'hi' ? 'स्वास्थ्य' : 'Health',
    language === 'hi' ? 'घरेलू' : 'Domestic'
  ]

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (submitting) return

    if (!formData.student_id) {
      alert(language === 'hi' ? 'छात्र आईडी आवश्यक है' : 'Student ID is required')
      return
    }
    
    if (!formData.category_consulting) {
      alert(language === 'hi' ? 'कृपया एक परामर्श श्रेणी चुनें' : 'Please select a counseling category')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        student_id: formData.student_id,
        category_consulting: [formData.category_consulting]
      }

      await onSubmit(payload)

      alert(language === 'hi' ? 'आपका परामर्श अनुरोध सफलतापूर्वक सबमिट कर दिया गया है!' : 'Your counselling request has been submitted successfully!')
      setFormData({
        student_id: studentId,
        category_consulting: 'Career Guidance'
      })
      setSubmitted(true)
      setTimeout(() => {
        setShowForm(false)
        setSubmitted(false)
      }, 1000)
    } catch (error) {
      alert(error.message || (language === 'hi' ? 'एक त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'An error occurred. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: '10px' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0">
                <FaLightbulb className="me-2 text-warning" />
                {language === 'hi' ? 'करियर परामर्श का अनुरोध करें' : 'Request Career Counseling'}
              </h5>
              <small className="text-muted">{language === 'hi' ? 'अपने करियर के लिए विशेषज्ञ मार्गदर्शन प्राप्त करें' : 'Get expert guidance for your career'}</small>
            </div>
            <Button
              variant="outline-primary"
              onClick={() => setShowForm(!showForm)}
              size="sm"
            >
              {showForm ? (language === 'hi' ? 'रद्द करें' : 'Cancel') : (language === 'hi' ? 'परामर्श का अनुरोध करें' : 'Request Counseling')}
            </Button>
          </div>

          {showForm && (
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-bold">{language === 'hi' ? 'छात्र आईडी' : 'Student ID'}</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.student_id}
                      disabled
                      className="bg-light"
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-bold">{language === 'hi' ? 'परामर्श श्रेणी चुनें' : 'Select Counseling Category'} <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      value={formData.category_consulting}
                      onChange={(e) => handleChange('category_consulting', e.target.value)}
                      required
                    >
                      <option value="">{language === 'hi' ? '-- श्रेणी चुनें --' : '-- Select Category --'}</option>
                      {counselingCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Button
                    variant={submitted ? "success" : "primary"}
                    type="submit"
                    className="w-100"
                    disabled={submitting || submitted}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {language === 'hi' ? 'सबमिट हो रहा है...' : 'Submitting...'}
                      </>
                    ) : submitted ? (
                      <>✓ {language === 'hi' ? 'सफलतापूर्वक सबमिट किया गया' : 'Submitted Successfully'}</>
                    ) : (
                      (language === 'hi' ? 'अनुरोध सबमिट करें' : 'Submit Request')
                    )}
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </Card.Body>
      </Card>
    </>
  )
}

export default CounselingForm