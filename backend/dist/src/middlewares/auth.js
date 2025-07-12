"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const authMiddleware = (req, res, next) => {
    try {
        const userId = req.headers.authorization?.replace('Bearer ', '');
        if (!userId) {
            return res.status(401).json({ error: 'ID de usuário (token) necessário' });
        }
        req.user = { id: userId };
        return next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.js.map