import { AxiosResponse } from 'axios';
import { RegisterRequest, ShopRequest, AppointmentRequest, ApiResponse } from '../types';
declare class ApiService {
    private baseURL;
    constructor();
    private makeRequest;
    register(userData: RegisterRequest): Promise<AxiosResponse<ApiResponse>>;
    getPublicShops(search?: string): Promise<AxiosResponse<ApiResponse>>;
    getShopBySlug(slug: string): Promise<AxiosResponse<ApiResponse>>;
    getAvailability(slug: string, date: string): Promise<AxiosResponse<ApiResponse>>;
    getUserShops(sessionToken: string): Promise<AxiosResponse<ApiResponse>>;
    createShop(shopData: ShopRequest, sessionToken: string): Promise<AxiosResponse<ApiResponse>>;
    createAppointment(appointmentData: AppointmentRequest): Promise<AxiosResponse<ApiResponse>>;
    deleteAppointment(appointmentId: string): Promise<AxiosResponse<ApiResponse>>;
}
export declare const apiService: ApiService;
export {};
//# sourceMappingURL=apiService.d.ts.map