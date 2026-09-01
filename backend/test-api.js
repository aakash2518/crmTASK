const http = require('http');

const API_URL = 'http://localhost:5000/api';

const request = (method, path, token, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
        } catch(e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  try {
    console.log('--- STARTING API TESTS ---');
    
    // 1. Admin Login
    const adminLogin = await request('POST', '/auth/admin/login', null, { email: 'admin@test.com', password: 'password123' });
    console.log(`Admin Login: ${adminLogin.status}`);
    const adminToken = adminLogin.data.token;

    // 2. Manager Login
    const managerLogin = await request('POST', '/auth/manager/login', null, { email: 'manager@test.com', password: 'password123' });
    console.log(`Manager Login: ${managerLogin.status}`);
    const managerToken = managerLogin.data.token;

    // 3. Manager without Finance cannot read Finance
    const financeGet = await request('GET', '/modules/finance/data', managerToken);
    console.log(`Manager GET Finance: ${financeGet.status} (Expected 403)`);

    // 4. Manager without Finance cannot create Finance
    const financePost = await request('POST', '/modules/finance/data', managerToken, { title: 'Test', data: {} });
    console.log(`Manager POST Finance: ${financePost.status} (Expected 403)`);

    // 5. Manager assigned Sales can CRUD Sales
    const salesPost = await request('POST', '/modules/sales/data', managerToken, { 
      title: 'New Sale', 
      data: { customer: 'New Cust', amount: 500 } 
    });
    console.log(`Manager POST Sales: ${salesPost.status} (Expected 201)`);
    
    // 6. Invalid form data returns validation errors (Amount is required for Sales)
    const salesPostInvalid = await request('POST', '/modules/sales/data', managerToken, { 
      title: 'Bad Sale', 
      data: { customer: 'Bad Cust' } // Missing amount
    });
    console.log(`Manager POST Sales Invalid: ${salesPostInvalid.status} (Expected 422)`);

    // 7. Unknown fields are rejected/ignored safely
    const salesPostUnknown = await request('POST', '/modules/sales/data', managerToken, { 
      title: 'Unknown Fields Sale', 
      data: { customer: 'Cust', amount: 500, hackerField: 'hacked' } 
    });
    console.log(`Manager POST Sales Unknown Field: ${salesPostUnknown.status} (Expected 201)`);
    console.log(`Did it sanitize hackerField? ${salesPostUnknown.data.data.data.hackerField === undefined}`);

    // 8. Invalid authentication returns 401
    const invalidAuth = await request('GET', '/modules/sales/data', 'badtoken');
    console.log(`Invalid Auth GET Sales: ${invalidAuth.status} (Expected 401)`);

    console.log('--- ALL TESTS COMPLETED ---');

  } catch(e) {
    console.error('Test Error:', e);
  }
};

runTests();
