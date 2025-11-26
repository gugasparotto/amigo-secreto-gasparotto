import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Buscar usuário no banco (email case-insensitive)
    const result = await sql`
      SELECT id, name, email, is_admin 
      FROM users 
      WHERE LOWER(email) = LOWER(${email}) AND password = ${password}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }

    const user = result.rows[0];
    const token = createToken(user.id);

    // Atualizar last_login e last_activity
    await sql`
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP, last_activity = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `;

    // Criar cookie de autenticação
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}
