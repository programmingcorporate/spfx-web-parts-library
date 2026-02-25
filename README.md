# SPFx Web Parts Library

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue.svg)](https://www.typescriptlang.org/)
[![SharePoint Framework](https://img.shields.io/badge/SPFx-1.16+-brightgreen.svg)](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)

A professional SharePoint Framework (SPFx) web parts library featuring reusable, enterprise-grade components with TypeScript, PnP controls, and Microsoft Graph integration. This repository demonstrates best practices for modern SPFx development.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Development](#development)
- [Building](#building)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Enterprise-Grade Components**: Reusable, well-tested web parts ready for production
- **TypeScript Support**: Full TypeScript 4.x support with strict type checking
- **PnP Controls**: Integration with PnP/pnpjs for enhanced functionality
- **Microsoft Graph API**: Built-in support for Microsoft Graph integration
- **Modern Development Practices**: ESLint, Prettier, and comprehensive documentation
- **Responsive Design**: Mobile-friendly and accessible components
- **Unit Testing**: Jest-based testing framework with code coverage
- **Continuous Integration**: GitHub Actions ready for CI/CD pipelines

## Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js**: v16.x or higher
- **npm**: v7.x or higher
- **Yeoman**: For SPFx scaffolding
- **Gulp CLI**: v4.x or higher

```bash
npm install -g yo gulp-cli @microsoft/generator-sharepoint
```

## Project Structure

```
spfx-web-parts-library/
├── src/
│   ├── webparts/
│   │   └── [WebPartName]/
│   │       ├── components/
│   │       ├── [WebPartName].tsx
│   │       ├── [WebPartName]WebPart.ts
│   │       └── [WebPartName].module.scss
│   ├── services/
│   │   └── [ServiceName].ts
│   ├── models/
│   │   └── [InterfaceFile].ts
│   └── styles/
│       └── [Shared styles].scss
├── tests/
│   └── [Unit tests]
├── config/
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/programmingcorporate/spfx-web-parts-library.git
   cd spfx-web-parts-library
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install global dependencies** (if not already installed)
   ```bash
   npm install -g yo gulp-cli @microsoft/generator-sharepoint
   ```

## Development

### Running the Development Server

```bash
npm run serve
```

This will start the local development server at `https://localhost:4321`. You can test web parts using the Workbench.

### Creating a New Web Part

```bash
yo @microsoft/sharepoint
```

Follow the prompts to generate a new web part component.

### Code Formatting

The project uses Prettier for code formatting and ESLint for linting.

```bash
# Format code
npm run format

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## Building

### Development Build

```bash
npm run build
```

### Production Build

```bash
npm run build -- --ship
```

### Bundle Analysis

```bash
npm run bundle:analyze
```

## Testing

### Run Unit Tests

```bash
npm run test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Watch Mode (Development)

```bash
npm run test:watch
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- Follow TypeScript strict mode
- Add unit tests for new features
- Update documentation
- Use meaningful commit messages
- Maintain consistent code style (Prettier + ESLint)

## Key Dependencies

- **@microsoft/sp-core-library**: SharePoint Framework core
- **react**: UI library
- **@pnp/sp**: PnP/pnpjs for enhanced functionality
- **@pnp/pnpjs**: Microsoft Graph and SharePoint REST APIs
- **@fluentui/react**: Microsoft Fluent UI components

## Useful Resources

- [SharePoint Framework Documentation](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview)
- [PnP JavaScript](https://pnp.github.io/pnpjs/)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/overview)
- [Fluent UI React](https://developer.microsoft.com/en-us/fluentui)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Troubleshooting

### Common Issues

**Issue**: `Node Sass does not yet support your current environment`

**Solution**: Clear node_modules and reinstall
```bash
rm -rf node_modules
npm install
```

**Issue**: Port 4321 already in use

**Solution**: Kill the process or specify a different port
```bash
npm run serve -- --port 4322
```

## Support

For issues, questions, or feature requests, please open an [GitHub Issue](https://github.com/programmingcorporate/spfx-web-parts-library/issues).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Corporate Programming** - [GitHub Profile](https://github.com/programmingcorporate)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

---

**Last Updated**: February 2026

**Status**: Active Development

⭐ If you find this repository helpful, please consider giving it a star!
