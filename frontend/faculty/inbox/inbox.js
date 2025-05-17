(() => {
    console.log("Inbox loaded!")

    const messages = [
    {
        sender: 'Dr. Smith',
        time: '2025-05-06 09:30 AM',
        content: 'Please bring your proposal to our next meeting.'
    },
    {
        sender: 'Prof. Lee',
        time: '2025-05-04 04:15 PM',
        content: 'I’ve reviewed your draft, and we’ll discuss revisions.'
    },
    {
        sender: 'Admin',
        time: '2025-05-01 11:00 AM',
        content: 'Reminder: Midterm consultation week starts May 10.'
    }
    ]

    const inboxList = document.getElementById('inboxList')

    messages.forEach(msg => {
    const div = document.createElement('div')
    div.classList.add('inbox-message')
    div.innerHTML = `
        <h4>${msg.sender}</h4>
        <time>${msg.time}</time>
        <p>${msg.content}</p>
    `
    inboxList.appendChild(div)
    })

})();
