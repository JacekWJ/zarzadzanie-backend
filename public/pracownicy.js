const addBtn = document.getElementById('addBtn');
const formContainer = document.getElementById('formContainer');
const form = document.getElementById('employeeForm');
const tableBody = document.querySelector('#employeeTable tbody');

addBtn.addEventListener('click', () => {
  formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const employee = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    login: document.getElementById('login').value,
    password: document.getElementById('password').value,
    accessType: document.getElementById('accessType').value
  };

  const res = await fetch('/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee)
  });

  if (res.ok) {
    loadEmployees();
    form.reset();
    formContainer.style.display = 'none';
  }
});

async function loadEmployees() {
  const res = await fetch('/employees');
  const employees = await res.json();

  tableBody.innerHTML = '';
  employees.forEach(e => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${e.first_name}</td>
      <td>${e.last_name}</td>
      <td>${e.login}</td>
      <td>${e.access_type}</td>
    `;
    tableBody.appendChild(row);
  });
}

loadEmployees();
