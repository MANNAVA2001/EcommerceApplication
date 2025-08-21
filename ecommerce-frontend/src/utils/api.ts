import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const RECOMMENDATION_BASE_URL = process.env.NEXT_PUBLIC_RECOMMENDATION_URL || 'http://localhost:5001/recommendations';

const isProduction = process.env.NODE_ENV === 'production';
const isAzure = process.env.NEXT_PUBLIC_ENVIRONMENT === 'azure';

if (isProduction && isAzure && API_BASE_URL.startsWith('http://')) {
  console.warn('Warning: Using HTTP in production Azure environment. Consider using HTTPS.');
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: isAzure ? 30000 : 20000, // Longer timeout for Azure deployment
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false,
      maxRedirects: 5,
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401) {
          Cookies.remove('auth_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        if (error.response?.status === 429 && !originalRequest._retry) {
          originalRequest._retry = true;
          originalRequest._retryCount = originalRequest._retryCount || 0;
          
          if (originalRequest._retryCount < 3) {
            const delay = Math.pow(2, originalRequest._retryCount) * 1000;
            originalRequest._retryCount++;
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.client(originalRequest);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }
}

const apiClient = new ApiClient();

export { API_BASE_URL, RECOMMENDATION_BASE_URL };
export { apiClient };
export default apiClient;
