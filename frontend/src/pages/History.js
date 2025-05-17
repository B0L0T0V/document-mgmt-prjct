import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Alert } from 'react-bootstrap';
import NavigationBar from '../components/NavigationBar';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!user || !user.id) {
          setError('You must be logged in to view history');
          setLoading(false);
          return;
        }
        
        const response = await fetch('http://localhost:5000/api/documents/history', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }

        const data = await response.json();
        setHistory(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <NavigationBar />
      <Container className="mt-4">
        <h2>Document History</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <p>Loading history...</p>
        ) : (
          <Card>
            <Card.Body>
              {history.length === 0 ? (
                <p>No history records found.</p>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Action</th>
                      <th>User</th>
                      <th>Date</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record) => (
                      <tr key={record.id}>
                        <td>{record.document_title || `Document #${record.document_id}`}</td>
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
    </>
  );
};

export default History; 