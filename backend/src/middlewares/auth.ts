import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionToken) {
      res.status(401).json({ 
        success: false, 
        error: 'Token de sessão necessário' 
      });
      return;
    }
    
    req.sessionToken = sessionToken;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Token inválido' 
    });
  }
}; 