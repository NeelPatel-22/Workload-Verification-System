import { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Space, Progress, Spin, Alert } from 'antd';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const ANNUAL_HOURS_PER_FTE = 1600;

function calculateHours(percent, fte = 1) {
  return Math.round(((Number(percent) || 0) / 100) * ANNUAL_HOURS_PER_FTE * (Number(fte) || 1));
}

function PercentWithHours({ percent, fte }) {
  return (
    <>
      <Text>{percent ?? 0}%</Text>
      <br />
      <Text type="secondary">{calculateHours(percent, fte)} hrs</Text>
    </>
  );
}

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
    { title: 'Staff Member', dataIndex: 'name', key: 'name', width: 150 },
    {
      title: 'FTE',
      dataIndex: 'fte',
      key: 'fte',
      width: 70,
      render: (fte) => `${fte}`,
    },
    {
      title: 'Teaching',
      key: 'teaching',
      render: (_, r) => (
        <>
          <Progress
            percent={Number(r.teaching) || 0}
            size="small"
            strokeColor="#003087"
            style={{ marginBottom: 4 }}
          />
          <Text type="secondary">{calculateHours(r.teaching, r.fte)} hrs</Text>
        </>
      ),
    },
    {
      title: 'Research',
      key: 'research',
      render: (_, r) => <PercentWithHours percent={r.research} fte={r.fte} />,
    },
    {
      title: 'HDR',
      key: 'hdr',
      render: (_, r) => <PercentWithHours percent={r.hdSupervision} fte={r.fte} />,
    },
    {
      title: 'Service',
      key: 'service',
      render: (_, r) => <PercentWithHours percent={r.service} fte={r.fte} />,
    },
    {
      title: 'Roles',
      key: 'roles',
      render: (_, r) => <PercentWithHours percent={r.assignedRole} fte={r.fte} />,
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, r) => (
        <>
          <Text strong>{r.total}%</Text>
          <br />
          <Text type="secondary">{calculateHours(r.total, r.fte)} hrs</Text>
        </>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'hasDiscrepancy',
      key: 'hasDiscrepancy',
      width: 150,
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
          {deptWorkload.length} staff member(s) · {deptIssues.length} issue(s) detected · Estimated on {ANNUAL_HOURS_PER_FTE} hours per 1.0 FTE
        </Text>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={deptWorkload}
          rowKey="staffId"
          pagination={false}
          size="middle"
          scroll={{ x: 1200 }}
        />
      </Card>
    </Space>
  );
}