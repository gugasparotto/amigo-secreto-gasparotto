import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    // Limpar todos os resultados do sorteio
    await sql`DELETE FROM draw_results`;

    return NextResponse.json({
      success: true,
      message: 'Sorteio zerado com sucesso!',
    });
  } catch (error: any) {
    console.error('Clear draw error:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao zerar sorteio' },
      { status: 500 }
    );
  }
}
