// games config
const games = {
    clicker: { name: 'Speed Clicker', storageKey: 'clickerHighScore' },
    guess: { name: 'Number Guessing', storageKey: 'guessBestScore' },
    rps: { name: 'Rock Paper Scissors', storageKey: 'rpsHighScore' },
    memory: { name: 'Memory Cards', storageKey: 'memoryBestScore' },
    dodge: { name: 'Dodge Master', storageKey: 'dodgeHighScore' }
};

// domelemets
const nicknameForm = document.getElementById('nickname-form');
const nicknameInput = document.getElementById('nickname-input');
const playerInfo = document.getElementById('player-info');
const playerNameDisplay = document.getElementById('player-name');
const changeNicknameBtn = document.getElementById('change-nickname');
const leaderboardBody = document.getElementById('leaderboard-body');

// setup event listeners
function setupEventListeners() {
    // nickname-form submission
    nicknameForm.addEventListener('submit', handleNicknameSave);
    // change nickname button
    changeNicknameBtn.addEventListener('click', handleNicknameChange);
    // update leaderboard
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            loadLeaderboard();
        }
    });
}

// load player bickname from local storage
function loadPlayerNickname() {
    try {
        const savedNickname = localStorage.getItem('playerNickname');
        if (savedNickname) {
            showPlayerInfo(savedNickname);
        } else {
            showNicknameForm();
        }
    } catch (error) {
        console.error('Error loading nickname:', error);
        showNicknameForm();
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

    try {
        localStorage.setItem('playerNickname', nickname);
        showNotification(`Welcome, ${nickname}!`, 'success');
        showPlayerInfo(nickname);
        loadLeaderboard();
    } catch (error) {
        console.error('Error saving nickname:', error);
        showNotification('Failed to save nickname. Please try again.', 'error');
    }
}

// chenge nickname
function handleNicknameChange() {
    if(confirm('Are you sure you want to change your nickname?')) {
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

    // sort score desc
    leaderboardData.sort((a,b) => b.score - a.score);
    // take top 10
    const topScores = leaderboardData.slice(0, 10);
    displayLeaderboard(topScores);
}

function collectLeaderboardData() {
    const data = [];
    
    // helper function to safely get localStorage item
    const getScore = (key) => {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error(`Error reading ${key}:`, error);
            return null;
        }
    };
    
    // get player nickname with error handling
    let playerNickname = 'Anonymous';
    try {
        playerNickname = localStorage.getItem('playerNickname') || 'Anonymous';
    } catch (error) {
        console.error('Error reading nickname:', error);
    }

    // clicker game
    const clickerScore = getScore(games.clicker.storageKey);
    if(clickerScore) {
        data.push({
            player: playerNickname,
            game: games.clicker.name,
            score: parseInt(clickerScore),
            unit: 'clicks'
        });
    }

    // guess number agme
    const guessScore = getScore(games.guess.storageKey);
    if (guessScore) {
        data.push({
            player: playerNickname,
            game: games.guess.name,
            score: parseInt(guessScore),
            unit: 'attempts',
            inverted: true
        });
    }

    // memory cards game
    const memoryScore = getScore(games.memory.storageKey);
    if (memoryScore) {
        data.push({
            player: playerNickname,
            game: games.memory.name,
            score: parseInt(memoryScore),
            unit: 'moves',
            inverted: true
        });
    }

    // dodge game
    const dodgeScore = getScore(games.dodge.storageKey);
    if (dodgeScore) {
        data.push({
            player: playerNickname,
            game: games.dodge.name,
            score: parseInt(dodgeScore),
            unit: 'points'
        });
    }

    return data;
}

// display leaderboard in table
function displayLeaderboard(data) {
    leaderboardBody.innerHTML = '';

    data.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${index + 1}</strong></td>
            <td>${escapeHtml(entry.player)}</td>
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
    `
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
    if(existing) {
        existing.remove();
    }

    // create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('aria-live', 'polite');

    // add to page
    document.body.appendChild(notification);

    // trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // remove after 3s
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// setup smooth scrolling for navigation
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // skip if its just #
            if (href === '#') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        })
    })
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
    setupEventListeners();
    loadPlayerNickname();
    loadLeaderboard();
    setupSmoothScrolling();
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    setupScrollAnimations();
    handleResize();
    window.addEventListener('resize', handleResize);
});