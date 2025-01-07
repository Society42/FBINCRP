const validCredentials = {
    '56464564564ytrdg4reygf456': { password: '12312421453253254364564', profilePicture: '' },
};

    const deletedAccounts = {
        'Hayder.145': {
            password: 'Tato.124',
            reason: 'Account deleted due to retiring from FBI.'
        },
                'Society': {
            password: 'Gingercat22',
            reason: 'Due to a system-wide security compromise affecting all user accounts, your account has been deleted to maintain data integrity and security..'
        },

                'ryder_is_short': {
            password: 'FBI_MichelleHarrison',
            reason: 'Due to a system-wide security compromise affecting all user accounts, your account has been deleted to maintain data integrity and security..'
        },

                'anders_j': {
            password: 'FBICOS12!23084',
            reason: 'Due to a system-wide security compromise affecting all user accounts, your account has been deleted to maintain data integrity and security..'
        },

                'syxmonz': {
            password: 'NCRPFBI!2009',
            reason: 'Due to a system-wide security compromise affecting all user accounts, your account has been deleted to maintain data integrity and security..'
        },

                'NCRPOwnership': {
            password: 'FBIOWNERSHIP09',
            reason: 'Due to a system-wide security compromise affecting all user accounts, your account has been deleted to maintain data integrity and security..'
        },

                'Jake': {
            password: 'HRT#EliteOps',
            reason: 'Due to a system-wide security compromise affecting all user accounts, your account has been deleted to maintain data integrity and security..'
        }
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
        sessionStorage.setItem('profilePicture', validCredentials[username].profilePicture); // Store profile picture

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

            // Make sure webhook is sent for forgotten password request
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
