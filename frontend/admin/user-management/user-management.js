// ----- START OF USER-MANAGEMENT.JS -----
const userList = document.getElementById('userList');
const roleFilter = document.getElementById('roleFilter');

const form = document.getElementById('userForm');
const userIdField = document.getElementById('userId');
const nameField = document.getElementById('name');
const emailField = document.getElementById('email');
const roleField = document.getElementById('role');

const programField = document.getElementById('program');
const yearLevelField = document.getElementById('year_level');
const departmentField = document.getElementById('department');
const specializationField = document.getElementById('specialization');

const studentFields = document.getElementById('studentFields');
const facultyFields = document.getElementById('facultyFields');

let users = [];

// Fetch all users from backend
async function fetchUsers() {
    try {
        const res = await fetch('/api/users');
        const data = await res.json();
        users = data.data || [];
        renderUserList();
    } catch (err) {
        console.error('Failed to fetch users:', err);
    }
}

// Render user list based on role filter
function renderUserList() {
    const selectedRole = roleFilter.value;
    userList.innerHTML = '';

    const filteredUsers = selectedRole === 'all'
        ? users
        : users.filter(user => user.role === selectedRole);

    filteredUsers.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user.name;
        li.dataset.id = user.id;
        li.classList.add('user-list-item');
        li.addEventListener('click', () => populateForm(user.id));
        userList.appendChild(li);
    });
}

// Populate the form on the right
async function populateForm(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;

    userIdField.value = user.id;
    nameField.value = user.name;
    emailField.value = user.email;
    roleField.value = user.role;

    if (user.role === 'student') {
        const student = await fetch(`/api/getuser/students/${user.id}`).then(res => res.json());
        programField.value = student.program || '';
        yearLevelField.value = student.year_level || '';
        studentFields.style.display = 'block';
        facultyFields.style.display = 'none';
    } else if (user.role === 'faculty') {
        const faculty = await fetch(`/api/getuser/faculty/${user.id}`).then(res => res.json());
        departmentField.value = faculty.department || '';
        specializationField.value = faculty.specialization || '';
        studentFields.style.display = 'none';
        facultyFields.style.display = 'block';
    } else {
        studentFields.style.display = 'none';
        facultyFields.style.display = 'none';
    }
}

// Show/hide fields based on role
roleField.addEventListener('change', () => {
    const role = roleField.value;
    studentFields.style.display = role === 'student' ? 'block' : 'none';
    facultyFields.style.display = role === 'faculty' ? 'block' : 'none';
});

// Refetch list when role filter is changed
roleFilter.addEventListener('change', renderUserList);
fetchUsers();
// Handle form submission (Update user)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = userIdField.value;
    const role = roleField.value;
    const payload = {
        name: nameField.value,
        email: emailField.value,
        role
    };

    if (role === 'student') {
        payload.program = programField.value;
        payload.year_level = parseInt(yearLevelField.value) || 1;
    } else if (role === 'faculty') {
        payload.department = departmentField.value;
        payload.specialization = specializationField.value;
    }

    try {
        const res = await fetch(`/api/setuser/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('User updated successfully');
            await fetchUsers(); // refresh list
            populateForm(parseInt(id)); // re-populate form with updated data
        } else {
            const error = await res.json();
            alert(`Update failed: ${error.error}`);
        }
    } catch (err) {
        console.error('Error updating user:', err);
        alert('Failed to update user');
    }
});

// Handle delete button click
document.getElementById('deleteBtn').addEventListener('click', async () => {
    const id = userIdField.value;
    if (!id || !confirm('Are you sure you want to delete this user?')) return;

    try {
        const res = await fetch(`/api/setuser/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert('User deleted successfully');
            form.reset();
            studentFields.style.display = 'none';
            facultyFields.style.display = 'none';
            await fetchUsers(); // refresh list
        } else {
            const error = await res.json();
            alert(`Delete failed: ${error.error}`);
        }
    } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user');
    }
});
// ----- END OF USER-MANAGEMENT.JS -----