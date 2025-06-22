import axios, { AxiosResponse } from 'axios';
import { config } from '../config/database';
import { 
  RegisterRequest, 
  ShopRequest, 
  AppointmentRequest,
  ApiResponse 
} from '../types';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = config.API_BASE_URL;
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<AxiosResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method,
      url,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    return axios(config);
  }

  // Auth endpoints
  async register(userData: RegisterRequest): Promise<AxiosResponse<ApiResponse>> {
    return this.makeRequest<ApiResponse>('POST', '/auth/register', userData);
  }

  // Shop endpoints
  async getPublicShops(search?: string): Promise<AxiosResponse<ApiResponse>> {
    const endpoint = search ? `/shops/public?search=${search}` : '/shops/public';
    return this.makeRequest<ApiResponse>('GET', endpoint);
  }

  async getShopBySlug(slug: string): Promise<AxiosResponse<ApiResponse>> {
    return this.makeRequest<ApiResponse>('GET', `/shops/${slug}`);
  }

  async getAvailability(slug: string, date: string): Promise<AxiosResponse<ApiResponse>> {
    return this.makeRequest<ApiResponse>('GET', `/shops/${slug}/availability?date=${date}`);
  }

  async getUserShops(sessionToken: string): Promise<AxiosResponse<ApiResponse>> {
    return this.makeRequest<ApiResponse>('GET', '/shops', undefined, {
      Cookie: `next-auth.session-token=${sessionToken}`
    });
  }

  async createShop(shopData: ShopRequest, sessionToken: string): Promise<AxiosResponse<ApiResponse>> {
    return this.makeRequest<ApiResponse>('POST', '/shops', shopData, {
      Cookie: `next-auth.session-token=${sessionToken}`
    });
  }

  // Appointment endpoints
  async createAppointment(appointmentData: AppointmentRequest): Promise<AxiosResponse<ApiResponse>> {
    return this.makeRequest<ApiResponse>('POST', '/appointments', appointmentData);
  }
}

export const apiService = new ApiService(); 