import { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Space, Spin, Alert } from 'antd';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const STATUS_COLORS = {
  pending: 'orange',
  approved: 'green',
  declined: 'red',
};

export default function AllQueriesPage() {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQueries = async () => {
      if (!currentUser?.username) {
        setLoading(false);
        setError('No logged-in user found.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/queries`, {
          headers: {
            'Content-Type': 'application/json',
            'x-user': currentUser.username,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load queries.');
        }

        setQueries(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load queries:', error);
        setError(error.message || 'Unable to load queries.');
      } finally {
        setLoading(false);
      }
    };

    fetchQueries();
  }, [currentUser]);

  const columns = [
    { title: 'Staff Member', dataIndex: 'staffName', key: 'staffName' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    { title: 'Message', dataIndex: 'message', key: 'message', ellipsis: true },
    { title: 'Date', dataIndex: 'submittedAt', key: 'submittedAt', width: 110 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => <Tag color={STATUS_COLORS[s]}>{s.toUpperCase()}</Tag>,
    },
    {
      title: 'HoD Response',
      dataIndex: 'hodComment',
      key: 'hodComment',
      render: (c) => c || <Text type="secondary">—</Text>,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Spin size="large" tip="Loading queries..." />
      </div>
    );
  }

  if (error) {
    return <Alert message="Unable to load queries" description={error} type="error" showIcon />;
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>All Queries</Title>
        <Text type="secondary">View all correction requests across the school</Text>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={queries}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </Space>
  );
}