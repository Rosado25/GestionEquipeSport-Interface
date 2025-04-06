document.addEventListener("DOMContentLoaded", () => {
    // Gestion du menu burger
    const nav = document.getElementById('ulnav');
    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('show');
        });
    }

    /**
     * Fonction pour gérer la déconnexion
     * @type {HTMLElement}
     */
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.addEventListener("click", async (event) => {
            event.preventDefault();

            try {
                const response = await fetch("https://authentificationapi.alwaysdata.net/api/logout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.status === 200) {
                    // Suppression du token
                    localStorage.removeItem('token');

                    // Redirection vers la page de connexion
                    window.location.href = '/R4.01/gestionequipesport-interface/src/views/login.php';
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: 'Erreur lors de la déconnexion',
                        background: '#1e1e2f',
                        color: '#ffffff',
                        confirmButtonColor: '#2ec4b6'
                    });
                }
            } catch (error) {
                console.error("Erreur lors de la déconnexion:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Erreur de connexion au serveur',
                    background: '#1e1e2f',
                    color: '#ffffff',
                    confirmButtonColor: '#2ec4b6'
                });
            }
        });
    }
});