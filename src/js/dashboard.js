class Dashboard {
    /**
     * Constructeur de la classe Dashboard
     */
    constructor() {
        this.API_CONFIG = {
            baseUrl: '/R4.01/gestionequipesport-api/api/dashboard/',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };
        this.initElements();
    }

    /**
     * Initialise les éléments DOM
     */
    initElements() {
        this.elements = {
            performanceChart: document.getElementById('performanceChart'),
            cardNextMatch: document.querySelector('.cardNextMatch'),
            dernierMatchs: document.getElementById('dernierMatchs'),
            // Ajout des éléments statistiques
            stats: {
                victories: document.getElementById('victories'),
                nbMatchs: document.getElementById('NbMatchs'),
                nbGagnes: document.getElementById('NbGagnés'),
                butsM: document.getElementById('ButsM'),
                butsS: document.getElementById('ButsS'),
                butsPm: document.getElementById('ButsPm'),
                cs: document.getElementById('Cs'),
                db: document.getElementById('Db'),
                performanceEquipe: document.getElementById('PerformanceEquipe'),
                moyenneNotes: document.getElementById('MoyenneNotes'),
                points: document.getElementById('points')
            }
        };
    }

    /**
     * Effectue un appel API
     * @param endpoint
     * @returns {Promise<{data: *}|null>}
     */
    async fetchApi(endpoint) {
        try {
            const response = await fetch(`${this.API_CONFIG.baseUrl}${endpoint}`, {
                headers: this.API_CONFIG.headers
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/R4.01/gestionequipesport-interface/src/views/login.php';
                    return null;
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

    updateElement(selector, content) {
        const element = document.querySelector(selector);
        if (element) element.innerHTML = content;
    }

    /**
     * Calcul la performance d'un match
     * @param match
     * @returns {number}
     */
    calculatePerformance(match) {
        if (!match?.résultat) return 0;

        const [goalsFor, goalsAgainst] = match.résultat.split('-').map(Number);
        const goalDifference = goalsFor - goalsAgainst;

        let performance = 5;
        if (goalDifference > 0) performance += 3;
        else if (goalDifference < 0) performance -= 2;
        performance += Math.min(Math.abs(goalDifference), 3) * 0.5;
        if (goalsAgainst === 0) performance += 1;
        if (goalsFor >= 3) performance += 1;

        return Math.max(0, Math.min(10, performance));
    }

    /**
     * Affiche le graphique de performance
     * @returns {Promise<void>}
     */
    async displayPerformanceChart() {
        try {
            const { data } = await this.fetchApi('last-matches?numMatches=5');
            if (!Array.isArray(data)) return;

            const chartData = data.map(match => ({
                date: new Date(match.date_heure).toLocaleDateString('fr-FR'),
                performance: this.calculatePerformance(match)
            }));

            const ctx = this.elements.performanceChart?.getContext('2d');
            if (!ctx) return;

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartData.map(item => item.date),
                    datasets: [{
                        label: 'Performance de l\'équipe',
                        data: chartData.map(item => item.performance),
                        borderColor: '#ffcc00',
                        backgroundColor: 'rgba(255, 204, 0, 0.2)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10,
                            title: { display: true, text: 'Performance (0-10)' }
                        },
                        x: {
                            title: { display: true, text: 'Date du match' }
                        }
                    },
                    plugins: {
                        title: { display: true, text: 'Évolution de la performance' },
                        legend: { display: true, position: 'bottom' }
                    }
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'affichage du graphique:', error);
        }
    }

    /**
     * Affiche les trois derniers matchs
     * @returns {Promise<void>}
     */
    async displayLastThreeMatches() {
        try {
            const { data } = await this.fetchApi('last-matches?numMatches=3');
            if (!Array.isArray(data)) return;

            const matchesHTML = data.map(match => {
                const [myTeamScore, opponentScore] = match.résultat.split('-').map(Number);
                const isHomeGame = match.lieu === true;
                const result = myTeamScore > opponentScore ? 'Victoire' :
                    myTeamScore < opponentScore ? 'Défaite' : 'Nul';
                const resultClass = result === 'Victoire' ? 'text-success' :
                    result === 'Défaite' ? 'text-danger' : 'text-warning';

                return `
                    <tr>
                        <td class="fw-bold">${isHomeGame ? `Abdel FC vs ${match.Adversaire}` : `${match.Adversaire} vs Abdel FC`}</td>
                        <td class="text-center">${isHomeGame ? match.résultat : `${opponentScore}-${myTeamScore}`}</td>
                        <td class="text-center ${resultClass}">${result}</td>
                    </tr>
                `;
            }).join('');

            this.updateElement('#dernierMatchs', matchesHTML);
        } catch (error) {
            console.error('Erreur lors de l\'affichage des derniers matchs:', error);
            this.updateElement('#dernierMatchs', '<tr><td colspan="3">Impossible de charger les derniers matchs.</td></tr>');
        }
    }

    /**
     * Affiche le prochain match
     * @returns {Promise<void>}
     */
    async displayNextMatch() {
        try {
            const { data } = await this.fetchApi('next-game');

            if (!data || data === 'Pas de Matchs') {
                this.updateElement('.cardNextMatch', '<h3><i class="fas fa-calendar-alt"></i> Prochain Match</h3><p>Aucun match prévu</p>');
                return;
            }

            const date = new Date(data.date_heure).toLocaleString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            this.updateElement('.cardNextMatch', `
                <p><i class="fas fa-calendar"></i> <strong>${date}</strong></p>
                <p><i class="fas fa-users"></i> <strong>AbdelFC</strong> vs <strong>${data.Adversaire}</strong></p>
                <p><i class="fas fa-map-marker-alt"></i> <strong>${data.lieu ? 'Domicile' : 'Extérieur'}</strong></p>
            `);
        } catch (error) {
            console.error('Erreur lors de l\'affichage du prochain match:', error);
            this.updateElement('.cardNextMatch',
                '<h3><i class="fas fa-calendar-alt"></i> Prochain Match</h3>' +
                '<p>Impossible de charger le prochain match</p>'
            );
        }
    }

    /**
     * Initialise le tableau de bord
     * @returns {Promise<void>}
     */
    async initialize() {
        try {
            await Promise.all([
                this.displayPerformanceChart(),
                this.displayNextMatch(),
                this.displayLastThreeMatches(),
                this.updateStatistics()
            ]);
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du tableau de bord:', error);
        }
    }

    /**
     * Met à jour les statistiques de l'équipe
     * @returns {Promise<void>}
     */
    async updateStatistics() {
        try {
            const statsMap = {
                points: { endpoint: 'points', label: 'Points' },
                victories: { endpoint: 'win-rate', label: 'Pourcentage ', format: val => `${(val || 0).toFixed(1)}%` },
                nbMatchs: { endpoint: 'matches-played', label: 'Matchs joués' },
                nbGagnes: { endpoint: 'count-matches-won', label: 'Matchs gagnés' },
                butsM: { endpoint: 'goals-scored', label: 'Buts marqués' },
                butsS: { endpoint: 'goals-conceded', label: 'Buts subis' },
                butsPm: { endpoint: 'goals-per-game', label: 'Buts par match', format: val => (val || 0).toFixed(1) },
                cs: { endpoint: 'clean-sheets', label: 'Clean Sheets' },
                db: { endpoint: 'goals-diff', label: 'Différence de buts' },
                performanceEquipe: { endpoint: 'team-performance-note', label: 'Performance: ', format: val => `${(val || 0).toFixed(1)}/10` },
                moyenneNotes: { endpoint: 'team-average-note', label: 'Moyenne des notes', format: val => `${(val || 0).toFixed(1)}/10` }
            };

            await Promise.all(
                Object.entries(statsMap).map(async ([elementId, { endpoint, label, format = val => val || 0 }]) => {
                    try {
                        const { data } = await this.fetchApi(endpoint);
                        if (this.elements.stats[elementId]) {
                            this.elements.stats[elementId].textContent = `${label} : ${format(data)}`;
                        }
                    } catch (error) {
                        console.error(`Erreur pour ${endpoint}:`, error);
                        if (this.elements.stats[elementId]) {
                            this.elements.stats[elementId].textContent = `${label} : N/A`;
                        }
                    }
                })
            );

            await this.updateBestPlayer();
        } catch (error) {
            console.error('Erreur lors de la mise à jour des statistiques:', error);
        }
    }

    /**
     * Met à jour le meilleur joueur
     * @returns {Promise<void>}
     */
    async updateBestPlayer() {
        try {
            const { data } = await this.fetchApi('best-player');
            if (data) {
                this.updateElement('#test', `<strong>${data.Nom_Joueur}</strong>`);
                this.updateElement('#BestPlayerMoyenne', `Moyenne des notes : <strong>${parseFloat(data.moyenneNotes).toFixed(1)}</strong>`);
                const playerImg = document.querySelector('#BestPlayerImg');
                if (playerImg) {
                    playerImg.src = `../assets/data-player/${data.Image}`;
                    playerImg.alt = `Photo de ${data.Nom_Joueur}`;
                }
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du meilleur joueur:', error);
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
    dashboard.initialize();
});