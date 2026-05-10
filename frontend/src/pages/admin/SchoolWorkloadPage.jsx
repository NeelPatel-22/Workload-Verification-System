import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getCurrentUser() {
  const possibleKeys = [
    "wvs_current_user",
    "user",
    "currentUser",
    "authUser",
    "loggedInUser",
    "workloadUser",
  ];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);
    if (!value) continue;

    const parsed = safeParse(value);
    if (parsed?.username) return parsed;
    if (parsed?.user?.username) return parsed.user;
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    const parsed = safeParse(value);

    if (parsed?.username) return parsed;
    if (parsed?.user?.username) return parsed.user;
  }

  return null;
}

function formatNumber(value) {
  const number = Number(value || 0);
  return Number.isInteger(number) ? number : number.toFixed(2);
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export default function SchoolWorkloadPage() {
  const [workloads, setWorkloads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const currentUser = getCurrentUser();

  async function loadWorkloads() {
    try {
      setLoading(true);
      setError("");

      if (!currentUser?.username) {
        throw new Error("No logged-in user found.");
      }

      const response = await fetch(`${API_URL}/api/workloads`, {
        headers: {
          "x-user": currentUser.username,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load school workloads.");
      }

      setWorkloads(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load school workloads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkloads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const departmentOptions = useMemo(() => {
    const departments = Array.from(
      new Set(workloads.map((item) => item.department).filter(Boolean))
    ).sort();

    return [
      { value: "all", label: "All departments" },
      ...departments.map((department) => ({
        value: department,
        label: department,
      })),
    ];
  }, [workloads]);

  const filteredWorkloads = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    const normalizedSearch = normalizeSearchText(searchText);

    return workloads.filter((workload) => {
      const name = String(workload.name || "").toLowerCase();
      const normalizedName = normalizeSearchText(workload.name);

      const matchesName =
        !search && !normalizedSearch
          ? true
          : name.includes(search) || normalizedName.includes(normalizedSearch);

      const matchesDepartment =
        departmentFilter === "all"
          ? true
          : workload.department === departmentFilter;

      return matchesName && matchesDepartment;
    });
  }, [workloads, searchText, departmentFilter]);

  const summary = useMemo(() => {
    const totalStaff = filteredWorkloads.length;

    const totalTeaching = filteredWorkloads.reduce(
      (sum, item) => sum + Number(item.teaching || 0),
      0
    );

    const totalResearch = filteredWorkloads.reduce(
      (sum, item) => sum + Number(item.research || 0),
      0
    );

    const discrepancyCount = filteredWorkloads.filter(
      (item) => Number(item.hasDiscrepancy) === 1
    ).length;

    return {
      totalStaff,
      totalTeaching,
      totalResearch,
      discrepancyCount,
    };
  }, [filteredWorkloads]);

  const columns = [
    {
      title: "Academic Name",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 230,
      sorter: (a, b) => String(a.name || "").localeCompare(String(b.name || "")),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 140,
      filters: departmentOptions
        .filter((option) => option.value !== "all")
        .map((option) => ({
          text: option.label,
          value: option.value,
        })),
      onFilter: (value, record) => record.department === value,
    },
    {
      title: "FTE",
      dataIndex: "fte",
      key: "fte",
      width: 80,
      render: formatNumber,
      sorter: (a, b) => Number(a.fte || 0) - Number(b.fte || 0),
    },
    {
      title: "Teaching",
      dataIndex: "teaching",
      key: "teaching",
      width: 100,
      render: formatNumber,
      sorter: (a, b) => Number(a.teaching || 0) - Number(b.teaching || 0),
    },
    {
      title: "Assigned Role",
      dataIndex: "assignedRole",
      key: "assignedRole",
      width: 130,
      render: formatNumber,
      sorter: (a, b) =>
        Number(a.assignedRole || 0) - Number(b.assignedRole || 0),
    },
    {
      title: "Service",
      dataIndex: "service",
      key: "service",
      width: 100,
      render: formatNumber,
      sorter: (a, b) => Number(a.service || 0) - Number(b.service || 0),
    },
    {
      title: "HDR",
      dataIndex: "hdSupervision",
      key: "hdSupervision",
      width: 100,
      render: formatNumber,
      sorter: (a, b) =>
        Number(a.hdSupervision || 0) - Number(b.hdSupervision || 0),
    },
    {
      title: "Research",
      dataIndex: "research",
      key: "research",
      width: 100,
      render: formatNumber,
      sorter: (a, b) => Number(a.research || 0) - Number(b.research || 0),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 90,
      render: formatNumber,
      sorter: (a, b) => Number(a.total || 0) - Number(b.total || 0),
    },
    {
      title: "Target Band",
      dataIndex: "targetBand",
      key: "targetBand",
      width: 220,
      render: (value) => value || "-",
    },
    {
      title: "Calculated Band",
      dataIndex: "calcBand",
      key: "calcBand",
      width: 230,
      render: (value) => value || "-",
    },
    {
      title: "Discrepancy",
      dataIndex: "hasDiscrepancy",
      key: "hasDiscrepancy",
      width: 120,
      render: (value) =>
        Number(value) === 1 ? (
          <Tag color="red">Yes</Tag>
        ) : (
          <Tag color="green">No</Tag>
        ),
      filters: [
        { text: "Has discrepancy", value: 1 },
        { text: "No discrepancy", value: 0 },
      ],
      onFilter: (value, record) => Number(record.hasDiscrepancy) === value,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          School Workload
        </Title>
        <Text type="secondary">
          View and search academic workload records across the school.
        </Text>
      </div>

      {error && (
        <Alert
          type="error"
          message="Request issue"
          description={error}
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Academic Staff" value={summary.totalStaff} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Teaching Points"
              value={Number(summary.totalTeaching.toFixed(2))}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Research Points"
              value={Number(summary.totalResearch.toFixed(2))}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="T:R Discrepancies"
              value={summary.discrepancyCount}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginBottom: 16 }}
        >
          <Space wrap>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search academic by name, e.g. Dummy 14 or dummy14"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              style={{ width: 420 }}
            />

            <Select
              value={departmentFilter}
              onChange={setDepartmentFilter}
              options={departmentOptions}
              style={{ width: 220 }}
            />
          </Space>

          <Text type="secondary">
            Showing {filteredWorkloads.length} of {workloads.length} workload
            records
          </Text>
        </Space>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredWorkloads}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1600 }}
        />
      </Card>
    </div>
  );
}