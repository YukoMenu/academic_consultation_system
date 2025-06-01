// ----- START OF FORM.JS -----
console.log('Form is loaded');

window.studentList = window.studentList || [];
window.courses = window.courses || [];
window.facultyAvailability = window.facultyAvailability || [];

async function fetchStudentList() {
  try {
    const res = await fetch('/api/users/students');
    if (!res.ok) throw new Error('Failed to fetch students');
    window.studentList = await res.json();
  } catch (err) {
    console.error('Error fetching students:', err);
    window.studentList = [];
  }
}

async function fetchCourses() {
  try {
    const res = await fetch('/data/courses.json');
    if (!res.ok) throw new Error('Failed to fetch courses');
    window.courses = await res.json();
  } catch (err) {
    console.error('Error fetching courses:', err);
    window.courses = [];
  }
}

function ensureStudentDatalist() {
  let datalist = document.getElementById('student-names-datalist');
  if (!datalist) {
    datalist = document.createElement('datalist');
    datalist.id = 'student-names-datalist';
    document.body.appendChild(datalist);
  }
  datalist.innerHTML = window.studentList.map(s => `<option value="${s.name}"></option>`).join('');
}

function populateCourseFields() {
  // Only show courses the faculty is available for
  const availableCourseCodes = new Set(window.facultyAvailability.map(a => a.course));
  const datalist = document.getElementById('courses-datalist');
  if (datalist) {
    datalist.innerHTML = window.courses
      .filter(c => availableCourseCodes.has(c.id))
      .map(c => `<option value="${c.id} - ${c.name}"></option>`).join('');
  }
}

async function fetchFacultyAvailability() {
  // You may need to get the faculty ID from a global variable or session
  const facultyId = window.currentFacultyId || window.user?.id;
  if (!facultyId) return;
  try {
    const res = await fetch(`/api/faculty-availability/${facultyId}`);
    if (!res.ok) throw new Error('Failed to fetch faculty availability');
    window.facultyAvailability = await res.json();
  } catch (err) {
    console.error('Error fetching faculty availability:', err);
    window.facultyAvailability = [];
  }
}

function autofillTimesForCourse(courseCode) {
  if (!courseCode) return;
  // Accept both 'CODE' and 'CODE - Name' formats
  const code = courseCode.split(' - ')[0].trim();
  const match = window.facultyAvailability.find(a => a.course === code);
  if (match) {
    document.getElementById('start_time').value = match.start_time || '';
    document.getElementById('end_time').value = match.end_time || '';
  }
}

function attachCourseFieldListeners() {
  const input = document.getElementById('course_code_input');
  if (input) {
    input.addEventListener('change', (e) => {
      autofillTimesForCourse(e.target.value);
    });
  }
}

function attachNameFieldAdder() {
  const container = document.getElementById("names-container");
  const addBtn = container.querySelector(".add-name-btn");
  const wrapper = container.querySelector(".names-wrapper");

  addBtn.addEventListener("click", () => {
    const newGroup = document.createElement("div");
    newGroup.classList.add("name-input-group");
    newGroup.innerHTML = `
      <input type="text" name="names" class="names-input" list="student-names-datalist" />
      <button type="button" class="remove-name-btn">−</button>
    `;
    wrapper.appendChild(newGroup); // inserts below existing ones

    newGroup.querySelector(".remove-name-btn").addEventListener("click", () => {
      newGroup.remove();
    });
  });
  // Setup datalist for existing inputs
  wrapper.querySelectorAll('.names-input').forEach(input => {
    input.setAttribute('list', 'student-names-datalist');
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
      // Redirect to appointment page after successful submit
      if (window.loadPage) {
        loadPage('appointment/appointment.html');
      } else {
        window.location.href = '/faculty/appointment/appointment.html';
      }
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

window.initConsultationForm = async function() {
  await fetchStudentList();
  ensureStudentDatalist();
  await fetchCourses();
  await fetchFacultyAvailability();
  populateCourseFields();
  attachCourseFieldListeners();
  attachFormListener();
  attachNameFieldAdder();
}
//----- END OF FORM.JS -----