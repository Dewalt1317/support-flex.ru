const jwt = require('jsonwebtoken'); // Библиотека для работы с JSON Web Token (JWT), используемая для аутентификации и авторизации.
const { createSession } = require('../models/sessionModel.js'); // Функция для создания сессии в базе данных.
const config = require('../config/env.js'); // Конфигурационный файл с настройками приложения (например, секретный ключ, срок действия токенов).
const { loginAuth } = require('../services/loginAuthService.js'); // Функции для работы с моделью пользователя (получение пользователей).
const { codewordAuth } = require('../services/codewordAuthService.js'); // Функции для работы с моделью пользователя (получение и создание пользователей).

// Функция для аутентификации пользователя.
const authenticate = async (req, res) => {
  console.log(req)
  const { codeword, login, pass } = req.body; // Извлечение `codeword` из тела запроса.
  let auth;
  let authType;
  let userID;
  // Если присутствует кодовое слово, то проводим авторизацию по нему. Такой способ входа ограничивает все действия с api до уровня роли user
  if (codeword) {
    auth = await codewordAuth(codeword, res.cookie.userID);
  }

  if (!codeword && (login && pass)) {
    auth = await loginAuth(login, pass);
  }

  if (!codeword && (!login || !pass)) {
    return res.status(401).json({ message: 'Invalid login data', }); // Ответ с кодом 401 (Unauthorized), если нет данных для авторизации.
  }

  switch (auth.status) {
    case 401:
      return res.status(401).json({ message: 'Invalid login data', Attempts: auth.Attempts }); // Ответ с кодом 401 (Unauthorized), если `codeword` неверный.
    case 403:
      return res.status(403).json({ message: 'login blocked', blockedTime: auth.blockedTime }); // Ответ с кодом 403 (Forbidden), если логин заблокирован.
    case 200:
      authType = auth.authType;
      userID = auth.userID;
      if (auth.setCookieUserID) {
        res.cookie('userID', userID, { httpOnly: true, secure: true });
      }
      break;
  }



  // Генерация access-токена с помощью JWT. 
  const token = jwt.sign({ userID }, config.jwtSecret, { expiresIn: config.jwtExpiresIn }); // Токен с ограниченным сроком действия.
  const refreshToken = jwt.sign({ userID }, config.jwtSecret, { expiresIn: '7d' }); // Refresh-токен с увеличенным сроком действия.
  const expiresAt = new Date(Date.now() + 3600000).toISOString(); // Время истечения access-токена (через 1 час).

  // Сохранение сессии в базе данных.
  await createSession(userID, token, refreshToken, expiresAt, authType);

  // Установка токена в cookie для клиента. Cookie помечен как `httpOnly`, чтобы он не был доступен из JavaScript на стороне клиента.
  res.cookie('sessionID', token, { httpOnly: true, secure: true });
  res.cookie('userID', userID, { httpOnly: true, secure: true });

  // Ответ с кодом 200 (успешно) и информацией о пользователе.
  res.status(200).json({ message: 'Authenticated', userID });
};

module.exports = { authenticate }; // Экспорт функции аутентификации для использования в других модулях.
