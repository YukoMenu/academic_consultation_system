document.addEventListener('DOMContentLoaded', () => {
    console.log('Faculty Dashboard Loaded');

    // Example: Dynamically insert name (replace with actual backend value)
    const facultyName = 'Dr. Santos'; // Normally fetched from login/session
    const welcomeHeading = document.querySelector('.faculty-dashboard h2');
    if (welcomeHeading) {
        welcomeHeading.textContent = `Welcome back, ${facultyName}!`;
    }
    // Optional: You can later fetch and render real appointment data
});