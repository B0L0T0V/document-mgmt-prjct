import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import { useLanguage } from '../context/LanguageContext';

function Dashboard() {
  const { t } = useLanguage();
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' };

  return (
    <>
      <NavigationBar />
      <Container className="mt-4">
        <h2>{t('welcome')}, {user.username}!</h2>
        <p>{t('mainDashboard')}</p>
        
        <Row className="mt-4">
          <Col md={4}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{t('documents')}</Card.Title>
                <Card.Text>
                  {t('manageDocuments')}
                </Card.Text>
                <Link to="/documents" className="btn btn-primary">{t('goTo')} {t('documents')}</Link>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{t('messages')}</Card.Title>
                <Card.Text>
                  {t('viewMessages')}
                </Card.Text>
                <Link to="/messages" className="btn btn-primary">{t('goTo')} {t('messages')}</Link>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>{t('settings')}</Card.Title>
                <Card.Text>
                  {t('changeSettings')}
                </Card.Text>
                <Link to="/settings" className="btn btn-primary">{t('goTo')} {t('settings')}</Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Dashboard;