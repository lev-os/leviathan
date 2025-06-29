// Leviathan Desktop - Frontend Application
const { invoke } = window.__TAURI__.tauri;
const { listen } = window.__TAURI__.event;

let systemStatus = null;

// DOM Elements
const loadingEl = document.getElementById('loading');
const contentEl = document.getElementById('content');
const overallStatusEl = document.getElementById('overall-status');
const overallHealthEl = document.getElementById('overall-health');
const servicesEl = document.getElementById('services');
const lastUpdatedEl = document.getElementById('last-updated');

// Initialize the application
async function init() {
    console.log('🧠 Leviathan Desktop starting...');
    
    try {
        // Load initial status
        await refreshStatus();
        
        // Listen for real-time status updates
        await listen('status-update', (event) => {
            console.log('📊 Status update received:', event.payload);
            updateUI(event.payload);
        });
        
        // Set up periodic refresh as backup
        setInterval(refreshStatus, 30000); // 30 seconds
        
        // Show content, hide loading
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
        
        console.log('✅ Leviathan Desktop initialized');
        
    } catch (error) {
        console.error('❌ Failed to initialize:', error);
        showError(error.message);
    }
}

// Refresh system status
async function refreshStatus() {
    try {
        console.log('🔄 Refreshing system status...');
        const status = await invoke('get_system_status');
        updateUI(status);
    } catch (error) {
        console.error('❌ Failed to refresh status:', error);
        showError(error.message);
    }
}

// Update the UI with system status
function updateUI(status) {
    systemStatus = status;
    
    // Update overall health
    updateOverallHealth(status.overall_health);
    
    // Update services
    updateServices(status.services);
    
    // Update timestamp
    const timestamp = new Date(status.timestamp).toLocaleTimeString();
    lastUpdatedEl.textContent = `Last updated: ${timestamp}`;
}

// Update overall health indicator
function updateOverallHealth(health) {
    overallHealthEl.textContent = `System Status: ${health}`;
    
    // Remove existing status classes
    overallStatusEl.classList.remove('status-healthy', 'status-degraded', 'status-unhealthy');
    
    // Add appropriate status class
    switch (health) {
        case 'Healthy':
            overallStatusEl.classList.add('status-healthy');
            break;
        case 'Degraded':
            overallStatusEl.classList.add('status-degraded');
            break;
        case 'Unhealthy':
            overallStatusEl.classList.add('status-unhealthy');
            break;
    }
}

// Update services display
function updateServices(services) {
    servicesEl.innerHTML = '';
    
    services.forEach(service => {
        const serviceCard = createServiceCard(service);
        servicesEl.appendChild(serviceCard);
    });
}

// Create a service card element
function createServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card';
    
    const displayName = getServiceDisplayName(service.name);
    const statusIcon = getServiceStatusIcon(service.status);
    
    let detailsText = `PID: ${service.pid || 'N/A'}`;
    if (service.uptime) {
        detailsText += ` • Uptime: ${formatUptime(service.uptime)}`;
    }
    
    card.innerHTML = `
        <div class="service-header">
            <div class="service-name">${statusIcon} ${displayName}</div>
            <div class="service-status status-${service.status.toLowerCase()}">${service.status}</div>
        </div>
        <div class="service-details">${detailsText}</div>
        <div class="service-actions">
            <button class="btn btn-primary" onclick="startService('${service.name}')" 
                    ${service.status === 'Running' ? 'disabled' : ''}>
                Start
            </button>
            <button class="btn btn-secondary" onclick="restartService('${service.name}')"
                    ${service.status === 'Stopped' ? 'disabled' : ''}>
                Restart
            </button>
            <button class="btn btn-danger" onclick="stopService('${service.name}')"
                    ${service.status === 'Stopped' ? 'disabled' : ''}>
                Stop
            </button>
        </div>
    `;
    
    return card;
}

// Service control functions
async function startService(serviceName) {
    try {
        console.log(`▶️ Starting service: ${serviceName}`);
        await invoke('start_service', { serviceName });
        await refreshStatus();
        showNotification(`Service ${serviceName} started`, 'success');
    } catch (error) {
        console.error(`❌ Failed to start ${serviceName}:`, error);
        showNotification(`Failed to start ${serviceName}: ${error}`, 'error');
    }
}

async function stopService(serviceName) {
    try {
        console.log(`⏹️ Stopping service: ${serviceName}`);
        await invoke('stop_service', { serviceName });
        await refreshStatus();
        showNotification(`Service ${serviceName} stopped`, 'success');
    } catch (error) {
        console.error(`❌ Failed to stop ${serviceName}:`, error);
        showNotification(`Failed to stop ${serviceName}: ${error}`, 'error');
    }
}

async function restartService(serviceName) {
    try {
        console.log(`🔄 Restarting service: ${serviceName}`);
        await invoke('restart_service', { serviceName });
        await refreshStatus();
        showNotification(`Service ${serviceName} restarted`, 'success');
    } catch (error) {
        console.error(`❌ Failed to restart ${serviceName}:`, error);
        showNotification(`Failed to restart ${serviceName}: ${error}`, 'error');
    }
}

// Bulk service operations
async function startAllServices() {
    try {
        console.log('▶️ Starting all services...');
        
        for (const service of systemStatus.services) {
            if (service.status !== 'Running') {
                await startService(service.name);
                // Small delay between starts
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        showNotification('All services started', 'success');
    } catch (error) {
        console.error('❌ Failed to start all services:', error);
        showNotification(`Failed to start all services: ${error}`, 'error');
    }
}

async function stopAllServices() {
    try {
        console.log('⏹️ Stopping all services...');
        
        for (const service of systemStatus.services) {
            if (service.status !== 'Stopped') {
                await stopService(service.name);
            }
        }
        
        showNotification('All services stopped', 'success');
    } catch (error) {
        console.error('❌ Failed to stop all services:', error);
        showNotification(`Failed to stop all services: ${error}`, 'error');
    }
}

async function restartAllServices() {
    try {
        console.log('🔄 Restarting all services...');
        
        for (const service of systemStatus.services) {
            await restartService(service.name);
            // Small delay between restarts
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        showNotification('All services restarted', 'success');
    } catch (error) {
        console.error('❌ Failed to restart all services:', error);
        showNotification(`Failed to restart all services: ${error}`, 'error');
    }
}

// Utility functions
function getServiceDisplayName(serviceName) {
    const names = {
        'neo4j': 'Neo4j Database',
        'graphiti': 'Graphiti Memory',
        'agent': 'Agent System',
    };
    return names[serviceName] || serviceName;
}

function getServiceStatusIcon(status) {
    const icons = {
        'Running': '🟢',
        'Starting': '🟡',
        'Stopped': '⚫',
        'Failed': '🔴',
        'Unhealthy': '🟠',
        'Restarting': '🔄',
    };
    return icons[status] || '⚪';
}

function formatUptime(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    } else if (seconds < 3600) {
        return `${Math.floor(seconds / 60)}m`;
    } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    } else {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        return `${days}d ${hours}h`;
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = '#10b981';
            break;
        case 'error':
            notification.style.background = '#dc2626';
            break;
        default:
            notification.style.background = '#6b7280';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function showError(message) {
    loadingEl.innerHTML = `
        <div style="color: #dc2626;">
            ❌ Error: ${message}
        </div>
        <button class="btn btn-primary" onclick="init()" style="margin-top: 16px;">
            Retry
        </button>
    `;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);