import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AddProductForm.module.css';

interface Category {
  id: number;
  name: string;
}

const AddProductForm: React.FC = () => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    quantity: 0,
    categories: [] as Category[]
  });
  // Chuyển phần sizes và colors sang bên phải
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState<string>('');

  const getToken = () => localStorage.getItem('accessToken') || '';

  useEffect(() => {
    axios
      .get('http://localhost:8080/categories/all', {
        headers: {
          accesstoken: getToken()
        }
      })
      .then(response => {
        const data = response.data;
        const categoriesArray = Array.isArray(data) ? data : (data.data ? data.data : []);
        setCategories(categoriesArray);
      })
      .catch(error => {
        console.error('Lỗi khi lấy danh sách categories:', error);
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý thay đổi kích thước
  const handleAddSize = () => {
    setSizes(prev => [...prev, '']);
  };

  const handleSizeChange = (index: number, value: string) => {
    const updatedSizes = [...sizes];
    updatedSizes[index] = value;
    setSizes(updatedSizes);
  };

  // Xử lý thay đổi màu sắc
  const handleAddColor = () => {
    setColors(prev => [...prev, '']);
  };

  const handleColorChange = (index: number, value: string) => {
    const updatedColors = [...colors];
    updatedColors[index] = value;
    setColors(updatedColors);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategoryId = parseInt(e.target.value);
    const selectedCategory = categories.find(c => c.id === selectedCategoryId);
    if (selectedCategory) {
      setProduct(prev => ({
        ...prev,
        categories: [selectedCategory]
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Tạo payload theo định dạng JSON yêu cầu
    const payload = {
      name: product.name,
      price: Number(product.price),
      description: product.description,
      stockQuantity: product.quantity,
      category_id: product.categories.length > 0 ? { name: product.categories[0].name } : null,
      sizes: sizes.map(size => ({ name: size })),
      colors: colors.map(color => ({ name: color }))
    };

    try {
      const response = await axios.post('http://localhost:8080/products/add', payload, {
        headers: {
          'Content-Type': 'application/json',
          accesstoken: getToken()
        }
      });
      const createdProduct = response.data.data;
      console.log('Sản phẩm đã được thêm:', createdProduct);
      alert('Sản phẩm đã được thêm thành công!');
      // Upload ảnh nếu có
      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach(image => {
          formData.append('files', image);
        });
        const uploadUrl = `http://localhost:8080/api/v1/images/upload/${createdProduct.id}`;
        await axios.post(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            accesstoken: getToken()
          }
        });
      }
      // Reset form
      setProduct({
        name: '',
        description: '',
        price: '',
        quantity: 0,
        categories: []
      });
      setSizes([]);
      setColors([]);
      setSelectedImages([]);
      setMessage('Sản phẩm đã được thêm thành công!');
    } catch (error: any) {
      console.error('Lỗi khi thêm sản phẩm hoặc upload ảnh:', error.response || error.message);
      alert('Có lỗi xảy ra khi thêm sản phẩm hoặc upload ảnh.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Thêm Sản Phẩm Mới</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formContainer}>
          {/* Cột bên trái: Các thông tin chung */}
          <div className={styles.leftSide}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Tên Sản Phẩm:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={product.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="description">Mô Tả:</label>
              <textarea
                id="description"
                name="description"
                value={product.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="price">Giá:</label>
              <input
                type="text"
                id="price"
                name="price"
                value={product.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="quantity">Số Lượng:</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={product.quantity}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="category">Chọn Category:</label>
              <select className={styles.selectedCategory} onChange={handleCategoryChange} required value={product.categories.length > 0 ? product.categories[0].id : ''}>
                <option value="">Chọn một category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Cột bên phải: Kích thước, màu sắc, category, và ảnh */}
          <div className={styles.rightSide}>
            <div className={styles.formGroup}>
              <label htmlFor="sizes">Kích Thước:</label>
              {sizes.map((size, index) => (
                <input
                  key={index}
                  type="text"
                  value={size}
                  onChange={(e) => handleSizeChange(index, e.target.value)}
                  placeholder="Nhập kích thước"
                  className={styles.inputktm}
                />
              ))}
              <button type="button" onClick={handleAddSize} className={styles.addButton}>Thêm Kích Thước</button>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="colors">Màu Sắc:</label>
              {colors.map((color, index) => (
                <input
                  key={index}
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  placeholder="Nhập màu sắc"
                  className={styles.inputktm}
                />
              ))}
              <button type="button" onClick={handleAddColor} className={styles.addButton}>Thêm Màu Sắc</button>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="images">Hình Ảnh:</label>
              <input
                className={styles.inputImages}
                type="file"
                id="images"
                name="images"
                multiple
                onChange={handleImageChange}
                required
              />
              {/* Hiển thị preview các ảnh đã chọn */}
              {selectedImages.length > 0 && (
                <div className={styles.imagePreviewContainer}>
                  {selectedImages.map((file, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt={`preview ${index}`}
                      className={styles.imagePreview}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.centerButton}>
          <button type="submit" className={styles.submitButton}>Thêm Sản Phẩm</button>
        </div>
      </form>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default AddProductForm;
