import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './OrderPage.module.css'; // Import CSS Module

// Các trạng thái của đơn hàng
const ORDER_STATUS = {
  PENDING: 1,
  PICKED_UP: 2,
  IN_TRANSIT: 3,
  DELIVERED: 4,
  CANCELED: 5,
};

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
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

interface Order {
  id: number;
  status: number; // Sử dụng số thay vì chuỗi
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
  user: {
    id: number;
    username: string;
  };
  orderDetails: OrderDetail[];
}

const OrderPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [username, setUsername] = useState<string>(''); // Lưu tên người dùng nhập vào
  const [token, setToken] = useState<string>(''); // Lấy token từ localStorage
  const [selectedStatuses, setSelectedStatuses] = useState<{ [key: number]: number }>({});

  // Lấy token từ localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken') || '';
    setToken(storedToken);
  }, []);

  useEffect(() => {
    const statuses: { [key: number]: number } = {};
    orders.forEach(order => {
      statuses[order.id] = order.status;
    });
    setSelectedStatuses(statuses);
  }, [orders]);
  

  // Hàm để tìm kiếm đơn hàng theo tên người dùng
  const handleSearch = () => {
    if (!username || !token) return;

    setLoading(true);
    axios
      .get(`http://localhost:8080/orders/by-user/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then((response) => {
        setOrders(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        setError('Lỗi khi tải dữ liệu');
        setLoading(false);
      });
  };

  // Hàm thay đổi trạng thái đơn hàng
  const handleUpdateStatus = (orderId: number) => {
    const newStatus = selectedStatuses[orderId];
    axios
      .put(
        `http://localhost:8080/orders/${orderId}/status`,
        { newStatus: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        // Cập nhật lại danh sách order nếu cần
        const updatedOrders = orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
        alert("Cập nhật trạng thái thành công!");
      })
      .catch((error) => {
        console.error("Lỗi khi thay đổi trạng thái đơn hàng:", error);
        alert("Có lỗi xảy ra khi cập nhật trạng thái!");
      });
  };
  

  const ordersInProgress = orders.filter(order => order.status !== ORDER_STATUS.CANCELED);
  const canceledOrders = orders.filter(order => order.status === ORDER_STATUS.CANCELED);

  if (loading) {
    return <div className={styles.loader}>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2>Quản Lý Đơn Hàng</h2>

        {/* Thanh tìm kiếm người dùng */}
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Nhập tên người dùng..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.searchInput}
          />
          <button onClick={handleSearch} className={styles.searchButton}>
            Tìm kiếm
          </button>
        </div>

        {/* Đơn hàng đang xử lý */}
        <div>
          <h3>Đơn Hàng Đang Xử Lý</h3>
          <table>
            <thead>
              <tr>
                <th>ID Đơn Hàng</th>
                <th>Người Dùng</th>
                <th>Sản Phẩm</th>
                <th>Tổng Giá</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {ordersInProgress.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.fullname}</td>
                  <td>
                    {order.orderDetails.map((detail) => (
                      <div key={detail.id}>
                        {detail.product.name} - {detail.color} - {detail.size} - {detail.totalMoney} VND
                      </div>
                    ))}
                  </td>
                  <td>{order.totalMoney} VND</td>
                  <td>
                    <select
                      value={selectedStatuses[order.id] || order.status}
                      onChange={(e) =>
                        setSelectedStatuses((prev) => ({
                          ...prev,
                          [order.id]: parseInt(e.target.value),
                        }))
                      }
                    >
                      <option value={ORDER_STATUS.PENDING}>Chờ xác nhận</option>
                      <option value={ORDER_STATUS.PICKED_UP}>Shipper nhận hàng</option>
                      <option value={ORDER_STATUS.IN_TRANSIT}>Hàng đang di chuyển</option>
                      <option value={ORDER_STATUS.DELIVERED}>Đã giao thành công</option>
                      <option value={ORDER_STATUS.CANCELED}>Đã hủy đơn</option>
                    </select>

                  </td>
                  <td className={styles.actionsButton}>
                    <button onClick={() => handleUpdateStatus(order.id)}>
                      Cập nhật trạng thái
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Đơn hàng đã hủy */}
        <div className={styles.canceledOrders}>
          <h3>Đơn Hàng Đã Hủy</h3>
          <table>
            <thead>
              <tr>
                <th>ID Đơn Hàng</th>
                <th>Người Dùng</th>
                <th>Sản Phẩm</th>
                <th>Tổng Giá</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {canceledOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.fullname}</td>
                  <td>
                    {order.orderDetails.map((detail) => (
                      <div key={detail.id}>
                        {detail.product.name} - {detail.color} - {detail.size} - {detail.totalMoney} VND
                      </div>
                    ))}
                  </td>
                  <td>{order.totalMoney} VND</td>
                  <td>
                    <select
                      value={selectedStatuses[order.id] || order.status}
                      onChange={(e) =>
                        setSelectedStatuses((prev) => ({
                          ...prev,
                          [order.id]: parseInt(e.target.value),
                        }))
                      }
                    >
                      <option value={ORDER_STATUS.PENDING}>Chờ xác nhận</option>
                      <option value={ORDER_STATUS.PICKED_UP}>Shipper nhận hàng</option>
                      <option value={ORDER_STATUS.IN_TRANSIT}>Hàng đang di chuyển</option>
                      <option value={ORDER_STATUS.DELIVERED}>Đã giao thành công</option>
                      <option value={ORDER_STATUS.CANCELED}>Đã hủy đơn</option>
                    </select>
                  </td>
                  <td className={styles.actionsButton}>
                    <button onClick={() => handleUpdateStatus(order.id)}>
                      Cập nhật trạng thái
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
