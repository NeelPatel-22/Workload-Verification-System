import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Space, Alert, Spin } from 'antd';
import {
  TeamOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

export default function HodDashboardPage() {
  const { currentUser } = useAuth();

  const [workload, setWorkload] = useState([]);
  const [queries, setQueries] = useState([]);
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
        const [workloadRes, queriesRes, issuesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/workloads`, {
            headers: {
              'Content-Type': 'application/json',
              'x-user': currentUser.username,
            },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/queries`, {
            headers: {
              'Content-Type': 'application/json',
              'x-user': currentUser.username,
            },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/validation-issues`, {
            headers: {
              'Content-Type': 'application/json',
              'x-user': currentUser.username,
            },
          }),
        ]);

        const [workloadData, queriesData, issuesData] = await Promise.all([
          workloadRes.json(),
          queriesRes.json(),
          issuesRes.json(),
        ]);

        if (!workloadRes.ok) {
          throw new Error(workloadData.message || 'Failed to load workloads.');
        }
        if (!queriesRes.ok) {
          throw new Error(queriesData.message || 'Failed to load queries.');
        }
        if (!issuesRes.ok) {
          throw new Error(issuesData.message || 'Failed to load validation issues.');
        }

        setWorkload(Array.isArray(workloadData) ? workloadData : []);
        setQueries(Array.isArray(queriesData) ? queriesData : []);
        setIssues(Array.isArray(issuesData) ? issuesData : []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const deptWorkload = workload.filter((w) => w.department === currentUser.department);
  const deptQueries = queries.filter((q) => q.department === currentUser.department);
  const deptIssues = issues.filter((i) => i.department === currentUser.department);

  const pendingQueries = deptQueries.filter((q) => q.status === 'pending');

  const recentColumns = [
    { title: 'Staff Member', dataIndex: 'staffName', key: 'staffName' },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    { title: 'Date', dataIndex: 'submittedAt', key: 'submittedAt', width: 110 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => (
        <Tag color={s === 'pending' ? 'orange' : s === 'approved' ? 'green' : 'red'}>
          {s.toUpperCase()}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return <Alert message="Unable to load dashboard" description={error} type="error" showIcon />;
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>{currentUser.department} – Dashboard</Title>
        <Text type="secondary">Overview for your department</Text>
      </div>

      {pendingQueries.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`${pendingQueries.length} query(ies) pending your review.`}
        />
      )}

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Staff Members" value={deptWorkload.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Validation Issues"
              value={deptIssues.length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: deptIssues.length > 0 ? '#faad14' : '#52c41a' }}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Queries"
              value={pendingQueries.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: pendingQueries.length > 0 ? '#fa8c16' : '#52c41a' }}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Resolved Queries"
              value={deptQueries.filter((q) => q.status !== 'pending').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Queries">
        <Table
          columns={recentColumns}
          dataSource={deptQueries}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </Space>
  );
}