const jwt = require('jsonwebtoken'); // Библиотека для работы с JSON Web Token (JWT).
const { getUserSession } = require('../models/sessionModel.js'); // Функция для получения данных сессии из базы данных.
const config = require('../config/env.js'); // Конфигурационный файл с настройками приложения.

// Middleware для проверки сессии
const sessionMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.sessionID; // Получение токена сессии из куков.
    console.log(`[HTTP] Session token: ${token}`);

    if (!token) {
      // Если токен отсутствует, возвращаем ответ с кодом 401 (Unauthorized).
      return res.status(401).json({ message: 'Unauthorized: No session token' });
    }

    // Проверяем JWT токен с использованием секретного ключа.
    const decoded = jwt.verify(token, config.jwtSecret);

    // Проверяем наличие активной сессии в базе данных.
    const session = await getUserSession(decoded.userID, token);

    if (!session) {
      // Если сессия не найдена, возвращаем ответ с кодом 401.
      return res.status(401).json({ message: 'Unauthorized: Invalid session' });
    }

    // Если проверка успешна, сохраняем userID в объекте `req` для дальнейшего использования.
    req.userID = decoded.userID;
    next(); // Передаем управление следующему middleware или маршруту.
  } catch (error) {
    // Обработка ошибок: некорректный токен, истёкший токен и др.
    console.error(`[HTTP] Error: ${error.message}`);
    res.status(401).json({ message: 'Unauthorized: Invalid token', error: error.message });
  }
};

// Middleware для проверки авторизации пользователя для WebSocket соединений
const wsSessionMiddleware = async (ws, req, next) => {
  try {
    const token = req.headers.cookie.match(/(?:^|;\s*)sessionID=([^;]+)/)[1]; // Предполагаем, что токен передается в протоколе WebSocket.
    console.log(`[WebSocket] Session token: ${token}`);
    if (!token) {
      ws.close(4001, 'Unauthorized: No session token');
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const session = await getUserSession(decoded.userID, token);

    if (!session) {
      ws.close(4002, 'Unauthorized: Invalid session');
      return;
    }

    ws.userID = decoded.userID;
    next();
  } catch (error) {
    console.error(`[WebSocket] Error: ${error.message}`);
    ws.close(4003, 'Unauthorized: Invalid token');
  }
};

module.exports = { sessionMiddleware, wsSessionMiddleware }; // Экспорт обоих middleware
