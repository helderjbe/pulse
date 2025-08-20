import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "notes.db";

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT UNIQUE NOT NULL,
      text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
};

export interface Note {
  id: number;
  day: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export const noteOperations = {
  async getNote(day: string): Promise<Note | null> {
    const db = getDatabase();
    const result = await db.getFirstAsync<Note>(
      "SELECT * FROM notes WHERE day = ?",
      [day]
    );
    return result || null;
  },

  async saveNote(day: string, text: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
      `INSERT INTO notes (day, text) VALUES (?, ?)
       ON CONFLICT(day) DO UPDATE SET 
         text = excluded.text,
         updated_at = CURRENT_TIMESTAMP`,
      [day, text]
    );
  },

  async deleteNote(day: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync("DELETE FROM notes WHERE day = ?", [day]);
  },

  async getAllNotes(): Promise<Note[]> {
    const db = getDatabase();
    return await db.getAllAsync<Note>(
      "SELECT * FROM notes ORDER BY created_at DESC"
    );
  },

  async getEditedDates(): Promise<string[]> {
    const db = getDatabase();
    const results = await db.getAllAsync<{ day: string }>(
      'SELECT day FROM notes WHERE text IS NOT NULL AND text != ""'
    );
    return results.map((result) => result.day);
  },
};
