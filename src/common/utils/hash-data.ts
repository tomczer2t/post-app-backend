import { hash } from 'bcrypt';

export const hashData = async (data: string): Promise<string> => {
  return hash(data, 10);
};
