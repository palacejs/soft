// Storage keys
const STORAGE_KEYS = {
    PROFILE_DATA: 'msp2_profile_data',
    TARGET_PROFILES: 'msp2_target_profiles',
    REGION: 'msp2_region'
};

// API Endpoints
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

// Game data
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

const DAILY_QUEST_TYPES = ["daily_pet_pets", "daily_spend_starcoins", "daily_spend_diamonds"];
const DAILY_GIFT_QUESTS = ["daily_open_gift_vip", "daily_open_gift_normal"];
const HALLOWEEN_REWARDS = [
    "halloween_25_beach_monster", "halloween_25_spider_minigame",
    "halloween_25_plaza_monster", "halloween_25_spider_minigame_plaza",
    "halloween_25_vip_club_monster", "halloween_25_forest_monster",
    "halloween_25_spider_minigame_forest", "halloween_25_diamond_shop_monster", 
    "halloween_25_event_chatroom_monster", "halloween_25_spider_minigame_tokio",
    
    // Forest rewards
    "forest_halloween_12", "forest_halloween_18_vip", "forest_halloween_17", 
    "forest_halloween_20", "forest_halloween_29",
    
    // Beach rewards
    "beach_halloween_11", "beach_halloween_11_vip", "beach_halloween_16", 
    "beach_halloween_22", "beach_halloween_24", "beach_halloween_27",
    
    // Plaza rewards
    "plaza_halloween_11", "plaza_halloween_15", "plaza_halloween_12_vip", 
    "plaza_halloween_16_vip", "plaza_halloween_19_vip", "plaza_halloween_13", 
    "plaza_halloween_19", "plaza_halloween_26", "plaza_halloween_30",
    
    // Event Chatroom rewards
    "event_chatroom_halloween_23", "event_chatroom_halloween_25_vip", 
    "event_chatroom_halloween_19", "event_chatroom_halloween_25", 
    "event_chatroom_halloween_14", "event_chatroom_halloween_31"
];
const DAILY_PICKUP_REWARDS = ["daily_pickup", "daily_pickup_vip"];

// Application state
let currentRegion = localStorage.getItem(STORAGE_KEYS.REGION) || 'us';
let profileData = null;
let targetProfiles = [];
let autoSendInterval = null;
let isProcessing = false;
let notificationCounter = 0;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    loadStoredData();
    setupEventListeners();
    updateUI();
});

function loadStoredData() {
    // Load profile data
    const profileData = getProfileData();
    if (profileData) {
    }
    // Load region
    currentRegion = localStorage.getItem(STORAGE_KEYS.REGION) || 'us';
    updateRegionButtons();
}

function setupEventListeners() {
    // Region selection
    document.getElementById('selectUS').addEventListener('click', () => selectRegion('us'));
    document.getElementById('selectEU').addEventListener('click', () => selectRegion('eu'));

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Daily task events
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfileData);
    document.getElementById('clearProfileBtn').addEventListener('click', clearProfileData);
    document.getElementById('startDailyTaskBtn').addEventListener('click', startDailyTasks);

    // Autograph events
    document.getElementById('addTargetBtn').addEventListener('click', addTargetProfile);
    document.getElementById('clearAllProfilesBtn').addEventListener('click', clearAllProfiles);
    document.getElementById('startAutographBtn').addEventListener('click', startAutograph);
    document.getElementById('autoSendBtn').addEventListener('click', toggleAutoSend);

    // Enter key support
    document.getElementById('targetProfileInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTargetProfile();
        }
    });
}

function selectRegion(region) {
    currentRegion = region;
    localStorage.setItem(STORAGE_KEYS.REGION, region);
    updateRegionButtons();
    showNotification(`Region changed to ${region.toUpperCase()}`, 'success');
}

function updateRegionButtons() {
    const usBtn = document.getElementById('selectUS');
    const euBtn = document.getElementById('selectEU');
    
    if (currentRegion === 'us') {
        usBtn.classList.add('active');
        euBtn.classList.remove('active');
    } else {
        euBtn.classList.add('active');
        usBtn.classList.remove('active');
    }
}

function switchTab(tabName) {
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

function parseWebSocketData(input) {
    try {
        // Remove WebSocket message prefix if present
        let cleanInput = input.trim();
        if (cleanInput.startsWith('42[')) {
            cleanInput = cleanInput.substring(2);
        }
        
        const parsed = JSON.parse(cleanInput);
        if (Array.isArray(parsed) && parsed.length > 1) {
            const data = parsed[1];
            if (data.profileId && data.accessToken) {
                return {
                    profileId: data.profileId,
                    accessToken: data.accessToken
                };
            }
        }
        return null;
    } catch (error) {
        return null;
    }
}

function saveProfileData() {
    const rawInput = document.getElementById('rawInput').value.trim();
    if (!rawInput) {
        showNotification('Please enter the WebSocket message data', 'error');
        return;
    }

    const parsed = parseWebSocketData(rawInput);
    if (!parsed) {
        showNotification('Invalid data format. Please check your input.', 'error');
        return;
    }

    profileData = parsed;
    localStorage.setItem(STORAGE_KEYS.PROFILE_DATA, JSON.stringify(profileData));
    document.getElementById('rawInput').value = '';
    updateProfileStatus();
    updateUI();
    showNotification('Profile data saved successfully!', 'success');
}

function clearProfileData() {
    profileData = null;
    document.getElementById('rawInput').value = '';
    localStorage.removeItem(STORAGE_KEYS.PROFILE_DATA);
    updateProfileStatus();
    updateUI();
    showNotification('Profile data cleared', 'info');
}

function updateProfileStatus() {
    const statusElement = document.getElementById('profileStatus');
    if (profileData) {
        statusElement.textContent = `Profile ID: ${profileData.profileId.substring(0, 8)}...`;
        statusElement.classList.remove('empty');
    } else {
        statusElement.textContent = 'No profile data saved';
        statusElement.classList.add('empty');
    }
}

function addTargetProfile() {
    const input = document.getElementById('targetProfileInput');
    const profileId = input.value.trim();
    
    if (!profileId) {
        showNotification('Please enter a target profile ID', 'error');
        return;
    }

    if (targetProfiles.includes(profileId)) {
        showNotification('Profile already exists', 'info');
        return;
    }

    targetProfiles.push(profileId);
    localStorage.setItem(STORAGE_KEYS.TARGET_PROFILES, JSON.stringify(targetProfiles));
    input.value = '';
    updateSavedProfilesList();
    updateUI();
    showNotification('Target profile added successfully', 'success');
}

function removeTargetProfile(profileId) {
    targetProfiles = targetProfiles.filter(id => id !== profileId);
    localStorage.setItem(STORAGE_KEYS.TARGET_PROFILES, JSON.stringify(targetProfiles));
    updateSavedProfilesList();
    updateUI();
    showNotification('Profile removed', 'info');
}

function clearAllProfiles() {
    targetProfiles = [];
    localStorage.removeItem(STORAGE_KEYS.TARGET_PROFILES);
    updateSavedProfilesList();
    updateUI();
    showNotification('All profiles cleared', 'info');
}

function updateSavedProfilesList() {
    const listContainer = document.getElementById('savedProfilesList');
    
    if (targetProfiles.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No saved profiles</div>';
        return;
    }

    listContainer.innerHTML = targetProfiles.map(profileId => `
        <div class="profile-item">
            <span>${profileId}</span>
            <button class="remove-btn" onclick="removeTargetProfile('${profileId}')">×</button>
        </div>
    `).join('');
}

function updateUI() {
    // Update daily task button
    const dailyBtn = document.getElementById('startDailyTaskBtn');
    dailyBtn.disabled = !profileData || isProcessing;

    // Update autograph buttons
    const startBtn = document.getElementById('startAutographBtn');
    const autoBtn = document.getElementById('autoSendBtn');
    const canUseAutograph = profileData && targetProfiles.length > 0;
    
    startBtn.disabled = !canUseAutograph;
    autoBtn.disabled = !canUseAutograph;
}

async function startDailyTasks() {
    if (!profileData || isProcessing) return;

    isProcessing = true;
    updateUI();
    
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressStatus = document.getElementById('progressStatus');
    
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    progressStatus.textContent = 'Starting daily tasks...';

    showNotification('Starting daily tasks...', 'info');

    const endpoints = API_ENDPOINTS[currentRegion];
    const headers = {
        authorization: `Bearer ${profileData.accessToken}`,
        "content-type": "application/json"
    };

    // Calculate total tasks
    const tasks = [
        ...PET_IDS,
        ...DAILY_QUEST_TYPES,
        ...DAILY_GIFT_QUESTS.flatMap(quest => Array(5).fill(quest)),
        ...HALLOWEEN_REWARDS.flatMap(reward => Array(5).fill(reward)),
        ...DAILY_PICKUP_REWARDS.flatMap(reward => Array(5).fill(reward))
    ];

    let completed = 0;
    const total = tasks.length;
    
    // Calculate delay to complete in ~30 seconds
    const totalTime = 30000; // 30 seconds
    const delayPerTask = totalTime / total;

    function updateProgress() {
        const percentage = Math.round((completed / total) * 100);
        progressBar.style.width = percentage + '%';
        progressText.textContent = percentage + '%';
    }

    try {
        // Pet interactions
        progressStatus.textContent = 'Processing pet interactions...';
        for (const petId of PET_IDS) {
            try {
                await fetch(`${endpoints.pets}/${petId}/interactions`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({ profileId: profileData.profileId, gameId: "j68d" })
                });
            } catch (error) {
                // Continue on error
            }
            completed++;
            updateProgress();
            await delay(delayPerTask);
        }

        // Complete daily quests
        progressStatus.textContent = 'Completing daily quests...';
        for (const questType of DAILY_QUEST_TYPES) {
            try {
                await fetch(`${endpoints.quests}/${profileData.profileId}/games/j68d/quests/${questType}/state`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({ state: "Complete" })
                });
            } catch (error) {
                // Continue on error
            }
            completed++;
            updateProgress();
            await delay(delayPerTask);
        }

        // Daily gift quests
        progressStatus.textContent = 'Processing gift quests...';
        for (const questId of DAILY_GIFT_QUESTS) {
            for (let i = 0; i < 5; i++) {
                try {
                    await fetch(`${endpoints.quests}/${profileData.profileId}/games/j68d/quests/${questId}/progress`, {
                        method: "PUT",
                        headers,
                        body: JSON.stringify({ progress: 1 })
                    });
                } catch (error) {
                    // Continue on error
                }
                completed++;
                updateProgress();
                await delay(delayPerTask);
            }
        }

        // Halloween rewards
        progressStatus.textContent = 'Claiming Halloween rewards...';
        for (const rewardId of HALLOWEEN_REWARDS) {
            for (let i = 0; i < 5; i++) {
                try {
                    await fetch(`${endpoints.rewards}/${profileData.profileId}/games/j68d/rewards/${rewardId}`, {
                        method: "PUT",
                        headers,
                        body: JSON.stringify({ state: "Claimed" })
                    });
                } catch (error) {
                    // Continue on error
                }
                completed++;
                updateProgress();
                await delay(delayPerTask);
            }
        }

        // Daily pickup rewards
        progressStatus.textContent = 'Claiming daily pickup rewards...';
        for (const rewardId of DAILY_PICKUP_REWARDS) {
            for (let i = 0; i < 5; i++) {
                try {
                    await fetch(`${endpoints.rewards}/${profileData.profileId}/games/j68d/rewards/${rewardId}`, {
                        method: "PUT",
                        headers,
                        body: JSON.stringify({ state: "Claimed" })
                    });
                } catch (error) {
                    // Continue on error
                }
                completed++;
                updateProgress();
                await delay(delayPerTask);
            }
        }

        progressStatus.textContent = 'All daily tasks completed!';
        showNotification('All daily tasks completed successfully!', 'success');

    } catch (error) {
        progressStatus.textContent = 'Error during execution';
        showNotification('Error during daily tasks execution', 'error');
        console.error('Daily tasks error:', error);
    } finally {
        isProcessing = false;
        updateUI();
        
        // Hide progress bar after 3 seconds
        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 3000);
    }
}

async function startAutograph() {
    if (!profileData || targetProfiles.length === 0) {
        showNotification('Please save profile data and add target profiles', 'error');
        return;
    }

    const greetingType = document.getElementById('greetingTypeSelector').value;
    showNotification(`Sending ${greetingType} to ${targetProfiles.length} profiles...`, 'info');
    
    let successCount = 0;

    for (const targetId of targetProfiles) {
        const success = await sendGreeting(targetId, greetingType);
        if (success) successCount++;
        
        const statusMessage = `[${new Date().toLocaleTimeString()}] ${greetingType} to ${targetId}: ${success ? 'Success' : 'Failed'}`;
        updateAutographStatus(statusMessage);
        
        await delay(500);
    }

    showNotification(`${greetingType} sending completed! (${successCount}/${targetProfiles.length})`, 'success');
}

function toggleAutoSend() {
    if (autoSendInterval) {
        stopAutoSend();
    } else {
        startAutoSend();
    }
}

function startAutoSend() {
    if (!profileData || targetProfiles.length === 0) {
        showNotification('Please save profile data and add target profiles', 'error');
        return;
    }

    const autoBtn = document.getElementById('autoSendBtn');
    autoBtn.classList.add('active');
    autoBtn.innerHTML = '<span class="icon">⏹️</span>Stop Auto';

    updateAutographStatus('Auto Send started - sending every 2 minutes');
    showNotification('Auto Send started', 'success');

    // Send immediately first
    startAutograph();

    // Then set interval for every 2 minutes
    autoSendInterval = setInterval(() => {
        startAutograph();
    }, 2 * 60 * 1000);
}

function stopAutoSend() {
    if (autoSendInterval) {
        clearInterval(autoSendInterval);
        autoSendInterval = null;
    }

    const autoBtn = document.getElementById('autoSendBtn');
    autoBtn.classList.remove('active');
    autoBtn.innerHTML = '<span class="icon">🔄</span>Auto Send';

    updateAutographStatus('Auto Send stopped');
    showNotification('Auto Send stopped', 'info');
}

async function sendGreeting(targetProfileId, greetingType) {
    if (!profileData) return false;

    const endpoints = API_ENDPOINTS[currentRegion];
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
                "Authorization": `Bearer ${profileData.accessToken}`
            },
            body: JSON.stringify(payload)
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

function updateAutographStatus(message) {
    const statusDiv = document.getElementById('autographStatus');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    statusDiv.appendChild(messageDiv);
    
    // Keep only last 10 messages
    while (statusDiv.children.length > 10) {
        statusDiv.removeChild(statusDiv.firstChild);
    }
    
    statusDiv.scrollTop = statusDiv.scrollHeight;
}

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
        }, 400);
    }, 3000);
}

// Make functions globally accessible
window.removeTargetProfile = removeTargetProfile;
