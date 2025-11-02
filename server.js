require('dotenv').config();
const express = require('express');
const trashPaths = require('./middlewares/trashPaths');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Раздача статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Парсинг JSON и form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Мидлеваре
app.use(trashPaths); 

// Роутинг для чистых URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/portfolio', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/portfolio.html'));
});

// Эндпоинт для формы
app.post('/submit-form', async (req, res) => {
    const { fullName, email, phone, message, website } = req.body;

    console.log('Form Data:', req.body);

    // Проверка honeypot
    if (website && website.trim() !== '') {
        console.warn('🚫 Honeypot triggered. Bot detected:', website);
        return res.status(403).json({ error: 'Bot submission detected.' });
    }

    if (!fullName || !email) {
        return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        const text = `Новое сообщение с сайта:
Имя: ${fullName}
Email: ${email}
Телефон: ${phone}
Сообщение: ${message}`;

        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text }),
        });

        if (response.ok) {
            res.status(200).json({ success: true });
        } else {
            res.status(500).json({ error: 'Failed to send message.' });
        }
    } catch (err) {
        console.error('Error while sending Telegram message:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Эндпоинт для события отслеживания формы
app.post('/track-event', async (req, res) => {
    const { page } = req.body;

    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        const text = `Зафиксировано событие просмотра контактной формы:
Страница: ${page}`;

        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text }),
        });

        if (response.ok) {
            res.status(200).json({ success: true });
        } else {
            res.status(500).json({ error: 'Failed to send message.' });
        }
    } catch (err) {
        console.error('Error while sending Telegram message:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});