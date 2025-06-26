import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

/**
 * Middleware de autenticação simples.
 * Extrai o ID do usuário do header 'Authorization: Bearer <userId>'
 * e o anexa ao objeto de requisição.
 */
export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ error: 'ID de usuário (token) necessário' });
    }

    // Anexa o ID do usuário à requisição para ser usado nos controllers
    req.user = { id: userId };
    
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}; 