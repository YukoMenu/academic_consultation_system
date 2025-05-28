/*=============== SHOW SIDEBAR ===============*/
const showSidebar = (toggleId, sidebarId, headerId, mainId) => {
    const toggle = document.getElementById(toggleId),
          sidebar = document.getElementById(sidebarId),
          header = document.getElementById(headerId),
          main = document.getElementById(mainId)

    if (toggle && sidebar && header && main) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('show-sidebar')
            header.classList.toggle('left-pd')
            main.classList.toggle('left-pd')
        })
    }
}
showSidebar('header-toggle', 'sidebar', 'header', 'main')

/*=============== LINK ACTIVE & PAGE LOADING ===============*/
const sidebarLinks = document.querySelectorAll('.sidebar__link')
const mainContent = document.getElementById('main')

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault()

        sidebarLinks.forEach(l => l.classList.remove('active-link'))
        link.classList.add('active-link')

        const page = link.getAttribute('data-page')
        if (page) {
            localStorage.setItem('last-page', page)

            fetch(page)
                .then(res => res.text())
                .then(html => {
                    mainContent.innerHTML = html

                    // 👉 Update dashboard heading dynamically if applicable
                    if (page === 'dashboard/dashboard.html') {
                        const storedUser = localStorage.getItem('user')
                        if (storedUser) {
                            const user = JSON.parse(storedUser)
                            const heading = mainContent.querySelector('#dashboard-heading')
                            if (heading) {
                                heading.textContent = `Welcome, ${user.name}`
                            }
                        }
                    }

                    const pageBase = page.replace('.html', '')
                    const cssHref = `${pageBase}.css`
                    const jsSrc = `${pageBase}.js`

                    const existingStyle = document.getElementById('dynamic-style')
                    if (existingStyle) existingStyle.remove()

                    const css = document.createElement('link')
                    css.rel = 'stylesheet'
                    css.href = cssHref
                    css.id = 'dynamic-style'
                    document.head.appendChild(css)

                    const script = document.createElement('script')
                    script.src = jsSrc
                    script.defer = true
                    document.body.appendChild(script)
                })
                .catch(err => {
                    mainContent.innerHTML = `<p>Error loading page: ${err}</p>`
                })
        }
    })
})

/*=============== DARK LIGHT THEME ===============*/
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'ri-sun-fill'

const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')

const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'ri-moon-clear-fill' : 'ri-sun-fill'

if (selectedTheme) {
    document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
    themeButton.classList[selectedIcon === 'ri-moon-clear-fill' ? 'add' : 'remove'](iconTheme)
}

themeButton.addEventListener('click', () => {
    document.body.classList.toggle(darkTheme)
    themeButton.classList.toggle(iconTheme)
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})

/*=============== LOAD USER INFO ===============*/
function fetchUserInfo() {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) return;

    const user = JSON.parse(storedUser)
    document.getElementById('user-name').textContent = user.name
    document.getElementById('user-email').textContent = user.email
}

/*=============== INITIAL LOAD ===============*/
window.addEventListener('DOMContentLoaded', () => {
    const lastPage = localStorage.getItem('last-page') || 'dashboard/dashboard.html'
    const defaultLink = document.querySelector(`[data-page="${lastPage}"]`)
    if (defaultLink) defaultLink.click()

    fetchUserInfo()
})

/*=============== LOGOUT FUNCTIONALITY ===============*/
const logoutButton = document.querySelector('.sidebar__actions button:last-child')

logoutButton.addEventListener('click', () => {
    localStorage.clear()
    window.location.href = '../login/login.html'
})
