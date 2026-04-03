import { useEffect, useState } from 'react';

import { Card, Row, Col, Statistic, Table, Tag, Typography, Space, Alert, Spin } from 'antd';
import {
  TeamOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

import { useAuth } from '../../context/AuthContext';

//mock data
import { MOCK_WORKLOAD, MOCK_QUERIES, MOCK_VALIDATION_ISSUES } from '../../mock/mockData';

const { Title, Text } = Typography;

export default function HodDashboardPage() {
  const { currentUser } = useAuth();

  const[workload, setWorkload] = useState([]);
  const[queries, setQueries] = useState([]);
  const[issues, setIssues] = useState([]);
  const[loading, setLoading] = useState(true);

  //need api call here
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try{
        await new Promise((resolve) => setTimeout(resolve, 500));

        setWorkload(MOCK_WORKLOAD);
        setQueries(MOCK_QUERIES);
        setIssues(MOCK_VALIDATION_ISSUES);  
      }catch(error){
        console.error('Error fetching dashboard data:', error);
      }finally{
        setLoading(false);
      }
    };

    fetchData();
}, []);

  //using state instead of mock data
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

  //loading data-spinner
  if(loading){
    return(
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    )
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
            <Statistic
              title="Staff Members"
              value={deptWorkload.length}
              prefix={<TeamOutlined />}
            />
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
