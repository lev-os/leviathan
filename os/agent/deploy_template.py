#!/usr/bin/env python3
"""Template-based deployment system for semantic search across projects."""

import json
import os
from pathlib import Path
from typing import Dict, List, Any
from dataclasses import dataclass, asdict
from enum import Enum

class Framework(str, Enum):
    GO = "go"
    PYTHON = "python"
    REACT = "react"
    RUST = "rust"
    JAVASCRIPT = "javascript"

@dataclass
class ProjectTemplate:
    name: str
    framework: Framework
    description: str
    collections: Dict[str, str]
    sample_principles: List[str]
    ingestion_patterns: List[str]

class DeploymentManager:
    """Manages template-based deployment for new projects."""
    
    def __init__(self):
        self.templates = self._load_templates()
    
    def _load_templates(self) -> Dict[Framework, ProjectTemplate]:
        """Load project templates for different frameworks."""
        templates = {
            Framework.GO: ProjectTemplate(
                name="go-project",
                framework=Framework.GO,
                description="Go language project with stdlib and module documentation",
                collections={
                    "framework_docs": "project-{name}-framework-docs",
                    "requirements": "project-{name}-requirements", 
                    "local_principles": "project-{name}-local-principles"
                },
                sample_principles=[
                    "Use Go's built-in error handling patterns",
                    "Prefer composition over inheritance",
                    "Keep interfaces small and focused",
                    "Use gofmt for consistent code formatting",
                    "Write clear, descriptive variable names",
                    "Use channels for goroutine communication",
                    "Handle errors explicitly, don't ignore them"
                ],
                ingestion_patterns=[
                    "**/*.go",
                    "go.mod",
                    "go.sum", 
                    "README.md",
                    "docs/**/*.md"
                ]
            ),
            Framework.PYTHON: ProjectTemplate(
                name="python-project",
                framework=Framework.PYTHON,
                description="Python project with stdlib and package documentation",
                collections={
                    "framework_docs": "project-{name}-framework-docs",
                    "requirements": "project-{name}-requirements",
                    "local_principles": "project-{name}-local-principles"
                },
                sample_principles=[
                    "Follow PEP 8 style guidelines",
                    "Use type hints for better code clarity",
                    "Write docstrings for all public functions",
                    "Prefer list comprehensions over loops when appropriate",
                    "Use virtual environments for dependency isolation",
                    "Handle exceptions explicitly with try/except",
                    "Use descriptive variable and function names"
                ],
                ingestion_patterns=[
                    "**/*.py",
                    "requirements.txt",
                    "pyproject.toml",
                    "README.md",
                    "docs/**/*.md"
                ]
            ),
            Framework.REACT: ProjectTemplate(
                name="react-project", 
                framework=Framework.REACT,
                description="React project with component and hooks documentation",
                collections={
                    "framework_docs": "project-{name}-framework-docs",
                    "requirements": "project-{name}-requirements",
                    "local_principles": "project-{name}-local-principles"
                },
                sample_principles=[
                    "Use functional components with hooks",
                    "Keep components small and focused",
                    "Use TypeScript for type safety",
                    "Implement proper error boundaries",
                    "Use meaningful prop names and types",
                    "Optimize performance with React.memo when needed",
                    "Follow consistent naming conventions"
                ],
                ingestion_patterns=[
                    "src/**/*.{js,jsx,ts,tsx}",
                    "package.json",
                    "tsconfig.json",
                    "README.md",
                    "docs/**/*.md"
                ]
            )
        }
        return templates
    
    def create_project_structure(self, project_name: str, framework: Framework, base_path: str = ".") -> Dict[str, Any]:
        """Create complete project structure from template."""
        template = self.templates[framework]
        project_path = Path(base_path) / f"semantic-search-{project_name}"
        
        # Create directory structure
        directories = [
            project_path,
            project_path / "config",
            project_path / "data" / "principles",
            project_path / "data" / "requirements", 
            project_path / "data" / "framework_docs",
            project_path / "scripts"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
        
        # Generate collection names
        collections = {}
        for collection_type, collection_template in template.collections.items():
            collections[collection_type] = collection_template.format(name=project_name)
        
        # Create project configuration
        project_config = {
            "name": project_name,
            "framework": framework.value,
            "description": template.description,
            "collections": collections,
            "created_at": "2024-06-14",
            "version": "1.0.0"
        }
        
        # Write configuration file
        config_file = project_path / "config" / "project.json"
        with open(config_file, 'w') as f:
            json.dump(project_config, f, indent=2)
        
        # Create principles file
        principles_file = project_path / "data" / "principles" / "local_principles.md"
        with open(principles_file, 'w') as f:
            f.write(f"# {project_name.title()} Programming Principles\n\n")
            f.write(f"This document contains {framework.value} specific principles for the {project_name} project.\n\n")
            for i, principle in enumerate(template.sample_principles, 1):
                f.write(f"{i}. {principle}\n")
        
        # Create requirements template
        requirements_file = project_path / "data" / "requirements" / "project_requirements.md"
        with open(requirements_file, 'w') as f:
            f.write(f"# {project_name.title()} Requirements\n\n")
            f.write("## Functional Requirements\n\n")
            f.write("- [ ] Requirement 1\n")
            f.write("- [ ] Requirement 2\n\n")
            f.write("## Non-Functional Requirements\n\n")
            f.write("- [ ] Performance requirement\n")
            f.write("- [ ] Security requirement\n")
        
        # Create ingestion script
        ingestion_script = project_path / "scripts" / "ingest.py"
        with open(ingestion_script, 'w') as f:
            f.write(self._generate_ingestion_script(project_name, framework, template))
        
        # Create search script  
        search_script = project_path / "scripts" / "search.py"
        with open(search_script, 'w') as f:
            f.write(self._generate_search_script(project_name, collections))
        
        # Create README
        readme_file = project_path / "README.md"
        with open(readme_file, 'w') as f:
            f.write(self._generate_readme(project_name, framework, template))
        
        return {
            "project_name": project_name,
            "framework": framework.value,
            "project_path": str(project_path),
            "collections": collections,
            "files_created": [
                str(config_file),
                str(principles_file),
                str(requirements_file),
                str(ingestion_script),
                str(search_script),
                str(readme_file)
            ]
        }
    
    def _generate_ingestion_script(self, project_name: str, framework: Framework, template: ProjectTemplate) -> str:
        """Generate project-specific ingestion script."""
        return f'''#!/usr/bin/env python3
"""Ingestion script for {project_name} ({framework.value}) semantic search."""

import json
from pathlib import Path
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

def ingest_{framework.value}_docs():
    """Ingest {framework.value} documentation for {project_name}."""
    print("🚀 Starting {project_name} documentation ingestion...")
    
    # Initialize components
    model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
    client = QdrantClient(host="localhost", port=6333)
    
    # Collection names
    collections = {json.dumps(template.collections, indent=8).replace('"{name}"', f'"{project_name}"')}
    
    print("📚 Ready to ingest documentation")
    print("💡 Add your {framework.value} documentation files to data/framework_docs/")
    print("📋 Add requirements to data/requirements/")
    print("🎯 Add principles to data/principles/")

if __name__ == "__main__":
    ingest_{framework.value}_docs()
'''
    
    def _generate_search_script(self, project_name: str, collections: Dict[str, str]) -> str:
        """Generate project-specific search script."""
        return f'''#!/usr/bin/env python3
"""Search script for {project_name} semantic search."""

from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient

def search_{project_name.replace("-", "_")}(query: str, limit: int = 5):
    """Search {project_name} documentation."""
    print(f"🔍 Searching {project_name}: '{{query}}'")
    
    # Initialize components
    model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
    client = QdrantClient(host="localhost", port=6333)
    
    # Search collections
    collections = {json.dumps(collections, indent=8)}
    
    # Create query embedding
    query_embedding = model.encode([query], normalize_embeddings=True)[0]
    
    # Search framework docs
    results = client.query_points(
        collection_name=collections["framework_docs"],
        query=query_embedding.tolist(),
        limit=limit
    )
    
    print(f"📊 Found {{len(results.points)}} results:")
    for i, result in enumerate(results.points, 1):
        print(f"  {{i}}. Score: {{result.score:.3f}}")
        print(f"     Content: {{result.payload.get('content', '')[:100]}}...")

if __name__ == "__main__":
    search_{project_name.replace("-", "_")}("your search query here")
'''
    
    def _generate_readme(self, project_name: str, framework: Framework, template: ProjectTemplate) -> str:
        """Generate project README."""
        return f'''# {project_name.title()} Semantic Search

{template.description}

## Overview

This project implements semantic search for {project_name} using:
- **Framework**: {framework.value}
- **Vector Database**: Qdrant
- **Embeddings**: sentence-transformers/all-mpnet-base-v2
- **Search Types**: Framework docs, Requirements, Local principles

## Collections

- `{template.collections["framework_docs"].format(name=project_name)}` - Framework documentation
- `{template.collections["requirements"].format(name=project_name)}` - Project requirements  
- `{template.collections["local_principles"].format(name=project_name)}` - Local programming principles

## Usage

### 1. Start Qdrant
```bash
docker run -d --name qdrant -p 6333:6333 qdrant/qdrant:latest
```

### 2. Ingest Documentation
```bash
python scripts/ingest.py
```

### 3. Search
```bash
python scripts/search.py
```

## Directory Structure

```
{project_name}/
├── config/
│   └── project.json          # Project configuration
├── data/
│   ├── framework_docs/       # Framework documentation files
│   ├── requirements/         # Project requirements
│   └── principles/           # Programming principles
├── scripts/
│   ├── ingest.py            # Data ingestion script
│   └── search.py            # Search script
└── README.md
```

## Framework-Specific Principles

{chr(10).join(f"- {principle}" for principle in template.sample_principles)}

## API Integration

This project integrates with the multi-tier semantic search API at `http://localhost:8000`.

Example API call:
```bash
curl -X POST "http://localhost:8000/search" \\
  -H "Content-Type: application/json" \\
  -d '{{"query": "your search query", "project": "{project_name}"}}'
```
'''

def main():
    """Demonstrate template deployment system."""
    print("🏗️  Semantic Search Template Deployment System")
    print("=" * 50)
    
    manager = DeploymentManager()
    
    # Example deployments
    projects = [
        ("my-go-service", Framework.GO),
        ("data-analysis", Framework.PYTHON), 
        ("user-dashboard", Framework.REACT)
    ]
    
    for project_name, framework in projects:
        print(f"\\n📦 Creating {framework.value} project: {project_name}")
        
        result = manager.create_project_structure(project_name, framework)
        
        print(f"✅ Project created at: {result['project_path']}")
        print(f"📚 Collections: {list(result['collections'].values())}")
        print(f"📁 Files created: {len(result['files_created'])}")
    
    print(f"\\n🎉 Template deployment complete!")
    print("💡 Each project is ready for documentation ingestion")
    print("🔍 All projects can use the unified search API at http://localhost:8000")

if __name__ == "__main__":
    main()