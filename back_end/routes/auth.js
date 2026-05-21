// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    
    if (password.length < 4) {
        return res.status(400).json({ error: 'Пароль должен быть не менее 4 символов' });
    }
    
    try {
        // Проверка существования пользователя
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким именем или email уже существует' });
        }
        
        // Определяем роль (первый пользователь - супер-админ)
        const userCount = await pool.query('SELECT COUNT(*) FROM users');
        let role = 'user';
        if (parseInt(userCount.rows[0].count) === 0) {
            role = 'super_admin';
        }
        
        // Хеширование пароля
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Создание пользователя
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
            [username, email, passwordHash, role]
        );
        
        const user = result.rows[0];
        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Логин
router.post('/login', async (req, res) => {
    const { usernameOrEmail, password } = req.body;
    
    try {
        const result = await pool.query(
            'SELECT id, username, email, password_hash, role FROM users WHERE username = $1 OR email = $1',
            [usernameOrEmail]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверное имя пользователя/email или пароль' });
        }
        
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверное имя пользователя/email или пароль' });
        }
        
        // Создание JWT токена
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение текущего пользователя
router.get('/me', authenticate, async (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;