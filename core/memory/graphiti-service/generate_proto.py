#!/usr/bin/env python3
"""
Generate Python gRPC code from protobuf definitions
"""

import subprocess
import sys
from pathlib import Path

def generate_grpc_code():
    """Generate Python gRPC stubs from proto files"""
    
    # Get paths
    proto_dir = Path(__file__).parent / "proto"
    src_dir = Path(__file__).parent / "src"
    
    # Ensure src directory exists
    src_dir.mkdir(exist_ok=True)
    
    # Generate Python gRPC code
    cmd = [
        sys.executable, "-m", "grpc_tools.protoc",
        f"--proto_path={proto_dir}",
        f"--python_out={src_dir}",
        f"--grpc_python_out={src_dir}",
        str(proto_dir / "memory.proto")
    ]
    
    print("Generating Python gRPC code...")
    print(f"Command: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Generated Python gRPC code successfully!")
            print(f"Files created in: {src_dir}")
            print("  - memory_pb2.py")
            print("  - memory_pb2_grpc.py")
        else:
            print("❌ Failed to generate gRPC code")
            print(f"STDOUT: {result.stdout}")
            print(f"STDERR: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error running protoc: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = generate_grpc_code()
    sys.exit(0 if success else 1)