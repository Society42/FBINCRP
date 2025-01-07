if (!sessionStorage.getItem('isAuthenticated')) {
    window.location.href = 'login.html';
}

async function handleLogout() {
    const webhookUrl = 'https://discord.com/api/webhooks/1322308209691721728/mqP4gQg-UU4axvirBe4Zd7xKiinS7rt6--JBraURKONUD0RFnf8qReoExQt98EyXm_sC';
    const currentUser = sessionStorage.getItem('currentUser') || 'Unknown User'; 

    await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            embeds: [{
                title: "FBI Website Notification",
                description: `User **${currentUser}** has logged out.`,
                color: 16753920, 
                timestamp: new Date().toISOString() 
            }]
        })
    });

    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('currentUser');

    window.location.href = 'login.html'; 
}