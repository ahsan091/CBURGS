// Create floating particles - optimized
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50; // Reduced for performance

    // Use document fragment for batch DOM insertion
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        particle.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 4}s;
            width: ${Math.random() * 2 + 1}px;
            height: ${Math.random() * 2 + 1}px;
        `;

        fragment.appendChild(particle);
    }
    
    particlesContainer.appendChild(fragment);
}

// Create attack particles
function createAttackParticle() {
    const particlesContainer = document.getElementById('particles');
    const attack = document.createElement('div');

    // Style the attack particle
    attack.style.position = 'fixed';
    attack.style.width = '8px';
    attack.style.height = '8px';
    attack.style.background = '#ff0000';
    attack.style.borderRadius = '50%';
    attack.style.boxShadow = '0 0 15px #ff0000, 0 0 30px #ff0000';
    attack.style.zIndex = '5';

    // Random spawn position from edges
    const edge = Math.floor(Math.random() * 4);
    let startX, startY;

    switch (edge) {
        case 0: // Top
            startX = Math.random() * window.innerWidth;
            startY = -20;
            break;
        case 1: // Right
            startX = window.innerWidth + 20;
            startY = Math.random() * window.innerHeight;
            break;
        case 2: // Bottom
            startX = Math.random() * window.innerWidth;
            startY = window.innerHeight + 20;
            break;
        case 3: // Left
            startX = -20;
            startY = Math.random() * window.innerHeight;
            break;
    }

    attack.style.left = startX + 'px';
    attack.style.top = startY + 'px';

    particlesContainer.appendChild(attack);

    // Animate toward center logo
    animateAttack(attack, startX, startY);
}

// Animate attack particle toward center
function animateAttack(element, startX, startY) {
    // Get the actual logo element position (the outer circle)
    const logoElement = document.querySelector('.main-logo');
    if (!logoElement) return;

    const logoRect = logoElement.getBoundingClientRect();

    // Target the center of the logo
    const centerX = logoRect.left + (logoRect.width / 2);
    const centerY = logoRect.top + (logoRect.height / 2);

    // Calculate the radius of the logo area
    const logoRadius = (logoRect.width / 2);

    const deltaX = centerX - startX;
    const deltaY = centerY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const speed = 4; // pixels per frame
    let currentStep = 0;

    function updateAttack() {
        // Check if home is still fully visible, if not, remove particle silently
        const scrollY = window.scrollY || window.pageYOffset;
        if (scrollY > 10) {
            // Silently remove the particle without blast effect
            if (element.parentNode) {
                element.style.opacity = '0';
                element.style.transition = 'opacity 0.2s ease';
                setTimeout(() => {
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                }, 200);
            }
            return;
        }

        const progress = currentStep / (distance / speed);
        const currentX = startX + (deltaX * progress);
        const currentY = startY + (deltaY * progress);

        // Calculate current distance from logo center
        const currentDistanceFromCenter = Math.sqrt(
            Math.pow(currentX - centerX, 2) + Math.pow(currentY - centerY, 2)
        );

        // Check if particle hit the logo area
        if (currentDistanceFromCenter <= logoRadius) {
            // Hit the logo area - create blast effect at impact point
            createBlastEffect(currentX, currentY);

            // Remove the attack particle
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            return;
        }

        element.style.left = currentX + 'px';
        element.style.top = currentY + 'px';

        currentStep += speed;
        requestAnimationFrame(updateAttack);
    }

    updateAttack();
}

// Create blast effect when attack hits logo
function createBlastEffect(x, y) {
    const particlesContainer = document.getElementById('particles');

    // Create multiple blast particles
    for (let i = 0; i < 8; i++) {
        const blast = document.createElement('div');
        blast.style.position = 'fixed';
        blast.style.width = '4px';
        blast.style.height = '4px';
        blast.style.background = '#ffaa00';
        blast.style.borderRadius = '50%';
        blast.style.boxShadow = '0 0 10px #ffaa00';
        blast.style.left = x + 'px';
        blast.style.top = y + 'px';
        blast.style.zIndex = '10';

        particlesContainer.appendChild(blast);

        // Animate blast particles outward
        const angle = (i / 8) * 360;
        const velocity = 50;

        animateBlast(blast, x, y, angle, velocity);
    }

    // Create central flash effect
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.width = '30px';
    flash.style.height = '30px';
    flash.style.background = 'radial-gradient(circle, #ffffff 0%, #ffaa00 50%, transparent 100%)';
    flash.style.borderRadius = '50%';
    flash.style.left = (x - 15) + 'px';
    flash.style.top = (y - 15) + 'px';
    flash.style.zIndex = '15';
    flash.style.opacity = '1';

    particlesContainer.appendChild(flash);

    // Fade out flash
    let flashOpacity = 1;
    const fadeFlash = () => {
        flashOpacity -= 0.05;
        flash.style.opacity = flashOpacity;
        if (flashOpacity > 0) {
            requestAnimationFrame(fadeFlash);
        } else if (flash.parentNode) {
            flash.parentNode.removeChild(flash);
        }
    };
    fadeFlash();
}

// Animate blast particles
function animateBlast(element, startX, startY, angle, velocity) {
    const radians = angle * Math.PI / 180;
    const vx = Math.cos(radians) * velocity;
    const vy = Math.sin(radians) * velocity;

    let x = startX;
    let y = startY;
    let life = 1.0;

    function updateBlast() {
        // Check if home is still visible, if not, fade out blast particles quickly
        const scrollY = window.scrollY || window.pageYOffset;
        if (scrollY > 10) {
            life -= 0.1; // Fade out faster when scrolled
        }

        x += vx * 0.1;
        y += vy * 0.1;
        life -= 0.02;

        element.style.left = x + 'px';
        element.style.top = y + 'px';
        element.style.opacity = life;
        element.style.transform = `scale(${life})`;

        if (life > 0) {
            requestAnimationFrame(updateBlast);
        } else if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    updateBlast();
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    createParticles();

    let attackInterval;
    let isTabVisible = true;
    let isHomeFullyVisible = true;

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Tab is hidden - stop attacks and clear existing ones
            isTabVisible = false;
            if (attackInterval) {
                clearInterval(attackInterval);
            }
            clearAllAttackParticles();
        } else {
            // Tab is visible - resume attacks if home is fully visible
            isTabVisible = true;
            // COMMENTED OUT: Red attack vectors disabled
            // if (isHomeFullyVisible) {
            //     startAttackWaves();
            // }
        }
    });

    // Handle scroll events to detect home section visibility
    function handleScroll() {
        const scrollY = window.scrollY || window.pageYOffset;

        // Stop attacks if scrolled down even slightly (more than 10px)
        const shouldShowAttacks = scrollY <= 10;

        if (shouldShowAttacks && !isHomeFullyVisible) {
            // Just scrolled back to top - start attacks
            isHomeFullyVisible = true;
            // COMMENTED OUT: Red attack vectors disabled
            // if (isTabVisible) {
            //     // Start immediately without delay
            //     startAttackWaves();
            //     // Create immediate attack for responsiveness
            //     createAttackParticle();
            // }
        } else if (!shouldShowAttacks && isHomeFullyVisible) {
            // Just scrolled down - stop attacks immediately
            isHomeFullyVisible = false;
            if (attackInterval) {
                clearInterval(attackInterval);
            }
            // Clear particles immediately
            clearAllAttackParticles();
        }
    }

    // Add scroll listener for immediate response with passive for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check
    handleScroll();

    // Clear all existing attack particles with improved method
    function clearAllAttackParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        // Get all children that are not background particles
        const allChildren = Array.from(particlesContainer.children);
        allChildren.forEach(child => {
            if (!child.classList.contains('particle')) {
                // Immediately remove attack particles and their animations
                child.style.transition = 'none';
                child.style.opacity = '0';
                if (child.parentNode) {
                    child.parentNode.removeChild(child);
                }
            }
        });
    }

    // Start attack waves
    function startAttackWaves() {
        if (attackInterval) {
            clearInterval(attackInterval);
        }

        // Start with shorter interval for more responsive feel
        attackInterval = setInterval(createAttackWaves, 2000);
    }

    // Create attack waves only when conditions are met
    function createAttackWaves() {
        if (!isTabVisible || !isHomeFullyVisible) return;

        const waveSize = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < waveSize; i++) {
            setTimeout(() => {
                if (isTabVisible && isHomeFullyVisible) { // Double check before creating each particle
                    createAttackParticle();
                }
            }, i * 400);
        }
    }

    // COMMENTED OUT: Red attack vectors disabled
    // Initial attack wave (only if conditions are met)
    // setTimeout(() => {
    //     if (isTabVisible && isHomeFullyVisible) {
    //         startAttackWaves();
    //         for (let i = 0; i < 5; i++) {
    //             setTimeout(() => {
    //                 if (isTabVisible && isHomeFullyVisible) {
    //                     createAttackParticle();
    //                 }
    //             }, i * 600);
    //         }
    //     }
    // }, 1000);

    // Smooth scrolling for navigation with easing
    document.querySelectorAll('.nav-links a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const headerOffset = 80;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                smoothScrollTo(offsetPosition, 600);
            }
        });
    });

    // Custom smooth scroll function with easing
    function smoothScrollTo(targetPosition, duration) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function easeInOutCubic(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const easeProgress = easeInOutCubic(progress);
            
            window.scrollTo(0, startPosition + distance * easeProgress);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    // Mouse interaction removed for better performance

    // Contact form submission
    document.querySelector('.contact-form').addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    });

    // Blog strip click functionality
    document.querySelectorAll('.blog-strip').forEach(strip => {
        strip.addEventListener('click', function () {
            const blogUrl = this.getAttribute('data-link');
            if (blogUrl) {
                window.location.href = blogUrl; // Navigate to that URL
            }
        });
    });

    // ===== ENHANCED SCROLL ANIMATIONS =====
    
    // Throttle function for scroll performance
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Navbar scroll effect
    const header = document.querySelector('header');
    let lastScroll = 0;
    
    const handleHeaderScroll = throttle(() => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }, 10);
    
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });

    // Scroll reveal animation using Intersection Observer - optimized
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Stop observing once revealed
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px'
    });

    // Auto-add reveal classes to main sections and cards
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        // Add reveal to section titles
        const titles = section.querySelectorAll('.section-title, .security-matrix-title, .projects-hero-title, .insights-title, .contact-main-title');
        titles.forEach(title => {
            title.classList.add('reveal');
            revealObserver.observe(title);
        });

        // Add reveal to subtitles
        const subtitles = section.querySelectorAll('.security-matrix-subtitle, .projects-hero-subtitle, .insights-subtitle, .contact-subtitle');
        subtitles.forEach(subtitle => {
            subtitle.classList.add('reveal');
            revealObserver.observe(subtitle);
        });
    });

    // Add staggered reveal to service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.classList.add('reveal-scale');
        card.style.transitionDelay = `${index * 0.1}s`;
        revealObserver.observe(card);
    });

    // Add reveal to blog strips
    const blogStrips = document.querySelectorAll('.blog-strip');
    blogStrips.forEach((strip, index) => {
        strip.classList.add('reveal');
        strip.style.transitionDelay = `${index * 0.15}s`;
        revealObserver.observe(strip);
    });

    // Add reveal to contact form elements
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.classList.add('reveal-left');
        revealObserver.observe(contactForm);
    }

    const contactInfo = document.querySelector('.contact-info-section');
    if (contactInfo) {
        contactInfo.classList.add('reveal-right');
        revealObserver.observe(contactInfo);
    }

    // Add reveal to announcement box
    const announcementBox = document.querySelector('.announcement-box');
    if (announcementBox) {
        announcementBox.classList.add('reveal-scale');
        revealObserver.observe(announcementBox);
    }

    // Add reveal to status container
    const statusContainer = document.querySelector('.status-container');
    if (statusContainer) {
        statusContainer.classList.add('reveal');
        revealObserver.observe(statusContainer);
    }

    // Active nav link highlighting based on scroll position - optimized
    const navLinks = document.querySelectorAll('.nav-links a');
    const sectionsList = document.querySelectorAll('section[id]');

    const handleNavHighlight = throttle(() => {
        const scrollPos = window.pageYOffset + 250;
        let current = 'home';
        
        sectionsList.forEach(section => {
            if (scrollPos >= section.offsetTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    }, 100); // Increased throttle for performance

    window.addEventListener('scroll', handleNavHighlight, { passive: true });

    // Parallax removed for better scroll performance
});