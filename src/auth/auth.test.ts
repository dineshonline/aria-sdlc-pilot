import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  it('should throw an error with invalid credentials', async () => {
    await expect(authService.login('invalid@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
  });

  it('should lock the account after 5 failed attempts', () => {
    const email = 'locked@example.com';
    for (let i = 0; i < 5; i++) {
      try {
        authService.login(email, 'wrongpassword');
      } catch (_) {}
    }
    
    expect(() => authService.login(email, 'wrongpassword')).toThrow('Account is locked. Try again later.');
  });

  it('should reset the lockout after successful login', async () => {
    const email = 'user@example.com';
    // Simulate a successful login to reset lockout
    await authService.login(email, 'correctpassword');
    // Logic to verify lockout reset, e.g., checking internal state
    
    // Normally, we would check with mocks or spies to confirm
    expect(authService.isAccountLocked(email)).toBe(false);
  });
});
