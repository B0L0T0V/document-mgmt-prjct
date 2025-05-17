import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    // Mock registration - in a real app, this would call the backend API
    // Get existing users or initialize empty array
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if username exists
    if (existingUsers.some(user => user.username === formData.username)) {
      setError('Username already exists');
      return;
    }
    
    // Add new user with default role 'user'
    const newUser = {
      id: Date.now(),
      username: formData.username,
      password: formData.password, // In a real app, this would be hashed
      email: formData.email,
      role: 'user' // Default role is always 'user'
    };
    
    existingUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(existingUsers));
    
    setSuccess('Registration successful! Redirecting to login...');
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <Container>
      <div className="login-form">
        <h2 className="mb-4">Register</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control 
              type="text" 
              name="username"
              placeholder="Enter username" 
              value={formData.username} 
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control 
              type="email"
              name="email" 
              placeholder="Enter email" 
              value={formData.email} 
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control 
              type="password"
              name="password" 
              placeholder="Password" 
              value={formData.password} 
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control 
              type="password"
              name="confirmPassword" 
              placeholder="Confirm password" 
              value={formData.confirmPassword} 
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Button variant="primary" type="submit" className="w-100">
            Register
          </Button>
          
          <div className="mt-3 text-center">
            Already have an account? <Link to="/">Login</Link>
          </div>
        </Form>
      </div>
    </Container>
  );
}

export default Register;