
console.log("coucou")
document.addEventListener('DOMContentLoaded', () => {
    const rightSection = document.querySelector('.login-right');
    const leftSection = document.querySelector('.login-left');
    if (rightSection && leftSection) {
        window.addEventListener("load", () => {
            rightSection.classList.add('RightSlide');
            leftSection.classList.add('LeftSlide');
        });
    }
    /**
     * Fonction permettant d'afficher le mot de passe ou le cacher avec l'icon
     */
    function togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const Icon = document.querySelector('.hidden-password i');

        if (Icon && passwordInput) {
            Icon.addEventListener('click', () => {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                Icon.classList.toggle('fa-eye', isPassword);
                Icon.classList.toggle('fa-eye-slash', !isPassword);
            });
        }
    }

    /**
     * Fonction permettant de mettre en place un message du succès /Erreur
     * @param isSuccess
     * @param message
     */
    function displayMessage(isSuccess, message) {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = message;
        messageDiv.style.color = isSuccess ? 'green' : 'red';
    }
    console.log("coucou")
    async function ManageLoginForm(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost/R4.01/gestionequipesport-auth-api/src/routes/auth.php/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            console.log(response)
            const data = await response.json();
            displayMessage(response.status === 200, data.message || 'Erreurs lors de votre connexion');
            if (response.status === 200 && data.data.status === 200) {
                console.log("connexion réussie");
                window.location.href = 'http://localhost/R4.01/gestionequipesport-interface/src/views/dashboard.php';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    document.getElementById('loginForm').addEventListener('submit', ManageLoginForm);
    togglePasswordVisibility();
});