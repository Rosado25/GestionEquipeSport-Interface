class Login {
    /**
     * Contructeur de la classe Login
     */
    constructor() {
        this.initElements();
        this.initEventListeners();
    }

    /**
     * Initialise les éléments du DOM
     */
    initElements() {
        this.elements = {
            form: document.getElementById('loginForm'),
            email: document.getElementById('email'),
            password: document.getElementById('password'),
            toggleBtn: document.querySelector('.toggle-password')
        };
    }

    /**
     * Initialise les écouteurs d'événements
     */
    initEventListeners() {
        if (this.elements.form) {
            this.elements.form.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (this.elements.toggleBtn) {
            this.elements.toggleBtn.addEventListener('click', () => this.togglePasswordVisibility());
        }
    }

    /**
     * Change la visibilité du mot de passe
     */
    togglePasswordVisibility() {
        const passwordInput = this.elements.password;
        const icon = this.elements.toggleBtn.querySelector('i');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }

    /**
     * Gère la soumission du formulaire de connexion
     * @param e
     * @returns {Promise<void>}
     */
    async handleLogin(e) {
        e.preventDefault();

        try {
            const response = await fetch('/R4.01/gestionequipesport-auth-api/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: this.elements.email.value,
                    password: this.elements.password.value
                })
            });

            const data = await response.json();

            if (response.status === 200) {
                localStorage.setItem('token', data.response.data.token);
                console.log('Token:', data.response.data.token);

                Swal.fire({
                    icon: 'success',
                    title: 'Connexion réussie',
                    text: 'Redirection...',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#1e1e2f',
                    color: '#ffffff'
                }).then(() => {
                    window.location.href = '/R4.01/gestionequipesport-interface/src/views/dashboard.php';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: data.status_message || 'Identifiants incorrects',
                    background: '#1e1e2f',
                    color: '#ffffff',
                    confirmButtonColor: '#2ec4b6'
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Erreur de connexion au serveur',
                background: '#1e1e2f',
                color: '#ffffff',
                confirmButtonColor: '#2ec4b6'
            });
        }
    }
}

/**
 * Initialise le script lorsque le DOM est complètement chargé
 */
document.addEventListener('DOMContentLoaded', () => {
    new Login();
});