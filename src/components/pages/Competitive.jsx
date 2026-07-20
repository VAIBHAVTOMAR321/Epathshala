import React, { useState, useEffect, useCallback } from 'react';
import '../../assets/css/comp.css';
import { Container, Row, Col, Card } from 'react-bootstrap';

function Competitive() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [testStarted, setTestStarted] = useState(false);
  const [candidateId, setCandidateId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [showWrongAnswers, setShowWrongAnswers] = useState(false);
  const [resultError, setResultError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const validatePhoneNumber = (phoneNum) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phoneNum);
  };

  const handleStartTest = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!validatePhoneNumber(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        'https://brjobsedu.com/epathshala/epathshala_backend/api/start-open-quiz/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: name,
            phone: phone,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to start test');
      }

      const data = await response.json();

      if (data.success) {
        let shuffledQuestions = data.questions || [];
        for (let i = shuffledQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
        }

        setCandidateId(data.candidate_id);
        setQuestions(shuffledQuestions);
        setTestStarted(true);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setTimeRemaining(300);
        setTestSubmitted(false);
        setError('');
      } else {
        setError('Failed to start test. Please try again.');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionIndex,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmitTest = useCallback(async (autoSubmit = false) => {
    // If not auto-submitting, show confirmation dialog
    if (!autoSubmit && !window.confirm('Are you sure you want to submit the test?')) {
      return;
    }

    setSubmittingTest(true);
    setResultError('');

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedIndex]) => ({
        question_id: parseInt(questionId),
        selected: selectedIndex,
      }));

      const response = await fetch(
        'https://brjobsedu.com/epathshala/epathshala_backend/api/submit-open-quiz/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidate_id: candidateId,
            answers: formattedAnswers,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit test');
      }

      const data = await response.json();

      if (data.success) {
        setTestResults(data);
        setTestSubmitted(true);
      } else {
        setResultError('Failed to submit test. Please try again.');
      }
    } catch (err) {
      setResultError('Error submitting test: ' + err.message);
    } finally {
      setSubmittingTest(false);
    }
  }, [answers, candidateId]);

  useEffect(() => {
    if (!testStarted || testSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testSubmitted, handleSubmitTest]);

  const handleJumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    window.scrollTo(0, 0);
  };

  const resetTest = () => {
    setTestStarted(false);
    setName('');
    setPhone('');
    setLanguage('en');
    setTestSubmitted(false);
    setTestResults(null);
    setQuestions([]);
    setCandidateId('');
    setAnswers({});
    setShowWrongAnswers(false);
    setTimeRemaining(600);
  };

  if (testStarted && !testSubmitted) {
    const currentQuestion = questions[currentQuestionIndex];
    const isHindi = language === 'hi';
    const questionText = isHindi ? currentQuestion.question_text_hindi : currentQuestion.question_text;
    const options = isHindi ? currentQuestion.options_hindi : currentQuestion.options;
    const selectedAnswer = answers[currentQuestion.id];

    return (
      <div className="exam-test-wrapper">
        <div className="exam-test-header">
          <div className="exam-test-brand">
            <h2 className="exam-test-title">Competitive Test</h2>
            <div className="exam-test-meta">
              <span className="exam-candidate-id">ID: {candidateId}</span>
              <span className="exam-candidate-name">Name: {name}</span>
            </div>
          </div>
          <div className={`exam-timer-box ${timeRemaining <= 60 ? 'exam-timer-warning' : ''}`}>
            <span className="exam-timer-icon">⏱️</span>
            <div className="exam-timer-display">{formatTime(timeRemaining)}</div>
            <div className="exam-timer-label">Time Left</div>
          </div>
          {timeRemaining <= 0 && (
            <div className="exam-time-up-alert">Time's Up! Submitting...</div>
          )}
          <button
            className="exam-lang-toggle"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          >
            {language === 'en' ? 'हिंदी' : 'English'}
          </button>
        </div>

        <div className="exam-content">
          <div className="exam-question-panel">
            <div className="exam-question-header">
              <span className="exam-question-count">Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className="exam-marks-badge">Marks: {currentQuestion.marks}</span>
            </div>

            <div className="exam-question-body">
              <p>{questionText}</p>
            </div>

            <div className="exam-options-grid">
              {options.map((option, index) => (
                <label
                  key={index}
                  className={`exam-option-item ${selectedAnswer === index ? 'exam-option-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={index}
                    checked={selectedAnswer === index}
                    onChange={() => handleAnswerSelect(index)}
                    className="exam-option-radio"
                  />
                  <span className="exam-option-text">{option}</span>
                </label>
              ))}
            </div>

            <div className="exam-nav-row">
              <button className="exam-btn-outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                ← Previous
              </button>
              {currentQuestionIndex === questions.length - 1 ? (
                <button className="exam-btn-submit" onClick={handleSubmitTest} disabled={submittingTest}>
                  {submittingTest ? 'Submitting...' : 'Submit Test'}
                </button>
              ) : (
                <button className="exam-btn-primary" onClick={handleNextQuestion}>
                  Next →
                </button>
              )}
            </div>
          </div>

          <div className="exam-navigator">
            <h4 className="exam-nav-title">Question Navigator</h4>
            <div className="exam-question-grid">
              {questions.map((q, index) => (
                <button
                  key={index}
                  className={`exam-question-dot ${
                    index === currentQuestionIndex
                      ? 'exam-dot-active'
                      : answers[q.id] !== undefined
                      ? 'exam-dot-answered'
                      : 'exam-dot-unanswered'
                  }`}
                  onClick={() => handleJumpToQuestion(index)}
                  title={`Question ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="exam-legend">
              <div className="exam-legend-item">
                <span className="exam-legend-dot exam-dot-answered"></span> Answered
              </div>
              <div className="exam-legend-item">
                <span className="exam-legend-dot exam-dot-unanswered"></span> Unanswered
              </div>
              <div className="exam-legend-item">
                <span className="exam-legend-dot exam-dot-active"></span> Current
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (testSubmitted && testResults) {
    const isHindi = language === 'hi';
    const certificateUrl = testResults.certificate
      ? `https://brjobsedu.com/epathshala/epathshala_backend${testResults.certificate}`
      : null;
    const shareText = `I completed the  Test -   Competitive Test Assessment with a score of ${testResults.percentage.toFixed(1)}%!`;

    const shareToPlatform = async (platform) => {
      if (!certificateUrl) {
        alert('Certificate not available for sharing.');
        return;
      }

      const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

      if (isMobile && navigator.share) {
        try {
          const response = await fetch(certificateUrl);
          if (!response.ok) throw new Error('Failed to fetch certificate');
          const blob = await response.blob();
          const file = new File([blob], 'certificate.jpg', { type: blob.type });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'My Test Certificate!',
              text: shareText,
            });
            return;
          }
        } catch (error) {
          console.error('Native share failed:', error);
        }
      }

      const encodedUrl = encodeURIComponent(certificateUrl);
      const encodedText = encodeURIComponent(shareText);

      const shareUrls = {
        whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20Check%20it%20out%3A%20${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        // instagram: 'https://www.instagram.com/',
      };

      const url = shareUrls[platform];
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    };
    
    
    if (showWrongAnswers) {
      return (
        <div className="exam-result-wrapper">
          <div className="exam-wrong-answers-panel">
            <button className="exam-btn-outline-primary" onClick={() => setShowWrongAnswers(false)}>
              ← Back to Results
            </button>

<div className="exam-wrong-answers-header">
               <h2>Incorrect Answers</h2>
               <p className="exam-wrong-answers-count">{testResults.wrong_answers} out of {testResults.attempted_questions} questions</p>
             </div>

             <div className="exam-wrong-answers-list">
              {testResults.incorrect_answers.map((incorrectAnswer, index) => (
<div key={index} className="exam-wrong-answer-card">
                   <div className="exam-wrong-answer-header">Question {index + 1}</div>

                   <div className="exam-wrong-answer-question">
                     <p>{isHindi ? incorrectAnswer.question_hindi : incorrectAnswer.question}</p>
                   </div>

                   <div className="exam-wrong-answer-section">
                     <h4>Your Answer:</h4>
                     <div className="exam-wrong-answer-box exam-your-answer-wrong">
                       <span className="exam-answer-badge exam-badge-wrong">✗</span>
                       <div>
                         <p className="exam-answer-index">Option {incorrectAnswer.your_answer_index + 1}</p>
<p className="exam-answer-value">
                           {isHindi
                             ? incorrectAnswer.options_hindi[incorrectAnswer.your_answer_index]
                             : incorrectAnswer.options[incorrectAnswer.your_answer_index]}
                         </p>
                       </div>
                     </div>
                   </div>

                   <div className="exam-wrong-answer-section">
                     <h4>Correct Answer:</h4>
                     <div className="exam-wrong-answer-box exam-correct-answer-box">
                       <span className="exam-answer-badge exam-badge-correct">✓</span>
                       <div>
                         <p className="exam-answer-index">Option {incorrectAnswer.correct_answer_index + 1}</p>
                         <p className="exam-answer-value">
                          {isHindi
                            ? incorrectAnswer.options_hindi[incorrectAnswer.correct_answer_index]
                            : incorrectAnswer.options[incorrectAnswer.correct_answer_index]}
                        </p>
                      </div>
                    </div>
                  </div>

<div className="exam-all-options-box">
                     <h4>All Options:</h4>
                     <div className="exam-options-grid">
                       {(isHindi ? incorrectAnswer.options_hindi : incorrectAnswer.options).map((option, idx) => (
                         <div
                           key={idx}
                           className={`exam-option-row-item ${
                             idx === incorrectAnswer.your_answer_index
                               ? 'exam-option-choice-yours'
                               : idx === incorrectAnswer.correct_answer_index
                               ? 'exam-option-choice-correct'
                               : ''
                           }`}
                         >
                           <span className="exam-option-letter-box">{String.fromCharCode(65 + idx)}.</span>
                           <span className="exam-option-text">{option}</span>
                           {idx === incorrectAnswer.your_answer_index && (
                             <span className="exam-choice-badge-box exam-badge-wrong">Your Answer</span>
                           )}
                           {idx === incorrectAnswer.correct_answer_index && (
                             <span className="exam-choice-badge-box exam-badge-correct">Correct</span>
                           )}
                         </div>
                       ))}
                     </div>
                   </div>

                   <div className="exam-marks-row">
                     <span className="exam-marks-label-text">Marks for this question:</span>
                     <span className="exam-marks-value-text">0 / {incorrectAnswer.marks}</span>
                   </div>
                </div>
              ))}
            </div>

            <div className="exam-actions-row">
              <button className="exam-btn-outline" onClick={() => setShowWrongAnswers(false)}>
                Back to Results
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="exam-result-wrapper">
        <div className="exam-result-header">
          <div className="exam-result-title">
            <h1>Test Results</h1>
            <p className="exam-result-subtitle">Competitive Test -   Competitive Test Assessment</p>
          </div>
          <button
            className="exam-lang-toggle-result"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          >
            {language === 'en' ? 'हिंदी' : 'English'}
          </button>
        </div>

        <Row>
          {certificateUrl && (
            <Col lg={5} md={12} className="mb-4">
              <Card className="exam-certificate-card shadow-sm border-0 h-100 text-center p-3" style={{ borderRadius: '15px', background: '#fdfdfd' }}>
                <Card.Body>
                  <h5 className="mb-3 fw-bold text-primary">Your Certificate</h5>
                  <div className="exam-certificate-preview mb-3" style={{ border: '8px solid #f8f9fa', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff' }}>
                    <img
                      src={certificateUrl}
                      alt="Your test certificate"
                      className="exam-certificate-img"
                      style={{ maxHeight: '350px', cursor: 'pointer' }}
                      onClick={() => window.open(certificateUrl, '_blank')}
                    />
                  </div>

                  <div className="exam-share-section mt-4">
                    <p className="exam-share-title small text-muted mb-3 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>Share Achievement</p>
                    <div className="exam-share-icons">
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); shareToPlatform('whatsapp'); }}
                        className="exam-share-icon text-success"
                        title="Share on WhatsApp"
                      >
                        <i className="bi bi-whatsapp fs-2"></i>
                      </a>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); shareToPlatform('facebook'); }}
                        className="exam-share-icon text-primary"
                        title="Share on Facebook"
                      >
                        <i className="bi bi-facebook fs-2"></i>
                      </a>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); shareToPlatform('twitter'); }}
                        className="exam-share-icon text-dark"
                        title="Share on X"
                      >
                        <i className="bi bi-twitter-x fs-2"></i>
                      </a>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); shareToPlatform('linkedin'); }}
                        className="exam-share-icon"
                        style={{ color: '#0A66C2' }}
                        title="Share on LinkedIn"
                      >
                        <i className="bi bi-linkedin fs-2"></i>
                      </a>
                      {/* <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); shareToPlatform('instagram'); }}
                        className="exam-share-icon"
                        style={{ color: '#E1306C' }}
                        title="Share on Instagram"
                      >
                        <i className="bi bi-instagram fs-2"></i>
                      </a> */}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )}

          <Col lg={certificateUrl ? 7 : 12} md={12}>
            <div className="exam-score-card">
              <div className="exam-score-circle">
                <div className="exam-percentage">{testResults.percentage.toFixed(1)}%</div>
                <div className="exam-percentage-label">Score</div>
              </div>
              <div className="exam-score-details">
                <div className="exam-score-item">
                  <div className="exam-score-label">Total Marks</div>
                  <div className="exam-score-value">{testResults.total_marks}</div>
                </div>
                <div className="exam-score-divider"></div>
                <div className="exam-score-item">
                  <div className="exam-score-label">Your Score</div>
                  <div className="exam-score-value highlight">{testResults.score}</div>
                </div>
              </div>
            </div>

            <div className="exam-stats-grid">
              <div className="exam-stat-card">
                <div className="exam-stat-icon">📝</div>
                <div className="exam-stat-content">
                  <div className="exam-stat-label">Attempted</div>
                  <div className="exam-stat-number">{testResults.attempted_questions}</div>
                </div>
              </div>
              <div className="exam-stat-card">
                <div className="exam-stat-icon">✓</div>
                <div className="exam-stat-content">
                  <div className="exam-stat-label">Correct</div>
                  <div className="exam-stat-number correct">{testResults.correct_answers}</div>
                </div>
              </div>
              <div className="exam-stat-card">
                <div className="exam-stat-icon">✗</div>
                <div className="exam-stat-content">
                  <div className="exam-stat-label">Incorrect</div>
                  <div className="exam-stat-number incorrect">{testResults.wrong_answers}</div>
                </div>
              </div>
            </div>

            <div className="exam-info-card">
              <div className="exam-info-row">
                <span className="exam-info-label">Candidate ID:</span>
                <span className="exam-info-value">{testResults.candidate_id}</span>
              </div>
              <div className="exam-info-row">
                <span className="exam-info-label">Name:</span>
                <span className="exam-info-value">{name}</span>
              </div>
            </div>
          </Col>
        </Row>

        {resultError && <div className="exam-error-alert">{resultError}</div>}

        <div className="exam-actions-row">
          {testResults.wrong_answers > 0 && (
            <button className="exam-btn-warning" onClick={() => setShowWrongAnswers(true)}>
              View Wrong Answers ({testResults.wrong_answers})
            </button>
          )}
          <button className="exam-btn-primary" onClick={resetTest}>
            Take Another Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-login-wrapper">
      <div className="exam-login-card">
        <div className="exam-login-header">
          <h1 className="exam-login-title">Competitive Test</h1>
        
        </div>

        <form onSubmit={handleStartTest} className="exam-form">
          <div className="exam-form-group">
            <label htmlFor="fullName" className="exam-form-label">
              Full Name <span className="exam-required-star">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="exam-form-input"
              maxLength="50"
            />
          </div>

          <div className="exam-form-group">
            <label htmlFor="phone" className="exam-form-label">
              Phone Number <span className="exam-required-star">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter your 10-digit phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="exam-form-input"
              maxLength="10"
            />
            <small className="exam-form-hint">Format: XXXXXXXXXX (10 digits starting with 6-9)</small>
          </div>

          {error && <div className="exam-error-alert">{error}</div>}

          <button type="submit" className="exam-btn-submit exam-btn-large" disabled={loading}>
            {loading ? 'Starting Test...' : 'Start Test'}
          </button>

          <p className="exam-info-text">
            ℹ️ A 5-minute timer will start once you begin the test.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Competitive;
