#!/bin/bash

# Build script for Alpine Nginx PHP-FPM 7.4 Docker image
# This script builds the Docker image with proper tagging and optimization

set -e

# Configuration
IMAGE_NAME="alpine-nginx-php74"
VERSION="latest"
REGISTRY=""
BUILD_ARGS=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
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

# Help function
show_help() {
    cat << EOF
Usage: $0 [OPTIONS]

Build Alpine Nginx PHP-FPM 7.4 Docker image

OPTIONS:
    -h, --help          Show this help message
    -t, --tag TAG       Set image tag (default: latest)
    -r, --registry URL  Set registry URL
    --no-cache          Build without cache
    --push              Push image to registry after build
    --multi-arch        Build for multiple architectures (amd64, arm64)

EXAMPLES:
    $0                          # Build with default settings
    $0 -t v1.0.0               # Build with specific tag
    $0 -r myregistry.com       # Build and tag for specific registry
    $0 --no-cache --push       # Build without cache and push
    $0 --multi-arch            # Build for multiple architectures

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -t|--tag)
            VERSION="$2"
            shift 2
            ;;
        -r|--registry)
            REGISTRY="$2/"
            shift 2
            ;;
        --no-cache)
            BUILD_ARGS="$BUILD_ARGS --no-cache"
            shift
            ;;
        --push)
            PUSH_IMAGE=true
            shift
            ;;
        --multi-arch)
            MULTI_ARCH=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate Docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Set full image name
FULL_IMAGE_NAME="${REGISTRY}${IMAGE_NAME}:${VERSION}"

log_info "Building Docker image: $FULL_IMAGE_NAME"

# Check if Dockerfile exists
if [[ ! -f "Dockerfile" ]]; then
    log_error "Dockerfile not found in current directory"
    exit 1
fi

# Build the image
if [[ "$MULTI_ARCH" == "true" ]]; then
    log_info "Building multi-architecture image..."
    
    # Check if buildx is available
    if ! docker buildx version > /dev/null 2>&1; then
        log_error "Docker buildx is not available. Please install Docker buildx."
        exit 1
    fi
    
    # Create and use buildx builder
    docker buildx create --name multiarch-builder --use 2>/dev/null || docker buildx use multiarch-builder
    
    # Build for multiple architectures
    docker buildx build \
        --platform linux/amd64,linux/arm64 \
        --tag "$FULL_IMAGE_NAME" \
        $BUILD_ARGS \
        .
    
    if [[ "$PUSH_IMAGE" == "true" ]]; then
        log_info "Pushing multi-architecture image to registry..."
        docker buildx build \
            --platform linux/amd64,linux/arm64 \
            --tag "$FULL_IMAGE_NAME" \
            --push \
            $BUILD_ARGS \
            .
    fi
else
    # Build for current architecture
    docker build \
        --tag "$FULL_IMAGE_NAME" \
        $BUILD_ARGS \
        .
    
    if [[ "$PUSH_IMAGE" == "true" ]]; then
        log_info "Pushing image to registry..."
        docker push "$FULL_IMAGE_NAME"
    fi
fi

# Show image information
log_success "Image built successfully!"
log_info "Image details:"
docker images "$FULL_IMAGE_NAME" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

# Show usage instructions
cat << EOF

${GREEN}Usage Instructions:${NC}

1. Run the container:
   docker run -d --name web-server -p 80:80 $FULL_IMAGE_NAME

2. Run with Docker Compose:
   docker-compose up -d

3. Run with custom volume:
   docker run -d --name web-server -p 80:80 -v /path/to/your/app:/home/another/app $FULL_IMAGE_NAME

4. Access the application:
   http://localhost

${YELLOW}Note:${NC} Make sure to mount your application files to /home/another/app

EOF

log_success "Build completed successfully!"
