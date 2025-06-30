#!/usr/bin/env python3
"""
Leviathan Research Pipeline - Paper Ingestion Engine
Handles downloading, organizing, and initial processing of research papers.
"""

import os
import requests
import yaml
from pathlib import Path
from urllib.parse import urlparse
from typing import List, Dict, Optional
import pymupdf4llm
import hashlib
from datetime import datetime

class PaperIngestionEngine:
    """Automated paper ingestion and conversion system."""
    
    def __init__(self, base_dir: str = "/Users/jean-patricksmith/lev/_ref"):
        self.base_dir = Path(base_dir)
        self.papers_dir = self.base_dir / "research-papers"
        self.cache_dir = self.base_dir / "pipeline-cache"
        
        # Create directories
        self.papers_dir.mkdir(exist_ok=True)
        self.cache_dir.mkdir(exist_ok=True)
        
    def process_arxiv_list(self, arxiv_url: str, max_papers: int = 50) -> Dict:
        """Process ArXiv category list and extract papers."""
        print(f"🔍 Processing ArXiv list: {arxiv_url}")
        
        # For now, simulate processing - in production would use ArXiv API
        session_id = self._generate_session_id()
        session_dir = self.papers_dir / f"arxiv-session-{session_id}"
        session_dir.mkdir(exist_ok=True)
        
        return {
            "session_id": session_id,
            "session_dir": str(session_dir),
            "status": "initialized",
            "papers_processed": 0,
            "max_papers": max_papers
        }
    
    def download_paper(self, paper_url: str, paper_id: str = None) -> Dict:
        """Download a single paper and convert to markdown."""
        try:
            print(f"📥 Downloading: {paper_url}")
            
            # Generate paper ID if not provided
            if not paper_id:
                paper_id = self._extract_paper_id(paper_url)
            
            # Download PDF
            response = requests.get(paper_url, stream=True)
            response.raise_for_status()
            
            # Save PDF
            pdf_path = self.papers_dir / f"{paper_id}.pdf"
            with open(pdf_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Convert to markdown
            md_content = pymupdf4llm.to_markdown(str(pdf_path))
            md_path = self.papers_dir / f"{paper_id}.md"
            
            with open(md_path, 'w', encoding='utf-8') as f:
                f.write(md_content)
            
            # Generate metadata
            metadata = self._extract_metadata(md_content, paper_url, paper_id)
            metadata_path = self.papers_dir / f"{paper_id}.yaml"
            
            with open(metadata_path, 'w') as f:
                yaml.dump(metadata, f, default_flow_style=False)
            
            print(f"✅ Processed: {paper_id}")
            
            return {
                "paper_id": paper_id,
                "pdf_path": str(pdf_path),
                "markdown_path": str(md_path),
                "metadata_path": str(metadata_path),
                "status": "success",
                "size_kb": len(md_content) // 1024
            }
            
        except Exception as e:
            print(f"❌ Error processing {paper_url}: {str(e)}")
            return {
                "paper_id": paper_id,
                "url": paper_url,
                "status": "error",
                "error": str(e)
            }
    
    def batch_process(self, paper_list: List[str]) -> Dict:
        """Process multiple papers in batch."""
        print(f"🔄 Batch processing {len(paper_list)} papers...")
        
        results = {
            "total_papers": len(paper_list),
            "successful": 0,
            "failed": 0,
            "papers": []
        }
        
        for paper_url in paper_list:
            result = self.download_paper(paper_url)
            results["papers"].append(result)
            
            if result["status"] == "success":
                results["successful"] += 1
            else:
                results["failed"] += 1
        
        # Save batch results
        batch_id = self._generate_session_id()
        batch_result_path = self.cache_dir / f"batch-{batch_id}.yaml"
        
        with open(batch_result_path, 'w') as f:
            yaml.dump(results, f, default_flow_style=False)
        
        print(f"📊 Batch complete: {results['successful']}/{results['total_papers']} successful")
        return results
    
    def _extract_paper_id(self, url: str) -> str:
        """Extract or generate paper ID from URL."""
        if "arxiv.org" in url:
            # Extract ArXiv ID from URL
            if "/pdf/" in url:
                return url.split("/pdf/")[-1].replace(".pdf", "")
            elif "/abs/" in url:
                return url.split("/abs/")[-1]
        
        # Generate hash-based ID for other sources
        url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
        return f"paper-{url_hash}"
    
    def _extract_metadata(self, content: str, url: str, paper_id: str) -> Dict:
        """Extract metadata from paper content."""
        lines = content.split('\n')
        title = ""
        authors = ""
        
        # Simple extraction - could be enhanced with more sophisticated parsing
        for i, line in enumerate(lines[:20]):
            if line.strip() and not title:
                title = line.strip()
            elif "author" in line.lower() and not authors:
                authors = line.strip()
        
        return {
            "paper_id": paper_id,
            "title": title,
            "authors": authors,
            "url": url,
            "processed_date": datetime.now().isoformat(),
            "content_length": len(content),
            "word_count": len(content.split()),
            "status": "processed"
        }
    
    def _generate_session_id(self) -> str:
        """Generate unique session ID."""
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        random_suffix = hashlib.md5(str(datetime.now()).encode()).hexdigest()[:6]
        return f"{timestamp}-{random_suffix}"

if __name__ == "__main__":
    # Example usage
    engine = PaperIngestionEngine()
    
    # Test with a sample paper
    sample_papers = [
        "https://arxiv.org/pdf/2506.00320.pdf",  # Dyna-Think
        "https://arxiv.org/pdf/2506.00417.pdf"   # World Models
    ]
    
    results = engine.batch_process(sample_papers)
    print(f"Processing complete: {results}")