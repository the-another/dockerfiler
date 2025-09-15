# Makefile for Alpine Linux Docker Image with Nginx, PHP-FPM 7.4, and s6-overlay
# Supports WordPress and Laravel applications with comprehensive security hardening

# Variables
IMAGE_NAME = another-php
IMAGE_TAG = 7.4-nginx-alpine
CONTAINER_NAME = another-php-7.4-nginx-alpine
PHP_VERSION = 7.4

PORT = 8080

# Multi-architecture build variables
DOCKER_REGISTRY ?= docker.io
DOCKER_USERNAME ?= 
DOCKER_PAT ?= 
PLATFORMS = linux/amd64,linux/arm64
BUILDX_BUILDER = multiarch-builder

# Default target
.PHONY: help
help: ## Show this help message
	@echo "Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Example usage:"
	@echo "  make build          # Build the Docker image"
	@echo "  make run            # Run the container on port 8080"
	@echo "  make stop           # Stop the running container"
	@echo "  make clean          # Remove container and image"

.PHONY: build
build: ## Build the Docker image
	@echo "Building Docker image: $(IMAGE_NAME):$(IMAGE_TAG)"
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .
	@echo "Build completed successfully!"

.PHONY: build-no-cache
build-no-cache: ## Build the Docker image without cache
	@echo "Building Docker image (no cache): $(IMAGE_NAME):$(IMAGE_TAG)"
	docker build --no-cache -t $(IMAGE_NAME):$(IMAGE_TAG) .
	@echo "Build completed successfully!"

.PHONY: run
run: ## Run the container
	@echo "Starting container: $(CONTAINER_NAME)"
	@echo "Application will be available at: http://localhost:$(PORT)"
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):80 \
		$(IMAGE_NAME):$(IMAGE_TAG)
	@echo "Container started successfully!"
	@echo "To view logs: make logs"
	@echo "To stop: make stop"

.PHONY: run-interactive
run-interactive: ## Run the container in interactive mode
	@echo "Starting container in interactive mode: $(CONTAINER_NAME)"
	docker run -it \
		--name $(CONTAINER_NAME) \
		-p $(PORT):80 \
		$(IMAGE_NAME):$(IMAGE_TAG) \
		/bin/sh

.PHONY: run-with-volume
run-with-volume: ## Run the container with volume mount for development
	@echo "Starting container with volume mount: $(CONTAINER_NAME)"
	@echo "Mounting current directory to /home/another/app in container"
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):80 \
		-v $(PWD):/home/another/app \
		$(IMAGE_NAME):$(IMAGE_TAG)
	@echo "Container started with volume mount!"
	@echo "Application will be available at: http://localhost:$(PORT)"

.PHONY: stop
stop: ## Stop the running container
	@echo "Stopping container: $(CONTAINER_NAME)"
	docker stop $(CONTAINER_NAME) || true
	@echo "Container stopped!"

.PHONY: restart
restart: stop run ## Restart the container

.PHONY: logs
logs: ## Show container logs
	@echo "Showing logs for container: $(CONTAINER_NAME)"
	docker logs -f $(CONTAINER_NAME)

.PHONY: shell
shell: ## Open a shell in the running container
	@echo "Opening shell in container: $(CONTAINER_NAME)"
	docker exec -it $(CONTAINER_NAME) /bin/sh

.PHONY: status
status: ## Show container status
	@echo "Container status:"
	docker ps -a --filter name=$(CONTAINER_NAME)

.PHONY: clean
clean: stop ## Remove container and image
	@echo "Removing container: $(CONTAINER_NAME)"
	docker rm $(CONTAINER_NAME) || true
	@echo "Removing image: $(IMAGE_NAME):$(IMAGE_TAG)"
	docker rmi $(IMAGE_NAME):$(IMAGE_TAG) || true
	@echo "Cleanup completed!"

.PHONY: clean-all
clean-all: clean ## Remove all related images and containers
	@echo "Removing all related images and containers..."
	docker images | grep $(IMAGE_NAME) | awk '{print $$3}' | xargs docker rmi -f || true
	docker ps -a | grep $(CONTAINER_NAME) | awk '{print $$1}' | xargs docker rm -f || true
	@echo "Complete cleanup finished!"

.PHONY: test
test: ## Test the container health
	@echo "Testing container health..."
	@echo "Waiting for container to be ready..."
	@sleep 5
	@echo "Testing HTTP response..."
	@curl -f http://localhost:$(PORT) > /dev/null && echo "✅ Container is healthy!" || echo "❌ Container health check failed"

.PHONY: info
info: ## Show image and container information
	@echo "=== Image Information ==="
	docker images $(IMAGE_NAME):$(IMAGE_TAG) 2>/dev/null || echo "Image not found"
	@echo ""
	@echo "=== Container Information ==="
	docker ps -a --filter name=$(CONTAINER_NAME) 2>/dev/null || echo "No containers found"
	@echo ""
	@echo "=== Image Details ==="
	docker inspect $(IMAGE_NAME):$(IMAGE_TAG) 2>/dev/null | jq '.[0].Config' || echo "Image not found"

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

.PHONY: buildx-build-local
buildx-build-local: setup-buildx ## Build single architecture image locally (for testing)
	@echo "Building single architecture image locally: $(IMAGE_NAME):$(IMAGE_TAG)"
	@echo "Platform: $(shell uname -m | sed 's/x86_64/linux\/amd64/; s/aarch64/linux\/arm64/')"
	docker buildx build \
		--platform $(shell uname -m | sed 's/x86_64/linux\/amd64/; s/aarch64/linux\/arm64/') \
		--tag $(IMAGE_NAME):$(IMAGE_TAG) \
		--load \
		.
	@echo "Single architecture build completed!"

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

.PHONY: buildx-build-push-dockerhub
buildx-build-push-dockerhub: ## Build and push to Docker Hub (requires DOCKER_USERNAME and DOCKER_PAT)
	@if [ -z "$(DOCKER_USERNAME)" ] || [ -z "$(DOCKER_PAT)" ]; then \
		echo "Error: DOCKER_USERNAME and DOCKER_PAT variables must be set"; \
		echo "Usage: make buildx-build-push-dockerhub DOCKER_USERNAME=your-username DOCKER_PAT=your-pat"; \
		echo "Get your PAT from: https://hub.docker.com/settings/security"; \
		exit 1; \
	fi
	@$(MAKE) buildx-build-push DOCKER_REGISTRY=docker.io

.PHONY: buildx-build-cache
buildx-build-cache: setup-buildx ## Build multi-architecture image with cache (for development)
	@echo "Building multi-architecture image with cache: $(IMAGE_NAME):$(IMAGE_TAG)"
	@echo "Platforms: $(PLATFORMS)"
	docker buildx build \
		--platform $(PLATFORMS) \
		--tag $(IMAGE_NAME):$(IMAGE_TAG) \
		--cache-from type=local,src=/tmp/.buildx-cache \
		--cache-to type=local,dest=/tmp/.buildx-cache-new \
		.
	@echo "Multi-architecture build with cache completed!"

.PHONY: buildx-inspect
buildx-inspect: ## Inspect buildx builder and show available platforms
	@echo "Buildx builder information:"
	@docker buildx ls
	@echo ""
	@echo "Current builder details:"
	@docker buildx inspect

.PHONY: buildx-manifest
buildx-manifest: ## Create and push manifest for multi-architecture image
	@if [ -z "$(DOCKER_USERNAME)" ]; then \
		echo "Error: DOCKER_USERNAME variable must be set"; \
		echo "Usage: make buildx-manifest DOCKER_USERNAME=your-username"; \
		exit 1; \
	fi
	@echo "Creating manifest for: $(DOCKER_USERNAME)/$(IMAGE_NAME):$(IMAGE_TAG)"
	docker manifest create $(DOCKER_USERNAME)/$(IMAGE_NAME):$(IMAGE_TAG) \
		--amend $(DOCKER_USERNAME)/$(IMAGE_NAME):$(IMAGE_TAG)-amd64 \
		--amend $(DOCKER_USERNAME)/$(IMAGE_NAME):$(IMAGE_TAG)-arm64
	docker manifest push $(DOCKER_USERNAME)/$(IMAGE_NAME):$(IMAGE_TAG)
	@echo "Manifest created and pushed!"

.PHONY: push
push: ## Push image to registry (requires DOCKER_REGISTRY variable)
	@if [ -z "$(DOCKER_REGISTRY)" ]; then \
		echo "Error: DOCKER_REGISTRY variable not set"; \
		echo "Usage: make push DOCKER_REGISTRY=your-registry.com"; \
		exit 1; \
	fi
	@echo "Pushing image to registry: $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)"
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	docker push $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	@echo "Push completed!"

.PHONY: pull
pull: ## Pull image from registry (requires DOCKER_REGISTRY variable)
	@if [ -z "$(DOCKER_REGISTRY)" ]; then \
		echo "Error: DOCKER_REGISTRY variable not set"; \
		echo "Usage: make pull DOCKER_REGISTRY=your-registry.com"; \
		exit 1; \
	fi
	@echo "Pulling image from registry: $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)"
	docker pull $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	docker tag $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG) $(IMAGE_NAME):$(IMAGE_TAG)
	@echo "Pull completed!"

# Development targets
.PHONY: dev
dev: build run-with-volume ## Build and run with volume mount for development
	@echo "Development environment ready!"
	@echo "Application available at: http://localhost:$(PORT)"
	@echo "Files are mounted from: $(PWD)"

.PHONY: rebuild
rebuild: clean build ## Clean and rebuild the image

# Security and maintenance
.PHONY: security-scan
security-scan: ## Run security scan on the image (requires trivy)
	@echo "Running security scan on image: $(IMAGE_NAME):$(IMAGE_TAG)"
	@which trivy > /dev/null || (echo "Error: trivy not installed. Install with: brew install trivy" && exit 1)
	trivy image $(IMAGE_NAME):$(IMAGE_TAG)

.PHONY: size
size: ## Show image size information
	@echo "Image size information:"
	docker images $(IMAGE_NAME):$(IMAGE_TAG) --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Test architecture detection
.PHONY: test-arch
test-arch: ## Test architecture detection in container
	@echo "Testing architecture detection..."
	@echo "Host architecture: $(shell uname -m)"
	@echo "Docker platform mapping: $(shell uname -m | sed 's/x86_64/linux\/amd64/; s/aarch64/linux\/arm64/')"
	@echo "Building test container to verify architecture detection..."
	docker run --rm alpine:3.22 sh -c "echo 'Container architecture:' && uname -m && echo 'Available OpenSSL configs:' && wget -q -O - https://www.openssl.org/source/openssl-1.1.1w.tar.gz | tar -tzf - | head -5"

# Default target when no target is specified
.DEFAULT_GOAL := help
