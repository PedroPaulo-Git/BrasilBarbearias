"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./src/app"));
const database_1 = require("./src/config/database");
const jobs_1 = require("./src/jobs");
const PORT = database_1.config.PORT;
app_1.default.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📖 Documentação: http://localhost:${PORT}`);
    console.log(`🔗 API Base: ${database_1.config.API_BASE_URL}`);
    console.log(`🌍 Ambiente: ${database_1.config.NODE_ENV}`);
    (0, jobs_1.scheduleSubscriptionJobs)();
});
//# sourceMappingURL=server.js.map