import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getUserByEmail, lockAccount, isAccountLocked } from './userService';
import { incrementFailedAttempts, resetFailedAttempts } from './failedAttemptsService';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const MAX_FAILED_ATTEMPTS = 5;

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (await isAccountLocked(email)) {
    return res.status(403).json({ message: 'Account is temporarily locked. Please try again later.' });
  }

  const user = await getUserByEmail(email);

  if (!user || user.password !== password) {
    await incrementFailedAttempts(email);
    if (await incrementFailedAttempts(email) >= MAX_FAILED_ATTEMPTS) {
      await lockAccount(email);
    }
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  await resetFailedAttempts(email);

  const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRY });

  return res.json({ accessToken, refreshToken });
};