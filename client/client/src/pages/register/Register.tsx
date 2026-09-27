import React, { useState } from "react";
import styles from "./Register.module.css"; // Import CSS Module

const Register: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState(""); // Ngày sinh
  const [phone, setPhone] = useState(""); // Số điện thoại
  const [address, setAddress] = useState(""); // Địa chỉ
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Kiểm tra mật khẩu nhập lại
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }

    // Kiểm tra số điện thoại (chỉ nhận số, tối thiểu 9 ký tự)
    if (!/^\d{9,}$/g.test(phone)) {
      setError("Số điện thoại không hợp lệ!");
      return;
    }

    // Kiểm tra các trường không được để trống
    if (!fullName || !username || !email || !password || !dob || !phone || !address) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

      // Format ngày sinh thành ISO Date (yyyy-MM-ddTHH:mm:ss)
    const formattedDate = dob ? new Date(dob).toISOString().split(".")[0] : null;

    // Dữ liệu gửi đến API
    const requestData = {
      user: {
        username,
        password,
        email,
        phone_number: phone,
        full_name: fullName,
        address,
        dateOfBirth: formattedDate,
      },
      roleName: "ROLE_USER", // Mặc định ROLE_USER
    };

    try {
      const response = await fetch("http://localhost:8080/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Đăng ký thất bại. Vui lòng thử lại!");
      }

      const result = await response.json();
      setSuccess("Đăng ký thành công!");
      console.log("Đăng ký thành công:", result);

      // Reset form sau khi đăng ký thành công
      setFullName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setDob("");
      setPhone("");
      setAddress("");
    } catch (error: any) {
      setError(error.message || "Có lỗi xảy ra!");
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerLeft}>
        <h1>Đăng ký</h1>
        <div className={styles.underLine} />
      </div>
      <div className={styles.registerRight}>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              placeholder="Họ và tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputWrapper}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputWrapper}>
            <input
              type="date"
              placeholder="Ngày sinh"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputWrapper}>
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              placeholder="Địa chỉ"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputWrapper}>
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputWrapper}>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}
          <div className={styles.actionRow}>
            <button type="submit" className={styles.btnRegister}>
              ĐĂNG KÝ
            </button>
            <div className={styles.links}>
              <span>Đã có tài khoản?</span>
              <a href="/login">Đăng nhập</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
