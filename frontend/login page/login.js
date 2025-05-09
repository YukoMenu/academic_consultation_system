// Theme switcher
const themeButton = document.createElement('button');
themeButton.className = 'theme-button';
themeButton.innerHTML = '<i class="ri-moon-clear-fill"></i>';
document.body.appendChild(themeButton);

// Theme switch
themeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    
    // Save theme preference
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('dark-theme', isDark);
});

// Check for saved theme preference
const savedTheme = localStorage.getItem('dark-theme');
if (savedTheme === 'true') {
    document.body.classList.add('dark-theme');
}

// Form switching
const loginContent = document.querySelector('.login__content');
const signupContent = document.querySelector('.signup__content');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');

showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginContent.style.display = 'none';
    signupContent.style.display = 'block';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupContent.style.display = 'none';
    loginContent.style.display = 'block';
});

// Login form handling
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = loginForm.querySelector('input[type="text"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;
    
    // Here you would typically make an API call to your backend
    console.log('Login attempt:', { username, password });
    
    // For demo purposes, redirect to student dashboard
    window.location.href = '../student/index.html';
});

// Signup form handling
const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const role = signupForm.querySelector('input[name="role"]:checked').value;
    const fullName = signupForm.querySelector('input[type="text"]').value;
    const email = signupForm.querySelector('input[type="email"]').value;
    const password = signupForm.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = signupForm.querySelectorAll('input[type="password"]')[1].value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Here you would typically make an API call to your backend
    console.log('Signup attempt:', { role, fullName, email, password });
    
    // For demo purposes, redirect based on role
    if (role === 'student') {
        window.location.href = '../student/index.html';
    } else {
        window.location.href = '../teacher/index.html';
    }
});
