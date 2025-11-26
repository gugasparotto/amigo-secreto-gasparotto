import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    const result = await sql`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.is_admin,
        u.last_login,
        u.last_activity,
        CASE 
          WHEN u.last_activity > CURRENT_TIMESTAMP - INTERVAL '5 minutes' THEN true
          ELSE false
        END as is_online,
        COUNT(g.id) as gifts_count
      FROM users u
      LEFT JOIN gifts g ON u.id = g.user_id
      GROUP BY u.id, u.name, u.email, u.is_admin, u.last_login, u.last_activity
      ORDER BY u.is_admin DESC, u.name ASC
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
