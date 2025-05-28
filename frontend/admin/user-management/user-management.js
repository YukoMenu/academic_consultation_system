// ----- START OF USER-MANAGEMENT.JS -----
(() => {
    console.log('User Management Loaded!')
    const userList = document.getElementById('userList');
    const roleFilter = document.getElementById('roleFilter');

    const form = document.getElementById('userForm');
    const userIdField = document.getElementById('userId');
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const roleField = document.getElementById('role');

    const programField = document.getElementById('program');
    const yearLevelField = document.getElementById('year_level');
    const departmentField = document.getElementById('department');
    const specializationField = document.getElementById('specialization');

    const studentFields = document.getElementById('studentFields');
    const facultyFields = document.getElementById('facultyFields');

    const createBtn = document.getElementById('createBtn');
    const updateBtn = document.getElementById('updateBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const newUserBtn = document.getElementById('newUserBtn');

    let isCreating = false;
    let users = [];

    // Fetch all users from backend
    async function fetchUsers() {
        try {
            const res = await fetch('/api/users');
            if (!res.ok) {
                console.error('Fetch failed with status:', res.status);
                return;
            }
            const data = await res.json();
            users = (data.data || []).filter(user => user.role !== 'admin');
            renderUserList();
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    }

    // Render user list based on role filter
    function renderUserList() {
        const selectedRole = roleFilter.value;
        const searchQuery = document.getElementById('userSearch').value.toLowerCase();
        userList.innerHTML = '';

        const filteredUsers = users.filter(user => {
            const matchesRole = selectedRole === 'all' || user.role === selectedRole;
            const matchesSearch = user.name.toLowerCase().includes(searchQuery);
            return matchesRole && matchesSearch;
        });

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
        passwordContainer.style.display = 'none';

        if (user.role === 'student') {
            const student = await fetch(`http://localhost:3000/api/getuser/students/${user.id}`).then(res => res.json());
            programField.value = student.program || '';
            yearLevelField.value = student.year_level || '';
            studentFields.style.display = 'block';
            facultyFields.style.display = 'none';
        } else if (user.role === 'faculty') {
            const faculty = await fetch(`http://localhost:3000/api/getuser/faculty/${user.id}`).then(res => res.json());
            departmentField.value = faculty.department || '';
            specializationField.value = faculty.specialization || '';
            studentFields.style.display = 'none';
            facultyFields.style.display = 'block';
        } else {
            studentFields.style.display = 'none';
            facultyFields.style.display = 'none';
        }
        setFormMode(false);
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

        if (isCreating) {
            const password = passwordField.value.trim();
            if (!password) {
                alert('Password is required when creating a user.');
                return;
            }
            payload.password = password;
        }

        if (role === 'student') {
            payload.program = programField.value;
            payload.year_level = parseInt(yearLevelField.value) || 1;
        } else if (role === 'faculty') {
            payload.department = departmentField.value;
            payload.specialization = specializationField.value;
        }

        try {
            const method = isCreating ? 'POST' : 'PUT';
            const url = isCreating
                ? `http://localhost:3000/api/users`
                : `http://localhost:3000/api/setuser/${id}`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const successMsg = isCreating ? 'User created successfully' : 'User updated successfully';
                alert(successMsg);
                isCreating = false;
                document.getElementById('formTitle').textContent = 'User Details';
                await fetchUsers();
                if (!isCreating && id) populateForm(parseInt(id));
            } else {
                const error = await res.json();
                if (res.status === 409) {
                    alert('Email already exists. Please use a different email.');
                } else {
                    alert(`Operation failed: ${error.error}`);
                }
            }
        } catch (err) {
            console.error(`Error ${isCreating ? 'creating' : 'updating'} user:`, err);
            alert(`Failed to ${isCreating ? 'create' : 'update'} user`);
        }
    });

    // Handle delete button click
    deleteBtn.addEventListener('click', async () => {
        const id = userIdField.value;
        if (!id || !confirm('Are you sure you want to delete this user?')) return;

        try {
            const res = await fetch(`http://localhost:3000/api/setuser/${id}`, { method: 'DELETE' });
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

    const passwordContainer = document.getElementById('passwordContainer');

    newUserBtn.addEventListener('click', () => {
        if (!isCreating) {
            // Switch to create mode
            form.reset();
            userIdField.value = '';
            passwordField.value = '';
            studentFields.style.display = 'none';
            facultyFields.style.display = 'none';
            setFormMode(true);
        } else {
            // Switch back to edit mode
            form.reset();
            studentFields.style.display = 'none';
            facultyFields.style.display = 'none';
            setFormMode(false);
        }
    });

    function setFormMode(createMode) {
        isCreating = createMode;
        document.getElementById('formTitle').textContent = createMode ? 'Create New User' : 'User Details';

        createBtn.style.display = createMode ? 'inline-block' : 'none';
        updateBtn.style.display = createMode ? 'none' : 'inline-block';
        deleteBtn.style.display = createMode ? 'none' : 'inline-block';
        newUserBtn.textContent = createMode ? 'Back' : 'New User';
        passwordContainer.style.display = createMode ? 'block' : 'none';
    }

    document.getElementById('userSearch').addEventListener('input', renderUserList);
})();
// ----- END OF USER-MANAGEMENT.JS -----