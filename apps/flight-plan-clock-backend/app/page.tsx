
import {FlightPlansTable} from "../components/flightPlans/flightPlansTable";

export const revalidate = 0;

export default async function Home() {
  return (
      <>
        {/* @ts-expect-error Server Component */}
        <FlightPlansTable/>
      </>
  )
}
