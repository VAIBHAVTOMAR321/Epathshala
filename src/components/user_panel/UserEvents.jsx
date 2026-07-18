import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Modal, Nav } from 'react-bootstrap'
import axios from 'axios'
import { useAuth } from '../all_login/AuthContext'
import UserHeader from './UserHeader'
import UserLeftNav from './UserLeftNav'
import '../../assets/css/userleftnav.css'
import "../../assets/css/UserEvents.css";
import { useLanguage } from '../all_login/LanguageContext'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaEye } from 'react-icons/fa'

const UserEvents = () => {
  const { uniqueId, accessToken } = useAuth()
  const { language } = useLanguage()
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  const eventsPerPage = 9

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
    const fetchEvents = async () => {
      if (!uniqueId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError("")
        const response = await axios.get(
          'https://brjobsedu.com/gyandhara/gyandhara_backend/api/event-item/',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (response.data.success) {
          setEvents(response.data.data || [])
        } else {
          setEvents([])
        }
      } catch (err) {
        console.error("Error fetching events:", err)
        setError("Failed to load events")
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [uniqueId, accessToken])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleViewEvent = (event) => {
    setSelectedEvent(event)
    setShowViewModal(true)
  }

  const isEventUpcoming = (event) => {
    if (!event.event_date_time) return false
    const eventDate = new Date(event.event_date_time)
    const now = new Date()
    return eventDate > now
  }

  const getFilteredEvents = () => {
    switch (activeTab) {
      case 'active':
        return events.filter(e => e.is_active)
      case 'upcoming':
        return events.filter(e => e.is_upcoming)
      case 'past':
        return events.filter(e => e.is_past)
      default:
        return events
    }
  }

  const filteredEvents = getFilteredEvents()

  const getEventCounts = () => ({
    all: events.length,
    active: events.filter(e => e.is_active).length,
    upcoming: events.filter(e => e.is_upcoming).length,
    past: events.filter(e => e.is_past).length
  })

  const counts = getEventCounts()

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A'
    const date = new Date(dateTimeStr)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const closeModal = () => {
    setShowViewModal(false)
    setSelectedEvent(null)
  }

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
          <Row className="mb-4">
            <Col xs={12} className="mt-4">
                 <div className="d-flex align-items-center mb-3">
                   <FaCalendarAlt className="me-2 text-primary" style={{ fontSize: '20px' }} />
                   <h4 className="mb-0 fw-bold">{language === 'hi' ? "कार्यक्रम" : "Events"}</h4>
                 </div>
                 <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                   {language === 'hi' ? "आगामी कार्यक्रमों, कार्यशालाओं और सेमिनारों की खोज करें और उनमें भाग लें।" : "Discover and participate in upcoming events, workshops, and seminars."}
                 </p>
            </Col>
          </Row>

          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-light border-bottom py-3">
               <Nav variant="tabs" activeKey={activeTab} onSelect={(key) => { setActiveTab(key); setCurrentPage(1) }} className="mb-0">
                 <Nav.Item>
                   <Nav.Link eventKey="all" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                     {language === 'hi' ? "सभी" : "All"} ({counts.all})
                   </Nav.Link>
                 </Nav.Item>
                 <Nav.Item>
                   <Nav.Link eventKey="active" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                     {language === 'hi' ? "सक्रिय" : "Active"} ({counts.active})
                   </Nav.Link>
                 </Nav.Item>
                 <Nav.Item>
                   <Nav.Link eventKey="upcoming" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                     {language === 'hi' ? "आगामी" : "Upcoming"} ({counts.upcoming})
                   </Nav.Link>
                 </Nav.Item>
               </Nav>
            </Card.Header>
          </Card>

          {error && (
            <Alert variant="danger">{error}</Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" style={{ width: '60px', height: '60px' }} />
              <p className="mt-3">{language === 'hi' ? "कार्यक्रम लोड हो रहे हैं..." : "Loading events..."}</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <Alert variant="info" className="text-center">
              <FaCalendarAlt className="me-2" />
              {language === 'hi' ? `कोई ${activeTab === 'all' ? '' : activeTab} कार्यक्रम नहीं मिला` : `No ${activeTab === 'all' ? '' : activeTab} events found`}
            </Alert>
          ) : (
            <>
              <Row>
                {filteredEvents
                  .slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage)
                  .map((event) => {
                    const upcoming = isEventUpcoming(event)
                    return (
                      <Col md={6} lg={4} key={event.id} className="mb-4">
                        <Card className="h-100 shadow-sm event-card" style={{ 
                          borderRadius: '16px', 
                          border: 'none',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-5px)'
                          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                        >
                          <div style={{ 
                            height: '180px',
                            overflow: 'hidden',
                            backgroundColor: '#f8f9fa'
                          }}>
                            {event.event_image ? (
                              <img 
                                src={`https://brjobsedu.com/gyandhara/gyandhara_backend${event.event_image}`}
                              alt={language === 'hi' && event.event_name_hindi ? event.event_name_hindi : event.event_name}
                                style={{ 
                                  width: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <div style={{ 
                                height: '100%',
                                background: upcoming 
                                  ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                                  : 'linear-gradient(135deg, #11998e, #38ef7d)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <div className="text-center text-white">
                                  {event.event_type && (
                                    <Badge bg="light" text="dark" className="ms-2">
                                      {event.event_type}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                           <Card.Body className="d-flex flex-column">
                             <div className="mb-3">
                               <h6 className="mb-1 fw-bold" style={{ color: '#333', fontSize: '0.85rem' }}>{language === 'hi' && event.event_name_hindi ? event.event_name_hindi : event.event_name}</h6>
                               {(language === 'hi' ? event.description_hindi || event.description : event.description) && (
                                 <p className="text-muted mb-0" style={{ lineHeight: '1.4', fontSize: '0.75rem' }}>
                                   {(language === 'hi' ? event.description_hindi || event.description : event.description).length > 100 
                                     ? (language === 'hi' ? event.description_hindi || event.description : event.description).substring(0, 100) + '...' 
                                     : (language === 'hi' ? event.description_hindi || event.description : event.description)}
                                 </p>
                               )}
                             </div>

                            <div className="mb-3" style={{ flex: 1 }}>
                               <div className="d-flex align-items-center mb-2">
                                 <div className="d-flex align-items-center text-muted">
                                   <FaClock className="me-2 text-primary" style={{ fontSize: '12px' }} />
                                   <small style={{ fontSize: '0.7rem' }}>{language === 'hi' ? "प्रारंभ" : "Start"}: {formatDateTime(event.event_date_time)}</small>
                                 </div>
                               </div>
                              
                               {event.end_date_time && (
                                 <div className="d-flex align-items-center mb-2">
                                   <div className="d-flex align-items-center text-muted">
                                     <FaClock className="me-2 text-danger" style={{ fontSize: '12px' }} />
                                     <small style={{ fontSize: '0.7rem' }}>{language === 'hi' ? "समाप्ति" : "End"}: {formatDateTime(event.end_date_time)}</small>
                                   </div>
                                 </div>
                               )}
                              
                               {event.venue && (
                                 <div className="d-flex align-items-center">
                                   <div className="d-flex align-items-center text-muted">
                                     <FaMapMarkerAlt className="me-2 text-success" style={{ fontSize: '12px' }} />
                                     <small style={{ fontSize: '0.7rem' }}>{event.venue}</small>
                                   </div>
                                 </div>
                               )}
                            </div>

                            <div className="mt-auto pt-3">
                                 <Button
                                   variant="outline-primary"
                                   className="w-100 d-flex align-items-center justify-content-center"
                                   onClick={() => handleViewEvent(event)}
                                   style={{ 
                                     borderRadius: '8px',
                                     fontWeight: '600',
                                     padding: '8px 14px',
                                     fontSize: '0.85rem'
                                   }}
                                 >
                                   <FaEye className="me-2" style={{ fontSize: '14px' }} />
                                   {language === 'hi' ? "विवरण देखें" : "View Details"}
                                 </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    )
                  })}
              </Row>
              
              {filteredEvents.length > eventsPerPage && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                   <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                     {language === 'hi' ? "दिखाया जा रहा है" : "Showing"} {((currentPage - 1) * eventsPerPage) + 1}-{Math.min(currentPage * eventsPerPage, filteredEvents.length)} {language === 'hi' ? "कुल" : "of"} {filteredEvents.length} {language === 'hi' ? "कार्यक्रम" : "events"}
                   </div>
                  <div className="d-flex align-items-center gap-2">
                     <Button
                       variant="outline-primary"
                       size="sm"
                       disabled={currentPage === 1}
                       onClick={() => setCurrentPage(currentPage - 1)}
                       style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                     >
                       {language === 'hi' ? "पिछला" : "Previous"}
                     </Button>
                     {Array.from({ length: Math.ceil(filteredEvents.length / eventsPerPage) }, function(_, i) { return i + 1 }).map(function(page) { return (
                       <Button
                         key={page}
                         variant={currentPage === page ? 'primary' : 'outline-primary'}
                         size="sm"
                         onClick={() => setCurrentPage(page)}
                         style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                       >
                         {page}
                       </Button>
                     ); })}
                     <Button
                       variant="outline-primary"
                       size="sm"
                       disabled={currentPage === Math.ceil(filteredEvents.length / eventsPerPage)}
                       onClick={() => setCurrentPage(currentPage + 1)}
                       style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                     >
                       {language === 'hi' ? "अगला" : "Next"}
                     </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Container>
      </div>

      {/* View Event Modal */}
      <Modal show={showViewModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaCalendarAlt className="me-2" />
            {language === 'hi' ? "कार्यक्रम विवरण" : "Event Details"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <div>
              {selectedEvent.event_image && (
                <div className="mb-3">
                  <img 
                    src={`https://brjobsedu.com/gyandhara/gyandhara_backend${selectedEvent.event_image}`}
                    alt={selectedEvent.event_name}
                    className="img-fluid rounded"
                    style={{ maxHeight: '300px', objectFit: 'cover' }}
                  />
                </div>
              )}
              
              <div className="mb-4">
                <Badge bg="secondary" className="me-2">{selectedEvent.event_id}</Badge>
                {selectedEvent.event_type && (
                  <Badge bg="info">{selectedEvent.event_type}</Badge>
                )}
              </div>
               
              <h4 className="mb-3">{language === 'hi' && selectedEvent.event_name_hindi ? selectedEvent.event_name_hindi : selectedEvent.event_name}</h4>
                
                 {(language === 'hi' ? selectedEvent.description_hindi || selectedEvent.description : selectedEvent.description) && (
                   <div className="mb-4">
                     <h6 className="text-muted mb-2">{language === 'hi' ? "विवरण" : "Description"}</h6>
                     <p className="" style={{ fontSize: '0.95rem' }}>{language === 'hi' ? selectedEvent.description_hindi || selectedEvent.description : selectedEvent.description}</p>
                   </div>
                 )}
              
              <Row className="mb-4">
                <Col md={6}>
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted mb-2">
                      <FaClock className="me-2" /> {language === 'hi' ? "प्रारंभ तिथि और समय" : "Start Date & Time"}
                    </h6>
                     <p className="mb-0 fw-semibold" style={{ fontSize: '0.9rem' }}>{formatDateTime(selectedEvent.event_date_time)}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted mb-2">
                      <FaClock className="me-2" /> {language === 'hi' ? "समाप्ति तिथि और समय" : "End Date & Time"}
                    </h6>
                     <p className="mb-0 fw-semibold" style={{ fontSize: '0.9rem' }}>
                       {selectedEvent.end_date_time ? formatDateTime(selectedEvent.end_date_time) : 'N/A'}
                     </p>
                  </div>
                </Col>
              </Row>
              
              <div className="p-3 bg-light rounded">
                <h6 className="text-muted mb-2">
                  <FaMapMarkerAlt className="me-2" /> {language === 'hi' ? "स्थान" : "Venue"}
                </h6>
                <p className="mb-0 fw-semibold">{selectedEvent.venue || 'N/A'}</p>
              </div>
            </div>
          )}
        </Modal.Body>
           <Modal.Footer>
             <Button variant="secondary" onClick={closeModal} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
               {language === 'hi' ? "बंद करें" : "Close"}
             </Button>
           </Modal.Footer>
      </Modal>
    </div>
  )
}

export default UserEvents