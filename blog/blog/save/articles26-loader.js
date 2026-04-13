// articles-loader.js
document.addEventListener('DOMContentLoaded', function() {
  // Cargar los artículos desde el JSON
  fetch('articles26.json')
    .then(response => response.json())
    .then(data => {
      renderArticles(data.articles);
      setupFilters(data.articles);
    })
    .catch(error => {
      console.error('Error cargando los artículos:', error);
      // Si hay error, cargar artículos por defecto
      loadDefaultArticles();
    });

  function renderArticles(articles) {
    const container = document.getElementById('articles-container');
    if (!container) return;

    // Ordenar artículos por fecha (más reciente primero)
    articles.sort((a, b) => {
      return parseDate(b.date) - parseDate(a.date);
    });

    // Limpiar contenedor
    container.innerHTML = '';

    // Crear tarjetas para cada artículo
    articles.forEach((article, index) => {
      const articleCard = createArticleCard(article, index);
      container.appendChild(articleCard);
    });
  }

  function createArticleCard(article, index) {
    const card = document.createElement('article');
    card.className = `article-card fade-in stagger-delay-${(index % 4) + 1}`;
    card.setAttribute('data-category', article.category);
    card.setAttribute('data-id', article.id);

    // Determinar icono según formato
    let formatIcon = 'fa-file-alt';
    if (article.format === 'pdf') formatIcon = 'fa-file-pdf';
    if (article.format === 'external') formatIcon = 'fa-external-link-alt';

    // Determinar badge según fecha (artículos de los últimos 30 días)
    const articleDate = parseDate(article.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const badge = articleDate > thirtyDaysAgo ?
      '<div class="article-badge">Nuevo</div>' : '';

    // Determinar icono de categoría
    const categoryIcon = getCategoryIcon(article.category);

    card.innerHTML = `
      ${badge}
      <div class="article-content">
        <h3 class="article-title">${article.title}</h3>
        <div class="article-meta">
          <span class="article-date">
            <i class="far fa-calendar-alt"></i> ${article.date}
            ${article.location ? `<br><i class="fas fa-map-marker-alt"></i> ${article.location}` : ''}
          </span>
          <span class="article-category">
            <i class="${categoryIcon}"></i> ${getCategoryName(article.category)}
          </span>
        </div>
        <p class="article-excerpt">${article.excerpt || 'Artículo de análisis y reflexión política.'}</p>
        <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="article-link">
          Leer artículo <i class="fas fa-arrow-right"></i>
          <span class="format-indicator">
            <i class="fas ${formatIcon}"></i>
          </span>
        </a>
      </div>
    `;

    return card;
  }

  function setupFilters(articles) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const articleCards = document.querySelectorAll('.article-card');

    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remover clase active de todos los botones
        filterButtons.forEach(btn => btn.classList.remove('active'));

        // Agregar clase active al botón clickeado
        this.classList.add('active');

        const filterValue = this.getAttribute('data-filter');

        // Mostrar/ocultar artículos según el filtro
        articleCards.forEach(card => {
          if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 10);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });

    // Agregar estadísticas de categorías
    displayCategoryStats(articles);
  }

  function displayCategoryStats(articles) {
    const categoryCounts = {};

    articles.forEach(article => {
      if (!categoryCounts[article.category]) {
        categoryCounts[article.category] = 0;
      }
      categoryCounts[article.category]++;
    });

    // Actualizar los botones de filtro con conteos
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      const filterValue = button.getAttribute('data-filter');
      if (filterValue !== 'all' && categoryCounts[filterValue]) {
        const countSpan = document.createElement('span');
        countSpan.className = 'category-count';
        countSpan.textContent = ` (${categoryCounts[filterValue]})`;
        button.appendChild(countSpan);
      }
    });
  }

  function getCategoryIcon(category) {
    const icons = {
      'analisis': 'fas fa-chart-bar',
      'politica': 'fas fa-landmark',
      'ensayo': 'fas fa-feather-alt',
      'reflexion': 'fas fa-brain',
      'entrevista': 'fas fa-microphone-alt',
      'critica': 'fas fa-exclamation-triangle',
      'economia': 'fas fa-chart-line',
      'cultura': 'fas fa-theater-masks',
      'historia': 'fas fa-history',
      'tecnologia': 'fas fa-laptop-code',
      'internacional': 'fas fa-globe-americas',
      'educacion': 'fas fa-graduation-cap'
    };

    return icons[category] || 'fas fa-file-alt';
  }

  function getCategoryName(category) {
    const names = {
      'analisis': 'Análisis',
      'politica': 'Política',
      'ensayo': 'Ensayo',
      'reflexion': 'Reflexión',
      'entrevista': 'Entrevista',
      'critica': 'Crítica',
      'economia': 'Economía',
      'cultura': 'Cultura',
      'historia': 'Historia',
      'tecnologia': 'Tecnología',
      'internacional': 'Internacional',
      'educacion': 'Educación'
    };

    return names[category] || 'General';
  }

  function parseDate(dateStr) {
    // Convertir fecha en formato "13 de enero 2026" a objeto Date
    const months = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
      'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
      'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };

    const parts = dateStr.split(' ');
    if (parts.length >= 3) {
      const day = parseInt(parts[0]);
      const month = months[parts[2].toLowerCase()];
      const year = parseInt(parts[3] || parts[2]); // Manejar formato diferente

      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }

    // Si no se puede parsear, devolver fecha muy antigua
    return new Date(2000, 0, 1);
  }

  function loadDefaultArticles() {
    // Código para cargar artículos por defecto si no se puede cargar el JSON
    console.log('Cargando artículos por defecto...');
    // Podrías incluir aquí algunos artículos básicos
  }
});
