/**
 * ERIC COSTE - RESOURCES PAGE
 * JavaScript for email capture modals and PDF downloads
 */

(function() {
    'use strict';

    // ---------- DOM Elements ----------
    var $ = function(selector) { return document.querySelector(selector); };
    var $$ = function(selector) { return document.querySelectorAll(selector); };
    
    var modal = $('#resource-modal');
    var modalClose = $('#modal-close');
    var modalIcon = $('#modal-icon');
    var modalTitle = $('#resource-modal-title');
    var modalIntro = $('#modal-intro');
    var resourceForm = $('#resource-form');
    var resourceName = $('#resource-name');
    var resourceEmail = $('#resource-email');
    var formMessage = $('#resource-form-message');
    var resourceButtons = $$('.btn-resource');
    var currentYearSpan = $('#current-year');
    
    // Store current PDF to download
    var currentPdf = '';
    
    // Resource configurations
    var resources = {
        'medical-collections': {
            icon: '🏥',
            title: 'Medical Collections Pre Dispute Guide',
            intro: 'Enter your email and your free guide will open in a new tab.'
        },
        'checklist': {
            icon: '✅',
            title: 'Credit Repair Checklist',
            intro: 'Enter your email and your checklist will open in a new tab.'
        }
    };

    // ---------- Set Current Year ----------
    function updateYear() {
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    }
    updateYear();

    // ---------- Utility Functions ----------
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ---------- Modal Functions ----------
    function openModal(resourceKey, pdfUrl) {
        if (!modal) return;
        
        var config = resources[resourceKey] || {
            icon: '📄',
            title: 'Get Your Free Resource',
            intro: 'Enter your email to download.'
        };
        
        // Update modal content
        if (modalIcon) modalIcon.textContent = config.icon;
        if (modalTitle) modalTitle.textContent = config.title;
        if (modalIntro) modalIntro.textContent = config.intro;
        if (resourceName) resourceName.value = resourceKey;
        
        // Store PDF URL
        currentPdf = pdfUrl;
        
        // Show modal
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Focus email input
        if (resourceEmail) {
            setTimeout(function() {
                resourceEmail.focus();
            }, 100);
        }
    }
    
    function closeModal() {
        if (!modal) return;
        
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Reset form
        if (resourceForm) resourceForm.reset();
        if (formMessage) {
            formMessage.textContent = '';
            formMessage.className = 'form-message';
        }
        currentPdf = '';
    }

    // ---------- Event Listeners ----------
    
    // Resource button clicks
    resourceButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var resourceKey = this.getAttribute('data-resource');
            var pdfUrl = this.getAttribute('data-pdf');
            openModal(resourceKey, pdfUrl);
        });
    });
    
    // Close button
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Click outside modal
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Focus trap
    if (modal) {
        modal.addEventListener('keydown', function(e) {
            if (e.key !== 'Tab') return;
            
            var focusable = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            var first = focusable[0];
            var last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });
    }

    // ---------- Form Submission ----------
    if (resourceForm) {
        resourceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var email = resourceEmail ? resourceEmail.value.trim() : '';
            
            // Validate email
            if (!email || !isValidEmail(email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }
            
            // Show loading state
            showMessage('Processing...', 'success');
            
            // Submit to Netlify Forms
            var formData = new FormData(resourceForm);
            
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(function(response) {
                // Show success and open PDF regardless of response
                // (Netlify will still capture the submission)
                showMessage('Success! Opening your download...', 'success');
                
                // Open PDF in new tab
                if (currentPdf) {
                    window.open(currentPdf, '_blank');
                }
                
                // Close modal after short delay
                setTimeout(function() {
                    closeModal();
                }, 1500);
            })
            .catch(function(error) {
                console.error('Form submission error:', error);
                // Still open the PDF for better UX
                showMessage('Opening your download...', 'success');
                
                if (currentPdf) {
                    window.open(currentPdf, '_blank');
                }
                
                setTimeout(function() {
                    closeModal();
                }, 1500);
            });
        });
    }
    
    function showMessage(message, type) {
        if (!formMessage) return;
        formMessage.textContent = message;
        formMessage.className = 'form-message ' + type;
    }

})();
