import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './NewProducts.module.css';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
}

const NewProducts: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get('http://localhost:8080/categories/all')
      .then((response) => {
        const categoryList: Category[] = response.data.data;
        setCategories(categoryList);
        if (categoryList.length > 0) {
          setSelectedCategory(categoryList[0].name);
        }
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    setLoading(true);
    axios
      .get('http://localhost:8080/products/category', {
        params: { name: selectedCategory, page: 0, size: 3 }
      })
      .then((response) => {
        const pageData = response.data.data;
        setProducts(pageData.content);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products for category:', error);
        setLoading(false);
      });
  }, [selectedCategory]);

  const handleCategoryChange = (catName: string) => {
    setProducts([]);
    setSelectedCategory(catName);
  };

  return (
    <div className={styles.newProducts}>
      <h2>Sản phẩm mới</h2>
      <div className={styles.categoryTabs}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.tabBtn} ${cat.name === selectedCategory ? styles.active : ''}`}
            onClick={() => handleCategoryChange(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className={styles.productList}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          products.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id} className={styles.noUnderline}>
              <div className={styles.productItem}>
                <div className={styles.productImage}>
                  <img src={`http://localhost:8080${product.thumbnail}`} alt={product.name} />
                </div>
                <p className={styles.productName}>{product.name}</p>
                <p className={styles.productPrice}>
                  {product.price.toLocaleString('vi-VN')}₫
                </p>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className={styles.seeMore}>
        <Link to={`/danh-muc/${selectedCategory}`} className={styles.btn}>
          Xem thêm
        </Link>
      </div>
    </div>
  );
};

export default NewProducts;
