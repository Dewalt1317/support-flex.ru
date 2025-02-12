const config = require('../config/env.js'); // Конфигурационный файл с настройками приложения (например, секретный ключ, срок действия токенов).
const { getUserByID, createUserRoleUser, updateLoginAttempts, checkLoginAttempts } = require('../models/userModel.js'); // Функции для работы с моделью пользователя (получение и создание пользователей).

const codewordAuth = async (codeword, userID) => {
  let setCookieUserID = false;
  authType = "codeword"
  // Проверяем есть ли кука с id пользователя
  // Если нет или такого пользователя не существует, то создаём нового
  if (!userID) {
    userID = await createUserRoleUser();
    setCookieUserID = true;
  } else {
    const user = await getUserByID(userID);
    if (!user) {
      // Если пользователь не существует, создаётся новый.
      userID = await createUserRoleUser();
      setCookieUserID = true;
    } else {
      // Если пользователь существует, его ID извлекается из результата.
      userID = user.userID;
    }
  }


  const loginAttempts = checkLoginAttempts(userID)

  if (loginAttempts.blocked) {
    return { status: 403, blockedTime: loginAttempts.blockedUntil }; // Ответ с кодом 403 (blocked), если логин заблокирован.
  }

  // Проверка правильности переданного `codeword`.
  if (codeword !== config.codeword) {
    const newLoginAttempts = updateLoginAttempts(userID)
    if (newLoginAttempts.loginAttempts <= 0) {
      return { status: 403, blockedTime: newLoginAttempts.blockedUntil }; // Ответ с кодом 403 (Unauthorized), если логин заблокирован.
    }
    return { status: 401, Attempts: newLoginAttempts.loginAttempts }; // Ответ с кодом 401 (Unauthorized), если `codeword` неверный.
  }

  return { status: 200, authType: authType, userID: userID, setCookieUserID: setCookieUserID };  // Ответ с кодом 200 (OK), если `codeword` верный.
}

module.exports = { codewordAuth }; // Экспорт функции аутентификации для использования в других модулях.