const urlParams = new URLSearchParams(window.location.search);
const reason = urlParams.get('reason');
document.getElementById('deleted-reason').textContent = reason || 'Your account has been deleted due to a violation of policies.';