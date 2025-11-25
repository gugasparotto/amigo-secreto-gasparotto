import { cookies } from 'next/headers';
import { sql } from './db';

export interface User {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
}

// Simple JWT encoding (base64)
export function createToken(userId: string): string {
  const payload = JSON.stringify({ userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  return Buffer.from(payload).toString('base64');
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) return null;
  
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  const result = await sql`
    SELECT id, name, email, is_admin 
    FROM users 
    WHERE id = ${decoded.userId}
  `;
  
  return result.rows[0] as User || null;
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (!user.is_admin) {
    throw new Error('Forbidden');
  }
  return user;
}
