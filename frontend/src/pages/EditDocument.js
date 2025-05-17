import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Tab, Tabs, Alert, ListGroup, Modal, Dropdown } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';

function EditDocument() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const [document, setDocument] = useState({
    number: '',
    type: '',
    title: '',
    description: '',
    performer: '',
    date: new Date().toISOString().split('T')[0],
    file: null,
    fileName: '',
    content: 'This is a sample document content. In a real application, this would be the actual content of the document.'
  });
  
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('docx');
  const [userRole, setUserRole] = useState('user');
  
  // Mock history data
  const [history] = useState([
    { id: 1, action: 'Document created', user: 'John Doe', date: '2023-01-15 09:30' },
    { id: 2, action: 'Document updated', user: 'Jane Smith', date: '2023-01-17 14:22' },
    { id: 3, action: 'Document sent for approval', user: 'John Doe', date: '2023-01-18 11:05' },
    { id: 4, action: 'Document rejected', user: 'Mike Johnson', date: '2023-01-19 16:45', reason: 'Missing required information in section 3.' }
  ]);

  useEffect(() => {
    // Load user role from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && userData.role) {
      setUserRole(userData.role);
    }

    if (!isNew && id) {
      // Load document from localStorage if it exists
      const documents = JSON.parse(localStorage.getItem('documents') || '[]');
      const existingDoc = documents.find(doc => doc.id.toString() === id.toString());
      
      if (existingDoc) {
        setDocument(existingDoc);
      } else {
        // If document is not in localStorage, use mock data
        const fetchDocument = async () => {
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const mockDocument = {
              id: parseInt(id),
              number: `DOC-00${id}`,
              type: 'Contract',
              title: 'Sample Document',
              description: 'This is a sample document for demonstration purposes.',
              performer: 'John Doe',
              date: '2023-01-15',
              fileName: 'sample.doc',
              content: `This is the content of document ${id}. 

In a real application, this would be the actual text content extracted from the uploaded document file.

Section 1: Introduction
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vehicula, libero at commodo tempor, erat risus malesuada odio, at luctus purus mi quis mi.

Section 2: Terms and Conditions
Maecenas vel est eget sapien consectetur efficitur. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Ut vel arcu quis velit eleifend venenatis.

Section 3: Responsibilities
Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed consequat massa in urna blandit, eu ullamcorper nisl tincidunt.

Section 4: Conclusion
Nulla facilisi. In hac habitasse platea dictumst. Vivamus feugiat consequat velit, quis scelerisque purus pharetra vel.`
            };
            setDocument(mockDocument);
          } catch (err) {
            setError('Failed to load document. Please try again.');
          }
        };
        
        fetchDocument();
      }
    }
  }, [id, isNew]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDocument(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real application, we would extract content from the file here
      // For demo purposes, we'll read the file as text if it's a text file,
      // otherwise use a placeholder content
      const reader = new FileReader();
      
      reader.onload = (event) => {
        let fileContent;
        
        try {
          // Try to read file as text with proper encoding detection
          // This supports Cyrillic and other non-Latin characters
          fileContent = event.target.result;
          
          // Test if the content appears to be broken (might be binary or needs encoding fix)
          const hasBrokenEncoding = /\uFFFD/.test(fileContent); // Unicode replacement character indicates encoding issues
          const appearsEmpty = !fileContent || fileContent.length < 10;
          
          if (appearsEmpty || hasBrokenEncoding) {
            // If we have encoding issues but it's likely a text file, try a different approach
            if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
              // For text files with potential encoding issues, try again with explicit UTF-8
              const readerUtf8 = new FileReader();
              readerUtf8.onload = (e) => {
                setDocument(prev => ({ 
                  ...prev, 
                  fileName: file.name,
                  fileData: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                  },
                  content: e.target.result
                }));
              };
              readerUtf8.readAsText(file, 'UTF-8');
              return;
            } else {
              throw new Error('Not a readable text file or encoding issues');
            }
          }
        } catch (err) {
          // Use placeholder content for non-text files
          fileContent = `Content extracted from ${file.name}

Section 1: Introduction
This document was uploaded at ${new Date().toLocaleString()}.
This is a preview of the document content that would be extracted from the uploaded file.

Section 2: Details
In a real application, document parsing libraries would extract the actual content from the file.

Document: ${file.name}
Size: ${Math.round(file.size / 1024)} KB
Type: ${file.type || 'Unknown'} 
`;
        }
        
        setDocument(prev => ({ 
          ...prev, 
          fileName: file.name,
          // Store file metadata that can be saved to localStorage
          fileData: {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
          },
          content: fileContent
        }));
      };
      
      // Try to read as text with encoding detection
      reader.readAsText(file, 'UTF-8');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      // Simulate API call with delay to make it feel realistic
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Save document data to localStorage for persistence
      const documents = JSON.parse(localStorage.getItem('documents') || '[]');
      
      // Create a version of the document suitable for localStorage
      // (without the actual file object which can't be serialized)
      const docToSave = {
        ...document,
        file: null // Remove the actual file object
      };
      
      if (isNew) {
        const newDoc = {
          ...docToSave,
          id: Date.now(), // Use timestamp as ID for demo
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'draft',
          author: JSON.parse(localStorage.getItem('user') || '{}').username || 'Current User'
        };
        documents.push(newDoc);
      } else {
        const index = documents.findIndex(doc => doc.id.toString() === id.toString());
        if (index !== -1) {
          documents[index] = {
            ...documents[index],
            ...docToSave,
            updated_at: new Date().toISOString()
          };
        } else {
          // If document doesn't exist in localStorage yet, add it
          documents.push({
            ...docToSave,
            id: parseInt(id),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'draft',
            author: JSON.parse(localStorage.getItem('user') || '{}').username || 'Current User'
          });
        }
      }
      
      localStorage.setItem('documents', JSON.stringify(documents));
      
      setSuccess(`Document ${isNew ? 'created' : 'updated'} successfully!`);
      setTimeout(() => {
        navigate('/documents');
      }, 2000);
    } catch (err) {
      setError('Failed to save document. Please try again.');
    }
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const performExport = () => {
    // In a real app, this would call an API to generate the document in the selected format
    setShowExportModal(false);
    
    // Create a text blob from the document content
    const blob = new Blob([document.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Determine the file extension
    let extension;
    if (exportFormat === 'docx') {
      extension = '.docx';
    } else if (exportFormat === 'xlsx') {
      extension = '.xlsx';
    } else {
      extension = '.pdf';
    }
    
    // Clean the document title for use in filename
    const filename = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${extension}`;
    
    // Create a download link and trigger it
    const element = document.createElement('a');
    element.href = url;
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(element);
      URL.revokeObjectURL(url);
    }, 100);
    
    alert(`Document has been exported as ${filename}`);
  };

  const handleSubmitForApproval = async () => {
    if (!window.confirm('Are you sure you want to submit this document for approval?')) {
      return;
    }
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update document status in localStorage
      const documents = JSON.parse(localStorage.getItem('documents') || '[]');
      const index = documents.findIndex(doc => doc.id.toString() === id.toString());
      
      if (index !== -1) {
        documents[index] = {
          ...documents[index],
          status: 'pending',
          updated_at: new Date().toISOString()
        };
        localStorage.setItem('documents', JSON.stringify(documents));
      }
      
      setSuccess('Document submitted for approval successfully!');
      setTimeout(() => {
        navigate('/documents');
      }, 2000);
    } catch (err) {
      setError('Failed to submit document for approval. Please try again.');
    }
  };

  return (
    <>
      <NavigationBar />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>{isNew ? 'Create New Document' : 'Edit Document'}</h2>
          
          {!isNew && (
            <div>
              <Button 
                variant="outline-primary" 
                className="me-2" 
                onClick={handleExport}
              >
                Export
              </Button>
              
              {document.status !== 'pending' && document.status !== 'approved' && (
                <Button 
                  variant="primary" 
                  onClick={handleSubmitForApproval}
                >
                  Submit for Approval
                </Button>
              )}
            </div>
          )}
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Tabs defaultActiveKey="details" className="mb-3">
          <Tab eventKey="details" title="Document Details">
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Document Number</Form.Label>
                <Form.Control
                  type="text"
                  name="number"
                  value={document.number}
                  onChange={handleChange}
                  placeholder="Enter document number"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a document number.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Document Type</Form.Label>
                <Form.Select
                  name="type"
                  value={document.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select type...</option>
                  <option value="Contract">Contract</option>
                  <option value="Report">Report</option>
                  <option value="Agreement">Agreement</option>
                  <option value="Memo">Memo</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Please select a document type.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={document.title}
                  onChange={handleChange}
                  placeholder="Enter document title"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a document title.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={document.description}
                  onChange={handleChange}
                  placeholder="Enter document description"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Performer</Form.Label>
                <Form.Control
                  type="text"
                  name="performer"
                  value={document.performer}
                  onChange={handleChange}
                  placeholder="Enter performer name"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a performer name.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={document.date}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please select a date.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Document Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  name="content"
                  value={document.content}
                  onChange={handleChange}
                  placeholder="Enter document content"
                />
                <Form.Text className="text-muted">
                  You can manually edit the document content here or upload a file below.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Upload Document (DOC/DOCX format)</Form.Label>
                <Form.Control
                  type="file"
                  accept=".doc,.docx,.txt,.pdf"
                  onChange={handleFileChange}
                />
                {document.fileName && (
                  <div className="mt-2">
                    <strong>Current file:</strong> {document.fileName} 
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => setShowPreview(true)}
                    >
                      View
                    </Button>
                  </div>
                )}
              </Form.Group>

              <div className="d-flex justify-content-between mt-4">
                <Button variant="secondary" onClick={() => navigate('/documents')}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {isNew ? 'Create Document' : 'Save Changes'}
                </Button>
              </div>
            </Form>
          </Tab>
          
          {!isNew && (
            <Tab eventKey="history" title="History">
              <ListGroup>
                {history.map(entry => (
                  <ListGroup.Item key={entry.id}>
                    <div className="d-flex justify-content-between">
                      <strong>{entry.action}</strong>
                      <span>{entry.date}</span>
                    </div>
                    <div>User: {entry.user}</div>
                    {entry.reason && (
                      <div className="text-danger mt-2">
                        <strong>Reason:</strong> {entry.reason}
                      </div>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Tab>
          )}
        </Tabs>
        
        {/* Document Preview Modal */}
        <Modal 
          show={showPreview} 
          onHide={() => setShowPreview(false)} 
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Document Preview - {document.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{ 
              padding: '30px', 
              backgroundColor: '#fff', 
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              <div style={{ borderBottom: '1px solid #ddd', paddingBottom: '15px', marginBottom: '15px' }}>
                <h4 style={{ fontWeight: 'bold' }}>{document.title}</h4>
                <div><strong>Document Number:</strong> {document.number}</div>
                <div><strong>Type:</strong> {document.type}</div>
                <div><strong>Date:</strong> {new Date(document.date).toLocaleDateString()}</div>
                <div><strong>Performer:</strong> {document.performer}</div>
                {document.fileName && (
                  <div><strong>File:</strong> {document.fileName}</div>
                )}
              </div>
              
              {document.content}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-primary" onClick={handleExport}>
              Export
            </Button>
            <Button variant="secondary" onClick={() => setShowPreview(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Export Modal */}
        <Modal 
          show={showExportModal} 
          onHide={() => setShowExportModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Export Document</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Export Format</Form.Label>
                <Form.Select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                >
                  <option value="docx">Microsoft Word (.docx)</option>
                  <option value="xlsx">Microsoft Excel (.xlsx)</option>
                  <option value="pdf">PDF Document (.pdf)</option>
                </Form.Select>
              </Form.Group>
              <p className="text-muted">
                The document will be exported with all current content and metadata.
              </p>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={performExport}>
              Export
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}

export default EditDocument;