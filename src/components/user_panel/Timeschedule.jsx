import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Card, Spinner, Table, Badge, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../all_login/AuthContext";
import { useLanguage } from "../all_login/LanguageContext";
import "../../assets/css/userleftnav.css";
import UserHeader from "./UserHeader";
import UserLeftNav from "./UserLeftNav";
import "./UserProfile.css";
import "./Timeschedule.css";

const API_URL = "https://brjobsedu.com/Epathshala/Epathshala_backend/api/time-schedule/";

const Timeschedule = () => {
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const { uniqueId, accessToken } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [notification, setNotification] = useState(null);
  const [triggeredNotifications, setTriggeredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = useMemo(
    () => (language === "hi" ? ["सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार"] : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
    [language]
  );

  const timeSlots = useMemo(
    () => [
      "04:00-05:00",
      "05:00-06:00",
      "08:00-09:00",
      "09:00-10:00",
      "10:00-10:15",
      "10:15-11:15",
      "11:15-12:15",
      "16:00-17:00",
      "17:00-18:00",
      "18:00-19:00",
      "19:00-20:00",
      "20:00-21:00",
      "21:00-22:00",
      "22:00-23:00",
      "23:00-00:00"
    ],
    []
  );

  const taskTypes = useMemo(
    () => [
      { value: "study", label: language === "hi" ? "अध्ययन" : "Study", variant: "primary" },
      { value: "subject", label: language === "hi" ? "विषय" : "Subject", variant: "success" },
      { value: "play", label: language === "hi" ? "खेल" : "Play", variant: "warning" },
      { value: "project", label: language === "hi" ? "परियोजना" : "Project", variant: "info" },
      { value: "break", label: language === "hi" ? "ब्रेक" : "Break", variant: "secondary" },
    ],
    [language]
  );

  const initialFormState = {
    title: "",
    day: days[0],
    time: timeSlots[0],
    type: "study",
    description: "",
  };

  const [formState, setFormState] = useState(initialFormState);

  const getTypeConfig = (type) => {
    const config = taskTypes.find((item) => item.value === type);
    return config || taskTypes[0];
  };

  const fetchTasks = async () => {
    if (!uniqueId || !accessToken) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}?student_id=${uniqueId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.data.success) {
        const mappedTasks = response.data.data.map(task => ({
          id: task.id,
          day: task.day,
          time: task.time,
          type: task.type,
          title: { en: task.title_en, hi: task.title_hi },
          description: { en: task.description_en, hi: task.description_hi }
        }));
        setTasks(mappedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (uniqueId && accessToken) {
      fetchTasks();
    }
  }, [uniqueId, accessToken, days]);

  useEffect(() => {
    const pad = (value) => String(value).padStart(2, "0");
    const checkNotifications = () => {
      const now = new Date();
      const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      tasks.forEach((task) => {
        const taskStart = task.time.split("-")[0];
        if (taskStart === currentTime && !triggeredNotifications.includes(task.id)) {
          setNotification({
            title: task.title[language] || task.title.en,
            day: task.day,
            time: task.time,
          });
          setTriggeredNotifications((prev) => [...prev, task.id]);
        }
      });
    };

    const interval = setInterval(checkNotifications, 30000);
    checkNotifications();
    return () => clearInterval(interval);
  }, [tasks, triggeredNotifications, language]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleDragStart = (event, taskId) => {
    event.dataTransfer.setData("text/plain", taskId);
  };

  const allowDrop = (event) => {
    event.preventDefault();
  };

  const handleDrop = async (event, day, time) => {
    event.preventDefault();
    const taskId = Number(event.dataTransfer.getData("text/plain"));
    if (!taskId) return;

    const taskToUpdate = tasks.find((t) => t.id === taskId);
    if (!taskToUpdate) return;

    const payload = {
      student_id: uniqueId,
      day: day,
      time: time,
      type: taskToUpdate.type,
      title_en: taskToUpdate.title.en,
      title_hi: taskToUpdate.title.hi,
      description_en: taskToUpdate.description.en,
      description_hi: taskToUpdate.description.hi,
    };

    try {
      await axios.put(`${API_URL}?task_id=${taskId}`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      fetchTasks();
    } catch (error) {
      console.error("Error updating task position:", error);
    }
  };

  const handleFormChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setSelectedTask(null);
    setFormState({
      title: "",
      day: days[0],
      time: timeSlots[0],
      type: "study",
      description: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formState.title?.trim()) {
      return;
    }

    const payload = {
      student_id: uniqueId,
      day: formState.day,
      time: formState.time,
      type: formState.type,
      title_en: language === "en" ? formState.title : (selectedTask?.title.en || formState.title),
      title_hi: language === "hi" ? formState.title : (selectedTask?.title.hi || formState.title),
      description_en: language === "en" ? formState.description : (selectedTask?.description.en || formState.description),
      description_hi: language === "hi" ? formState.description : (selectedTask?.description.hi || formState.description),
    };

try {
      if (selectedTask) {
        await axios.put(`${API_URL}?task_id=${selectedTask.id}`, payload, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setNotification({
          title: language === "hi" ? "कार्य अपडेट किया गया" : "Task updated",
          day: formState.day,
          time: formState.time,
        });
      } else {
        await axios.post(`${API_URL}`, payload, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setNotification({
          title: language === "hi" ? "नया कार्य जोड़ा गया" : "New task added",
          day: formState.day,
          time: formState.time,
        });
      }
      fetchTasks();
      resetForm();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setFormState({
      title: task.title[language] || task.title.en,
      day: task.day,
      time: task.time,
      type: task.type,
      description: task.description[language] || task.description.en,
    });
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}?task_id=${taskId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      fetchTasks();
      if (selectedTask?.id === taskId) resetForm();
      setNotification({
        title: language === "hi" ? "कार्य हटा दिया गया" : "Task removed",
        day: "",
        time: "",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const buildCellTasks = (day, time) => tasks.filter((task) => task.day === day && task.time === time);

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
          {loading ? (
            <div className="profile-loading">
              <Spinner animation="border" variant="primary" />
              <p>{language === "hi" ? "??? ????? ????? ?? ??? ??..." : "Preparing your timetable..."}</p>
            </div>
          ) : (
            <Row className="g-4">
              <Col lg={8}>
                <Card className="shadow-box timetable-card">
                  <Card.Body>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                      <div>
                        <h2 className="mb-1">{language === "hi" ? "समय सारणी" : "Time Schedule"}</h2>
                        <p className="text-muted mb-0">
                          {language === "hi"
                            ? "अपनी दिनचर्या बनाएँ, कार्यों को आसानी से बदलें और समय पर सूचना प्राप्त करें।"
                            : "Create your routine, move tasks easily, and receive reminders on time."}
                        </p>
                      </div>
                      <Badge bg="success" className="mt-3 mt-md-0">
                        {language === "hi" ? "खींचें और छोड़ें सक्षम" : "Drag & Drop Enabled"}
                      </Badge>
                    </div>

                    {notification && (
                      <Alert variant="info" dismissible onClose={() => setNotification(null)}>
                        <strong>{notification.title}</strong>
                        <div className="small">
                          {notification.day && notification.time
                            ? `${notification.day} � ${notification.time}`
                            : language === "hi" ? "अपडेट की गई समय सारणी" : "Updated schedule"}
                        </div>
                      </Alert>
                    )}

                    <div className="table-responsive timetable-wrapper">
                      <Table bordered hover className="timetable-grid mb-0">
                        <thead>
                          <tr>
                            <th className="time-header">{language === "hi" ? "समय" : "Time"}</th>
                            {days.map((day) => (
                              <th key={day}>{day}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {timeSlots.map((slot) => (
                            <tr key={slot}>
                              <td className="time-cell">{slot}</td>
                              {days.map((day) => (
                                <td
                                  key={`${day}-${slot}`}
                                  className="schedule-cell"
                                  onDragOver={allowDrop}
                                  onDrop={(event) => handleDrop(event, day, slot)}
                                >
                                  <div className="cell-drop-zone">
                                    {buildCellTasks(day, slot).length > 0 ? (
                                      buildCellTasks(day, slot).map((task) => {
                                        const typeConfig = getTypeConfig(task.type);
                                        return (
                                          <Card
                                            key={task.id}
                                            className="task-card mb-2"
                                            draggable
                                            onDragStart={(event) => handleDragStart(event, task.id)}
                                          >
                                            <Card.Body className="p-3">
                                              <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                  <h6 className="mb-1 task-title">{task.title[language] || task.title.en}</h6>
                                                </div>
                                                <Badge bg={typeConfig.variant} className="task-badge">
                                                  {typeConfig.label}
                                                </Badge>
                                              </div>
                                              <div className="task-actions mt-2 d-flex justify-content-between gap-2">
                                                <Button size="sm" variant="outline-secondary" onClick={() => handleEditTask(task)}>
                                                  {language === "hi" ? "संपादित करें" : "Edit"}
                                                </Button>
                                                <Button size="sm" variant="outline-danger" onClick={() => handleDeleteTask(task.id)}>
                                                  {language === "hi" ? "हटाएं" : "Delete"}
                                                </Button>
                                              </div>
                                            </Card.Body>
                                          </Card>
                                        );
                                      })
                                    ) : (
                                      <div className="empty-slot-text">
                                        {language === "hi" ? "यहाँ छोड़ें या नया जोड़ें" : "Drop here or add new"}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card className="shadow-box form-card mb-3">
                  <Card.Body>
                    <h5 className="mb-3">{language === "hi" ? "गतिविधि प्रबंधक" : "Activity Manager"}</h5>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>{language === "hi" ? "गतिविधि शीर्षक" : "Activity Title"}</Form.Label>
                        <Form.Control
                          type="text"
                          value={formState.title}
                          placeholder={language === "hi" ? "जैसे: गणित" : "e.g. Maths"}
                          onChange={(e) => handleFormChange("title", e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>{language === "hi" ? "दिन" : "Day"}</Form.Label>
                        <Form.Select value={formState.day} onChange={(e) => handleFormChange("day", e.target.value)}>
                          {days.map((day) => (
                            <option value={day} key={day}>
                              {day}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{language === "hi" ? "समय स्लॉट" : "Time Slot"}</Form.Label>
                        <Form.Select value={formState.time} onChange={(e) => handleFormChange("time", e.target.value)}>
                          {timeSlots.map((slot) => (
                            <option value={slot} key={slot}>
                              {slot}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{language === "hi" ? "प्रकार" : "Type"}</Form.Label>
                        <Form.Select value={formState.type} onChange={(e) => handleFormChange("type", e.target.value)}>
                          {taskTypes.map((item) => (
                            <option value={item.value} key={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{language === "hi" ? "विवरण" : "Description"}</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={formState.description}
                          placeholder={language === "hi" ? "अतिरिक्त विवरण" : "Additional details"}
                          onChange={(e) => handleFormChange("description", e.target.value)}
                        />
                      </Form.Group>

                      <div className="d-flex gap-2 flex-wrap">
                        <Button type="submit" variant="primary" className="flex-fill">
                          {selectedTask ? (language === "hi" ? "सहेजें" : "Save") : (language === "hi" ? "जोड़ें" : "Add")}
                        </Button>
                        <Button variant="outline-secondary" onClick={resetForm} className="flex-fill">
                          {language === "hi" ? "रीसेट करें" : "Reset"}
                        </Button>
                      </div>
                       <Card className="shadow-box info-card mt-4">
                  <Card.Body>
                    <h5 className="mb-3">{language === "hi" ? "सुझाव" : "Tips"}</h5>
                    <ul className="timeline-list">
                      <li>{language === "hi" ? "दैनिक दिनचर्या आपको अपनी पढ़ाई पर केंद्रित रहने में मदद करती है।" : "A daily routine helps you stay focused on your studies."}</li>
                      <li>{language === "hi" ? "कार्यों को तुरंत व्यवस्थित करने के लिए उन्हें खींचें।" : "Drag tasks to organize your day instantly."}</li>
                      <li>{language === "hi" ? "पढ़ाई, खेल और आराम को संतुलित करें।" : "Balance study, play, and rest."}</li>
                      <li>{language === "hi" ? "सूचनाएं आपको सही समय पर याद दिलाती हैं।" : "Notifications remind you at the right time."}</li>
                    </ul>
                  </Card.Body>
                </Card>
                    </Form>
                  </Card.Body>
                </Card>

               
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </div>
  );
};

export default Timeschedule;
