// ==========================================
// CAMPUSDASH SHARED JAVASCRIPT
// ==========================================

// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', function () {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// ==========================================
// MOBILE MENU TOGGLE
// ==========================================

function initMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const openMenuBtn = document.getElementById('open-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileLinks = document.querySelectorAll('.mobile-menu-link');

    if (!mobileMenu || !openMenuBtn || !closeMenuBtn) return;

    function toggleMenu() {
        mobileMenu.classList.toggle('hidden');
        document.body.style.overflow = mobileMenu.classList.contains('hidden') ? '' : 'hidden';
    }

    openMenuBtn.addEventListener('click', toggleMenu);
    closeMenuBtn.addEventListener('click', toggleMenu);

    // Close menu when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
            toggleMenu();
        }
    });
}

// ==========================================
// SMOOTH SCROLL
// ==========================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ==========================================
// SCROLL ANIMATIONS
// ==========================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeInUp');
                entry.target.style.opacity = '1';
            }
        });
    }, observerOptions);

    // Observe elements with data-animate attribute
    document.querySelectorAll('[data-animate]').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// ==========================================
// FORM VALIDATION
// ==========================================

function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('border-red-500');

            // Remove error class on input
            input.addEventListener('input', function () {
                this.classList.remove('border-red-500');
            }, { once: true });
        }
    });

    return isValid;
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-50 animate-slideInRight ${type === 'success' ? 'bg-green-600' :
            type === 'error' ? 'bg-red-600' :
                'bg-gray-800'
        } text-white font-bold`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// BUTTON RIPPLE EFFECT
// ==========================================

function initButtonRipples() {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple-effect');

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Add ripple styles
const rippleStyles = document.createElement('style');
rippleStyles.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple-effect {
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
document.head.appendChild(rippleStyles);

// ==========================================
// IMAGE UPLOAD PREVIEW
// ==========================================

function initImageUpload(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    if (!input || !preview) return;

    input.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview" class="w-full h-48 object-cover rounded-lg">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// ==========================================
// COUNTDOWN TIMER
// ==========================================

function startCountdown(elementId, minutes) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let seconds = minutes * 60;

    const interval = setInterval(() => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        element.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

        if (seconds <= 0) {
            clearInterval(interval);
            element.textContent = 'Delivered!';
        }

        seconds--;
    }, 1000);
}

// ==========================================
// PROGRESS STEPPER
// ==========================================

function updateProgressStepper(currentStep) {
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach((step, index) => {
        if (index < currentStep) {
            step.classList.add('completed');
        } else if (index === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('completed', 'active');
        }
    });
}

// ==========================================
// CART MANAGEMENT
// ==========================================

let cartCount = 0;

function updateCartCount(count) {
    cartCount = count;
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        badge.textContent = cartCount;
        badge.style.display = cartCount > 0 ? 'flex' : 'none';
    }
}

function addToCart() {
    updateCartCount(cartCount + 1);
    showToast('Added to cart!', 'success');
}

// ==========================================
// INITIALIZE ALL
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initButtonRipples();

    // Initialize cart count
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        const initialCount = parseInt(cartBadge.textContent) || 0;
        updateCartCount(initialCount);
    }
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Format currency
function formatCurrency(amount) {
    return `₹${amount.toFixed(2)}`;
}

// Format time ago
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }

    return 'just now';
}

// Generate random ID
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for use in other scripts
window.DashDrop = {
    validateForm,
    showToast,
    initImageUpload,
    startCountdown,
    updateProgressStepper,
    updateCartCount,
    addToCart,
    formatCurrency,
    timeAgo,
    generateId,
    debounce
};
