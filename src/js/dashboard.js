// Configuration API globale
const API_CONFIG = {
    baseUrl: '/R4.01/gestionequipesport-api/api/dashboard/',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
};

/**
 * Fonction générique pour effectuer les appels API
 * @param {string} endpoint - Point de terminaison de l'API
 * @returns {Promise<Object>} Données de la réponse
 */
async function fetchApi(endpoint) {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
            headers: API_CONFIG.headers
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/R4.01/gestionequipesport-interface/src/views/login.php';
                return;
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
 * Met à jour le contenu d'un élément HTML
 * @param {string} selector - Sélecteur CSS de l'élément
 * @param {string} content - Nouveau contenu HTML
 */
function updateElement(selector, content) {
    const element = document.querySelector(selector);
    if (element) element.innerHTML = content;
}

/**
 * Calcule la performance d'un match sur une échelle de 0 à 10
 * @param {Object} match - Données du match
 * @returns {number} Score de performance
 */
function calculatePerformance(match) {
    if (!match?.résultat) return 0;

    const [goalsFor, goalsAgainst] = match.résultat.split('-').map(Number);
    const goalDifference = goalsFor - goalsAgainst;

    let performance = 5; // Point de départ médian

    // Impact du résultat
    if (goalDifference > 0) performance += 3;      // Victoire
    else if (goalDifference < 0) performance -= 2; // Défaite

    // Impact de la différence de buts (plafonné à 3)
    performance += Math.min(Math.abs(goalDifference), 3) * 0.5;

    // Bonus clean sheet
    if (goalsAgainst === 0) performance += 1;

    // Bonus match prolifique
    if (goalsFor >= 3) performance += 1;

    return Math.max(0, Math.min(10, performance));
}

/**
 * Affiche le graphique de performance des 5 derniers matchs
 */
async function displayPerformanceChart() {
    try {
        const { data } = await fetchApi('last-matches?numMatches=5');
        if (!Array.isArray(data)) return;

        const chartData = data.map(match => ({
            date: new Date(match.date_heure).toLocaleDateString('fr-FR'),
            performance: calculatePerformance(match)
        }));

        const ctx = document.getElementById('performanceChart').getContext('2d');
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
                        title: {
                            display: true,
                            text: 'Performance (0-10)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date du match'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Évolution de la performance'
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'affichage du graphique:', error);
    }
}

/**
 * Affiche les trois derniers matchs
 */
async function displayLastThreeMatches() {
    try {
        const { data } = await fetchApi('last-matches?numMatches=3');
        if (!Array.isArray(data)) return;

        const tbody = document.getElementById('dernierMatchs');
        tbody.innerHTML = data.map(match => {
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
    } catch (error) {
        console.error('Erreur lors de l\'affichage des derniers matchs:', error);
        updateElement('#dernierMatchs', '<tr><td colspan="3">Impossible de charger les derniers matchs.</td></tr>');
    }
}

/**
 * Affiche les informations du prochain match
 */
async function displayNextMatch() {
    try {
        const response = await fetch(`${API_CONFIG.baseUrl}next-game`, {
            headers: API_CONFIG.headers
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const { response: { data } } = await response.json();

        if (!data || data === 'Pas de Matchs') {
            updateElement('.cardNextMatch', '<h3><i class="fas fa-calendar-alt"></i> Prochain Match</h3><p>Aucun match prévu</p>');
            return;
        }

        const date = new Date(data.date_heure).toLocaleString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const matchInfo = `
            <h3><i class="fas fa-calendar-alt"></i> Prochain Match</h3>
            <p><i class="fas fa-calendar"></i> <strong>${date}</strong></p>
            <p><i class="fas fa-users"></i> <strong>AbdelFC</strong> vs <strong>${data.Adversaire}</strong></p>
            <p><i class="fas fa-map-marker-alt"></i> <strong>${data.lieu ? 'Domicile' : 'Extérieur'}</strong></p>
        `;
        updateElement('.cardNextMatch', matchInfo);
    } catch (error) {
        console.error('Erreur lors de l\'affichage du prochain match:', error);
        updateElement('.cardNextMatch',
            '<h3><i class="fas fa-calendar-alt"></i> Prochain Match</h3>' +
            '<p>Impossible de charger le prochain match</p>'
        );
    }
}

// Initialisation du tableau de bord
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await Promise.all([
            displayPerformanceChart(),
            displayNextMatch(),
            displayLastThreeMatches(),

            // Statistiques générales avec labels explicites
            fetchApi('points').then(({ data }) =>
                updateElement('#points', `Points au classement: <strong>${data || 0}</strong>`)),
            fetchApi('win-rate').then(({ data }) =>
                updateElement('#victories', `Taux de victoire: <strong>${(data || 0).toFixed(1)}%</strong>`)),
            fetchApi('matches-played').then(({ data }) =>
                updateElement('#NbMatchs', `Matchs joués: <strong>${data || 0}</strong>`)),
            fetchApi('count-matches-won').then(({ data }) =>
                updateElement('#NbGagnés', `Matchs gagnés: <strong>${data || 0}</strong>`)),
            fetchApi('goals-scored').then(({ data }) =>
                updateElement('#ButsM', `Buts marqués: <strong>${data || 0}</strong>`)),
            fetchApi('goals-conceded').then(({ data }) =>
                updateElement('#ButsS', `Buts encaissés: <strong>${data || 0}</strong>`)),
            fetchApi('goals-per-game').then(({ data }) =>
                updateElement('#ButsPm', `Buts par match: <strong>${(data || 0).toFixed(1)}</strong>`)),
            fetchApi('clean-sheets').then(({ data }) =>
                updateElement('#Cs', `Clean sheets: <strong>${data || 0}</strong>`)),
            fetchApi('goals-diff').then(({ data }) =>
                updateElement('#Db', `Différence de buts: <strong>${data || 0}</strong>`)),
            fetchApi('team-performance-note').then(({ data }) =>
                updateElement('#PerformanceEquipe', `Performance équipe: <strong>${(data || 0).toFixed(1)}/10</strong>`)),
            fetchApi('team-average-note').then(({ data }) =>
                updateElement('#MoyenneNotes', `Note moyenne: <strong>${parseFloat(data || 0).toFixed(1)}/10</strong>`)),

            // Meilleur joueur avec carte détaillée
            fetchApi('best-player').then(({ data }) => {
                if (data) {
                    updateElement('#test', `<strong>${data.Nom_Joueur}</strong>`);
                    updateElement('#BestPlayerMoyenne', `Moyenne des notes" : <strong>${parseFloat(data.moyenneNotes).toFixed(1)}</strong>`);
                    const playerImg = document.querySelector('#BestPlayerImg');
                    if (playerImg) {
                        playerImg.src = `../assets/data-player/${data.Image}`;
                        playerImg.alt = `Photo de ${data.Nom_Joueur}`;
                    }
                }
            })
        ]);
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du tableau de bord:', error);
    }
});