const API_CONFIG = {
    baseUrl: '/R4.01/gestionequipesport-api/api/sheet/',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
};

// État global
let isMatchPassed = false; // Indique si le match est déjà passé
const originalTexts = {}; // Stocke les textes originaux des positions

async function fetchApi(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: API_CONFIG.headers
        };
        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, options);

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

// Configuration des notifications
const showNotification = (type, message) => Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
}).fire({
    icon: type,
    title: message
});

const showError = (message) => showNotification('error', message);
const showSuccess = (message) => showNotification('success', message);

// Fonctions de récupération des données
const fetchMatchDetails = async (matchId) => {
    try {
        const { data } = await fetchApi(`detail?id=${matchId}`);
        if (data) {
            updateMatchDisplay(data);
            isMatchPassed = await checkIfMatchPassed(matchId);
            handleMatchPassedState();
        }
    } catch (error) {
        console.error("Fetch match details error:", error);
        showError('Erreur lors de la récupération des détails du match');
    }
};

const checkIfMatchPassed = async (matchId) => {
    try {
        const { data } = await fetchApi(`is-passed?id=${matchId}`);
        return data;
    } catch (error) {
        console.error("Check match passed error:", error);
        return false;
    }
};

const fetchCurrentTeamPlayers = async (matchId) => {
    try {
        const { data } = await fetchApi(`team-composition?id=${matchId}`);
        return data.map(player => player.Prenom + ' ' + player.Nom);
    } catch (error) {
        console.error("Fetch current team players error:", error);
        return [];
    }
};

const fetchNonInjuredPlayers = async (matchId) => {
    try {
        const currentTeamPlayers = await fetchCurrentTeamPlayers(matchId);
        const { data } = await fetchApi('non-injured-players');
        if (data) {
            const availablePlayers = data.filter(player => !currentTeamPlayers.includes(player.Prenom + ' ' + player.Nom));
            updatePlayerList(availablePlayers);
            initDragAndDrop();
        }
    } catch (error) {
        console.error("Fetch players error:", error);
        showError('Erreur lors de la récupération des joueurs');
    }
};

// Fonctions de mise à jour du DOM
const updateMatchDisplay = (match) => {
    document.querySelector('.match-date').textContent = new Date(match.date_heure).toLocaleString();
    document.querySelector('.match-opponent').textContent = match.Adversaire;
    document.querySelector('.match-location').textContent = match.lieu ? 'Domicile' : 'Extérieur';
    document.querySelector('.match-score').textContent = match.résultat || 'Non joué';
};

const updatePlayerList = (players) => {
    const playerList = document.getElementById('playerdispo');
    if (!playerList) return;

    playerList.innerHTML = players.map(player => `
        <li id="player-${player.Id_Joueur}"
            data-name="${player.Prenom} ${player.Nom}"
            data-position="${player.Poste}"
            data-image="${player.Image || 'default.jpg'}"
            data-weight="${player.Poids}"
            data-height="${player.Taille}"
            draggable="true">
            <img src="../assets/data-player/${player.Image || 'default.jpg'}" alt="${player.Prenom} ${player.Nom}">
            <div class="player-info">
                <span class="player-name">${player.Prenom} ${player.Nom}</span>
                <span class="player-position">${player.Poste}</span>
            </div>
        </li>
    `).join('');
};

// Fonctions de gestion de l'équipe
const handleMatchPassedState = () => {
    const elements = {
        verifierEquipeButton: document.getElementById('verifierEquipe'),
        validerEquipeButton: document.getElementById('validerEquipe'),
        dropTargets: document.querySelectorAll('.position, .sub')
    };

    if (isMatchPassed) {
        elements.verifierEquipeButton.disabled = true;
        elements.validerEquipeButton.disabled = true;
        elements.dropTargets.forEach(target => {
            target.removeEventListener('dragover', handleDragOver);
            target.removeEventListener('drop', handleDrop);
        });
        showNotification('info', 'Ce match est passé. La composition ne peut plus être modifiée.');
    }
};

// Enregistrement de l'équipe
const saveTeam = async () => {
    const matchId = document.querySelector('input[name="idMatch"]').value;
    const players = [];
    const positions = [];
    const notes = [];

    document.querySelectorAll('.position, .sub').forEach(position => {
        const player = position.querySelector('img');
        if (player) {
            players.push(player.dataset.name);
            positions.push(position.id);
            const noteInput = document.querySelector(`input[data-player="${player.dataset.name}"]`);
            const note = noteInput ? noteInput.value : 'N/A';
            notes.push(note || 'N/A');
        }
    });

    console.log('Saving team with the following data:', { matchId, players, positions, notes });

    try {
        const response = await fetch(`${API_CONFIG.baseUrl}register-team`, {
            method: 'POST',
            headers: API_CONFIG.headers,
            body: JSON.stringify({
                idMatch: matchId,
                playerslist: players,
                positionslist: positions,
                noteslist: notes
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        showSuccess(result.response.message);
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
        showError('Erreur lors de l\'enregistrement de l\'équipe');
    }
};

document.getElementById('validerEquipe').addEventListener('click', saveTeam);

document.getElementById('validerEquipe').addEventListener('click', saveTeam);

// Gestion du tableau d'équipe
const refreshTeamTable = async (players, positions) => {
    const tableBody = document.querySelector('#tablelist tbody');
    if (!tableBody) return;

    const matchId = document.querySelector('input[name="idMatch"]').value;
    const { data: teamComposition } = await fetchApi(`team-composition?id=${matchId}`);

    tableBody.innerHTML = players.map((player, index) => {
        const playerData = teamComposition.find(p => `${p.Prenom} ${p.Nom}` === player) || {};
        const note = playerData.Note || '';

        return `
            <tr>
                <td>${player}</td>
                <td>${positions[index]}</td>
                <td><input type="number" min="0" max="10" name="noteslist[]" data-player="${player}" value="${note}" placeholder="Note /10" /></td>
                <td>${playerData.Poids || 'N/A'}</td>
                <td>${playerData.Taille || 'N/A'}</td>
            </tr>
        `;
    }).join('');
};

const updatePlayerNotes = async () => {
    const matchId = document.querySelector('input[name="idMatch"]').value;
    const notes = [];
    const players = [];
    const initialNotes = [];

    document.querySelectorAll('input[name="noteslist[]"]').forEach(input => {
        players.push(input.dataset.player);
        notes.push(input.value);
        initialNotes.push(input.placeholder);
    });

    try {
        const response = await fetch(`${API_CONFIG.baseUrl}update-player-note`, {
            method: 'PUT',
            headers: API_CONFIG.headers,
            body: JSON.stringify({
                idMatch: matchId,
                idJoueurs: players,
                notes: notes,
                initialNotes: initialNotes
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        showSuccess(result.response.message);
    } catch (error) {
        console.error('Erreur lors de la mise à jour des notes:', error);
        showError('Erreur lors de la mise à jour des notes des joueurs');
    }
};

document.getElementById('validerEquipe').addEventListener('click', updatePlayerNotes);

const updateTeamTable = () => {
    const players = [];
    const positions = [];

    document.querySelectorAll('.position, .sub').forEach(target => {
        const img = target.querySelector('img');
        if (img) {
            players.push(img.dataset.name);
            positions.push(target.id);
        }
    });

    refreshTeamTable(players, positions);
};

// Initialisation du drag & drop
const initDragAndDrop = () => {
    const players = document.querySelectorAll('#playerdispo li, .position img, .sub img');
    const dropTargets = document.querySelectorAll('.position, .sub, #playerdispo');

    dropTargets.forEach(target => {
        originalTexts[target.id] = target.textContent;
    });

    players.forEach(player => {
        player.setAttribute('draggable', 'true');
        player.addEventListener('dragstart', handleDragStart);
        player.addEventListener('dragend', handleDragEnd);
    });

    dropTargets.forEach(target => {
        target.addEventListener('dragover', handleDragOver);
        target.addEventListener('drop', handleDrop);
    });
};

// Gestionnaires d'événements drag & drop
const handleDragStart = (e) => {
    const element = e.currentTarget;
    const isImage = element.tagName.toLowerCase() === 'img';
    const sourceElement = isImage ? element.parentElement : element;
    const sourceType = isImage ? (sourceElement.classList.contains('position') ? 'position' :
            sourceElement.classList.contains('sub') ? 'substitute' : 'field')
        : 'playerList';

    const data = {
        id: sourceElement.id,
        name: isImage ? element.dataset.name : element.dataset.name,
        position: isImage ? element.dataset.position : element.dataset.position,
        image: isImage ? element.src.split('/').pop() : element.dataset.image,
        height: isImage ? element.dataset.height : element.dataset.height,
        weight: isImage ? element.dataset.weight : element.dataset.weight,
        sourceType: sourceType,
        originalText: originalTexts[sourceElement.id] || ''
    };

    e.dataTransfer.setData('text/plain', JSON.stringify(data));
    element.classList.add('dragging');
};

const handleDragEnd = (e) => e.target.classList.remove('dragging');
const handleDragOver = (e) => e.preventDefault();

const handleDrop = async (e) => {
    e.preventDefault();
    if (isMatchPassed) {
        showError('Impossible de modifier l\'équipe : le match est déjà passé');
        return;
    }

    const target = e.target.closest('.position, .sub, #playerdispo');
    if (!target) return;

    try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        target.dataset.lastDrop = JSON.stringify({
            weight: data.weight,
            height: data.height
        });

        if (target.id === 'playerdispo') {
            await handlePlayerReturnToList(target, data);
        } else {
            await handlePlayerDrop(target, data);
        }
    } catch (error) {
        console.error("Drop error:", error);
        showError('Erreur lors du placement du joueur');
    }
};

// Gestion des joueurs
const handlePlayerDrop = async (target, playerData) => {
    if (target.querySelector('img')) {
        showError('Cette position est déjà occupée');
        return;
    }

    const img = document.createElement('img');
    img.src = `../assets/data-player/${playerData.image}`;
    img.alt = playerData.name;
    img.dataset.name = playerData.name;
    img.dataset.position = playerData.position;
    img.dataset.height = playerData.height;
    img.dataset.weight = playerData.weight;
    img.draggable = true;

    img.addEventListener('dragstart', handleDragStart);
    img.addEventListener('dragend', handleDragEnd);

    if (playerData.sourceType === 'field' || playerData.sourceType === 'position' || playerData.sourceType === 'substitute') {
        const sourceElement = document.querySelector(`#${playerData.id}`);
        if (sourceElement) {
            sourceElement.innerHTML = originalTexts[playerData.id] || '';
        }
    } else {
        const sourceElement = document.querySelector(`#${playerData.id}`);
        if (sourceElement) {
            sourceElement.style.display = 'none';
        }
    }

    target.innerHTML = '';
    target.appendChild(img);
    updateTeamTable();
};

const handlePlayerReturnToList = async (target, playerData) => {
    if (playerData.sourceType === 'position' || playerData.sourceType === 'substitute') {
        const sourceElement = document.querySelector(`#${playerData.id}`);
        if (sourceElement) {
            sourceElement.innerHTML = originalTexts[sourceElement.id] || '';
        }

        const listItem = document.querySelector(`#player-${playerData.id.split('-')[1]}`);
        if (listItem) {
            listItem.style.display = '';
        } else {
            const newPlayer = document.createElement('li');
            newPlayer.id = `player-${Date.now()}`;
            newPlayer.setAttribute('draggable', 'true');
            newPlayer.dataset.name = playerData.name;
            newPlayer.dataset.position = playerData.position;
            newPlayer.dataset.image = playerData.image;
            newPlayer.dataset.height = playerData.height;
            newPlayer.dataset.weight = playerData.weight;

            newPlayer.innerHTML = `
                <img src="../assets/data-player/${playerData.image}" alt="${playerData.name}">
                <div class="player-info">
                    <span class="player-name">${playerData.name}</span>
                    <span class="player-position">${playerData.position}</span>
                </div>
            `;

            newPlayer.addEventListener('dragstart', handleDragStart);
            newPlayer.addEventListener('dragend', handleDragEnd);

            const playerList = document.getElementById('playerdispo');
            if (playerList) {
                playerList.appendChild(newPlayer);
            }
        }

        updateTeamTable();
    }
};

// Initialisation des écouteurs d'événements
const initEventListeners = (elements, matchId) => {
    elements.verifierEquipeButton.addEventListener('click', () => {
        const filledPositions = document.querySelectorAll('.position img').length;
        const filledSubstitutes = document.querySelectorAll('.sub img').length;

        if (filledPositions === 11 && filledSubstitutes <= 5) {
            showSuccess("La configuration de l'équipe est valide!");
            elements.validerEquipeButton.disabled = false;
        } else {
            showError("Configuration de l'équipe invalide. Il doit y avoir exactement 11 joueurs et au plus 5 remplaçants.");
            elements.validerEquipeButton.disabled = true;
        }
    });

    elements.validerEquipeButton.addEventListener('click', saveTeam);
};

// Point d'entrée principal
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const matchId = urlParams.get('id');

        if (!matchId) throw new Error('ID du match non trouvé');
        console.log("Initialisation de la feuille de match");

        document.querySelector('input[name="idMatch"]').value = matchId;

        await Promise.all([
            fetchMatchDetails(matchId),
            fetchNonInjuredPlayers(matchId),
            loadTeamComposition(matchId)
        ]);

        const elements = {
            verifierEquipeButton: document.getElementById('verifierEquipe'),
            validerEquipeButton: document.getElementById('validerEquipe')
        };

        initEventListeners(elements, matchId);

    } catch (error) {
        console.error("Erreur d'initialisation:", error);
        showError('Erreur d\'initialisation de la feuille de match');
    }
});

// Fonction de chargement de la composition d'équipe
const loadTeamComposition = async (matchId) => {
    try {
        const { data } = await fetchApi(`team-composition?id=${matchId}`);
        if (data) {
            data.forEach(player => {
                const target = document.getElementById(player.Poste_Joueur);
                if (!target) return;

                const img = document.createElement('img');
                img.src = `../assets/data-player/${player.Image || 'default.jpg'}`;
                img.alt = `${player.Prenom} ${player.Nom}`;
                img.dataset.name = `${player.Prenom} ${player.Nom}`;
                img.dataset.position = player.Poste;
                img.dataset.height = player.Taille;
                img.dataset.weight = player.Poids;
                img.draggable = true;

                img.addEventListener('dragstart', handleDragStart);
                img.addEventListener('dragend', handleDragEnd);

                target.dataset.lastDrop = JSON.stringify({
                    weight: player.Poids,
                    height: player.Taille
                });

                target.innerHTML = '';
                target.appendChild(img);

                const listItem = document.querySelector(`#player-${player.Id_Joueur}`);
                if (listItem) {
                    listItem.style.display = 'none';
                }
            });

            updateTeamTable();
        }
    } catch (error) {
        console.error("Load team composition error:", error);
        showError('Erreur lors du chargement de la composition');
    }
};