// Admin Login JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            showMessage('Logging in...', 'info');
            
            const response = await fetch('/auth/admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            console.log('Login response:', result);
            
            if (result.success) {
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/admin-dashboard';
                }, 1500);
            } else {
                showMessage(result.message || 'Login failed', 'error');
                // Also show in the login error div
                const loginError = document.getElementById('loginError');
                loginError.textContent = result.message || 'Login failed. Please try again.';
                loginError.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('Network error. Please try again.', 'error');
        }
    });

    function showMessage(text, type) {
        console.log(`Showing message: ${text} (${type})`);
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Also show in login error div for better visibility
        if (type === 'success') {
            const loginError = document.getElementById('loginError');
            loginError.innerHTML = `<i class="fas fa-check-circle"></i> ${text}`;
            loginError.style.display = 'block';
            loginError.style.background = '#d4edda';
            loginError.style.color = '#155724';
            loginError.style.borderLeft = '4px solid #28a745';
        }
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    // Auto-fill demo credentials when clicked
    const demoCredentials = document.querySelector('.demo-credentials');
    demoCredentials.addEventListener('click', function() {
        document.getElementById('email').value = 'admin@demo.com';
        document.getElementById('password').value = 'demo123';
    });

    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    const passwordParam = urlParams.get('password');
    const errorParam = urlParams.get('error');
    
    // Show error message if present
    if (errorParam) {
        showMessage(decodeURIComponent(errorParam), 'error');
        const loginError = document.getElementById('loginError');
        loginError.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${decodeURIComponent(errorParam)}`;
        loginError.style.display = 'block';
    }
    
    // Auto-fill credentials from URL
    if (emailParam) {
        document.getElementById('email').value = decodeURIComponent(emailParam);
    }
    if (passwordParam) {
        document.getElementById('password').value = decodeURIComponent(passwordParam);
    }
    
    // If both parameters are present, auto-submit after a short delay
    if (emailParam && passwordParam && !errorParam) {
        console.log('Auto-submitting with URL parameters...');
        setTimeout(() => {
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            loginForm.dispatchEvent(submitEvent);
        }, 1000);
    }

    // Add a test to make sure JavaScript is working
    console.log('Admin login JavaScript loaded successfully');
    
    // Clean URL after processing parameters
    if (urlParams.toString()) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
});

// Password toggle functionality
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}