<?php
session_start();
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../css/navbar&footer.css">
    <link rel="shortcut icon" type="image/png" href="../assets/logo.png">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    <script src="../js/navbar.js" defer></script>
    <title></title>
</head>

<body>
<nav>
    <img src="../assets/logo.png" class="nav-logo" alt="Logo">
    <input class="menu-btn" type="checkbox" id="menu-btn">
    <label class="menu-icon" for="menu-btn">
        <span class="navicon"></span>
    </label>
    <ul id="ulnav">
        <li><a href="../views/dashboard.php" class="nav-link"><i class="fas fa-home nav-icon"></i> Acceuil</a></li>
        <li><a href="../views/Manage_Player.php" class="nav-link"><i class="fas fa-users nav-icon"></i> Gestion des Joueurs</a></li>
        <li><a href="../views/Manage_Match.php" class="nav-link"><i class="fas fa-futbol nav-icon"></i> Gestion des Matchs</a></li>
        <li><a href="../views/Statistiques.php" class="nav-link"><i class="fas fa-chart-bar nav-icon"></i> Statistiques</a></li>

        <?php if (isset($_SESSION['authenticated']) && $_SESSION['authenticated']) { ?>
            <li><a href="#" id="logout-link" class="nav-link"><i class="fas fa-sign-out-alt nav-icon"></i> Déconnexion</a></li>
        <?php } ?>
    </ul>
    <div class="profile-icon desktop_vue">
        <a href="#"><i class="fas fa-user-circle"></i></a>
    </div>
</nav>
</body>
</html>