const localhost = '::ffff:127.0.0.1'

export function debounce(milliseconds) {
    const requestTimestamps = {}

    if (!process.env.DEBOUNCE)
        return (req, res, next) => next()

    return (req, res, next) => {
        const now = Date.now()
        const { ip } = req
    
        if (requestTimestamps[ip] && (now - requestTimestamps[ip] < milliseconds))
            return res.sendStatus(429)
    
        requestTimestamps[ip] = now
        next()
    }
}

export const debounceSeconds = seconds => debounce(seconds * 1000)
export const debounceMinutes = minutes => debounceSeconds(minutes * 60)