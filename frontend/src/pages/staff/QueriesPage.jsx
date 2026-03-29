import { Card, Table, Tag, Typography, Button, Modal, Form, Input, Space, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MOCK_QUERIES } from '../../mock/mockData';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_COLORS = {
  pending: 'orange',
  approved: 'green',
  declined: 'red',
};

export default function StaffQueriesPage() {
  const { currentUser } = useAuth();
  const [queries, setQueries] = useState(
    MOCK_QUERIES.filter((q) => q.staffId === currentUser.id)
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  function handleSubmit(values) {
    const newQuery = {
      id: Date.now(),
      staffId: currentUser.id,
      staffName: currentUser.name,
      department: currentUser.department,
      subject: values.subject,
      message: values.message,
      status: 'pending',
      submittedAt: new Date().toISOString().slice(0, 10),
      hodComment: null,
    };
    setQueries((prev) => [...prev, newQuery]);
    form.resetFields();
    setModalOpen(false);
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

      <Card>
        {queries.length === 0 ? (
          <Empty description="No queries submitted yet." />
        ) : (
          <Table columns={columns} dataSource={queries} rowKey="id" pagination={false} />
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
              <Button type="primary" htmlType="submit">Submit</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
