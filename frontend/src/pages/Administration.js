import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Button, Tabs, Tab, Alert, Form, Table, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import { useLanguage } from '../context/LanguageContext';
import UserManagement from './UserManagement';

const Administration = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('userManagement');
  const [error, setError] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  
  // System settings state
  const [showUserSettingsModal, setShowUserSettingsModal] = useState(false);
  const [showDocSettingsModal, setShowDocSettingsModal] = useState(false);
  const [userSettings, setUserSettings] = useState({
    defaultRole: 'user',
    passwordMinLength: 6,
    requireEmailVerification: false
  });
  const [documentSettings, setDocumentSettings] = useState({
    autoSaveInterval: 5,
    defaultApprover: 'manager',
    allowMultipleVersions: true,
    defaultLanguage: 'en'
  });

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.role !== 'admin') {
      setError(t('adminAccessOnly'));
      setShowAlert(true);
      // Redirect non-admin users after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }
    
    // Load activity logs
    const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    setActivityLogs(logs);
    
    // Load system settings from localStorage or use defaults
    const savedUserSettings = JSON.parse(localStorage.getItem('userSettings') || 'null');
    if (savedUserSettings) {
      setUserSettings(savedUserSettings);
    }
    
    const savedDocSettings = JSON.parse(localStorage.getItem('documentSettings') || 'null');
    if (savedDocSettings) {
      setDocumentSettings(savedDocSettings);
    }
    
    // Set up interval to refresh logs periodically
    const intervalId = setInterval(() => {
      const freshLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
      setActivityLogs(freshLogs);
    }, 5000); // Refresh every 5 seconds
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [navigate, t]);

  const handleExportData = () => {
    // Get all data from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const documents = JSON.parse(localStorage.getItem('documents') || '[]');
    
    // Create a combined export object
    const exportData = {
      users: users.map(u => ({
        ...u,
        password: '****' // Don't export actual passwords
      })),
      documents,
      exportDate: new Date().toISOString(),
      exportBy: JSON.parse(localStorage.getItem('user') || '{}').username
    };
    
    // Convert to JSON and create download
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "dms_export_" + new Date().toISOString().split('T')[0] + ".json");
    document.body.appendChild(downloadAnchorNode); // Required for Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    // Log the action
    logActivity(t('dataExported'));
  };
  
  const handleExportLogs = () => {
    // Get current logs
    const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    
    // Convert to CSV format
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Timestamp,User,Action\n";
    
    logs.forEach(log => {
      csvContent += `${log.id},${log.timestamp},${log.user},"${log.action}"\n`;
    });
    
    // Create download
    const encodedUri = encodeURI(csvContent);
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", "activity_logs_" + new Date().toISOString().split('T')[0] + ".csv");
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    
    // Log the action
    logActivity(t('logsExported'));
  };
  
  const handleClearLogs = () => {
    if (window.confirm(t('confirmClearLogs'))) {
      localStorage.setItem('activityLogs', JSON.stringify([]));
      setActivityLogs([]);
      // Log the action
      logActivity(t('logsCleared'));
    }
  };
  
  const handleUserSettingsSave = () => {
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    setShowUserSettingsModal(false);
    logActivity(t('userSettingsUpdated'));
  };
  
  const handleDocSettingsSave = () => {
    localStorage.setItem('documentSettings', JSON.stringify(documentSettings));
    setShowDocSettingsModal(false);
    logActivity(t('documentSettingsUpdated'));
  };
  
  // Function to log activity
  const logActivity = (action) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const username = user.username || 'Guest';
    
    const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: username,
      action: action
    };
    
    const updatedLogs = [newLog, ...logs];
    localStorage.setItem('activityLogs', JSON.stringify(updatedLogs));
    
    // Update state
    setActivityLogs(updatedLogs);
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <>
      <NavigationBar />
      <Container className="mt-4">
        <h2>{t('administration')}</h2>
        <p>{t('adminWelcome')}</p>
        
        {showAlert && error && (
          <Alert variant="danger" onClose={() => setShowAlert(false)} dismissible>
            {error}
          </Alert>
        )}
        
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mt-4 mb-3"
        >
          <Tab eventKey="userManagement" title={t('userManagement')}>
            <Card className="mt-3">
              <Card.Body>
                <UserManagement />
              </Card.Body>
            </Card>
          </Tab>
          
          <Tab eventKey="documentManagement" title={t('documentManagement')}>
            <Card className="mt-3">
              <Card.Body>
                <h4>{t('documentManagement')}</h4>
                <p>{t('adminDocumentDescription')}</p>
                <div className="mb-3">
                  <Button onClick={() => navigate('/documents')} variant="primary">
                    {t('viewAllDocuments')}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Tab>
          
          <Tab eventKey="systemSettings" title={t('systemSettings')}>
            <Card className="mt-3">
              <Card.Body>
                <h4>{t('systemSettings')}</h4>
                <p>{t('adminSystemSettingsDescription')}</p>
                <Row className="mb-3">
                  <Col md={6}>
                    <Card>
                      <Card.Body>
                        <Card.Title>{t('userSettings')}</Card.Title>
                        <Card.Text>{t('defaultUserSettings')}</Card.Text>
                        <Button 
                          variant="outline-primary" 
                          onClick={() => setShowUserSettingsModal(true)}
                        >
                          {t('configure')}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card>
                      <Card.Body>
                        <Card.Title>{t('documentSettings')}</Card.Title>
                        <Card.Text>{t('defaultDocumentSettings')}</Card.Text>
                        <Button 
                          variant="outline-primary" 
                          onClick={() => setShowDocSettingsModal(true)}
                        >
                          {t('configure')}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>
          
          <Tab eventKey="dataExport" title={t('dataExport')}>
            <Card className="mt-3">
              <Card.Body>
                <h4>{t('dataExport')}</h4>
                <p>{t('adminExportDescription')}</p>
                <Button onClick={handleExportData} variant="success">
                  {t('exportAllData')}
                </Button>
              </Card.Body>
            </Card>
          </Tab>
          
          <Tab eventKey="activityLogs" title={t('activityLogs')}>
            <Card className="mt-3">
              <Card.Body>
                <h4>{t('activityLogs')}</h4>
                <p>{t('adminLogsDescription')}</p>
                
                <div className="d-flex justify-content-end mb-3">
                  <Button 
                    variant="outline-primary" 
                    onClick={handleExportLogs} 
                    className="me-2"
                  >
                    {t('exportLogs')}
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    onClick={handleClearLogs}
                  >
                    {t('clearLogs')}
                  </Button>
                </div>
                
                <div className="logs-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {activityLogs.length > 0 ? (
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>{t('timestamp')}</th>
                          <th>{t('user')}</th>
                          <th>{t('action')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityLogs.map(log => (
                          <tr key={log.id}>
                            <td>{formatTimestamp(log.timestamp)}</td>
                            <td>{log.user}</td>
                            <td>{log.action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p className="text-center">{t('noLogsFound')}</p>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
        
        {/* User Settings Modal */}
        <Modal show={showUserSettingsModal} onHide={() => setShowUserSettingsModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{t('userSettings')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>{t('defaultRole')}</Form.Label>
                <Form.Select
                  value={userSettings.defaultRole}
                  onChange={(e) => setUserSettings({...userSettings, defaultRole: e.target.value})}
                >
                  <option value="user">{t('user')}</option>
                  <option value="manager">{t('manager')}</option>
                  <option value="admin">{t('admin')}</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>{t('passwordMinLength')}</Form.Label>
                <Form.Control
                  type="number"
                  min="4"
                  max="16"
                  value={userSettings.passwordMinLength}
                  onChange={(e) => setUserSettings({...userSettings, passwordMinLength: parseInt(e.target.value)})}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label={t('requireEmailVerification')}
                  checked={userSettings.requireEmailVerification}
                  onChange={(e) => setUserSettings({...userSettings, requireEmailVerification: e.target.checked})}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUserSettingsModal(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleUserSettingsSave}>
              {t('saveSettings')}
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Document Settings Modal */}
        <Modal show={showDocSettingsModal} onHide={() => setShowDocSettingsModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{t('documentSettings')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>{t('autoSaveInterval')} ({t('minutes')})</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="60"
                  value={documentSettings.autoSaveInterval}
                  onChange={(e) => setDocumentSettings({...documentSettings, autoSaveInterval: parseInt(e.target.value)})}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>{t('defaultApprover')}</Form.Label>
                <Form.Select
                  value={documentSettings.defaultApprover}
                  onChange={(e) => setDocumentSettings({...documentSettings, defaultApprover: e.target.value})}
                >
                  <option value="manager">{t('manager')}</option>
                  <option value="admin">{t('admin')}</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label={t('allowMultipleVersions')}
                  checked={documentSettings.allowMultipleVersions}
                  onChange={(e) => setDocumentSettings({...documentSettings, allowMultipleVersions: e.target.checked})}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>{t('defaultLanguage')}</Form.Label>
                <Form.Select
                  value={documentSettings.defaultLanguage}
                  onChange={(e) => setDocumentSettings({...documentSettings, defaultLanguage: e.target.value})}
                >
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDocSettingsModal(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={handleDocSettingsSave}>
              {t('saveSettings')}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default Administration; 