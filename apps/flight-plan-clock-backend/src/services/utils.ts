import { FlightPlan } from 'autorouter-dto';
import { FlightPlanMini } from 'flight-plan-clock-dto';

export function flightPlanToMini({
                                   flightplanid,
                                   callsign,
                                   eobt,
                                   departure,
                                   destination,
                                   status
                                 }: FlightPlan): FlightPlanMini {
  return {
    id: flightplanid,
    callSign: callsign,
    eobt,
    departure,
    destination,
    status
  }
}
