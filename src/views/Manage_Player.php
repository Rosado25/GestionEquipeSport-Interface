<?php
// Importation des contrôleurs
include __DIR__ . '/../../../controller/AuthenticationControler.php';
include __DIR__ . '/../../../controller/PlayersControler.php';

// Authentification
$authController = new AuthenticationControler();
$authController->Authentifie();

//Variable
$playerController = new PlayersControler();
$message = "";

//Verification
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['add-player'])) {
        $message = $playerController->AddPlayers();
    }
    if (isset($_POST['delete_joueur'])) {
        $message = $playerController->DeletePlayer();
    }
    if (isset($_POST['edit-player'])) {
        $message = $playerController->UpdatePlayer();
    }
}

// Récupération des données
$joueurs = $playerController->SearchPlayers();
$joueur = $playerController->getPlayerId();
?>
<style>
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
</style>

<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestion des Joueurs</title>
    <link rel="stylesheet" href="/view/src/css/player.css">
    <script src="/view/src/js/app.js" defer></script>

</head>

<body>
<header>
    <?php include 'navbar.php'; ?>
</header>

<div class="header">
    <h1>Gestion des Joueurs</h1>
    <form action="#" method="GET">
        <input type="text" id="search-bar" name="searchbar" placeholder="Rechercher un joueur...">
        <button type="submit">Rechercher</button>
    </form>
    <button type="button" id="btn-add-player">Ajouter un joueur</button>
</div>


<main class="main-container">
    <!-- Message de notification -->
    <div id="notification" class="notification">
        <i class="icon fas fa-futbol"></i>
        <span class="message-text"></span>
        <div class="progress-bar"></div>
    </div>
    <input type="hidden" id="php-message" value="<?= addslashes($message) ?>">
    <input type="hidden" id="php-message-type" value="<?= strpos($message, 'succès') !== false ? 'success' : 'error' ?>">

    <!-- Formulaire pour l'ajout d'un joueur  -->
    <section class="add-player-section">
        <h2>Ajouter un joueur</h2>
        <form id="add-player-form" method="POST" enctype="multipart/form-data">
            <input type="text" name="add-name" placeholder="Nom" required>
            <input type="text" name="add-nameFirst" placeholder="Prénom" required>
            <input type="text" name="add-license" placeholder="Numéro de Licence (6 chiffres)" pattern="^\d{6}$" maxlength="6" required>
            <input type="date" name="add-birthdate" placeholder="Date de Naissance" required>
            <input type="number" name="add-height" placeholder="Taille (cm)" required>
            <input type="number" name="add-weight" placeholder="Poids (kg)" required>
            <select name="add-statut" required>
                <option value="" disabled selected>Choisir le statut du joueur </option>
                <option value="Titulaire">Actif</option>
                <option value="Blessé">Blessé</option>
                <option value="Suspendu">Suspendu</option>*
                <option value="Absent">Absent</option>
            </select>
            <select name="add-role" required>
                <option value="" disabled selected>Choisir un poste</option>
                <option value="Attaquant">Attaquant</option>
                <option value="Milieu de terrain">Milieu de terrain</option>
                <option value="Défenseur">Défenseur</option>
                <option value="Gardien de but">Gardien de but</option>
                <option value="Ailier">Ailier</option>
                <option value="Arrière droit">Arrière droit</option>
                <option value="Arrière gauche">Arrière gauche</option>
                <option value="Milieu défensif">Milieu défensif</option>
                <option value="Milieu offensif">Milieu offensif</option>
            </select>
            <textarea name="add-comments" placeholder="Commentaires sur le joueur" rows="4" cols="50"></textarea>
            <input type="file" name="add-img" accept="image/*" required>
            <button type="submit" name="add-player">Ajouter</button>
        </form>
    </section>

    <!-- Liste des joueurs -->
    <section class="player-list-section">
        <h2>Liste des Joueurs</h2>
        <div id="player-list" class="player-list">
            <div class="joueur-cards">
                <?php if (empty($joueurs)): ?>
                    <p>Aucun joueur trouvé.</p>
                <?php else: ?>
                    <?php foreach ($joueurs as $joueur): ?>
                        <div class="joueur-card" data-id="<?= htmlspecialchars($joueur['Id_Joueur']); ?>">
                            <img src="<?= htmlspecialchars(isset($joueur['Image']) ? '/view/src/img/data-player/' . $joueur['Image'] : '/view/src/img/data-player/default.jpg') ?>" alt="Photo du joueur">
                            <p><?= htmlspecialchars(isset($joueur['Prenom']) ? $joueur['Prenom'] : '') . ' ' . htmlspecialchars(isset($joueur['Nom']) ? $joueur['Nom'] : ''); ?></p>
                            <p class="nblicense">Numéro de Licence: <?= htmlspecialchars($joueur['Numéro_license']); ?></p>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>
    </section>
    <img src="/view/src/img/data-player" alt="">
</main>

<!-- Popup Profile du joueur  -->

<div id="profilePopup" class="popup" style="display: none;">
    <div class="popup-content">
        <span class="close">&times;</span>
        <div id="popup-body">
        </div>
    </div>
</div>

<form class="edit-form" id="edit-form" method="POST" style="display: none;">
</form>
<form method="post" style="display: none;">
    <input type="hidden" name="delete_joueur" value="1">
    <input type="hidden" name="id-player" value="<?= htmlspecialchars($joueur['Id_Joueur']); ?>">

</form>
<footer>
    <?php include 'footer.php'; ?>
</footer>
</body>

</html>