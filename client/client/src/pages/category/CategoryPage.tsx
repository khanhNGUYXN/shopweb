import React from 'react';
import { useParams } from 'react-router-dom';
import './CategoryPage.css';
import ProductList from '../product/ProductList';

// Mapping chuyển đổi slug sang tên danh mục hiển thị
const categoryMap: Record<string, string> = {
  aokhoac: 'Áo Khoác',
  aothun: 'Áo Thun',
  somi: 'Sơ Mi',
  quandai: 'Quần Dài',
  quanshort: 'Quần Short',
};

const CategoryPage: React.FC = () => {
  // Lấy tham số "category" từ URL (ví dụ: aokhoac, aothun, ...)
  const { category } = useParams<{ category: string }>();

  // Lấy tên danh mục hiển thị từ mapping, nếu không có thì hiển thị nguyên tham số
  const categoryName = categoryMap[category?.toLowerCase() || ''] || category;

  return (
    <div className="category-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span>Trang chủ</span> <span>Danh mục</span> / <strong>{categoryName}</strong>
      </div>
      <div className="product_list">
        <h1>{categoryName}</h1>
        <ProductList />
      </div>
    </div>
  );
};

export default CategoryPage;
