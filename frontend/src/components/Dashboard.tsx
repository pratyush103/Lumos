import React, { useState, useEffect } from 'react';

interface DashboardProps {
  socket: WebSocket | null;
  sendMessage: (message: string) => void;
  isConnected: boolean;
}

interface DashboardStats {
  totalCandidates: number;
  activeJobs: number;
  interviewsScheduled: number;
  travelRequests: number;
  matchingAccuracy: number;
  avgTimeToHire: number;
}

interface ActivityItem {
  id: number;
  type: 'new' | 'success' | 'travel' | 'ai';
  title: string;
  description: string;
  time: string;
  action: string;
}

const Dashboard: React.FC<DashboardProps> = ({ socket, sendMessage, isConnected }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 0,
    activeJobs: 0,
    interviewsScheduled: 0,
    travelRequests: 0,
    matchingAccuracy: 0,
    avgTimeToHire: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [aiInsights, setAiInsights] = useState('');

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalCandidates: 247 + Math.floor(Math.random() * 10),
        activeJobs: 12,
        interviewsScheduled: 8 + Math.floor(Math.random() * 3),
        travelRequests: 3,
        matchingAccuracy: 92 + Math.floor(Math.random() * 5),
        avgTimeToHire: 14 + Math.floor(Math.random() * 7)
      }));
    }, 5000);

    // Set initial activity data
    setRecentActivity([
      {
        id: 1,
        type: 'new',
        title: 'New Resume Uploaded',
        description: 'Sarah Johnson - Senior React Developer',
        time: '2 minutes ago',
        action: 'Review'
      },
      {
        id: 2,
        type: 'success',
        title: 'Interview Scheduled',
        description: 'John Smith - Product Manager position',
        time: '15 minutes ago',
        action: 'View'
      },
      {
        id: 3,
        type: 'travel',
        title: 'Travel Request Approved',
        description: 'Mumbai to Delhi - Candidate Interview',
        time: '1 hour ago',
        action: 'Details'
      },
      {
        id: 4,
        type: 'ai',
        title: 'AI Match Found',
        description: '3 candidates matched for DevOps Engineer role',
        time: '2 hours ago',
        action: 'Review Matches'
      }
    ]);

    // Get AI insights
    if (isConnected) {
      sendMessage("Give me today's HR insights and recommendations");
    }

    return () => clearInterval(interval);
  }, [isConnected, sendMessage]);

  const quickActions = [
    {
      title: 'Generate Job Description',
      description: 'Create AI-powered job descriptions',
      icon: '✨',
      action: 'job-generator',
      color: 'blue'
    },
    {
      title: 'Upload Resumes',
      description: 'Bulk upload and analyze resumes',
      icon: '📄',
      action: 'resume-upload',
      color: 'green'
    },
    {
      title: 'Smart Candidate Matching',
      description: 'AI-powered candidate ranking',
      icon: '🎯',
      action: 'candidate-matching',
      color: 'purple'
    },
    {
      title: 'Schedule Interviews',
      description: 'Automated interview scheduling',
      icon: '📅',
      action: 'interview-scheduler',
      color: 'orange'
    },
    {
      title: 'Search Flights',
      description: 'Find best travel options',
      icon: '✈️',
      action: 'flight-search',
      color: 'cyan'
    },
    {
      title: 'Candidate Database',
      description: 'Browse talent pool',
      icon: '👥',
      action: 'candidate-database',
      color: 'pink'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back! Here's your HR overview</h1>
        <p>Real-time insights powered by AI</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>{stats.totalCandidates}</h3>
            <p>Total Candidates</p>
            <span className="metric-change positive">+12 this week</span>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">💼</div>
          <div className="metric-content">
            <h3>{stats.activeJobs}</h3>
            <p>Active Job Postings</p>
            <span className="metric-change positive">+3 new</span>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">📅</div>
          <div className="metric-content">
            <h3>{stats.interviewsScheduled}</h3>
            <p>Interviews This Week</p>
            <span className="metric-change positive">+5 scheduled</span>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <h3>{stats.matchingAccuracy}%</h3>
            <p>AI Matching Accuracy</p>
            <span className="metric-change positive">+2% improvement</span>
          </div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <h3>{stats.avgTimeToHire}</h3>
            <p>Avg. Time to Hire (days)</p>
            <span className="metric-change negative">-3 days faster</span>
          </div>
        </div>

        <div className="metric-card travel">
          <div className="metric-icon">✈️</div>
          <div className="metric-content">
            <h3>{stats.travelRequests}</h3>
            <p>Pending Travel Requests</p>
            <span className="metric-change neutral">2 approved</span>
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="insights-panel">
        <h2>🤖 AI Insights & Recommendations</h2>
        <div className="insight-card">
          <h3>Today's Recommendations</h3>
          <ul>
            <li>📈 <strong>High-priority:</strong> Review 5 new candidates for Senior Developer role</li>
            <li>⚡ <strong>Quick win:</strong> 3 candidates from talent pool match new Marketing position</li>
            <li>📞 <strong>Follow-up:</strong> Schedule interviews for 2 pre-screened candidates</li>
            <li>✈️ <strong>Travel:</strong> Book flights for candidate interviews - save 15% with advance booking</li>
          </ul>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="quick-actions">
        <h2 style={{marginBottom: '12px'}}>Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <div key={index} className={`action-card ${action.color}`}>
              <div className="action-icon">{action.icon}</div>
              <div className="action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
                <button className="action-button">
                  Get Started →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style = {{marginTop :'24px'}} className="activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-feed">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className={`activity-icon ${activity.type}`}>
                {activity.type === 'new' && '📄'}
                {activity.type === 'success' && '✅'}
                {activity.type === 'travel' && '✈️'}
                {activity.type === 'ai' && '🤖'}
              </div>
              <div className="activity-content">
                <h4>{activity.title}</h4>
                <p>{activity.description}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
              <button className="activity-action">{activity.action}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;