console.log("Student Dashboard loaded!")
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user && user.name) {
        const heading = document.getElementById('dashboard-heading')
        if (heading) {
            heading.textContent = `Welcome, ${user.name}!`
        }
    }
})
