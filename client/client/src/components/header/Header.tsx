import React, { useEffect, useState, useCallback  } from 'react';
import { FaSearch, FaShoppingCart, FaBars } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import SearchOverlay from '../search/SearchOverlay';
import CartOverlay from '../cart/CartOverlay';
import MenuOverlay from '../menu/MenuOverlay';
import { fetchCategories, Category, Product } from '../../service/apiService';
import './Header.css';

// Hàm debounce đơn giản
const debounce = (func: Function, delay: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);
  const navigate = useNavigate();

  // Lấy danh mục sản phẩm chỉ khi component mount
  useEffect(() => {
    let isMounted = true;
    fetchCategories()
      .then((data) => {
        if (isMounted) setCategories(data);
      })
      .catch((error) => console.error('Error fetching categories:', error));
    return () => {
      isMounted = false;
    };
    
  }, []);

  // Cập nhật số lượng sản phẩm trong giỏ từ localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((total: number, item: any) => total + item.quantity, 0);
      setCartCount(count);
    };

    const intervalId = setInterval(updateCartCount, 500);

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  // Xử lý sự kiện cuộn với debounce
  useEffect(() => {
    const handleScroll = debounce(() => {
      setScrolled(window.scrollY > 100);
    }, 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sử dụng useCallback cho các hàm toggle để tránh tạo lại không cần thiết
  const toggleSearch = useCallback(() => setShowSearch(prev => !prev), []);
  const toggleCart = useCallback(() => setShowCart(prev => !prev), []);
  const toggleMenu = useCallback(() => setShowMenu(prev => !prev), []);

  // Kiểm tra token và điều hướng người dùng
  const handleUserAvatarClick = useCallback(async () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
  
    if (!accessToken) return navigate('/login');
  
    // Hàm kiểm tra token
    const checkToken = async (accessToken: string) => {
      const response = await fetch('http://localhost:8080/auth/introspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });
      return response.ok ? response.json() : null;
    };
  
    try {
      const accessData = await checkToken(accessToken);
      if (accessData?.valid) {
        const roles = accessData.roles || [];
        // Điều hướng dựa trên vai trò của người dùng
        if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_EMPLOYEE')) {
          return navigate('/admin');
        } else if (roles.includes('ROLE_USER')) {
          return navigate('/account');
        } else {
          return navigate('/login');
        }
      }
  
      if (!refreshToken) return navigate('/login');
  
      const refreshData = await checkToken(refreshToken);
      if (refreshData?.valid) {
        const tokenResponse = await fetch('http://localhost:8080/auth/refresh-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, refreshToken })
        });
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          localStorage.setItem('accessToken', tokenData.accessToken);
          localStorage.setItem('refreshToken', tokenData.refreshToken);
          return navigate('/account');
        }
      }
      // Xóa token: Nếu không có token hợp lệ hoặc làm mới không thành công
    
      navigate('/login');
    } catch (error) {
      console.error('Error checking tokens:', error);
      // Xóa token: Nếu không có token hợp lệ hoặc làm mới không thành công
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  }, [navigate]);
  
  return (
    <>
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <div className="header-container">
          {scrolled ? (
            <div className="scrolled-row">
              <div className="logo">
                <Link to="/">
                  <img 
                    src="https://file.hstatic.net/1000096703/file/logo_website__191___70_px__979fdef210f7474d8a09b42724033b5c.png" 
                    alt="Kenta" 
                  />
                </Link>
              </div>
              <nav className="nav scrolled-nav">
                <ul>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <li key={category.id}>
                        <Link to={`/danh-muc/${encodeURIComponent(category.name)}`}>{category.name}</Link>
                      </li>
                    ))
                  ) : (
                    <li><Link to="/danh-muc/all">Tất Cả</Link></li>
                  )}
                  <li><Link to="/danh-muc/all">Tất Cả</Link></li>
                </ul>
              </nav>
              <div className="header-icons">
                <div className="icon" onClick={toggleSearch}>
                  <FaSearch />
                </div>
                <div className="icon fa_cart" onClick={toggleCart}>
                  {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                  <FaShoppingCart />  
                </div>
                <div className="icon fa_bars" onClick={toggleMenu}>
                  <FaBars />  
                </div>
                {/* Icon user-avatar không dùng Link mà dùng onClick để kiểm tra token */}
                <div className="icon user-avatar" onClick={handleUserAvatarClick}>
                  <img
                    src="https://png.pngtree.com/png-clipart/20200701/original/pngtree-black-default-avatar-png-image_5407174.jpg"
                    alt="User"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="top-row">
                <div className="logo">
                  <Link to="/">
                    <img 
                      src="https://file.hstatic.net/1000096703/file/logo_website__191___70_px__979fdef210f7474d8a09b42724033b5c.png" 
                      alt="Kenta" 
                    />
                  </Link>
                </div>
              </div>
              <nav className="nav nav-below">
                <ul>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <li key={category.id}>
                        <Link to={`/danh-muc/${encodeURIComponent(category.name)}`}>{category.name}</Link>
                      </li>
                    ))
                  ) : (
                    <li><Link to="/danh-muc/All">Tất Cả</Link></li>
                  )}
                  <li><Link to="/danh-muc/All">Tất Cả</Link></li>
                </ul>
              </nav>
              <div className="header-icons top-icons">
                <div className="icon" onClick={toggleSearch}>
                  <FaSearch />
                </div>
                <div className="icon fa_cart" onClick={toggleCart}>
                  <FaShoppingCart />
                  {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                </div>
                <div className="icon fa_bars" onClick={toggleMenu}>
                  <FaBars />
                </div>
                <div className="icon user-avatar" onClick={handleUserAvatarClick}>
                  <img
                    src="https://png.pngtree.com/png-clipart/20200701/original/pngtree-black-default-avatar-png-image_5407174.jpg"
                    alt="User" 
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {showSearch && <SearchOverlay onClose={toggleSearch} />}
      {showCart && <CartOverlay onClose={toggleCart} />}
      <MenuOverlay isOpen={showMenu} onClose={toggleMenu} />
    </>
  );
};

export default Header;
