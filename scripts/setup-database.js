const bcrypt = require('bcryptjs');
const { database, usePostgreSQL } = require('../database/index');

async function setupDatabase() {
    console.log('🚀 Setting up StreamHub database...');
    
    try {
        // Initialize database (PostgreSQL or SQLite)
        console.log(`📦 Initializing ${usePostgreSQL ? 'PostgreSQL' : 'SQLite'} database...`);
        await database.init();

        // Add admin user
        console.log('👤 Creating admin user...');
        const hashedPassword = await bcrypt.hash('gnani@1429', 10);
        
        try {
            await database.run(
                'INSERT INTO admins (email, password, name) VALUES (?, ?, ?)',
                ['gnaneshwar14', hashedPassword, 'Gnaneshwar']
            );
            console.log('✅ Admin user created');
        } catch (err) {
            if (err.message.includes('UNIQUE') || err.code === '23505') {
                console.log('✅ Admin user already exists');
            } else {
                console.error('Error creating admin user:', err);
            }
        }

        // Add sample content
        console.log('🎵 Adding sample content...');
        const sampleContent = [
            {
                title: 'Welcome to StreamHub Podcast',
                description: 'An introduction to our amazing streaming platform with all the features you need.',
                type: 'podcast',
                s3_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
                thumbnail_url: 'https://via.placeholder.com/300x200/667eea/ffffff?text=Podcast',
                duration: 180,
                tags: 'welcome, introduction, streaming'
            },
            {
                title: 'Platform Overview Presentation',
                description: 'A comprehensive overview of StreamHub features and capabilities.',
                type: 'presentation',
                s3_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                thumbnail_url: 'https://via.placeholder.com/300x200/764ba2/ffffff?text=Presentation',
                file_size: 1048576,
                tags: 'overview, features, demo'
            },
            {
                title: 'User Guide Documentation',
                description: 'Complete user guide for getting started with StreamHub.',
                type: 'document',
                s3_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                thumbnail_url: 'https://via.placeholder.com/300x200/27ae60/ffffff?text=Document',
                file_size: 524288,
                tags: 'guide, documentation, help'
            }
        ];

        // Add sample content
        for (const content of sampleContent) {
            try {
                await database.run(
                    `INSERT INTO content (title, description, type, s3_url, thumbnail_url, duration, file_size, tags)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [content.title, content.description, content.type, content.s3_url, content.thumbnail_url, content.duration, content.file_size, content.tags]
                );
                console.log(`✅ Added sample ${content.type}: ${content.title}`);
            } catch (err) {
                if (err.message.includes('UNIQUE') || err.code === '23505') {
                    console.log(`✅ Sample ${content.type} already exists: ${content.title}`);
                } else {
                    console.error(`Error adding sample content "${content.title}":`, err);
                }
            }
        }

        // Add sample categories
        console.log('🏷️  Adding sample categories...');
        const sampleCategories = [
            { name: 'Technology', type: 'podcast' },
            { name: 'Business', type: 'podcast' },
            { name: 'Education', type: 'presentation' },
            { name: 'Training', type: 'presentation' },
            { name: 'Guides', type: 'document' },
            { name: 'Reports', type: 'document' }
        ];

        // Add sample categories
        for (const category of sampleCategories) {
            try {
                await database.run(
                    'INSERT INTO categories (name, type) VALUES (?, ?)',
                    [category.name, category.type]
                );
                console.log(`✅ Added category: ${category.name} (${category.type})`);
            } catch (err) {
                if (err.message.includes('UNIQUE') || err.code === '23505') {
                    console.log(`✅ Category already exists: ${category.name} (${category.type})`);
                } else {
                    console.error(`Error adding category "${category.name}":`, err);
                }
            }
        }

        console.log('\n🎉 Database setup completed successfully!');
        console.log('\n📋 Admin Credentials:');
        console.log('   Username: gnaneshwar14');
        console.log('   Password: gnani@1429');
        console.log('\n🌐 Access URLs:');
        console.log('   Main Site: http://localhost:3000');
        console.log('   Admin Login: http://localhost:3000/admin-login');
        console.log('   Admin Dashboard: http://localhost:3000/admin-dashboard');

    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
}

// Run setup if called directly
if (require.main === module) {
    setupDatabase().then(() => {
        process.exit(0);
    });
}

module.exports = { setupDatabase };