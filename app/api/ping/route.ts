import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// Atualizar atividade do usuário
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    await sql`
      UPDATE users 
      SET last_activity = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }
}
