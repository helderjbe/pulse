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

  // Create embeddings table for semantic search
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS note_embeddings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      note_id INTEGER NOT NULL,
      embedding_text TEXT NOT NULL,
      embedding_vector TEXT NOT NULL, -- JSON string of vector
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
    );
  `);

  // Create index for faster lookups
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_note_embeddings_note_id 
    ON note_embeddings (note_id);
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

export interface NoteEmbedding {
  id: number;
  note_id: number;
  embedding_text: string;
  embedding_vector: number[];
  created_at: string;
}

export interface SimilarNote {
  note: Note;
  similarity: number;
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

export const embeddingOperations = {
  async saveEmbedding(noteId: number, text: string, vector: number[]): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO note_embeddings (note_id, embedding_text, embedding_vector)
       VALUES (?, ?, ?)`,
      [noteId, text, JSON.stringify(vector)]
    );
  },

  async getEmbedding(noteId: number): Promise<NoteEmbedding | null> {
    const db = getDatabase();
    const result = await db.getFirstAsync<{
      id: number;
      note_id: number;
      embedding_text: string;
      embedding_vector: string;
      created_at: string;
    }>(
      "SELECT * FROM note_embeddings WHERE note_id = ?",
      [noteId]
    );
    
    if (!result) return null;
    
    return {
      ...result,
      embedding_vector: JSON.parse(result.embedding_vector),
    };
  },

  async getAllEmbeddings(): Promise<NoteEmbedding[]> {
    const db = getDatabase();
    const results = await db.getAllAsync<{
      id: number;
      note_id: number;
      embedding_text: string;
      embedding_vector: string;
      created_at: string;
    }>(
      "SELECT * FROM note_embeddings ORDER BY created_at DESC"
    );
    
    return results.map(result => ({
      ...result,
      embedding_vector: JSON.parse(result.embedding_vector),
    }));
  },

  async deleteEmbedding(noteId: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync("DELETE FROM note_embeddings WHERE note_id = ?", [noteId]);
  },

  async findSimilarNotes(queryVector: number[], limit: number = 5): Promise<SimilarNote[]> {
    const db = getDatabase();
    
    // Get all embeddings with their associated notes
    const results = await db.getAllAsync<{
      note_id: number;
      embedding_vector: string;
      day: string;
      text: string;
      id: number;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT ne.note_id, ne.embedding_vector, n.day, n.text, n.id, n.created_at, n.updated_at
       FROM note_embeddings ne
       JOIN notes n ON ne.note_id = n.id
       WHERE n.text IS NOT NULL AND n.text != ''`
    );

    // Calculate cosine similarities
    const similarities = results.map(result => {
      const vector = JSON.parse(result.embedding_vector);
      const similarity = cosineSimilarity(queryVector, vector);
      
      return {
        note: {
          id: result.id,
          day: result.day,
          text: result.text,
          created_at: result.created_at,
          updated_at: result.updated_at,
        },
        similarity,
      };
    });

    // Sort by similarity and return top results
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  },
};

// Cosine similarity calculation
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}
