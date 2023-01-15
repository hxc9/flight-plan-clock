const prefixes = ['F', 'D', 'HB', 'OE', 'OO', 'I', 'G']

export default function Callsign({callsign} : {callsign: string}) {
    const prefix = prefixes.find(p => callsign.startsWith(p))
    return <>{prefix ? prefix + '-' + callsign.slice(prefix.length) : callsign}</>
}