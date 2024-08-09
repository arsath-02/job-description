import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const OptionsPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [data, setData] = useState(null);
  const [displayedText, setDisplayedText] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    await handleUploadClick(file);
  };

  const handleUploadClick = async (file) => {
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setMessage('Uploading and generating response from your resume...');

    try {
      const analysisResponse = await fetch('https://apparent-wolf-obviously.ngrok-free.app/generate_cover_letter', {
        method: 'POST',
        body: formData,
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(`Failed to extract information: ${errorData.message}`);
      }

      const responseData = await analysisResponse.json();
      setData(responseData);
      setMessage('File uploaded and information extracted successfully.');
      startTypingAnimation(JSON.stringify(responseData, null, 2));
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred while processing the file.');
    } finally {
      setIsUploading(false);
    }
  };

  const startTypingAnimation = (text) => {
    let index = 0;
    setDisplayedText('');

    const typingSpeed = 50; // milliseconds

    const typingInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, typingSpeed);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleClear = () => {
    // Reset state variables
    setMessage('');
    setIsUploading(false);
    setData(null);
    setDisplayedText('');
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="options-page">
      <div className="half-container">
        <div className="upload-section">
          <header className="header">
            <h1>Upload your resume</h1>
          </header>
          <main className="main-content">
            <div className="option">
              <img src="upload resume.jpg" alt="Upload Icon" className="option-icon" />
              <h2>Upload Resume</h2>
              <p>Upload your resume for analysis.</p>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button onClick={triggerFileInput} className="btn-option" disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload Resume'}
              </button>
              <button onClick={handleClear} className="btn-clear">
                Clear
              </button>
            </div>
            {message && <div className="upload-message">{message}</div>}
          </main>
        </div>
        <div className="result-section">
          <header className="header">
            <h1>Analysis Result</h1>
          </header>
          <main className="main-content">
            {data ? (
              <div className="result-content">
                <h2>Result Summary</h2>
                <p className="typing-text">{displayedText}</p>
              </div>
            ) : (
              <p>No result to display yet. Please upload a resume.</p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default OptionsPage;
