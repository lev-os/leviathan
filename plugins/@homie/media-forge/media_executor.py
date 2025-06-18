#!/usr/bin/env python3
"""
Media Forge Executor - LLM-first wrapper for homie/yt system
Integrates existing YouTube automation with Lev's job orchestration
"""

import sys
import json
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MediaForgeExecutor:
    """
    LLM-first executor that wraps existing homie/yt modules.
    Focuses on execution and reporting - LLM handles all intelligence.
    """
    
    def __init__(self, homie_path: str = "/Users/jean-patricksmith/digital/homie"):
        self.homie_path = Path(homie_path)
        self.yt_path = self.homie_path / "yt"
        
    def download_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute download job using existing homie/yt system.
        Returns structured data for LLM analysis - no local intelligence.
        """
        urls = job_data.get('urls', [])
        output_dir = job_data.get('output_dir', str(self.homie_path / "downloads"))
        quality = job_data.get('quality', '720p')
        
        results = {
            "job_type": "media_download",
            "status": "completed",
            "downloaded_files": [],
            "metadata": [],
            "errors": []
        }
        
        for url in urls:
            try:
                # Use existing yt.py for download
                cmd = [
                    sys.executable,
                    str(self.yt_path / "yt.py"),
                    "-d",  # download flag
                    url,
                    "-o", output_dir  # output directory
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode == 0:
                    # Extract metadata using existing system
                    metadata = self._extract_metadata(url, output_dir)
                    results["downloaded_files"].append(metadata["file_path"])
                    results["metadata"].append(metadata)
                else:
                    results["errors"].append({
                        "url": url,
                        "error": result.stderr
                    })
                    
            except Exception as e:
                results["errors"].append({
                    "url": url,
                    "error": str(e)
                })
        
        # Job done - serve results to LLM for analysis
        return self._format_for_llm(results)
    
    def organize_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute organization plan created by LLM.
        Pure execution - no local intelligence.
        """
        folder = job_data.get('folder')
        organization_plan = job_data.get('organization_plan', {})
        
        results = {
            "job_type": "media_organize",
            "status": "completed", 
            "moves_executed": [],
            "folders_created": [],
            "errors": []
        }
        
        try:
            # Execute LLM's organization plan
            for file_path, target_path in organization_plan.items():
                source = Path(file_path)
                target = Path(target_path)
                
                # Create target directory if needed
                target.parent.mkdir(parents=True, exist_ok=True)
                
                # Move file
                source.rename(target)
                
                results["moves_executed"].append({
                    "from": str(source),
                    "to": str(target)
                })
                
                if not target.parent in [Path(m["folder"]) for m in results["folders_created"]]:
                    results["folders_created"].append({
                        "folder": str(target.parent),
                        "created": True
                    })
                    
        except Exception as e:
            results["errors"].append({
                "error": str(e),
                "context": "organization_execution"
            })
        
        return self._format_for_llm(results)
    
    def transcribe_job(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract transcripts using existing transcribe.py.
        Returns raw transcript data for LLM analysis.
        """
        video_files = job_data.get('video_files', [])
        
        results = {
            "job_type": "media_transcribe",
            "status": "completed",
            "transcripts": [],
            "errors": []
        }
        
        for video_file in video_files:
            try:
                # Use existing transcribe.py
                cmd = [
                    sys.executable,
                    str(self.yt_path / "transcribe.py"),
                    video_file,
                    "--model", "base"
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode == 0:
                    transcript_data = {
                        "video_file": video_file,
                        "transcript": result.stdout,
                        "method": "whisper"
                    }
                    results["transcripts"].append(transcript_data)
                else:
                    results["errors"].append({
                        "video_file": video_file,
                        "error": result.stderr
                    })
                    
            except Exception as e:
                results["errors"].append({
                    "video_file": video_file,
                    "error": str(e)
                })
        
        return self._format_for_llm(results)
    
    def _extract_metadata(self, url: str, output_dir: str) -> Dict[str, Any]:
        """Extract metadata using existing yt.py info command."""
        try:
            cmd = [
                sys.executable,
                str(self.yt_path / "yt.py"),
                "info",
                url,
                "--json"
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                return json.loads(result.stdout)
            else:
                return {"error": result.stderr, "url": url}
                
        except Exception as e:
            return {"error": str(e), "url": url}
    
    def _format_for_llm(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format results for LLM consumption.
        Add 'job_done' signal and structured data.
        """
        return {
            "signal": "job_done",
            "results": results,
            "llm_analysis_needed": True,
            "next_actions": "analyze_and_decide"
        }


if __name__ == "__main__":
    # CLI interface for testing
    import argparse
    
    parser = argparse.ArgumentParser(description="Media Forge Executor")
    parser.add_argument("command", choices=["download", "organize", "transcribe"])
    parser.add_argument("--job-data", required=True, help="JSON job data")
    
    args = parser.parse_args()
    
    executor = MediaForgeExecutor()
    job_data = json.loads(args.job_data)
    
    if args.command == "download":
        result = executor.download_job(job_data)
    elif args.command == "organize":
        result = executor.organize_job(job_data)
    elif args.command == "transcribe":
        result = executor.transcribe_job(job_data)
    
    print(json.dumps(result, indent=2))