import { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Space, Select, Spin, Alert } from 'antd';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

export default function SchoolWorkloadPage() {
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [workload, setWorkload] = useState([]);
  const [deptFilter, setDeptFilter] = useState('All');
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
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/workloads`,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-user': currentUser.username,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load workload data.');
        }

        setWorkload(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load workload:', err);
        setError(err.message || 'Unable to load workload data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const departments = ['All', ...new Set(workload.map((w) => w.department).filter(Boolean))];

  const filtered =
    deptFilter === 'All'
      ? workload
      : workload.filter((w) => w.department === deptFilter);

  const columns = [
    { title: 'Staff Member', dataIndex: 'name', key: 'name' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'FTE', dataIndex: 'fte', key: 'fte', width: 70 },
    {
      title: 'Teaching (%)',
      dataIndex: 'teaching',
      key: 'teaching',
      render: (v) => `${v}%`,
    },
    {
      title: 'Research (%)',
      dataIndex: 'research',
      key: 'research',
      render: (v) => `${v}%`,
    },
    {
      title: 'HDR (%)',
      dataIndex: 'hdSupervision',
      key: 'hdSupervision',
      render: (v) => `${v}%`,
    },
    {
      title: 'Service (%)',
      dataIndex: 'service',
      key: 'service',
      render: (v) => `${v}%`,
    },
    {
      title: 'Total (%)',
      dataIndex: 'total',
      key: 'total',
      render: (v) => `${v}%`,
    },
    {
      title: 'Status',
      dataIndex: 'hasDiscrepancy',
      key: 'hasDiscrepancy',
      render: (hasDiscrepancy) =>
        hasDiscrepancy ? (
          <Tag color="warning">T:R Discrepancy</Tag>
        ) : (
          <Tag color="success">Valid</Tag>
        ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Spin size="large" tip="Loading workload..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Unable to load school workload"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>School Workload Overview</Title>
          <Text type="secondary">{filtered.length} staff member(s) shown</Text>
        </div>

        <Select
          value={deptFilter}
          onChange={setDeptFilter}
          style={{ width: 200 }}
          options={departments.map((d) => ({ label: d, value: d }))}
        />
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="staffId"
          pagination={false}
          size="middle"
        />
      </Card>
    </Space>
  );
}