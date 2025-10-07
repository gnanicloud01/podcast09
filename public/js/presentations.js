// Presentations JavaScript

// Presentation data
const presentations = {
    'cloud-architecture': {
        title: 'GT Cloud Architecture Overview',
        slides: [
            {
                title: 'GT Cloud Architecture',
                content: `
                    <p>Welcome to GT Cloud - the next generation audio cloud platform built for creators, artists, and audio professionals.</p>
                    <ul>
                        <li>Scalable microservices architecture</li>
                        <li>Global CDN for low-latency access</li>
                        <li>Enterprise-grade security</li>
                        <li>Real-time collaboration features</li>
                        <li>AI-powered audio processing</li>
                    </ul>
                `
            },
            {
                title: 'Infrastructure Overview',
                content: `
                    <p>GT Cloud is built on modern cloud-native technologies:</p>
                    <ul>
                        <li><strong>Container Orchestration:</strong> Kubernetes for scalability</li>
                        <li><strong>Database:</strong> Distributed PostgreSQL with Redis caching</li>
                        <li><strong>Storage:</strong> Object storage with automatic backup</li>
                        <li><strong>Processing:</strong> GPU-accelerated audio processing nodes</li>
                        <li><strong>Security:</strong> End-to-end encryption and zero-trust architecture</li>
                    </ul>
                `
            },
            {
                title: 'Scalability & Performance',
                content: `
                    <p>Designed to handle millions of users and petabytes of audio data:</p>
                    <ul>
                        <li>Auto-scaling based on demand</li>
                        <li>Edge computing for reduced latency</li>
                        <li>Intelligent load balancing</li>
                        <li>99.99% uptime guarantee</li>
                        <li>Global presence across 15+ regions</li>
                    </ul>
                `
            }
        ]
    },
    'audio-pipeline': {
        title: 'Audio Processing Pipeline',
        slides: [
            {
                title: 'Audio Processing Pipeline',
                content: `
                    <p>GT Cloud's advanced audio processing pipeline delivers studio-quality results in real-time.</p>
                    <ul>
                        <li>Lossless audio ingestion and storage</li>
                        <li>Real-time format conversion</li>
                        <li>Dolby Atmos spatial audio processing</li>
                        <li>AI-powered noise reduction</li>
                        <li>Dynamic range optimization</li>
                    </ul>
                `
            },
            {
                title: 'Dolby Atmos Integration',
                content: `
                    <p>First-class support for immersive audio experiences:</p>
                    <ul>
                        <li><strong>Object-based Audio:</strong> 128 simultaneous audio objects</li>
                        <li><strong>Spatial Rendering:</strong> Real-time 3D audio positioning</li>
                        <li><strong>Format Support:</strong> ADM BWF, Dolby TrueHD, Dolby Digital Plus</li>
                        <li><strong>Binaural Rendering:</strong> Headphone optimization</li>
                        <li><strong>Speaker Configurations:</strong> Support for 7.1.4, 9.1.6, and beyond</li>
                    </ul>
                `
            },
            {
                title: 'AI-Powered Features',
                content: `
                    <p>Cutting-edge AI technology enhances every aspect of audio processing:</p>
                    <ul>
                        <li>Intelligent audio mastering with style adaptation</li>
                        <li>Automatic stem separation and isolation</li>
                        <li>Real-time noise and artifact removal</li>
                        <li>Smart EQ and dynamic range optimization</li>
                        <li>Content-aware compression and limiting</li>
                    </ul>
                `
            }
        ]
    },
    'collaboration': {
        title: 'Collaboration Features',
        slides: [
            {
                title: 'Real-time Collaboration',
                content: `
                    <p>GT Cloud enables seamless collaboration between team members worldwide.</p>
                    <ul>
                        <li>Real-time project synchronization</li>
                        <li>Version control with branching</li>
                        <li>Live audio streaming for remote sessions</li>
                        <li>Integrated voice and video chat</li>
                        <li>Role-based access control</li>
                    </ul>
                `
            },
            {
                title: 'Project Management',
                content: `
                    <p>Comprehensive tools for managing complex audio projects:</p>
                    <ul>
                        <li><strong>Timeline Sync:</strong> Shared project timelines with real-time updates</li>
                        <li><strong>Asset Management:</strong> Centralized library with tagging and search</li>
                        <li><strong>Review System:</strong> Time-stamped comments and feedback</li>
                        <li><strong>Approval Workflow:</strong> Structured review and approval process</li>
                        <li><strong>Export Management:</strong> Automated delivery and distribution</li>
                    </ul>
                `
            },
            {
                title: 'Integration Ecosystem',
                content: `
                    <p>GT Cloud integrates with your existing workflow and tools:</p>
                    <ul>
                        <li>Pro Tools, Logic Pro, Ableton Live integration</li>
                        <li>Slack, Discord, and Teams notifications</li>
                        <li>Dropbox, Google Drive, and OneDrive sync</li>
                        <li>JIRA and Asana project management</li>
                        <li>Custom API for third-party integrations</li>
                    </ul>
                `
            }
        ]
    },
    'security': {
        title: 'Security & Privacy',
        slides: [
            {
                title: 'Enterprise Security',
                content: `
                    <p>GT Cloud implements military-grade security to protect your valuable audio content.</p>
                    <ul>
                        <li>End-to-end AES-256 encryption</li>
                        <li>Zero-trust network architecture</li>
                        <li>Multi-factor authentication (MFA)</li>
                        <li>SOC 2 Type II compliance</li>
                        <li>GDPR and CCPA compliance</li>
                    </ul>
                `
            },
            {
                title: 'Data Protection',
                content: `
                    <p>Your data is protected at every level:</p>
                    <ul>
                        <li><strong>Encryption at Rest:</strong> All stored data encrypted with unique keys</li>
                        <li><strong>Encryption in Transit:</strong> TLS 1.3 for all data transmission</li>
                        <li><strong>Key Management:</strong> Hardware security modules (HSM)</li>
                        <li><strong>Backup & Recovery:</strong> Automated backups across multiple regions</li>
                        <li><strong>Data Residency:</strong> Choose where your data is stored</li>
                    </ul>
                `
            },
            {
                title: 'Access Control',
                content: `
                    <p>Granular control over who can access your content:</p>
                    <ul>
                        <li>Role-based access control (RBAC)</li>
                        <li>Project-level permissions</li>
                        <li>Time-limited access tokens</li>
                        <li>IP whitelisting and geofencing</li>
                        <li>Audit logs and activity monitoring</li>
                    </ul>
                `
            }
        ]
    },
    'ai-mastering': {
        title: 'AI-Powered Mastering',
        slides: [
            {
                title: 'Revolutionary AI Mastering',
                content: `
                    <p>GT Cloud's AI mastering technology adapts to your creative vision and musical style.</p>
                    <ul>
                        <li>Style-aware mastering algorithms</li>
                        <li>Genre-specific optimization</li>
                        <li>Reference track matching</li>
                        <li>Real-time preview and adjustment</li>
                        <li>Non-destructive processing</li>
                    </ul>
                `
            },
            {
                title: 'Intelligent Analysis',
                content: `
                    <p>Advanced AI analyzes your music to deliver optimal results:</p>
                    <ul>
                        <li><strong>Spectral Analysis:</strong> Frequency content and balance optimization</li>
                        <li><strong>Dynamic Range:</strong> Intelligent compression and limiting</li>
                        <li><strong>Stereo Imaging:</strong> Width and depth enhancement</li>
                        <li><strong>Tonal Balance:</strong> EQ matching to professional standards</li>
                        <li><strong>Loudness Standards:</strong> Automatic compliance with streaming platforms</li>
                    </ul>
                `
            },
            {
                title: 'Creative Control',
                content: `
                    <p>Maintain full creative control while leveraging AI assistance:</p>
                    <ul>
                        <li>Adjustable intensity and character settings</li>
                        <li>A/B comparison with original and references</li>
                        <li>Undo/redo with unlimited history</li>
                        <li>Custom presets and style templates</li>
                        <li>Export stems and individual processing chains</li>
                    </ul>
                `
            }
        ]
    },
    'analytics': {
        title: 'Analytics & Insights',
        slides: [
            {
                title: 'Comprehensive Analytics',
                content: `
                    <p>GT Cloud provides detailed insights into your audio content and audience engagement.</p>
                    <ul>
                        <li>Real-time streaming analytics</li>
                        <li>Audience demographics and behavior</li>
                        <li>Geographic distribution maps</li>
                        <li>Revenue tracking and projections</li>
                        <li>Performance benchmarking</li>
                    </ul>
                `
            },
            {
                title: 'Content Performance',
                content: `
                    <p>Track how your content performs across platforms:</p>
                    <ul>
                        <li><strong>Streaming Metrics:</strong> Plays, skips, completion rates</li>
                        <li><strong>Engagement Data:</strong> Likes, shares, comments, saves</li>
                        <li><strong>Discovery Analytics:</strong> How users find your content</li>
                        <li><strong>Platform Comparison:</strong> Performance across different services</li>
                        <li><strong>Trend Analysis:</strong> Historical data and growth patterns</li>
                    </ul>
                `
            },
            {
                title: 'Business Intelligence',
                content: `
                    <p>Make data-driven decisions with advanced business insights:</p>
                    <ul>
                        <li>Revenue optimization recommendations</li>
                        <li>Market opportunity analysis</li>
                        <li>Competitive benchmarking</li>
                        <li>Predictive analytics for future releases</li>
                        <li>Custom reporting and data export</li>
                    </ul>
                `
            }
        ]
    }
};

let currentPresentation = null;
let currentSlide = 0;

// Open presentation modal
function openPresentation(presentationId) {
    currentPresentation = presentations[presentationId];
    currentSlide = 0;
    
    if (!currentPresentation) {
        console.error('Presentation not found:', presentationId);
        return;
    }
    
    const modal = document.getElementById('presentationModal');
    const modalTitle = document.getElementById('modalTitle');
    
    modalTitle.textContent = currentPresentation.title;
    modal.style.display = 'block';
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    renderSlide();
}

// Close presentation modal
function closePresentation() {
    const modal = document.getElementById('presentationModal');
    
    // Stop all videos and audio before closing
    stopAllMedia();
    
    modal.style.display = 'none';
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
    
    currentPresentation = null;
    currentSlide = 0;
}

// Stop all media (videos and audio) in the modal
function stopAllMedia() {
    const content = document.getElementById('presentationContent');
    if (!content) return;
    
    // Stop all videos
    const videos = content.querySelectorAll('video');
    videos.forEach(video => {
        video.pause();
        video.currentTime = 0;
        video.src = ''; // Clear source to fully stop
    });
    
    // Stop all audio
    const audios = content.querySelectorAll('audio');
    audios.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
        audio.src = ''; // Clear source to fully stop
    });
    
    // Stop iframes (for interactive presentations)
    const iframes = content.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        const src = iframe.src;
        iframe.src = 'about:blank'; // Stop iframe content
        setTimeout(() => {
            iframe.src = src; // Restore src after a brief pause
        }, 100);
    });
}

// Render current slide
function renderSlide() {
    if (!currentPresentation) return;
    
    const slide = currentPresentation.slides[currentSlide];
    const content = document.getElementById('presentationContent');
    
    content.innerHTML = `
        <div class="presentation-slide">
            <h2>${slide.title}</h2>
            ${slide.content}
            <div class="slide-navigation">
                <button class="slide-nav-btn" onclick="previousSlide()" ${currentSlide === 0 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i> Previous
                </button>
                <span style="margin: 0 1rem; color: #6c757d;">
                    ${currentSlide + 1} / ${currentPresentation.slides.length}
                </span>
                <button class="slide-nav-btn" onclick="nextSlide()" ${currentSlide === currentPresentation.slides.length - 1 ? 'disabled' : ''}>
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;
}

// Navigate to next slide
function nextSlide() {
    if (currentPresentation && currentSlide < currentPresentation.slides.length - 1) {
        currentSlide++;
        renderSlide();
    }
}

// Navigate to previous slide
function previousSlide() {
    if (currentPresentation && currentSlide > 0) {
        currentSlide--;
        renderSlide();
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (currentPresentation) {
        switch(event.key) {
            case 'ArrowRight':
            case ' ':
                event.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                previousSlide();
                break;
            case 'Escape':
                event.preventDefault();
                closePresentation();
                break;
        }
    }
});

// Close modal when clicking outside
document.getElementById('presentationModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closePresentation();
    }
});

// Also ensure videos stop when close button is clicked
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to close button
    const closeBtn = document.querySelector('#presentationModal .close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closePresentation);
    }
});

let allPresentations = [];
let currentFilter = 'all';

// Load presentations from API
async function loadPresentations() {
    try {
        const response = await fetch('/api/content?type=presentation');
        const data = await response.json();
        
        if (data.success && data.content.length > 0) {
            allPresentations = data.content;
            renderPresentations();
            // Hide static presentations if we have dynamic ones
            document.getElementById('staticPresentations').style.display = 'none';
        } else {
            // Show static presentations as fallback
            console.log('No dynamic presentations found, showing static ones');
        }
    } catch (error) {
        console.error('Error loading presentations:', error);
        // Static presentations will be shown as fallback
    }
}

// Render presentations based on current filter
function renderPresentations() {
    const grid = document.getElementById('presentationsGrid');
    if (!grid || allPresentations.length === 0) return;
    
    let filteredPresentations = allPresentations;
    
    if (currentFilter !== 'all') {
        filteredPresentations = allPresentations.filter(p => p.video_type === currentFilter);
    }
    
    grid.innerHTML = filteredPresentations.map(presentation => createPresentationCard(presentation)).join('');
    
    // Add click listeners
    grid.querySelectorAll('.presentation-card').forEach(card => {
        const presentationId = card.dataset.presentationId;
        card.querySelector('.presentation-btn').addEventListener('click', () => {
            openDynamicPresentation(presentationId);
        });
    });
    
    // Add loading animation
    const cards = grid.querySelectorAll('.presentation-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Create presentation card HTML
function createPresentationCard(presentation) {
    const videoTypeIcons = {
        'video': 'fas fa-video',
        'slide': 'fas fa-presentation',
        'interactive': 'fas fa-mouse-pointer'
    };
    
    const videoTypeLabels = {
        'video': 'Video',
        'slide': 'Slides',
        'interactive': 'Interactive'
    };
    
    const categoryClass = presentation.category_name ? presentation.category_name.toLowerCase().replace(/\s+/g, '-') : 'default';
    const duration = presentation.duration ? formatDuration(presentation.duration) : '15 min';
    const videoType = presentation.video_type || 'slide';
    
    return `
        <div class="presentation-card" data-type="${videoType}" data-presentation-id="${presentation.id}">
            <div class="presentation-thumbnail">
                ${presentation.thumbnail_url ? 
                    `<img src="${presentation.thumbnail_url}" alt="${presentation.title}">` :
                    `<i class="fas fa-cloud-upload-alt"></i>`
                }
                <div class="video-badge">
                    <i class="${videoTypeIcons[videoType]}"></i> ${videoTypeLabels[videoType]}
                </div>
            </div>
            <div class="presentation-content">
                <h3>${escapeHtml(presentation.title)}</h3>
                <p>${escapeHtml(presentation.description || 'Professional presentation content')}</p>
                <div class="presentation-meta">
                    <span class="duration"><i class="fas fa-clock"></i> ${duration}</span>
                    <span class="category ${categoryClass}">${presentation.category_name || 'General'}</span>
                </div>
                <button class="btn btn-primary presentation-btn">
                    <i class="fas fa-play"></i> View Presentation
                </button>
            </div>
        </div>
    `;
}

// Open dynamic presentation from database
async function openDynamicPresentation(presentationId) {
    try {
        const response = await fetch(`/api/content/${presentationId}`);
        const data = await response.json();
        
        if (data.success) {
            const presentation = data.content;
            showVideoPresentation(presentation);
            
            // Update view count
            fetch(`/api/content/${presentationId}/view`, { method: 'POST' });
        }
    } catch (error) {
        console.error('Error loading presentation:', error);
    }
}

// Show video presentation in modal
function showVideoPresentation(presentation) {
    const modal = document.getElementById('presentationModal');
    const modalTitle = document.getElementById('modalTitle');
    const content = document.getElementById('presentationContent');
    
    modalTitle.textContent = presentation.title;
    
    let mediaElement = '';
    const url = presentation.s3_url;
    
    if (presentation.video_type === 'video' || url.match(/\.(mp4|webm|ogg|mov)$/i)) {
        mediaElement = `
            <div class="video-presentation">
                <video controls autoplay style="width: 100%; max-height: 70vh; border-radius: 10px;">
                    <source src="${url}" type="video/mp4">
                    Your browser does not support the video element.
                </video>
                <div class="presentation-info">
                    <h3>${escapeHtml(presentation.title)}</h3>
                    <p>${escapeHtml(presentation.description || '')}</p>
                    <div class="presentation-stats">
                        <span><i class="fas fa-eye"></i> ${presentation.view_count || 0} views</span>
                        ${presentation.duration ? `<span><i class="fas fa-clock"></i> ${formatDuration(presentation.duration)}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (presentation.video_type === 'interactive') {
        mediaElement = `
            <div class="interactive-presentation">
                <iframe src="${url}" frameborder="0" style="width: 100%; height: 70vh; border-radius: 10px;">
                    <p>Your browser does not support iframes. <a href="${url}">Open presentation</a>.</p>
                </iframe>
                <div class="presentation-info">
                    <h3>${escapeHtml(presentation.title)}</h3>
                    <p>${escapeHtml(presentation.description || '')}</p>
                </div>
            </div>
        `;
    } else {
        // Default to slide presentation
        renderSlide();
        return;
    }
    
    content.innerHTML = mediaElement;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Category filter functionality
function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.category-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update filter
            currentFilter = btn.dataset.category;
            
            // Filter presentations
            if (allPresentations.length > 0) {
                renderPresentations();
            } else {
                filterStaticPresentations();
            }
        });
    });
}

// Filter static presentations
function filterStaticPresentations() {
    const staticCards = document.querySelectorAll('#staticPresentations .presentation-card');
    
    staticCards.forEach(card => {
        const cardType = card.dataset.type;
        
        if (currentFilter === 'all' || cardType === currentFilter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Utility functions
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize presentations page
document.addEventListener('DOMContentLoaded', function() {
    console.log('GT Cloud Presentations loaded successfully');
    
    // Setup category filters
    setupCategoryFilters();
    
    // Load dynamic presentations
    loadPresentations();
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add loading animation for static presentation cards
    setTimeout(() => {
        const cards = document.querySelectorAll('#staticPresentations .presentation-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 100);
});