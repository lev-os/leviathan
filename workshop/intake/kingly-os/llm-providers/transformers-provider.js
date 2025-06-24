import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Transformers-based LLM Provider
 * Uses Python transformers library via conda ai-ml-shared environment
 */
export class TransformersProvider {
  constructor(config = {}) {
    this.modelPath = config.modelPath || process.env.TRANSFORMERS_MODEL_PATH || '/Users/jean-patricksmith/i/models';
    this.modelName = config.modelName || process.env.TRANSFORMERS_MODEL_NAME || 'TinyLlama/TinyLlama-1.1B-Chat-v1.0';
    this.condaEnv = config.condaEnv || process.env.CONDA_ENV || 'ai-ml-shared';
    this.pythonScript = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Create Python script for transformers integration
    this.pythonScript = path.join(__dirname, 'transformers_runner.py');
    await this.createPythonScript();
    
    this.initialized = true;
  }

  async createPythonScript() {
    const scriptContent = `#!/usr/bin/env python
import json
import sys
import os
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Set model cache directory
os.environ['HF_HOME'] = '${this.modelPath}'
os.environ['TRANSFORMERS_CACHE'] = '${this.modelPath}'

# Load model and tokenizer
print("Loading model...", file=sys.stderr)
tokenizer = AutoTokenizer.from_pretrained("${this.modelName}")
model = AutoModelForCausalLM.from_pretrained(
    "${this.modelName}",
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    device_map="auto"
)

# Chat template
def format_prompt(messages):
    if isinstance(messages, str):
        return messages
    
    formatted = ""
    for msg in messages:
        role = msg.get('role', 'user')
        content = msg.get('content', '')
        if role == 'system':
            formatted += f"<|system|>\\n{content}</s>\\n"
        elif role == 'user':
            formatted += f"<|user|>\\n{content}</s>\\n"
        elif role == 'assistant':
            formatted += f"<|assistant|>\\n{content}</s>\\n"
    formatted += "<|assistant|>\\n"
    return formatted

# Main loop
print("Model ready!", file=sys.stderr)
while True:
    try:
        line = sys.stdin.readline()
        if not line:
            break
        
        request = json.loads(line)
        prompt = format_prompt(request.get('messages', request.get('prompt', '')))
        max_tokens = request.get('max_tokens', 500)
        temperature = request.get('temperature', 0.7)
        
        # Generate response
        inputs = tokenizer(prompt, return_tensors="pt")
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        # Extract only the generated part
        response = response[len(prompt):].strip()
        
        result = {
            'content': response,
            'model': '${this.modelName}',
            'usage': {
                'prompt_tokens': len(inputs['input_ids'][0]),
                'completion_tokens': len(outputs[0]) - len(inputs['input_ids'][0]),
                'total_tokens': len(outputs[0])
            }
        }
        
        print(json.dumps(result))
        sys.stdout.flush()
        
    except Exception as e:
        error_result = {'error': str(e)}
        print(json.dumps(error_result))
        sys.stdout.flush()
`;

    const fs = await import('fs/promises');
    await fs.writeFile(this.pythonScript, scriptContent, 'utf8');
    await fs.chmod(this.pythonScript, 0o755);
  }

  async generateResponse(context, input, options = {}) {
    await this.initialize();

    return new Promise((resolve, reject) => {
      const messages = [
        { role: 'system', content: context },
        { role: 'user', content: input }
      ];

      const request = {
        messages,
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7
      };

      // Run Python script with conda environment
      const activateScript = `/Users/jean-patricksmith/digital/_infra/tools/activate-ai-ml.sh`;
      const command = `source ${activateScript} > /dev/null 2>&1 && python ${this.pythonScript}`;
      
      const pythonProcess = spawn('bash', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';
      let responseReceived = false;

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
        
        // Try to parse each line as JSON
        const lines = output.split('\n');
        for (const line of lines) {
          if (line.trim() && !responseReceived) {
            try {
              const result = JSON.parse(line);
              if (result.error) {
                reject(new Error(result.error));
              } else {
                responseReceived = true;
                resolve({
                  content: result.content,
                  provider: 'transformers',
                  model: result.model,
                  usage: result.usage
                });
              }
            } catch (e) {
              // Not valid JSON yet, continue accumulating
            }
          }
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
        // Only log non-loading messages
        if (!data.toString().includes('Loading model') && !data.toString().includes('Model ready')) {
          console.error('Python stderr:', data.toString());
        }
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });

      pythonProcess.on('exit', (code) => {
        if (code !== 0 && !responseReceived) {
          reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
        }
      });

      // Send request
      pythonProcess.stdin.write(JSON.stringify(request) + '\n');
      pythonProcess.stdin.end();

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!responseReceived) {
          pythonProcess.kill();
          reject(new Error('Response timeout'));
        }
      }, 30000);
    });
  }

  async healthCheck() {
    try {
      const response = await this.generateResponse('You are a helpful assistant.', 'Say "OK" if you are working.', {
        maxTokens: 10,
        temperature: 0.1
      });
      return response.content.toLowerCase().includes('ok') ? 'healthy' : 'unhealthy';
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
}