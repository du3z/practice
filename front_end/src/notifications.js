export function showNotification(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-600' : 'bg-blue-600';

    toast.className = `${bgClass} text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between gap-4 pointer-events-auto transition-all duration-300 opacity-0 translate-y-2`;
    toast.innerHTML = `
        <span class="text-sm font-medium">${message}</span>
        <button class="text-white/70 hover:text-white text-xs font-bold focus:outline-none cursor-pointer">✕</button>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.classList.remove('opacity-0', 'translate-y-2'), 10);
    toast.querySelector('button').addEventListener('click', () => toast.remove());
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}