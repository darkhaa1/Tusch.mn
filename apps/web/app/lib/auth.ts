export async function fetchBackendUser(): Promise<any | null> {
  try {
    const res = await fetch('http://localhost:3310/auth/me', {
      credentials: 'include',
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    console.log('Backend user data:', data);
    return data.user;
  } catch (err) {
    return null;
  }
}
