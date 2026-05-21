import { getAuthToken } from './auth.js';

const API_URL = 'http://localhost:5000/api';

async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
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

export async function getTickets() {
    try {
        const tickets = await apiRequest('/tickets');
        return tickets.map(ticket => ({
            ...ticket,
            messages: []
        }));
    } catch (error) {
        console.error('Ошибка получения заявок:', error);
        return [];
    }
}

export async function getUserTickets() {
    try {
        const tickets = await apiRequest('/tickets');
        return tickets;
    } catch (error) {
        console.error('Ошибка получения заявок пользователя:', error);
        return [];
    }
}

export async function addTicket(title, desc, image = null) {
    try {
        const ticket = await apiRequest('/tickets', {
            method: 'POST',
            body: JSON.stringify({ title, description: desc, image })
        });
        return ticket;
    } catch (error) {
        console.error('Ошибка создания заявки:', error);
        throw error;
    }
}

export async function getTicketMessages(ticketId) {
    try {
        const messages = await apiRequest(`/tickets/${ticketId}/messages`);
        return messages;
    } catch (error) {
        console.error('Ошибка получения сообщений:', error);
        return [];
    }
}

export async function sendMessage(ticketId, sender, text) {
    try {
        await apiRequest('/messages', {
            method: 'POST',
            body: JSON.stringify({ ticketId, text })
        });
        return true;
    } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
        return false;
    }
}

export async function updateTicketStatus(id, newStatus) {
    try {
        await apiRequest(`/tickets/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        return true;
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
        return false;
    }
}

export async function deleteTicket(id) {
    try {
        await apiRequest(`/tickets/${id}`, {
            method: 'DELETE'
        });
        return true;
    } catch (error) {
        console.error('Ошибка удаления заявки:', error);
        return false;
    }
}

export async function markAsRead(ticketId) {
    try {
        await apiRequest(`/messages/${ticketId}/read`, {
            method: 'PUT'
        });
        return true;
    } catch (error) {
        console.error('Ошибка отметки о прочтении:', error);
        return false;
    }
}
