import { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Space, Progress, Spin, Alert } from 'antd';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

export default function DeptWorkloadPage() {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [workload, setWorkload] = useState([]);
  const [issues, setIssues] = useState([]);
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
          fetch(`${import.meta.env.VITE_API_URL}/api/workloads`, {
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

        const [workloadData, issuesData] = await Promise.all([
          workloadRes.json(),
          issuesRes.json(),
        ]);

        if (!workloadRes.ok) {
          throw new Error(workloadData.message || 'Failed to load workload.');
        }
        if (!issuesRes.ok) {
          throw new Error(issuesData.message || 'Failed to load validation issues.');
        }

        setWorkload(Array.isArray(workloadData) ? workloadData : []);
        setIssues(Array.isArray(issuesData) ? issuesData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Unable to load department workload.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const deptWorkload = workload.filter((w) => w.department === currentUser.department);
  const deptIssues = issues.filter((i) => i.department === currentUser.department);

  const columns = [
    { title: 'Staff Member', dataIndex: 'name', key: 'name' },
    {
      title: 'FTE',
      dataIndex: 'fte',
      key: 'fte',
      width: 70,
      render: (fte) => `${fte}`,
    },
    {
      title: 'Teaching (%)',
      dataIndex: 'teaching',
      key: 'teaching',
      render: (v) => <Progress percent={v} size="small" strokeColor="#003087" />,
    },
    { title: 'Research (%)', dataIndex: 'research', key: 'research', render: (v) => `${v}%` },
    { title: 'HDR (%)', dataIndex: 'hdSupervision', key: 'hdSupervision', render: (v) => `${v}%` },
    { title: 'Total (%)', dataIndex: 'total', key: 'total', render: (v) => `${v}%` },
    {
      title: 'Status',
      dataIndex: 'hasDiscrepancy',
      key: 'hasDiscrepancy',
      render: (hasDiscrepancy) =>
        hasDiscrepancy ? <Tag color="warning">T:R Discrepancy</Tag> : <Tag color="success">Valid</Tag>,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <Spin size="large" tip="Loading department workload..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Unable to load department workload"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>{currentUser.department} – Workload Overview</Title>
        <Text type="secondary">
          {deptWorkload.length} staff member(s) · {deptIssues.length} issue(s) detected
        </Text>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={deptWorkload}
          rowKey="staffId"
          pagination={false}
          size="middle"
        />
      </Card>
    </Space>
  );
}