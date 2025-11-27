import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'sua_chave_secreta';

// Extender a interface do Request para incluir userId
declare module 'express-serve-static-core' {
  interface Request {
    userId?: number;
  }
}

export default function verificarToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Token ausente' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Token ausente' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
}
