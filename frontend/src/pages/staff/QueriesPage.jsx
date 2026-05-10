import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";

const { Title, Text } = Typography;
const { TextArea } = Input;

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

function statusColor(status) {
  if (status === "resolved") return "green";
  if (status === "rejected") return "red";
  return "orange";
}

function statusLabel(status) {
  if (status === "resolved") return "RESOLVED";
  if (status === "rejected") return "REJECTED";
  return "PENDING";
}

export default function QueriesPage() {
  const [form] = Form.useForm();

  const [queries, setQueries] = useState([]);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentUser = getCurrentUser();

  async function loadMyQueries() {
    try {
      setLoadingQueries(true);
      setError("");

      if (!currentUser?.username) {
        throw new Error("No logged-in user found.");
      }

      const response = await fetch(`${API_URL}/api/queries/my`, {
        headers: {
          "x-user": currentUser.username,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load queries.");
      }

      setQueries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load queries.");
    } finally {
      setLoadingQueries(false);
    }
  }

  useEffect(() => {
    loadMyQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(values) {
    try {
      setSubmitting(true);
      setError("");

      if (!currentUser?.username) {
        throw new Error("No logged-in user found.");
      }

      const response = await fetch(`${API_URL}/api/queries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user": currentUser.username,
        },
        body: JSON.stringify({
          subject: values.subject,
          message: values.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit query.");
      }

      message.success("Query submitted successfully.");
      form.resetFields();

      await loadMyQueries();
    } catch (err) {
      setError(err.message || "Failed to submit query.");
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (value) => value || "-",
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (value) => value || "-",
    },
    {
      title: "Date",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (value) => value || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value) => (
        <Tag color={statusColor(value)}>{statusLabel(value)}</Tag>
      ),
    },
    {
      title: "HoD Comment",
      dataIndex: "hodComment",
      key: "hodComment",
      render: (value) => value || "-",
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          My Queries
        </Title>
        <Text type="secondary">
          Submit workload correction requests and track their review status.
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

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card title="Submit New Query">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Subject"
              name="subject"
              rules={[
                {
                  required: true,
                  message: "Please enter a subject.",
                },
              ]}
            >
              <Input placeholder="Example: Teaching allocation issue" />
            </Form.Item>

            <Form.Item
              label="Message"
              name="message"
              rules={[
                {
                  required: true,
                  message: "Please enter your query details.",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Describe the workload issue or correction request."
              />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={submitting}>
              Submit Query
            </Button>
          </Form>
        </Card>

        <Card title="My Queries">
          {queries.length === 0 && !loadingQueries ? (
            <Empty description="No queries submitted yet" />
          ) : (
            <Table
              rowKey="id"
              columns={columns}
              dataSource={queries}
              loading={loadingQueries}
              pagination={{ pageSize: 8 }}
            />
          )}
        </Card>
      </Space>
    </div>
  );
}