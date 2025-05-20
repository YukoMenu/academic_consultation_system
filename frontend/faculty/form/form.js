// ----- START OF FORM.JS -----
console.log('Form is loaded');

function attachFormListener() {
  const form = document.getElementById("consultation-form");
  console.log('Submit listener attached:', !!form);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    console.log('Submit button pressed.');
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Handle checkboxes (get all checked nature_of_concerns)
    const concerns = [];
    document.querySelectorAll('input[name="nature_of_concerns"]:checked').forEach(cb => {
      if (cb.value === "Others") {
        const otherText = formData.get("others_text");
        if (otherText) concerns.push(`Others: ${otherText}`);
      } else {
        concerns.push(cb.value);
      }
    });

    // Final payload
    const payload = {
      names: data.names,
      date: data.date,
      start_time: data.start_time,
      end_time: data.end_time,
      program: data.program,
      course_code: data.course_code,
      venue: data.venue,
      term: data.term,
      course_concerns: data.course_concerns,
      intervention: data.intervention,
      nature_of_concerns: concerns.join(", ")
    };

    try {
      const res = await fetch("http://localhost:3000/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to submit consultation");
      //form.reset();
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    }
  });
}

// Attach listener immediately when script runs (since form is dynamically loaded)
attachFormListener();

//----- END OF FORM.JS -----