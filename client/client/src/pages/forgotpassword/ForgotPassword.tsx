import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './ForgotPassword.module.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Gọi API backend để gửi yêu cầu forgot-password
      const response = await axios.post('http://localhost:8080/auth/forgot-password', null, {
        params: { email }
      });
      // Nếu thành công, chuyển trạng thái sang isSubmitted = true và hiển thị thông báo
      setMessage(response.data);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error sending forgot password request', error);
      setMessage('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
  };

  return (
    <div className={styles.forgotContainer}>
      <h2 className={styles.title}>Quên Mật Khẩu</h2>
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <label htmlFor="email" className={styles.label}>Email của bạn:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.button}>
            Gửi liên kết đặt lại mật khẩu
          </button>
        </form>
      ) : (
        <p className={styles.message}>Đã gửi email xác nhận, hãy kiểm tra email của bạn.</p>
      )}
      {message && !isSubmitted && <p className={styles.message}>{message}</p>}
      <div className={styles.backToLogin}>
        <Link to="/login">Quay lại đăng nhập</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
