import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    const result = await sql`
      SELECT 
        id, 
        name, 
        email, 
        is_admin,
        last_login,
        last_activity,
        CASE 
          WHEN last_activity > CURRENT_TIMESTAMP - INTERVAL '5 minutes' THEN true
          ELSE false
        END as is_online
      FROM users
      ORDER BY is_admin DESC, name ASC
    `;

    return NextResponse.json({ users: result.rows });
  } catch (error: any) {
    console.error('Get users error:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
}
