/**
 * ERIC COSTE - CREDIT HUB
 * JavaScript for sticky elements and interactions
 */

(function() {
    'use strict';

    // ---------- DOM Elements ----------
    const stickyBar = document.getElementById('sticky-bar');
    const heroSection = document.getElementById('hero');
    const booksSection = document.getElementById('books');
    const leadForm = document.getElementById('lead-form');
    const leadFormMessage = document.getElementById('lead-form-message');
    const currentYearSpan = document.getElementById('current-year');
    
    // Free Guide Modal Elements
    const freeGuideBtn = document.getElementById('free-guide-btn');
    const freeGuideModal = document.getElementById('free-guide-modal');
    const freeGuideModalClose = document.getElementById('free-guide-modal-close');
    const freeGuideForm = document.getElementById('free-guide-form');
    const freeGuideFormMessage = document.getElementById('free-guide-form-message');

    // ---------- Set Current Year ----------
    function updateYear() {
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    }
    updateYear();

    // ---------- Free Guide Modal ----------
    function openFreeGuideModal() {
        if (freeGuideModal) {
            freeGuideModal.classList.add('active');
            freeGuideModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // Focus email input
            const emailInput = document.getElementById('free-guide-email');
            if (emailInput) {
                setTimeout(function() {
                    emailInput.focus();
                }, 100);
            }
        }
    }
    
    function closeFreeGuideModal() {
        if (freeGuideModal) {
            freeGuideModal.classList.remove('active');
            freeGuideModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            
            // Clear form and message
            if (freeGuideForm) {
                freeGuideForm.reset();
            }
            if (freeGuideFormMessage) {
                freeGuideFormMessage.textContent = '';
                freeGuideFormMessage.className = 'form-message';
            }
        }
    }
    
    // Open modal when "Get It Free" button is clicked
    if (freeGuideBtn) {
        freeGuideBtn.addEventListener('click', openFreeGuideModal);
    }
    
    // Close modal handlers
    if (freeGuideModalClose) {
        freeGuideModalClose.addEventListener('click', closeFreeGuideModal);
    }
    
    if (freeGuideModal) {
        freeGuideModal.addEventListener('click', function(event) {
            if (event.target === freeGuideModal) {
                closeFreeGuideModal();
            }
        });
    }
    
    // Close with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && freeGuideModal && freeGuideModal.classList.contains('active')) {
            closeFreeGuideModal();
        }
    });
    
    // Free Guide Form Submission
    if (freeGuideForm && freeGuideFormMessage) {
        freeGuideForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const emailInput = document.getElementById('free-guide-email');
            const email = emailInput.value.trim();
            
            if (!email || !isValidEmail(email)) {
                freeGuideFormMessage.textContent = 'Please enter a valid email address.';
                freeGuideFormMessage.className = 'form-message error';
                return;
            }
            
            // Submit to Netlify Forms
            const formData = new FormData(freeGuideForm);
            
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(function(response) {
                // Show success and open PDF
                freeGuideFormMessage.textContent = 'Success! Opening your guide now...';
                freeGuideFormMessage.className = 'form-message success';
                emailInput.value = '';
                
                // Open PDF in new tab
                setTimeout(function() {
                    window.open('guide1-free.pdf', '_blank');
                    closeFreeGuideModal();
                }, 800);
            })
            .catch(function(error) {
                // Still open PDF even on error
                console.log('Form submission note:', error);
                freeGuideFormMessage.textContent = 'Success! Opening your guide now...';
                freeGuideFormMessage.className = 'form-message success';
                emailInput.value = '';
                
                setTimeout(function() {
                    window.open('guide1-free.pdf', '_blank');
                    closeFreeGuideModal();
                }, 800);
            });
        });
    }

    // ---------- Sticky Bar Logic ----------
    // Show sticky bar after scrolling past hero
    // Hide when books section is visible
    
    let ticking = false;
    
    function updateStickyBar() {
        if (!stickyBar || !heroSection || !booksSection) return;
        
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        const booksTop = booksSection.getBoundingClientRect().top;
        const booksBottom = booksSection.getBoundingClientRect().bottom;
        const windowHeight = window.innerHeight;
        
        // Show bar after scrolling past hero
        const pastHero = heroBottom < 100;
        
        // Hide bar when books section is in view (with some buffer)
        const booksInView = booksTop < windowHeight - 100 && booksBottom > 100;
        
        if (pastHero && !booksInView) {
            stickyBar.classList.add('visible');
            stickyBar.classList.remove('hidden');
        } else {
            stickyBar.classList.remove('visible');
            stickyBar.classList.add('hidden');
        }
    }
    
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateStickyBar();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Initial check
    updateStickyBar();

    // ---------- Lead Form Handler (Netlify Forms) ----------
    if (leadForm && leadFormMessage) {
        leadForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const emailInput = document.getElementById('lead-email');
            const email = emailInput.value.trim();
            
            // Basic email validation
            if (!email || !isValidEmail(email)) {
                showLeadMessage('Please enter a valid email address.', 'error');
                return;
            }
            
            // Submit to Netlify Forms
            const formData = new FormData(leadForm);
            
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(function(response) {
                // Show success and open PDF regardless of response
                // (handles both Netlify and local testing)
                showLeadMessage('Success! Opening your checklist now...', 'success');
                emailInput.value = '';
                
                setTimeout(function() {
                    window.open('credit-repair-checklist.pdf', '_blank');
                }, 500);
            })
            .catch(function(error) {
                // Still show success and open PDF even on network error
                // This ensures the user gets the PDF in all cases
                console.log('Form submission note:', error);
                showLeadMessage('Success! Opening your checklist now...', 'success');
                emailInput.value = '';
                
                setTimeout(function() {
                    window.open('credit-repair-checklist.pdf', '_blank');
                }, 500);
            });
        });
    }
    
    function showLeadMessage(message, type) {
        leadFormMessage.textContent = message;
        leadFormMessage.className = 'form-message ' + type;
        
        // Clear message after 5 seconds
        setTimeout(function() {
            leadFormMessage.textContent = '';
            leadFormMessage.className = 'form-message';
        }, 5000);
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

    // ---------- Smooth Scroll for Anchor Links ----------
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

    // ---------- FAQ Accordion (Enhanced) ----------
    // Close other FAQs when one is opened (optional behavior)
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(function(item) {
        item.addEventListener('toggle', function() {
            if (this.open) {
                // Close other open FAQs
                faqItems.forEach(function(otherItem) {
                    if (otherItem !== item && otherItem.open) {
                        otherItem.open = false;
                    }
                });
            }
        });
    });

})();
