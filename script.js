function showSection(id) {
    document.querySelectorAll('.content').forEach(el => el.classList.add('hidden'));
    document.querySelector(`#${id}`).classList.remove('hidden');
    document.querySelector('#content-section').classList.remove('hidden');
    document.querySelector('#content-section').scrollIntoView({ behavior: 'smooth' });
}

// Animasi masuk
window.addEventListener('load', () => {
    document.body.style.opacity = 0;
    document.body.style.transition = 'opacity 2s';
    setTimeout(() => { document.body.style.opacity = 1; }, 300);
});
