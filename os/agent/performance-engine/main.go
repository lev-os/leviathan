package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/kingly/performance-engine/internal/embedding"
	"github.com/kingly/performance-engine/internal/workflow"
)

type Config struct {
	InputDir     string `json:"input_dir"`
	OutputCache  string `json:"output_cache"`
	BatchSize    int    `json:"batch_size"`
	APIKey       string `json:"api_key"`
	Concurrency  int    `json:"concurrency"`
}

func main() {
	var (
		inputDir    = flag.String("input", "", "Input directory containing workflows")
		outputCache = flag.String("output", "", "Output cache file path")
		batchSize   = flag.Int("batch-size", 100, "Batch size for embedding requests")
		configFile  = flag.String("config", "", "JSON config file path")
		benchmark   = flag.Bool("benchmark", false, "Run performance benchmark")
	)
	flag.Parse()

	// Load configuration
	config := &Config{
		InputDir:    *inputDir,
		OutputCache: *outputCache,
		BatchSize:   *batchSize,
		Concurrency: 4, // Default concurrency
	}

	if *configFile != "" {
		if err := loadConfig(*configFile, config); err != nil {
			log.Fatalf("Failed to load config: %v", err)
		}
	}

	// Validate required parameters
	if config.InputDir == "" || config.OutputCache == "" {
		flag.Usage()
		os.Exit(1)
	}

	// Get API key from environment if not in config
	if config.APIKey == "" {
		config.APIKey = os.Getenv("OPENAI_API_KEY")
		if config.APIKey == "" {
			log.Fatal("OPENAI_API_KEY environment variable required")
		}
	}

	start := time.Now()
	
	if *benchmark {
		runBenchmark(config)
	} else {
		runEmbeddingGeneration(config)
	}
	
	duration := time.Since(start)
	fmt.Printf("✅ Completed in %v\n", duration)
}

func loadConfig(path string, config *Config) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, config)
}

func runEmbeddingGeneration(config *Config) {
	fmt.Printf("🚀 Starting embedding generation\n")
	fmt.Printf("📁 Input: %s\n", config.InputDir)
	fmt.Printf("💾 Output: %s\n", config.OutputCache)
	fmt.Printf("📦 Batch size: %d\n", config.BatchSize)

	// Initialize workflow processor
	processor := workflow.NewProcessor(config.InputDir)
	
	// Discover and parse workflows
	workflows, err := processor.DiscoverWorkflows()
	if err != nil {
		log.Fatalf("Failed to discover workflows: %v", err)
	}
	
	fmt.Printf("📋 Found %d workflows\n", len(workflows))

	// Initialize embedding client
	embeddingClient := embedding.NewClient(config.APIKey, config.BatchSize)
	
	// Generate embeddings
	cache, err := embeddingClient.GenerateEmbeddings(workflows, config.Concurrency)
	if err != nil {
		log.Fatalf("Failed to generate embeddings: %v", err)
	}

	// Save cache
	if err := cache.SaveToFile(config.OutputCache); err != nil {
		log.Fatalf("Failed to save cache: %v", err)
	}

	fmt.Printf("✅ Generated embeddings for %d workflows\n", len(workflows))
}

func runBenchmark(config *Config) {
	fmt.Printf("⚡ Running performance benchmark\n")
	
	// Create multiple test runs
	iterations := 3
	var durations []time.Duration
	
	for i := 0; i < iterations; i++ {
		start := time.Now()
		runEmbeddingGeneration(config)
		duration := time.Since(start)
		durations = append(durations, duration)
		fmt.Printf("Run %d: %v\n", i+1, duration)
	}
	
	// Calculate average
	var total time.Duration
	for _, d := range durations {
		total += d
	}
	average := total / time.Duration(len(durations))
	
	fmt.Printf("📊 Average time: %v\n", average)
	fmt.Printf("🎯 Target: <5s for cache rebuild\n")
	
	if average < 5*time.Second {
		fmt.Printf("✅ Performance target achieved!\n")
	} else {
		fmt.Printf("⚠️  Performance target not met\n")
	}
}