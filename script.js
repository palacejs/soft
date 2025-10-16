// Storage keys
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'msp2_access_token',
    PROFILE_ID: 'msp2_profile_id',
    TARGET_PROFILES: 'msp2_target_profiles',
    TOKEN_TIMESTAMP: 'msp2_token_timestamp',
    REGION: 'msp2_region'
};

// API Endpoints (US region by default)
const API_ENDPOINTS = {
    us: {
        federationgateway: 'https://us.mspapis.com/federationgateway/graphql',
        pets: 'https://us.mspapis.com/pets/v1/pets',
        quests: 'https://us.mspapis.com/quests/v2/profiles',
        rewards: 'https://us.mspapis.com/timelimitedrewards/v2/profiles'
    },
    eu: {
        federationgateway: 'https://eu.mspapis.com/federationgateway/graphql',
        pets: 'https://eu.mspapis.com/pets/v1/pets',
        quests: 'https://eu.mspapis.com/quests/v2/profiles',
        rewards: 'https://eu.mspapis.com/timelimitedrewards/v2/profiles'
    }
};

// Quest and reward IDs
const DAILY_QUEST_TYPES = ["daily_pet_pets", "daily_spend_starcoins", "daily_spend_diamonds"];
const DAILY_GIFT_QUESTS = ["daily_open_gift_vip", "daily_open_gift_normal"];
const PET_IDS = [
    "c55e18991cf44659a99e6347de2fc96f", "cf0589ffe9ed45369d70dcaaa9aa1db2",
    "6ca07ffa53e3468598e6f2a2e0d20ded", "d92645e7672142028f2731aeda6e8e6f",
    "055ec44d4489440e95ae07134b3b9b3e", "cf42a511688e49f795e387d43a78c758",
    "7e4f2d790d5c4b3e808f3737b30f6458", "39e585c334834622ab69fa636068d278",
    "d7e9cc6e6fbc458892ebb18c40bb9e16", "3924865e60fe426eb2862fd9a7a813b5",
    "c23f841894b743b980bab249bdb03c6b", "2c4fbcfc98994230a8ecc21ede5a8b48",
    "d5b3566099754b959569867aaaf1b6cc", "dcc72723df1c46d091091171ef8cdcd0",
    "3e6c2f6a552d40ea9bf53a088ff695ac", "1584eb7461b440fd8e916b935d0d8a2d",
    "8bf2ead043394fc6b14712af4dfab8f2", "1cfadcd775c44bd6b1e3397a4d54b776",
    "b0c79f7eb4d8400c85b273bc5e8bc75b", "bfbd5ba804e44566b68b0b5cb3bb01d0"
];

const HALLOWEEN_REWARDS = [
    "halloween_25_beach_monster", "halloween_25_event_chatroom_monster", "halloween_25_spider_minigame",
    "halloween_25_plaza_monster", "halloween_25_spider_minigame_plaza",
    "halloween_25_vip_club_monster", "halloween_25_forest_monster",
    "halloween_25_spider_minigame_forest", "halloween_25_diamond_shop_monster", 
    "halloween_25_event_chatroom_monster", "halloween_25_spider_minigame_tokio",
    "forest_halloween_12", "forest_halloween_18_vip", "forest_halloween_17", "forest_halloween_20", "forest_halloween_29",
    "beach_halloween_11", "beach_halloween_11_vip", "beach_halloween_16", "beach_halloween_22", 
    "beach_halloween_24", "beach_halloween_27",
    "plaza_halloween_11", "plaza_halloween_15", "plaza_halloween_12_vip", "plaza_halloween_16_vip", 
    "plaza_halloween_19_vip", "plaza_halloween_13", "plaza_halloween_19", "plaza_halloween_26", "plaza_halloween_30",
    "event_chatroom_halloween_23", "event_chatroom_halloween_25_vip", "event_chatroom_halloween_19", 
    "event_chatroom_halloween_25", "event_chatroom_halloween_14", "event_chatroom_halloween_31"
];

const DAILY_PICKUP_REWARDS = ["daily_pickup", "daily_pickup_vip"];

// Application state
let autoSendInterval = null;
let currentTab = 'dailyTask';
let isProcessingDailyTasks = false;
let selectedRegion = localStorage.getItem(STORAGE_KEYS.REGION) || 'us';

// Get current API endpoints based on selected region
function getCurrentEndpoints() {
    return API_ENDPOINTS[selectedRegion];
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadStoredData();
    setupEventListeners();
    switchTab('dailyTask');
    checkTokenExpiry();
    updateRegionButtons();
});

function loadStoredData() {
    // Load access token
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const tokenTimestamp = localStorage.getItem(STORAGE_KEYS.TOKEN_TIMESTAMP);
    
    if (accessToken) {
        document.getElementById('accessTokenInput').value = accessToken;
        updateTokenStatus('Saved');
        updateDailyTaskButton();
    }

    // Load profile ID
    const profileId = localStorage.getItem(STORAGE_KEYS.PROFILE_ID);
    if (profileId) {
        document.getElementById('profileIdInput').value = profileId;
        updateProfileStatus('Saved');
        updateDailyTaskButton();
    }

    // Load target profiles
    const targetProfiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.TARGET_PROFILES) || '[]');
    updateSavedProfilesList(targetProfiles);
    updateAutographButtons();

    // Load region
    selectedRegion = localStorage.getItem(STORAGE_KEYS.REGION) || 'us';
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Region selection
    document.getElementById('selectUS').addEventListener('click', () => selectRegion('us'));
    document.getElementById('selectEU').addEventListener('click', () => selectRegion('eu'));

    // Daily Task tab events
    document.getElementById('saveTokenBtn').addEventListener('click', saveAccessToken);
    document.getElementById('clearTokenBtn').addEventListener('click', clearAccessToken);
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfileId);
    document.getElementById('clearProfileBtn').addEventListener('click', clearProfileId);
    document.getElementById('startDailyTaskBtn').addEventListener('click', startDailyTasks);

    // Autograph tab events
    document.getElementById('saveTargetBtn').addEventListener('click', saveTargetProfile);
    document.getElementById('clearAllProfilesBtn').addEventListener('click', clearAllProfiles);
    document.getElementById('startAutographBtn').addEventListener('click', startAutograph);
    document.getElementById('autoSendBtn').addEventListener('click', toggleAutoSend);
}

function selectRegion(region) {
    selectedRegion = region;
    localStorage.setItem(STORAGE_KEYS.REGION, region);
    updateRegionButtons();
    showNotification(`Region changed to ${region.toUpperCase()}`, 'success');
}

function updateRegionButtons() {
    const usBtn = document.getElementById('selectUS');
    const euBtn = document.getElementById('selectEU');
    
    if (selectedRegion === 'us') {
        usBtn.classList.add('active');
        euBtn.classList.remove('active');
    } else {
        euBtn.classList.add('active');
        usBtn.classList.remove('active');
    }
}

function switchTab(tabName) {
    currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');
}

// Daily Task Functions
function saveAccessToken() {
    const token = document.getElementById('accessTokenInput').value.trim();
    if (!token) {
        showNotification('Please enter an access token', 'error');
        return;
    }

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.TOKEN_TIMESTAMP, Date.now().toString());
    
    updateTokenStatus('Saved');
    updateDailyTaskButton();
    showNotification('Access token saved successfully', 'success');

    // Set timeout to clear token after 3.5 hours
    setTimeout(() => {
        clearAccessToken();
        showNotification('Access token expired and cleared', 'info');
    }, 3.5 * 60 * 60 * 1000);
}

function clearAccessToken() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_TIMESTAMP);
    document.getElementById('accessTokenInput').value = '';
    updateTokenStatus('');
    updateDailyTaskButton();
    showNotification('Access token cleared', 'info');
}

function saveProfileId() {
    const profileId = document.getElementById('profileIdInput').value.trim();
    if (!profileId) {
        showNotification('Please enter a profile ID', 'error');
        return;
    }

    localStorage.setItem(STORAGE_KEYS.PROFILE_ID, profileId);
    updateProfileStatus('Saved');
    updateDailyTaskButton();
    showNotification('Profile ID saved successfully', 'success');
}

function clearProfileId() {
    localStorage.removeItem(STORAGE_KEYS.PROFILE_ID);
    document.getElementById('profileIdInput').value = '';
    updateProfileStatus('');
    updateDailyTaskButton();
    showNotification('Profile ID cleared', 'info');
}

function updateTokenStatus(status) {
    const statusElement = document.getElementById('tokenStatus');
    if (status) {
        statusElement.textContent = status;
        statusElement.classList.remove('empty');
    } else {
        statusElement.textContent = 'No token saved';
        statusElement.classList.add('empty');
    }
}

function updateProfileStatus(status) {
    const statusElement = document.getElementById('profileStatus');
    if (status) {
        statusElement.textContent = status;
        statusElement.classList.remove('empty');
    } else {
        statusElement.textContent = 'No profile saved';
        statusElement.classList.add('empty');
    }
}

function updateDailyTaskButton() {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const profileId = localStorage.getItem(STORAGE_KEYS.PROFILE_ID);
    const startBtn = document.getElementById('startDailyTaskBtn');
    
    if (token && profileId && !isProcessingDailyTasks) {
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    }
}

function checkTokenExpiry() {
    const tokenTimestamp = localStorage.getItem(STORAGE_KEYS.TOKEN_TIMESTAMP);
    if (tokenTimestamp) {
        const elapsed = Date.now() - parseInt(tokenTimestamp);
        const remainingTime = (3.5 * 60 * 60 * 1000) - elapsed;
        
        if (remainingTime <= 0) {
            clearAccessToken();
        } else {
            setTimeout(() => {
                clearAccessToken();
                showNotification('Access token expired and cleared', 'info');
            }, remainingTime);
        }
    }
}

async function startDailyTasks() {
    if (isProcessingDailyTasks) return;

    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const profileId = localStorage.getItem(STORAGE_KEYS.PROFILE_ID);

    if (!token || !profileId) {
        showNotification('Please save both access token and profile ID first', 'error');
        return;
    }

    isProcessingDailyTasks = true;
    updateDailyTaskButton();
    
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';

    showNotification('Starting daily tasks...', 'info');

    const bearerToken = `Bearer ${token}`;
    const endpoints = getCurrentEndpoints();
    const headers = {
        authorization: bearerToken,
        "content-type": "application/json"
    };

    let completed = 0;
    let total = PET_IDS.length + DAILY_QUEST_TYPES.length + DAILY_GIFT_QUESTS.length * 5 + 
                HALLOWEEN_REWARDS.length * 5 + DAILY_PICKUP_REWARDS.length * 5;

    function updateProgress() {
        const percentage = Math.round((completed / total) * 100);
        progressBar.style.width = percentage + '%';
        progressText.textContent = percentage + '%';
    }

    try {
        // Pet interactions
        showNotification('Processing pet interactions...', 'info');
        for (const petId of PET_IDS) {
            try {
                await fetch(`${endpoints.pets}/${petId}/interactions`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({ profileId, gameId: "j68d" })
                });
                completed++;
                updateProgress();
                await delay(1000); // 1 second delay
            } catch (error) {
                completed++;
                updateProgress();
            }
        }

        // Complete daily quests
        showNotification('Completing daily quests...', 'info');
        for (const questType of DAILY_QUEST_TYPES) {
            try {
                await fetch(`${endpoints.quests}/${profileId}/games/j68d/quests/${questType}/state`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({ state: "Complete" })
                });
                completed++;
                updateProgress();
                await delay(1000);
            } catch (error) {
                completed++;
                updateProgress();
            }
        }

        // Daily gift quests
        showNotification('Processing gift quests...', 'info');
        for (const questId of DAILY_GIFT_QUESTS) {
            for (let i = 0; i < 5; i++) {
                try {
                    await fetch(`${endpoints.quests}/${profileId}/games/j68d/quests/${questId}/progress`, {
                        method: "PUT",
                        headers,
                        body: JSON.stringify({ progress: 1 })
                    });
                    completed++;
                    updateProgress();
                    await delay(1000);
                } catch (error) {
                    completed++;
                    updateProgress();
                }
            }
        }

        // Halloween rewards
        showNotification('Claiming Halloween rewards...', 'info');
        const payload = { state: "Claimed" };
        for (const rewardId of HALLOWEEN_REWARDS) {
            for (let i = 0; i < 5; i++) {
                try {
                    await fetch(`${endpoints.rewards}/${profileId}/games/j68d/rewards/${rewardId}`, {
                        method: "PUT",
                        headers,
                        body: JSON.stringify(payload)
                    });
                    completed++;
                    updateProgress();
                    await delay(1000);
                } catch (error) {
                    completed++;
                    updateProgress();
                }
            }
        }

        // Daily pickup rewards
        showNotification('Claiming daily pickup rewards...', 'info');
        for (const rewardId of DAILY_PICKUP_REWARDS) {
            for (let i = 0; i < 5; i++) {
                try {
                    await fetch(`${endpoints.rewards}/${profileId}/games/j68d/rewards/${rewardId}`, {
                        method: "PUT",
                        headers,
                        body: JSON.stringify(payload)
                    });
                    completed++;
                    updateProgress();
                    await delay(1000);
                } catch (error) {
                    completed++;
                    updateProgress();
                }
            }
        }

        showNotification('All daily tasks completed successfully!', 'success');
        
    } catch (error) {
        showNotification('Error during daily tasks execution', 'error');
        console.error('Daily tasks error:', error);
    } finally {
        isProcessingDailyTasks = false;
        updateDailyTaskButton();
        
        // Hide progress bar after 3 seconds
        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 3000);
    }
}

// Autograph Functions
function saveTargetProfile() {
    const profileId = document.getElementById('targetProfileInput').value.trim();
    if (!profileId) {
        showNotification('Please enter a target profile ID', 'error');
        return;
    }

    const targetProfiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.TARGET_PROFILES) || '[]');
    
    if (!targetProfiles.includes(profileId)) {
        targetProfiles.push(profileId);
        localStorage.setItem(STORAGE_KEYS.TARGET_PROFILES, JSON.stringify(targetProfiles));
        updateSavedProfilesList(targetProfiles);
        updateAutographButtons();
        showNotification('Target profile saved successfully', 'success');
    } else {
        showNotification('Profile ID already exists', 'info');
    }
    
    document.getElementById('targetProfileInput').value = '';
}

function clearAllProfiles() {
    localStorage.removeItem(STORAGE_KEYS.TARGET_PROFILES);
    updateSavedProfilesList([]);
    updateAutographButtons();
    showNotification('All target profiles cleared', 'info');
}

function removeProfile(profileId) {
    const targetProfiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.TARGET_PROFILES) || '[]');
    const updatedProfiles = targetProfiles.filter(id => id !== profileId);
    localStorage.setItem(STORAGE_KEYS.TARGET_PROFILES, JSON.stringify(updatedProfiles));
    updateSavedProfilesList(updatedProfiles);
    updateAutographButtons();
    showNotification('Profile removed', 'info');
}

function updateSavedProfilesList(profiles) {
    const listContainer = document.getElementById('savedProfilesList');
    
    if (profiles.length === 0) {
        listContainer.innerHTML = '<div style="color: #999; font-size: 11px; padding: 8px; text-align: center;">No saved profiles</div>';
        return;
    }

    listContainer.innerHTML = profiles.map(profileId => `
        <div class="profile-item">
            <span>${profileId}</span>
            <button class="remove-btn" onclick="removeProfile('${profileId}')">×</button>
        </div>
    `).join('');
}

function updateAutographButtons() {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const targetProfiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.TARGET_PROFILES) || '[]');
    
    const startBtn = document.getElementById('startAutographBtn');
    const autoBtn = document.getElementById('autoSendBtn');
    
    if (token && targetProfiles.length > 0) {
        startBtn.disabled = false;
        autoBtn.disabled = false;
    } else {
        startBtn.disabled = true;
        autoBtn.disabled = true;
    }
}

async function startAutograph() {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const targetProfiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.TARGET_PROFILES) || '[]');
    const greetingType = document.getElementById('greetingTypeSelector').value;

    if (!token || targetProfiles.length === 0) {
        showNotification('Please save access token and target profiles first', 'error');
        return;
    }

    showNotification(`Sending ${greetingType} to ${targetProfiles.length} profiles...`, 'info');
    
    const bearerToken = `Bearer ${token}`;
    const endpoints = getCurrentEndpoints();
    let successCount = 0;

    for (const targetProfileId of targetProfiles) {
        const success = await sendGreeting(bearerToken, targetProfileId, greetingType, endpoints);
        if (success) successCount++;
        await delay(500); // 500ms delay between sends
    }

    updateAutographStatus(`Sent ${greetingType} to ${successCount}/${targetProfiles.length} profiles`);
    showNotification(`${greetingType} sending completed! (${successCount}/${targetProfiles.length})`, 'success');
}

function toggleAutoSend() {
    if (autoSendInterval) {
        stopAutoSend();
    } else {
        startAutoSend();
    }
}

async function startAutoSend() {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const targetProfiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.TARGET_PROFILES) || '[]');

    if (!token || targetProfiles.length === 0) {
        showNotification('Please save access token and target profiles first', 'error');
        return;
    }

    const autoBtn = document.getElementById('autoSendBtn');
    autoBtn.textContent = 'Stop Auto';
    autoBtn.classList.add('active');

    updateAutographStatus('Auto Send started - sending every 2 minutes');
    showNotification('Auto Send started', 'success');

    // Send immediately first
    await performAutoSend();

    // Then set interval for every 2 minutes
    autoSendInterval = setInterval(performAutoSend, 2 * 60 * 1000);
}

function stopAutoSend() {
    if (autoSendInterval) {
        clearInterval(autoSendInterval);
        autoSendInterval = null;
    }

    const autoBtn = document.getElementById('autoSendBtn');
    autoBtn.textContent = 'Auto Send';
    autoBtn.classList.remove('active');

    updateAutographStatus('Auto Send stopped');
    showNotification('Auto Send stopped', 'info');
}

async function performAutoSend() {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const targetProfiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.TARGET_PROFILES) || '[]');
    const greetingType = document.getElementById('greetingTypeSelector').value;

    if (!token || targetProfiles.length === 0) {
        stopAutoSend();
        return;
    }

    const bearerToken = `Bearer ${token}`;
    const endpoints = getCurrentEndpoints();
    let successCount = 0;

    for (const targetProfileId of targetProfiles) {
        const success = await sendGreeting(bearerToken, targetProfileId, greetingType, endpoints);
        if (success) successCount++;
        await delay(500);
    }

    updateAutographStatus(`Auto Send: ${greetingType} sent to ${successCount}/${targetProfiles.length} profiles - Next in 2 minutes`);
}

async function sendGreeting(bearerToken, targetProfileId, greetingType, endpoints) {
    const payload = {
        id: "SendGreetings-159BDD7706D824BB8F14874A7FAE3368",
        variables: {
            greetingType,
            receiverProfileId: targetProfileId,
            ignoreDailyCap: false
        }
    };

    try {
        const response = await fetch(endpoints.federationgateway, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": bearerToken
            },
            body: JSON.stringify(payload)
        });

        return response.ok;
    } catch (error) {
        console.error('Error sending greeting:', error);
        return false;
    }
}

function updateAutographStatus(message) {
    const statusDiv = document.getElementById('autographStatus');
    const timestamp = new Date().toLocaleTimeString();
    statusDiv.innerHTML += `<div>[${timestamp}] ${message}</div>`;
    statusDiv.scrollTop = statusDiv.scrollHeight;
}

// Utility Functions
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Make removeProfile globally accessible
window.removeProfile = removeProfile;
