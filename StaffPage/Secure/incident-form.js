document.addEventListener('mousedown', function (event) {
    if (event.button === 0) {  
        const target = event.target;

        if (!target.closest('.next-prev-links a') && !target.closest('#table-of-contents')) {
            const errorMessage = document.getElementById('error-message');
            errorMessage.style.display = 'block'; 

            setTimeout(function () {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    }
});

document.getElementById('incident-log-form').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    const embed = {
        embeds: [{
            title: "Incident Log Submission",
            color: 15196, 
            fields: [
                { name: "Date and Time of Incident", value: data['date-time'], inline: true },
                { name: "Location of Incident", value: data['location'], inline: false },
                { name: "Type of Incident", value: data['incident-type'], inline: false },
                { name: "Description", value: data['description'], inline: false },
                { name: "Persons Involved", value: data['persons-involved'], inline: false },
                { name: "Witnesses", value: data['witnesses'] || "No witnesses reported", inline: false },
                { name: "Actions Taken", value: data['actions-taken'], inline: false }
            ]
        }]
    };

    const webhookURL = 'https://discord.com/api/webhooks/1326188833015992451/QZxmwjoC1kgvjyPt7CgFGzs92386HpKrDH7Q-RmBn213109yms6V6QFr5I1G6Y4JaNkh';

    fetch(webhookURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(embed)
    })
    .then(response => {
        if (response.ok) {
            alert('Incident log submitted successfully.');
            document.getElementById('incident-log-form').reset();
        } else {
            alert('Error submitting incident log.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while submitting the incident log.');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('isAuthenticated')) {
        window.location.href = '../login.html'; 
    } else {
        showSection('table-of-contents');
    }
});