(() => {
    console.log("History loaded!")

const historyData = [
  { date: '2025-05-01', faculty: 'Dr. Smith', status: 'Completed', notes: 'Discussed project scope.' },
  { date: '2025-05-03', faculty: 'Prof. Lee', status: 'Canceled', notes: 'Faculty unavailable.' },
  { date: '2025-05-07', faculty: 'Dr. Clark', status: 'Completed', notes: 'Review session.' },
]

const tbody = document.getElementById('historyBody')

historyData.forEach(entry => {
  const row = document.createElement('tr')
  row.innerHTML = `
    <td>${entry.date}</td>
    <td>${entry.faculty}</td>
    <td>${entry.status}</td>
    <td>${entry.notes}</td>
  `
  tbody.appendChild(row)
})
})();