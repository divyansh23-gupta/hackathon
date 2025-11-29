// ==========================================
// CAMPUSDASH COMMUNITY HUB - INTERACTIVE FEATURES
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeDiscussions();
    initializeChat();
    initializeHelp();
    initializeFAB();
});

// ==========================================
// TAB NAVIGATION
// ==========================================

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');

            // Scroll to top of content
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// ==========================================
// DISCUSSIONS SECTION
// ==========================================

function initializeDiscussions() {
    // Category filtering
    const categoryFilters = document.querySelectorAll('.filter-chip[data-category]');
    const discussionCards = document.querySelectorAll('.discussion-card');

    categoryFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            const category = filter.getAttribute('data-category');

            // Update active filter
            categoryFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');

            // Filter discussions
            discussionCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.4s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Upvote functionality
    const upvoteButtons = document.querySelectorAll('.upvote-btn');
    upvoteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const isUpvoted = button.classList.contains('upvoted');
            const countSpan = button.querySelector('span');
            let count = parseInt(countSpan.textContent);

            if (isUpvoted) {
                button.classList.remove('upvoted');
                count--;
            } else {
                button.classList.add('upvoted');
                count++;
            }

            countSpan.textContent = count;

            // Animation
            button.style.transform = 'scale(1.1)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 200);
        });
    });

    // New Discussion Button
    const newDiscussionBtn = document.getElementById('new-discussion-btn');
    if (newDiscussionBtn) {
        newDiscussionBtn.addEventListener('click', () => {
            showNewDiscussionModal();
        });
    }
}

function showNewDiscussionModal() {
    // Simple alert for demo - in production, this would open a modal
    const title = prompt('Enter discussion title:');
    if (title) {
        const category = prompt('Enter category (general/academic/events/lost-found/marketplace):') || 'general';
        const content = prompt('Enter discussion content:');
        
        if (content) {
            addNewDiscussion(title, category, content);
            alert('Discussion posted successfully! 🎉');
        }
    }
}

function addNewDiscussion(title, category, content) {
    const feed = document.getElementById('discussions-feed');
    const newCard = document.createElement('div');
    newCard.className = 'discussion-card';
    newCard.setAttribute('data-category', category);
    
    const categoryBadges = {
        'general': 'badge-gray',
        'academic': 'badge-green',
        'events': 'badge-purple',
        'lost-found': 'badge-red',
        'marketplace': 'badge-yellow'
    };

    const categoryLabels = {
        'general': 'General',
        'academic': 'Academic',
        'events': 'Events',
        'lost-found': 'Lost & Found',
        'marketplace': 'Marketplace'
    };

    newCard.innerHTML = `
        <div class="discussion-header">
            <div class="discussion-avatar">ME</div>
            <div style="flex: 1;">
                <div class="discussion-meta">
                    <span class="font-bold">You</span>
                    <span>•</span>
                    <span>Just now</span>
                    <span class="badge ${categoryBadges[category]}">${categoryLabels[category]}</span>
                </div>
                <h3 class="discussion-title">${title}</h3>
                <p class="discussion-excerpt">${content}</p>
                <div class="discussion-stats">
                    <button class="upvote-btn">
                        <i data-lucide="arrow-up" width="16"></i>
                        <span>0</span>
                    </button>
                    <div class="stat-item">
                        <i data-lucide="message-square" width="16"></i>
                        <span>0 replies</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    feed.insertBefore(newCard, feed.firstChild);
    
    // Reinitialize icons and upvote buttons
    lucide.createIcons();
    initializeDiscussions();
    
    // Scroll to new discussion
    newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ==========================================
// CAMPUS CHAT SECTION
// ==========================================

function initializeChat() {
    const chatRooms = document.querySelectorAll('.chat-room-item');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');

    // Room switching
    chatRooms.forEach(room => {
        room.addEventListener('click', () => {
            chatRooms.forEach(r => r.classList.remove('active'));
            room.classList.add('active');
            
            const roomName = room.getAttribute('data-room');
            loadChatRoom(roomName);
        });
    });

    // Send message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addChatMessage(message, true);
            chatInput.value = '';
            
            // Simulate response after 1-2 seconds
            setTimeout(() => {
                const responses = [
                    "That's a great idea!",
                    "I agree with you!",
                    "Thanks for sharing!",
                    "Count me in!",
                    "Let me know if you need help with that."
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addChatMessage(randomResponse, false);
            }, 1000 + Math.random() * 1000);
        }
    }

    chatSendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function loadChatRoom(roomName) {
    const chatMessages = document.getElementById('chat-messages');
    
    // Sample messages for different rooms
    const roomMessages = {
        'general': [
            { sender: 'Rahul Kumar', avatar: 'RK', text: 'Hey everyone! Anyone up for a basketball match this evening?', time: '2:45 PM', own: false },
            { sender: 'Priya Mehta', avatar: 'PM', text: 'Count me in! What time?', time: '2:47 PM', own: false },
        ],
        'study': [
            { sender: 'Sneha Kapoor', avatar: 'SK', text: 'Anyone studying for the DSA exam tomorrow?', time: '1:30 PM', own: false },
            { sender: 'Vikram Reddy', avatar: 'VR', text: 'Yes! Want to do a quick revision session?', time: '1:32 PM', own: false },
        ],
        'events': [
            { sender: 'Neha Joshi', avatar: 'NJ', text: 'Tech Fest registrations are open! Who\'s participating?', time: '11:00 AM', own: false },
            { sender: 'Arjun Singh', avatar: 'AS', text: 'I\'m forming a team for the hackathon!', time: '11:15 AM', own: false },
        ],
        'hostel': [
            { sender: 'Divya Mehta', avatar: 'DM', text: 'Anyone else having issues with the WiFi in Block B?', time: '10:00 AM', own: false },
            { sender: 'Karan Patel', avatar: 'KP', text: 'Same here! Already reported to the admin.', time: '10:05 AM', own: false },
        ],
        'tech': [
            { sender: 'Riya Sharma', avatar: 'RS', text: 'Can someone help me with Git merge conflicts?', time: '9:00 AM', own: false },
            { sender: 'Amit Kumar', avatar: 'AK', text: 'Sure! Share your screen and I can help.', time: '9:05 AM', own: false },
        ]
    };

    const messages = roomMessages[roomName] || roomMessages['general'];
    
    chatMessages.innerHTML = '';
    messages.forEach(msg => {
        addChatMessage(msg.text, msg.own, msg.sender, msg.avatar, msg.time);
    });
}

function addChatMessage(text, isOwn = false, sender = 'You', avatar = 'ME', time = null) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isOwn ? 'own' : ''}`;
    
    const currentTime = time || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="chat-avatar">${avatar}</div>
        <div>
            <div class="chat-bubble">
                <div class="chat-sender">${sender}</div>
                <div class="chat-text">${text}</div>
                <div class="chat-time">${currentTime}</div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Animation
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(10px)';
    setTimeout(() => {
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 10);
}

// ==========================================
// HELP & Q&A SECTION
// ==========================================

function initializeHelp() {
    // Category filtering for help
    const helpFilters = document.querySelectorAll('.filter-chip[data-help-category]');
    const helpCards = document.querySelectorAll('.help-card');

    helpFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            const category = filter.getAttribute('data-help-category');

            // Update active filter
            helpFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');

            // Filter help requests
            helpCards.forEach(card => {
                const cardCategory = card.getAttribute('data-help-category');
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.4s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Ask for Help Button
    const askHelpBtn = document.getElementById('ask-help-btn');
    if (askHelpBtn) {
        askHelpBtn.addEventListener('click', () => {
            showAskHelpModal();
        });
    }
}

function showAskHelpModal() {
    // Simple alert for demo - in production, this would open a modal
    const title = prompt('What do you need help with?');
    if (title) {
        const category = prompt('Category (academic/tech/campus/other):') || 'other';
        const description = prompt('Describe your problem in detail:');
        
        if (description) {
            addHelpRequest(title, category, description);
            alert('Help request posted! The community will respond soon. 🙌');
        }
    }
}

function addHelpRequest(title, category, description) {
    const feed = document.getElementById('help-feed');
    const newCard = document.createElement('div');
    newCard.className = 'help-card';
    newCard.setAttribute('data-help-category', category);
    
    const categoryBadges = {
        'academic': 'badge-green',
        'tech': 'badge-gray',
        'campus': 'badge-purple',
        'other': 'badge-yellow'
    };

    const categoryLabels = {
        'academic': 'Academic',
        'tech': 'Tech',
        'campus': 'Campus Life',
        'other': 'Other'
    };

    newCard.innerHTML = `
        <div class="help-header">
            <div>
                <span class="help-status open">
                    <i data-lucide="circle" width="8"></i> OPEN
                </span>
            </div>
            <span class="badge ${categoryBadges[category]}">${categoryLabels[category]}</span>
        </div>
        <h3 class="help-title">${title}</h3>
        <p class="help-description">${description}</p>
        <div class="help-footer">
            <div style="display: flex; gap: var(--space-4); align-items: center;">
                <div class="stat-item">
                    <i data-lucide="message-square" width="16"></i>
                    <span>0 answers</span>
                </div>
                <div class="stat-item">
                    <i data-lucide="thumbs-up" width="16"></i>
                    <span>0 helpful</span>
                </div>
            </div>
            <span class="text-sm" style="color: var(--gray-500);">Asked just now by You</span>
        </div>
    `;

    feed.insertBefore(newCard, feed.firstChild);
    
    // Reinitialize icons
    lucide.createIcons();
    
    // Scroll to new request
    newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ==========================================
// FLOATING ACTION BUTTON
// ==========================================

function initializeFAB() {
    const fab = document.getElementById('fab-btn');
    if (fab) {
        fab.addEventListener('click', () => {
            // Show quick action menu
            const actions = [
                '1. New Discussion',
                '2. Ask for Help',
                '3. Report Issue',
                'Cancel'
            ];
            
            const choice = prompt(actions.join('\n\n'));
            
            if (choice && choice.includes('1')) {
                showNewDiscussionModal();
            } else if (choice && choice.includes('2')) {
                showAskHelpModal();
            } else if (choice && choice.includes('3')) {
                alert('Report feature coming soon!');
            }
        });
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function formatTimestamp(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

// Auto-scroll chat to bottom on load
window.addEventListener('load', () => {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
