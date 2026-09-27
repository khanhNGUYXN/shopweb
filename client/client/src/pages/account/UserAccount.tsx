import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from "jwt-decode";
import "./UserAccount.css";
import EditProfilePage from "./EditProfilePage";
import ChangePasswordForm from "./ChangePassword";

// Định nghĩa interface cho Order, UserRole và User (theo dữ liệu API)
interface Order {
  id: number;
  fullname: string;
  email: string;
  phoneNumber: string;
  address: string;
  note: string;
  orderDate: string;
  status: number;
  totalMoney: number;
  shippingMethod: string;
  shippingAddress: string;
  shippingDate?: string | null;
  trackingNumber?: string | null;
  paymentMethod: string;
  active: boolean;
}

interface UserRole {
  id: {
    userId: number;
    roleId: number;
  };
  user: number;
  role: {
    id: number;
    name: string;
  }
}

interface User {
  id: number;
  username: string;
  full_name: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  dateOfBirth: string | null;
  orders: Order[];
  userRoles: UserRole[];
  active: boolean;
  phone_number: string | null;
  email: string;
}

interface TokenPayload {
  sub: string;
  roles: string[];
}

const UserAccount: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [hasOrders, setHasOrders] = useState<boolean>(false);
  // Sử dụng state view để chuyển đổi giữa các giao diện: "info", "editProfile", "changePassword"
  const [view, setView] = useState<"info" | "editProfile" | "changePassword">("info");

  const token = localStorage.getItem('accessToken') || '';

  // Hàm lấy roles từ token
  const getCurrentUserRoles = (): string[] => {
    if (!token) return [];
    try {
      const payload: TokenPayload = jwtDecode(token);
      return payload.roles;
    } catch (err) {
      console.error('Lỗi giải mã token:', err);
      return [];
    }
  };

  // Kiểm tra quyền truy cập: chỉ ROLE_USER mới được vào trang này
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const roles = getCurrentUserRoles();
    if (!roles.includes('ROLE_USER')) {
      // Nếu không có ROLE_USER, chuyển hướng về trang chủ hoặc trang không được phép truy cập
      alert("Bạn không có quyền truy cập trang tài khoản người dùng");
      navigate('/');
      return;
    }
  }, [token, navigate]);

  useEffect(() => {
    // Giải mã token để lấy username
    let decoded: any;
    try {
      decoded = jwtDecode(token);
    } catch (error) {
      console.error("Token không hợp lệ:", error);
      navigate('/login');
      return;
    }
    
    const username = decoded.sub;
    if (!username) {
      console.error("Không tìm thấy username trong token");
      navigate('/login');
      return;
    }

    // Gọi API để lấy thông tin user theo username
    fetch(`http://localhost:8080/users/username/${username}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Không thể lấy dữ liệu user");
        }
        return response.json();
      })
      .then(data => {
        setUser(data);
        setHasOrders(data.orders && data.orders.length > 0);
      })
      .catch(error => {
        console.error("Lỗi khi lấy dữ liệu user:", error);
      });
  }, [navigate, token]);

  const handleLogout = async () => {
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
    <div className="user-account-container">
      <h2 className="user-account-title">Tài khoản của bạn</h2>
      <div className="user-account-content">
        {/* Sidebar menu */}
        <aside className="user-account-sidebar">
          <ul>
            <li>
              <a href="#!" onClick={() => setView("info")}>Thông tin tài khoản</a>
            </li>
            <li>
              <a href="#!" onClick={() => navigate('/list-orders')}>
                Danh sách đơn hàng
              </a>
            </li>
            <li>
              <a href="#!" onClick={() => setView("changePassword")}>Đổi mật khẩu</a>
            </li>
            <li>
              <a href="#!" onClick={handleLogout}>Đăng xuất</a>
            </li>
          </ul>
        </aside>
        {/* Nội dung chính */}
        <main className="user-account-main">
          {view === "editProfile" && user ? (
            <EditProfilePage user={user} onCancel={() => setView("info")} />
          ) : view === "changePassword" && user ? (
            <ChangePasswordForm userId={user.id} onCancel={() => setView("info")} />
          ) : (
            <>
              <h3>THÔNG TIN TÀI KHOẢN</h3>
              {user ? (
                <>
                  <p><strong>{user.username}</strong></p>
                  <p>{user.full_name ? user.full_name : "Chưa cập nhật tên"}</p>
                  <p>{user.email}</p>
                  <p>{user.address ? user.address : "Chưa cập nhật địa chỉ"}</p>
                  <p>{user.phone_number ? user.phone_number : "Chưa cập nhật số điện thoại"}</p>
                  {/* Khi bấm vào đây chuyển sang chế độ chỉnh sửa */}
                  <a href="#!" onClick={() => setView("editProfile")}>Cập nhật thông tin</a>
                  <div className="user-account-orders">
                    {hasOrders ? (
                      <p>Bạn có đơn hàng đang xử lý...</p>
                    ) : (
                      <p>Bạn chưa đặt mua sản phẩm.</p>
                    )}
                  </div>
                </>
              ) : (
                <p>Đang tải dữ liệu...</p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserAccount;
