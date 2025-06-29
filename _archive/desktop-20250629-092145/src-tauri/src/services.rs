use std::collections::HashMap;
use std::process::{Child, Command, Stdio};
use std::time::{Duration, Instant};
use serde::{Deserialize, Serialize};
use tokio::time::sleep;
use tracing::{info, warn, error};
use crate::{ServiceStatus, SystemStatus};

#[derive(Debug, Clone)]
pub struct ServiceConfig {
    pub name: String,
    pub command: Vec<String>,
    pub working_dir: Option<String>,
    pub env_vars: HashMap<String, String>,
    pub health_check_url: Option<String>,
    pub auto_start: bool,
    pub restart_delay: Duration,
    pub max_restarts: u32,
}

#[derive(Debug)]
pub struct ServiceHandle {
    pub config: ServiceConfig,
    pub process: Option<Child>,
    pub state: ServiceState,
    pub start_time: Option<Instant>,
    pub restart_count: u32,
    pub last_health_check: Option<Instant>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum ServiceState {
    Stopped,
    Starting,
    Running,
    Unhealthy,
    Failed,
    Restarting,
}

impl ServiceState {
    pub fn as_str(&self) -> &'static str {
        match self {
            ServiceState::Stopped => "Stopped",
            ServiceState::Starting => "Starting",
            ServiceState::Running => "Running",
            ServiceState::Unhealthy => "Unhealthy",
            ServiceState::Failed => "Failed",
            ServiceState::Restarting => "Restarting",
        }
    }
}

pub struct ServiceManager {
    services: HashMap<String, ServiceHandle>,
}

impl ServiceManager {
    pub fn new() -> Self {
        Self {
            services: HashMap::new(),
        }
    }
    
    pub async fn initialize_services(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("Initializing Leviathan services...");
        
        // Define core services
        let services = vec![
            ServiceConfig {
                name: "neo4j".to_string(),
                command: vec!["echo".to_string(), "Neo4j service placeholder".to_string()],
                working_dir: None,
                env_vars: HashMap::new(),
                health_check_url: Some("http://localhost:7474/db/system/tx/commit".to_string()),
                auto_start: true,
                restart_delay: Duration::from_secs(5),
                max_restarts: 3,
            },
            ServiceConfig {
                name: "graphiti".to_string(),
                command: vec![
                    "python".to_string(),
                    "../memory/graphiti-service/src/memory_service.py".to_string()
                ],
                working_dir: Some("../packages/memory".to_string()),
                env_vars: HashMap::new(),
                health_check_url: None, // gRPC health check
                auto_start: true,
                restart_delay: Duration::from_secs(3),
                max_restarts: 5,
            },
            ServiceConfig {
                name: "agent".to_string(),
                command: vec!["node".to_string(), "src/index.js".to_string()],
                working_dir: Some("../../agent".to_string()),
                env_vars: HashMap::new(),
                health_check_url: Some("http://localhost:3333/health".to_string()),
                auto_start: true,
                restart_delay: Duration::from_secs(2),
                max_restarts: 5,
            },
        ];
        
        // Initialize service handles
        for config in services {
            let handle = ServiceHandle {
                config: config.clone(),
                process: None,
                state: ServiceState::Stopped,
                start_time: None,
                restart_count: 0,
                last_health_check: None,
            };
            
            self.services.insert(config.name.clone(), handle);
        }
        
        // Auto-start services
        for (name, handle) in &self.services {
            if handle.config.auto_start {
                info!("Auto-starting service: {}", name);
                if let Err(e) = self.start_service(name).await {
                    warn!("Failed to auto-start service {}: {}", name, e);
                }
            }
        }
        
        Ok(())
    }
    
    pub async fn start_service(&mut self, name: &str) -> Result<(), Box<dyn std::error::Error>> {
        let handle = self.services.get_mut(name)
            .ok_or_else(|| format!("Service not found: {}", name))?;
            
        if matches!(handle.state, ServiceState::Running) {
            return Ok(());
        }
        
        info!("Starting service: {}", name);
        handle.state = ServiceState::Starting;
        
        // Build command
        let mut cmd = Command::new(&handle.config.command[0]);
        
        if handle.config.command.len() > 1 {
            cmd.args(&handle.config.command[1..]);
        }
        
        // Set working directory
        if let Some(ref working_dir) = handle.config.working_dir {
            cmd.current_dir(working_dir);
        }
        
        // Set environment variables
        for (key, value) in &handle.config.env_vars {
            cmd.env(key, value);
        }
        
        // Configure stdio
        cmd.stdout(Stdio::piped())
           .stderr(Stdio::piped())
           .stdin(Stdio::null());
        
        // Start the process
        match cmd.spawn() {
            Ok(child) => {
                handle.process = Some(child);
                handle.start_time = Some(Instant::now());
                handle.state = ServiceState::Running;
                info!("Service {} started successfully", name);
                
                // Wait a moment for the service to initialize
                sleep(Duration::from_secs(2)).await;
                
                Ok(())
            }
            Err(e) => {
                handle.state = ServiceState::Failed;
                error!("Failed to start service {}: {}", name, e);
                Err(Box::new(e))
            }
        }
    }
    
    pub async fn stop_service(&mut self, name: &str) -> Result<(), Box<dyn std::error::Error>> {
        let handle = self.services.get_mut(name)
            .ok_or_else(|| format!("Service not found: {}", name))?;
            
        if matches!(handle.state, ServiceState::Stopped) {
            return Ok(());
        }
        
        info!("Stopping service: {}", name);
        
        if let Some(ref mut process) = handle.process {
            // Try graceful shutdown first
            if let Err(e) = process.kill() {
                warn!("Failed to kill service {}: {}", name, e);
            }
            
            // Wait for process to exit
            if let Err(e) = process.wait() {
                warn!("Error waiting for service {} to exit: {}", name, e);
            }
        }
        
        handle.process = None;
        handle.state = ServiceState::Stopped;
        handle.start_time = None;
        
        info!("Service {} stopped", name);
        Ok(())
    }
    
    pub async fn restart_service(&mut self, name: &str) -> Result<(), Box<dyn std::error::Error>> {
        info!("Restarting service: {}", name);
        
        // Stop the service
        self.stop_service(name).await?;
        
        // Wait a moment
        sleep(Duration::from_secs(1)).await;
        
        // Start the service
        self.start_service(name).await?;
        
        Ok(())
    }
    
    pub async fn start_all_services(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("Starting all services...");
        
        let service_names: Vec<String> = self.services.keys().cloned().collect();
        
        for name in service_names {
            if let Err(e) = self.start_service(&name).await {
                warn!("Failed to start service {}: {}", name, e);
            }
            
            // Stagger service starts
            sleep(Duration::from_millis(500)).await;
        }
        
        Ok(())
    }
    
    pub async fn stop_all_services(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("Stopping all services...");
        
        let service_names: Vec<String> = self.services.keys().cloned().collect();
        
        for name in service_names {
            if let Err(e) = self.stop_service(&name).await {
                warn!("Failed to stop service {}: {}", name, e);
            }
        }
        
        Ok(())
    }
    
    pub async fn restart_all_services(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("Restarting all services...");
        
        self.stop_all_services().await?;
        sleep(Duration::from_secs(2)).await;
        self.start_all_services().await?;
        
        Ok(())
    }
    
    pub fn get_system_status(&self) -> SystemStatus {
        let mut services = Vec::new();
        let mut healthy_count = 0;
        
        for (name, handle) in &self.services {
            let uptime = handle.start_time
                .map(|start| start.elapsed().as_secs());
                
            let pid = handle.process.as_ref()
                .and_then(|p| Some(p.id()));
            
            let status = ServiceStatus {
                name: name.clone(),
                status: handle.state.as_str().to_string(),
                pid,
                uptime,
                last_check: chrono::Utc::now().to_rfc3339(),
            };
            
            if matches!(handle.state, ServiceState::Running) {
                healthy_count += 1;
            }
            
            services.push(status);
        }
        
        let overall_health = if healthy_count == self.services.len() {
            "Healthy".to_string()
        } else if healthy_count > 0 {
            "Degraded".to_string()
        } else {
            "Unhealthy".to_string()
        };
        
        SystemStatus {
            services,
            overall_health,
            timestamp: chrono::Utc::now().to_rfc3339(),
        }
    }
    
    pub async fn check_service_health(&mut self, name: &str) -> Result<bool, Box<dyn std::error::Error>> {
        let handle = self.services.get_mut(name)
            .ok_or_else(|| format!("Service not found: {}", name))?;
            
        // Check if process is still running
        if let Some(ref mut process) = handle.process {
            match process.try_wait() {
                Ok(Some(exit_status)) => {
                    // Process has exited
                    warn!("Service {} exited with status: {:?}", name, exit_status);
                    handle.state = ServiceState::Failed;
                    handle.process = None;
                    return Ok(false);
                }
                Ok(None) => {
                    // Process is still running
                }
                Err(e) => {
                    warn!("Error checking process status for {}: {}", name, e);
                    return Ok(false);
                }
            }
        } else {
            // No process handle
            handle.state = ServiceState::Stopped;
            return Ok(false);
        }
        
        // TODO: Implement HTTP/gRPC health checks
        if let Some(ref _health_url) = handle.config.health_check_url {
            // Placeholder for HTTP health check
            // let response = reqwest::get(health_url).await?;
            // return Ok(response.status().is_success());
        }
        
        handle.last_health_check = Some(Instant::now());
        Ok(true)
    }
}