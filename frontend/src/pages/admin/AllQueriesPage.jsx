import { Card, Table, Tag, Typography, Space } from 'antd';
import { MOCK_QUERIES } from '../../mock/mockData';

const { Title, Text } = Typography;

const STATUS_COLORS = { pending: 'orange', approved: 'green', declined: 'red' };

export default function AllQueriesPage() {
  const columns = [
    { title: 'Staff Member', dataIndex: 'staffName', key: 'staffName' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    { title: 'Message', dataIndex: 'message', key: 'message', ellipsis: true },
    { title: 'Date', dataIndex: 'submittedAt', key: 'submittedAt', width: 110 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => <Tag color={STATUS_COLORS[s]}>{s.toUpperCase()}</Tag>,
    },
    {
      title: 'HoD Response',
      dataIndex: 'hodComment',
      key: 'hodComment',
      render: (c) => c || <Text type="secondary">—</Text>,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>All Queries</Title>
        <Text type="secondary">View all correction requests across the school (read-only)</Text>
      </div>
      <Card>
        <Table columns={columns} dataSource={MOCK_QUERIES} rowKey="id" pagination={false} size="middle" />
      </Card>
    </Space>
  );
}
