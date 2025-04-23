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

class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.htmlElement = document.documentElement;
    this.init();
  }

  init() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else if (prefersDark) {
      this.setTheme('dark');
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });

    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', this.toggleTheme.bind(this));
    }
  }

  setTheme(theme) {
    this.htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  toggleTheme() {
    try {
      const currentTheme = this.htmlElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme);
    } catch (error) {
      console.error('Theme toggle error:', error);
    }
  }

  cleanup() {
    if (this.themeToggle) {
      this.themeToggle.removeEventListener('click', this.toggleTheme.bind(this));
    }
  }
}

class SearchManager {
  constructor() {
    this.searchInput = document.querySelector('.search-input');
    this.toolCards = document.querySelectorAll('.tool-card');
    this.init();
  }

  init() {
    if (this.searchInput) {
      this.debouncedSearch = debounce(this.handleSearch.bind(this), 200);
      this.searchInput.addEventListener('input', this.debouncedSearch);
      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.clearSearch();
        }
      });
    }
  }

  handleSearch(event) {
    try {
      const searchTerm = event.target.value.toLowerCase().trim();
      this.toolCards.forEach(card => {
        const toolName = card.querySelector('h3').textContent.toLowerCase();
        const toolDesc = card.querySelector('.tool-desc')?.textContent.toLowerCase() || '';
        const isVisible = toolName.includes(searchTerm) || toolDesc.includes(searchTerm);
        card.style.display = isVisible ? '' : 'none';
      });
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  clearSearch() {
    this.searchInput.value = '';
    this.toolCards.forEach(card => {
      card.style.display = '';
    });
  }

  cleanup() {
    if (this.searchInput) {
      this.searchInput.removeEventListener('input', this.debouncedSearch);
      this.searchInput.removeEventListener('keydown', this.clearSearch);
    }
  }
}

class ToolInteraction {
  constructor() {
    this.toolCards = document.querySelectorAll('.tool-card');
    this.notification = document.getElementById('notification');
    this.init();
  }

  init() {
    this.toolCards.forEach(card => {
      card.addEventListener('mousedown', () => {
        card.style.transform = 'translateY(2px)';
      });

      card.addEventListener('mouseup', () => {
        card.style.transform = 'translateY(-8px)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });

      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleToolClick(card);
        }
      });

      card.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleToolClick(card);
      });

      card.addEventListener('focus', () => {
        card.style.boxShadow = '0 0 0 3px rgba(108, 92, 231, 0.3)';
      });

      card.addEventListener('blur', () => {
        card.style.boxShadow = '';
      });
    });
  }

  async handleToolClick(card) {
    try {
      const toolUrl = card.getAttribute('href');
      const toolName = card.querySelector('h3').textContent;
      card.classList.add('loading');
      card.style.pointerEvents = 'none';

      if (!toolUrl || toolUrl === '#') {
        this.showNotification(`Tool "${toolName}" is not yet implemented.`);
        return;
      }

      const response = await fetch(toolUrl, { method: 'HEAD' });
      if (!response.ok) {
        this.showNotification(`Tool "${toolName}" is currently unavailable.`);
        return;
      }

      window.location.href = toolUrl;
    } catch (error) {
      console.error(`Error accessing tool: ${card.querySelector('h3').textContent}`, error);
      this.showNotification(`Failed to load "${card.querySelector('h3').textContent}". Check your connection.`);
    } finally {
      card.classList.remove('loading');
      card.style.pointerEvents = '';
    }
  }

  showNotification(message) {
    this.notification.textContent = message;
    this.notification.classList.add('show');
    setTimeout(() => {
      this.notification.classList.remove('show');
      this.notification.classList.add('hidden');
    }, 4000);
  }

  cleanup() {
    this.toolCards.forEach(card => {
      const newCard = card.cloneNode(true);
      card.parentNode.replaceChild(newCard, card);
    });
  }
}

try {
  const themeManager = new ThemeManager();
  const searchManager = new SearchManager();
  const toolInteraction = new ToolInteraction();

  window.addEventListener('unload', () => {
    themeManager.cleanup();
    searchManager.cleanup();
    toolInteraction.cleanup();
  });

  console.log('Fluent Docs initialized successfully');
} catch (error) {
  console.error('Initialization error:', error);
}