import { Card, Table, Tag, Typography, Alert, Button, Descriptions, Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MOCK_WORKLOAD, MOCK_VALIDATION_ISSUES } from '../../mock/mockData';

const { Title, Text } = Typography;

export default function StaffWorkloadPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const workload = MOCK_WORKLOAD.find((w) => w.staffId === currentUser.id);
  const issues = MOCK_VALIDATION_ISSUES.filter((i) => i.staffId === currentUser?.id);

  if (!workload) {
    return <Alert message="No workload data found for your account." type="info" showIcon />;
  }

  const tableData = [
    { key: '1', category: 'Teaching', value: workload.teaching, unit: '%' },
    { key: '2', category: 'HDR Supervision', value: workload.hdSupervision, unit: '%' },
    { key: '3', category: 'Research', value: workload.research, unit: '%' },
    { key: '4', category: 'Service & Citizenship', value: workload.service, unit: '%' },
    { key: '5', category: 'Assigned Roles', value: workload.assignedRole, unit: '%' },
    { key: '6', category: 'External Engagement', value: workload.externalEngagement, unit: '%' },
  ];

  const columns = [
    { title: 'Category', dataIndex: 'category', key: 'category' },
    {
      title: 'Allocation',
      dataIndex: 'value',
      key: 'value',
      render: (val, record) => `${val} ${record.unit}`,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>My Workload</Title>
        <Text type="secondary">2026 Academic Year</Text>
      </div>

      {issues.length > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message={`${issues.length} validation issue(s) detected in your workload data.`}
          description="Please review and submit a query if any allocation is incorrect."
          action={
            <Button size="small" onClick={() => navigate('/staff/queries')}>
              Submit a Query
            </Button>
          }
        />
      )}

      <Card>
        <Descriptions title="Staff Information" bordered size="small" column={2}>
          <Descriptions.Item label="Name">{workload.name}</Descriptions.Item>
          <Descriptions.Item label="Department">{workload.department}</Descriptions.Item>
          <Descriptions.Item label="FTE">{workload.fte}</Descriptions.Item>
          <Descriptions.Item label="Total Workload">{workload.total}%</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Workload Breakdown">
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          size="middle"
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}><Text strong>Total</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <Text strong>{workload.total} %</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>

      {issues.length > 0 && (
        <Card title="Validation Issues">
          {issues.map((issue) => (
            <Alert
              key={issue.id}
              type={issue.severity === 'error' ? 'error' : 'warning'}
              showIcon
              message={issue.type}
              description={issue.description}
              style={{ marginBottom: 8 }}
            />
          ))}
        </Card>
      )}
    </Space>
  );
}
