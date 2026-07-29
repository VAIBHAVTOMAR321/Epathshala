import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, Table, Spinner, Image } from 'react-bootstrap';
import AdminLeftNav from './AdminLeftNav';
import AdminHeader from './AdminHeader';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaUserTie } from 'react-icons/fa';
import { useAuth } from '../all_login/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/admindashboard.css';

const API_URL = 'https://brjobsedu.com/epathshala/epathshala_backend/api/counseulor/';
const BASE_IMAGE_URL = 'https://brjobsedu.com/epathshala/epathshala_backend';

const ManageCounselors = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [counselors, setCounselors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCounselor, setEditingCounselor] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [counselorFormData, setCounselorFormData] = useState({
    name: '',
    description: '',
    co_img: null,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchCounselors();
    }
  }, [accessToken]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const fetchCounselors = async () => {
    if (!accessToken) {
      console.log('No access token, waiting...');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        const processedCounselors = response.data.data.map(counselor => {
          if (counselor.co_img) {
            // Check if the URL is already absolute. If not, construct it.
            if (counselor.co_img.startsWith('/media')) {
              counselor.co_img = `${BASE_IMAGE_URL}${counselor.co_img}`;
            } else if (counselor.co_img.includes('brjobsedu.com/media')) {
              counselor.co_img = counselor.co_img.replace('brjobsedu.com/media', 'brjobsedu.com/epathshala/epathshala_backend/media');
            }
          }
          return counselor;
        });
        setCounselors(processedCounselors);
      } else {
        setCounselors([]);
      }
    } catch (error) {
      console.error('Error fetching counselors:', error);
      setCounselors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCounselorFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setCounselorFormData(prev => ({ ...prev, co_img: e.target.files[0] }));
  };

  const resetForm = () => {
    setEditingCounselor(null);
    setCounselorFormData({
      name: '',
      description: '',
      co_img: null,
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (counselor) => {
    setEditingCounselor(counselor);
    setCounselorFormData({
      name: counselor.name || '',
      description: counselor.description || '',
      co_img: null, // We don't pre-fill the file input
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accessToken) {
      alert('Authentication required');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('name', counselorFormData.name);
    formData.append('description', counselorFormData.description);

    if (counselorFormData.co_img) {
      formData.append('co_img', counselorFormData.co_img);
    }

    try {
      if (editingCounselor) {
        formData.append('counseulor_id', editingCounselor.counseulor_id);
        await axios.put(API_URL, formData, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axios.post(API_URL, formData, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      await fetchCounselors();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting counselor:', error);
      alert('Failed to submit counselor. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (counselor) => {
    if (!window.confirm(`Are you sure you want to delete "${counselor.name}"?`)) return;

    if (!accessToken) {
      alert('Authentication required');
      return;
    }

    try {
      await axios.delete(API_URL, {
        data: { counseulor_id: counselor.counseulor_id },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      await fetchCounselors();
    } catch (error) {
      console.error('Error deleting counselor:', error);
      alert('Failed to delete counselor. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <AdminLeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
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
    );
  }

  return (
    <>
      <div className="dashboard-container">
        <AdminLeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
        <div className="main-content-dash">
          <AdminHeader toggleSidebar={toggleSidebar} />
          <div className="dashboard-content">
            <Container fluid className="dashboard-box">
              <Card className="shadow-sm mb-4">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-4 page-header">
                    <div className="d-flex align-items-center all-en-box gap-3">
                      <Button variant="outline-secondary" size="sm" onClick={() => navigate('/AdminDashboard')} className="me-2">
                        <FaArrowLeft /> Dashboard
                      </Button>
                      <h4 className="mb-0">Counselor Management</h4>
                    </div>
                    <Button variant="primary" onClick={openCreateModal}>
                      <FaPlus className="me-2" /> Add Counselor
                    </Button>
                  </div>

                  <Table responsive hover className="table-card">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {counselors.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center text-muted py-4">
                            No counselors available
                          </td>
                        </tr>
                      ) : (
                        counselors.map((counselor) => (
                          <tr key={counselor.id}>
                            <td><Badge bg="secondary">{counselor.counseulor_id}</Badge></td>
                            <td>
                              <Image src={counselor.co_img} alt={counselor.name} rounded style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                            </td>
                            <td>{counselor.name}</td>
                            <td style={{maxWidth: '400px'}}>{counselor.description}</td>
                            <td>
                              <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => handleEdit(counselor)}>
                                <FaEdit />
                              </Button>
                              <Button variant="outline-danger" size="sm" onClick={() => handleDelete(counselor)}>
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Container>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); resetForm() }} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingCounselor ? 'Edit Counselor' : 'Create Counselor'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={counselorFormData.name}
                onChange={handleInputChange}
                placeholder="Enter counselor's name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={counselorFormData.description}
                onChange={handleInputChange}
                placeholder="Enter counselor's description"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                name="co_img"
                onChange={handleFileChange}
                accept="image/*"
              />
              {editingCounselor && editingCounselor.co_img && !counselorFormData.co_img && (
                <div className="mt-2">
                  <p className="small text-muted">Current Image:</p>
                  <Image src={editingCounselor.co_img} thumbnail style={{ maxHeight: '100px' }} />
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm() }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingCounselor ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default ManageCounselors;