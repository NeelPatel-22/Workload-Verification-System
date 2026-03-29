import { Card, Row, Col, Statistic, Table, Tag, Typography, Space, Alert } from 'antd';
import {
  TeamOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { MOCK_WORKLOAD, MOCK_QUERIES, MOCK_VALIDATION_ISSUES } from '../../mock/mockData';

const { Title, Text } = Typography;

export default function HodDashboardPage() {
  const { currentUser } = useAuth();

  const deptWorkload = MOCK_WORKLOAD.filter((w) => w.department === currentUser.department);
  const deptQueries = MOCK_QUERIES.filter((q) => q.department === currentUser.department);
  const deptIssues = MOCK_VALIDATION_ISSUES.filter((i) => i.department === currentUser.department);

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
