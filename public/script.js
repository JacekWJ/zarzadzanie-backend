const form = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const employee = document.getElementById('employee').value;
  const task = document.getElementById('task').value;

  const response = await fetch('http://localhost:5000/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee, task, date: new Date().toISOString().split('T')[0] })
  });

  if (response.ok) {
    loadTasks();
    form.reset();
  }
});

async function loadTasks() {
  const response = await fetch('http://localhost:5000/tasks');
  const tasks = await response.json();
  taskList.innerHTML = '';
  tasks.forEach(t => {
    const li = document.createElement('li');
    li.textContent = `${t.employee}: ${t.task} (${t.date})`;
    taskList.appendChild(li);
  });
}

loadTasks();
