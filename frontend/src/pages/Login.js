import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function Login() {
  const { t } = useLanguage();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Create mock users if they don't exist
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.length === 0) {
      // Create default users
      const defaultUsers = [
        {
          id: 1,
          username: 'администратор',
          email: 'admin@example.com',
          password: 'admin123',
          role: 'admin',
          created_at: new Date().toISOString(),
          theme: 'light'
        },
        {
          id: 2,
          username: 'руководитель',
          email: 'manager@example.com',
          password: 'manager123',
          role: 'manager',
          created_at: new Date().toISOString(),
          theme: 'light'
        },
        {
          id: 3,
          username: 'исполнитель',
          email: 'user@example.com',
          password: 'user123',
          role: 'user',
          created_at: new Date().toISOString(),
          theme: 'light'
        }
      ];
      
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    
    // Check if user is already logged in
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser && currentUser.id) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!credentials.username || !credentials.password) {
      setError(t('pleaseFillAllFields'));
      return;
    }
    
    // Check credentials against stored users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => 
      u.username === credentials.username && 
      u.password === credentials.password
    );
    
    if (user) {
      // Generate a fake token
      user.token = 'mock_token_' + Math.random().toString(36).substring(2);
      
      // Store user info
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } else {
      setError(t('usernameOrPasswordIncorrect') || 'Неверное имя пользователя или пароль');
    }
  };

  // Function to reset the users data in case of issues
  const resetUsersData = () => {
    // Default users
    const defaultUsers = [
      {
        id: 1,
        username: 'администратор',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        created_at: new Date().toISOString(),
        theme: 'light'
      },
      {
        id: 2,
        username: 'руководитель',
        email: 'manager@example.com',
        password: 'manager123',
        role: 'manager',
        created_at: new Date().toISOString(),
        theme: 'light'
      },
      {
        id: 3,
        username: 'исполнитель',
        email: 'user@example.com',
        password: 'user123',
        role: 'user',
        created_at: new Date().toISOString(),
        theme: 'light'
      }
    ];
    
    // Clear existing user data and set default users
    localStorage.removeItem('user');
    localStorage.setItem('users', JSON.stringify(defaultUsers));
    
    setSuccess('Данные пользователей были сброшены. Теперь вы можете войти с помощью учетных данных по умолчанию.');
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '400px' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">{t('documentManagementSystem')}</Card.Title>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>{t('username')}</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder={t('enterUsername')}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>{t('password')}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder={t('enterPassword')}
              />
            </Form.Group>
            
            <Button variant="primary" type="submit" className="w-100 mb-3">
              {t('login')}
            </Button>
            
            <div className="text-center">
              <Link to="/register">{t('registerNewAccount')}</Link>
            </div>

            <div className="mt-4">
              <h6 className="mb-2">Тестовые учетные записи:</h6>
              <div className="small">
                <p className="mb-1"><strong>Администратор:</strong> администратор / admin123</p>
                <p className="mb-1"><strong>Руководитель:</strong> руководитель / manager123</p>
                <p className="mb-0"><strong>Исполнитель:</strong> исполнитель / user123</p>
              </div>
              <div className="mt-3 text-center">
                <Button variant="outline-secondary" size="sm" onClick={resetUsersData}>
                  Сбросить данные пользователей
                </Button>
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;