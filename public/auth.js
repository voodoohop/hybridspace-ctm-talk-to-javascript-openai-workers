// Block all execution until authenticated
const PASSWORD = 'conception';
const STORAGE_KEY = 'prio_auth';

// Check auth immediately
if (localStorage.getItem(STORAGE_KEY) !== PASSWORD) {
    // Not authenticated - replace page content
    document.documentElement.innerHTML = `
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PRIO - Access Required</title>
        </head>
        <body style="margin:0;font-family:sans-serif;">
            <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;">
                <div style="background:white;padding:40px;border-radius:12px;text-align:center;max-width:400px;width:90%;">
                    <img src="./priologo.png" alt="PRIO" style="height:60px;margin-bottom:20px;">
                    <h2 style="margin:0 0 10px 0;color:#333;">Access Required</h2>
                    <p style="margin:0 0 20px 0;color:#666;">Enter password to continue</p>
                    <input type="password" id="password" placeholder="Password" style="width:100%;padding:15px;border:2px solid #ddd;border-radius:8px;font-size:16px;box-sizing:border-box;margin-bottom:20px;">
                    <button id="auth-btn" style="width:100%;padding:15px;background:#FFD400;color:#000;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;">Enter</button>
                    <div id="error" style="margin-top:15px;color:#e74c3c;font-size:14px;display:none;">Incorrect password</div>
                </div>
            </div>
        </body>
    `;
    
    // Add event listeners after DOM is replaced
    setTimeout(() => {
        function checkAuth() {
            const input = document.getElementById('password').value;
            if (input === PASSWORD) {
                localStorage.setItem(STORAGE_KEY, PASSWORD);
                location.reload();
            } else {
                document.getElementById('error').style.display = 'block';
                document.getElementById('password').value = '';
                document.getElementById('password').focus();
            }
        }
        
        document.getElementById('auth-btn').addEventListener('click', checkAuth);
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkAuth();
        });
        document.getElementById('password').focus();
    }, 0);
    
    // Stop further script execution
    throw new Error('Authentication required');
}
