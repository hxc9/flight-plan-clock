const prefixes = ['F', 'D', 'HB', 'OE', 'OO', 'I', 'G']

export default function CallSign({callSign} : {callSign: string | undefined}) {
    if (!callSign) return null

    const prefix = prefixes.find(p => callSign.startsWith(p))
    return <>{prefix ? prefix + '-' + callSign.slice(prefix.length) : callSign}</>
}