# Makefile for PHP 7.4 Alpine Linux Container
# Hardened PHP-FPM setup with comprehensive security features

# Configuration
IMAGE_NAME = another-php
IMAGE_TAG = 7.4-alpine
CONTAINER_NAME = php-7.4-container
PHP_VERSION = 7.4

# Multi-architecture build variables
DOCKER_REGISTRY ?= docker.io
DOCKER_USERNAME ?=
DOCKER_PAT ?=
PLATFORMS = linux/amd64,linux/arm64
BUILDX_BUILDER = multiarch-builder

# Build arguments
BUILD_ARGS = --build-arg FOR_WORDPRESS=true --build-arg FOR_LARAVEL=true --build-arg WITH_XDEBUG=false

# Default target
.PHONY: help
help: ## Show this help message
	@echo "PHP 7.4 Alpine Linux Container Management"
	@echo "=========================================="
	@echo ""
	@echo "Available targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: build
build: ## Build the PHP 7.4 container image
	@echo "Building PHP 7.4 Alpine Linux container..."
	docker build $(BUILD_ARGS) -t $(IMAGE_NAME):$(IMAGE_TAG) .
	@echo "Build completed successfully!"

.PHONY: build-no-cache
build-no-cache: ## Build the Docker image without cache
	@echo "Building Docker image (no cache): $(IMAGE_NAME):$(IMAGE_TAG)"
	docker build --no-cache -t $(IMAGE_NAME):$(IMAGE_TAG) .
	@echo "Build completed successfully!"

.PHONY: build-multiarch
build-multiarch: ## Build multi-architecture PHP 7.4 container image
	@echo "Building multi-architecture PHP 7.4 Alpine Linux container..."
	docker buildx build --platform $(PLATFORMS) $(BUILD_ARGS) -t $(IMAGE_NAME):$(IMAGE_TAG) .
	@echo "Multi-architecture build completed successfully!"

.PHONY: build-dev
build-dev: ## Build PHP 7.4 container with XDebug enabled
	@echo "Building PHP 7.4 Alpine Linux container with XDebug..."
	docker build --build-arg FOR_WORDPRESS=true --build-arg FOR_LARAVEL=true --build-arg WITH_XDEBUG=true -t $(IMAGE_NAME):dev .
	@echo "Development build completed successfully!"

.PHONY: run
run: ## Run the PHP 7.4 container
	@echo "Running PHP 7.4 container..."
	docker run -d --name $(CONTAINER_NAME) -p 9000:9000 $(IMAGE_NAME):$(IMAGE_TAG)
	@echo "Container started successfully!"
	@echo "PHP-FPM is available on port 9000"

# Multi-architecture build targets
.PHONY: setup-buildx
setup-buildx: ## Setup Docker buildx for multi-architecture builds
	@echo "Setting up Docker buildx..."
	@docker buildx create --name $(BUILDX_BUILDER) --driver docker-container --use || \
		docker buildx use $(BUILDX_BUILDER)
	@docker buildx inspect --bootstrap
	@echo "Buildx setup completed!"

.PHONY: buildx-build
buildx-build: setup-buildx ## Build multi-architecture image with buildx (creates manifest, no local load)
	@echo "Building multi-architecture image: $(IMAGE_NAME):$(IMAGE_TAG)"
	@echo "Platforms: $(PLATFORMS)"
	@echo "Note: Multi-arch images cannot be loaded locally. Use buildx-build-local for single arch."
	docker buildx build \
		--platform $(PLATFORMS) \
		--tag $(IMAGE_NAME):$(IMAGE_TAG) \
		--output type=registry \
		.
	@echo "Multi-architecture build completed!"

.PHONY: buildx-build-push
buildx-build-push: setup-buildx ## Build and push multi-architecture image to registry
	@if [ -z "$(DOCKER_USERNAME)" ] || [ -z "$(DOCKER_PAT)" ]; then \
		echo "Error: DOCKER_USERNAME and DOCKER_PAT variables must be set"; \
		echo "Usage: make buildx-build-push DOCKER_USERNAME=your-username DOCKER_PAT=your-pat"; \
		echo "Get your PAT from: https://hub.docker.com/settings/security"; \
		exit 1; \
	fi
	@echo "Building and pushing multi-architecture image..."
	@echo "Registry: $(DOCKER_REGISTRY)"
	@echo "Image: $(DOCKER_USERNAME)/$(IMAGE_NAME):$(IMAGE_TAG)"
	@echo "Platforms: $(PLATFORMS)"
	@echo "$(DOCKER_PAT)" | docker login $(DOCKER_REGISTRY) -u "$(DOCKER_USERNAME)" --password-stdin
	docker buildx build \
		--platform $(PLATFORMS) \
		--tag $(DOCKER_USERNAME)/$(IMAGE_NAME):$(IMAGE_TAG) \
		--push \
		.
	@echo "Multi-architecture build and push completed!"

