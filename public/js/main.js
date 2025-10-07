// Main JavaScript for StreamHub
class StreamHub {
    constructor() {
        this.currentContent = [];
        this.init();
    }

    init() {
        this.loadStats();
        this.loadRecentActivity();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        searchBtn.addEventListener('click', () => this.performSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
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

        // Smooth scrolling for navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(link.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }

    async loadStats() {
        try {
            const [podcastStats, presentationStats, documentStats] = await Promise.all([
                fetch('/api/stats/podcast').then(r => r.json()),
                fetch('/api/stats/presentation').then(r => r.json()),
                fetch('/api/stats/document').then(r => r.json())
            ]);

            // Update feature cards with stats
            const podcastCount = document.getElementById('podcast-count');
            const presentationCount = document.getElementById('presentation-count');
            const documentCount = document.getElementById('document-count');

            if (podcastCount) podcastCount.textContent = podcastStats.stats?.total_count || 0;
            if (presentationCount) presentationCount.textContent = presentationStats.stats?.total_count || 0;
            if (documentCount) documentCount.textContent = documentStats.stats?.total_count || 0;
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadRecentActivity() {
        try {
            const response = await fetch('/api/content?limit=5');
            const data = await response.json();
            
            if (data.success) {
                this.renderRecentActivity(data.content);
            }
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    renderRecentActivity(content) {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        if (!content || content.length === 0) {
            container.innerHTML = '<p class="no-content">No recent activity</p>';
            return;
        }

        const typeIcons = {
            podcast: 'fa-podcast',
            presentation: 'fa-presentation',
            document: 'fa-file-alt'
        };

        container.innerHTML = content.map(item => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${typeIcons[item.type] || 'fa-file'}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">New ${item.type}: ${this.escapeHtml(item.title)}</div>
                    <div class="activity-meta">Added ${new Date(item.created_at).toLocaleDateString()}</div>
                </div>
            </div>
        `).join('');
    }

    async loadContentByType() {
        const types = ['podcast', 'presentation', 'document'];
        
        for (const type of types) {
            try {
                const response = await fetch(`/api/content?type=${type}&limit=12`);
                const data = await response.json();
                
                if (data.success) {
                    this.renderContent(data.content, `${type}sGrid`);
                }
            } catch (error) {
                console.error(`Error loading ${type} content:`, error);
            }
        }
    }

    async performSearch() {
        const searchTerm = document.getElementById('searchInput').value.trim();
        if (!searchTerm) return;

        try {
            const response = await fetch(`/api/content?search=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            
            if (data.success) {
                // Clear all grids and show search results
                this.clearAllGrids();
                this.renderContent(data.content, 'featuredContent');
                
                // Scroll to results
                document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Error performing search:', error);
        }
    }

    clearAllGrids() {
        const grids = ['podcastsGrid', 'presentationsGrid', 'documentsGrid', 'podcastsContent'];
        grids.forEach(gridId => {
            const grid = document.getElementById(gridId);
            if (grid) grid.innerHTML = '';
        });
    }

    renderContent(content, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!content || content.length === 0) {
            container.innerHTML = '<p class="no-content">No content available</p>';
            return;
        }

        // Special handling for podcasts section to show featured item
        if (containerId === 'podcastsGrid' && content.length > 0) {
            const featuredContent = content[0];
            const podcastsContent = document.getElementById('podcastsContent');
            if (podcastsContent) {
                podcastsContent.innerHTML = this.createFeaturedItem(featuredContent);
                podcastsContent.querySelector('.featured-item').addEventListener('click', () => {
                    this.openMediaModal(featuredContent.id);
                });
            }
            // Show remaining content in grid
            content = content.slice(1);
        }

        container.innerHTML = content.map(item => this.createContentCard(item)).join('');
        
        // Add click listeners to cards
        container.querySelectorAll('.content-card').forEach(card => {
            card.addEventListener('click', () => {
                const contentId = card.dataset.contentId;
                this.openMediaModal(contentId);
            });
        });
    }

    createFeaturedItem(item) {
        const duration = item.duration ? this.formatDuration(item.duration) : '';
        const views = Math.floor(Math.random() * 1000) + 50; // Mock views
        
        return `
            <div class="featured-item" data-content-id="${item.id}">
                <div class="featured-header">
                    <div>
                        <div class="featured-title">${this.escapeHtml(item.title)}</div>
                        <div class="featured-description">${this.escapeHtml(item.description || '')}</div>
                    </div>
                </div>
                <div class="featured-meta">
                    <span><i class="fas fa-clock"></i> ${duration || '5 min'}</span>
                    <span><i class="fas fa-eye"></i> ${views} views</span>
                    <span>${item.tags || 'web development, javascript, tutorial'}</span>
                </div>
            </div>
        `;
    }

    createContentCard(item) {
        const typeIcons = {
            podcast: 'fas fa-podcast',
            presentation: 'fas fa-presentation',
            document: 'fas fa-file-alt'
        };

        const thumbnail = item.thumbnail_url 
            ? `<img src="${item.thumbnail_url}" alt="${item.title}">`
            : `<i class="${typeIcons[item.type] || 'fas fa-file'}"></i>`;

        const duration = item.duration ? this.formatDuration(item.duration) : '';
        const fileSize = item.file_size ? this.formatFileSize(item.file_size) : '';
        const views = Math.floor(Math.random() * 500) + 25; // Mock views
        const pages = item.type === 'presentation' ? Math.floor(Math.random() * 50) + 10 : null;

        const tags = item.tags ? item.tags.split(',').slice(0, 3) : ['react', 'frontend', 'best practices'];

        return `
            <div class="content-card" data-content-id="${item.id}">
                <div class="content-thumbnail">
                    ${thumbnail}
                </div>
                <div class="content-info">
                    <div class="content-title">${this.escapeHtml(item.title)}</div>
                    <div class="content-description">${this.escapeHtml(item.description || '')}</div>
                    <div class="content-meta">
                        <div class="content-stats">
                            ${duration ? `<span class="content-stat"><i class="fas fa-clock"></i> ${duration}</span>` : ''}
                            ${pages ? `<span class="content-stat"><i class="fas fa-file"></i> ${pages} pages</span>` : ''}
                            ${fileSize ? `<span class="content-stat"><i class="fas fa-download"></i> ${fileSize}</span>` : ''}
                            <span class="content-stat"><i class="fas fa-eye"></i> ${views} views</span>
                        </div>
                    </div>
                    <div class="content-tags">
                        ${tags.map(tag => `<span class="content-tag">${tag.trim()}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    async openMediaModal(contentId) {
        try {
            const response = await fetch(`/api/content/${contentId}`);
            const data = await response.json();
            
            if (data.success) {
                const content = data.content;
                this.showMediaModal(content);
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

        title.textContent = content.title;
        description.textContent = content.description || '';

        // Create appropriate media element based on content type and URL
        let mediaElement = '';
        const url = content.s3_url;
        
        if (content.type === 'podcast' || url.match(/\.(mp3|wav|ogg|m4a)$/i)) {
            mediaElement = `
                <audio controls>
                    <source src="${url}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            `;
        } else if (content.type === 'presentation' || url.match(/\.(mp4|webm|ogg|mov)$/i)) {
            mediaElement = `
                <video controls>
                    <source src="${url}" type="video/mp4">
                    Your browser does not support the video element.
                </video>
            `;
        } else if (url.match(/\.(pdf)$/i)) {
            mediaElement = `
                <iframe src="${url}" frameborder="0">
                    <p>Your browser does not support PDFs. <a href="${url}">Download the PDF</a>.</p>
                </iframe>
            `;
        } else {
            mediaElement = `
                <div class="media-link">
                    <a href="${url}" target="_blank" class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i>
                        Open Content
                    </a>
                </div>
            `;
        }

        container.innerHTML = mediaElement;
        modal.style.display = 'block';
    }

    stopMedia() {
        const container = document.getElementById('mediaContainer');
        const audio = container.querySelector('audio');
        const video = container.querySelector('video');
        
        if (audio) audio.pause();
        if (video) video.pause();
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StreamHub();
});