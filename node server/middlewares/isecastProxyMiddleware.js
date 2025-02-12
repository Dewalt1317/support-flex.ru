const jwt = require('jsonwebtoken'); // Импорт библиотеки для работы с JWT.
const { getUserSessionByIsecastProxyToken } = require('../models/sessionModel.js'); // Импорт функции для получения данных сессии из базы данных.
const config = require('../config/env.js'); // Конфигурационный файл с настройками приложения.

// Middleware для проверки прокси-ссылки
const validateProxyLink = async (req, res, next) => {
  const { proxyToken } = req.params; // Получение прокси-токена из параметров запроса.

  if (!proxyToken) {
    // Если прокси-токен отсутствует, возвращаем ответ с кодом 400 (Bad Request).
    return res.status(400).json({ message: 'Bad Request: No proxy token provided' });
  }

  // Получаем userId из токена.
  let userId;
  try {
    const decodedToken = jwt.verify(proxyToken, config.jwtSecret);
    userId = decodedToken.userID;
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid proxy token' });
  }

  // Проверяем наличие активной сессии с данным userId и proxyToken в базе данных.
  const session = await getUserSessionByIsecastProxyToken(userId, proxyToken);

  if (!session) {
    // Если сессия не найдена, возвращаем ответ с кодом 401 (Unauthorized).
    return res.status(401).json({ message: 'Unauthorized: session not found' });
  }

  // Если проверка успешна, сохраняем userID в объекте `req` для дальнейшего использования.
  req.userID = session.userId;
  next(); // Передаем управление следующему middleware или маршруту.
};

module.exports = { validateProxyLink }; // Экспорт функции для использования в других частях приложения.
