import { Card, Table, Tag, Typography, Button, Modal, Form, Input, Space, Empty, Spin, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_COLORS = {
  pending: 'orange',
  approved: 'green',
  declined: 'red',
};

export default function StaffQueriesPage() {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form] = Form.useForm();

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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/queries/my`, {
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

  async function handleSubmit(values) {
    if (!currentUser?.username) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/queries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user': currentUser.username,
        },
        body: JSON.stringify({
          subject: values.subject,
          message: values.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit query.');
      }

      setQueries((prev) => [...prev, data.query]);
      form.resetFields();
      setModalOpen(false);
    } catch (error) {
      console.error('Failed to submit query:', error);
      setError(error.message || 'Unable to submit query.');
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    { title: 'Date', dataIndex: 'submittedAt', key: 'submittedAt', width: 110 },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={STATUS_COLORS[status]}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Response',
      dataIndex: 'hodComment',
      key: 'hodComment',
      render: (comment) => comment ? <Text>{comment}</Text> : <Text type="secondary">—</Text>,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>My Queries</Title>
          <Text type="secondary">Track your submitted correction requests</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Submit New Query
        </Button>
      </div>

      {error && (
        <Alert
          message="Query issue"
          description={error}
          type="error"
          showIcon
        />
      )}

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" tip="Loading your queries..." />
          </div>
        ) : queries.length === 0 ? (
          <Empty description="No queries submitted yet." />
        ) : (
          <Table
            columns={columns}
            dataSource={queries}
            rowKey="id"
            pagination={false}
          />
        )}
      </Card>

      <Modal
        title="Submit a Query"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please enter a subject.' }]}
          >
            <Input placeholder="e.g. Incorrect HDR supervision hours" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Details"
            rules={[{ required: true, message: 'Please describe the issue.' }]}
          >
            <TextArea rows={4} placeholder="Describe the issue with your workload allocation..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Submit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}