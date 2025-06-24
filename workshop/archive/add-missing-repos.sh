#!/bin/bash

# Add missing repos from REPOSITORY_INTAKE_TRACKER.csv to TRACKER.csv

cat >> /Users/jean-patricksmith/lev/workshop/TRACKER.csv << 'EOF'
AutoGPT,AutoGPT,1,PRODUCTION-READY,0.90,0.90,0.85,0.90,0.89,adopt_immediately,1-2,pending,"Autonomous agent system"
skyvern,skyvern,1,PRODUCTION-READY,0.90,0.85,0.85,0.90,0.88,adopt_immediately,1-2,pending,"Web automation agent"
llama3,llama3,2,ADVANCED-STABLE,0.85,0.85,0.75,0.85,0.83,adopt_immediately,2-4,pending,"Meta foundation model"
v-jepa,v-jepa,2,ADVANCED-STABLE,0.85,0.85,0.70,0.85,0.82,adopt_immediately,2-4,pending,"Video understanding"
dino,dino,2,ADVANCED-STABLE,0.85,0.85,0.70,0.85,0.82,adopt_immediately,2-4,pending,"Vision model"
dinov2,dinov2,2,ADVANCED-STABLE,0.85,0.85,0.70,0.85,0.82,adopt_immediately,2-4,pending,"Improved vision model"
gemma,gemma,2,ADVANCED-STABLE,0.85,0.85,0.75,0.85,0.83,adopt_immediately,2-4,pending,"Google foundation model"
SimMIM,SimMIM,2,ADVANCED-STABLE,0.85,0.85,0.70,0.85,0.82,adopt_immediately,2-4,pending,"Masked modeling"
SEAL,SEAL,3,EMERGING-VIABLE,0.75,0.75,0.65,0.75,0.73,adapt_and_integrate,4-8,pending,"Research framework"
SimCLR,SimCLR,3,EMERGING-VIABLE,0.75,0.75,0.65,0.75,0.73,adapt_and_integrate,4-8,pending,"Self-supervised learning"
byol-pytorch,byol-pytorch,3,EMERGING-VIABLE,0.75,0.75,0.65,0.75,0.73,adapt_and_integrate,4-8,pending,"BYOL implementation"
avalanche,avalanche,4,RESEARCH-READY,0.70,0.70,0.60,0.70,0.68,adapt_and_integrate,6-12,pending,"Continual learning"
continual-learning-baselines,continual-learning-baselines,4,RESEARCH-READY,0.70,0.70,0.60,0.70,0.68,adapt_and_integrate,6-12,pending,"CL baselines"
avalanche-rl,avalanche-rl,4,RESEARCH-READY,0.70,0.70,0.60,0.70,0.68,adapt_and_integrate,6-12,pending,"CL + RL"
ContinualEvaluation,ContinualEvaluation,4,RESEARCH-READY,0.70,0.70,0.60,0.70,0.68,adapt_and_integrate,6-12,pending,"CL evaluation"
infinite-agentic-loop,infinite-agentic-loop,5,EXPERIMENTAL-PROMISING,0.65,0.65,0.55,0.65,0.63,extract_patterns,8-16,pending,"Existing project"
deep-dive-ai-mlx,deep-dive-ai-mlx,6,PROTOTYPE-STAGE,0.60,0.60,0.50,0.60,0.58,reference_only,12+,pending,"MLX exploration"
awesome-ChatGPT-repositories,awesome-ChatGPT-repositories,6,PROTOTYPE-STAGE,0.60,0.60,0.50,0.60,0.58,reference_only,12+,pending,"Resource list"
EOF

echo "Added 18 missing repositories to TRACKER.csv"