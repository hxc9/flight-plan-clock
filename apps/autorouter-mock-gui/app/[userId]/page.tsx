
import { FlightPlansTable } from '@/components/flightPlans/flightPlansTable';
import { MessagesTable } from '@/components/messages/messagesTable';
import { Users } from '@/components/users/users';


export default async function Home({ params: { userId : user } }: { params: { userId: string } }) {
  let userId: number | undefined = undefined;
  userId = +user;

  return (
    <>
      <Users userId={userId} />
      {userId ? <>
        <FlightPlansTable userId={userId} />
        <MessagesTable userId={userId} />
      </> : null}
</>
  );
}
