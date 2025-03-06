<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page de connexion</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="../css/login.css">
    <script src="../js/login.js" defer></script>
</head>

<body>
<div class="login-container">
    <div class="login-left">
    </div>
    <div class="login-right">
        <div class="container">
            <h1>Welcome Back Coach!</h1>
            <p>Connectez-vous pour accéder à votre compte</p>
            <img src="../assets/logo.png" alt="">
            <form class="login-form" id="loginForm">
                <div class="input-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="Entrez votre email" required>
                </div>
                <div class="input-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Entrez votre mot de passe" required>
                    <div class="hidden-password">
                        <i class="fa fa-eye"></i>
                    </div>
                </div>
                <button type="submit" class="btn-login">
                    Se connecter <i class="fa-solid fa-arrow-right"></i>
                </button>
                <p class="signup-link">Pas encore de compte ? <a href="#">Inscrivez-vous</a></p>
                <div class="message" id="message"></div>
            </form>
        </div>
    </div>
</div>
</body>
<footer>
    <?php include '../components/footer.php'; ?>
</footer>
</html>