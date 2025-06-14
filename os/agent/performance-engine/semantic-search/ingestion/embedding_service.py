"""
Embedding service for high-accuracy semantic search.
Uses sentence-transformers/all-mpnet-base-v2 for maximum accuracy.
"""

import logging
import numpy as np
from typing import List, Union, Optional, Dict, Any
from sentence_transformers import SentenceTransformer
import torch
from dataclasses import dataclass
import time

from ..config.settings import SystemConfig, default_config


logger = logging.getLogger(__name__)


@dataclass
class EmbeddingResult:
    """Result of embedding generation."""
    embeddings: np.ndarray
    processing_time: float
    model_used: str
    input_count: int


class EmbeddingService:
    """High-accuracy embedding service for semantic search."""
    
    def __init__(self, config: SystemConfig = default_config):
        self.config = config
        self.model = None
        self.device = self._get_device()
        self._initialize_model()
    
    def _get_device(self) -> str:
        """Determine the best available device."""
        if self.config.embedding.device == "auto":
            if torch.cuda.is_available():
                return "cuda"
            elif torch.backends.mps.is_available():  # Apple Silicon
                return "mps"
            else:
                return "cpu"
        return self.config.embedding.device
    
    def _initialize_model(self):
        """Initialize the embedding model."""
        try:
            logger.info(f"Loading embedding model: {self.config.embedding.model_name}")
            logger.info(f"Using device: {self.device}")
            
            self.model = SentenceTransformer(
                self.config.embedding.model_name,
                device=self.device
            )
            
            # Verify model dimensions
            test_embedding = self.model.encode(["test"], convert_to_numpy=True)
            actual_dim = test_embedding.shape[1]
            
            if actual_dim != self.config.embedding.dimension:
                logger.warning(
                    f"Model dimension ({actual_dim}) differs from config ({self.config.embedding.dimension}). "
                    f"Updating config to match model."
                )
                self.config.embedding.dimension = actual_dim
                self.config.qdrant.vector_size = actual_dim
            
            logger.info(f"Model loaded successfully. Dimension: {actual_dim}")
            
        except Exception as e:
            logger.error(f"Failed to initialize embedding model: {e}")
            raise
    
    def encode_single(self, text: str) -> np.ndarray:
        """Encode a single text into an embedding."""
        if not self.model:
            raise RuntimeError("Embedding model not initialized")
        
        try:
            embedding = self.model.encode(
                [text],
                convert_to_numpy=True,
                normalize_embeddings=self.config.embedding.normalize,
                batch_size=1
            )[0]
            
            return embedding
            
        except Exception as e:
            logger.error(f"Failed to encode text: {e}")
            raise
    
    def encode_batch(self, texts: List[str]) -> EmbeddingResult:
        """Encode a batch of texts into embeddings."""
        if not self.model:
            raise RuntimeError("Embedding model not initialized")
        
        if not texts:
            return EmbeddingResult(
                embeddings=np.array([]),
                processing_time=0.0,
                model_used=self.config.embedding.model_name,
                input_count=0
            )
        
        try:
            start_time = time.time()
            
            embeddings = self.model.encode(
                texts,
                convert_to_numpy=True,
                normalize_embeddings=self.config.embedding.normalize,
                batch_size=self.config.embedding.batch_size,
                show_progress_bar=len(texts) > 100
            )
            
            processing_time = time.time() - start_time
            
            logger.info(
                f"Encoded {len(texts)} texts in {processing_time:.2f}s "
                f"({len(texts)/processing_time:.1f} texts/sec)"
            )
            
            return EmbeddingResult(
                embeddings=embeddings,
                processing_time=processing_time,
                model_used=self.config.embedding.model_name,
                input_count=len(texts)
            )
            
        except Exception as e:
            logger.error(f"Failed to encode batch: {e}")
            raise
    
    def encode_documents(self, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Encode documents with content and metadata."""
        if not documents:
            return []
        
        # Extract text content
        texts = []
        for doc in documents:
            content = doc.get("content", "")
            
            # Optionally include metadata in embedding
            if self.config.ingestion.include_metadata_in_content:
                metadata = doc.get("metadata", {})
                metadata_text = self._format_metadata_for_embedding(metadata)
                content = f"{content}\n\n{metadata_text}"
            
            texts.append(content)
        
        # Generate embeddings
        result = self.encode_batch(texts)
        
        # Add embeddings to documents
        enhanced_docs = []
        for i, doc in enumerate(documents):
            enhanced_doc = doc.copy()
            enhanced_doc["embedding"] = result.embeddings[i].tolist()
            enhanced_doc["embedding_model"] = result.model_used
            enhanced_docs.append(enhanced_doc)
        
        return enhanced_docs
    
    def _format_metadata_for_embedding(self, metadata: Dict[str, Any]) -> str:
        """Format metadata for inclusion in embedding."""
        important_fields = [
            "framework", "document_type", "hierarchy_level", 
            "tags", "keywords", "summary"
        ]
        
        metadata_parts = []
        for field in important_fields:
            if field in metadata and metadata[field]:
                value = metadata[field]
                if isinstance(value, list):
                    value = ", ".join(str(v) for v in value)
                metadata_parts.append(f"{field}: {value}")
        
        return " | ".join(metadata_parts)
    
    def compute_similarity(
        self, 
        query_embedding: np.ndarray, 
        document_embeddings: np.ndarray
    ) -> np.ndarray:
        """Compute cosine similarity between query and documents."""
        
        # Ensure embeddings are normalized
        if self.config.embedding.normalize:
            query_norm = query_embedding / np.linalg.norm(query_embedding)
            doc_norms = document_embeddings / np.linalg.norm(document_embeddings, axis=1, keepdims=True)
        else:
            query_norm = query_embedding
            doc_norms = document_embeddings
        
        # Compute cosine similarity
        similarities = np.dot(doc_norms, query_norm)
        return similarities
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model."""
        if not self.model:
            return {"status": "not_initialized"}
        
        return {
            "model_name": self.config.embedding.model_name,
            "dimension": self.config.embedding.dimension,
            "device": self.device,
            "normalize": self.config.embedding.normalize,
            "batch_size": self.config.embedding.batch_size,
            "status": "ready"
        }
    
    def benchmark(self, sample_texts: Optional[List[str]] = None) -> Dict[str, Any]:
        """Benchmark the embedding service."""
        if not sample_texts:
            sample_texts = [
                "This is a sample text for benchmarking.",
                "Another example with technical content like API endpoints.",
                "Programming principles and best practices for error handling.",
                "Requirements for user authentication and authorization.",
                "Framework documentation for Go HTTP handlers."
            ] * 20  # 100 total texts
        
        # Single encoding benchmark
        start_time = time.time()
        single_embedding = self.encode_single(sample_texts[0])
        single_time = time.time() - start_time
        
        # Batch encoding benchmark
        result = self.encode_batch(sample_texts)
        
        return {
            "model_info": self.get_model_info(),
            "single_encoding": {
                "time_ms": single_time * 1000,
                "dimension": len(single_embedding)
            },
            "batch_encoding": {
                "total_time_s": result.processing_time,
                "texts_per_second": result.input_count / result.processing_time,
                "texts_count": result.input_count,
                "dimension": result.embeddings.shape[1] if len(result.embeddings) > 0 else 0
            }
        }


# Global embedding service instance
_embedding_service = None


def get_embedding_service(config: SystemConfig = default_config) -> EmbeddingService:
    """Get or create the global embedding service."""
    global _embedding_service
    
    if _embedding_service is None:
        _embedding_service = EmbeddingService(config)
    
    return _embedding_service