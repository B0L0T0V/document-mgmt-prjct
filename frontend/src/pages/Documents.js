import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, InputGroup, Badge, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';

function Documents() {
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
    
    // Load documents from localStorage or use mock data if none exists
    const storedDocuments = JSON.parse(localStorage.getItem('documents') || '[]');
    
    if (storedDocuments.length > 0) {
      setDocuments(storedDocuments);
    } else {
      // Mock initial documents data
      const mockDocuments = [
        { 
          id: 1, 
          number: 'DOC-001', 
          title: 'Service Agreement',
          type: 'Contract', 
          performer: 'John Doe', 
          status: 'draft', 
          author: 'John Doe',
          created_at: '2023-01-15T10:30:00Z',
          updated_at: '2023-01-15T10:30:00Z'
        },
        { 
          id: 2, 
          number: 'DOC-002', 
          title: 'Quarterly Results',
          type: 'Report', 
          performer: 'Jane Smith', 
          status: 'approved', 
          author: 'Jane Smith',
          created_at: '2023-02-20T14:15:00Z',
          updated_at: '2023-02-25T09:45:00Z'
        },
        { 
          id: 3, 
          number: 'DOC-003', 
          title: 'Partnership Agreement',
          type: 'Agreement', 
          performer: 'Mike Brown', 
          status: 'pending', 
          author: 'Mike Brown',
          created_at: '2023-03-10T11:20:00Z',
          updated_at: '2023-03-10T11:20:00Z'
        },
      ];
      
      localStorage.setItem('documents', JSON.stringify(mockDocuments));
      setDocuments(mockDocuments);
    }
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
      
      setSuccess(`Document "${documentToDelete.title}" has been deleted.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete document. Please try again.');
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
          <h2>Documents</h2>
          <Link to="/documents/new" className="btn btn-primary">New Document</Link>
        </div>
        
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
        
        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Search by title, type, number or performer..."
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchTerm && (
            <Button 
              variant="outline-secondary" 
              onClick={() => setSearchTerm('')}
            >
              Clear
            </Button>
          )}
        </InputGroup>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th onClick={() => handleSort('number')}>Number {sortBy === 'number' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('title')}>Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('type')}>Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('performer')}>Performer {sortBy === 'performer' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('status')}>Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('updated_at')}>Last Updated {sortBy === 'updated_at' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th>Actions</th>
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
                    {doc.status ? doc.status.charAt(0).toUpperCase() + doc.status.slice(1) : 'Draft'}
                  </Badge>
                </td>
                <td>{formatDate(doc.updated_at)}</td>
                <td>
                  <Link to={`/documents/${doc.id}`} className="btn btn-sm btn-info me-2">View/Edit</Link>
                  {(userRole === 'admin' || (doc.status !== 'approved' && doc.status !== 'pending')) && (
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDeleteClick(doc)}
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {filteredDocuments.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center">No documents found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the document "{documentToDelete?.title}"?</p>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Documents;