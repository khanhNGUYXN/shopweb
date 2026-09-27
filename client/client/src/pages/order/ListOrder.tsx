import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import "./ListOrder.css";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
}

interface OrderDetail {
  id: number;
  price: number;
  numberOfProducts: number;
  totalMoney: number;
  color: string;
  size: string;
  product: Product;
}

interface User {
  id: number;
  username: string;
}

export interface Order {
  id: number;
  status: number;
  totalMoney: number;
  orderDate: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  address: string;
  note: string;
  shippingMethod: string;
  shippingAddress: string;
  paymentMethod: string;
  active: boolean | null;
  user: User;
  orderDetails: OrderDetail[];
}

const orderStatusMapping: { [key: number]: string } = {
  1: "Chờ xác nhận",
  2: "Shipper nhận hàng",
  3: "Hàng đang di chuyển",
  4: "Đã giao thành công",
  5: "Đã hủy đơn",
};


const ListOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm dùng để fetch danh sách đơn hàng
  const fetchOrders = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    let decoded: any;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error("Token không hợp lệ:", err);
      navigate("/login");
      return;
    }

    const username = decoded?.sub;
    if (!username) {
      console.error("Không tìm thấy username trong token");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/orders/by-user/${username}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Không thể lấy dữ liệu đơn hàng");
      }

      const data: Order[] = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi lấy đơn hàng:", err);
      setError("Lỗi khi lấy đơn hàng");
      setLoading(false);
    }
  };

  // Gọi fetchOrders() khi component mount
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hàm xử lý hủy đơn hàng
  const handleCancelOrder = async (orderId: number) => {
    const confirmCancel = window.confirm("Bạn có muốn hủy đơn hàng này không?");
    if (!confirmCancel) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    // Lấy username từ token
    let decoded: any;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error("Token không hợp lệ:", err);
      navigate("/login");
      return;
    }
    const username = decoded?.sub;
    if (!username) {
      console.error("Không tìm thấy username trong token");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/orders/${orderId}/cancel?username=${username}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Hủy đơn hàng thất bại");
      }

      // Hủy thành công -> gọi lại fetchOrders() để cập nhật danh sách
      alert("Hủy đơn hàng thành công!");
      fetchOrders();
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      alert("Đã có lỗi xảy ra khi hủy đơn hàng");
    }
  };

 // Hàm xử lý mua lại đơn hàng đã hủy
const handleReorder = async (orderId: number) => {
  const confirmReorder = window.confirm("Bạn có muốn mua lại đơn hàng này không?");
  if (!confirmReorder) return;

  const token = localStorage.getItem("accessToken");
  if (!token) {
    navigate("/login");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // Gửi request body chứa newStatus = 1
      body: JSON.stringify({ newStatus: 1 }),
    });

    if (!response.ok) {
      throw new Error("Mua lại đơn hàng thất bại");
    }

    alert("Mua lại đơn hàng thành công!");
    fetchOrders();
  } catch (error) {
    console.error("Lỗi khi mua lại đơn hàng:", error);
    alert("Đã có lỗi xảy ra khi mua lại đơn hàng");
  }
};



  if (loading) return <div className="loading">Đang tải dữ liệu đơn hàng...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="order-list">
      <h1>Đơn hàng của bạn</h1>
      {/* Render các đơn hàng chưa hủy */}
      {orders.filter(order => order.status !== 5).map((order) => (
        <div key={order.id} className="order-item">
          <div className="order-header">
            <h2>Đơn hàng ID: {order.id}</h2>
            <p>
              <strong>Trạng thái:</strong> {orderStatusMapping[order.status] || order.status}
            </p>
            {/* Các thông tin khác */}
          </div>
          <h3>Chi tiết đơn hàng:</h3>
          <table className="order-details-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Màu</th>
                <th>Size</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Tổng</th>
              </tr>
            </thead>
            <tbody>
              {order.orderDetails.map((detail) => (
                <tr key={detail.id}>
                  <td>
                    <div className="product-info">
                      {detail.product.imageUrl ? (
                        <img
                        src={`http://localhost:8080${detail.product.imageUrl}`}
                          alt={detail.product.name}
                        />
                      ) : (
                        <img
                          src="https://via.placeholder.com/80?text=No+Image"
                          alt="No product"
                        />
                      )}
                      <div className="product-name">{detail.product.name}</div>
                    </div>
                  </td>
                  <td>{detail.color}</td>
                  <td>{detail.size}</td>
                  <td>{detail.price.toLocaleString()}đ</td>
                  <td>{detail.numberOfProducts}</td>
                  <td>{detail.totalMoney.toLocaleString()}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="order-item-footer">
            <button
              className="cancel-button"
              onClick={() => handleCancelOrder(order.id)}
            >
              Hủy đơn hàng
            </button>
          </div>
        </div>
      ))}
  
      {/* Render tiêu đề cho đơn hàng đã hủy */}
      {orders.some(order => order.status === 5) && (
        <h2 style={{ marginTop: "30px", textAlign: "center" }}>Đơn hàng đã hủy</h2>
      )}
  
      {/* Render các đơn hàng đã hủy */}
      {orders.filter(order => order.status === 5).map((order) => (
        <div key={order.id} className="order-item">
          <div className="order-header">
            <h2>Đơn hàng ID: {order.id}</h2>
            <p>
              <strong>Trạng thái:</strong> {orderStatusMapping[order.status] || order.status}
            </p>
            {/* Các thông tin khác */}
          </div>
          <h3>Chi tiết đơn hàng:</h3>
          <table className="order-details-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Màu</th>
                <th>Size</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Tổng</th>
              </tr>
            </thead>
            <tbody>
              {order.orderDetails.map((detail) => (
                <tr key={detail.id}>
                  <td>
                    <div className="product-info">
                      {detail.product.imageUrl ? (
                        <img
                        src={`http://localhost:8080${detail.product.imageUrl}`}
                          alt={detail.product.name}
                        />
                      ) : (
                        <img
                          src="https://via.placeholder.com/80?text=No+Image"
                          alt="No product"
                        />
                      )}
                      <div className="product-name">{detail.product.name}</div>
                    </div>
                  </td>
                  <td>{detail.color}</td>
                  <td>{detail.size}</td>
                  <td>{detail.price.toLocaleString()}đ</td>
                  <td>{detail.numberOfProducts}</td>
                  <td>{detail.totalMoney.toLocaleString()}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="order-item-footer">
            <button
              className="reorder-button"
              onClick={() => handleReorder(order.id)}
            >
              Mua lại
            </button>
          </div>
        </div>
      ))}
    </div>
  );
  
};

export default ListOrders;
