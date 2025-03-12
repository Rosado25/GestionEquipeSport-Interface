<?php
require_once __DIR__ . '/../../../controller/AuthenticationControler.php';

$authController = new AuthenticationControler();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['logout']) && !empty($_POST['logout'])) {
    $authController->logout();
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/view/src/css/navbar&footer.css">
    <link rel="shortcut icon" type="image/png" href="/view/src/img/logo.png">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    <script src="/view/src/js/app.js" defer></script>
</head>

<body>
<nav>
    <img src="../../../../gestionequipesport-interface/src/assets/logo.png" class="nav-logo" alt="Logo">
    <input class="menu-btn" type="checkbox" id="menu-btn">
    <label class="menu-icon" for="menu-btn">
        <span class="navicon"></span>
    </label>
    <ul id="ulnav">
        <li><a href="/view/src/php/Dashboard.php" class="nav-link"><i class="fas fa-home nav-icon"></i> Acceuil</a></li>
        <li><a href="/view/src/php/Manage_Player.php" class="nav-link"><i class="fas fa-users nav-icon"></i> Gestion des Joueurs</a></li>
        <li><a href="/view/src/php/Manage_Match.php" class="nav-link"><i class="fas fa-futbol nav-icon"></i> Gestion des Matchs</a></li>
        <li><a href="/view/src/php/Statistiques.php" class="nav-link"><i class="fas fa-chart-bar nav-icon"></i> Statistiques</a></li>

        <?php if (isset($_SESSION['authenticated']) && $_SESSION['authenticated']) { ?>
            <form method="POST">
                <input type="hidden" name="logout" id="logout">
                <li><a href="/view/src/php/login.php" class="nav-link"><i class="fas fa-sign-out-alt nav-icon"></i> Déconnexion</a></li>
                <button type="submit" class="nav-link , dec"></button>
            </form>

        <?php } ?>
    </ul>
    <div class="profile-icon desktop_vue">
        <a href="#profile"><i class="fas fa-user-circle"></i></a>
    </div>
</nav>
</body>
</html>