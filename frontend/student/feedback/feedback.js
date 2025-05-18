(() => {
    console.log("Feedback page loaded!")

    document.getElementById('feedbackForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const faculty = document.getElementById('faculty').value;
        const rating = document.getElementById('rating').value;
        const comments = document.getElementById('comments').value;

        console.log("Feedback Submitted:");
        console.log("Faculty:", faculty);
        console.log("Rating:", rating);
        console.log("Comments:", comments);

        // You can replace the below with actual logic to persist feedback
        alert("Feedback has been submitted (but not persisted in this demo).");
    });

})();
