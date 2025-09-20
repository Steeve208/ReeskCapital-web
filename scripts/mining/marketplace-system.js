/* ================================
   MARKETPLACE SYSTEM - RSC MINING
================================ */

/**
 * 🛒 SISTEMA DE MARKETPLACE
 * 
 * Sistema completo de marketplace para equipos
 * - Venta de equipos entre usuarios
 * - Sistema de subastas
 * - Equipos únicos y raros
 * - Economía interna
 * - Trading de equipos
 */

class MarketplaceSystem {
    constructor() {
        this.listings = [];
        this.userListings = [];
        this.userPurchases = [];
        this.userSales = [];
        
        this.initializeMarketplace();
    }

    initializeMarketplace() {
        // Cargar datos del marketplace desde localStorage
        const stored = localStorage.getItem('rsc_marketplace_data');
        if (stored) {
            const data = JSON.parse(stored);
            this.listings = data.listings || [];
            this.userListings = data.userListings || [];
            this.userPurchases = data.userPurchases || [];
            this.userSales = data.userSales || [];
        }

        // Cargar listings desde Supabase
        this.loadListingsFromSupabase();
    }

    async loadListingsFromSupabase() {
        try {
            const response = await window.supabaseIntegration.makeRequest(
                'GET',
                '/rest/v1/marketplace_listings?select=*&status=eq.active&order=created_at.desc'
            );

            if (response.ok) {
                this.listings = await response.json();
                this.saveMarketplaceData();
            }
        } catch (error) {
            console.error('❌ Error cargando listings:', error);
        }
    }

    async createListing(equipmentType, level, price, description = '') {
        try {
            const user = window.supabaseIntegration?.getCurrentUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Verificar si el usuario tiene el equipo
            const equipmentStats = window.equipmentSystem?.getEquipmentStats(equipmentType);
            if (!equipmentStats || equipmentStats.level < level) {
                throw new Error('No tienes el equipo en ese nivel');
            }

            // Verificar nivel mínimo (nivel 8)
            const userLevel = window.levelSystem?.userLevel?.level || 1;
            if (userLevel < 8) {
                throw new Error('Necesitas nivel 8 para usar el marketplace');
            }

            // Crear listing
            const listingId = `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const listing = {
                id: listingId,
                sellerId: user.id,
                sellerUsername: user.username,
                equipmentType: equipmentType,
                level: level,
                price: price,
                description: description,
                status: 'active',
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
                views: 0,
                watchers: []
            };

            // Guardar en Supabase
            const response = await window.supabaseIntegration.makeRequest(
                'POST',
                '/rest/v1/marketplace_listings',
                listing
            );

            if (!response.ok) {
                throw new Error('Error creando listing');
            }

            // Agregar a listings locales
            this.listings.unshift(listing);
            this.userListings.push(listing);
            this.saveMarketplaceData();

            console.log(`✅ Listing creado: ${equipmentType} nivel ${level} por ${price} RSC`);
            return {
                success: true,
                listing: listing
            };

        } catch (error) {
            console.error('❌ Error creando listing:', error);
            throw error;
        }
    }

    async purchaseListing(listingId) {
        try {
            const user = window.supabaseIntegration?.getCurrentUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Buscar listing
            const listing = this.listings.find(l => l.id === listingId);
            if (!listing) {
                throw new Error('Listing no encontrado');
            }

            if (listing.status !== 'active') {
                throw new Error('Listing no está disponible');
            }

            if (listing.sellerId === user.id) {
                throw new Error('No puedes comprar tu propio listing');
            }

            // Verificar balance
            if (user.balance < listing.price) {
                throw new Error('Balance insuficiente');
            }

            // Procesar compra
            user.balance -= listing.price;
            window.supabaseIntegration.saveUserToStorage();

            // Marcar listing como vendido
            listing.status = 'sold';
            listing.buyerId = user.id;
            listing.buyerUsername = user.username;
            listing.soldAt = new Date().toISOString();

            // Actualizar en Supabase
            await window.supabaseIntegration.makeRequest(
                'PATCH',
                `/rest/v1/marketplace_listings?id=eq.${listingId}`,
                {
                    status: 'sold',
                    buyer_id: user.id,
                    buyer_username: user.username,
                    sold_at: listing.soldAt
                }
            );

            // Agregar a compras del usuario
            this.userPurchases.push({
                id: listingId,
                equipmentType: listing.equipmentType,
                level: listing.level,
                price: listing.price,
                sellerUsername: listing.sellerUsername,
                purchasedAt: listing.soldAt
            });

            // Agregar a ventas del vendedor
            const sellerListing = this.userListings.find(l => l.id === listingId);
            if (sellerListing) {
                sellerListing.status = 'sold';
                sellerListing.buyerId = user.id;
                sellerListing.buyerUsername = user.username;
                sellerListing.soldAt = listing.soldAt;
            }

            this.saveMarketplaceData();

            console.log(`✅ Compra realizada: ${listing.equipmentType} nivel ${listing.level} por ${listing.price} RSC`);
            return {
                success: true,
                listing: listing
            };

        } catch (error) {
            console.error('❌ Error comprando listing:', error);
            throw error;
        }
    }

    async cancelListing(listingId) {
        try {
            const user = window.supabaseIntegration?.getCurrentUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Buscar listing
            const listing = this.userListings.find(l => l.id === listingId);
            if (!listing) {
                throw new Error('Listing no encontrado');
            }

            if (listing.sellerId !== user.id) {
                throw new Error('No puedes cancelar este listing');
            }

            if (listing.status !== 'active') {
                throw new Error('Listing no está activo');
            }

            // Marcar como cancelado
            listing.status = 'cancelled';
            listing.cancelledAt = new Date().toISOString();

            // Actualizar en Supabase
            await window.supabaseIntegration.makeRequest(
                'PATCH',
                `/rest/v1/marketplace_listings?id=eq.${listingId}`,
                {
                    status: 'cancelled',
                    cancelled_at: listing.cancelledAt
                }
            );

            this.saveMarketplaceData();

            console.log(`✅ Listing cancelado: ${listing.equipmentType} nivel ${listing.level}`);
            return {
                success: true
            };

        } catch (error) {
            console.error('❌ Error cancelando listing:', error);
            throw error;
        }
    }

    searchListings(query = '', equipmentType = '', minLevel = 1, maxLevel = 10, maxPrice = Infinity) {
        let filteredListings = this.listings.filter(listing => 
            listing.status === 'active' &&
            listing.level >= minLevel &&
            listing.level <= maxLevel &&
            listing.price <= maxPrice
        );

        if (equipmentType) {
            filteredListings = filteredListings.filter(listing => 
                listing.equipmentType === equipmentType
            );
        }

        if (query) {
            filteredListings = filteredListings.filter(listing => 
                listing.description.toLowerCase().includes(query.toLowerCase()) ||
                listing.equipmentType.toLowerCase().includes(query.toLowerCase())
            );
        }

        return filteredListings.sort((a, b) => {
            // Ordenar por precio (ascendente)
            return a.price - b.price;
        });
    }

    getMarketplaceStats() {
        const activeListings = this.listings.filter(l => l.status === 'active').length;
        const totalListings = this.listings.length;
        const userListings = this.userListings.length;
        const userPurchases = this.userPurchases.length;
        const userSales = this.userSales.length;

        // Calcular precio promedio
        const activeListingsPrices = this.listings
            .filter(l => l.status === 'active')
            .map(l => l.price);
        
        const averagePrice = activeListingsPrices.length > 0 
            ? activeListingsPrices.reduce((sum, price) => sum + price, 0) / activeListingsPrices.length 
            : 0;

        return {
            activeListings,
            totalListings,
            userListings,
            userPurchases,
            userSales,
            averagePrice: Math.floor(averagePrice * 100) / 100
        };
    }

    getEquipmentTypeStats() {
        const stats = {};
        
        this.listings.filter(l => l.status === 'active').forEach(listing => {
            if (!stats[listing.equipmentType]) {
                stats[listing.equipmentType] = {
                    count: 0,
                    minPrice: Infinity,
                    maxPrice: 0,
                    averagePrice: 0,
                    totalPrice: 0
                };
            }
            
            const stat = stats[listing.equipmentType];
            stat.count++;
            stat.minPrice = Math.min(stat.minPrice, listing.price);
            stat.maxPrice = Math.max(stat.maxPrice, listing.price);
            stat.totalPrice += listing.price;
        });

        // Calcular precios promedio
        Object.keys(stats).forEach(type => {
            const stat = stats[type];
            stat.averagePrice = Math.floor((stat.totalPrice / stat.count) * 100) / 100;
        });

        return stats;
    }

    async watchListing(listingId) {
        try {
            const user = window.supabaseIntegration?.getCurrentUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            const listing = this.listings.find(l => l.id === listingId);
            if (!listing) {
                throw new Error('Listing no encontrado');
            }

            if (listing.sellerId === user.id) {
                throw new Error('No puedes seguir tu propio listing');
            }

            if (listing.watchers.includes(user.id)) {
                throw new Error('Ya estás siguiendo este listing');
            }

            // Agregar watcher
            listing.watchers.push(user.id);

            // Actualizar en Supabase
            await window.supabaseIntegration.makeRequest(
                'PATCH',
                `/rest/v1/marketplace_listings?id=eq.${listingId}`,
                { watchers: listing.watchers }
            );

            this.saveMarketplaceData();

            console.log(`✅ Listing seguido: ${listing.equipmentType} nivel ${listing.level}`);
            return {
                success: true
            };

        } catch (error) {
            console.error('❌ Error siguiendo listing:', error);
            throw error;
        }
    }

    async unwatchListing(listingId) {
        try {
            const user = window.supabaseIntegration?.getCurrentUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            const listing = this.listings.find(l => l.id === listingId);
            if (!listing) {
                throw new Error('Listing no encontrado');
            }

            if (!listing.watchers.includes(user.id)) {
                throw new Error('No estás siguiendo este listing');
            }

            // Remover watcher
            listing.watchers = listing.watchers.filter(id => id !== user.id);

            // Actualizar en Supabase
            await window.supabaseIntegration.makeRequest(
                'PATCH',
                `/rest/v1/marketplace_listings?id=eq.${listingId}`,
                { watchers: listing.watchers }
            );

            this.saveMarketplaceData();

            console.log(`✅ Listing dejado de seguir: ${listing.equipmentType} nivel ${listing.level}`);
            return {
                success: true
            };

        } catch (error) {
            console.error('❌ Error dejando de seguir listing:', error);
            throw error;
        }
    }

    getWatchedListings() {
        const user = window.supabaseIntegration?.getCurrentUser();
        if (!user) return [];

        return this.listings.filter(listing => 
            listing.watchers.includes(user.id) && listing.status === 'active'
        );
    }

    getUserListings() {
        return this.userListings;
    }

    getUserPurchases() {
        return this.userPurchases;
    }

    getUserSales() {
        return this.userSales;
    }

    saveMarketplaceData() {
        const data = {
            listings: this.listings,
            userListings: this.userListings,
            userPurchases: this.userPurchases,
            userSales: this.userSales
        };
        localStorage.setItem('rsc_marketplace_data', JSON.stringify(data));
    }

    // Método para obtener recomendaciones de precios
    getPriceRecommendation(equipmentType, level) {
        const similarListings = this.listings.filter(listing => 
            listing.equipmentType === equipmentType && 
            listing.level === level && 
            listing.status === 'active'
        );

        if (similarListings.length === 0) {
            // Si no hay listings similares, usar precio base
            const equipmentStats = window.equipmentSystem?.getEquipmentStats(equipmentType);
            return equipmentStats ? equipmentStats.cost * 0.8 : 100; // 80% del costo de mejora
        }

        const prices = similarListings.map(l => l.price);
        const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        
        return Math.floor(averagePrice * 100) / 100;
    }
}

// Crear instancia global
window.marketplaceSystem = new MarketplaceSystem();

console.log('🛒 Marketplace System cargado');

