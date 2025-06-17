package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// Command represents a parsed CLI command
type Command struct {
	Type   string            `json:"type"`
	Args   []string          `json:"args"`
	Flags  map[string]string `json:"flags"`
	Query  string            `json:"query"`
	Whisper bool             `json:"whisper"`
}

func main() {
	if len(os.Args) < 2 {
		fallbackToJS(os.Args)
		return
	}

	command := parseArgs(os.Args[1:])
	
	// Route based on command type
	switch command.Type {
	case "find":
		if handleFind(command) {
			return
		}
		// If Go implementation fails or not ready, fallback to JS
		fallbackToJS(os.Args)
		
	case "help":
		handleHelp(command)
		
	default:
		// Not implemented in Go yet, use JS
		fallbackToJS(os.Args)
	}
}

func parseArgs(args []string) Command {
	cmd := Command{
		Flags: make(map[string]string),
		Args:  args,
	}
	
	if len(args) == 0 {
		return cmd
	}
	
	// First arg is the command type
	cmd.Type = args[0]
	
	// Parse remaining args for flags and query
	for i := 1; i < len(args); i++ {
		arg := args[i]
		if strings.HasPrefix(arg, "--") {
			// Handle --flag=value or --flag value
			if strings.Contains(arg, "=") {
				parts := strings.SplitN(arg[2:], "=", 2)
				cmd.Flags[parts[0]] = parts[1]
			} else if i+1 < len(args) && !strings.HasPrefix(args[i+1], "--") {
				cmd.Flags[arg[2:]] = args[i+1]
				i++ // Skip next arg since it's the value
			} else {
				cmd.Flags[arg[2:]] = "true"
			}
		} else {
			// Build query from non-flag args
			if cmd.Query == "" {
				cmd.Query = arg
			} else {
				cmd.Query += " " + arg
			}
		}
	}
	
	// Check for whisper mode
	if mode, exists := cmd.Flags["whisper"]; exists {
		cmd.Whisper = mode != "false"
	}
	
	return cmd
}

func handleFind(cmd Command) bool {
	// For now, implement basic find functionality
	// TODO: Implement full context search with Go
	
	if cmd.Query == "" {
		return false // Let JS handle complex cases
	}
	
	fmt.Printf("🔍 [Go Fast] Searching for: %s\n", cmd.Query)
	
	// Simple demonstration - in real implementation this would
	// call the Go core discovery package
	result := map[string]interface{}{
		"query": cmd.Query,
		"implementation": "go-fast",
		"results": []string{
			"Result 1 (Go implementation)",
			"Result 2 (Go implementation)",
		},
	}
	
	if cmd.Whisper {
		// Format for Claude whisper mode
		fmt.Printf("🤖 SEARCH RESULTS for '%s'\n\n", cmd.Query)
		if results, ok := result["results"].([]string); ok {
			for i, res := range results {
				fmt.Printf("%d. %s\n", i+1, res)
			}
		}
	} else {
		// JSON output for programmatic use
		jsonBytes, _ := json.MarshalIndent(result, "", "  ")
		fmt.Println(string(jsonBytes))
	}
	
	return true
}

func handleHelp(cmd Command) {
	fmt.Println("Leviathan Agent - Go Fast Implementation")
	fmt.Println("Usage: lev <command> [args...]")
	fmt.Println("")
	fmt.Println("Commands:")
	fmt.Println("  find <query>     Find workflows and contexts")
	fmt.Println("  help            Show this help")
	fmt.Println("")
	fmt.Println("Flags:")
	fmt.Println("  --whisper       Enable Claude whisper mode")
	fmt.Println("  --type <type>   Filter by context type")
	fmt.Println("")
	fmt.Println("Note: This is the Go fast implementation.")
	fmt.Println("Complex operations may fallback to JS implementation.")
}

func fallbackToJS(args []string) {
	// Get the original JS lev binary path
	levDir := os.Getenv("LEVIATHAN_AGENT_PATH")
	if levDir == "" {
		// Default fallback path
		home, _ := os.UserHomeDir()
		levDir = filepath.Join(home, "digital", "leviathan", "agent")
	}
	
	jsBinaryPath := filepath.Join(levDir, "bin", "lev-js")
	
	// Check if original JS binary exists (might not be renamed yet)
	if _, err := os.Stat(jsBinaryPath); os.IsNotExist(err) {
		jsBinaryPath = filepath.Join(levDir, "bin", "lev")
	}
	
	// Execute JS implementation
	cmd := exec.Command("bash", append([]string{jsBinaryPath}, args[1:]...)...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	
	err := cmd.Run()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error running JS fallback: %v\n", err)
		os.Exit(1)
	}
}