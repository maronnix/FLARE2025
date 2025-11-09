// Админ-панель
class AdminManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupAdminListeners();
        this.updateReportsCount();
    }

    setupAdminListeners() {
        const adminMenuBtn = document.getElementById('adminMenuBtn');
        if (adminMenuBtn) {
            adminMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('adminDropdown').classList.toggle('show');
            });
        }

        // Закрытие админ-меню при клике вне его
        document.addEventListener('click', () => {
            document.getElementById('adminDropdown').classList.remove('show');
        });

        // Кнопки админ-панели
        document.getElementById('viewResultsBtn').addEventListener('click', () => {
            this.viewResults();
        });
        
        document.getElementById('viewStatsBtn').addEventListener('click', () => {
            this.viewStats();
        });

        document.getElementById('viewReportsBtn').addEventListener('click', () => {
            this.viewReports();
        });
    }

    viewResults() {
        const votes = JSON.parse(localStorage.getItem('flare_votes') || '[]');
        
        if (votes.length === 0) {
            alert('Голосов пока нет!');
            return;
        }

        // Простая статистика
        let results = 'РЕЗУЛЬТАТЫ ГОЛОСОВАНИЯ:\n\n';
        
        // Группируем по номинациям
        const byNomination = {};
        votes.forEach(vote => {
            const key = `${vote.category}_${vote.nomination}`;
            if (!byNomination[key]) {
                byNomination[key] = {};
            }
            if (!byNomination[key][vote.nominee]) {
                byNomination[key][vote.nominee] = 0;
            }
            byNomination[key][vote.nominee]++;
        });

        // Формируем результаты
        for (const [key, nominees] of Object.entries(byNomination)) {
            const [category, nomination] = key.split('_');
            results += `Номинация: ${nomination}\n`;
            
            Object.entries(nominees)
                .sort(([,a], [,b]) => b - a)
                .forEach(([nominee, count]) => {
                    results += `  ${nominee}: ${count} голосов\n`;
                });
            results += '\n';
        }

        alert(results);
    }

    viewStats() {
        const votes = JSON.parse(localStorage.getItem('flare_votes') || '[]');
        const totalVotes = votes.length;
        const uniqueVoters = [...new Set(votes.map(vote => vote.user))].length;

        let stats = `СТАТИСТИКА ГОЛОСОВАНИЯ:\n\n`;
        stats += `Всего голосов: ${totalVotes}\n`;
        stats += `Уникальных голосующих: ${uniqueVoters}\n`;
        
        alert(stats);
    }

    viewReports() {
        alert('Функция просмотра репортов в разработке');
    }

    updateReportsCount() {
        const reportsCount = document.getElementById('reportsCount');
        // Здесь будет логика подсчета репортов
        reportsCount.textContent = '0';
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});