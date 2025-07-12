"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    console.error('Erro:', error);
    const response = {
        success: false,
        error: error.response?.data?.error || error.message || 'Erro interno do servidor'
    };
    res.status(error.response?.status || 500).json(response);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map