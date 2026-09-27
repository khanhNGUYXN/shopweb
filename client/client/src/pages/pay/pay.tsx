import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./pay.css";

interface Product {
  productId: number;
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
}

interface UserData {
  full_name: string;
  phone_Number: string;
  address: string;
}

interface TokenPayload {
  sub: string; // Username nằm trong trường 'sub'
}

const Checkout: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [userInfo, setUserInfo] = useState<UserData>({
    full_name: "",
    phone_Number: "",
    address: "",
  });
  const navigate = useNavigate();

  // Lấy danh sách sản phẩm từ localStorage

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken) {
        navigate("/login");
        return;
      }

      try {
        const accessResponse = await fetch("http://localhost:8080/auth/introspect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: accessToken }),
        });

        if (accessResponse.ok) {
          const accessData = await accessResponse.json();
          if (accessData.valid) {
            getUserInfo(accessToken);
            return;
          }
        }

        // Nếu accessToken hết hạn, kiểm tra refreshToken
        if (!refreshToken) {
          navigate("/login");
          return;
        }

        const refreshResponse = await fetch("http://localhost:8080/auth/introspect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.valid) {
            // Gọi API để lấy accessToken mới
            const tokenResponse = await fetch("http://localhost:8080/auth/refresh-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });

            if (tokenResponse.ok) {
              const tokenData = await tokenResponse.json();
              localStorage.setItem("accessToken", tokenData.accessToken);
              localStorage.setItem("refreshToken", tokenData.refreshToken);

              getUserInfo(tokenData.accessToken);
              return;
            }
          }
        }

        navigate("/login");
      } catch (error) {
        console.error("Lỗi kiểm tra token:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, []);
  useEffect(() => {
    const storedProducts = localStorage.getItem("cart");
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
  }, []);

  // Lấy thông tin user từ API dựa trên username giải mã từ token
  const getUserInfo = (token: string) => {
    try {
      const decodedToken = jwtDecode<TokenPayload>(token);
      const username = decodedToken.sub;

      fetch(`http://localhost:8080/users/username/${username}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
        .then((response) => response.json())
        .then((data) => {
          setUserInfo({
            full_name: data.full_name || "",
            phone_Number: data.phone_number || "",
            address: data.address || "",
          });
        })
        .catch((err) => console.error("Lỗi khi lấy thông tin user:", err));
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
    }
  };

  useEffect(() => {
    const storedProducts = localStorage.getItem("cart");
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
  }, []);


  // Tính tổng tiền
  const totalPrice = products.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Hàm xử lý đặt hàng
  const handleOrder = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Không tìm thấy accessToken");
      navigate("/login");
      return;
    }

    // Xây dựng dữ liệu đơn hàng
    const orderData = {
      order: {
        fullname: userInfo.full_name || "Nguyễn Văn A",
        email: "nguyenvana@example.com", // Bạn có thể thay đổi lấy từ form nếu cần
        phoneNumber: userInfo.phone_Number || "0123456789",
        address: userInfo.address || "123 Đường ABC, Quận 1, TP.HCM",
        note: "Giao hàng nhanh",
        shippingMethod: "Express",
        shippingAddress:
          userInfo.address || "123 Đường ABC, Quận 1, TP.HCM",
        paymentMethod: "COD",
      },
      orderDetails: products.map((product) => ({
        product: { id: product.productId },
        price: product.price,
        numberOfProducts: product.quantity,
        totalMoney: product.price * product.quantity,
        color: product.color,
        size: product.size,
      })),
    };

    try {
      const response = await fetch(
        "http://localhost:8080/orders/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );
      if (!response.ok) {
        throw new Error("Lỗi tạo đơn hàng");
      }
      const data = await response.json();
      console.log("Đơn hàng đã được tạo:", data);
      // Sau khi đặt hàng thành công, xóa giỏ hàng và chuyển hướng
      localStorage.removeItem("cart");
      navigate("/order-confirmation");
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <div className="checkout-container">
      {/* Pay1 - Thông tin giao hàng */}
      <div className="pay1">
        <h2>Thông tin giao hàng</h2>
        <input
          type="text"
          placeholder="Họ và tên"
          defaultValue={userInfo.full_name}
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          defaultValue={userInfo.phone_Number}
        />
        <input
          type="text"
          placeholder="Địa chỉ"
          defaultValue={userInfo.address}
        />
        <button className="checkout-btn" onClick={handleOrder}>
          Đặt hàng
        </button>
      </div>

      {/* Pay2 - Chi tiết đơn hàng */}
      <div className="pay2">
        <h2>Đơn hàng của bạn</h2>
        {products.length === 0 ? (
          <p>Giỏ hàng trống</p>
        ) : (
          products.map((product) => (
            <div className="product" key={product.productId}>
              <div className="product-img-container">
                <img
                  src={
                    product.image.includes("null")
                      ? "https://product.hstatic.net/1000096703/product/1_48d2b0f86bcd4b398560ec83f8eccfac_small.jpg"
                      : product.image
                  }
                  alt={product.name}
                  className="product-img"
                />
                <span className="quantity-badge">
                  {product.quantity}
                </span>
              </div>
              <div className="product-info">
                <p className="product-name">{product.name}</p>
                <p>
                  Size: {product.size} | Màu: {product.color}
                </p>
              </div>
              <span className="product-price">
                {(product.price * product.quantity).toLocaleString()}đ
              </span>
            </div>
          ))
        )}
        <div className="total">
          <p>Tổng cộng:</p>
          <span>{totalPrice.toLocaleString()}đ</span>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
