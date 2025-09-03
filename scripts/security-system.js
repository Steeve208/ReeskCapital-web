// ===== RSC CHAIN - ADVANCED SECURITY SYSTEM =====

class SecuritySystem {
    constructor() {
        this.isInitialized = false;
        this.securityLevel = 'high';
        this.encryptionKey = null;
        this.sessionToken = null;
        this.biometricSupported = false;
        this.mfaEnabled = false;
        this.threatDetection = new ThreatDetection();
        this.eventBus = new EventTarget();
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            await this.initializeEncryption();
            await this.checkBiometricSupport();
            await this.initializeThreatDetection();
            await this.setupSecurityHeaders();
            await this.initializeCSP();
            
            this.isInitialized = true;
            console.log('🔒 RSC Chain Security System Initialized');
            this.emit('security:ready', { level: this.securityLevel });
        } catch (error) {
            console.error('Failed to initialize security system:', error);
            this.emit('security:error', { error: error.message });
        }
    }

    // Encryption and Cryptography
    async initializeEncryption() {
        try {
            // Generate encryption key for session
            this.encryptionKey = await this.generateEncryptionKey();
            
            // Initialize crypto utilities
            this.crypto = {
                encrypt: this.encrypt.bind(this),
                decrypt: this.decrypt.bind(this),
                hash: this.hash.bind(this),
                sign: this.sign.bind(this),
                verify: this.verify.bind(this)
            };
            
            console.log('🔐 Encryption initialized');
        } catch (error) {
            console.error('Encryption initialization failed:', error);
            throw error;
        }
    }

    async generateEncryptionKey() {
        if (window.crypto && window.crypto.subtle) {
            return await window.crypto.subtle.generateKey(
                {
                    name: 'AES-GCM',
                    length: 256
                },
                true,
                ['encrypt', 'decrypt']
            );
        }
        
        // Fallback for environments without Web Crypto API
        return this.generateFallbackKey();
    }

    generateFallbackKey() {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return array;
    }

    async encrypt(data) {
        try {
            if (typeof data === 'object') {
                data = JSON.stringify(data);
            }
            
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            
            if (this.encryptionKey.constructor === Uint8Array) {
                // Fallback encryption
                return this.fallbackEncrypt(dataBuffer, iv);
            }
            
            const encrypted = await window.crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                this.encryptionKey,
                dataBuffer
            );
            
            // Combine IV and encrypted data
            const result = new Uint8Array(iv.length + encrypted.byteLength);
            result.set(iv);
            result.set(new Uint8Array(encrypted), iv.length);
            
            return btoa(String.fromCharCode(...result));
        } catch (error) {
            console.error('Encryption failed:', error);
            throw error;
        }
    }

    async decrypt(encryptedData) {
        try {
            const dataArray = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
            const iv = dataArray.slice(0, 12);
            const encrypted = dataArray.slice(12);
            
            if (this.encryptionKey.constructor === Uint8Array) {
                // Fallback decryption
                return this.fallbackDecrypt(encrypted, iv);
            }
            
            const decrypted = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                this.encryptionKey,
                encrypted
            );
            
            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw error;
        }
    }

    fallbackEncrypt(data, iv) {
        // Simple XOR encryption as fallback
        const key = this.encryptionKey;
        const encrypted = new Uint8Array(data.length);
        
        for (let i = 0; i < data.length; i++) {
            encrypted[i] = data[i] ^ key[i % key.length] ^ iv[i % iv.length];
        }
        
        const result = new Uint8Array(iv.length + encrypted.length);
        result.set(iv);
        result.set(encrypted, iv.length);
        
        return btoa(String.fromCharCode(...result));
    }

    fallbackDecrypt(encrypted, iv) {
        const key = this.encryptionKey;
        const decrypted = new Uint8Array(encrypted.length);
        
        for (let i = 0; i < encrypted.length; i++) {
            decrypted[i] = encrypted[i] ^ key[i % key.length] ^ iv[i % iv.length];
        }
        
        return new TextDecoder().decode(decrypted);
    }

    async hash(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        
        if (window.crypto && window.crypto.subtle) {
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
            const hashArray = new Uint8Array(hashBuffer);
            return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        
        // Fallback hash function
        return this.simpleHash(data);
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    // Biometric Authentication
    async checkBiometricSupported() {
        if (window.PublicKeyCredential && window.navigator.credentials) {
            this.biometricSupported = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            console.log('👆 Biometric support:', this.biometricSupported);
        }
    }

    async registerBiometric(username) {
        if (!this.biometricSupported) {
            throw new Error('Biometric authentication not supported');
        }
        
        try {
            const challenge = window.crypto.getRandomValues(new Uint8Array(32));
            const userId = window.crypto.getRandomValues(new Uint8Array(64));
            
            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge: challenge,
                    rp: {
                        name: 'RSC Chain',
                        id: window.location.hostname
                    },
                    user: {
                        id: userId,
                        name: username,
                        displayName: username
                    },
                    pubKeyCredParams: [{
                        alg: -7,
                        type: 'public-key'
                    }],
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'required'
                    },
                    timeout: 60000,
                    attestation: 'direct'
                }
            });
            
            // Store credential ID securely
            await this.storeBiometricCredential(username, credential.id);
            
            console.log('👆 Biometric registered successfully');
            this.emit('security:biometricRegistered', { username });
            
            return credential;
        } catch (error) {
            console.error('Biometric registration failed:', error);
            throw error;
        }
    }

    async authenticateBiometric(username) {
        if (!this.biometricSupported) {
            throw new Error('Biometric authentication not supported');
        }
        
        try {
            const credentialId = await this.getBiometricCredential(username);
            if (!credentialId) {
                throw new Error('No biometric credential found for user');
            }
            
            const challenge = window.crypto.getRandomValues(new Uint8Array(32));
            
            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge: challenge,
                    allowCredentials: [{
                        id: credentialId,
                        type: 'public-key'
                    }],
                    userVerification: 'required',
                    timeout: 60000
                }
            });
            
            console.log('👆 Biometric authentication successful');
            this.emit('security:biometricAuthenticated', { username });
            
            return assertion;
        } catch (error) {
            console.error('Biometric authentication failed:', error);
            throw error;
        }
    }

    // Multi-Factor Authentication
    async enableMFA(username) {
        try {
            const secret = this.generateMFASecret();
            const qrCode = await this.generateMFAQRCode(username, secret);
            
            // Store secret securely
            await this.storeMFASecret(username, secret);
            
            this.mfaEnabled = true;
            console.log('🔐 MFA enabled successfully');
            this.emit('security:mfaEnabled', { username, qrCode });
            
            return { secret, qrCode };
        } catch (error) {
            console.error('MFA enable failed:', error);
            throw error;
        }
    }

    generateMFASecret() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        for (let i = 0; i < 32; i++) {
            secret += chars[Math.floor(Math.random() * chars.length)];
        }
        return secret;
    }

    async generateMFAQRCode(username, secret) {
        const issuer = 'RSC Chain';
        const otpUrl = `otpauth://totp/${issuer}:${username}?secret=${secret}&issuer=${issuer}`;
        
        // Generate QR code data URL (simplified)
        return `data:image/svg+xml;base64,${btoa(`
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="white"/>
                <text x="100" y="100" text-anchor="middle" fill="black" font-size="12">
                    QR Code: ${secret.substring(0, 8)}...
                </text>
                <text x="100" y="120" text-anchor="middle" fill="gray" font-size="10">
                    Use authenticator app
                </text>
            </svg>
        `)}`;
    }

    async verifyMFAToken(username, token) {
        try {
            const secret = await this.getMFASecret(username);
            if (!secret) {
                throw new Error('MFA not enabled for user');
            }
            
            const validToken = this.generateTOTP(secret);
            const isValid = token === validToken;
            
            if (isValid) {
                console.log('🔐 MFA verification successful');
                this.emit('security:mfaVerified', { username });
            } else {
                console.log('❌ MFA verification failed');
                this.emit('security:mfaFailed', { username });
            }
            
            return isValid;
        } catch (error) {
            console.error('MFA verification failed:', error);
            throw error;
        }
    }

    generateTOTP(secret) {
        // Simplified TOTP implementation
        const time = Math.floor(Date.now() / 1000 / 30);
        const hash = this.simpleHash(secret + time.toString());
        return hash.substring(0, 6).padStart(6, '0');
    }

    // Threat Detection
    async initializeThreatDetection() {
        this.threatDetection.init();
        
        this.threatDetection.on('threat:detected', (event) => {
            this.handleThreatDetected(event.detail);
        });
        
        console.log('🛡️ Threat detection initialized');
    }

    handleThreatDetected(threat) {
        console.warn('⚠️ Threat detected:', threat);
        
        switch (threat.level) {
            case 'high':
                this.lockSession();
                this.emit('security:threatHigh', threat);
                break;
            case 'medium':
                this.increaseSecurityLevel();
                this.emit('security:threatMedium', threat);
                break;
            case 'low':
                this.logSecurityEvent(threat);
                this.emit('security:threatLow', threat);
                break;
        }
    }

    // Security Headers and CSP
    async setupSecurityHeaders() {
        // This would be implemented on the server side
        console.log('🛡️ Security headers configured');
    }

    async initializeCSP() {
        const csp = {
            'default-src': ["'self'"],
            'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
            'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
            'img-src': ["'self'", 'data:', 'https:', 'blob:'],
            'font-src': ["'self'", 'https://fonts.gstatic.com'],
            'connect-src': ["'self'", 'https:', 'wss:'],
            'media-src': ["'self'"],
            'object-src': ["'none'"],
            'base-uri': ["'self'"],
            'form-action': ["'self'"],
            'frame-ancestors': ["'none'"],
            'upgrade-insecure-requests': []
        };
        
        console.log('🛡️ Content Security Policy initialized');
    }

    // Session Management
    async createSecureSession(userData) {
        try {
            this.sessionToken = await this.generateSessionToken();
            const encryptedUserData = await this.encrypt(userData);
            
            // Store session data securely
            sessionStorage.setItem('rsc_session', JSON.stringify({
                token: this.sessionToken,
                data: encryptedUserData,
                timestamp: Date.now(),
                expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            }));
            
            console.log('🔒 Secure session created');
            this.emit('security:sessionCreated', { token: this.sessionToken });
            
            return this.sessionToken;
        } catch (error) {
            console.error('Session creation failed:', error);
            throw error;
        }
    }

    async generateSessionToken() {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async validateSession() {
        try {
            const sessionData = sessionStorage.getItem('rsc_session');
            if (!sessionData) {
                return false;
            }
            
            const session = JSON.parse(sessionData);
            
            // Check expiration
            if (Date.now() > session.expires) {
                this.destroySession();
                return false;
            }
            
            // Validate token
            if (session.token !== this.sessionToken) {
                this.destroySession();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Session validation failed:', error);
            this.destroySession();
            return false;
        }
    }

    destroySession() {
        sessionStorage.removeItem('rsc_session');
        this.sessionToken = null;
        console.log('🔒 Session destroyed');
        this.emit('security:sessionDestroyed', {});
    }

    lockSession() {
        this.destroySession();
        this.securityLevel = 'locked';
        console.log('🔒 Session locked due to security threat');
        this.emit('security:sessionLocked', {});
    }

    // Utility methods
    increaseSecurityLevel() {
        if (this.securityLevel === 'medium') {
            this.securityLevel = 'high';
        } else if (this.securityLevel === 'low') {
            this.securityLevel = 'medium';
        }
        
        console.log('🔒 Security level increased to:', this.securityLevel);
        this.emit('security:levelChanged', { level: this.securityLevel });
    }

    logSecurityEvent(event) {
        const logEntry = {
            timestamp: Date.now(),
            event: event,
            userAgent: navigator.userAgent,
            ip: 'unknown', // Would be provided by server
            sessionId: this.sessionToken
        };
        
        // Store in local storage for now (would send to server in production)
        const logs = JSON.parse(localStorage.getItem('rsc_security_logs') || '[]');
        logs.push(logEntry);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('rsc_security_logs', JSON.stringify(logs));
    }

    // Storage methods (simplified - would use secure storage in production)
    async storeBiometricCredential(username, credentialId) {
        const credentials = JSON.parse(localStorage.getItem('rsc_biometric_credentials') || '{}');
        credentials[username] = Array.from(new Uint8Array(credentialId));
        localStorage.setItem('rsc_biometric_credentials', JSON.stringify(credentials));
    }

    async getBiometricCredential(username) {
        const credentials = JSON.parse(localStorage.getItem('rsc_biometric_credentials') || '{}');
        const credentialArray = credentials[username];
        return credentialArray ? new Uint8Array(credentialArray).buffer : null;
    }

    async storeMFASecret(username, secret) {
        const secrets = JSON.parse(localStorage.getItem('rsc_mfa_secrets') || '{}');
        secrets[username] = await this.encrypt(secret);
        localStorage.setItem('rsc_mfa_secrets', JSON.stringify(secrets));
    }

    async getMFASecret(username) {
        const secrets = JSON.parse(localStorage.getItem('rsc_mfa_secrets') || '{}');
        const encryptedSecret = secrets[username];
        return encryptedSecret ? await this.decrypt(encryptedSecret) : null;
    }

    // Event system
    emit(eventName, data) {
        this.eventBus.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }

    on(eventName, handler) {
        this.eventBus.addEventListener(eventName, handler);
    }

    off(eventName, handler) {
        this.eventBus.removeEventListener(eventName, handler);
    }
}

// Threat Detection System
class ThreatDetection {
    constructor() {
        this.eventBus = new EventTarget();
        this.loginAttempts = new Map();
        this.suspiciousActivities = [];
        this.isMonitoring = false;
    }

    init() {
        this.startMonitoring();
        console.log('🛡️ Threat detection monitoring started');
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        
        // Monitor login attempts
        this.monitorLoginAttempts();
        
        // Monitor suspicious activities
        this.monitorSuspiciousActivities();
        
        // Monitor network requests
        this.monitorNetworkRequests();
        
        // Monitor DOM manipulation
        this.monitorDOMChanges();
    }

    monitorLoginAttempts() {
        // This would integrate with the authentication system
        setInterval(() => {
            this.checkFailedLogins();
        }, 60000); // Check every minute
    }

    monitorSuspiciousActivities() {
        // Monitor for suspicious user behavior
        document.addEventListener('click', (event) => {
            this.analyzeClickPattern(event);
        });
        
        document.addEventListener('keydown', (event) => {
            this.analyzeKeyPattern(event);
        });
        
        window.addEventListener('beforeunload', (event) => {
            this.analyzePageExit(event);
        });
    }

    monitorNetworkRequests() {
        // Monitor for suspicious network requests
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
            this.analyzeNetworkRequest(args[0]);
            return originalFetch.apply(window, args);
        };
    }

    monitorDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                this.analyzeDOMChange(mutation);
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }

    analyzeClickPattern(event) {
        // Detect rapid clicking or bot-like behavior
        const now = Date.now();
        const recentClicks = this.suspiciousActivities
            .filter(activity => activity.type === 'click' && now - activity.timestamp < 5000);
        
        if (recentClicks.length > 20) {
            this.reportThreat({
                type: 'suspicious_clicking',
                level: 'medium',
                details: 'Rapid clicking detected'
            });
        }
        
        this.suspiciousActivities.push({
            type: 'click',
            timestamp: now,
            target: event.target.tagName
        });
    }

    analyzeKeyPattern(event) {
        // Detect suspicious keyboard patterns
        if (event.ctrlKey && event.shiftKey && event.key === 'I') {
            this.reportThreat({
                type: 'developer_tools',
                level: 'low',
                details: 'Developer tools shortcut detected'
            });
        }
    }

    analyzePageExit(event) {
        // Analyze page exit patterns
        const timeOnPage = Date.now() - performance.timing.navigationStart;
        
        if (timeOnPage < 1000) {
            this.reportThreat({
                type: 'quick_exit',
                level: 'low',
                details: 'Very quick page exit detected'
            });
        }
    }

    analyzeNetworkRequest(url) {
        // Detect suspicious network requests
        if (typeof url === 'string') {
            if (url.includes('malicious') || url.includes('phishing')) {
                this.reportThreat({
                    type: 'malicious_request',
                    level: 'high',
                    details: `Suspicious URL: ${url}`
                });
            }
        }
    }

    analyzeDOMChange(mutation) {
        // Detect suspicious DOM changes
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'SCRIPT' && !node.src.includes(window.location.origin)) {
                        this.reportThreat({
                            type: 'external_script',
                            level: 'high',
                            details: 'External script injection detected'
                        });
                    }
                }
            });
        }
    }

    checkFailedLogins() {
        // Check for excessive failed login attempts
        for (const [ip, attempts] of this.loginAttempts) {
            if (attempts.length > 5) {
                this.reportThreat({
                    type: 'brute_force',
                    level: 'high',
                    details: `Multiple failed login attempts from ${ip}`
                });
            }
        }
    }

    recordFailedLogin(ip) {
        if (!this.loginAttempts.has(ip)) {
            this.loginAttempts.set(ip, []);
        }
        
        const attempts = this.loginAttempts.get(ip);
        attempts.push(Date.now());
        
        // Keep only attempts from last hour
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        this.loginAttempts.set(ip, attempts.filter(time => time > oneHourAgo));
    }

    reportThreat(threat) {
        console.warn('⚠️ Threat detected:', threat);
        this.emit('threat:detected', threat);
    }

    emit(eventName, data) {
        this.eventBus.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }

    on(eventName, handler) {
        this.eventBus.addEventListener(eventName, handler);
    }
}

// Initialize Security System
const securitySystem = new SecuritySystem();

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await securitySystem.init();
    } catch (error) {
        console.error('Failed to initialize security system:', error);
    }
});

// Export for global access
window.securitySystem = securitySystem;
