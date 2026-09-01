const http = require('http');

const API_URL = 'http://localhost:5000/api';

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

const runHardeningTests = async () => {
  try {
    console.log('--- STARTING HARDENING TESTS ---');
    
    // 1. Admin Login
    const adminLogin = await request('POST', '/auth/admin/login', null, { email: 'admin@test.com', password: 'password123' });
    const adminToken = adminLogin.data.token;

    // Cleanup first
    const getMods = await request('GET', '/admin/modules', adminToken);
    const existingTest = getMods.data.data.find(m => m.slug === 'dynamictest');
    if (existingTest) {
      await request('DELETE', `/admin/modules/${existingTest._id}`, adminToken);
    }
    const existingTest2 = getMods.data.data.find(m => m.slug === 'dynamictest2');
    if (existingTest2) {
      await request('DELETE', `/admin/modules/${existingTest2._id}`, adminToken);
    }

    // 2. Manager Login
    const managerLogin = await request('POST', '/auth/manager/login', null, { email: 'manager@test.com', password: 'password123' });
    const managerToken = managerLogin.data.token;

    // Create a generic test module
    const createMod = await request('POST', '/admin/modules', adminToken, {
      name: 'DynamicTest',
      slug: 'dynamictest',
      description: 'Test',
      isActive: true
    });
    console.log(`Create Module: ${createMod.status === 201 ? 'PASS' : 'FAIL'} (${createMod.status})`);
    const modId = createMod.data.data._id;

    // Duplicate slug test
    const dupSlug = await request('POST', '/admin/modules', adminToken, {
      name: 'DynamicTest2',
      slug: 'dynamictest',
      description: 'Test',
      isActive: true
    });
    console.log(`Duplicate Slug rejection: ${dupSlug.status === 400 ? 'PASS' : 'FAIL'} (${dupSlug.status})`);

    // Duplicate name test
    const dupName = await request('POST', '/admin/modules', adminToken, {
      name: 'DynamicTest',
      slug: 'dynamictest2',
      description: 'Test',
      isActive: true
    });
    console.log(`Duplicate Name rejection: ${dupName.status === 400 ? 'PASS' : 'FAIL'} (${dupName.status})`);

    // Assign to manager
    const me = await request('GET', '/auth/me', managerToken);
    const mId = me.data.data._id;
    const adminMe = await request('GET', '/auth/me', adminToken);

    // Get manager user to update permissions
    const getUser = await request('GET', `/admin/managers/${mId}`, adminToken);
    const assigned = getUser.data.data.assignedModules.map(m => typeof m === 'object' ? m._id : m);
    
    await request('PUT', `/admin/managers/${mId}/permissions`, adminToken, {
      moduleIds: [...assigned, modId]
    });
    console.log(`Assigned DynamicTest to Manager`);

    // Manager access
    const getDyn = await request('GET', '/modules/dynamictest/data', managerToken);
    console.log(`Manager access DynamicTest: ${getDyn.status === 200 ? 'PASS' : 'FAIL'} (${getDyn.status})`);

    // Mark inactive
    await request('PUT', `/admin/modules/${modId}`, adminToken, { isActive: false });
    console.log(`Marked DynamicTest Inactive`);

    // Manager access inactive
    const getInactive = await request('GET', '/modules/dynamictest/data', managerToken);
    console.log(`Manager access Inactive Module: ${getInactive.status === 403 ? 'PASS' : 'FAIL'} (${getInactive.status})`);

    // Mark active again
    await request('PUT', `/admin/modules/${modId}`, adminToken, { isActive: true });

    // Revoke
    await request('PUT', `/admin/managers/${mId}/permissions`, adminToken, {
      moduleIds: assigned // without modId
    });
    console.log(`Revoked DynamicTest from Manager`);

    // Manager access revoked
    const getRevoked = await request('GET', '/modules/dynamictest/data', managerToken);
    console.log(`Manager access Revoked Module: ${getRevoked.status === 403 ? 'PASS' : 'FAIL'} (${getRevoked.status})`);

    // Unknown slug
    const getUnknown = await request('GET', '/modules/unknownslug/data', adminToken);
    console.log(`Access Unknown Module: ${getUnknown.status === 404 ? 'PASS' : 'FAIL'} (${getUnknown.status})`);

    // Delete Module
    await request('DELETE', `/admin/modules/${modId}`, adminToken);
    console.log(`Deleted DynamicTest`);

    // Manager access deleted
    const getDeleted = await request('GET', '/modules/dynamictest/data', managerToken);
    console.log(`Manager access Deleted Module: ${getDeleted.status === 404 ? 'PASS' : 'FAIL'} (${getDeleted.status})`);


    console.log('--- ALL HARDENING TESTS COMPLETED ---');

  } catch(e) {
    console.error('Test Error:', e);
  }
};

runHardeningTests();
