export function initModal() {
    const imageModal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModalBtn = document.getElementById('close-modal');
    const modalContent = document.getElementById('modal-content');

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('ticket-screenshot-preview')) {
            const base64Data = e.target.getAttribute('src');
            if (base64Data) {
                modalImg.src = base64Data;
                imageModal.classList.remove('opacity-0', 'pointer-events-none');
                modalContent.classList.remove('scale-95');
                modalContent.classList.add('scale-100');
            }
        }
    });

    function closeModal() {
        imageModal.classList.add('opacity-0', 'pointer-events-none');
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
        setTimeout(() => { modalImg.src = ''; }, 300);
    }

    closeModalBtn.addEventListener('click', closeModal);
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !imageModal.classList.contains('opacity-0')) {
            closeModal();
        }
    });
}