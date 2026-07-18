import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Table, Form } from "react-bootstrap";
import axios from "axios";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import "../../assets/css/userleftnav.css";
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';

import { useAuth } from "../all_login/AuthContext";
import SchoolHeader from "./SchoolHeader";
import SchoolLeftNav from "./SchoolLeftNav";

const Offlinecompetition = () => {
  // --- Layout & Device State ---
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 1024;
    }
    return true;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // --- Auth Context ---
  const { accessToken, uniqueId } = useAuth();

  // --- Competition Logic State ---
  const [competitions, setCompetitions] = useState([]);
  
  // SEPARATED LOADING STATES TO FIX BLANK PAGE ISSUE
  const [listLoading, setListLoading] = useState(true);   // Only for fetching list
  const [formLoading, setFormLoading] = useState(false);  // Only for Create/Update forms
  
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    title_hindi: "",
    description_hindi: "",
    location: "",
    school_uni_id: uniqueId || "",
    comp_date_time: "",
  });

  // --- Participants Modal State ---
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedCompForParticipants, setSelectedCompForParticipants] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  // --- Layout Effects ---
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

  // --- Data Fetching Effects ---
  useEffect(() => {
    if (accessToken) {
      fetchCompetitions();
    } else {
      setListLoading(false);
    }
  }, [accessToken]);

  // --- API Functions ---
  const fetchCompetitions = useCallback(async () => {
    if (!accessToken) {
      setListLoading(false);
      return;
    }

    try {
      setListLoading(true);
      setError("");
      const response = await axios.get(
        "https://brjobsedu.com/gyandhara/gyandhara_backend/api/offline-competition/",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        setCompetitions(response.data.data);
      } else {
        setError("API returned success: false");
      }
    } catch (err) {
      console.error("Competition API Error:", err);
      setError("Failed to fetch competitions: " + err.message);
    } finally {
      setListLoading(false);
    }
  }, [accessToken]);

  const handleCreate = useCallback(async () => {
    if (!accessToken) {
      setError("No authentication token found.");
      return;
    }

    try {
      setFormLoading(true); // Use formLoading here
      setError("");
      const payload = {
        ...formData,
        school_uni_id: uniqueId,
      };
      const response = await axios.post(
        "https://brjobsedu.com/gyandhara/gyandhara_backend/api/offline-competition/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        alert("Created successfully");
        setCompetitions((prev) => [...prev, response.data.data]);
        setShowModal(false);
        resetForm();
        fetchCompetitions(); // Refresh list
      } else {
        setError("API returned success: false");
      }
    } catch (err) {
      console.error("Create Competition API Error:", err);
      setError("Failed to create competition: " + err.message);
    } finally {
      setFormLoading(false); // Use formLoading here
    }
  }, [accessToken, formData, uniqueId, fetchCompetitions]);

  const handleUpdate = useCallback(async () => {
    if (!accessToken || !selectedCompetition) {
      setError("No authentication token or competition selected.");
      return;
    }

    try {
      setFormLoading(true);
      setError("");

      // Required payload with completion_id
      const payload = {
        completion_id: selectedCompetition.completion_id, // REQUIRED
        title: formData.title,
        description: formData.description,
        title_hindi: formData.title_hindi,
        description_hindi: formData.description_hindi,
        location: formData.location,
        school_uni_id: uniqueId,
        comp_date_time: formData.comp_date_time,
      };

      const response = await axios.put(
        "https://brjobsedu.com/gyandhara/gyandhara_backend/api/offline-competition/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        alert("Competition updated successfully");

        fetchCompetitions();
        setShowModal(false);
        resetForm();
      } else {
        setError("Update failed");
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Failed to update competition");
    } finally {
      setFormLoading(false);
    }
  }, [accessToken, selectedCompetition, formData, uniqueId, fetchCompetitions]);

  // --- Fetch Participants ---
  const fetchParticipants = useCallback(async (completion_id) => {
    if (!accessToken) {
      setError("No authentication token found.");
      return;
    }

    try {
      setParticipantsLoading(true);
      setError("");
      const response = await axios.get(
        `https://brjobsedu.com/gyandhara/gyandhara_backend/api/offline-competition-participation/?completion_id=${completion_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        setParticipants(response.data.data);
      } else {
        setError("Failed to fetch participants.");
      }
    } catch (err) {
      console.error("Participants API Error:", err);
      setError("Failed to fetch participants: " + err.message);
    } finally {
      setParticipantsLoading(false);
    }
  }, [accessToken]);

  // --- Handlers ---
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditClick = (comp) => {
    setSelectedCompetition(comp);
    setFormData({
      title: comp.title || "",
      description: comp.description || "",
      title_hindi: comp.title_hindi || "",
      description_hindi: comp.description_hindi || "",
      location: comp.location || "",
      school_uni_id: comp.school_uni_id || uniqueId,
      comp_date_time: comp.comp_date_time || "",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      title_hindi: "",
      description_hindi: "",
      location: "",
      school_uni_id: uniqueId || "",
      comp_date_time: "",
    });
    setSelectedCompetition(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const handleViewParticipants = (comp) => {
    setSelectedCompForParticipants(comp);
    setShowParticipantsModal(true);
    fetchParticipants(comp.completion_id);
  };

  const handleParticipantsModalClose = () => {
    setShowParticipantsModal(false);
    setSelectedCompForParticipants(null);
    setParticipants([]);
  };

  // --- Export Functions ---
  const downloadExcel = () => {
    const dataToExport = competitions.map((comp, index) => ({
      '#': index + 1,
      'Title': comp.title,
      'Title (Hindi)': comp.title_hindi || '',
      'Location': comp.location || '',
      'Date & Time': comp.comp_date_time ? new Date(comp.comp_date_time).toLocaleString() : '-',
      'Institution ID': comp.school_uni_id || '',
      'Description': comp.description || ''
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Offline Competitions')
    XLSX.writeFile(wb, `offline_competitions_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const downloadPDF = () => {
    const doc = new jsPDF()

    const tableColumn = [
      '#',
      'Title',
      'Location',
      'Date & Time',
      'Institution ID'
    ]

    const tableRows = competitions.map((comp, index) => [
      index + 1,
      comp.title,
      comp.location || '',
      comp.comp_date_time ? new Date(comp.comp_date_time).toLocaleString() : '-',
      comp.school_uni_id || ''
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    })

    doc.text('Offline Competitions Report', 14, 15)
    doc.save(`offline_competitions_${new Date().toISOString().split('T')[0]}.pdf`)
  }

return (
  <div className="dashboard-container">
    <SchoolLeftNav
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      isMobile={isMobile}
      isTablet={isTablet}
    />
    <div className="main-content-dash">
      <SchoolHeader toggleSidebar={toggleSidebar} />

      <Container fluid className="dashboard-box mt-3">
        {/* Page Header */}
        <Row className="mb-4 align-items-center">
          <Col>
            <h4 className="font-weight-bold">Offline Competitions</h4>
            <p className="text-muted mb-0">
              Manage institution offline events and competitions
            </p>
          </Col>
           <Col className="text-end mt-3 mt-md-0">
             <div className="d-flex flex-wrap justify-content-end gap-2 align-items-center">
             <Button
               variant="outline-success"
               size="sm"
               onClick={downloadExcel}
               title="Download Excel"
             >
               <FaFileExcel className="me-1" /> Excel
             </Button>
             <Button
               variant="outline-danger"
               size="sm"
               onClick={downloadPDF}
               title="Download PDF"
             >
               <FaFilePdf className="me-1" /> PDF
             </Button>
             <Button
               variant="primary"
               onClick={() => {
                 resetForm();
                 setShowModal(true);
               }}
             >
               + Add Competition
              </Button>
            </div>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Content Card */}
        <Card className="shadow-sm">
          <Card.Body>
            {listLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Loading competitions...</p>
              </div>
            ) : competitions.length > 0 ? (
              <Table striped bordered hover responsive>
                <thead className="table-school">
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Date & Time</th>
                    <th>Institution ID</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {competitions.map((comp, index) => (
                    <tr key={comp.completion_id}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{comp.title}</strong>
                        <br />
                        {comp.title_hindi && (
                          <small className="text-muted">
                            {comp.title_hindi}
                          </small>
                        )}
                      </td>
                      <td>{comp.location}</td>
                      <td>
                        {comp.comp_date_time
                          ? new Date(comp.comp_date_time).toLocaleString()
                          : "-"}
                      </td>
                      <td>{comp.school_uni_id}</td>
                       <td className="text-center">
                         <div className="d-flex justify-content-center gap-2">
                           <Button
                             variant="outline-info"
                             size="sm"
                             onClick={() => handleViewParticipants(comp)}
                           >
                             View Participants
                           </Button>
                           <Button
                             variant="outline-warning"
                             size="sm"
                             onClick={() => handleEditClick(comp)}
                           >
                             Edit
                           </Button>
                         </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-5 text-muted">
                <p>
                  No competitions found. Click "Add Competition" to create one.
                </p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>

    {/* Modal for Add/Edit */}
    <Modal show={showModal} onHide={handleModalClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedCompetition ? "Edit Competition" : "Add New Competition"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group controlId="title" className="mb-3">
                <Form.Label>Title (English)</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter competition title"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="title_hindi" className="mb-3">
                <Form.Label>Title (Hindi)</Form.Label>
                <Form.Control
                  type="text"
                  name="title_hindi"
                  value={formData.title_hindi}
                  onChange={handleInputChange}
                  placeholder="हिंदी में शीर्षक दर्ज करें"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="description" className="mb-3">
                <Form.Label>Description (English)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="description_hindi" className="mb-3">
                <Form.Label>Description (Hindi)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description_hindi"
                  value={formData.description_hindi}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="location" className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Institution Auditorium"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="comp_date_time" className="mb-3">
                <Form.Label>Date & Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="comp_date_time"
                  value={formData.comp_date_time}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="school_uni_id" className="mb-3">
            <Form.Label>Institution Uni ID</Form.Label>
            <Form.Control
              type="text"
              name="school_uni_id"
              value={formData.school_uni_id}
              onChange={handleInputChange}
              disabled
            />
            <Form.Text className="text-muted">
              Auto-filled from your profile.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={selectedCompetition ? handleUpdate : handleCreate}
          disabled={formLoading}
        >
          {formLoading ? (
            <Spinner animation="border" size="sm" />
          ) : selectedCompetition ? (
            "Update Competition"
          ) : (
            "Create Competition"
          )}
        </Button>
      </Modal.Footer>
    </Modal>

    {/* Modal for Participants */}
    <Modal
      show={showParticipantsModal}
      onHide={handleParticipantsModalClose}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Participants for {selectedCompForParticipants?.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {participantsLoading ? (
          <div className="text-center py-3">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading participants...</p>
          </div>
        ) : participants.length > 0 ? (
          <Table striped bordered hover responsive>
            <thead className="table-school">
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Class</th>
                <th>Institution Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>

            <tbody>
              {participants.map((participant, index) => (
                <tr key={participant.id}>
                  <td>{index + 1}</td>
                  <td>{participant.student_details.full_name}</td>
                  <td>{participant.student_details.class_name}</td>
                  <td>{participant.student_details.school_name}</td>
                  <td>{participant.student_details.email}</td>
                  <td>{participant.student_details.phone}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-center py-3 text-muted">
            <p>No participants found for this competition.</p>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleParticipantsModalClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  </div>
);
};

export default Offlinecompetition;