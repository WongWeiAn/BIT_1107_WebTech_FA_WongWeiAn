// API Base URL
const API_BASE_URL = 'http://localhost:3000';

// Global variables
let currentUserId = null;
let allItems = []; // Store all items for filtering
let currentFilter = 'all'; // Track current filter
let currentSearchTerm = ''; // Track current search term

// ============ INITIALIZATION ============

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on index.html
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        checkAuth();
    }
    
    // Initialize form submission if form exists
    const itemForm = document.getElementById('itemForm');
    if (itemForm) {
        itemForm.addEventListener('submit', handleItemSubmit);
    }
    
    // Add search input event listener
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', handleSearchKeyup);
        searchInput.addEventListener('search', handleSearchClear);
    }
});

// ============ SEARCH HANDLERS ============

// Handle search input keyup events
function handleSearchKeyup(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
    filterItems();
}

// Handle search clear button
function handleSearchClear() {
    filterItems();
}

// ============ UTILITY FUNCTIONS ============

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\//g, "&#47;");
}

// Format date for display
function formatDisplayDate(dateString) {
    if (!dateString) return 'Date not specified';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid date';
    }
}

// ============ AUTHENTICATION FUNCTIONS ============

async function checkAuth() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/auth-status`, {
            credentials: 'include'
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        const navUsername = document.getElementById('navUsername');
        const logoutBtn = document.querySelector('.logout-btn');
        
        if (data.loggedIn) {
            currentUserId = data.user.id;
            const username = escapeHtml(data.user.username);
            
            if (navUsername) {
                navUsername.innerText = username;
            }
            
            if (logoutBtn) {
                logoutBtn.style.display = 'inline-flex';
            }
            loadItems();
        } else {
            if (navUsername) {
                navUsername.innerText = 'Guest';
            }
            
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
            }
            window.location.href = `${API_BASE_URL}/auth.html`;
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = `${API_BASE_URL}/auth.html`;
    }
}

async function logout() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (res.ok) {
            window.location.href = `${API_BASE_URL}/auth.html`;
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Make logout available globally
window.logout = logout;

// ============ FILTER FUNCTIONS ============

// Filter items by category and search term
function filterItems(filterType) {
    if (typeof filterType === 'string') {
        currentFilter = filterType;
        updateActiveFilterButton(filterType);
    }
    
    const searchInput = document.getElementById('searchInput');
    currentSearchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    let filteredItems = [...allItems];
    
    // Apply category filter
    if (currentFilter !== 'all') {
        const filterValue = currentFilter === 'lost' ? 'Lost' : 'Found';
        filteredItems = filteredItems.filter(item => item.category === filterValue);
    }
    
    // Apply search filter
    if (currentSearchTerm !== '') {
        filteredItems = filteredItems.filter(item => {
            const searchableFields = [
                (item.title || '').toLowerCase(),
                (item.description || '').toLowerCase(),
                (item.location || '').toLowerCase(),
                (item.email_id || '').toLowerCase(),
                (item.contact_info || '').toLowerCase(),
                (item.category || '').toLowerCase(),
                (item.status || '').toLowerCase(),
                (item.username || '').toLowerCase()
            ];
            
            return searchableFields.some(field => field.includes(currentSearchTerm));
        });
    }
    
    displayItems(filteredItems);
    updateItemsCount(filteredItems.length);
}

// Update active filter button
function updateActiveFilterButton(filterType) {
    const buttons = {
        all: document.getElementById('filterAll'),
        lost: document.getElementById('filterLost'),
        found: document.getElementById('filterFound')
    };
    
    Object.values(buttons).forEach(btn => {
        if (btn) btn.classList.remove('active');
    });
    
    if (buttons[filterType]) {
        buttons[filterType].classList.add('active');
    }
}

// Update items count display
function updateItemsCount(count) {
    const countElement = document.getElementById('itemsCount');
    if (countElement) {
        countElement.innerText = `${count} item${count !== 1 ? 's' : ''}`;
    }
}

// Display filtered items
function displayItems(items) {
    const itemList = document.getElementById('itemList');
    if (!itemList) return;
    
    if (items.length === 0) {
        let message = '<div class="no-results">';
        message += '<i class="fas fa-search"></i>';
        message += '<p>No items found matching your criteria.</p>';
        
        if (currentSearchTerm) {
            message += `<p>No results for "<strong>${escapeHtml(currentSearchTerm)}</strong>"</p>`;
            message += `<p style="margin-top: 1rem;">Try searching by:</p>`;
            message += `<ul style="list-style: none; padding: 0; margin-top: 0.5rem; text-align: left; display: inline-block;">`;
            message += `<li>• Item name</li>`;
            message += `<li>• Description</li>`;
            message += `<li>• Location</li>`;
            message += `<li>• Email address</li>`;
            message += `<li>• Phone number</li>`;
            message += `</ul>`;
        }
        
        if (currentFilter !== 'all') {
            message += `<p style="margin-top: 0.5rem;">No ${currentFilter} items found</p>`;
        }
        
        message += '<p style="margin-top: 1.5rem; font-size: 0.9rem; color: #94a3b8;">';
        message += '<small>Try different keywords or clear filters</small>';
        message += '</p>';
        message += '</div>';
        
        itemList.innerHTML = message;
        return;
    }
    
    itemList.innerHTML = '';
    items.forEach(item => {
        const card = createItemCard(item);
        itemList.appendChild(card);
    });
}

// ============ ITEM FUNCTIONS ============

// Load all items
async function loadItems() {
    const itemList = document.getElementById('itemList');
    if (!itemList) return;
    
    itemList.innerHTML = '<div class="loading">Loading items...</div>';
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/items`, {
            credentials: 'include'
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        allItems = await res.json();
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        currentFilter = 'all';
        currentSearchTerm = '';
        updateActiveFilterButton('all');
        displayItems(allItems);
        updateItemsCount(allItems.length);
        
    } catch (error) {
        console.error('Error loading items:', error);
        itemList.innerHTML = '<p class="error-message">Failed to load items. Please refresh the page.</p>';
    }
}

// Create item card element
function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.setAttribute('data-id', item.id);
    
    const formattedDate = formatDisplayDate(item.item_date);
    
    let actions = '';
    if (currentUserId && item.user_id === currentUserId) {
        actions = `
            <button onclick="deleteItem(${item.id})" class="del-btn" title="Delete item">
                <i class="fas fa-trash"></i>
            </button>
        `;
    }
    
    card.innerHTML = `
        <div class="card-left">
            <h3>
                ${escapeHtml(item.title)}
                <span class="category-badge ${item.category.toLowerCase()}">${item.category}</span>
            </h3>
            <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(item.location)}</p>
            <p><i class="fas fa-calendar"></i> ${formattedDate}</p>
            <p>
                <i class="fas fa-tag"></i> Status: 
                <span class="status-badge ${item.status.toLowerCase()}">${item.status}</span>
            </p>
            <p><i class="fas fa-envelope"></i> ${escapeHtml(item.email_id)}</p>
            ${item.contact_info ? `<p><i class="fas fa-phone"></i> ${escapeHtml(item.contact_info)}</p>` : ''}
        </div>
        <div class="card-right">
            <button onclick="viewDetails(${item.id})" class="view-btn">
                <i class="fas fa-eye"></i> View
            </button>
            ${actions}
        </div>
    `;
    
    return card;
}

// Handle item form submission
async function handleItemSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const location = document.getElementById('location').value;
    const item_date = document.getElementById('item_date').value;
    const email_id = document.getElementById('email_id').value;
    const contact_info = document.getElementById('contact_info').value;
    const imageFile = document.getElementById('image').files[0];
    
    // Validation
    if (title.length < 3) {
        alert('Title must be at least 3 characters long');
        return;
    }
    
    if (description.length < 10) {
        alert('Description must be at least 10 characters long');
        return;
    }
    
    if (location.length < 3) {
        alert('Location must be at least 3 characters long');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_id)) {
        alert('Please enter a valid email address');
        return;
    }
    
    if (contact_info && contact_info.length > 0) {
        const phoneRegex = /^[0-9+\-\s()]{8,15}$/;
        if (!phoneRegex.test(contact_info)) {
            alert('Please enter a valid phone number');
            return;
        }
    }
    
    if (!item_date) {
        alert('Please select a date');
        return;
    }
    
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('location', location);
    formData.append('item_date', item_date);
    formData.append('email_id', email_id);
    formData.append('contact_info', contact_info);
    
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/items`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        
        const data = await res.json();
        
        if (res.ok) {
            alert('Item reported successfully!');
            e.target.reset();
            loadItems();
        } else {
            if (data.errors) {
                alert('Validation errors:\n' + data.errors.join('\n'));
            } else {
                alert('Error: ' + (data.error || 'Failed to submit item'));
            }
        }
    } catch (error) {
        console.error('Submission failed:', error);
        alert('Network error. Please try again.');
    }
}

// View item details
async function viewDetails(id) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/items/${id}`, {
            credentials: 'include'
        });
        
        if (!res.ok) {
            const error = await res.json();
            alert('Error: ' + (error.error || 'Failed to load item details'));
            return;
        }
        
        const item = await res.json();
        
        const modalBody = document.getElementById('modalBody');
        if (!modalBody) return;
        
        const formattedDate = formatDisplayDate(item.item_date);
        const postedDate = formatDisplayDate(item.created_at);
        
        let actions = '';
        if (currentUserId && item.user_id === currentUserId && item.status === 'Active') {
            actions = `
                <div class="modal-actions">
                    <button onclick="updateStatus(${item.id}, 'Claimed')" class="action-btn claim-btn">
                        <i class="fas fa-check-circle"></i> Mark as Claimed
                    </button>
                    <button onclick="updateStatus(${item.id}, 'Resolved')" class="action-btn claim-btn" style="background: #3b82f6;">
                        <i class="fas fa-check-double"></i> Mark as Resolved
                    </button>
                    <button onclick="deleteItem(${item.id})" class="action-btn delete-btn">
                        <i class="fas fa-trash"></i> Delete Item
                    </button>
                </div>
            `;
        } else if (currentUserId && item.user_id === currentUserId) {
            actions = `
                <div class="modal-actions">
                    <button onclick="deleteItem(${item.id})" class="action-btn delete-btn">
                        <i class="fas fa-trash"></i> Delete Item
                    </button>
                </div>
            `;
        }
        
        const imagePath = item.image_path ? `${API_BASE_URL}${item.image_path}` : null;
        
        modalBody.innerHTML = `
            ${imagePath ? `<img src="${imagePath}" class="modal-img" alt="Item image" onerror="this.style.display='none'">` : ''}
            
            <div class="modal-section">
                <strong>Title</strong>
                <p>${escapeHtml(item.title)}</p>
            </div>
            
            <div class="modal-section">
                <strong>Category</strong>
                <p><span class="category-badge ${item.category.toLowerCase()}">${item.category}</span></p>
            </div>
            
            <div class="modal-section">
                <strong>Description</strong>
                <p>${escapeHtml(item.description) || 'No description provided'}</p>
            </div>
            
            <div class="modal-section">
                <strong>Location</strong>
                <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(item.location)}</p>
            </div>
            
            <div class="modal-section">
                <strong>Date Lost/Found</strong>
                <p><i class="fas fa-calendar"></i> ${formattedDate}</p>
            </div>
            
            <div class="modal-section contact">
                <strong>Contact Information</strong>
                <p><i class="fas fa-envelope"></i> Email: ${escapeHtml(item.email_id)}</p>
                ${item.contact_info ? `<p><i class="fas fa-phone"></i> Phone: ${escapeHtml(item.contact_info)}</p>` : ''}
            </div>
            
            <div class="modal-footer">
                <div>
                    <strong>Status:</strong> 
                    <span class="status-badge ${item.status.toLowerCase()}">${item.status}</span>
                </div>
                <div>
                    <small>Posted: ${postedDate} by ${escapeHtml(item.username || 'Anonymous')}</small>
                </div>
            </div>
            
            ${actions}
        `;
        
        document.getElementById('detailsModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading item details:', error);
        alert('Failed to load item details. Please try again.');
    }
}

// Delete item
async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        return;
    }
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/items/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (res.ok) {
            alert('Item deleted successfully!');
            closeModal();
            loadItems();
        } else {
            const error = await res.json();
            alert('Error: ' + (error.error || 'Failed to delete item'));
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Network error. Please try again.');
    }
}

// Update item status
async function updateStatus(id, newStatus) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/items/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (res.ok) {
            alert(`Item marked as ${newStatus}!`);
            closeModal();
            loadItems();
        } else {
            const error = await res.json();
            alert('Error: ' + (error.error || 'Failed to update status'));
        }
    } catch (error) {
        console.error('Update error:', error);
        alert('Network error. Please try again.');
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ============ GLOBAL EXPORTS ============

window.viewDetails = viewDetails;
window.deleteItem = deleteItem;
window.updateStatus = updateStatus;
window.closeModal = closeModal;
window.filterItems = filterItems;

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('detailsModal');
    if (event.target === modal) {
        closeModal();
    }
};

// Handle escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});