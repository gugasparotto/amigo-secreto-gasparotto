import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    // Buscar todos os resultados do sorteio com nomes
    const result = await sql`
      SELECT 
        u1.name as giver_name,
        u2.name as receiver_name
      FROM draw_results dr
      JOIN users u1 ON dr.giver_id = u1.id
      JOIN users u2 ON dr.receiver_id = u2.id
      ORDER BY u1.name ASC
    `;

    return NextResponse.json({
      results: result.rows,
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error('Get draw results error:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao buscar resultados' },
      { status: 500 }
    );
  }
}
