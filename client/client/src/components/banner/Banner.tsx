import React, { useEffect, useState } from 'react';
import './Banner.css';

import ship10k from '../../asset/image/ship10k.png';
import quantay from '../../asset/image/quantay_sm.png';
import image3 from '../../asset/image/3_0a7a77ed7b9a47559470b670c990c00b.png';
import image4 from '../../asset/image/2_369e0657e5b34e04bd9c3a94372ad66b.png';


const images = [ship10k, quantay, image3, image4];

const Banner: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Thay đổi ảnh sau mỗi 5 giây

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="banner"
      id="home"
      style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
    >
      {/* Nội dung banner */}
    </section>
  );
};

export default Banner;
