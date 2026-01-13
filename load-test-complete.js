import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 117 },   // Monte à 117 utilisateurs
    { duration: '3m', target: 117 },   // Maintient 117 utilisateurs
    { duration: '1m', target: 0 },     // Descend à 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // Augmenté à 2s pour haute charge
    http_req_failed: ['rate<0.2'],      // Augmenté à 20% pour haute charge
  },
};

const API_URL = __ENV.API_URL || 'http://localhost:3000';

export default function () {
  // ========== AUTHENTIFICATION ==========
  let res = http.post(`${API_URL}/auth/login`, JSON.stringify({
    fullName: __ENV.FULLNAME || 'Admin Trésor',
    password: __ENV.PASSWORD || 'password123'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!check(res, { 'login': (r) => r.status === 200 })) return;

  const token = res.json('data.token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  sleep(1);

  // ========== PROFIL ==========
  res = http.get(`${API_URL}/auth/profile`, { headers });
  check(res, { 'profile': (r) => r.status === 200 });

  sleep(0.5);

  // ========== EMPLOYÉS ==========
  res = http.get(`${API_URL}/employees`, { headers });
  check(res, { 'employees list': (r) => r.status === 200 });

  sleep(0.5);

  res = http.get(`${API_URL}/employees/search?query=test`, { headers });
  check(res, { 'employees search': (r) => r.status === 200 || r.status === 404 });

  sleep(1);

  // ========== PAIEMENTS ==========
  res = http.get(`${API_URL}/payments`, { headers });
  check(res, { 'payments list': (r) => r.status === 200 });

  sleep(0.5);

  res = http.get(`${API_URL}/payments/accounting-entries`, { headers });
  check(res, { 'payments accounting': (r) => r.status === 200 });

  sleep(1);

  // ========== RECETTES ==========
  res = http.get(`${API_URL}/revenues`, { headers });
  check(res, { 'revenues list': (r) => r.status === 200 });

  sleep(0.5);

  res = http.get(`${API_URL}/revenues/accounting-entries`, { headers });
  check(res, { 'revenues accounting': (r) => r.status === 200 });

  sleep(1);

  // ========== AGRÉGATION ==========
  res = http.get(`${API_URL}/aggregation/pending`, { headers });
  check(res, { 'aggregation pending': (r) => r.status === 200 || r.status === 403 });

  sleep(0.5);

  res = http.get(`${API_URL}/aggregation/revenues/pending`, { headers });
  check(res, { 'aggregation revenues': (r) => r.status === 200 || r.status === 403 });

  sleep(1);

  // ========== LOGOUT ==========
  res = http.post(`${API_URL}/auth/logout`, null, { headers });
  check(res, { 'logout': (r) => r.status === 200 });

  sleep(1);
}
