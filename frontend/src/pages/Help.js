import React, { useState } from 'react';
import { Container, Accordion, Card, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import NavigationBar from '../components/NavigationBar';
import { useLanguage } from '../context/LanguageContext';

const Help = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSupportModal, setShowSupportModal] = useState(false);
  
  const helpTopics = [
    {
      title: 'Getting Started',
      content: `
        <h5>Welcome to the Document Management System</h5>
        <p>This system helps you create, manage, and approve documents within your organization.</p>
        <p>To get started:</p>
        <ol>
          <li>Log in with your credentials</li>
          <li>Navigate using the menu at the top of the page</li>
          <li>Create your first document by going to the Documents section</li>
        </ol>
      `
    },
    {
      title: 'Creating Documents',
      content: `
        <h5>How to Create a New Document</h5>
        <p>To create a new document:</p>
        <ol>
          <li>Go to the Documents section</li>
          <li>Click the "Create New Document" button</li>
          <li>Fill in the document details including title and type</li>
          <li>Enter the document content or upload a file</li>
          <li>Click "Save" to save as a draft or "Submit for Approval" to start the approval process</li>
        </ol>
      `
    },
    {
      title: 'Document Approval Process',
      content: `
        <h5>Understanding the Approval Workflow</h5>
        <p>Documents go through several stages before they are finalized:</p>
        <ol>
          <li><strong>Draft</strong>: Initial version, can be edited by the author</li>
          <li><strong>Pending</strong>: Submitted for approval, waiting for manager review</li>
          <li><strong>Approved</strong>: Officially approved and signed by a manager</li>
          <li><strong>Rejected</strong>: Sent back for revisions with comments</li>
        </ol>
        <p>Only users with Manager or Administrator roles can approve documents.</p>
      `
    },
    {
      title: 'Using Electronic Signatures',
      content: `
        <h5>Electronic Signature Guide</h5>
        <p>Electronic signatures in this system are legally binding:</p>
        <ol>
          <li>When approving a document, you'll be prompted to sign electronically</li>
          <li>Enter your full name as it appears in your profile</li>
          <li>Verify the current date</li>
          <li>Check the confirmation box to certify that your electronic signature is valid</li>
          <li>Click "Sign and Approve" to complete the process</li>
        </ol>
        <p>All signatures are recorded with a timestamp and the user's information for audit purposes.</p>
      `
    },
    {
      title: 'Exporting Documents',
      content: `
        <h5>Exporting to Different Formats</h5>
        <p>You can export documents in various formats:</p>
        <ol>
          <li>Open the document you want to export</li>
          <li>Click the "Export" button in the document toolbar</li>
          <li>Select your desired format (.docx, .xlsx, .pdf)</li>
          <li>Wait for the export to complete and download the file</li>
        </ol>
        <p>Exported documents include a footer with metadata about creation date and approval status.</p>
      `
    },
    {
      title: 'User Roles and Permissions',
      content: `
        <h5>Understanding Access Levels</h5>
        <p>The system has three role levels with different permissions:</p>
        <ul>
          <li><strong>User</strong>: Can create documents, view their history, send messages, and manage their settings</li>
          <li><strong>Manager</strong>: Has User permissions plus can approve/reject documents and manage employees</li>
          <li><strong>Administrator</strong>: Has full access to all system features including user management and configuration</li>
        </ul>
      `
    },
    {
      title: 'Troubleshooting',
      content: `
        <h5>Common Issues and Solutions</h5>
        <p><strong>Problem:</strong> Can't save a document<br>
        <strong>Solution:</strong> Check your internet connection and try again. If the problem persists, try saving as a draft first.</p>
        
        <p><strong>Problem:</strong> Document appears blank when viewing<br>
        <strong>Solution:</strong> Try refreshing the page or reopening the document. If it still appears blank, contact your administrator.</p>
        
        <p><strong>Problem:</strong> Can't find a specific feature<br>
        <strong>Solution:</strong> Some features are role-specific. Check if your current role has access to that feature.</p>
        
        <p>For additional help, please contact your system administrator.</p>
      `
    }
  ];
  
  const filteredTopics = searchTerm 
    ? helpTopics.filter(topic => 
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        topic.content.toLowerCase().includes(searchTerm.toLowerCase()))
    : helpTopics;
  
  return (
    <>
      <NavigationBar />
      <Container className="mt-4">
        <h2>{t('help')}</h2>
        <p>{t('findAnswers')}</p>
        
        <Card className="mb-4">
          <Card.Body>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder={t('searchHelpTopics')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            
            <div className="d-flex justify-content-between">
              <div>
                {searchTerm && (
                  <p className="mb-0">
                    {t('found')} {filteredTopics.length} {filteredTopics.length === 1 ? t('result') : t('results')} {t('for')} "{searchTerm}"
                  </p>
                )}
              </div>
              <div>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => window.print()}
                >
                  {t('printHelpGuide')}
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
        
        <Accordion defaultActiveKey="0">
          {filteredTopics.map((topic, index) => (
            <Accordion.Item eventKey={index.toString()} key={index}>
              <Accordion.Header>{topic.title}</Accordion.Header>
              <Accordion.Body dangerouslySetInnerHTML={{ __html: topic.content }} />
            </Accordion.Item>
          ))}
        </Accordion>
        
        {filteredTopics.length === 0 && (
          <Card>
            <Card.Body className="text-center">
              <p>{t('noHelpTopicsFound')}</p>
              <Button 
                variant="primary" 
                onClick={() => setSearchTerm('')}
              >
                {t('showAllTopics')}
              </Button>
            </Card.Body>
          </Card>
        )}
        
        <Card className="mt-4">
          <Card.Body className="text-center">
            <h5>{t('needMoreHelp')}</h5>
            <p>{t('contactAdminForHelp')}</p>
            <Button variant="success" onClick={() => setShowSupportModal(true)}>
              {t('contactSupport')}
            </Button>
          </Card.Body>
        </Card>
      </Container>

      {/* Support Contact Modal */}
      <Modal 
        show={showSupportModal} 
        onHide={() => setShowSupportModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('support')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>{t('phone')}:</strong> +0 000 000 0000</p>
          <p><strong>{t('email')}:</strong> example@example.com</p>
          <p>{t('supportAvailability')}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSupportModal(false)}>
            {t('close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Help; 