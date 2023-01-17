import {FlightPlanResponse, FlightPlansResponse} from "autorouter-dto";
import {useContext, useEffect} from "react";
import {RefreshContext} from "../components/refreshContext";

export function useRefresh(data: FlightPlansResponse|FlightPlanResponse|undefined) {
    const {didRefresh} = useContext(RefreshContext)

    useEffect(() => {
        if (data?.lastUpdated) {
            didRefresh(data.lastUpdated)
        }
    }, [didRefresh, data?.lastUpdated])
}