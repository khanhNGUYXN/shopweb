import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import './LoginPage.css';

interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  authenticated: boolean;
}

interface DecodedToken {
  roles: string[];
  // Các trường khác nếu cần
}

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        const isAdminOrEmployee = decoded.roles?.some(role => role === 'ROLE_ADMIN' || role === 'ROLE_EMPLOYEE');
        const redirectPath = isAdminOrEmployee ? '/admin' : (localStorage.getItem('redirectAfterLogin') || '/account');
        navigate(redirectPath);
      } catch (err) {
        console.error('Lỗi giải mã token:', err);
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json() as { data: LoginResponseData; message?: string };

      if (!response.ok || !result.data?.authenticated) {
        setError(result.message || 'Đăng nhập thất bại');
      } else {
        // Lưu token vào localStorage
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        console.log('Đăng nhập thành công');

        // Giải mã token để lấy roles và chuyển hướng dựa theo role
        const decoded: DecodedToken = jwtDecode(result.data.accessToken);
        const isAdminOrEmployee = decoded.roles?.some(role => role === 'ROLE_ADMIN' || role === 'ROLE_EMPLOYEE');
        const redirectPath = isAdminOrEmployee ? '/admin' : (localStorage.getItem('redirectAfterLogin') || '/account');
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      }
    } catch (err) {
      console.error('Lỗi khi đăng nhập:', err);
      setError('Đăng nhập thất bại, vui lòng thử lại');
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h1>Đăng nhập</h1>
        <div className="under-line" />
      </div>
      <div className="login-right">
        <form onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-wrapper">
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="error">{error}</div>}
          <div className="action-row">
            <button type="submit" className="btn-login">
              ĐĂNG NHẬP
            </button>
            <div className="links">
              <a href="/forgot-password">Quên mật khẩu?</a>
              <span> hoặc </span>
              <a href="/register">Đăng ký</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
