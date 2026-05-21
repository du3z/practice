const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const authenticate = async (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Не авторизован' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await pool.query(
            'SELECT id, username, email, role FROM users WHERE id = $1',
            [decoded.userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Пользователь не найден' });
        }
        
        req.user = result.rows[0];
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Неверный токен' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({ error: 'Недостаточно прав' });
    }
};

const isSuperAdmin = (req, res, next) => {
    if (req.user.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({ error: 'Требуются права супер-администратора' });
    }
};

module.exports = { authenticate, isAdmin, isSuperAdmin };