import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import styles from './ResetPassword.module.css';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage('Mật khẩu không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/auth/reset-password', null, {
        params: { token, newPassword }
      });
      if (response.data === "Đặt lại mật khẩu thành công.") {
        setIsSubmitted(true);
        setMessage(response.data);
      } else {
        setMessage(response.data);
      }
    } catch (error) {
      console.error('Error resetting password', error);
      setMessage('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
  };

  return (
    <div className={styles.resetContainer}>
      <h2 className={styles.title}>Đặt Lại Mật Khẩu</h2>
      {isSubmitted ? (
        <>
          <p className={styles.message}>Đổi mật khẩu thành công</p>
          <div className={styles.backToLogin}>
            <Link to="/login">Quay lại đăng nhập</Link>
          </div>
        </>
      ) : (
        <>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input type="hidden" name="token" value={token} />
            <div className={styles.inputWrapper}>
              <label htmlFor="newPassword" className={styles.label}>Mật khẩu mới:</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.inputWrapper}>
              <label htmlFor="confirmPassword" className={styles.label}>Xác nhận mật khẩu mới:</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <button type="submit" className={styles.button}>Đổi mật khẩu</button>
          </form>
          {message && <p className={styles.message}>{message}</p>}
        </>
      )}
    </div>
  );
};

export default ResetPassword;
