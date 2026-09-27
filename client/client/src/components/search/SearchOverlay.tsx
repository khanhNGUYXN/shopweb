import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import './SearchOverlay.css';

interface SearchOverlayProps {
  onClose: () => void;
}

interface Product {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate(); // Hook điều hướng

  const handleClose = () => {
    setIsClosing(true);
  };

  const handleAnimationEnd = () => {
    if (isClosing) {
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setError('');
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      setError('');
      axios
        .get('http://localhost:8080/products/search', {
          params: { name: query }
        })
        .then((response) => {
          setResults(response.data.data.content);
          setLoading(false);
        })
        .catch((err: AxiosError) => {
          if (err.response && err.response.status === 404) {
            setError('Không tìm thấy sản phẩm');
            setResults([]);
          } else {
            setError('Lỗi khi tìm kiếm sản phẩm');
          }
          setLoading(false);
        });
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleProductClick = (id: number) => {
    onClose(); 
    setTimeout(() => navigate(`/product/${id}`), 300);
  };

  return (
    <div
      className={`search-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        className={`search-content ${isClosing ? 'slide-out' : 'slide-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={handleClose}>
          ×
        </button>
        <h3>TÌM KIẾM</h3>
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            autoFocus
            onChange={handleInputChange}
          />
        </div>
        {loading && <p>Đang tìm kiếm...</p>}
        {error && <p className="error">{error}</p>}
        {results.length > 0 && (
          <div className="search-results">
            {results.map((item) => (
              <div
                key={item.id}
                className="cart-item"
                onClick={() => handleProductClick(item.id)} // Điều hướng khi bấm
                style={{ cursor: 'pointer' }} // Hiệu ứng con trỏ chuột
              >
                <div className="item-left">
                  <img src={`http://localhost:8080${item.thumbnail}`} alt={item.name} className="item-image" />
                </div>
                <div className="item-right">
                  <div className="item-header">
                    <span className="item-name">{item.name}</span>
                  </div>
                  <div className="item-info">
                    <span className="item-price">{item.price.toLocaleString()}₫</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
