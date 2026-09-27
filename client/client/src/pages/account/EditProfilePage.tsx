import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfilePage.css";

interface EditProfileProps {
  user: {
    id?: number;
    full_name: string | null;
    address: string | null;
    phone_number: string | null;
    email: string;
    dateOfBirth: string | null;
    username: string;
  };
  onCancel: () => void;
}

const EditProfilePage: React.FC<EditProfileProps> = ({ user: initialUser, onCancel }) => {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      console.error("Không tìm thấy token! Người dùng chưa đăng nhập.");
      return;
    }

    const fetchUserId = async () => {
      try {
        const response = await fetch(`http://localhost:8080/users/username/${initialUser.username}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser((prevUser) => ({ ...prevUser, id: data.id }));
        } else {
          console.error("Không tìm thấy ID");
        }
      } catch (error) {
        console.error("Lỗi khi lấy ID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, [initialUser.username, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prevState) => ({
      ...prevState,
      [name]: name === "dateOfBirth" ? new Date(value).toISOString() : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.id) {
      alert("Không tìm thấy ID người dùng!");
      return;
    }

    if (!token) {
      alert("Bạn chưa đăng nhập. Vui lòng đăng nhập lại!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/users/${user.id}/info`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        alert("Cập nhật thành công!");
        navigate(0); // Reset lại trang useraccount
      } else {
        const errorData = await response.json();
        alert(`Cập nhật thất bại! Lỗi: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      alert("Đã xảy ra lỗi!");
    }
  };

  const handleCancel = () => {
    navigate(0); // Reset lại trang useraccount
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="edit-profile-container">
      <h2>Chỉnh sửa thông tin cá nhân</h2>
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <span className="icon"><i className="fa fa-user" /></span>
          <input type="text" name="full_name" value={user.full_name || ""} onChange={handleChange} placeholder="Họ tên" />
        </div>
        <div className="form-group">
          <span className="icon"><i className="fa fa-map-marker-alt" /></span>
          <input type="text" name="address" value={user.address || ""} onChange={handleChange} placeholder="Địa chỉ" />
        </div>
        <div className="form-group">
          <span className="icon"><i className="fa fa-phone" /></span>
          <input type="text" name="phone_number" value={user.phone_number || ""} onChange={handleChange} placeholder="Số điện thoại" />
        </div>
        <div className="form-group">
          <span className="icon"><i className="fa fa-envelope" /></span>
          <input type="text" name="email" value={user.email} onChange={handleChange} placeholder="Email" />
        </div>
        <div className="form-group">
            <span className="icon"><i className="fa fa-calendar-alt" /></span>
            <input 
                type="date" 
                name="dateOfBirth"
                value={user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : ""}
                onChange={handleChange}
                placeholder="Ngày sinh"
            />
        </div>
        <div className="form-group form-actions">
          <button type="submit">Lưu thay đổi</button>
          <button type="button" onClick={handleCancel}>Hủy</button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;
