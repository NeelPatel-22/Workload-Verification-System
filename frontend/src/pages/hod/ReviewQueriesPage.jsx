import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Select,
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

export default function ReviewQueriesPage() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [decision, setDecision] = useState("resolved");
  const [comment, setComment] = useState("");

  const currentUser = getCurrentUser();

  async function loadQueries() {
    try {
      setLoading(true);
      setError("");

      if (!currentUser?.username) {
        throw new Error("No logged-in user found.");
      }

      const response = await fetch(`${API_URL}/api/queries`, {
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
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openReviewModal(record) {
    setSelectedQuery(record);
    setDecision(record.status === "rejected" ? "rejected" : "resolved");
    setComment(record.hodComment || "");
    setModalOpen(true);
    setError("");
  }

  function closeReviewModal() {
    setSelectedQuery(null);
    setDecision("resolved");
    setComment("");
    setModalOpen(false);
  }

  async function saveDecision() {
    try {
      if (!selectedQuery) return;

      if (decision === "rejected" && !comment.trim()) {
        message.warning("Please provide a comment when rejecting a query.");
        return;
      }

      if (!currentUser?.username) {
        throw new Error("No logged-in user found.");
      }

      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/queries/${selectedQuery.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user": currentUser.username,
          },
          body: JSON.stringify({
            status: decision,
            hodComment: comment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update query.");
      }

      message.success("Query updated successfully.");
      closeReviewModal();
      await loadQueries();
    } catch (err) {
      setError(err.message || "Failed to update query.");
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    {
      title: "Staff Member",
      dataIndex: "staffName",
      key: "staffName",
      render: (value) => value || "-",
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
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
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button onClick={() => openReviewModal(record)}>Review</Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          Review Queries
        </Title>
        <Text type="secondary">
          Manage correction requests from staff in your department.
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

      <Card>
        {queries.length === 0 && !loading ? (
          <Empty description="No queries found" />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={queries}
            loading={loading}
            pagination={{ pageSize: 8 }}
          />
        )}
      </Card>

      <Modal
        title="Review Query"
        open={modalOpen}
        onCancel={closeReviewModal}
        footer={[
          <Button key="cancel" onClick={closeReviewModal}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={saving}
            onClick={saveDecision}
          >
            Save Decision
          </Button>,
        ]}
      >
        {selectedQuery && (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Card size="small">
              <Text strong>{selectedQuery.staffName}</Text>
              <br />
              <Text type="secondary">{selectedQuery.submittedAt}</Text>
              <p style={{ marginTop: 12, marginBottom: 0 }}>
                {selectedQuery.message}
              </p>
            </Card>

            <Form layout="vertical">
              <Form.Item label="Decision" required>
                <Select
                  value={decision}
                  onChange={setDecision}
                  options={[
                    {
                      value: "resolved",
                      label: "Approve",
                    },
                    {
                      value: "rejected",
                      label: "Reject",
                    },
                  ]}
                />
              </Form.Item>

              <Form.Item label="Comment (required if declining)">
                <TextArea
                  rows={4}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Add a comment for the staff member"
                />
              </Form.Item>
            </Form>
          </Space>
        )}
      </Modal>
    </div>
  );
}