// src/components/Services.tsx
import React from 'react';
import './Services.css';

const Services: React.FC = () => {
  return (
    <section className="services container" id="services">
      <h2>Dịch vụ của chúng tôi</h2>
      <div className="services-grid">
        <div className="service-item">
          <h3>Phát triển phần mềm</h3>
          <p>Thiết kế và triển khai các giải pháp phần mềm đáp ứng nhu cầu kinh doanh của bạn.</p>
        </div>
        <div className="service-item">
          <h3>Tư vấn công nghệ</h3>
          <p>Đưa ra các chiến lược số hóa và giải pháp công nghệ phù hợp cho doanh nghiệp.</p>
        </div>
        <div className="service-item">
          <h3>Đào tạo & Hỗ trợ</h3>
          <p>Cung cấp các khóa đào tạo chuyên sâu và dịch vụ hỗ trợ kỹ thuật 24/7.</p>
        </div>
      </div>
    </section>
  );
};

export default Services;
