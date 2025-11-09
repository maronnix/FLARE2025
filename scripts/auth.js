// Аутентификация и управление пользователями
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupAuthListeners();
    }

    checkAuth() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = savedUser;
            this.updateUI();
        }
    }

    setupAuthListeners() {
        // Кнопка входа
        document.getElementById('authBtn').addEventListener('click', () => {
            this.openAuthModal();
        });

        // Кнопка регистрации
        document.getElementById('registerBtn').addEventListener('click', () => {
            this.register();
        });

        // Закрытие модальных окон
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });
    }

    openAuthModal() {
        document.getElementById('authModal').style.display = 'flex';
    }

    register() {
        const username = document.getElementById('usernameInput').value.trim();
        const password = document.getElementById('passwordInput').value;
        const confirmPassword = document.getElementById('confirmPasswordInput').value;

        if (!username) {
            alert('Введите ваш Discord никнейм');
            return;
        }

        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }

        // Сохраняем пользователя
        this.currentUser = username;
        localStorage.setItem('currentUser', username);
        
        this.updateUI();
        document.getElementById('authModal').style.display = 'none';
        alert(`Добро пожаловать, ${username}!`);
    }

    updateUI() {
        const authBtn = document.getElementById('authBtn');
        const adminMenu = document.getElementById('adminMenuContainer');

        if (this.currentUser) {
            authBtn.textContent = this.currentUser;
            
            // Показываем админ-панель для админа
            if (this.currentUser === 'maronnix9991') {
                adminMenu.style.display = 'block';
            }
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        document.getElementById('authBtn').textContent = 'Войти';
        document.getElementById('adminMenuContainer').style.display = 'none';
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});