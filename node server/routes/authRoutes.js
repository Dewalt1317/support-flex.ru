const express = require('express'); // Подключение библиотеки Express для работы с веб-приложением.
const { authenticate } = require('../controllers/authController.js'); // Импорт функции аутентификации из контроллера.
const router = express.Router(); // Создание маршрутизатора Express для обработки маршрутов.

router.post('/login', authenticate); // Настройка POST-запроса на маршрут '/login' для аутентификации пользователя.

module.exports = router; // Экспорт маршрутов для использования в основном приложении.
