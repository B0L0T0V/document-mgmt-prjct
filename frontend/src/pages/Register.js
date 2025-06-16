import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

// --- Страница регистрации пользователя ---
// Позволяет создать нового пользователя, проверяет уникальность имени и корректность пароля
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
      setError('Пароли не совпадают');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    // Mock registration - in a real app, this would call the backend API
    // Get existing users or initialize empty array
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if username exists
    if (existingUsers.some(user => user.username === formData.username)) {
      setError('Имя пользователя уже существует');
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
    
    setSuccess('Регистрация прошла успешно! Перенаправление на вход...');
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <Container>
      <div className="login-form">
        <h2 className="mb-4">Регистрация</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Имя пользователя</Form.Label>
            <Form.Control 
              type="text" 
              name="username"
              placeholder="Введите имя пользователя" 
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
              placeholder="Введите email" 
              value={formData.email} 
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Пароль</Form.Label>
            <Form.Control 
              type="password"
              name="password" 
              placeholder="Пароль" 
              value={formData.password} 
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Подтвердите пароль</Form.Label>
            <Form.Control 
              type="password"
              name="confirmPassword" 
              placeholder="Подтвердите пароль" 
              value={formData.confirmPassword} 
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Button variant="primary" type="submit" className="w-100">
            Зарегистрироваться
          </Button>
          
          <div className="mt-3 text-center">
            Уже есть аккаунт? <Link to="/">Войти</Link>
          </div>
        </Form>
      </div>
    </Container>
  );
}

export default Register;