import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import './Login.css';

function Login({ onFormSwitch, onLogin, loginOrSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    if (email === '') {
      newErrors.email = 'Email is required';
      valid = false;
    }

    if (password === '') {
      newErrors.password = 'Password is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleAsyncSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Login successful!');
        setErrors({ email: '', password: '' });
        localStorage.setItem('token', data.token); // Correctly store token
        onLogin(); // Call onLogin if passed as a prop
        navigate('/home');
      } else {
        setMessage(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage('');
    if (validateForm()) {
      handleAsyncSubmit();
    } else {
      setMessage('Please fix the errors above.');
    }
  };

  return (
    <div className="container">
      <div className="form">
        <h2 className="header">Login</h2>
        <form onSubmit={handleSubmit}>
          <label className="label">
            Email:
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="input"
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </label>
          <label className="label">
            Password:
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className="input"
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </label>
          <input type="submit" value="Submit" className="button" />
        </form>
        <div className="login-link-container">
          <p>{loginOrSignIn}</p>
          <p>Don't have an account? <button className="login-link" onClick={() => navigate('/auth/sign-up')}>Register</button></p>
        </div>
        {message && (
          <p className={`message ${message === 'Login successful!' ? 'message-success' : 'message-error'}`}>
            {message}
          </p>
        )}
        <div className="spinner-container">
          {loading && <ClipLoader />}
        </div>
      </div>
    </div>
  );
}

export default Login;
