class DatingChat {
    constructor() {
        this.userPhotos = [];
        this.participants = new Map();
        this.chatMessages = [];
        this.emojiPickerVisible = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAllData();
        this.createStars();
        this.simulateOtherUsers();
    }

    setupEventListeners() {
        // Загрузка фотографий
        document.getElementById('avatarUpload').addEventListener('change', (e) => {
            this.handlePhotoUpload(e.target.files);
        });

        // Отправка сообщения по Enter
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Закрытие эмодзи-пикера при клике вне его
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.emoji-picker')) {
                this.hideEmojiPicker();
            }
        });
    }

    handlePhotoUpload(files) {
        if (this.userPhotos.length + files.length > 5) {
            alert('Максимум 5 фотографий!');
            return;
        }

        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                this.compressImage(file, 600, 600)
                    .then(compressedFile => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            this.userPhotos.push({
                                id: Date.now() + Math.random(),
                                data: e.target.result,
                                timestamp: new Date().toISOString()
                            });
                            this.updatePhotoPreview();
                            this.saveUserData();
                        };
                        reader.readAsDataURL(compressedFile);
                    })
                    .catch(error => {
                        console.error('Ошибка сжатия изображения:', error);
                        alert('Ошибка при загрузке изображения');
                    });
            }
        });
    }

    compressImage(file, maxWidth, maxHeight) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Сохранение пропорций
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Рисуем сжатое изображение
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(blob => {
                    resolve(new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    }));
                }, 'image/jpeg', 0.8);
            };

            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    updatePhotoPreview() {
        const preview = document.getElementById('photoPreview');
        preview.innerHTML = '';

        this.userPhotos.forEach((photo, index) => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'photo-item';
            imgContainer.innerHTML = `
                <img src="${photo.data}" alt="Фото ${index + 1}">
                <button class="delete-photo" onclick="window.datingChat.deletePhoto(${index})">×</button>
            `;
            preview.appendChild(imgContainer);
        });

        // Обновляем аватар первым фото
        if (this.userPhotos.length > 0) {
            document.getElementById('userAvatar').src = this.userPhotos[0].data;
        } else {
            document.getElementById('userAvatar').src = '';
        }
    }

    deletePhoto(index) {
        this.userPhotos.splice(index, 1);
        this.updatePhotoPreview();
        this.saveUserData();
    }

    showFullPhoto(photo) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            cursor: pointer;
        `;
        
        const img = document.createElement('img');
        img.src = photo;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: 10px;
            box-shadow: 0 0 30px rgba(79, 195, 247, 0.5);
        `;

        modal.appendChild(img);
        modal.onclick = () => document.body.removeChild(modal);
        document.body.appendChild(modal);
    }

    sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();

        if (message) {
            this.addMessage('Вы', message, 'user');
            input.value = '';
            
            // Симуляция ответов других пользователей
            setTimeout(() => this.simulateReply(message), 1000 + Math.random() * 3000);
            
            this.saveChatHistory();
        }
    }

    addMessage(sender, text, type) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const now = new Date();
        const timeString = now.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageDiv.innerHTML = `
            <div class="message-header">${sender} • ${timeString}</div>
            <div class="message-text">${this.formatMessage(text)}</div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        messageDiv.classList.add('new-message');
        setTimeout(() => messageDiv.classList.remove('new-message'), 500);

        // Сохраняем в историю
        this.chatMessages.push({
            id: Date.now(),
            sender,
            text,
            type,
            timestamp: now.toISOString()
        });
    }

    formatMessage(text) {
        // Заменяем переносы строк и обрабатываем эмодзи
        return text.replace(/\n/g, '<br>');
    }

    simulateOtherUsers() {
        const fakeUsers = [
            { name: 'Космический странник', id: 'user1' },
            { name: 'Лунная принцесса', id: 'user2' },
            { name: 'Звездный воин', id: 'user3' },
            { name: 'Галактический исследователь', id: 'user4' },
            { name: 'Туманность', id: 'user5' }
        ];

        fakeUsers.forEach(user => {
            this.participants.set(user.id, user);
            this.addParticipant(user.name, user.id);
        });

        document.getElementById('onlineCount').textContent = this.participants.size + 1;

        // Периодические сообщения от ботов
        setInterval(() => {
            if (Math.random() > 0.7 && this.chatMessages.length > 0) {
                const randomUser = Array.from(this.participants.values())[
                    Math.floor(Math.random() * this.participants.size)
                ];
                const messages = [
                    'Привет! Как твои космические дела? 🌟',
                    'Кто-нибудь здесь любит смотреть на звезды? 🌌',
                    'Сегодня видел пролетающую комету! 🚀',
                    'Как вам новая галактика? 💫',
                    'Кто хочет отправиться в межзвездное путешествие? 👽',
                    'Люблю эти космические закаты... 🌅',
                    'Только что закончил читать книгу о черных дырах! 📚',
                    'Есть здесь астрономы? 🔭',
                    'Как думаете, есть ли жизнь на других планетах? 🪐',
                    'Люблю скорость света! ⚡',
                    'Сегодня ночью будет метеорный поток! 🌠',
                    'Кто-нибудь был на Марсе? 🤖'
                ];
                const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                this.addMessage(randomUser.name, randomMessage, 'other');
                this.saveChatHistory();
            }
        }, 15000);
    }

    simulateReply(userMessage) {
        if (Math.random() > 0.3) {
            const fakeUsers = Array.from(this.participants.values());
            const randomUser = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
            
            const replies = {
                'привет': ['Привет! 👋', 'Здравствуй! 🌟', 'Приветствую! 🚀', 'Привет, землянин! 👽'],
                'как дела': ['Отлично, наблюдаю за звездами! 🌌', 'Прекрасно, планирую космический полет! 👽', 'Хорошо, изучаю новые галактики! 💫'],
                'пока': ['До встречи! 👋', 'Удачи в космосе! 🚀', 'Пока! Возвращайся скорее! 🌟'],
                'default': [
                    'Интересно! Расскажи подробнее? 👀',
                    'Понятно! А что думаешь о космосе? 🌠',
                    'Занимательно! Хочешь обсудить звезды? ⭐',
                    'Ух ты! Это круто! 😎',
                    'Ничего себе! 🎉',
                    'Вот это да! 🌟'
                ]
            };

            let reply;
            const lowerMessage = userMessage.toLowerCase();

            if (lowerMessage.includes('привет')) reply = replies['привет'];
            else if (lowerMessage.includes('как дела')) reply = replies['как дела'];
            else if (lowerMessage.includes('пока')) reply = replies['пока'];
            else reply = replies['default'];

            const randomReply = reply[Math.floor(Math.random() * reply.length)];
            this.addMessage(randomUser.name, randomReply, 'other');
            this.saveChatHistory();
        }
    }

    addParticipant(name, id) {
        const participantsList = document.getElementById('participantsList');
        const participantDiv = document.createElement('div');
        participantDiv.className = 'participant';
        participantDiv.id = `participant-${id}`;

        participantDiv.innerHTML = `
            <div class="participant-avatar">${name.charAt(0)}</div>
            <div class="participant-info">
                <div class="participant-name">${name}</div>
                <div class="participant-status online">online</div>
            </div>
        `;

        participantsList.appendChild(participantDiv);
    }

    toggleEmojiPicker() {
        this.emojiPickerVisible = !this.emojiPickerVisible;
        const emojiGrid = document.getElementById('emojiGrid');
        
        if (this.emojiPickerVisible) {
            emojiGrid.classList.add('show');
        } else {
            emojiGrid.classList.remove('show');
        }
    }

    hideEmojiPicker() {
        this.emojiPickerVisible = false;
        document.getElementById('emojiGrid').classList.remove('show');
    }

    addEmoji(emoji) {
        const input = document.getElementById('messageInput');
        input.value += emoji;
        input.focus();
        this.hideEmojiPicker();
    }

    createStars() {
        this.createStarLayer('stars', 200, 3);
        this.createStarLayer('stars2', 100, 2);
        this.createStarLayer('stars3', 50, 1);
    }

    createStarLayer(layerId, count, size) {
        const layer = document.getElementById(layerId);
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: white;
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: twinkle ${2 + Math.random() * 3}s infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            layer.appendChild(star);
        }
    }

    // Сохранение данных в localStorage
    saveUserData() {
        const userData = {
            photos: this.userPhotos,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('cosmicDatingUserData', JSON.stringify(userData));
    }

    saveChatHistory() {
        // Сохраняем только последние 100 сообщений
        const recentMessages = this.chatMessages.slice(-100);
        localStorage.setItem('cosmicChatHistory', JSON.stringify(recentMessages));
    }

    loadAllData() {
        this.loadUserData();
        this.loadChatHistory();
    }

    loadUserData() {
        try {
            const saved = localStorage.getItem('cosmicDatingUserData');
            if (saved) {
                const userData = JSON.parse(saved);
                this.userPhotos = userData.photos || [];
                this.updatePhotoPreview();
            }
        } catch (error) {
            console.log('Ошибка загрузки данных пользователя:', error);
        }
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('cosmicChatHistory');
            if (saved) {
                const messages = JSON.parse(saved);
                this.chatMessages = messages;
                
                // Восстанавливаем сообщения в чате
                const messagesContainer = document.getElementById('chatMessages');
                messagesContainer.innerHTML = '<div class="system-message">🌟 Добро пожаловать в космический чат! Вы видите всех, другие видят только вас.</div>';
                
                messages.forEach(msg => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `message ${msg.type}`;

                    const time = new Date(msg.timestamp);
                    const timeString = time.toLocaleTimeString('ru-RU', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });

                    messageDiv.innerHTML = `
                        <div class="message-header">${msg.sender} • ${timeString}</div>
                        <div class="message-text">${this.formatMessage(msg.text)}</div>
                    `;
                    messagesContainer.appendChild(messageDiv);
                });
                
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        } catch (error) {
            console.log('Ошибка загрузки истории чата:', error);
        }
    }

    // Очистка данных (для отладки)
    clearAllData() {
        if (confirm('Очистить все данные?')) {
            localStorage.removeItem('cosmicDatingUserData');
            localStorage.removeItem('cosmicChatHistory');
            location.reload();
        }
    }
}

// Глобальные функции для вызова из HTML
function toggleEmojiPicker() {
    window.datingChat.toggleEmojiPicker();
}

function addEmoji(emoji) {
    window.datingChat.addEmoji(emoji);
}

function sendMessage() {
    window.datingChat.sendMessage();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.datingChat = new DatingChat();
    
    // Добавляем кнопку очистки для отладки (можно удалить в продакшене)
    const clearBtn = document.createElement('button');
    clearBtn.textContent = '🧹 Очистить данные';
    clearBtn.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(255,0,0,0.3);
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
        font-size: 12px;
    `;
    clearBtn.onclick = () => window.datingChat.clearAllData();
    document.body.appendChild(clearBtn);
});
