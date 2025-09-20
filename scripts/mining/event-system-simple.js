/* ================================
   EVENT SYSTEM - SIMPLE VERSION
================================ */

console.log('🔍 Loading Event System...');

class EventSystem {
    constructor() {
        console.log('🔍 EventSystem constructor called');
        this.activeEvents = [];
        this.userEventProgress = {};
        this.seasonData = {
            currentSeason: 1,
            seasonStart: new Date(),
            seasonEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            seasonXP: 0,
            seasonLevel: 1,
            seasonRewards: []
        };

        this.eventTypes = {
            'double_xp': {
                name: 'Double XP Weekend',
                description: 'Gain double XP from all activities',
                multiplier: 2.0,
                duration: 48, // hours
                color: '#00d4ff',
                icon: 'fas fa-star'
            },
            'mining_boost': {
                name: 'Mining Boost',
                description: 'Increased mining efficiency',
                multiplier: 1.5,
                duration: 24,
                color: '#4ecdc4',
                icon: 'fas fa-pickaxe'
            }
        };

        console.log('🔍 EventSystem initialized');
    }

    getActiveEvents() {
        console.log('🔍 getActiveEvents called');
        return this.activeEvents;
    }

    getSeasonProgress() {
        console.log('🔍 getSeasonProgress called');
        return {
            level: this.seasonData.seasonLevel,
            progressXP: this.seasonData.seasonXP,
            requiredXP: 1000,
            progressPercentage: (this.seasonData.seasonXP / 1000) * 100
        };
    }

    getSeasonTimeRemaining() {
        console.log('🔍 getSeasonTimeRemaining called');
        const now = new Date();
        const timeLeft = this.seasonData.seasonEnd - now;
        
        if (timeLeft <= 0) {
            return { days: 0, hours: 0, minutes: 0 };
        }
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        return { days, hours, minutes };
    }

    addEventContribution(eventId, amount) {
        console.log('🔍 addEventContribution called');
        // Simple implementation
    }

    addSeasonXP(amount) {
        console.log('🔍 addSeasonXP called');
        this.seasonData.seasonXP += amount;
    }

    getEventMultiplier(eventType) {
        console.log('🔍 getEventMultiplier called');
        return 1.0; // Default multiplier
    }
}

console.log('🔍 Creating EventSystem instance...');

try {
    window.eventSystem = new EventSystem();
    console.log('✅ EventSystem instance created successfully');
} catch (error) {
    console.error('❌ Error creating EventSystem:', error);
}

console.log('🎉 Event System loaded');
