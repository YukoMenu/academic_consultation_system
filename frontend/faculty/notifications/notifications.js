(() => {
    console.log("Notification settings loaded!");

    document.getElementById('notificationsForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const appointmentUpdates = document.getElementById('appointmentUpdates').checked;
        const feedbackResponses = document.getElementById('feedbackResponses').checked;
        const facultyMessages = document.getElementById('facultyMessages').checked;
        const emailFrequency = document.getElementById('emailFrequency').value;

        console.log("Notification Settings Saved:");
        console.log("Appointment Updates:", appointmentUpdates ? "Enabled" : "Disabled");
        console.log("Feedback Responses:", feedbackResponses ? "Enabled" : "Disabled");
        console.log("Faculty Messages:", facultyMessages ? "Enabled" : "Disabled");
        console.log("Email Frequency:", emailFrequency);

        // Replace with actual logic to save notification preferences
        alert("Your notification settings have been saved (but not persisted in this demo).");
    });

})();
