const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'restaurant.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    createTables();
  }
});

function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    plan TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating accounts table:', err.message);
    } else {
      console.log('Accounts table created or already exists.');
      addDummyRestaurantAccount();
    }
  });
}

function addDummyRestaurantAccount() {
  const dummyAccount = {
    username: 'restaurant',
    password: 'password123',
    role: 'admin',
    plan: 'unlimited'
  };

  db.run(`INSERT OR REPLACE INTO accounts (username, password, role, plan)
          VALUES (?, ?, ?, ?)`,
    [dummyAccount.username, dummyAccount.password, dummyAccount.role, dummyAccount.plan],
    (err) => {
      if (err) {
        console.error('Error adding dummy restaurant account:', err.message);
      } else {
        console.log('Dummy restaurant account added or updated successfully.');
      }
    }
  );
}

module.exports = db;
