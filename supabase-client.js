// ==========================================
// SUPABASE CLIENT & BACKEND INTEGRATION
// ==========================================

// Supabase configuration
const SUPABASE_URL = 'https://aawvgjczrjcinnmupnba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhd3ZnamN6cmpjaW5ubXVwbmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTQxNzYsImV4cCI6MjA3OTk5MDE3Nn0.ygcCyvG3U-jcwIcCwG7nVgqH6v5p8-cFyAeBaHGXiqM';

// Initialize Supabase client (placeholder - add Supabase JS SDK)
let supabase = null;

function initSupabase() {
    // TODO: Add Supabase JS SDK via CDN in HTML
    // <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

    if (typeof createClient !== 'undefined') {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized');
    } else {
        console.warn('Supabase SDK not loaded - using mock mode');
    }
}

// ==========================================
// DATABASE FUNCTIONS
// ==========================================

// Create a new request
async function createRequest(requestData) {
    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('requests')
                .insert([{
                    buyer_id: requestData.buyerId || 'anonymous',
                    qr_image_url: requestData.qrImage,
                    delivery_location: requestData.deliveryLocation,
                    room: requestData.roomNumber,
                    tip: requestData.tip,
                    mode: requestData.mode,
                    status: 'pending',
                    pickup_point: requestData.pickupPoint || 'Food Court / Canteen',
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;

            // Send notification to dashers
            await sendNotification({
                type: 'new_request',
                requestId: data[0].id,
                urgent: requestData.mode === 'urgent',
                message: `New ${requestData.mode} request: ₹${requestData.tip} tip`
            });

            return { success: true, data: data[0] };
        } else {
            // Mock mode
            const mockRequest = {
                id: generateId(),
                ...requestData,
                status: 'pending',
                created_at: new Date().toISOString()
            };
            localStorage.setItem('currentPickupRequest', JSON.stringify(mockRequest));
            return { success: true, data: mockRequest };
        }
    } catch (error) {
        console.error('Error creating request:', error);
        return { success: false, error: error.message };
    }
}

// Accept a request (dasher)
async function acceptRequest(requestId, dasherId) {
    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('requests')
                .update({
                    runner_id: dasherId,
                    status: 'accepted',
                    accepted_at: new Date().toISOString()
                })
                .eq('id', requestId)
                .eq('status', 'pending') // Only accept if still pending
                .select();

            if (error) throw error;

            if (data && data.length > 0) {
                // Notify buyer
                await sendNotification({
                    type: 'request_accepted',
                    requestId: requestId,
                    message: 'Your request has been accepted by a dasher!'
                });

                return { success: true, data: data[0] };
            } else {
                return { success: false, error: 'Request already accepted by another dasher' };
            }
        } else {
            // Mock mode
            const request = JSON.parse(localStorage.getItem('currentPickupRequest') || '{}');
            request.status = 'accepted';
            request.runner_id = dasherId;
            localStorage.setItem('currentPickupRequest', JSON.stringify(request));
            return { success: true, data: request };
        }
    } catch (error) {
        console.error('Error accepting request:', error);
        return { success: false, error: error.message };
    }
}

// Update request status
async function updateStatus(requestId, newStatus) {
    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('requests')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', requestId)
                .select();

            if (error) throw error;

            // Send status update notification
            const statusMessages = {
                'picked_up': 'Your order has been picked up!',
                'on_the_way': 'Your dasher is on the way!',
                'delivered': 'Your order has been delivered! 🎉'
            };

            if (statusMessages[newStatus]) {
                await sendNotification({
                    type: 'status_update',
                    requestId: requestId,
                    status: newStatus,
                    message: statusMessages[newStatus]
                });
            }

            return { success: true, data: data[0] };
        } else {
            // Mock mode
            const request = JSON.parse(localStorage.getItem('currentPickupRequest') || '{}');
            request.status = newStatus;
            localStorage.setItem('currentPickupRequest', JSON.stringify(request));
            return { success: true, data: request };
        }
    } catch (error) {
        console.error('Error updating status:', error);
        return { success: false, error: error.message };
    }
}

// ==========================================
// REALTIME SUBSCRIPTIONS
// ==========================================

let requestsChannel = null;
let notificationsChannel = null;

// Subscribe to new requests (for dashers)
function subscribeToRequests(callback) {
    if (supabase) {
        requestsChannel = supabase
            .channel('requests')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'requests' },
                (payload) => {
                    console.log('New request:', payload.new);
                    callback(payload.new);
                }
            )
            .subscribe();
    } else {
        console.log('Mock mode: Request subscription not available');
    }
}

// Subscribe to notifications
function subscribeToNotifications(userId, callback) {
    if (supabase) {
        notificationsChannel = supabase
            .channel('notifications')
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    console.log('New notification:', payload.new);
                    callback(payload.new);
                    showNotificationToast(payload.new);
                }
            )
            .subscribe();
    } else {
        console.log('Mock mode: Notification subscription not available');
    }
}

// Unsubscribe from channels
function unsubscribeAll() {
    if (requestsChannel) {
        supabase.removeChannel(requestsChannel);
    }
    if (notificationsChannel) {
        supabase.removeChannel(notificationsChannel);
    }
}

// ==========================================
// NOTIFICATION SYSTEM
// ==========================================

// Send notification
async function sendNotification(notificationData) {
    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('notifications')
                .insert([{
                    user_id: notificationData.userId || 'all',
                    type: notificationData.type,
                    message: notificationData.message,
                    request_id: notificationData.requestId,
                    urgent: notificationData.urgent || false,
                    read: false,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;
        }

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('DashDrop', {
                body: notificationData.message,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                tag: notificationData.type,
                requireInteraction: notificationData.urgent
            });
        }

        // Play sound for urgent notifications
        if (notificationData.urgent) {
            playNotificationSound();
        }

        return { success: true };
    } catch (error) {
        console.error('Error sending notification:', error);
        return { success: false, error: error.message };
    }
}

// Request notification permission
async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return false;
}

// Show toast notification
function showNotificationToast(notification) {
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
        <div class="notification-icon">
            <i data-lucide="${notification.urgent ? 'alert-circle' : 'bell'}" width="20"></i>
        </div>
        <div class="notification-content">
            <p class="notification-title">${notification.type.replace('_', ' ').toUpperCase()}</p>
            <p class="notification-message">${notification.message}</p>
        </div>
    `;

    document.body.appendChild(toast);

    // Initialize lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Play notification sound
function playNotificationSound() {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuBzvLZiTYIGWi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmUgND1as5++wXRgIPpba8sZzKQUrgc7y2Yk2CBlou+3nnk0QDFCn4/C2YxwGOJLX8sx5LAUkd8fw3ZBACRRdtOvrqFUUCkaf4PK+bCEFMYfR89OCMwYebsDv45lIDQ9WrOfvsF0YCD6W2vLGcykFK4HO8tmJNggZaLvt555NEAxQp+PwtmMcBjiS1/LMeSwFJHfH8N2QQAoUXbTr66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuBzvLZiTYIGWi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF206+uoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmUgND1as5++wXRgIPpba8sZzKQUrgc7y2Yk2CBlou+3nnk0QDFCn4/C2YxwGOJLX8sx5LAUkd8fw3ZBACRRdtOvrqFUUCkaf4PK+bCEFMYfR89OCMwYebsDv45lIDQ9WrOfvsF0YCD6W2vLGcykFK4HO8tmJNggZaLvt555NEAxQp+PwtmMcBjiS1/LMeSwFJHfH8N2QQAoUXbTr66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuBzvLZiTYIGWi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF206+uoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmUgND1as5++wXRgIPpba8sZzKQUrgc7y2Yk2CBlou+3nnk0QDFCn4/C2YxwGOJLX8sx5LAUkd8fw3ZBACRRdtOvrqFUUCkaf4PK+bCEFMYfR89OCMwYebsDv45lIDQ9WrOfvsF0YCD6W2vLGcykFK4HO8tmJNggZaLvt555NEAxQp+PwtmMcBjiS1/LMeSwFJHfH8N2QQAoUXbTr66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuBzvLZiTYIGWi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF206+uoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmUgND1as5++wXRgI');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Export functions for use in other scripts
window.SupabaseClient = {
    initSupabase,
    createRequest,
    acceptRequest,
    updateStatus,
    subscribeToRequests,
    subscribeToNotifications,
    unsubscribeAll,
    sendNotification,
    requestNotificationPermission
};

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}
