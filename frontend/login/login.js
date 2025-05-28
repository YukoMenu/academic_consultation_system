// ----- START OF LOGIN.JS -----
// Theme switcher
const themeButton = document.getElementById('theme-button');

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

const loginForm = document.getElementById('loginForm');
const loginWarning = document.getElementById('loginWarning');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[type="text"]').value.trim();
    const password = loginForm.querySelector('input[type="password"]').value;

    resetWarning();

    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const body = await res.json(); // Only parse once

        if (res.status === 200 && body.user) {
            localStorage.setItem('user', JSON.stringify(body.user));
            window.location.href = '../student/index.html';
            redirectUser(body.user.role);
        } else {
            showWarning(body.error || 'Login failed');
        }
    } catch (err) {
        console.error('Login error:', err);
        showWarning('Login failed. Please try again.');
    }
});

function resetWarning() {
    loginWarning.textContent = '';
    loginWarning.style.display = 'none';
}

function showWarning(message) {
    loginWarning.textContent = message;
    loginWarning.style.display = 'block';
}

function redirectUser(role) {
    switch (role) {
        case 'student':
            window.location.href = '../student/index.html';
            break;
        case 'faculty':
            window.location.href = '../faculty/index.html';
            break;
        case 'admin':
            window.location.href = '../admin/index.html';
            break;
        default:
            showWarning('Unknown user role.');
    }
}

// Signup form handling
const signupForm = document.getElementById('signupForm');

const studentFields = document.getElementById('studentFields');
const facultyFields = document.getElementById('facultyFields');
const roleOptions = signupForm.querySelectorAll('input[name="role"]');

roleOptions.forEach((option) => {
    option.addEventListener('change', () => {
        if (option.checked) {
            if (option.value === 'student') {
                studentFields.style.display = 'block';
                facultyFields.style.display = 'none';
            } else if (option.value === 'faculty') {
                facultyFields.style.display = 'block';
                studentFields.style.display = 'none';
            }
        }
    });
});

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const role = signupForm.querySelector('input[name="role"]:checked').value;
    const fullName = signupForm.querySelector('input[type="text"]').value;
    const email = signupForm.querySelector('input[type="email"]').value;
    const password = signupForm.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = signupForm.querySelectorAll('input[type="password"]')[1].value;
    const program = document.getElementById('studentProgram')?.value || null;
    const yearLevel = parseInt(document.getElementById('studentYear')?.value) || null;
    const department = document.getElementById('facultyDepartment')?.value || null;
    const specialization = document.getElementById('facultySpecialization')?.value || null;

    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    console.log({
        name: fullName,
        email,
        password,
        role,
        program: role === 'student' ? 'BSCS' : null,
        year_level: role === 'student' ? 1 : null
    });

    fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name: fullName, 
            email, 
            password, 
            role,
            department: role === 'faculty' ? department : null,
            specialization: role === 'faculty' ? specialization : null,
            program: role === 'student' ? program : null,
            year_level: role === 'student' ? yearLevel : null
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log('Signup success:', data);
        // Redirect to login instead of dashboard
        window.location.href = 'login.html';
    })
    .catch(err => {
        console.error('Signup failed:', err);
        alert('Signup failed. Try again.');
    });
});
// ----- END OF LOGIN.JS -----