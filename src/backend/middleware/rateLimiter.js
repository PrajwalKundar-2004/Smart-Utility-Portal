const attemptsMap = new Map();

// Middleware to check if the IP is currently locked out
export const checkRateLimit = (req, res, next) => {
    // In Express, req.ip or req.connection.remoteAddress is typically used
    // To support proxies or localhost, we try headers as well
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    
    const record = attemptsMap.get(ip);
    
    if (record && record.lockUntil > Date.now()) {
        const remainingMs = record.lockUntil - Date.now();
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        
        return res.status(429).json({
            success: false,
            message: `Too many failed attempts. Try again in ${remainingSeconds} seconds.`,
            lockUntil: record.lockUntil,
            remainingSeconds: remainingSeconds
        });
    }
    
    // Attach ip to req for easy access in the route
    req.clientIp = ip;
    next();
};

// Call this function when a login attempt fails
export const recordFailedAttempt = (ip) => {
    const record = attemptsMap.get(ip) || { attempts: 0, lockUntil: 0 };
    record.attempts += 1;
    
    // 5th attempt or any attempt after previous lock expiration -> 1 min lock
    if (record.attempts >= 5) {
        record.lockUntil = Date.now() + 60 * 1000; // 1 minute from now
    }
    
    attemptsMap.set(ip, record);
    return record;
};

// Call this function when a login attempt succeeds
export const clearFailedAttempts = (ip) => {
    attemptsMap.delete(ip);
};
