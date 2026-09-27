// src/components/products/ProductList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import './ProductList.css';

interface ProductImage {
  id: number;
  imageUrl: string;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
  images: ProductImage[];
}

interface ProductPage {
  content: Product[];
  totalPages: number;
  totalElements: number;
  number: number; // current page index (0-indexed)
}

const ProductList: React.FC = () => {
  // Lấy tham số category từ URL, ví dụ: /danh-muc/All hoặc /danh-muc/Vest
  const { category } = useParams<{ category: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Các state cho phân trang và sắp xếp
  const [sortOption, setSortOption] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState<number>(1); // 1-indexed cho giao diện người dùng
  const productsPerPage = 4;

  // Reset trang về 1 khi category thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [category]);

  // Gọi API dựa vào giá trị của category và tham số phân trang
  useEffect(() => {
    setLoading(true);
    let apiUrl = '';
    let params: any = { page: currentPage - 1, size: productsPerPage }; // server phân trang 0-indexed

    if (category && category.toLowerCase() === 'all') {
      // Nếu category là "All", gọi API lấy tất cả sản phẩm
      apiUrl = 'http://localhost:8080/products/all';
    } else {
      // Nếu không, gọi API theo tên danh mục
      apiUrl = 'http://localhost:8080/products/category';
      params.name = category; // gửi tham số name với giá trị có dấu (API không dùng slug)
    }

    axios
      .get(apiUrl, { params })
      .then((response) => {
        // Giả sử API trả về dạng: { message: "...", data: { content: [...], totalPages: x, ... } }
        const productPage: ProductPage = response.data.data;
        setProducts(productPage ? productPage.content : []);
        setTotalPages(productPage ? productPage.totalPages : 0);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          // Nếu không tìm thấy sản phẩm, đặt mảng sản phẩm rỗng và không hiển thị lỗi
          setProducts([]);
          setTotalPages(0);
          setLoading(false);
        } else {
          console.error('Error fetching products:', err);
          setError('Lỗi khi tải sản phẩm');
          setLoading(false);
        }
      });
  }, [category, currentPage, productsPerPage]);

  // Xử lý lựa chọn sắp xếp (thực hiện sắp xếp phía client trên dữ liệu đã lấy)
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi sắp xếp
  };

  // Base URL cho ảnh (tiền tố cho URL ảnh từ API)
  const imageBaseUrl = 'http://localhost:8080';

  const sortedProducts = useMemo(() => {
    let sorted = [...products];
    switch (sortOption) {
      case 'priceAsc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'nameAsc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return sorted;
  }, [sortOption, products]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div className="filter-bar">
        <label htmlFor="sort-select">Sắp xếp: </label>
        <select id="sort-select" value={sortOption} onChange={handleSortChange}>
          <option value="default">Mặc định</option>
          <option value="priceAsc">Giá: Tăng dần</option>
          <option value="priceDesc">Giá: Giảm dần</option>
          <option value="nameAsc">Tên: A-Z</option>
        </select>
      </div>

      {sortedProducts.length === 0 ? (
        <p>Không có sản phẩm trong danh mục này.</p>
      ) : (
        <div className="product-list">
          {sortedProducts.map((item: Product) => (
            <div className="product-card" key={item.id}>
              <Link className="custom-link" to={`/product/${item.id}`}>
                <img src={`${imageBaseUrl}${item.thumbnail}`} alt={item.name} className="product-image" />
                <h3 className="product-name">{item.name}</h3>
              </Link>
              <p className="product-price">{item.price.toLocaleString('vi-VN')}₫</p>
            </div>
          ))}
        </div>
      )}

      <div className="pagination">
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Prev
        </button>
        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1;
          return (
            <button 
              key={page} 
              className={currentPage === page ? 'active' : ''}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          );
        })}
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductList;
