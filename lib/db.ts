import { Pool } from 'pg';

// Detectar se está usando PostgreSQL local ou Vercel/Neon
const isLocalPostgres = process.env.POSTGRES_URL?.includes('localhost');

let pool: Pool | null = null;

if (isLocalPostgres) {
  // PostgreSQL local usando pg
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });
}

// Criar função sql compatível com tagged template
export const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
  if (isLocalPostgres && pool) {
    // Usar pg para PostgreSQL local
    const query = strings.reduce((acc, str, i) => {
      return acc + str + (i < values.length ? `$${i + 1}` : '');
    }, '');
    
    const result = await pool.query(query, values);
    return { rows: result.rows, rowCount: result.rowCount };
  } else {
    // Usar @vercel/postgres para Vercel/Neon
    const { sql: vercelSql } = await import('@vercel/postgres');
    return vercelSql(strings, ...values);
  }
};
