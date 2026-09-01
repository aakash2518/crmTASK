const http = require('http');

const request = (method, path, token, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
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

const runRegressionTests = async () => {
  try {
    console.log('--- STARTING REGRESSION TESTS ---');
    
    // 1. Admin Login
    const adminLogin = await request('POST', '/auth/admin/login', null, { email: 'admin@test.com', password: 'password123' });
    const adminToken = adminLogin.data.token;

    // 2. Manager Login
    const managerLogin = await request('POST', '/auth/manager/login', null, { email: 'manager@test.com', password: 'password123' });
    const managerToken = managerLogin.data.token;

    // Test Admin endpoints with Admin Token -> Should be 200/201
    const adminModules = await request('GET', '/admin/modules', adminToken);
    console.log(`Admin GET /admin/modules: ${adminModules.status === 200 ? 'PASS' : 'FAIL'} (${adminModules.status})`);

    const adminManagers = await request('GET', '/admin/managers', adminToken);
    console.log(`Admin GET /admin/managers: ${adminManagers.status === 200 ? 'PASS' : 'FAIL'} (${adminManagers.status})`);

    // Test Admin endpoints with Manager Token -> Should be 403
    const managerToAdminModules = await request('GET', '/admin/modules', managerToken);
    console.log(`Manager GET /admin/modules: ${managerToAdminModules.status === 403 ? 'PASS' : 'FAIL'} (${managerToAdminModules.status})`);

    const managerToAdminManagers = await request('GET', '/admin/managers', managerToken);
    console.log(`Manager GET /admin/managers: ${managerToAdminManagers.status === 403 ? 'PASS' : 'FAIL'} (${managerToAdminManagers.status})`);

    // Test Unassigned Module -> Should be 403
    // Assuming 'finance' is unassigned to the seeded manager
    const managerToFinance = await request('GET', '/modules/finance/data', managerToken);
    console.log(`Manager GET Unassigned Module (finance): ${managerToFinance.status === 403 ? 'PASS' : 'FAIL'} (${managerToFinance.status})`);

    // Test Unauthenticated -> Should be 401
    const unauthToAdmin = await request('GET', '/admin/modules', null);
    console.log(`Unauth GET /admin/modules: ${unauthToAdmin.status === 401 ? 'PASS' : 'FAIL'} (${unauthToAdmin.status})`);

    const unauthToManager = await request('GET', '/modules/sales/data', null);
    console.log(`Unauth GET /modules/sales/data: ${unauthToManager.status === 401 ? 'PASS' : 'FAIL'} (${unauthToManager.status})`);

    // Test Invalid Token -> Should be 401
    const invalidTokenToAdmin = await request('GET', '/admin/modules', 'invalid_token');
    console.log(`Invalid Token GET /admin/modules: ${invalidTokenToAdmin.status === 401 ? 'PASS' : 'FAIL'} (${invalidTokenToAdmin.status})`);

    console.log('--- ALL REGRESSION TESTS COMPLETED ---');

  } catch(e) {
    console.error('Test Error:', e);
  }
};

runRegressionTests();
