const { getUserByLoginAndPassword } = require('../models/userModel.js'); // Функции для работы с моделью пользователя (получение и создание пользователей).

const loginAuth = async (login, pass) => {
    const user = await getUserByLoginAndPassword(login, pass);

    // Проверяем, прошли ли логин и пароль проверку
    if (!user) {
        return { status: 401, Attempts: null }; // Ответ с кодом 401 (Unauthorized), если `login` или `pass` неверные.
    }
    return { status: 200, authType: "login", userID: user.userID };
}

module.exports = { loginAuth }; // Экспорт функции аутентификации для использования в других модулях.
