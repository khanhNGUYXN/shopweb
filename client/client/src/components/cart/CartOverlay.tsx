import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartOverlay.css';

interface Product {
  productId: number;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface CartOverlayProps {
  onClose: () => void;
  // Nếu muốn lấy từ props, bạn có thể giữ nguyên
  products?: Product[];
  
}

const CartOverlay: React.FC<CartOverlayProps> = ({ onClose, products = [] }) => {
  const navigate = useNavigate(); 
  const [isClosing, setIsClosing] = useState(false);
  const [cartItems, setCartItems] = useState<Product[]>(products);

  useEffect(() => {
    // Khi mở overlay, cập nhật giỏ hàng từ localStorage
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(storedCart);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
  };

  const handleAnimationEnd = () => {
    if (isClosing) {
      onClose();
    }
  };

  // Tính tổng tiền
  const totalPrice = cartItems.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );

    // Base URL cho ảnh (tiền tố cho URL ảnh từ API)
    const imageBaseUrl = 'http://localhost:8080';

  // Xử lý xóa sản phẩm (ví dụ: gọi hàm từ props hoặc setState cục bộ)
  const handleRemoveItem = (productId: number, size: string, color: string) => {
    const updatedCart = cartItems.filter(
      (item) =>
        !(item.productId === productId && item.size === size && item.color === color)
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    // Cập nhật lại số lượng ở Header
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleViewCart = () => {
    onClose(); 
    navigate('/cart'); // Chuyển hướng đến trang /cart
  };

  const handleCheckout = () => {
    onClose(); 
    setTimeout(() => navigate('/checkout'), 300); 
  };
  return (
    <div
      className={`cart-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        className={`cart-content ${isClosing ? 'slide-out' : 'slide-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={handleClose}>×</button>
        <h3>GIỎ HÀNG</h3>

        <div className="cart-list">
          {cartItems.length === 0 ? (
            <p>Giỏ hàng trống.</p>
          ) : (
            cartItems.map((item, index) => (
              <div key={`${item.productId}-${item.size || 'no-size'}-${item.color || 'no-color'}-${index}`} className="cart-item">
                <div className="item-left">
                  <img src={`${item.image}`} alt={item.name} className="item-image" />
                </div>
                <div className="item-right">
                  <div className="item-header">
                    <span className="item-name">{item.name}</span>
                    <button className="remove-btn" onClick={() => handleRemoveItem(item.productId, item.size, item.color)}>x</button>
                  </div>
                  <div className="item-variant">
                    {item.size} / {item.color}
                  </div>
                  <div className="item-info">
                    <div className="quantity-box">
                      <input type="number" min="1" value={item.quantity} readOnly />
                    </div>
                    <span className="item-price">
                      {(item.price * item.quantity).toLocaleString()}₫
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <hr />
          <div className="total-line">
            <span>TỔNG TIỀN:</span>
            <span>{totalPrice.toLocaleString()}₫</span>
          </div>
          <div className="cart-actions">
            <button className="view-cart-btn" onClick={handleViewCart}>XEM GIỎ HÀNG</button>
            <button className="checkout-btn" onClick={handleCheckout}>THANH TOÁN</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartOverlay;
