# Contributing to Typhon

Thank you for your interest in contributing to Typhon! This guide will help you get started with contributing to the project.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/abdullahcxd/Typhon.git
   cd Typhon
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Build the Project**
   ```bash
   pnpm build
   ```

## Development Workflow

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes and commit them:
   ```bash
   git commit -m "feat: add new feature"
   ```

   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New features
   - `fix:` Bug fixes
   - `docs:` Documentation changes
   - `chore:` Maintenance tasks
   - `refactor:` Code restructuring
   - `test:` Adding or modifying tests

3. Push to your fork:
   ```bash
   git push origin feature/your-feature
   ```

## Project Structure

```
Typhon/
├── lib/               # Source code
│   ├── packager/     # Packaging logic
│   └── project/      # Project management
├── test/             # Test files
└── types/            # TypeScript definitions
```

## Coding Standards

- Write in TypeScript
- Use 4 spaces for indentation
- Follow the existing code style
- Add JSDoc comments for public APIs
- Include tests for new features

## Testing

Run tests before submitting PRs:
```bash
pnpm test
```

## Pull Request Process

1. Update documentation for new features
2. Add tests for new functionality
3. Ensure CI passes
4. Wait for code review
5. Address feedback

## Branch Strategy

- `master`: Production releases
- `development`: Next release development
- Feature branches: `feature/*`
- Bug fixes: `fix/*`

## Release Process

1. Changes merged to `development`
2. Version bump in `package.json`
3. CI publishes to npm with `@dev` tag
4. Stable releases merged to `master`
5. CI publishes to npm main registry

## Additional Notes

- Check existing issues before creating new ones
- Use the issue templates
- Keep PRs focused and atomic
- Ask questions in discussions

## Getting Help

- Open a [discussion](https://github.com/abdullahcxd/Typhon/discussions)
- Check the [documentation](./docs)
- Join our [Discord server](https://discord.gg/aAMV97NYwc)

## License

By contributing, you agree that your contributions will be licensed under the project's license.