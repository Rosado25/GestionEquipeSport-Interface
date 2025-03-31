<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feuille de Match</title>
    <link rel="stylesheet" href="../css/sheet.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="../js/sheet.js" defer></script>
</head>
<body>

<header>
    <?php include '../components/navbar.php'; ?>
</header>

<div id="notification" class="notification">
    <i class="icon fas fa-futbol"></i>
    <span class="message-text"></span>
    <div class="progress-bar"></div>
</div>

<main>
    <section class="details-match">

        <h2>Détails du Match</h2>
        <div class="details-container">
            <p><strong>Date et Heure:</strong> <span class="match-date"></span></p>
            <p><strong>Adversaire:</strong> <span class="match-opponent"></span></p>
            <p><strong>Lieu:</strong> <span class="match-location"></span></p>
            <p><strong>Score:</strong> <span class="match-score"></span></p>
        </div>
    </section>

    <section class="gestion-match">
        <h2>Gestion de l'Équipe</h2>
        <div class="equipe-gestion">
            <div class="choix-joueurs">
                <h3>Joueurs Disponibles</h3>
                <ul id="playerdispo" class="liste-joueurs">
                    <!-- Rempli dynamiquement par JavaScript -->
                </ul>
            </div>

            <div class="compo-container">
                <div class="positions Poste-compo">
                    <div class="position" id="GL">GL</div>
                    <div class="position" id="DG">DG</div>
                    <div class="position" id="DC">DC</div>
                    <div class="position" id="DC2">DC</div>
                    <div class="position" id="DD">DD</div>
                    <div class="position" id="MG">MG</div>
                    <div class="position" id="MC">MC</div>
                    <div class="position" id="MD">MD</div>
                    <div class="position" id="AG">AG</div>
                    <div class="position" id="BU">BU</div>
                    <div class="position" id="AD">AD</div>
                </div>
            </div>

            <div class="remplacants">
                <h3>Remplaçants</h3>
                <div class="subs scroll">
                    <div class="remplacant sub" id="R1">R1</div>
                    <div class="remplacant sub" id="R2">R2</div>
                    <div class="remplacant sub" id="R3">R3</div>
                    <div class="remplacant sub" id="R4">R4</div>
                    <div class="remplacant sub" id="R5">R5</div>
                </div>
            </div>
        </div>
    </section>

    <section class="configuration-equipe">
        <h2>Configuration de l'Équipe</h2>
        <table id="tablelist">
            <thead>
            <tr>
                <th>Nom du Joueur</th>
                <th>Position</th>
                <th>Note</th>
            </tr>
            </thead>
            <tbody>
            <td>xx</td>
            <!-- Rempli dynamiquement par JavaScript -->
            </tbody>
        </table>

        <button id="verifierEquipe">Vérifier l'Équipe</button>
        <button id="validerEquipe" disabled>Valider l'Équipe</button>
        <input type="hidden" name="idMatch" value="">
    </section>
</main>
</body>
</html>