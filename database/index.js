// Unified Database Interface
const { db: sqliteDb, initDatabase: initSQLite } = require('./sqlite');
const { pool: pgPool, initPostgreSQL } = require('./postgresql');

// Determine which database to use
const usePostgreSQL = process.env.POSTGRES_URL && process.env.POSTGRES_URL !== 'postgresql://username:password@localhost:5432/streaming_platform';

class DatabaseInterface {
    constructor() {
        this.isPostgreSQL = usePostgreSQL;
        this.db = usePostgreSQL ? pgPool : sqliteDb;
    }

    // Initialize database
    async init() {
        try {
            if (this.isPostgreSQL) {
                await initPostgreSQL();
                console.log('✅ Using PostgreSQL database');
            } else {
                await initSQLite();
                console.log('✅ Using SQLite database');
            }
        } catch (error) {
            console.log('⚠️ PostgreSQL failed, falling back to SQLite');
            this.isPostgreSQL = false;
            this.db = sqliteDb;
            await initSQLite();
            console.log('✅ Using SQLite database (fallback)');
        }
    }

    // Unified query method
    async query(sql, params = []) {
        if (this.isPostgreSQL) {
            // PostgreSQL uses $1, $2, etc. for parameters
            const pgSql = this.convertSQLiteToPostgreSQL(sql);
            const client = await this.db.connect();
            try {
                const result = await client.query(pgSql, params);
                return {
                    rows: result.rows,
                    lastID: result.rows[0]?.id,
                    changes: result.rowCount
                };
            } finally {
                client.release();
            }
        } else {
            // SQLite
            return new Promise((resolve, reject) => {
                if (sql.trim().toUpperCase().startsWith('SELECT')) {
                    this.db.all(sql, params, (err, rows) => {
                        if (err) reject(err);
                        else resolve({ rows, changes: rows.length });
                    });
                } else {
                    this.db.run(sql, params, function(err) {
                        if (err) reject(err);
                        else resolve({ lastID: this.lastID, changes: this.changes });
                    });
                }
            });
        }
    }

    // Get single row
    async get(sql, params = []) {
        const result = await this.query(sql, params);
        return result.rows[0] || null;
    }

    // Get all rows
    async all(sql, params = []) {
        const result = await this.query(sql, params);
        return result.rows;
    }

    // Run query (INSERT, UPDATE, DELETE)
    async run(sql, params = []) {
        return await this.query(sql, params);
    }

    // Convert SQLite syntax to PostgreSQL
    convertSQLiteToPostgreSQL(sql) {
        if (!this.isPostgreSQL) return sql;

        // Replace ? placeholders with $1, $2, etc.
        let paramIndex = 1;
        const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

        // Replace SQLite-specific functions
        return pgSql
            .replace(/CURRENT_TIMESTAMP/g, 'NOW()')
            .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY')
            .replace(/INSERT OR IGNORE/g, 'INSERT')
            .replace(/INSERT OR REPLACE/g, 'INSERT');
    }

    // Transaction support
    async transaction(callback) {
        if (this.isPostgreSQL) {
            const client = await this.db.connect();
            try {
                await client.query('BEGIN');
                const result = await callback(client);
                await client.query('COMMIT');
                return result;
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } else {
            // SQLite transaction
            return new Promise((resolve, reject) => {
                this.db.serialize(() => {
                    this.db.run('BEGIN TRANSACTION');
                    try {
                        const result = callback(this.db);
                        this.db.run('COMMIT');
                        resolve(result);
                    } catch (error) {
                        this.db.run('ROLLBACK');
                        reject(error);
                    }
                });
            });
        }
    }
}

// Create singleton instance
const database = new DatabaseInterface();

module.exports = { database, usePostgreSQL };