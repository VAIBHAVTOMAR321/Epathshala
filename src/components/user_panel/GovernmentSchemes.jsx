import React, { useState, useEffect, useRef } from 'react'
import { Container, Card, Button, Row, Col, Badge, Form, Modal, Alert, Tab, Nav, Spinner } from 'react-bootstrap'
import { FaGraduationCap, FaArrowLeft, FaCheckCircle, FaInfoCircle, FaBook, FaMoneyBillWave, FaBriefcase, FaLaptop, FaUniversity, FaBus, FaUtensils, FaHeart, FaShieldAlt, FaLaptopCode, FaUserGraduate, FaAward, FaPiggyBank, FaHandHoldingUsd, FaTools, FaMedal, FaBaby, FaFemale } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import UserLeftNav from './UserLeftNav'
import UserHeader from './UserHeader'
import { useAuth } from '../all_login/AuthContext'
import { useLanguage } from '../all_login/LanguageContext'



const GovernmentSchemes = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  
  const { uniqueId, userRoleType, accessToken } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedScheme, setSelectedScheme] = useState(null)
  const [activeTab, setActiveTab] = useState('category')
  const [apiCategories, setApiCategories] = useState([])
  const [apiSchemesData, setApiSchemesData] = useState({})
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const schemesSectionRef = useRef(null)

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

  const toggleSidebar = () => {
    if (isMobile || isTablet) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setSidebarOpen(!sidebarOpen)
    }
  }

  // Fetch categories and schemes from API
  useEffect(() => {
    const fetchSchemesData = async () => {
      try {
        setError(null)
        setLoading(true)
        
        const response = await axios.get(
          'https://brjobsedu.com/gyandhara/gyandhara_backend/api/scheme-category-with-schemes/',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        )
        
        if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
          const categoryList = response.data.data
          const schemesMap = {}
          
          categoryList.forEach((category) => {
            if (category.scheme_category_id && category.schemes) {
              const categoryKey = category.scheme_category_id
              schemesMap[categoryKey] = category.schemes.map(scheme => {
                const imgPath = scheme.scheme_image || ''
                const imgUrl = imgPath && !imgPath.startsWith('http') ? `https://brjobsedu.com/gyandhara/gyandhara_backend${imgPath}` : imgPath
                return {
                  gov_scheme_id: scheme.gov_scheme_id,
                  title: scheme.title || 'Untitled Scheme',
                  title_hindi: scheme.title_hindi || scheme.title || 'योजना',
                  description: scheme.description || 'No description available',
                  description_hindi: scheme.description_hindi || scheme.description || 'विवरण उपलब्ध नहीं',
                  web_link: scheme.web_link || '#',
                  total_amount: scheme.total_amount || '',
                  scheme_image: imgUrl,
                  sub_mod: scheme.sub_mod || [],
                  sub_mod_hindi: scheme.sub_mod_hindi || []
                }
              })
            }
          })
          
          setApiCategories(categoryList)
          setApiSchemesData(schemesMap)
          setError(null)
          setRetryCount(0)
        } else {
          throw new Error('Invalid response format: missing success or data')
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching schemes:', error)
        setLoading(false)
        
        if (error.response) {
          if (error.response.status === 401) {
            setError('Unauthorized: Please login again')
          } else if (error.response.status === 403) {
            setError('Forbidden: You do not have permission to access this resource')
          } else if (error.response.status === 404) {
            setError('API endpoint not found')
          } else if (error.response.status === 500) {
            setError('Server error: Please try again later')
          } else {
            setError(`Server error: ${error.response.status} ${error.response.statusText}`)
          }
        } else if (error.request) {
          if (error.code === 'ECONNREFUSED') {
            setError('Connection refused: Server may be down')
          } else if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
            setError('Network error: Please check your connection')
          } else if (error.message.includes('CORS')) {
            setError('CORS error: Backend server may not be configured correctly')
          } else {
            setError('Network error: No response from server')
          }
        } else {
          setError(error.message || 'Unknown error occurred')
        }
      }
    }
    
    if (accessToken) {
      fetchSchemesData()
    }
  }, [accessToken, retryCount])

  // Build categories from API data for display
  const getCategoriesForDisplay = () => {
    const categoryIconMap = {
      'SCHEME-CAT-00001': <FaGraduationCap />,
      'SCHEME-CAT-00002': <FaPiggyBank />,
      'SCHEME-CAT-00003': <FaTools />,
      'SCHEME-CAT-00004': <FaFemale />
    }

    return apiCategories.map(category => {
      const iconPath = category.icon || ''
      const fullPath = iconPath && !iconPath.startsWith('/media') ? iconPath : (iconPath ? `https://brjobsedu.com/gyandhara/gyandhara_backend${iconPath}` : '')
      
      return {
        id: category.scheme_category_id,
        name: category.title,
        name_hindi: category.title_hindi,
        icon: categoryIconMap[category.scheme_category_id] || <FaAward />,
        description: category.description,
        description_hindi: category.description_hindi,
        categoryIcon: category.icon,
        image: fullPath
      }
    })
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    if (!categoryId) {
      setActiveTab('all')
    }
    setTimeout(() => {
      if (schemesSectionRef.current) {
        schemesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  // Helper to parse comma or newline-separated values into array
  const parseListField = (value) => {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (typeof value === 'string') {
      let items = value.split(/,|\n/).map(item => item.trim()).filter(item => item)
      return items
    }
    return [value]
  }

  // Helper to get title from sub_mod item
  const getSubModTitle = (item) => {
    if (typeof item === 'string') return item
    if (item && typeof item === 'object') return item.title || item.description || item.name || ''
    return ''
  }

  // Helper to get description from sub_mod item
  const getSubModDesc = (item) => {
    if (item && typeof item === 'object') return item.description || ''
    return ''
  }

  // Check if title matches a section
  const getSectionFromTitle = (title) => {
    const t = title?.toLowerCase().replace(/^-*\s*/, '') || ''
    if (t.includes('documents needed') || t.includes('आवश्यक दस्तावेज़') || t.includes('documents') || t.includes('दस्तावेज़')) return 'documents'
    if (t.includes('how to apply') || t.includes('आवेदन कैसे करें') || t.includes('apply')) return 'howToApply'
    if (t.includes('important tips') || t.includes('महत्वपूर्ण सुझाव') || t.includes('tips') || t.includes('सुझाव')) return 'tips'
    if (t.includes('who can apply') || t.includes('आवेदन कौन कर सकते हैं') || t.includes('eligibility') || t.includes('कौन')) return 'eligibility'
    if (t.includes('benefits') || t.includes('मुख्य लाभ') || t.includes('लाभ')) return 'benefits'
    if (t.includes('about') || t.includes('योजना के बारे में') || t.includes('विवरण')) return 'about'
    return ''
  }

  // Enrich scheme data with API information
  const enrichSchemeData = (apiScheme) => {
    const subMod = apiScheme.sub_mod_hindi || apiScheme.sub_mod
    const about = apiScheme.description_hindi || apiScheme.description
    
    let benefits = []
    let eligibility = []
    let documents = []
    let howToApply = []
    let tips = []
    const totalAmount = apiScheme.total_amount || 'Visit Website'
    
    if (subMod && Array.isArray(subMod) && subMod.length > 0) {
      subMod.forEach(item => {
        const title = getSubModTitle(item)
        const description = getSubModDesc(item)
        const items = parseListField(description).filter(i => i && i.trim())
        const section = getSectionFromTitle(title)
        
        if (section === 'eligibility') {
          eligibility = [...eligibility, ...items]
        } else if (section === 'documents') {
          documents = [...documents, ...items]
        } else if (section === 'howToApply') {
          howToApply = [...howToApply, ...items]
        } else if (section === 'tips') {
          tips = [...tips, ...items]
        } else if (section === 'benefits' && items.length > 0) {
          benefits = [...benefits, ...items]
        }
      })
    }
    
    return {
      ...apiScheme,
      icon: <FaAward />,
      about: about || 'No description available',
      benefits,
      eligibility,
      documents,
      howToApply,
      tips,
      amount: totalAmount,
      scheme_image: apiScheme.scheme_image || '',
      officialLink: apiScheme.web_link || 'https://example.com'
    }
  }

  const handleSchemeClick = (scheme) => {
    const enrichedScheme = enrichSchemeData(scheme)
    setSelectedScheme(enrichedScheme)
    setShowModal(true)
  }

  const getCategorySchemes = () => {
    if (!selectedCategory) {
      return []
    }
    const schemes = apiSchemesData[selectedCategory] || []
    return schemes.map(s => enrichSchemeData(s))
  }

  const getAllSchemes = () => {
    const allSchemes = []
    Object.values(apiSchemesData).forEach(categorySchemes => {
      allSchemes.push(...categorySchemes.map(s => enrichSchemeData(s)))
    })
    return allSchemes
  }

  const displayedSchemes = selectedCategory ? getCategorySchemes() : []
  const allSchemes = getAllSchemes()
  const categories = getCategoriesForDisplay()
  const schemesToDisplay = activeTab === 'all' ? allSchemes : displayedSchemes

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
          {/* Back Button */}
          <div className="mb-4">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/UserDashboard')} 
              className="d-flex align-items-center"
            >
              <FaArrowLeft className="me-2" />
                  {language === 'hi' ? "डैशबोर्ड पर वापस जाएं" : "Back to Dashboard"}
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: '60px', height: '60px' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
                  <p className="mt-3">{language === 'hi' ? "सरकारी योजनाएं लोड हो रही हैं..." : "Loading Government Schemes..."}</p>
            </div>
          ) : error ? (
            <Card className="shadow-box mb-4">
              <Card.Body className="p-4">
                <div className="d-flex align-items-start gap-3">
                  <div style={{fontSize: '1.5rem'}}>⚠️</div>
                  <div style={{flex: 1}}>
                        <h5 className="text-danger mb-2">{language === 'hi' ? "सरकारी योजनाएं लोड करने में त्रुटि" : "Error Loading Government Schemes"}</h5>
                    <p className="text-muted mb-3">{error}</p>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => setRetryCount(prev => prev + 1)}
                    >
                          {language === 'hi' ? "पुनः प्रयास करें" : "Retry"}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ) : apiCategories.length === 0 ? (
            <Card className="shadow-box mb-4">
              <Card.Body className="p-4 text-center">
                    <p className="text-muted mb-0">{language === 'hi' ? "इस समय कोई सरकारी योजना उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।" : "No government schemes available at the moment. Please try again later."}</p>
              </Card.Body>
            </Card>
          ) : (
            <div>
              {/* Header Card */}
              <Card className="shadow-box mb-4">
                <Card.Body>
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                    <div>
                      <h3 className="mb-2">
                        <FaAward className="me-2 text-primary" />
                            {language === 'hi' ? "सरकारी योजनाएं" : "Government Schemes"}
                      </h3>
                      <p className="text-muted mb-0">
                            {language === 'hi' ? "आपके लिए उपलब्ध सरकारी योजनाओं का अन्वेषण करें" : "Explore government schemes available for you"}
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Step 1: Select Category */}
              <Card className="shadow-box mb-4">
                <Card.Body>
                  <h5 className="mb-3">
                        <Badge bg="primary" className="me-2">{language === 'hi' ? "चरण 1" : "Step 1"}</Badge>
                        {language === 'hi' ? "योजना श्रेणी चुनें" : "Select Scheme Category"}
                  </h5>
                  <Row>
                    {categories.map((category) => (
                      <Col lg={3} md={6} className="mb-3" key={category.id}>
                        <Card
                          className={`h-100 border stream-selection-card ${selectedCategory === category.id ? 'selected' : ''}`}
                          style={{
                            cursor: 'pointer',
                            borderColor: selectedCategory === category.id ? '#667eea' : '#dee2e6',
                            overflow: 'hidden',
                            width: '100%'
                          }}
                          onClick={() => handleCategoryChange(category.id)}
                        >
                          {category.image && (
                            <div style={{
                              height: '120px',
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderBottom: '1px solid #e0e0e0'
                            }}>
                              <img
                                src={category.image}
                                alt={category.name}
                                style={{
                                  maxHeight: '100%',
                                  maxWidth: '100%',
                                  objectFit: 'contain',
                                  padding: '10px'
                                }}
                                onError={(e) => { e.target.style.display = 'none' }}
                              />
                            </div>
                          )}
                          <Card.Body className="p-3 text-center">
                                <h6 className="mb-1">{language === 'hi' ? category.name_hindi || category.name : category.name}</h6>
                                <small className="text-muted">{language === 'hi' ? category.description_hindi || category.description : category.description}</small>
                            {selectedCategory === category.id && (
                              <Badge bg="primary" className="mt-2">
                                    <FaCheckCircle className="me-1" /> {language === 'hi' ? "चयनित" : "Selected"}
                              </Badge>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>

              {/* Step 2: Schemes List */}
              {(selectedCategory || activeTab === 'all') && (
                <Card ref={schemesSectionRef} className="shadow-box mb-4">
                  <Card.Header className="bg-white border-0 pt-4 pb-0">
                    <h5 className="mb-0">
                      <FaUniversity className="me-2 text-primary" />
                      Available Schemes - {activeTab === 'all' ? 'All Schemes' : (categories.find(c => c.id === selectedCategory)?.name_hindi || categories.find(c => c.id === selectedCategory)?.name)}
                    </h5>
                    <p className="text-muted mb-0">
                      Browse and click on any scheme for details
                    </p>
                  </Card.Header>
                  <Card.Body>
                    <Tab.Container id="schemes-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                      <Nav variant="tabs" className="mb-4">
                        <Nav.Item>
                          <Nav.Link eventKey="category" disabled={!selectedCategory}>
                            <FaBook className="me-2" />
                            Category Schemes
                          </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="all">
                            <FaAward className="me-2" />
                            All Schemes
                          </Nav.Link>
                        </Nav.Item>
                      </Nav>
                      <Tab.Content>
                        <Tab.Pane eventKey="category">
                          {selectedCategory ? (
                            <Row>
                              {displayedSchemes.map((scheme) => (
                                <Col lg={4} md={6} className="mb-4" key={scheme.id || scheme.gov_scheme_id}>
                                  <Card 
                                    className="h-100 border course-card"
                                    style={{ cursor: 'pointer', overflow: 'hidden', width: '100%' }}
                                    onClick={() => handleSchemeClick(scheme)}
                                  >
                                    {scheme.scheme_image ? (
                                      <div style={{
                                        height: '120px',
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderBottom: '1px solid #e0e0e0'
                                      }}>
                                        <img
                                          src={scheme.scheme_image}
                                          alt={scheme.title}
                                          style={{
                                            maxHeight: '100%',
                                            maxWidth: '100%',
                                            objectFit: 'contain',
                                            padding: '8px'
                                          }}
                                          onError={(e) => { e.target.style.display = 'none' }}
                                        />
                                      </div>
                                    ) : null}
                                    <Card.Body className="p-3 text-center">
                                        <h6 className="mb-1">{language === 'hi' ? scheme.title_hindi || scheme.title : scheme.title}</h6>
                                      {scheme.amount && scheme.amount !== 'Visit Website' ? (
                                        <Badge bg="success" className="mb-2">₹{Number(scheme.amount).toLocaleString('en-IN')}</Badge>
                                      ) : (
                                        <Badge bg="warning" text="dark" className="mb-2">{scheme.amount}</Badge>
                                      )}
                                      <p className="text-muted small mb-2">
                                          {language === 'hi' ? scheme.description_hindi || scheme.description : scheme.description}
                                      </p>
                                      <div className="d-flex flex-wrap gap-1 justify-content-center">
                                        {scheme.benefits?.slice(0, 3).map((benefit, idx) => (
                                          <Badge bg="light" text="dark" key={idx} className="small">
                                            {benefit}
                                          </Badge>
                                        ))}
                                      </div>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              ))}
                            </Row>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-muted mb-0">
                                {language === 'hi' ? "योजनाएं देखने के लिए कृपया ऊपर एक श्रेणी चुनें" : "Please select a category above to view schemes"}
                              </p>
                            </div>
                          )}
                        </Tab.Pane>
                        <Tab.Pane eventKey="all">
                          <Row>
                            {allSchemes.map((scheme) => (
                              <Col lg={4} md={6} className="mb-4" key={scheme.id || scheme.gov_scheme_id}>
                                <Card 
                                  className="h-100 border course-card"
                                  style={{ cursor: 'pointer', overflow: 'hidden', width: '100%' }}
                                  onClick={() => handleSchemeClick(scheme)}
                                >
                                  {scheme.scheme_image ? (
                                    <div style={{
                                      height: '120px',
                                      width: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      borderBottom: '1px solid #e0e0e0'
                                    }}>
                                      <img
                                        src={scheme.scheme_image}
                                        alt={scheme.title}
                                        style={{
                                          maxHeight: '100%',
                                          maxWidth: '100%',
                                          objectFit: 'contain',
                                          padding: '8px'
                                        }}
                                        onError={(e) => { e.target.style.display = 'none' }}
                                      />
                                    </div>
                                  ) : null}
                                  <Card.Body className="p-3 text-center">
                                        <h6 className="mb-1">{language === 'hi' ? scheme.title_hindi || scheme.title : scheme.title}</h6>
                                    {scheme.amount && scheme.amount !== 'Visit Website' ? (
                                      <Badge bg="success" className="mb-2">₹{Number(scheme.amount).toLocaleString('en-IN')}</Badge>
                                    ) : (
                                      <Badge bg="warning" text="dark" className="mb-2">{scheme.amount}</Badge>
                                    )}
                                    <p className="text-muted small mb-2">
                                          {language === 'hi' ? scheme.description_hindi || scheme.description : scheme.description}
                                    </p>
                                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                                      {scheme.benefits?.slice(0, 3).map((benefit, idx) => (
                                        <Badge bg="light" text="dark" key={idx} className="small">
                                          {benefit}
                                        </Badge>
                                      ))}
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        </Tab.Pane>
                      </Tab.Content>
                    </Tab.Container>
                  </Card.Body>
                </Card>
              )}

              {/* Instructions when no category selected */}
              {!selectedCategory && (
                <Card className="shadow-box instructions-card">
                  <Card.Body>
                    <h4>{language === 'hi' ? "सरकारी योजनाओं का उपयोग कैसे करें" : "How to Use Government Schemes"}</h4>
                    <p className="text-muted mb-0">
                      <strong>{language === 'hi' ? "चरण 1:" : "Step 1:"}</strong> {language === 'hi' ? "ऊपर दिए गए विकल्पों में से एक योजना श्रेणी चुनें" : "Select a scheme category from the options above"}<br />
                      <strong>{language === 'hi' ? "चरण 2:" : "Step 2:"}</strong> {language === 'hi' ? "उस श्रेणी में उपलब्ध योजनाओं को ब्राउज़ करें" : "Browse available schemes in that category"}<br />
                      <strong>{language === 'hi' ? "चरण 3:" : "Step 3:"}</strong> {language === 'hi' ? "पूरा विवरण देखने और आवेदन करने के लिए किसी भी योजना पर क्लिक करें" : "Click on any scheme to view full details and apply"}
                    </p>
                  </Card.Body>
                </Card>
              )}
            </div>
          )}
        </Container>
      </div>

      {/* Scheme Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered scrollable className="government-schemes-modal">
        <Modal.Header closeButton className="border-0" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px 8px 0 0'}}>
          <Modal.Title className="w-100">
            <div className="d-flex align-items-center gap-3" style={{color: 'white'}}>
              <div style={{fontSize: '2.5rem', display: 'flex', alignItems: 'center'}}>
                {selectedScheme?.icon}
              </div>
              <div style={{flex: 1}}>
                  <h3 className="mb-2 fw-bold" style={{color: 'white', fontSize: '1.5rem'}}>
                    {language === 'hi' ? selectedScheme?.title_hindi || selectedScheme?.title : selectedScheme?.title}
                </h3>
                <p className="mb-0" style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)'}}>
                    ✓ {language === 'hi' ? "सरकारी योजना" : "Government Scheme"}
                </p>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-4" style={{background: '#f8f9fa'}}>
          {selectedScheme && (
            <div>
              {/* Amount Badge */}
              <div className="mb-4">
                <div className="text-center p-4 rounded" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>
                  <small style={{fontSize: '0.85rem', opacity: 0.9}}>{language === 'hi' ? "कुल लाभ राशि" : "Total Benefit Amount"}</small>
                  <h2 className="mb-0 mt-2 fw-bold">{selectedScheme.amount}</h2>
                </div>
              </div>

              {/* About Section */}
              <div className="mb-4 p-4 bg-white rounded border-start border-5" style={{borderColor: '#667eea'}}>
                <h6 className="text-dark mb-3 fw-bold" style={{fontSize: '1rem'}}>
                  📌 {language === 'hi' ? "इस योजना के बारे में" : "About this Scheme"}
                </h6>
                <p className="mb-0 text-muted" style={{lineHeight: '1.6'}}>{language === 'hi' ? selectedScheme.description_hindi || selectedScheme.description : selectedScheme.description}</p>
              </div>

              {/* Benefits Section */}
              {selectedScheme.benefits && selectedScheme.benefits.length > 0 && (
                <div className="mb-4 p-4 bg-white rounded">
                  <h6 className="text-dark mb-3 fw-bold" style={{fontSize: '1rem'}}>
                    <span style={{color: '#28a745'}}>✨ {language === 'hi' ? "मुख्य लाभ" : "Key Benefits"}</span>
                  </h6>
                  <div className="ps-2">
                    {selectedScheme.benefits.map((benefit, idx) => (
                      <div key={idx} className="mb-3 d-flex align-items-start">
                        <span style={{color: '#28a745', marginRight: '0.75rem', marginTop: '0.25rem', fontSize: '1.2rem'}}>✓</span>
                        <span className="text-muted" style={{fontSize: '0.95rem'}}>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility Section */}
              {selectedScheme.eligibility && selectedScheme.eligibility.length > 0 && (
                <div className="mb-4 p-4 bg-white rounded border-start border-5" style={{borderColor: '#0d6efd'}}>
                  <h6 className="text-dark mb-3 fw-bold" style={{fontSize: '1rem'}}>
                    <span style={{color: '#0d6efd'}}>👤 {language === 'hi' ? "कौन आवेदन कर सकता है?" : "Who Can Apply?"}</span>
                  </h6>
                  <div className="ps-2">
                    {selectedScheme.eligibility.map((elig, idx) => (
                      <div key={idx} className="mb-2 d-flex align-items-start">
                        <span style={{color: '#0d6efd', marginRight: '0.75rem', marginTop: '0.25rem', fontSize: '1rem'}}>•</span>
                        <span className="text-muted" style={{fontSize: '0.95rem'}}>{elig}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents Section */}
              {selectedScheme.documents && selectedScheme.documents.length > 0 && (
                <div className="mb-4 p-4 bg-white rounded">
                  <h6 className="text-dark mb-3 fw-bold" style={{fontSize: '1rem'}}>
                    <span style={{color: '#fd7e14'}}>📄 {language === 'hi' ? "आवश्यक दस्तावेज़" : "Documents Needed"}</span>
                  </h6>
                  <div className="row g-3 ps-2">
                    {selectedScheme.documents.map((doc, idx) => (
                      <div key={idx} className="col-md-6">
                        <div className="p-3 rounded d-flex align-items-start" style={{background: '#fff3cd', border: '1px solid #ffc107'}}>
                          <span style={{color: '#fd7e14', marginRight: '0.75rem', fontSize: '1rem'}}>📋</span>
                          <span className="text-muted small" style={{fontSize: '0.9rem'}}>{doc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* How to Apply Section */}
              {selectedScheme.howToApply && selectedScheme.howToApply.length > 0 && (
                <div className="mb-4 p-4 bg-white rounded border-top border-5" style={{borderColor: '#0dcaf0'}}>
                  <h6 className="text-dark mb-4 fw-bold" style={{fontSize: '1.05rem'}}>
                    <span style={{color: '#0dcaf0'}}>📍 {language === 'hi' ? "आवेदन कैसे करें?" : "How to Apply?"}</span>
                  </h6>
                  <div className="ms-2">
                    {selectedScheme.howToApply.map((step, idx) => (
                      <div key={idx} className="mb-3 d-flex gap-3">
                        <div className="d-flex align-items-center justify-content-center" style={{minWidth: '40px', height: '40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '50%', fontWeight: 'bold', fontSize: '1rem'}}>
                          {idx + 1}
                        </div>
                        <div style={{flex: 1}}>
                          <span className="text-muted" style={{fontSize: '0.95rem'}}>{step}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips Section */}
              {selectedScheme.tips && selectedScheme.tips.length > 0 && (
                <div className="mb-4 p-4 rounded" style={{background: '#fff3cd', border: '2px solid #ffc107'}}>
                  <h6 className="text-dark mb-3 fw-bold" style={{fontSize: '1rem'}}>
                    <span style={{color: '#fd7e14'}}>⚠️ {language === 'hi' ? "महत्वपूर्ण सुझाव" : "Important Tips"}</span>
                  </h6>
                  <ul className="mb-0 ps-4 small" style={{color: '#856404', fontSize: '0.9rem'}}>
                    {selectedScheme.tips.map((tip, idx) => (
                      <li key={idx} className="mb-2">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Official Website Section */}
              <div className="p-4 rounded" style={{background: '#e7f3ff', border: '2px solid #0d6efd'}}>
                <h6 className="text-dark mb-3 fw-bold" style={{fontSize: '1rem'}}>
                  <span style={{color: '#0d6efd'}}>🔗 {language === 'hi' ? "आधिकारिक वेबसाइट" : "Official Website"}</span>
                </h6>
                <a href={selectedScheme.officialLink} target="_blank" rel="noopener noreferrer" className="text-break" style={{color: '#0d6efd', textDecoration: 'none', fontWeight: '500'}}>
                  {selectedScheme.officialLink}
                </a>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 bg-white pt-3 pb-3">
          <Button variant="secondary" onClick={() => setShowModal(false)} style={{borderRadius: '8px', padding: '0.5rem 2rem'}}>
            {language === 'hi' ? "बंद करें" : "Close"}
          </Button>
          <Button 
            style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '8px', padding: '0.5rem 2rem', fontWeight: 'bold'}} 
            onClick={() => window.open(selectedScheme?.officialLink, '_blank')}
          >
            🚀 {language === 'hi' ? "अभी आवेदन करें" : "Apply Now"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default GovernmentSchemes