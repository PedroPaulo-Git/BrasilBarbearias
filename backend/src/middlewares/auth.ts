import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token de sessão necessário' });
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("Erro Crítico: NEXTAUTH_SECRET não está definido no backend.");
      return res.status(500).json({ error: 'Erro de configuração do servidor.' });
    }
    
    const decoded = jwt.verify(token, secret) as DecodedToken;

    if (!decoded || !decoded.id) {
      throw new Error('Token inválido ou sem ID de usuário');
    }

    req.user = { id: decoded.id };
    
    next();
  } catch (error) {
    // Apanha erros de jwt.verify (token expirado, assinatura inválida, etc.)
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}; 