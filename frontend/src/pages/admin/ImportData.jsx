import { Card, Typography, Space, Alert } from 'antd';

const { Title, Text } = Typography;

export default function ImportData() {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>Import Data</Title>
        <Text type="secondary">Upload and import workload source files</Text>
      </div>

      <Alert
        type="info"
        showIcon
        message="Import feature not connected yet"
        description="The backend import endpoint has not been implemented yet. This page is reserved for the next stage of development."
      />

      <Card>
        <Text>
          Planned next-stage functionality:
        </Text>
        <ul style={{ marginTop: 12 }}>
          <li>Upload workload source spreadsheets</li>
          <li>Validate file structure and required fields</li>
          <li>Parse and store imported data</li>
          <li>Display import summary and errors</li>
        </ul>
      </Card>
    </Space>
  );
}