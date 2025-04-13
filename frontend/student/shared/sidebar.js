function loadSideBar() {
    fetch('../shared/sidebar.html')

    .then(function (response) {
        return response.text()
    })

    .then(function(html) {
        document.getElementById('sidebar').innerHTML = html
    })
}