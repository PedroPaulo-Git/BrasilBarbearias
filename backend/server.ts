import app from './src/app';
import { config } from './src/config/database';

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📖 Documentação: http://localhost:${PORT}`);
  console.log(`🔗 API Base: ${config.API_BASE_URL}`);
  console.log(`🌍 Ambiente: ${config.NODE_ENV}`);
}); 