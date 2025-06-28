// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
    Window,
};
use std::collections::HashMap;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use tokio::time::{sleep, Duration};
use serde::{Deserialize, Serialize};

mod services;
mod health;
mod tray;

use services::ServiceManager;
use health::HealthMonitor;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceStatus {
    pub name: String,
    pub status: String,
    pub pid: Option<u32>,
    pub uptime: Option<u64>,
    pub last_check: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemStatus {
    pub services: Vec<ServiceStatus>,
    pub overall_health: String,
    pub timestamp: String,
}

type ServiceManagerState = Arc<Mutex<ServiceManager>>;

#[tauri::command]
async fn get_system_status(state: tauri::State<'_, ServiceManagerState>) -> Result<SystemStatus, String> {
    let manager = state.lock().map_err(|e| format!("Lock error: {}", e))?;
    Ok(manager.get_system_status())
}

#[tauri::command]
async fn start_service(
    service_name: String,
    state: tauri::State<'_, ServiceManagerState>,
) -> Result<String, String> {
    let mut manager = state.lock().map_err(|e| format!("Lock error: {}", e))?;
    manager.start_service(&service_name).await
        .map_err(|e| format!("Failed to start service: {}", e))?;
    Ok(format!("Service {} started", service_name))
}

#[tauri::command]
async fn stop_service(
    service_name: String,
    state: tauri::State<'_, ServiceManagerState>,
) -> Result<String, String> {
    let mut manager = state.lock().map_err(|e| format!("Lock error: {}", e))?;
    manager.stop_service(&service_name).await
        .map_err(|e| format!("Failed to stop service: {}", e))?;
    Ok(format!("Service {} stopped", service_name))
}

#[tauri::command]
async fn restart_service(
    service_name: String,
    state: tauri::State<'_, ServiceManagerState>,
) -> Result<String, String> {
    let mut manager = state.lock().map_err(|e| format!("Lock error: {}", e))?;
    manager.restart_service(&service_name).await
        .map_err(|e| format!("Failed to restart service: {}", e))?;
    Ok(format!("Service {} restarted", service_name))
}

fn create_system_tray() -> SystemTray {
    let show_status = CustomMenuItem::new("show_status".to_string(), "Show Status");
    let separator = SystemTrayMenuItem::Separator;
    
    // Service status items (will be updated dynamically)
    let neo4j_status = CustomMenuItem::new("neo4j_status".to_string(), "Neo4j: Starting...");
    let graphiti_status = CustomMenuItem::new("graphiti_status".to_string(), "Graphiti: Starting...");
    let agent_status = CustomMenuItem::new("agent_status".to_string(), "Agent: Starting...");
    
    let separator2 = SystemTrayMenuItem::Separator;
    
    // Service control items
    let start_all = CustomMenuItem::new("start_all".to_string(), "Start All Services");
    let stop_all = CustomMenuItem::new("stop_all".to_string(), "Stop All Services");
    let restart_all = CustomMenuItem::new("restart_all".to_string(), "Restart All Services");
    
    let separator3 = SystemTrayMenuItem::Separator;
    let quit = CustomMenuItem::new("quit".to_string(), "Quit Leviathan");

    let tray_menu = SystemTrayMenu::new()
        .add_item(show_status)
        .add_native_item(separator)
        .add_item(neo4j_status)
        .add_item(graphiti_status)
        .add_item(agent_status)
        .add_native_item(separator2)
        .add_item(start_all)
        .add_item(stop_all)
        .add_item(restart_all)
        .add_native_item(separator3)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

fn handle_system_tray_event(app: &tauri::AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick {
            position: _,
            size: _,
            ..
        } => {
            // Show status window on left click
            if let Some(window) = app.get_window("main") {
                window.show().unwrap();
                window.set_focus().unwrap();
            }
        }
        SystemTrayEvent::MenuItemClick { id, .. } => {
            let state = app.state::<ServiceManagerState>();
            
            match id.as_str() {
                "show_status" => {
                    if let Some(window) = app.get_window("main") {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
                "start_all" => {
                    let state_clone = state.clone();
                    tauri::async_runtime::spawn(async move {
                        let mut manager = state_clone.lock().unwrap();
                        let _ = manager.start_all_services().await;
                    });
                }
                "stop_all" => {
                    let state_clone = state.clone();
                    tauri::async_runtime::spawn(async move {
                        let mut manager = state_clone.lock().unwrap();
                        let _ = manager.stop_all_services().await;
                    });
                }
                "restart_all" => {
                    let state_clone = state.clone();
                    tauri::async_runtime::spawn(async move {
                        let mut manager = state_clone.lock().unwrap();
                        let _ = manager.restart_all_services().await;
                    });
                }
                "quit" => {
                    // Gracefully shutdown services before quitting
                    let state_clone = state.clone();
                    tauri::async_runtime::spawn(async move {
                        let mut manager = state_clone.lock().unwrap();
                        let _ = manager.stop_all_services().await;
                    });
                    
                    // Give services time to shutdown gracefully
                    std::thread::sleep(std::time::Duration::from_secs(2));
                    app.exit(0);
                }
                _ => {}
            }
        }
        _ => {}
    }
}

async fn start_health_monitoring(app_handle: tauri::AppHandle, service_manager: ServiceManagerState) {
    let mut interval = tokio::time::interval(Duration::from_secs(10));
    
    loop {
        interval.tick().await;
        
        let system_status = {
            let manager = service_manager.lock().unwrap();
            manager.get_system_status()
        };
        
        // Update system tray menu with current status
        if let Err(e) = update_tray_menu(&app_handle, &system_status) {
            eprintln!("Failed to update tray menu: {}", e);
        }
        
        // Emit status update to frontend
        let _ = app_handle.emit_all("status-update", &system_status);
    }
}

fn update_tray_menu(app: &tauri::AppHandle, status: &SystemStatus) -> Result<(), tauri::Error> {
    let tray = app.tray_handle();
    
    for service in &status.services {
        let menu_id = format!("{}_status", service.name.to_lowercase());
        let status_text = format!("{}: {}", service.name, service.status);
        
        // Update menu item text
        if let Ok(item) = tray.get_item(&menu_id) {
            item.set_title(&status_text)?;
        }
    }
    
    Ok(())
}

#[tokio::main]
async fn main() {
    // Initialize logging
    tracing_subscriber::fmt::init();
    
    // Initialize service manager
    let service_manager = Arc::new(Mutex::new(ServiceManager::new()));
    
    // Start services
    {
        let mut manager = service_manager.lock().unwrap();
        if let Err(e) = manager.initialize_services().await {
            eprintln!("Failed to initialize services: {}", e);
        }
    }
    
    let app = tauri::Builder::default()
        .manage(service_manager.clone())
        .system_tray(create_system_tray())
        .on_system_tray_event(handle_system_tray_event)
        .invoke_handler(tauri::generate_handler![
            get_system_status,
            start_service,
            stop_service,
            restart_service
        ])
        .setup(|app| {
            // Hide main window by default (system tray app)
            if let Some(window) = app.get_window("main") {
                window.hide().unwrap();
            }
            
            // Start health monitoring
            let app_handle = app.handle();
            let service_manager_clone = service_manager.clone();
            
            tauri::async_runtime::spawn(async move {
                start_health_monitoring(app_handle, service_manager_clone).await;
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}