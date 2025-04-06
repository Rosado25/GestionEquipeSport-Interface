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

        const formData = {
            email: this.elements.email.value,
            password: this.elements.password.value
        };

        try {
            const response = await fetch("https://authentificationapi.alwaysdata.net/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            // Vérifie si la réponse est correcte
            const text = await response.text(); // Récupère la réponse sous forme de texte brut
            console.log('Réponse brute du serveur:', text); // Affiche la réponse brute dans la console

            if (!response.ok) {
                throw new Error('Échec de la connexion');
            }

            // Si la réponse est au format JSON, parse la
            const data = JSON.parse(text);  // Utilise JSON.parse si la réponse n'est pas déjà en JSON

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
                    window.location.href = '/src/views/dashboard.php';
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