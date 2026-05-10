import { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Space, Select, Spin, Alert } from 'antd';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const ANNUAL_HOURS_PER_FTE = 1600;

function calculateHours(percent, fte = 1) {
  return Math.round(((Number(percent) || 0) / 100) * ANNUAL_HOURS_PER_FTE * (Number(fte) || 1));
}

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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workloads`, {
          headers: {
            'Content-Type': 'application/json',
            'x-user': currentUser.username,
          },
        });

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

  const enhancedWorkload = workload.map((w) => ({
    ...w,
    teachingHours: calculateHours(w.teaching, w.fte),
    researchHours: calculateHours(w.research, w.fte),
    hdrHours: calculateHours(w.hdSupervision, w.fte),
    serviceHours: calculateHours(w.service, w.fte),
    roleHours: calculateHours(w.assignedRole, w.fte),
    totalHours: calculateHours(w.total, w.fte),
  }));

  const departments = ['All', ...new Set(enhancedWorkload.map((w) => w.department).filter(Boolean))];

  const filtered =
    deptFilter === 'All'
      ? enhancedWorkload
      : enhancedWorkload.filter((w) => w.department === deptFilter);

  const columns = [
    { title: 'Staff Member', dataIndex: 'name', key: 'name', fixed: 'left', width: 150 },
    { title: 'Department', dataIndex: 'department', key: 'department', width: 130 },
    { title: 'FTE', dataIndex: 'fte', key: 'fte', width: 70 },
    {
      title: 'Teaching',
      key: 'teaching',
      render: (_, r) => (
        <>
          <Text>{r.teaching}%</Text>
          <br />
          <Text type="secondary">{r.teachingHours} hrs</Text>
        </>
      ),
    },
    {
      title: 'Research',
      key: 'research',
      render: (_, r) => (
        <>
          <Text>{r.research}%</Text>
          <br />
          <Text type="secondary">{r.researchHours} hrs</Text>
        </>
      ),
    },
    {
      title: 'HDR',
      key: 'hdr',
      render: (_, r) => (
        <>
          <Text>{r.hdSupervision}%</Text>
          <br />
          <Text type="secondary">{r.hdrHours} hrs</Text>
        </>
      ),
    },
    {
      title: 'Service',
      key: 'service',
      render: (_, r) => (
        <>
          <Text>{r.service}%</Text>
          <br />
          <Text type="secondary">{r.serviceHours} hrs</Text>
        </>
      ),
    },
    {
      title: 'Roles',
      key: 'roles',
      render: (_, r) => (
        <>
          <Text>{r.assignedRole ?? 0}%</Text>
          <br />
          <Text type="secondary">{r.roleHours} hrs</Text>
        </>
      ),
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, r) => (
        <>
          <Text strong>{r.total}%</Text>
          <br />
          <Text type="secondary">{r.totalHours} hrs</Text>
        </>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'hasDiscrepancy',
      key: 'hasDiscrepancy',
      width: 150,
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
          <Text type="secondary">
            {filtered.length} staff member(s) shown · Estimated on {ANNUAL_HOURS_PER_FTE} hours per 1.0 FTE
          </Text>
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
          scroll={{ x: 1200 }}
        />
      </Card>
    </Space>
  );
}