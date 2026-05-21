// const USERS_KEY = 'support_users';
// const CURRENT_USER_KEY = 'current_user';

// export function getUsers() {
//     const users = localStorage.getItem(USERS_KEY);
//     return users ? JSON.parse(users) : [];
// }

// function saveUsers(users) {
//     localStorage.setItem(USERS_KEY, JSON.stringify(users));
// }

// export function register(username, email, password, role = 'user') {
//     const users = getUsers();

//     if (users.find(u => u.username === username)) {
//         return { success: false, error: 'Пользователь с таким именем уже существует' };
//     }
    
//     if (users.find(u => u.email === email)) {
//         return { success: false, error: 'Пользователь с таким email уже существует' };
//     }

//     let assignedRole = role;
//     if (users.length === 0) {
//         assignedRole = 'super_admin';
//     }

//     const newUser = {
//         id: Date.now().toString(),
//         username: username.trim(),
//         email: email.trim(),
//         password: btoa(password),
//         role: assignedRole,
//         createdAt: new Date().toISOString()
//     };
    
//     users.push(newUser);
//     saveUsers(users);
    
//     return { success: true, user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role } };
// }

// export function login(usernameOrEmail, password) {
//     const users = getUsers();
//     const user = users.find(u => 
//         (u.username === usernameOrEmail || u.email === usernameOrEmail) && 
//         u.password === btoa(password)
//     );
    
//     if (!user) {
//         return { success: false, error: 'Неверное имя пользователя/email или пароль' };
//     }

//     const currentUser = {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         role: user.role
//     };
//     localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    
//     return { success: true, user: currentUser };
// }

// export function logout() {
//     localStorage.removeItem(CURRENT_USER_KEY);
// }

// export function getCurrentUser() {
//     const user = localStorage.getItem(CURRENT_USER_KEY);
//     return user ? JSON.parse(user) : null;
// }

// export function isAuthenticated() {
//     return getCurrentUser() !== null;
// }

// export function isAdmin() {
//     const user = getCurrentUser();
//     return user && (user.role === 'admin' || user.role === 'super_admin');
// }

// export function isSuperAdmin() {
//     const user = getCurrentUser();
//     return user && user.role === 'super_admin';
// }

// export function updateUserRole(userId, newRole) {
//     const users = getUsers();
//     const currentUser = getCurrentUser();

//     if (!isSuperAdmin()) {
//         return { success: false, error: 'Недостаточно прав' };
//     }
    
//     const index = users.findIndex(u => u.id === userId);
//     if (index === -1) {
//         return { success: false, error: 'Пользователь не найден' };
//     }

//     if (users[index].role === 'super_admin') {
//         return { success: false, error: 'Нельзя изменить роль супер-администратора' };
//     }
    
//     users[index].role = newRole;
//     saveUsers(users);
    
//     return { success: true };
// }

// export function deleteUser(userId) {
//     const users = getUsers();
//     const currentUser = getCurrentUser();

//     if (!isSuperAdmin()) {
//         return { success: false, error: 'Недостаточно прав' };
//     }
    
//     const user = users.find(u => u.id === userId);
//     if (!user) {
//         return { success: false, error: 'Пользователь не найден' };
//     }

//     if (user.role === 'super_admin') {
//         return { success: false, error: 'Нельзя удалить супер-администратора' };
//     }
    
//     const filtered = users.filter(u => u.id !== userId);
//     saveUsers(filtered);
    
//     return { success: true };
// }

// export function getAllUsers() {
//     if (!isSuperAdmin()) {
//         return [];
//     }
//     return getUsers();
// }

// export function getUserStats() {
//     const users = getUsers();
//     return {
//         total: users.length,
//         super_admins: users.filter(u => u.role === 'super_admin').length,
//         admins: users.filter(u => u.role === 'admin').length,
//         users: users.filter(u => u.role === 'user').length
//     };
// }


// auth.js - работа с API бекенда

const API_URL = 'http://localhost:5000/api';

// Храним токен в localStorage
let authToken = localStorage.getItem('auth_token');

export function setAuthToken(token) {
    authToken = token;
    if (token) {
        localStorage.setItem('auth_token', token);
    } else {
        localStorage.removeItem('auth_token');
    }
}

export function getAuthToken() {
    return authToken;
}

// Вспомогательная функция для запросов
async function apiRequest(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Ошибка запроса');
    }
    
    return data;
}

export async function register(username, email, password) {
    try {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        
        if (data.success) {
            return { success: true, user: data.user };
        }
        return { success: false, error: 'Ошибка регистрации' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function login(usernameOrEmail, password) {
    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ usernameOrEmail, password })
        });
        
        if (data.success) {
            setAuthToken(data.token);
            return { success: true, user: data.user };
        }
        return { success: false, error: 'Ошибка входа' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export function logout() {
    setAuthToken(null);
}

export async function getCurrentUser() {
    if (!authToken) return null;
    
    try {
        const data = await apiRequest('/auth/me');
        return data.user;
    } catch (error) {
        return null;
    }
}

export function isAuthenticated() {
    return !!authToken;
}

export async function isAdmin() {
    const user = await getCurrentUser();
    return user && (user.role === 'admin' || user.role === 'super_admin');
}

export async function isSuperAdmin() {
    const user = await getCurrentUser();
    return user && user.role === 'super_admin';
}

export async function getAllUsers() {
    try {
        const data = await apiRequest('/admin/users');
        return data;
    } catch (error) {
        console.error('Ошибка получения пользователей:', error);
        return [];
    }
}

export async function updateUserRole(userId, newRole) {
    try {
        const data = await apiRequest(`/admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role: newRole })
        });
        return { success: true, user: data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function deleteUser(userId) {
    try {
        await apiRequest(`/admin/users/${userId}`, {
            method: 'DELETE'
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getUserStats() {
    try {
        const data = await apiRequest('/admin/stats');
        return data;
    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        return { total: 0, super_admins: 0, admins: 0, users: 0 };
    }
}