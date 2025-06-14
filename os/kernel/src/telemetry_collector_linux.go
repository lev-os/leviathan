//go:build linux
// +build linux

package main

import (
	"encoding/json"
	"fmt"
	"os"
	"runtime"
	"strconv"
	"strings"
	"time"
)

// SystemTelemetry represents the current state of the system
type SystemTelemetry struct {
	Timestamp    time.Time `json:"timestamp"`
	CPU          CPUMetrics `json:"cpu"`
	Memory       MemoryMetrics `json:"memory"`
	Network      NetworkMetrics `json:"network"`
	Disk         DiskMetrics `json:"disk"`
	LoadAverage  LoadMetrics `json:"load"`
}

type CPUMetrics struct {
	UsagePercent float64 `json:"usage_percent"`
	Cores        int     `json:"cores"`
	LoadAvg1     float64 `json:"load_avg_1m"`
	LoadAvg5     float64 `json:"load_avg_5m"`
	LoadAvg15    float64 `json:"load_avg_15m"`
}

type MemoryMetrics struct {
	TotalMB     uint64  `json:"total_mb"`
	UsedMB      uint64  `json:"used_mb"`
	FreeMB      uint64  `json:"free_mb"`
	UsagePercent float64 `json:"usage_percent"`
	SwapUsedMB  uint64  `json:"swap_used_mb"`
}

type NetworkMetrics struct {
	BytesReceived uint64 `json:"bytes_received"`
	BytesSent     uint64 `json:"bytes_sent"`
	PacketsReceived uint64 `json:"packets_received"`
	PacketsSent   uint64 `json:"packets_sent"`
	Connections   int    `json:"active_connections"`
}

type DiskMetrics struct {
	TotalSpaceGB uint64  `json:"total_space_gb"`
	UsedSpaceGB  uint64  `json:"used_space_gb"`
	FreeSpaceGB  uint64  `json:"free_space_gb"`
	UsagePercent float64 `json:"usage_percent"`
	IOReads      uint64  `json:"io_reads"`
	IOWrites     uint64  `json:"io_writes"`
}

type LoadMetrics struct {
	ProcessCount    int `json:"process_count"`
	ThreadCount     int `json:"thread_count"`
	RunningProcesses int `json:"running_processes"`
}

func (st *SystemTelemetry) ToJSON() (string, error) {
	data, err := json.MarshalIndent(st, "", "  ")
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// TelemetryCollector gathers system metrics (Linux version for Docker)
type TelemetryCollector struct {
	previousNet NetworkMetrics
	previousDisk DiskMetrics
}

// NewTelemetryCollector creates a new collector instance
func NewTelemetryCollector() *TelemetryCollector {
	return &TelemetryCollector{}
}

// CollectMetrics gathers current system telemetry using Linux /proc filesystem
func (tc *TelemetryCollector) CollectMetrics() (*SystemTelemetry, error) {
	telemetry := &SystemTelemetry{
		Timestamp: time.Now(),
	}

	// Collect CPU metrics
	cpu, err := tc.collectCPUMetrics()
	if err != nil {
		return nil, fmt.Errorf("failed to collect CPU metrics: %w", err)
	}
	telemetry.CPU = cpu

	// Collect memory metrics
	memory, err := tc.collectMemoryMetrics()
	if err != nil {
		return nil, fmt.Errorf("failed to collect memory metrics: %w", err)
	}
	telemetry.Memory = memory

	// Collect network metrics
	network, err := tc.collectNetworkMetrics()
	if err != nil {
		return nil, fmt.Errorf("failed to collect network metrics: %w", err)
	}
	telemetry.Network = network

	// Collect disk metrics
	disk, err := tc.collectDiskMetrics()
	if err != nil {
		return nil, fmt.Errorf("failed to collect disk metrics: %w", err)
	}
	telemetry.Disk = disk

	// Collect load metrics
	load, err := tc.collectLoadMetrics()
	if err != nil {
		return nil, fmt.Errorf("failed to collect load metrics: %w", err)
	}
	telemetry.LoadAverage = load

	return telemetry, nil
}

// collectCPUMetrics reads CPU usage and load average from /proc
func (tc *TelemetryCollector) collectCPUMetrics() (CPUMetrics, error) {
	metrics := CPUMetrics{
		Cores: runtime.NumCPU(),
	}

	// Read load average from /proc/loadavg
	loadData, err := os.ReadFile("/proc/loadavg")
	if err != nil {
		return metrics, fmt.Errorf("failed to read load average: %w", err)
	}

	loadFields := strings.Fields(string(loadData))
	if len(loadFields) >= 3 {
		metrics.LoadAvg1, _ = strconv.ParseFloat(loadFields[0], 64)
		metrics.LoadAvg5, _ = strconv.ParseFloat(loadFields[1], 64)
		metrics.LoadAvg15, _ = strconv.ParseFloat(loadFields[2], 64)
	}

	// Calculate CPU usage percentage from /proc/stat
	statData, err := os.ReadFile("/proc/stat")
	if err != nil {
		return metrics, fmt.Errorf("failed to read CPU stats: %w", err)
	}

	lines := strings.Split(string(statData), "\n")
	if len(lines) > 0 {
		cpuLine := lines[0]
		if strings.HasPrefix(cpuLine, "cpu ") {
			fields := strings.Fields(cpuLine)
			if len(fields) >= 8 {
				user, _ := strconv.ParseUint(fields[1], 10, 64)
				nice, _ := strconv.ParseUint(fields[2], 10, 64)
				system, _ := strconv.ParseUint(fields[3], 10, 64)
				idle, _ := strconv.ParseUint(fields[4], 10, 64)
				iowait, _ := strconv.ParseUint(fields[5], 10, 64)
				
				total := user + nice + system + idle + iowait
				used := total - idle
				
				if total > 0 {
					metrics.UsagePercent = float64(used) / float64(total) * 100
				}
			}
		}
	}

	return metrics, nil
}

// collectMemoryMetrics reads memory usage from /proc/meminfo
func (tc *TelemetryCollector) collectMemoryMetrics() (MemoryMetrics, error) {
	metrics := MemoryMetrics{}

	memData, err := os.ReadFile("/proc/meminfo")
	if err != nil {
		return metrics, fmt.Errorf("failed to read memory info: %w", err)
	}

	lines := strings.Split(string(memData), "\n")
	memInfo := make(map[string]uint64)

	for _, line := range lines {
		fields := strings.Fields(line)
		if len(fields) >= 2 {
			key := strings.TrimSuffix(fields[0], ":")
			value, err := strconv.ParseUint(fields[1], 10, 64)
			if err == nil {
				memInfo[key] = value // Values are in kB
			}
		}
	}

	// Convert kB to MB
	metrics.TotalMB = memInfo["MemTotal"] / 1024
	available := memInfo["MemAvailable"]
	if available == 0 {
		// Fallback calculation for older kernels
		available = memInfo["MemFree"] + memInfo["Buffers"] + memInfo["Cached"]
	}
	metrics.FreeMB = available / 1024
	metrics.UsedMB = metrics.TotalMB - metrics.FreeMB
	metrics.SwapUsedMB = (memInfo["SwapTotal"] - memInfo["SwapFree"]) / 1024

	if metrics.TotalMB > 0 {
		metrics.UsagePercent = float64(metrics.UsedMB) / float64(metrics.TotalMB) * 100
	}

	return metrics, nil
}

// collectNetworkMetrics reads network statistics from /proc/net/dev
func (tc *TelemetryCollector) collectNetworkMetrics() (NetworkMetrics, error) {
	metrics := NetworkMetrics{}

	netData, err := os.ReadFile("/proc/net/dev")
	if err != nil {
		return metrics, fmt.Errorf("failed to read network stats: %w", err)
	}

	lines := strings.Split(string(netData), "\n")
	for _, line := range lines {
		if strings.Contains(line, ":") && !strings.Contains(line, "lo:") {
			// Skip loopback interface
			parts := strings.Split(line, ":")
			if len(parts) == 2 {
				fields := strings.Fields(parts[1])
				if len(fields) >= 9 {
					bytesRx, _ := strconv.ParseUint(fields[0], 10, 64)
					packetsRx, _ := strconv.ParseUint(fields[1], 10, 64)
					bytesTx, _ := strconv.ParseUint(fields[8], 10, 64)
					packetsTx, _ := strconv.ParseUint(fields[9], 10, 64)

					metrics.BytesReceived += bytesRx
					metrics.PacketsReceived += packetsRx
					metrics.BytesSent += bytesTx
					metrics.PacketsSent += packetsTx
				}
			}
		}
	}

	// Count active connections from /proc/net/tcp
	tcpData, err := os.ReadFile("/proc/net/tcp")
	if err == nil {
		lines := strings.Split(string(tcpData), "\n")
		connectionCount := 0
		for _, line := range lines[1:] { // Skip header
			if strings.TrimSpace(line) != "" {
				connectionCount++
			}
		}
		metrics.Connections = connectionCount
	}

	return metrics, nil
}

// collectDiskMetrics reads disk usage and I/O statistics
func (tc *TelemetryCollector) collectDiskMetrics() (DiskMetrics, error) {
	metrics := DiskMetrics{}

	// Read disk space from /proc/mounts and calculate usage
	// For simplicity, we'll focus on the root filesystem
	statfsData, err := os.ReadFile("/proc/mounts")
	if err == nil {
		lines := strings.Split(string(statfsData), "\n")
		for _, line := range lines {
			fields := strings.Fields(line)
			if len(fields) >= 2 && fields[1] == "/" {
				// Found root filesystem, get stats
				// Note: This is simplified - real implementation would use syscall.Statfs
				metrics.TotalSpaceGB = 100  // Placeholder
				metrics.UsedSpaceGB = 30    // Placeholder
				metrics.FreeSpaceGB = 70    // Placeholder
				metrics.UsagePercent = 30.0 // Placeholder
				break
			}
		}
	}

	// Read I/O stats from /proc/diskstats
	diskData, err := os.ReadFile("/proc/diskstats")
	if err == nil {
		lines := strings.Split(string(diskData), "\n")
		for _, line := range lines {
			fields := strings.Fields(line)
			if len(fields) >= 14 {
				// Look for main disk devices (sda, vda, etc.)
				deviceName := fields[2]
				if strings.HasPrefix(deviceName, "sd") || 
				   strings.HasPrefix(deviceName, "vd") || 
				   strings.HasPrefix(deviceName, "nvme") {
					reads, _ := strconv.ParseUint(fields[5], 10, 64)  // sectors read
					writes, _ := strconv.ParseUint(fields[9], 10, 64) // sectors written
					
					metrics.IOReads += reads
					metrics.IOWrites += writes
				}
			}
		}
	}

	return metrics, nil
}

// collectLoadMetrics reads process and thread information
func (tc *TelemetryCollector) collectLoadMetrics() (LoadMetrics, error) {
	metrics := LoadMetrics{}

	// Count processes from /proc
	procEntries, err := os.ReadDir("/proc")
	if err != nil {
		return metrics, fmt.Errorf("failed to read /proc: %w", err)
	}

	runningCount := 0
	for _, entry := range procEntries {
		if entry.IsDir() {
			// Check if directory name is a number (PID)
			if _, err := strconv.Atoi(entry.Name()); err == nil {
				metrics.ProcessCount++
				
				// Check process state
				statPath := fmt.Sprintf("/proc/%s/stat", entry.Name())
				statData, err := os.ReadFile(statPath)
				if err == nil {
					fields := strings.Fields(string(statData))
					if len(fields) >= 3 && fields[2] == "R" {
						runningCount++
					}
				}
			}
		}
	}
	
	metrics.RunningProcesses = runningCount
	metrics.ThreadCount = metrics.ProcessCount // Simplified

	return metrics, nil
}

// Duplicate ToJSON method removed - already defined above

// TelemetryHistory stores historical telemetry data
type TelemetryHistory struct {
	samples []SystemTelemetry
	maxSize int
}

// NewTelemetryHistory creates a new history tracker
func NewTelemetryHistory(maxSize int) *TelemetryHistory {
	return &TelemetryHistory{
		samples: make([]SystemTelemetry, 0, maxSize),
		maxSize: maxSize,
	}
}

// Add a telemetry sample to history
func (th *TelemetryHistory) Add(telemetry SystemTelemetry) {
	th.samples = append(th.samples, telemetry)
	
	// Keep only the most recent samples
	if len(th.samples) > th.maxSize {
		th.samples = th.samples[1:]
	}
}

// GetRecent returns the most recent N samples
func (th *TelemetryHistory) GetRecent(count int) []SystemTelemetry {
	if count > len(th.samples) {
		count = len(th.samples)
	}
	
	if count == 0 {
		return []SystemTelemetry{}
	}
	
	return th.samples[len(th.samples)-count:]
}

// GetTrends analyzes trends in the telemetry data
func (th *TelemetryHistory) GetTrends() TelemetryTrends {
	trends := TelemetryTrends{}
	
	if len(th.samples) < 2 {
		return trends
	}
	
	recent := th.samples[len(th.samples)-1]
	previous := th.samples[len(th.samples)-2]
	
	trends.CPUTrend = recent.CPU.UsagePercent - previous.CPU.UsagePercent
	trends.MemoryTrend = recent.Memory.UsagePercent - previous.Memory.UsagePercent
	trends.LoadTrend = recent.CPU.LoadAvg1 - previous.CPU.LoadAvg1
	
	return trends
}

type TelemetryTrends struct {
	CPUTrend    float64 `json:"cpu_trend"`
	MemoryTrend float64 `json:"memory_trend"`
	LoadTrend   float64 `json:"load_trend"`
}