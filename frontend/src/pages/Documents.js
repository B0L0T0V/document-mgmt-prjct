import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, InputGroup, Badge, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import { useLanguage } from '../context/LanguageContext';

function Documents() {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [documents, setDocuments] = useState([]);
  const [userRole, setUserRole] = useState('user');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Load documents from localStorage
  useEffect(() => {
    // Load user role from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && userData.role) {
      setUserRole(userData.role);
    }
    // Load documents from localStorage or use empty array if none exists
    const storedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    setDocuments(storedDocuments);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  const handleDeleteClick = (document) => {
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = () => {
    if (!documentToDelete) return;
    
    try {
      // Remove from state
      const updatedDocuments = documents.filter(doc => doc.id !== documentToDelete.id);
      setDocuments(updatedDocuments);
      
      // Save to localStorage
      localStorage.setItem('documents', JSON.stringify(updatedDocuments));
      
      // Add to history
      const historyEntry = {
        id: Date.now(),
        document_id: documentToDelete.id,
        document_title: documentToDelete.title,
        action: "удаление",
        user: JSON.parse(localStorage.getItem('user') || '{}').username || 'Пользователь',
        timestamp: new Date().toISOString(),
        reason: null
      };
      
      const history = JSON.parse(localStorage.getItem('document_history') || '[]');
      history.push(historyEntry);
      localStorage.setItem('document_history', JSON.stringify(history));
      
      setSuccess(t('documentDeleted'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(t('failedToDelete'));
    }
    
    setShowDeleteModal(false);
    setDocumentToDelete(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Get status badge variant
  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Get translated status text
  const getStatusText = (status) => {
    switch(status) {
      case 'approved':
        return t('approved');
      case 'pending':
        return t('pending');
      case 'rejected':
        return t('rejected');
      default:
        return t('draft');
    }
  };

  // Filter and sort documents
  const filteredDocuments = documents.filter(doc => 
    (doc.type && doc.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (doc.number && doc.number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (doc.title && doc.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (doc.performer && doc.performer.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    // Handle dates and strings appropriately
    if (sortBy === 'created_at' || sortBy === 'updated_at') {
      return sortOrder === 'asc' 
        ? new Date(a[sortBy]) - new Date(b[sortBy])
        : new Date(b[sortBy]) - new Date(a[sortBy]);
    }
    
    // For text fields
    const aValue = a[sortBy]?.toString().toLowerCase() || '';
    const bValue = b[sortBy]?.toString().toLowerCase() || '';
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <>
      <NavigationBar />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{t('documents')}</h2>
          <Link to="/documents/new" className="btn btn-primary">{t('createNewDocument')}</Link>
        </div>
        
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
        
        <InputGroup className="mb-3">
          <Form.Control
            placeholder={t('searchDocuments')}
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchTerm && (
            <Button 
              variant="outline-secondary" 
              onClick={() => setSearchTerm('')}
            >
              {t('clear')}
            </Button>
          )}
        </InputGroup>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th onClick={() => handleSort('number')}>{t('number')} {sortBy === 'number' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('title')}>{t('title')} {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('type')}>{t('type')} {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('performer')}>{t('performer')} {sortBy === 'performer' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('status')}>{t('status')} {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('updated_at')}>{t('lastUpdated')} {sortBy === 'updated_at' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map(doc => (
              <tr key={doc.id}>
                <td>{doc.number}</td>
                <td>{doc.title}</td>
                <td>{doc.type}</td>
                <td>{doc.performer}</td>
                <td>
                  <Badge bg={getStatusBadge(doc.status)}>
                    {getStatusText(doc.status)}
                  </Badge>
                </td>
                <td>{formatDate(doc.updated_at)}</td>
                <td>
                  <Link to={`/documents/${doc.id}`} className="btn btn-sm btn-info me-2">{t('viewEdit')}</Link>
                  {(userRole === 'admin' || (doc.status !== 'approved' && doc.status !== 'pending')) && (
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDeleteClick(doc)}
                    >
                      {t('delete')}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {filteredDocuments.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center">{t('noDocumentsFound')}</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('confirmDelete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t('areYouSureDelete')} "{documentToDelete?.title}"?</p>
          <p className="text-danger">{t('cannotBeUndone')}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('cancel')}
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            {t('delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Documents;