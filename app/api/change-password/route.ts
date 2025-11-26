import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Senha atual e nova senha são obrigatórias' },
        { status: 400 }
      );
    }

    // Verificar senha atual
    const result = await sql`
      SELECT password FROM users WHERE id = ${user.id}
    `;

    if (result.rows.length === 0 || result.rows[0].password !== currentPassword) {
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 401 }
      );
    }

    // Atualizar senha
    await sql`
      UPDATE users 
      SET password = ${newPassword}
      WHERE id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso!',
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao alterar senha' },
      { status: 500 }
    );
  }
}
