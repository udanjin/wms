import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Avatar, Dropdown, Space, message } from 'antd';
import { HomeOutlined, AppstoreOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';

import './index.css'; // Pastikan file ini ada dan berisi style dasar

import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Inventory from './pages/inventory';
import PrivateRoute from './components/privateRoute';
import { AuthContext } from './context/authContext'; // Asumsi Anda punya AuthContext

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

// Komponen baru untuk menampung layout utama dan logika navigasi
const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); // Untuk mendapatkan path saat ini

  const handleLogout = () => {
    if (logout) {
      logout();
      message.success('You have been logged out.');
    }
    navigate('/login');
  };

  const menuItems = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: 'Dashboard', // Label saja, navigasi ditangani onClick
      onClick: () => navigate('/')
    },
    {
      key: '2',
      icon: <AppstoreOutlined />,
      label: 'Inventory', // Label saja, navigasi ditangani onClick
      onClick: () => navigate('/inventory')
    },
  ];

  const getCurrentSelectedKey = () => {
    const currentPath = location.pathname;
    if (currentPath.startsWith('/inventory')) return ['2'];
    if (currentPath.startsWith('/')) return ['1'];
    return ['1']; // Default ke Dashboard
  };

  const userMenuItems = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile (Not Implemented)
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  if (!user) {
    // Jika tidak ada user, hanya render Routes untuk halaman publik seperti Login
    // atau redirect ke login jika mencoba akses halaman private (ditangani PrivateRoute)
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <PrivateRoute> 
            {/* Ini akan mengarahkan ke login jika tidak ada user */}
            <></> 
          </PrivateRoute>
        } />
      </Routes>
    );
  }

  // Jika ada user, render layout lengkap
  return (
    <Layout style={{ minHeight: '100vh' }} className="app-layout">
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        theme="dark"
      >
        <RouterLink to="/" style={{ textDecoration: 'none' }}>
          <div style={{
            height: '32px',
            margin: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            WMS
          </div>
        </RouterLink>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getCurrentSelectedKey()}
          items={menuItems}
        />
      </Sider>
      <Layout className="layout-with-sider">
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
          className="app-header"
        >
          <RouterLink to="/" style={{ textDecoration: 'none' }}>
            <Title level={3} style={{ margin: 0, color: '#001529', cursor: 'pointer' }}>
              Warehouse Management
            </Title>
          </RouterLink>
          <Dropdown overlay={userMenuItems} trigger={['click']}>
            <a onClick={e => e.preventDefault()} href="!#" style={{ display: 'inline-block' }}>
              <Space>
                <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                <span style={{ color: '#595959', fontWeight: 500 }}>{user.data?.name || user.name || 'User'}</span>
              </Space>
            </a>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 0, // Padding akan diatur oleh div di dalamnya
            minHeight: 280,
          }}
          className="app-content"
        >
          <div className="site-layout-background" style={{ padding: 24, minHeight: '100%' }}>
            <Routes>
              {/* Rute Login tidak perlu di sini lagi jika sudah ditangani di atas */}
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
              {/* Tambahkan rute lain di sini jika ada */}
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

// Komponen App sekarang hanya merender Router dan MainLayout
function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

export default App;
