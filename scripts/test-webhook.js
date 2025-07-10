#!/usr/bin/env node

/**
 * Test script for webhook debugging
 * Usage: node scripts/test-webhook.js [userId] [sessionId]
 */

const https = require('https');
const http = require('http');

const userId = process.argv[2];
const sessionId = process.argv[3] || `cs_test_${Date.now()}`;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

if (!userId) {
  console.error('❌ Usage: node scripts/test-webhook.js <userId> [sessionId]');
  process.exit(1);
}

console.log('🔄 Test Webhook: Starting webhook test...');
console.log('🔄 Test Webhook: User ID:', userId);
console.log('🔄 Test Webhook: Session ID:', sessionId);
console.log('🔄 Test Webhook: Base URL:', baseUrl);

// Create a test webhook event
const testEvent = {
  id: 'evt_test_' + Date.now(),
  object: 'event',
  api_version: '2023-10-16',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: sessionId,
      object: 'checkout.session',
      amount_total: 50,
      currency: 'usd',
      customer: null,
      metadata: {
        userId: userId,
        environment: 'test'
      },
      payment_status: 'paid',
      status: 'complete'
    }
  },
  livemode: false,
  pending_webhooks: 1,
  request: {
    id: 'req_test_' + Date.now(),
    idempotency_key: null
  },
  type: 'checkout.session.completed'
};

// Function to make HTTP request
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test the webhook
async function testWebhook() {
  try {
    const webhookUrl = `${baseUrl}/api/stripe/webhook`;
    console.log('🔄 Test Webhook: Sending to:', webhookUrl);
    
    const response = await makeRequest(webhookUrl, testEvent);
    
    console.log('✅ Test Webhook: Response status:', response.statusCode);
    console.log('✅ Test Webhook: Response headers:', response.headers);
    console.log('✅ Test Webhook: Response data:', response.data);
    
    if (response.statusCode === 200) {
      console.log('✅ Test Webhook: Success! Webhook processed correctly.');
    } else {
      console.log('❌ Test Webhook: Failed with status:', response.statusCode);
    }
    
  } catch (error) {
    console.error('❌ Test Webhook: Error:', error.message);
  }
}

// Test payment status check
async function testPaymentStatus() {
  try {
    const statusUrl = `${baseUrl}/api/check-payment-status`;
    console.log('\n🔄 Test Payment Status: Checking...');
    
    const response = await makeRequest(statusUrl, { userId });
    
    console.log('✅ Test Payment Status: Response status:', response.statusCode);
    console.log('✅ Test Payment Status: Response data:', response.data);
    
  } catch (error) {
    console.error('❌ Test Payment Status: Error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testWebhook();
  await testPaymentStatus();
}

runTests(); 