package main

import (
	"fmt"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

// ConfigurationApplier executes AI-generated configuration changes
type ConfigurationApplier struct {
	dryRun         bool
	appliedChanges []AppliedChange
	rollbackStack  []RollbackAction
}

type AppliedChange struct {
	ID          string                 `json:"id"`
	Action      string                 `json:"action"`
	Target      string                 `json:"target"`
	Parameters  map[string]interface{} `json:"parameters"`
	AppliedAt   time.Time             `json:"applied_at"`
	Success     bool                   `json:"success"`
	Error       string                 `json:"error,omitempty"`
	Impact      ChangeImpact          `json:"impact"`
}

type ChangeImpact struct {
	BeforeMetrics SystemTelemetry `json:"before_metrics"`
	AfterMetrics  SystemTelemetry `json:"after_metrics,omitempty"`
	Improvement   float64         `json:"improvement"`
	Description   string          `json:"description"`
}

type RollbackAction struct {
	ChangeID    string
	Command     string
	Description string
	AppliedAt   time.Time
}

// NewConfigurationApplier creates a new applier instance
func NewConfigurationApplier(dryRun bool) *ConfigurationApplier {
	return &ConfigurationApplier{
		dryRun:         dryRun,
		appliedChanges: make([]AppliedChange, 0),
		rollbackStack:  make([]RollbackAction, 0),
	}
}

// ApplyDecision executes all actions in a configuration decision
func (ca *ConfigurationApplier) ApplyDecision(decision ConfigurationDecision, beforeMetrics SystemTelemetry) []AppliedChange {
	changes := make([]AppliedChange, 0)

	for i, action := range decision.Actions {
		changeID := fmt.Sprintf("%d_%d_%d", time.Now().Unix(), decision.Timestamp.Unix(), i)
		
		change := AppliedChange{
			ID:         changeID,
			Action:     string(action.Type),
			Target:     action.Target,
			Parameters: action.Parameters,
			AppliedAt:  time.Now(),
			Impact: ChangeImpact{
				BeforeMetrics: beforeMetrics,
			},
		}

		if ca.dryRun {
			change.Success = true
			change.Impact.Description = "DRY RUN: Would execute " + action.Description
			fmt.Printf("🔍 DRY RUN: Would apply %s on %s\n", action.Type, action.Target)
		} else {
			err := ca.executeAction(action, changeID)
			if err != nil {
				change.Success = false
				change.Error = err.Error()
				fmt.Printf("❌ Failed to apply %s: %v\n", action.Description, err)
			} else {
				change.Success = true
				fmt.Printf("✅ Applied: %s\n", action.Description)
			}
		}

		changes = append(changes, change)
		ca.appliedChanges = append(ca.appliedChanges, change)
	}

	return changes
}

// executeAction performs the actual system configuration change
func (ca *ConfigurationApplier) executeAction(action ConfigurationAction, changeID string) error {
	switch action.Type {
	case ActionKillProcess:
		return ca.killProcess(action, changeID)
	case ActionAdjustPriority:
		return ca.adjustPriority(action, changeID)
	case ActionSetMemoryLimit:
		return ca.setMemoryLimit(action, changeID)
	case ActionClearCache:
		return ca.clearCache(action, changeID)
	case ActionAdjustSwappiness:
		return ca.adjustSwappiness(action, changeID)
	case ActionOptimizeNetwork:
		return ca.optimizeNetwork(action, changeID)
	case ActionCompactMemory:
		return ca.compactMemory(action, changeID)
	case ActionSuspendProcess:
		return ca.suspendProcess(action, changeID)
	default:
		return fmt.Errorf("unknown action type: %s", action.Type)
	}
}

// killProcess terminates processes consuming excessive resources
func (ca *ConfigurationApplier) killProcess(action ConfigurationAction, changeID string) error {
	target := action.Target
	
	// Find processes by name or criteria
	cmd := exec.Command("pgrep", "-f", target)
	output, err := cmd.Output()
	if err != nil {
		return fmt.Errorf("failed to find processes matching %s: %w", target, err)
	}

	pids := strings.Fields(string(output))
	if len(pids) == 0 {
		return fmt.Errorf("no processes found matching %s", target)
	}

	// Kill processes (be careful!)
	for _, pid := range pids {
		killCmd := exec.Command("kill", "-TERM", pid)
		if err := killCmd.Run(); err != nil {
			fmt.Printf("Warning: Failed to kill process %s: %v\n", pid, err)
		} else {
			// Add rollback action (though killing processes isn't reversible)
			ca.addRollbackAction(changeID, "", fmt.Sprintf("Killed process %s", pid))
		}
	}

	return nil
}

// adjustPriority changes process scheduling priority
func (ca *ConfigurationApplier) adjustPriority(action ConfigurationAction, changeID string) error {
	target := action.Target
	niceLevel, ok := action.Parameters["nice_level"].(float64)
	if !ok {
		return fmt.Errorf("missing or invalid nice_level parameter")
	}

	// Find background processes or specific target
	var cmd *exec.Cmd
	if target == "background_processes" {
		// Renice common background processes
		backgroundProcesses := []string{"chrome", "firefox", "slack", "zoom", "spotify"}
		for _, proc := range backgroundProcesses {
			reniceCmd := exec.Command("pgrep", "-f", proc)
			if output, err := reniceCmd.Output(); err == nil {
				pids := strings.Fields(string(output))
				for _, pid := range pids {
					cmd = exec.Command("renice", strconv.Itoa(int(niceLevel)), pid)
					if err := cmd.Run(); err == nil {
						ca.addRollbackAction(changeID, fmt.Sprintf("renice 0 %s", pid), 
							fmt.Sprintf("Reniced %s to %d", pid, int(niceLevel)))
					}
				}
			}
		}
	} else {
		// Renice specific target
		cmd = exec.Command("pgrep", "-f", target)
		output, err := cmd.Output()
		if err != nil {
			return fmt.Errorf("failed to find process %s: %w", target, err)
		}

		pids := strings.Fields(string(output))
		for _, pid := range pids {
			reniceCmd := exec.Command("renice", strconv.Itoa(int(niceLevel)), pid)
			if err := reniceCmd.Run(); err != nil {
				return fmt.Errorf("failed to renice process %s: %w", pid, err)
			}
			ca.addRollbackAction(changeID, fmt.Sprintf("renice 0 %s", pid), 
				fmt.Sprintf("Reniced %s to %d", pid, int(niceLevel)))
		}
	}

	return nil
}

// setMemoryLimit applies memory limits using cgroups
func (ca *ConfigurationApplier) setMemoryLimit(action ConfigurationAction, changeID string) error {
	target := action.Target
	maxProcesses, ok := action.Parameters["max_processes"].(float64)
	if !ok {
		return fmt.Errorf("missing or invalid max_processes parameter")
	}

	// Set process limit via ulimit (simplified)
	cmd := exec.Command("bash", "-c", fmt.Sprintf("ulimit -u %d", int(maxProcesses)))
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to set process limit: %w", err)
	}

	ca.addRollbackAction(changeID, "ulimit -u unlimited", 
		fmt.Sprintf("Set %s process limit to %d", target, int(maxProcesses)))

	return nil
}

// clearCache clears system caches to free memory
func (ca *ConfigurationApplier) clearCache(action ConfigurationAction, changeID string) error {
	target := action.Target
	
	switch target {
	case "system":
		// Clear page cache, dentries and inodes
		if force, ok := action.Parameters["force"].(bool); ok && force {
			cmd := exec.Command("bash", "-c", "echo 3 > /proc/sys/vm/drop_caches")
			if err := cmd.Run(); err != nil {
				return fmt.Errorf("failed to clear system caches: %w", err)
			}
		} else {
			cmd := exec.Command("bash", "-c", "echo 1 > /proc/sys/vm/drop_caches")
			if err := cmd.Run(); err != nil {
				return fmt.Errorf("failed to clear page cache: %w", err)
			}
		}
		
	case "applications":
		// Clear application-specific caches (simplified)
		cacheDirs := []string{
			"/tmp/*",
			"/var/tmp/*",
			"/home/*/.cache/thumbnails/*",
		}
		
		for _, dir := range cacheDirs {
			cmd := exec.Command("bash", "-c", fmt.Sprintf("rm -rf %s 2>/dev/null || true", dir))
			cmd.Run() // Ignore errors for cache cleanup
		}
	}

	ca.addRollbackAction(changeID, "", fmt.Sprintf("Cleared %s caches", target))
	return nil
}

// adjustSwappiness modifies VM swappiness parameter
func (ca *ConfigurationApplier) adjustSwappiness(action ConfigurationAction, changeID string) error {
	swappiness, ok := action.Parameters["swappiness"].(float64)
	if !ok {
		return fmt.Errorf("missing or invalid swappiness parameter")
	}

	// Read current swappiness for rollback
	currentData, err := os.ReadFile("/proc/sys/vm/swappiness")
	if err != nil {
		return fmt.Errorf("failed to read current swappiness: %w", err)
	}
	currentSwappiness := strings.TrimSpace(string(currentData))

	// Set new swappiness
	cmd := exec.Command("bash", "-c", fmt.Sprintf("echo %d > /proc/sys/vm/swappiness", int(swappiness)))
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to set swappiness: %w", err)
	}

	ca.addRollbackAction(changeID, 
		fmt.Sprintf("echo %s > /proc/sys/vm/swappiness", currentSwappiness),
		fmt.Sprintf("Set swappiness to %d (was %s)", int(swappiness), currentSwappiness))

	return nil
}

// optimizeNetwork adjusts network parameters
func (ca *ConfigurationApplier) optimizeNetwork(action ConfigurationAction, changeID string) error {
	// Optimize TCP settings
	if finTimeout, ok := action.Parameters["tcp_fin_timeout"].(float64); ok {
		cmd := exec.Command("bash", "-c", fmt.Sprintf("echo %d > /proc/sys/net/ipv4/tcp_fin_timeout", int(finTimeout)))
		if err := cmd.Run(); err != nil {
			fmt.Printf("Warning: Failed to set tcp_fin_timeout: %v\n", err)
		}
	}

	if keepaliveTime, ok := action.Parameters["tcp_keepalive_time"].(float64); ok {
		cmd := exec.Command("bash", "-c", fmt.Sprintf("echo %d > /proc/sys/net/ipv4/tcp_keepalive_time", int(keepaliveTime)))
		if err := cmd.Run(); err != nil {
			fmt.Printf("Warning: Failed to set tcp_keepalive_time: %v\n", err)
		}
	}

	ca.addRollbackAction(changeID, "", "Optimized network TCP settings")
	return nil
}

// compactMemory triggers memory compaction
func (ca *ConfigurationApplier) compactMemory(action ConfigurationAction, changeID string) error {
	// Trigger memory compaction
	cmd := exec.Command("bash", "-c", "echo 1 > /proc/sys/vm/compact_memory")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to trigger memory compaction: %w", err)
	}

	ca.addRollbackAction(changeID, "", "Triggered memory compaction")
	return nil
}

// suspendProcess suspends processes to free resources
func (ca *ConfigurationApplier) suspendProcess(action ConfigurationAction, changeID string) error {
	target := action.Target

	// Find and suspend processes
	cmd := exec.Command("pgrep", "-f", target)
	output, err := cmd.Output()
	if err != nil {
		return fmt.Errorf("failed to find processes matching %s: %w", target, err)
	}

	pids := strings.Fields(string(output))
	for _, pid := range pids {
		suspendCmd := exec.Command("kill", "-STOP", pid)
		if err := suspendCmd.Run(); err != nil {
			fmt.Printf("Warning: Failed to suspend process %s: %v\n", pid, err)
		} else {
			ca.addRollbackAction(changeID, fmt.Sprintf("kill -CONT %s", pid), 
				fmt.Sprintf("Suspended process %s", pid))
		}
	}

	return nil
}

// addRollbackAction records an action for potential rollback
func (ca *ConfigurationApplier) addRollbackAction(changeID, rollbackCmd, description string) {
	action := RollbackAction{
		ChangeID:    changeID,
		Command:     rollbackCmd,
		Description: description,
		AppliedAt:   time.Now(),
	}
	ca.rollbackStack = append(ca.rollbackStack, action)
}

// RollbackChange attempts to undo a configuration change
func (ca *ConfigurationApplier) RollbackChange(changeID string) error {
	var rollbackActions []RollbackAction
	
	// Find all rollback actions for this change
	for _, action := range ca.rollbackStack {
		if action.ChangeID == changeID {
			rollbackActions = append(rollbackActions, action)
		}
	}

	if len(rollbackActions) == 0 {
		return fmt.Errorf("no rollback actions found for change %s", changeID)
	}

	// Execute rollback actions in reverse order
	for i := len(rollbackActions) - 1; i >= 0; i-- {
		action := rollbackActions[i]
		if action.Command != "" {
			cmd := exec.Command("bash", "-c", action.Command)
			if err := cmd.Run(); err != nil {
				fmt.Printf("Warning: Rollback failed for %s: %v\n", action.Description, err)
			} else {
				fmt.Printf("✅ Rolled back: %s\n", action.Description)
			}
		}
	}

	return nil
}

// GetAppliedChanges returns the history of applied changes
func (ca *ConfigurationApplier) GetAppliedChanges() []AppliedChange {
	return ca.appliedChanges
}

// UpdateChangeImpact records the performance impact after applying changes
func (ca *ConfigurationApplier) UpdateChangeImpact(changeID string, afterMetrics SystemTelemetry) error {
	for i, change := range ca.appliedChanges {
		if change.ID == changeID {
			ca.appliedChanges[i].Impact.AfterMetrics = afterMetrics
			
			// Calculate improvement (simplified)
			beforeCPU := change.Impact.BeforeMetrics.CPU.UsagePercent
			afterCPU := afterMetrics.CPU.UsagePercent
			improvement := beforeCPU - afterCPU
			
			ca.appliedChanges[i].Impact.Improvement = improvement
			ca.appliedChanges[i].Impact.Description = fmt.Sprintf("CPU usage changed by %.1f%%", -improvement)
			
			return nil
		}
	}
	
	return fmt.Errorf("change %s not found", changeID)
}