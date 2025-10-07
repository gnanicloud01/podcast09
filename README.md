# StreamHub - Beautiful Streaming Platform

A gorgeous, modern streaming platform for podcasts, presentations, and documents with S3-based content delivery and comprehensive admin management.

## ✨ Features

### 🎵 Three Content Models
- **Podcasts** - Audio streaming with duration tracking
- **Presentations** - Video/slide presentations 
- **Documents** - PDF and document viewing

### 🔐 Admin Management
- Secure admin authentication
- Content management dashboard
- Real-time statistics
- Category management
- Demo credentials included

### 🌐 Public Streaming
- Free access for all users (no user login required)
- Beautiful, responsive design
- Search functionality
- Featured content section
- Mobile-optimized interface

### 🗄️ Database Support
- SQLite (default, zero-config)
- PostgreSQL (optional, production-ready)
- Automatic database initialization

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
npm run setup-db
```

### 3. Start the Server
```bash
npm start
# or for development
npm run dev
```

### 4. Access the Platform
- **Main Site**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin-login
- **Admin Dashboard**: http://localhost:3000/admin-dashboard

## 🔑 Demo Credentials

**Admin Login:**
- Email: `admin@demo.com`
- Password: `demo123`

## 📁 Project Structure

```
streaming-platform/
├── database/           # Database configurations
│   ├── sqlite.js      # SQLite setup
│   └── postgresql.js  # PostgreSQL setup
├── routes/            # API routes
│   ├── auth.js        # Authentication
│   ├── admin.js       # Admin management
│   └── streaming.js   # Public streaming API
├── views/             # EJS templates
│   ├── index.ejs      # Main streaming page
│   ├── admin-login.ejs
│   └── admin-dashboard.ejs
├── public/            # Static assets
│   ├── css/           # Stylesheets
│   └── js/            # Client-side JavaScript
├── scripts/           # Utility scripts
└── server.js          # Main server file
```

## 🎨 Admin Features

### Content Management
- Add/edit/delete content across all three models
- S3 URL-based streaming (no AWS SDK dependencies)
- Thumbnail support
- Duration and file size tracking
- Tag management

### Dashboard Analytics
- Real-time content statistics
- Content type breakdowns
- Creation date tracking

### Category Management
- Organize content by categories
- Type-specific categorization

## 🔧 Configuration

### Environment Variables (.env)
```env
PORT=3000
SESSION_SECRET=your-super-secret-session-key
DB_TYPE=sqlite
SQLITE_PATH=./database.sqlite
POSTGRES_URL=postgresql://username:password@localhost:5432/streaming_platform
DEMO_ADMIN_EMAIL=admin@demo.com
DEMO_ADMIN_PASSWORD=demo123
```

### Database Configuration
- **SQLite**: Zero configuration, file-based database
- **PostgreSQL**: Set `POSTGRES_URL` for production use

## 📱 Responsive Design

The platform is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## 🎯 Content Types & Streaming

### Podcasts
- Audio file streaming (MP3, WAV, OGG, M4A)
- Duration tracking
- Audio player controls

### Presentations  
- Video streaming (MP4, WebM, OGG, MOV)
- Slide presentations
- Video player controls

### Documents
- PDF viewing
- Document downloads
- File size tracking

## 🔒 Security Features

- Session-based authentication
- Password hashing with bcrypt
- SQL injection prevention
- XSS protection
- CSRF protection via sessions

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Database Setup
```bash
npm run setup-db
```

## 📊 API Endpoints

### Public API
- `GET /api/content` - Get all content with filtering
- `GET /api/content/:id` - Get single content item
- `GET /api/stats/:type` - Get content statistics
- `GET /api/featured` - Get featured content

### Admin API
- `POST /auth/admin-login` - Admin authentication
- `GET /admin/content` - Get content for admin
- `POST /admin/content` - Add new content
- `PUT /admin/content/:id` - Update content
- `DELETE /admin/content/:id` - Delete content

## 🎨 Customization

### Styling
- Modern CSS with gradients and animations
- Customizable color scheme in `/public/css/style.css`
- Admin theme in `/public/css/admin.css`

### Branding
- Update logo and branding in navigation
- Customize hero section messaging
- Modify color schemes and fonts

## 🔧 Technical Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite/PostgreSQL
- **Frontend**: Vanilla JavaScript, EJS templates
- **Styling**: Modern CSS with Flexbox/Grid
- **Authentication**: Session-based with bcrypt
- **File Handling**: S3 URL-based streaming

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the documentation
2. Review the demo credentials
3. Ensure database is properly initialized
4. Check server logs for errors

---

**StreamHub** - Your ultimate streaming platform for podcasts, presentations, and documents! 🎵📊📄