import { Card, Table, Typography, Alert, Button, Descriptions, Space, Spin } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

export default function StaffWorkloadPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [workload, setWorkload] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        const [workloadRes, issuesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/workloads/my`, {
            headers: {
              'Content-Type': 'application/json',
              'x-user': currentUser.username,
            },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/validation-issues/my`, {
            headers: {
              'Content-Type': 'application/json',
              'x-user': currentUser.username,
            },
          }),
        ]);

        if (!workloadRes.ok) {
          const workloadErr = await workloadRes.json().catch(() => ({}));
          throw new Error(workloadErr.message || 'Failed to load workload data.');
        }

        if (!issuesRes.ok) {
          const issuesErr = await issuesRes.json().catch(() => ({}));
          throw new Error(issuesErr.message || 'Failed to load validation issues.');
        }

        const workloadData = await workloadRes.json();
        const issuesData = await issuesRes.json();

        setWorkload(workloadData);
        setIssues(Array.isArray(issuesData) ? issuesData : []);
      } catch (err) {
        console.error('Failed to load workload page data:', err);
        setError(err.message || 'Unable to load workload data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" tip="Loading workload..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Unable to load workload"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  if (!workload) {
    return (
      <Alert
        message="No workload data found for your account."
        type="info"
        showIcon
      />
    );
  }

  const tableData = [
    { key: '1', category: 'Teaching', value: workload.teaching ?? 0, unit: '%' },
    { key: '2', category: 'HDR Supervision', value: workload.hdSupervision ?? 0, unit: '%' },
    { key: '3', category: 'Research', value: workload.research ?? 0, unit: '%' },
    { key: '4', category: 'Service & Citizenship', value: workload.service ?? 0, unit: '%' },
    { key: '5', category: 'Assigned Roles', value: workload.assignedRole ?? 0, unit: '%' },
    { key: '6', category: 'External Engagement', value: workload.externalEngagement ?? 0, unit: '%' },
  ];

  const columns = [
    { title: 'Category', dataIndex: 'category', key: 'category' },
    {
      title: 'Allocation',
      dataIndex: 'value',
      key: 'value',
      render: (val, record) => `${val} ${record.unit}`,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>My Workload</Title>
        <Text type="secondary">2026 Academic Year</Text>
      </div>

      {issues.length > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message={`${issues.length} validation issue(s) detected in your workload data.`}
          description="Please review and submit a query if any allocation is incorrect."
          action={
            <Button size="small" onClick={() => navigate('/staff/queries')}>
              Submit a Query
            </Button>
          }
        />
      )}

      <Card style={{ marginTop: 16 }}>
        <Descriptions bordered size="small" column={2} title="Staff Information">
          <Descriptions.Item label="Name">{workload.name}</Descriptions.Item>
          <Descriptions.Item label="Department">{workload.department}</Descriptions.Item>
          <Descriptions.Item label="FTE">{workload.fte}</Descriptions.Item>
          <Descriptions.Item label="Total Workload">{workload.total}%</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Workload Breakdown" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          size="middle"
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>
                <Text strong>Total</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <Text strong>{workload.total} %</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>

      {issues.length > 0 && (
        <Card title="Validation Issues" style={{ marginTop: 16 }}>
          {issues.map((issue) => (
            <Alert
              key={issue.id}
              type={issue.severity === 'error' ? 'error' : 'warning'}
              showIcon
              message={issue.type}
              description={issue.description}
              style={{ marginBottom: 8 }}
            />
          ))}
        </Card>
      )}
    </Space>
  );
}