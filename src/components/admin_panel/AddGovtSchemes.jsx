import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Form, Badge, Table, Spinner } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminHeader from './AdminHeader'
import axios from 'axios'
import '../../assets/css/AdminDashboard.css'
import { useAuth } from '../all_login/AuthContext'
import { FaPlus, FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa'

const AddGovtSchemes = () => {
  const { accessToken } = useAuth()
  
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [schemes, setSchemes] = useState([])
  const [loadingSchemes, setLoadingSchemes] = useState(false)
  const [currentView, setCurrentView] = useState('add')
  const [selectedCategory, setSelectedCategory] = useState(null)
  
  const sectionNames = [
    'About this Scheme',
    'Key Benefits',
    'Who Can Apply',
    'Documents Needed',
    'How to Apply',
    'Important Tips'
  ]

  const sectionNamesHindi = [
    'योजना के बारे में',
    'मुख्य लाभ',
    'आवेदन कौन कर सकते हैं',
    'आवश्यक दस्तावेज़',
    'आवेदन कैसे करें',
    'महत्वपूर्ण सुझाव'
  ]

  const [formData, setFormData] = useState({
    gov_scheme_id: null,
    scheme_category_id: '',
    title: '',
    title_hindi: '',
    description: '',
    description_hindi: '',
    total_amount: '',
    sub_mod: [
      { title: sectionNames[0], description: '' }
    ],
    sub_mod_hindi: [
      { title: sectionNamesHindi[0], description: '' }
    ],
    web_link: '',
    scheme_image: null,
    scheme_image_preview: null,
    existing_image_url: null
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (accessToken) {
      fetchCategories()
      fetchAllSchemes()
    }
  }, [accessToken])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const getAuthConfig = () => {
    const headers = {}
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
    return { headers }
  }

  const fetchCategories = async () => {
    if (!accessToken) {
      console.log('No access token, waiting...')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const config = getAuthConfig()
      const response = await axios.get('https://brjobsedu.com/gyandhara/gyandhara_backend/api/scheme-category/', config)
      if (response.data && response.data.success) {
        setCategories(response.data.data)
        if (response.data.data.length > 0) {
          setFormData(prev => ({ ...prev, scheme_category_id: response.data.data[0].scheme_category_id }))
          setSelectedCategory(response.data.data[0])
        }
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized access - Token might be expired')
      }
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAllSchemes = async () => {
    try {
      setLoadingSchemes(true)
      const config = getAuthConfig()
      const response = await axios.get('https://brjobsedu.com/gyandhara/gyandhara_backend/api/scheme-category-with-schemes/', config)
      if (response.data && response.data.success) {
        const allSchemes = response.data.data.flatMap(cat => 
          (cat.schemes || []).map(scheme => ({
            ...scheme,
            sub_mod: typeof scheme.sub_mod === 'string' ? JSON.parse(scheme.sub_mod) : (scheme.sub_mod || []),
            sub_mod_hindi: typeof scheme.sub_mod_hindi === 'string' ? JSON.parse(scheme.sub_mod_hindi) : (scheme.sub_mod_hindi || [])
          }))
        )
        setSchemes(allSchemes)
      } else {
        setSchemes([])
      }
    } catch (error) {
      console.error('Error fetching schemes:', error)
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized access - Token might be expired')
      }
      setSchemes([])
    } finally {
      setLoadingSchemes(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleCategoryChange = (categoryId) => {
    setFormData({ ...formData, scheme_category_id: categoryId })
    const selected = categories.find(cat => cat.scheme_category_id === categoryId)
    setSelectedCategory(selected)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting || !accessToken) return

    if (!accessToken) {
      alert('Authentication required')
      return
    }

    setSubmitting(true)

    try {
      const config = getAuthConfig()
      
      // Create clean payload object
      const payload = {
        scheme_category_id: formData.scheme_category_id || '',
        title: formData.title || '',
        title_hindi: formData.title_hindi || '',
        description: formData.description || '',
        description_hindi: formData.description_hindi || '',
        total_amount: formData.total_amount ? parseFloat(formData.total_amount) : '',
        sub_mod: formData.sub_mod?.map(s => ({
          title: s.title || '',
          description: s.description || ''
        })) || [],
        sub_mod_hindi: formData.sub_mod_hindi?.map(s => ({
          title: s.title || '',
          description: s.description || ''
        })) || [],
        web_link: formData.web_link || ''
      }

      if (formData.gov_scheme_id) {
        payload.gov_scheme_id = formData.gov_scheme_id
        
        if (formData.scheme_image) {
          const imageFormData = new FormData()
          imageFormData.append('gov_scheme_id', formData.gov_scheme_id)
          Object.keys(payload).forEach(key => {
            if (key === 'sub_mod' || key === 'sub_mod_hindi') {
              imageFormData.append(key, JSON.stringify(payload[key]))
            } else if (key !== 'scheme_image' && key !== 'gov_scheme_id') {
              imageFormData.append(key, payload[key])
            }
          })
          imageFormData.append('scheme_image', formData.scheme_image)
          
          await axios.put(
            'https://brjobsedu.com/gyandhara/gyandhara_backend/api/scheme/',
            imageFormData,
            {
              ...config,
              headers: { ...config.headers, 'Content-Type': 'multipart/form-data' },
              timeout: 10000
            }
          )
        } else {
          await axios.put(
            'https://brjobsedu.com/gyandhara/gyandhara_backend/api/scheme/',
            payload,
            {
              ...config,
              headers: { ...config.headers, 'Content-Type': 'application/json' },
              timeout: 10000
            }
          )
        }
        alert('Scheme updated successfully!')
      } else {
        if (formData.scheme_image) {
          const imageFormData = new FormData()
          Object.keys(payload).forEach(key => {
            if (key === 'sub_mod' || key === 'sub_mod_hindi') {
              imageFormData.append(key, JSON.stringify(payload[key]))
            } else {
              imageFormData.append(key, payload[key] ?? '')
            }
          })
          imageFormData.append('scheme_image', formData.scheme_image)
          
          await axios.post(
            'https://brjobsedu.com/gyandhara/gyandhara_backend/api/scheme/',
            imageFormData,
            {
              ...config,
              headers: { ...config.headers, 'Content-Type': 'multipart/form-data' },
              timeout: 10000
            }
          )
        } else {
          await axios.post(
            'https://brjobsedu.com/gyandhara/gyandhara_backend/api/scheme/',
            payload,
            {
              ...config,
              headers: { ...config.headers, 'Content-Type': 'application/json' },
              timeout: 10000
            }
          )
        }
        alert('Scheme added successfully!')
      }

      resetForm()
      fetchAllSchemes()
    } catch (error) {
      console.error('Error details:', error)
      
      let errorMessage = 'An error occurred'
      
      if (error.response) {
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error
          } else if (error.response.data.errors) {
            errorMessage = 'Validation Failed'
          } else {
            errorMessage = JSON.stringify(error.response.data)
          }
        }
        alert(`Error ${error.response.status}: ${errorMessage}`)
      } else if (error.request) {
        alert('Failed: No response from server. Check your internet connection.')
      } else {
        alert('Failed: ' + error.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      gov_scheme_id: null,
      scheme_category_id: categories.length > 0 ? categories[0].scheme_category_id : '',
      title: '',
      title_hindi: '',
      description: '',
      description_hindi: '',
      total_amount: '',
      sub_mod: [
        { title: sectionNames[0], description: '' }
      ],
      sub_mod_hindi: [
        { title: sectionNamesHindi[0], description: '' }
      ],
      web_link: '',
      scheme_image: null,
      scheme_image_preview: null,
      existing_image_url: null
    })
  }

  const handleEdit = (scheme) => {
    const previewUrl = scheme.scheme_image ? `https://brjobsedu.com/gyandhara/gyandhara_backend${scheme.scheme_image}` : null
    
    // Populate sub_mod with titles from predefined sections if title is empty
    const populateSubMod = (subModArray) => {
      return subModArray?.map((mod, index) => ({
        ...mod,
        title: mod.title || (index < sectionNames.length ? sectionNames[index] : mod.title || '')
      })) || []
    }

    const populateSubModHindi = (subModArray) => {
      return subModArray?.map((mod, index) => ({
        ...mod,
        title: mod.title || (index < sectionNamesHindi.length ? sectionNamesHindi[index] : mod.title || '')
      })) || []
    }

    setFormData({
      gov_scheme_id: scheme.gov_scheme_id,
      scheme_category_id: scheme.scheme_category_id,
      title: scheme.title,
      title_hindi: scheme.title_hindi || '',
      description: scheme.description || '',
      description_hindi: scheme.description_hindi || '',
      total_amount: scheme.total_amount || '',
      sub_mod: populateSubMod(scheme.sub_mod),
      sub_mod_hindi: populateSubModHindi(scheme.sub_mod_hindi),
      web_link: scheme.web_link || '',
      scheme_image: null,
      scheme_image_preview: previewUrl,
      existing_image_url: scheme.scheme_image || null
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (scheme) => {
    if (!window.confirm(`Are you sure you want to delete the scheme "${scheme.title}"?`)) return

    if (!accessToken) {
      alert('Authentication required')
      return
    }

    try {
      const config = getAuthConfig()
      await axios.delete('https://brjobsedu.com/gyandhara/gyandhara_backend/api/scheme/', {
        data: { gov_scheme_id: scheme.gov_scheme_id },
        ...config
      })
      fetchAllSchemes()
      alert('Scheme deleted successfully!')
    } catch (error) {
      console.error('Error deleting scheme:', error)
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please login again.')
      } else {
        alert('Failed to delete scheme. Please try again.')
      }
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setFormData({ ...formData, scheme_image: file, scheme_image_preview: previewUrl })
    } else {
      setFormData({ ...formData, scheme_image: file })
    }
  }

  const handleAddSubModSection = () => {
    const newIndex = formData.sub_mod?.length || 0
    const newTitle = newIndex < sectionNames.length ? sectionNames[newIndex] : `Custom Section ${newIndex + 1}`
    const newTitleHindi = newIndex < sectionNamesHindi.length ? sectionNamesHindi[newIndex] : ''
    setFormData({
      ...formData,
      sub_mod: [...(formData.sub_mod || []), { title: newTitle, description: '' }],
      sub_mod_hindi: [...(formData.sub_mod_hindi || []), { title: newTitleHindi, description: '' }]
    })
  }

  const handleRemoveSubModSection = (index) => {
    if (formData.sub_mod.length > 1) {
      const newSubMod = [...formData.sub_mod]
      newSubMod.splice(index, 1)
      const newSubModHindi = [...(formData.sub_mod_hindi || [])]
      newSubModHindi.splice(index, 1)
      setFormData({
        ...formData,
        sub_mod: newSubMod,
        sub_mod_hindi: newSubModHindi
      })
    }
  }

  const handleSubModSectionChange = (index, field, value, isHindi = false) => {
    if (isHindi) {
      const newSubModHindi = [...formData.sub_mod_hindi]
      newSubModHindi[index][field] = value
      setFormData({
        ...formData,
        sub_mod_hindi: newSubModHindi
      })
    } else {
      const newSubMod = [...formData.sub_mod]
      newSubMod[index][field] = value
      setFormData({
        ...formData,
        sub_mod: newSubMod
      })
    }
  }

  return (
    <div className="dashboard-container">
      <AdminLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <AdminHeader toggleSidebar={toggleSidebar} />
        <div className="dashboard-content">
          <Container fluid className="py-4">
              <div className="fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4 page-header">
                  <div className="d-flex align-items-center all-en-box gap-3">
                    <Button variant="outline-secondary" size="sm" onClick={() => navigate('/AdminDashboard')} className="me-2">
                      <FaArrowLeft /> Dashboard
                    </Button>
                    <h4 className="mb-0">Add Government Schemes</h4>
                  </div>
                </div>

              <Row className="g-4">
              <Col lg={8}>
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-primary text-white">
                    <FaPlus className="me-2" />
                    {formData.gov_scheme_id ? 'Edit Scheme' : 'Add New Scheme'}
                  </Card.Header>
                  <Card.Body>
                    {loading ? (
                      <div className="text-center">
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : (
                      <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>Category</Form.Label>
                          <Form.Select
                            value={formData.scheme_category_id}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                          >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                              <option key={cat.scheme_category_id} value={cat.scheme_category_id}>
                                {cat.title} ({cat.scheme_category_id})
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>

                        <Row className="g-3">
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Title (English)</Form.Label>
                              <Form.Control
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="e.g. Scholarship Scheme"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Title (Hindi)</Form.Label>
                              <Form.Control
                                type="text"
                                value={formData.title_hindi}
                                onChange={(e) => handleChange('title_hindi', e.target.value)}
                                placeholder="e.g. छात्रवृत्ति योजना"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Description (English)</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="e.g. Financial help for students"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Description (Hindi)</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.description_hindi}
                                onChange={(e) => handleChange('description_hindi', e.target.value)}
                                placeholder="e.g. छात्रों के लिए आर्थिक सहायता"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Total Amount (Budget)</Form.Label>
                              <Form.Control
                                type="number"
                                value={formData.total_amount}
                                onChange={(e) => handleChange('total_amount', e.target.value)}
                                placeholder="e.g. 100000"
                                min="0"
                                step="0.01"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Official Link</Form.Label>
                              <Form.Control
                                type="url"
                                value={formData.web_link}
                                onChange={(e) => handleChange('web_link', e.target.value)}
                                placeholder="e.g. https://example.com/scholarship"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={12}>
                            <Form.Group className="mb-3">
                              <Form.Label>Scheme Image</Form.Label>
                              <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                              {formData.scheme_image_preview && (
                                <div className="mt-2">
                                  <img 
                                    src={formData.scheme_image_preview} 
                                    alt="Scheme Preview" 
                                    style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', border: '1px solid #ddd' }}
                                  />
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="ms-2 text-danger"
                                    onClick={() => setFormData({ ...formData, scheme_image: null, scheme_image_preview: null })}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              )}
                            </Form.Group>
                          </Col>
                        </Row>

                        {/* Sub-Modules Section */}
                        <Card className="mt-4 shadow-sm border-0">
                          <Card.Header className="bg-light">
                            <div className="d-flex justify-content-between align-items-center">
                              <h6 className="mb-0">Sub-Modules / Details</h6>
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                onClick={handleAddSubModSection}
                              >
                                <FaPlus className="me-1" /> Add Section
                              </Button>
                            </div>
                          </Card.Header>
                          <Card.Body>
                            {formData.sub_mod && formData.sub_mod.map((submod, index) => {
                              const sectionName = index < sectionNames.length ? sectionNames[index] : `Custom Section ${index + 1}`
                              return(
                              <div key={index} className="mb-4 pb-3 border-bottom">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h6 className="mb-0">Section {index + 1} - {sectionName} {index < sectionNames.length && <Badge bg="info" className="ms-2">Predefined</Badge>}</h6>
                                  {formData.sub_mod.length > 1 && (
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm" 
                                      onClick={() => handleRemoveSubModSection(index)}
                                      disabled={index < sectionNames.length}
                                      style={index < sectionNames.length ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
                                      title={index < sectionNames.length ? 'Cannot delete predefined sections' : 'Remove section'}
                                    >
                                      <FaTrash className="me-1" /> Remove
                                    </Button>
                                  )}
                                </div>

                                <Row className="g-3">
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Title (English) {index < sectionNames.length && '(Auto-filled)'}</Form.Label>
                                      <Form.Control
                                        type="text"
                                        value={index < sectionNames.length ? sectionNames[index] : submod.title}
                                        onChange={(e) => index >= sectionNames.length && handleSubModSectionChange(index, 'title', e.target.value, false)}
                                        placeholder="e.g. Eligibility"
                                        disabled={index < sectionNames.length}
                                        style={index < sectionNames.length ? {backgroundColor: '#f5f5f5', cursor: 'not-allowed'} : {}}
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Title (Hindi) {index < sectionNamesHindi.length && '(Auto-filled)'}</Form.Label>
                                      <Form.Control
                                        type="text"
                                        value={index < sectionNamesHindi.length ? sectionNamesHindi[index] : (formData.sub_mod_hindi?.[index]?.title || '')}
                                        onChange={(e) => index >= sectionNamesHindi.length && handleSubModSectionChange(index, 'title', e.target.value, true)}
                                        placeholder="e.g. पात्रता"
                                        disabled={index < sectionNamesHindi.length}
                                        style={index < sectionNamesHindi.length ? {backgroundColor: '#f5f5f5', cursor: 'not-allowed'} : {}}
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Description (English)</Form.Label>
                                      <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={submod.description}
                                        onChange={(e) => handleSubModSectionChange(index, 'description', e.target.value, false)}
                                        placeholder="e.g. Students must be below poverty line"
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Description (Hindi)</Form.Label>
                                      <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={formData.sub_mod_hindi?.[index]?.description || ''}
                                        onChange={(e) => handleSubModSectionChange(index, 'description', e.target.value, true)}
                                        placeholder="e.g. गरीबी रेखा से नीचे होना चाहिए"
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>
                              </div>
                            )})}
                          </Card.Body>
                        </Card>

                        <div className="d-flex gap-2 mt-4">
                          <Button variant="primary" type="submit" disabled={submitting}>
                            {submitting ? <Spinner as="span" animation="border" size="sm" /> : (formData.gov_scheme_id ? 'Update Scheme' : 'Add Scheme')}
                          </Button>
                          {formData.gov_scheme_id && (
                            <Button variant="outline-secondary" onClick={resetForm}>
                              Cancel
                            </Button>
                          )}
                        </div>
                      </Form>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-info text-white">
                    Existing Schemes ({schemes.length})
                  </Card.Header>
                  <Card.Body className="p-0" style={{ maxHeight: '700px', overflowY: 'auto' }}>
                    {loadingSchemes ? (
                      <div className="text-center p-4">
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : schemes.length === 0 ? (
                      <div className="text-center text-muted p-4">
                        <p>No schemes found</p>
                      </div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {schemes.map((scheme) => {
                          const imgUrl = scheme.scheme_image 
                            ? (scheme.scheme_image.startsWith('http') 
                                ? scheme.scheme_image 
                                : `https://brjobsedu.com/gyandhara/gyandhara_backend${scheme.scheme_image}`) 
                            : null
                          return (
                            <div key={scheme.gov_scheme_id} className="list-group-item p-3">
                              <div className="d-flex justify-content-between align-items-start">
                                <div className="flex-grow-1">
                                  <Badge bg="secondary" className="mb-1">{scheme.gov_scheme_id}</Badge>
                                  <h6 className="mb-0">{scheme.title}</h6>
                                  {scheme.title_hindi && (
                                    <small className="text-muted fst-italic">{scheme.title_hindi}</small>
                                  )}
                                  {scheme.sub_mod && scheme.sub_mod.length > 0 && (
                                    <div className="small mt-1">
                                      {scheme.sub_mod.slice(0, 1).map((mod, idx) => (
                                        <Badge key={idx} bg="light" text="dark" className="me-1">
                                          {mod.title}
                                        </Badge>
                                      ))}
                                      {scheme.sub_mod.length > 1 && (
                                        <Badge bg="light" text="dark">+{scheme.sub_mod.length - 1}</Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {imgUrl && (
                                  <div className="ms-2">
                                    <img 
                                      src={imgUrl} 
                                      alt={scheme.title}
                                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                                      onError={(e) => { e.target.style.display = 'none' }}
                                    />
                                  </div>
                                )}
                                <div className="d-flex gap-1 ms-2">
                                  <Button variant="outline-warning" size="sm" onClick={() => handleEdit(scheme)}>
                                    <FaEdit />
                                  </Button>
                                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(scheme)}>
                                    <FaTrash />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              </Row>
            </div>
          </Container>
        </div>
      </div>
    </div>
  )
}

export default AddGovtSchemes
