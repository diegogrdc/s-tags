// Add functionalities to DOM

document.addEventListener("DOMContentLoaded", function(event) {
    // Add button click
    const btn = document.getElementById("login")
    btn.addEventListener("click", () => login())
});

function login() {
    return axios.get('http://localhost:3000/login/')
        .then(res => {
            window.open(res.data);
            window.location.replace("http://localhost:63342/s-tags/playlists.html");
        })
}
