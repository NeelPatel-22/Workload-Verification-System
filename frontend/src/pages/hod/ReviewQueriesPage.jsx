import { Card, Table, Tag, Typography, Button, Modal, Form, Input, Space, Select, Spin } from 'antd';

import { useState, useEffect } from 'react';

import { useAuth } from '../../context/AuthContext';

import { MOCK_QUERIES } from '../../mock/mockData';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_COLORS = { pending: 'orange', approved: 'green', declined: 'red' };

export default function ReviewQueriesPage() {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        //currently we filter by department, replace with api call
        setQueries(
          MOCK_QUERIES.filter(
            (q) => q.department === currentUser.department
          )
        );
      } catch (error) {
        console.error('Error fetching queries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser.department]);

  //open modal for review
  function openReview(query) {
    setSelectedQuery(query);
    form.setFieldsValue({ status: query.status, hodComment: query.hodComment || '' });
  }

  //save updated data
  function handleSubmit(values) {
    setQueries((prev) =>
      prev.map((q) =>
        q.id === selectedQuery.id
          ? { ...q, status: values.status, hodComment: values.hodComment }
          : q
      )
    );
    setSelectedQuery(null);
    form.resetFields();
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
        <Spin size="large" description='Loading queries...'/>
      </div>
    );
  }

  //main ui
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>Review Queries</Title>
        <Text type="secondary">Manage correction requests from your department</Text>
      </div>

      {/*table component*/}
      <Card>
        <Table columns={columns} dataSource={queries} rowKey="id" pagination={false} size="middle" locale={{ emptyText: 'No queries found' }} />
      </Card>

      {/*modal review component*/}
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

            {/*review form*/}
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
                  <Button type="primary" htmlType="submit">Save Decision</Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </Space>
  );
}
