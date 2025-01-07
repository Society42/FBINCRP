document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    showCustomNotification('Right-click is disabled on this site.');
});

function handleLogout() {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('currentUser');
    window.location.href = '../login.html'; 
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none'); 

    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block'; 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('isAuthenticated')) {
        window.location.href = '../login.html'; 
    } else {
        showSection('introduction');
    }
});

document.addEventListener('mousedown', function (event) {
    if (event.button === 0) {  
        const target = event.target;

        if (!target.closest('.next-prev-links a') && !target.closest('#introduction')) {
            const errorMessage = document.getElementById('error-message');
            errorMessage.style.display = 'block'; 

            setTimeout(function () {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    }
});