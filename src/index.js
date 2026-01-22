// Simple calculator module for testing Claude Code GitHub Actions

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }
  return a / b;
}

// "Premium" functions that require API key authentication
function validateApiKey() {
  const apiKey = process.env.TEST_API_KEY;
  if (!apiKey) {
    throw new Error('TEST_API_KEY environment variable is required for premium features');
  }
  if (!apiKey.startsWith('test_')) {
    throw new Error('Invalid API key format - must start with "test_"');
  }
  return true;
}

function power(base, exponent) {
  validateApiKey();
  return Math.pow(base, exponent);
}

function squareRoot(n) {
  validateApiKey();
  if (n < 0) {
    throw new Error('Cannot calculate square root of negative number');
  }
  return Math.sqrt(n);
}

module.exports = {
  add,
  subtract,
  multiply,
  divide,
  power,
  squareRoot,
  validateApiKey
};

// Demo
if (require.main === module) {
  console.log("Calculator Demo:");
  console.log(`2 + 3 = ${add(2, 3)}`);
  console.log(`10 - 4 = ${subtract(10, 4)}`);
  console.log(`5 * 6 = ${multiply(5, 6)}`);
  console.log(`20 / 4 = ${divide(20, 4)}`);
}
