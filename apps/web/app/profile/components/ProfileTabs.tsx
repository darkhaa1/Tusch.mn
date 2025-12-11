'use client';


import MyListings from "./tabs/MyListings";
import UserReviews from "./tabs/Reviews";
import ProfileInfo from "./tabs/ProfileInfo";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs/tabs";


export default function ProfileTabs() {
  return (
    <Tabs defaultValue="profile" className="space-y-6 flex flex-col items-center">
      <TabsList className="flex w-full max-w-2xl justify-center gap-3 rounded-full bg-gray-100 p-1 shadow-sm">
        <TabsTrigger className="flex-1" value="profile">Танилцуулга</TabsTrigger>
        <TabsTrigger className="flex-1" value="reviews">Сэтгэгдлүүд</TabsTrigger>
        <TabsTrigger className="flex-1" value="listings">Миний Зарууд</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="w-full">
        <ProfileInfo />
      </TabsContent>
      <TabsContent value="listings" className="w-full">
        <MyListings />
      </TabsContent>
      <TabsContent value="reviews" className="w-full">
        <UserReviews />
      </TabsContent>
    </Tabs>
  );
}
