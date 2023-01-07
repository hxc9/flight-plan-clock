import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)

export const flightPlanArray = {
    // the total number of records that match the criteria (not the number returned)
    "total": 2,
    // array of records
    "rows":
        [
            {
                // the ID of the flight plan, used for all other APIs
                "flightplanid": 2759,
                // Eurocontrol IFPS flight plan ID
                "ifplid": "AT04578792",
                // details of the user that filed the plan
                "name": "John",
                "lastname": "Doe",
                "email": "john.doe@pilot.com",
                // Unix timestamp when the plan was created
                "created": 1439891006,
                // Unix timestamp of current off block time
                "eobt": 1439927400,
                // departure airport details
                "departure": "EDTF",
                "departurename": "Freiburg",
                // destination airport details
                "destination": "LSGG",
                "destinationname": "Geneve",
                // flight plan ICAO string
                "fplan": "(FPL-ZZZZZ-ZG\n-C82R\/L -SDFGRY\/S\n-EDTF1950\n-N0147F100 OLBEN\/N0149F110 IFR N869 BENOT BENOT1R\n-LSGG0058\n-DOF\/150818 EET\/OLBEN0020 RMK\/CREW CONTACT +49170111111 PBN\/B2D2S1\n-E\/0740 P\/TBN R\/E A\/WHITE AND BLUE C\/DOE)",
                // filing method, currently NMB2B or AFTN
                "method": "NMB2B",
                // filed route distance in nautical miles
                "routedistance": 135,
                // great circle distance in nautical miles
                "gcddistance": 128,
                // required route fuel in aircraft fuel units
                "routefuel": 56.16015625,
                // legal minimum fuel in aircraft fuel units
                "minfuel": 80.5345703125,
                // aircraft fuel unit ("l", "lb", "usgal")
                "fuelunit": "l",
                // see below for possible status values and state machine transisitions
                "status": "filed",
                "callsign": "ZZZZZ",
                "aircraftdescription": "Cessna TR182 (1979)"
            }
        ]
}

export const defaultFlightPlan = flightPlanArray.rows[0]

const airfields = ["EDNY", "ETDN", "LSPV", "LSZG", "LSGC", "LSZB", "LSZH", "LSZB", "LSZR"]

export function pickRoute() {
    let departure = airfields[Math.floor(Math.random() * airfields.length)]
    let destination
    do {
        destination = airfields[Math.floor(Math.random() * airfields.length)]
    } while (departure === destination)
    return {
        departure,
        destination,
        callsign: "HBDIH",
        status: "created",
        timestamp: dayjs().utc().unix(),
        eobt: dayjs().utc().add(Math.floor(Math.random() * 600) + 30, 'm').startOf('m').unix()
    }
}