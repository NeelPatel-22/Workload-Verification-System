import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Sider, Content } = Layout;
const { Text } = Typography;

const MENU_ITEMS_BY_ROLE = {
  staff: [
    { key: '/staff/workload', icon: <FileTextOutlined />, label: 'My Workload' },
    { key: '/staff/queries', icon: <ExclamationCircleOutlined />, label: 'My Queries' },
  ],
  hod: [
    { key: '/hod/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/hod/workload', icon: <FileTextOutlined />, label: 'Department Workload' },
    { key: '/hod/queries', icon: <CheckSquareOutlined />, label: 'Review Queries' },
  ],
  hos: [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/workload', icon: <FileTextOutlined />, label: 'School Workload' },
    { key: '/admin/queries', icon: <ExclamationCircleOutlined />, label: 'All Queries' },
    { key: '/admin/reports', icon: <BarChartOutlined />, label: 'Reports' },
  ],
  operations: [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/workload', icon: <FileTextOutlined />, label: 'School Workload' },
    { key: '/admin/queries', icon: <ExclamationCircleOutlined />, label: 'All Queries' },
    { key: '/admin/reports', icon: <BarChartOutlined />, label: 'Reports' },
  ],
};

const ROLE_LABELS = {
  staff: 'Academic Staff',
  hod: 'Head of Department',
  hos: 'Head of School',
  operations: 'School Operations',
};

export default function AppLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = MENU_ITEMS_BY_ROLE[currentUser.role] || [];

  function handleMenuClick({ key }) {
    navigate(key);
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Log Out',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="dark" style={{ background: '#003087' }}>
        <div style={{
          padding: '20px 16px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: 8,
        }}>
          <Text style={{ color: '#fff', fontWeight: 700, fontSize: 14, display: 'block' }}>
            Workload Verification
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
            UWA – PMC School
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ background: '#003087', border: 'none' }}
        />
      </Sider>

      <Layout>
        <div style={{
          height: 64,
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          flexShrink: 0,
        }}>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ background: '#003087' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, lineHeight: '1.4', color: '#000' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>
                  {ROLE_LABELS[currentUser.role]}
                  {currentUser.department ? ` – ${currentUser.department}` : ''}
                </div>
              </div>
            </div>
          </Dropdown>
        </div>

        <Content style={{ padding: 24, background: '#f5f6fa' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
