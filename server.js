const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();

// CORS middleware
app.use(cors({
    origin: ['http://localhost', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'qiu_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}));

// Create uploads directory
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'campus_lost_found'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
    } else {
        console.log('✅ Connected to database');
    }
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Please login first' });
    }
};

// ============ TEST ROUTES ============
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

app.get('/api/debug', (req, res) => {
    res.json({ 
        session: req.session.user || 'No session',
        time: new Date().toISOString()
    });
});

// ============ AUTH ROUTES ============

// Check auth status
app.get('/api/auth-status', (req, res) => {
    res.json({ 
        loggedIn: !!req.session.user, 
        user: req.session.user || null 
    });
});

// Register new user
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields required' });
    }
    
    if (username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ error: 'Username or email already exists' });
                    }
                    console.error('Registration error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                res.status(201).json({ message: 'Registration successful' });
            }
        );
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login - Using email only
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password: '***' });
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const user = results[0];
        const valid = await bcrypt.compare(password, user.password);
        
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email
        };
        
        console.log('Login successful for user:', user.username);
        res.json({ 
            message: 'Login successful', 
            user: req.session.user 
        });
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logout successful' });
    });
});

// ============ DIRECT PASSWORD RESET ROUTES ============

// Search for user by username or email
app.post('/api/search-user', (req, res) => {
    const { query } = req.body;
    
    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Search for user by username or email
    db.query(
        'SELECT id, username, email FROM users WHERE username = ? OR email = ?',
        [query, query],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'User not found', found: false });
            }
            
            // Return user info (without password)
            const user = results[0];
            res.json({ 
                found: true, 
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        }
    );
});

// Direct password reset (no email token)
app.post('/api/reset-password-direct', async (req, res) => {
    const { userId, newPassword } = req.body;
    
    if (!userId || !newPassword) {
        return res.status(400).json({ error: 'User ID and new password are required' });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password in database
        db.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId],
            (err, result) => {
                if (err) {
                    console.error('Error updating password:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }
                
                console.log('✅ Password reset successful for user ID:', userId);
                res.json({ message: 'Password reset successful' });
            }
        );
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ ITEM ROUTES ============

// Get all items
app.get('/api/items', (req, res) => {
    db.query(
        'SELECT i.*, u.username FROM items i LEFT JOIN users u ON i.user_id = u.id ORDER BY i.created_at DESC',
        (err, results) => {
            if (err) {
                console.error('Error fetching items:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(results);
        }
    );
});

// Get single item by ID
app.get('/api/items/:id', (req, res) => {
    const itemId = req.params.id;
    
    if (isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid item ID' });
    }
    
    db.query(
        'SELECT i.*, u.username FROM items i LEFT JOIN users u ON i.user_id = u.id WHERE i.id = ?',
        [itemId],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'Item not found' });
            }
            
            res.json(results[0]);
        }
    );
});

// Create new item (with image upload)
app.post('/api/items', requireAuth, upload.single('image'), (req, res) => {
    console.log('=== ITEM CREATION ===');
    console.log('User:', req.session.user);
    console.log('Body:', req.body);
    
    const { title, description, category, location, item_date, email_id, contact_info } = req.body;
    
    // Validation
    const errors = [];
    
    if (!title || title.trim().length < 3) {
        errors.push('Title must be at least 3 characters');
    }
    
    if (!description || description.trim().length < 10) {
        errors.push('Description must be at least 10 characters');
    }
    
    if (!category || !['Lost', 'Found'].includes(category)) {
        errors.push('Invalid category');
    }
    
    if (!location || location.trim().length < 3) {
        errors.push('Location must be at least 3 characters');
    }
    
    if (!item_date) {
        errors.push('Date is required');
    }
    
    if (!email_id) {
        errors.push('Email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email_id)) {
            errors.push('Invalid email format');
        }
    }
    
    if (errors.length > 0) {
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
        return res.status(400).json({ errors });
    }
    
    const image_path = req.file ? `/uploads/${req.file.filename}` : null;
    
    // Sanitize inputs
    const sanitizedTitle = title.replace(/<[^>]*>/g, '');
    const sanitizedDescription = description.replace(/<[^>]*>/g, '');
    const sanitizedLocation = location.replace(/<[^>]*>/g, '');
    const sanitizedEmail = email_id.replace(/<[^>]*>/g, '');
    const sanitizedContact = contact_info ? contact_info.replace(/<[^>]*>/g, '') : '';
    
    const query = `INSERT INTO items 
        (user_id, title, description, category, location, item_date, email_id, contact_info, image_path) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
        req.session.user.id,
        sanitizedTitle,
        sanitizedDescription,
        category,
        sanitizedLocation,
        item_date,
        sanitizedEmail,
        sanitizedContact || null,
        image_path
    ];
    
    console.log('Query:', query);
    console.log('Values:', values);
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            if (req.file) {
                fs.unlink(req.file.path, () => {});
            }
            return res.status(500).json({ 
                error: 'Database error', 
                details: err.message,
                code: err.code 
            });
        }
        
        console.log('✅ Item created with ID:', result.insertId);
        res.status(201).json({ 
            message: 'Item created successfully',
            id: result.insertId 
        });
    });
});

// Update item status
app.put('/api/items/:id', requireAuth, (req, res) => {
    const { status } = req.body;
    const itemId = req.params.id;
    
    if (!status || !['Active', 'Claimed', 'Resolved'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    if (isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid item ID' });
    }
    
    // Check if item exists and belongs to user
    db.query(
        'SELECT user_id FROM items WHERE id = ?',
        [itemId],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'Item not found' });
            }
            
            if (results[0].user_id !== req.session.user.id) {
                return res.status(403).json({ error: 'You can only update your own items' });
            }
            
            db.query(
                'UPDATE items SET status = ? WHERE id = ?',
                [status, itemId],
                (err, result) => {
                    if (err) {
                        console.error('Error updating item:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    
                    res.json({ message: 'Status updated successfully' });
                }
            );
        }
    );
});

// Delete item
app.delete('/api/items/:id', requireAuth, (req, res) => {
    const itemId = req.params.id;
    
    if (isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid item ID' });
    }
    
    // Get image path first
    db.query(
        'SELECT image_path FROM items WHERE id = ? AND user_id = ?',
        [itemId, req.session.user.id],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'Item not found or unauthorized' });
            }
            
            const imagePath = results[0].image_path;
            
            // Delete from database
            db.query(
                'DELETE FROM items WHERE id = ? AND user_id = ?',
                [itemId, req.session.user.id],
                (err, result) => {
                    if (err) {
                        console.error('Error deleting item:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    
                    // Delete image file if exists
                    if (imagePath) {
                        const fullPath = path.join(__dirname, imagePath);
                        fs.unlink(fullPath, (err) => {
                            if (err) console.error('Error deleting image file:', err);
                        });
                    }
                    
                    res.json({ message: 'Item deleted successfully' });
                }
            );
        }
    );
});

// ============ STATIC FILES ============
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// ============ ERROR HANDLING ============

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📍 Test API: http://localhost:${PORT}/api/test`);
    console.log(`📍 Open: http://localhost:3000/auth.html`);
});