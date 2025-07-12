"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.json({
        message: 'Servidor Backend BarbeariaApp',
        version: '1.0.0',
        endpoints: {
            'POST /register': 'Registrar usuário',
            'GET /shops/public': 'Listar barbearias públicas',
            'GET /shops/:slug': 'Buscar barbearia por slug',
            'GET /shops/:slug/availability': 'Verificar disponibilidade',
            'POST /appointments': 'Criar agendamento',
            'GET /shops': 'Listar barbearias do usuário (auth)',
            'POST /shops': 'Criar barbearia (auth)'
        }
    });
});
app.use('/', routes_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map