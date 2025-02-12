const bcrypt = require('bcrypt'); // Библиотека для хеширования паролей. 
const db = require('../config/db.js'); // Импорт пула соединений для работы с базой данных.
const { MaxLoginAttempts, BadLoginBlockTime } = require('../config/env.js'); // Получаем максимальное количество попыток входа, и время блокировки при исчерпании попыток.

const getUserByID = async (id) => {
  if (id === undefined) id = null;
  // Функция для получения пользователя из базы данных по id.
  const [rows] = await db.execute('SELECT * FROM users WHERE userID = ?', [id]);
  // Выполнение SQL-запроса для поиска пользователя по коду.

  return rows[0]; // Возвращаем первого пользователя, если найден, иначе undefined.
};

const getUserByLoginAndPassword = async (login, password) => {
  if (login === undefined) login = null;
  if (password === undefined) password = null;
  // Функция для получения пользователя из базы данных по логину и паролю.
  const [rows] = await db.execute('SELECT * FROM users WHERE login = ? AND password = ?', [login, password]);
  // Выполнение SQL-запроса для поиска пользователя по логину и паролю.

  return rows[0]; // Возвращаем первого пользователя, если найден, иначе undefined.
};

const createUserRoleUser = async () => {
  const userID = require('uuid').v4(); // Генерация уникального идентификатора пользователя с помощью UUID.

  // Выполнение SQL-запроса для создания нового пользователя в таблице `users`.
  await db.execute(
    'INSERT INTO users (userID, role, loginAttempts, createdAt, updatedAt, lastLogin, bot) VALUES (?, ?, ?, NOW(), NOW(), NOW(), ?)',
    [userID, 'user', 0, 0]
    // Вставка значений:
    // - `userID`: уникальный идентификатор пользователя;
    // - `role`: роль пользователя (по умолчанию "user");
    // - `loginAttempts`: количество попыток входа (по умолчанию 0);
    // - `createdAt`: дата создания (используем NOW() для текущего времени);
    // - `updatedAt`: дата последнего обновления (также NOW());
    // - `lastLogin`: дата последней попытки входа (также NOW());
    // - `bot`: является ли пользователь ботом (в данном случае 0).
  );

  return userID; // Возвращаем ID созданного пользователя.
};

const updateLoginAttempts = async (userID) => {
  if (userID === undefined) userID = null;
  // Получаем информацию о пользователе по его ID
  const [user] = await db.execute('SELECT loginAttempts, blockedUntil FROM users WHERE userID = ?', [userID]);

  // Проверяем, найден ли пользователь
  if (user.length === 0) {
    throw new Error('User not found'); // Если пользователь не найден, выбрасываем ошибку
  }

  // Извлекаем количество попыток входа и время блокировки из результата запроса
  const { loginAttempts, blockedUntil } = user[0];

  // Проверяем, если пользователь заблокирован
  if (blockedUntil && new Date(blockedUntil) > new Date()) {
    // Если текущее время меньше времени блокировки, пользователь заблокирован
    return { blockedUntil, loginAttempts }; // Возвращаем время блокировки и количество попыток
  }

  // Если пользователь не заблокирован, увеличиваем количество попыток входа
  let newLoginAttempts = loginAttempts + 1;

  // Проверяем, если количество попыток превышает максимальное допустимое значение
  if (newLoginAttempts >= MaxLoginAttempts) {
    // Если количество попыток превышает максимальное значение, блокируем пользователя
    const blockedUntilTime = new Date(); // Получаем текущее время
    blockedUntilTime.setMinutes(blockedUntilTime.getMinutes() + BadLoginBlockTime); // Устанавливаем время блокировки на заданное количество минут вперед

    // Преобразование даты и времени в правильный формат
    const formattedBlockedUntilTime = blockedUntilTime.toISOString().slice(0, 19).replace('T', ' ');

    // Обновляем количество попыток и время блокировки в базе данных
    await db.execute('UPDATE users SET loginAttempts = ?, blockedUntil = ? WHERE userID = ?', [newLoginAttempts, formattedBlockedUntilTime, userID]);

    // Возвращаем время блокировки и количество попыток
    return { blockedUntil: blockedUntilTime, loginAttempts: newLoginAttempts };
  }

  // Если количество попыток не превышает максимальное значение, просто обновляем количество попыток в базе данных
  await db.execute('UPDATE users SET loginAttempts = ? WHERE userID = ?', [newLoginAttempts, userID]);

  // Возвращаем null для времени блокировки и обновленное количество попыток
  return { blockedUntil: null, loginAttempts: newLoginAttempts };
};

const checkLoginAttempts = async (userID) => {
  if (userID === undefined) userID = null;
  // Получаем информацию о пользователе по его ID
  const [user] = await db.execute('SELECT loginAttempts, blockedUntil FROM users WHERE userID = ?', [userID]);

  // Проверяем, найден ли пользователь
  if (user.length === 0) {
    throw new Error('User not found'); // Если пользователь не найден, выбрасываем ошибку
  }

  // Извлекаем количество попыток входа и время блокировки из результата запроса
  const { loginAttempts, blockedUntil } = user[0];

  // Проверяем, если пользователь заблокирован
  if (blockedUntil && new Date(blockedUntil) > new Date()) {
    // Если текущее время меньше времени блокировки, пользователь заблокирован
    return { blocked: true, blockedUntil: blockedUntil, loginAttempts: loginAttempts }; // Возвращаем статус блокировки, время блокировки и количество попыток
  }

  // Если пользователь не заблокирован
  return { blocked: false, loginAttempts }; // Возвращаем статус блокировки и количество попыток
};

module.exports = {
  getUserByID,
  createUserRoleUser,
  updateLoginAttempts,
  checkLoginAttempts,
  getUserByLoginAndPassword
}; // Экспорт функций для использования в других частях приложения.
