use tauri::{CustomMenuItem, SystemTrayMenu, SystemTrayMenuItem};
use crate::{SystemStatus, ServiceStatus};

pub fn create_tray_menu() -> SystemTrayMenu {
    let show_status = CustomMenuItem::new("show_status".to_string(), "🧠 Show Leviathan Status");
    let separator = SystemTrayMenuItem::Separator;
    
    // Service status items (will be updated dynamically)
    let neo4j_status = CustomMenuItem::new("neo4j_status".to_string(), "📊 Neo4j: Starting...");
    let graphiti_status = CustomMenuItem::new("graphiti_status".to_string(), "🧠 Graphiti: Starting...");
    let agent_status = CustomMenuItem::new("agent_status".to_string(), "🤖 Agent: Starting...");
    
    let separator2 = SystemTrayMenuItem::Separator;
    
    // Service control items
    let start_all = CustomMenuItem::new("start_all".to_string(), "▶️ Start All Services");
    let stop_all = CustomMenuItem::new("stop_all".to_string(), "⏹️ Stop All Services");
    let restart_all = CustomMenuItem::new("restart_all".to_string(), "🔄 Restart All Services");
    
    let separator3 = SystemTrayMenuItem::Separator;
    
    // Additional options
    let open_logs = CustomMenuItem::new("open_logs".to_string(), "📋 View Logs");
    let settings = CustomMenuItem::new("settings".to_string(), "⚙️ Settings");
    
    let separator4 = SystemTrayMenuItem::Separator;
    let quit = CustomMenuItem::new("quit".to_string(), "❌ Quit Leviathan");

    SystemTrayMenu::new()
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
        .add_item(open_logs)
        .add_item(settings)
        .add_native_item(separator4)
        .add_item(quit)
}

pub fn get_service_status_icon(status: &str) -> &'static str {
    match status {
        "Running" => "🟢",
        "Starting" => "🟡",
        "Stopped" => "⚫",
        "Failed" => "🔴",
        "Unhealthy" => "🟠",
        "Restarting" => "🔄",
        _ => "⚪",
    }
}

pub fn get_service_display_name(service_name: &str) -> &'static str {
    match service_name {
        "neo4j" => "Neo4j Database",
        "graphiti" => "Graphiti Memory",
        "agent" => "Agent System",
        _ => "Unknown Service",
    }
}

pub fn format_service_menu_item(service: &ServiceStatus) -> String {
    let icon = get_service_status_icon(&service.status);
    let display_name = get_service_display_name(&service.name);
    
    if let Some(uptime) = service.uptime {
        let uptime_str = format_uptime(uptime);
        format!("{} {}: {} ({})", icon, display_name, service.status, uptime_str)
    } else {
        format!("{} {}: {}", icon, display_name, service.status)
    }
}

pub fn format_uptime(seconds: u64) -> String {
    if seconds < 60 {
        format!("{}s", seconds)
    } else if seconds < 3600 {
        format!("{}m", seconds / 60)
    } else if seconds < 86400 {
        let hours = seconds / 3600;
        let minutes = (seconds % 3600) / 60;
        format!("{}h {}m", hours, minutes)
    } else {
        let days = seconds / 86400;
        let hours = (seconds % 86400) / 3600;
        format!("{}d {}h", days, hours)
    }
}

pub fn get_overall_status_icon(system_status: &SystemStatus) -> &'static str {
    match system_status.overall_health.as_str() {
        "Healthy" => "🟢",
        "Degraded" => "🟡",
        "Unhealthy" => "🔴",
        _ => "⚪",
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_format_uptime() {
        assert_eq!(format_uptime(30), "30s");
        assert_eq!(format_uptime(90), "1m");
        assert_eq!(format_uptime(3661), "1h 1m");
        assert_eq!(format_uptime(90061), "1d 1h");
    }
    
    #[test]
    fn test_service_status_icon() {
        assert_eq!(get_service_status_icon("Running"), "🟢");
        assert_eq!(get_service_status_icon("Failed"), "🔴");
        assert_eq!(get_service_status_icon("Unknown"), "⚪");
    }
}