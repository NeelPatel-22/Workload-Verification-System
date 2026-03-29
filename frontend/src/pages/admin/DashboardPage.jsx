import { Card, Row, Col, Statistic, Table, Tag, Typography, Space, Alert } from 'antd';
import {
  TeamOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { MOCK_WORKLOAD, MOCK_QUERIES, MOCK_VALIDATION_ISSUES } from '../../mock/mockData';

const { Title, Text } = Typography;

export default function AdminDashboardPage() {
  const pendingQueries = MOCK_QUERIES.filter((q) => q.status === 'pending');

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

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>School Overview – Dashboard</Title>
        <Text type="secondary">2026 Academic Year</Text>
      </div>

      {MOCK_VALIDATION_ISSUES.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`${MOCK_VALIDATION_ISSUES.length} validation issue(s) detected across the school.`}
        />
      )}

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Staff" value={MOCK_WORKLOAD.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Validation Issues"
              value={MOCK_VALIDATION_ISSUES.length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: MOCK_VALIDATION_ISSUES.length > 0 ? '#faad14' : '#52c41a' }}
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
              value={MOCK_QUERIES.filter((q) => q.status !== 'pending').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="All Queries">
        <Table
          columns={recentColumns}
          dataSource={MOCK_QUERIES}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </Space>
  );
}
