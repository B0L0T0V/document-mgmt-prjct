import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

// --- Навигационная панель ---
// Отображает меню для перехода между разделами системы, учитывает роль пользователя, поддерживает смену языка и выход из системы
function NavigationBar() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('user');
  const { language, changeLanguage, t } = useLanguage();
  
  // --- Получение роли пользователя из localStorage ---
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && userData.role) {
      setUserRole(userData.role);
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };
  
  // --- Основной JSX: меню, выпадающий список языка, кнопка выхода ---
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">{t('documentManagementSystem')}</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">{t('dashboard')}</Nav.Link>
            <Nav.Link as={Link} to="/documents">{t('documents')}</Nav.Link>
            <Nav.Link as={Link} to="/messages">{t('messages')}</Nav.Link>
            <Nav.Link as={Link} to="/history">{t('history')}</Nav.Link>
            <Nav.Link as={Link} to="/settings">{t('settings')}</Nav.Link>
            
            {(userRole === 'manager' || userRole === 'admin') && (
              <Nav.Link as={Link} to="/approval">{t('approval')}</Nav.Link>
            )}
            
            {userRole === 'admin' && (
              <Nav.Link as={Link} to="/admin">{t('administration')}</Nav.Link>
            )}
            
            <Nav.Link as={Link} to="/help">{t('help')}</Nav.Link>
          </Nav>
          
          <NavDropdown 
            title={<span className="text-light">{language === 'en' ? 'EN' : 'РУ'}</span>} 
            id="language-dropdown"
            className="me-3"
          >
            <NavDropdown.Item onClick={() => changeLanguage('en')}>English</NavDropdown.Item>
            <NavDropdown.Item onClick={() => changeLanguage('ru')}>Русский</NavDropdown.Item>
          </NavDropdown>
          
          <Button variant="outline-light" onClick={handleLogout}>
            {t('logout')}
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;