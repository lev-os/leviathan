package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"runtime"
)

// DocChunk represents a semantic chunk of Go documentation
type DocChunk struct {
	ID            string            `json:"id"`
	Type          string            `json:"type"` // "package", "function", "type", "method"
	Package       string            `json:"package"`
	Name          string            `json:"name"`
	Documentation string            `json:"documentation"`
	Code          string            `json:"code,omitempty"`
	Signature     string            `json:"signature,omitempty"`
	Metadata      map[string]string `json:"metadata"`
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go-docs-indexer <output-file> [go-root-path]")
		os.Exit(1)
	}

	outputFile := os.Args[1]
	goRoot := runtime.GOROOT()
	if len(os.Args) > 2 {
		goRoot = os.Args[2]
	}

	fmt.Printf("🔍 Indexing Go documentation from: %s\n", goRoot)

	chunks, err := extractGoDocumentation(goRoot)
	if err != nil {
		log.Fatalf("Error extracting documentation: %v", err)
	}

	fmt.Printf("📚 Extracted %d documentation chunks\n", len(chunks))

	// Write to JSON file for Qdrant ingestion
	if err := writeChunksToFile(chunks, outputFile); err != nil {
		log.Fatalf("Error writing chunks: %v", err)
	}

	fmt.Printf("✅ Documentation indexed to: %s\n", outputFile)
}

func writeChunksToFile(chunks []DocChunk, filename string) error {
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	
	return encoder.Encode(chunks)
}