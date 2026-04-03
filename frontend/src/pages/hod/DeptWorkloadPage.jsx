import { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Space, Progress, Spin } from 'antd';

import { useAuth } from '../../context/AuthContext';

import { MOCK_WORKLOAD, MOCK_VALIDATION_ISSUES } from '../../mock/mockData';

const { Title, Text } = Typography;

export default function DeptWorkloadPage() {
  const { currentUser } = useAuth();

  const[loading, setLoading] = useState(true);
  const[workload, setWorkload] = useState([]);
  const[issues, setIssues] = useState([]);

  useEffect(() => {
    const fetchData = async() => {
      setLoading(true);

      try{
        await new Promise((resolve) => setTimeout(resolve, 500));

        setWorkload(MOCK_WORKLOAD);
        setIssues(MOCK_VALIDATION_ISSUES);
      }catch(error){
        console.error('Error fetching data:', error)
      }finally{
        setLoading(false)
      }
    };

    fetchData();
  }, [])

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
        hasDiscrepancy ? (
          <Tag color="warning">T:R Discrepancy</Tag>
        ) : (
          <Tag color="success">Valid</Tag>
        ),
    },
  ];

  //adding spinner
  if(loading){
    if (loading) {
      return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <Spin size="large" description='Loading department workload...' />
        </div>
      );
    }
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>{currentUser.department} – Workload Overview</Title>
        <Text type="secondary">{deptWorkload.length} staff member(s) · {deptIssues.length} issue(s) detected</Text>
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
