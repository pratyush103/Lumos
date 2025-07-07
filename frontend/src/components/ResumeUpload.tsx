import React, { useState, useRef } from 'react';
import api from '../services/api';

interface ResumeUploadProps {
  socket: WebSocket | null;
  sendMessage: (message: string) => void;
  isConnected: boolean;
}

interface FileWithId {
  file: File;
  id: string;
  preview?: string;
}

interface ProcessedResume {
  candidate_id: number;
  filename: string;
  candidate_name: string;
  email: string;
  status: string;
  score: number;
  skills_count: number;
  experience_years: number;
}

interface FailedResume {
  filename: string;
  error: string;
  error_type: string;
}

interface UploadResults {
  totalUploaded: number;
  totalProcessed: number;
  failedCount: number;
  processedResumes: ProcessedResume[];
  failedResumes: FailedResume[];
  matchingResults?: any;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ socket, sendMessage, isConnected }) => {
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [results, setResults] = useState<UploadResults | null>(null);
  const [jobId, setJobId] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileId = () => `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      addFiles(Array.from(selectedFiles));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const filesWithId: FileWithId[] = newFiles.map(file => ({
      file,
      id: generateFileId(),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));
    
    setFiles(prev => [...prev, ...filesWithId]);
    setResults(null);
    setMessage('');
    
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== fileId);
      
      // Clean up object URLs to prevent memory leaks
      const removedFile = prev.find(f => f.id === fileId);
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      
      return updatedFiles;
    });
    
    // Clear results if no files remain
    if (files.length === 1) {
      setResults(null);
      setMessage('');
    }
  };

  const removeAllFiles = () => {
    // Clean up all object URLs
    files.forEach(fileWithId => {
      if (fileWithId.preview) {
        URL.revokeObjectURL(fileWithId.preview);
      }
    });
    
    setFiles([]);
    setResults(null);
    setMessage('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  const validateFiles = (filesToValidate: FileWithId[]): string[] => {
    const errors: string[] = [];
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    filesToValidate.forEach((fileWithId, index) => {
      const file = fileWithId.file;
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        errors.push(`File ${index + 1} (${file.name}): Unsupported file type. Please use PDF, DOC, DOCX, or TXT files.`);
      }
      
      if (file.size > maxSize) {
        errors.push(`File ${index + 1} (${file.name}): File too large. Maximum size is 10MB.`);
      }
      
      if (file.size === 0) {
        errors.push(`File ${index + 1} (${file.name}): File is empty.`);
      }
    });

    return errors;
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMessage('Please select files to upload');
      return;
    }

    // Validate files
    const validationErrors = validateFiles(files);
    if (validationErrors.length > 0) {
      setMessage(`Validation errors:\n${validationErrors.join('\n')}`);
      return;
    }

    setUploading(true);
    setMessage('');
    setResults(null);

    try {
      console.log(`📤 Starting upload of ${files.length} files`);
      
      // Create FormData for file upload
      const formData = new FormData();
      files.forEach(fileWithId => {
        formData.append('files', fileWithId.file);
      });
      
      // Add job ID if provided
      if (jobId.trim()) {
        formData.append('job_id', jobId.trim());
      }

      // Send WebSocket message about upload start
      if (isConnected && sendMessage) {
        sendMessage(`Starting AI analysis of ${files.length} resume(s)${jobId ? ` for job ${jobId}` : ''}`);
      }

      console.log('📡 Sending files to backend...');
      
      // Upload and process files
      const response = await api.post('/api/v1/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000 // 2 minutes timeout for large files
      });

      console.log('✅ Upload response:', response.data);

      if (response.data.success) {
        const uploadResults: UploadResults = {
          totalUploaded: response.data.total_uploaded,
          totalProcessed: response.data.total_processed,
          failedCount: response.data.failed_count,
          processedResumes: response.data.processed_resumes || [],
          failedResumes: response.data.failed_resumes || [],
          matchingResults: response.data.matching_results
        };

        setResults(uploadResults);
        
        // Success message
        let successMsg = `Successfully processed ${uploadResults.totalProcessed} out of ${uploadResults.totalUploaded} resume(s)`;
        if (uploadResults.failedCount > 0) {
          successMsg += `. ${uploadResults.failedCount} file(s) failed to process.`;
        }
        setMessage(successMsg);

        // Send WebSocket message about completion
        if (isConnected && sendMessage) {
          sendMessage(`AI analysis complete: ${uploadResults.totalProcessed} resumes processed successfully${uploadResults.matchingResults ? ` with job matching results` : ''}`);
        }

        // Clear files after successful upload
        removeAllFiles();
        
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }

    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      
      let errorMessage = 'Upload failed: ';
      if (error.response?.data?.detail) {
        errorMessage += error.response.data.detail;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred';
      }
      
      setMessage(errorMessage);

      // Send WebSocket message about failure
      if (isConnected && sendMessage) {
        sendMessage(`Resume upload failed: ${errorMessage}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    if (score >= 40) return '#ef4444'; // Red
    return '#6b7280'; // Gray
  };

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'txt': return '📃';
      default: return '📄';
    }
  };

  return (
    <div className="resume-upload">
      <div className="page-header">
        <h2>📄 Resume Upload & AI Analysis</h2>
        <p>Upload resumes for intelligent parsing, scoring, and candidate matching</p>
      </div>

      {/* Job ID Input */}
      <div className="job-selection">
        <label htmlFor="jobId">Job ID (Optional):</label>
        <input
          id="jobId"
          type="text"
          placeholder="Enter Job ID for candidate matching"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          disabled={uploading}
        />
        <small>If provided, candidates will be automatically matched to this job</small>
      </div>

      {/* Upload Area */}
      <div 
        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">📄</div>
        <h3>Drag & Drop Resumes Here</h3>
        <p>Or click to select files (PDF, DOC, DOCX, TXT)</p>
        <p className="file-limits">Maximum 10MB per file • Up to 20 files at once</p>
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </div>

      {/* Selected Files Display with Remove Options */}
      {files.length > 0 && (
        <div className="selected-files">
          <div className="files-header">
            <h4>📋 Selected Files ({files.length})</h4>
            <button 
              className="btn-remove-all"
              onClick={removeAllFiles}
              disabled={uploading}
              title="Remove all files"
            >
              🗑️ Remove All
            </button>
          </div>
          
          <div className="files-list">
            {files.map((fileWithId) => (
              <div key={fileWithId.id} className="file-item">
                <div className="file-icon">
                  {getFileIcon(fileWithId.file.name)}
                </div>
                
                <div className="file-details">
                  <span className="file-name">{fileWithId.file.name}</span>
                  <div className="file-meta">
                    <span className="file-size">{formatFileSize(fileWithId.file.size)}</span>
                    <span className="file-type">{fileWithId.file.type || 'Unknown'}</span>
                  </div>
                </div>
                
                <button 
                  className="btn-remove-file"
                  onClick={() => removeFile(fileWithId.id)}
                  disabled={uploading}
                  title={`Remove ${fileWithId.file.name}`}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="upload-actions">
        <button 
          className="btn-primary upload-btn" 
          onClick={handleUpload}
          disabled={uploading || !files || files.length === 0}
        >
          {uploading ? (
            <>
              <span className="spinner"></span>
              Processing {files?.length || 0} file(s)...
            </>
          ) : (
            <>
              🚀 Upload & Analyze with AI
            </>
          )}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`alert ${message.includes('Success') || message.includes('processed') ? 'alert-success' : 'alert-error'}`}>
          <pre>{message}</pre>
        </div>
      )}

      {/* Processing Results */}
      {results && (
        <div className="processing-results">
          <h3>📊 Processing Results</h3>
          
          {/* Summary Stats */}
          <div className="results-summary">
            <div className="stat-card">
              <h4>Total Uploaded</h4>
              <span className="stat-number">{results.totalUploaded}</span>
            </div>
            <div className="stat-card">
              <h4>Successfully Processed</h4>
              <span className="stat-number success">{results.totalProcessed}</span>
            </div>
            <div className="stat-card">
              <h4>Failed</h4>
              <span className="stat-number error">{results.failedCount}</span>
            </div>
          </div>

          {/* Processed Resumes */}
          {results.processedResumes.length > 0 && (
            <div className="processed-resumes">
              <h4>✅ Successfully Processed Candidates</h4>
              <div className="candidates-grid">
                {results.processedResumes.map((resume, index) => (
                  <div key={index} className="candidate-card">
                    <div className="candidate-header">
                      <h5>{resume.candidate_name}</h5>
                      <span 
                        className="score-badge"
                        style={{ backgroundColor: getScoreColor(resume.score) }}
                      >
                        {resume.score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="candidate-details">
                      <p><strong>Email:</strong> {resume.email || 'Not provided'}</p>
                      <p><strong>Skills:</strong> {resume.skills_count} identified</p>
                      <p><strong>Experience:</strong> {resume.experience_years} years</p>
                      <p><strong>File:</strong> {resume.filename}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed Resumes */}
          {results.failedResumes.length > 0 && (
            <div className="failed-resumes">
              <h4>❌ Failed to Process</h4>
              <div className="failed-list">
                {results.failedResumes.map((failed, index) => (
                  <div key={index} className="failed-item">
                    <span className="failed-filename">{failed.filename}</span>
                    <span className="failed-error">{failed.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;