// src/services/apiService.ts
import axios from 'axios';

export interface Category {
    id: number;
    name: string;
}

export interface Product {
  id: number;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export const fetchCategories = async (): Promise<Category[]> => {
    try {
      const response = await axios.get('http://localhost:8080/categories/all');
      // Trả về mảng danh mục nằm trong response.data.data
      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh mục:', error);
      throw error;
    }
  };
  

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await axios.get<Product[]>('https://api.example.com/products');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm:', error);
    throw error;
  }
};
