

Tentu, ini adalah file `script.js` yang lengkap untuk menghidupkan semua fitur interaktif pada website yang telah kita buat. Kode ini dirancang agar komprehensif, terstruktur dengan baik, dan mudah dipahami.

## script.js

```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi semua fungsi
    initLoadingScreen();
    initBackgroundAnimations();
    initMusicPlayer();
    initNavigation();
    initCountdown();
    initTypingAnimation();
    initEventsTabs();
    initGallery();
    initTestimonials();
    initForms();
    initFAQ();
    initBackToTop();
    initScrollEffects();
    initNumberCounters();
});

// --- LOADING SCREEN ---
function initLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    const loadingProgress = document.querySelector('.loading-progress');
    const loadingCounter = document.querySelector('.loading-counter');
    let progress = 0;
    
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }
        
        loadingProgress.style.width = progress + '%';
        loadingCounter.textContent = Math.floor(progress) + '%';
    }, 200);
}

// --- BACKGROUND ANIMATIONS ---
function initBackgroundAnimations() {
    createConfetti();
    createHearts();
    createStars();
    createBalloons();
}

function createConfetti() {
    const container = document.querySelector('.confetti-container');
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = -10 + 'px';
            confetti.style.opacity = Math.random();
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            const size = Math.random() * 10 + 5;
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';
            
            container.appendChild(confetti);
            animateConfetti(confetti);
        }, i * 30);
    }
}

function animateConfetti(confetti) {
    const duration = Math.random() * 3000 + 2000;
    const horizontalMovement = (Math.random() - 0.5) * 200;
    
    confetti.animate([
        { transform: `translateY(0) translateX(0) rotate(0deg)`, opacity: 1 },
        { transform: `translateY(${window.innerHeight + 20}px) translateX(${horizontalMovement}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
    ], {
        duration: duration,
        easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)',
        fill: 'forwards'
    }).onfinish = () => {
        confetti.remove();
        createConfetti(); // Buat baru untuk efek tak terbatas
    };
}

function createHearts() {
    const container = document.querySelector('.hearts');
    
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'heart';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.top = window.innerHeight + 20 + 'px';
            heart.style.opacity = Math.random() * 0.5 + 0.1;
            
            const size = Math.random() * 15 + 10;
            heart.style.width = size + 'px';
            heart.style.height = size + 'px';
            
            container.appendChild(heart);
            animateHeart(heart);
        }, i * 200);
    }
}

function animateHeart(heart) {
    const duration = Math.random() * 5000 + 5000;
    const horizontalMovement = (Math.random() - 0.5) * 100;
    
    heart.animate([
        { transform: `translateY(0) translateX(0) scale(1)`, opacity: heart.style.opacity },
        { transform: `translateY(-${window.innerHeight + 100}px) translateX(${horizontalMovement}px) scale(${Math.random() * 0.5 + 0.8})`, opacity: 0 }
    ], {
        duration: duration,
        easing: 'ease-in-out',
        fill: 'forwards'
    }).onfinish = () => {
        heart.remove();
        createHearts(); // Buat baru untuk efek tak terbatas
    };
}

function createStars() {
    const container = document.querySelector('.stars');
    
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        container.appendChild(star);
    }
}

function createBalloons() {
    const container = document.querySelector('.floating-balloons');
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];
    
    for (let i = 0; i < 10; i++) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.left = Math.random() * 100 + '%';
        balloon.style.top = window.innerHeight + 100 + 'px';
        balloon.style.opacity = Math.random() * 0.3 + 0.2;
        
        container.appendChild(balloon);
        animateBalloon(balloon);
    }
}

function animateBalloon(balloon) {
    const duration = Math.random() * 10000 + 15000;
    const horizontalMovement = (Math.random() - 0.5) * 200;
    
    balloon.animate([
        { transform: `translateY(0) translateX(0) rotate(0deg)`, opacity: balloon.style.opacity },
        { transform: `translateY(-${window.innerHeight + 200}px) translateX(${horizontalMovement}px) rotate(${Math.random() * 30 - 15}deg)`, opacity: 0 }
    ], {
        duration: duration,
        easing: 'ease-in-out',
        fill: 'forwards'
    }).onfinish = () => {
        balloon.remove();
        createBalloons(); // Buat baru untuk efek tak terbatas
    };
}

// --- MUSIC PLAYER ---
function initMusicPlayer() {
    const musicToggle = document.getElementById('music-toggle');
    const musicInfo = document.querySelector('.music-info span');
    let isPlaying = false;
    
    musicToggle.addEventListener('click', () => {
        isPlaying = !isPlaying;
        const icon = musicToggle.querySelector('i');
        
        if (isPlaying) {
            icon.classList.remove('fa-music');
            icon.classList.add('fa-pause');
            musicInfo.textContent = 'Now Playing: Dies Natalis Anthem';
            musicToggle.style.animation = 'pulse 1s infinite';
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-music');
            musicInfo.textContent = 'Music Paused';
            musicToggle.style.animation = 'none';
        }
    });
}

// --- NAVIGATION ---
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    // Hamburger menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Smooth scrolling for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
    
    // Scroll spy for nav links
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
    
    // Navbar style on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// --- COUNTDOWN TIMER ---
function initCountdown() {
    const countDownDate = new Date("Jul 25, 2025 00:00:00").getTime();
    
    const countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = countDownDate - now;
        
        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById("days").innerText = "00";
            document.getElementById("hours").innerText = "00";
            document.getElementById("minutes").innerText = "00";
            document.getElementById("seconds").innerText = "00";
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById("days").innerText = days < 10 ? "0" + days : days;
        document.getElementById("hours").innerText = hours < 10 ? "0" + hours : hours;
        document.getElementById("minutes").innerText = minutes < 10 ? "0" + minutes : minutes;
        document.getElementById("seconds").innerText = seconds < 10 ? "0" + seconds : seconds;
        
        // Animate circular progress
        drawCircularProgress('days-canvas', days / 365 * 100);
        drawCircularProgress('hours-canvas', hours / 24 * 100);
        drawCircularProgress('minutes-canvas', minutes / 60 * 100);
        drawCircularProgress('seconds-canvas', seconds / 60 * 100);
    }, 1000);
}

function drawCircularProgress(canvasId, percentage) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 50;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 8;
    ctx.stroke();
    
    // Progress circle
    const angle = (percentage / 100) * 2 * Math.PI - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, angle);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();
}

// --- TYPING ANIMATION ---
function initTypingAnimation() {
    const typedTextElement = document.querySelector('.typed-text');
    const texts = [
        "Setengah Abad Mencetak Generasi Unggul",
        "50 Tahun Dedikasi dalam Pendidikan",
        "Merayakan Warisan Emas",
        "Membangun Masa Depan Gemilang"
    ];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typedTextElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedTextElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }
        
        let typeSpeed = isDeleting ? 50 : 100;
        
        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 500;
        }
        
        setTimeout(type, typeSpeed);
    }
    
    type();
}

// --- EVENTS TABS ---
function initEventsTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const eventsDays = document.querySelectorAll('.events-day');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and days
            tabButtons.forEach(btn => btn.classList.remove('active'));
            eventsDays.forEach(day => day.classList.remove('active'));
            
            // Add active class to clicked button and corresponding day
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// --- GALLERY ---
function initGallery() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter gallery items
            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Simple lightbox (can be expanded)
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <img src="${img.src}" alt="${img.alt}">
                    <button class="lightbox-close">&times;</button>
                </div>
            `;
            document.body.appendChild(lightbox);
            
            lightbox.addEventListener('click', () => {
                lightbox.remove();
            });
        });
    });
}

// --- TESTIMONIALS SLIDER ---
function initTestimonials() {
    const testimonialItems = document.querySelectorAll('.testimonial-item');
    const prevButton = document.querySelector('.testimonial-prev');
    const nextButton = document.querySelector('.testimonial-next');
    let currentIndex = 0;
    
    function showTestimonial(index) {
        testimonialItems.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
    }
    
    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + testimonialItems.length) % testimonialItems.length;
        showTestimonial(currentIndex);
    });
    
    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % testimonialItems.length;
        showTestimonial(currentIndex);
    });
    
    // Auto-rotate testimonials
    setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonialItems.length;
        showTestimonial(currentIndex);
    }, 5000);
}

// --- FORMS ---
function initForms() {
    // Registration form
    const registrationForm = document.getElementById('dies-registration');
    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Terima kasih telah mendaftar! Kami akan segera menghubungi Anda untuk konfirmasi.');
            registrationForm.reset();
        });
    }
    
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Pesan Anda telah terkirim! Kami akan membalas sesegera mungkin.');
            contactForm.reset();
        });
    }
    
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Terima kasih telah berlangganan newsletter kami!');
            newsletterForm.reset();
        });
    }
}

// --- FAQ ACCORDION ---
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => {
                faq.classList.remove('active');
                faq.querySelector('.faq-answer').style.maxHeight = null;
            });
            
            // Open clicked item if it was closed
            if (!isActive) {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}

// --- BACK TO TOP BUTTON ---
function initBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.style.display = 'flex';
        } else {
            backToTopButton.style.display = 'none';
        }
    });
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// --- SCROLL EFFECTS ---
function initScrollEffects() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all sections for fade-in animation
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// --- NUMBER COUNTERS ---
function initNumberCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;
    
    const countUp = (counter) => {
        const target = +counter.innerText.replace(/\D/g, '');
        const count = +counter.innerText.replace(/\D/g, '');
        const increment = target / speed;
        
        if (count < target) {
            counter.innerText = Math.ceil(count + increment).toLocaleString() + (counter.innerText.includes('+') ? '+' : '');
            setTimeout(() => countUp(counter), 10);
        } else {
            counter.innerText = target.toLocaleString() + (counter.innerText.includes('+') ? '+' : '');
        }
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countUp(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}
```
