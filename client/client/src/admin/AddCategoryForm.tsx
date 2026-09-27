import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './AddCategoryForm.module.css'; // Sử dụng kiểu dáng từ CSS Module

interface Category {
  id: number;
  name: string;
}

const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // State cho form thêm category
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // State cho inline edit
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  // Hàm lấy danh sách category từ API
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/categories/all');
      // Lấy mảng category từ trường data
      setCategories(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách category:', error);
      setError('Có lỗi xảy ra khi tải danh sách category.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Chuyển sang chế độ thêm category
  const handleAddClick = () => {
    setIsAdding(true);
    setMessage('');
    setNewCategoryName('');
  };

  // Xử lý submit form thêm category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/categories/add', { name: newCategoryName });
      setIsSubmitted(true);
      setMessage('Category đã được thêm thành công');
      // Làm mới danh sách category
      fetchCategories();
      // Chuyển về bảng danh sách sau khi thêm thành công
      setIsAdding(false);
    } catch (error) {
      console.error('Lỗi khi thêm category:', error);
      setMessage('Có lỗi xảy ra khi thêm category.');
    }
  };

  // Hàm xử lý xóa category
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa category này không?")) return;
    try {
      await axios.delete(`http://localhost:8080/categories/${id}/delete`);
      alert('Category đã được xóa thành công');
      fetchCategories(); // Cập nhật lại danh sách sau khi xóa
    } catch (error) {
      console.error('Lỗi khi xóa category:', error);
      alert('Có lỗi xảy ra khi xóa category.');
    }
  };

  // Hàm bắt đầu chỉnh sửa inline
  const handleEdit = (id: number, currentName: string) => {
    setEditingCategoryId(id);
    setEditingName(currentName);
    setMessage('');
  };

  // Hàm cập nhật category khi đã chỉnh sửa xong
  const handleUpdate = async (id: number) => {
    try {
      await axios.put(`http://localhost:8080/categories/${id}/update`, { name: editingName });
      alert('Category đã được cập nhật thành công');
      setEditingCategoryId(null);
      setEditingName('');
      fetchCategories();
    } catch (error) {
      console.error('Lỗi khi cập nhật category:', error);
      alert('Có lỗi xảy ra khi cập nhật category.');
    }
  };

  // Hàm hủy chỉnh sửa
  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditingName('');
  };

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.resetContainer}>
      <h2 className={styles.title}>Quản Lý Category</h2>
      
      {isAdding ? (
        <>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputWrapper}>
              <label htmlFor="newCategoryName" className={styles.label}>Tên Category:</label>
              <input
                type="text"
                id="newCategoryName"
                name="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <button type="submit" className={styles.button}>Thêm Category</button>
          </form>
          {message && <p className={styles.message}>{message}</p>}
          <div className={styles.backToList}>
            <button onClick={() => setIsAdding(false)} className={styles.button}>Quay lại danh sách</button>
          </div>
        </>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Category</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id} style={{ borderBottom: '1px solid #ccc' }}>
                  <td>{category.id}</td>
                  <td>
                    {editingCategoryId === category.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className={styles.input}
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td>
                    {editingCategoryId === category.id ? (
                      <>
                        <button onClick={() => handleUpdate(category.id)} className={styles.button}>
                          Cập nhật
                        </button>
                        <button onClick={handleCancelEdit} className={styles.button} style={{ marginLeft: '8px' }}>
                          Hủy
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleEdit(category.id, category.name)} className={styles.editButton}>
                        Sửa
                      </button>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleDelete(category.id)} className={styles.deleteButton}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'center' }}>
            <button onClick={handleAddClick} className={styles.button}>
              Thêm Category Mới
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryManagementPage;
