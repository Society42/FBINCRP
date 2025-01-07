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

document.getElementById('firearms-discharge-form').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    const embed = {
        embeds: [{
            title: "Firearms Discharge Log Submission",
            color: 15196, 
            fields: [
                { name: "Date and Time of Discharge", value: data['date-time'], inline: true },
                { name: "Location of Discharge", value: data['location'], inline: false },
                { name: "Type of Firearm", value: data['firearm-type'], inline: false },
                { name: "Description of Incident", value: data['incident-description'], inline: false },
                { name: "Officers Involved", value: data['officers-involved'], inline: false },
                { name: "Persons Involved", value: data['targets'] || "No persons involved", inline: false },
                { name: "Witnesses", value: data['witnesses'] || "No witnesses reported", inline: false },
                { name: "Actions Taken", value: data['actions-taken'], inline: false }
            ]
        }]
    };

    const webhookURL = 'https://discord.com/api/webhooks/1326188992974159963/gR8bQi1NJuHe2TJTCXSxKnfrUVxFukAyKghMudQulmiZHee3W4FexoJSIPHa3zCYYRhl';

    fetch(webhookURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(embed)
    })
    .then(response => {
        if (response.ok) {
            alert('Firearm Discharge submitted successfully.');
            document.getElementById('firearms-discharge-form').reset();
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