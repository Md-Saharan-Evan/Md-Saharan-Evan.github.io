// ============================================================
// Animated neural-network background
// ============================================================
(function initNeuralBackground() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let particles = [];
    let themeColors = { bg: '#f6f7fb', nodes: [[124, 58, 237], [6, 182, 212], [236, 72, 153]] };

    function hexToRgb(hex) {
        const clean = hex.replace('#', '').trim();
        const bigint = parseInt(clean, 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }

    function readThemeColors() {
        const styles = getComputedStyle(document.documentElement);
        const bg = styles.getPropertyValue('--bg-color').trim();
        const primary = styles.getPropertyValue('--primary-color').trim();
        const secondary = styles.getPropertyValue('--secondary-color').trim();
        const accent = styles.getPropertyValue('--accent-color').trim();

        themeColors = {
            bg,
            nodes: [hexToRgb(primary), hexToRgb(secondary), hexToRgb(accent)]
        };
    }

    class Node {
        constructor(width, height) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            this.radius = Math.random() * 1.4 + 1.2;
            this.colorIndex = Math.floor(Math.random() * 3);
        }

        step(width, height) {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x <= 0 || this.x >= width) this.vx *= -1;
            if (this.y <= 0 || this.y >= height) this.vy *= -1;
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const area = canvas.width * canvas.height;
        const count = Math.min(110, Math.max(35, Math.floor(area / 15000)));
        particles = Array.from({ length: count }, () => new Node(canvas.width, canvas.height));
    }

    function drawFrame() {
        ctx.fillStyle = themeColors.bg || '#0b0e18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const linkDistance = 130;

        particles.forEach(p => p.step(canvas.width, canvas.height));

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i];
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < linkDistance) {
                    const opacity = (1 - dist / linkDistance) * 0.3;
                    const [r, g, bl] = themeColors.nodes[a.colorIndex];
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${bl}, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        particles.forEach(p => {
            const [r, g, bl] = themeColors.nodes[p.colorIndex];
            ctx.fillStyle = `rgba(${r}, ${g}, ${bl}, 0.75)`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        if (!prefersReducedMotion) {
            requestAnimationFrame(drawFrame);
        }
    }

    readThemeColors();
    resizeCanvas();
    drawFrame();

    window.addEventListener('resize', () => {
        resizeCanvas();
        if (prefersReducedMotion) drawFrame();
    });

    window.neuralBackground = { refreshTheme: readThemeColors };
})();

// ============================================================
// Mobile sidebar (off-canvas menu)
// ============================================================
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarClose = document.getElementById('sidebar-close');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
}

function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
}

if (sidebarToggle) sidebarToggle.addEventListener('click', openSidebar);
if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

// Close the mobile sidebar whenever a nav link inside it is clicked
document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    link.addEventListener('click', closeSidebar);
});

// ============================================================
// Smooth scrolling for in-page links
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ============================================================
// Active section highlighting in the side nav
// ============================================================
const sections = document.querySelectorAll('section[id]');
const sideNavLinks = document.querySelectorAll('.side-nav-link');

function highlightActiveSection() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 150;
        const sectionId = current.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            sideNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ============================================================
// Scroll progress bar
// ============================================================
const scrollProgress = document.getElementById('scroll-progress');

function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollProgress) {
        scrollProgress.style.width = `${progress}%`;
    }
}

// ============================================================
// Back to top button
// ============================================================
const backToTopButton = document.getElementById('back-to-top');

function updateBackToTopVisibility() {
    if (backToTopButton) {
        backToTopButton.classList.toggle('visible', window.scrollY > 400);
    }
}

if (backToTopButton) {
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================================
// Theme toggle (light / dark) — desktop + mobile buttons stay in sync
// ============================================================
const themeToggles = [
    document.getElementById('theme-toggle-desktop'),
    document.getElementById('theme-toggle-mobile')
].filter(Boolean);

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggles.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
    if (window.neuralBackground) {
        window.neuralBackground.refreshTheme();
    }
}

// Light theme by default; only switch to dark if the visitor has chosen it before
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
    });
});

// ============================================================
// Reveal-on-scroll for content blocks
// ============================================================
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            revealObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.timeline-item, .research-card, .project-card, .compact-list li'
    );

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        revealObserver.observe(el);
    });
});

// ============================================================
// Counter animation for the sidebar stats
// ============================================================
function animateCounter(element, target, suffix, duration = 1200) {
    let start = 0;
    const increment = target / (duration / 16);

    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + suffix;
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + suffix;
        }
    }

    updateCounter();
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.side-stat-number').forEach(stat => {
                const raw = stat.textContent.trim();
                const suffix = raw.endsWith('+') ? '+' : '';
                const target = parseInt(raw, 10);
                if (!Number.isNaN(target)) {
                    animateCounter(stat, target, suffix);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const sideStats = document.querySelector('.side-stats');
if (sideStats) {
    statsObserver.observe(sideStats);
}

// ============================================================
// Profile photo lightbox
// ============================================================
const profileImageTrigger = document.getElementById('profile-image-trigger');
const lightbox = document.getElementById('lightbox');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxBackdrop = document.getElementById('lightbox-backdrop');

function openLightbox() {
    if (!lightbox) return;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

if (profileImageTrigger) {
    profileImageTrigger.addEventListener('click', openLightbox);
    profileImageTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox();
        }
    });
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});

// ============================================================
// Contact form handling
// ============================================================
const contactForm = document.getElementById('contact-form');
const CONTACT_EMAIL = 'mdsaharanevan20001@gmail.com';

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');

        if (!name || !email || !subject || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        const body = `${message}\n\n— ${name} (${email})`;
        const mailtoLink = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoLink;
        showNotification('Opening your email app to send the message…', 'success');
        contactForm.reset();
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;

    switch (type) {
        case 'success':
            notification.style.background = '#10b981';
            break;
        case 'error':
            notification.style.background = '#ef4444';
            break;
        default:
            notification.style.background = '#6d5ffb';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// ============================================================
// Project cards 3D tilt effect
// ============================================================
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 18;
        const rotateY = (centerX - x) / 18;

        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ============================================================
// Footer copyright year (sidebar + main footer)
// ============================================================
['footer-year', 'footer-year-main'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = new Date().getFullYear();
});

// ============================================================
// Throttled scroll handling
// ============================================================
function throttle(func, wait) {
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

const throttledScroll = throttle(() => {
    highlightActiveSection();
    updateScrollProgress();
    updateBackToTopVisibility();
}, 10);

window.addEventListener('scroll', throttledScroll);

// Set initial scroll-dependent state on load
throttledScroll();

// Console message for developers
console.log(`
🚀 Portfolio Website by Md Saharan Evan
📧 Contact: mdsaharanevan20001@gmail.com
🌐 Feel free to reach out for collaborations!

Built with ❤️ using HTML, CSS & JavaScript
`);
