"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const apiService_1 = require("../services/apiService");
class AuthController {
    async register(req, res) {
        try {
            const userData = req.body;
            const response = await apiService_1.apiService.register(userData);
            const result = {
                success: true,
                data: response.data,
                message: 'Usuário registrado com sucesso'
            };
            console.log(result);
            res.status(201).json(result);
        }
        catch (error) {
            console.log(error);
            const result = {
                success: false,
                error: error.response?.data?.error || 'Erro ao registrar usuário'
            };
            res.status(error.response?.status || 500).json(result);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=authController.js.map