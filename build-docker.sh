#!/bin/bash

echo "🏗️  Building optimized Docker images..."

# Build original version for comparison
echo "🔄 Building original version..."
docker build -t api-inscricao-nest:original .
ORIGINAL_SIZE=$(docker images api-inscricao-nest:original --format "table {{.Size}}" | tail -n 1)

# Build distroless version
echo "📦 Building distroless version..."
docker build -f Dockerfile.optimized -t api-inscricao-nest:distroless .
DISTROLESS_SIZE=$(docker images api-inscricao-nest:distroless --format "table {{.Size}}" | tail -n 1)

# Build Alpine version
echo "🏔️  Building Alpine version..."
docker build -f Dockerfile.alpine -t api-inscricao-nest:alpine .
ALPINE_SIZE=$(docker images api-inscricao-nest:alpine --format "table {{.Size}}" | tail -n 1)

echo ""
echo "📊 Image Size Comparison:"
echo "=========================="
echo "Original version:   $ORIGINAL_SIZE"
echo "Distroless version: $DISTROLESS_SIZE"
echo "Alpine version:     $ALPINE_SIZE"
echo ""
echo "🚀 To run the optimized version:"
echo "   docker run -p 3000:3000 api-inscricao-nest:distroless"
echo "   or"
echo "   docker run -p 3000:3000 api-inscricao-nest:alpine"
