"""
Automated setup for new projects in the semantic search system.
Implements the replicable deployment pattern.
"""

import json
import logging
import argparse
import os
from pathlib import Path
from typing import Dict, List, Any, Optional
import yaml
from dataclasses import asdict

from ..config.settings import SystemConfig, get_project_template, PROJECT_TEMPLATES
from ..setup.collection_manager import CollectionManager
from ..schemas.metadata import ContentType, Scope, create_principle_metadata


logger = logging.getLogger(__name__)


class ProjectSetup:
    """Automated project setup for semantic search."""
    
    def __init__(self, config: SystemConfig = None):
        self.config = config or SystemConfig.from_env()
        self.collection_manager = CollectionManager(self.config)
    
    def create_project_config(
        self, 
        project_name: str, 
        framework: str,
        description: str = "",
        custom_settings: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create project-specific configuration."""
        
        template = get_project_template(framework)
        
        project_config = {
            "project": {
                "name": project_name,
                "framework": framework,
                "description": description,
                "created_at": "",
                "version": "1.0.0"
            },
            "collections": {
                "framework_docs": f"project-{project_name}-framework-docs",
                "requirements": f"project-{project_name}-requirements", 
                "local_principles": f"project-{project_name}-local-principles"
            },
            "template": template,
            "ingestion": {
                "batch_size": self.config.ingestion.batch_size,
                "chunk_size": self._get_chunk_size_for_framework(framework),
                "extract_code_examples": True,
                "auto_update": True
            },
            "search": {
                "default_collections": template["default_collections"],
                "enable_cross_project": True,
                "score_threshold": 0.7
            }
        }
        
        # Merge custom settings
        if custom_settings:
            self._deep_merge(project_config, custom_settings)
        
        return project_config
    
    def _get_chunk_size_for_framework(self, framework: str) -> int:
        """Get optimal chunk size for framework."""
        chunk_sizes = {
            "go": self.config.ingestion.go_docs_chunk_size,
            "python": 350,
            "javascript": 300,
            "typescript": 300,
            "react": 400,
            "vue": 400,
            "java": 450,
            "csharp": 400,
            "rust": 350
        }
        return chunk_sizes.get(framework, self.config.ingestion.max_chunk_size)
    
    def _deep_merge(self, base_dict: Dict, update_dict: Dict):
        """Deep merge two dictionaries."""
        for key, value in update_dict.items():
            if key in base_dict and isinstance(base_dict[key], dict) and isinstance(value, dict):
                self._deep_merge(base_dict[key], value)
            else:
                base_dict[key] = value
    
    def create_project_collections(self, project_name: str) -> bool:
        """Create Qdrant collections for the project."""
        
        logger.info(f"Creating collections for project: {project_name}")
        
        success = self.collection_manager.setup_project_collections(project_name)
        
        if success:
            logger.info(f"✅ Collections created successfully for {project_name}")
        else:
            logger.error(f"❌ Failed to create collections for {project_name}")
        
        return success
    
    def create_default_principles(
        self, 
        project_name: str, 
        framework: str
    ) -> List[Dict[str, Any]]:
        """Create default programming principles for the project."""
        
        template = get_project_template(framework)
        principles = []
        
        # General principles
        general_principles = [
            {
                "title": "Code Clarity and Readability",
                "content": """
Write code that tells a story. Every function, variable, and class should have a clear purpose 
that can be understood by other developers. Use descriptive names and add comments for complex logic.

Examples:
- Use `calculateUserAge(birthDate)` instead of `calc(date)`
- Comment the 'why', not the 'what'
- Keep functions small and focused on a single responsibility
                """,
                "category": "code-quality",
                "authority": "team"
            },
            {
                "title": "Error Handling Standards",
                "content": f"""
Implement robust error handling appropriate for {framework}. Errors should be:
- Caught at the appropriate level
- Logged with sufficient context
- Handled gracefully without crashing the application
- Communicated clearly to users when necessary

For {framework}: Follow framework-specific error handling patterns and best practices.
                """,
                "category": "error-handling",
                "authority": "architect"
            },
            {
                "title": "Testing Strategy", 
                "content": """
Every feature should be tested at appropriate levels:
- Unit tests for individual functions/methods
- Integration tests for component interactions
- End-to-end tests for critical user flows

Aim for meaningful coverage, not just high percentages. Write tests that verify behavior, not implementation details.
                """,
                "category": "testing",
                "authority": "team"
            }
        ]
        
        # Framework-specific principles
        framework_specific = self._get_framework_specific_principles(framework)
        
        all_principle_texts = general_principles + framework_specific
        
        for i, principle_data in enumerate(all_principle_texts):
            principle_id = f"{project_name}-principle-{i+1}"
            
            metadata = create_principle_metadata(
                id=principle_id,
                project=project_name,
                scope=Scope.PROJECT,
                authority=principle_data.get("authority", "team"),
                tags=[principle_data["category"], framework],
                keywords=[principle_data["category"], "best-practices", framework],
                summary=principle_data["title"],
                custom_fields={
                    "category": principle_data["category"],
                    "framework": framework,
                    "title": principle_data["title"]
                }
            )
            
            principles.append({
                "content": f"# {principle_data['title']}\n\n{principle_data['content'].strip()}",
                "metadata": metadata.to_dict()
            })
        
        return principles
    
    def _get_framework_specific_principles(self, framework: str) -> List[Dict[str, Any]]:
        """Get framework-specific programming principles."""
        
        framework_principles = {
            "go": [
                {
                    "title": "Go Concurrency Best Practices",
                    "content": """
Use Go's concurrency primitives (goroutines, channels) responsibly:
- Prefer channels for communication between goroutines
- Use sync package for simple mutual exclusion
- Always handle context cancellation in long-running operations
- Avoid shared mutable state when possible
                    """,
                    "category": "concurrency",
                    "authority": "architect"
                },
                {
                    "title": "Go Error Handling Idioms", 
                    "content": """
Follow Go's explicit error handling patterns:
- Check errors immediately after they occur
- Wrap errors with context using fmt.Errorf or errors.Wrap
- Don't ignore errors unless you have a very good reason
- Use sentinel errors for expected error conditions
                    """,
                    "category": "error-handling",
                    "authority": "architect"
                }
            ],
            "react": [
                {
                    "title": "React Component Design",
                    "content": """
Design components with clear responsibilities:
- Keep components small and focused
- Use props for configuration, not complex objects
- Prefer composition over inheritance
- Extract custom hooks for reusable logic
                    """,
                    "category": "component-design",
                    "authority": "architect"
                },
                {
                    "title": "State Management Strategy",
                    "content": """
Manage state at the appropriate level:
- Use local state for component-specific data
- Lift state up when multiple components need it
- Use context sparingly for truly global state
- Consider state management libraries for complex state
                    """,
                    "category": "state-management", 
                    "authority": "architect"
                }
            ],
            "python": [
                {
                    "title": "Python Code Style (PEP 8)",
                    "content": """
Follow PEP 8 style guidelines:
- Use 4 spaces for indentation
- Keep line length under 88 characters (Black formatter)
- Use snake_case for variables and functions
- Use PascalCase for classes
- Add docstrings for all public functions and classes
                    """,
                    "category": "code-style",
                    "authority": "team"
                },
                {
                    "title": "Python Async Best Practices",
                    "content": """
Use async/await properly:
- Use async for I/O bound operations
- Don't block the event loop with CPU-intensive tasks
- Use asyncio.gather() for concurrent operations
- Handle exceptions in async functions properly
                    """,
                    "category": "async",
                    "authority": "architect"
                }
            ]
        }
        
        return framework_principles.get(framework, [])
    
    def generate_project_structure(
        self, 
        project_name: str,
        output_dir: str
    ) -> Dict[str, str]:
        """Generate directory structure for the project."""
        
        output_path = Path(output_dir) / project_name
        output_path.mkdir(parents=True, exist_ok=True)
        
        directories = {
            "docs": output_path / "docs",
            "requirements": output_path / "requirements", 
            "principles": output_path / "principles",
            "config": output_path / "config",
            "scripts": output_path / "scripts"
        }
        
        for name, path in directories.items():
            path.mkdir(exist_ok=True)
            
            # Create README files
            readme_path = path / "README.md"
            readme_content = f"# {name.title()}\n\n{self._get_directory_description(name)}"
            readme_path.write_text(readme_content)
        
        return {name: str(path) for name, path in directories.items()}
    
    def _get_directory_description(self, directory_name: str) -> str:
        """Get description for project directories."""
        descriptions = {
            "docs": "Framework documentation and technical specifications",
            "requirements": "Project requirements, user stories, and acceptance criteria",
            "principles": "Programming principles and team guidelines",
            "config": "Configuration files for semantic search",
            "scripts": "Automation scripts for ingestion and maintenance"
        }
        return descriptions.get(directory_name, f"Files related to {directory_name}")
    
    def create_ingestion_script(
        self, 
        project_name: str, 
        framework: str,
        output_dir: str
    ) -> str:
        """Create custom ingestion script for the project."""
        
        script_content = f'''#!/usr/bin/env python3
"""
Ingestion script for {project_name} semantic search.
Framework: {framework}
"""

import sys
import os
import logging
from pathlib import Path

# Add semantic search to path
semantic_search_path = Path(__file__).parent.parent.parent / "semantic-search"
sys.path.insert(0, str(semantic_search_path))

from ingestion.go_docs_ingester import GoDocsIngester
from config.settings import SystemConfig

def main():
    """Main ingestion function for {project_name}."""
    
    # Set up logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger = logging.getLogger(__name__)
    logger.info("Starting ingestion for {project_name}")
    
    # Initialize config
    config = SystemConfig.from_env()
    
    # TODO: Customize ingestion logic for {framework}
    # Example for Go:
    # ingester = GoDocsIngester(config)
    # result = ingester.ingest_go_docs("path/to/docs.json")
    
    logger.info("Ingestion completed for {project_name}")

if __name__ == "__main__":
    main()
'''
        
        script_path = Path(output_dir) / project_name / "scripts" / "ingest.py"
        script_path.write_text(script_content)
        script_path.chmod(0o755)
        
        return str(script_path)
    
    def setup_complete_project(
        self,
        project_name: str,
        framework: str,
        description: str = "",
        output_dir: str = "./projects",
        create_collections: bool = True,
        custom_settings: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Complete project setup pipeline."""
        
        logger.info(f"🚀 Setting up project: {project_name} (framework: {framework})")
        
        setup_result = {
            "project_name": project_name,
            "framework": framework,
            "status": "in_progress",
            "steps": {}
        }
        
        try:
            # Step 1: Create project configuration
            logger.info("📋 Creating project configuration...")
            project_config = self.create_project_config(
                project_name, framework, description, custom_settings
            )
            setup_result["steps"]["config"] = "✅ completed"
            
            # Step 2: Create collections (if requested)
            if create_collections:
                logger.info("🗄️ Creating Qdrant collections...")
                collections_success = self.create_project_collections(project_name)
                setup_result["steps"]["collections"] = "✅ completed" if collections_success else "❌ failed"
            else:
                setup_result["steps"]["collections"] = "⏭️ skipped"
            
            # Step 3: Generate directory structure
            logger.info("📁 Generating project structure...")
            directories = self.generate_project_structure(project_name, output_dir)
            setup_result["steps"]["structure"] = "✅ completed"
            
            # Step 4: Create default principles
            logger.info("📜 Creating default programming principles...")
            principles = self.create_default_principles(project_name, framework)
            setup_result["steps"]["principles"] = "✅ completed"
            
            # Step 5: Save configuration files
            logger.info("💾 Saving configuration files...")
            config_dir = Path(directories["config"])
            
            # Save project config
            (config_dir / "project.json").write_text(
                json.dumps(project_config, indent=2)
            )
            
            # Save principles
            (config_dir / "principles.json").write_text(
                json.dumps(principles, indent=2)
            )
            
            setup_result["steps"]["config_files"] = "✅ completed"
            
            # Step 6: Create ingestion script
            logger.info("📜 Creating ingestion script...")
            script_path = self.create_ingestion_script(project_name, framework, output_dir)
            setup_result["steps"]["scripts"] = "✅ completed"
            
            setup_result["status"] = "✅ completed"
            setup_result["config"] = project_config
            setup_result["directories"] = directories
            setup_result["script_path"] = script_path
            setup_result["principles_count"] = len(principles)
            
            logger.info(f"🎉 Project {project_name} setup completed successfully!")
            
        except Exception as e:
            logger.error(f"❌ Project setup failed: {e}")
            setup_result["status"] = "❌ failed"
            setup_result["error"] = str(e)
        
        return setup_result


def main():
    """CLI entry point for project setup."""
    
    parser = argparse.ArgumentParser(description="Set up new project for semantic search")
    parser.add_argument("project_name", help="Name of the project")
    parser.add_argument("framework", help="Primary framework/language", 
                       choices=list(PROJECT_TEMPLATES.keys()).extend(["go", "python", "javascript", "typescript", "react", "vue", "java", "csharp", "rust"]))
    parser.add_argument("--description", help="Project description")
    parser.add_argument("--output-dir", default="./projects", help="Output directory")
    parser.add_argument("--skip-collections", action="store_true", help="Skip creating Qdrant collections")
    parser.add_argument("--config-file", help="Custom configuration file")
    
    args = parser.parse_args()
    
    # Set up logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Load custom settings if provided
    custom_settings = None
    if args.config_file and os.path.exists(args.config_file):
        with open(args.config_file, 'r') as f:
            if args.config_file.endswith('.json'):
                custom_settings = json.load(f)
            elif args.config_file.endswith('.yaml') or args.config_file.endswith('.yml'):
                custom_settings = yaml.safe_load(f)
    
    # Run setup
    setup = ProjectSetup()
    result = setup.setup_complete_project(
        project_name=args.project_name,
        framework=args.framework,
        description=args.description or "",
        output_dir=args.output_dir,
        create_collections=not args.skip_collections,
        custom_settings=custom_settings
    )
    
    # Print results
    print(f"\n{'='*60}")
    print(f"PROJECT SETUP RESULTS: {result['project_name']}")
    print(f"{'='*60}")
    print(f"Status: {result['status']}")
    print(f"Framework: {result['framework']}")
    
    if result['status'] == "✅ completed":
        print(f"\nSetup Steps:")
        for step, status in result['steps'].items():
            print(f"  {step}: {status}")
        
        print(f"\nFiles Created:")
        print(f"  Project directories: {len(result['directories'])} created")
        print(f"  Programming principles: {result['principles_count']} created")
        print(f"  Ingestion script: {result['script_path']}")
        
        print(f"\nNext Steps:")
        print(f"  1. Add your documentation to the docs/ directory")
        print(f"  2. Run the ingestion script: python {result['script_path']}")
        print(f"  3. Start the search API: python -m api.search_api")
        print(f"  4. Test search: curl 'http://localhost:8000/search?query=your+query'")
    
    else:
        print(f"\nError: {result.get('error', 'Unknown error')}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())