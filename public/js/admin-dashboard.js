// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentContent = [];
        this.init();
    }

    init() {
        console.log('Initializing admin dashboard...');
        this.checkAuth();
        this.setupEventListeners();
        this.loadDashboardStats();

        // Load initial content for the dashboard
        setTimeout(() => {
            console.log('Loading initial content...');
            this.loadSectionData('dashboard');
        }, 1000);
    }

    async checkAuth() {
        try {
            const response = await fetch('/auth/admin-check');
            const result = await response.json();

            if (!result.success) {
                window.location.href = '/admin-login';
                return;
            }
        } catch (error) {
            console.error('Auth check error:', error);
            window.location.href = '/admin-login';
        }
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', this.logout.bind(this));

        // Add content button
        document.getElementById('addContentBtn').addEventListener('click', () => {
            this.openContentModal();
        });

        // Bulk upload button
        document.getElementById('bulkUploadBtn').addEventListener('click', () => {
            this.openBulkUploadModal();
        });

        // Content form
        document.getElementById('contentForm').addEventListener('submit', this.saveContent.bind(this));

        // Modal close buttons
        document.querySelectorAll('.close, #cancelBtn').forEach(btn => {
            btn.addEventListener('click', this.closeModal.bind(this));
        });

        // Bulk upload modal close buttons
        document.querySelectorAll('#bulkUploadClose, #cancelBulkUpload').forEach(btn => {
            btn.addEventListener('click', this.closeBulkUploadModal.bind(this));
        });

        // Bulk upload file input
        document.getElementById('csvFileInput').addEventListener('change', this.handleFileSelect.bind(this));
        document.getElementById('uploadDropzone').addEventListener('click', () => {
            document.getElementById('csvFileInput').click();
        });

        // Process bulk upload
        document.getElementById('processBulkUpload').addEventListener('click', this.processBulkUpload.bind(this));

        // Modal background click
        window.addEventListener('click', (e) => {
            const contentModal = document.getElementById('contentModal');
            const bulkModal = document.getElementById('bulkUploadModal');
            if (e.target === contentModal) {
                this.closeModal();
            }
            if (e.target === bulkModal) {
                this.closeBulkUploadModal();
            }
        });
    }

    switchSection(section) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update section title
        const titles = {
            dashboard: 'Dashboard',
            podcasts: 'Podcasts',
            presentations: 'Presentations',
            documents: 'Documents',
            categories: 'Categories'
        };
        document.getElementById('sectionTitle').textContent = titles[section];

        // Show/hide sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        // Load section data
        this.currentSection = section;
        this.loadSectionData(section);
    }

    async loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                await this.loadDashboardStats();
                break;
            case 'podcasts':
            case 'presentations':
            case 'documents':
                await this.loadContentTable(section.slice(0, -1)); // Remove 's' from end
                break;
            case 'categories':
                await this.loadCategories();
                break;
        }
    }

    async loadDashboardStats() {
        try {
            console.log('Loading dashboard stats...');
            const [podcastStats, presentationStats, documentStats] = await Promise.all([
                fetch('/api/stats/podcast').then(r => r.json()),
                fetch('/api/stats/presentation').then(r => r.json()),
                fetch('/api/stats/document').then(r => r.json())
            ]);

            console.log('Stats loaded:', { podcastStats, presentationStats, documentStats });

            document.getElementById('totalPodcasts').textContent = podcastStats.stats?.total_count || 0;
            document.getElementById('totalPresentations').textContent = presentationStats.stats?.total_count || 0;
            document.getElementById('totalDocuments').textContent = documentStats.stats?.total_count || 0;

            console.log('Dashboard stats updated');
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            this.showMessage('Error loading dashboard statistics', 'error');
        }
    }

    async loadContentTable(type) {
        try {
            console.log(`Loading ${type} content...`);
            const response = await fetch(`/admin/content?type=${type}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log(`${type} content response:`, result);

            if (result.success) {
                this.renderContentTable(result.content, type);
                console.log(`${type} table rendered with ${result.content.length} items`);
            } else {
                console.error(`Failed to load ${type} content:`, result.message);
                this.showMessage(`Error loading ${type} content: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error(`Error loading ${type} content:`, error);
            this.showMessage(`Network error loading ${type} content: ${error.message}`, 'error');
        }
    }

    renderContentTable(content, type) {
        const tableBody = document.getElementById(`${type}sTable`);

        if (!content || content.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No content found</td></tr>';
            return;
        }

        tableBody.innerHTML = content.map(item => `
            <tr>
                <td>
                    <strong>${this.escapeHtml(item.title)}</strong>
                    <br>
                    <small style="color: #666;">${this.escapeHtml(item.description || '').substring(0, 100)}${item.description && item.description.length > 100 ? '...' : ''}</small>
                </td>
                <td>${item.duration ? this.formatDuration(item.duration) : (item.file_size ? this.formatFileSize(item.file_size) : '-')}</td>
                <td>${new Date(item.created_at).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="adminDashboard.editContent(${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteContent(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadCategories() {
        try {
            const response = await fetch('/admin/categories');
            const result = await response.json();

            if (result.success) {
                this.renderCategories(result.categories);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    renderCategories(categories) {
        const container = document.getElementById('categoriesGrid');

        if (!categories || categories.length === 0) {
            container.innerHTML = '<p>No categories found</p>';
            return;
        }

        container.innerHTML = categories.map(category => `
            <div class="category-card">
                <h4>${this.escapeHtml(category.name)}</h4>
                <p>Type: ${category.type}</p>
                <small>Created: ${new Date(category.created_at).toLocaleDateString()}</small>
            </div>
        `).join('');
    }

    openContentModal(contentId = null) {
        const modal = document.getElementById('contentModal');
        const form = document.getElementById('contentForm');
        const title = document.getElementById('modalTitle');

        if (contentId) {
            title.textContent = 'Edit Content';
            this.loadContentForEdit(contentId);
        } else {
            title.textContent = 'Add Content';
            form.reset();
            document.getElementById('contentId').value = '';
        }

        modal.style.display = 'block';
    }

    async loadContentForEdit(contentId) {
        try {
            const response = await fetch(`/api/content/${contentId}`);
            const result = await response.json();

            if (result.success) {
                const content = result.content;
                document.getElementById('contentId').value = content.id;
                document.getElementById('contentType').value = content.type;
                document.getElementById('contentTitle').value = content.title;
                document.getElementById('contentDescription').value = content.description || '';
                document.getElementById('contentS3Url').value = content.s3_url;
                document.getElementById('contentThumbnail').value = content.thumbnail_url || '';
                document.getElementById('contentDuration').value = content.duration || '';
                document.getElementById('contentFileSize').value = content.file_size || '';
                document.getElementById('contentTags').value = content.tags || '';
            }
        } catch (error) {
            console.error('Error loading content for edit:', error);
        }
    }

    async saveContent(e) {
        e.preventDefault();
        console.log('Saving content...');

        const formData = new FormData(e.target);
        const contentData = {
            title: formData.get('title'),
            description: formData.get('description'),
            type: formData.get('type'),
            s3_url: formData.get('s3_url'),
            thumbnail_url: formData.get('thumbnail_url'),
            duration: formData.get('duration') ? parseInt(formData.get('duration')) : null,
            file_size: formData.get('file_size') ? parseInt(formData.get('file_size')) : null,
            tags: formData.get('tags')
        };

        console.log('Content data:', contentData);

        const contentId = document.getElementById('contentId').value;
        const isEdit = contentId !== '';

        try {
            const url = isEdit ? `/admin/content/${contentId}` : '/admin/content';
            const method = isEdit ? 'PUT' : 'POST';

            console.log(`Making ${method} request to ${url}`);

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contentData)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Save result:', result);

            if (result.success) {
                this.showMessage(result.message, 'success');
                this.closeModal();
                this.loadSectionData(this.currentSection);
            } else {
                this.showMessage(result.message || 'Save failed', 'error');
            }
        } catch (error) {
            console.error('Error saving content:', error);
            this.showMessage(`Error saving content: ${error.message}`, 'error');
        }
    }

    async editContent(contentId) {
        this.openContentModal(contentId);
    }

    async deleteContent(contentId) {
        if (!confirm('Are you sure you want to delete this content?')) {
            return;
        }

        try {
            const response = await fetch(`/admin/content/${contentId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage(result.message, 'success');
                this.loadSectionData(this.currentSection);
            } else {
                this.showMessage(result.message, 'error');
            }
        } catch (error) {
            console.error('Error deleting content:', error);
            this.showMessage('Error deleting content', 'error');
        }
    }

    closeModal() {
        document.getElementById('contentModal').style.display = 'none';
    }

    async logout() {
        try {
            const response = await fetch('/auth/admin-logout', {
                method: 'POST'
            });

            const result = await response.json();

            if (result.success) {
                window.location.href = result.redirect || '/';
            }
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/';
        }
    }

    showMessage(text, type) {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
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

    // Debug method to manually refresh content
    debugRefresh() {
        console.log('Debug refresh - current section:', this.currentSection);
        this.loadSectionData(this.currentSection);
    }

    // Debug method to test content loading
    async debugTestContent() {
        console.log('Testing content loading...');
        try {
            const response = await fetch('/admin/content');
            const result = await response.json();
            console.log('Content response:', result);
            return result;
        } catch (error) {
            console.error('Content loading error:', error);
            return { error: error.message };
        }
    }
    // Bulk Upload Methods
    openBulkUploadModal() {
        document.getElementById('bulkUploadModal').style.display = 'block';
        this.resetBulkUpload();
    }

    closeBulkUploadModal() {
        document.getElementById('bulkUploadModal').style.display = 'none';
        this.resetBulkUpload();
    }

    resetBulkUpload() {
        document.getElementById('csvFileInput').value = '';
        document.getElementById('uploadPreview').style.display = 'none';
        document.getElementById('processBulkUpload').disabled = true;
        this.csvData = null;
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            this.parseCSV(file);
        } else {
            this.showMessage('Please select a valid CSV file', 'error');
        }
    }

    parseCSV(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target.result;
            const lines = csv.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                this.showMessage('CSV file must have at least a header and one data row', 'error');
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const requiredHeaders = ['title', 'type', 's3_url'];
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

            if (missingHeaders.length > 0) {
                this.showMessage(`Missing required columns: ${missingHeaders.join(', ')}`, 'error');
                return;
            }

            const data = [];
            for (let i = 1; i < lines.length; i++) {
                const values = this.parseCSVLine(lines[i]);
                if (values.length === headers.length) {
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index];
                    });
                    data.push(row);
                }
            }

            this.csvData = data;
            this.showPreview(headers, data);
            document.getElementById('processBulkUpload').disabled = false;
        };
        reader.readAsText(file);
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    }

    showPreview(headers, data) {
        const previewDiv = document.getElementById('uploadPreview');
        const headerRow = document.getElementById('previewHeader');
        const bodyRows = document.getElementById('previewBody');

        // Clear previous content
        headerRow.innerHTML = '';
        bodyRows.innerHTML = '';

        // Add headers
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });

        // Add first 5 rows of data
        const previewData = data.slice(0, 5);
        previewData.forEach(row => {
            const tr = document.createElement('tr');
            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = row[header] || '';
                tr.appendChild(td);
            });
            bodyRows.appendChild(tr);
        });

        previewDiv.style.display = 'block';
    }

    async processBulkUpload() {
        if (!this.csvData || this.csvData.length === 0) {
            this.showMessage('No data to upload', 'error');
            return;
        }

        const button = document.getElementById('processBulkUpload');
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

        try {
            const response = await fetch('/admin/bulk-upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: this.csvData })
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage(`Successfully uploaded ${result.count} items`, 'success');
                this.closeBulkUploadModal();
                this.loadDashboardStats();
                if (this.currentSection !== 'dashboard') {
                    this.loadSectionData(this.currentSection);
                }
            } else {
                this.showMessage(result.message || 'Upload failed', 'error');
            }
        } catch (error) {
            console.error('Bulk upload error:', error);
            this.showMessage('Upload failed. Please try again.', 'error');
        } finally {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-upload"></i> Upload Content';
        }
    }
}

// Initialize the admin dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});