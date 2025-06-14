# CPU Alert Basic - Monitoring Approach

## Monitoring Philosophy

You are implementing **conservative system monitoring** with emphasis on:
- **Accuracy**: Reliable CPU measurement without false readings
- **Efficiency**: Minimal system impact during monitoring
- **Consistency**: Repeatable results across different system states
- **Safety**: No interference with normal system operations

## CPU Measurement Strategy

### Primary Method: /proc/loadavg
```python
def get_cpu_usage():
    """
    Conservative CPU monitoring using /proc/loadavg
    Most reliable method across different Linux distributions
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
```

### Fallback Method: top command
```python
def fallback_cpu_check():
    """
    Backup monitoring using top command
    Use only if /proc/loadavg fails
    """
    try:
        result = subprocess.run(['top', '-bn1'], 
                              capture_output=True, text=True, timeout=3)
        # Parse CPU usage from top output
        for line in result.stdout.split('\n'):
            if 'Cpu(s):' in line:
                # Extract CPU usage percentage
                cpu_usage = parse_cpu_from_top(line)
                return cpu_usage
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError):
        return None  # Will trigger error handling
```

## Sampling Strategy

### Monitoring Loop
```python
def monitoring_loop():
    """
    Main monitoring loop with conservative sampling
    """
    while monitoring_active:
        start_time = time.time()
        
        # Get CPU measurement
        try:
            cpu_percent = get_cpu_usage()
            measurement_success = True
        except MonitoringError as e:
            cpu_percent = fallback_cpu_check()
            measurement_success = False
            log_warning(f"Primary monitoring failed: {e}")
        
        # Check threshold
        if cpu_percent >= 80.0:
            trigger_alert(cpu_percent)
        
        # Log metrics for learning
        log_measurement(cpu_percent, measurement_success, time.time() - start_time)
        
        # Conservative 5-second interval
        time.sleep(5.0)
```

### Measurement Validation
```python
def validate_measurement(cpu_percent):
    """
    Sanity check CPU measurements
    """
    if not isinstance(cpu_percent, (int, float)):
        raise ValidationError("CPU measurement must be numeric")
    
    if cpu_percent < 0 or cpu_percent > 100:
        raise ValidationError(f"Invalid CPU percentage: {cpu_percent}")
    
    return True
```

## Threshold Detection

### Simple 80% Trigger
- **No Smoothing**: Single reading above 80% triggers alert
- **No Averaging**: Conservative approach avoids delayed detection
- **Clear Boundary**: Exactly 80.0% or higher activates notification

### Detection Logic
```python
def check_threshold(cpu_percent):
    """
    Simple threshold detection - no complex logic
    """
    THRESHOLD = 80.0
    
    if cpu_percent >= THRESHOLD:
        return True, f"CPU usage {cpu_percent}% exceeds threshold {THRESHOLD}%"
    else:
        return False, f"CPU usage {cpu_percent}% within normal range"
```

## Performance Tracking

### Metrics Collection
Track these measurements for theory evaluation:
```python
def log_measurement(cpu_percent, measurement_success, response_time):
    """
    Log metrics for theory performance analysis
    """
    metric_entry = {
        'timestamp': datetime.now().isoformat(),
        'cpu_percent': cpu_percent,
        'measurement_method': 'primary' if measurement_success else 'fallback',
        'response_time': response_time,
        'threshold_exceeded': cpu_percent >= 80.0,
        'theory_id': 'cpu_alert_basic'
    }
    
    # Append to metrics file
    with open('../results/metrics.json', 'a') as f:
        f.write(json.dumps(metric_entry) + '\n')
```

### Resource Usage Monitoring
```python
def monitor_self_usage():
    """
    Track monitoring overhead to ensure < 2% CPU, < 50MB memory
    """
    import psutil
    process = psutil.Process()
    
    self_metrics = {
        'cpu_percent': process.cpu_percent(),
        'memory_mb': process.memory_info().rss / 1024 / 1024,
        'timestamp': datetime.now().isoformat()
    }
    
    # Verify we're not impacting system performance
    if self_metrics['cpu_percent'] > 2.0:
        log_warning("Monitoring overhead too high: {:.1f}% CPU".format(
            self_metrics['cpu_percent']))
    
    return self_metrics
```

## Error Handling in Monitoring

### Graceful Degradation
```python
class MonitoringError(Exception):
    """Custom exception for monitoring failures"""
    pass

def robust_monitoring():
    """
    Monitoring with multiple fallback strategies
    """
    try:
        # Primary method
        return get_cpu_usage()
    except MonitoringError:
        try:
            # Fallback method
            return fallback_cpu_check()
        except Exception:
            # Last resort - return safe default
            log_error("All monitoring methods failed")
            return None  # Will be handled by calling code
```

### Recovery Strategies
1. **Primary Failure**: Switch to fallback method, continue monitoring
2. **Fallback Failure**: Log error, attempt recovery after brief pause
3. **Complete Failure**: Graceful shutdown with detailed error logging
4. **Partial Data**: Use available data, mark as uncertain in logs

## Integration with System State

### Context Awareness
```python
def get_system_context():
    """
    Gather context about system state for better monitoring
    """
    context = {
        'load_average': os.getloadavg(),
        'cpu_count': os.cpu_count(),
        'uptime': get_system_uptime(),
        'active_processes': get_process_count()
    }
    return context
```

### Environmental Considerations
- **Desktop Environment**: Ensure GUI notifications work
- **User Session**: Verify user is logged in and can receive alerts
- **System Load**: Account for background processes and system tasks
- **Time of Day**: Log timing for pattern analysis

Remember: This monitoring approach prioritizes **reliability and simplicity** over sophisticated detection. The goal is establishing a proven baseline that more advanced theories can build upon.