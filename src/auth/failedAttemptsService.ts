let failedAttempts = new Map<string, number>();

export const incrementFailedAttempts = async (email: string): Promise<number> => {
  const attempts = (failedAttempts.get(email) || 0) + 1;
  failedAttempts.set(email, attempts);
  return attempts;
};

export const resetFailedAttempts = async (email: string): Promise<void> => {
  failedAttempts.delete(email);
};