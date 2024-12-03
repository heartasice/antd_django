### 项目概览

* **后端**：Django REST Framework
* **前端**：React 和 TypeScript
* **状态管理**：Redux
* **UI 库**：Ant Design
* **样式预处理**：Sass
* **跨域问题**：使用 `django-cors-headers`

### 1. 设置 Django 后端

#### 1.1 环境准备

确保你已经安装了 Python 和 pip。使用 pyenv 或其他工具管理 Python 版本。

#### 1.2 创建 Django 项目

创建项目目录：

bash

**Copy**

```
mkdir my_django_react_app
cd my_django_react_app
```

创建并进入 backend 目录：

bash

**Copy**

```
mkdir backend
cd backend
```

创建 `requirements.txt` 文件，内容如下：

**Copy**

```
django
djangorestframework
djangorestframework-simplejwt
django-cors-headers
drf-yasg
```

安装依赖：

bash

**Copy**

```
pip install -r requirements.txt
```

创建 Django 项目：

bash

**Copy**

```
django-admin startproject config .
```

创建 Django 应用：

bash

**Copy**

```
python manage.py startapp myapp
```

#### 1.3 配置 Django 设置

编辑 `config/settings.py`：

python

**Copy**

```
INSTALLED_APPS = [
    ...
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_yasg',
    'myapp',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # 要放在其他中间件之前
    ...
]

CORS_ALLOW_ALL_ORIGINS = True  # 仅在开发时使用，生产环境中应限制为特定域名
```

如果希望只允许特定来源，可以使用：

python

**Copy**

```
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

创建 API 视图：在 `myapp/views.py` 中添加以下代码：

python

**Copy**

```
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        token = AccessToken.for_user(user)
        return Response({'access': str(token)}, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def home_view(request):
    return Response({'message': 'Welcome to the API!'}, status=status.HTTP_200_OK)
```

配置 URL 路由：在 `myapp/urls.py` 中添加：

python

**Copy**

```
from django.urls import path
from .views import login_view, home_view

urlpatterns = [
    path('login/', login_view, name='login'),
    path('home/', home_view, name='home'),
]
```

在 `config/urls.py` 中包含应用的 URL：

python

**Copy**

```
from django.contrib import admin
from django.urls import path, include
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="My API",
      default_version='v1',
      description="API documentation",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@myapi.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('myapp.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
```

#### 1.4 创建管理员用户

在 backend 目录中运行以下命令创建管理员用户：

bash

**Copy**

```
python manage.py createsuperuser
```

#### 1.5 迁移数据库并启动服务器

迁移数据库：

bash

**Copy**

```
python manage.py migrate
```

运行开发服务器：

bash

**Copy**

```
python manage.py runserver
```

访问 [[http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)] 登录后台，访问 [[http://127.0.0.1:8000/swagger/](http://127.0.0.1:8000/swagger/)] 查看 API 文档。

### 2. 设置 React 前端

#### 2.1 创建 React 项目

在项目根目录下创建前端项目：

bash

**Copy**

```
npx create-react-app frontend --template typescript
cd frontend
```

#### 2.2 安装依赖

在 frontend 目录下，运行以下命令安装所需依赖，包括 Sass：

bash

**Copy**

```
npm install axios react-redux @reduxjs/toolkit react-router-dom antd node-sass
```

#### 2.3 创建 Redux Slice

在 `src/features/` 目录中创建 `authSlice.ts` 文件，内容如下：

typescript

**Copy**

```
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    token: string | null;
    isLoggedIn: boolean;
}

const initialState: AuthState = {
    token: null,
    isLoggedIn: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<string>) {
            state.token = action.payload;
            state.isLoggedIn = true;
        },
        logout(state) {
            state.token = null;
            state.isLoggedIn = false;
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
```

#### 2.4 配置 Redux Store

在 `src/app/` 目录中创建 `store.ts` 文件，内容如下：

typescript

**Copy**

```
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
```

#### 2.5 创建 API 请求模块

在 `src/api/` 目录中创建 `auth.ts` 文件，专门处理与认证相关的请求，内容如下：

typescript

**Copy**

```
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

export const loginUser = async (username: string, password: string) => {
    const response = await axios.post(`${API_URL}/login/`, { username, password });
    return response.data;
};

export const fetchHomeData = async (token: string) => {
    const response = await axios.get(`${API_URL}/home/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
```

#### 2.6 创建登录和首页组件

在 `src/components/` 目录中创建 `LoginPage.tsx` 和 `HomePage.tsx` 文件。

**LoginPage.tsx**：

typescript

**Copy**

```
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import { Input, Button, message } from 'antd';
import { loginUser } from '../api/auth';

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

    return (
        <div style={{ padding: '20px' }}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ marginBottom: '10px' }}
                />
                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ marginBottom: '10px' }}
                />
                <Button type="primary" htmlType="submit">Login</Button>
            </form>
        </div>
    );
};

export default LoginPage;
```

**HomePage.tsx**：

typescript

**Copy**

```
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { fetchHomeData } from '../api/auth';
import { message } from 'antd';

const HomePage: React.FC = () => {
    const [homeMessage, setHomeMessage] = useState('');
    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchHomeData(token!);
                setHomeMessage(data.message);
            } catch (error) {
                message.error('Failed to fetch data');
            }
        };

        if (token) {
            fetchData();
        }
    }, [token]);

    return (
        <div>
            <h2>Home Page</h2>
            <p>{homeMessage}</p>
        </div>
    );
};

export default HomePage;
```

#### 2.7 设置路由和 Redux Provider

在 `src/App.tsx` 中配置路由和 Redux Provider：

typescript

**Copy**

```
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './app/store';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import 'antd/dist/reset.css';  // 确保样式路径正确

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/home" element={<HomePage />} />
                </Routes>
            </Router>
        </Provider>
    );
};

export default App;
```

#### 2.8 创建 `index.tsx`

在 `src/index.tsx` 中添加以下内容：

typescript

**Copy**

```
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```

#### 2.9 启动 React 应用

在 frontend 目录下，运行以下命令启动 React 开发服务器：

bash

**Copy**

```
npm start
```

### 3. 测试和调试

#### 3.1 Django 测试用例

在 `myapp/tests.py` 中添加测试用例：

python

**Copy**

```
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

class UserTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')

    def test_login(self):
        url = reverse('login')
        data = {'username': 'testuser', 'password': 'testpassword'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_login_invalid(self):
        url = reverse('login')
        data = {'username': 'testuser', 'password': 'wrongpassword'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
```

运行 Django 测试：

bash

**Copy**

```
python manage.py test myapp
```

#### 3.2 React 测试用例

在 `src/components/` 目录中创建 `LoginPage.test.tsx` 文件，内容如下：

typescript

**Copy**

```
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from './LoginPage';
import { Provider } from 'react-redux';
import store from '../app/store';

test('renders login form', () => {
    render(
        <Provider store={store}>
            <LoginPage />
        </Provider>
    );

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
});

test('submits login form', () => {
    render(
        <Provider store={store}>
            <LoginPage />
        </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'testpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // 这里可以添加进一步的断言，例如检查是否导航到主页等
});
```

运行 React 测试：

bash

**Copy**

```
npm test
```

### 4. 项目结构

以下是项目的整体结构：

stylus

**Copy**

```
my_django_react_app/
│
├── backend/
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── myapp/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── auth.ts
    │   ├── app/
    │   │   └── store.ts
    │   ├── features/
    │   │   └── authSlice.ts
    │   ├── components/
    │   │   ├── LoginPage.tsx
    │   │   ├── LoginPage.test.tsx
    │   │   └── HomePage.tsx
    │   ├── index.tsx
    │   └── App.tsx
    ├── package.json
    └── tsconfig.json
```

### 总结

以上是完整的 Django 和 React 项目搭建指南，包含了 `drf-yasg` 的配置和测试用例的使用说明。确保按照步骤配置，运行应用并进行测试。如果有任何问题，请随时询问！
