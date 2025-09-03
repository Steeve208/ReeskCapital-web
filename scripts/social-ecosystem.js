// ===== RSC CHAIN - SOCIAL ECOSYSTEM SYSTEM =====

class SocialEcosystem {
    constructor() {
        this.users = new Map();
        this.posts = [];
        this.chats = new Map();
        this.followers = new Map();
        this.likes = new Map();
        this.comments = new Map();
        this.currentUser = null;
        this.eventBus = new EventTarget();
        this.initialized = false;
    }

    // Initialize social ecosystem
    async init() {
        if (this.initialized) return;
        
        try {
            await this.loadSampleData();
            await this.setupEventListeners();
            this.initialized = true;
            
            console.log('🚀 RSC Chain Social Ecosystem Initialized');
            this.emit('social:ready', { status: 'connected' });
        } catch (error) {
            console.error('Failed to initialize social ecosystem:', error);
            this.emit('social:error', { error: error.message });
        }
    }

    // Load sample data
    async loadSampleData() {
        // Sample users
        const sampleUsers = [
            {
                id: 'user_001',
                username: 'RSC_Miner_001',
                displayName: 'Crypto Miner',
                avatar: 'https://via.placeholder.com/100x100/22c55e/ffffff?text=CM',
                bio: 'Professional RSC Chain miner with 5+ years experience',
                joinDate: new Date('2023-01-15'),
                followers: 1250,
                following: 340,
                posts: 89,
                verified: true,
                badges: ['miner', 'early-adopter', 'top-contributor']
            },
            {
                id: 'user_002',
                username: 'CryptoTrader_99',
                displayName: 'Trading Pro',
                avatar: 'https://via.placeholder.com/100x100/3b82f6/ffffff?text=TP',
                bio: 'DeFi enthusiast and RSC Chain trader',
                joinDate: new Date('2023-02-20'),
                followers: 890,
                following: 156,
                posts: 45,
                verified: false,
                badges: ['trader', 'defi-expert']
            },
            {
                id: 'user_003',
                username: 'BlockchainDev',
                displayName: 'Blockchain Developer',
                avatar: 'https://via.placeholder.com/100x100/a855f7/ffffff?text=BD',
                bio: 'Building the future of blockchain technology',
                joinDate: new Date('2023-03-10'),
                followers: 2100,
                following: 420,
                posts: 156,
                verified: true,
                badges: ['developer', 'core-team', 'tech-leader']
            }
        ];

        sampleUsers.forEach(user => {
            this.users.set(user.id, user);
        });

        // Sample posts
        const samplePosts = [
            {
                id: 'post_001',
                authorId: 'user_001',
                content: 'Just mined my first RSC block! The new algorithm is incredibly efficient. 🎉 #RSCChain #Mining',
                timestamp: new Date(Date.now() - 3600000),
                likes: 42,
                comments: 8,
                shares: 12,
                type: 'text',
                hashtags: ['RSCChain', 'Mining'],
                mentions: []
            },
            {
                id: 'post_002',
                authorId: 'user_002',
                content: 'RSC Chain is the future of blockchain technology! The DeFi protocols are revolutionary. 🚀',
                timestamp: new Date(Date.now() - 7200000),
                likes: 156,
                comments: 23,
                shares: 45,
                type: 'text',
                hashtags: ['RSCChain', 'DeFi'],
                mentions: []
            },
            {
                id: 'post_003',
                authorId: 'user_003',
                content: 'Excited to announce the new smart contract features coming to RSC Chain! This will change everything. 💡',
                timestamp: new Date(Date.now() - 10800000),
                likes: 89,
                comments: 15,
                shares: 28,
                type: 'text',
                hashtags: ['RSCChain', 'SmartContracts'],
                mentions: []
            }
        ];

        this.posts = samplePosts;

        // Sample chats
        const sampleChats = [
            {
                id: 'chat_001',
                participants: ['user_001', 'user_002'],
                messages: [
                    {
                        id: 'msg_001',
                        senderId: 'user_001',
                        content: 'Hey! How are you doing with the new mining algorithm?',
                        timestamp: new Date(Date.now() - 1800000),
                        type: 'text'
                    },
                    {
                        id: 'msg_002',
                        senderId: 'user_002',
                        content: 'It\'s amazing! My hash rate increased by 30%. What about you?',
                        timestamp: new Date(Date.now() - 1700000),
                        type: 'text'
                    }
                ],
                lastMessage: new Date(Date.now() - 1700000)
            }
        ];

        sampleChats.forEach(chat => {
            this.chats.set(chat.id, chat);
        });
    }

    // Setup event listeners
    async setupEventListeners() {
        // Listen for user actions
        this.eventBus.addEventListener('user:login', (event) => {
            this.handleUserLogin(event.detail);
        });

        this.eventBus.addEventListener('user:logout', (event) => {
            this.handleUserLogout(event.detail);
        });

        this.eventBus.addEventListener('post:create', (event) => {
            this.handlePostCreate(event.detail);
        });

        this.eventBus.addEventListener('post:like', (event) => {
            this.handlePostLike(event.detail);
        });

        this.eventBus.addEventListener('post:comment', (event) => {
            this.handlePostComment(event.detail);
        });

        this.eventBus.addEventListener('chat:send', (event) => {
            this.handleChatSend(event.detail);
        });

        this.eventBus.addEventListener('user:follow', (event) => {
            this.handleUserFollow(event.detail);
        });
    }

    // User management
    async createUser(userData) {
        const user = {
            id: `user_${Date.now()}`,
            username: userData.username,
            displayName: userData.displayName || userData.username,
            avatar: userData.avatar || `https://via.placeholder.com/100x100/22c55e/ffffff?text=${userData.username.charAt(0).toUpperCase()}`,
            bio: userData.bio || '',
            joinDate: new Date(),
            followers: 0,
            following: 0,
            posts: 0,
            verified: false,
            badges: []
        };

        this.users.set(user.id, user);
        this.emit('user:created', user);
        return user;
    }

    async loginUser(userId) {
        const user = this.users.get(userId);
        if (user) {
            this.currentUser = user;
            this.emit('user:loggedIn', user);
            return user;
        }
        throw new Error('User not found');
    }

    async logoutUser() {
        this.currentUser = null;
        this.emit('user:loggedOut', {});
    }

    // Post management
    async createPost(content, type = 'text', metadata = {}) {
        if (!this.currentUser) {
            throw new Error('User must be logged in to create posts');
        }

        const post = {
            id: `post_${Date.now()}`,
            authorId: this.currentUser.id,
            content: content,
            timestamp: new Date(),
            likes: 0,
            comments: 0,
            shares: 0,
            type: type,
            hashtags: this.extractHashtags(content),
            mentions: this.extractMentions(content),
            metadata: metadata
        };

        this.posts.unshift(post);
        this.currentUser.posts++;
        this.users.set(this.currentUser.id, this.currentUser);

        this.emit('post:created', post);
        return post;
    }

    async likePost(postId) {
        if (!this.currentUser) {
            throw new Error('User must be logged in to like posts');
        }

        const post = this.posts.find(p => p.id === postId);
        if (!post) {
            throw new Error('Post not found');
        }

        const likeKey = `${this.currentUser.id}_${postId}`;
        if (this.likes.has(likeKey)) {
            // Unlike
            this.likes.delete(likeKey);
            post.likes--;
        } else {
            // Like
            this.likes.set(likeKey, {
                userId: this.currentUser.id,
                postId: postId,
                timestamp: new Date()
            });
            post.likes++;
        }

        this.emit('post:liked', { postId, userId: this.currentUser.id, liked: this.likes.has(likeKey) });
        return post;
    }

    async commentPost(postId, content) {
        if (!this.currentUser) {
            throw new Error('User must be logged in to comment');
        }

        const post = this.posts.find(p => p.id === postId);
        if (!post) {
            throw new Error('Post not found');
        }

        const comment = {
            id: `comment_${Date.now()}`,
            postId: postId,
            authorId: this.currentUser.id,
            content: content,
            timestamp: new Date(),
            likes: 0
        };

        if (!this.comments.has(postId)) {
            this.comments.set(postId, []);
        }
        this.comments.get(postId).push(comment);
        post.comments++;

        this.emit('post:commented', comment);
        return comment;
    }

    // Chat management
    async createChat(participantIds) {
        const chat = {
            id: `chat_${Date.now()}`,
            participants: participantIds,
            messages: [],
            lastMessage: null,
            created: new Date()
        };

        this.chats.set(chat.id, chat);
        this.emit('chat:created', chat);
        return chat;
    }

    async sendMessage(chatId, content, type = 'text') {
        if (!this.currentUser) {
            throw new Error('User must be logged in to send messages');
        }

        const chat = this.chats.get(chatId);
        if (!chat) {
            throw new Error('Chat not found');
        }

        if (!chat.participants.includes(this.currentUser.id)) {
            throw new Error('User not in chat');
        }

        const message = {
            id: `msg_${Date.now()}`,
            senderId: this.currentUser.id,
            content: content,
            timestamp: new Date(),
            type: type
        };

        chat.messages.push(message);
        chat.lastMessage = new Date();

        this.emit('chat:messageSent', { chatId, message });
        return message;
    }

    // Follow system
    async followUser(userId) {
        if (!this.currentUser) {
            throw new Error('User must be logged in to follow users');
        }

        if (userId === this.currentUser.id) {
            throw new Error('Cannot follow yourself');
        }

        const user = this.users.get(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const followKey = `${this.currentUser.id}_${userId}`;
        if (this.followers.has(followKey)) {
            // Unfollow
            this.followers.delete(followKey);
            this.currentUser.following--;
            user.followers--;
        } else {
            // Follow
            this.followers.set(followKey, {
                followerId: this.currentUser.id,
                followingId: userId,
                timestamp: new Date()
            });
            this.currentUser.following++;
            user.followers++;
        }

        this.users.set(this.currentUser.id, this.currentUser);
        this.users.set(userId, user);

        this.emit('user:followed', { userId, followerId: this.currentUser.id, followed: this.followers.has(followKey) });
        return { followed: this.followers.has(followKey) };
    }

    // Utility methods
    extractHashtags(content) {
        const hashtags = content.match(/#\w+/g);
        return hashtags ? hashtags.map(tag => tag.substring(1)) : [];
    }

    extractMentions(content) {
        const mentions = content.match(/@\w+/g);
        return mentions ? mentions.map(mention => mention.substring(1)) : [];
    }

    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    // Get methods
    getPosts(limit = 20, offset = 0) {
        return this.posts.slice(offset, offset + limit);
    }

    getPost(postId) {
        return this.posts.find(p => p.id === postId);
    }

    getPostComments(postId) {
        return this.comments.get(postId) || [];
    }

    getUser(userId) {
        return this.users.get(userId);
    }

    getUserPosts(userId, limit = 20) {
        return this.posts.filter(p => p.authorId === userId).slice(0, limit);
    }

    getChats(userId) {
        return Array.from(this.chats.values()).filter(chat => 
            chat.participants.includes(userId)
        ).sort((a, b) => b.lastMessage - a.lastMessage);
    }

    getChatMessages(chatId) {
        const chat = this.chats.get(chatId);
        return chat ? chat.messages : [];
    }

    getFollowers(userId) {
        const followers = [];
        for (const [key, follow] of this.followers) {
            if (follow.followingId === userId) {
                const user = this.users.get(follow.followerId);
                if (user) followers.push(user);
            }
        }
        return followers;
    }

    getFollowing(userId) {
        const following = [];
        for (const [key, follow] of this.followers) {
            if (follow.followerId === userId) {
                const user = this.users.get(follow.followingId);
                if (user) following.push(user);
            }
        }
        return following;
    }

    // Event handlers
    handleUserLogin(userData) {
        console.log('User logged in:', userData);
    }

    handleUserLogout(userData) {
        console.log('User logged out:', userData);
    }

    handlePostCreate(postData) {
        console.log('Post created:', postData);
    }

    handlePostLike(likeData) {
        console.log('Post liked:', likeData);
    }

    handlePostComment(commentData) {
        console.log('Post commented:', commentData);
    }

    handleChatSend(messageData) {
        console.log('Message sent:', messageData);
    }

    handleUserFollow(followData) {
        console.log('User followed:', followData);
    }

    // Emit events
    emit(eventName, data) {
        this.eventBus.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }

    // Add event listener
    on(eventName, handler) {
        this.eventBus.addEventListener(eventName, handler);
    }

    // Remove event listener
    off(eventName, handler) {
        this.eventBus.removeEventListener(eventName, handler);
    }
}

// ===== SOCIAL UI MANAGER =====
class SocialUIManager {
    constructor(socialEcosystem) {
        this.social = socialEcosystem;
        this.elements = new Map();
        this.currentView = 'feed';
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.renderFeed();
    }

    setupElements() {
        // Feed elements
        this.elements.set('feedContainer', document.querySelector('[data-social-feed]'));
        this.elements.set('postInput', document.querySelector('[data-post-input]'));
        this.elements.set('postButton', document.querySelector('[data-post-button]'));

        // Chat elements
        this.elements.set('chatContainer', document.querySelector('[data-chat-container]'));
        this.elements.set('chatInput', document.querySelector('[data-chat-input]'));
        this.elements.set('chatSendButton', document.querySelector('[data-chat-send]'));

        // Profile elements
        this.elements.set('profileContainer', document.querySelector('[data-profile-container]'));
        this.elements.set('userAvatar', document.querySelector('[data-user-avatar]'));
        this.elements.set('userName', document.querySelector('[data-user-name]'));
        this.elements.set('userBio', document.querySelector('[data-user-bio]'));

        // Navigation elements
        this.elements.set('feedTab', document.querySelector('[data-tab="feed"]'));
        this.elements.set('chatTab', document.querySelector('[data-tab="chat"]'));
        this.elements.set('profileTab', document.querySelector('[data-tab="profile"]'));
    }

    setupEventListeners() {
        // Post creation
        if (this.elements.get('postButton')) {
            this.elements.get('postButton').addEventListener('click', () => {
                this.createPost();
            });
        }

        if (this.elements.get('postInput')) {
            this.elements.get('postInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.createPost();
                }
            });
        }

        // Chat sending
        if (this.elements.get('chatSendButton')) {
            this.elements.get('chatSendButton').addEventListener('click', () => {
                this.sendMessage();
            });
        }

        if (this.elements.get('chatInput')) {
            this.elements.get('chatInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Tab navigation
        if (this.elements.get('feedTab')) {
            this.elements.get('feedTab').addEventListener('click', () => {
                this.showView('feed');
            });
        }

        if (this.elements.get('chatTab')) {
            this.elements.get('chatTab').addEventListener('click', () => {
                this.showView('chat');
            });
        }

        if (this.elements.get('profileTab')) {
            this.elements.get('profileTab').addEventListener('click', () => {
                this.showView('profile');
            });
        }

        // Social events
        this.social.on('post:created', (event) => {
            this.renderFeed();
        });

        this.social.on('post:liked', (event) => {
            this.updatePostLikes(event.detail);
        });

        this.social.on('chat:messageSent', (event) => {
            this.renderChat(event.detail.chatId);
        });
    }

    async createPost() {
        const input = this.elements.get('postInput');
        if (!input) return;

        const content = input.value.trim();
        if (!content) return;

        try {
            await this.social.createPost(content);
            input.value = '';
            this.showSuccess('Post created successfully!');
        } catch (error) {
            this.showError('Failed to create post: ' + error.message);
        }
    }

    async likePost(postId) {
        try {
            await this.social.likePost(postId);
        } catch (error) {
            this.showError('Failed to like post: ' + error.message);
        }
    }

    async commentPost(postId) {
        const content = prompt('Enter your comment:');
        if (!content) return;

        try {
            await this.social.commentPost(postId, content);
            this.showSuccess('Comment added successfully!');
        } catch (error) {
            this.showError('Failed to add comment: ' + error.message);
        }
    }

    async sendMessage() {
        const input = this.elements.get('chatInput');
        if (!input) return;

        const content = input.value.trim();
        if (!content) return;

        try {
            // For demo purposes, use the first available chat
            const chats = this.social.getChats(this.social.currentUser?.id);
            if (chats.length > 0) {
                await this.social.sendMessage(chats[0].id, content);
                input.value = '';
            }
        } catch (error) {
            this.showError('Failed to send message: ' + error.message);
        }
    }

    async followUser(userId) {
        try {
            await this.social.followUser(userId);
            this.showSuccess('User followed successfully!');
        } catch (error) {
            this.showError('Failed to follow user: ' + error.message);
        }
    }

    renderFeed() {
        const container = this.elements.get('feedContainer');
        if (!container) return;

        const posts = this.social.getPosts();
        container.innerHTML = posts.map(post => this.renderPost(post)).join('');
    }

    renderPost(post) {
        const author = this.social.getUser(post.authorId);
        if (!author) return '';

        const isLiked = this.social.likes.has(`${this.social.currentUser?.id}_${post.id}`);
        const likeClass = isLiked ? 'liked' : '';

        return `
            <div class="post" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-author">
                        <img src="${author.avatar}" alt="${author.displayName}" class="author-avatar">
                        <div class="author-info">
                            <div class="author-name">${author.displayName}</div>
                            <div class="author-username">@${author.username}</div>
                        </div>
                    </div>
                    <div class="post-time">${this.social.formatTime(post.timestamp)}</div>
                </div>
                <div class="post-content">${this.formatPostContent(post.content)}</div>
                <div class="post-actions">
                    <button class="action-btn like-btn ${likeClass}" onclick="socialUI.likePost('${post.id}')">
                        <i class="fas fa-heart"></i>
                        <span>${post.likes}</span>
                    </button>
                    <button class="action-btn comment-btn" onclick="socialUI.commentPost('${post.id}')">
                        <i class="fas fa-comment"></i>
                        <span>${post.comments}</span>
                    </button>
                    <button class="action-btn share-btn">
                        <i class="fas fa-share"></i>
                        <span>${post.shares}</span>
                    </button>
                </div>
            </div>
        `;
    }

    formatPostContent(content) {
        // Format hashtags
        content = content.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
        
        // Format mentions
        content = content.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
        
        // Format line breaks
        content = content.replace(/\n/g, '<br>');
        
        return content;
    }

    renderChat(chatId) {
        const container = this.elements.get('chatContainer');
        if (!container) return;

        const messages = this.social.getChatMessages(chatId);
        container.innerHTML = messages.map(message => this.renderMessage(message)).join('');
        container.scrollTop = container.scrollHeight;
    }

    renderMessage(message) {
        const sender = this.social.getUser(message.senderId);
        if (!sender) return '';

        const isOwn = message.senderId === this.social.currentUser?.id;
        const messageClass = isOwn ? 'own-message' : 'other-message';

        return `
            <div class="message ${messageClass}">
                <div class="message-avatar">
                    <img src="${sender.avatar}" alt="${sender.displayName}">
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${sender.displayName}</span>
                        <span class="message-time">${this.social.formatTime(message.timestamp)}</span>
                    </div>
                    <div class="message-text">${message.content}</div>
                </div>
            </div>
        `;
    }

    renderProfile(userId) {
        const user = this.social.getUser(userId);
        if (!user) return;

        const container = this.elements.get('profileContainer');
        if (!container) return;

        const isFollowing = this.social.followers.has(`${this.social.currentUser?.id}_${userId}`);
        const followButtonText = isFollowing ? 'Unfollow' : 'Follow';

        container.innerHTML = `
            <div class="profile-header">
                <img src="${user.avatar}" alt="${user.displayName}" class="profile-avatar">
                <div class="profile-info">
                    <h2 class="profile-name">${user.displayName}</h2>
                    <p class="profile-username">@${user.username}</p>
                    <p class="profile-bio">${user.bio}</p>
                    <div class="profile-stats">
                        <div class="stat">
                            <span class="stat-value">${user.followers}</span>
                            <span class="stat-label">Followers</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${user.following}</span>
                            <span class="stat-label">Following</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${user.posts}</span>
                            <span class="stat-label">Posts</span>
                        </div>
                    </div>
                    ${userId !== this.social.currentUser?.id ? `
                        <button class="btn btn-primary" onclick="socialUI.followUser('${userId}')">
                            ${followButtonText}
                        </button>
                    ` : ''}
                </div>
            </div>
            <div class="profile-posts">
                <h3>Recent Posts</h3>
                <div class="posts-list">
                    ${this.social.getUserPosts(userId, 5).map(post => this.renderPost(post)).join('')}
                </div>
            </div>
        `;
    }

    showView(view) {
        this.currentView = view;
        
        // Update tab states
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${view}"]`)?.classList.add('active');

        // Show/hide containers
        document.querySelectorAll('.social-container').forEach(container => {
            container.style.display = 'none';
        });
        document.querySelector(`[data-${view}-container]`)?.style.display = 'block';

        // Render appropriate content
        switch (view) {
            case 'feed':
                this.renderFeed();
                break;
            case 'chat':
                // Render chat list or first chat
                break;
            case 'profile':
                if (this.social.currentUser) {
                    this.renderProfile(this.social.currentUser.id);
                }
                break;
        }
    }

    updatePostLikes(likeData) {
        const postElement = document.querySelector(`[data-post-id="${likeData.postId}"]`);
        if (postElement) {
            const likeBtn = postElement.querySelector('.like-btn');
            const likeCount = likeBtn.querySelector('span');
            
            if (likeData.liked) {
                likeBtn.classList.add('liked');
                likeCount.textContent = parseInt(likeCount.textContent) + 1;
            } else {
                likeBtn.classList.remove('liked');
                likeCount.textContent = parseInt(likeCount.textContent) - 1;
            }
        }
    }

    showSuccess(message) {
        if (window.componentSystem) {
            componentSystem.create('Notification').show(message, 'success');
        }
    }

    showError(message) {
        if (window.componentSystem) {
            componentSystem.create('Notification').show(message, 'error');
        }
    }
}

// ===== INITIALIZE SOCIAL ECOSYSTEM =====
const socialEcosystem = new SocialEcosystem();
const socialUI = new SocialUIManager(socialEcosystem);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await socialEcosystem.init();
        socialUI.init();
    } catch (error) {
        console.error('Failed to initialize social ecosystem:', error);
    }
});

// Export for global access
window.socialEcosystem = socialEcosystem;
window.socialUI = socialUI;
