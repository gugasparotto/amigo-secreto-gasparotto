import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// Listar presentes do usuário logado
export async function GET() {
  try {
    const user = await requireAuth();

    const result = await sql`
      SELECT id, name, url, description, created_at
      FROM gifts
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ gifts: result.rows });
  } catch (error: any) {
    console.error('Get gifts error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao buscar presentes' },
      { status: 500 }
    );
  }
}

// Criar novo presente
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { name, url, description } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nome do presente é obrigatório' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO gifts (user_id, name, url, description)
      VALUES (${user.id}, ${name.trim()}, ${url || null}, ${description || null})
      RETURNING id, name, url, description, created_at
    `;

    return NextResponse.json({
      success: true,
      gift: result.rows[0],
    });
  } catch (error: any) {
    console.error('Create gift error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao cadastrar presente' },
      { status: 500 }
    );
  }
}

// Deletar presente
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const giftId = searchParams.get('id');

    if (!giftId) {
      return NextResponse.json(
        { error: 'ID do presente não fornecido' },
        { status: 400 }
      );
    }

    // Verificar se o presente pertence ao usuário
    const check = await sql`
      SELECT user_id FROM gifts WHERE id = ${giftId}
    `;

    if (check.rows.length === 0) {
      return NextResponse.json(
        { error: 'Presente não encontrado' },
        { status: 404 }
      );
    }

    if (check.rows[0].user_id !== user.id) {
      return NextResponse.json(
        { error: 'Você não pode deletar este presente' },
        { status: 403 }
      );
    }

    await sql`DELETE FROM gifts WHERE id = ${giftId}`;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete gift error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao deletar presente' },
      { status: 500 }
    );
  }
}
