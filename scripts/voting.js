// Управление голосованием
class VotingManager {
    constructor() {
        this.currentCategory = null;
        this.currentNomination = null;
        this.selectedNominee = null;
        this.init();
    }

    init() {
        this.setupVotingListeners();
    }

    setupVotingListeners() {
        // Основные кнопки голосования
        ['voteMainBtn', 'voteAdditionalBtn', 'voteMainBtn2', 'voteAdditionalBtn2'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', (e) => {
                    const category = id.includes('Main') ? 'main' : 'additional';
                    this.openVotingModal(category);
                });
            }
        });

        // Навигация в модальных окнах
        document.getElementById('backToNominationsBtn').addEventListener('click', () => {
            this.backToNominations();
        });

        document.getElementById('confirmVoteBtn').addEventListener('click', () => {
            this.confirmVote();
        });
    }

    openVotingModal(category) {
        // Проверяем авторизацию
        if (!window.authManager?.getCurrentUser()) {
            alert('Пожалуйста, войдите в систему для голосования');
            document.getElementById('authModal').style.display = 'flex';
            return;
        }

        this.currentCategory = category;
        
        // Устанавливаем заголовок
        document.getElementById('nominationModalTitle').textContent = 
            category === 'main' ? 'Основные номинации' : 'Дополнительные номинации';
        
        // Загружаем номинации
        this.loadNominations();
        
        // Показываем модальное окно
        document.getElementById('nominationModal').style.display = 'flex';
    }

    loadNominations() {
        const nominations = this.currentCategory === 'main' ? [
            { 
                id: 'best_player', 
                name: 'Лучший игрок года', 
                description: 'За выдающиеся достижения в игровом процессе',
                image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
            },
            { 
                id: 'most_active', 
                name: 'Самый активный участник', 
                description: 'За постоянную активность в сообществе',
                image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
            },
            { 
                id: 'best_communicator', 
                name: 'Лучший коммуникатор', 
                description: 'За умение общаться и создавать атмосферу',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
            }
        ] : [
            { 
                id: 'most_funny', 
                name: 'Самый веселый участник', 
                description: 'За способность поднять настроение',
                image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
            },
            { 
                id: 'best_builder', 
                name: 'Лучший строитель', 
                description: 'За создание впечатляющих построек',
                image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
            },
            { 
                id: 'music_talent', 
                name: 'Музыкальный талант', 
                description: 'За музыкальные способности',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
            }
        ];
        
        const grid = document.getElementById('nominationsGrid');
        grid.innerHTML = '';
        
        nominations.forEach(nomination => {
            const card = document.createElement('div');
            card.className = 'nomination-card';
            card.innerHTML = `
                <img class="nomination-card-image" src="${nomination.image}" alt="${nomination.name}">
                <h3 class="nomination-card-title">${nomination.name}</h3>
                <p class="nomination-card-description">${nomination.description}</p>
                <div class="nomination-card-status">Нажмите для выбора</div>
            `;
            
            card.addEventListener('click', () => {
                this.openNomineeModal(nomination);
            });
            
            grid.appendChild(card);
        });
    }

    openNomineeModal(nomination) {
        this.currentNomination = nomination;
        
        document.getElementById('nomineeModalTitle').textContent = nomination.name;
        document.getElementById('nominationDescription').textContent = nomination.description;
        
        this.loadNominees();
        
        document.getElementById('nominationModal').style.display = 'none';
        document.getElementById('nomineeModal').style.display = 'flex';
    }

    loadNominees() {
        const nominees = ["Cloury", "Dony_zq", "Eozik", "Flourin", "Izumrudik", "Makos", "Menchik", "Nodben", "Qusti"];
        
        const grid = document.getElementById('nomineesGrid');
        grid.innerHTML = '';
        
        document.getElementById('confirmVoteBtn').disabled = true;
        this.selectedNominee = null;
        
        nominees.forEach(nominee => {
            const card = document.createElement('div');
            card.className = 'nominee-card';
            card.innerHTML = `
                <img class="nominee-image" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="${nominee}">
                <div class="nominee-name">${nominee}</div>
            `;
            
            card.addEventListener('click', () => {
                // Снимаем выделение со всех карточек
                document.querySelectorAll('.nominee-card').forEach(c => {
                    c.classList.remove('selected');
                });
                
                // Выделяем текущую карточку
                card.classList.add('selected');
                
                // Сохраняем выбор
                this.selectedNominee = nominee;
                
                // Активируем кнопку подтверждения
                document.getElementById('confirmVoteBtn').disabled = false;
            });
            
            grid.appendChild(card);
        });
    }

    backToNominations() {
        document.getElementById('nomineeModal').style.display = 'none';
        document.getElementById('nominationModal').style.display = 'flex';
    }

    confirmVote() {
        if (!this.selectedNominee) {
            alert('Пожалуйста, выберите номинанта');
            return;
        }

        const voteData = {
            user: window.authManager.getCurrentUser(),
            category: this.currentCategory,
            nomination: this.currentNomination.id,
            nominee: this.selectedNominee,
            timestamp: new Date().toISOString()
        };

        // Сохраняем голос
        this.saveVote(voteData);
        
        alert(`Ваш голос за ${this.selectedNominee} в номинации "${this.currentNomination.name}" сохранен!`);
        document.getElementById('nomineeModal').style.display = 'none';
        
        // Сбрасываем выбор
        this.selectedNominee = null;
    }

    saveVote(voteData) {
        // Получаем существующие голоса или создаем новый массив
        const votes = JSON.parse(localStorage.getItem('flare_votes') || '[]');
        
        // Удаляем предыдущий голос пользователя в этой номинации (если есть)
        const userVotes = votes.filter(vote => 
            !(vote.user === voteData.user && 
              vote.category === voteData.category && 
              vote.nomination === voteData.nomination)
        );
        
        // Добавляем новый голос
        userVotes.push(voteData);
        
        // Сохраняем обратно
        localStorage.setItem('flare_votes', JSON.stringify(userVotes));
        
        console.log('Голос сохранен:', voteData);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.votingManager = new VotingManager();
});