package simplejson

import (
	"fmt"
	"os"
	"testing"
)

func TestMemoryBasicOperations(t *testing.T) {
	// Create temporary test file
	testPath := "./test_memory.json"
	defer os.Remove(testPath)
	
	// Create memory instance
	mem := NewMemory(testPath, 100)
	
	// Test SetPreference and GetPreference
	err := mem.SetPreference("theme", "dark")
	if err != nil {
		t.Fatalf("Failed to set preference: %v", err)
	}
	
	val, exists := mem.GetPreference("theme")
	if !exists {
		t.Fatal("Preference not found")
	}
	if val != "dark" {
		t.Fatalf("Expected 'dark', got %v", val)
	}
	
	// Test RecordAction and GetPatterns
	for i := 0; i < 5; i++ {
		mem.RecordAction("test_action", map[string]interface{}{
			"iteration": i,
		})
	}
	
	patterns := mem.GetPatterns(0.0)
	if len(patterns) != 1 {
		t.Fatalf("Expected 1 pattern, got %d", len(patterns))
	}
	if patterns[0].Count != 5 {
		t.Fatalf("Expected count 5, got %d", patterns[0].Count)
	}
	
	// Test AddContext and SearchContext
	mem.AddContext("test", map[string]interface{}{
		"message": "hello world",
	}, []string{"greeting", "test"})
	
	results := mem.SearchContext("hello", 10)
	if len(results) == 0 {
		t.Fatal("Search should return results")
	}
	
	// Test Save and Load
	err = mem.Save()
	if err != nil {
		t.Fatalf("Failed to save: %v", err)
	}
	
	// Create new instance and load
	mem2 := NewMemory(testPath, 100)
	err = mem2.Load()
	if err != nil {
		t.Fatalf("Failed to load: %v", err)
	}
	
	// Verify loaded data
	val2, exists2 := mem2.GetPreference("theme")
	if !exists2 || val2 != "dark" {
		t.Fatal("Loaded preference doesn't match")
	}
	
	patterns2 := mem2.GetPatterns(0.0)
	if len(patterns2) != 1 || patterns2[0].Count != 5 {
		t.Fatal("Loaded patterns don't match")
	}
}

func TestMemoryConcurrency(t *testing.T) {
	testPath := "./test_concurrent.json"
	defer os.Remove(testPath)
	
	mem := NewMemory(testPath, 1000)
	done := make(chan bool, 3)
	
	// Concurrent writes
	go func() {
		for i := 0; i < 100; i++ {
			mem.SetPreference(fmt.Sprintf("key_%d", i), i)
		}
		done <- true
	}()
	
	// Concurrent reads
	go func() {
		for i := 0; i < 100; i++ {
			mem.GetPreference("theme")
		}
		done <- true
	}()
	
	// Concurrent actions
	go func() {
		for i := 0; i < 100; i++ {
			mem.RecordAction("concurrent_test", nil)
		}
		done <- true
	}()
	
	// Wait for all goroutines
	for i := 0; i < 3; i++ {
		<-done
	}
	
	// Verify no data corruption
	stats := mem.Stats()
	t.Logf("Stats after concurrent operations: %+v", stats)
}

func BenchmarkSetPreference(b *testing.B) {
	mem := NewMemory("", 1000)
	mem.autoSaveEnabled = false
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mem.SetPreference("key", "value")
	}
}

func BenchmarkSearchContext(b *testing.B) {
	mem := NewMemory("", 1000)
	mem.autoSaveEnabled = false
	
	// Add test data
	for i := 0; i < 1000; i++ {
		mem.AddContext("test", map[string]interface{}{
			"index": i,
			"data":  "test data for searching",
		}, []string{"test", "data"})
	}
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mem.SearchContext("test", 10)
	}
}