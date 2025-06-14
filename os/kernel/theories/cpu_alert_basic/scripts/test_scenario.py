#!/usr/bin/env python3
"""
CPU Alert Basic - Test Scenario
Validates theory performance and accuracy

WATCH MY SIX analysis:
- Challenge: How do we test CPU monitoring without actually stressing the system?
- Devil's Advocate: Mock testing vs real-world conditions
- Reality Check: Simulation accuracy vs actual performance
"""

import os
import sys
import time
import json
import subprocess
import threading
from datetime import datetime
from pathlib import Path

class CPUTestHarness:
    def __init__(self):
        self.theory_id = "cpu_alert_basic"
        self.results_dir = Path("../results")
        self.test_results = []
        
    def simulate_cpu_load(self, target_percent, duration_seconds):
        """
        Simulate CPU load for testing
        Reality Check: This is approximation, not exact CPU control
        """
        print(f"🔄 Simulating {target_percent}% CPU load for {duration_seconds}s")
        
        # Calculate work intensity based on target percentage
        work_time = target_percent / 100.0 * 0.1  # Work for this fraction of 0.1s
        sleep_time = 0.1 - work_time
        
        start_time = time.time()
        while time.time() - start_time < duration_seconds:
            # Do CPU-intensive work
            end_work = time.time() + work_time
            while time.time() < end_work:
                # Busy work
                sum(i * i for i in range(1000))
            
            # Sleep to control CPU usage
            if sleep_time > 0:
                time.sleep(sleep_time)
    
    def test_normal_operation(self):
        """
        Test monitoring during normal CPU usage (< 80%)
        Expected: No alerts should be triggered
        """
        print("\n🧪 Test 1: Normal CPU Usage")
        
        # Start monitoring in background
        monitor_process = subprocess.Popen([
            sys.executable, "cpu_monitor.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        try:
            # Simulate normal load (30-50% CPU)
            self.simulate_cpu_load(40, 15)
            
            # Give monitor time to process
            time.sleep(2)
            
        finally:
            # Stop monitoring
            monitor_process.terminate()
            monitor_process.wait(timeout=5)
        
        # Analyze results
        alerts_triggered = self.count_alerts_in_metrics()
        
        test_result = {
            'test_name': 'normal_operation',
            'expected_alerts': 0,
            'actual_alerts': alerts_triggered,
            'passed': alerts_triggered == 0,
            'timestamp': datetime.now().isoformat()
        }
        
        self.test_results.append(test_result)
        print(f"✅ Normal operation test: {test_result['passed']}")
        
        return test_result
    
    def test_threshold_trigger(self):
        """
        Test alert triggering when CPU exceeds 80%
        Expected: Alerts should be triggered
        """
        print("\n🧪 Test 2: Threshold Trigger")
        
        # Start monitoring
        monitor_process = subprocess.Popen([
            sys.executable, "cpu_monitor.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        try:
            # Simulate high load (90% CPU)
            self.simulate_cpu_load(90, 20)
            
            time.sleep(2)
            
        finally:
            monitor_process.terminate()
            monitor_process.wait(timeout=5)
        
        alerts_triggered = self.count_alerts_in_metrics()
        
        test_result = {
            'test_name': 'threshold_trigger',
            'expected_alerts': '>= 1',
            'actual_alerts': alerts_triggered,
            'passed': alerts_triggered >= 1,
            'timestamp': datetime.now().isoformat()
        }
        
        self.test_results.append(test_result)
        print(f"🚨 Threshold trigger test: {test_result['passed']}")
        
        return test_result