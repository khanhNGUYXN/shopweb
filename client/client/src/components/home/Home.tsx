// src/pages/Home.tsx
import React from 'react';
import Banner from '../banner/Banner';
import NewProducts from '../product/NewProducts';
import About from '../about/About';

const Home: React.FC = () => {
  return (
    <>
      <Banner />
      {/* Sản phẩm mới ngay dưới banner */}
      <NewProducts />
      <About />
    </>
  );
};

export default Home;
