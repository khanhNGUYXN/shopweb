import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CartList.css";

interface CartItem {
  productId: number;
  name: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
}

const CartList: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, []);

  const updateQuantity = (id: number, size: string, color: string, quantity: number) => {
    let updatedCart = cart.map((item) =>
      item.productId === id && item.size === size && item.color === color
        ? { ...item, quantity: quantity > 0 ? quantity : 1 }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };
  

  const removeFromCart = (id: number) => {
    let updatedCart = cart.filter((item) => item.productId !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    const token = localStorage.getItem("accessToken");
  
    if (token) {
      navigate("/checkout");
    } else {
      // Lưu đường dẫn checkout vào localStorage để redirect sau khi đăng nhập
      localStorage.setItem("redirectAfterLogin", "/checkout");
      navigate("/login");
    }
  };
  return (
    <div className="cart-container">
      <h2 className="cart-title">GIỎ HÀNG CỦA BẠN</h2>

      <div className="cart-grid">
        {/* Danh sách sản phẩm */}
        <div className="cart-items">
          <p className="cart-summary">Bạn đang có {cart.length} sản phẩm trong giỏ hàng</p>
          {cart.length > 0 ? (
            cart.map((item, index) => (
              <div key={`${item.productId}-${item.size}-${item.color}-${index}`} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-details">{item.size} / {item.color}</p>
                  <p className="cart-item-price">{item.price.toLocaleString()}đ</p>
                </div>
                <div className="cart-item-quantity">
                    <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}>+</button>
                </div>
                <p className="cart-item-total">{(item.price * item.quantity).toLocaleString()}đ</p>
                <button onClick={() => removeFromCart(item.productId)} className="cart-item-remove">🗑</button>
              </div>
            ))
          ) : (
            <p>Giỏ hàng trống</p>
          )}
        </div>

        

        {/* Thông tin đơn hàng */}
        <div className="cart-summary-box">
          <h3>Thông tin đơn hàng</h3>
          <p className="cart-total">Tổng tiền: {totalPrice.toLocaleString()}đ</p>
          <button className="cart-checkout-btn" onClick={handleCheckout}>THANH TOÁN</button>

          <button className="cart-con-btn" onClick={() => navigate("/")}>Tiếp tục mua hàng</button>
        </div>
      </div>
    </div>
  );
};

export default CartList;
