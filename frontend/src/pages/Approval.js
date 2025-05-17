import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Modal, Form, Alert } from 'react-bootstrap';
import NavigationBar from '../components/NavigationBar';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Approval = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [signatureData, setSignatureData] = useState({
    name: '',
    date: new Date().toISOString().substr(0, 10),
    confirmed: false
  });

  useEffect(() => {
    const fetchPendingDocuments = () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!user || !user.id || (user.role !== 'manager' && user.role !== 'admin')) {
          setError('You do not have permission to view this page');
          setLoading(false);
          return;
        }
        
        // Get documents from localStorage
        const allDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
        
        // Filter for pending documents
        const pendingDocs = allDocuments.filter(doc => doc.status === 'pending');
        
        setDocuments(pendingDocs);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPendingDocuments();
  }, []);

  const handleViewDocument = (document) => {
    navigate(`/documents/edit/${document.id}`);
  };

  const handleApproveDocument = (document) => {
    setSelectedDocument(document);
    setShowSignModal(true);
  };

  const handleRejectDocument = (document) => {
    setSelectedDocument(document);
    setShowRejectModal(true);
  };

  const handleSignatureSubmit = () => {
    if (!signatureData.name || !signatureData.date || !signatureData.confirmed) {
      alert(t('pleaseConfirmSignature'));
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Get all documents
      const allDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
      
      // Find and update the selected document
      const updatedDocuments = allDocuments.map(doc => {
        if (doc.id === selectedDocument.id) {
          return {
            ...doc,
            status: 'approved',
            updated_at: new Date().toISOString(),
            approved_by: user.username,
            approved_at: new Date().toISOString(),
            signature: signatureData.name,
            signature_date: signatureData.date
          };
        }
        return doc;
      });
      
      // Save updated documents
      localStorage.setItem('documents', JSON.stringify(updatedDocuments));
      
      // Update the documents list
      setDocuments(documents.filter(doc => doc.id !== selectedDocument.id));
      setShowSignModal(false);
      setSelectedDocument(null);
      setSignatureData({
        name: '',
        date: new Date().toISOString().substr(0, 10),
        confirmed: false
      });
      
      alert(t('documentApproved'));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectSubmit = () => {
    if (!rejectReason) {
      alert(t('pleaseProvideReason'));
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Get all documents
      const allDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
      
      // Find and update the selected document
      const updatedDocuments = allDocuments.map(doc => {
        if (doc.id === selectedDocument.id) {
          return {
            ...doc,
            status: 'rejected',
            updated_at: new Date().toISOString(),
            rejected_by: user.username,
            rejected_at: new Date().toISOString(),
            rejection_reason: rejectReason
          };
        }
        return doc;
      });
      
      // Save updated documents
      localStorage.setItem('documents', JSON.stringify(updatedDocuments));
      
      // Update the documents list
      setDocuments(documents.filter(doc => doc.id !== selectedDocument.id));
      setShowRejectModal(false);
      setSelectedDocument(null);
      setRejectReason('');
      
      alert(t('documentRejected'));
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <NavigationBar />
      <Container className="mt-4">
        <h2>{t('documentsPendingApproval')}</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <p>{t('loadingDocuments')}</p>
        ) : (
          <Card>
            <Card.Body>
              {documents.length === 0 ? (
                <p>{t('noDocumentsPending')}</p>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>{t('title')}</th>
                      <th>{t('type')}</th>
                      <th>{t('author')}</th>
                      <th>{t('submittedDate')}</th>
                      <th>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((document) => (
                      <tr key={document.id}>
                        <td>{document.title}</td>
                        <td>{t(document.type.toLowerCase())}</td>
                        <td>{document.author}</td>
                        <td>{formatDate(document.updated_at)}</td>
                        <td>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => handleViewDocument(document)}
                            className="me-2"
                          >
                            {t('view')}
                          </Button>
                          <Button 
                            variant="success" 
                            size="sm" 
                            onClick={() => handleApproveDocument(document)}
                            className="me-2"
                          >
                            {t('approve')}
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleRejectDocument(document)}
                          >
                            {t('reject')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        )}
      </Container>

      {/* Signature Modal */}
      <Modal show={showSignModal} onHide={() => setShowSignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('electronicalSignature')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('document')}</Form.Label>
              <Form.Control type="text" value={selectedDocument?.title || ''} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('yourName')}</Form.Label>
              <Form.Control 
                type="text" 
                value={signatureData.name}
                onChange={(e) => setSignatureData({...signatureData, name: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('date')}</Form.Label>
              <Form.Control 
                type="date" 
                value={signatureData.date}
                onChange={(e) => setSignatureData({...signatureData, date: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox" 
                label={t('confirmSignature')}
                checked={signatureData.confirmed}
                onChange={(e) => setSignatureData({...signatureData, confirmed: e.target.checked})}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSignModal(false)}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={handleSignatureSubmit}>
            {t('signAndApprove')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('rejectDocument')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('document')}</Form.Label>
              <Form.Control type="text" value={selectedDocument?.title || ''} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('reasonForRejection')}</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            {t('cancel')}
          </Button>
          <Button variant="danger" onClick={handleRejectSubmit}>
            {t('reject')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Approval; 