
import {FlightPlansTable} from "../components/flightPlans/flightPlansTable";

export const revalidate = 60;

export default async function Home() {
  return (
      <>
        {/* @ts-expect-error Server Component */}
        <FlightPlansTable/>
      </>
  )
}
