import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

/**
 * Algoritmo de sorteio de amigo secreto
 * Garante que:
 * - Ninguém tira a si mesmo
 * - Cada pessoa dá e recebe exatamente 1 presente
 * - Funciona com qualquer número de pessoas (mínimo 2)
 */
function shuffleSecretSanta(userIds: string[]): Map<string, string> {
  const n = userIds.length;
  
  if (n < 2) {
    throw new Error('É necessário pelo menos 2 pessoas para o sorteio');
  }

  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const receivers = [...userIds];
    const result = new Map<string, string>();
    let valid = true;

    // Embaralhar array de receivers
    for (let i = receivers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
    }

    // Tentar atribuir cada giver ao receiver correspondente
    for (let i = 0; i < n; i++) {
      const giver = userIds[i];
      const receiver = receivers[i];

      // Se a pessoa tirou a si mesma, tentar trocar
      if (giver === receiver) {
        // Procurar alguém para trocar
        let swapped = false;
        for (let j = i + 1; j < n; j++) {
          if (userIds[i] !== receivers[j] && userIds[j] !== receivers[i]) {
            // Trocar
            [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
            swapped = true;
            break;
          }
        }

        if (!swapped) {
          valid = false;
          break;
        }
      }

      result.set(userIds[i], receivers[i]);
    }

    // Verificar se ninguém tirou a si mesmo
    if (valid) {
      let allValid = true;
      for (const [giver, receiver] of result) {
        if (giver === receiver) {
          allValid = false;
          break;
        }
      }
      if (allValid) {
        return result;
      }
    }

    attempts++;
  }

  throw new Error('Não foi possível realizar o sorteio. Tente novamente.');
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    // Buscar todos os usuários não-admin
    const users = await sql`
      SELECT id FROM users WHERE is_admin = false
    `;

    const userIds = users.rows.map((u) => u.id);

    if (userIds.length < 2) {
      return NextResponse.json(
        { error: 'É necessário pelo menos 2 pessoas para realizar o sorteio' },
        { status: 400 }
      );
    }

    // Realizar sorteio
    const matches = shuffleSecretSanta(userIds);

    // Limpar sorteios anteriores
    await sql`DELETE FROM draw_results`;

    // Salvar novos resultados
    for (const [giverId, receiverId] of matches) {
      await sql`
        INSERT INTO draw_results (giver_id, receiver_id)
        VALUES (${giverId}, ${receiverId})
      `;
    }

    return NextResponse.json({
      success: true,
      message: `Sorteio realizado com sucesso! ${userIds.length} pessoas participaram.`,
      participants: userIds.length,
    });
  } catch (error: any) {
    console.error('Draw error:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao realizar sorteio' },
      { status: 500 }
    );
  }
}
