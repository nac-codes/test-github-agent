const { add, subtract, multiply, divide, modulo, power, squareRoot, factorial, validateApiKey } = require('./index');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`✗ ${name}: ${e.message}`);
    failed++;
  }
}

function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}`);
  }
}

function assertThrows(fn, expectedMessage) {
  try {
    fn();
    throw new Error('Expected function to throw an error');
  } catch (e) {
    if (!e.message.includes(expectedMessage)) {
      throw new Error(`Expected error message to include "${expectedMessage}", got "${e.message}"`);
    }
  }
}

// Tests
test('add: 2 + 3 = 5', () => assertEqual(add(2, 3), 5));
test('add: -1 + 1 = 0', () => assertEqual(add(-1, 1), 0));
test('subtract: 10 - 4 = 6', () => assertEqual(subtract(10, 4), 6));
test('multiply: 5 * 6 = 30', () => assertEqual(multiply(5, 6), 30));
test('divide: 20 / 4 = 5', () => assertEqual(divide(20, 4), 5));
test('divide: throws error on division by zero', () => assertThrows(() => divide(10, 0), 'Division by zero'));
test('divide: throws error on division by zero with negative dividend', () => assertThrows(() => divide(-10, 0), 'Division by zero'));
test('modulo: 10 % 3 = 1', () => assertEqual(modulo(10, 3), 1));
test('modulo: 20 % 7 = 6', () => assertEqual(modulo(20, 7), 6));
test('modulo: 15 % 5 = 0', () => assertEqual(modulo(15, 5), 0));
test('modulo: throws error on modulo by zero', () => assertThrows(() => modulo(10, 0), 'Division by zero'));
test('factorial: 0! = 1', () => assertEqual(factorial(0), 1));
test('factorial: 1! = 1', () => assertEqual(factorial(1), 1));
test('factorial: 5! = 120', () => assertEqual(factorial(5), 120));
test('factorial: 10! = 3628800', () => assertEqual(factorial(10), 3628800));
test('factorial: throws error on negative number', () => assertThrows(() => factorial(-1), 'Cannot calculate factorial of negative number'));

// Premium feature tests (require TEST_API_KEY env variable)
console.log('\n--- Premium Features (require TEST_API_KEY) ---');

if (process.env.TEST_API_KEY) {
  test('validateApiKey: accepts valid key', () => assertEqual(validateApiKey(), true));
  test('power: 2^3 = 8', () => assertEqual(power(2, 3), 8));
  test('power: 5^0 = 1', () => assertEqual(power(5, 0), 1));
  test('squareRoot: sqrt(16) = 4', () => assertEqual(squareRoot(16), 4));
  test('squareRoot: sqrt(0) = 0', () => assertEqual(squareRoot(0), 0));
  test('squareRoot: throws on negative', () => assertThrows(() => squareRoot(-1), 'negative number'));
} else {
  console.log('⚠ Skipping premium tests - TEST_API_KEY not set');
  test('power: throws without API key', () => assertThrows(() => power(2, 3), 'TEST_API_KEY'));
  test('squareRoot: throws without API key', () => assertThrows(() => squareRoot(16), 'TEST_API_KEY'));
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
