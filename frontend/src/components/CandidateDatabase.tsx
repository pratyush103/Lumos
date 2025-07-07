import React, { useState, useEffect } from 'react';

interface CandidateDatabaseProps {
  socket: WebSocket | null;
  sendMessage: (message: string) => void;
  isConnected: boolean;
}

interface Candidate {
  id: number;
  name: string;
  skills: string[];
  experience: number;
  status: string;
}

const CandidateDatabase: React.FC<CandidateDatabaseProps> = ({ socket, sendMessage, isConnected }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock candidate data with proper typing
    setCandidates([
      { id: 1, name: 'Amar', skills: ['React', 'Node.js'], experience: 5, status: 'available' },
      { id: 2, name: 'Akbar', skills: ['Python', 'Django'], experience: 3, status: 'interviewing' },
      { id: 3, name: 'Anthony', skills: ['Java', 'Spring'], experience: 7, status: 'available' }
    ]);
  }, []);

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <h2 style={{marginBottom: '12px'}}>Candidate Database</h2>
      <p>Browse and manage your AI-analyzed talent pool</p>
      
      <div className="form-group">
        <input
          type="text"
          placeholder="Search candidates by name or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
        />
      </div>
      
      <div className="stats-grid">
        {filteredCandidates.map((candidate) => (
          <div key={candidate.id} className="stat-card">
            <h3>{candidate.name}</h3>
            <p><strong>Skills:</strong> {candidate.skills.join(', ')}</p>
            <p><strong>Experience:</strong> {candidate.experience} years</p>
            <span className={`status ${candidate.status}`}>{candidate.status}</span>
            <div style={{marginTop: '10px'}}>
              <button className="btn btn-sm btn-primary">View Profile</button>
              <button className="btn btn-sm" style={{marginLeft: '5px'}}>Schedule Interview</button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredCandidates.length === 0 && searchTerm && (
        <div className="empty-state">
          <p>No candidates found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default CandidateDatabase;