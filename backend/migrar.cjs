const sqlite3 = require('sqlite3').verbose()
const { Client } = require('pg')

// Conexão com SQLite
const sqliteDb = new sqlite3.Database('./database.db')

// Conexão com PostgreSQL (Railway)
const pgClient = new Client({
  connectionString: 'postgresql://postgres:@monorail.proxy.rlwy.net:5432/railway', // substitua SENHA
})

pgClient.connect()

// Garante que a tabela exista no PostgreSQL
const ensureTableExists = async () => {
  await pgClient.query(`
    CREATE TABLE IF NOT EXISTS eventos (
      id SERIAL PRIMARY KEY,
      data TEXT,
      evento TEXT
    );
  `)
}

sqliteDb.serialize(() => {
  sqliteDb.all('SELECT * FROM eventos', async (err, rows) => {
    if (err) {
      console.error('Erro ao ler SQLite:', err)
      return
    }

    await ensureTableExists()

    for (const row of rows) {
      try {
        await pgClient.query('INSERT INTO eventos (id, data, evento) VALUES ($1, $2, $3)', [
          row.id,
          row.data,
          row.evento,
        ])
        console.log('✅ Migrado ID:', row.id)
      } catch (e) {
        console.error('❌ Erro ao inserir ID', row.id, ':', e.message)
      }
    }

    console.log('🚀 Migração concluída!')
    pgClient.end()
  })
})
