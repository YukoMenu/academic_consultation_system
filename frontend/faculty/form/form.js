// ----- START OF FORM.JS -----
console.log('Form is loaded');

function attachNameFieldAdder() {
  const container = document.getElementById("names-container");
  const addBtn = container.querySelector(".add-name-btn");
  const wrapper = container.querySelector(".names-wrapper");

  addBtn.addEventListener("click", () => {
    const newGroup = document.createElement("div");
    newGroup.classList.add("name-input-group");
    newGroup.innerHTML = `
      <input type="text" name="names" class="names-input" />
      <button type="button" class="remove-name-btn">−</button>
    `;
    wrapper.appendChild(newGroup); // inserts below existing ones

    newGroup.querySelector(".remove-name-btn").addEventListener("click", () => {
      newGroup.remove();
    });
  });
}

function attachFormListener() {
  const form = document.getElementById("consultation-form");
  console.log('Submit listener attached:', !!form);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    console.log('Submit button pressed.');
    e.preventDefault();

    const formData = new FormData(form);
    const names = formData.getAll("names"); // Get all student namess

    const data = Object.fromEntries(formData.entries()); // still useful for others

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
      names, // array of names
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
      const res = await fetch("/api/consultation", {
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

document.getElementById('back-to-appointment')?.addEventListener('click', () => {
  if (window.loadPage) {
    loadPage('appointment/appointment.html');
  } else {
    // fallback: full reload if SPA loader is missing
    window.location.href = '/faculty/appointment/appointment.html';
  }
});

attachFormListener();
attachNameFieldAdder();
//----- END OF FORM.JS -----