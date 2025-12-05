import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'talents.db');

let db = null;
let SQL = null;

// Wrapper class to mimic better-sqlite3 API
class StatementWrapper {
  constructor(database, sql) {
    this.database = database;
    this.sql = sql;
  }

  run(...params) {
    this.database.run(this.sql, params);
    return {
      lastInsertRowid: this.database.exec("SELECT last_insert_rowid()")[0]?.values[0][0] || 0,
      changes: this.database.getRowsModified()
    };
  }

  get(...params) {
    const stmt = this.database.prepare(this.sql);
    stmt.bind(params);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return undefined;
  }

  all(...params) {
    const results = [];
    const stmt = this.database.prepare(this.sql);
    stmt.bind(params);
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }
}

// Database wrapper to mimic better-sqlite3 API
class DatabaseWrapper {
  constructor(database) {
    this.database = database;
  }

  prepare(sql) {
    return new StatementWrapper(this.database, sql);
  }

  exec(sql) {
    this.database.run(sql);
    saveDatabase();
  }
}

function saveDatabase() {
  if (db && db.database) {
    const data = db.database.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

// Auto-save periodically and on changes
let saveTimeout = null;
function scheduleSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveDatabase, 1000);
}

export async function initDatabase() {
  if (db) return db;

  SQL = await initSqlJs();

  // Load existing database or create new one
  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath);
    db = new DatabaseWrapper(new SQL.Database(fileBuffer));
  } else {
    db = new DatabaseWrapper(new SQL.Database());
  }

  // Table des utilisateurs
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table des talents
  db.exec(`
    CREATE TABLE IF NOT EXISTS talents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      bio TEXT,
      location TEXT,
      linkedin TEXT,
      github TEXT,
      verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Table des compétences
  db.exec(`
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);

  // Table de liaison talents-compétences
  db.exec(`
    CREATE TABLE IF NOT EXISTS talent_skills (
      talent_id INTEGER,
      skill_id INTEGER,
      PRIMARY KEY (talent_id, skill_id),
      FOREIGN KEY (talent_id) REFERENCES talents(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id)
    )
  `);

  // Table des langues
  db.exec(`
    CREATE TABLE IF NOT EXISTS languages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);

  // Table de liaison talents-langues
  db.exec(`
    CREATE TABLE IF NOT EXISTS talent_languages (
      talent_id INTEGER,
      language_id INTEGER,
      PRIMARY KEY (talent_id, language_id),
      FOREIGN KEY (talent_id) REFERENCES talents(id) ON DELETE CASCADE,
      FOREIGN KEY (language_id) REFERENCES languages(id)
    )
  `);

  // Table des projets
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      talent_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (talent_id) REFERENCES talents(id) ON DELETE CASCADE
    )
  `);

  // Table des favoris
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      user_id INTEGER,
      talent_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, talent_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (talent_id) REFERENCES talents(id) ON DELETE CASCADE
    )
  `);

  // Table des messages de collaboration
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES talents(id)
    )
  `);

  // Table des demandes de collaboration
  db.exec(`
    CREATE TABLE IF NOT EXISTS collaboration_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id)
    )
  `);

  console.log('✅ Database initialized successfully!');
  return db;
}

export function getDb() {
  return db;
}

export { saveDatabase };
export default db;
