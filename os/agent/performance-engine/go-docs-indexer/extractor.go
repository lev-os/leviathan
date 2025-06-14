package main

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"runtime"
	"strings"
)

func extractGoDocumentation(goRoot string) ([]DocChunk, error) {
	var chunks []DocChunk
	srcPath := filepath.Join(goRoot, "src")

	err := filepath.Walk(srcPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Only process .go files in standard library
		if !strings.HasSuffix(path, ".go") || strings.Contains(path, "testdata") {
			return nil
		}

		// Parse the Go file
		fset := token.NewFileSet()
		file, err := parser.ParseFile(fset, path, nil, parser.ParseComments)
		if err != nil {
			return nil // Skip files with parse errors
		}

		// Extract package-level documentation
		packageChunks := extractPackageDoc(file, path, fset)
		chunks = append(chunks, packageChunks...)

		// Extract function/type documentation
		declChunks := extractDeclarationDocs(file, path, fset)
		chunks = append(chunks, declChunks...)

		return nil
	})

	return chunks, err
}

func extractPackageDoc(file *ast.File, filePath string, fset *token.FileSet) []DocChunk {
	var chunks []DocChunk

	if file.Doc != nil && file.Doc.Text() != "" {
		relPath, _ := filepath.Rel(filepath.Join(runtime.GOROOT(), "src"), filePath)
		packageName := filepath.Dir(relPath)

		chunk := DocChunk{
			ID:            fmt.Sprintf("pkg_%s", strings.ReplaceAll(packageName, "/", "_")),
			Type:          "package",
			Package:       packageName,
			Name:          file.Name.Name,
			Documentation: file.Doc.Text(),
			Metadata: map[string]string{
				"file_path": filePath,
				"source":    "golang_stdlib",
			},
		}
		chunks = append(chunks, chunk)
	}

	return chunks
}

func extractDeclarationDocs(file *ast.File, filePath string, fset *token.FileSet) []DocChunk {
	var chunks []DocChunk
	relPath, _ := filepath.Rel(filepath.Join(runtime.GOROOT(), "src"), filePath)
	packageName := filepath.Dir(relPath)

	for _, decl := range file.Decls {
		switch d := decl.(type) {
		case *ast.FuncDecl:
			if d.Doc != nil && d.Doc.Text() != "" {
				chunk := DocChunk{
					ID:            fmt.Sprintf("func_%s_%s", strings.ReplaceAll(packageName, "/", "_"), d.Name.Name),
					Type:          "function",
					Package:       packageName,
					Name:          d.Name.Name,
					Documentation: d.Doc.Text(),
					Signature:     fmt.Sprintf("func %s", d.Name.Name),
					Metadata: map[string]string{
						"file_path": filePath,
						"source":    "golang_stdlib",
					},
				}
				chunks = append(chunks, chunk)
			}
		case *ast.GenDecl:
			for _, spec := range d.Specs {
				switch s := spec.(type) {
				case *ast.TypeSpec:
					if d.Doc != nil && d.Doc.Text() != "" {
						chunk := DocChunk{
							ID:            fmt.Sprintf("type_%s_%s", strings.ReplaceAll(packageName, "/", "_"), s.Name.Name),
							Type:          "type",
							Package:       packageName,
							Name:          s.Name.Name,
							Documentation: d.Doc.Text(),
							Signature:     fmt.Sprintf("type %s", s.Name.Name),
							Metadata: map[string]string{
								"file_path": filePath,
								"source":    "golang_stdlib",
							},
						}
						chunks = append(chunks, chunk)
					}
				}
			}
		}
	}

	return chunks
}