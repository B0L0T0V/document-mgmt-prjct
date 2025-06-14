import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Alert, Button, Modal } from 'react-bootstrap';
import NavigationBar from '../components/NavigationBar';
import { useLanguage } from '../context/LanguageContext';

const History = () => {
  const { t } = useLanguage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('user');
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Poll for history updates every 2 seconds
    const interval = setInterval(() => {
      const storedHistory = JSON.parse(localStorage.getItem('document_history') || '[]');
      setHistory(storedHistory);
      setLoading(false);
    }, 2000);
    // Initial load
    const storedHistory = JSON.parse(localStorage.getItem('document_history') || '[]');
    setHistory(storedHistory);
    setLoading(false);
    // Load user role from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && userData.role) {
      setUserRole(userData.role);
    }
    return () => clearInterval(interval);
  }, [t]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleClearHistory = () => {
    setShowClearModal(true);
  };

  const confirmClearHistory = () => {
    localStorage.setItem('document_history', '[]');
    setHistory([]);
    setShowClearModal(false);
  };

  return (
    <>
      <NavigationBar />
      <Container className="mt-4">
        <div className="mt-4 d-flex justify-content-between align-items-center">
          <h2>{t('history')}</h2>
          {userRole === 'admin' && (
            <Button variant="danger" onClick={handleClearHistory}>{t('clearHistory')}</Button>
          )}
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <p>{t('loadingDocuments')}</p>
        ) : (
          <Card>
            <Card.Body>
              {history.length === 0 ? (
                <p>{t('noHistoryFound')}</p>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>{t('document')}</th>
                      <th>{t('action')}</th>
                      <th>{t('user')}</th>
                      <th>{t('date')}</th>
                      <th>{t('reasonForRejection')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record) => (
                      <tr key={record.id}>
                        <td>{record.document_title || `${t('document')} #${record.document_id}`}</td>
                        <td>{record.action}</td>
                        <td>{record.user}</td>
                        <td>{formatDate(record.timestamp)}</td>
                        <td>{record.reason || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        )}
      </Container>
      <Modal show={showClearModal} onHide={() => setShowClearModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('confirmClearHistory')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t('areYouSureClearHistory')}</p>
          <p className="text-danger">{t('cannotBeUndone')}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={confirmClearHistory}>{t('clearHistory')}</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default History; 