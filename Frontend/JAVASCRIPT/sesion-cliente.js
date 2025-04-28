        // Función para alternar entre mostrar/ocultar contraseña
        function togglePassword(inputId) {
            const input = document.getElementById(inputId);
            const toggle = input.nextElementSibling;
            
            if (input.type === "password") {
                input.type = "text";
                toggle.textContent = "Ocultar";
            } else {
                input.type = "password";
                toggle.textContent = "Mostrar";
            }
        }
        
        // Funciones para alternar entre formularios
        function showLogin() {
            document.getElementById('login-form').classList.add('active');
            document.getElementById('register-form').classList.remove('active');
            document.getElementById('forgot-password-form').classList.remove('active');
        }
        
        function showRegister() {
            document.getElementById('login-form').classList.remove('active');
            document.getElementById('register-form').classList.add('active');
            document.getElementById('forgot-password-form').classList.remove('active');
        }
        
        function showForgotPassword() {
            document.getElementById('login-form').classList.remove('active');
            document.getElementById('register-form').classList.remove('active');
            document.getElementById('forgot-password-form').classList.add('active');
        }
        
        // Funciones para manejar el envío de formularios (simuladas)
        function login() {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Aquí iría la lógica real de autenticación
            console.log('Iniciando sesión con:', email, password);
            alert('Función de login simulada. En una implementación real, esto autenticaría al usuario.');
        }
        
        function register() {
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden');
                return;
            }
            
            // Aquí iría la lógica real de registro
            console.log('Registrando usuario:', name, email, password);
            alert('Función de registro simulada. En una implementación real, esto crearía una nueva cuenta.');
            
            // Después del registro, mostrar el formulario de login
            showLogin();
        }
        
        function sendResetLink() {
            const email = document.getElementById('forgot-email').value;
            
            // Aquí iría la lógica real para enviar el enlace de recuperación
            console.log('Enviando enlace de recuperación a:', email);
            alert(`Se ha enviado un enlace de recuperación a ${email} (simulado).`);
            
            // Después de enviar el enlace, volver al login
            showLogin();
        }