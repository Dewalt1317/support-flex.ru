const chatModel = require('../models/chatModel');

exports.getChat = async (req, res) => {
    try {
        const messages = await chatModel.getChatMessages();
        res.json({
            result: 'getOk',
            comand: 'getChat',
            message: messages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            result: 'error',
            error: error.message
        });
    }
};
