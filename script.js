/**
 * ERIC COSTE - AUTHOR WEBSITE
 * Minimal JavaScript for interactions
 */

(function() {
    'use strict';

    // ---------- DOM Elements ----------
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const newsletterForm = document.getElementById('newsletter-form');
    const formMessage = document.getElementById('form-message');
    const currentYearSpan = document.getElementById('current-year');
    
    // Contact Modal Elements
    const contactBtn = document.getElementById('contact-btn');
    const contactModal = document.getElementById('contact-modal');
    const modalClose = document.getElementById('modal-close');
    const contactForm = document.getElementById('contact-form');
    const contactFormMessage = document.getElementById('contact-form-message');

    // ---------- Set Current Year (Always Current) ----------
    function updateYear() {
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    }
    updateYear();

    // ---------- Mobile Menu Toggle ----------
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            
            // Toggle states
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
        });

        // Close menu when a nav link is clicked (except contact button)
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                if (!this.classList.contains('nav-btn')) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    menuToggle.classList.remove('active');
                    nav.classList.remove('active');
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = nav.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnToggle && nav.classList.contains('active')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
            }
        });
    }

    // ---------- Contact Modal ----------
    function openModal() {
        contactModal.classList.add('active');
        contactModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Close mobile menu if open
        if (menuToggle && nav) {
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
        }
        
        // Focus first input
        const firstInput = contactForm.querySelector('input');
        if (firstInput) {
            setTimeout(function() {
                firstInput.focus();
            }, 100);
        }
    }
    
    function closeModal() {
        contactModal.classList.remove('active');
        contactModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Clear form and message
        contactForm.reset();
        contactFormMessage.textContent = '';
        contactFormMessage.className = 'form-message';
    }
    
    if (contactBtn) {
        contactBtn.addEventListener('click', openModal);
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking overlay background
    if (contactModal) {
        contactModal.addEventListener('click', function(event) {
            if (event.target === contactModal) {
                closeModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && contactModal.classList.contains('active')) {
            closeModal();
        }
    });

    // ---------- Contact Form Handler (Netlify Forms) ----------
    if (contactForm && contactFormMessage) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const message = document.getElementById('contact-message').value.trim();
            
            // Validation
            if (!name || !email || !message) {
                showContactMessage('Please fill in all fields.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showContactMessage('Please enter a valid email address.', 'error');
                return;
            }
            
            // Submit to Netlify Forms
            const formData = new FormData(contactForm);
            
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(function(response) {
                if (response.ok) {
                    // Show success message
                    showContactMessage('Thanks for reaching out! I\'ll get back to you soon.', 'success');
                    
                    // Clear the form
                    contactForm.reset();
                    
                    // Close modal after delay
                    setTimeout(closeModal, 2500);
                } else {
                    showContactMessage('Something went wrong. Please try again.', 'error');
                }
            })
            .catch(function(error) {
                console.error('Form submission error:', error);
                showContactMessage('Something went wrong. Please try again.', 'error');
            });
        });
    }
    
    function showContactMessage(message, type) {
        contactFormMessage.textContent = message;
        contactFormMessage.className = 'form-message ' + type;
    }

    // ---------- Newsletter Form Handler (Netlify Forms) ----------
    if (newsletterForm && formMessage) {
        newsletterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const emailInput = document.getElementById('email');
            const email = emailInput.value.trim();
            
            // Basic email validation
            if (!email || !isValidEmail(email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }
            
            // Submit to Netlify Forms
            const formData = new FormData(newsletterForm);
            
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(function(response) {
                if (response.ok) {
                    // Show success message
                    showMessage('Thanks for subscribing! You\'ll hear from me soon.', 'success');
                    
                    // Clear the form
                    emailInput.value = '';
                } else {
                    showMessage('Something went wrong. Please try again.', 'error');
                }
            })
            .catch(function(error) {
                console.error('Form submission error:', error);
                showMessage('Something went wrong. Please try again.', 'error');
            });
        });
    }

    // ---------- Helper Functions ----------
    
    /**
     * Validate email format
     * @param {string} email - Email address to validate
     * @returns {boolean} - True if valid
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Display newsletter form message
     * @param {string} message - Message to display
     * @param {string} type - 'success' or 'error'
     */
    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = 'form-message ' + type;
        
        // Clear message after 5 seconds
        setTimeout(function() {
            formMessage.textContent = '';
            formMessage.className = 'form-message';
        }, 5000);
    }

    // ---------- Smooth Scroll for Anchor Links ----------
    // Note: CSS scroll-behavior: smooth handles most of this,
    // but this provides fallback and offset handling for older browsers
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(event) {
            const targetId = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (targetId === '#') {
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                event.preventDefault();
                
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without triggering scroll
                history.pushState(null, null, targetId);
            }
        });
    });

})();
