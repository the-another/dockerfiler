# System Architecture Documentation

## Overview

The Dockerfile Generator CLI is a pure TypeScript tool designed to generate hardened, multi-architecture Docker images for web server setups with Nginx and PHP. The system automatically handles ARM64 and AMD64 architectures while maintaining platform-specific configurations for Alpine and Ubuntu.

## Core Principles

- **Pure TypeScript**: No frameworks, maximum performance
- **Latest Versions**: Always use latest stable versions of all dependencies
- **Performance First**: Optimized for speed and efficiency
- **Security by Default**: Hardened configurations with no security level options
- **Multi-Architecture**: Automatic generation for both ARM64 and AMD64
- **Platform Agnostic**: Same templates, different platform logic

## System Architecture

### High-Level Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    CLI Entry Point                          │
│                    (Pure TypeScript)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Command Router                              │
│           (Routes to specific commands)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Command Executors                              │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │   build:    │   deploy:   │    test:    │ validate:  │ │
│  │   image     │   image     │   image     │   image    │ │
│  │   matrix    │   matrix    │   matrix    │   matrix   │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Core Services                                  │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ Template    │ Security    │  Config     │ Validation │ │
│  │  Engine     │  Engine     │  Manager    │  Engine    │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Output Generators                              │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐ │
│  │ Dockerfile  │   Nginx     │   PHP-FPM   │   s6-      │ │
│  │ Generator   │   Config    │   Config    │  Overlay   │ │
│  └─────────────┴─────────────┴─────────────┴─────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              File System Layer                              │
│                    (Native Node.js)                        │
└─────────────────────────────────────────────────────────────┘
```

## Command Architecture

### Flat Command Structure with Colon Delimiters

Commands are organized in flat groups using colons as delimiters for better understanding and autocomplete support.

#### Command Groups

- **build:** - Image generation commands
- **deploy:** - Deployment and distribution commands  
- **test:** - Testing and validation commands
- **validate:** - Configuration and output validation commands

#### Command Examples

```bash
# Build commands
dockerfile-generator build:image --php 8.3 --platform alpine
dockerfile-generator build:image --all
dockerfile-generator build:matrix

# Deploy commands
dockerfile-generator deploy:image --env prod

# Test commands
dockerfile-generator test:image --php 8.3

# Validate commands
dockerfile-generator validate:image --php 8.3
```

### Command Flow Architecture

#### 1. Build Command Flow
```
CLI Input → Parse Args → Validate Config → Generate Matrix → Create Output → Success
    │           │           │              │              │
    ▼           ▼           ▼              ▼              ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  build  │ │  --php  │ │  Schema │ │  PHP    │ │  Files  │
│ --all   │ │  8.3    │ │ Validate│ │ Versions│ │ Written │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

#### 2. Deploy Command Flow
```
CLI Input → Parse Args → Load Config → Validate → Generate → Success
    │           │           │          │         │
    ▼           ▼           ▼          ▼         ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ deploy  │ │  --env  │ │  Config │ │  Check  │ │  Deploy │
│ --prod  │ │  prod   │ │  Loaded │ │  Passed │ │  Files  │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

#### 3. Test Command Flow
```
CLI Input → Parse Args → Load Tests → Execute → Validate → Report
    │           │           │         │         │
    ▼           ▼           ▼         ▼         ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  test   │ │  --type │ │  Test   │ │  Run    │ │  Output │
│ --all   │ │  unit   │ │  Suite  │ │  Tests  │ │ Results │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

## Configuration System

### Configuration Architecture

The system uses a hierarchical configuration approach with base configurations that can be extended by platform-specific configurations.

#### Configuration File Structure

```
configs/
├── base-config.ts                    # Base configuration interface
├── nginx-php-fpm-8.4-alpine.ts      # Alpine-specific config
├── nginx-php-fpm-8.4-ubuntu.ts      # Ubuntu-specific config
├── nginx-php-fpm-8.3-alpine.ts      # Alpine-specific config
├── nginx-php-fpm-8.3-ubuntu.ts      # Ubuntu-specific config
├── nginx-php-fpm-8.2-alpine.ts      # Alpine-specific config
├── nginx-php-fpm-8.2-ubuntu.ts      # Ubuntu-specific config
├── nginx-php-fpm-8.1-alpine.ts      # Alpine-specific config
├── nginx-php-fpm-8.1-ubuntu.ts      # Ubuntu-specific config
├── nginx-php-fpm-8.0-alpine.ts      # Alpine-specific config
├── nginx-php-fpm-8.0-ubuntu.ts      # Ubuntu-specific config
├── nginx-php-fpm-7.4-alpine.ts      # Alpine-specific config
└── nginx-php-fpm-7.4-ubuntu.ts      # Ubuntu-specific config
```

#### Base Configuration Interface

```typescript
interface BaseConfig {
  // Common PHP configuration
  php: {
    version: string;
    extensions: string[];
    fpm: {
      maxChildren: number;
      startServers: number;
      minSpareServers: number;
      maxSpareServers: number;
    };
  };
  
  // Common security configuration
  security: {
    user: string;
    group: string;
    nonRoot: boolean;
    readOnlyRoot: boolean;
    capabilities: string[];
  };
  
  // Common Nginx configuration
  nginx: {
    workerProcesses: string;
    workerConnections: number;
    gzip: boolean;
    ssl: boolean;
  };
  
  // Common s6-overlay configuration
  s6Overlay: {
    services: string[];
    crontab: string[];
  };
}
```

#### Platform-Specific Configuration

Each platform extends the base configuration with platform-specific settings:

- **Alpine**: Uses `apk` package manager, Alpine-specific optimizations
- **Ubuntu**: Uses `apt` package manager, Ubuntu-specific optimizations

### Configuration Inheritance Flow

```
Base Config → Platform Config → Final Config → Template Rendering
     │             │              │              │
     ▼             ▼              ▼              ▼
┌─────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Base   │ │  Platform   │ │  Merged     │ │  Template   │
│ Config  │ │  Overrides  │ │  Config     │ │  Applied    │
└─────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

## Template System

### Handlebars Integration

The system uses Handlebars as the template engine for its simplicity, performance, and extensibility.

#### Template Structure

- **Single Template**: One template per file type (Dockerfile, Nginx, PHP-FPM, s6-overlay)
- **Architecture Agnostic**: Same template used for both ARM64 and AMD64
- **Platform Conditional**: Platform-specific logic handled by Handlebars helpers
- **Variable Substitution**: Dynamic content injected from configuration

#### Template Examples

**Dockerfile Template**
```handlebars
FROM {{baseImage}}

# Platform-specific package installation
{{#if (eq platform.type "alpine")}}
RUN apk add --no-cache {{#each platform.packages}}{{this}} {{/each}}
{{else if (eq platform.type "ubuntu")}}
RUN {{#each platform.ubuntu.updateCommands}}{{this}} && {{/each}}apt-get install -y {{#each platform.packages}}{{this}} {{/each}}
{{/if}}

# PHP configuration
COPY php-fpm.conf /etc/php/{{php.version}}/fpm/php-fpm.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Security setup
RUN groupadd -r {{security.group}} && useradd -r -g {{security.group}} {{security.user}}

# s6-overlay setup
COPY s6-overlay/ /etc/s6-overlay/

# Platform-specific cleanup
{{#if (eq platform.type "alpine")}}
{{#each platform.alpine.cleanupCommands}}
RUN {{this}}
{{/each}}
{{else if (eq platform.type "ubuntu")}}
{{#each platform.ubuntu.cleanupCommands}}
RUN {{this}}
{{/each}}
{{/if}}

EXPOSE 80
CMD ["/init"]
```

#### Custom Handlebars Helpers

```typescript
// Equality helper
Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

// Array joining helper
Handlebars.registerHelper('join', function(array, separator) {
  return array.join(separator);
});
```

## Multi-Architecture Generation

### Architecture Handling

The system automatically generates both ARM64 and AMD64 variants for each configuration without requiring separate config files.

#### Architecture Matrix

| Platform | PHP Version | ARM64 | AMD64 |
|----------|-------------|-------|-------|
| Alpine   | 8.4         | ✓     | ✓     |
| Alpine   | 8.3         | ✓     | ✓     |
| Alpine   | 8.2         | ✓     | ✓     |
| Alpine   | 8.1         | ✓     | ✓     |
| Alpine   | 8.0         | ✓     | ✓     |
| Alpine   | 7.4         | ✓     | ✓     |
| Ubuntu   | 8.4         | ✓     | ✓     |
| Ubuntu   | 8.3         | ✓     | ✓     |
| Ubuntu   | 8.2         | ✓     | ✓     |
| Ubuntu   | 8.1         | ✓     | ✓     |
| Ubuntu   | 8.0         | ✓     | ✓     |
| Ubuntu   | 7.4         | ✓     | ✓     |

#### Output Structure

```
output/
├── nginx-php-fpm-8.4-alpine/
│   ├── arm64/
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   ├── php-fpm.conf
│   │   ├── s6-overlay/
│   │   └── scripts/
│   └── amd64/
│       ├── Dockerfile
│       ├── nginx.conf
│       ├── php-fpm.conf
│       ├── s6-overlay/
│       └── scripts/
├── nginx-php-fpm-8.4-ubuntu/
│   ├── arm64/
│   │   └── ...
│   └── amd64/
│       └── ...
└── ...
```

### Base Image Mapping

```typescript
const baseImages = {
  alpine: {
    arm64: 'arm64v8/alpine:3.19',
    amd64: 'amd64/alpine:3.19'
  },
  ubuntu: {
    arm64: 'arm64v8/ubuntu:22.04',
    amd64: 'amd64/ubuntu:22.04'
  }
};
```

## Security Engine

### Security Hardening

The system implements security best practices by default with no option to disable security features.

#### Security Features

- **Non-root User**: All containers run as non-root user
- **Read-only Root**: Root filesystem mounted as read-only where possible
- **Capability Dropping**: Unnecessary capabilities removed
- **Package Validation**: All packages verified before installation
- **Security Scanning**: Built-in vulnerability scanning
- **Minimal Attack Surface**: Only necessary packages and services included

#### Security Configuration

```typescript
security: {
  user: 'www-data',
  group: 'www-data',
  nonRoot: true,
  readOnlyRoot: true,
  capabilities: ['CHOWN', 'SETGID', 'SETUID'],
  seccomp: true,
  apparmor: true
}
```

## Validation Engine

### Configuration Validation

The system validates all configurations at multiple levels to ensure correctness and security.

#### Validation Layers

1. **Schema Validation**: Joi schemas validate configuration structure
2. **Type Validation**: TypeScript interfaces ensure type safety
3. **Security Validation**: Security rules validate security configurations
4. **Template Validation**: Templates validated for syntax and security
5. **Output Validation**: Generated files validated for correctness

#### Validation Schema Example

```typescript
const baseConfigSchema = Joi.object({
  php: Joi.object({
    version: Joi.string().pattern(/^[78]\.[0-4]$/).required(),
    extensions: Joi.array().items(Joi.string()).min(1).required(),
    fpm: Joi.object({
      maxChildren: Joi.number().min(1).max(1000).required(),
      startServers: Joi.number().min(1).max(100).required(),
      minSpareServers: Joi.number().min(1).max(100).required(),
      maxSpareServers: Joi.number().min(1).max(100).required()
    }).required()
  }).required(),
  security: Joi.object({
    user: Joi.string().min(1).required(),
    group: Joi.string().min(1).required(),
    nonRoot: Joi.boolean().required(),
    readOnlyRoot: Joi.boolean().required(),
    capabilities: Joi.array().items(Joi.string()).required()
  }).required()
});
```

## Error Handling System

### Error Types and Handling

The system implements comprehensive error handling with typed errors and helpful suggestions.

#### Error Types

- **CONFIG_LOAD_ERROR**: Configuration file loading failures
- **VALIDATION_ERROR**: Configuration validation failures
- **TEMPLATE_ERROR**: Template rendering failures
- **FILE_WRITE_ERROR**: File system operation failures
- **SECURITY_ERROR**: Security validation failures

#### Error Handling Flow

```
Error Occurs → Error Classification → Error Processing → User Feedback → Exit
     │              │                    │                │           │
     ▼              ▼                    ▼                ▼           ▼
┌─────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐
│  Error  │ │  Classify   │ │  Process    │ │  Display    │ │  Exit   │
│  Thrown │ │  Error      │ │  Error      │ │  Message    │ │  Code   │
└─────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘
```

#### Error Example

```typescript
export class DockerfileGeneratorError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public details?: any,
    public suggestions?: string[]
  ) {
    super(message);
    this.name = 'DockerfileGeneratorError';
  }
}
```

## Testing and Validation

### Testing Framework

The system includes comprehensive testing capabilities to ensure reliability and correctness.

#### Test Types

1. **Unit Tests**: Individual component testing
2. **Integration Tests**: Component interaction testing
3. **Configuration Tests**: Configuration validation testing
4. **Template Tests**: Template rendering testing
5. **Security Tests**: Security validation testing
6. **End-to-End Tests**: Complete integration testing

#### Test Command Examples

```bash
# Run all tests
dockerfile-generator test:all

# Run specific test types
dockerfile-generator test:config
dockerfile-generator test:template
dockerfile-generator test:security

# Run tests for specific variants
dockerfile-generator test:image --php 8.3 --platform alpine
```

#### Test Flow

```
Test Command → Load Test Suite → Execute Tests → Validate Results → Report
     │             │                │              │              │
     ▼             ▼                ▼              ▼              ▼
┌─────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐
│  Test   │ │  Load       │ │  Run        │ │  Validate   │ │  Output │
│ Command │ │  Tests      │ │  Tests      │ │  Results    │ │ Results │
└─────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘
```

## Performance Optimization

### Performance Features

The system is designed for maximum performance in CI/CD environments.

#### Optimization Strategies

1. **Lazy Loading**: Load only required configurations and templates
2. **Template Caching**: Cache compiled templates for reuse
3. **Parallel Processing**: Generate multiple variants simultaneously
4. **Incremental Compilation**: TypeScript incremental builds
5. **Memory Management**: Efficient memory usage patterns
6. **Streaming**: Process large files efficiently

#### Performance Benchmarks

| Operation | Target Performance |
|-----------|-------------------|
| Startup Time | < 100ms |
| Config Loading | < 50ms |
| Template Rendering | < 100ms |
| File Generation | < 500ms |
| Memory Usage | < 50MB |
| CPU Usage | < 10% |

## File Generation System

### Output Generation

The system generates complete Docker image configurations with all necessary files.

#### Generated Files

- **Dockerfile**: Multi-stage Docker build file
- **nginx.conf**: Nginx server configuration
- **php-fpm.conf**: PHP-FPM process manager configuration
- **s6-overlay/**: Process supervision configuration
- **scripts/**: Build and runtime scripts
- **config/**: Additional configuration files

#### File Generation Flow

```
Config Load → Template Render → Security Check → File Write → Validation
     │            │                │              │            │
     ▼            ▼                ▼              ▼            ▼
┌─────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐
│  Load   │ │  Render     │ │  Security   │ │  Write      │ │ Validate│
│ Config  │ │  Template   │ │  Validate   │ │  Files      │ │ Output  │
└─────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘
```

## Integration Points

### External Systems

The system integrates with various external systems for enhanced functionality.

#### Docker Integration

- **buildx**: Multi-architecture builds
- **Registry**: Image pushing and pulling
- **Compose**: Multi-service orchestration

#### CI/CD Integration

- **GitHub Actions**: Automated builds
- **GitLab CI**: Pipeline integration
- **Jenkins**: Build automation
- **ArgoCD**: GitOps deployment

#### Security Integration

- **Snyk**: Vulnerability scanning
- **Trivy**: Container security scanning
- **Clair**: Container analysis

## Deployment Architecture

### Deployment Strategies

The system supports multiple deployment strategies for different environments.

#### Deployment Types

1. **Local Development**: Local Docker environment
2. **Staging Environment**: Pre-production testing
3. **Production Environment**: Live production deployment
4. **Multi-Region**: Geographic distribution
5. **Hybrid Cloud**: Mixed cloud and on-premises

#### Deployment Flow

```
Deploy Command → Environment Config → Generate Artifacts → Deploy → Validate
      │               │                    │              │         │
      ▼               ▼                    ▼              ▼         ▼
┌─────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ ┌─────────┐
│ Deploy  │ │  Load       │ │  Generate   │ │ Deploy │ │ Validate│
│ Command │ │  Env Config │ │  Artifacts  │ │ Files  │ │ Success │
└─────────┘ └─────────────┘ └─────────────┘ └─────────┘ └─────────┘
```

## Monitoring and Observability

### System Monitoring

The system includes comprehensive monitoring and observability capabilities.

#### Monitoring Metrics

- **Performance Metrics**: Response times, throughput
- **Error Metrics**: Error rates, failure patterns
- **Resource Metrics**: Memory, CPU, disk usage
- **Business Metrics**: Generated variants, success rates

#### Logging Strategy

- **Structured Logging**: JSON-formatted logs
- **Log Levels**: Debug, Info, Warn, Error
- **Log Rotation**: Automatic log management
- **Log Aggregation**: Centralized log collection

## Security Considerations

### Security Architecture

The system implements defense-in-depth security principles.

#### Security Layers

1. **Input Validation**: All inputs validated and sanitized
2. **Authentication**: Secure access control
3. **Authorization**: Role-based permissions
4. **Data Protection**: Encryption at rest and in transit
5. **Audit Logging**: Comprehensive security event logging

#### Security Best Practices

- **Principle of Least Privilege**: Minimal required permissions
- **Defense in Depth**: Multiple security layers
- **Secure by Default**: Security enabled by default
- **Regular Updates**: Security patch management
- **Vulnerability Scanning**: Continuous security assessment

## Future Enhancements

### Planned Features

The system architecture is designed to support future enhancements and extensions.

#### Potential Enhancements

1. **Additional Platforms**: Support for more Linux distributions
2. **Language Support**: Support for additional programming languages
3. **Cloud Integration**: Native cloud platform support
4. **Advanced Security**: Additional security features and scanning
5. **Performance Optimization**: Further performance improvements
6. **Plugin System**: Extensible plugin architecture

#### Extensibility Points

- **Template Engine**: Pluggable template engines
- **Validation Rules**: Configurable validation schemas
- **Security Policies**: Customizable security rules
- **Output Formats**: Multiple output format support
- **Integration APIs**: RESTful API for external integration

## Conclusion

This system architecture provides a robust, scalable, and maintainable foundation for the Dockerfile Generator CLI tool. The design emphasizes performance, security, and ease of use while maintaining flexibility for future enhancements.

The architecture successfully addresses all requirements:
- ✅ Pure TypeScript implementation
- ✅ Multi-architecture support
- ✅ Platform-specific configurations
- ✅ Security hardening by default
- ✅ Comprehensive validation and testing
- ✅ Error handling and recovery
- ✅ Performance optimization
- ✅ Extensibility and maintainability

This foundation enables the tool to efficiently generate hardened, production-ready Docker images for various PHP versions and platforms while maintaining the highest standards of security and performance.
