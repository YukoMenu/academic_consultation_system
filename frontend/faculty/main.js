// ----- START OF MAIN.JS (FACULTY) -----
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
 
                // Remove previously injected script (if any)
                const existingScript = document.getElementById('dynamic-script')
                if (existingScript) existingScript.remove()

                // Load JS
                const script = document.createElement('script')
                script.src = jsSrc
                script.defer = true
                script.id = 'dynamic-script'
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

// Use a single key for theme across all pages
const storedTheme = localStorage.getItem('theme') || 'light'

// Apply theme on load
if (storedTheme === 'dark') {
    document.body.classList.add(darkTheme)
    themeButton.classList.add(iconTheme)
} else {
    document.body.classList.remove(darkTheme)
    themeButton.classList.remove(iconTheme)
}

// Theme toggle
themeButton.addEventListener('click', () => {
    const isDark = document.body.classList.toggle(darkTheme)
    themeButton.classList.toggle(iconTheme)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
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
    
    // Redirect to login
    window.location.href = '/login'
})
function loadPage(page) {
    const mainContent = document.getElementById('main');
    fetch(page)
        .then(res => res.text())
        .then(html => {
            mainContent.innerHTML = html;

            const pageBase = page.replace('.html', '');
            const cssHref = `${pageBase}.css`;
            const jsSrc = `${pageBase}.js`;

            // Remove previous dynamic style
            const existingStyle = document.getElementById('dynamic-style');
            if (existingStyle) existingStyle.remove();

            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = cssHref;
            css.id = 'dynamic-style';
            document.head.appendChild(css);

            // Remove previously injected script (if any)
            const existingScript = document.getElementById('dynamic-script');
            if (existingScript) existingScript.remove();

            // Load JS
            const script = document.createElement('script');
            script.src = jsSrc;
            script.defer = true;
            script.id = 'dynamic-script';
            document.body.appendChild(script);
        })
        .catch(err => {
            mainContent.innerHTML = `<p>Error loading page: ${err}</p>`;
        });
}
// ----- END OF MAIN.JS (FACULTY) -----