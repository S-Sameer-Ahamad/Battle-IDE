#!/bin/bash

# Check if .env file exists
if [ -f .env ]; then
    echo "A .env file already exists. Please remove it first if you want to create a new one."
    exit 1
fi

# Copy .env.example to .env
cp .env.example .env

echo "Created .env file from .env.example"
echo "Please edit .env and add your Judge0 API key and other configuration values."
echo ""
echo "You can get a Judge0 API key from:"
echo "https://rapidapi.com/judge0-official/api/judge0-ce"
