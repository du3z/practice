import { getTickets, deleteTicket, sendMessage, updateTicketStatus, getUserTickets, getTicketMessages, markAsRead } from './store.js';
import { showNotification } from './notifications.js';
import { getCurrentUser } from './auth.js';

export let currentFilterStatus = 'Все';
export let currentSearchQuery = '';
export let currentSortDirection = 'desc';

export function setFilterStatus(val) { currentFilterStatus = val; }
export function setSearchQuery(val) { currentSearchQuery = val; }
export function setSortDirection(val) { currentSortDirection = val; }

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function getStatusStyle(status) {
    switch (status) {
        case 'Новая': return 'bg-blue-50 text-blue-700 border border-blue-200';
        case 'В работе': return 'bg-amber-50 text-amber-700 border border-amber-200';
        case 'Решено': return 'bg-green-50 text-green-700 border border-green-200';
        default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
}

export async function renderChatMessages(ticketId) {
    const messages = await getTicketMessages(ticketId);
    
    return messages.map(msg => {
        const isAdmin = msg.sender === 'admin';
        const bgClass = isAdmin ? 'bg-emerald-50 border-emerald-100 ml-8' : 'bg-gray-50 border-gray-100 mr-8';
        const senderName = msg.sender_name || (isAdmin ? 'Техподдержка' : 'Вы');
        const senderColor = isAdmin ? 'text-emerald-800' : 'text-blue-800';

        return `
            <div class="p-3.5 rounded-xl border ${bgClass} mb-2.5">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-xs font-bold ${senderColor}">${escapeHtml(senderName)}</span>
                    <span class="text-[10px] text-gray-400">${new Date(msg.created_at).toLocaleString('ru-RU')}</span>
                </div>
                <p class="text-gray-700 text-sm whitespace-pre-line">${escapeHtml(msg.text)}</p>
            </div>
        `;
    }).join('');
}

export async function updateNotificationBadge() {
    const badge = document.getElementById('profile-badge');
    const viewProfile = document.getElementById('view-profile');
    const currentUser = await getCurrentUser();
    
    if (!badge) return;
    
    const tickets = await getTickets();
    
    if (!viewProfile.classList.contains('hidden') && currentUser) {
        for (const ticket of tickets) {
            if (ticket.user_id === currentUser.id && !ticket.is_read) {
                await markAsRead(ticket.id);
            }
        }
        badge.classList.add('hidden');
        return;
    }

    const unreadCount = tickets.filter(t => {
        if (currentUser && t.user_id !== currentUser.id) return false;
        return !t.is_read;
    }).length;

    if (unreadCount > 0) {
        badge.innerText = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

export async function renderUserTickets() {
    const container = document.getElementById('user-tickets-list');
    if (!container) return;
    
    const tickets = await getUserTickets();
    const currentUser = await getCurrentUser();

    if (tickets.length === 0) {
        container.innerHTML = `<div class="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl">Вы еще не создали ни одного обращения.</div>`;
        return;
    }

    container.innerHTML = '';
    
    for (const ticket of tickets) {
        const imageBlock = ticket.image
            ? `<div class="mt-3 mb-4"><span class="text-xs font-semibold text-gray-400 block mb-1">Прикрепленный скриншот:</span><img src="${ticket.image}" class="ticket-screenshot-preview max-h-48 rounded-lg border border-gray-200 shadow-xs hover:scale-[1.02] transition cursor-zoom-in"></div>`
            : '';
        
        const messagesHtml = await renderChatMessages(ticket.id);
        const msgCount = (await getTicketMessages(ticket.id)).length;

        const ticketHtml = `
            <div class="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition shadow-xs bg-white relative group" data-ticket-id="${ticket.id}">
                <button data-id="${ticket.id}" class="btn-delete-ticket absolute top-5 right-5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition duration-200 p-1 cursor-pointer z-10" title="Отозвать заявку">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>

                <div class="flex flex-wrap justify-between items-start gap-2 mb-4 pr-8">
                    <div class="flex items-center gap-3 flex-wrap">
                        <span class="text-xs font-mono font-bold text-gray-400">${ticket.ticket_id || ticket.id}</span>
                        <h3 class="font-bold text-gray-900 text-base">${escapeHtml(ticket.title)}</h3>
                    </div>
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(ticket.status)}">${ticket.status}</span>
                </div>
                
                ${imageBlock}

                <button class="toggle-chat-btn w-full text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 my-2 flex justify-between items-center transition cursor-pointer text-sm font-medium text-gray-700">
                    <span class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        История переписки (${msgCount})
                    </span>
                    <svg class="arrow-icon w-4 h-4 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>

                <div class="chat-wrapper hidden mt-4 border-t border-gray-100 pt-4">
                    <div class="space-y-2" id="messages-container-${ticket.id}">
                        ${messagesHtml}
                    </div>
                    
                    <div class="mt-4 pt-4 border-t border-gray-100">
                        <div class="flex gap-2">
                            <input type="text" id="user-reply-${ticket.id}" class="flex-grow px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Напишите сообщение...">
                            <button data-id="${ticket.id}" class="btn-user-reply bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition cursor-pointer">Ответить</button>
                        </div>
                    </div>
                </div>
                
                <div class="text-right text-[10px] text-gray-400 mt-3">Создано: ${new Date(ticket.created_at).toLocaleString('ru-RU')}</div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', ticketHtml);
    }

    attachUserEventListeners(container);
}

function attachUserEventListeners(container) {
    container.querySelectorAll('.btn-delete-ticket').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (confirm(`Вы уверены, что хотите отозвать и удалить заявку ${id}?`)) {
                await deleteTicket(id);
                showNotification(`Заявка удалена`, 'info');
                await renderUserTickets();
                await updateNotificationBadge();
            }
        });
    });

    container.querySelectorAll('.btn-user-reply').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            const input = document.getElementById(`user-reply-${id}`);
            if (!input || input.value.trim().length < 2) return;

            const wrapper = btn.closest('.chat-wrapper');
            const wasOpen = wrapper && !wrapper.classList.contains('hidden');

            await sendMessage(id, 'user', input.value);
            input.value = '';
            showNotification('Сообщение отправлено админу');

            await renderUserTickets();

            if (wasOpen) {
                const newWrapper = document.getElementById(`user-reply-${id}`)?.closest('.chat-wrapper');
                if (newWrapper) {
                    newWrapper.classList.remove('hidden');
                    const toggleBtn = newWrapper.previousElementSibling;
                    if (toggleBtn && toggleBtn.classList.contains('toggle-chat-btn')) {
                        toggleBtn.querySelector('.arrow-icon')?.classList.add('rotate-180');
                    }
                }
            }
        });
    });

    container.querySelectorAll('.toggle-chat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const wrapper = btn.nextElementSibling;
            const arrow = btn.querySelector('.arrow-icon');
            wrapper.classList.toggle('hidden');
            arrow.classList.toggle('rotate-180');
        });
    });
}

export async function renderAdminTickets() {
    const container = document.getElementById('admin-tickets-list');
    const emptyState = document.getElementById('admin-empty-state');
    if (!container) return;
    
    let tickets = await getTickets();

    if (currentFilterStatus !== 'Все') {
        tickets = tickets.filter(t => t.status === currentFilterStatus);
    }

    if (currentSearchQuery !== '') {
        const query = currentSearchQuery.toLowerCase().trim();
        tickets = tickets.filter(t => t.title.toLowerCase().includes(query) || (t.ticket_id && t.ticket_id.toLowerCase().includes(query)));
    }

    if (currentSortDirection === 'desc') {
        tickets.reverse();
    }

    if (tickets.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    } else {
        if (emptyState) emptyState.classList.add('hidden');
    }

    container.innerHTML = '';
    
    for (const ticket of tickets) {
        const imageBlock = ticket.image
            ? `<div class="mt-3 mb-4"><span class="text-xs font-semibold text-gray-400 block mb-1">Скриншот пользователя:</span><img src="${ticket.image}" class="ticket-screenshot-preview max-h-40 rounded-lg border border-gray-200 shadow-xs hover:scale-[1.01] transition cursor-zoom-in"></div>`
            : '';
        
        const messagesHtml = await renderChatMessages(ticket.id);
        const msgCount = (await getTicketMessages(ticket.id)).length;

        const ticketHtml = `
            <div class="border border-gray-200 rounded-xl p-5 bg-white shadow-xs relative group" data-ticket-id="${ticket.id}">
                <button data-id="${ticket.id}" class="btn-delete-admin absolute top-5 right-5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition duration-200 p-1 cursor-pointer z-10" title="Удалить заявку безвозвратно">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>

                <div class="mb-4 pr-8">
                    <div class="flex flex-wrap justify-between items-start gap-3">
                        <div>
                            <div class="flex items-center gap-2 mb-1 flex-wrap">
                                <span class="text-xs font-mono font-bold text-gray-400">${ticket.ticket_id || ticket.id}</span>
                                <span class="text-xs text-gray-400">${new Date(ticket.created_at).toLocaleString('ru-RU')}</span>
                            </div>
                            <div class="text-xs text-gray-500">Пользователь: <span class="font-medium">${escapeHtml(ticket.username || 'Неизвестно')}</span></div>
                        </div>
                        <div class="flex items-center gap-2 flex-shrink-0">
                            <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(ticket.status)}">${ticket.status}</span>
                            <select data-id="${ticket.id}" class="status-select bg-gray-50 border border-gray-300 rounded-lg text-xs p-1.5 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer">
                                <option value="Новая" ${ticket.status === 'Новая' ? 'selected' : ''}>Новая</option>
                                <option value="В работе" ${ticket.status === 'В работе' ? 'selected' : ''}>В работе</option>
                                <option value="Решено" ${ticket.status === 'Решено' ? 'selected' : ''}>Решено</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <h3 class="font-bold text-gray-900 text-base mb-3">${escapeHtml(ticket.title)}</h3>
                
                ${imageBlock}

                <button class="toggle-chat-btn w-full text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 my-2 flex justify-between items-center transition cursor-pointer text-sm font-medium text-gray-700">
                    <span class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        Открыть диалог с пользователем (${msgCount})
                    </span>
                    <svg class="arrow-icon w-4 h-4 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>

                <div class="chat-wrapper hidden mt-4 border-t border-gray-100 pt-4">
                    <div class="space-y-2" id="admin-messages-container-${ticket.id}">
                        ${messagesHtml}
                    </div>
                    
                    <div class="mt-4 pt-4 border-t border-gray-100">
                        <label class="block text-xs font-semibold text-gray-500 mb-1">Написать ответ:</label>
                        <div class="flex gap-2">
                            <input type="text" id="admin-reply-${ticket.id}" class="flex-grow px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Введите сообщение...">
                            <button data-id="${ticket.id}" class="btn-admin-reply bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition cursor-pointer">Отправить</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', ticketHtml);
    }

    attachAdminEventListeners(container);
}

function attachAdminEventListeners(container) {
    container.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const id = e.target.getAttribute('data-id');
            await updateTicketStatus(id, e.target.value);
            showNotification(`Статус заявки обновлен`, 'info');
            await renderAdminTickets();
        });
    });

    container.querySelectorAll('.btn-admin-reply').forEach(button => {
        button.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            const input = document.getElementById(`admin-reply-${id}`);
            if (!input || input.value.trim().length < 2) return;

            const wasOpen = !button.closest('.chat-wrapper').classList.contains('hidden');

            await sendMessage(id, 'admin', input.value);
            input.value = '';
            await renderAdminTickets();

            if (wasOpen) {
                const newWrapper = document.getElementById(`admin-reply-${id}`)?.closest('.chat-wrapper');
                if (newWrapper) {
                    newWrapper.classList.remove('hidden');
                    const arrow = newWrapper.previousElementSibling.querySelector('.arrow-icon');
                    if (arrow) arrow.classList.add('rotate-180');
                }
            }

            showNotification(`Ответ отправлен пользователю`, 'success');
            await updateNotificationBadge();
        });
    });

    container.querySelectorAll('.btn-delete-admin').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (confirm(`Администратор, вы уверены, что хотите НАВСЕГДА удалить заявку?`)) {
                await deleteTicket(id);
                showNotification(`Заявка стёрта из базы`, 'info');
                await renderAdminTickets();
                await updateNotificationBadge();
            }
        });
    });

    container.querySelectorAll('.toggle-chat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const wrapper = btn.nextElementSibling;
            const arrow = btn.querySelector('.arrow-icon');
            wrapper.classList.toggle('hidden');
            arrow.classList.toggle('rotate-180');
        });
    });
}
