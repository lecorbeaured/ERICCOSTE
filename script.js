/**
 * ERIC COSTE - AUTHOR WEBSITE
 * Optimized JavaScript for interactions
 * @version 2.0
 */

(function() {
    'use strict';

    // ---------- Cache DOM Elements ----------
    var $ = function(selector) { return document.querySelector(selector); };
    var $$ = function(selector) { return document.querySelectorAll(selector); };
    
    var menuToggle = $('#menu-toggle');
    var nav = $('#nav');
    var navLinks = $$('.nav-link');
    var newsletterForm = $('#newsletter-form');
    var formMessage = $('#form-message');
    var currentYearSpan = $('#current-year');
    var contactBtn = $('#contact-btn');
    var contactModal = $('#contact-modal');
    var modalClose = $('#modal-close');
    var contactForm = $('#contact-form');
    var contactFormMessage = $('#contact-form-message');

    // ---------- Utility Functions ----------
    
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ---------- Set Current Year ----------
    function updateYear() {
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    }
    updateYear();

    // ---------- Mobile Menu Toggle ----------
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            var isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
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
            var isClickInsideNav = nav.contains(event.target);
            var isClickOnToggle = menuToggle.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnToggle && nav.classList.contains('active')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && nav.classList.contains('active')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
                menuToggle.focus();
            }
        });
    }

    // ---------- Contact Modal ----------
    function openModal() {
        if (!contactModal) return;
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
        var firstInput = contactForm ? contactForm.querySelector('input') : null;
        if (firstInput) {
            setTimeout(function() {
                firstInput.focus();
            }, 100);
        }
    }
    
    function closeModal() {
        if (!contactModal) return;
        contactModal.classList.remove('active');
        contactModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Clear form and message
        if (contactForm) contactForm.reset();
        if (contactFormMessage) {
            contactFormMessage.textContent = '';
            contactFormMessage.className = 'form-message';
        }
        
        // Return focus
        if (contactBtn) contactBtn.focus();
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

        // Focus trap
        contactModal.addEventListener('keydown', function(event) {
            if (event.key !== 'Tab') return;
            
            var focusable = contactModal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            var first = focusable[0];
            var last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && contactModal && contactModal.classList.contains('active')) {
            closeModal();
        }
    });

    // ---------- Form Message Helper ----------
    function showMessage(messageEl, message, type, autoClear) {
        if (!messageEl) return;
        if (autoClear === undefined) autoClear = true;
        
        messageEl.textContent = message;
        messageEl.className = 'form-message ' + type;
        
        if (autoClear) {
            setTimeout(function() {
                messageEl.textContent = '';
                messageEl.className = 'form-message';
            }, 5000);
        }
    }

    // ---------- Contact Form Handler (Netlify Forms) ----------
    if (contactForm && contactFormMessage) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            var name = $('#contact-name').value.trim();
            var email = $('#contact-email').value.trim();
            var message = $('#contact-message').value.trim();
            
            // Validation
            if (!name || !email || !message) {
                showMessage(contactFormMessage, 'Please fill in all fields.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showMessage(contactFormMessage, 'Please enter a valid email address.', 'error');
                return;
            }
            
            // Submit to Netlify Forms
            var formData = new FormData(contactForm);
            
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(function(response) {
                if (response.ok) {
                    showMessage(contactFormMessage, "Thanks for reaching out! I'll get back to you soon.", 'success', false);
                    contactForm.reset();
                    setTimeout(closeModal, 2500);
                } else {
                    showMessage(contactFormMessage, 'Something went wrong. Please try again.', 'error');
                }
            })
            .catch(function(error) {
                console.error('Form submission error:', error);
                showMessage(contactFormMessage, 'Something went wrong. Please try again.', 'error');
            });
        });
    }

    // ---------- Newsletter Form Handler (Netlify Forms) ----------
    if (newsletterForm && formMessage) {
        newsletterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            var emailInput = $('#email');
            var email = emailInput.value.trim();
            
            // Basic email validation
            if (!email || !isValidEmail(email)) {
                showMessage(formMessage, 'Please enter a valid email address.', 'error');
                return;
            }
            
            // Submit to Netlify Forms
            var formData = new FormData(newsletterForm);
            
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(function(response) {
                if (response.ok) {
                    showMessage(formMessage, "Thanks for subscribing! You'll hear from me soon.", 'success');
                    emailInput.value = '';
                } else {
                    showMessage(formMessage, 'Something went wrong. Please try again.', 'error');
                }
            })
            .catch(function(error) {
                console.error('Form submission error:', error);
                showMessage(formMessage, 'Something went wrong. Please try again.', 'error');
            });
        });
    }

    // ---------- Smooth Scroll for Anchor Links ----------
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(event) {
            var targetId = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (targetId === '#') return;
            
            var targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                event.preventDefault();
                
                var header = document.querySelector('.header');
                var headerHeight = header ? header.offsetHeight : 0;
                var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without triggering scroll
                history.pushState(null, null, targetId);
            }
        });
    });

    // ---------- Intersection Observer for Animations ----------
    if ('IntersectionObserver' in window) {
        var animateOnScroll = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    animateOnScroll.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements that should animate
        document.querySelectorAll('.book-card, .testimonial-card, .trust-item').forEach(function(el) {
            animateOnScroll.observe(el);
        });
    }

})();
