import React from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import { Input, Button, message, Card, Form } from 'antd';
import { loginUser } from '../api/auth';
import '../styles/LoginPage.scss';  // 确保样式文件正确导入

const LoginPage: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (values: { username: string; password: string }) => {
        try {
            const data = await loginUser(values.username, values.password);
            dispatch(login(data.access));
            navigate('/home');
        } catch (error) {
            message.error('Login failed. Please check your credentials.');
        }
    };

    const handleRegister = () => {
        navigate('/register');
    };

    return (
        <div className="login-container">
            <Card className="login-card">
                <h2 className="login-title">Login</h2>
                <Form onFinish={handleLogin}>
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input
                            type="text"
                            placeholder="Enter your username"
                            autoComplete="off"  // 去掉自动填充
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="off"  // 去掉自动填充
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Login
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button type="link" onClick={handleRegister} className="login-button">
                            Register
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;