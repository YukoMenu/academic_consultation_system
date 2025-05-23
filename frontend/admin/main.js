// ----- START OF MAIN.JS (ADMIN) -----
/*=============== SHOW SIDEBAR ===============*/
const showSidebar = (toggleId, sidebarId, headerId, mainId) =>{
   const toggle = document.getElementById(toggleId),
         sidebar = document.getElementById(sidebarId),
         header = document.getElementById(headerId),
         main = document.getElementById(mainId)

   if(toggle && sidebar && header && main){
       toggle.addEventListener('click', ()=>{
           /* Show sidebar */
           sidebar.classList.toggle('show-sidebar')
           /* Add padding header */
           header.classList.toggle('left-pd')
           /* Add padding main */
           main.classList.toggle('left-pd')
       })
   }
}
showSidebar('header-toggle','sidebar', 'header', 'main')

/*=============== LINK ACTIVE & PAGE LOADING ===============*/
const sidebarLinks = document.querySelectorAll('.sidebar__link')
const mainContent = document.getElementById('main')

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
       e.preventDefault()
 
       // Remove 'active-link' from all
       sidebarLinks.forEach(l => l.classList.remove('active-link'))
       link.classList.add('active-link')
 
       const page = link.getAttribute('data-page')
       if (page) {
          // Save last visited page to localStorage
          localStorage.setItem('last-page', page)
 
          fetch(page)
             .then(res => res.text())
             .then(html => {
                mainContent.innerHTML = html
 
                const pageBase = page.replace('.html', '')
                const cssHref = `${pageBase}.css`
                const jsSrc = `${pageBase}.js`
 
                // Remove previous dynamic style
                const existingStyle = document.getElementById('dynamic-style')
                if (existingStyle) existingStyle.remove()
 
                const css = document.createElement('link')
                css.rel = 'stylesheet'
                css.href = cssHref
                css.id = 'dynamic-style'
                document.head.appendChild(css)
 
                // Load JS
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

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'ri-moon-clear-fill' : 'ri-sun-fill'

// We validate if the user previously chose a topic
if (selectedTheme) {
  // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
  themeButton.classList[selectedIcon === 'ri-moon-clear-fill' ? 'add' : 'remove'](iconTheme)
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener('click', () => {
    // Add or remove the dark / icon theme
    document.body.classList.toggle(darkTheme)
    themeButton.classList.toggle(iconTheme)
    // We save the theme and the current icon that the user chose
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})

function fetchUserInfo() {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) return;

    const user = JSON.parse(storedUser)
    document.getElementById('user-name').textContent = user.name
    document.getElementById('user-email').textContent = user.email
}

window.addEventListener('DOMContentLoaded', () => {
    const lastPage = localStorage.getItem('last-page') || 'dashboard/dashboard.html'
    const defaultLink = document.querySelector(`[data-page="${lastPage}"]`)
    if (defaultLink) defaultLink.click()
        
    fetchUserInfo()
 })

/*=============== LOGOUT FUNCTIONALITY ===============*/
const logoutButton = document.querySelector('.sidebar__actions button:last-child')

logoutButton.addEventListener('click', () => {
    // Clear all stored data
    localStorage.clear()
    
    // Redirect to login page
    window.location.href = '../login page/login.html'
})
// ----- END OF MAIN.JS (ADMIN) -----