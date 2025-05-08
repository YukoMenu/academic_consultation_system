(() => {
    console.log("Profile page loaded!");

    document.getElementById('profileForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('displayName').value;
        const email = document.getElementById('email').value;
        const notifications = document.getElementById('notifications').value;

        console.log("Profile Saved:");
        console.log("Name:", name);
        console.log("Email:", email);
        console.log("Notifications:", notifications);

        alert("Profile settings have been saved (but not persisted in this demo).");
    });

})();
