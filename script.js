// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen after page loads
    setTimeout(function() {
        document.querySelector('.loading-screen').classList.add('hidden');
    }, 2000);
    
    // Create confetti
    createConfetti();
    
    // Create floating hearts
    createHearts();
    
    // Initialize countdown timer
    initCountdown();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize smooth scrolling
    initSmoothScroll();
    
    // Initialize form submission
    initContactForm();
});

// Create confetti animation
function createConfetti() {
    const confettiContainer = document.querySelector('.confetti-container');
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = -10 + 'px';
        confetti.style.opacity = Math.random();
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        const size = Math.random() * 10 + 5;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        
        confettiContainer.appendChild(confetti);
        
        animateConfetti(confetti);
    }
}

function animateConfetti(confetti) {
    const duration = Math.random() * 3000 + 2000;
    const delay = Math.random() * 1000;
    
    setTimeout(() => {
        confetti.animate([
            { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
            { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)',
            fill: 'forwards'
        });
        
        setTimeout(() => {
            confetti.style.top = -10 + 'px';
            confetti.style.opacity = Math.random();
            animateConfetti(confetti);
        }, duration + 1000);
    }, delay);
}

// Create floating hearts animation
function createHearts() {
    const heartsContainer = document.querySelector('.hearts');
    
    for (let i = 0; i < 10; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.style.left = Math.random() * 100 + '%';
        heart.style.top = Math.random() * 100 + '%';
        heart.style.opacity = Math.random() * 0.5 + 0.1;
        
        const size = Math.random() * 20 + 10;
        heart.style.width = size + 'px';
        heart.style.height = size + 'px';
        
        heartsContainer.appendChild(heart);
        
        animateHeart(heart);
    }
}

function animateHeart(heart) {
    const duration = Math.random() * 5000 + 5000;
    const delay = Math.random() * 2000;
    
    setTimeout(() => {
        heart.animate([
            { transform: `translateY(0) scale(1)`, opacity: heart.style.opacity },
            { transform: `translateY(-${Math.random() * 100 + 50}px) scale(${Math.random() * 0.5 + 0.8})`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'ease-in-out',
            fill: 'forwards'
        });
        
        setTimeout(() => {
            heart.style.top = Math.random() * 100 + '%';
            heart.style.opacity = Math.random() * 0.5 + 0.1;
            animateHeart(heart);
        }, duration + 1000);
    }, delay);
}

// Initialize countdown timer
function initCountdown() {
    // Set the date we're counting down to (July 25, 2025)
    const countDownDate = new Date("Jul 25, 2025 00:00:00").getTime();
    
    // Update the countdown every 1 second
    const countdownInterval = setInterval(function() {
        // Get today's date and time
        const now = new Date().getTime();
        
        // Find the distance between now and the countdown date
        const distance = countDownDate - now;
        
        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Display the result in the elements
        document.getElementById("days").innerText = days < 10 ? "0" + days : days;
        document.getElementById("hours").innerText = hours < 10 ? "0" + hours : hours;
        document.getElementById("minutes").innerText = minutes < 10 ? "0" + minutes : minutes;
        document.getElementById("seconds").innerText = seconds < 10 ? "0" + seconds : seconds;
        
        // If the countdown is finished, display a message
        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById("days").innerText = "00";
            document.getElementById("hours").innerText = "00";
            document.getElementById("minutes").innerText = "00";
            document.getElementById("seconds").innerText = "00";
        }
    }, 1000);
}

// Initialize mobile menu
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Initialize smooth scrolling
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Show specific content section
function showSection(sectionId) {
    // Hide all content sections
    document.querySelectorAll('.content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show the selected content section
    const selectedContent = document.getElementById(sectionId);
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
        document.getElementById('content-section').classList.remove('hidden');
        
        // Scroll to the content section
        window.scrollTo({
            top: document.getElementById('content-section').offsetTop - 80,
            behavior: 'smooth'
        });
    }
}

// Close content section
function closeContent() {
    document.getElementById('content-section').classList.add('hidden');
}

// Initialize contact form
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;
            
            // Here you would normally send the form data to a server
            // For this example, we'll just show a success message
            alert(`Terima kasih, ${name}! Pesan Anda telah terkirim. Kami akan segera menghubungi Anda di ${email}.`);
            
            // Reset the form
            this.reset();
        });
    }
}

// Add scroll effect to navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        navbar.style.boxShadow = 'none';
    }
});

// Add animation to elements when they come into view
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade');
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});
