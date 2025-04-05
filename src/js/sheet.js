// URL de base pour les requêtes API
const baseUrl = "/R4.01/gestionequipesport-api/src/routes/sheet.php/api/";

// État global
let isMatchPassed = false; // Indique si le match est déjà passé
const originalTexts = {}; // Stocke les textes originaux des positions

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
        const response = await fetch(`${baseUrl}detail?id=${matchId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data.status === 200) {
            const match = data.data;
            updateMatchDisplay(match);
            isMatchPassed = await checkIfMatchPassed(matchId);
            handleMatchPassedState();
        }
    } catch (error) {
        console.error("Fetch match details error:", error);
        showError('Erreur lors de la récupération des détails du match');
    }
};
// Fonction auxiliaire pour vérifier si le match est passé
const checkIfMatchPassed = async (matchId) => {
    try {
        const response = await fetch(`${baseUrl}is-passed?id=${matchId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        console.log('Match passed response:', data); // Pour debug
        return data.status === 200 ? data.data : false;
    } catch (error) {
        console.error("Check match passed error:", error);
        return false;
    }
};

const fetchNonInjuredPlayers = async () => {
    try {
        const response = await fetch(`${baseUrl}non-injured-players`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data.status === 200) {
            updatePlayerList(data.data);
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
    document.querySelector('.match-location').textContent = match.lieu;
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

const saveTeam = async () => {
    if (isMatchPassed) {
        showError('Impossible de modifier l\'équipe : le match est déjà passé');
        return;
    }

    const players = [];
    const positions = [];
    const notes = [];

    document.querySelectorAll('.position img, .sub img').forEach(img => {
        if (img) {
            players.push(img.dataset.name);
            positions.push(img.parentElement.id);
            const noteInput = document.querySelector(`input[name="noteslist[]"][data-player="${img.dataset.name}"]`);
            notes.push(noteInput ? noteInput.value : '');
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('id');

    try {
        const response = await fetch(`${baseUrl}register-team`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idMatch: matchId,
                playerslist: players,
                positionslist: positions,
                noteslist: notes
            })
        });

        const data = await response.json();
        if (data.status === 201) {
            showSuccess('Équipe enregistrée avec succès');
        } else {
            throw new Error(data.data || 'Erreur lors de l\'enregistrement');
        }
    } catch (error) {
        console.error("Save team error:", error);
        showError('Erreur lors de l\'enregistrement de l\'équipe');
    }
};

// Gestion du tableau d'équipe
const refreshTeamTable = (players, positions) => {
    const tableBody = document.querySelector('#tablelist tbody');
    if (!tableBody) return;

    tableBody.innerHTML = players.map((player, index) => {
        const playerElement = document.querySelector(`.position img[data-name="${player}"], .sub img[data-name="${player}"]`);
        const playerData = JSON.parse(playerElement.parentElement.dataset.lastDrop || '{"weight": "N/A", "height": "N/A"}');

        return `
            <tr>
                <td>${player}</td>
                <td>${positions[index]}</td>
                <td><input type="number" min="0" max="10" name="noteslist[]" data-player="${player}" placeholder="Note /10"></td>
                <td>${playerData.weight}</td>
                <td>${playerData.height}</td>
            </tr>
        `;
    }).join('');
};

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

        await Promise.all([
            fetchMatchDetails(matchId),
            fetchNonInjuredPlayers(),
            loadTeamComposition(matchId) // Ajout de l'appel à loadTeamComposition
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

// Fonction de chargement de la composition d'équipe (déplacée en dehors du DOMContentLoaded)
const loadTeamComposition = async (matchId) => {
    try {
        const response = await fetch(`${baseUrl}team-composition?id=${matchId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data.status === 200 && data.data) {
            data.data.forEach(player => {
                const target = document.getElementById(player.Poste_Joueur);
                if (!target) return;

                // Créer l'image du joueur
                const img = document.createElement('img');
                img.src = `../assets/data-player/${player.Image || 'default.jpg'}`;
                img.alt = `${player.Prenom} ${player.Nom}`;
                img.dataset.name = `${player.Prenom} ${player.Nom}`;
                img.dataset.position = player.Poste;
                img.dataset.height = player.Taille;
                img.dataset.weight = player.Poids;
                img.draggable = true;

                // Ajouter les événements de drag
                img.addEventListener('dragstart', handleDragStart);
                img.addEventListener('dragend', handleDragEnd);

                // Sauvegarder les données pour le tableau
                target.dataset.lastDrop = JSON.stringify({
                    weight: player.Poids,
                    height: player.Taille
                });

                // Placer le joueur sur le terrain
                target.innerHTML = '';
                target.appendChild(img);

                // Cacher le joueur de la liste des disponibles
                const listItem = document.querySelector(`#player-${player.Id_Joueur}`);
                if (listItem) {
                    listItem.style.display = 'none';
                }
            });

            // Mettre à jour le tableau
            updateTeamTable();
        }
    } catch (error) {
        console.error("Load team composition error:", error);
        showError('Erreur lors du chargement de la composition');
    }
};
