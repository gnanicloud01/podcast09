// Main JavaScript for StreamHub
class StreamHub {
    constructor() {
        this.currentContent = [];
        this.currentAudio = null;
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        this.loadStats();
        this.loadRecentActivity();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Hero section buttons
        this.setupHeroButtons();

        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');

        if (searchBtn) searchBtn.addEventListener('click', () => this.performSearch());
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.performSearch();
            });
        }

        // Modal functionality
        const modal = document.getElementById('mediaModal');
        const closeBtn = modal.querySelector('.media-modal-close');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                this.stopMedia();
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                this.stopMedia();
            }
        });

        // Mobile controls
        this.setupMobileControls();

        // Handle window resize
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
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

    setupHeroButtons() {
        // Get Started button - navigate to podcasts page
        const getStartedBtn = document.querySelector('.hero-actions .btn-primary');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => {
                window.location.href = '/podcasts';
            });
        }

        // Learn More button - scroll to about section
        const learnMoreBtn = document.querySelector('.hero-actions .btn-secondary');
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => {
                const aboutSection = document.querySelector('.about-section');
                if (aboutSection) {
                    aboutSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    }

    setupMobileControls() {
        const mobileControls = document.getElementById('mobileAudioControls');
        const playBtn = document.getElementById('mobilePlayBtn');
        const prevBtn = document.getElementById('mobilePrevBtn');
        const nextBtn = document.getElementById('mobileNextBtn');
        const progressBar = document.getElementById('mobileProgressBar');
        const volumeBtn = document.getElementById('mobileVolumeBtn');
        const menuBtn = document.getElementById('mobileMenuBtn');

        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (this.currentAudio) {
                    if (this.currentAudio.paused) {
                        this.currentAudio.play();
                        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    } else {
                        this.currentAudio.pause();
                        playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    }
                }
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentAudio) {
                    this.currentAudio.currentTime = Math.max(0, this.currentAudio.currentTime - 15);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.currentAudio) {
                    this.currentAudio.currentTime = Math.min(this.currentAudio.duration, this.currentAudio.currentTime + 15);
                }
            });
        }

        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                if (this.currentAudio) {
                    const rect = progressBar.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    this.currentAudio.currentTime = percent * this.currentAudio.duration;
                }
            });
        }

        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => {
                if (this.currentAudio) {
                    this.currentAudio.muted = !this.currentAudio.muted;
                    volumeBtn.innerHTML = this.currentAudio.muted 
                        ? '<i class="fas fa-volume-mute"></i>' 
                        : '<i class="fas fa-volume-up"></i>';
                }
            });
        }

        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                // Toggle additional options or show playlist
                console.log('Menu clicked - can add playlist or options here');
            });
        }
    }

    updateMobileControls(content) {
        const mobileControls = document.getElementById('mobileAudioControls');
        const titleEl = document.getElementById('mobileAudioTitle');
        const artistEl = document.getElementById('mobileAudioArtist');

        if (this.isMobile && content.type === 'podcast') {
            if (titleEl) titleEl.textContent = content.title;
            if (artistEl) artistEl.textContent = 'GT Sounds';
            mobileControls.classList.add('active');
        } else {
            mobileControls.classList.remove('active');
        }
    }

    updateMobileProgress() {
        if (!this.currentAudio || !this.isMobile) return;

        const currentTimeEl = document.getElementById('mobileCurrentTime');
        const durationEl = document.getElementById('mobileDuration');
        const progressFill = document.getElementById('mobileProgressFill');

        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(this.currentAudio.currentTime);
        }
        if (durationEl && !isNaN(this.currentAudio.duration)) {
            durationEl.textContent = this.formatTime(this.currentAudio.duration);
        }
        if (progressFill && !isNaN(this.currentAudio.duration)) {
            const percent = (this.currentAudio.currentTime / this.currentAudio.duration) * 100;
            progressFill.style.width = percent + '%';
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                <audio controls id="currentAudio">
                    <source src="${url}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            `;
        } else if (content.type === 'presentation' || url.match(/\.(mp4|webm|ogg|mov)$/i)) {
            mediaElement = `
                <video controls id="currentVideo">
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

        // Setup audio/video event listeners
        const audio = container.querySelector('audio');
        const video = container.querySelector('video');
        
        if (audio) {
            this.currentAudio = audio;
            this.setupMediaEventListeners(audio, content);
            this.updateMobileControls(content);
        } else if (video) {
            this.currentAudio = video;
            this.setupMediaEventListeners(video, content);
        }
    }

    setupMediaEventListeners(media, content) {
        media.addEventListener('play', () => {
            const playBtn = document.getElementById('mobilePlayBtn');
            if (playBtn) playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        });

        media.addEventListener('pause', () => {
            const playBtn = document.getElementById('mobilePlayBtn');
            if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
        });

        media.addEventListener('timeupdate', () => {
            this.updateMobileProgress();
        });

        media.addEventListener('loadedmetadata', () => {
            this.updateMobileProgress();
        });

        media.addEventListener('ended', () => {
            const playBtn = document.getElementById('mobilePlayBtn');
            if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
            
            const progressFill = document.getElementById('mobileProgressFill');
            if (progressFill) progressFill.style.width = '0%';
        });
    }

    stopMedia() {
        const container = document.getElementById('mediaContainer');
        const audio = container.querySelector('audio');
        const video = container.querySelector('video');

        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
        if (video) {
            video.pause();
            video.currentTime = 0;
        }

        // Hide mobile controls
        const mobileControls = document.getElementById('mobileAudioControls');
        if (mobileControls) {
            mobileControls.classList.remove('active');
        }

        // Reset mobile controls
        const playBtn = document.getElementById('mobilePlayBtn');
        const progressFill = document.getElementById('mobileProgressFill');
        if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
        if (progressFill) progressFill.style.width = '0%';

        this.currentAudio = null;
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