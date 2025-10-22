import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { SplashScreenContent } from '@/components/splash-screen';

export default function SplashScreenRoute() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/intro');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  return <SplashScreenContent />;
}

