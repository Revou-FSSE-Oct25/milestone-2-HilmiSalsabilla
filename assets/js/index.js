// games config
const GAMES = {
    clicker: { name: 'Speed Clicker', key: 'clickerHighScore', unit: 'clicks', inverted: false },
    dodge: { name: 'Dodge Master', key: 'dodgeHighScore', unit: 'points', inverted: false },
    memory: { name: 'Memory Cards', key: 'memoryBestScore', unit: 'moves', inverted: true },
    guess: { name: 'Number Guessing', key: 'guessBestScore', unit: 'attempts', inverted: true },
    rps: { name: 'Rock Paper Scissors', key: 'rpsHighScore', unit: 'wins', inverted: false }
};

const STORAGE_KEYS = {
    USERS: 'revofun_users',
    CURRENT_USER_ID: 'revofun_current_user_id'
};

// domelemets
const nicknameForm = document.getElementById('nickname-form');
const nicknameInput = document.getElementById('nickname-input');
const playerInfo = document.getElementById('player-info');
const playerNameDisplay = document.getElementById('player-name');
const changeNicknameBtn = document.getElementById('change-nickname');
const leaderboardBody = document.getElementById('leaderboard-body');

let currentUser = null;

// setup event listeners
function setupEventListeners() {
    // nickname-form submission
    nicknameForm.addEventListener('submit', handleNicknameSave);
    // change nickname button
    changeNicknameBtn.addEventListener('click', handleNicknameChange);
    // update leaderboard
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            syncCurrentUserScores();
            loadLeaderboard();
        }
    });
}

// user management
// get all users from localStorage
function getAllUsers() {
    try {
        const usersJSON = localStorage.getItem(STORAGE_KEYS.USERS);
        return usersJSON ? JSON.parse(usersJSON) : [];
    } catch (error) {
        console.error('Error loading users:', error);
        return [];
    }
}

// save all users to localStorage
function saveAllUsers(users) {
    try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return true;
    } catch (error) {
        console.error('Error saving users:', error);
        return false;
    }
}

// create new user
function createUser(nickname) {
    return {
        id: generateUserId(),
        playerNickname: nickname,
        clickerHighScore: 0,
        dodgeHighScore: 0,
        memoryBestScore: null,
        guessBestScore: null,
        rpsHighScore: 0,
        createdAt: new Date().toLocaleString()
    }
}

// generate unique id
function generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36)}`;
}

// find user by id
function findUserById(userId) {
    const users = getAllUsers();
    return users.find(user => user.id === userId);
}

// find user by nickname
function findUserByNickname(nickname) {
    const users = getAllUsers();
    return users.find(user => user.playerNickname.toLowerCase() === nickname.toLowerCase());
}

// update user data
function updateUser(userId, updates) {
    const users = getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);

    if(userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        saveAllUsers(users);
        return users[userIndex];
    }
    return null;
}

// set current user
function setCurrentUser(userId) {
    try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
        currentUser = findUserById(userId);
        return true;
    } catch (error) {
        console.error('Error setting current user:', error);
        return false;
    }
}

// load current user
function loadCurrentUser() {
    try {
        const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

        if(userId) {
            currentUser = findUserById(userId);
            if(currentUser) {
                syncCurrentUserScores();
                showPlayerInfo(currentUser.playerNickname);
                return;
            }
        }

        showNicknameForm();
    } catch (error) {
        console.error('Error loading current user:', error);
        showNicknameForm();
    }
}

// sync localStorage from individuak
function syncCurrentUserScores() {
    if(!currentUser) return;

    const updates = {};
    let hasChanges = false;

    // sync every game
    Object.values(GAMES).forEach(game => {
        try {
            const scoreStr = localStorage.getItem(game.key);
            if(scoreStr !== null) {
                const score = parseInt(scoreStr);
                const currentScore = currentUser[game.key];

                // update if score is better
                if(game.inverted) {
                    // lower is better
                    if(currentScore === null || score < currentScore) {
                        updates[game.key] = score;
                        hasChanges = true;
                    }
                } else {
                    // higher is better
                    if(score > currentScore) {
                        updates[game.key] = score;
                        hasChanges = true;
                    }
                }
            }
        } catch (error) {
            console.error(`Error syncing ${game.key}:`, error);
        }
    });

    // update user if there's changes
    if(hasChanges) {
        const updatedUser = updateUser(currentUser.id, updates);
        if(updatedUser) {
            currentUser = updatedUser;
        }
    }
}

// handle nickname form submission
function handleNicknameSave(e) {
    e.preventDefault();

    const nickname = nicknameInput.value.trim();

    if(nickname.length === 0) {
        showNotification('Please enter a valid nickname!', 'error');
        return;
    }

    if(nickname.length > 20) {
        showNotification('Nickname must be 20 characters or less!', 'error');
        return;
    }

    // check if the name already exist
    const existingUser = findUserByNickname(nickname);

    if(existingUser) {
        // user exist, show them
        setCurrentUser(existingUser.id);
        showNotification(`Welcome back, ${nickname}!`, 'success');
    } else {
        // create new user
        const newUser = createUser(nickname);
        const users = getAllUsers();
        users.push(newUser);

        if(saveAllUsers(users)) {
            setCurrentUser(newUser.id);
            showNotification(`Welcome, ${nickname}!`, 'success');
        } else {
            showNotification('Failed to create account. Please try again.', 'error');
            return;
        }
    }

    showPlayerInfo(nickname);
    loadLeaderboard();
}

// chenge nickname
function handleNicknameChange() {
    if(confirm('Are you sure you want to switch user?')) {
        currentUser = null;
        try {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
        } catch (error) {
            console.error('Error removing current user:', error);
        }
        showNicknameForm();
    }
}

// show player info
function showPlayerInfo(nickname) {
    nicknameForm.classList.add('hidden');
    playerInfo.classList.remove('hidden');
    playerNameDisplay.textContent = nickname;
}

// show nickname form
function showNicknameForm() {
    playerInfo.classList.add('hidden');
    nicknameForm.classList.remove('hidden');
    nicknameInput.value = '';
    nicknameInput.focus();
}

// load and dispaly leaderboard
function loadLeaderboard() {
    const leaderboardData = collectLeaderboardData();

    if(leaderboardData.length === 0) {
        displayEmptyLeaderboard();
        return;
    }

    // sort score (descending for normal, ascending for inverted)
    leaderboardData.sort((a,b) => {
        if(a.inverted) {
            return a.score - b.score; // lower is better
        } else {
            return b.score - a.score; // higher is better
        }
    });
    // take top 10
    const topScores = leaderboardData.slice(0, 10);
    console.log('Top scores to display:', topScores); // debug log
    displayLeaderboard(topScores);
}

// collect leaderboard data from all users
function collectLeaderboardData() {
    const data = [];
    const users = getAllUsers();

    console.log('Collecting leaderboard data from users:', users); // debug log

    users.forEach(user => {
        Object.entries(GAMES).forEach(([gameId, game]) => {
            const score = user[game.key];
            
            console.log(`User: ${user.playerNickname}, Game: ${game.name}, Score: ${score}`); // debug log
            
            // only include if score is valid
            // for inverted games (memory, guess), allow null check but still need valid score
            if (score !== null && score !== undefined && score !== 0) {
                data.push({
                    player: user.playerNickname,
                    userId: user.id,
                    game: game.name,
                    score: score,
                    unit: game.unit,
                    inverted: game.inverted,
                    isCurrentUser: currentUser && user.id === currentUser.id
                });
            }
        });
    });

    console.log('Leaderboard data collected:', data); // debug log
    return data;
}

// display leaderboard in table
function displayLeaderboard(data) {
    leaderboardBody.innerHTML = '';

    data.forEach((entry, index) => {
        const row = document.createElement('tr');

        // highlight current user
        if(entry.isCurrentUser) {
            row.classList.add('current-user-row');
        }

        row.innerHTML = `
            <td><strong>#${index + 1}</strong></td>
            <td>${escapeHtml(entry.player)}${entry.isCurrentUser ? ' <span class="you-badge">YOU</span>' : ''}</td>
            <td>${escapeHtml(entry.game)}</td>
            <td><strong>${entry.score}</strong> ${entry.unit}</td>
        `;

        // hishlight top3
        if(index === 0) {
            row.style.background = 'rgba(255, 215, 0, 0.1)'; // gold
        } else if(index === 1) {
            row.style.background = 'rgba(192, 192, 192, 0.1)'; // silver
        } else if(index === 2) {
            row.style.background = 'rgba(205, 127, 50, 0.1)'; // bronze
        }

        leaderboardBody.appendChild(row);
    });
}

// empty leaderboard display
function displayEmptyLeaderboard() {
    leaderboardBody.innerHTML = `
        <tr>
            <td colspan="4" class="no-data">No scores yet. Be the first to play!</td>
        </tr>
    `;
}

// prevent xss
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// show notification
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// setup smooth scrolling for navigation
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// add animation on scroll for game cards
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // observe game cards
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        observer.observe(card);
    });
}

let mobileMenuInitialized = false;
let hamburgerButton = null;

// add mobile menu toggle functionallity
function setupMobileMenu() {
    if (mobileMenuInitialized) return;

    const navbar = document.querySelector('.navbar');
    const navMenu = document.querySelector('.nav-menu');

    if (!navbar || !navMenu) return;

    // create hamburger button for mobile
    hamburgerButton = document.createElement('button');
    hamburgerButton.className = 'hamburger';
    hamburgerButton.setAttribute('aria-label', 'Toggle navigation menu');
    hamburgerButton.setAttribute('aria-expanded', 'false');
    hamburgerButton.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    navbar.insertBefore(hamburgerButton, navMenu);

    hamburgerButton.addEventListener('click', () => {
        const isExpanded = hamburgerButton.getAttribute('aria-expanded') === 'true';
        hamburgerButton.setAttribute('aria-expanded', String(!isExpanded));
        hamburgerButton.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // close menu when clicking a link
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburgerButton.classList.remove('active');
            hamburgerButton.setAttribute('aria-expanded', 'false');
        });
    });

    mobileMenuInitialized = true;
}

// check for screen size changes
function handleResize() {
    const navMenu = document.querySelector('.nav-menu');

    if (window.innerWidth <= 768) {
        setupMobileMenu();
    } else {
        // reset mobile state when returning to desktop
        if (navMenu) {
            navMenu.classList.remove('active');
        }

        if (hamburgerButton) {
            hamburgerButton.classList.remove('active');
            hamburgerButton.setAttribute('aria-expanded', 'false');
        }
    }
}

// intialization
function init() {
    loadCurrentUser();
    setupEventListeners();
    loadLeaderboard();
    setupSmoothScrolling();
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    setupScrollAnimations();
    handleResize();
    window.addEventListener('resize', handleResize);
});