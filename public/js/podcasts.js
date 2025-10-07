// Podcasts Page JavaScript
class PodcastsPage {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 12;

        this.currentSort = 'newest';
        this.currentCategory = '';
        this.searchQuery = '';
        this.allPodcasts = [];
        this.currentPlaylist = [];
        this.currentTrackIndex = 0;
        this.isShuffled = false;
        this.isSubscribed = false;
        this.currentTrack = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStats();
        this.loadCategories();
        this.loadPodcasts();
    }

    setupEventListeners() {
        try {
            // Search functionality
            const searchBtn = document.getElementById('searchBtn');
            const searchInput = document.getElementById('searchInput');
            
            if (searchBtn && searchInput) {
                searchBtn.addEventListener('click', () => this.performSearch());
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.performSearch();
                });
                console.log('Search listeners added');
            } else {
                console.error('Search elements not found');
            }

            // Filters
            const sortFilter = document.getElementById('sortFilter');
            const categoryFilter = document.getElementById('categoryFilter');
            
            if (sortFilter) {
                sortFilter.addEventListener('change', (e) => {
                    this.currentSort = e.target.value;
                    this.applyFilters();
                });
                console.log('Sort filter listener added');
            }

            if (categoryFilter) {
                categoryFilter.addEventListener('change', (e) => {
                    this.currentCategory = e.target.value;
                    this.applyFilters();
                });
                console.log('Category filter listener added');
            }



            // Load more
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', () => {
                    this.loadMoreContent();
                });
                console.log('Load more listener added');
            }

            // Header buttons
            this.setupHeaderButtons();

            // Bottom player functionality
            this.setupBottomPlayer();
            
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    async loadStats() {
        // Stats removed from header, no longer needed
        console.log('Stats section removed from header');
    }

    async loadCategories() {
        try {
            const response = await fetch('/admin/categories?type=podcast');
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

    async loadPodcasts() {
        try {
            console.log('Loading podcasts...');
            
            // Show loading state
            const gridContainer = document.getElementById('podcastsGrid');
            if (gridContainer) {
                gridContainer.innerHTML = `
                    <div class="loading-podcasts">
                        <i class="fas fa-spinner fa-spin"></i>
                        Loading podcasts...
                    </div>
                `;
            }
            
            const response = await fetch('/api/content?type=podcast&limit=50');
            const data = await response.json();
            
            console.log('Podcasts response:', data);
            
            if (data.success && data.content) {
                this.allPodcasts = data.content;
                console.log('Loaded', this.allPodcasts.length, 'podcasts:', this.allPodcasts);
                
                // Render featured section
                this.renderFeaturedPodcast();
                
                // Apply filters and render main content
                this.applyFilters();
                
                // If still no content after filters, show debug info
                if (this.allPodcasts.length === 0) {
                    this.showEmptyState('No podcasts found in database');
                }
            } else {
                console.error('Failed to load podcasts:', data.message || 'Unknown error');
                this.showEmptyState('Failed to load podcasts from server');
            }
        } catch (error) {
            console.error('Error loading podcasts:', error);
            this.showEmptyState('Network error loading podcasts');
        }
    }

    renderFeaturedPodcast() {
        if (this.allPodcasts.length === 0) return;
        
        const container = document.getElementById('featuredPodcast');
        
        // Create a playlist-style featured section
        container.innerHTML = `
            <div class="podcasts-playlist">
                <div class="playlist-header">
                    <div class="playlist-title">Latest Episodes</div>
                    <div class="playlist-subtitle">${this.allPodcasts.length} episodes available</div>
                </div>
                <div class="playlist-items">
                    ${this.allPodcasts.slice(0, 5).map((podcast, index) => {
                        // Get duration from database or estimate from audio
                        let duration = podcast.duration || 0;
                        
                        // If no duration in database, show placeholder and load from audio
                        if (!duration) {
                            this.loadAudioDuration(podcast.s3_url, podcast.id);
                            duration = 0; // Will be updated when audio loads
                        }
                        
                        return `
                            <div class="playlist-item" data-content-id="${podcast.id}">
                                <div class="playlist-number">${index + 1}</div>
                                <div class="playlist-thumbnail">
                                    ${podcast.thumbnail_url ? 
                                        `<img src="${podcast.thumbnail_url}" alt="${podcast.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">` :
                                        '<i class="fas fa-podcast"></i>'
                                    }
                                </div>
                                <div class="playlist-info">
                                    <div class="playlist-track-title">${this.escapeHtml(podcast.title)}</div>
                                    <div class="playlist-track-meta">${new Date(podcast.created_at).toLocaleDateString()} • ${podcast.tags || 'Podcast'}</div>
                                </div>
                                <div class="playlist-duration" id="duration-${podcast.id}">
                                    ${duration > 0 ? this.formatDuration(duration) : 'Loading...'}
                                </div>
                                <button class="playlist-play-btn">
                                    <i class="fas fa-play"></i>
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // Add click listeners to playlist items
        container.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                const contentId = item.dataset.contentId;
                this.playPodcast(contentId);
            });
        });
    }

    applyFilters() {
        console.log('Applying filters to', this.allPodcasts.length, 'podcasts');
        let filteredPodcasts = [...this.allPodcasts];

        // Apply search filter
        if (this.searchQuery) {
            filteredPodcasts = filteredPodcasts.filter(podcast => 
                podcast.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                (podcast.description && podcast.description.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                (podcast.tags && podcast.tags.toLowerCase().includes(this.searchQuery.toLowerCase()))
            );
        }

        // Apply category filter
        if (this.currentCategory) {
            filteredPodcasts = filteredPodcasts.filter(podcast => 
                podcast.tags && podcast.tags.toLowerCase().includes(this.currentCategory.toLowerCase())
            );
        }

        // Apply sorting
        filteredPodcasts.sort((a, b) => {
            switch (this.currentSort) {
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'duration':
                    return (b.duration || 0) - (a.duration || 0);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'popular':
                    return a.title.length - b.title.length;
                default:
                    return 0;
            }
        });

        console.log('Filtered podcasts:', filteredPodcasts.length);
        this.renderPodcasts(filteredPodcasts);
    }

    renderPodcasts(podcasts) {
        console.log('Rendering', podcasts.length, 'podcasts');
        const gridContainer = document.getElementById('podcastsGrid');

        if (!gridContainer) {
            console.error('Grid container not found');
            return;
        }

        if (podcasts.length === 0) {
            this.showEmptyState('No podcasts found');
            return;
        }

        // Render grid view
        gridContainer.innerHTML = podcasts.map(podcast => this.createPodcastCard(podcast)).join('');
        this.addClickListeners(gridContainer);

        console.log('Podcasts rendered successfully');
    }



    showEmptyState(message) {
        const gridContainer = document.getElementById('podcastsGrid');
        
        const emptyHTML = `
            <div class="empty-state">
                <i class="fas fa-podcast"></i>
                <h3>No Podcasts Available</h3>
                <p>${message}</p>
                <div class="debug-info">
                    Debug: Total podcasts loaded: ${this.allPodcasts.length}<br>
                    Current search: "${this.searchQuery}"<br>
                    Current category: "${this.currentCategory}"<br>
                    Current sort: "${this.currentSort}"
                </div>
            </div>
        `;
        
        if (gridContainer) {
            gridContainer.innerHTML = emptyHTML;
            console.log('Empty state shown in grid container');
        }
    }

    createPodcastCard(podcast) {
        const duration = this.formatDuration(podcast.duration || 0);
        const tags = podcast.tags ? podcast.tags.split(',').slice(0, 3) : ['podcast'];

        return `
            <div class="content-card" data-content-id="${podcast.id}">
                <div class="content-thumbnail">
                    ${podcast.thumbnail_url ? 
                        `<img src="${podcast.thumbnail_url}" alt="${podcast.title}">` :
                        '<i class="fas fa-podcast"></i>'
                    }
                </div>
                <div class="content-info">
                    <div class="content-title">${this.escapeHtml(podcast.title)}</div>
                    <div class="content-description">${this.escapeHtml(podcast.description || '')}</div>
                    <div class="content-meta">
                        <div class="content-stats">
                            <span class="content-stat"><i class="fas fa-clock"></i> ${duration}</span>
                            <span class="content-stat"><i class="fas fa-calendar"></i> ${new Date(podcast.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="content-tags">
                        ${tags.map(tag => `<span class="content-tag">${tag.trim()}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    createPodcastListItem(podcast) {
        const duration = this.formatDuration(podcast.duration || 0);

        return `
            <div class="content-list-item" data-content-id="${podcast.id}">
                <div class="content-list-thumbnail">
                    ${podcast.thumbnail_url ? 
                        `<img src="${podcast.thumbnail_url}" alt="${podcast.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">` :
                        '<i class="fas fa-podcast"></i>'
                    }
                </div>
                <div class="content-list-info">
                    <div class="content-list-title">${this.escapeHtml(podcast.title)}</div>
                    <div class="content-list-description">${this.escapeHtml(podcast.description || '')}</div>
                    <div class="content-list-meta">
                        <span><i class="fas fa-clock"></i> ${duration}</span>
                        <span><i class="fas fa-calendar"></i> ${new Date(podcast.created_at).toLocaleDateString()}</span>
                        <span><i class="fas fa-tags"></i> ${podcast.tags || 'podcast'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    addClickListeners(container) {
        container.querySelectorAll('[data-content-id]').forEach(item => {
            item.addEventListener('click', () => {
                const contentId = item.dataset.contentId;
                this.playPodcast(contentId);
            });
        });
    }



    performSearch() {
        this.searchQuery = document.getElementById('searchInput').value.trim();
        this.currentPage = 1; // Reset to first page
        this.applyFilters();
        
        // Show search results message
        if (this.searchQuery) {
            this.showSearchMessage(`Showing results for "${this.searchQuery}"`);
        } else {
            this.hideSearchMessage();
        }
    }

    showSearchMessage(message) {
        let messageEl = document.getElementById('searchMessage');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'searchMessage';
            messageEl.className = 'search-message';
            document.querySelector('.content-section .container').insertBefore(
                messageEl, 
                document.querySelector('.section-header').nextSibling
            );
        }
        messageEl.textContent = message;
        messageEl.style.display = 'block';
    }

    hideSearchMessage() {
        const messageEl = document.getElementById('searchMessage');
        if (messageEl) {
            messageEl.style.display = 'none';
        }
    }

    loadMoreContent() {
        // This would typically load more content from the server
        // For now, we'll just show all content
        console.log('Load more functionality would be implemented here');
    }

    async playPodcast(contentId) {
        try {
            const response = await fetch(`/api/content/${contentId}`);
            const data = await response.json();
            
            if (data.success) {
                this.loadTrackInBottomPlayer(data.content);
            }
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    loadTrackInBottomPlayer(content) {
        console.log('Loading track in bottom player:', content.title);
        
        const bottomPlayer = document.getElementById('bottomMusicPlayer');
        const trackImage = document.getElementById('playerTrackImage');
        const trackPlaceholder = document.getElementById('playerTrackPlaceholder');
        const trackName = document.getElementById('playerTrackName');
        const trackArtist = document.getElementById('playerTrackArtist');
        const audioPlayer = document.getElementById('globalAudioPlayer');
        const currentTimeEl = document.getElementById('playerCurrentTime');
        const totalTimeEl = document.getElementById('playerTotalTime');
        const progressFill = document.getElementById('playerProgressFill');
        const progressHandle = document.getElementById('playerProgressHandle');

        if (!audioPlayer) {
            console.error('Audio player not found');
            return;
        }

        // Reset player state
        if (progressFill) progressFill.style.width = '0%';
        if (progressHandle) progressHandle.style.left = '0%';
        if (currentTimeEl) currentTimeEl.textContent = '0:00';
        if (totalTimeEl) totalTimeEl.textContent = '0:00';

        // Update track info
        if (trackName) trackName.textContent = content.title;
        if (trackArtist) trackArtist.textContent = 'StreamHub Podcast';

        // Update track image
        if (content.thumbnail_url && trackImage && trackPlaceholder) {
            trackImage.src = content.thumbnail_url;
            trackImage.style.display = 'block';
            trackPlaceholder.style.display = 'none';
        } else if (trackImage && trackPlaceholder) {
            trackImage.style.display = 'none';
            trackPlaceholder.style.display = 'flex';
        }

        // Load audio with proper error handling
        audioPlayer.src = content.s3_url;
        audioPlayer.load(); // Force reload
        
        // Store current track data
        this.currentTrack = content;

        // Show bottom player
        if (bottomPlayer) {
            bottomPlayer.classList.add('active');
        }

        // Wait for metadata to load before playing
        const playWhenReady = () => {
            audioPlayer.play().then(() => {
                console.log('Audio started playing successfully');
            }).catch(e => {
                console.log('Auto-play prevented or failed:', e);
                this.showNotification('Click play to start audio', 'info');
            });
        };

        if (audioPlayer.readyState >= 1) {
            // Metadata already loaded
            playWhenReady();
        } else {
            // Wait for metadata
            audioPlayer.addEventListener('loadedmetadata', playWhenReady, { once: true });
        }
    }

    setupBottomPlayer() {
        const audioPlayer = document.getElementById('globalAudioPlayer');
        const playBtn = document.getElementById('playerPlayBtn');
        const prevBtn = document.getElementById('playerPrevBtn');
        const nextBtn = document.getElementById('playerNextBtn');
        const shuffleBtn = document.getElementById('playerShuffleBtn');
        const repeatBtn = document.getElementById('playerRepeatBtn');
        const likeBtn = document.getElementById('playerLikeBtn');
        const volumeBtn = document.getElementById('playerVolumeBtn');
        const progressBar = document.getElementById('playerProgressBar');
        const progressFill = document.getElementById('playerProgressFill');
        const progressHandle = document.getElementById('playerProgressHandle');
        const currentTimeEl = document.getElementById('playerCurrentTime');
        const totalTimeEl = document.getElementById('playerTotalTime');
        const volumeBar = document.querySelector('.volume-bar');
        const volumeFill = document.getElementById('playerVolumeFill');
        const volumeHandle = document.getElementById('playerVolumeHandle');

        if (!audioPlayer) {
            console.error('Audio player not found');
            return;
        }

        let isPlaying = false;
        let isDragging = false;
        let isVolumeDragging = false;

        // Play/Pause functionality
        const togglePlay = () => {
            if (!audioPlayer.src) {
                this.showNotification('No track loaded', 'warning');
                return;
            }
            
            if (isPlaying) {
                audioPlayer.pause();
            } else {
                audioPlayer.play().catch(e => {
                    console.error('Play failed:', e);
                    this.showNotification('Failed to play audio', 'error');
                });
            }
        };

        if (playBtn) {
            playBtn.addEventListener('click', togglePlay);
        }

        // Audio events
        audioPlayer.addEventListener('play', () => {
            isPlaying = true;
            if (playBtn) playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            console.log('Audio started playing');
        });

        audioPlayer.addEventListener('pause', () => {
            isPlaying = false;
            if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
            console.log('Audio paused');
        });

        audioPlayer.addEventListener('timeupdate', () => {
            if (!isDragging && audioPlayer.duration && !isNaN(audioPlayer.duration)) {
                const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                if (progressFill) progressFill.style.width = progress + '%';
                if (progressHandle) progressHandle.style.left = progress + '%';
                if (currentTimeEl) currentTimeEl.textContent = this.formatDuration(audioPlayer.currentTime);
            }
        });

        audioPlayer.addEventListener('loadedmetadata', () => {
            console.log('Audio metadata loaded, duration:', audioPlayer.duration);
            if (totalTimeEl && audioPlayer.duration && !isNaN(audioPlayer.duration)) {
                totalTimeEl.textContent = this.formatDuration(audioPlayer.duration);
            }
        });

        audioPlayer.addEventListener('loadeddata', () => {
            console.log('Audio data loaded');
            if (totalTimeEl && audioPlayer.duration && !isNaN(audioPlayer.duration)) {
                totalTimeEl.textContent = this.formatDuration(audioPlayer.duration);
            }
        });

        audioPlayer.addEventListener('canplay', () => {
            console.log('Audio can start playing');
        });

        audioPlayer.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.showNotification('Audio playback error', 'error');
        });

        audioPlayer.addEventListener('ended', () => {
            isPlaying = false;
            if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
            if (progressFill) progressFill.style.width = '0%';
            if (progressHandle) progressHandle.style.left = '0%';
            if (currentTimeEl) currentTimeEl.textContent = '0:00';
            
            // Auto-play next track if in playlist
            if (this.currentPlaylist.length > 0) {
                this.playNextTrack();
            }
        });

        // Progress bar interaction
        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
                    const rect = progressBar.getBoundingClientRect();
                    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    audioPlayer.currentTime = percent * audioPlayer.duration;
                    console.log('Seeking to:', percent * 100 + '%');
                }
            });

            // Progress bar drag functionality
            if (progressHandle) {
                progressHandle.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    e.preventDefault();
                });
            }

            document.addEventListener('mousemove', (e) => {
                if (isDragging && audioPlayer.duration) {
                    const rect = progressBar.getBoundingClientRect();
                    let percent = (e.clientX - rect.left) / rect.width;
                    percent = Math.max(0, Math.min(1, percent));
                    
                    if (progressFill) progressFill.style.width = percent * 100 + '%';
                    if (progressHandle) progressHandle.style.left = percent * 100 + '%';
                    if (currentTimeEl) currentTimeEl.textContent = this.formatDuration(percent * audioPlayer.duration);
                }
            });

            document.addEventListener('mouseup', () => {
                if (isDragging && audioPlayer.duration) {
                    const percent = parseFloat(progressHandle.style.left) / 100;
                    audioPlayer.currentTime = percent * audioPlayer.duration;
                    isDragging = false;
                }
            });
        }

        // Volume control
        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => {
                if (audioPlayer.volume > 0) {
                    audioPlayer.volume = 0;
                    if (volumeFill) volumeFill.style.width = '0%';
                    if (volumeHandle) volumeHandle.style.right = '100%';
                    volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                } else {
                    audioPlayer.volume = 1;
                    if (volumeFill) volumeFill.style.width = '100%';
                    if (volumeHandle) volumeHandle.style.right = '0%';
                    volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                }
            });
        }

        if (volumeBar) {
            volumeBar.addEventListener('click', (e) => {
                const rect = volumeBar.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                audioPlayer.volume = percent;
                
                if (volumeFill) volumeFill.style.width = percent * 100 + '%';
                if (volumeHandle) volumeHandle.style.right = (100 - percent * 100) + '%';
                
                if (volumeBtn) {
                    if (percent === 0) {
                        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                    } else if (percent < 0.5) {
                        volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
                    } else {
                        volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                    }
                }
            });
        }

        // Like button
        likeBtn.addEventListener('click', () => {
            likeBtn.classList.toggle('liked');
            const icon = likeBtn.querySelector('i');
            if (likeBtn.classList.contains('liked')) {
                icon.className = 'fas fa-heart';
            } else {
                icon.className = 'far fa-heart';
            }
        });

        // Shuffle and repeat buttons
        shuffleBtn.addEventListener('click', () => {
            shuffleBtn.classList.toggle('active');
        });

        repeatBtn.addEventListener('click', () => {
            repeatBtn.classList.toggle('active');
        });

        // Previous/Next buttons
        prevBtn.addEventListener('click', () => {
            this.playPreviousTrack();
        });

        nextBtn.addEventListener('click', () => {
            this.playNextTrack();
        });

        // Auto-play next track when current ends
        audioPlayer.addEventListener('ended', () => {
            if (this.currentPlaylist.length > 0) {
                this.playNextTrack();
            }
        });
    }

    stopMedia() {
        const audio = document.getElementById('globalAudioPlayer');
        const bottomPlayer = document.getElementById('bottomMusicPlayer');
        
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
        
        if (bottomPlayer) {
            bottomPlayer.classList.remove('active');
        }
    }

    formatDuration(seconds) {
        if (!seconds || isNaN(seconds) || seconds <= 0) return '0:00';
        
        const totalSeconds = Math.floor(seconds);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    setupHeaderButtons() {
        try {
            // Play All button
            const playAllBtn = document.querySelector('.header-btn:not(.secondary)');
            if (playAllBtn) {
                playAllBtn.addEventListener('click', () => {
                    this.playAllPodcasts();
                });
                console.log('Play All button listener added');
            }

            // Shuffle button
            const shuffleBtn = document.querySelector('.header-btn.secondary:first-of-type');
            if (shuffleBtn) {
                shuffleBtn.addEventListener('click', () => {
                    this.toggleShuffle();
                });
                console.log('Shuffle button listener added');
            }

            // Subscribe button
            const subscribeBtn = document.querySelector('.header-btn.secondary:last-of-type');
            if (subscribeBtn) {
                subscribeBtn.addEventListener('click', () => {
                    this.toggleSubscription();
                });
                console.log('Subscribe button listener added');
            }
        } catch (error) {
            console.error('Error setting up header buttons:', error);
        }
    }

    playAllPodcasts() {
        if (this.allPodcasts.length === 0) {
            this.showNotification('No podcasts available to play', 'warning');
            return;
        }

        // Create playlist from current filtered podcasts
        let filteredPodcasts = this.getFilteredPodcasts();
        
        if (filteredPodcasts.length === 0) {
            this.showNotification('No podcasts match current filters', 'warning');
            return;
        }

        // Start playing first podcast
        this.currentPlaylist = filteredPodcasts;
        this.currentTrackIndex = 0;
        this.playPodcast(filteredPodcasts[0].id);
        
        this.showNotification(`Playing all ${filteredPodcasts.length} podcasts`, 'success');
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        const shuffleBtn = document.querySelector('.header-btn.secondary:first-of-type');
        
        if (this.isShuffled) {
            shuffleBtn.classList.add('active');
            shuffleBtn.style.background = '#667eea';
            shuffleBtn.style.color = 'white';
            this.showNotification('Shuffle enabled', 'info');
        } else {
            shuffleBtn.classList.remove('active');
            shuffleBtn.style.background = 'transparent';
            shuffleBtn.style.color = '#b3b3b3';
            this.showNotification('Shuffle disabled', 'info');
        }
    }

    toggleSubscription() {
        this.isSubscribed = !this.isSubscribed;
        const subscribeBtn = document.querySelector('.header-btn.secondary:last-of-type');
        const icon = subscribeBtn.querySelector('i');
        
        if (this.isSubscribed) {
            subscribeBtn.classList.add('subscribed');
            subscribeBtn.style.background = '#667eea';
            subscribeBtn.style.color = 'white';
            icon.className = 'fas fa-bell';
            subscribeBtn.innerHTML = '<i class="fas fa-bell"></i> Subscribed';
            this.showNotification('Subscribed to podcast updates!', 'success');
        } else {
            subscribeBtn.classList.remove('subscribed');
            subscribeBtn.style.background = 'transparent';
            subscribeBtn.style.color = '#b3b3b3';
            icon.className = 'far fa-bell';
            subscribeBtn.innerHTML = '<i class="far fa-bell"></i> Subscribe';
            this.showNotification('Unsubscribed from updates', 'info');
        }
    }

    getFilteredPodcasts() {
        let filteredPodcasts = [...this.allPodcasts];

        // Apply search filter
        if (this.searchQuery) {
            filteredPodcasts = filteredPodcasts.filter(podcast => 
                podcast.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                (podcast.description && podcast.description.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                (podcast.tags && podcast.tags.toLowerCase().includes(this.searchQuery.toLowerCase()))
            );
        }

        // Apply category filter
        if (this.currentCategory) {
            filteredPodcasts = filteredPodcasts.filter(podcast => 
                podcast.tags && podcast.tags.toLowerCase().includes(this.currentCategory.toLowerCase())
            );
        }

        // Apply sorting
        filteredPodcasts.sort((a, b) => {
            switch (this.currentSort) {
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'duration':
                    return (b.duration || 0) - (a.duration || 0);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'popular':
                    // Mock popularity based on title length (shorter = more popular)
                    return a.title.length - b.title.length;
                default:
                    return 0;
            }
        });

        return filteredPodcasts;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    playNextTrack() {
        if (this.currentPlaylist.length === 0) {
            this.showNotification('No playlist available', 'warning');
            return;
        }

        if (this.isShuffled) {
            // Play random track
            this.currentTrackIndex = Math.floor(Math.random() * this.currentPlaylist.length);
        } else {
            // Play next track in order
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.currentPlaylist.length;
        }

        const nextTrack = this.currentPlaylist[this.currentTrackIndex];
        this.loadTrackInBottomPlayer(nextTrack);
    }

    playPreviousTrack() {
        if (this.currentPlaylist.length === 0) {
            this.showNotification('No playlist available', 'warning');
            return;
        }

        if (this.isShuffled) {
            // Play random track
            this.currentTrackIndex = Math.floor(Math.random() * this.currentPlaylist.length);
        } else {
            // Play previous track in order
            this.currentTrackIndex = this.currentTrackIndex === 0 
                ? this.currentPlaylist.length - 1 
                : this.currentTrackIndex - 1;
        }

        const prevTrack = this.currentPlaylist[this.currentTrackIndex];
        this.loadTrackInBottomPlayer(prevTrack);
    }

    loadMoreContent() {
        this.currentPage++;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        
        const filteredPodcasts = this.getFilteredPodcasts();
        const newPodcasts = filteredPodcasts.slice(startIndex, endIndex);
        
        if (newPodcasts.length === 0) {
            this.showNotification('No more podcasts to load', 'info');
            return;
        }
        
        // Append new podcasts to existing grid
        const gridContainer = document.getElementById('podcastsGrid');
        const listContainer = document.getElementById('podcastsList');
        
        const newGridHTML = newPodcasts.map(podcast => this.createPodcastCard(podcast)).join('');
        const newListHTML = newPodcasts.map(podcast => this.createPodcastListItem(podcast)).join('');
        
        gridContainer.innerHTML += newGridHTML;
        listContainer.innerHTML += newListHTML;
        
        // Add click listeners to new items
        this.addClickListeners(gridContainer);
        this.addClickListeners(listContainer);
        
        this.showNotification(`Loaded ${newPodcasts.length} more podcasts`, 'success');
    }

    loadAudioDuration(audioUrl, podcastId) {
        const audio = new Audio();
        audio.preload = 'metadata';
        
        audio.addEventListener('loadedmetadata', () => {
            const duration = audio.duration;
            if (duration && !isNaN(duration)) {
                const durationEl = document.getElementById(`duration-${podcastId}`);
                if (durationEl) {
                    durationEl.textContent = this.formatDuration(duration);
                }
                
                // Update the podcast data
                const podcast = this.allPodcasts.find(p => p.id == podcastId);
                if (podcast) {
                    podcast.duration = duration;
                }
            }
        });
        
        audio.addEventListener('error', () => {
            const durationEl = document.getElementById(`duration-${podcastId}`);
            if (durationEl) {
                durationEl.textContent = '--:--';
            }
        });
        
        audio.src = audioUrl;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the podcasts page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing PodcastsPage...');
    
    // Check if required elements exist
    const requiredElements = [
        'searchBtn', 'searchInput', 'sortFilter', 'categoryFilter', 
        'podcastsGrid', 'featuredPodcast', 'bottomMusicPlayer'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
    } else {
        console.log('All required elements found, initializing...');
    }
    
    try {
        new PodcastsPage();
        console.log('PodcastsPage initialized successfully');
    } catch (error) {
        console.error('Error initializing PodcastsPage:', error);
    }
});