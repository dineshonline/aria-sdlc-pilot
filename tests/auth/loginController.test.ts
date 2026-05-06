import request from 'supertest';
import app from '../../app';
import { User } from '../../auth/models/User';
import * as userService from '../../auth/userService';
import * as failedAttemptsService from '../../auth/failedAttemptsService';

jest.mock('../../auth/userService');
jest.mock('../../auth/failedAttemptsService');

const mockUser: User = { id: '1', email: 'user@example.com', password: 'password123' };

(userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
(failedAttemptsService.incrementFailedAttempts as jest.Mock).mockResolvedValue(1);
(failedAttemptsService.resetFailedAttempts as jest.Mock).mockResolvedValue(void 0);
(userService.isAccountLocked as jest.Mock).mockResolvedValue(false);

describe('POST /login', () => {
  it('returns an access and refresh token for valid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'user@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeTruthy();
    expect(response.body.refreshToken).toBeTruthy();
  });

  it('returns 401 on invalid credentials', async () => {
    (userService.getUserByEmail as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/login')
      .send({ email: 'user@unknown.com', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid email or password.');
  });

  it('locks account after 5 failed attempts', async () => {
    (failedAttemptsService.incrementFailedAttempts as jest.Mock).mockResolvedValueOnce(5);
    (userService.lockAccount as jest.Mock).mockResolvedValueOnce();
    (userService.isAccountLocked as jest.Mock).mockResolvedValueOnce(false);

    await request(app).post('/login').send({ email: 'user@example.com', password: 'wrongpassword' });
    await request(app).post('/login').send({ email: 'user@example.com', password: 'wrongpassword' });
    await request(app).post('/login').send({ email: 'user@example.com', password: 'wrongpassword' });
    await request(app).post('/login').send({ email: 'user@example.com', password: 'wrongpassword' });
    const response = await request(app).post('/login').send({ email: 'user@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(401);
  });
});