document.addEventListener('DOMContentLoaded', () => {
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

    async function ManageLoginForm(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log('Sending data:', { email, password });

        try {
            const response = await fetch('http://localhost/R4.01/gestionequipesport-auth-api/src/routes/auth.php/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('Response data:', data);

            displayMessage(response.ok, data.message || 'Erreurs lors de votre connexion');
        } catch (error) {
            console.error('Error:', error);
        }
    }


    document.getElementById('loginForm').addEventListener('submit', ManageLoginForm);
    togglePasswordVisibility();
});