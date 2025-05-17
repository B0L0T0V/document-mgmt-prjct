import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import NavigationBar from '../components/NavigationBar';
import { useLanguage } from '../context/LanguageContext';

function Settings() {
  const { language, changeLanguage, t } = useLanguage();
  
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  
  const [theme, setTheme] = useState('light');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Load saved theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);
  
  // Function to apply theme to body
  const applyTheme = (selectedTheme) => {
    if (selectedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword(prev => ({ ...prev, [name]: value }));
  };
  
  const handleThemeChange = (e) => {
    const selectedTheme = e.target.value;
    setTheme(selectedTheme);
    applyTheme(selectedTheme);
    // Save theme immediately
    localStorage.setItem('theme', selectedTheme);
    setSuccess(t('settingsSaved'));
  };
  
  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    changeLanguage(selectedLanguage);
    setSuccess(t('settingsSaved'));
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Simple validation
    if (!password.current) {
      setError('Current password is required');
      return;
    }
    
    if (!password.new) {
      setError('New password is required');
      return;
    }
    
    if (password.new !== password.confirm) {
      setError('New password and confirmation do not match');
      return;
    }
    
    // Get current user
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Check current password
    if (password.current !== 'password' && password.current !== user.password) {
      setError('Current password is incorrect');
      return;
    }
    
    // Update user password
    user.password = password.new;
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.username === user.username);
    if (userIndex !== -1) {
      users[userIndex].password = password.new;
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Password change successful
    setSuccess(t('settingsSaved'));
    setPassword({ current: '', new: '', confirm: '' });
  };

  return (
    <>
      <NavigationBar />
      <Container className="mt-4">
        <h2>{t('settings')}</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Card className="mb-4">
          <Card.Header>{t('interfaceSettings')}</Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>{t('language')}</Form.Label>
              <Form.Select
                value={language}
                onChange={handleLanguageChange}
                className="mb-3"
              >
                <option value="en">English</option>
                <option value="ru">Русский</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group>
              <Form.Label>{t('theme')}</Form.Label>
              <Form.Select
                value={theme}
                onChange={handleThemeChange}
              >
                <option value="light">{t('lightTheme')}</option>
                <option value="dark">{t('darkTheme')}</option>
              </Form.Select>
            </Form.Group>
          </Card.Body>
        </Card>
        
        <Card className="mb-4">
          <Card.Header>{t('password')}</Card.Header>
          <Card.Body>
            <Form onSubmit={handlePasswordSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>{t('password') + " (" + t('current') + ")"}</Form.Label>
                <Form.Control
                  type="password"
                  name="current"
                  value={password.current}
                  onChange={handlePasswordChange}
                  placeholder={t('enterPassword')}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>{t('password') + " (" + t('new') + ")"}</Form.Label>
                <Form.Control
                  type="password"
                  name="new"
                  value={password.new}
                  onChange={handlePasswordChange}
                  placeholder={t('enterPassword')}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>{t('password') + " (" + t('confirm') + ")"}</Form.Label>
                <Form.Control
                  type="password"
                  name="confirm"
                  value={password.confirm}
                  onChange={handlePasswordChange}
                  placeholder={t('enterPassword')}
                />
              </Form.Group>
              
              <Button variant="primary" type="submit">
                {t('saveSettings')}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default Settings;