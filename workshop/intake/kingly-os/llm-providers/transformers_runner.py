#!/usr/bin/env python
import json
import sys
import os
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Set model cache directory
os.environ['HF_HOME'] = '/Users/jean-patricksmith/i/models'
os.environ['TRANSFORMERS_CACHE'] = '/Users/jean-patricksmith/i/models'

# Load model and tokenizer
print("Loading model...", file=sys.stderr)
tokenizer = AutoTokenizer.from_pretrained("TinyLlama/TinyLlama-1.1B-Chat-v1.0")
model = AutoModelForCausalLM.from_pretrained(
    "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
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
            formatted += f"<|system|>\n{content}</s>\n"
        elif role == 'user':
            formatted += f"<|user|>\n{content}</s>\n"
        elif role == 'assistant':
            formatted += f"<|assistant|>\n{content}</s>\n"
    formatted += "<|assistant|>\n"
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
            'model': 'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
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
