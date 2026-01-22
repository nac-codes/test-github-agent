/**
 * Calculator API - Cloudflare Worker
 * Exposes calculator functions as HTTP endpoints
 */

// Calculator functions
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

function modulo(a, b) {
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }
  return a % b;
}

function power(base, exponent, env) {
  validateApiKey(env);
  return Math.pow(base, exponent);
}

function squareRoot(n, env) {
  validateApiKey(env);
  if (n < 0) {
    throw new Error('Cannot calculate square root of negative number');
  }
  return Math.sqrt(n);
}

function factorial(n) {
  if (n < 0) {
    throw new Error('Cannot calculate factorial of negative number');
  }
  if (n === 0 || n === 1) {
    return 1;
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

function validateApiKey(env) {
  const apiKey = env.TEST_API_KEY;
  if (!apiKey) {
    throw new Error('TEST_API_KEY environment variable is required for premium features');
  }
  if (!apiKey.startsWith('test_')) {
    throw new Error('Invalid API key format - must start with "test_"');
  }
  return true;
}

// Request handler
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };

    try {
      // Parse query params
      const a = parseFloat(url.searchParams.get('a'));
      const b = parseFloat(url.searchParams.get('b'));

      let result;
      let operation;

      switch (path) {
        case '/':
          return new Response(JSON.stringify({
            name: 'Calculator API',
            version: '1.0.0',
            endpoints: {
              '/add': 'Add two numbers (?a=1&b=2)',
              '/subtract': 'Subtract b from a (?a=5&b=3)',
              '/multiply': 'Multiply two numbers (?a=4&b=5)',
              '/divide': 'Divide a by b (?a=10&b=2)',
              '/modulo': 'Modulo (remainder) of a divided by b (?a=10&b=3)',
              '/power': 'Calculate a^b (?a=2&b=3) [Premium]',
              '/sqrt': 'Square root of a (?a=16) [Premium]',
              '/factorial': 'Calculate factorial of a (?a=5)',
              '/health': 'Health check',
            }
          }), { headers });

        case '/health':
          return new Response(JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString()
          }), { headers });

        case '/add':
          operation = 'add';
          result = add(a, b);
          break;

        case '/subtract':
          operation = 'subtract';
          result = subtract(a, b);
          break;

        case '/multiply':
          operation = 'multiply';
          result = multiply(a, b);
          break;

        case '/divide':
          operation = 'divide';
          result = divide(a, b);
          break;

        case '/modulo':
          operation = 'modulo';
          result = modulo(a, b);
          break;

        case '/power':
          operation = 'power';
          result = power(a, b, env);
          break;

        case '/sqrt':
          operation = 'sqrt';
          result = squareRoot(a, env);
          break;

        case '/factorial':
          operation = 'factorial';
          result = factorial(a);
          break;

        default:
          return new Response(JSON.stringify({
            error: 'Not found',
            path: path
          }), { status: 404, headers });
      }

      return new Response(JSON.stringify({
        operation,
        a,
        b: (operation === 'sqrt' || operation === 'factorial') ? undefined : b,
        result
      }), { headers });

    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message
      }), { status: 400, headers });
    }
  }
};
