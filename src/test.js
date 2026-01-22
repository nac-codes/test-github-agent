const { add, subtract, multiply, divide } = require('./index');

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

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
