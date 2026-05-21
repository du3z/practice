// import { getCurrentUser } from './auth.js';

// export function getTickets() {
//     return JSON.parse(localStorage.getItem('tickets')) || [];
// }

// function getNow() {
//     return new Date().toLocaleString('ru-RU', {
//         day: '2-digit', month: '2-digit', year: 'numeric',
//         hour: '2-digit', minute: '2-digit'
//     });
// }

// export function addTicket(title, desc, image = null) {
//     const tickets = getTickets();
//     const currentUser = getCurrentUser();
    
//     if (!currentUser) {
//         throw new Error('Пользователь не авторизован');
//     }
    
//     const ticketId = 'ID-' + Math.floor(1000 + Math.random() * 9000);
//     const now = getNow();

//     const newTicket = {
//         id: ticketId,
//         userId: currentUser.id,
//         username: currentUser.username,
//         title: title.trim(),
//         status: 'Новая',
//         isRead: true,
//         image: image,
//         date: now,
//         messages: [{
//             sender: 'user',
//             senderName: currentUser.username,
//             text: desc.trim(),
//             date: now
//         }]
//     };

//     tickets.push(newTicket);
//     localStorage.setItem('tickets', JSON.stringify(tickets));
//     return newTicket;
// }

// export function getUserTickets() {
//     const tickets = getTickets();
//     const currentUser = getCurrentUser();
    
//     if (!currentUser) return [];
    
//     return tickets.filter(ticket => ticket.userId === currentUser.id);
// }

// export function sendMessage(id, sender, text) {
//     const tickets = getTickets();
//     const index = tickets.findIndex(t => t.id === id);
//     const currentUser = getCurrentUser();

//     if (index !== -1) {
//         const senderName = sender === 'admin' ? 'Техподдержка' : currentUser?.username;
        
//         tickets[index].messages.push({
//             sender: sender,
//             senderName: senderName,
//             text: text.trim(),
//             date: getNow()
//         });

//         if (sender === 'admin') {
//             tickets[index].isRead = false;
//         } else if (tickets[index].status === 'Решено') {
//             tickets[index].status = 'В работе';
//         }

//         localStorage.setItem('tickets', JSON.stringify(tickets));
//         return true;
//     }
//     return false;
// }

// export function updateTicketStatus(id, newStatus) {
//     const tickets = getTickets();
//     const index = tickets.findIndex(t => t.id === id);
//     if (index !== -1) {
//         tickets[index].status = newStatus;
//         localStorage.setItem('tickets', JSON.stringify(tickets));
//         return true;
//     }
//     return false;
// }

// export function deleteTicket(id) {
//     const tickets = getTickets();
//     const filtered = tickets.filter(t => t.id !== id);
//     localStorage.setItem('tickets', JSON.stringify(filtered));
//     return true;
// }


// store.js - работа с заявками через API

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
        // Преобразуем для совместимости с фронтом
        return tickets.map(ticket => ({
            ...ticket,
            messages: [] // Сообщения загружаются отдельно
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