/**
 * @file src/infrastructure/services/shiprocket.ts
 *
 * Shiprocket authentication and API utility.
 */

/**
 * Authenticates with Shiprocket API using environment credentials
 * and returns the authorization bearer token.
 *
 * @returns The Shiprocket JWT authorization token string.
 */
export async function getShiprocketToken(): Promise<string> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Missing Shiprocket credentials: SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be configured.'
    );
  }

  const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shiprocket authentication failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (!data?.token) {
    throw new Error('Shiprocket response did not contain an authorization token.');
  }

  return data.token;
}
