import { Card, Table, Tag, Typography, Alert, Button, Descriptions, Space, Spin } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { useAuth } from '../../context/AuthContext';

import { MOCK_WORKLOAD, MOCK_VALIDATION_ISSUES } from '../../mock/mockData';

const { Title, Text } = Typography;

export default function StaffWorkloadPage() {
  const { currentUser } = useAuth();

  const navigate = useNavigate();

  const[workload, setWorkload] = useState([]);
  const[issues, setIssues] = useState([]);
  const[loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchData = async() => {
        setLoading(true);
  
        try{
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          //workload and issues for current user
          setWorkload(MOCK_WORKLOAD.find((w) => w.staffId === currentUser.id));
          setIssues(MOCK_VALIDATION_ISSUES.filter((i) => i.staffId === currentUser?.id));
        }catch(error){
          console.error('Failed to load workload data:', error);
        }finally{
          setLoading(false);
        }
      };
  
      fetchData();
  },[currentUser.id])

  //alert when there is no workload
  if (!loading && !workload) {
    return <Alert title="No workload data found for your account." type="info" showIcon />;
  }

  //workload breakdown data
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

      {/* Workload Section */}
      <div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin description="Loading workload..." size="large" />
          </div>
        ) : (
          <>
            {/*alert for validation issues*/}
            {issues.length > 0 && (
              <Alert
                type="warning"
                showIcon
                icon={<ExclamationCircleOutlined />}
                title={`${issues.length} validation issue(s) detected in your workload data.`}
                description="Please review and submit a query if any allocation is incorrect."
                action={
                  <Button size="small" onClick={() => navigate('/staff/queries')}>
                    Submit a Query
                  </Button>
                }
              />
            )}

            {/*current staff info*/}
            <Card style={{ marginTop: 16 }}>
              <Descriptions bordered size="small" column={2} title="Staff Information">
                <Descriptions.Item label="Name">{workload?.name}</Descriptions.Item>
                <Descriptions.Item label="Department">{workload?.department}</Descriptions.Item>
                <Descriptions.Item label="FTE">{workload?.fte}</Descriptions.Item>
                <Descriptions.Item label="Total Workload">{workload?.total}%</Descriptions.Item>
              </Descriptions>
            </Card>

            {/*current staff workload breakdown*/}
            <Card title="Workload Breakdown" style={{ marginTop: 16 }}>
              <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                size="middle"
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <Text strong>Total</Text>
                    </Table.Summary.Cell>

                    <Table.Summary.Cell index={1}>
                      <Text strong>{workload?.total} %</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
            </Card>

            {/*detected validation issues*/}
            {issues.length > 0 && (
              <Card title="Validation Issues" style={{ marginTop: 16 }}>
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
          </>
        )}
      </div>
    </Space>
  );
}
