import React from 'react';
import { useLanguage } from '../all_login/LanguageContext';
import '../../assets/css/about.css';

function AboutUs() {
  const { language } = useLanguage();

  const content = {
    en: {
      heroTitle: "About GyanDhara",
      heroSubtitle: "Empowering Education Through Innovation and Excellence",
      heroDesc: "GyanDhara is India's premier educational platform dedicated to transforming the learning experience for students, educators, and institutions across the nation.",

      missionTitle: "Our Mission",
      missionDesc: "To bridge the gap between education and career opportunities by providing comprehensive guidance, skill development programs, and innovative learning solutions that prepare students for the challenges of tomorrow.",

      visionTitle: "Our Vision",
      visionDesc: "To become the leading educational ecosystem in India, fostering a generation of skilled, confident, and socially responsible individuals who contribute meaningfully to society and the global economy.",

      whatWeDoTitle: "What We Do",
      whatWeDo: [
        {
          icon: "bi-mortarboard-fill",
          title: "Academic Excellence",
          desc: "Comprehensive support for 10th and 12th grade students with expert guidance for board exams and career selection."
        },
        {
          icon: "bi-briefcase-fill",
          title: "Career Guidance",
          desc: "Personalized career counseling and job placement assistance to help students achieve their professional goals."
        },
        {
          icon: "bi-trophy-fill",
          title: "Competitions & Events",
          desc: "Regular competitions, seminars, and workshops to enhance skills and provide real-world exposure."
        },
        {
          icon: "bi-building-fill",
          title: "Institution Management",
          desc: "Dedicated tools for institutions to manage student registrations, create quizzes, and track performance."
        },
        {
          icon: "bi-book-fill",
          title: "Government Schemes",
          desc: "Information and guidance about various government educational schemes and financial assistance programs."
        },
        {
          icon: "bi-people-fill",
          title: "Community Building",
          desc: "Creating a supportive community of learners, educators, and industry professionals."
        }
      ],

      whyChooseTitle: "Why Choose GyanDhara?",
      whyChoose: [
        "Comprehensive educational ecosystem under one platform",
        "Expert guidance from experienced educators and industry professionals",
        "Regular updates on government schemes and educational policies",
        "Interactive learning tools and assessment systems",
        "Strong focus on skill development and career readiness",
        "Dedicated support for institutions and educational institutions"
      ],


    },
    hi: {
      heroTitle: "GyanDhara के बारे में",
      heroSubtitle: "नवाचार और उत्कृष्टता के माध्यम से शिक्षा को सशक्त बनाना",
      heroDesc: "GyanDhara भारत की प्रमुख शैक्षिक मंच है जो छात्रों, शिक्षकों और संस्थानों के लिए सीखने के अनुभव को बदलने के लिए समर्पित है।",

      missionTitle: "हमारा मिशन",
      missionDesc: "कल की चुनौतियों के लिए छात्रों को तैयार करने वाले व्यापक मार्गदर्शन, कौशल विकास कार्यक्रम और नवीन शिक्षण समाधानों प्रदान करके शिक्षा और करियर अवसरों के बीच की खाई को पाटना।",

      visionTitle: "हमारा विजन",
      visionDesc: "भारत में अग्रणी शैक्षिक पारिस्थितिकी तंत्र बनना, ऐसे कुशल, आत्मविश्वासी और सामाजिक रूप से जिम्मेदार व्यक्तियों की पीढ़ी को बढ़ावा देना जो समाज और वैश्विक अर्थव्यवस्था में सार्थक योगदान करते हैं।",

      whatWeDoTitle: "हम क्या करते हैं",
      whatWeDo: [
        {
          icon: "bi-mortarboard-fill",
          title: "शैक्षणिक उत्कृष्टता",
          desc: "बोर्ड परीक्षाओं और करियर चयन के लिए विशेषज्ञ मार्गदर्शन के साथ 10वीं और 12वीं कक्षा के छात्रों के लिए व्यापक समर्थन।"
        },
        {
          icon: "bi-briefcase-fill",
          title: "करियर मार्गदर्शन",
          desc: "छात्रों को उनकी पेशेवर लक्ष्यों को प्राप्त करने में मदद करने के लिए व्यक्तिगत करियर परामर्श और नौकरी प्लेसमेंट सहायता।"
        },
        {
          icon: "bi-trophy-fill",
          title: "प्रतियोगिताएं और कार्यक्रम",
          desc: "कौशल बढ़ाने और वास्तविक दुनिया के जोखिम प्रदान करने के लिए नियमित प्रतियोगिताएं, सेमिनार और कार्यशालाएं।"
        },
        {
          icon: "bi-building-fill",
          title: "शैक्षणिक संस्था प्रबंधन",
          desc: "छात्र पंजीकरण, क्विज निर्माण और प्रदर्शन ट्रैकिंग के लिए शैक्षणिक संस्था के लिए समर्पित उपकरण।"
        },
        {
          icon: "bi-book-fill",
          title: "सरकारी योजनाएं",
          desc: "विभिन्न सरकारी शैक्षिक योजनाओं और वित्तीय सहायता कार्यक्रमों के बारे में जानकारी और मार्गदर्शन।"
        },
        {
          icon: "bi-people-fill",
          title: "समुदाय निर्माण",
          desc: "सीखने वालों, शिक्षकों और उद्योग पेशेवरों का एक सहायक समुदाय बनाना।"
        }
      ],

      whyChooseTitle: "GyanDhara क्यों चुनें?",
      whyChoose: [
        "एक मंच के तहत व्यापक शैक्षिक पारिस्थितिकी तंत्र",
        "अनुभवी शिक्षकों और उद्योग पेशेवरों से विशेषज्ञ मार्गदर्शन",
        "सरकारी योजनाओं और शैक्षिक नीतियों पर नियमित अपडेट",
        "इंटरैक्टिव शिक्षण उपकरण और मूल्यांकन प्रणाली",
        "कौशल विकास और करियर तैयारता पर मजबूत ध्यान",
        "शैक्षणिक संस्था और शैक्षिक संस्थानों के लिए समर्पित समर्थन"
      ],


    }
  };

  const t = content[language] || content.en;

  return (
    <div className="about-wrapper">
      <div className="about-container">
        {/* Hero Section */}
        <section className="about-hero-section">
          <div className="about-hero-content">
            <h1>{t.heroTitle}</h1>
            <h2>{t.heroSubtitle}</h2>
            <p>{t.heroDesc}</p>
          </div>
          <div className="about-hero-image">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop" alt="Education" />
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mission-vision-section">
          <div className="mission-card">
            <div className="mission-icon">
              <i className="bi bi-bullseye"></i>
            </div>
            <h3>{t.missionTitle}</h3>
            <p>{t.missionDesc}</p>
          </div>
          <div className="vision-card">
            <div className="vision-icon">
              <i className="bi bi-eye"></i>
            </div>
            <h3>{t.visionTitle}</h3>
            <p>{t.visionDesc}</p>
          </div>
        </section>

        {/* What We Do */}
        <section className="what-we-do-section">
          <h2 className="section-title">{t.whatWeDoTitle}</h2>
          <div className="what-we-do-grid">
            {t.whatWeDo.map((item, index) => (
              <div className="what-we-do-card" key={index}>
                <div className="what-we-do-icon">
                  <i className={`bi ${item.icon}`}></i>
                </div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="why-choose-section">
          <h2 className="section-title">{t.whyChooseTitle}</h2>
          <div className="why-choose-content">
            <div className="why-choose-list">
              {t.whyChoose.map((item, index) => (
                <div className="why-choose-item" key={index}>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="why-choose-image">
              <img src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop" alt="Success" />
            </div>
          </div>
        </section>


      </div>
    </div>
  );
}

export default AboutUs;