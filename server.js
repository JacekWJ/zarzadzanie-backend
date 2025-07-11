const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Konfiguracja połączenia z MySQL
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'zarzadzanie-app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(cors());
app.use(express.json());

// ⚠️ UWAGA: NIE używaj express.static tutaj — przeniesiemy to niżej, żeby zadziałało przekierowanie na login

// 🔒 Główna strona zawsze przekierowuje do login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Logowanie użytkownika

app.post('/login', (req, res) => {
  const { login, password } = req.body;

  const query = 'SELECT * FROM pracownicy WHERE login = ? AND haslo = ?';
  db.query(query, [login, password], (err, results) => {
    if (err) {
      console.error('Błąd podczas zapytania do bazy:', err);
      return res.status(500).json({ success: false, message: 'Błąd serwera' });
    }

    if (results.length > 0) {
      res.json({ success: true, message: 'Zalogowano' });
    } else {
      res.status(401).json({ success: false, message: 'Nieprawidłowy login lub hasło' });
    }
  });
});

// ========================
// === PRACOWNICY API ====
// ========================

// Lista pracowników
app.get('/pracownicy', (req, res) => {
  db.query('SELECT id, imie, nazwisko, login, dostep FROM pracownicy', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Dodaj pracownika
app.post('/pracownicy', (req, res) => {
  const { imie, nazwisko, login, haslo, dostep } = req.body;

  const sql = `
    INSERT INTO pracownicy (imie, nazwisko, login, haslo, dostep)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [imie, nazwisko, login, haslo, dostep], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Pracownik dodany', id: result.insertId });
  });
});

// ==========================
// ====== OBLOZENIE API =====
// ==========================

// Pobierz listę zadań z przypisaniem pracownika
app.get('/oblozenie', (req, res) => {
  const sql = `
    SELECT o.id, o.zadanie, o.pracownik_id, p.imie, p.nazwisko
    FROM oblozenie o
    JOIN pracownicy p ON o.pracownik_id = p.id
    ORDER BY o.id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Dodaj nowe zadanie
app.post('/oblozenie', (req, res) => {
  const { pracownik_id, zadanie } = req.body;
  const sql = `INSERT INTO oblozenie (pracownik_id, zadanie) VALUES (?, ?)`;
  db.query(sql, [pracownik_id, zadanie], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Zadanie dodane' });
  });
});

// Edytuj istniejące zadanie
app.put('/oblozenie/:id', (req, res) => {
  const id = req.params.id;
  const { pracownik_id, zadanie } = req.body;
  const sql = `UPDATE oblozenie SET pracownik_id = ?, zadanie = ? WHERE id = ?`;
  db.query(sql, [pracownik_id, zadanie, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Zadanie zaktualizowane' });
  });
});

// Pobierz zadania dla danego loginu
app.get('/zadania/:login', (req, res) => {
  const { login } = req.params;
  const sql = `
    SELECT o.zadanie, p.imie, p.nazwisko
    FROM oblozenie o
    JOIN pracownicy p ON o.pracownik_id = p.id
    WHERE p.login = ?
  `;
  db.query(sql, [login], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


// ==========================

app.listen(PORT, () => {
  console.log(`✅ Serwer działa na http://localhost:${PORT}`);
});
