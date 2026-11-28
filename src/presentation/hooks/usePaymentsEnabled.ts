'use client';

import { useEffect, useState } from 'react';
import { PAYMENTS_COMING_SOON_MESSAGE } from '@/infrastructure/payment/paymentConfig';

export function usePaymentsEnabled() {
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    fetch('/api/payments/status', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { paymentsEnabled: false }))
      .then((data) => {
        if (mounted) {
          setPaymentsEnabled(data?.paymentsEnabled === true);
          setIsChecking(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setPaymentsEnabled(false);
          setIsChecking(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    paymentsEnabled,
    isChecking,
    message: PAYMENTS_COMING_SOON_MESSAGE,
  };
}
