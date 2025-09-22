import bcrypt from 'bcrypt';

export const saltAndHashPassword = async (password: string): Promise<string> => {
  const saltRounds = await bcrypt.genSalt();
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
