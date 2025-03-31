const baseUrl = "/R4.01/gestionequipesport-api/src/routes/sheet.php/api/";

// Show notifications
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

// Fetch data functions
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
        }
    } catch (error) {
        console.error("Fetch match details error:", error);
        showError('Erreur lors de la récupération des détails du match');
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

// DOM update functions
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

// Team management functions
const refreshTeamTable = (players, positions) => {
    const tableBody = document.querySelector('#tablelist tbody');
    if (!tableBody) return;

    tableBody.innerHTML = players.map((player, index) => `
        <tr>
            <td>${player}</td>
            <td>${positions[index]}</td>
            <td><input type="number" min="0" max="10" name="noteslist[]" placeholder="Note /10"></td>
        </tr>
    `).join('');
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

// Drag and drop functions
const originalTexts = {};

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
        sourceType: sourceType,
        originalText: originalTexts[sourceElement.id] || ''
    };

    e.dataTransfer.setData('text/plain', JSON.stringify(data));
    element.classList.add('dragging');

    console.log("Drag started with data:", data);
};

const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
};

const handleDragOver = (e) => {
    e.preventDefault();
};

const handleDrop = async (e) => {
    e.preventDefault();
    const target = e.target.closest('.position, .sub, #playerdispo');
    if (!target) return;

    try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        console.log("Drop data:", data);

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
            sourceElement.style.display = 'none'; // Hide instead of removing
        }
    }

    target.innerHTML = '';
    target.appendChild(img);
    updateTeamTable();
};

const handlePlayerRemoval = (e) => {
    const target = e.currentTarget;
    const img = target.querySelector('img');
    if (img) {
        const originalText = originalTexts[target.id];
        console.log("Restoring original text:", originalText, "for target:", target.id);
        target.innerHTML = originalText;
        updateTeamTable();
    }
};

const handlePlayerReturnToList = async (target, playerData) => {
    console.log("Returning player to list:", playerData);

    // Si le joueur vient d'une position sur le terrain
    if (playerData.sourceType === 'position' || playerData.sourceType === 'substitute') {
        const sourceElement = document.querySelector(`#${playerData.id}`);
        if (sourceElement) {
            // Restaurer le texte original de la position
            sourceElement.innerHTML = originalTexts[sourceElement.id] || '';
        }

        // Afficher le joueur dans la liste
        const listItem = document.querySelector(`#player-${playerData.id.split('-')[1]}`);
        if (listItem) {
            listItem.style.display = '';
        } else {
            // Si le joueur n'existe pas dans la liste, le créer
            const newPlayer = document.createElement('li');
            newPlayer.id = `player-${Date.now()}`; // ID unique
            newPlayer.setAttribute('draggable', 'true');
            newPlayer.dataset.name = playerData.name;
            newPlayer.dataset.position = playerData.position;
            newPlayer.dataset.image = playerData.image;

            newPlayer.innerHTML = `
                <img src="../assets/data-player/${playerData.image}" alt="${playerData.name}">
                <div class="player-info">
                    <span class="player-name">${playerData.name}</span>
                    <span class="player-position">${playerData.position}</span>
                </div>
            `;

            // Ajouter les événements drag
            newPlayer.addEventListener('dragstart', handleDragStart);
            newPlayer.addEventListener('dragend', handleDragEnd);

            // Ajouter à la liste
            const playerList = document.getElementById('playerdispo');
            if (playerList) {
                playerList.appendChild(newPlayer);
            }
        }

        updateTeamTable();
    }
};

// Initialize event listeners
const initEventListeners = (elements, matchId) => {
    elements.verifierEquipeButton.addEventListener('click', () => {
        const filledPositions = document.querySelectorAll('.position img').length;
        const filledSubstitutes = document.querySelectorAll('.sub img').length;

        if (filledPositions === 11 && filledSubstitutes <= 5) {
            showSuccess("La configuration de l'équipe est valide!");
            elements.validerEquipeButton.disabled = false;
        } else {
            showError("Configuration de l'équipe invalide. Il doit y avoir exactement 11 joueurs, un par position, et au plus 5 remplaçants.");
            elements.validerEquipeButton.disabled = true;
        }
    });

    elements.validerEquipeButton.addEventListener('click', () => {
        elements.noteForm.submit();
    });
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const matchId = urlParams.get('id');

        if (!matchId) throw new Error('Match ID not found');

        await Promise.all([
            fetchMatchDetails(matchId),
            fetchNonInjuredPlayers()
        ]);

        const elements = {
            verifierEquipeButton: document.getElementById('verifierEquipe'),
            validerEquipeButton: document.getElementById('validerEquipe'),
            noteForm: document.querySelector('form[name="updateNote"]')
        };

        initEventListeners(elements, matchId);

    } catch (error) {
        console.error("Initialization error:", error);
        showError('Erreur d\'initialisation de la feuille de match');
    }
});