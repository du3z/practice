// routes/messages.js
const express = require('express');
const pool = require('../db/pool');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Отправить сообщение
router.post('/', authenticate, async (req, res) => {
    const { ticketId, text } = req.body;
    
    if (!text || text.trim().length < 2) {
        return res.status(400).json({ error: 'Сообщение должно быть не менее 2 символов' });
    }
    
    try {
        // Проверяем доступ к заявке
        let hasAccess = false;
        let ticket;
        
        if (req.user.role === 'admin' || req.user.role === 'super_admin') {
            const result = await pool.query(
                'SELECT * FROM tickets WHERE id = $1',
                [ticketId]
            );
            if (result.rows.length > 0) {
                hasAccess = true;
                ticket = result.rows[0];
            }
        } else {
            const result = await pool.query(
                'SELECT * FROM tickets WHERE id = $1 AND user_id = $2',
                [ticketId, req.user.id]
            );
            if (result.rows.length > 0) {
                hasAccess = true;
                ticket = result.rows[0];
            }
        }
        
        if (!hasAccess) {
            return res.status(403).json({ error: 'Нет доступа к этой заявке' });
        }
        
        // Определяем отправителя
        const sender = (req.user.role === 'admin' || req.user.role === 'super_admin') ? 'admin' : 'user';
        const senderName = sender === 'admin' ? 'Техподдержка' : req.user.username;
        
        // Добавляем сообщение
        await pool.query(
            'INSERT INTO messages (ticket_id, sender, sender_name, text) VALUES ($1, $2, $3, $4)',
            [ticketId, sender, senderName, text.trim()]
        );
        
        // Если сообщение от админа, меняем статус is_read
        if (sender === 'admin') {
            await pool.query('UPDATE tickets SET is_read = false WHERE id = $1', [ticketId]);
        }
        
        // Если статус заявки "Решено" и пользователь пишет - меняем на "В работе"
        if (sender === 'user' && ticket.status === 'Решено') {
            await pool.query('UPDATE tickets SET status = $1 WHERE id = $2', ['В работе', ticketId]);
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Отметить заявку как прочитанную
router.put('/:ticketId/read', authenticate, async (req, res) => {
    const { ticketId } = req.params;
    
    try {
        await pool.query('UPDATE tickets SET is_read = true WHERE id = $1', [ticketId]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;