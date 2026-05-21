CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(20) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT 'Новая',
    image TEXT,
    is_read BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL,
    sender_name VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_ticket_id ON messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE OR REPLACE FUNCTION generate_ticket_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ticket_id := 'ID-' || LPAD(NEW.id::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_ticket_id ON tickets;
CREATE TRIGGER set_ticket_id
    AFTER INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION generate_ticket_id();

INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@helpdesk.com', '$2b$10$hashed_password_here', 'super_admin'),
('ivanov', 'ivanov@example.com', '$2b$10$hashed_password_here', 'user'),
('petrov', 'petrov@example.com', '$2b$10$hashed_password_here', 'user'),
('sidorov', 'sidorov@example.com', '$2b$10$hashed_password_here', 'admin');

INSERT INTO tickets (user_id, title, status, created_at) VALUES
(2, 'Не работает принтер в 304 кабинете', 'Новая', '2026-05-20 10:30:00'),
(2, 'Проблема с доступом к почте', 'В работе', '2026-05-19 15:20:00'),
(3, 'Зависает компьютер при запуске', 'Решено', '2026-05-18 09:15:00'),
(3, 'Не открывается 1С:Предприятие', 'Новая', '2026-05-21 11:00:00'),
(4, 'Требуется доступ к общему диску', 'В работе', '2026-05-17 14:45:00');

INSERT INTO messages (ticket_id, sender, sender_name, text, created_at) VALUES
(1, 'user', 'Иванов', 'Добрый день! Не печатает принтер в 304 кабинете. Ошибка "Нет бумаги", но бумага есть.', '2026-05-20 10:30:00'),
(1, 'admin', 'Техподдержка', 'Здравствуйте! Проверьте, правильно ли установлена бумага в лотке. Также попробуйте перезагрузить принтер.', '2026-05-20 11:00:00'),
(1, 'user', 'Иванов', 'Перезагрузил, помогло! Спасибо!', '2026-05-20 11:30:00'),
(2, 'user', 'Иванов', 'Не могу зайти в корпоративную почту, пишет "Неверный пароль"', '2026-05-19 15:20:00'),
(2, 'admin', 'Техподдержка', 'Сбросили пароль, проверьте новый на почту', '2026-05-19 16:00:00'),
(3, 'user', 'Петров', 'Компьютер зависает на синем экране при загрузке Windows', '2026-05-18 09:15:00'),
(3, 'admin', 'Техподдержка', 'Провели диагностику. Проблема в оперативной памяти. Заменили, теперь всё работает.', '2026-05-18 17:00:00');
