
import { useQuery } from '@tanstack/react-query';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    }
  });
};
