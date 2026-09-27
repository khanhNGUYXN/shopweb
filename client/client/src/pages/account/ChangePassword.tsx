import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ChangePassword.css"

interface ChangePasswordFormProps {
  userId: number;
  onCancel: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ userId, onCancel }) => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Kiểm tra mật khẩu mới có khớp không
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }

    // Lấy token để gửi API
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Nếu thông báo lỗi chứa "Mật khẩu cũ không đúng" thì alert thông báo đó
        if (errorData.message && errorData.message.includes("Mật khẩu cũ không đúng")) {
          throw new Error("Mật khẩu cũ không đúng");
        }
        // Nếu không, hiển thị thông báo lỗi mặc định
        throw new Error(errorData.message || "Đổi mật khẩu thất bại");
      }

      alert("Đổi mật khẩu thành công!");
      onCancel();
    } catch (error: any) {
        console.error("Lỗi khi đổi mật khẩu:", error);
        alert(error.message);
    }
  };

  return (
    <div className="change-password-form">
      <h3>Đổi mật khẩu</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Mật khẩu cũ:</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>
        <div>
          <label>Mật khẩu mới:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <label>Xác nhận mật khẩu mới:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className="change-password-buttons">
          <button type="submit">Đổi mật khẩu</button>
          <button type="button" onClick={onCancel}>Hủy</button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
