const validCredentials = {
    'Society': { password: 'FBI8vX#@29bP$1', profilePicture: '' },
    'ryder_is_short': { password: 'x9FBI*Qwe5D@#7', profilePicture: '' },
    'anders_j': { password: '2FBI9t&yZ3qA6B', profilePicture: '' },
    'syxmonz': { password: '_FBIz34%kL9xD1r', profilePicture: '' },
    'NCRPOwnership': { password: 'LpFBI7!h9Uwq2kV', profilePicture: '' },
    'Jake': { password: '1FBI@zRsYJp0A8k', profilePicture: '' },
};

    const deletedAccounts = {
        'Hayder.145': {
            password: 'Tato.124',
            reason: 'Account deleted due to retiring from FBI.'
        },
    };

    const webhookUrl = 'https://discord.com/api/webhooks/1326186541084840017/edimMSN3eg0dyNaOxhhoWsAA3n1ofrdxD3fmhCIlee7JoTMVpXd00dYQ3Ca0hK7Gc_p5';

    async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (deletedAccounts[username]) {
        if (deletedAccounts[username].password === password) {
            console.log('Deleted account attempted to login');
            
            await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    embeds: [{
                        title: "Deleted Account attempted to login",
                        description: `Deleted account **${username}** has attempted to login but was sent to deleted account page. Reason for deletion: **${deletedAccounts[username].reason}**.`,
                        color: 16753920,
                        timestamp: new Date().toISOString()
                    }]
                })
            });

            window.location.href = `deleted-account.html?reason=${encodeURIComponent(deletedAccounts[username].reason)}`;
            return; 
        } else {
            console.log('Invalid password for deleted account.');
            document.getElementById('error-message').textContent = 'Invalid username or password.';
            return;
        }
    }

    if (validCredentials[username] && validCredentials[username].password === password) {
        console.log('Login successful for valid account');
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('currentUser', username);
        sessionStorage.setItem('profilePicture', validCredentials[username].profilePicture); 

        await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                embeds: [{
                    title: "FBI Website Notification",
                    description: `User **${username}** has logged in successfully.`,
                    color: 3066993,
                    timestamp: new Date().toISOString()
                }]
            })
        });

        window.location.href = 'staff-home.html';
    } else {
        console.log('Login failed for username:', username);
        await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                embeds: [{
                    title: "Failed Login Attempt",
                    description: `User **${username}** failed to login with the provided password.`,
                    color: 15158332,
                    timestamp: new Date().toISOString()
                }]
            })
        });

        document.getElementById('error-message').textContent = 'Invalid username or password.';
    }
}

    async function handleForgotPassword() {
        const username = document.getElementById('forgotUsername').value;

        if (username) {
            alert('Contacted high command, you may be contacted within 24 hours to confirm this.');

            await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    embeds: [{
                        title: "Forgot Password Request",
                        description: `User **${username}** has requested a password reset.`,
                        color: 16753920,
                        timestamp: new Date().toISOString()
                    }]
                })
            });

        } else {
            alert('Please enter your username.');
        }

        closeForgotPassword();
    }

    function openForgotPassword() {
        document.getElementById('forgotPasswordPopup').style.display = 'flex';
    }

    function closeForgotPassword() {
        document.getElementById('forgotPasswordPopup').style.display = 'none';
    }