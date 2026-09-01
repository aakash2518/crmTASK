const http = require('http');

const BASE = { hostname: 'localhost', port: 5000 };

const request = (path, method, body, token) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      ...BASE,
      path,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (payload) options.headers['Content-Length'] = Buffer.byteLength(payload);
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

let passed = 0;
let failed = 0;
const results = [];

const assert = (name, condition, detail) => {
  if (condition) {
    passed++;
    results.push(`PASS: ${name}`);
  } else {
    failed++;
    results.push(`FAIL: ${name} — ${detail || 'assertion failed'}`);
  }
};

const run = async () => {
  // ── Login ──
  const adminLogin = await request('/api/auth/admin/login', 'POST', { email: 'admin@test.com', password: 'password123' });
  const adminToken = adminLogin.body.token;
  assert('Admin login', adminLogin.status === 200 && adminToken, `status=${adminLogin.status}`);

  const mgrLogin = await request('/api/auth/manager/login', 'POST', { email: 'manager@test.com', password: 'password123' });
  const mgrToken = mgrLogin.body.token;
  assert('Manager login', mgrLogin.status === 200 && mgrToken, `status=${mgrLogin.status}`);

  // ── TEST 1: Admin create module ──
  const t1 = await request('/api/admin/modules', 'POST', { name: 'Test Module', slug: 'test-module' }, adminToken);
  assert('TEST 1: Admin create module', t1.status === 201 && t1.body.success, `status=${t1.status} body=${JSON.stringify(t1.body)}`);

  // ── TEST 2: Manager create module → 403 ──
  const t2 = await request('/api/admin/modules', 'POST', { name: 'Hack Module', slug: 'hack' }, mgrToken);
  assert('TEST 2: Manager create module → 403', t2.status === 403, `status=${t2.status}`);

  // ── TEST 3: Admin create manager ──
  const t3 = await request('/api/admin/managers', 'POST', { name: 'New Manager', email: 'newmgr@test.com', password: 'password123' }, adminToken);
  assert('TEST 3: Admin create manager', t3.status === 201 && t3.body.success, `status=${t3.status} body=${JSON.stringify(t3.body)}`);
  const newMgrId = t3.body.data ? t3.body.data._id : null;

  // ── TEST 4: Manager create manager → 403 ──
  const t4 = await request('/api/admin/managers', 'POST', { name: 'Rogue Mgr', email: 'rogue@test.com', password: 'password123' }, mgrToken);
  assert('TEST 4: Manager create manager → 403', t4.status === 403, `status=${t4.status}`);

  // ── Fetch modules to get Sales and Finance IDs ──
  const modList = await request('/api/admin/modules', 'GET', null, adminToken);
  const salesMod = modList.body.data.find((m) => m.slug === 'sales');
  const financeMod = modList.body.data.find((m) => m.slug === 'finance');

  // ── TEST 5: Admin assign Sales to new manager ──
  let t5Status = 'skipped';
  if (newMgrId && salesMod) {
    const t5 = await request(`/api/admin/managers/${newMgrId}/permissions`, 'PUT', { moduleIds: [salesMod._id] }, adminToken);
    assert('TEST 5: Admin assign Sales to Manager', t5.status === 200 && t5.body.success, `status=${t5.status}`);
    t5Status = 'ran';
  } else {
    assert('TEST 5: Admin assign Sales to Manager', false, 'prerequisite data missing');
  }

  // ── TEST 6: Manager with Sales permission → access Sales ──
  const t6 = await request('/api/modules/sales/data', 'GET', null, mgrToken);
  assert('TEST 6: Manager w/ Sales → access Sales', t6.status === 200 && t6.body.success, `status=${t6.status}`);

  // ── TEST 7: Manager without Finance → access Finance → 403 ──
  const t7 = await request('/api/modules/finance/data', 'GET', null, mgrToken);
  assert('TEST 7: Manager w/o Finance → 403', t7.status === 403, `status=${t7.status}`);

  // ── TEST 8: Manager manually calls Finance CRUD → 403 ──
  const t8 = await request('/api/modules/finance/data', 'POST', { title: 'Hack Record' }, mgrToken);
  assert('TEST 8: Manager Finance CRUD → 403', t8.status === 403, `status=${t8.status}`);

  // ── TEST 9: Manager attempts to modify own role ──
  const meRes = await request('/api/auth/me', 'GET', null, mgrToken);
  const mgrId = meRes.body.data._id;
  const t9 = await request(`/api/admin/managers/${mgrId}`, 'PUT', { role: 'ADMIN' }, mgrToken);
  assert('TEST 9: Manager modify own role → 403', t9.status === 403, `status=${t9.status}`);

  // ── TEST 10: Manager attempts to add Finance to own permissions ──
  const t10 = await request(`/api/admin/managers/${mgrId}/permissions`, 'PUT', { moduleIds: [financeMod._id] }, mgrToken);
  assert('TEST 10: Manager add own permissions → 403', t10.status === 403, `status=${t10.status}`);

  // ── TEST 11: Unauthenticated request → 401 ──
  const t11 = await request('/api/modules/sales/data', 'GET', null, null);
  assert('TEST 11: Unauthenticated → 401', t11.status === 401, `status=${t11.status}`);

  // ── TEST 12: Invalid JWT → 401 ──
  const t12 = await request('/api/modules/sales/data', 'GET', null, 'invalid.jwt.token');
  assert('TEST 12: Invalid JWT → 401', t12.status === 401, `status=${t12.status}`);

  // ── Cleanup: delete test module and new manager ──
  if (t1.body.data) await request(`/api/admin/modules/${t1.body.data._id}`, 'DELETE', null, adminToken);
  if (newMgrId) await request(`/api/admin/managers/${newMgrId}`, 'DELETE', null, adminToken);

  // ── Report ──
  console.log('\n' + '='.repeat(60));
  console.log('RBAC AUTHORIZATION TEST RESULTS');
  console.log('='.repeat(60));
  results.forEach((r) => console.log(r));
  console.log('='.repeat(60));
  console.log(`PASSED: ${passed}/${passed + failed}  |  FAILED: ${failed}/${passed + failed}`);
  console.log('='.repeat(60));

  process.exit(failed > 0 ? 1 : 0);
};

run().catch((err) => {
  console.error('Test script error:', err.message);
  process.exit(1);
});
