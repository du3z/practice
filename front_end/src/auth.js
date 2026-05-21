const API_URL = 'http://localhost:5000/api';

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
