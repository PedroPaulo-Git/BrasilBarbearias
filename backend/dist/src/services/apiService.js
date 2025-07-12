"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiService = void 0;
const axios_1 = __importDefault(require("axios"));
const database_1 = require("../config/database");
class ApiService {
    constructor() {
        this.baseURL = database_1.config.API_BASE_URL;
    }
    async makeRequest(method, endpoint, data, headers) {
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
        return (0, axios_1.default)(config);
    }
    async register(userData) {
        return this.makeRequest('POST', '/auth/register', userData);
    }
    async getPublicShops(search) {
        const endpoint = search ? `/shops/public?search=${search}` : '/shops/public';
        return this.makeRequest('GET', endpoint);
    }
    async getShopBySlug(slug) {
        return this.makeRequest('GET', `/shops/${slug}`);
    }
    async getAvailability(slug, date) {
        return this.makeRequest('GET', `/shops/${slug}/availability?date=${date}`);
    }
    async getUserShops(sessionToken) {
        return this.makeRequest('GET', '/shops', undefined, {
            Cookie: `next-auth.session-token=${sessionToken}`
        });
    }
    async createShop(shopData, sessionToken) {
        return this.makeRequest('POST', '/shops', shopData, {
            Cookie: `next-auth.session-token=${sessionToken}`
        });
    }
    async createAppointment(appointmentData) {
        return this.makeRequest('POST', '/appointments', appointmentData);
    }
    async deleteAppointment(appointmentId) {
        return this.makeRequest('DELETE', `/appointments/${appointmentId}`);
    }
}
exports.apiService = new ApiService();
//# sourceMappingURL=apiService.js.map