#!/bin/bash

# Setup script for Docker Buildx multi-architecture builds
# This script sets up Docker Buildx for building multi-architecture images

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILDX_BUILDER_NAME="multiarch-builder"
PLATFORMS="linux/amd64,linux/arm64"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed and running
check_docker() {
    log_info "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    log_success "Docker is installed and running"
}

# Check if buildx is available
check_buildx() {
    log_info "Checking Docker Buildx availability..."
    
    if ! docker buildx version &> /dev/null; then
        log_error "Docker Buildx is not available. Please update Docker to a version that supports Buildx."
        exit 1
    fi
    
    log_success "Docker Buildx is available"
}

# Create and configure buildx builder
setup_builder() {
    log_info "Setting up Docker Buildx builder: $BUILDX_BUILDER_NAME"
    
    # Check if builder already exists
    if docker buildx ls | grep -q "$BUILDX_BUILDER_NAME"; then
        log_warning "Builder '$BUILDX_BUILDER_NAME' already exists"
        
        # Ask if user wants to recreate it
        read -p "Do you want to recreate the builder? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log_info "Removing existing builder..."
            docker buildx rm "$BUILDX_BUILDER_NAME" || true
        else
            log_info "Using existing builder"
            docker buildx use "$BUILDX_BUILDER_NAME"
            return 0
        fi
    fi
    
    # Create new builder
    log_info "Creating new builder with platforms: $PLATFORMS"
    docker buildx create \
        --name "$BUILDX_BUILDER_NAME" \
        --driver docker-container \
        --platform "$PLATFORMS" \
        --use
    
    log_success "Builder created successfully"
}

# Bootstrap the builder
bootstrap_builder() {
    log_info "Bootstrapping builder..."
    docker buildx inspect --bootstrap
    log_success "Builder bootstrapped successfully"
}

# Test the setup
test_setup() {
    log_info "Testing multi-architecture build setup..."
    
    # Create a simple test Dockerfile
    cat > /tmp/test.Dockerfile << 'EOF'
FROM alpine:3.22
RUN echo "Hello from $(uname -m)" > /hello
CMD ["cat", "/hello"]
EOF
    
    # Test build
    log_info "Building test image for platforms: $PLATFORMS"
    if docker buildx build \
        --platform "$PLATFORMS" \
        --file /tmp/test.Dockerfile \
        --tag test-multiarch:latest \
        --load \
        /tmp; then
        log_success "Multi-architecture build test passed"
    else
        log_error "Multi-architecture build test failed"
        exit 1
    fi
    
    # Clean up test files
    rm -f /tmp/test.Dockerfile
    docker rmi test-multiarch:latest 2>/dev/null || true
}

# Show builder information
show_info() {
    log_info "Builder information:"
    echo
    docker buildx ls
    echo
    log_info "Current builder details:"
    docker buildx inspect
}

# Main function
main() {
    echo "=========================================="
    echo "Docker Buildx Multi-Architecture Setup"
    echo "=========================================="
    echo
    
    check_docker
    check_buildx
    setup_builder
    bootstrap_builder
    test_setup
    show_info
    
    echo
    log_success "Docker Buildx setup completed successfully!"
    echo
    echo "You can now use the following commands:"
    echo "  make buildx-build              # Build multi-arch image locally"
    echo "  make buildx-build-push         # Build and push to registry"
    echo "  make buildx-build-push-dockerhub # Build and push to Docker Hub"
    echo
    echo "Example usage:"
    echo "  make buildx-build-push-dockerhub DOCKER_USERNAME=your-username DOCKER_PASSWORD=your-password"
    echo
}

# Run main function
main "$@"
