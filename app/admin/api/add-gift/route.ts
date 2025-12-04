import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { userId, name, url, description } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nome do presente é obrigatório' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO gifts (user_id, name, url, description)
      VALUES (${userId}, ${name.trim()}, ${url || null}, ${description || null})
      RETURNING id, name, url, description
    `;

    return NextResponse.json({ 
      message: 'Presente adicionado com sucesso',
      gift: result.rows[0] 
    });
  } catch (error: any) {
    console.error('Add gift error:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao adicionar presente' },
      { status: 500 }
    );
  }
}
