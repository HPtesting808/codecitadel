/**
 * CodexFlow — Main JavaScript
 * Dark wizard theme interactions
 */

(function() {
  'use strict';

  // ==========================================================================
  // DOM Elements
  // ==========================================================================
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const header = document.querySelector('.site-header');
  const readingProgress = document.querySelector('.reading-progress');
  const skipLink = document.querySelector('.skip-link');

  // ==========================================================================
  // Mobile Navigation Toggle
  // ==========================================================================
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('open');
      
      // Prevent body scroll when menu is open
      document.body.style.overflow = isExpanded ? '' : 'hidden';
    });

    // Close menu when clicking a link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ==========================================================================
  // Header Scroll Effect
  // ==========================================================================
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateHeader() {
    const scrollY = window.scrollY;
    
    if (scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  // ==========================================================================
  // Reading Progress Bar
  // ==========================================================================
  if (readingProgress) {
    function updateReadingProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      readingProgress.style.transform = `scaleX(${progress / 100})`;
      readingProgress.setAttribute('aria-valuenow', Math.round(progress));
    }

    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    updateReadingProgress(); // Initial
  }

  // ==========================================================================
  // Smooth Scroll for Anchor Links
  // ==========================================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = header.offsetHeight;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset - 16;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });

  // ==========================================================================
  // Active Navigation Highlighting
  // ==========================================================================
  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id], main[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    const headerHeight = header.offsetHeight;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - headerHeight - 100;
      const sectionBottom = sectionTop + section.offsetHeight;
      
      if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}` || 
          (current === '' && link.getAttribute('href') === '/')) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ==========================================================================
  // Intersection Observer for Animations
  // ==========================================================================
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        animationObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements with animation classes
  document.querySelectorAll('.stagger-1, .stagger-2, .stagger-3, .stagger-4, .stagger-5, .stagger-6, .card, .tool-card').forEach(el => {
    animationObserver.observe(el);
  });

  // ==========================================================================
  // Code Block Copy Buttons
  // ==========================================================================
  function addCopyButtons() {
    document.querySelectorAll('pre').forEach(pre => {
      if (pre.querySelector('.copy-btn')) return; // Already added
      
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      btn.setAttribute('aria-label', 'Copy code');
      btn.style.cssText = `
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        padding: 0.5rem;
        background: var(--color-card);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        color: var(--color-text-muted);
        cursor: pointer;
        opacity: 0;
        transition: all var(--transition-fast);
      `;
      
      pre.style.position = 'relative';
      pre.appendChild(btn);
      
      pre.addEventListener('mouseenter', () => { btn.style.opacity = '1'; });
      pre.addEventListener('mouseleave', () => { btn.style.opacity = '0'; });
      
      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code').textContent;
        try {
          await navigator.clipboard.writeText(code);
          btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; color: var(--color-success);"><polyline points="20 6 9 17 4 12"/></svg>';
          btn.style.color = 'var(--color-success)';
          setTimeout(() => {
            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
            btn.style.color = '';
          }, 2000);
        } catch (err) {
          console.error('Copy failed:', err);
        }
      });
    });
  }

  // Run after DOM ready and after any dynamic content
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCopyButtons);
  } else {
    addCopyButtons();
  }

  // ==========================================================================
  // External Link Indicators
  // ==========================================================================
  document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (!link.hostname.includes(window.location.hostname)) {
      link.setAttribute('rel', 'noopener noreferrer');
      if (!link.querySelector('.external-icon') && !link.classList.contains('btn') && !link.classList.contains('nav-link') && !link.classList.contains('footer-social')) {
        const icon = document.createElement('span');
        icon.className = 'external-icon';
        icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px; margin-left: 0.25rem; vertical-align: middle; opacity: 0.6;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
        link.appendChild(icon);
      }
    }
  });

  // ==========================================================================
  // Table Wrapper for Horizontal Scroll
  // ==========================================================================
  document.querySelectorAll('.post-content table, .comparison-table table').forEach(table => {
    if (!table.parentElement.classList.contains('table-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';
      wrapper.style.cssText = 'overflow-x: auto; margin: 1.5rem 0;';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  });

  // ==========================================================================
  // Lazy Load Images
  // ==========================================================================
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
          }
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // ==========================================================================
  // Performance: Debounce Utility
  // ==========================================================================
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

  // ==========================================================================
  // Search (placeholder for future search implementation)
  // ==========================================================================
  const searchBtn = document.querySelector('.btn-search');
  const searchModal = document.getElementById('search-modal');
  
  if (searchBtn && searchModal) {
    searchBtn.addEventListener('click', () => {
      searchModal.classList.add('open');
      searchModal.querySelector('input').focus();
      document.body.style.overflow = 'hidden';
    });
    
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) {
        searchModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchModal.classList.contains('open')) {
        searchModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ==========================================================================
  // Initialize on DOM Ready
  // ==========================================================================
  function init() {
    // Add loaded class to body for CSS transitions
    document.body.classList.add('loaded');
    
    // Trigger initial animations
    setTimeout(() => {
      document.querySelectorAll('.animate-fade-in-up:not(.stagger-1):not(.stagger-2):not(.stagger-3):not(.stagger-4):not(.stagger-5):not(.stagger-6)').forEach(el => {
        el.classList.add('animate-fade-in-up');
      });
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ==========================================================================
  // Export for module systems
  // ==========================================================================
  window.CodexFlow = {
    debounce,
    addCopyButtons
  };

})();