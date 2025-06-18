'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchBackendUser } from '../lib/auth';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [backendUser, setBackendUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (status === 'loading') return;

  if (status === 'authenticated') {
    setLoading(false);
    return;
  }

  fetchBackendUser().then((user) => {
    if (user) {
      setBackendUser(user);
      setLoading(false);
    } else {
      router.push('/');
    }
  });
}, [status]);

  if (loading) return <p className="text-center mt-10">Түр хүлээнэ үү...</p>;

  const user = session?.user || backendUser;
  console.log('User data:', user);
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Таны профайл</h1>

      <div className="bg-white shadow rounded p-6 space-y-4">
        <div>
          <strong>Нэр:</strong> {user?.firstname ?? user?.name ?? '...'}
        </div>
        <div>
          <strong>Овог:</strong> {user?.lastname ?? '...'}
        </div>
        <div>
          <strong>Имэйл:</strong> {user?.email ?? '...'}
        </div>
        <div>
          <strong>Утасны дугаар:</strong> {user?.phone ?? '...'}
        </div>
        <div>
          <strong>ID:</strong> {user?.sub ?? '...'}
        </div>
        <div>
          <strong>Хэрэглэгчийн төрөл:</strong> {user?.accountType ?? '...'}
        </div>
      </div>
    </div>
  );
}
