# CPU Alert Basic - Execution Strategy

## LLM Role and Context

You are implementing a **conservative CPU monitoring strategy** for the "cpu_alert_basic" theory. Your primary goal is reliable detection and notification with minimal system impact.

## Core Principles

### Safety First
- Never impact system performance while monitoring
- Use proven, stable syscalls over experimental approaches
- Implement graceful degradation if monitoring fails
- Always include timeout mechanisms

### Conservative Approach
- Use well-established monitoring methods (`getloadavg`, `/proc/loadavg`)
- Simple threshold detection (80% CPU = immediate action)
- No complex predictions or machine learning
- Straightforward notification delivery

### Reliability Over Innovation
- Prefer battle-tested approaches over novel solutions
- Include comprehensive error handling
- Log all operations for debugging
- Validate all inputs and outputs

## Implementation Guidelines

### CPU Monitoring Method
```python
# Preferred approach - use /proc/loadavg for consistency
def get_cpu_usage():
    with open('/proc/loadavg', 'r') as f:
        load = float(f.read().split()[0])
    cpu_count = os.cpu_count()
    return min((load / cpu_count) * 100, 100)
```

### Threshold Detection
- **Trigger Point**: Exactly 80% CPU usage
- **Sampling Interval**: 5 seconds (balance responsiveness vs overhead)
- **Persistence Check**: Single reading triggers alert (no averaging)

### Error Handling Strategy
```python
try:
    # Primary monitoring approach
    cpu_percent = get_cpu_usage()
except Exception as e:
    # Fallback to alternative method
    cpu_percent = fallback_cpu_check()
    log_warning(f"Primary monitoring failed: {e}")
```

## Context Assumptions

### Environment
- **Desktop System**: GUI notification capability available
- **User Present**: Someone can respond to alerts
- **Resource Availability**: System has capacity for monitoring overhead
- **Permissions**: Standard user permissions, no root required

### User Expectations
- **Immediate Response**: Alert delivered within 1 second of detection
- **Clear Notification**: Simple, actionable message
- **Non-Intrusive**: Monitoring doesn't interfere with normal usage
- **Reliable**: No false positives or missed alerts

## Script Generation Instructions

### Python Implementation Requirements
```python
#!/usr/bin/env python3
"""
CPU Monitor - Conservative Implementation
Generated for cpu_alert_basic theory
"""

# Required imports
import os
import time
import json
import subprocess
from datetime import datetime

# Required functions
def get_cpu_usage():        # Main monitoring logic
def send_notification():   # Alert delivery
def log_metrics():         # Performance tracking
def cleanup_on_exit():     # Graceful shutdown
```

### Logging Requirements
- Log every CPU reading to `../results/metrics.json`
- Include timestamp, CPU percentage, alert status
- Log all errors and fallback usage
- Track performance metrics (response time, resource usage)

### Testing Integration
- Include self-test functionality
- Validate notification delivery
- Measure response times
- Verify resource usage stays within limits

## Success Criteria Validation

During execution, continuously verify:
1. **Response Time**: Alert delivery < 1.0 seconds
2. **Resource Usage**: Monitoring overhead < 2% CPU, < 50MB memory
3. **Accuracy**: Detection matches actual CPU usage ±2%
4. **Reliability**: No crashes or hung processes

## Failure Recovery

If any issues occur:
1. **Log the failure** with detailed error information
2. **Attempt graceful recovery** using fallback methods
3. **Clean up resources** (processes, file handles, notifications)
4. **Update failure log** in `../results/failure_log.yaml`
5. **Exit safely** without leaving system in unstable state

## Innovation Constraints

This is a **conservative strategy** - avoid:
- Complex CPU prediction algorithms
- Machine learning or AI-based detection
- Advanced scheduling or priority modifications
- Experimental notification methods
- Unproven syscalls or APIs

Focus on:
- Proven monitoring techniques
- Simple, reliable detection logic
- Standard notification mechanisms
- Comprehensive error handling
- Thorough logging and measurement

Remember: The goal is to establish a reliable baseline that other theories can build upon. Innovation comes through proven reliability, not experimental features.