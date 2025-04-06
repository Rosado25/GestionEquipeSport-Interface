class Statistics {
    /**
     * Constructeur de la classe Statistics
     */
    constructor() {
        this.API_CONFIG = {
            baseUrl: '/R4.01/gestionequipesport-api/api/stats/',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };

        this.elements = {
            matchStats: document.querySelector("#matchs-stats"),
            playerStats: document.querySelector("#player-stats")
        };

        this.initialize();
    }

    /**
     * Initialise la page des statistiques
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            await Promise.all([
                this.fetchStatsMatchs(),
                this.fetchStatsJouers()
            ]);
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des statistiques:', error);
        }
    }

    /**
     * Effectue un appel API
     * @param {string} endpoint
     * @returns {Promise<Object>} Données de la réponse
     */
    async fetchApi(endpoint) {
        try {
            const response = await fetch(`${this.API_CONFIG.baseUrl}${endpoint}`, {
                headers: this.API_CONFIG.headers
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/R4.01/gestionequipesport-interface/src/views/login.php';
                    return { data: null };
                }
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }

            const { response: { data } } = await response.json();
            return { data };
        } catch (error) {
            console.error(`Erreur lors de la récupération de ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Récupère et affiche les statistiques des matchs
     * @returns {Promise<void>}
     */
    async fetchStatsMatchs() {
        try {
            const { data } = await this.fetchApi('match');

            if (data) {
                const { total, won, lost, draw, wonPercentage, lostPercentage, drawPercentage } = data;
                this.elements.matchStats.innerHTML += this.generateMatchStatsHTML(
                    total, won, lost, draw, wonPercentage, lostPercentage, drawPercentage
                );
            } else {
                this.elements.matchStats.innerHTML += `<p>Pas de stats.</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de matchStats :", error);
            this.elements.matchStats.innerHTML += `<p>Impossible de charger les stats.</p>`;
        }
    }

    /**
     * Récupère et affiche les statistiques des joueurs
     * @returns {Promise<void>}
     */
    async fetchStatsJouers() {
        try {
            const { data } = await this.fetchApi('player');

            if (data && data.length > 0) {
                const rows = await Promise.all(
                    data.map(player => this.generatePlayerRow(player))
                );
                this.elements.playerStats.innerHTML = rows.join("");
            } else {
                this.elements.playerStats.innerHTML = `<p>Aucune stat.</p>`;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des stats joueurs :", error);
            this.elements.playerStats.innerHTML = `<p>Impossible de charger les stats.</p>`;
        }
    }

    /**
     * Récupère les sélections consécutives d'un joueur
     * @param {number} playerId - ID du joueur
     * @returns {Promise<string>} Nombre de sélections consécutives ou message d'erreur
     */
    async fetchConsecutiveSelections(playerId) {
        try {
            const response = await fetch(`${this.API_CONFIG.baseUrl}consecutive-selections`, {
                method: "POST",
                headers: this.API_CONFIG.headers,
                body: JSON.stringify({ playerId })
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }

            const data = await response.json();
            return data.data ?? "N/A";
        } catch (error) {
            console.error(`Erreur pour récupérer les sélections du joueur ${playerId} :`, error);
            return "Erreur";
        }
    }

    /**
     * Génère le HTML pour les statistiques des matchs
     * @param {Object} params - Paramètres des statistiques
     * @returns {string} HTML généré
     */
    generateMatchStatsHTML(total, won, lost, draw, wonPercentage, lostPercentage, drawPercentage) {
        return `
            <div class="statistiques-card">
                <i class="fas fa-futbol"></i>
                <div>
                    <h3>Total de matchs</h3>
                    <p>${total}</p>
                </div>
            </div>
            <div class="statistiques-card">
                <i class="fas fa-trophy"></i>
                <div>
                    <h3>Matchs gagnés</h3>
                    <p>${won} (${wonPercentage.toFixed(1)}%)</p>
                </div>
            </div>
            <div class="statistiques-card">
                <i class="fas fa-handshake"></i>
                <div>
                    <h3>Matchs nuls</h3>
                    <p>${draw} (${drawPercentage.toFixed(1)}%)</p>
                </div>
            </div>
            <div class="statistiques-card">
                <i class="fas fa-times"></i>
                <div>
                    <h3>Matchs perdus</h3>
                    <p>${lost} (${lostPercentage.toFixed(1)}%)</p>
                </div>
            </div>
        `;
    }

    /**
     * Génère une ligne du tableau pour un joueur
     * @param {Object} player - Données du joueur
     * @returns {Promise<string>} HTML de la ligne générée
     */
    async generatePlayerRow(player) {
        const consecutiveSelections = await this.fetchConsecutiveSelections(player.id);
        return `
            <tr>
                <td>${player.surname} ${player.name}</td>
                <td>${player.status}</td>
                <td>${player.preferredPosition}</td>
                <td>${player.titularMatches}</td>
                <td>${player.substituteMatches}</td>
                <td>${player.avgRating ? parseFloat(player.avgRating).toFixed(1) : "N/A"}</td>
                <td>${parseFloat(player.winRate).toFixed(1)}%</td>
                <td>${consecutiveSelections}</td>
            </tr>
        `;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    new Statistics();
});