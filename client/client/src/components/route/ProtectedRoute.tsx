// ProtectedRoute.tsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

interface DecodedToken {
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setIsLoading(false);
      setIsValid(false);
      return;
    }

    fetch('http://localhost:8080/auth/introspect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Token invalid');
        }
        return response.json();
      })
      .then((data) => {
        // Giả sử API trả về { valid: true } nếu token hợp lệ
        if (data.valid) {
          // Nếu có yêu cầu roles, kiểm tra xem token có chứa role cần thiết không
          if (requiredRoles && requiredRoles.length > 0) {
            try {
              const decoded: DecodedToken = jwtDecode(token);
              const tokenRoles = decoded.roles || [];
              const hasRequired = requiredRoles.some(role => tokenRoles.includes(role));
              setIsValid(hasRequired);
            } catch (error) {
              console.error('Error decoding token:', error);
              setIsValid(false);
            }
          } else {
            setIsValid(true);
          }
        } else {
          setIsValid(false);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error validating token:', error);
        setIsValid(false);
        setIsLoading(false);
      });
  }, [requiredRoles]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
