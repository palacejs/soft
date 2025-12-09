// Minimal JavaScript for maintenance page
document.addEventListener('DOMContentLoaded', function() {
    console.log('MSP2 Tool - Maintenance Mode Active');
    
    // Add a subtle entrance animation delay for cards
    const cards = document.querySelectorAll('.announcement-card, .maintenance-card, .temporary-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 + (index * 150));
    });

    // Add floating animation to maintenance icon
    const maintenanceIcon = document.querySelector('.maintenance-icon');
    if (maintenanceIcon) {
        let direction = 1;
        setInterval(() => {
            const currentTransform = maintenanceIcon.style.transform || '';
            const rotateMatch = currentTransform.match(/rotate\([^)]*\)/);
            const rotateValue = rotateMatch ? rotateMatch[0] : 'rotate(0deg)';
            
            direction = direction === 1 ? -1 : 1;
            maintenanceIcon.style.transform = `${rotateValue} translateY(${direction * 5}px)`;
        }, 2000);
    }

    // Dynamic status updates
    const statusTexts = [
        'Update in Progress...',
        'Adding New Features...',
        'System is Being Optimized...',
        'Applying Security Updates...'
    ];
    
    const statusIndicator = document.querySelector('.status-indicator span');
    let currentIndex = 0;
    
    if (statusIndicator) {
        setInterval(() => {
            statusIndicator.style.opacity = '0';
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % statusTexts.length;
                statusIndicator.textContent = statusTexts[currentIndex];
                statusIndicator.style.opacity = '1';
            }, 300);
        }, 15000);
    }
});

// Prevent any form submissions or interactions
document.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Site maintenance mode - All functions disabled');
});

document.addEventListener('click', function(e) {
    // Allow normal click behaviors for the maintenance page
    if (e.target.tagName === 'A' && e.target.href) {
        // Only prevent links that aren't external
        if (!e.target.href.startsWith('http')) {
            e.preventDefault();
            console.log('Site maintenance mode - Navigation disabled');
        }
    }
});

// Add some visual feedback for interactive elements
document.addEventListener('mouseover', function(e) {
    if (e.target.classList.contains('announcement-card') || 
        e.target.classList.contains('maintenance-card') || 
        e.target.classList.contains('temporary-card')) {
        e.target.style.transform = 'translateY(-8px)';
    }
});

document.addEventListener('mouseout', function(e) {
    if (e.target.classList.contains('announcement-card') || 
        e.target.classList.contains('maintenance-card') || 
        e.target.classList.contains('temporary-card')) {
        e.target.style.transform = 'translateY(-5px)';
    }
});
