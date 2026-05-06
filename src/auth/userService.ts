import { User } from './models/User';

export const getUserByEmail = async (email: string): Promise<User | null> => {
  // Replace with actual database call
  return { id: '1', email, password: 'password123' }; // dummy user
};

export const lockAccount = async (email: string): Promise<void> => {
  // Replace with actual database update for account lock state
};

export const isAccountLocked = async (email: string): Promise<boolean> => {
  // Replace with actual check for lock state from database
  return false;
};