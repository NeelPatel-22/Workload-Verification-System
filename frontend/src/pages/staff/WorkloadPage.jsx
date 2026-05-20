import {
  Card,
  Table,
  Typography,
  Alert,
  Button,
  Descriptions,
  Space,
  Spin,
  Tag,
  Select,
} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const ANNUAL_HOURS_PER_FTE = 1600;

function calculateHours(percent, fte = 1) {
  return Math.round(
    ((Number(percent) || 0) / 100) *
      ANNUAL_HOURS_PER_FTE *
      (Number(fte) || 1)
  );
}

function formatPercent(value) {
  return `${Number(value || 0)}%`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

export default function StaffWorkloadPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [workload, setWorkload] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedWorkloadKey, setSelectedWorkloadKey] = useState('current');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.username) {
        setLoading(false);
        setError('No logged-in user found.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [workloadRes, historyRes] = await Promise.all([
          fetch(`${API_URL}/api/workloads/my`, {
            headers: {
              'Content-Type': 'application/json',
              'x-user': currentUser.username,
            },
          }),
          fetch(`${API_URL}/api/workloads/my/history?years=2`, {
            headers: {
              'Content-Type': 'application/json',
              'x-user': currentUser.username,
            },
          }),
        ]);

        if (!workloadRes.ok) {
          const workloadErr = await workloadRes.json().catch(() => ({}));
          throw new Error(workloadErr.message || 'Failed to load workload data.');
        }

        if (!historyRes.ok) {
          const historyErr = await historyRes.json().catch(() => ({}));
          throw new Error(historyErr.message || 'Failed to load workload history.');
        }

        const workloadData = await workloadRes.json();
        const historyData = await historyRes.json();

        setWorkload(workloadData);
        setIssues([]);
        setHistory(Array.isArray(historyData) ? historyData : []);
        setSelectedWorkloadKey('current');
      } catch (err) {
        console.error('Failed to load workload page data:', err);
        setError(err.message || 'Unable to load workload data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

useEffect(() => {
  async function fetchIssuesForSelectedWorkload() {
    if (!currentUser?.username || !workload) return;

    const selectedWorkload =
      selectedWorkloadKey === 'current'
        ? workload
        : history.find((item) => String(item.id) === String(selectedWorkloadKey)) ||
          workload;

    if (!selectedWorkload?.importBatchId) {
      setIssues([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/validation-issues/my?importBatchId=${selectedWorkload.importBatchId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-user': currentUser.username,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to load validation issues.');
      }

      const data = await response.json();
      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load validation issues:', err);
      setIssues([]);
    }
  }

  fetchIssuesForSelectedWorkload();
}, [currentUser, workload, history, selectedWorkloadKey]);
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" tip="Loading workload..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Unable to load workload"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  if (!workload) {
    return (
      <Alert
        message="No workload data found for your account."
        type="info"
        showIcon
      />
    );
  }

  const selectedWorkload =
    selectedWorkloadKey === 'current'
      ? workload
      : history.find((item) => String(item.id) === String(selectedWorkloadKey)) ||
        workload;

  const currentWorkloadYear =
    workload.workloadYear || new Date().getFullYear();

  const selectedWorkloadYear =
    selectedWorkload.workloadYear || currentWorkloadYear;

  const annualHours = Math.round(
    ANNUAL_HOURS_PER_FTE * (Number(selectedWorkload.fte) || 1)
  );

  const workloadOptions = [
    {
      value: 'current',
      label: `Current workload (${currentWorkloadYear})`,
    },
    ...history.map((item) => ({
      value: String(item.id),
      label: `Past workload (${item.workloadYear})`,
    })),
  ];

  const tableData = [
    {
      key: '1',
      category: 'Teaching',
      percent: selectedWorkload.teaching ?? 0,
      hours: calculateHours(selectedWorkload.teaching, selectedWorkload.fte),
    },
    {
      key: '2',
      category: 'HDR Supervision',
      percent: selectedWorkload.hdSupervision ?? 0,
      hours: calculateHours(selectedWorkload.hdSupervision, selectedWorkload.fte),
    },
    {
      key: '3',
      category: 'Research',
      percent: selectedWorkload.research ?? 0,
      hours: calculateHours(selectedWorkload.research, selectedWorkload.fte),
    },
    {
      key: '4',
      category: 'Service & Citizenship',
      percent: selectedWorkload.service ?? 0,
      hours: calculateHours(selectedWorkload.service, selectedWorkload.fte),
    },
    {
      key: '5',
      category: 'Assigned Roles',
      percent: selectedWorkload.assignedRole ?? 0,
      hours: calculateHours(selectedWorkload.assignedRole, selectedWorkload.fte),
    },
    {
      key: '6',
      category: 'External Engagement',
      percent: selectedWorkload.externalEngagement ?? 0,
      hours: calculateHours(
        selectedWorkload.externalEngagement,
        selectedWorkload.fte
      ),
    },
  ];

  const columns = [
    { title: 'Category', dataIndex: 'category', key: 'category' },
    {
      title: 'Allocation (%)',
      dataIndex: 'percent',
      key: 'percent',
      render: (val) => `${val}%`,
    },
    {
      title: 'Estimated Hours',
      dataIndex: 'hours',
      key: 'hours',
      render: (val) => `${val} hrs`,
    },
  ];

  const historyColumns = [
    {
      title: 'Year',
      dataIndex: 'workloadYear',
      key: 'workloadYear',
      width: 90,
      render: (value) => <Text strong>{value || '-'}</Text>,
    },
    {
      title: 'Teaching',
      dataIndex: 'teaching',
      key: 'teaching',
      render: formatPercent,
    },
    {
      title: 'Assigned Roles',
      dataIndex: 'assignedRole',
      key: 'assignedRole',
      render: formatPercent,
    },
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service',
      render: formatPercent,
    },
    {
      title: 'HDR',
      dataIndex: 'hdSupervision',
      key: 'hdSupervision',
      render: formatPercent,
    },
    {
      title: 'Research',
      dataIndex: 'research',
      key: 'research',
      render: formatPercent,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: formatPercent,
    },
    {
      title: 'T:R Status',
      dataIndex: 'hasDiscrepancy',
      key: 'hasDiscrepancy',
      render: (value) =>
        value ? <Tag color="red">Mismatch</Tag> : <Tag color="green">OK</Tag>,
    },
    {
      title: 'Imported',
      dataIndex: 'importedAt',
      key: 'importedAt',
      render: formatDate,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ margin: 0 }}>My Workload</Title>
        <Text type="secondary">
          Current workload: {currentWorkloadYear} Academic Year · Estimated on{' '}
          {ANNUAL_HOURS_PER_FTE} hours per 1.0 FTE
        </Text>
      </div>

      {issues.length > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message={`${issues.length} validation issue(s) detected in the selected workload data.`}
          description="Please review and submit a query if any allocation is incorrect."
          action={
            <Button size="small" onClick={() => navigate('/staff/queries')}>
              Submit a Query
            </Button>
          }
        />
      )}

      <Card title="View Workload by Year" style={{ marginTop: 16 }}>
        <Space direction="vertical" size={4}>
          <Text type="secondary">
            Select your current workload or one of the previous two workload years.
          </Text>

          <Select
            value={selectedWorkloadKey}
            style={{ width: 300 }}
            onChange={setSelectedWorkloadKey}
            options={workloadOptions}
          />
        </Space>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Descriptions
          bordered
          size="small"
          column={2}
          title={`Staff Information - ${selectedWorkloadYear}`}
        >
          <Descriptions.Item label="Name">{selectedWorkload.name}</Descriptions.Item>
          <Descriptions.Item label="Department">
            {selectedWorkload.department}
          </Descriptions.Item>
          <Descriptions.Item label="Workload Year">
            {selectedWorkloadYear}
          </Descriptions.Item>
          <Descriptions.Item label="FTE">{selectedWorkload.fte}</Descriptions.Item>
          <Descriptions.Item label="Estimated Annual Hours">
            {annualHours} hrs
          </Descriptions.Item>
          <Descriptions.Item label="Total Workload">
            {selectedWorkload.total}%
          </Descriptions.Item>
          <Descriptions.Item label="Total Allocated Hours">
            {calculateHours(selectedWorkload.total, selectedWorkload.fte)} hrs
          </Descriptions.Item>
          <Descriptions.Item label="Source File">
            {selectedWorkload.filename || 'Demo or latest imported workload'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={`Workload Breakdown - ${selectedWorkloadYear}`} style={{ marginTop: 16 }}>
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
                <Text strong>{selectedWorkload.total}%</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2}>
                <Text strong>
                  {calculateHours(selectedWorkload.total, selectedWorkload.fte)} hrs
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Card>

      <Card
        title="Past Workload History"
        extra={<Text type="secondary">Previous two workload years</Text>}
        style={{ marginTop: 16 }}
      >
        {history.length === 0 ? (
          <Alert
            type="info"
            showIcon
            message="No past workload history found yet."
            description="Historical records will appear here after previous-year workload spreadsheets are imported."
          />
        ) : (
          <Table
            rowKey={(record) =>
              `${record.workloadYear}-${record.importBatchId}-${record.staffId}`
            }
            columns={historyColumns}
            dataSource={history}
            pagination={false}
            scroll={{ x: 1000 }}
          />
        )}
      </Card>

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
    </Space>
  );
}