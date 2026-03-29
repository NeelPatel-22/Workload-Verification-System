import { Form, Input, Button, Card, Typography, Alert, Select } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const ROLE_REDIRECTS = {
  staff: '/staff/workload',
  hod: '/hod/dashboard',
  hos: '/admin/dashboard',
  operations: '/admin/dashboard',
};

const DEMO_ACCOUNTS = [
  { label: 'Academic Staff – Dummy 01 (CSSE)', value: 'dummy01' },
  { label: 'Academic Staff – Dummy 14 (Physics, T:R issue)', value: 'dummy14' },
  { label: 'Head of Department – CSSE', value: 'hod.csse' },
  { label: 'Head of Department – Mathematics', value: 'hod.maths' },
  { label: 'Head of Department – Physics', value: 'hod.physics' },
  { label: 'Head of School', value: 'hos' },
  { label: 'School Operations', value: 'ops' },
];

export default function LoginPage() {
  const [error, setError] = useState('');
  const [form] = Form.useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleDemoSelect(username) {
    form.setFieldsValue({ username, password: 'password' });
  }

  function handleSubmit(values) {
    const result = login(values.username, values.password);
    if (result.success) {
      const redirect = ROLE_REDIRECTS[result.user.role] || '/';
      navigate(redirect);
    } else {
      setError('Invalid username or password.');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #003087 0%, #0057b8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <Card style={{ width: '100%', maxWidth: 420, borderRadius: 12 }} variant="borderless">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#003087',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <UserOutlined style={{ fontSize: 28, color: '#fff' }} />
          </div>
          <Title level={3} style={{ margin: 0 }}>Workload Verification System</Title>
          <Text type="secondary">UWA – PMC School Operations</Text>
        </div>

        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
        )}

        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Quick fill (demo only):</Text>
          <Select
            placeholder="Select a demo account"
            style={{ width: '100%', marginTop: 4 }}
            onChange={handleDemoSelect}
            options={DEMO_ACCOUNTS}
            allowClear
          />
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please enter your username.' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password.' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large">
              Log In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
