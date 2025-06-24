#!/bin/bash

# Workshop Handoff Migration Script
# Moves the retroactive intake package to the proper workshop location

set -e

echo "🚀 Workshop Retroactive Intake Migration Script"
echo "=============================================="
echo ""

# Define paths
SOURCE_DIR="$(pwd)/tmp/workshop-handoff"
TARGET_BASE="$HOME/lev/workshop"
TARGET_DIR="$TARGET_BASE/intake-retroactive-$(date +%Y%m%d)"

# Check if source exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo "❌ Error: Source directory not found: $SOURCE_DIR"
  exit 1
fi

# Check if lev directory exists
if [ ! -d "$HOME/lev" ]; then
  echo "❌ Error: ~/lev directory does not exist"
  echo "Please ensure the Leviathan workspace is set up first"
  exit 1
fi

# Create workshop directory if needed
if [ ! -d "$TARGET_BASE" ]; then
  echo "📁 Creating workshop directory..."
  mkdir -p "$TARGET_BASE"
fi

# Check if target already exists
if [ -d "$TARGET_DIR" ]; then
  echo "⚠️  Warning: Target directory already exists: $TARGET_DIR"
  read -p "Do you want to overwrite? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled"
    exit 0
  fi
  rm -rf "$TARGET_DIR"
fi

# Perform the migration
echo "📦 Moving handoff package..."
echo "  From: $SOURCE_DIR"
echo "  To:   $TARGET_DIR"
echo ""

cp -R "$SOURCE_DIR" "$TARGET_DIR"

# Verify migration
if [ -d "$TARGET_DIR" ] && [ -f "$TARGET_DIR/HANDOFF_MANIFEST.json" ]; then
  echo "✅ Migration successful!"
  echo ""
  echo "📊 Package contents:"
  echo "  - Repositories: $(find "$TARGET_DIR/repos" -maxdepth 2 -type d | grep -E "tier-" | wc -l) tiers"
  echo "  - Documentation: $(find "$TARGET_DIR/documentation" -name "*.md" | wc -l) files"
  echo "  - Analysis data: $(find "$TARGET_DIR/analysis/data" -name "*" -type f | wc -l) files"
  echo "  - Scripts: $(find "$TARGET_DIR/analysis/processing-scripts" -name "*.js" | wc -l) files"
  echo ""
  echo "🎯 Next steps:"
  echo "  1. cd $TARGET_DIR"
  echo "  2. Review INTAKE_AGENT_PROMPT.md for integration instructions"
  echo "  3. Run: lev workshop verify ."
  echo "  4. Update workshop tracking with new paths"
  echo ""
  echo "📝 Key files:"
  echo "  - $TARGET_DIR/README.md"
  echo "  - $TARGET_DIR/HANDOFF_MANIFEST.json"
  echo "  - $TARGET_DIR/INTAKE_AGENT_PROMPT.md"
else
  echo "❌ Migration failed! Please check the source and try again."
  exit 1
fi

# Optional: Remove source after successful migration
read -p "Remove source directory? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  rm -rf "$SOURCE_DIR"
  echo "🗑️  Source directory removed"
fi

echo ""
echo "🎉 Migration complete!"
