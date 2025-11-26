import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();

    // Buscar quem o usuário tirou
    const result = await sql`
      SELECT u.id, u.name
      FROM draw_results dr
      JOIN users u ON dr.receiver_id = u.id
      WHERE dr.giver_id = ${user.id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({
        hasMatch: false,
        message: 'O sorteio ainda não foi realizado',
      });
    }

    const receiver = result.rows[0];

    // Buscar presentes cadastrados pela pessoa que foi tirada
    const giftsResult = await sql`
      SELECT id, name, url, description
      FROM gifts
      WHERE user_id = ${receiver.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      hasMatch: true,
      secretFriend: receiver.name,
      gifts: giftsResult.rows,
    });
  } catch (error: any) {
    console.error('Get secret friend error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao buscar amigo secreto' },
      { status: 500 }
    );
  }
}
