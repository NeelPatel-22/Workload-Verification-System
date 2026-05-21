import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Card,
  Table,
  Typography,
  Space,
  Button,
  Divider,
  Spin,
  Alert,
  Select,
  message,
} from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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

export default function ReportsPage() {
  const { currentUser } = useAuth();
  const reportRef = useRef(null);

  const currentYear = new Date().getFullYear();

  const yearOptions = useMemo(
    () =>
      [
        currentYear,
        currentYear - 1,
        currentYear - 2,
        currentYear - 3,
        currentYear - 4,
      ].map((year) => ({
        label: `${year} workload`,
        value: year,
      })),
    [currentYear]
  );

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [workload, setWorkload] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReportData = async () => {
      if (!currentUser?.username) {
        setLoading(false);
        setError('No logged-in user found.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `${API_URL}/api/workloads?workloadYear=${selectedYear}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-user': currentUser.username,
            },
          }
        );

        const contentType = response.headers.get('content-type') || '';

        if (!contentType.includes('application/json')) {
          throw new Error(
            'Backend did not return JSON. Please check that the backend is running on http://localhost:5000.'
          );
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load report data.');
        }

        setWorkload(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load report data:', error);
        setError(error.message || 'Unable to load report data.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [currentUser, selectedYear]);

  const summaryColumns = [
    {
      title: 'Staff Member',
      dataIndex: 'name',
      key: 'name',
      width: 190,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 130,
    },
    {
      title: 'FTE',
      dataIndex: 'fte',
      key: 'fte',
      width: 70,
    },
    {
      title: 'Teaching',
      key: 'teaching',
      render: (_, record) => (
        <>
          <Text>{record.teaching}%</Text>
          <br />
          <Text type="secondary">
            {calculateHours(record.teaching, record.fte)} hrs
          </Text>
        </>
      ),
    },
    {
      title: 'HDR',
      key: 'hdSupervision',
      render: (_, record) => (
        <>
          <Text>{record.hdSupervision}%</Text>
          <br />
          <Text type="secondary">
            {calculateHours(record.hdSupervision, record.fte)} hrs
          </Text>
        </>
      ),
    },
    {
      title: 'Research',
      key: 'research',
      render: (_, record) => (
        <>
          <Text>{record.research}%</Text>
          <br />
          <Text type="secondary">
            {calculateHours(record.research, record.fte)} hrs
          </Text>
        </>
      ),
    },
    {
      title: 'Service',
      key: 'service',
      render: (_, record) => (
        <>
          <Text>{record.service}%</Text>
          <br />
          <Text type="secondary">
            {calculateHours(record.service, record.fte)} hrs
          </Text>
        </>
      ),
    },
    {
      title: 'Roles',
      key: 'assignedRole',
      render: (_, record) => (
        <>
          <Text>{record.assignedRole}%</Text>
          <br />
          <Text type="secondary">
            {calculateHours(record.assignedRole, record.fte)} hrs
          </Text>
        </>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (value) => <Text strong>{value}%</Text>,
    },
  ];

  async function handleExportPDF() {
    if (!reportRef.current) {
      message.error('Report content was not found.');
      return;
    }

    if (workload.length === 0) {
      message.warning('There is no report data to export.');
      return;
    }

    try {
      setExporting(true);

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      const imageData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 8;
      const usableWidth = pageWidth - margin * 2;
      const imageHeight = (canvas.height * usableWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = margin;

      pdf.addImage(imageData, 'PNG', margin, position, usableWidth, imageHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imageHeight + margin;
        pdf.addImage(imageData, 'PNG', margin, position, usableWidth, imageHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      pdf.save(`workload-summary-report-${selectedYear}.pdf`);
      message.success('PDF exported successfully.');
    } catch (error) {
      console.error('PDF export failed:', error);
      message.error('PDF export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Spin size="large" description="Generating report..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Unable to load report"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  const avgTotal = workload.length
    ? (
        workload.reduce((sum, record) => sum + Number(record.total || 0), 0) /
        workload.length
      ).toFixed(1)
    : 0;

  const discrepancyCount = workload.filter((record) => record.hasDiscrepancy).length;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Workload Summary Report
          </Title>
          <Text type="secondary">
            {selectedYear} Academic Year · PMC School
          </Text>
        </div>

        <Space>
          <div>
            <Text type="secondary">Workload year</Text>
            <br />
            <Select
              value={selectedYear}
              options={yearOptions}
              onChange={setSelectedYear}
              style={{ width: 180 }}
            />
          </div>

          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportPDF}
            loading={exporting}
          >
            Export PDF
          </Button>
        </Space>
      </div>

      {workload.length === 0 && (
        <Alert
          type="info"
          showIcon
          message={`No report data found for ${selectedYear}.`}
          description="Upload a workload spreadsheet for this year from the Import Data page."
        />
      )}

      <Card>
        <div
          id="report-content"
          ref={reportRef}
          style={{
            background: '#ffffff',
            padding: 24,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <Title level={4} style={{ marginBottom: 4 }}>
              Workload Summary Report
            </Title>

            <Text strong>School: </Text>
            <Text>PMC (Physics, Maths, Computer Science)</Text>
            <br />

            <Text strong>Academic Year: </Text>
            <Text>{selectedYear}</Text>
            <br />

            <Text strong>Total Staff Records: </Text>
            <Text>{workload.length}</Text>
            <br />

            <Text strong>T:R Discrepancies: </Text>
            <Text>{discrepancyCount}</Text>
            <br />

            <Text strong>Average Total Workload: </Text>
            <Text>{avgTotal}%</Text>

            <Divider style={{ margin: '12px 0' }} />
          </div>

          <Table
            columns={summaryColumns}
            dataSource={workload}
            rowKey={(record) => `${record.importBatchId || 'demo'}-${record.staffId}`}
            pagination={false}
            size="middle"
            scroll={{ x: 1200 }}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={8}>
                  <Text strong>School Average Total Workload</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8}>
                  <Text strong>{avgTotal}%</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </div>
      </Card>
    </Space>
  );
}