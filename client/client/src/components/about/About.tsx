// src/components/About.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './About.css';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  thumbnail: string;
  // Các trường khác nếu cần
}

interface AboutItem {
  image: string;
  alt: string;
  title: string;
}

const About: React.FC = () => {
  const [aboutItems, setAboutItems] = useState<AboutItem[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 6;

  // Hàm fetch danh mục và lấy sản phẩm đầu tiên của từng danh mục
  useEffect(() => {
    // Lấy danh mục từ API
    axios
      .get('http://localhost:8080/categories/all')
      .then((catResponse) => {
        // Giả sử API trả về { message: "...", data: [ { id, name }, ... ] }
        const categories: Category[] = catResponse.data.data;
        // Với mỗi danh mục, gọi API lấy sản phẩm đầu tiên (size=1)
        const promises = categories.map((cat) =>
          axios
            .get('http://localhost:8080/products/category', {
              params: { name: cat.name, page: 0, size: 1 },
            })
            .then((prodResponse) => {
              // Giả sử API trả về { message: "...", data: { content: [ ... ] } }
              const pageData = prodResponse.data.data;
              const firstProduct: Product | undefined =
                pageData.content && pageData.content.length > 0
                  ? pageData.content[0]
                  : undefined;
              return {
                title: cat.name,
                alt: cat.name,
                image: firstProduct
                  ? firstProduct.thumbnail
                  : 'https://cdn.pixabay.com/photo/2024/11/11/14/34/parakeets-9190236_640.jpg', // fallback nếu không có sản phẩm
              } as AboutItem;
            })
            .catch((error) => {
              console.error(
                `Error fetching product for category ${cat.name}:`,
                error
              );
              // Nếu lỗi, vẫn trả về AboutItem với hình ảnh mặc định
              return {
                title: cat.name,
                alt: cat.name,
                image:
                  'https://cdn.pixabay.com/photo/2024/11/11/14/34/parakeets-9190236_640.jpg',
              } as AboutItem;
            })
        );

        // Khi tất cả promise hoàn thành
        Promise.all(promises).then((items) => {
          setAboutItems(items);
        });
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  const nextSlide = () => {
    if (startIndex + itemsPerPage < aboutItems.length) {
      setStartIndex(startIndex + itemsPerPage);
    }
  };

  const prevSlide = () => {
    if (startIndex - itemsPerPage >= 0) {
      setStartIndex(startIndex - itemsPerPage);
    }
  };

  // Lấy ra các item cần hiển thị dựa trên startIndex
  const displayedItems = aboutItems.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className="about container" id="about">
      <div className="about-slider">
        <button
          className="slider-btn left"
          onClick={prevSlide}
          disabled={startIndex === 0}
        >
          &#9664;
        </button>

        <div className="about-items-wrapper">
          {displayedItems.map((item, index) => (
            // Bọc mỗi about-item bằng Link để chuyển hướng theo danh mục
            <Link
              to={`/danh-muc/${item.title}`}
              key={startIndex + index}
              className="about-item-link"
            >
              <div className="about-item">
                <img src={`http://localhost:8080${item.image}`} alt={item.alt} />

                <div className="about-overlay">
                  <span>{item.title}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <button
          className="slider-btn right"
          onClick={nextSlide}
          disabled={startIndex + itemsPerPage >= aboutItems.length}
        >
          &#9654;
        </button>
      </div>
    </section>
  );
};

export default About;
