import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ProductAdmin.module.css';
import { useNavigate } from 'react-router-dom';
interface Category {
  id: number;
  name: string;
}

interface Image {
  id: number;
  imageUrl: string;
}

interface Size {
  id: number;
  name: string;
}

interface Color {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  thumbnail: string;
  category: Category;
  images: Image[];
  sizes: Size[];
  colors: Color[];
}

interface PaginatedProducts {
  content: Product[];
  totalPages: number;
  number: number; // số trang hiện tại (0-indexed)
  totalElements: number;
}

const BASE_URL = "http://localhost:8080";

const AllProductsAdmin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const navigate = useNavigate();
  // Lấy danh sách danh mục từ API 
  useEffect(() => {
    axios.get(`${BASE_URL}/categories/all`)
      .then(response => {
        if (response.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        }
      })
      .catch(error => {
        console.error('Lỗi khi lấy danh sách danh mục:', error);
      });
  }, []);

  // Gọi API sản phẩm khi currentPage hoặc selectedCategory thay đổi
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      let url = "";
  
      if (searchTerm.trim() !== "") {
        url = `${BASE_URL}/products/search?name=${encodeURIComponent(searchTerm)}&page=${currentPage}&size=5`;
      } else if (selectedCategory === "all") {
        url = `${BASE_URL}/products/all?page=${currentPage}&size=5`;
      } else {
        url = `${BASE_URL}/products/category?name=${encodeURIComponent(selectedCategory)}&page=${currentPage}&size=5`;
      }
  
      axios.get(url)
        .then(response => {
          if (response.data && response.data.data && Array.isArray(response.data.data.content)) {
            const paginated: PaginatedProducts = response.data.data;
            setProducts(paginated.content);
            setTotalPages(paginated.totalPages);
          } else {
            setProducts([]);
          }
        })
        .catch(error => {
          console.error('Lỗi khi lấy danh sách sản phẩm:', error);
          setProducts([]);
        });
  
    }, 500); 
  
    return () => clearTimeout(delaySearch); // Hủy request trước đó nếu người dùng tiếp tục nhập
  }, [searchTerm, selectedCategory, currentPage]);
  
  

  // Lọc sản phẩm theo từ khóa tìm kiếm (lưu ý: phần lọc theo danh mục đã được thực hiện qua API)
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    navigate('/admin/edit-product', { state: product });
  };
  

  const fetchProducts = () => {
    let url = "";
  
    if (searchTerm.trim() !== "") {
      url = `${BASE_URL}/products/search?name=${encodeURIComponent(searchTerm)}&page=${currentPage}&size=5`;
    } else if (selectedCategory === "all") {
      url = `${BASE_URL}/products/all?page=${currentPage}&size=5`;
    } else {
      url = `${BASE_URL}/products/category?name=${encodeURIComponent(selectedCategory)}&page=${currentPage}&size=5`;
    }
  
    axios.get(url)
      .then(response => {
        if (response.data && response.data.data && Array.isArray(response.data.data.content)) {
          setProducts(response.data.data.content);
          setTotalPages(response.data.data.totalPages);
        } else {
          setProducts([]);
        }
      })
      .catch(error => {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error);
        setProducts([]);
      });
  };
  
  const handleDelete = (productId: number) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${productId}?`)) {
      axios.delete(`${BASE_URL}/products/delete/${productId}`)
        .then(response => {
          alert(`Sản phẩm ${productId} đã được xóa thành công!`);
          // Cập nhật danh sách sản phẩm sau khi xóa
          setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
          fetchProducts();
        })
        .catch(error => {
          console.error('Lỗi khi xóa sản phẩm:', error);
          alert('Có lỗi xảy ra khi xóa sản phẩm.');
        });
    }
  };
  

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Danh Sách Sản Phẩm</h2>
      <div className={styles.filters}>
        <select 
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(0); // reset về trang đầu khi thay đổi filter
          }}
          className={styles.select}
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map(category => (
            // Đặt option value là tên danh mục
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
        <input 
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.productGrid}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} className={styles.productCard}>
              <img
                src={product.thumbnail ? `${BASE_URL}${product.thumbnail}` : 'https://via.placeholder.com/150'}
                alt={product.name}
                className={styles.productImage}
              />
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productDescription}>{product.description}</p>
              <p className={styles.productPrice}>{product.price} đ</p>
              <div className={styles.actions}>
                <button 
                  className={styles.editButton} 
                  onClick={() => handleEdit(product)}
                >
                  Chỉnh Sửa
                </button>
                <button 
                  className={styles.deleteButton} 
                  onClick={() => handleDelete(product.id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noData}>Không có dữ liệu</p>
        )}
      </div>

      <div className={styles.pagination}>
        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0}>
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button 
            key={index} 
            onClick={() => goToPage(index)}
            className={currentPage === index ? styles.activePage : ''}
          >
            {index + 1}
          </button>
        ))}
        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages - 1}>
          Next
        </button>
      </div>
    </div>
  );
};

export default AllProductsAdmin;
