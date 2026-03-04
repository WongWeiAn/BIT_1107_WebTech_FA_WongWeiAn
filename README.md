# QIU Campus Lost & Found Management System

A full-stack web application for managing lost and found items at Quest International University.

## 📋 Features

### User Authentication
- Register with username, email, and password
- Login with email and password
- Password reset functionality (search by username/email)
- Session management with secure cookies

### Item Management
- Report lost items with details (title, description, location, date, contact info)
- Report found items with similar details
- Upload images for items (JPEG, PNG, GIF, WEBP - max 5MB)
- View all items with filtering options
- View detailed item information in modal
- Update item status (Active → Claimed → Resolved)
- Delete items (only items posted by the logged-in user)
- Automatic cleanup of uploaded images when items are deleted

### Search & Filter
- Filter items by: All Items, Lost Items, Found Items
- Real-time search across multiple fields:
  - Item title
  - Description
  - Location
  - Email address
  - Phone number
  - Category
  - Status
  - Username
- Items count display showing number of results
- No results message with search suggestions

### Security Features
- Password hashing with bcrypt (10 rounds)
- Input sanitization to prevent XSS attacks
- Parameterized queries to prevent SQL injection
- Session-based authentication
- Environment variables for sensitive data
- File upload validation (type and size limits)
- Authentication middleware for protected routes
- Owner-only access for update/delete operations

### Performance Optimizations
- Responsive images
- Efficient database queries with proper indexing
- Client-side caching
- Debounced search to reduce server load
- Lazy loading for images
- Minified CSS and JavaScript

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Flexbox, Grid, Animations
- **JavaScript (ES6+)** - Async/await, Fetch API, DOM manipulation
- **Font Awesome 6** - Icons and UI elements
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **Express Session** - Session management
- **Multer** - File upload handling
- **Bcrypt.js** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📁 Project Structur