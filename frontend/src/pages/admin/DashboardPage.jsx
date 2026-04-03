import {useState, useEffect} from 'react';

import { Card, Row, Col, Statistic, Table, Tag, Typography, Space, Alert, Spin } from 'antd';
import {
  TeamOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

//mock data that will be replaced by api
import { MOCK_WORKLOAD, MOCK_QUERIES, MOCK_VALIDATION_ISSUES } from '../../mock/mockData';

const { Title, Text } = Typography;

export default function AdminDashboardPage() {
  //this will hold api data instead of mock data
  const [loading, setLoading] = useState(true);

  const[workload, setWorkload] = useState([]);
  const[queries, setQueries] = useState([]);
  const[validationIssues, setValidationIssues] = useState([]);

  //later it will be a call to real api
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        //remove later when backend is ready(call api here)
        await new Promise((resolve) => setTimeout(resolve, 600));

        //replace with real api response later
        setWorkload(MOCK_WORKLOAD);
        setQueries(MOCK_QUERIES);
        setValidationIssues(MOCK_VALIDATION_ISSUES);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  const pendingQueries = MOCK_QUERIES.filter((q) => q.status === 'pending');
  const resolvedQueries = MOCK_QUERIES.filter((q) => q.status !== 'pending');

  //for table
  const recentColumns = [
    { title: 'Staff Member', dataIndex: 'staffName', key: 'staffName' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
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

  //ui waits for api(mock data for now)
  if(loading){
    return(
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Spin size="large" tip="Loading dashboard..."/>
      </div>
    )
  }

  //main ui
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>School Overview – Dashboard</Title>
        <Text type="secondary">2026 Academic Year</Text>
      </div>

      {/*warning alert*/}
      {validationIssues.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`${validationIssues.length} validation issue(s) detected across the school.`}
        />
      )}

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Staff" 
              value={workload.length} 
              prefix={<TeamOutlined />} 
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Validation Issues"
              value={validationIssues.length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: validationIssues.length > 0 ? '#faad14' : '#52c41a' }}
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
              value={resolvedQueries.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="All Queries">
        <Table
          columns={recentColumns}
          dataSource={queries}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </Space>
  );
}
