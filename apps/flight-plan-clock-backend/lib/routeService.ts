import {FlightPlan} from "autorouter-dto";

const fplRouteRegex = /\(FPL-\w+-[VIZY][SNGMX]-\d{0,2}\w{2,4}\/[LMHJ] ?-\w+\/\w+-\w{4}\d{4}-[KNM]\d{4}(?:[FSAM]\d{3,4}|VFR) ([A-Z0-9/ ]+)/;

export function parseRoute(fpl: FlightPlan) : string|undefined {
    const res = fplRouteRegex.exec(fpl.fplan.replaceAll('\n', ''))
    let route
    if (res) {
        [, route] = res
    }
    return route
}