// ==========================================
// CAMPUSDASH AI CHATBOT
// ==========================================

class DashDropChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.createChatButton();
        this.createChatPanel();
        this.setupEventListeners();
        this.addWelcomeMessage();
    }

    createChatButton() {
        const button = document.createElement('button');
        button.id = 'chatbot-button';
        button.className = 'chatbot-fab';
        button.innerHTML = '<i data-lucide="message-circle" width="28"></i>';
        button.setAttribute('aria-label', 'Open chat');
        document.body.appendChild(button);
    }

    createChatPanel() {
        const panel = document.createElement('div');
        panel.id = 'chatbot-panel';
        panel.className = 'chatbot-panel hidden';
        panel.innerHTML = `
            <div class="chatbot-header">
                <div style="display: flex; align-items: center; gap: var(--space-3);">
                    <div class="chatbot-avatar">
                        <i data-lucide="zap" width="20"></i>
                    </div>
                    <div>
                        <h3 class="font-black text-lg">DashBot</h3>
                        <p class="text-sm" style="color: var(--gray-400);">Always here to help</p>
                    </div>
                </div>
                <button id="chatbot-close" class="chatbot-close-btn">
                    <i data-lucide="x" width="24"></i>
                </button>
            </div>
            
            <div class="chatbot-messages" id="chatbot-messages"></div>
            
            <div class="chatbot-quick-questions" id="quick-questions">
                <p class="text-sm font-bold mb-3" style="color: var(--gray-600);">Quick Questions:</p>
                <button class="chatbot-quick-btn" data-question="How does QR pickup work?">
                    <i data-lucide="qr-code" width="16"></i>
                    How QR pickup works
                </button>
                <button class="chatbot-quick-btn" data-question="How does urgent mode work?">
                    <i data-lucide="zap" width="16"></i>
                    Urgent mode explained
                </button>
                <button class="chatbot-quick-btn" data-question="How to become a dasher?">
                    <i data-lucide="user-plus" width="16"></i>
                    Become a dasher
                </button>
                <button class="chatbot-quick-btn" data-question="Where can I track my order?">
                    <i data-lucide="map-pin" width="16"></i>
                    Track my order
                </button>
                <button class="chatbot-quick-btn" data-question="What delivery locations are allowed?">
                    <i data-lucide="map" width="16"></i>
                    Delivery locations
                </button>
            </div>
            
            <div class="chatbot-input-area">
                <input 
                    type="text" 
                    id="chatbot-input" 
                    class="chatbot-input" 
                    placeholder="Type your message..."
                    autocomplete="off"
                >
                <button id="chatbot-send" class="chatbot-send-btn">
                    <i data-lucide="send" width="20"></i>
                </button>
            </div>
        `;
        document.body.appendChild(panel);
    }

    setupEventListeners() {
        const button = document.getElementById('chatbot-button');
        const closeBtn = document.getElementById('chatbot-close');
        const sendBtn = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');
        const quickBtns = document.querySelectorAll('.chatbot-quick-btn');

        button.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.getAttribute('data-question');
                this.handleQuickQuestion(question);
            });
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('chatbot-panel');
        const button = document.getElementById('chatbot-button');

        if (this.isOpen) {
            panel.classList.remove('hidden');
            button.style.transform = 'scale(0)';
            setTimeout(() => {
                document.getElementById('chatbot-input').focus();
            }, 300);
        } else {
            panel.classList.add('hidden');
            button.style.transform = 'scale(1)';
        }

        // Reinitialize lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    addWelcomeMessage() {
        this.addMessage('bot', "Hi! I'm DashBot. Need help? 👋");
    }

    addMessage(sender, text, isTyping = false) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message chatbot-message-${sender}`;

        if (isTyping) {
            messageDiv.innerHTML = `
                <div class="chatbot-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `<p>${text}</p>`;
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        this.messages.push({ sender, text, timestamp: new Date() });
    }

    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();

        if (!message) return;

        // Add user message
        this.addMessage('user', message);
        input.value = '';

        // Hide quick questions after first message
        document.getElementById('quick-questions').style.display = 'none';

        // Show typing indicator
        this.addMessage('bot', '', true);

        // Simulate AI response delay
        setTimeout(async () => {
            // Remove typing indicator
            const messages = document.getElementById('chatbot-messages');
            messages.removeChild(messages.lastChild);

            // Get AI response
            const response = await this.getAIResponse(message);
            this.addMessage('bot', response);
        }, 1000 + Math.random() * 1000);
    }

    handleQuickQuestion(question) {
        this.addMessage('user', question);
        document.getElementById('quick-questions').style.display = 'none';

        // Show typing indicator
        setTimeout(() => {
            this.addMessage('bot', '', true);

            setTimeout(() => {
                const messages = document.getElementById('chatbot-messages');
                messages.removeChild(messages.lastChild);

                const answer = this.getQuickAnswer(question);
                this.addMessage('bot', answer);
            }, 800);
        }, 300);
    }

    getQuickAnswer(question) {
        const answers = {
            'How does QR pickup work?':
                "It's simple! 1️⃣ Order via the official canteen app 2️⃣ Upload your QR screenshot on DashDrop 3️⃣ Our dasher picks it up using your QR 4️⃣ Get it delivered to your location! 🎉",

            'How does urgent mode work?':
                "Urgent mode prioritizes your request! 🚀 It adds ₹15 to the tip, notifies dashers immediately with a red alert, and your order gets picked up faster. Perfect for when you're in a hurry!",

            'How to become a dasher?':
                "Want to earn? Click 'Become a Dasher' in the menu! You'll need: ✅ Student ID ✅ Phone number ✅ Available time. Start accepting requests and earn tips! 💰",

            'Where can I track my order?':
                "Click the 'Track Order' button in the menu or bottom navbar! You'll see real-time updates: Accepted → Picked Up → On the Way → Delivered 📍",

            'What delivery locations are allowed?':
                "We deliver to: 🏠 All Hostel Blocks (A, B, C, D) 📚 Library 🔬 Lab Blocks 🎓 Lecture Halls 📖 Study Rooms. Anywhere on campus!"
        };

        return answers[question] || "I'm here to help! Ask me anything about DashDrop.";
    }

    async getAIResponse(message) {
        // Placeholder for LLM integration
        // TODO: Integrate with OpenAI, Gemini, or local LLM

        const lowerMessage = message.toLowerCase();

        // Simple keyword matching for demo
        if (lowerMessage.includes('qr') || lowerMessage.includes('pickup')) {
            return "QR pickup is easy! Order via the canteen app, upload your QR, and we'll deliver it. Need more details?";
        } else if (lowerMessage.includes('urgent')) {
            return "Urgent mode adds ₹15 and prioritizes your delivery. Your dasher will be notified immediately!";
        } else if (lowerMessage.includes('dasher') || lowerMessage.includes('earn')) {
            return "Become a dasher to earn money! Click 'Become a Dasher' to get started. It's flexible and rewarding! 💰";
        } else if (lowerMessage.includes('track')) {
            return "Track your order anytime! Click 'Track Order' in the menu to see live updates.";
        } else if (lowerMessage.includes('location') || lowerMessage.includes('deliver')) {
            return "We deliver to all hostels, library, labs, and lecture halls. Anywhere on campus!";
        } else if (lowerMessage.includes('tip')) {
            return "Tips go directly to your dasher! Minimum ₹15. Higher tips = faster pickup! 🚀";
        } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
            return "I can help with: QR pickup, urgent mode, becoming a dasher, tracking orders, and delivery locations. What would you like to know?";
        } else {
            return "I'm here to help! You can ask me about QR pickup, urgent deliveries, becoming a dasher, or tracking orders. What do you need?";
        }

        // For production, use this:
        // return await this.sendToLLM(message);
    }

    async sendToLLM(message) {
        // Placeholder for LLM API integration
        // Example for OpenAI:
        /*
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_API_KEY'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are DashBot, a helpful assistant for DashDrop delivery platform.' },
                    { role: 'user', content: message }
                ]
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
        */

        // Example for Gemini:
        /*
        const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': 'YOUR_API_KEY'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are DashBot for DashDrop. ${message}`
                    }]
                }]
            })
        });
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
        */

        return "LLM integration placeholder - add your API key above";
    }
}

// Initialize chatbot when DOM is ready
let chatbot;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        chatbot = new DashDropChatbot();
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });
} else {
    chatbot = new DashDropChatbot();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}
