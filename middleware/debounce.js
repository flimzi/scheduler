const localhost = '::ffff:127.0.0.1'

export function debounce(interval = 3000) {
    const requestTimestamps = {}

    if (!process.env.DEBOUNCE)
        return (req, res, next) => next()

    return (req, res, next) => {
        const now = Date.now()
        const { ip } = req
    
        if (requestTimestamps[ip] && (now - requestTimestamps[ip] < interval))
            return res.sendStatus(429)
    
        requestTimestamps[ip] = now
        next()
    }
}

export const debounceMinute = debounce(60000)
export const debounceSecond = debounce(1000)