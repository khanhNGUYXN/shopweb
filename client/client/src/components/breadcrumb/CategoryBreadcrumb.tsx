import React from 'react';
import { useParams } from 'react-router-dom';

const categoryMap: Record<string, string> = {
  aokhoac: 'Áo Khoác',
  aothun: 'Áo Thun',
  somi: 'Sơ Mi',
  // ... thêm các danh mục khác
};

const CategoryBreadcrumb: React.FC = () => {
  // Lấy tham số 'category' từ URL
  const { category } = useParams();

  // Map sang tên hiển thị đẹp, nếu không có thì trả về category gốc
  const categoryName = categoryMap[category || ''] || category;

  return (
    <div className="breadcrumb">
      Trang chủ / Danh mục / <strong>{categoryName}</strong>
    </div>
  );
};

export default CategoryBreadcrumb;
