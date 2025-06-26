#!/bin/bash

# detect-next-repo.sh - Recursive repository detection script for workshop intake processing
# Finds all repositories in intake/ recursively, generates unique slugs, and returns the next unprocessed repository

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to generate slug from path
# Example: intake/ai-engineering-hub/repos/awesome-prompts -> ai-engineering-hub__repos__awesome-prompts
generate_slug() {
    local path="$1"
    # Remove 'intake/' prefix and replace '/' with '__'
    echo "$path" | sed 's|^intake/||' | sed 's|/|__|g'
}

# Function to check if repository has been processed
is_processed() {
    local slug="$1"
    if [ -f "tracker.txt" ]; then
        grep -q "^${slug}$" tracker.txt
        return $?
    else
        return 1
    fi
}

# Function to count total repositories
count_repositories() {
    find intake -type d -name ".git" | wc -l
}

# Function to count processed repositories
count_processed() {
    if [ -f "tracker.txt" ]; then
        wc -l < tracker.txt | tr -d ' '
    else
        echo "0"
    fi
}

# Main detection logic
main() {
    echo -e "${BLUE}=== Workshop Intake Repository Detector ===${NC}"
    echo ""
    
    # Check if intake directory exists
    if [ ! -d "intake" ]; then
        echo -e "${RED}Error: intake/ directory not found${NC}"
        exit 1
    fi
    
    # Count repositories
    total_repos=$(count_repositories)
    processed_repos=$(count_processed)
    remaining_repos=$((total_repos - processed_repos))
    
    echo -e "${YELLOW}Statistics:${NC}"
    echo -e "  Total repositories: ${GREEN}${total_repos}${NC}"
    echo -e "  Processed: ${GREEN}${processed_repos}${NC}"
    echo -e "  Remaining: ${YELLOW}${remaining_repos}${NC}"
    echo ""
    
    # Find all git repositories recursively
    while IFS= read -r git_dir; do
        # Get the repository directory (parent of .git)
        repo_dir=$(dirname "$git_dir")
        
        # Generate slug
        slug=$(generate_slug "$repo_dir")
        
        # Check if already processed
        if ! is_processed "$slug"; then
            echo -e "${GREEN}Next unprocessed repository found:${NC}"
            echo -e "  Path: ${BLUE}${repo_dir}${NC}"
            echo -e "  Slug: ${YELLOW}${slug}${NC}"
            echo ""
            
            # Output in machine-readable format for scripts
            echo "NEXT_REPO_PATH=${repo_dir}"
            echo "NEXT_REPO_SLUG=${slug}"
            
            exit 0
        fi
    done < <(find intake -type d -name ".git" | sort)
    
    # No unprocessed repositories found
    echo -e "${GREEN}✓ All repositories have been processed!${NC}"
    echo ""
    echo "NEXT_REPO_PATH="
    echo "NEXT_REPO_SLUG="
    
    exit 0
}

# Run main function
main