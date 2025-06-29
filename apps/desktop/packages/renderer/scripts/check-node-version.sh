#!/bin/bash

# Check if nvm is available
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # Source nvm
  source "$HOME/.nvm/nvm.sh"
  
  # Read the .nvmrc file
  NODE_VERSION=$(cat .nvmrc)
  
  # Use the version specified in .nvmrc
  echo "Switching to Node.js version $NODE_VERSION"
  nvm use "$NODE_VERSION" || nvm install "$NODE_VERSION"
  
  # Display the current Node.js version
  echo "Using Node.js $(node -v)"
else
  echo "nvm is not installed. Please install nvm or manually use Node.js version $(cat .nvmrc)."
  echo "Current Node.js version: $(node -v)"
  
  # Check if the current version is compatible
  if [[ "$(node -v)" =~ ^v18\.1[89]\. || "$(node -v)" =~ ^v19\.[89]\. || "$(node -v)" =~ ^v2[0-9]\. ]]; then
    echo "Current Node.js version is compatible with Next.js requirements."
  else
    echo "Warning: Current Node.js version doesn't meet Next.js requirements."
    echo "Next.js requires Node.js version ^18.18.0 || ^19.8.0 || >= 20.0.0"
  fi
fi
