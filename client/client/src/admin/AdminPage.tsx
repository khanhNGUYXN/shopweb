import React, { useState } from 'react';
import { Link, Outlet} from 'react-router-dom';
import './AdminPage.css'; // Đảm bảo đã tạo file CSS cho style của Admin
import { useNavigate } from 'react-router-dom';
const AdminPage: React.FC = () => {
  const [isDropdownAddProductOpen, setIsDropdownAddProductOpen] = useState(false); // Dropdown cho "Thêm Sản Phẩm"
  const navigate = useNavigate();

  // Hàm toggle dropdown cho "Thêm Sản Phẩm"
  const toggleDropdownAddProduct = () => {
    setIsDropdownAddProductOpen(!isDropdownAddProductOpen);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      } else {
        console.error('Logout failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Quản Lý Admin</h2>
        <ul>
          {/* Danh Sách Sản Phẩm */}
          <li>
            <Link to="/admin/all-products">Danh Sách Sản Phẩm</Link>
          </li>

          {/* Thêm Sản Phẩm */}
          <li>
            <button onClick={toggleDropdownAddProduct}>
              Thêm Sản Phẩm
              <span>{isDropdownAddProductOpen ? '▼' : '▶'}</span> {/* Mũi tên thay đổi khi nhấn */}
            </button>
            {isDropdownAddProductOpen && (
              <ul>
                <li><Link to="/admin/add-category">Thêm Category</Link></li>
                <li><Link to="/admin/add-product">Thêm Sản Phẩm Mới</Link></li>
              </ul>
            )}
          </li>

          {/* Các mục khác */}
          <li>
            <Link to="/admin/orders">Quản Lý Đơn Hàng</Link>
          </li>
          <li>
            <Link to="/admin/manager">Quản Lý Tài Khoản User</Link>
          </li>
          <li>
            <Link to="#" onClick={handleLogout}>Đăng Xuất</Link>
          </li>
        </ul>
      </div>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminPage;




