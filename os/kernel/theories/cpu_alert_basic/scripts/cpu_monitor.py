#!/usr/bin/env python3
"""
CPU Monitor - Conservative Implementation
Generated for cpu_alert_basic theory
AI Self-Learning Research Framework

WATCH MY SIX validation applied:
- Challenge: Can we actually monitor CPU reliably without impacting performance?
- Devil's Advocate: What if /proc/loadavg is unavailable or gives false readings?
- Theory vs Practice: Load average != actual CPU usage in all scenarios
- Gotchas: GUI notifications might fail in headless environments
"""

import os
import sys
import time
import json
import subprocess
import signal
from datetime import datetime
from pathlib import Path

# Theory configuration
THEORY_ID = "cpu_alert_basic"
CPU_THRESHOLD = 80.0
MONITORING_INTERVAL = 5.0
MAX_MONITORING_OVERHEAD = 2.0  # CPU percentage

class MonitoringError(Exception):
    """Custom exception for monitoring failures"""
    pass

class CPUMonitor:
    def __init__(self):
        self.monitoring_active = True
        self.results_dir = Path("../results")
        self.results_dir.mkdir(exist_ok=True)
        self.metrics_file = self.results_dir / "metrics.json"
        self.start_time = datetime.now()
        
        # Set up signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        print(f"\nReceived signal {signum}, shutting down gracefully...")
        self.monitoring_active = False
    
    def get_cpu_usage(self):
        """
        Primary CPU monitoring using /proc/loadavg
        Conservative approach with proven reliability
        
        Reality Check: Load average represents average system load,
        not instantaneous CPU usage. Good enough for threshold detection.
        """
        try:
            with open('/proc/loadavg', 'r') as f:
                load_avg_1min = float(f.read().split()[0])
            
            # Convert load average to approximate CPU percentage
            cpu_count = os.cpu_count()
            cpu_percent = min((load_avg_1min / cpu_count) * 100, 100)
            
            return round(cpu_percent, 2)
            
        except (IOError, ValueError, IndexError) as e:
            raise MonitoringError(f"Failed to read /proc/loadavg: {e}")
    
    def fallback_cpu_check(self):
        """
        Backup monitoring using top command
        
        Devil's Advocate: What if top isn't available or takes too long?
        Mitigation: 3-second timeout and comprehensive error handling
        """
        try:
            result = subprocess.run(
                ['top', '-bn1'], 
                capture_output=True, 
                text=True, 
                timeout=3
            )
            
            # Parse CPU usage from top output
            for line in result.stdout.split('\n'):
                if 'Cpu(s):' in line or '%Cpu(s):' in line:
                    # Extract first percentage (user CPU)
                    import re
                    cpu_match = re.search(r'(\d+\.?\d*)%?\s*us', line)
                    if cpu_match:
                        return float(cpu_match.group(1))
            
            raise MonitoringError("Could not parse CPU from top output")
            
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError, ValueError) as e:
            raise MonitoringError(f"Fallback monitoring failed: {e}")    
    def send_notification(self, cpu_percent):
        """
        Send user notification when CPU threshold exceeded
        
        Challenge: Will notifications actually reach the user?
        Gotcha: Different desktop environments use different notification systems
        """
        message = f"CPU Alert: {cpu_percent}% usage detected (threshold: {CPU_THRESHOLD}%)"
        
        # Try multiple notification methods for reliability
        notification_sent = False
        
        try:
            # Method 1: notify-send (most common)
            result = subprocess.run(
                ['notify-send', 'CPU Alert', message],
                capture_output=True,
                timeout=2
            )
            if result.returncode == 0:
                notification_sent = True
                
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
        
        if not notification_sent:
            try:
                # Method 2: zenity (fallback)
                subprocess.run(
                    ['zenity', '--info', '--text', message],
                    timeout=2
                )
                notification_sent = True
            except (subprocess.TimeoutExpired, FileNotFoundError):
                pass
        
        if not notification_sent:
            # Method 3: Terminal output (last resort)
            print(f"🚨 {message}")
            notification_sent = True
        
        return notification_sent
    
    def validate_measurement(self, cpu_percent):
        """
        Sanity check CPU measurements
        Reality Check: Ensure we're getting sensible values
        """
        if not isinstance(cpu_percent, (int, float)):
            raise MonitoringError("CPU measurement must be numeric")
        
        if cpu_percent < 0 or cpu_percent > 100:
            raise MonitoringError(f"Invalid CPU percentage: {cpu_percent}")
        
        return True
    
    def log_measurement(self, cpu_percent, measurement_method, response_time, alert_sent=False):
        """
        Log metrics for theory performance analysis
        """
        metric_entry = {
            'timestamp': datetime.now().isoformat(),
            'theory_id': THEORY_ID,
            'cpu_percent': cpu_percent,
            'measurement_method': measurement_method,
            'response_time': response_time,
            'threshold_exceeded': cpu_percent >= CPU_THRESHOLD,
            'alert_sent': alert_sent,
            'monitoring_duration': (datetime.now() - self.start_time).total_seconds()
        }
        
        # Append to metrics file (one JSON object per line)
        with open(self.metrics_file, 'a') as f:
            f.write(json.dumps(metric_entry) + '\n')
    
    def check_self_performance(self):
        """
        Monitor our own resource usage
        Challenge: Are we actually staying within our performance limits?
        """
        try:
            import psutil
            process = psutil.Process()
            cpu_usage = process.cpu_percent()
            memory_mb = process.memory_info().rss / 1024 / 1024
            
            if cpu_usage > MAX_MONITORING_OVERHEAD:
                print(f"⚠️  Monitoring overhead too high: {cpu_usage:.1f}% CPU")
                
            return {
                'self_cpu_percent': cpu_usage,
                'self_memory_mb': memory_mb
            }
        except ImportError:
            # psutil not available, skip self-monitoring
            return None    
    def monitoring_loop(self):
        """
        Main monitoring loop with conservative approach
        Theory vs Practice: Simple loop vs complex event-driven system
        """
        print(f"🔍 Starting CPU monitoring (threshold: {CPU_THRESHOLD}%)")
        print(f"📊 Logging metrics to: {self.metrics_file}")
        
        consecutive_errors = 0
        max_consecutive_errors = 5
        
        while self.monitoring_active:
            loop_start_time = time.time()
            alert_sent = False
            measurement_method = "unknown"
            
            try:
                # Primary CPU measurement
                cpu_percent = self.get_cpu_usage()
                self.validate_measurement(cpu_percent)
                measurement_method = "primary"
                consecutive_errors = 0  # Reset error counter on success
                
            except MonitoringError as e:
                print(f"⚠️  Primary monitoring failed: {e}")
                try:
                    # Fallback measurement
                    cpu_percent = self.fallback_cpu_check()
                    self.validate_measurement(cpu_percent)
                    measurement_method = "fallback"
                    consecutive_errors = 0
                    
                except MonitoringError as fallback_error:
                    print(f"❌ Fallback monitoring failed: {fallback_error}")
                    consecutive_errors += 1
                    
                    # If too many consecutive errors, shut down gracefully
                    if consecutive_errors >= max_consecutive_errors:
                        print(f"❌ Too many consecutive errors ({consecutive_errors}), shutting down")
                        break
                    
                    # Skip this iteration
                    time.sleep(MONITORING_INTERVAL)
                    continue
            
            # Check threshold and send alert if needed
            if cpu_percent >= CPU_THRESHOLD:
                print(f"🚨 CPU threshold exceeded: {cpu_percent}%")
                alert_sent = self.send_notification(cpu_percent)
                if not alert_sent:
                    print("⚠️  Failed to send notification")
            else:
                print(f"✅ CPU usage normal: {cpu_percent}%")
            
            # Calculate response time
            response_time = time.time() - loop_start_time
            
            # Log metrics for theory evaluation
            self.log_measurement(cpu_percent, measurement_method, response_time, alert_sent)
            
            # Check our own performance impact
            self_perf = self.check_self_performance()
            if self_perf and self_perf['self_cpu_percent'] > MAX_MONITORING_OVERHEAD:
                print(f"⚠️  High monitoring overhead: {self_perf['self_cpu_percent']:.1f}% CPU")
            
            # Conservative monitoring interval
            time.sleep(MONITORING_INTERVAL)
        
        print("🛑 Monitoring stopped")
    
    def run(self):
        """
        Entry point for CPU monitoring
        Includes comprehensive error handling and cleanup
        """
        try:
            self.monitoring_loop()
        except KeyboardInterrupt:
            print("\n🛑 Monitoring interrupted by user")
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            # Log the error for analysis
            error_entry = {
                'timestamp': datetime.now().isoformat(),
                'theory_id': THEORY_ID,
                'error_type': 'unexpected_exception',
                'error_message': str(e),
                'error_class': e.__class__.__name__
            }
            
            error_file = self.results_dir / "error_log.json"
            with open(error_file, 'a') as f:
                f.write(json.dumps(error_entry) + '\n')
        finally:
            print("🧹 Performing cleanup...")
            # Any cleanup operations would go here

if __name__ == "__main__":
    # Theory validation: Can we actually run this?
    if not os.path.exists('/proc/loadavg'):
        print("❌ /proc/loadavg not available - not a Linux system?")
        sys.exit(1)
    
    # Initialize and run monitor
    monitor = CPUMonitor()
    monitor.run()