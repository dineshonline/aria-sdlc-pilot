import { Request, Response } from 'express';
import { invalidateRefreshToken } from './tokenService';

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await invalidateRefreshToken(refreshToken);
  res.status(204).send();
};