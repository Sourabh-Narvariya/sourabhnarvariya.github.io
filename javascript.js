// ============================================
// PORTFOLIO WEBSITE - MAIN JAVASCRIPT FILE
// ============================================

// 1. DOCUMENT READY & INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  initializePortfolio();
});

function initializePortfolio() {
  setCurrentYear();
  setupSmoothScrolling();
  setupFormValidation();
  setupIntersectionObserver();
  setupNavigation();
  setupButtonAnimations();
  setupScrollProgress();
}

// ============================================
// 2. SET CURRENT YEAR IN FOOTER
// ============================================
function setCurrentYear() {
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// ============================================
// 3. SMOOTH SCROLLING FOR NAVIGATION LINKS
// ============================================
function setupSmoothScrolling() {
  const navLinks = document.querySelectorAll('nav a, .hero-actions a');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Only handle local anchors
      if (href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update active nav state
          updateActiveNav(targetId);
        }
      }
    });
  });
}

// ============================================
// 4. CONTACT FORM VALIDATION & SUBMISSION
// ============================================

/**
 * Setup form handling on page load
 * - Attach submit listener to contact form
 * - Attach real-time validation to input fields
 */
function setupFormValidation() {
  const form = document.querySelector('#contact-form');
  
  if (form) {
    // Handle form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation on blur
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', validateField);
      input.addEventListener('focus', clearFieldError);
    });
  }
}

/**
 * Validate individual form field
 * - Check for empty values
 * - Validate email format
 * - Check message minimum length
 * - Display error messages
 */
function validateField(e) {
  const field = e.target;
  const value = field.value.trim();
  const errorElement = document.getElementById(field.id + '-error');
  
  let isValid = true;
  let errorMsg = '';
  
  // Name validation
  if (field.id === 'name') {
    if (value.length === 0) {
      isValid = false;
      errorMsg = 'Name is required';
    } else if (value.length < 2) {
      isValid = false;
      errorMsg = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
      isValid = false;
      errorMsg = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
  }
  
  // Email validation
  if (field.id === 'email') {
    if (value.length === 0) {
      isValid = false;
      errorMsg = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMsg = 'Please enter a valid email address';
      }
    }
  }
  
  // Message validation
  if (field.id === 'message') {
    if (value.length === 0) {
      isValid = false;
      errorMsg = 'Message is required';
    } else if (value.length < 10) {
      isValid = false;
      errorMsg = 'Message must be at least 10 characters';
    }
  }
  
  // Update UI: show/hide error message and field styling
  if (!isValid) {
    field.classList.add('error');
    if (errorElement) {
      errorElement.textContent = errorMsg;
    }
  } else {
    field.classList.remove('error');
    if (errorElement) {
      errorElement.textContent = '';
    }
  }
  
  return isValid;
}

/**
 * Clear error state when field gains focus
 */
function clearFieldError(e) {
  const field = e.target;
  const errorElement = document.getElementById(field.id + '-error');
  field.classList.remove('error');
  if (errorElement) {
    errorElement.textContent = '';
  }
}

/**
 * Display status message (success or error) to user
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
function showFormStatus(message, type) {
  const statusDiv = document.getElementById('form-status');
  if (!statusDiv) return;
  
  statusDiv.textContent = message;
  statusDiv.className = `form-status show ${type}`;
  
  // Auto-hide success message after 4 seconds
  if (type === 'success') {
    setTimeout(() => {
      statusDiv.classList.remove('show');
    }, 4000);
  }
}

/**
 * Handle form submission
 * - Validate all fields
 * - Send data via Formspree
 * - Show success/error messages
 * 
 * IMPORTANT SETUP:
 * 1. Go to https://formspree.io/create/
 * 2. Create a new form and add your email (narvariyasourabh447@gmail.com)
 * 3. Copy the form ID from the dashboard (e.g., abcde12345)
 * 4. Update the HTML form action to: https://formspree.io/f/[YOUR_ID]
 * 5. Replace YOUR_FORMSPREE_ID in index.html line ~668
 */
function handleFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const nameField = document.getElementById('name');
  const emailField = document.getElementById('email');
  const messageField = document.getElementById('message');
  const submitBtn = document.getElementById('submit-btn');
  
  // Safety check: Make sure Formspree endpoint is configured
  if (form.action.includes('YOUR_FORMSPREE_ID') || form.action.includes('xyzqwvba')) {
    showFormStatus('⚠️ Configuration Error: Update your Formspree form ID in the HTML. Visit https://formspree.io/create/', 'error');
    console.error('ERROR: Formspree form ID not configured properly in index.html');
    return;
  }
  
  // Validate all fields before submission
  const isNameValid = validateField({ target: nameField });
  const isEmailValid = validateField({ target: emailField });
  const isMessageValid = validateField({ target: messageField });
  
  if (!isNameValid || !isEmailValid || !isMessageValid) {
    showFormStatus('⚠️ Please fix the errors above and try again.', 'error');
    return;
  }
  
  // Disable submit button and show loading state
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  
  // Create FormData object for submission
  const formData = new FormData(form);
  
  /**
   * Send form data to Formspree via HTTP POST
   * 
   * What happens:
   * 1. Formspree receives the form data
   * 2. Validates it's a valid form ID
   * 3. Sends an email to your registered email address
   * 4. Returns success (200 OK) or error (404/422) response
   * 
   * Error codes:
   * - 404: Form not found (wrong form ID)
   * - 422: Validation error (missing required fields)
   * - Other: Network or server error
   */
  fetch(form.action, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    // Check HTTP response status
    if (response.ok) {
      // ✓ SUCCESS (200-299)
      showFormStatus('✓ Message sent successfully! I\'ll get back to you soon.', 'success');
      form.reset(); // Clear form fields
      console.log('✓ Form submitted successfully to Formspree at', new Date().toISOString());
      return response.json();
    } else if (response.status === 404) {
      // ✗ ERROR 404: Form not found (wrong Formspree ID)
      throw new Error('FORMSPREE_NOT_FOUND');
    } else if (response.status === 422) {
      // ✗ ERROR 422: Form validation failed
      throw new Error('FORMSPREE_VALIDATION_ERROR');
    } else {
      // ✗ ERROR: Other Formspree issue
      throw new Error(`FORMSPREE_ERROR_${response.status}`);
    }
  })
  .catch(error => {
    // Handle any errors during submission
    console.error('Form submission error:', error.message);
    
    if (error.message === 'FORMSPREE_NOT_FOUND') {
      showFormStatus('❌ Formspree form not found. Update your form ID: https://formspree.io/create/', 'error');
    } else if (error.message === 'FORMSPREE_VALIDATION_ERROR') {
      showFormStatus('❌ Formspree validation error. Check form field names in HTML.', 'error');
    } else if (error.message.includes('Failed to fetch')) {
      showFormStatus('❌ Network error. Check your internet or CORS settings.', 'error');
    } else {
      showFormStatus('❌ Failed to send message. Try again or email: narvariyasourabh447@gmail.com', 'error');
    }
  })
  .finally(() => {
    // Always re-enable the submit button after request completes
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  });
}



// ============================================
// 5. INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================
function setupIntersectionObserver() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all cards and elements with animation class
  const elements = document.querySelectorAll(
    '.skill-card, .project, .timeline-item, section'
  );
  
  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
  });
}

// ============================================
// 6. ACTIVE NAVIGATION STATE
// ============================================
function updateActiveNav(sectionId) {
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === `#${sectionId}`) {
      link.style.color = 'var(--accent)';
    } else {
      link.style.color = 'inherit';
    }
  });
}

// Listen for scroll changes to update active nav
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section');
  let currentSection = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    
    if (window.pageYOffset >= sectionTop - 200) {
      currentSection = section.getAttribute('id');
    }
  });
  
  if (currentSection) {
    updateActiveNav(currentSection);
  }
});

// ============================================
// 7. BUTTON ANIMATIONS & INTERACTIONS
// ============================================
function setupButtonAnimations() {
  const buttons = document.querySelectorAll('.btn-primary, .btn-ghost');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', (e) => {
      e.target.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', (e) => {
      e.target.style.transform = 'translateY(0)';
    });
    
    button.addEventListener('click', (e) => {
      createRipple(e);
    });
  });
}

function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    left: ${x}px;
    top: ${y}px;
    pointer-events: none;
    animation: rippleEffect 0.6s ease-out;
  `;
  
  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 600);
}

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleEffect {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ============================================
// 8. SCROLL PROGRESS INDICATOR
// ============================================
function setupScrollProgress() {
  const progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    z-index: 100;
    transition: width 0.1s ease;
  `;
  document.body.appendChild(progressBar);
  
  window.addEventListener('scroll', () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / scrollHeight) * 100;
    progressBar.style.width = scrolled + '%';
  });
}

// ============================================
// 9. KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
  // Press '/' to focus on search/contact
  if (e.key === '/') {
    e.preventDefault();
    const messageField = document.getElementById('message');
    if (messageField) {
      messageField.focus();
    }
  }
  
  // Press 'H' to scroll to hero
  if (e.key.toLowerCase() === 'h') {
    document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
  }
  
  // Press 'C' to scroll to contact
  if (e.key.toLowerCase() === 'c') {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }
});

// ============================================
// 10. THEME TOGGLE (Optional Dark/Light Mode)
// ============================================
function setupThemeToggle() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('portfolio-theme');
  
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
}

function applyTheme(theme) {
  localStorage.setItem('portfolio-theme', theme);
  
  if (theme === 'light') {
    document.documentElement.style.setProperty('--bg', '#ffffff');
    document.documentElement.style.setProperty('--text', '#1f2937');
    document.documentElement.style.setProperty('--muted', '#6b7280');
    document.documentElement.style.setProperty('--card', '#f3f4f6');
  } else {
    document.documentElement.style.setProperty('--bg', '#0f172a');
    document.documentElement.style.setProperty('--text', '#e5e7eb');
    document.documentElement.style.setProperty('--muted', '#9ca3af');
    document.documentElement.style.setProperty('--card', '#020617');
  }
}

// ============================================
// 11. UTILITY FUNCTIONS
// ============================================

// Debounce function for performance optimization
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Check if element is in viewport
function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Copy to clipboard function
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    console.log('Copied to clipboard:', text);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

// ============================================
// 12. PERFORMANCE & ANALYTICS
// ============================================

// Log page load performance
window.addEventListener('load', () => {
  if (window.performance && window.performance.timing) {
    const pageLoadTime = 
      window.performance.timing.loadEventEnd - 
      window.performance.timing.navigationStart;
    
    console.log('Page loaded in:', pageLoadTime, 'ms');
  }
});

// Track user interactions
function trackEvent(eventName, eventData = {}) {
  console.log(`Event: ${eventName}`, eventData);
  // You can send this to analytics service like Google Analytics
}

document.addEventListener('click', (e) => {
  if (e.target.tagName === 'A' && e.target.href) {
    trackEvent('link_click', {
      href: e.target.href,
      text: e.target.textContent
    });
  }
});
