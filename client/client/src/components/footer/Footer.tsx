import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faGoogle, faInstagram, faTiktok } from '@fortawesome/free-brands-svg-icons';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer" id="contact">
      <div className="container footer-container">
        {/* Cột 1: KENTA VN */}
        <div className="footer-column">
          <h3>KENTA VN</h3>
          <ul>
            <li>Giới thiệu</li>
            <li>Kiểm tra đơn hàng</li>
            <li>Cách chọn size</li>
            <li>Thông tin liên hệ</li>
            <li>Câu hỏi thường gặp</li>
            <li>Hướng dẫn bảo quản</li>
          </ul>
        </div>

        {/* Cột 2: CHÍNH SÁCH */}
        <div className="footer-column">
          <h3>CHÍNH SÁCH</h3>
          <ul>
            <li>Hướng dẫn mua hàng</li>
            <li>Khách hàng thân thiết</li>
            <li>Chính sách đổi hàng</li>
            <li>Chính sách bảo mật</li>
            <li>Đối tác sản xuất</li>
            <li>Blog</li>
          </ul>
        </div>

        {/* Cột 3: KẾT NỐI VỚI KENTA */}
        <div className="footer-column">
          <h3>KẾT NỐI VỚI KENTA</h3>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="https://google.com" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faGoogle} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={faTiktok} />
            </a>
          </div>
          <div className="certification">
            <img
              className="bo-cong-thuong"
              src="https://file.hara.vn/1000114117/file/logo-bct_5a0bbf4fb2d34c3e88c04df41ad38dc9.png"
              alt="Bộ Công Thương"
            />
            <img
              src="https://images.dmca.com/Badges/dmca-badge-w100-5x1-05.png?ID=3c16119b-6bba-4606-bdd5-9b9ab9a95a18"
              alt="DMCA Protected"
            />
          </div>
        </div>

        {/* Cột 4: THÔNG TIN CỬA HÀNG */}
        <div className="footer-column">
          <h3>THÔNG TIN CỬA HÀNG</h3>
          <ul>
            <li>285 Đội Cấn, Ba Đình, Hà Nội.</li>
            <li>Hotline: 0987654321</li>
            <li>Mail: cloneKenra@gmail.com</li>
          </ul>
        </div>
      </div>

      <div className="footer-copy">
        <p>Copyright © {new Date().getFullYear()} KENTA.VN.</p>
      </div>
    </footer>
  );
};

export default Footer;
