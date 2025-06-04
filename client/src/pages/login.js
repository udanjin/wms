// src/pages/Login.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tabs, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/authContext';

const { TabPane } = Tabs;

const Login = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogin = async (values) => {
    setLoading(true);
    try {
      await login(values);
      message.success('Login successful');
      navigate('/');
    } catch (error) {
      message.error('Login failed');
    }
    setLoading(false);
  };

  const onRegister = async (values) => {
    setLoading(true);
    try {
      await register(values);
      message.success('Registration successful');
      setActiveTab('login');
    } catch (error) {
      message.error('Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto' }}>
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Login" key="login">
            <Form onFinish={onLogin}>
              <Form.Item name="email" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} placeholder="Email" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Login
              </Button>
            </Form>
          </TabPane>
          <TabPane tab="Register" key="register">
            <Form onFinish={onRegister}>
              <Form.Item name="name" rules={[{ required: true }]}>
                <Input placeholder="Name" />
              </Form.Item>
              <Form.Item name="email" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} placeholder="Email" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
              </Form.Item>
              <Form.Item name="role" initialValue="staff">
                <Input disabled value="staff" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Register
              </Button>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;