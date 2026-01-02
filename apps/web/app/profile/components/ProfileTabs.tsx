'use client';

import MyListings from "./tabs/MyListings";
import ProfileInfo from "./tabs/ProfileInfo";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";

export default function ProfileTabs() {
  return (
    <Tabs defaultValue="profile" className="w-full space-y-6">
      <TabsList className="w-full justify-start overflow-x-auto rounded-full bg-muted p-1">
        <TabsTrigger className="flex-1 min-w-[140px]" value="profile">
          Мэдээлэл
        </TabsTrigger>
        <TabsTrigger className="flex-1 min-w-[140px]" value="listings">
          Миний зарууд
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="w-full">
        <ProfileInfo />
      </TabsContent>
      <TabsContent value="listings" className="w-full">
        <MyListings />
      </TabsContent>
    </Tabs>
  );
}
