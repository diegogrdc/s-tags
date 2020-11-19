// Add functionalities to DOM

document.addEventListener("DOMContentLoaded", function(event) {
    // Add button click
    const btn = document.getElementById("login")
    btn.addEventListener("click", () => login())
});

function login() {
    return axios.get('/login/')
        .then(res => {
            console.log(res.data)
            window.open(res.data);
            window.location.href = "/playlists.html";
        })
}
