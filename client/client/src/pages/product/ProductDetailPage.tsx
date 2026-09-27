import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './ProductDetail.module.css'; // Import CSS Module

// Interface cho màu sắc và size
interface Color {
  id: number;
  name: string;
}

interface Size {
  id: number;
  name: string;
}

interface ProductImage {
  id: number;
  imageUrl: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  thumbnail: string; // Ảnh chính (mặc định)
  images: ProductImage[]; // Mảng ảnh phụ
  description: string;
  colors: Color[]; // Mảng các màu
  sizes: Size[];  // Mảng các size
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Lấy id từ URL: /product/:id
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // State để quản lý lựa chọn của người dùng
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // State để quản lý ảnh hiện tại đang hiển thị (sử dụng chỉ số)
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Base URL cho ảnh (tiền tố cho URL ảnh từ API)
  const imageBaseUrl = 'http://localhost:8080';

  useEffect(() => {
    if (!id) return;
    axios
      .get(`http://localhost:8080/products/${id}`)
      .then((response) => {
        const p: Product = response.data.data;
        setProduct(p);
        setLoading(false);
        // Đặt ảnh mặc định: nếu có mảng images thì dùng ảnh đầu tiên, nếu không dùng thumbnail
        if (p.images && p.images.length > 0) {
          setCurrentIndex(0);
        }
        // Đặt lựa chọn mặc định cho màu và size nếu có dữ liệu
        if (p.colors && p.colors.length > 0) {
          setSelectedColor(p.colors[0].name);
        }
        if (p.sizes && p.sizes.length > 0) {
          setSelectedSize(p.sizes[0].name);
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Lỗi khi tải thông tin sản phẩm');
        setLoading(false);
      });
  }, [id]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    setQuantity(value);
  };

  const handleAddToCart = () => {
    // Xác định ảnh hiển thị
    const mainImage =
      product?.images && product.images.length > 0
        ? product.images[currentIndex].imageUrl
        : product?.thumbnail;

    const cartItem = {
      productId: product?.id,
      name: product?.name,
      image: `${imageBaseUrl}${mainImage}`,
      color: selectedColor,
      size: selectedSize,
      quantity,
      price: product?.price,
    };

    // Lấy giỏ hàng từ localStorage (nếu có)
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Kiểm tra sản phẩm có cùng id, màu và size không
    const index = cart.findIndex(
      (item: any) =>
        item.productId === product?.id &&
        item.color === selectedColor &&
        item.size === selectedSize
    );

    if (index >= 0) {
      // Cập nhật số lượng nếu sản phẩm đã tồn tại
      cart[index].quantity += quantity;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // Phát sự kiện để cập nhật số lượng giỏ hàng ở Header
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handlePrevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (product && product.images && currentIndex < product.images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return null;

  // Nếu có mảng ảnh thì dùng ảnh từ mảng, nếu không dùng thumbnail
  const mainImage =
    product.images && product.images.length > 0
      ? product.images[currentIndex].imageUrl
      : product.thumbnail;

  return (
    <div className={styles.detailContainer}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <span>Trang chủ</span> <span>Danh mục</span> / <strong>{product.name}</strong>
      </div>

      {/* Container chia làm 2 cột: Gallery bên trái, Info bên phải */}
      <div className={styles.productDetailContainer}>
        {/* Gallery ảnh (bên trái) */}
        <div className={styles.galleryContainer}>
          {/* Hiển thị thumbnail đầu tiên (nếu có) */}
          <div className={styles.thumbnailList}>
            {/* {product.thumbnail && (
              <img
                src={`${imageBaseUrl}${product.thumbnail}`}
                alt={`${product.name} thumbnail`}
                className={`${styles.thumbnailItem} ${currentIndex === -1 ? styles.active : ''}`}
                onClick={() => setCurrentIndex(0)}
              />
            )} */}
            {product.images && product.images.length > 0 && product.images.map((img, index) => (
              <img
                key={img.id}
                src={`${imageBaseUrl}${img.imageUrl}`}
                alt={product.name}
                onClick={() => setCurrentIndex(index)}
                className={`${styles.thumbnailItem} ${currentIndex === index ? styles.active : ''}`}
              />
            ))}
          </div>
          {/* Ảnh chính kèm nút chuyển ảnh */}
          <div className={styles.mainImageContainer}>
            <div className={styles.mainImageWrapper}>
              <img src={`${imageBaseUrl}${mainImage}`} alt={product.name} className={styles.mainImage} />
              {/* Nút chuyển ảnh: căn giữa theo chiều dọc trên ảnh */}
              {product.images && product.images.length > 1 && (
                <>
                  <button className={styles.arrowBtnLeft} onClick={handlePrevImage} disabled={currentIndex === 0}>
                    &#9664;
                  </button>
                  <button
                    className={styles.arrowBtnRight}
                    onClick={handleNextImage}
                    disabled={currentIndex === product.images.length - 1}
                  >
                    &#9654;
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Thông tin sản phẩm (bên phải) */}
        <div className={styles.productInfo}>
          <h1 className={styles.productName}>{product.name}</h1>
          <p className={styles.productPrice}>{product.price.toLocaleString('vi-VN')}₫</p>

          {/* Màu sắc */}
          <div className={styles.colorSelection}>
            <span className={styles.label}>Màu</span>
            <div className={styles.colorOptions}>
              {product.colors && product.colors.map((color) => (
                <button
                  key={color.id}
                  className={`${styles.colorBtn} ${selectedColor === color.name ? styles.active : ''}`}
                  onClick={() => handleColorChange(color.name)}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className={styles.sizeSelection}>
            <span className={styles.label}>Size</span>
            <div className={styles.sizeOptions}>
              {product.sizes && product.sizes.map((size) => (
                <button
                  key={size.id}
                  className={`${styles.sizeBtn} ${selectedSize === size.name ? styles.active : ''}`}
                  onClick={() => handleSizeChange(size.name)}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>

          {/* Số lượng */}
          <div className={styles.quantitySelection}>
            <button
              className={styles.quantityBtn}
              onClick={() => handleQuantityChange(quantity - 1)}
            >
              -
            </button>
            <input
              type="number"
              min="1"
              className={styles.quantityInput}
              value={quantity}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
            />
            <button
              className={styles.quantityBtn}
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              +
            </button>
          </div>

          {/* Nút thêm vào giỏ */}
          <button className={styles.addToCartBtn} onClick={handleAddToCart}>
            THÊM VÀO GIỎ
          </button>

          {/* Mô tả sản phẩm */}
          <div className={styles.productDescription}>
            <h3>Mô tả</h3>
            <p>{product.description}</p>
            <p>Chất liệu: vải nỉ da cá cao cấp</p>
            <p>Hướng dẫn bảo quản:</p>
            <ul>
              <li>Không dùng hóa chất tẩy</li>
              <li>Ủi ở nhiệt độ thích hợp</li>
              <li>Giặt ở chế độ bình thường</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
