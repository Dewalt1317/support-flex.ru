// Middleware для обработки ошибок
const errorMiddleware = (err, req, res, next) => {
  // Логирование ошибки в консоль с указанием сообщения и стека.
  console.error(`[Error] ${err.message}`, err.stack);

  // Формирование ответа с кодом ошибки (по умолчанию 500) и описанием ошибки.
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error', // Сообщение об ошибке (если отсутствует, возвращается общее сообщение).
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, 
    // Если приложение работает в режиме разработки (NODE_ENV=development), в ответ добавляется стек ошибки.
    // В противном случае стек скрыт из соображений безопасности.
  });
};

module.exports = errorMiddleware; // Экспорт middleware для использования в приложении.
