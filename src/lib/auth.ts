import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret';

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hashed: string) => {
  return await bcrypt.compare(password, hashed);
};

export const signToken = (payload: any) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const setAuthCookie = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
};

export const removeAuthCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('token');
};

export const getAuthSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
};
