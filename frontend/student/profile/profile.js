// ----- START OF PROFILE.JS -----
(() => {
    console.log("Profile page loaded!");

    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    if (!userId) {
        alert("No user ID found.");
        return;
    }

    document.getElementById('displayName').value = user.name || '';
    document.getElementById('email').value = user.email || '';

    document.getElementById('profileForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('displayName').value;
        const email = document.getElementById('email').value;
        const notifications = document.getElementById('notifications').value;
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const passwordWarning = document.getElementById('passwordWarning');

        // Reset warning
        passwordWarning.style.display = "none";

        try {
            // If changing password, verify old password first
            if (oldPassword && newPassword) {
                const verifyRes = await fetch(`/api/getuser/verify-password/${userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ oldPassword })
                });

                if (!verifyRes.ok) {
                    passwordWarning.style.display = "block";
                    return;
                }
            }

            // Proceed to save profile changes
            const updateRes = await fetch(`/api/getuser/update/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });

            if (!updateRes.ok) throw new Error("Failed to update profile");

            localStorage.setItem('user', JSON.stringify({ ...user, name, email }));
            alert("Profile settings have been saved.");

            // Then update password if provided
            if (oldPassword && newPassword) {
                const passRes = await fetch(`/api/getuser/changepassword/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newPassword })
                });

                if (!passRes.ok) throw new Error("Password update failed");
                alert("Password changed successfully.");
            }

        } catch (err) {
            console.error("Error:", err);
            alert("An error occurred while saving changes.");
        }
    });
})();
// ----- END OF PROFILE.JS -----