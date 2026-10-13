import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

let tempDb: SQLite.SQLiteDatabase | null = null;
let tempDbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

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

function getTempLocalCache() {
  if (tempDb) return Promise.resolve(tempDb);

  if (!tempDbPromise) {
    tempDbPromise = SQLite.openDatabaseAsync("tempLocalCache").then(
      (database) => {
        tempDb = database;
        return database;
      },
    );
  }

  return tempDbPromise;
}

export { getLocalCache, getTempLocalCache };
