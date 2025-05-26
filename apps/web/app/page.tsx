"use client";

import { useUsers } from "../server/users";
import { User } from "@repo/types";

export default function Home() {
   const { data, isLoading, error } = useUsers();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading users</p>;

  return (
    <div className="bg-gray-500 flex flex-col items-center justify-center min-h-screen ">
      <h1 className="text-4xl font-bold text-red-800">Users List</h1>
      <ul className="list-disc list-inside">
        {data?.map((user: User) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <button className="bg-green-500 text-white px-10 py-2 mt-10 rounded">Button</button>
    </div>
  );
}
