// import { addTicket } from './store.js';
// import { useForm } from './useForm.js';
// import { showNotification } from './notifications.js';
// import { initModal } from './modal.js';
// import { 
//     renderUserTickets, 
//     renderAdminTickets, 
//     updateNotificationBadge,
//     currentSortDirection,
//     setFilterStatus,
//     setSearchQuery,
//     setSortDirection
// } from './ui.js';
// import { 
//     register, login, logout, getCurrentUser, isAuthenticated, isAdmin, isSuperAdmin,
//     getAllUsers, updateUserRole, deleteUser, getUserStats
// } from './auth.js';

// initModal();

// const navButtons = document.querySelectorAll('.nav-btn');
// const sections = document.querySelectorAll('.spa-section');
// const logoHome = document.getElementById('logo-home');

// const viewMain = document.getElementById('view-main');
// const viewProfile = document.getElementById('view-profile');
// const viewAdmin = document.getElementById('view-admin');
// const viewLogin = document.getElementById('view-login');
// const viewRegister = document.getElementById('view-register');

// const profileNavBtn = document.getElementById('nav-profile');
// const adminNavBtn = document.getElementById('nav-admin');

// const userInfo = document.getElementById('user-info');
// const usernameSpan = document.getElementById('username-display');
// const logoutBtn = document.getElementById('logout-btn');

// const usersManagementBlock = document.getElementById('users-management');

// function switchToMain() {
//     sections.forEach(s => s.classList.add('hidden'));
//     navButtons.forEach(b => b.classList.remove('target-active'));
//     if (viewMain) viewMain.classList.remove('hidden');
// }

// function switchToLogin() {
//     sections.forEach(s => s.classList.add('hidden'));
//     if (viewLogin) viewLogin.classList.remove('hidden');
// }

// function switchToRegister() {
//     sections.forEach(s => s.classList.add('hidden'));
//     if (viewRegister) viewRegister.classList.remove('hidden');
// }

// function escapeHtml(str) {
//     if (!str) return '';
//     return str.replace(/[&<>]/g, function(m) {
//         if (m === '&') return '&amp;';
//         if (m === '<') return '&lt;';
//         if (m === '>') return '&gt;';
//         return m;
//     });
// }

// function toggleUsersManagementVisibility() {
//     if (usersManagementBlock) {
//         if (isSuperAdmin()) {
//             usersManagementBlock.style.display = 'block';
//         } else {
//             usersManagementBlock.style.display = 'none';
//         }
//     }
// }

// function renderUsersList() {
//     if (!isSuperAdmin()) return;
    
//     const container = document.getElementById('users-management-container');
//     if (!container) return;
    
//     const users = getAllUsers();
//     const stats = getUserStats();
//     const currentUser = getCurrentUser();
    
//     container.innerHTML = `
//         <div class="bg-gray-50 p-4 rounded-xl mb-4">
//             <div class="grid grid-cols-4 gap-3 text-center">
//                 <div class="bg-white rounded-lg p-3 border border-gray-200">
//                     <div class="text-2xl font-bold text-blue-600">${stats.total}</div>
//                     <div class="text-xs text-gray-500">Всего</div>
//                 </div>
//                 <div class="bg-white rounded-lg p-3 border border-gray-200">
//                     <div class="text-2xl font-bold text-purple-600">${stats.super_admins}</div>
//                     <div class="text-xs text-gray-500">👑 Супер-админы</div>
//                 </div>
//                 <div class="bg-white rounded-lg p-3 border border-gray-200">
//                     <div class="text-2xl font-bold text-orange-600">${stats.admins}</div>
//                     <div class="text-xs text-gray-500">⭐ Админы</div>
//                 </div>
//                 <div class="bg-white rounded-lg p-3 border border-gray-200">
//                     <div class="text-2xl font-bold text-green-600">${stats.users}</div>
//                     <div class="text-xs text-gray-500">👤 Пользователи</div>
//                 </div>
//             </div>
//         </div>
//         <div class="space-y-2 max-h-96 overflow-y-auto">
//             ${users.map(user => `
//                 <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
//                     <div class="flex items-center gap-3">
//                         <div class="w-8 h-8 rounded-full flex items-center justify-center ${user.role === 'super_admin' ? 'bg-purple-100' : user.role === 'admin' ? 'bg-orange-100' : 'bg-blue-100'}">
//                             <span class="text-lg">${user.role === 'super_admin' ? '👑' : user.role === 'admin' ? '⭐' : '👤'}</span>
//                         </div>
//                         <div>
//                             <div class="font-medium text-gray-900">${escapeHtml(user.username)}</div>
//                             <div class="text-xs text-gray-500">${escapeHtml(user.email)}</div>
//                         </div>
//                     </div>
//                     <div class="flex items-center gap-2">
//                         <span class="text-xs px-2 py-1 rounded-full ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : user.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}">
//                             ${user.role === 'super_admin' ? 'Супер-админ' : user.role === 'admin' ? 'Админ' : 'Пользователь'}
//                         </span>
//                         ${user.id !== currentUser.id && user.role !== 'super_admin' ? `
//                             <select data-id="${user.id}" class="user-role-select text-xs px-2 py-1 rounded-lg border border-gray-300 cursor-pointer">
//                                 <option value="user" ${user.role === 'user' ? 'selected' : ''}>Пользователь</option>
//                                 <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Админ</option>
//                             </select>
//                             <button data-id="${user.id}" class="delete-user-btn text-red-500 hover:text-red-700 p-1 cursor-pointer">
//                                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
//                                 </svg>
//                             </button>
//                         ` : ''}
//                     </div>
//                 </div>
//             `).join('')}
//         </div>
//     `;

//     container.querySelectorAll('.user-role-select').forEach(select => {
//         select.addEventListener('change', (e) => {
//             const userId = e.target.getAttribute('data-id');
//             const newRole = e.target.value;
//             const result = updateUserRole(userId, newRole);
//             if (result.success) {
//                 showNotification(`Роль пользователя изменена на ${newRole === 'admin' ? 'Администратор' : 'Пользователь'}`, 'success');
//                 renderUsersList();
//             } else {
//                 showNotification(result.error, 'info');
//             }
//         });
//     });

//     container.querySelectorAll('.delete-user-btn').forEach(btn => {
//         btn.addEventListener('click', () => {
//             const userId = btn.getAttribute('data-id');
//             if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
//                 const result = deleteUser(userId);
//                 if (result.success) {
//                     showNotification('Пользователь удален', 'success');
//                     renderUsersList();
//                 } else {
//                     showNotification(result.error, 'info');
//                 }
//             }
//         });
//     });
// }

// function updateUIBasedOnAuth() {
//     const authenticated = isAuthenticated();
//     const admin = isAdmin();
//     const superAdmin = isSuperAdmin();

//     if (userInfo) {
//         userInfo.style.display = authenticated ? 'flex' : 'none';
//     }

//     if (profileNavBtn) {
//         profileNavBtn.style.display = authenticated ? 'flex' : 'none';
//     }

//     if (adminNavBtn) {
//         adminNavBtn.style.display = (authenticated && admin) ? 'flex' : 'none';
//     }

//     toggleUsersManagementVisibility();
    
//     if (authenticated) {
//         const user = getCurrentUser();
//         if (usernameSpan) usernameSpan.innerText = `${user.username} ${superAdmin ? '👑' : admin ? '⭐' : ''}`;

//         if (!admin && viewAdmin && !viewAdmin.classList.contains('hidden')) {
//             switchToMain();
//             if (profileNavBtn) profileNavBtn.classList.add('target-active');
//         }

//         if (viewMain && !viewMain.classList.contains('hidden')) {
//         } else if (viewProfile && !viewProfile.classList.contains('hidden')) {
//         } else if (admin && viewAdmin && !viewAdmin.classList.contains('hidden')) {
//             renderAdminTickets();
//             if (isSuperAdmin()) {
//                 renderUsersList();
//             }
//         } else {
//             switchToMain();
//             if (profileNavBtn) profileNavBtn.classList.add('target-active');
//         }
//     } else {
//         switchToLogin();
//     }
// }

// if (logoHome) {
//     logoHome.addEventListener('click', () => {
//         if (isAuthenticated()) {
//             switchToMain();
//             navButtons.forEach(b => b.classList.remove('target-active'));
//             if (profileNavBtn) profileNavBtn.classList.add('target-active');
//         } else {
//             switchToLogin();
//         }
//     });
// }

// navButtons.forEach(btn => {
//     btn.addEventListener('click', () => {
//         if (!isAuthenticated()) {
//             showNotification('Пожалуйста, войдите в систему', 'info');
//             switchToLogin();
//             return;
//         }
        
//         const btnId = btn.id;

//         if (btnId === 'nav-admin' && !isAdmin()) {
//             showNotification('У вас нет прав администратора', 'info');
//             return;
//         }
        
//         navButtons.forEach(b => b.classList.remove('target-active'));
//         sections.forEach(s => s.classList.add('hidden'));
//         btn.classList.add('target-active');

//         if (btnId === 'nav-profile') {
//             if (viewProfile) {
//                 viewProfile.classList.remove('hidden');
//                 renderUserTickets();
//                 updateNotificationBadge();
//             }
//         }
//         if (btnId === 'nav-admin') {
//             if (viewAdmin) {
//                 viewAdmin.classList.remove('hidden');
//                 renderAdminTickets();
//                 toggleUsersManagementVisibility();
//                 if (isSuperAdmin()) {
//                     renderUsersList();
//                 }
//             }
//         }
//     });
// });

// const registerForm = document.getElementById('register-form');
// if (registerForm) {
//     registerForm.addEventListener('submit', (e) => {
//         e.preventDefault();
        
//         const username = document.getElementById('reg-username').value;
//         const email = document.getElementById('reg-email').value;
//         const password = document.getElementById('reg-password').value;
//         const confirmPassword = document.getElementById('reg-confirm-password').value;
        
//         if (password !== confirmPassword) {
//             showNotification('Пароли не совпадают', 'info');
//             return;
//         }
        
//         if (password.length < 4) {
//             showNotification('Пароль должен быть не менее 4 символов', 'info');
//             return;
//         }
        
//         const result = register(username, email, password);
        
//         if (result.success) {
//             const roleText = result.user.role === 'super_admin' ? ' (Вы стали супер-администратором!)' : '';
//             showNotification(`Регистрация успешна!${roleText} Теперь войдите в систему`);
//             switchToLogin();
//             registerForm.reset();
//         } else {
//             showNotification(result.error, 'info');
//         }
//     });
// }

// const loginForm = document.getElementById('login-form');
// if (loginForm) {
//     loginForm.addEventListener('submit', (e) => {
//         e.preventDefault();
        
//         const usernameOrEmail = document.getElementById('login-username').value;
//         const password = document.getElementById('login-password').value;
        
//         const result = login(usernameOrEmail, password);
        
//         if (result.success) {
//             const roleText = result.user.role === 'super_admin' ? ' (Супер-администратор 👑)' : result.user.role === 'admin' ? ' (Администратор ⭐)' : '';
//             showNotification(`Добро пожаловать, ${result.user.username}!${roleText}`);
//             updateUIBasedOnAuth();
//             loginForm.reset();
//         } else {
//             showNotification(result.error, 'info');
//         }
//     });
// }

// if (logoutBtn) {
//     logoutBtn.addEventListener('click', () => {
//         logout();
//         updateUIBasedOnAuth();
//         showNotification('Вы вышли из системы');
//     });
// }

// const showLoginLink = document.getElementById('show-login');
// const showRegisterLink = document.getElementById('show-register');

// if (showLoginLink) {
//     showLoginLink.addEventListener('click', (e) => {
//         e.preventDefault();
//         switchToLogin();
//     });
// }

// if (showRegisterLink) {
//     showRegisterLink.addEventListener('click', (e) => {
//         e.preventDefault();
//         switchToRegister();
//     });
// }

// const fileInput = document.getElementById('ticket-file');
// const fileHint = document.getElementById('file-name-hint');

// if (fileInput) {
//     fileInput.addEventListener('change', (e) => {
//         if (e.target.files.length > 0) {
//             fileHint.innerText = `Выбран файл: ${e.target.files[0].name}`;
//             fileHint.classList.remove('hidden');
//         } else {
//             fileHint.classList.add('hidden');
//         }
//     });
// }

// const ticketForm = document.getElementById('ticket-form');
// const formHandler = ticketForm ? useForm(ticketForm) : null;

// if (ticketForm && formHandler) {
//     ticketForm.addEventListener('submit', (e) => {
//         e.preventDefault();
        
//         if (!isAuthenticated()) {
//             showNotification('Пожалуйста, войдите в систему', 'info');
//             switchToLogin();
//             return;
//         }

//         if (formHandler.validate()) {
//             const title = formHandler.values.title();
//             const desc = formHandler.values.desc();
//             const file = fileInput.files[0];

//             const saveAndGo = (base64Image = null) => {
//                 try {
//                     const ticket = addTicket(title, desc, base64Image);
//                     formHandler.clearForm();
//                     if (fileHint) fileHint.classList.add('hidden');
//                     fileInput.value = '';

//                     showNotification(`Заявка ${ticket.id} успешно создана!`);
//                     if (profileNavBtn) profileNavBtn.click();
//                 } catch (error) {
//                     showNotification(error.message, 'info');
//                 }
//             };

//             if (file) {
//                 const reader = new FileReader();
//                 reader.onloadend = function () {
//                     saveAndGo(reader.result);
//                 };
//                 reader.readAsDataURL(file);
//             } else {
//                 saveAndGo(null);
//             }
//         }
//     });
// }

// const adminSearch = document.getElementById('admin-search');
// if (adminSearch) {
//     adminSearch.addEventListener('input', (e) => {
//         setSearchQuery(e.target.value);
//         if (isAdmin() && viewAdmin && !viewAdmin.classList.contains('hidden')) {
//             renderAdminTickets();
//         }
//     });
// }

// const adminFilterStatus = document.getElementById('admin-filter-status');
// if (adminFilterStatus) {
//     adminFilterStatus.addEventListener('change', (e) => {
//         setFilterStatus(e.target.value);
//         if (isAdmin() && viewAdmin && !viewAdmin.classList.contains('hidden')) {
//             renderAdminTickets();
//         }
//     });
// }

// const sortBtn = document.getElementById('admin-sort-date');
// const sortIcon = document.getElementById('sort-icon');

// if (sortBtn) {
//     sortBtn.addEventListener('click', () => {
//         if (currentSortDirection === 'desc') {
//             setSortDirection('asc');
//             if (sortBtn.querySelector('span')) sortBtn.querySelector('span').innerText = 'Сортировка: Сначала старые';
//             if (sortIcon) sortIcon.innerText = '↑';
//         } else {
//             setSortDirection('desc');
//             if (sortBtn.querySelector('span')) sortBtn.querySelector('span').innerText = 'Сортировка: Сначала новые';
//             if (sortIcon) sortIcon.innerText = '↓';
//         }
//         if (isAdmin() && viewAdmin && !viewAdmin.classList.contains('hidden')) {
//             renderAdminTickets();
//         }
//     });
// }

// updateUIBasedOnAuth();


// main.js
import { addTicket, getTickets, getUserTickets, getTicketMessages, sendMessage, updateTicketStatus, deleteTicket, markAsRead } from './store.js';
import { useForm } from './useForm.js';
import { showNotification } from './notifications.js';
import { initModal } from './modal.js';
import { 
    renderUserTickets, 
    renderAdminTickets, 
    updateNotificationBadge,
    currentSortDirection,
    setFilterStatus,
    setSearchQuery,
    setSortDirection
} from './ui.js';
import { 
    register, login, logout, getCurrentUser, isAuthenticated, isAdmin, isSuperAdmin,
    getAllUsers, updateUserRole, deleteUser, getUserStats, setAuthToken
} from './auth.js';

initModal();

const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.spa-section');
const logoHome = document.getElementById('logo-home');

const viewMain = document.getElementById('view-main');
const viewProfile = document.getElementById('view-profile');
const viewAdmin = document.getElementById('view-admin');
const viewLogin = document.getElementById('view-login');
const viewRegister = document.getElementById('view-register');

// Кнопки навигации
const profileNavBtn = document.getElementById('nav-profile');
const adminNavBtn = document.getElementById('nav-admin');

// Элементы для навигации пользователя
const userInfo = document.getElementById('user-info');
const usernameSpan = document.getElementById('username-display');
const logoutBtn = document.getElementById('logout-btn');

// Блок управления пользователями
const usersManagementBlock = document.getElementById('users-management');

// Глобальные переменные для текущего пользователя
let currentUser = null;

function switchToMain() {
    sections.forEach(s => s.classList.add('hidden'));
    navButtons.forEach(b => b.classList.remove('target-active'));
    if (viewMain) viewMain.classList.remove('hidden');
}

function switchToLogin() {
    sections.forEach(s => s.classList.add('hidden'));
    if (viewLogin) viewLogin.classList.remove('hidden');
}

function switchToRegister() {
    sections.forEach(s => s.classList.add('hidden'));
    if (viewRegister) viewRegister.classList.remove('hidden');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Показать/скрыть блок управления пользователями
function toggleUsersManagementVisibility() {
    if (usersManagementBlock) {
        if (currentUser?.role === 'super_admin') {
            usersManagementBlock.style.display = 'block';
        } else {
            usersManagementBlock.style.display = 'none';
        }
    }
}

// Рендер списка пользователей для супер-админа
async function renderUsersList() {
    if (currentUser?.role !== 'super_admin') return;
    
    const container = document.getElementById('users-management-container');
    if (!container) return;
    
    const users = await getAllUsers();
    const stats = await getUserStats();
    
    container.innerHTML = `
        <div class="bg-gray-50 p-4 rounded-xl mb-4">
            <div class="grid grid-cols-4 gap-3 text-center">
                <div class="bg-white rounded-lg p-3 border border-gray-200">
                    <div class="text-2xl font-bold text-blue-600">${stats.total}</div>
                    <div class="text-xs text-gray-500">Всего</div>
                </div>
                <div class="bg-white rounded-lg p-3 border border-gray-200">
                    <div class="text-2xl font-bold text-purple-600">${stats.super_admins}</div>
                    <div class="text-xs text-gray-500">👑 Супер-админы</div>
                </div>
                <div class="bg-white rounded-lg p-3 border border-gray-200">
                    <div class="text-2xl font-bold text-orange-600">${stats.admins}</div>
                    <div class="text-xs text-gray-500">⭐ Админы</div>
                </div>
                <div class="bg-white rounded-lg p-3 border border-gray-200">
                    <div class="text-2xl font-bold text-green-600">${stats.users}</div>
                    <div class="text-xs text-gray-500">👤 Пользователи</div>
                </div>
            </div>
        </div>
        <div class="space-y-2 max-h-96 overflow-y-auto">
            ${users.map(user => `
                <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center ${user.role === 'super_admin' ? 'bg-purple-100' : user.role === 'admin' ? 'bg-orange-100' : 'bg-blue-100'}">
                            <span class="text-lg">${user.role === 'super_admin' ? '👑' : user.role === 'admin' ? '⭐' : '👤'}</span>
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${escapeHtml(user.username)}</div>
                            <div class="text-xs text-gray-500">${escapeHtml(user.email)}</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs px-2 py-1 rounded-full ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : user.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}">
                            ${user.role === 'super_admin' ? 'Супер-админ' : user.role === 'admin' ? 'Админ' : 'Пользователь'}
                        </span>
                        ${user.id !== currentUser?.id && user.role !== 'super_admin' ? `
                            <select data-id="${user.id}" class="user-role-select text-xs px-2 py-1 rounded-lg border border-gray-300 cursor-pointer">
                                <option value="user" ${user.role === 'user' ? 'selected' : ''}>Пользователь</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Админ</option>
                            </select>
                            <button data-id="${user.id}" class="delete-user-btn text-red-500 hover:text-red-700 p-1 cursor-pointer">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Добавляем обработчики для селектов ролей
    container.querySelectorAll('.user-role-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const userId = e.target.getAttribute('data-id');
            const newRole = e.target.value;
            const result = await updateUserRole(userId, newRole);
            if (result.success) {
                showNotification(`Роль пользователя изменена на ${newRole === 'admin' ? 'Администратор' : 'Пользователь'}`, 'success');
                await renderUsersList();
            } else {
                showNotification(result.error, 'info');
            }
        });
    });
    
    // Добавляем обработчики для удаления пользователей
    container.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const userId = btn.getAttribute('data-id');
            if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
                const result = await deleteUser(userId);
                if (result.success) {
                    showNotification('Пользователь удален', 'success');
                    await renderUsersList();
                } else {
                    showNotification(result.error, 'info');
                }
            }
        });
    });
}

async function updateUIBasedOnAuth() {
    const authenticated = isAuthenticated();
    
    if (authenticated) {
        currentUser = await getCurrentUser();
    } else {
        currentUser = null;
    }
    
    const admin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin');
    const superAdmin = currentUser?.role === 'super_admin';
    
    // Показываем/скрываем блок с информацией о пользователе
    if (userInfo) {
        userInfo.style.display = authenticated ? 'flex' : 'none';
    }
    
    // Управляем видимостью кнопок навигации
    if (profileNavBtn) {
        profileNavBtn.style.display = authenticated ? 'flex' : 'none';
    }
    
    // Кнопка админки видна ТОЛЬКО если пользователь админ или супер-админ
    if (adminNavBtn) {
        adminNavBtn.style.display = (authenticated && admin) ? 'flex' : 'none';
    }
    
    // Скрываем блок управления пользователями для обычных админов
    toggleUsersManagementVisibility();
    
    if (authenticated && currentUser) {
        if (usernameSpan) usernameSpan.innerText = `${currentUser.username} ${superAdmin ? '👑' : admin ? '⭐' : ''}`;
        
        // Если пользователь не админ и пытается открыть админку - перекидываем на главную
        if (!admin && viewAdmin && !viewAdmin.classList.contains('hidden')) {
            switchToMain();
            if (profileNavBtn) profileNavBtn.classList.add('target-active');
        }
        
        // Показываем соответствующий раздел
        if (viewMain && !viewMain.classList.contains('hidden')) {
            // уже на главной
        } else if (viewProfile && !viewProfile.classList.contains('hidden')) {
            // уже в профиле
            await renderUserTickets();
            await updateNotificationBadge();
        } else if (admin && viewAdmin && !viewAdmin.classList.contains('hidden')) {
            // уже в админке
            await renderAdminTickets();
            if (superAdmin) {
                await renderUsersList();
            }
        } else {
            switchToMain();
            if (profileNavBtn) profileNavBtn.classList.add('target-active');
        }
    } else {
        switchToLogin();
    }
}

// Обработчик логотипа
if (logoHome) {
    logoHome.addEventListener('click', () => {
        if (isAuthenticated()) {
            switchToMain();
            navButtons.forEach(b => b.classList.remove('target-active'));
            if (profileNavBtn) profileNavBtn.classList.add('target-active');
        } else {
            switchToLogin();
        }
    });
}

// Навигация
navButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
        if (!isAuthenticated()) {
            showNotification('Пожалуйста, войдите в систему', 'info');
            switchToLogin();
            return;
        }
        
        const btnId = btn.id;
        
        // Проверка прав для админки
        if (btnId === 'nav-admin') {
            const admin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin');
            if (!admin) {
                showNotification('У вас нет прав администратора', 'info');
                return;
            }
        }
        
        navButtons.forEach(b => b.classList.remove('target-active'));
        sections.forEach(s => s.classList.add('hidden'));
        btn.classList.add('target-active');

        if (btnId === 'nav-profile') {
            if (viewProfile) {
                viewProfile.classList.remove('hidden');
                await renderUserTickets();
                await updateNotificationBadge();
            }
        }
        if (btnId === 'nav-admin') {
            if (viewAdmin) {
                viewAdmin.classList.remove('hidden');
                await renderAdminTickets();
                toggleUsersManagementVisibility();
                if (currentUser?.role === 'super_admin') {
                    await renderUsersList();
                }
            }
        }
    });
});

// Регистрация
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        
        if (password !== confirmPassword) {
            showNotification('Пароли не совпадают', 'info');
            return;
        }
        
        if (password.length < 4) {
            showNotification('Пароль должен быть не менее 4 символов', 'info');
            return;
        }
        
        const result = await register(username, email, password);
        
        if (result.success) {
            const roleText = result.user.role === 'super_admin' ? ' (Вы стали супер-администратором!)' : '';
            showNotification(`Регистрация успешна!${roleText} Теперь войдите в систему`);
            switchToLogin();
            registerForm.reset();
        } else {
            showNotification(result.error, 'info');
        }
    });
}

// Логин
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const usernameOrEmail = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const result = await login(usernameOrEmail, password);
        
        if (result.success) {
            const roleText = result.user.role === 'super_admin' ? ' (Супер-администратор 👑)' : result.user.role === 'admin' ? ' (Администратор ⭐)' : '';
            showNotification(`Добро пожаловать, ${result.user.username}!${roleText}`);
            await updateUIBasedOnAuth();
            loginForm.reset();
        } else {
            showNotification(result.error, 'info');
        }
    });
}

// Выход
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        logout();
        updateUIBasedOnAuth();
        showNotification('Вы вышли из системы');
    });
}

// Ссылки на страницы входа/регистрации
const showLoginLink = document.getElementById('show-login');
const showRegisterLink = document.getElementById('show-register');

if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchToLogin();
    });
}

if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchToRegister();
    });
}

// Форма создания заявки
const fileInput = document.getElementById('ticket-file');
const fileHint = document.getElementById('file-name-hint');

if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileHint.innerText = `Выбран файл: ${e.target.files[0].name}`;
            fileHint.classList.remove('hidden');
        } else {
            fileHint.classList.add('hidden');
        }
    });
}

const ticketForm = document.getElementById('ticket-form');
const formHandler = ticketForm ? useForm(ticketForm) : null;

if (ticketForm && formHandler) {
    ticketForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated()) {
            showNotification('Пожалуйста, войдите в систему', 'info');
            switchToLogin();
            return;
        }

        if (formHandler.validate()) {
            const title = formHandler.values.title();
            const desc = formHandler.values.desc();
            const file = fileInput.files[0];

            const saveAndGo = async (base64Image = null) => {
                try {
                    const ticket = await addTicket(title, desc, base64Image);
                    formHandler.clearForm();
                    if (fileHint) fileHint.classList.add('hidden');
                    fileInput.value = '';

                    showNotification(`Заявка ${ticket.ticket_id || ticket.id} успешно создана!`);
                    if (profileNavBtn) profileNavBtn.click();
                } catch (error) {
                    showNotification(error.message, 'info');
                }
            };

            if (file) {
                const reader = new FileReader();
                reader.onloadend = function () {
                    saveAndGo(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                await saveAndGo(null);
            }
        }
    });
}

// Админские фильтры
const adminSearch = document.getElementById('admin-search');
if (adminSearch) {
    adminSearch.addEventListener('input', (e) => {
        setSearchQuery(e.target.value);
        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin') && viewAdmin && !viewAdmin.classList.contains('hidden')) {
            renderAdminTickets();
        }
    });
}

const adminFilterStatus = document.getElementById('admin-filter-status');
if (adminFilterStatus) {
    adminFilterStatus.addEventListener('change', (e) => {
        setFilterStatus(e.target.value);
        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin') && viewAdmin && !viewAdmin.classList.contains('hidden')) {
            renderAdminTickets();
        }
    });
}

const sortBtn = document.getElementById('admin-sort-date');
const sortIcon = document.getElementById('sort-icon');

if (sortBtn) {
    sortBtn.addEventListener('click', () => {
        if (currentSortDirection === 'desc') {
            setSortDirection('asc');
            if (sortBtn.querySelector('span')) sortBtn.querySelector('span').innerText = 'Сортировка: Сначала старые';
            if (sortIcon) sortIcon.innerText = '↑';
        } else {
            setSortDirection('desc');
            if (sortBtn.querySelector('span')) sortBtn.querySelector('span').innerText = 'Сортировка: Сначала новые';
            if (sortIcon) sortIcon.innerText = '↓';
        }
        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin') && viewAdmin && !viewAdmin.classList.contains('hidden')) {
            renderAdminTickets();
        }
    });
}

// Инициализация
updateUIBasedOnAuth();