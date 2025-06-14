#!/usr/bin/env node

// Simple data generator to simulate the Go backend
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

function generateTelemetry() {
    return {
        timestamp: new Date().toISOString(),
        cpu: {
            usage_percent: Math.random() * 100,
            load_avg_1m: Math.random() * 4
        },
        memory: {
            usage_percent: Math.random() * 100
        },
        network: {
            active_connections: Math.floor(Math.random() * 100)
        }
    };
}

function generateAIDecision() {
    const categories = ['cpu', 'memory', 'network', 'storage'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    const reasonings = [
        'High CPU usage detected, optimizing process scheduling',
        'Memory pressure increasing, clearing caches',
        'Network congestion detected, adjusting buffer sizes',
        'Disk I/O bottleneck identified, optimizing access patterns'
    ];
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    
    return {
        category,
        priority,
        reasoning: reasonings[Math.floor(Math.random() * reasonings.length)],
        confidence: 0.7 + Math.random() * 0.3,
        actions: [
            { description: `Optimize ${category} parameters` },
            { description: `Monitor ${category} performance` }
        ]
    };
}

function generateConfigChange() {
    const actions = [
        'Applied CPU frequency scaling',
        'Updated memory allocation',
        'Modified network buffers',
        'Adjusted I/O scheduler'
    ];
    const targets = ['cpu', 'memory', 'network', 'storage'];
    
    return {
        action: actions[Math.floor(Math.random() * actions.length)],
        target: targets[Math.floor(Math.random() * targets.length)],
        status: 'success'
    };
}

async function sendData() {
    try {
        // Send telemetry every 2 seconds
        const telemetry = generateTelemetry();
        await axios.post(`${BASE_URL}/telemetry`, telemetry);
        console.log('📊 Sent telemetry:', telemetry.cpu.usage_percent.toFixed(1) + '% CPU');
        
        // Send AI decision every 10 seconds
        if (Math.random() < 0.2) {
            const decision = generateAIDecision();
            await axios.post(`${BASE_URL}/decisions`, decision);
            console.log('🤖 AI Decision:', decision.category, '-', decision.priority);
        }
        
        // Send config change every 15 seconds
        if (Math.random() < 0.15) {
            const config = generateConfigChange();
            await axios.post(`${BASE_URL}/configurations`, config);
            console.log('⚙️ Config Applied:', config.action);
        }
        
    } catch (error) {
        console.error('Error sending data:', error.message);
    }
}

console.log('🚀 Starting LLM Configuration Data Generator');
console.log('📡 Sending real-time data to dashboard...');

// Send data every 2 seconds
setInterval(sendData, 2000);

// Send initial data immediately
sendData();