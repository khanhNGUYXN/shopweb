import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import styles from './UserManagementPage.module.css';
import EditProfilePage from '../pages/account/EditProfilePage';
import ChangePasswordForm from '../pages/account/ChangePassword';

interface User {
  id: number;
  username: string;
  active: boolean;
  roles: string[];
  full_name?: string;
  phone_number?: string;
  dateOfBirth?: string; // YYYY-MM-DD hoặc định dạng khác
  address?: string | null;
  email: string;
}

interface TokenPayload {
  sub: string;
  roles: string[];
}

interface NewUserForm {
  username: string;
  password: string;
  full_name: string;
  phone_number: string;
  email: string;
  address: string;
  dateOfBirth: string; // YYYY-MM-DD
  roles: string[];
}

type ViewType = "table" | "editProfile" | "changePassword";

const UserManagementPage: React.FC = () => {
  // Danh sách user của hệ thống (dành cho admin)
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchUsername, setSearchUsername] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<NewUserForm>({
    username: '',
    password: '',
    full_name: '',
    phone_number: '',
    email: '',
    address: '',
    dateOfBirth: '',
    roles: [],
  });

  // Thông tin người dùng hiện tại
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // State điều khiển giao diện: bảng (table) hoặc edit profile / change password
  const [view, setView] = useState<ViewType>("table");

  const token = localStorage.getItem('accessToken') || '';

  // Lấy roles hiện tại từ token
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

  const isAdmin = getCurrentUserRoles().includes('ROLE_ADMIN');

  // Fetch danh sách người dùng (cho admin)
  const fetchUsers = (username: string = '') => {
    setLoading(true);
    let apiUrl = 'http://localhost:8080/users';
    if (username.trim() !== '') {
      apiUrl = `http://localhost:8080/users/username/${username}`;
    }
    axios
      .get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        const data = response.data;
        let usersArray: any[] = [];
        if (Array.isArray(data)) {
          usersArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          usersArray = data.data;
        } else {
          usersArray = [data];
        }
        // Chuyển đổi dữ liệu, giả sử API trả về các trường full_name, phone_number, dateOfBirth, address, email
        const formattedUsers = usersArray.map((u: any) => ({
          id: u.id,
          username: u.username,
          active: u.active,
          roles: u.userRoles.map((roleObj: any) => roleObj.role.name),
          full_name: u.full_name,
          phone_number: u.phone_number,
          dateOfBirth: u.dateOfBirth,
          address: u.address,
          email: u.email,
        }));
        setUsers(formattedUsers);
        setLoading(false);
      })
      .catch(error => {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
        setError('Lỗi khi tải dữ liệu');
        setLoading(false);
      });
  };

  // Fetch thông tin người dùng hiện tại theo username từ token
  useEffect(() => {
    if (!token) return;
    let decoded: any;
    try {
      decoded = jwtDecode(token);
    } catch (error) {
      console.error("Token không hợp lệ:", error);
      return;
    }
    const username = decoded.sub;
    if (!username) return;
    fetch(`http://localhost:8080/users/username/${username}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) throw new Error("Không thể lấy dữ liệu user");
        return response.json();
      })
      .then(data => {
        const currentUserObj: User = {
          id: data.id,
          username: data.username,
          active: data.active,
          roles: data.userRoles.map((roleObj: any) => roleObj.role.name),
          full_name: data.full_name,
          phone_number: data.phone_number,
          dateOfBirth: data.dateOfBirth,
          address: data.address,
          email: data.email,
        };
        setCurrentUser(currentUserObj);
      })
      .catch(error => {
        console.error("Lỗi khi lấy dữ liệu user hiện tại:", error);
      });
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleActiveStatusChange = (userId: number, currentActive: boolean, targetRoles: string[]) => {
    const currentUserRoles = getCurrentUserRoles();
    if (currentUserRoles.length === 0) {
      alert('Không có quyền truy cập');
      return;
    }
    if (currentUserRoles.includes('ROLE_ADMIN')) {
      if (targetRoles.includes('ROLE_ADMIN')) {
        alert('Bạn không có quyền khóa tài khoản của admin');
        return;
      }
    } else if (currentUserRoles.includes('ROLE_EMPLOYEE')) {
      if (targetRoles.includes('ROLE_ADMIN') || targetRoles.includes('ROLE_EMPLOYEE')) {
        alert('Bạn không có quyền khóa tài khoản của admin hoặc employee');
        return;
      }
    } else {
      alert('Bạn không có quyền thay đổi trạng thái tài khoản này');
      return;
    }
    const newActive = !currentActive;
    axios
      .put(`http://localhost:8080/users/${userId}/active`, { active: newActive }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        const updatedUsers = users.map(user =>
          user.id === userId ? { ...user, active: newActive } : user
        );
        setUsers(updatedUsers);
      })
      .catch(error => {
        console.error('Lỗi khi thay đổi trạng thái người dùng:', error);
      });
  };

  const handleSearch = () => {
    fetchUsers(searchUsername);
  };

  // Xử lý form tạo user mới (giữ nguyên)
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = e.target;
    if (name === 'roles') {
      setNewUser(prevState => {
        const roles = prevState.roles;
        if (target.checked) {
          return { ...prevState, roles: [...roles, value] };
        } else {
          return { ...prevState, roles: roles.filter(role => role !== value) };
        }
      });
    } else {
      setNewUser(prevState => ({ ...prevState, [name]: value }));
    }
  };

  const formattedDate = newUser.dateOfBirth ? new Date(newUser.dateOfBirth).toISOString().split(".")[0] : null;
  
  const handleCreateUser = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      user: {
        username: newUser.username,
        full_name: newUser.full_name,
        password: newUser.password,
        phone_number: newUser.phone_number,
        email: newUser.email,
        address: newUser.address,
        dateOfBirth: formattedDate,
      },
      roleName: "ROLE_EMPLOYEE",
    };

    axios
      .post('http://localhost:8080/users/register', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        alert('Tạo user thành công!');
        setNewUser({
          username: '',
          password: '',
          full_name: '',
          phone_number: '',
          email: '',
          address: '',
          dateOfBirth: '',
          roles: [],
        });
        setShowCreateForm(false);
        fetchUsers();
      })
      .catch(error => {
        console.error('Lỗi khi tạo user mới:', error);
        alert('Lỗi khi tạo user mới');
      });
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>{error}</div>;

  // Nếu view khác "table", render giao diện chỉnh sửa cá nhân của người dùng hiện tại
  if (view === "editProfile" && currentUser) {
    return (
      <EditProfilePage
        user={{
          id: currentUser.id,
          full_name: currentUser.full_name ?? null,
          address: currentUser.address ?? null,
          phone_number: currentUser.phone_number ?? null,
          email: currentUser.email,
          dateOfBirth: currentUser.dateOfBirth ?? null,
          username: currentUser.username,
        }}
        onCancel={() => setView("table")}
      />
    );
  }
  
  if (view === "changePassword" && currentUser) {
    return <ChangePasswordForm userId={currentUser.id} onCancel={() => setView("table")} />;
  }

  return (
    <div>
      <h2>Quản Lý Tài Khoản Người Dùng</h2>
      {/* Thanh tìm kiếm kèm 2 nút: Đổi mật khẩu và Chỉnh sửa thông tin */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Nhập tên người dùng..."
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', flex: 1 }}
        />
        <button onClick={handleSearch} style={{ padding: '8px 12px', marginRight: '10px' }}>
          Tìm kiếm
        </button>
        <button 
          onClick={() => setView("changePassword")} 
          style={{ padding: '8px 12px', marginRight: '10px' }}
        >
          Đổi mật khẩu
        </button>
        <button 
          onClick={() => setView("editProfile")} 
          style={{ padding: '8px 12px' }}
        >
          Chỉnh sửa thông tin
        </button>
        {isAdmin && (
          <button onClick={() => setShowCreateForm(prev => !prev)} style={{ padding: '8px 12px', marginLeft: '10px' }}>
            {showCreateForm ? 'Đóng form tạo user' : 'Tạo user mới'}
          </button>
        )}
      </div>

      {showCreateForm ? (
        <form onSubmit={handleCreateUser} className={styles.formContainer}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username:</label>
            <input
              type="text"
              name="username"
              value={newUser.username}
              onChange={handleNewUserChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Họ và tên:</label>
            <input
              type="text"
              name="full_name"
              value={newUser.full_name}
              onChange={handleNewUserChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password:</label>
            <input
              type="password"
              name="password"
              value={newUser.password}
              onChange={handleNewUserChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Số điện thoại:</label>
            <input
              type="text"
              name="phone_number"
              value={newUser.phone_number}
              onChange={handleNewUserChange}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email:</label>
            <input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleNewUserChange}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Địa chỉ:</label>
            <input
              type="text"
              name="address"
              value={newUser.address}
              onChange={handleNewUserChange}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Ngày sinh:</label>
            <input
              type="date"
              name="dateOfBirth"
              value={newUser.dateOfBirth}
              onChange={handleNewUserChange}
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Tạo
          </button>
        </form>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID Người Dùng</th>
              <th>Username</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Ngày sinh</th>
              <th>Trạng Thái</th>
              <th>Vai Trò</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #ccc' }}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.full_name || '-'}</td>
                <td>{user.email || '-'}</td>
                <td>{user.phone_number || '-'}</td>
                <td>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : '-'}</td>
                <td>
                  <span style={{ color: user.active ? 'green' : 'red' }}>
                    {user.active ? 'Đang Hoạt Động' : 'Đã Khóa'}
                  </span>
                </td>
                <td>{user.roles.join(', ')}</td>
                <td>
                  <button
                    onClick={() => handleActiveStatusChange(user.id, user.active, user.roles)}
                    style={{ padding: '6px 10px', cursor: 'pointer' }}
                  >
                    {user.active ? 'Khóa Tài Khoản' : 'Mở Khóa'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagementPage;
