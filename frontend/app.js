// API базовый URL
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

// Список номинантов
const nominees = [
    "Cloury", "Dony_zq", "Eozik", "Flourin", "Izumrudik", 
    "Makos", "Menchik", "Nodben", "Qusti", "Maronnix"
];

// Глобальные переменные
let currentUser = null;
let nominationsData = { main: [], additional: [] };
let userVotes = {};

// Элементы DOM
const authBtn = document.getElementById('authBtn');
const authModal = document.getElementById('authModal');
// ... остальные элементы как в предыдущем коде ...

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupScrollAnimation();
    loadNominations();
    checkAuthStatus();
});

// Проверка статуса авторизации
async function checkAuthStatus() {
    const savedUser = localStorage.getItem('flareUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showUserInfo(currentUser);
        loadUserVotes();
    }
}

// Загрузка номинаций
async function loadNominations() {
    try {
        const response = await fetch(`${API_BASE}/nominations`);
        nominationsData = await response.json();
    } catch (error) {
        console.error('Ошибка загрузки номинаций:', error);
    }
}

// Загрузка голосов пользователя
async function loadUserVotes() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/votes/user/${currentUser.id}`);
        userVotes = await response.json();
    } catch (error) {
        console.error('Ошибка загрузки голосов:', error);
    }
}

// Регистрация
async function handleRegister() {
    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!username || !password) {
        alert('Пожалуйста, заполните все поля');
        return;
    }

    if (!isLoginMode && password !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
    }

    try {
        const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        // Успешная авторизация
        currentUser = data.user;
        localStorage.setItem('flareUser', JSON.stringify(currentUser));
        showUserInfo(currentUser);
        authModal.style.display = 'none';
        loadUserVotes();
        
        alert(data.message);
    } catch (error) {
        alert(error.message);
    }
}

// Показать информацию пользователя
function showUserInfo(user) {
    userAvatar.textContent = user.username.charAt(0).toUpperCase();
    userInfo.style.display = 'block';
    authBtn.textContent = user.username;
    
    // Показать админ-панель для админа
    if (user.username === 'maronnix9991') {
        adminMenuContainer.style.display = 'block';
        updateReportsCount();
    }
}

// Голосование
async function confirmVote() {
    if (!selectedNominee || !currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/votes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUser.id,
                nominationId: currentNomination.id,
                nominee: selectedNominee
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        nomineeModal.style.display = 'none';
        alert(`Ваш голос в номинации "${currentNomination.name}" за ${selectedNominee} успешно сохранен!`);
        
        // Обновить голоса пользователя
        loadUserVotes();
    } catch (error) {
        alert(error.message);
    }
}

// Отправка репорта
async function submitReportHandler() {
    const nickname = reportNickname.value.trim();
    const reason = reportReason.value;
    const description = reportDescription.value.trim();
    const fix = reportFix.value.trim();

    if (!nickname || !reason || !description) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }

    if (!currentUser) {
        alert('Пожалуйста, войдите в систему');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentUser.id,
                nickname,
                reason,
                description,
                fix
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        reportModal.style.display = 'none';
        
        // Очистить форму
        reportNickname.value = '';
        reportReason.value = '';
        reportDescription.value = '';
        reportFix.value = '';
        
        alert('Спасибо за ваш репорт! Мы рассмотрим его в ближайшее время.');
        
        // Обновить счетчик репортов
        if (currentUser.username === 'maronnix9991') {
            updateReportsCount();
        }
    } catch (error) {
        alert(error.message);
    }
}

// Показать репорты
async function showReports() {
    try {
        const response = await fetch(`${API_BASE}/reports`);
        const reports = await response.json();

        reportsModal.style.display = 'flex';
        reportsList.innerHTML = '';

        if (reports.length === 0) {
            reportsList.innerHTML = '<p style="text-align: center; opacity: 0.7;">Пока нет репортов</p>';
            return;
        }

        reports.forEach(report => {
            const reportItem = document.createElement('div');
            reportItem.className = 'report-item';
            
            const reasonText = {
                'bug': 'Найден баг',
                'improvement': 'Найдена недоработка',
                'idea': 'Идея для улучшения'
            }[report.reason];
            
            reportItem.innerHTML = `
                <div class="report-header">
                    <div class="report-user">${report.nickname} (${report.user_username})</div>
                    <div class="report-reason">${reasonText}</div>
                </div>
                <div class="report-description">${report.description}</div>
                ${report.fix ? `<div class="report-fix"><strong>Предложение по исправлению:</strong><br>${report.fix}</div>` : ''}
                <div class="report-timestamp">${new Date(report.created_at).toLocaleString()}</div>
            `;
            
            reportsList.appendChild(reportItem);
        });
    } catch (error) {
        alert('Ошибка при загрузке репортов: ' + error.message);
    }
}

// Обновить счетчик репортов
async function updateReportsCount() {
    try {
        const response = await fetch(`${API_BASE}/reports/count`);
        const data = await response.json();
        reportsCount.textContent = data.count;
    } catch (error) {
        console.error('Ошибка обновления счетчика репортов:', error);
    }
}

// Показать результаты
async function showResults() {
    try {
        const response = await fetch(`${API_BASE}/votes/results`);
        const results = await response.json();

        let resultsHTML = '<h3>Результаты голосования</h3>';
        
        Object.values(results).forEach(nomination => {
            resultsHTML += `<h4 style="margin-top: 1.5rem; margin-bottom: 0.5rem; color: var(--gold);">${nomination.name}</h4>`;
            
            const sortedVotes = Object.entries(nomination.votes).sort((a, b) => b[1] - a[1]);
            
            if (sortedVotes.length > 0) {
                resultsHTML += '<table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem;">';
                sortedVotes.forEach(([nominee, count]) => {
                    resultsHTML += `
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid rgba(212,175,55,0.2);">${nominee}</td>
                            <td style="padding: 8px; border-bottom: 1px solid rgba(212,175,55,0.2); text-align: right;">${count} голосов</td>
                        </tr>
                    `;
                });
                resultsHTML += '</table>';
            } else {
                resultsHTML += '<p>Пока нет голосов</p>';
            }
        });
        
        alert('Результаты голосования:\n\n' + resultsHTML.replace(/<[^>]*>/g, ''));
    } catch (error) {
        alert('Ошибка при загрузке результатов: ' + error.message);
    }
}

// Показать детальную статистику
async function showDetailedStats() {
    try {
        const response = await fetch(`${API_BASE}/votes/stats/detailed`);
        const stats = await response.json();

        detailedStatsModal.style.display = 'flex';
        detailedStatsContent.innerHTML = '<h3 style="margin-bottom: 1rem; color: var(--gold);">Подробная статистика голосования</h3>';

        if (stats.length === 0) {
            detailedStatsContent.innerHTML += '<p>Пока нет голосов</p>';
            return;
        }

        // Группировка по номинациям
        const groupedStats = {};
        stats.forEach(stat => {
            if (!groupedStats[stat.nomination_name]) {
                groupedStats[stat.nomination_name] = [];
            }
            groupedStats[stat.nomination_name].push(stat);
        });

        Object.entries(groupedStats).forEach(([nominationName, votes]) => {
            const nominationStats = document.createElement('div');
            nominationStats.style.marginBottom = '2rem';
            nominationStats.innerHTML = `<h4 style="color: var(--gold); margin-bottom: 0.5rem;">${nominationName}</h4>`;
            
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.marginTop = '0.5rem';
            
            table.innerHTML = `
                <tr>
                    <th style="padding: 8px; border-bottom: 1px solid rgba(212,175,55,0.2); text-align: left;">Пользователь</th>
                    <th style="padding: 8px; border-bottom: 1px solid rgba(212,175,55,0.2); text-align: left;">Номинант</th>
                    <th style="padding: 8px; border-bottom: 1px solid rgba(212,175,55,0.2); text-align: left;">Время</th>
                </tr>
            `;
            
            votes.forEach(vote => {
                table.innerHTML += `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid rgba(212,175,55,0.2);">${vote.username}</td>
                        <td style="padding: 8px; border-bottom: 1px solid rgba(212,175,55,0.2);">${vote.nominee}</td>
                        <td style="padding: 8px; border-bottom: 1px solid rgba(212,175,55,0.2);">${new Date(vote.created_at).toLocaleString()}</td>
                    </tr>
                `;
            });
            
            nominationStats.appendChild(table);
            detailedStatsContent.appendChild(nominationStats);
        });
    } catch (error) {
        alert('Ошибка при загрузке статистики: ' + error.message);
    }
}

// Остальные функции (setupEventListeners, setupScrollAnimation и т.д.) остаются аналогичными предыдущей версии
// но используют API вызовы вместо localStorage