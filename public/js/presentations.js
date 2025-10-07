// Presentations Page JavaScript
class PresentationsPage {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentView = 'grid';
        this.currentSort = 'newest';
        this.currentCategory = '';
        this.searchQuery = '';
        this.allPresentations = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStats();
        this.loadCategories();
        this.loadPresentations();
    }

    setupEventListeners() {
        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        searchBtn.addEventListener('click', () => this.performSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // Filters
        document.getElementById('sortFilter').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.applyFilters();
        });

        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.applyFilters();
        });

        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });

        // Load more
        document.getElementById('loadMoreBtn').addEventListener('click', () => {
            this.loadMoreContent();
        });

        // Modal functionality
        const modal = document.getElementById('mediaModal');
        const closeBtn = modal.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            this.stopMedia();
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                this.stopMedia();
            }
        });
    }

    async loadStats() {
        try {
            const response = await fetch('/api/stats/presentation');
            const data = await response.json();
            
            if (data.success) {
                const stats = data.stats;
                const totalPresentationsEl = document.getElementById('total-presentations');
                const totalSizeEl = document.getElementById('total-size');
                
                if (totalPresentationsEl) {
                    totalPresentationsEl.textContent = stats.total_count || 0;
                }
                
                if (totalSizeEl) {
                    const totalSize = this.formatFileSize(stats.total_size || 0);
                    totalSizeEl.textContent = totalSize;
                }
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('/admin/categories?type=presentation');
            const data = await response.json();
            
            if (data.success) {
                const categoryFilter = document.getElementById('categoryFilter');
                data.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.name;
                    option.textContent = category.name;
                    categoryFilter.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadPresentations() {
        try {
            const response = await fetch('/api/content?type=presentation&limit=50');
            const data = await response.json();
            
            if (data.success) {
                this.allPresentations = data.content;
                this.renderFeaturedPresentation();
                this.applyFilters();
            }
        } catch (error) {
            console.error('Error loading presentations:', error);
        }
    }

    renderFeaturedPresentation() {
        if (this.allPresentations.length === 0) return;
        
        const featured = this.allPresentations[0];
        const container = document.getElementById('featuredPresentation');
        
        container.innerHTML = `
            <div class="featured-item" data-content-id="${featured.id}">
                <div class="featured-item-header">
                    <div>
                        <div class="featured-item-title">${this.escapeHtml(featured.title)}</div>
                        <div class="featured-item-description">${this.escapeHtml(featured.description || '')}</div>
                        <div class="featured-item-meta">
                            <span><i class="fas fa-file"></i> ${this.formatFileSize(featured.file_size || 0)}</span>
                            <span><i class="fas fa-calendar"></i> ${new Date(featured.created_at).toLocaleDateString()}</span>
                            <span><i class="fas fa-tags"></i> ${featured.tags || 'presentation'}</span>
                        </div>
                    </div>
                    <div class="featured-item-thumbnail">
                        ${featured.thumbnail_url ? 
                            `<img src="${featured.thumbnail_url}" alt="${featured.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` :
                            '<i class="fas fa-presentation"></i>'
                        }
                    </div>
                </div>
            </div>
        `;

        container.querySelector('.featured-item').addEventListener('click', () => {
            this.openMediaModal(featured.id);
        });
    }

    applyFilters() {
        let filteredPresentations = [...this.allPresentations];

        // Apply search filter
        if (this.searchQuery) {
            filteredPresentations = filteredPresentations.filter(presentation => 
                presentation.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                (presentation.description && presentation.description.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                (presentation.tags && presentation.tags.toLowerCase().includes(this.searchQuery.toLowerCase()))
            );
        }

        // Apply category filter
        if (this.currentCategory) {
            filteredPresentations = filteredPresentations.filter(presentation => 
                presentation.tags && presentation.tags.toLowerCase().includes(this.currentCategory.toLowerCase())
            );
        }

        // Apply sorting
        filteredPresentations.sort((a, b) => {
            switch (this.currentSort) {
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'size':
                    return (b.file_size || 0) - (a.file_size || 0);
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        this.renderPresentations(filteredPresentations);
    }

    renderPresentations(presentations) {
        const gridContainer = document.getElementById('presentationsGrid');
        const listContainer = document.getElementById('presentationsList');

        if (presentations.length === 0) {
            const noContent = '<div class="no-content">No presentations found</div>';
            gridContainer.innerHTML = noContent;
            listContainer.innerHTML = noContent;
            return;
        }

        // Render grid view
        gridContainer.innerHTML = presentations.map(presentation => this.createPresentationCard(presentation)).join('');
        
        // Render list view
        listContainer.innerHTML = presentations.map(presentation => this.createPresentationListItem(presentation)).join('');

        // Add click listeners
        this.addClickListeners(gridContainer);
        this.addClickListeners(listContainer);
    }

    createPresentationCard(presentation) {
        const fileSize = this.formatFileSize(presentation.file_size || 0);
        const tags = presentation.tags ? presentation.tags.split(',').slice(0, 3) : ['presentation'];

        return `
            <div class="content-card" data-content-id="${presentation.id}">
                <div class="content-thumbnail">
                    ${presentation.thumbnail_url ? 
                        `<img src="${presentation.thumbnail_url}" alt="${presentation.title}">` :
                        '<i class="fas fa-presentation"></i>'
                    }
                </div>
                <div class="content-info">
                    <div class="content-title">${this.escapeHtml(presentation.title)}</div>
                    <div class="content-description">${this.escapeHtml(presentation.description || '')}</div>
                    <div class="content-meta">
                        <div class="content-stats">
                            <span class="content-stat"><i class="fas fa-file"></i> ${fileSize}</span>
                            <span class="content-stat"><i class="fas fa-calendar"></i> ${new Date(presentation.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="content-tags">
                        ${tags.map(tag => `<span class="content-tag">${tag.trim()}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    createPresentationListItem(presentation) {
        const fileSize = this.formatFileSize(presentation.file_size || 0);

        return `
            <div class="content-list-item" data-content-id="${presentation.id}">
                <div class="content-list-thumbnail">
                    ${presentation.thumbnail_url ? 
                        `<img src="${presentation.thumbnail_url}" alt="${presentation.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">` :
                        '<i class="fas fa-presentation"></i>'
                    }
                </div>
                <div class="content-list-info">
                    <div class="content-list-title">${this.escapeHtml(presentation.title)}</div>
                    <div class="content-list-description">${this.escapeHtml(presentation.description || '')}</div>
                    <div class="content-list-meta">
                        <span><i class="fas fa-file"></i> ${fileSize}</span>
                        <span><i class="fas fa-calendar"></i> ${new Date(presentation.created_at).toLocaleDateString()}</span>
                        <span><i class="fas fa-tags"></i> ${presentation.tags || 'presentation'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    addClickListeners(container) {
        container.querySelectorAll('[data-content-id]').forEach(item => {
            item.addEventListener('click', () => {
                const contentId = item.dataset.contentId;
                this.openMediaModal(contentId);
            });
        });
    }

    switchView(view) {
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Show/hide containers
        const gridContainer = document.getElementById('presentationsGrid');
        const listContainer = document.getElementById('presentationsList');

        if (view === 'grid') {
            gridContainer.style.display = 'grid';
            listContainer.style.display = 'none';
        } else {
            gridContainer.style.display = 'none';
            listContainer.style.display = 'flex';
        }
    }

    performSearch() {
        this.searchQuery = document.getElementById('searchInput').value.trim();
        this.applyFilters();
    }

    loadMoreContent() {
        console.log('Load more functionality would be implemented here');
    }

    async openMediaModal(contentId) {
        try {
            const response = await fetch(`/api/content/${contentId}`);
            const data = await response.json();
            
            if (data.success) {
                this.showMediaModal(data.content);
            }
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    showMediaModal(content) {
        const modal = document.getElementById('mediaModal');
        const title = document.getElementById('mediaTitle');
        const container = document.getElementById('mediaContainer');
        const description = document.getElementById('mediaDescription');
        const tags = document.getElementById('mediaTags');
        const meta = document.getElementById('mediaMeta');

        title.textContent = content.title;
        description.textContent = content.description || '';

        // Create modern video player
        const url = content.s3_url;
        let mediaElement = '';
        
        if (url.match(/\.(mp4|webm|ogg|mov)$/i)) {
            mediaElement = `
                <div class="video-player-container">
                    <div class="video-player">
                        <video id="videoPlayer" controls preload="metadata">
                            <source src="${url}" type="video/mp4">
                            Your browser does not support the video element.
                        </video>
                        <div class="video-overlay">
                            <div class="video-info">
                                <h3 class="video-title">${this.escapeHtml(content.title)}</h3>
                                <p class="video-subtitle">StreamHub Presentation</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            mediaElement = `
                <div class="presentation-viewer">
                    <div class="presentation-header">
                        <div class="presentation-info">
                            <h3 class="presentation-title">${this.escapeHtml(content.title)}</h3>
                            <p class="presentation-subtitle">Interactive Presentation</p>
                        </div>
                        <div class="presentation-controls">
                            <button class="presentation-btn" onclick="window.open('${url}', '_blank')">
                                <i class="fas fa-expand"></i>
                                Full Screen
                            </button>
                            <button class="presentation-btn" onclick="window.open('${url}', '_blank')">
                                <i class="fas fa-download"></i>
                                Download
                            </button>
                        </div>
                    </div>
                    <div class="presentation-frame">
                        <div class="presentation-loading" id="presentationLoading">
                            <div class="loading-spinner"></div>
                            <span>Loading presentation...</span>
                        </div>
                        <iframe src="${url}" frameborder="0" allowfullscreen onload="document.getElementById('presentationLoading').style.display='none'">
                            <p>Your browser does not support iframes. <a href="${url}" target="_blank">Open presentation</a>.</p>
                        </iframe>
                    </div>
                    <div class="presentation-footer">
                        <div class="presentation-progress">
                            <div class="progress-indicator"></div>
                        </div>
                        <div class="presentation-actions">
                            <button class="action-btn" title="Previous slide">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="action-btn" title="Next slide">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                            <button class="action-btn" title="Zoom in">
                                <i class="fas fa-search-plus"></i>
                            </button>
                            <button class="action-btn" title="Zoom out">
                                <i class="fas fa-search-minus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        container.innerHTML = mediaElement;

        // Show tags only (remove metadata)
        if (content.tags) {
            tags.innerHTML = content.tags.split(',').map(tag => 
                `<span class="media-tag">${tag.trim()}</span>`
            ).join('');
        }

        // Hide metadata section
        if (meta) {
            meta.style.display = 'none';
        }

        modal.style.display = 'block';
    }

    stopMedia() {
        const container = document.getElementById('mediaContainer');
        const video = container.querySelector('video');
        if (video) video.pause();
    }

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the presentations page
document.addEventListener('DOMContentLoaded', () => {
    new PresentationsPage();
});