<?php
// Importation des contrôleurs
include __DIR__ . '/../../../controller/AuthenticationControler.php';

// Authentification
$authController = new AuthenticationControler();
$authController->Authentifie();
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../css/player.css">
    <script src="../js/player.js" defer></script>
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
    <div id="notification" class="notification">
        <i class="icon fas fa-futbol"></i>
        <span class="message-text"></span>
        <div class="progress-bar"></div>
    </div>
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
                <option value="Suspendu">Suspendu</option>
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
    <section class="player-list-section">
        <h2>Liste des Joueurs</h2>
        <div id="player-list" class="player-list">
            <div class="joueur-cards"></div>
        </div>
    </section>
    <img src="/view/src/img/data-player" alt="">
</main>
<div id="profilePopup" class="popup" style="display: none;">
    <div class="popup-content">
        <span class="close">&times;</span>
        <div id="popup-body"></div>
    </div>
</div>
<footer>
    <?php include '../components/footer.php'; ?>
</footer>
</body>
</html>