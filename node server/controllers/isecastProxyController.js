const jwt = require('jsonwebtoken'); // Библиотека для работы с JSON Web Token (JWT).
const { updateSessionIsecastToken } = require('../models/sessionModel.js'); // Импорт функций для работы с сессиями.
const config = require('../config/env.js'); // Конфигурационный файл с настройками приложения.
const axios = require('axios'); // Библиотека для выполнения HTTP-запросов.

// Функция для генерации прокси-ссылки.
const isecastGenerateProxyLink = async (req, res) => {
  const  userID = req.cookies.userID;

  // Генерация прокси-токена с помощью JWT.
  const proxyToken = jwt.sign({ userID }, config.jwtSecret, { expiresIn: '12h' }); // Токен с ограниченным сроком действия (12 часов).

  // Обновление прокси-токена в базе данных.
  await updateSessionIsecastToken(userID, proxyToken);

  // Ответ с кодом 200 (успешно) и прокси-ссылкой.
  res.status(200).json({ message: 'Proxy link generated', proxyLink: `/api/live/${proxyToken}` });
};

// Функция для проксирования ресурса.
const isecastProxy = async (req, res) => {
  try {
    const response = await axios.get('https://radio.support-flex.ru/live', {
      responseType: 'stream',
    });

    res.setHeader('Content-Type', 'audio/mpeg'); // Установка заголовка Content-Type для аудио потока
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ message: 'Error proxying resource', error: error.message });
  }
};

module.exports = { isecastGenerateProxyLink, isecastProxy }; // Экспорт функций для использования в других модулях.
