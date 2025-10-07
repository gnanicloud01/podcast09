// Documents Page JavaScript
class DocumentsPage {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentView = 'grid';
        this.currentSort = 'newest';
        this.currentCategory = '';
        this.currentType = '';
        this.searchQuery = '';
        this.allDocuments = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStats();
        this.loadCategories();
        this.loadDocuments();
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

        document.getElementById('typeFilter').addEventListener('change', (e) => {
            this.currentType = e.target.value;
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
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    async loadStats() {
        try {
            const response = await fetch('/api/stats/document');
            const data = await response.json();
            
            if (data.success) {
                const stats = data.stats;
                const totalDocumentsEl = document.getElementById('total-documents');
                const totalSizeEl = document.getElementById('total-size');
                
                if (totalDocumentsEl) {
                    totalDocumentsEl.textContent = stats.total_count || 0;
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
            const response = await fetch('/admin/categories?type=document');
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

    async loadDocuments() {
        try {
            const response = await fetch('/api/content?type=document&limit=50');
            const data = await response.json();
            
            if (data.success) {
                this.allDocuments = data.content;
                this.renderFeaturedDocument();
                this.applyFilters();
            }
        } catch (error) {
            console.error('Error loading documents:', error);
        }
    }

    renderFeaturedDocument() {
        if (this.allDocuments.length === 0) return;
        
        const featured = this.allDocuments[0];
        const container = document.getElementById('featuredDocument');
        
        container.innerHTML = `
            <div class="featured-item" data-content-id="${featured.id}">
                <div class="featured-item-header">
                    <div>
                        <div class="featured-item-title">${this.escapeHtml(featured.title)}</div>
                        <div class="featured-item-description">${this.escapeHtml(featured.description || '')}</div>
                        <div class="featured-item-meta">
                            <span><i class="fas fa-file"></i> ${this.formatFileSize(featured.file_size || 0)}</span>
                            <span><i class="fas fa-calendar"></i> ${new Date(featured.created_at).toLocaleDateString()}</span>
                            <span><i class="fas fa-file-alt"></i> ${this.getFileType(featured.s3_url)}</span>
                            <span><i class="fas fa-tags"></i> ${featured.tags || 'document'}</span>
                        </div>
                    </div>
                    <div class="featured-item-thumbnail">
                        ${featured.thumbnail_url ? 
                            `<img src="${featured.thumbnail_url}" alt="${featured.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` :
                            `<i class="fas ${this.getFileIcon(featured.s3_url)}"></i>`
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
        let filteredDocuments = [...this.allDocuments];

        // Apply search filter
        if (this.searchQuery) {
            filteredDocuments = filteredDocuments.filter(document => 
                document.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                (document.description && document.description.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
                (document.tags && document.tags.toLowerCase().includes(this.searchQuery.toLowerCase()))
            );
        }

        // Apply category filter
        if (this.currentCategory) {
            filteredDocuments = filteredDocuments.filter(document => 
                document.tags && document.tags.toLowerCase().includes(this.currentCategory.toLowerCase())
            );
        }

        // Apply type filter
        if (this.currentType) {
            filteredDocuments = filteredDocuments.filter(document => {
                const fileType = this.getFileType(document.s3_url).toLowerCase();
                return fileType.includes(this.currentType.toLowerCase());
            });
        }

        // Apply sorting
        filteredDocuments.sort((a, b) => {
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

        this.renderDocuments(filteredDocuments);
    }

    renderDocuments(documents) {
        const gridContainer = document.getElementById('documentsGrid');
        const listContainer = document.getElementById('documentsList');

        if (documents.length === 0) {
            const noContent = '<div class="no-content">No documents found</div>';
            gridContainer.innerHTML = noContent;
            listContainer.innerHTML = noContent;
            return;
        }

        // Render grid view
        gridContainer.innerHTML = documents.map(document => this.createDocumentCard(document)).join('');
        
        // Render list view
        listContainer.innerHTML = documents.map(document => this.createDocumentListItem(document)).join('');

        // Add click listeners
        this.addClickListeners(gridContainer);
        this.addClickListeners(listContainer);
    }

    createDocumentCard(document) {
        const fileSize = this.formatFileSize(document.file_size || 0);
        const fileType = this.getFileType(document.s3_url);
        const fileIcon = this.getFileIcon(document.s3_url);
        const tags = document.tags ? document.tags.split(',').slice(0, 3) : ['document'];

        return `
            <div class="content-card" data-content-id="${document.id}">
                <div class="content-thumbnail">
                    ${document.thumbnail_url ? 
                        `<img src="${document.thumbnail_url}" alt="${document.title}">` :
                        `<i class="fas ${fileIcon}"></i>`
                    }
                </div>
                <div class="content-info">
                    <div class="content-title">${this.escapeHtml(document.title)}</div>
                    <div class="content-description">${this.escapeHtml(document.description || '')}</div>
                    <div class="content-meta">
                        <div class="content-stats">
                            <span class="content-stat"><i class="fas fa-file"></i> ${fileSize}</span>
                            <span class="content-stat"><i class="fas fa-file-alt"></i> ${fileType}</span>
                            <span class="content-stat"><i class="fas fa-calendar"></i> ${new Date(document.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="content-tags">
                        ${tags.map(tag => `<span class="content-tag">${tag.trim()}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    createDocumentListItem(document) {
        const fileSize = this.formatFileSize(document.file_size || 0);
        const fileType = this.getFileType(document.s3_url);
        const fileIcon = this.getFileIcon(document.s3_url);

        return `
            <div class="content-list-item" data-content-id="${document.id}">
                <div class="content-list-thumbnail">
                    ${document.thumbnail_url ? 
                        `<img src="${document.thumbnail_url}" alt="${document.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">` :
                        `<i class="fas ${fileIcon}"></i>`
                    }
                </div>
                <div class="content-list-info">
                    <div class="content-list-title">${this.escapeHtml(document.title)}</div>
                    <div class="content-list-description">${this.escapeHtml(document.description || '')}</div>
                    <div class="content-list-meta">
                        <span><i class="fas fa-file"></i> ${fileSize}</span>
                        <span><i class="fas fa-file-alt"></i> ${fileType}</span>
                        <span><i class="fas fa-calendar"></i> ${new Date(document.created_at).toLocaleDateString()}</span>
                        <span><i class="fas fa-tags"></i> ${document.tags || 'document'}</span>
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
        const gridContainer = document.getElementById('documentsGrid');
        const listContainer = document.getElementById('documentsList');

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
        const downloadBtn = document.getElementById('downloadBtn');

        title.textContent = content.title;
        description.textContent = content.description || '';

        // Create document viewer based on file type
        const url = content.s3_url;
        let mediaElement = '';
        
        if (url.match(/\.pdf$/i)) {
            mediaElement = `
                <iframe src="${url}" style="width: 100%; height: 500px; border: none; border-radius: 8px;">
                    <p>Your browser does not support PDFs. <a href="${url}" target="_blank">Download the PDF</a>.</p>
                </iframe>
            `;
        } else if (url.match(/\.(doc|docx|ppt|pptx|xls|xlsx)$/i)) {
            mediaElement = `
                <div class="document-preview">
                    <div class="document-icon">
                        <i class="fas ${this.getFileIcon(url)}" style="font-size: 4rem; color: #667eea;"></i>
                    </div>
                    <p>This document type requires downloading to view.</p>
                    <a href="${url}" target="_blank" class="btn btn-primary">
                        <i class="fas fa-download"></i>
                        Download Document
                    </a>
                </div>
            `;
        } else {
            mediaElement = `
                <iframe src="${url}" style="width: 100%; height: 500px; border: none; border-radius: 8px;">
                    <p>Unable to preview this document. <a href="${url}" target="_blank">Open in new tab</a>.</p>
                </iframe>
            `;
        }

        container.innerHTML = mediaElement;

        // Show tags
        if (content.tags) {
            tags.innerHTML = content.tags.split(',').map(tag => 
                `<span class="media-tag">${tag.trim()}</span>`
            ).join('');
        }

        // Hide metadata section
        if (meta) {
            meta.style.display = 'none';
        }

        // Set download button
        if (downloadBtn) {
            downloadBtn.href = content.s3_url;
        }

        modal.style.display = 'block';
    }

    getFileType(url) {
        const extension = url.split('.').pop().toLowerCase();
        const types = {
            'pdf': 'PDF',
            'doc': 'Word Document',
            'docx': 'Word Document',
            'ppt': 'PowerPoint',
            'pptx': 'PowerPoint',
            'xls': 'Excel',
            'xlsx': 'Excel',
            'txt': 'Text File',
            'rtf': 'Rich Text',
            'odt': 'OpenDocument'
        };
        return types[extension] || extension.toUpperCase();
    }

    getFileIcon(url) {
        const extension = url.split('.').pop().toLowerCase();
        const icons = {
            'pdf': 'fa-file-pdf',
            'doc': 'fa-file-word',
            'docx': 'fa-file-word',
            'ppt': 'fa-file-powerpoint',
            'pptx': 'fa-file-powerpoint',
            'xls': 'fa-file-excel',
            'xlsx': 'fa-file-excel',
            'txt': 'fa-file-alt',
            'rtf': 'fa-file-alt',
            'odt': 'fa-file-alt'
        };
        return icons[extension] || 'fa-file';
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

// Initialize the documents page
document.addEventListener('DOMContentLoaded', () => {
    new DocumentsPage();
});