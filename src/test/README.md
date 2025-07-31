# Gift Tracker Test Suite

This comprehensive test suite covers all aspects of the Gift Tracker application, from unit tests to end-to-end user flows.

## Test Structure

```
src/test/
├── setup.ts                      # Global test setup and configuration
├── utils.tsx                     # Test utilities and mock helpers
├── README.md                     # This documentation
├── integration/                  # Integration tests
│   ├── auth-flow.test.tsx       # Authentication flow tests
│   └── gift-management.test.tsx # Gift management workflow tests
└── e2e/                         # End-to-end tests
    ├── setup.ts                 # E2E test utilities
    └── complete-user-flow.test.tsx # Full user journey tests

src/
├── __tests__/                   # App-level tests
│   └── App.test.tsx            # Main App component tests
├── contexts/__tests__/          # Context tests
│   └── AuthContext.test.tsx    # Authentication context tests
├── services/__tests__/          # Service layer tests
│   └── api.test.ts             # API service tests
└── pages/__tests__/             # Page component tests
    └── Login.test.tsx          # Login page tests
```

## Test Categories

### 1. Unit Tests
Tests individual components, functions, and services in isolation.

**Examples:**
- `AuthContext.test.tsx` - Tests authentication context logic
- `api.test.ts` - Tests API service methods
- `Login.test.tsx` - Tests login page component

**Run with:**
```bash
npm run test:unit
```

### 2. Integration Tests
Tests how different parts of the application work together.

**Examples:**
- `auth-flow.test.tsx` - Tests complete authentication flows
- `gift-management.test.tsx` - Tests gift CRUD operations with API integration

**Run with:**
```bash
npm run test:integration
```

### 3. End-to-End Tests
Tests complete user workflows from start to finish.

**Examples:**
- `complete-user-flow.test.tsx` - Tests full user journeys from registration to dashboard

**Run with:**
```bash
npm run test:e2e
```

## Test Coverage Areas

### Authentication System
- ✅ User registration flow
- ✅ User login flow
- ✅ Session persistence
- ✅ Session expiration handling
- ✅ Error handling for invalid credentials
- ✅ Multi-step authentication workflows

### API Services
- ✅ HTTP request/response handling
- ✅ Authentication token management
- ✅ Error handling for network issues
- ✅ Request validation
- ✅ Response parsing
- ✅ CRUD operations for all entities

### Gift Management
- ✅ Gift creation with validation
- ✅ Gift status updates (planned → purchased → wrapped → given)
- ✅ Gift deletion
- ✅ Relationship handling (recipients, occasions)
- ✅ Error handling and recovery

### User Interface
- ✅ Form validation and submission
- ✅ Loading states
- ✅ Error states and recovery
- ✅ Navigation between pages
- ✅ Responsive behavior
- ✅ Accessibility features

### Data Management
- ✅ Data loading and caching
- ✅ State management
- ✅ Data synchronization
- ✅ Offline handling
- ✅ Data validation

## Test Utilities

### Mock Helpers
The test suite includes comprehensive mock helpers in `src/test/utils.tsx`:

- `mockApiService` - Mocked API service with all methods
- `mockUser`, `mockPerson`, `mockGift`, `mockOccasion` - Sample data
- `setupApiMocks()` - Function to setup API mocks for tests
- `customRender()` - Custom render function with providers

### E2E Test Helpers
The E2E test suite includes advanced helpers in `src/test/e2e/setup.ts`:

- `E2ETestHelper` - Comprehensive test scenario generator
- `createCompleteTestScenario()` - Creates full test data sets
- `mockCompleteScenario()` - Mocks complete API scenarios
- `setupAuthenticatedEnvironment()` - Sets up authenticated test state

## Running Tests

### All Tests
```bash
npm run test:all
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### With Coverage
```bash
npm run test:coverage
```

### CI/CD
```bash
npm run test:ci
```

### Interactive UI
```bash
npm run test:ui
```

## Test Configuration

### Coverage Thresholds
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Test Environment
- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Environment**: jsdom
- **Mocking**: Vitest vi functions

### Setup Files
- `src/test/setup.ts` - Global test configuration
- `vitest.config.ts` - Vitest configuration
- `vite.config.ts` - Updated with test configuration

## Best Practices

### Writing Tests
1. **Test Behavior, Not Implementation** - Focus on what the user experiences
2. **Use Descriptive Test Names** - Clearly state what is being tested
3. **Follow AAA Pattern** - Arrange, Act, Assert
4. **Mock External Dependencies** - Isolate the code under test
5. **Test Edge Cases** - Include error conditions and boundary cases

### Test Organization
1. **Group Related Tests** - Use `describe` blocks for logical grouping
2. **Setup and Teardown** - Use `beforeEach`/`afterEach` for clean test state
3. **Shared Test Data** - Use utilities for consistent test data
4. **Async Testing** - Properly handle async operations with `waitFor`

### Mock Strategy
1. **Mock at the Boundary** - Mock external services, not internal logic
2. **Reset Mocks** - Clear mocks between tests
3. **Verify Mock Calls** - Assert that mocks were called correctly
4. **Realistic Mock Data** - Use data that matches real API responses

## Debugging Tests

### Common Issues
1. **Async Operations** - Use `waitFor` for async state changes
2. **Mock Timing** - Ensure mocks are setup before components render
3. **State Cleanup** - Clear state between tests to avoid interference
4. **Error Boundaries** - Handle expected errors in tests

### Debug Tools
```bash
# Run specific test file
npm run test Login.test.tsx

# Run tests with debugging
npm run test -- --reporter=verbose

# Open test UI for debugging
npm run test:ui
```

## Performance Testing

### Load Testing Simulation
The test suite includes performance considerations:
- Large dataset handling
- Concurrent operation testing
- Memory leak detection
- Rendering performance validation

### Performance Thresholds
- Dashboard load time: < 2000ms
- API response time: < 500ms (mocked)
- Component render time: < 100ms

## Security Testing

### Authentication Security
- ✅ Token storage security
- ✅ Session expiration handling
- ✅ Unauthorized access prevention
- ✅ Input validation and sanitization

### Data Protection
- ✅ Sensitive data handling
- ✅ XSS prevention testing
- ✅ CSRF protection verification

## Continuous Integration

### GitHub Actions Example
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v1
```

## Contributing

When adding new features:
1. **Write Tests First** - TDD approach recommended
2. **Update Coverage** - Maintain coverage thresholds
3. **Test All Paths** - Include happy path and error cases
4. **Update Documentation** - Keep this README current

## Troubleshooting

### Common Test Failures
1. **Timeout Errors** - Increase timeout or fix async handling
2. **Mock Conflicts** - Ensure proper mock cleanup
3. **State Leakage** - Check for proper component unmounting
4. **API Mock Issues** - Verify mock setup and reset

### Getting Help
- Check the test output for specific error messages
- Use `screen.debug()` to see rendered output
- Enable verbose logging for API mocks
- Consult React Testing Library documentation