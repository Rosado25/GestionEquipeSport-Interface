document.addEventListener('DOMContentLoaded', () => {
    const btnAddPlayer = document.getElementById('btn-add-player');
    const form = document.querySelector('.add-player-section');
    const popup = document.querySelector('.popup');
    const popupBody = document.querySelector('#popup-body');
    const closePopup = document.querySelector('.close');
    const cards = document.querySelectorAll('.joueur-card');

    // Event pour afficher/masquer le formulaire d'ajout de joueur
    if (btnAddPlayer && form) {
        btnAddPlayer.addEventListener('click', () => {
            const isHidden = form.style.display === 'none';
            form.style.display = isHidden ? 'block' : 'none';
        });
    }


     /**
     * Fonction permettant d'ouvrir le popup du joueur
     * @param playerId
     */
    function openPopup(playerId) {
        fetch(`Player_Profile.php?id=${playerId}`)
            .then(response => response.text())
            .then(data => {
                popupBody.innerHTML = data;
                popup.style.display = 'block';

                const btnModifie = popupBody.querySelector('.btnmodifie');
                const editForm = popupBody.querySelector('#edit-form');
                if (btnModifie && editForm) {
                    btnModifie.addEventListener('click', () => {
                        editForm.style.display = editForm.style.display === 'block' ? 'none' : 'block';
                    });
                }
            })
            .catch(err => console.error('Erreur lors du chargement du profil du joueur :', err));
    }

    cards.forEach(card => {
        card.addEventListener('click', () => openPopup(card.dataset.id));
    });

    if (closePopup) {
        closePopup.addEventListener('click', () => {
            popup.style.display = 'none';
        });
    }

    /**
     * Fonction permettant d'ajouter un joueur via L'API
     * @param playerData
     * @returns {Promise<void>}
     */
    async function addPlayer(playerData) {
        try {
            const response = await fetch('http://localhost/R4.01/gestionequipesport-api/src/routes/player.php/api/player', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(playerData)
            });
            const data = await response.json();
            console.log('Player added:', data);
        } catch (error) {
            console.error('Error adding player:', error);
        }
    }

    /**
     * Fonction permettant de supprimer un joueur via L'API
     * @param playerId
     * @returns {Promise<void>}
     */
    async function deletePlayer(playerId) {
        try {
            const response = await fetch(`http://localhost/R4.01/gestionequipesport-api/src/routes/player.php/api/player?id=${playerId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            console.log('Player deleted:', data);
        } catch (error) {
            console.error('Error deleting player:', error);
        }
    }

    // Fonction pour mettre à jour un joueur via l'API
    async function updatePlayer(playerId, playerData) {
        try {
            const response = await fetch(`http://localhost/R4.01/gestionequipesport-api/src/routes/player.php/api/player?id=${playerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(playerData)
            });
            const data = await response.json();
            console.log('Player updated:', data);
        } catch (error) {
            console.error('Error updating player:', error);
        }
    }

    // Fonction pour faire en sorte que si le token de la personne n'est pas valide alors elle ne peut pas acceder a cette page :
    async function Validatetoken(){
        try {
            const response = await fetch('http://localhost//R4.01/gestionequipesport-auth-api/src/routes/auth.php/api/validate-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: localStorage.getItem('token') })
            });
            const data = await response.json();
            if(!data.valid){
                window.location.href = 'login.php';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});
