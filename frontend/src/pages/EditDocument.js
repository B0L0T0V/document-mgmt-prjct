import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Tab, Tabs, Alert, ListGroup, Modal, Dropdown } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import { useLanguage } from '../context/LanguageContext';

function EditDocument() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const { t } = useLanguage();
  
  const [document, setDocument] = useState({
    number: '',
    type: '',
    title: '',
    description: '',
    performer: '',
    date: new Date().toISOString().split('T')[0],
    file: null,
    fileName: '',
    content: 'Это образец содержания документа. В реальном приложении здесь будет фактическое содержание документа.',
    originalFile: null // Store the original file blob
  });
  
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('docx');
  const [userRole, setUserRole] = useState('user');
  const [encodingError, setEncodingError] = useState(false);
  
  // Function to format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Mock history data in Russian
  const [history] = useState([
    { id: 1, action: 'Документ создан', user: 'Вася Пупкин', date: '2023-01-15 09:30' },
    { id: 2, action: 'Документ обновлен', user: 'Семен Семеныч', date: '2023-01-17 14:22' },
    { id: 3, action: 'Документ отправлен на утверждение', user: 'Вася Пупкин', date: '2023-01-18 11:05' },
    { id: 4, action: 'Документ отклонен', user: 'Руководитель', date: '2023-01-19 16:45', reason: 'Отсутствует необходимая информация в разделе 3.' }
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
        // Convert base64 back to ArrayBuffer if it exists
        if (existingDoc.originalFileBase64) {
          existingDoc.originalFile = _base64ToArrayBuffer(existingDoc.originalFileBase64);
          delete existingDoc.originalFileBase64; // Remove the base64 version to save memory
        }
        setDocument(existingDoc);
      } else {
        // If document is not in localStorage, use mock data
        const fetchDocument = async () => {
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const mockDocument = {
              id: parseInt(id),
              number: `ДОК-00${id}`,
              type: 'Договор',
              title: 'Пример документа',
              description: 'Это образец документа для демонстрационных целей.',
              performer: 'Вася Пупкин',
              date: '2023-01-15',
              fileName: 'образец.doc',
              content: `Это содержание документа ${id}. 

В реальном приложении здесь был бы фактический текст, извлеченный из загруженного файла документа.

Раздел 1: Введение
Лорем ипсум долор сит амет, консектетур адиписцинг элит. Нуллам вехикула, либеро ат коммодо темпор, ерат рисус малесуада одио, ат луктус пурус ми куис ми.

Раздел 2: Условия и положения
Маеценас вел ест егет сапиен консектетур еффицитур. Вестибулум анте ипсум примис ин фаукибус орци луктус ет ултрицес посуере кубилиа курае; Ут вел арку куис велит елеифенд вененатис.

Раздел 3: Обязанности
Пеллентеске хабитант морби тристикуе сенектус ет нетус ет малесуада фамес ак турпис егестас. Сед консекуат масса ин урна бландит, еу улламкорпер нисл тинцидунт.

Раздел 4: Заключение
Нулла фацилиси. Ин хак хабитассе платеа диктумст. Вивамус феугиат консекуат велит, куис сцелериске пурус пхаретра вел.`
            };
            setDocument(mockDocument);
          } catch (err) {
            setError(t('failedToSave'));
          }
        };
        
        fetchDocument();
      }
    }
  }, [id, isNew, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDocument(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Try multiple encodings for better Russian text support
      tryReadFile(file);
    }
  };

  // Function to try different encodings for file reading
  const tryReadFile = (file) => {
    setEncodingError(false);
    
    // Store the original file for direct export
    const binaryReader = new FileReader();
    binaryReader.onload = (event) => {
      setDocument(prev => ({
        ...prev,
        originalFile: event.target.result // Store the binary data
      }));
    };
    binaryReader.readAsArrayBuffer(file);
    
    // Check if this is a binary document format that shouldn't be read as text
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const binaryDocFormats = ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'];
    
    if (binaryDocFormats.includes(fileExtension)) {
      // Don't try to read binary formats as text, just use a placeholder
      const placeholderContent = `[${t('binaryDocumentFormat')}: ${file.name}]

${t('previewNotAvailable')}

${t('documentInfo')}:
- ${t('fileName')}: ${file.name}
- ${t('fileType')}: ${file.type || fileExtension.toUpperCase()}
- ${t('fileSize')}: ${(file.size / 1024).toFixed(2)} KB
- ${t('lastModified')}: ${new Date(file.lastModified).toLocaleString()}

${t('exportOriginalMessage')}`;
      
      setDocument(prev => ({
        ...prev,
        fileName: file.name,
        fileData: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          isBinary: true
        },
        content: placeholderContent
      }));
      
      return; // Skip text reading for binary formats
    }
    
    // Continue with text extraction for text-based files
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      
      // Check if content has visible Cyrillic characters
      if (/[а-яА-ЯёЁ]/.test(content)) {
        // Successfully read Russian text
        setDocument(prev => ({ 
          ...prev, 
          fileName: file.name,
          fileData: {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
          },
          content: content
        }));
      } else {
        // Try windows-1251 (common for older Russian text files)
        tryFallbackEncoding(file);
      }
    };
    
    reader.onerror = () => {
      // If error occurs during reading, try fallback
      tryFallbackEncoding(file);
    };
    
    // Try to read as text with UTF-8 encoding
    reader.readAsText(file, 'UTF-8');
  };
  
  // Fallback function for handling encoding issues
  const tryFallbackEncoding = (file) => {
    // In a real app, we'd try windows-1251 or other encodings
    // For this demo, we'll use a placeholder with proper Russian text
    setEncodingError(true);
    
    const placeholderContent = `Содержимое файла ${file.name}

Раздел 1: Введение
Этот документ был загружен ${new Date().toLocaleString()}.
Это предварительный просмотр содержания документа, которое будет извлечено из загруженного файла.

Раздел 2: Подробности
В реальном приложении библиотеки для анализа документов будут извлекать фактическое содержание из файла.

Документ: ${file.name}
Размер: ${Math.round(file.size / 1024)} КБ
Тип: ${file.type || 'Неизвестный'}
Дата модификации: ${new Date(file.lastModified).toLocaleString()}`;
    
    setDocument(prev => ({ 
      ...prev, 
      fileName: file.name,
      fileData: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      },
      content: placeholderContent
    }));
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
      const docToSave = {
        ...document,
        file: undefined,  // Remove the actual file object
        // Save originalFile if it exists as a base64 string
        originalFileBase64: document.originalFile ? 
          _arrayBufferToBase64(document.originalFile) : 
          null,
        originalFile: undefined, // Remove the binary from the object itself
        // Ensure we have valid dates
        created_at: document.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (isNew) {
        // Assign new ID for new document
        docToSave.id = documents.length > 0 ? Math.max(...documents.map(d => d.id)) + 1 : 1;
        docToSave.status = 'draft';
        docToSave.author = JSON.parse(localStorage.getItem('user') || '{}').username || 'Пользователь';
        
        documents.push(docToSave);
        setSuccess(t('documentCreated'));
      } else {
        // Update existing document
        const index = documents.findIndex(doc => doc.id.toString() === id.toString());
        if (index !== -1) {
          documents[index] = { ...documents[index], ...docToSave };
        } else {
          docToSave.id = parseInt(id);
          documents.push(docToSave);
        }
        setSuccess(t('documentUpdated'));
      }
      
      localStorage.setItem('documents', JSON.stringify(documents));
      
      // Redirect to documents list after a short delay
      setTimeout(() => {
        navigate('/documents');
      }, 1500);
    } catch (err) {
      setError(t('failedToSave'));
    }
  };

  // Helper function to convert ArrayBuffer to Base64 string for storage
  const _arrayBufferToBase64 = (buffer) => {
    if (!buffer) return null;
    
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Helper function to convert Base64 string back to ArrayBuffer
  const _base64ToArrayBuffer = (base64) => {
    if (!base64) return null;
    
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const performExport = () => {
    setShowExportModal(false);
    setSuccess(`${t('documentExported')} (${exportFormat})`);
    
    // Use the original file if available, otherwise create a text export
    if (document.originalFile) {
      // Use the original file without encoding issues
      const blob = new Blob([document.originalFile], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const domDocument = window.document;
      const a = domDocument.createElement('a');
      a.href = url;
      
      // Keep the original file extension if possible
      const extension = document.fileName.split('.').pop();
      a.download = `${document.title || 'document'}.${extension || exportFormat}`;
      
      domDocument.body.appendChild(a);
      a.click();
      domDocument.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Fallback to text export if original not available
      const blobContent = `${document.content}

---
${t('exportedOn')}: ${new Date().toLocaleString()}
${t('documentNumber')}: ${document.number}
${t('status')}: ${document.status || t('draft')}
`;
    
      const blob = new Blob([blobContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const domDocument = window.document;
      const a = domDocument.createElement('a');
      a.href = url;
      a.download = `${document.title || 'document'}.${exportFormat}`;
      domDocument.body.appendChild(a);
      a.click();
      domDocument.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update document status in localStorage
      const documents = JSON.parse(localStorage.getItem('documents') || '[]');
      const index = documents.findIndex(doc => doc.id.toString() === id.toString());
      
      if (index !== -1) {
        documents[index].status = 'pending';
        documents[index].updated_at = new Date().toISOString();
        localStorage.setItem('documents', JSON.stringify(documents));
        setSuccess(t('documentSubmitted'));
        
        // Redirect after short delay
        setTimeout(() => {
          navigate('/documents');
        }, 1500);
      } else {
        throw new Error('Document not found');
      }
    } catch (err) {
      setError(t('failedToSubmit'));
    }
  };

  // Helper function to translate document type
  const translateDocumentType = (type) => {
    if (!type) return '';
    
    // Map English types to translation keys
    const typeMapping = {
      'Contract': 'contract',
      'Report': 'report',
      'Agreement': 'agreement',
      'Memo': 'memo'
    };
    
    // If it's an English type, use the mapping to get the translation key
    if (typeMapping[type]) {
      return t(typeMapping[type]);
    }
    
    // If it's already in Russian, return as is
    return type;
  };

  return (
    <>
      <NavigationBar />
      <Container className="my-4">
        <h2>{isNew ? t('createNewDocument') : t('editDocument')}</h2>
        
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
        
        <Tabs defaultActiveKey="details" id="document-tabs" className="mb-3">
          <Tab eventKey="details" title={t('documentDetails')}>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>{t('documentNumber')}</Form.Label>
                <Form.Control
                  type="text"
                  name="number"
                  value={document.number}
                  onChange={handleChange}
                  placeholder={t('enterDocumentNumber')}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {t('pleaseEnterDocumentNumber')}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>{t('documentType')}</Form.Label>
                <Form.Select
                  name="type"
                  value={document.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">{t('selectType')}</option>
                  <option value="Договор">{t('contract')}</option>
                  <option value="Отчет">{t('report')}</option>
                  <option value="Соглашение">{t('agreement')}</option>
                  <option value="Служебная записка">{t('memo')}</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {t('pleaseSelectDocumentType')}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>{t('title')}</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={document.title}
                  onChange={handleChange}
                  placeholder={t('enterDocumentTitle')}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {t('pleaseEnterDocumentTitle')}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>{t('description')}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={document.description}
                  onChange={handleChange}
                  placeholder={t('enterDocumentDescription')}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>{t('performer')}</Form.Label>
                <Form.Control
                  type="text"
                  name="performer"
                  value={document.performer}
                  onChange={handleChange}
                  placeholder={t('enterPerformerName')}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {t('pleaseEnterPerformerName')}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>{t('date')}</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={document.date}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {t('pleaseSelectDate')}
                </Form.Control.Feedback>
              </Form.Group>
              
              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => navigate('/documents')}>
                  {t('cancel')}
                </Button>
                <Button variant="primary" type="submit">
                  {isNew ? t('create') : t('save')}
                </Button>
              </div>
            </Form>
          </Tab>
          
          <Tab eventKey="content" title={t('content')}>
            <div className="mb-3 p-2 border rounded">
              <Form.Group className="mb-3">
                <Form.Label>{t('uploadDocument')}</Form.Label>
                <Form.Control
                  type="file"
                  onChange={handleFileChange}
                />
                <Form.Text>
                  {document.fileName && (
                    <>
                      {t('currentFile')}: {document.fileName} 
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => setShowPreview(true)}
                      >
                        {t('view')}
                      </Button>
                    </>
                  )}
                </Form.Text>
                {encodingError && (
                  <Alert variant="info" className="mt-2">
                    {t('russianTextError')}
                  </Alert>
                )}
              </Form.Group>
              
              <Form.Group>
                <Form.Label>{t('content')}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={12}
                  name="content"
                  value={document.content}
                  onChange={handleChange}
                  placeholder={t('enterContent')}
                />
              </Form.Group>
            </div>
            
            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={() => navigate('/documents')}>
                {t('cancel')}
              </Button>
              <div>
                <Button variant="info" className="me-2" onClick={handleExport}>
                  {t('export')}
                </Button>
                {!isNew && document.status !== 'approved' && document.status !== 'pending' && (
                  <Button variant="primary" onClick={handleSubmitForApproval}>
                    {t('submitForApproval')}
                  </Button>
                )}
              </div>
            </div>
          </Tab>
          
          {!isNew && (
            <Tab eventKey="history" title={t('history')}>
              <ListGroup className="mb-3">
                {history.map(item => (
                  <ListGroup.Item key={item.id} className="d-flex flex-column">
                    <div className="d-flex justify-content-between">
                      <strong>{item.action}</strong>
                      <small>{item.date}</small>
                    </div>
                    <div className="text-muted">{t('user')}: {item.user}</div>
                    {item.reason && (
                      <div className="mt-2 text-danger">
                        {t('reasonForRejection')}: {item.reason}
                      </div>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Tab>
          )}
        </Tabs>
      </Container>
      
      {/* Document Preview Modal */}
      <Modal 
        show={showPreview} 
        onHide={() => setShowPreview(false)} 
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('documentPreview')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            {document.fileName && (
              <p className="fw-bold">
                {t('filePreview')}: {document.fileName}
              </p>
            )}
          </div>
          <div style={{ 
            whiteSpace: 'pre-wrap', 
            fontFamily: '"Courier New", Courier, monospace', 
            fontSize: '14px'
          }} 
          className="document-preview-content p-3 border rounded"
          >
            {document.content}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            {t('close')}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Export Modal */}
      <Modal
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('exportDocument')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t('exportDescription')}</p>
          <Form.Group className="mb-3">
            <Form.Label>{t('exportFormat')}</Form.Label>
            <Form.Select 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="docx">{t('word')}</option>
              <option value="xlsx">{t('excel')}</option>
              <option value="pdf">{t('pdf')}</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExportModal(false)}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={performExport}>
            {t('export')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditDocument;