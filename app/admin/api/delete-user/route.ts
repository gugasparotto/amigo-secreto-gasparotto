import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário não fornecido' },
        { status: 400 }
      );
    }

    // Não permitir excluir admin
    const user = await sql`
      SELECT is_admin FROM users WHERE id = ${userId}
    `;

    if (user.rows.length > 0 && user.rows[0].is_admin) {
      return NextResponse.json(
        { error: 'Não é possível excluir um administrador' },
        { status: 400 }
      );
    }

    // Deletar usuário (cascade deleta os registros de sorteio)
    await sql`
      DELETE FROM users WHERE id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete user error:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao excluir usuário' },
      { status: 500 }
    );
  }
}
