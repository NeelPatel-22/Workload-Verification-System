import { useState, useEffect } from 'react';

import { Card, Table, Tag, Typography, Space, Select, Spin } from 'antd';

//mock data
import { MOCK_WORKLOAD } from '../../mock/mockData';

const { Title, Text } = Typography;

export default function SchoolWorkloadPage() {
  //adding more states to make ui-backend ready
  const[loading, setLoading] = useState(true);
  const[workload, setWorkload] = useState([]);
  const [deptFilter, setDeptFilter] = useState('All');

  //mock api call
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        await new Promise((res) => setTimeout(res, 500));

        //add api response later
        setWorkload(MOCK_WORKLOAD);
      } catch (error) {
        console.error('Failed to load workload:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  //derived data
  const departments = ['All', ...new Set(workload.map((w) => w.department))];

  const filtered = 
    deptFilter === 'All'
    ? workload
    : workload.filter((w) => w.department === deptFilter);

  //table config
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

  //spinmer
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Spin size="large" tip="Loading workload..." />
      </div>
    );
  }

  //ui
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>School Workload Overview</Title>
          <Text type="secondary">{filtered.length} staff member(s) shown</Text>
        </div>

        {/*department filter; no need to change after api integration*/}
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
