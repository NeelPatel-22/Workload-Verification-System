import { Card, Table, Typography, Space, Button, Divider } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { MOCK_WORKLOAD } from '../../mock/mockData';

const { Title, Text } = Typography;

export default function ReportsPage() {
  const summaryColumns = [
    { title: 'Staff Member', dataIndex: 'name', key: 'name' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'FTE', dataIndex: 'fte', key: 'fte', width: 70 },
    { title: 'Teaching (%)', dataIndex: 'teaching', key: 'teaching', render: (v) => `${v}%` },
    { title: 'HDR (%)', dataIndex: 'hdSupervision', key: 'hdSupervision', render: (v) => `${v}%` },
    { title: 'Research (%)', dataIndex: 'research', key: 'research', render: (v) => `${v}%` },
    { title: 'Service (%)', dataIndex: 'service', key: 'service', render: (v) => `${v}%` },
    { title: 'Roles (%)', dataIndex: 'assignedRole', key: 'assignedRole', render: (v) => `${v}%` },
    { title: 'Total (%)', dataIndex: 'total', key: 'total', render: (v) => <Text strong>{v}%</Text> },
  ];

  function handleExportPDF() {
    window.print();
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Workload Summary Report</Title>
          <Text type="secondary">2026 Academic Year · PMC School</Text>
        </div>
        <Button icon={<DownloadOutlined />} onClick={handleExportPDF}>
          Export PDF
        </Button>
      </div>

      <Card id="report-content">
        <div style={{ marginBottom: 16 }}>
          <Text strong>School: </Text><Text>PMC (Physics, Maths, Computer Science)</Text>
          <Divider style={{ margin: '12px 0' }} />
        </div>
        <Table
          columns={summaryColumns}
          dataSource={MOCK_WORKLOAD}
          rowKey="staffId"
          pagination={false}
          size="middle"
          summary={(data) => {
            const avgTotal = (data.reduce((s, r) => s + r.total, 0) / data.length).toFixed(1);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={8}>
                  <Text strong>School Average Total Workload</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8}>
                  <Text strong>{avgTotal}%</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </Space>
  );
}
