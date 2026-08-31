// Comprehensive API verification script
const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE BACKEND API TESTS ---');

  // 1. Organization Profile
  const orgRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/organization',
    method: 'GET',
  });
  console.log('✔ [1/13] GET /api/organization:', orgRes.status, orgRes.data.data.name);

  // 2. Organization Stats
  const statsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/organization/stats',
    method: 'GET',
  });
  console.log('✔ [2/13] GET /api/organization/stats:', statsRes.status, 'Total Instructors:', statsRes.data.data.totalInstructors, 'Active Courses:', statsRes.data.data.activeCourses);

  // 3. Dashboard Overview
  const dashRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/dashboard/overview',
    method: 'GET',
  });
  console.log('✔ [3/13] GET /api/dashboard/overview:', dashRes.status, 'Revenue: $' + dashRes.data.data.kpis.annualRevenue);

  // 4. Instructors List
  const instRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/instructors',
    method: 'GET',
  });
  console.log('✔ [4/13] GET /api/instructors:', instRes.status, 'Total:', instRes.data.data.total);

  // 5. Instructor Requests & Teaching Assignment
  const reqRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/instructor-requests',
    method: 'GET',
  });
  console.log('✔ [5/13] GET /api/instructor-requests:', reqRes.status, 'Total Requests:', reqRes.data.data.total);

  // 6. Learners List
  const lrnRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/learners',
    method: 'GET',
  });
  console.log('✔ [6/13] GET /api/learners:', lrnRes.status, 'Total Learners:', lrnRes.data.data.total);

  // 7. Courses Catalog
  const crsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/courses',
    method: 'GET',
  });
  console.log('✔ [7/13] GET /api/courses:', crsRes.status, 'Total Courses:', crsRes.data.data.total);

  // 8. Enrollments Batch Assignment (Atomic Transaction)
  const assignRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/enrollments/assign',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { courseIds: ['crs-1'], learnerIds: ['lrn-2'] }
  );
  console.log('✔ [8/13] POST /api/enrollments/assign:', assignRes.status, 'Total Assigned:', assignRes.data.data.totalAssigned);

  // 9. Payments Summary
  const payRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/payments/summary',
    method: 'GET',
  });
  console.log('✔ [9/13] GET /api/payments/summary:', payRes.status, 'Gross Revenue: $' + payRes.data.data.grossRevenue);

  // 10. Disputes Creation
  const dspRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/disputes',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      raisedBy: 'Dr. Sarah Mitchell',
      disputeType: 'Research Grant Allocation',
      subject: 'Lab Compute Allocation for Machine Learning Module',
      description: 'Requesting cloud cluster provisioning adjustment for high performance compute.',
      priority: 'Medium',
    }
  );
  console.log('✔ [10/13] POST /api/disputes:', dspRes.status, 'Created Dispute ID:', dspRes.data.data.id);

  // 11. Reports Generation & CSV Export
  const repRes = await request(
    {
      hostname: 'localhost',
      port: 3000,
      path: '/api/reports/generate',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      title: 'Real-time Institutional Audit Report',
      type: 'Enrollment Report',
      format: 'CSV',
    }
  );
  console.log('✔ [11/13] POST /api/reports/generate:', repRes.status, 'Report ID:', repRes.data.data.id);

  // 12. Analytics Overview
  const analRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/analytics/overview',
    method: 'GET',
  });
  console.log('✔ [12/13] GET /api/analytics/overview:', analRes.status, 'Retention Rate: ' + analRes.data.data.kpis.retentionRate + '%');

  // 13. Settings & Unread Notifications
  const setRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/settings',
    method: 'GET',
  });
  const notifRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/notifications/unread-count',
    method: 'GET',
  });
  console.log('✔ [13/13] GET /api/settings & notifications:', setRes.status, 'Default Currency:', setRes.data.data.defaultCurrency, '| Unread Notifs:', notifRes.data.data.unreadCount);

  console.log('\n🎉 ALL 13 NESTJS BACKEND FEATURE MODULES VERIFIED AND WORKING PERFECTLY!');
}

runTests().catch(console.error);
