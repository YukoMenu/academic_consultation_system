console.log("Dashboard loaded!")

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user && user.role === 'student') {
        const welcomeHeader = document.getElementById('dashboard-heading')
        if (welcomeHeader) {
            welcomeHeader.textContent = `Welcome, ${user.name}!`
        }
    }
})
