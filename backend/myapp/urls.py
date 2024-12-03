from django.urls import path
from .views import login_view, home_view, register_view

urlpatterns = [
    path('login/', login_view, name='login'),
    path('home/', home_view, name='home'),
    path('register/', register_view, name='register'),  # 添加注册路由
]