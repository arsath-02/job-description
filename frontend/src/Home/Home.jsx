import React, { useRef, useState, useEffect } from 'react';
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
    await handleUploadClick(event.target.files[0]);
  };

  const handleUploadClick = async (file) => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file:', file);

      try {
        setIsUploading(true);
        setMessage('Generating response from your resume...');

        const response = await fetch('https://apparent-wolf-obviously.ngrok-free.app/generate_cover_letter', {
          method: 'POST',
          body: formData,
        });

        setIsUploading(false);

        if (response.ok) {
          const data = await response.json();
          console.log('Received response:', data);
          setData(data);
          setMessage('File uploaded and information extracted successfully.');

          
          startTypingAnimation(JSON.stringify(data, null, 2));
        } else {
          const errorData = await response.json();
          console.error('Failed to upload file and extract information:', errorData);
          setMessage('Failed to upload file and extract information.');
        }
      } catch (error) {
        setIsUploading(false);
        console.error('Error uploading file:', error);
        setMessage('An error occurred while uploading the file.');
      }
    } else {
      setMessage('Please select a file to upload.');
    }
  };

  const startTypingAnimation = (text) => {
    let index = 0;
    setDisplayedText(''); 

    const typingInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50); 
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="options-page">
      <div className="half-container">
        <div className="upload-section">
          <header className="header">
            <h1>Upload your resume.</h1>
          </header>
          <main className="main-content">
            <div className="option">
              <img src="upload resume.jpg" alt="Upload Icon" className="option-icon" />
              <h2>Upload Resume</h2>
              <p>Upload your resume for your job analysis.</p>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button onClick={triggerFileInput} className="btn-option" disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload Resume'}
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
