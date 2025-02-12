const db = require('../config/db.js'); // Импорт пула соединений для работы с базой данных.

exports.getChatMessages = async () => {
    const query = `
        SELECT chat.messageID, chat.userID, user.name, chat.date, chat.time, chat.textMessage, chat.ReplyMessageID, chat.photoSRC 
        FROM chat 
        LEFT JOIN user ON chat.userID = user.userID 
        ORDER BY chat.date, chat.time
    `;
    try {
        const [rows] = await db.query(query);
        return rows.map(row => {
            if (row.name === "40817BOTdonationalerts") {
                row.photoSRC = "";
            } else {
                row.textMessage = row.textMessage;
                row.name = row.name;
                row.photoSRC = row.photoSRC;
            }
            return row;
        });
    } catch (error) {
        console.error(error);
        throw new Error('Database query failed');
    }
};
