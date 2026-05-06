import request from 'supertest';
import app from '../../app';
import * as tokenService from '../../auth/tokenService';

jest.mock('../../auth/tokenService');

(tokenService.invalidateRefreshToken as jest.Mock).mockResolvedValue(() => {});

describe('POST /logout', () => {
  it('invalidates the refresh token on logout', async () => {
    const response = await request(app)
      .post('/logout')
      .send({ refreshToken: 'dummyRefreshToken' });

    expect(response.status).toBe(204);
    expect(tokenService.invalidateRefreshToken).toHaveBeenCalledWith('dummyRefreshToken');
  });
});