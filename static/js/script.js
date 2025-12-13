// ============================================
// CYBERBURGS - Modern Enterprise JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // ===== MOBILE MENU =====
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }

    // ===== SMOOTH SCROLLING =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const headerOffset = 100;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== HEADER SCROLL EFFECT =====
    const header = document.querySelector('header');
    const scrollProgressBar = document.querySelector('.scroll-progress-bar');
    const backToTopBtn = document.getElementById('backToTop');
    let lastScroll = 0;

    const handleHeaderScroll = () => {
        const currentScroll = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (currentScroll / docHeight) * 100;

        // Header background effect
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Scroll progress bar
        if (scrollProgressBar) {
            scrollProgressBar.style.width = `${scrollPercent}%`;
        }

        // Back to top button visibility
        if (backToTopBtn) {
            if (currentScroll > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }

        lastScroll = currentScroll;
    };

    // Back to top click handler
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll(); // Initial check

    // ===== ACTIVE NAV LINK HIGHLIGHTING =====
    const navLinksItems = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');

    const highlightNavLink = () => {
        const scrollPos = window.pageYOffset + 200;
        let current = 'home';

        sections.forEach(section => {
            if (scrollPos >= section.offsetTop) {
                current = section.getAttribute('id');
            }
        });

        navLinksItems.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    };

    window.addEventListener('scroll', highlightNavLink, { passive: true });
    highlightNavLink(); // Initial check

    // ===== SCROLL REVEAL ANIMATIONS =====
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all reveal elements
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
        revealObserver.observe(el);
    });

    // ===== STATS COUNTER ANIMATION =====
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-target]');

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };

            updateCounter();
        });
    }

    // ===== CONTACT FORM VALIDATION & XSS PROTECTION =====
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const charCount = document.getElementById('charCount');
    const messageTextarea = document.getElementById('message');

    // XSS Sanitization function
    function sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            "/": '&#x2F;',
            "`": '&#x60;',
            "=": '&#x3D;'
        };
        const reg = /[&<>"'`=\/]/g;
        return input.replace(reg, (match) => map[match]);
    }

    // Detect potential XSS patterns
    function containsXSS(input) {
        const xssPatterns = [
            /<script[\s\S]*?>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe[\s\S]*?>/gi,
            /<object[\s\S]*?>/gi,
            /<embed[\s\S]*?>/gi,
            /<link[\s\S]*?>/gi,
            /eval\s*\(/gi,
            /expression\s*\(/gi,
            /url\s*\(/gi,
            /data:/gi
        ];
        return xssPatterns.some(pattern => pattern.test(input));
    }

    // Validate individual field
    function validateField(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return true;

        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        const pattern = field.getAttribute('pattern');

        // Skip validation if optional and empty
        if (!isRequired && !value) {
            formGroup.classList.remove('valid', 'invalid');
            return true;
        }

        // Required field check
        if (isRequired && !value) {
            formGroup.classList.remove('valid');
            formGroup.classList.add('invalid');
            return false;
        }

        // Pattern validation
        if (pattern && value) {
            const regex = new RegExp(pattern);
            if (!regex.test(value)) {
                formGroup.classList.remove('valid');
                formGroup.classList.add('invalid');
                return false;
            }
        }

        // XSS check
        if (containsXSS(value)) {
            formGroup.classList.remove('valid');
            formGroup.classList.add('invalid');
            const errorMsg = formGroup.querySelector('.error-message');
            if (errorMsg) errorMsg.textContent = 'Invalid characters detected';
            return false;
        }

        // Email specific validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(value)) {
                formGroup.classList.remove('valid');
                formGroup.classList.add('invalid');
                return false;
            }
        }

        // Message minimum length
        if (field.id === 'message' && value.length < 10) {
            formGroup.classList.remove('valid');
            formGroup.classList.add('invalid');
            return false;
        }

        formGroup.classList.remove('invalid');
        formGroup.classList.add('valid');
        return true;
    }

    // Character counter for message
    if (messageTextarea && charCount) {
        messageTextarea.addEventListener('input', function () {
            const count = this.value.length;
            charCount.textContent = count;
            if (count > 1800) {
                charCount.style.color = '#f59e0b';
            } else if (count > 1950) {
                charCount.style.color = '#ef4444';
            } else {
                charCount.style.color = '';
            }
        });
    }

    // Real-time validation on blur
    if (contactForm) {
        const formInputs = contactForm.querySelectorAll('input, textarea');

        formInputs.forEach(input => {
            input.addEventListener('blur', function () {
                validateField(this);
            });

            input.addEventListener('input', function () {
                // Clear invalid state while typing
                const formGroup = this.closest('.form-group');
                if (formGroup && formGroup.classList.contains('invalid')) {
                    formGroup.classList.remove('invalid');
                }
            });
        });

        // Form submission with validation
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            let isValid = true;
            const formData = {};

            // Validate all fields
            formInputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
                formData[input.name] = sanitizeInput(input.value.trim());
            });

            // Also check selects
            contactForm.querySelectorAll('select').forEach(select => {
                formData[select.name] = sanitizeInput(select.value);
                if (select.hasAttribute('required') && !select.value) {
                    isValid = false;
                    select.closest('.form-group')?.classList.add('invalid');
                }
            });

            if (!isValid) {
                // Scroll to first error
                const firstError = contactForm.querySelector('.form-group.invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            // Show loading state
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                    Message Sent!
                `;
                submitBtn.style.background = '#10b981';

                // Reset form after delay
                setTimeout(() => {
                    contactForm.reset();
                    contactForm.querySelectorAll('.form-group').forEach(fg => {
                        fg.classList.remove('valid', 'invalid');
                    });
                    if (charCount) charCount.textContent = '0';
                    submitBtn.innerHTML = `
                        <span class="btn-text">Send Message</span>
                        <span class="btn-loading">
                            <svg class="spinner" width="18" height="18" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4"></circle>
                            </svg>
                            Sending...
                        </span>
                        <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22,2 15,22 11,13 2,9"></polygon>
                        </svg>
                    `;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                }, 3000);
            }, 1500);
        });
    }

    // ===== CLICK TO COPY FOR CONTACT INFO =====
    document.querySelectorAll('.contact-info-item').forEach(item => {
        item.addEventListener('click', function () {
            const content = this.querySelector('.info-content p');
            if (content) {
                const text = content.textContent;
                navigator.clipboard.writeText(text).then(() => {
                    this.classList.add('copied');
                    setTimeout(() => {
                        this.classList.remove('copied');
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy:', err);
                });
            }
        });
    });

    // ===== FORM INPUT ANIMATIONS =====
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function () {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });

    // ===== STAGGER ANIMATION SETUP =====
    document.querySelectorAll('.stagger').forEach(container => {
        const children = container.children;
        Array.from(children).forEach((child, index) => {
            if (!child.style.transitionDelay) {
                child.style.transitionDelay = `${index * 0.1}s`;
            }
        });
    });

    // ===== SERVICE CARD HOVER EFFECT =====
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-8px)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = '';
        });
    });

    // ===== INSIGHT CARD HOVER EFFECT =====
    document.querySelectorAll('.insight-card').forEach(card => {
        card.addEventListener('mouseenter', function () {
            const img = this.querySelector('.insight-image img');
            if (img) {
                img.style.transform = 'scale(1.08)';
            }
        });

        card.addEventListener('mouseleave', function () {
            const img = this.querySelector('.insight-image img');
            if (img) {
                img.style.transform = '';
            }
        });
    });

    // ===== KEYBOARD NAVIGATION =====
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });

    // ===== LAZY LOADING FOR IMAGES =====
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ===== PREFERS REDUCED MOTION =====
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefersReducedMotion.matches) {
        // Disable animations for users who prefer reduced motion
        document.documentElement.style.setProperty('--transition-fast', '0s');
        document.documentElement.style.setProperty('--transition-base', '0s');
        document.documentElement.style.setProperty('--transition-smooth', '0s');
    }

    console.log('🛡️ Cyberburgs website initialized');
});

// ===== UTILITY: THROTTLE FUNCTION =====
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== UTILITY: DEBOUNCE FUNCTION =====
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
