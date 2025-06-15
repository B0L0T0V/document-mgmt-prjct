import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Modal, Form, Alert } from 'react-bootstrap';
import NavigationBar from '../components/NavigationBar';
import { useLanguage } from '../context/LanguageContext';

// --- Страница управления пользователями ---
// Здесь реализованы функции просмотра, создания, редактирования, удаления пользователей, логирования действий
// Данные берутся и сохраняются в localStorage
const UserManagement = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });

  // --- Загрузка пользователей и проверка прав администратора ---
  useEffect(() => {
    const fetchUsers = () => {
      try {
        setLoading(true);
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!currentUser || currentUser.role !== 'admin') {
          setError(t('adminAccessOnly'));
          setLoading(false);
          return;
        }
        
        // Get users from localStorage instead of API
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        
        // If no users in localStorage, add default users
        if (storedUsers.length === 0) {
          const defaultUsers = [
            {
              id: 1,
              username: 'администратор',
              email: 'admin@example.com',
              password: 'admin123',
              role: 'admin',
              created_at: new Date().toISOString()
            },
            {
              id: 2,
              username: 'руководитель',
              email: 'manager@example.com',
              password: 'manager123',
              role: 'manager',
              created_at: new Date().toISOString()
            },
            {
              id: 3,
              username: 'исполнитель',
              email: 'user@example.com',
              password: 'user123',
              role: 'user',
              created_at: new Date().toISOString()
            }
          ];
          
          localStorage.setItem('users', JSON.stringify(defaultUsers));
          setUsers(defaultUsers);
        } else {
          setUsers(storedUsers);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [t]);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowEditModal(true);
  };

  const handleCreateUser = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user'
    });
    setShowCreateModal(true);
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm(t('confirmDeleteUser'))) {
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Check if trying to delete self
      if (currentUser.id === userId) {
        setError(t('cannotDeleteSelf'));
        return;
      }
      
      // Get users from localStorage
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Filter out the user to delete
      const updatedUsers = storedUsers.filter(user => user.id !== userId);
      
      // Save back to localStorage
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Update state
      setUsers(updatedUsers);
      
      // Log the action
      logActivity(`${t('userDeleted')}: ${userId}`);
      
      alert(t('userDeletedSuccess'));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditSubmit = () => {
    if (!formData.username || !formData.email || !formData.role) {
      alert(t('fillRequiredFields'));
      return;
    }

    try {
      // Get users from localStorage
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find the user to update
      const userIndex = storedUsers.findIndex(user => user.id === selectedUser.id);
      
      if (userIndex === -1) {
        throw new Error(t('userNotFound'));
      }
      
      // Create updated user object
      const updatedUser = {
        ...storedUsers[userIndex],
        username: formData.username,
        email: formData.email,
        role: formData.role,
        updated_at: new Date().toISOString()
      };
      
      // Update password if provided
      if (formData.password) {
        updatedUser.password = formData.password;
      }
      
      // Update the user in the array
      storedUsers[userIndex] = updatedUser;
      
      // Save back to localStorage
      localStorage.setItem('users', JSON.stringify(storedUsers));
      
      // Update state
      setUsers(storedUsers);
      setShowEditModal(false);
      setSelectedUser(null);
      
      // Log the action
      logActivity(`${t('userUpdated')}: ${updatedUser.username}`);
      
      alert(t('userUpdatedSuccess'));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateSubmit = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.role) {
      alert(t('fillAllFields'));
      return;
    }

    try {
      // Get users from localStorage
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if username already exists
      if (storedUsers.some(user => user.username === formData.username)) {
        alert(t('usernameExists'));
        return;
      }
      
      // Generate ID for new user
      const newId = storedUsers.length > 0 
        ? Math.max(...storedUsers.map(u => u.id)) + 1 
        : 1;
      
      // Create new user object
      const newUser = {
        id: newId,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        created_at: new Date().toISOString()
      };
      
      // Add user to array
      const updatedUsers = [...storedUsers, newUser];
      
      // Save to localStorage
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Update state
      setUsers(updatedUsers);
      setShowCreateModal(false);
      
      // Log the action
      logActivity(`${t('userCreated')}: ${newUser.username}`);
      
      alert(t('userCreatedSuccess'));
    } catch (err) {
      setError(err.message);
    }
  };
  
  // --- Логирование действий администратора ---
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <NavigationBar />
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{t('userManagement')}</h2>
          <Button variant="success" onClick={handleCreateUser}>
            {t('createNewUser')}
          </Button>
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <p>{t('loadingUsers')}</p>
        ) : (
          <Card>
            <Card.Body>
              {users.length === 0 ? (
                <p>{t('noUsersFound')}</p>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>{t('username')}</th>
                      <th>{t('email')}</th>
                      <th>{t('role')}</th>
                      <th>{t('created')}</th>
                      <th>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${
                            user.role === 'admin' ? 'bg-danger' : 
                            user.role === 'manager' ? 'bg-warning' : 'bg-primary'
                          }`}>
                            {user.role === 'admin' ? t('admin') : 
                             user.role === 'manager' ? t('manager') : 
                             t('user')}
                          </span>
                        </td>
                        <td>{formatDate(user.created_at)}</td>
                        <td>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => handleEditUser(user)}
                            className="me-2"
                          >
                            {t('edit')}
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            {t('delete')}
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
      
      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('editUser')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('username')}</Form.Label>
              <Form.Control
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>{t('email')}</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>{t('password')} ({t('leaveBlankIfUnchanged')})</Form.Label>
              <Form.Control
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>{t('role')}</Form.Label>
              <Form.Select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                required
              >
                <option value="user">{t('user')}</option>
                <option value="manager">{t('manager')}</option>
                <option value="admin">{t('admin')}</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            {t('saveChanges')}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Create User Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('createUser')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('username')}</Form.Label>
              <Form.Control
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>{t('email')}</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>{t('password')}</Form.Label>
              <Form.Control
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>{t('role')}</Form.Label>
              <Form.Select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                required
              >
                <option value="user">{t('user')}</option>
                <option value="manager">{t('manager')}</option>
                <option value="admin">{t('admin')}</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={handleCreateSubmit}>
            {t('createUser')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserManagement; 