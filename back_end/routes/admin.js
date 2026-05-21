// routes/admin.js
const express = require('express');
const pool = require('../db/pool');
const { authenticate, isSuperAdmin } = require('../middleware/auth');
const bcrypt = require('bcrypt');

const router = express.Router();

// Получить всех пользователей (только супер-админ)
router.get('/users', authenticate, isSuperAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, role, created_at FROM users ORDER BY created_at ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновить роль пользователя
router.put('/users/:id/role', authenticate, isSuperAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Неверная роль' });
    }
    
    try {
        // Проверяем, что не меняем супер-админа
        const userCheck = await pool.query(
            'SELECT role FROM users WHERE id = $1',
            [id]
        );
        
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        if (userCheck.rows[0].role === 'super_admin') {
            return res.status(403).json({ error: 'Нельзя изменить роль супер-администратора' });
        }
        
        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, email, role',
            [role, id]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удалить пользователя
router.delete('/users/:id', authenticate, isSuperAdmin, async (req, res) => {
    const { id } = req.params;
    
    try {
        // Проверяем, что не удаляем супер-админа
        const userCheck = await pool.query(
            'SELECT role FROM users WHERE id = $1',
            [id]
        );
        
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        if (userCheck.rows[0].role === 'super_admin') {
            return res.status(403).json({ error: 'Нельзя удалить супер-администратора' });
        }
        
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить статистику
router.get('/stats', authenticate, isSuperAdmin, async (req, res) => {
    try {
        const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
        const superAdmins = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'super_admin'");
        const admins = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
        const regularUsers = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'");
        
        res.json({
            total: parseInt(totalUsers.rows[0].count),
            super_admins: parseInt(superAdmins.rows[0].count),
            admins: parseInt(admins.rows[0].count),
            users: parseInt(regularUsers.rows[0].count)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;