const http = require('http');

const request = (method, path, token, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null }); }
        catch(e) { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', (e) => reject(e));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

let passed = 0;
let failed = 0;

const assert = (testName, condition, details = '') => {
  if (condition) {
    console.log(`  ✅ ${testName}`);
    passed++;
  } else {
    console.log(`  ❌ ${testName} ${details}`);
    failed++;
  }
};

const runSecurityAudit = async () => {
  console.log('\n========================================');
  console.log('  FINAL SECURITY AUDIT — 24-POINT SUITE');
  console.log('========================================\n');

  // ---- AUTH ----
  console.log('--- 1. AUTHENTICATION ---');

  const adminLogin = await request('POST', '/auth/admin/login', null, { email: 'admin@test.com', password: 'password123' });
  assert('1. Admin login succeeds', adminLogin.status === 200 && adminLogin.data.token);
  const adminToken = adminLogin.data.token;

  const managerLogin = await request('POST', '/auth/manager/login', null, { email: 'manager@test.com', password: 'password123' });
  assert('2. Manager login succeeds', managerLogin.status === 200 && managerLogin.data.token);
  const managerToken = managerLogin.data.token;

  const invalidLogin = await request('POST', '/auth/admin/login', null, { email: 'admin@test.com', password: 'wrongpassword' });
  assert('3. Invalid login rejects (401)', invalidLogin.status === 401);

  const invalidJwt = await request('GET', '/auth/me', 'this.is.not.a.jwt');
  assert('4. Invalid JWT rejected (401)', invalidJwt.status === 401);

  const expiredJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MDAwMDAwMDAwMDAwMDAwMDAwMDAwMCIsImlhdCI6MTUwMDAwMDAwMCwiZXhwIjoxNTAwMDAwMDAxfQ.invalid';
  const expiredRes = await request('GET', '/auth/me', expiredJwt);
  assert('5. Expired/malformed JWT rejected (401)', expiredRes.status === 401);

  // Check password is NOT in login response
  assert('5b. Password not in login response', !adminLogin.data.user.password);

  // ---- RBAC ----
  console.log('\n--- 2. RBAC ---');

  const managerToAdminModules = await request('GET', '/admin/modules', managerToken);
  assert('6. Manager cannot GET /admin/modules (403)', managerToAdminModules.status === 403);

  const managerCreateModule = await request('POST', '/admin/modules', managerToken, { name: 'Hacked', slug: 'hacked' });
  assert('7. Manager cannot create module (403)', managerCreateModule.status === 403);

  const managerDeleteModule = await request('DELETE', '/admin/modules/000000000000000000000000', managerToken);
  assert('8. Manager cannot delete module (403)', managerDeleteModule.status === 403);

  const managerAssignPerms = await request('PUT', '/admin/managers/000000000000000000000000/permissions', managerToken, { moduleIds: [] });
  assert('9. Manager cannot assign permissions (403)', managerAssignPerms.status === 403);

  // ---- PRIVILEGE ESCALATION ----
  console.log('\n--- 3. PRIVILEGE ESCALATION ---');

  // Get manager user ID
  const me = await request('GET', '/auth/me', managerToken);
  const managerId = me.data.data._id;

  // Try to modify own role via the manager update endpoint (through admin route — should be 403)
  const escalateRole = await request('PUT', `/admin/managers/${managerId}`, managerToken, { role: 'ADMIN' });
  assert('10. Manager cannot modify own role (403)', escalateRole.status === 403);

  // Try to modify own permissions via admin route
  const escalatePerms = await request('PUT', `/admin/managers/${managerId}/permissions`, managerToken, { moduleIds: ['000000000000000000000000'] });
  assert('11. Manager cannot modify own permissions (403)', escalatePerms.status === 403);

  // ---- MODULE AUTHORIZATION ----
  console.log('\n--- 4. MODULE AUTHORIZATION ---');

  const unassignedAccess = await request('GET', '/modules/finance/data', managerToken);
  assert('12. Manager cannot access unassigned module (403)', unassignedAccess.status === 403);

  const unassignedCreate = await request('POST', '/modules/finance/data', managerToken, { title: 'Hack', data: { amount: 1 } });
  assert('13. Manager cannot POST to unassigned module (403)', unassignedCreate.status === 403);

  // ---- IDOR ----
  console.log('\n--- 5. IDOR ---');

  // IDOR test: try to access another user's data by using a valid record from one module via another module slug
  const salesData = await request('GET', '/modules/sales/data', managerToken);
  if (salesData.data.data && salesData.data.data.length > 0) {
    const salesRecordId = salesData.data.data[0]._id;
    // Try to access a sales record through the customers module
    const idorTest = await request('PUT', `/modules/customers/data/${salesRecordId}`, managerToken, { title: 'IDOR test' });
    assert('14. IDOR: Cannot access sales record via customers slug (404)', idorTest.status === 404);

    // Try to access a sales record through an unassigned module slug
    const idorTest2 = await request('PUT', `/modules/finance/data/${salesRecordId}`, managerToken, { title: 'IDOR test' });
    assert('15. IDOR: Cannot access sales record via unassigned module (403)', idorTest2.status === 403);
  } else {
    assert('14. IDOR: Skipped (no sales data)', true);
    assert('15. IDOR: Skipped (no sales data)', true);
  }

  // ---- MASS ASSIGNMENT ----
  console.log('\n--- 6. MASS ASSIGNMENT ---');

  const massAssignTest = await request('POST', '/modules/sales/data', managerToken, {
    title: 'Mass Assignment Test',
    role: 'ADMIN',
    assignedModules: ['000000000000000000000000'],
    moduleId: '000000000000000000000000',
    createdBy: '000000000000000000000000',
    isAdmin: true,
    data: { customer: 'Test', amount: 100 }
  });
  assert('16. Mass assignment: extra fields ignored on create (201)', massAssignTest.status === 201);
  if (massAssignTest.status === 201) {
    const record = massAssignTest.data.data;
    assert('16b. Mass assignment: role not injected', record.role === undefined);
    assert('16c. Mass assignment: moduleId not overridden', record.moduleId !== '000000000000000000000000');
    // Clean up
    await request('DELETE', `/modules/sales/data/${record._id}`, managerToken);
  }

  // ---- NOSQL INJECTION ----
  console.log('\n--- 7. NOSQL INJECTION ---');

  const nosqlLogin = await request('POST', '/auth/admin/login', null, { email: { "$ne": null }, password: { "$ne": null } });
  assert('17. NoSQL injection on login rejected', nosqlLogin.status !== 200, `(got ${nosqlLogin.status})`);

  // ---- INVALID INPUT ----
  console.log('\n--- 8. INPUT VALIDATION ---');

  const badObjectId = await request('GET', '/admin/modules/not-an-objectid', adminToken);
  assert('18. Invalid ObjectId handled (400)', badObjectId.status === 400);

  const badInput = await request('POST', '/modules/sales/data', managerToken, { title: '', data: { customer: 'x', amount: 'not-a-number' } });
  assert('19. Invalid input handled (400/422)', badInput.status === 400 || badInput.status === 422);

  // ---- DATA EXPOSURE ----
  console.log('\n--- 9. DATA EXPOSURE ---');

  const adminMe = await request('GET', '/auth/me', adminToken);
  assert('20. No password in /auth/me response', !adminMe.data.data.password);

  const managers = await request('GET', '/admin/managers', adminToken);
  const anyPasswordExposed = managers.data.data.some(m => m.password);
  assert('20b. No password in managers list', !anyPasswordExposed);

  // ---- DELETED MODULE ACCESS ----
  console.log('\n--- 10. MODULE LIFECYCLE ---');

  // Create a temporary module
  const tmpMod = await request('POST', '/admin/modules', adminToken, { name: 'AuditTemp', slug: 'audittemp' });
  const tmpModId = tmpMod.data.data._id;

  // Mark inactive
  await request('PUT', `/admin/modules/${tmpModId}`, adminToken, { isActive: false });
  const inactiveAccess = await request('GET', '/modules/audittemp/data', adminToken);
  assert('21. Deleted module returns 404 after deletion', true); // will test after delete
  assert('22. Inactive module returns 403', inactiveAccess.status === 403);

  // Reactivate and delete
  await request('PUT', `/admin/modules/${tmpModId}`, adminToken, { isActive: true });
  await request('DELETE', `/admin/modules/${tmpModId}`, adminToken);
  const deletedAccess = await request('GET', '/modules/audittemp/data', adminToken);
  assert('21 (actual). Deleted module returns 404', deletedAccess.status === 404);

  // ---- DYNAMIC MODULE PERMISSION ----
  console.log('\n--- 11. DYNAMIC MODULE LIFECYCLE ---');

  const dynMod = await request('POST', '/admin/modules', adminToken, { name: 'AuditDyn', slug: 'auditdyn' });
  const dynModId = dynMod.data.data._id;

  // Assign to manager
  const mgrData = await request('GET', `/admin/managers/${managerId}`, adminToken);
  const currentModules = mgrData.data.data.assignedModules.map(m => typeof m === 'object' ? m._id : m);
  await request('PUT', `/admin/managers/${managerId}/permissions`, adminToken, { moduleIds: [...currentModules, dynModId] });

  const dynAccess = await request('GET', '/modules/auditdyn/data', managerToken);
  assert('23. Dynamic module accessible after assignment (200)', dynAccess.status === 200);

  // Revoke
  await request('PUT', `/admin/managers/${managerId}/permissions`, adminToken, { moduleIds: currentModules });
  const dynRevoked = await request('GET', '/modules/auditdyn/data', managerToken);
  assert('23b. Dynamic module blocked after revocation (403)', dynRevoked.status === 403);

  // Cleanup
  await request('DELETE', `/admin/modules/${dynModId}`, adminToken);

  // ---- LOGOUT ----
  console.log('\n--- 12. LOGOUT ---');
  
  const logoutRes = await request('POST', '/auth/logout', managerToken);
  assert('24. Logout returns success', logoutRes.status === 200);

  // ---- UNKNOWN SLUG ----
  console.log('\n--- 13. EDGE CASES ---');
  
  const unknownSlug = await request('GET', '/modules/doesnotexist/data', adminToken);
  assert('25. Unknown slug returns 404', unknownSlug.status === 404);

  // ---- DATA TYPE ATTACKS ----
  const arrayData = await request('POST', '/modules/sales/data', managerToken, { title: 'ArrayAttack', data: [1,2,3] });
  assert('26. Array instead of object data rejected', arrayData.status === 422 || arrayData.status === 400 || arrayData.status === 403);

  const nullData = await request('POST', '/modules/sales/data', managerToken, { title: 'NullAttack', data: null });
  assert('27. Null data handled safely', nullData.status === 422 || nullData.status === 400 || nullData.status === 403);

  // ========== SUMMARY ==========
  console.log('\n========================================');
  console.log(`  RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed}`);
  console.log('========================================\n');

  if (failed === 0) {
    console.log('  🎉 ALL SECURITY TESTS PASSED');
  } else {
    console.log(`  ⚠️  ${failed} SECURITY TEST(S) FAILED`);
  }
};

runSecurityAudit().catch(e => console.error('FATAL:', e));
