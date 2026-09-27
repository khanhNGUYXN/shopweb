// src/components/MenuOverlay.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import './MenuOverlay.css';

interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  message: string;
  data: Category[];
}

interface JwtPayload {
  username: string;
  // Các thuộc tính khác nếu cần
}

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuOverlay: React.FC<MenuOverlayProps> = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch danh mục từ API khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8080/categories/all');
        if (!response.ok) {
          throw new Error('Lỗi khi fetch danh mục');
        }
        const json: ApiResponse = await response.json();
        setCategories(json.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Giải mã token bằng jwt-decode và lấy username
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setUsername(decoded.username || null);
      } catch (error) {
        console.error('Error decoding token:', error);
        setUsername(null);
      }
    } else {
      setUsername(null);
    }
  }, []);

  // Handler cho nút đăng nhập
  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <>
      {isOpen && <div className="menu-overlay-bg" onClick={onClose}></div>}

      <div className={`menu-overlay ${isOpen ? 'menu-overlay--open' : ''}`}>
        <div className="menu-overlay-header">
          <h3>MENU</h3>
          <button className="menu-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <ul className="menu-list">
          {categories.length > 0 ? (
            categories.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/danh-muc/${encodeURIComponent(category.name)}`}
                  onClick={onClose}
                >
                  {category.name}
                </Link>
              </li>
            ))
          ) : (
            <li>Không có danh mục</li>
          )}
        </ul>
        {/* Phần hiển thị user */}
        <div className="menu-user">
          {username ? (
            <>
              <span className="user-icon">
                <img
                  src="https://png.pngtree.com/png-clipart/20200701/original/pngtree-black-default-avatar-png-image_5407174.jpg"
                  alt="User"
                />
              </span>
              <span className="user-name">{username}</span>
            </>
          ) : (
            <button className="btn" onClick={handleLogin}>
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MenuOverlay;
