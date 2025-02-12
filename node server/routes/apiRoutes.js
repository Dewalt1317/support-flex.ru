const express = require('express'); // Подключение библиотеки Express для работы с веб-приложением.
const { isecastGenerateProxyLink, isecastProxy } = require('../controllers/isecastProxyController.js'); // Импорт функций генерации прокси-ссылки и проксирования ресурса.
const { validateProxyLink } = require('../middlewares/isecastProxyMiddleware.js'); // Импорт middleware для проверки прокси-ссылки.
const { sessionMiddleware }  = require('../middlewares/sessionMiddleware.js'); // Импорт middleware для проверки авторизации.
const { generateWSToken, refreshWSToken } = require('../controllers/wsTokenController.js'); // Импорт контроллера для обработки WebSocket токенов.

const router = express.Router(); // Создание маршрутизатора Express для обработки маршрутов.

router.post('/live/generateLink', sessionMiddleware, isecastGenerateProxyLink); // Настройка POST-запроса на маршрут '/generate-proxy' для генерации прокси-ссылки.
router.get('/live/:proxyToken', validateProxyLink, isecastProxy); // Настройка GET-запроса на маршрут '/live/:proxyToken' для проверки прокси-ссылки и выполнения прокси-функции.

router.post('/ws/generateLink', sessionMiddleware, generateWSToken); // Настройка POST-запроса на маршрут '/ws/generateLink' для генерации WebSocket токена.
router.post('/ws/refreshToken', sessionMiddleware, refreshWSToken); // Настройка POST-запроса на маршрут '/ws/refreshToken' для обновления WebSocket токена.

module.exports = router; // Экспорт маршрутов для использования в основном приложении.
