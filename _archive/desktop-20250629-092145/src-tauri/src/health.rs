use std::time::{Duration, Instant};
use tokio::time::sleep;
use tracing::{info, warn, error};
use reqwest;

#[derive(Debug, Clone)]
pub struct HealthCheck {
    pub service_name: String,
    pub check_type: HealthCheckType,
    pub interval: Duration,
    pub timeout: Duration,
    pub last_check: Option<Instant>,
    pub consecutive_failures: u32,
    pub max_failures: u32,
}

#[derive(Debug, Clone)]
pub enum HealthCheckType {
    Http { url: String, expected_status: u16 },
    Grpc { endpoint: String, service: String },
    Process { pid: u32 },
    Custom { command: Vec<String> },
}

#[derive(Debug, Clone)]
pub struct HealthStatus {
    pub is_healthy: bool,
    pub response_time_ms: Option<u64>,
    pub error_message: Option<String>,
    pub timestamp: Instant,
}

pub struct HealthMonitor {
    checks: Vec<HealthCheck>,
    client: reqwest::Client,
}

impl HealthMonitor {
    pub fn new() -> Self {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(10))
            .build()
            .expect("Failed to create HTTP client");
            
        Self {
            checks: Vec::new(),
            client,
        }
    }
    
    pub fn add_health_check(&mut self, check: HealthCheck) {
        info!("Adding health check for service: {}", check.service_name);
        self.checks.push(check);
    }
    
    pub async fn check_service_health(&self, service_name: &str) -> Option<HealthStatus> {
        let check = self.checks.iter()
            .find(|c| c.service_name == service_name)?;
            
        let start_time = Instant::now();
        
        let result = match &check.check_type {
            HealthCheckType::Http { url, expected_status } => {
                self.check_http_health(url, *expected_status).await
            }
            HealthCheckType::Grpc { endpoint, service } => {
                self.check_grpc_health(endpoint, service).await
            }
            HealthCheckType::Process { pid } => {
                self.check_process_health(*pid).await
            }
            HealthCheckType::Custom { command } => {
                self.check_custom_health(command).await
            }
        };
        
        let response_time = start_time.elapsed().as_millis() as u64;
        
        Some(HealthStatus {
            is_healthy: result.is_ok(),
            response_time_ms: Some(response_time),
            error_message: result.err(),
            timestamp: Instant::now(),
        })
    }
    
    async fn check_http_health(&self, url: &str, expected_status: u16) -> Result<(), String> {
        match self.client.get(url).send().await {
            Ok(response) => {
                if response.status().as_u16() == expected_status {
                    Ok(())
                } else {
                    Err(format!(
                        "Unexpected status code: {} (expected {})", 
                        response.status(), 
                        expected_status
                    ))
                }
            }
            Err(e) => Err(format!("HTTP request failed: {}", e)),
        }
    }
    
    async fn check_grpc_health(&self, endpoint: &str, service: &str) -> Result<(), String> {
        // TODO: Implement gRPC health check
        // For now, we'll use a simple TCP connection test
        match tokio::net::TcpStream::connect(endpoint).await {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("gRPC connection failed: {}", e)),
        }
    }
    
    async fn check_process_health(&self, pid: u32) -> Result<(), String> {
        // Check if process is still running
        #[cfg(unix)]
        {
            use std::process::Command;
            
            let output = Command::new("kill")
                .arg("-0")
                .arg(pid.to_string())
                .output();
                
            match output {
                Ok(output) => {
                    if output.status.success() {
                        Ok(())
                    } else {
                        Err("Process not found".to_string())
                    }
                }
                Err(e) => Err(format!("Failed to check process: {}", e)),
            }
        }
        
        #[cfg(windows)]
        {
            use std::process::Command;
            
            let output = Command::new("tasklist")
                .arg("/FI")
                .arg(format!("PID eq {}", pid))
                .output();
                
            match output {
                Ok(output) => {
                    let output_str = String::from_utf8_lossy(&output.stdout);
                    if output_str.contains(&pid.to_string()) {
                        Ok(())
                    } else {
                        Err("Process not found".to_string())
                    }
                }
                Err(e) => Err(format!("Failed to check process: {}", e)),
            }
        }
    }
    
    async fn check_custom_health(&self, command: &[String]) -> Result<(), String> {
        if command.is_empty() {
            return Err("Empty command".to_string());
        }
        
        let mut cmd = tokio::process::Command::new(&command[0]);
        if command.len() > 1 {
            cmd.args(&command[1..]);
        }
        
        match cmd.output().await {
            Ok(output) => {
                if output.status.success() {
                    Ok(())
                } else {
                    let stderr = String::from_utf8_lossy(&output.stderr);
                    Err(format!("Command failed: {}", stderr))
                }
            }
            Err(e) => Err(format!("Failed to execute command: {}", e)),
        }
    }
    
    pub async fn run_health_monitoring(&mut self) {
        info!("Starting health monitoring...");
        
        loop {
            for check in &mut self.checks {
                // Check if it's time to run this health check
                let should_check = match check.last_check {
                    Some(last) => last.elapsed() >= check.interval,
                    None => true,
                };
                
                if should_check {
                    let status = self.check_service_health(&check.service_name).await;
                    check.last_check = Some(Instant::now());
                    
                    match status {
                        Some(health_status) => {
                            if health_status.is_healthy {
                                check.consecutive_failures = 0;
                                info!(
                                    "Health check passed for {} ({}ms)", 
                                    check.service_name,
                                    health_status.response_time_ms.unwrap_or(0)
                                );
                            } else {
                                check.consecutive_failures += 1;
                                warn!(
                                    "Health check failed for {} ({}/{}): {}", 
                                    check.service_name,
                                    check.consecutive_failures,
                                    check.max_failures,
                                    health_status.error_message.as_deref().unwrap_or("Unknown error")
                                );
                                
                                // TODO: Trigger service restart if max failures exceeded
                                if check.consecutive_failures >= check.max_failures {
                                    error!(
                                        "Service {} has exceeded max failures, restart required",
                                        check.service_name
                                    );
                                }
                            }
                        }
                        None => {
                            warn!("No health check configured for service: {}", check.service_name);
                        }
                    }
                }
            }
            
            // Sleep for a short interval before checking again
            sleep(Duration::from_secs(5)).await;
        }
    }
}

impl Default for HealthMonitor {
    fn default() -> Self {
        Self::new()
    }
}