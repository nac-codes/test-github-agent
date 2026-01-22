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

// TODO: Add a power function
// TODO: Add a square root function

module.exports = {
  add,
  subtract,
  multiply,
  divide
};

// Demo
if (require.main === module) {
  console.log("Calculator Demo:");
  console.log(`2 + 3 = ${add(2, 3)}`);
  console.log(`10 - 4 = ${subtract(10, 4)}`);
  console.log(`5 * 6 = ${multiply(5, 6)}`);
  console.log(`20 / 4 = ${divide(20, 4)}`);
}
