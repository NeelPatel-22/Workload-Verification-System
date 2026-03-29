import { Card, Table, Tag, Typography, Space, Select } from 'antd';
import { useState } from 'react';
import { MOCK_WORKLOAD } from '../../mock/mockData';

const { Title, Text } = Typography;

const DEPARTMENTS = ['All', ...new Set(MOCK_WORKLOAD.map((w) => w.department))];

export default function SchoolWorkloadPage() {
  const [deptFilter, setDeptFilter] = useState('All');

  const filtered = deptFilter === 'All'
    ? MOCK_WORKLOAD
    : MOCK_WORKLOAD.filter((w) => w.department === deptFilter);

  const columns = [
    { title: 'Staff Member', dataIndex: 'name', key: 'name' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'FTE', dataIndex: 'fte', key: 'fte', width: 70 },
    { title: 'Teaching (%)', dataIndex: 'teaching', key: 'teaching', render: (v) => `${v}%` },
    { title: 'Research (%)', dataIndex: 'research', key: 'research', render: (v) => `${v}%` },
    { title: 'HDR (%)', dataIndex: 'hdSupervision', key: 'hdSupervision', render: (v) => `${v}%` },
    { title: 'Service (%)', dataIndex: 'service', key: 'service', render: (v) => `${v}%` },
    { title: 'Total (%)', dataIndex: 'total', key: 'total', render: (v) => `${v}%` },
    {
      title: 'Status',
      dataIndex: 'hasDiscrepancy',
      key: 'hasDiscrepancy',
      render: (hasDiscrepancy) =>
        hasDiscrepancy ? <Tag color="warning">T:R Discrepancy</Tag> : <Tag color="success">Valid</Tag>,
    },
  ];

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
          options={DEPARTMENTS.map((d) => ({ label: d, value: d }))}
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
