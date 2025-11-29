// Mode Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    
    modeButtons.forEach(button => {
        button.addEventListener('click', function() {
            modeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const mode = this.dataset.mode;
            if (mode === 'urgent') {
                showUrgentModeAnimation();
            }
        });
    });
});

// Urgent Mode Animation
function showUrgentModeAnimation() {
    const urgentCard = document.querySelector('.urgent-card');
    if (urgentCard) {
        urgentCard.style.animation = 'none';
        setTimeout(() => {
            urgentCard.style.animation = 'pulse 3s ease-in-out infinite';
        }, 10);
    }
}

// Search Chips Interaction
const chips = document.querySelectorAll('.chip');
const searchInput = document.querySelector('.search-input');

chips.forEach(chip => {
    chip.addEventListener('click', function() {
        const text = this.textContent.replace(/"/g, '');
        if (searchInput) {
            searchInput.value = text;
            searchInput.focus();
        }
    });
});

// Category Card Click Animation
const categoryCards = document.querySelectorAll('.category-card');

categoryCards.forEach(card => {
    card.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 200);
    });
});

// Smooth Scroll for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections for scroll animations
const sections = document.querySelectorAll('section');
sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Button Click Effects
const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple effect styles dynamically
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Upload Button Functionality
const uploadBtn = document.querySelector('.upload-btn');
if (uploadBtn) {
    uploadBtn.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                console.log('File selected:', file.name);
                // Add your file upload logic here
            }
        };
        input.click();
    });
}

// Leaderboard Item Hover Effect
const leaderboardItems = document.querySelectorAll('.leaderboard-item');

leaderboardItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(12px) scale(1.02)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

// Feature Card Tilt Effect
const featureCards = document.querySelectorAll('.feature-card');

featureCards.forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

// Counter Animation for Stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Observe dasher stats for counter animation
const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const coins = entry.target.querySelector('.dasher-coins');
            if (coins && !coins.dataset.animated) {
                const value = parseInt(coins.textContent.replace(/[^\d]/g, ''));
                coins.dataset.animated = 'true';
                coins.textContent = '0 🪙';
                animateCounter(coins, value);
                setTimeout(() => {
                    coins.textContent = value + ' 🪙';
                }, 2000);
            }
        }
    });
}, { threshold: 0.5 });

leaderboardItems.forEach(item => {
    statsObserver.observe(item);
});

// Search Input Focus Effect
if (searchInput) {
    searchInput.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    
    searchInput.addEventListener('blur', function() {
        this.parentElement.style.transform = '';
    });
}

// Team Card Flip Effect
const teamCards = document.querySelectorAll('.team-card');

teamCards.forEach(card => {
    card.addEventListener('click', function() {
        this.style.transform = 'rotateY(360deg)';
        setTimeout(() => {
            this.style.transform = '';
        }, 600);
    });
});

// Parallax Effect for Hero Background Shapes
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.shape');
    
    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.5;
        shape.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Badge Card Click Effect
const badgeCards = document.querySelectorAll('.badge-card');

badgeCards.forEach(card => {
    card.addEventListener('click', function() {
        const icon = this.querySelector('.badge-icon');
        icon.style.transform = 'scale(1.5) rotate(360deg)';
        setTimeout(() => {
            icon.style.transform = '';
        }, 500);
    });
});

// Tech Card Pulse on Hover
const techCards = document.querySelectorAll('.tech-card');

techCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        const icon = this.querySelector('.tech-icon');
        icon.style.animation = 'pulse 1s ease-in-out';
    });
    
    card.addEventListener('mouseleave', function() {
        const icon = this.querySelector('.tech-icon');
        icon.style.animation = '';
    });
});

// Console Welcome Message
console.log('%c🚀 DashDrop', 'font-size: 24px; font-weight: bold; color: #FFD300; background: #000; padding: 10px;');
console.log('%cInstant Delivery & Campus Micro-Commerce', 'font-size: 14px; color: #7E3FF2;');
console.log('%cMade for InnovEdam Hackathon 2025', 'font-size: 12px; color: #666;');
