require('dotenv').config(); // Загружаем переменные окружения из файла .env.
const { logTimestamp } = require('../utils/logTimestamp.js'); // Импорт функции для форматирования даты и времени

console.log(`${logTimestamp()} Загрузка конфигурации приложения`); // Лог сообщения о начале загрузки конфигурации.

const config = {
  host: {
    main: process.env.MainHost, // Основной url (хост) проекта.
    radio: process.env.RadioHost, // Url (хост) IceCast (публичный).
    radioLocale: process.env.RadioLocaleHost, // Url IceCast (в локальной сети).
    admin: process.env.AdminHost, // Url (хост) админ панели.
    board: process.env.boardHost, // Url (хост) СУП (система управления проектами).
  }, 
  port: {
    https: process.env.HttpsPort, // Основной порт https.
    http: process.env.HttpPort, // Порт http.
    radio: process.env.RadioPort, // Порт IceCast.
    dataSync: process.env.DataSyncPort, // Порт для синхронизатора удалённого вещания.
  }, // Порт, на котором будет работать сервер.
  db: {
    url: process.env.DBurl, // URL (хост) базы данных.
    port: process.env.DBport, // Порт для подключения к базе данных.
    user: process.env.DBuser, // Имя пользователя для базы данных.
    password: process.env.DBpass, // Пароль для доступа к базе данных.
    database: process.env.DBname, // Название базы данных.
  },
  codeword: process.env.CODEWORD, // Кодовое слово для аутентификации.
  MaxLoginAttempts: process.env.MaxLoginAttempts, // Максимально количество попыток входа.
  BadLoginBlockTime: process.env.BadLoginBlockTime, // Количество минут на которого блокируется повторная попытка входа.
  jwtSecret: process.env.JWT_SECRET, // Секретный ключ для подписывания JWT токенов.
  jwtExpiresIn: process.env.JWT_EXPIRES_IN, // Срок действия JWT токена.
  ssl: {
    cert: process.env.SSLcert, // Путь к SSL-сертификату.
    key: process.env.SSLkey, // Путь к приватному ключу SSL.
  },
};

module.exports = config; // Экспорт конфигурации для использования в приложении.
