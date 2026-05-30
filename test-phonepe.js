const crypto = require('crypto');

async function test() {
  const merchantId = 'M23JB5PPPJHA2';
  const clientId = 'SU2605301257423455051031';
  const clientSecret = '20033de1-c1c1-424e-9de3-eeb869b3bbd4';
  
  const tokenUrl = 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';
  
  try {
    console.log('Fetching OAuth token...');
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ 
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        client_version: '1'
      }).toString()
    });
    
    const tokenData = await tokenRes.json();
    console.log('Token Response:', tokenData);
    
    if (!tokenRes.ok) {
      console.error('Failed to get token');
      return;
    }
    
    const token = tokenData.access_token;
    
    const payload = {
      merchantOrderId: 'TEST_' + Date.now(),
      amount: 100, // 1 INR
      paymentFlow: {
        type: 'PG_CHECKOUT',
        merchantUrls: {
          redirectUrl: 'http://localhost:3000/payment-pending'
        }
      }
    };

    console.log('Creating order with payload:', payload);
    const checkoutUrl = 'https://api.phonepe.com/apis/pg/checkout/v2/pay';
    
    const orderRes = await fetch(checkoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    const orderData = await orderRes.json();
    console.log('Order Response:', orderData);
    
  } catch (error) {
    console.error('Test Error:', error);
  }
}

test();
