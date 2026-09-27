import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './EditProductForm.module.css';
import { useLocation, useNavigate } from 'react-router-dom';

interface Category {
  id: number;
  name: string;
}

interface Image {
  id: number;
  imageUrl: string;
  createdAt?: string;
}

interface Size {
  id: number;
  name: string;
}

interface Color {
  id: number;
  name: string;
}

interface ProductState {
  id: number;
  name: string;
  description: string;
  price: string;
  quantity: number;
  categories: Category[];
  images: Image[];
  sizes: Size[];
  colors: Color[];
  thumbnail?: string;
}

// Chuyển đổi dữ liệu truyền qua state nếu cần thiết
const getInitialProduct = (state: any): ProductState => {
  if (!state) {
    return {
      id: 0,
      name: '',
      description: '',
      price: '',
      quantity: 0,
      categories: [],
      images: [],
      sizes: [],
      colors: [],
      thumbnail: ''
    };
  }
  return {
    id: state.id || 0,
    name: state.name || '',
    description: state.description || '',
    price: state.price ? String(state.price) : '',
    quantity: state.stockQuantity || 0,
    // Nếu không có categories nhưng có category, chuyển đổi thành mảng
    categories: state.categories 
                ? state.categories 
                : state.category 
                  ? [state.category] 
                  : [],
    images: state.images || [],
    sizes: state.sizes || [],
    colors: state.colors || [],
    // Nếu không có thumbnail, lấy ảnh đầu tiên trong mảng images nếu có
    thumbnail: state.thumbnail || (state.images && state.images.length > 0 ? state.images[0].imageUrl : '')
  };
};

const EditProductForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialProduct: ProductState = getInitialProduct(location.state);
  
  const [product, setProduct] = useState<ProductState>(initialProduct);
  // Khởi tạo sizes và colors từ dữ liệu hiện có (lấy tên từ mảng đối tượng)
  const [sizes, setSizes] = useState<string[]>(
    initialProduct.sizes.length ? initialProduct.sizes.map(s => s.name) : []
  );
  const [colors, setColors] = useState<string[]>(
    initialProduct.colors.length ? initialProduct.colors.map(c => c.name) : []
  );
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState<string>('');

  const getToken = () => localStorage.getItem('accessToken') || '';

  useEffect(() => {
    axios
      .get('http://localhost:8080/categories/all', {
        headers: { accesstoken: getToken() }
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

  // Xử lý kích thước
  const handleAddSize = () => {
    setSizes(prev => [...prev, '']);
  };

  const handleSizeChange = (index: number, value: string) => {
    const updatedSizes = [...sizes];
    updatedSizes[index] = value;
    setSizes(updatedSizes);
  };

  // Xử lý màu sắc
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
      // Cập nhật sản phẩm
      const response = await axios.put(`http://localhost:8080/products/update/${product.id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          accesstoken: getToken()
        }
      });
      const updatedProduct = response.data.data;
      console.log('Sản phẩm đã được cập nhật:', updatedProduct);
      setMessage('Sản phẩm đã được cập nhật thành công!');
      
      // Xử lý ảnh
      if (selectedImages.length > 0) {
        const updatePromises: Promise<any>[] = [];
        const existingImagesCount = product.images ? product.images.length : 0;
        
        // Cập nhật các ảnh đã tồn tại (sử dụng API PUT)
        for (let i = 0; i < Math.min(existingImagesCount, selectedImages.length); i++) {
          const formData = new FormData();
          formData.append("file", selectedImages[i]);
          updatePromises.push(
            axios.put(`http://localhost:8080/api/v1/images/update/${product.images[i].id}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                accesstoken: getToken()
              }
            })
          );
        }
        // Nếu số ảnh mới vượt quá số ảnh hiện có, upload ảnh mới (sử dụng API POST)
        if (selectedImages.length > existingImagesCount) {
          for (let i = existingImagesCount; i < selectedImages.length; i++) {
            const formData = new FormData();
            formData.append("files", selectedImages[i]);
            updatePromises.push(
              axios.post(`http://localhost:8080/images/upload/${product.id}`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                  accesstoken: getToken()
                }
              })
            );
          }
        }
        await Promise.all(updatePromises);
      }
      
      navigate('/admin/all-products');
    } catch (error: any) {
      console.error('Lỗi khi cập nhật sản phẩm hoặc ảnh:', error.response || error.message);
      alert('Có lỗi xảy ra khi cập nhật sản phẩm hoặc ảnh.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Chỉnh Sửa Sản Phẩm</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formContainer}>
          {/* Cột bên trái: Thông tin chung */}
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
              <select
                className={styles.selectedCategory}
                onChange={handleCategoryChange}
                required
                value={product.categories && product.categories.length > 0 ? product.categories[0].id : ''}
              >
                <option value="">Chọn một category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Cột bên phải: Kích thước, màu sắc và hình ảnh */}
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
              <button type="button" onClick={handleAddSize} className={styles.addButton}>
                Thêm Kích Thước
              </button>
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
              <button type="button" onClick={handleAddColor} className={styles.addButton}>
                Thêm Màu Sắc
              </button>
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
              />
              {/* Preview ảnh được chọn */}
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
              {/* Nếu không chọn ảnh mới, hiển thị các ảnh hiện có từ mảng images */}
              {!selectedImages.length && product.images && product.images.length > 0 && (
                <div className={styles.imagePreviewContainer}>
                  {product.images.map((img, index) => (
                    <img
                      key={index}
                      src={`http://localhost:8080${img.imageUrl}`}
                      alt={`Image ${index}`}
                      className={styles.imagePreview}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.centerButton}>
            <button type="submit" className={styles.submitButton}>
                Cập Nhật Sản Phẩm
            </button>
            <button
                type="button"
                className={styles.cancelButton}
                onClick={() => navigate('/admin/all-products')}
            >
                Hủy
            </button>
        </div>

      </form>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default EditProductForm;
