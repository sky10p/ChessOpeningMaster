# Troubleshooting Guide

## Common Issues and Solutions

### TypeScript Compilation Errors

#### Module Resolution Issues
**Error**: `Cannot find module 'contexts/RepertoireContext'`

**Cause**: Missing index.ts file after refactoring to directory structure

**Solution**:
1. Create `index.ts` in the context directory
2. Add proper exports:
```typescript
export { RepertoireContextProvider, useRepertoireContext } from './RepertoireContext';
export type { RepertoireContextType } from './types';
```
3. Update all imports to use the directory path

#### Type Definition Errors
**Error**: `Property 'getMove' does not exist on type`

**Cause**: Missing or incorrect type definitions

**Solution**: Ensure proper imports from `@chess-opening-master/common`

### Runtime Issues

#### Variant Selection Not Working
**Symptoms**: 
- Variants don't switch when moving to incompatible positions
- Selected variant becomes null unexpectedly

**Common Causes**:
1. **LAN vs ID confusion**: Function compares wrong properties
2. **Missing updateVariants calls**: Navigation methods don't trigger variant updates
3. **Incorrect path building**: buildMovePath returns wrong data

**Debug Steps**:
```typescript
// Check current state
console.log('Selected variant:', selectedVariant?.name);
console.log('Current position:', currentMoveNode.position);
console.log('Available variants:', variants.map(v => v.name));

// Check path building
const path = buildMovePath(currentMoveNode);
console.log('Move path:', path.map(m => m.lan));

// Check compatibility
variant.forEach(v => {
  console.log(`${v.name} compatible:`, isVariantCompatibleWithPath(v, path));
});
```

**Solutions**:
1. Ensure `isVariantCompatibleWithPath` uses `move.getMove().lan`
2. Add `updateVariants(targetNode)` to all navigation methods
3. Verify `buildMovePath` from common package works correctly

#### Move Addition Fails
**Symptoms**: 
- addMove doesn't create new variants
- UI doesn't update after adding moves

**Check**:
1. Chess.js move validation
2. MoveVariantNode creation
3. Variant array updates
4. State synchronization

### Test Failures

#### Chess.js Mock Issues
**Error**: `Cannot read property 'lan' of undefined`

**Cause**: Chess.js mock returns incomplete move objects

**Solution**: Update mock to include all required properties:
```typescript
return { 
  san: move,
  lan: lanNotation,    // This is critical!
  from: "e2",
  to: "e4",
  piece: 'p',
  color: 'w'
};
```

#### Async Test Failures
**Error**: Tests timeout or fail intermittently

**Cause**: Missing await/act wrappers for React state updates

**Solution**:
```typescript
// Wrap state updates
await act(async () => {
  result.current.addMove(move);
});

// Wait for effects
await waitFor(() => {
  expect(result.current.selectedVariant).not.toBeNull();
});
```

#### Mock Data Inconsistencies
**Error**: Tests expect different move sequences than provided

**Solution**:
1. Verify SAN-to-LAN mappings in chess.js mock
2. Check test data matches chess rules
3. Ensure mock moves create valid positions

### Build Issues

#### Circular Dependencies
**Error**: Build fails with circular dependency warnings

**Cause**: Imports create loops between modules

**Solution**:
1. Move shared types to separate files
2. Use dependency injection patterns
3. Restructure imports to eliminate cycles

#### Performance Warnings
**Warning**: Bundle size exceeds recommendations

**Note**: This is expected due to Stockfish engine (3MB+)

**If problematic**:
1. Implement code splitting
2. Lazy load Stockfish
3. Use dynamic imports for large dependencies

### Development Environment Issues

#### Lerna/Yarn Workspace Problems
**Error**: Packages not finding dependencies

**Solution**:
1. Run `yarn install` in root
2. Build common package first: `yarn build:common`
3. Clear node_modules if persistent: `rm -rf node_modules && yarn install`

#### Hot Reload Not Working
**Problem**: Changes don't trigger reload

**Check**:
1. Webpack dev server configuration
2. File watching permissions
3. Symlink handling in node_modules

### Database/Backend Issues

#### MongoDB Connection
**Error**: Cannot connect to database

**Solution**:
1. Start MongoDB container: `docker-compose up -d`
2. Check connection string in environment variables
3. Verify MongoDB is running on correct port (27017)

#### CORS Issues
**Error**: Frontend cannot reach backend API

**Check**:
1. Backend running on correct port
2. CORS middleware configuration
3. Frontend API base URL configuration

## Debug Workflow

### 1. Compilation Issues
1. Check TypeScript errors in VS Code
2. Run `yarn build` to see all errors
3. Fix imports and type definitions
4. Verify package dependencies

### 2. Runtime Issues
1. Check browser console for errors
2. Add strategic console.logs
3. Use React Developer Tools
4. Step through navigation flow

### 3. Test Issues
1. Run specific failing test
2. Check mock implementations
3. Verify async handling
4. Add debug output to tests

### 4. Integration Issues
1. Test individual packages
2. Check inter-package dependencies
3. Verify build order (common -> others)
4. Test in isolation

## Prevention Strategies

### Code Quality
1. Always run tests before committing
2. Use TypeScript strict mode
3. Implement proper error boundaries
4. Add comprehensive test coverage

### Documentation
1. Update docs when changing architecture
2. Document complex logic (variant selection)
3. Keep troubleshooting guide current
4. Add code comments for non-obvious logic

### Development Process
1. Build common package first
2. Test changes in isolation
3. Verify cross-package compatibility
4. Run full test suite before deployment

## Quick Reference

### Essential Commands
```bash
# Full build
yarn build

# Run tests
yarn test

# Development servers
yarn start:dev

# Type checking
yarn front:tsc:noEmits

# Specific package work
yarn workspace @chess-opening-master/frontend add package-name
```

### Critical Files
- `packages/frontend/src/contexts/RepertoireContext/` - Main context
- `packages/frontend/src/__mocks__/chess.js.ts` - Chess.js mock
- `packages/common/src/types/MoveVariantNode.ts` - Move node implementation
- `tsconfig.base.json` - TypeScript configuration
- `lerna.json` - Monorepo configuration

### Key Functions to Understand
- `buildMovePath()` - Creates move sequences
- `isVariantCompatibleWithPath()` - Checks variant compatibility
- `findBestVariantForNode()` - Selects appropriate variant
- `updateVariants()` - Triggers variant recalculation