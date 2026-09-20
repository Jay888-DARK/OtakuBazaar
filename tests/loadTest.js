import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 25 }, // Ramp up
    { duration: '15s', target: 25 }, // Hold
    { duration: '15s', target: 0 },  // Ramp down
  ],
};

export default function () {
  const response = http.get('http://127.0.0.1:3000/?page=1');

  check(response, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
