// import React, { useState, useEffect } from "react";
// import Dashboard from "./components/Dashboard";
// import ResumeUpload from "./components/ResumeUpload";
// import FlightSearch from "./components/FlightSearch";
// import JobGenerator from "./components/JobGenerator";
// import CandidateMatching from "./components/CandidateMatching";
// import CandidateDatabase from "./components/CandidateDatabase";
// import InterviewScheduler from "./components/InterviewScheduler";
// import TravelDashboard from "./components/TravelDashboard";
// import { useWebSocket } from "./hooks/useWebSocket";
// import ConnectionStatus from "./components/common/ConnectionStatus";
// import TestScheduler from "./components/TestScheduler";
// import EmailAutomation from "./components/EmailAutomation";
// import HRMetrics from "./components/analytics/HRMetrics";
// import ROIAnalytics from "./components/analytics/ROIAnalytics";
// import TravelMetrics from "./components/analytics/TravelMetrics";

// const App: React.FC = () => {
//   const [currentPage, setCurrentPage] = useState("dashboard");
//   const [user, setUser] = useState({ name: "HR Manager", role: "hr_manager" });
//   // const { socket, isConnected, sendMessage } = useWebSocket('ws://localhost:8000/ws/chat/hr_user');
//   const [userId] = useState(() => `user_${Date.now()}`);

//   const {
//     socket,
//     isConnected,
//     connectionStatus,
//     sendMessage,
//     messages,
//     reconnect,
//     lastActivity,
//   } = useWebSocket(userId);

//   const menuItems = [
//     { id: "dashboard", label: "📊 Dashboard", category: "main" },
//     { id: "job-generator", label: "✨ JD Generator", category: "talent" },
//     { id: "resume-upload", label: "📄 Resume Upload", category: "talent" },
//     {
//       id: "candidate-matching",
//       label: "🎯 Smart Matching",
//       category: "talent",
//     },
//     {
//       id: "candidate-database",
//       label: "👥 Candidate Database",
//       category: "talent",
//     },
//     {
//       id: "test-scheduler",
//       label: "📄 Test Scheduler",
//       category: "talent",
//     },
//     {
//       id: "interview-scheduler",
//       label: "📅 Interview Scheduler",
//       category: "talent",
//     },
//     {
//       id: "email-automation",
//       label: "📧 Email Automation",
//       category: "talent",
//     },
//     { id: "flight-search", label: "✈️ Flight Search", category: "travel" },
//     {
//       id: "travel-dashboard",
//       label: "🗺️ Travel Dashboard",
//       category: "travel",
//     },
//   ];

//   const renderPage = () => {
//     const pageProps = { socket, sendMessage, isConnected, messages };
// switch (currentPage) {
//       case 'dashboard':
//         return <Dashboard {...pageProps} />;
//       case 'resume-upload':
//         return <ResumeUpload {...pageProps} />;
//       case 'candidate-database':
//         return <CandidateDatabase {...pageProps} />;
//       case 'candidate-matching':
//         return <CandidateMatching {...pageProps} />;
//       case 'interview-scheduler':
//         return <InterviewScheduler {...pageProps} />;
//       case 'flight-search':
//         return <FlightSearch {...pageProps} />;
//       case 'travel-dashboard':
//         return <TravelDashboard {...pageProps} />;
//       case 'job-generator':
//         return <JobGenerator {...pageProps} />;
//       case 'test-scheduler':
//         return <TestScheduler {...pageProps} />;
//       case 'email-automation':
//         return <EmailAutomation {...pageProps} />;
//       case 'hr-metrics':
//         return <HRMetrics {...pageProps} />;
//       case 'roi-analytics':
//         return <ROIAnalytics {...pageProps} />;
//       case 'travel-metrics':
//         return <TravelMetrics {...pageProps} />;
//       default:
//         console.warn(`Unknown page: ${currentPage}`);
//         return <Dashboard {...pageProps} />;
//     }
//   };

//   return (
//     <div className="app-container">
//       {/* Header */}
//       <header className="app-header">
//         <div className="header-content">
//           <div className="logo-section">
//             <h1>NaviHire</h1>
//             <span className="tagline">
//               AI-Powered Talent & Travel Intelligence
//             </span>
//           </div>
//           <div className="user-section">
//             {/* <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
//               <span className="status-dot"></span>
//               {isConnected ? 'AI Connected' : 'Connecting...'}
//             </div> */}
//             <ConnectionStatus
//               status={connectionStatus}
//               onReconnect={reconnect}
//               lastActivity={lastActivity}
//             />
//             <div className="user-info">
//               <span>👤 {user.name}</span>
//               {/* <div className="user-avatar">👤</div> */}
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="main-layout">
//         {/* Sidebar Navigation */}
//         <nav className="sidebar">
//           <div className="nav-section">
//             <h3>Main</h3>
//             {menuItems
//               .filter((item) => item.category === "main")
//               .map((item) => (
//                 <button
//                   key={item.id}
//                   className={`nav-item ${
//                     currentPage === item.id ? "active" : ""
//                   }`}
//                   onClick={() => setCurrentPage(item.id)}
//                 >
//                   {item.label}
//                 </button>
//               ))}
//           </div>

//           <div className="nav-section">
//             <h3>Talent Acquisition</h3>
//             {menuItems
//               .filter((item) => item.category === "talent")
//               .map((item) => (
//                 <button
//                   key={item.id}
//                   className={`nav-item ${
//                     currentPage === item.id ? "active" : ""
//                   }`}
//                   onClick={() => setCurrentPage(item.id)}
//                 >
//                   {item.label}
//                 </button>
//               ))}
//           </div>

//           <div className="nav-section">
//             <h3>Travel Intelligence</h3>
//             {menuItems
//               .filter((item) => item.category === "travel")
//               .map((item) => (
//                 <button
//                   key={item.id}
//                   className={`nav-item ${
//                     currentPage === item.id ? "active" : ""
//                   }`}
//                   onClick={() => setCurrentPage(item.id)}
//                 >
//                   {item.label}
//                 </button>
//               ))}
//           </div>
//         </nav>

//         {/* Main Content */}
//         <main className="main-content">{renderPage()}</main>
//       </div>
//     </div>
//   );
// };

// export default App;


import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import ResumeUpload from "./components/ResumeUpload";
import FlightSearch from "./components/FlightSearch";
import JobGenerator from "./components/JobGenerator";
import CandidateMatching from "./components/CandidateMatching";
import CandidateDatabase from "./components/CandidateDatabase";
import InterviewScheduler from "./components/InterviewScheduler";
import TravelDashboard from "./components/TravelDashboard";
import { useWebSocket } from "./hooks/useWebSocket";
import ConnectionStatus from "./components/common/ConnectionStatus";
import TestScheduler from "./components/TestScheduler";
import EmailAutomation from "./components/EmailAutomation";
import HRMetrics from "./components/analytics/HRMetrics";
import ROIAnalytics from "./components/analytics/ROIAnalytics";
import TravelMetrics from "./components/analytics/TravelMetrics";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [user, setUser] = useState({ name: "HR Manager", role: "hr_manager" });
  // const { socket, isConnected, sendMessage } = useWebSocket('ws://localhost:8000/ws/chat/hr_user');
  const [userId] = useState(() => `user_${Date.now()}`);

  const {
    socket,
    isConnected,
    connectionStatus,
    sendMessage,
    messages,
    reconnect,
    lastActivity,
  } = useWebSocket(userId);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", category: "main" },
    { id: "job-generator", label: "JD Generator", category: "talent" },
    { id: "resume-upload", label: "Resume Upload", category: "talent" },
    {
      id: "candidate-matching",
      label: "Smart Matching",
      category: "talent",
    },
    {
      id: "candidate-database",
      label: "Candidate Database",
      category: "talent",
    },
    {
      id: "test-scheduler",
      label: "Test Scheduler",
      category: "talent",
    },
    {
      id: "interview-scheduler",
      label: "Interview Scheduler",
      category: "talent",
    },
    {
      id: "email-automation",
      label: "Email Automation",
      category: "talent",
    },
    { id: "flight-search", label: "Flight Search", category: "travel" },
    {
      id: "travel-dashboard",
      label: "Travel Dashboard",
      category: "travel",
    },
  ];

  const renderPage = () => {
    const pageProps = { socket, sendMessage, isConnected, messages };
switch (currentPage) {
      case 'dashboard':
        return <Dashboard {...pageProps} />;
      case 'resume-upload':
        return <ResumeUpload {...pageProps} />;
      case 'candidate-database':
        return <CandidateDatabase {...pageProps} />;
      case 'candidate-matching':
        return <CandidateMatching {...pageProps} />;
      case 'interview-scheduler':
        return <InterviewScheduler {...pageProps} />;
      case 'flight-search':
        return <FlightSearch {...pageProps} />;
      case 'travel-dashboard':
        return <TravelDashboard {...pageProps} />;
      case 'job-generator':
        return <JobGenerator {...pageProps} />;
      case 'test-scheduler':
        return <TestScheduler {...pageProps} />;
      case 'email-automation':
        return <EmailAutomation {...pageProps} />;
      case 'hr-metrics':
        return <HRMetrics {...pageProps} />;
      case 'roi-analytics':
        return <ROIAnalytics {...pageProps} />;
      case 'travel-metrics':
        return <TravelMetrics {...pageProps} />;
      default:
        console.warn(`Unknown page: ${currentPage}`);
        return <Dashboard {...pageProps} />;
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>NaviHire</h1>
            <span className="tagline">
              AI-Powered Talent & Travel Intelligence
            </span>
          </div>
          <div className="user-section">
            {/* <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              <span className="status-dot"></span>
              {isConnected ? 'AI Connected' : 'Connecting...'}
            </div> */}
            <ConnectionStatus
              status={connectionStatus}
              onReconnect={reconnect}
              lastActivity={lastActivity}
            />
            <div className="user-info">
              <span>👤 {user.name}</span>
              {/* <div className="user-avatar">👤</div> */}
            </div>
          </div>
        </div>
      </header>

      <div className="main-layout">
        {/* Sidebar Navigation */}
        <nav className="sidebar">
          <div className="nav-section">
            <h3>Main</h3>
            {menuItems
              .filter((item) => item.category === "main")
              .map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${
                    currentPage === item.id ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(item.id)}
                >
                  {item.label}
                </button>
              ))}
          </div>

          <div className="nav-section">
            <h3>Talent Acquisition</h3>
            {menuItems
              .filter((item) => item.category === "talent")
              .map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${
                    currentPage === item.id ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(item.id)}
                >
                  {item.label}
                </button>
              ))}
          </div>

          <div className="nav-section">
            <h3>Travel Intelligence</h3>
            {menuItems
              .filter((item) => item.category === "travel")
              .map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${
                    currentPage === item.id ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(item.id)}
                >
                  {item.label}
                </button>
              ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">{renderPage()}</main>
      </div>
    </div>
  );
};

export default App;
