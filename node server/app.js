const express = require('express'); // Подключение Express — фреймворка для создания веб-приложений.
const bodyParser = require('body-parser'); // Миддлвар для парсинга тела запросов в JSON-формате.
const cookieParser = require('cookie-parser'); // Миддлвар для работы с HTTP-куками.
const fs = require('fs'); // Модуль для работы с файловой системой (чтение/запись файлов).
const https = require('https'); // Модуль для создания HTTPS-сервера.
const path = require('path'); 
const authRoutes = require('./routes/authRoutes.js'); // Подключение маршрутов для обработки запросов, связанных с аутентификацией.
const apiRoutes = require('./routes/apiRoutes.js'); // Подключение маршрутов для обработки запросов, связанных с api.
const { ssl, port, host } = require('./config/env.js'); // Импорт конфигурации: пути к SSL-сертификатам и порт сервера.
const createWSServer = require('./wss/wssServer.js'); // Импорт функции для создания WebSocket сервера
const errorMiddleware = require('./middlewares/errorMiddleware.js'); // Импорт middleware для обработки ошибок
const { logTimestamp } = require('./utils/logTimestamp.js'); // Импорт функции для форматирования даты и времени
const hostMiddleware = require('./middlewares/hostMiddleware.js'); // Импорт middleware для обработки запросов к разным хостам

const app = express(); // Создание экземпляра Express-приложения.

app.use(bodyParser.json()); // Настройка миддлвара для обработки JSON-тел запросов.
app.use(cookieParser()); // Настройка миддлвара для работы с куками.
app.use(hostMiddleware); // Middleware для обработки запросов к разным хостам
app.use('/auth', authRoutes); // Подключение маршрутов, доступных по пути '/auth'.
app.use('/api', apiRoutes); // Подключение маршрутов, доступных по пути '/api'.
app.use(errorMiddleware); // Middleware для обработки ошибок


console.log(`${logTimestamp()} Чтение SSL-сертификата и приватного ключа с указанного пути`)

let cert, key;
try {
  cert = fs.readFileSync(ssl.cert); // Чтение SSL-сертификата с указанного пути.
  key = fs.readFileSync(ssl.key); // Чтение приватного ключа с указанного пути.
} catch (error) {
  console.error(`${logTimestamp()} Ошибка чтения SSL-сертификатов: `, error.message); // Вывод сообщения об ошибке.
  process.exit(1); // Завершение работы сервера при ошибке.
}

const server = https.createServer(
  {
    cert, // Использование прочитанного SSL-сертификата.
    key, // Использование прочитанного приватного ключа.
  },
  app // Передача экземпляра приложения Express в HTTPS-сервер.
);

// Создание WebSocket сервера на основе HTTPS сервера.
console.log(`${logTimestamp()} Запуск WebSocket сервера`);
createWSServer(server);

console.log(`${logTimestamp()} Запуск http сервера`); // Лог сообщения с информацией о порте.
server.listen(port, () => {
  // Запуск сервера на указанном порту.
  console.log(`${logTimestamp()} Сервера запущены и доступны по адресу: ${host.main}:${port}`); // Лог сообщения с информацией о порте.
});
                      