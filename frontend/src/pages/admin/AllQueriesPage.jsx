import { useEffect, useState } from 'react';

import { Card, Table, Tag, Typography, Space, Spin } from 'antd';

//mock data for now
import { MOCK_QUERIES } from '../../mock/mockData';

const { Title, Text } = Typography;

const STATUS_COLORS = { pending: 'orange', approved: 'green', declined: 'red' };

export default function AllQueriesPage() {
  //used by api later
  const[loading, setLoading] = useState(true);
  const[queries, setQueries] = useState([]);

  //replace this with api call later
  useEffect(() => {
    const fetchQueries = async () => {
      setLoading(true);

      try {
        await new Promise((res) => setTimeout(res, 500));

        //replace with api response
        setQueries(MOCK_QUERIES);
      } catch (error) {
        console.error('Failed to load queries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueries();
  }, []);

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

  //spinner sections; will load automatically with api later
  if(loading){
    return(
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Spin size="large" tip="Loading queries..." />
      </div>
    )
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>All Queries</Title>
        <Text type="secondary">View all correction requests across the school (read-only)</Text>
      </div>

      {/*table section; data will come from api*/}
      <Card>
        <Table 
          columns={columns} 
          dataSource={queries} 
          rowKey="id" 
          pagination={false} 
          size="middle" 
        />
      </Card>
    </Space>
  );
}
