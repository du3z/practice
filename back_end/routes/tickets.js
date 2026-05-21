const express = require('express');
const pool = require('../db/pool');
const { authenticate, isAdmin } = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

router.get('/', authenticate, async (req, res) => {
    try {
        let query;
        let params;
        
        if (req.user.role === 'admin' || req.user.role === 'super_admin') {
            query = `
                SELECT t.*, u.username 
                FROM tickets t 
                JOIN users u ON t.user_id = u.id 
                ORDER BY t.created_at DESC
            `;
            params = [];
        } else {
            query = `
                SELECT * FROM tickets 
                WHERE user_id = $1 
                ORDER BY created_at DESC
            `;
            params = [req.user.id];
        }
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.post('/', authenticate, upload.single('image'), async (req, res) => {
    const { title, description, image } = req.body;
    
    if (!title || title.length < 5) {
        return res.status(400).json({ error: 'Тема должна быть не менее 5 символов' });
    }
    
    if (!description || description.length < 15) {
        return res.status(400).json({ error: 'Описание должно быть не менее 15 символов' });
    }
    
    try {
        const result = await pool.query(
            `INSERT INTO tickets (user_id, title, image) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [req.user.id, title, image || null]
        );
        
        const ticket = result.rows[0];

        await pool.query(
            `INSERT INTO messages (ticket_id, sender, sender_name, text) 
             VALUES ($1, $2, $3, $4)`,
            [ticket.id, 'user', req.user.username, description]
        );

        const fullTicket = await pool.query(
            'SELECT * FROM tickets WHERE id = $1',
            [ticket.id]
        );
        
        res.json(fullTicket.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.put('/:id/status', authenticate, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['Новая', 'В работе', 'Решено'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Неверный статус' });
    }
    
    try {
        const result = await pool.query(
            'UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Заявка не найдена' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    
    try {
        let query;
        let params;
        
        if (req.user.role === 'admin' || req.user.role === 'super_admin') {
            query = 'DELETE FROM tickets WHERE id = $1 RETURNING *';
            params = [id];
        } else {
            query = 'DELETE FROM tickets WHERE id = $1 AND user_id = $2 RETURNING *';
            params = [id, req.user.id];
        }
        
        const result = await pool.query(query, params);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Заявка не найдена или нет прав' });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.get('/:id/messages', authenticate, async (req, res) => {
    const { id } = req.params;
    
    try {
        let hasAccess = false;
        
        if (req.user.role === 'admin' || req.user.role === 'super_admin') {
            hasAccess = true;
        } else {
            const ticketCheck = await pool.query(
                'SELECT id FROM tickets WHERE id = $1 AND user_id = $2',
                [id, req.user.id]
            );
            hasAccess = ticketCheck.rows.length > 0;
        }
        
        if (!hasAccess) {
            return res.status(403).json({ error: 'Нет доступа к этой заявке' });
        }
        
        const result = await pool.query(
            'SELECT * FROM messages WHERE ticket_id = $1 ORDER BY created_at ASC',
            [id]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;
