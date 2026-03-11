import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getLocalCache() {
  if (db) return Promise.resolve(db);

  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("localCache").then((database) => {
      db = database;
      return database;
    });
  }

  return dbPromise;
}

export { getLocalCache };
