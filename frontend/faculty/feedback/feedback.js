document.addEventListener('DOMContentLoaded', () => {
  const feedbackList = document.querySelector('.feedback-list');

  // Mock feedback data - replace with your backend API call
  const feedbacks = [
    {
      facultyId: "faculty1",
      facultyName: "Dr. John Doe",
      rating: 5,
      comments: "Very helpful and clear explanations.",
    },
    {
      facultyId: "faculty1",
      facultyName: "Dr. John Doe",
      rating: 4,
      comments: "Great session, but could be more detailed.",
    },
    {
      facultyId: "faculty2",
      facultyName: "Prof. Jane Smith",
      rating: 3,
      comments: "Average, needed more interaction.",
    }
  ];

  // Filter feedback for this faculty, for example Dr. John Doe (faculty1)
  // You can adjust this to get the current faculty dynamically
  const currentFacultyId = "faculty1";

  const filteredFeedback = feedbacks.filter(fb => fb.facultyId === currentFacultyId);

  function createFeedbackItem(fb) {
    const li = document.createElement('li');
    li.className = 'feedback-item';

    li.innerHTML = `
      <div class="feedback-faculty">${fb.facultyName}</div>
      <div class="feedback-rating">Rating: ${fb.rating} / 5</div>
      <div class="feedback-comments">"${fb.comments}"</div>
    `;

    return li;
  }

  if (filteredFeedback.length === 0) {
    feedbackList.innerHTML = '<li>No feedback received yet.</li>';
  } else {
    filteredFeedback.forEach(fb => {
      feedbackList.appendChild(createFeedbackItem(fb));
    });
  }
});
