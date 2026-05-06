import jwt from 'jsonwebtoken';
import { User } from './user.model';

class AuthService {
  private failedLoginAttempts: { [key: string]: { attempts: number; lockUntil: number } } = {};
  
  public async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; } | null> {
    const user = await User.findOne({ email });
    if (!user || !user.validatePassword(password)) {
      this.handleFailedLogin(email);
      throw new Error('Invalid credentials');
    }

    if (this.isAccountLocked(email)) {
      throw new Error('Account is locked. Try again later.');
    }

    this.resetFailedLoginAttempts(email);
    return this.issueTokens(user);
  }

  private handleFailedLogin(email: string) {
    const attemptRecord = this.failedLoginAttempts[email] || { attempts: 0, lockUntil: 0 };
    attemptRecord.attempts += 1;
    
    if (attemptRecord.attempts >= 5) {
      attemptRecord.lockUntil = Date.now() + 15 * 60 * 1000;
    }
    
    this.failedLoginAttempts[email] = attemptRecord;
  }

  private isAccountLocked(email: string): boolean {
    const attemptRecord = this.failedLoginAttempts[email];
    return attemptRecord && attemptRecord.lockUntil && attemptRecord.lockUntil > Date.now();
  }

  private resetFailedLoginAttempts(email: string) {
    delete this.failedLoginAttempts[email];
  }

  private issueTokens(user: User): { accessToken: string; refreshToken: string; } {
    const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  public logout(refreshToken: string): void {
    // Implement token invalidation logic here
  }
}

export default AuthService;
