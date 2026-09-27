import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import ChatbotAssistant from '../ChatbotAssistant';

const Layout: React.FC = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet /> {/* Nơi chứa nội dung của các trang con */}
      </main>
      <Footer />
        <ChatbotAssistant />
    </>
  );
};

export default Layout;
