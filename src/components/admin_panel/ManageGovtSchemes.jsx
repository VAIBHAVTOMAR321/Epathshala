import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Form, Badge } from 'react-bootstrap'
import axios from 'axios'
import '../../assets/css/admindashboard.css'
import { useAuth } from '../all_login/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaPlus, FaArrowLeft, FaEye, FaEdit, FaTrash, FaLayerGroup, FaCheck } from 'react-icons/fa'
import AdminLeftNav from './AdminLeftNav'
import AdminHeader from './AdminHeader'

const API_CATEGORY_URL = 'https://brjobsedu.com/gyandhara/gyandhara_backend/api/scheme-category/'
const API_SCHEME_URL = 'https://brjobsedu.com/gyandhara/gyandhara_backend/api/scheme/'

const ManageGovtSchemes = () => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [currentView, setCurrentView] = useState('list')
  
  const [categoryFormData, setCategoryFormData] = useState({
    title: '',
    description: '',
    title_hindi: '',
    description_hindi: '',
    icon: null
  })
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [schemes, setSchemes] = useState([])
  const [loadingSchemes, setLoadingSchemes] = useState(false)
  const [schemeFormData, setSchemeFormData] = useState({
    title: '',
    title_hindi: '',
    description: '',
    description_hindi: '',
    sub_mod: [{ title: '', description: '' }],
    sub_mod_hindi: [{ title: '', description: '' }],
    web_link: '',
    image: null
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
    }
  }, [accessToken])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const fetchCategories = async () => {
    if (!accessToken) {
      console.log('No access token, waiting...')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await axios.get(API_CATEGORY_URL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.data && response.data.success) {
        setCategories(response.data.data)
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

  const fetchSchemes = async (scheme_category_id) => {
    if (!accessToken || !scheme_category_id) {
      if (!accessToken) console.log('No access token, waiting...')
      return
    }

    try {
      setLoadingSchemes(true)
      const response = await axios.get(`${API_SCHEME_URL}?scheme_category_id=${scheme_category_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.data && response.data.success) {
        const fetchedSchemes = response.data.data || []
        const parsedSchemes = fetchedSchemes.map(scheme => ({
          ...scheme,
          sub_mod: typeof scheme.sub_mod === 'string' ? JSON.parse(scheme.sub_mod) : (scheme.sub_mod || []),
          sub_mod_hindi: typeof scheme.sub_mod_hindi === 'string' ? JSON.parse(scheme.sub_mod_hindi) : (scheme.sub_mod_hindi || [])
        }))
        setSchemes(parsedSchemes)
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

  const handleAddCategoryClick = () => {
    setCategoryFormData({
      scheme_category_id: null,
      title: '',
      description: '',
      title_hindi: '',
      description_hindi: '',
      icon: null
    })
    setCurrentView('form')
  }

  const handleEditCategory = (category) => {
    setCategoryFormData({
      scheme_category_id: category.scheme_category_id,
      title: category.title,
      description: category.description || '',
      title_hindi: category.title_hindi || '',
      description_hindi: category.description_hindi || '',
      icon: null
    })
    setCurrentView('form')
  }

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Are you sure you want to delete the category "${category.title}"?`)) return
    if (!accessToken) {
      alert('Authentication required')
      return
    }

    try {
      await axios.delete(API_CATEGORY_URL, {
        data: { scheme_category_id: category.scheme_category_id },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      fetchCategories()
      alert('Category deleted successfully!')
    } catch (error) {
      console.error('Error deleting category:', error)
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please login again.')
      } else {
        alert('Failed to delete category. Please check the console for details.')
      }
    }
  }

  const handleCategoryFormSubmit = async (e) => {
    e.preventDefault()
    if (submitting || !accessToken) return

    if (!accessToken) {
      alert('Authentication required')
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('title', categoryFormData.title)
      formData.append('description', categoryFormData.description)
      formData.append('title_hindi', categoryFormData.title_hindi)
      formData.append('description_hindi', categoryFormData.description_hindi)

      if (categoryFormData.icon) {
        formData.append('icon', categoryFormData.icon)
      }

      if (categoryFormData.scheme_category_id) {
        formData.append('scheme_category_id', categoryFormData.scheme_category_id)
        await axios.put(API_CATEGORY_URL, formData, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Category updated successfully!')
      } else {
        await axios.post(API_CATEGORY_URL, formData, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Category added successfully!')
      }

      fetchCategories()
      setCurrentView('list')
    } catch (error) {
      console.error('Error submitting category:', error)
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please login again.')
      } else {
        if (error.response) {
          alert(`Failed: ${error.response.data.message || error.response.data.detail || 'Check console for details'}`)
        } else {
          alert('Failed: ' + error.message)
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewSchemes = (category) => {
    setSelectedCategory(category)
    setCurrentView('schemes')
    fetchSchemes(category.scheme_category_id)
  }

  const handleAddSchemeClick = () => {
    setSchemeFormData({
      gov_scheme_id: null,
      title: '',
      title_hindi: '',
      description: '',
      description_hindi: '',
      sub_mod: [{ title: '', description: '' }],
      sub_mod_hindi: [{ title: '', description: '' }],
      web_link: '',
      image: null
    })
    setCurrentView('scheme-form')
  }

  const handleEditScheme = (scheme) => {
    setSchemeFormData({
      gov_scheme_id: scheme.gov_scheme_id,
      title: scheme.title,
      title_hindi: scheme.title_hindi || '',
      description: scheme.description || '',
      description_hindi: scheme.description_hindi || '',
      sub_mod: scheme.sub_mod || [{ title: '', description: '' }],
      sub_mod_hindi: scheme.sub_mod_hindi || [{ title: '', description: '' }],
      web_link: scheme.web_link || '',
      image: null
    })
    setCurrentView('scheme-form')
  }

  const handleDeleteScheme = async (scheme) => {
    if (!window.confirm(`Are you sure you want to delete the scheme "${scheme.title}"?`)) return
    if (!accessToken) {
      alert('Authentication required')
      return
    }

    try {
      await axios.delete(API_SCHEME_URL, {
        data: { gov_scheme_id: scheme.gov_scheme_id },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      fetchSchemes(selectedCategory.scheme_category_id)
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

  const handleSchemeFormSubmit = async (e) => {
    e.preventDefault()
    if (submitting || !accessToken) return

    if (!accessToken) {
      alert('Authentication required')
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('scheme_category_id', selectedCategory.scheme_category_id)
      formData.append('title', schemeFormData.title)
      formData.append('title_hindi', schemeFormData.title_hindi)
      formData.append('description', schemeFormData.description)
      formData.append('description_hindi', schemeFormData.description_hindi)
      formData.append('sub_mod', JSON.stringify(schemeFormData.sub_mod))
      formData.append('sub_mod_hindi', JSON.stringify(schemeFormData.sub_mod_hindi))
      formData.append('web_link', schemeFormData.web_link)

      if (schemeFormData.gov_scheme_id) {
        formData.append('gov_scheme_id', schemeFormData.gov_scheme_id)
        await axios.put(API_SCHEME_URL, formData, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Scheme updated successfully!')
      } else {
        if (schemeFormData.image) {
          formData.append('image', schemeFormData.image)
        }
        await axios.post(API_SCHEME_URL, formData, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Scheme added successfully!')
      }

      fetchSchemes(selectedCategory.scheme_category_id)
      setCurrentView('schemes')
    } catch (error) {
      console.error('Error submitting scheme:', error)
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please login again.')
      } else {
        if (error.response) {
          alert(`Failed: ${error.response.data.message || error.response.data.detail || 'Check console for details'}`)
        } else {
          alert('Failed: ' + error.message)
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setSchemeFormData({ ...schemeFormData, image: file })
  }

  const handleAddSubModSection = () => {
    setSchemeFormData({
      ...schemeFormData,
      sub_mod: [...schemeFormData.sub_mod, { title: '', description: '' }],
      sub_mod_hindi: [...(schemeFormData.sub_mod_hindi || []), { title: '', description: '' }]
    })
  }

  const handleRemoveSubModSection = (index) => {
    if (schemeFormData.sub_mod.length > 1) {
      const newSubMod = [...schemeFormData.sub_mod]
      newSubMod.splice(index, 1)
      const newSubModHindi = [...(schemeFormData.sub_mod_hindi || [])]
      newSubModHindi.splice(index, 1)
      setSchemeFormData({
        ...schemeFormData,
        sub_mod: newSubMod,
        sub_mod_hindi: newSubModHindi
      })
    }
  }

  const handleSubModSectionChange = (index, field, value, isHindi = false) => {
    if (isHindi) {
      const newSubModHindi = [...schemeFormData.sub_mod_hindi]
      newSubModHindi[index][field] = value
      setSchemeFormData({
        ...schemeFormData,
        sub_mod_hindi: newSubModHindi
      })
    } else {
      const newSubMod = [...schemeFormData.sub_mod]
      newSubMod[index][field] = value
      setSchemeFormData({
        ...schemeFormData,
        sub_mod: newSubMod
      })
    }
  }

  if (loading) {
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
            <Container fluid className="dashboard-box">
              <div className="loading-spinner">
                <Spinner animation="border" variant="primary" />
              </div>
            </Container>
          </div>
        </div>
      </div>
    )
  }

  const renderListView = () => (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4 page-header">
          <h4 className="mb-0">Government Schemes Categories</h4>
          <Button variant="primary" onClick={handleAddCategoryClick}>
            <FaPlus className="me-2" /> Add New Category
          </Button>
        </div>

        {categories.length === 0 ? (
          <div className="text-center text-muted p-5">
            <p>No categories found</p>
            <Button variant="primary" onClick={handleAddCategoryClick}>
              <FaPlus className="me-2" /> Add First Category
            </Button>
          </div>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.scheme_category_id}>
                  <td><Badge bg="secondary">{category.scheme_category_id}</Badge></td>
                  <td>{category.title}</td>
                  <td className="text-truncate" style={{ maxWidth: '300px' }}>{category.description}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button variant="outline-info" size="sm" onClick={() => handleViewSchemes(category)}>
                        <FaLayerGroup className="me-1" /> Schemes
                      </Button>
                      <Button variant="outline-warning" size="sm" onClick={() => handleEditCategory(category)}>
                        <FaEdit className="me-1" /> Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteCategory(category)}>
                        <FaTrash className="me-1" /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  )

  const renderCategoryForm = () => (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4 page-header">
          <Button variant="outline-secondary" size="sm" onClick={() => setCurrentView('list')}>
            <FaArrowLeft /> Back to List
          </Button>
          <h4 className="mb-0">{categoryFormData.scheme_category_id ? 'Edit Category' : 'Add New Category'}</h4>
        </div>

        <Form onSubmit={handleCategoryFormSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Title (English)</Form.Label>
            <Form.Control
              type="text"
              value={categoryFormData.title}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, title: e.target.value })}
              placeholder="e.g. Education Schemes"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Title (Hindi)</Form.Label>
            <Form.Control
              type="text"
              value={categoryFormData.title_hindi}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, title_hindi: e.target.value })}
              placeholder="e.g. शिक्षा योजनाएं"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description (English)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={categoryFormData.description}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
              placeholder="e.g. Schemes related to student education"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description (Hindi)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={categoryFormData.description_hindi}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, description_hindi: e.target.value })}
              placeholder="e.g. छात्रों की शिक्षा से जुड़ी योजनाएं"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category Icon</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.files[0] || null })}
            />
          </Form.Group>

          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? <Spinner as="span" animation="border" size="sm" /> : (categoryFormData.scheme_category_id ? 'Update Category' : 'Add Category')}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )

  const renderSchemesView = () => (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4 page-header">
          <Button variant="outline-secondary" size="sm" onClick={() => setCurrentView('list')}>
            <FaArrowLeft /> Back to Categories
          </Button>
          <h4 className="mb-0">{selectedCategory?.title} - Schemes</h4>
          <Button variant="primary" onClick={handleAddSchemeClick}>
            <FaPlus className="me-2" /> Add New Scheme
          </Button>
        </div>

        {loadingSchemes ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading schemes...</p>
          </div>
        ) : schemes.length === 0 ? (
          <div className="text-center text-muted p-5">
            <p>No schemes found in this category</p>
            <Button variant="primary" onClick={handleAddSchemeClick}>
              <FaPlus className="me-2" /> Add First Scheme
            </Button>
          </div>
        ) : (
          <Row className="g-4">
            {schemes.map((scheme) => (
              <Col key={scheme.gov_scheme_id} xs={12} md={6} lg={4}>
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body>
                    <Badge bg="secondary" className="mb-2">{scheme.gov_scheme_id}</Badge>
                    <Card.Title className="fw-bold">{scheme.title}</Card.Title>
                    {scheme.title_hindi && (
                      <p className="text-muted small fst-italic mb-2">{scheme.title_hindi}</p>
                    )}
                    {scheme.description && (
                      <p className="small mb-2"><strong>Description:</strong> {scheme.description.substring(0, 80)}...</p>
                    )}
                    {scheme.sub_mod && scheme.sub_mod.length > 0 && (
                      <div className="small mb-2">
                        <strong>Sections:</strong>
                        <div className="mt-1">
                          {scheme.sub_mod.slice(0, 2).map((mod, idx) => (
                            <Badge key={idx} bg="light" text="dark" className="me-1 mb-1">
                              {mod.title}
                            </Badge>
                          ))}
                          {scheme.sub_mod.length > 2 && (
                            <Badge bg="light" text="dark">+{scheme.sub_mod.length - 2}</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="mt-auto pt-2 border-top d-flex gap-2">
                      <Button variant="outline-warning" size="sm" onClick={() => handleEditScheme(scheme)}>
                        <FaEdit className="me-1" /> Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteScheme(scheme)}>
                        <FaTrash className="me-1" /> Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card.Body>
    </Card>
  )

  const renderSchemeForm = () => (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4 page-header">
          <Button variant="outline-secondary" size="sm" onClick={() => setCurrentView('schemes')}>
            <FaArrowLeft /> Back to Schemes
          </Button>
          <h4 className="mb-0">{schemeFormData.gov_scheme_id ? 'Edit Scheme' : 'Add New Scheme'}</h4>
        </div>

        <Form onSubmit={handleSchemeFormSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Title (English) *</Form.Label>
                <Form.Control
                  type="text"
                  value={schemeFormData.title}
                  onChange={(e) => setSchemeFormData({ ...schemeFormData, title: e.target.value })}
                  placeholder="e.g. Scholarship Scheme"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Title (Hindi)</Form.Label>
                <Form.Control
                  type="text"
                  value={schemeFormData.title_hindi}
                  onChange={(e) => setSchemeFormData({ ...schemeFormData, title_hindi: e.target.value })}
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
                  value={schemeFormData.description}
                  onChange={(e) => setSchemeFormData({ ...schemeFormData, description: e.target.value })}
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
                  value={schemeFormData.description_hindi}
                  onChange={(e) => setSchemeFormData({ ...schemeFormData, description_hindi: e.target.value })}
                  placeholder="e.g. छात्रों के लिए आर्थिक सहायता"
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Official Link</Form.Label>
                <Form.Control
                  type="url"
                  value={schemeFormData.web_link}
                  onChange={(e) => setSchemeFormData({ ...schemeFormData, web_link: e.target.value })}
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
              </Form.Group>
            </Col>
          </Row>

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
              {schemeFormData.sub_mod && schemeFormData.sub_mod.map((submod, index) => (
                <div key={index} className="mb-4 pb-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Section {index + 1}</h6>
                    {schemeFormData.sub_mod.length > 1 && (
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleRemoveSubModSection(index)}
                      >
                        <FaTrash className="me-1" /> Remove
                      </Button>
                    )}
                  </div>

                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Title (English)</Form.Label>
                        <Form.Control
                          type="text"
                          value={submod.title}
                          onChange={(e) => handleSubModSectionChange(index, 'title', e.target.value, false)}
                          placeholder="e.g. Eligibility"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Title (Hindi)</Form.Label>
                        <Form.Control
                          type="text"
                          value={schemeFormData.sub_mod_hindi?.[index]?.title || ''}
                          onChange={(e) => handleSubModSectionChange(index, 'title', e.target.value, true)}
                          placeholder="e.g. पात्रता"
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
                          value={schemeFormData.sub_mod_hindi?.[index]?.description || ''}
                          onChange={(e) => handleSubModSectionChange(index, 'description', e.target.value, true)}
                          placeholder="e.g. गरीबी रेखा से नीचे होना चाहिए"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              ))}
            </Card.Body>
          </Card>

          <div className="mt-4">
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? <Spinner as="span" animation="border" size="sm" /> : (schemeFormData.gov_scheme_id ? 'Update Scheme' : 'Add Scheme')}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )

  const renderContent = () => {
    switch (currentView) {
      case 'form':
        return renderCategoryForm()
      case 'schemes':
        return renderSchemesView()
      case 'scheme-form':
        return renderSchemeForm()
      default:
        return renderListView()
    }
  }

  return (
    <>
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
            <Container fluid className="dashboard-box">
              <div className="d-flex justify-content-between align-items-center mb-4 page-header">
                <div className="d-flex align-items-center all-en-box gap-3">
                  <Button variant="outline-secondary" size="sm" onClick={() => navigate('/AdminDashboard')} className="me-2">
                    <FaArrowLeft /> Dashboard
                  </Button>
                  <h4 className="mb-0">Government Schemes Management</h4>
                </div>
              </div>

              {renderContent()}
            </Container>
          </div>
        </div>
      </div>
    </>
  )
}

export default ManageGovtSchemes