import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Alert } from 'react-bootstrap';
import NavigationBar from '../components/NavigationBar';
import { useLanguage } from '../context/LanguageContext';

const History = () => {
  const { t } = useLanguage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!user || !user.id) {
          setError(t('pleaseFillAllRequired'));
          setLoading(false);
          return;
        }
        
        // Instead of actual API call that fails, use mock data
        const mockHistory = [
          {
            id: 1,
            document_id: 1,
            document_title: "Договор об оказании услуг",
            action: "создание",
            user: "Вася Пупкин",
            timestamp: "2023-01-15T10:30:00Z",
            reason: null
          },
          {
            id: 2,
            document_id: 2,
            document_title: "Квартальный отчет",
            action: "создание",
            user: "Семен Семеныч",
            timestamp: "2023-02-20T14:15:00Z",
            reason: null
          },
          {
            id: 3,
            document_id: 2,
            document_title: "Квартальный отчет",
            action: "утверждение",
            user: "Руководитель",
            timestamp: "2023-02-25T09:45:00Z",
            reason: null
          },
          {
            id: 4,
            document_id: 3,
            document_title: "Соглашение о партнерстве",
            action: "создание",
            user: "Гриша Попов",
            timestamp: "2023-03-10T11:20:00Z",
            reason: null
          },
          {
            id: 5,
            document_id: 3,
            document_title: "Соглашение о партнерстве",
            action: "отправка на утверждение",
            user: "Гриша Попов",
            timestamp: "2023-03-10T11:45:00Z",
            reason: null
          },
          {
            id: 6,
            document_id: 4,
            document_title: "Служебная записка о проекте",
            action: "создание",
            user: "Артем Сом",
            timestamp: "2023-04-05T09:15:00Z",
            reason: null
          },
          {
            id: 7,
            document_id: 4,
            document_title: "Служебная записка о проекте",
            action: "отклонение",
            user: "Руководитель",
            timestamp: "2023-04-06T14:30:00Z",
            reason: "Отсутствует необходимая информация в разделе 3"
          }
        ];
        
        // Save the mock data to localStorage for persistence
        localStorage.setItem('document_history', JSON.stringify(mockHistory));
        
        setHistory(mockHistory);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    // Try to get history from localStorage first
    const storedHistory = JSON.parse(localStorage.getItem('document_history') || '[]');
    if (storedHistory.length > 0) {
      setHistory(storedHistory);
      setLoading(false);
    } else {
      fetchHistory();
    }
  }, [t]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <NavigationBar />
      <Container className="mt-4">
        <h2>{t('history')}</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <p>{t('loadingDocuments')}</p>
        ) : (
          <Card>
            <Card.Body>
              {history.length === 0 ? (
                <p>{t('noHistoryFound')}</p>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>{t('document')}</th>
                      <th>{t('action')}</th>
                      <th>{t('user')}</th>
                      <th>{t('date')}</th>
                      <th>{t('reasonForRejection')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record) => (
                      <tr key={record.id}>
                        <td>{record.document_title || `${t('document')} #${record.document_id}`}</td>
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