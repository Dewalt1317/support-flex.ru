const db = require('../config/db.js'); // Импорт пула соединений для работы с базой данных.

// Функция для создания сессии пользователя в базе данных.
const createSession = async (userId, token, refreshToken, expiresAt, authType) => {
  const sessionID = require('uuid').v4(); // Генерация уникального идентификатора сессии с помощью UUID.

  // Проверка на undefined и замена на null
  if (userId === undefined) userId = null;
  if (token === undefined) token = null;
  if (refreshToken === undefined) refreshToken = null;
  if (expiresAt === undefined) expiresAt = null;
  if (authType === undefined) authType = null;

  // Преобразование даты и времени в правильный формат
  if (expiresAt !== null) {
    expiresAt = new Date(expiresAt).toISOString().slice(0, 19).replace('T', ' ');
  }

  // Выполнение SQL-запроса для вставки данных о сессии в таблицу `userSessions`.
  await db.execute(
    'INSERT INTO userSessions (id, userId, authType, token, refreshToken, expiresAt, onAir) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [sessionID, userId, authType, token, refreshToken, expiresAt, 0] // Значения для вставки:
    // - `id`: уникальный идентификатор сессии.
    // - `userId`: ID пользователя, связанного с сессией.
    // - `authType`: тип аутентификации (кодовое слово, или логин и пароль).
    // - `token`: JWT токен.
    // - `refreshToken`: токен для обновления.
    // - `expiresAt`: время истечения access-токена.
    // - `onAir`: статус сессии (например, 0 может обозначать, что сессия неактивна по умолчанию).
  );

  return sessionID; // Возвращаем ID созданной сессии.
};

// Функция для получения данных сессии из базы данных.
const getUserSession = async (userId, token) => {
  // Проверка на undefined и замена на null
  if (userId === undefined) userId = null;
  if (token === undefined) token = null;

  const [rows] = await db.execute(
    'SELECT * FROM userSessions WHERE userId = ? AND token = ?',
    [userId, token]
  );
  return rows.length ? rows[0] : null;
};

// Функция для получения данных сессии по userId и proxyToken.
const getUserSessionByIsecastProxyToken = async (userId, isecastProxyToken) => {
  // Проверка на undefined и замена на null
  if (userId === undefined) userId = null;
  if (isecastProxyToken === undefined) isecastProxyToken = null;

  const [rows] = await db.execute(
    'SELECT * FROM userSessions WHERE userId = ? AND isecastProxyToken = ?',
    [userId, isecastProxyToken]
  );
  return rows.length ? rows[0] : null;
};

// Функция для обновления существующей сессии.
const updateSessionIsecastToken = async (userId, isecastProxyToken) => {
  // Проверка на undefined и замена на null
  if (userId === undefined) userId = null;
  if (isecastProxyToken === undefined) isecastProxyToken = null;

  await db.execute(
    'UPDATE userSessions SET isecastProxyToken = ? WHERE userId = ?',
    [isecastProxyToken, userId]
  );
};

const updateSessionWssToken = async (userId, wssToken) => {
  await db.execute(
    'UPDATE userSessions SET wssToken = ? WHERE userId = ?',
    [wssToken, userId]
  );
};

module.exports = { createSession, getUserSession, updateSessionIsecastToken, getUserSessionByIsecastProxyToken, updateSessionWssToken }; // Экспорт функций для использования в других частях приложения.
