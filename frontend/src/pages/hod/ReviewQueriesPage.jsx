import { Card, Table, Tag, Typography, Button, Modal, Form, Input, Space, Select, Spin, Alert } from 'antd';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_COLORS = {
  pending: 'orange',
  approved: 'green',
  declined: 'red',
};

export default function ReviewQueriesPage() {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
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
        console.error('Error fetching queries:', error);
        setError(error.message || 'Unable to load queries.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  function openReview(query) {
    setSelectedQuery(query);
    form.setFieldsValue({
      status: query.status,
      hodComment: query.hodComment || '',
    });
  }

  async function handleSubmit(values) {
    if (!selectedQuery) return;

    setSaving(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/queries/${selectedQuery.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user': currentUser.username,
          },
          body: JSON.stringify({
            status: values.status,
            hodComment: values.hodComment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update query.');
      }

      setQueries((prev) =>
        prev.map((q) => (q.id === selectedQuery.id ? data.query : q))
      );

      setSelectedQuery(null);
      form.resetFields();
    } catch (error) {
      console.error('Failed to update query:', error);
      setError(error.message || 'Unable to update query.');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { title: 'Staff Member', dataIndex: 'staffName', key: 'staffName' },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    { title: 'Date', dataIndex: 'submittedAt', key: 'submittedAt', width: 110 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => <Tag color={STATUS_COLORS[s]}>{s.toUpperCase()}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button size="small" onClick={() => openReview(record)}>
          Review
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <Spin size="large" tip="Loading queries..." />
      </div>
    );
  }

  if (error && !selectedQuery) {
    return <Alert message="Unable to load queries" description={error} type="error" showIcon />;
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>Review Queries</Title>
        <Text type="secondary">Manage correction requests from your department</Text>
      </div>

      {error && (
        <Alert
          message="Request issue"
          description={error}
          type="error"
          showIcon
        />
      )}

      <Card>
        <Table
          columns={columns}
          dataSource={queries}
          rowKey="id"
          pagination={false}
          size="middle"
          locale={{ emptyText: 'No queries found' }}
        />
      </Card>

      <Modal
        title="Review Query"
        open={!!selectedQuery}
        onCancel={() => setSelectedQuery(null)}
        footer={null}
        destroyOnClose
      >
        {selectedQuery && (
          <>
            <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
              <Text strong>{selectedQuery.staffName}</Text>
              <br />
              <Text type="secondary">{selectedQuery.submittedAt}</Text>
              <p style={{ marginTop: 8 }}>{selectedQuery.message}</p>
            </Card>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="status" label="Decision" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="approved">Approve</Select.Option>
                  <Select.Option value="declined">Decline</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="hodComment" label="Comment (required if declining)">
                <TextArea rows={3} placeholder="Add a comment for the staff member..." />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setSelectedQuery(null)}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={saving}>
                    Save Decision
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </Space>
  );
}