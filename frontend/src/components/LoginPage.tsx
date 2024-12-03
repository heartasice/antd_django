import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import { Input, Button, message, Card, Form } from 'antd';
import { loginUser } from '../api/auth';
import '../styles/LoginPage.scss';  // 导入样式文件

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await loginUser(username, password);
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
                    <Form.Item>
                        <Input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="off"  // 去掉自动填充
                        />
                    </Form.Item>
                    <Form.Item>
                        <Input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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