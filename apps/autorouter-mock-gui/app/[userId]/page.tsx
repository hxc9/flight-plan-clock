
import { FlightPlansTable } from '@/components/flightPlans/flightPlansTable';
import { MessagesTable } from '@/components/messages/messagesTable';
import { Users } from '@/components/users/users';


export default async function Home({ params: { userId : user } }: { params: { userId: string } }) {
  let userId: number | undefined = undefined;
  userId = +user;

  return (
    <>
      {/* @ts-expect-error Server Component */}
      <Users userId={userId} />
      {userId ? <>
        {/* @ts-expect-error Server Component */}
        <FlightPlansTable userId={userId} />
        {/* @ts-expect-error Server Component */}
        <MessagesTable userId={userId} />
      </> : null}
</>
  );
}
