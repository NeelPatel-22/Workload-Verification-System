import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import {
  InboxOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { getImportReport, uploadExcelFile } from "../../api/importApi";

const { Title, Text } = Typography;
const { Dragger } = Upload;

function severityColor(severity) {
  if (severity === "error") return "red";
  if (severity === "warning") return "orange";
  return "blue";
}

function detectYearFromFilename(fileName) {
  const match = String(fileName || "").match(/\b(20\d{2})\b/);

  if (!match) return null;

  const year = Number.parseInt(match[1], 10);
  const currentYear = new Date().getFullYear();

  if (year < 2000 || year > currentYear + 1) {
    return null;
  }

  return year;
}

export default function ImportData() {
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

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [uploading, setUploading] = useState(false);
  const [loadingReport, setLoadingReport] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const loadReport = useCallback(async (yearToLoad = selectedYear) => {
    try {
      setLoadingReport(true);
      setError("");

      const data = await getImportReport(yearToLoad);

      setReport(data);
    } catch (err) {
      setReport(null);
      setError(err.message || "Could not load import report.");
    } finally {
      setLoadingReport(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    let cancelled = false;

    async function loadReportForSelectedYear() {
      try {
        setLoadingReport(true);
        setError("");

        const data = await getImportReport(selectedYear);

        if (!cancelled) {
          setReport(data);
        }
      } catch (err) {
        if (!cancelled) {
          setReport(null);
          setError(err.message || "Could not load import report.");
        }
      } finally {
        if (!cancelled) {
          setLoadingReport(false);
        }
      }
    }

    loadReportForSelectedYear();

    return () => {
      cancelled = true;
    };
  }, [selectedYear]);

  async function handleUpload() {
    if (!selectedFile) {
      message.warning("Please select an Excel file first.");
      return;
    }

    if (!selectedYear) {
      message.warning("Please select a workload year.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      await uploadExcelFile(selectedFile, selectedYear);

      message.success(`Excel import completed for ${selectedYear}.`);
      setSelectedFile(null);

      await loadReport(selectedYear);
    } catch (err) {
      setError(err.message || "Excel import failed.");
      message.error(err.message || "Excel import failed.");
    } finally {
      setUploading(false);
    }
  }

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".xlsm,.xlsx,.xls",
    beforeUpload: (file) => {
      setSelectedFile(file);

      const detectedYear = detectYearFromFilename(file.name);

      if (detectedYear) {
        setSelectedYear(detectedYear);
        message.info(`Detected workload year ${detectedYear} from file name.`);
      }

      return false;
    },
    onRemove: () => {
      setSelectedFile(null);
    },
    fileList: selectedFile ? [selectedFile] : [],
  };

  const latestImport = report?.latestImport;
  const workloads = report?.workloads || [];
  const validationIssues = report?.validationIssues || [];
  const issueSummary = report?.issueSummary || [];

  const issueColumns = [
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      width: 110,
      render: (value) => <Tag color={severityColor(value)}>{value}</Tag>,
      filters: [
        { text: "Error", value: "error" },
        { text: "Warning", value: "warning" },
      ],
      onFilter: (value, record) => record.severity === value,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 190,
    },
    {
      title: "Staff",
      dataIndex: "staffName",
      key: "staffName",
      width: 220,
      render: (value) => value || "-",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 140,
      render: (value) => value || "-",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 560,
    },
    {
      title: "Source Sheet",
      dataIndex: "sourceSheet",
      key: "sourceSheet",
      width: 220,
      render: (value) => value || "-",
    },
    {
      title: "Row",
      dataIndex: "sourceRow",
      key: "sourceRow",
      width: 110,
      render: (value, record) => {
        if (value) return value;

        if (record.sourceSheet === "Calculated Workload Summary") {
          return "System";
        }

        return "-";
      },
    },
  ];

  const issueSummaryColumns = [
    {
      title: "Issue Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      render: (value) => <Tag color={severityColor(value)}>{value}</Tag>,
    },
    {
      title: "Count",
      dataIndex: "count",
      key: "count",
    },
  ];

  const workloadColumns = [
    {
      title: "Staff",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 230,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 140,
    },
    {
      title: "FTE",
      dataIndex: "fte",
      key: "fte",
      width: 80,
    },
    {
      title: "Teaching",
      dataIndex: "teaching",
      key: "teaching",
      width: 100,
    },
    {
      title: "Assigned Role",
      dataIndex: "assignedRole",
      key: "assignedRole",
      width: 130,
    },
    {
      title: "Service",
      dataIndex: "service",
      key: "service",
      width: 100,
    },
    {
      title: "HDR",
      dataIndex: "hdSupervision",
      key: "hdSupervision",
      width: 100,
    },
    {
      title: "Research",
      dataIndex: "research",
      key: "research",
      width: 100,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 90,
    },
    {
      title: "Target Band",
      dataIndex: "targetBand",
      key: "targetBand",
      width: 220,
    },
    {
      title: "Calculated Band",
      dataIndex: "calcBand",
      key: "calcBand",
      width: 230,
    },
    {
      title: "Discrepancy",
      dataIndex: "hasDiscrepancy",
      key: "hasDiscrepancy",
      width: 120,
      render: (value) =>
        value ? <Tag color="red">Yes</Tag> : <Tag color="green">No</Tag>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          Import Data
        </Title>
        <Text type="secondary">
          Upload Excel workload source files, parse them into the database, and
          review validation issues by workload year.
        </Text>
      </div>

      {error && (
        <Alert
          type="error"
          message="Something went wrong"
          description={error}
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Card title="Upload and View Workload Data" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Text strong>Workload year</Text>
            <br />
            <Text type="secondary">
              Select the year this spreadsheet belongs to. The import summary,
              validation issues, and workload records below will also update to
              this selected year.
            </Text>

            <Select
              value={selectedYear}
              options={yearOptions}
              onChange={(year) => {
                setSelectedYear(year);
              }}
              style={{ width: 220, display: "block", marginTop: 8 }}
            />
          </div>

          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag the Excel file here to upload
            </p>
            <p className="ant-upload-hint">
              Accepted file types: .xlsm, .xlsx, .xls
            </p>
          </Dragger>

          <Space>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              loading={uploading}
              disabled={!selectedFile}
              onClick={handleUpload}
            >
              Import Excel File
            </Button>

            <Button
              icon={<ReloadOutlined />}
              loading={loadingReport}
              onClick={() => loadReport(selectedYear)}
            >
              Refresh Report
            </Button>
          </Space>
        </Space>
      </Card>

      <Spin spinning={loadingReport}>
        {!latestImport ? (
          <Alert
            type="info"
            message={`No import report found for ${selectedYear}`}
            description="Upload an Excel workbook for this workload year to generate an import report."
            showIcon
          />
        ) : (
          <>
            <Card
              title={`Import Summary for ${selectedYear}`}
              style={{ marginBottom: 24 }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Workload Year"
                    value={latestImport.workloadYear || selectedYear}
                    formatter={(value) => value}
                  />
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Staff Workloads Created"
                    value={latestImport.workloadCount || 0}
                  />
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Validation Issues"
                    value={latestImport.issueCount || 0}
                  />
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Staff Imported"
                    value={latestImport.staffCount || 0}
                  />
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Units Imported"
                    value={latestImport.unitCount || 0}
                  />
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Teaching Rows"
                    value={latestImport.teachingRowCount || 0}
                  />
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="HDR Rows"
                    value={latestImport.hdrRowCount || 0}
                  />
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Statistic
                    title="Assigned Role Rows"
                    value={latestImport.assignedRoleRowCount || 0}
                  />
                </Col>
              </Row>

              <Divider />

              <Space direction="vertical" size={4}>
                <Text>
                  <strong>File:</strong> {latestImport.filename || "-"}
                </Text>

                <Text>
                  <strong>Uploaded by:</strong> {latestImport.uploadedBy || "-"}
                </Text>

                <Text>
                  <strong>Imported at:</strong>{" "}
                  {latestImport.importedAt
                    ? new Date(latestImport.importedAt).toLocaleString()
                    : "-"}
                </Text>

                <Text>
                  <strong>Status:</strong>{" "}
                  <Tag color="green">{latestImport.status || "completed"}</Tag>
                </Text>

                <Text>
                  <strong>Notes:</strong> {latestImport.notes || "-"}
                </Text>
              </Space>
            </Card>

            <Tabs
              defaultActiveKey="issues"
              items={[
                {
                  key: "issues",
                  label: `Validation Issues (${validationIssues.length})`,
                  children: (
                    <Table
                      rowKey={(record) =>
                        record.id ||
                        `${record.type}-${record.staffId}-${record.sourceRow}`
                      }
                      columns={issueColumns}
                      dataSource={validationIssues}
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 1500 }}
                    />
                  ),
                },
                {
                  key: "summary",
                  label: "Issue Summary",
                  children: (
                    <Table
                      rowKey={(record) => `${record.type}-${record.severity}`}
                      columns={issueSummaryColumns}
                      dataSource={issueSummary}
                      pagination={false}
                    />
                  ),
                },
                {
                  key: "workloads",
                  label: `Workloads (${workloads.length})`,
                  children: (
                    <Table
                      rowKey={(record) => record.id || record.staffId}
                      columns={workloadColumns}
                      dataSource={workloads}
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 1600 }}
                    />
                  ),
                },
              ]}
            />
          </>
        )}
      </Spin>
    </div>
  );
}