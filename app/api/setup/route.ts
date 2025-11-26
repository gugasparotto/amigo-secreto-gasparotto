import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Rota temporária para configurar o banco de dados
// Acesse: /api/setup após o deploy
// REMOVA esta rota após executar!

export async function GET() {
  try {
    // Criar tabela users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT false
      )
    `;

    // Criar tabela draw_results
    await sql`
      CREATE TABLE IF NOT EXISTS draw_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        giver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(giver_id)
      )
    `;

    // Criar usuário admin
    await sql`
      INSERT INTO users (name, email, password, is_admin) 
      VALUES ('Administrador', 'admin@admin.com', 'admin', true)
      ON CONFLICT (email) DO NOTHING
    `;

    return NextResponse.json({
      success: true,
      message: '✅ Banco de dados configurado com sucesso! Tabelas criadas e usuário admin criado. REMOVA esta rota agora!',
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: 'Verifique se as variáveis de ambiente do banco estão configuradas corretamente',
      },
      { status: 500 }
    );
  }
}
