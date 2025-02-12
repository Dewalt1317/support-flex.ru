const WebSocket = require('ws'); // Подключение библиотеки для работы с WebSocket.
const { wsSessionMiddleware } = require('../middlewares/sessionMiddleware'); // Импорт middleware для проверки сессии.

// Создаем WebSocket-сервер
const createWSServer = (server) => {
  // Создаем новый WebSocket сервер, привязанный к существующему HTTP серверу.
  const wss = new WebSocket.Server({ server });

  // Обработка подключения нового клиента.
  wss.on('connection', (ws, req) => {

    // Используем middleware для проверки сессии.
    wsSessionMiddleware(ws, req, () => {
      // Если сессия действительна, продолжаем обработку.

      // Обработка сообщений от клиента.
      ws.on('message', (message) => {
        message = JSON.parse(message)
        switch (message.comand) {
          case "chatRegistration":

            break
          case "getChat":

            break
          case "sendMessage":

            break
        }

      });

      // Отправляем сообщение приветствия клиенту.
      ws.send('Welcome to the WebSocket server!');

      // Отправка данных клиентам с помощью setInterval.
      setInterval(() => {

      }, 5000); // Отправка данных каждые 5 секунд.
    });

    // Обработка ошибок WebSocket соединения.
    ws.on('error', (error) => {
      console.error(`[WebSocket] Error: ${error.message}`);
    });
  });

  return wss; // Возвращаем экземпляр WebSocket сервера.
};

module.exports = createWSServer; // Экспорт функции для создания WebSocket сервера.
