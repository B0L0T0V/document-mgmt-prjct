import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import NavigationBar from '../components/NavigationBar';
import { useLanguage } from '../context/LanguageContext';

function Messages() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    content: ''
  });
  
  const [messages, setMessages] = useState([]);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    if (storedMessages.length === 0) {
      // Initial default messages if none exist
      const defaultMessages = [
        { id: 1, sender: 'Вася Пупкин', recipient: t('me'), subject: 'Обзор Документа', content: 'Пожалуйста, проверьте приложенный документ', date: '2023-03-15', read: true },
        { id: 2, sender: 'Семен Семеныч', recipient: t('me'), subject: 'Встреча Завтра', content: 'Напоминание о нашем собрании в 10 утра', date: '2023-03-14', read: false },
        { id: 3, sender: t('me'), recipient: 'Артем Сом', subject: 'Обновление Проекта', content: 'Вот последние обновления проекта', date: '2023-03-10', read: true },
      ];
      setMessages(defaultMessages);
      localStorage.setItem('messages', JSON.stringify(defaultMessages));
    } else {
      // Replace any existing "Me" with translated version
      const updatedMessages = storedMessages.map(msg => ({
        ...msg,
        sender: msg.sender === 'Me' ? t('me') : msg.sender,
        recipient: msg.recipient === 'Me' ? t('me') : msg.recipient
      }));
      setMessages(updatedMessages);
      localStorage.setItem('messages', JSON.stringify(updatedMessages));
    }
  }, [t]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('messages', JSON.stringify(messages));
    }
  }, [messages]);

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

  const handleNewMessageChange = (e) => {
    const { name, value } = e.target;
    setNewMessage(prev => ({ ...prev, [name]: value }));
  };

  const handleSendMessage = () => {
    // Get current user
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const sender = user.username || t('me');
    
    // Create new message with logged timestamp
    const newMsg = {
      id: Date.now(),
      sender: sender,
      recipient: newMessage.recipient,
      subject: newMessage.subject,
      content: newMessage.content,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      read: true
    };
    
    const updatedMessages = [newMsg, ...messages];
    setMessages(updatedMessages);
    
    // Save to localStorage
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    
    // Log the action
    logActivity(`${t('messageSent')}: ${newMessage.subject} ${t('to')} ${newMessage.recipient}`);
    
    // Reset form and close modal
    setNewMessage({ recipient: '', subject: '', content: '' });
    setShowModal(false);
  };

  const handleViewMessage = (msg) => {
    // If the message is unread, mark it as read
    if (!msg.read && msg.recipient === t('me')) {
      const updatedMessages = messages.map(m => 
        m.id === msg.id ? { ...m, read: true } : m
      );
      setMessages(updatedMessages);
      localStorage.setItem('messages', JSON.stringify(updatedMessages));
      
      // Log the action
      logActivity(`${t('messageRead')}: ${msg.subject}`);
    }
    
    alert(`${t('messageContent')}: ${msg.content}`);
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
  };

  // Filter and sort messages
  const filteredMessages = messages.filter(msg => 
    (msg.subject && msg.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (msg.sender && msg.sender.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (msg.recipient && msg.recipient.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <>
      <NavigationBar />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{t('messages')}</h2>
          <Button variant="primary" onClick={() => setShowModal(true)}>{t('newMessage')}</Button>
        </div>
        
        <InputGroup className="mb-3">
          <Form.Control
            placeholder={t('searchMessages')}
            value={searchTerm}
            onChange={handleSearch}
          />
        </InputGroup>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th onClick={() => handleSort('sender')}>{t('sender')} {sortBy === 'sender' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('recipient')}>{t('recipient')} {sortBy === 'recipient' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('subject')}>{t('subject')} {sortBy === 'subject' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('date')}>{t('date')} {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th>{t('status')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.map(msg => (
              <tr key={msg.id} className={!msg.read && msg.recipient === t('me') ? 'fw-bold' : ''}>
                <td>{msg.sender}</td>
                <td>{msg.recipient}</td>
                <td>{msg.subject}</td>
                <td>{msg.date}</td>
                <td>{msg.read ? t('read') : t('unread')}</td>
                <td>
                  <Button variant="info" size="sm" onClick={() => handleViewMessage(msg)}>
                    {t('view')}
                  </Button>
                </td>
              </tr>
            ))}
            {filteredMessages.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">{t('noMessagesFound')}</td>
              </tr>
            )}
          </tbody>
        </Table>
        
        {/* New Message Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{t('newMessage')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>{t('to')}</Form.Label>
                <Form.Control
                  type="text"
                  name="recipient"
                  value={newMessage.recipient}
                  onChange={handleNewMessageChange}
                  placeholder={t('enterRecipient')}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>{t('subject')}</Form.Label>
                <Form.Control
                  type="text"
                  name="subject"
                  value={newMessage.subject}
                  onChange={handleNewMessageChange}
                  placeholder={t('enterSubject')}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>{t('message')}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="content"
                  value={newMessage.content}
                  onChange={handleNewMessageChange}
                  placeholder={t('typeYourMessage')}
                  required
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              {t('cancel')}
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSendMessage}
              disabled={!newMessage.recipient || !newMessage.subject || !newMessage.content}
            >
              {t('sendMessage')}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}

export default Messages;