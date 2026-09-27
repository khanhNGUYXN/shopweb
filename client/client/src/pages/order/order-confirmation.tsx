import React from "react";
import { useNavigate } from "react-router-dom";
import "./order-confirmation.css";

const OrderConfirmation: React.FC = () => {
  const navigate = useNavigate();

  const handleContinueShopping = () => {
    // Chuyển hướng về trang chủ hoặc trang danh sách sản phẩm
    navigate("/");
  };

  return (
    <div className="order-confirmation-container">
      <h1>Đặt hàng thành công!</h1>
      <p>Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.</p>
      <button className="continue-shopping-btn" onClick={handleContinueShopping}>
        Tiếp tục mua hàng
      </button>
    </div>
  );
};

export default OrderConfirmation;
