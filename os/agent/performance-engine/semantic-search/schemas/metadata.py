"""
Unified metadata schema for multi-project semantic search system.
Supports three content types: framework docs, requirements, programming principles.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import List, Dict, Optional, Any
import json


class ContentType(Enum):
    FRAMEWORK = "framework"
    REQUIREMENT = "requirement"
    PRINCIPLE = "principle"


class Scope(Enum):
    GLOBAL = "global"
    PROJECT = "project"
    TEAM = "team"


class HierarchyLevel(Enum):
    FILE = "file"
    PACKAGE = "package"
    FUNCTION = "function"
    CONCEPT = "concept"
    MODULE = "module"
    CLASS = "class"


class DocumentType(Enum):
    API = "api"
    GUIDE = "guide"
    TUTORIAL = "tutorial"
    REFERENCE = "reference"
    STANDARD = "standard"
    POLICY = "policy"
    EXAMPLE = "example"
    USER_STORY = "user_story"
    ACCEPTANCE_CRITERIA = "acceptance_criteria"


@dataclass
class DocumentMetadata:
    """Unified metadata schema for all content types."""
    
    # Core identification
    id: str
    content_type: ContentType
    project: str
    
    # Content organization
    scope: Scope
    framework: Optional[str] = None
    document_type: DocumentType = DocumentType.REFERENCE
    hierarchy_level: HierarchyLevel = HierarchyLevel.CONCEPT
    
    # Versioning and authority
    version: str = "1.0.0"
    authority: str = "team"  # team|architect|external
    
    # Relationships
    related_ids: List[str] = field(default_factory=list)
    parent_id: Optional[str] = None
    child_ids: List[str] = field(default_factory=list)
    
    # Source tracking
    source_file: str = ""
    source_url: Optional[str] = None
    last_modified: datetime = field(default_factory=datetime.now)
    
    # Content specifics
    tags: List[str] = field(default_factory=list)
    priority: Optional[str] = None  # For requirements: high|medium|low
    status: Optional[str] = None    # For requirements: draft|active|deprecated
    
    # Search optimization
    keywords: List[str] = field(default_factory=list)
    summary: str = ""
    
    # Custom fields for extensibility
    custom_fields: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for Qdrant payload."""
        return {
            "id": self.id,
            "content_type": self.content_type.value,
            "project": self.project,
            "scope": self.scope.value,
            "framework": self.framework,
            "document_type": self.document_type.value,
            "hierarchy_level": self.hierarchy_level.value,
            "version": self.version,
            "authority": self.authority,
            "related_ids": self.related_ids,
            "parent_id": self.parent_id,
            "child_ids": self.child_ids,
            "source_file": self.source_file,
            "source_url": self.source_url,
            "last_modified": self.last_modified.isoformat(),
            "tags": self.tags,
            "priority": self.priority,
            "status": self.status,
            "keywords": self.keywords,
            "summary": self.summary,
            "custom_fields": self.custom_fields
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'DocumentMetadata':
        """Create from dictionary."""
        return cls(
            id=data["id"],
            content_type=ContentType(data["content_type"]),
            project=data["project"],
            scope=Scope(data["scope"]),
            framework=data.get("framework"),
            document_type=DocumentType(data.get("document_type", "reference")),
            hierarchy_level=HierarchyLevel(data.get("hierarchy_level", "concept")),
            version=data.get("version", "1.0.0"),
            authority=data.get("authority", "team"),
            related_ids=data.get("related_ids", []),
            parent_id=data.get("parent_id"),
            child_ids=data.get("child_ids", []),
            source_file=data.get("source_file", ""),
            source_url=data.get("source_url"),
            last_modified=datetime.fromisoformat(data.get("last_modified", datetime.now().isoformat())),
            tags=data.get("tags", []),
            priority=data.get("priority"),
            status=data.get("status"),
            keywords=data.get("keywords", []),
            summary=data.get("summary", ""),
            custom_fields=data.get("custom_fields", {})
        )


@dataclass 
class DocumentChunk:
    """Complete document chunk with content and metadata."""
    
    content: str
    metadata: DocumentMetadata
    embedding: Optional[List[float]] = None
    
    def to_qdrant_point(self) -> Dict[str, Any]:
        """Convert to Qdrant point format."""
        return {
            "id": self.metadata.id,
            "vector": self.embedding,
            "payload": {
                **self.metadata.to_dict(),
                "content": self.content
            }
        }


def create_framework_metadata(
    id: str,
    project: str,
    framework: str,
    source_file: str,
    hierarchy_level: HierarchyLevel = HierarchyLevel.FUNCTION,
    **kwargs
) -> DocumentMetadata:
    """Helper to create framework documentation metadata."""
    return DocumentMetadata(
        id=id,
        content_type=ContentType.FRAMEWORK,
        project=project,
        scope=Scope.PROJECT,
        framework=framework,
        document_type=DocumentType.API,
        hierarchy_level=hierarchy_level,
        source_file=source_file,
        **kwargs
    )


def create_requirement_metadata(
    id: str,
    project: str,
    priority: str = "medium",
    status: str = "active",
    **kwargs
) -> DocumentMetadata:
    """Helper to create requirement metadata."""
    return DocumentMetadata(
        id=id,
        content_type=ContentType.REQUIREMENT,
        project=project,
        scope=Scope.PROJECT,
        document_type=DocumentType.USER_STORY,
        hierarchy_level=HierarchyLevel.CONCEPT,
        priority=priority,
        status=status,
        **kwargs
    )


def create_principle_metadata(
    id: str,
    project: str,
    scope: Scope = Scope.TEAM,
    authority: str = "architect",
    **kwargs
) -> DocumentMetadata:
    """Helper to create programming principle metadata."""
    return DocumentMetadata(
        id=id,
        content_type=ContentType.PRINCIPLE,
        project=project,
        scope=scope,
        document_type=DocumentType.STANDARD,
        hierarchy_level=HierarchyLevel.CONCEPT,
        authority=authority,
        **kwargs
    )