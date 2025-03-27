document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById('ulnav');
    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('show');
        });
    }
    const logoutLink = document.getElementById("logout-link");
    console.log("destruction")
    if (logoutLink) {
        logoutLink.addEventListener("click", async (event) => {
            event.preventDefault();

            try {
                const response = await fetch("/R4.01/gestionequipesport-auth-api/src/routes/auth.php/api/logout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log(response.status)
                const responseData = await response.json();
                if (responseData.status === 200) {
                    window.location.href = "http://localhost/R4.01/gestionequipesport-interface/src/views/login.php";
                } else {
                    console.error("Logout impossbile:", responseData.message);
                }
            } catch (error) {
                console.error("Erreur:", error);
            }
        });
    }
});