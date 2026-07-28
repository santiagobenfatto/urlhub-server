import dns from 'dns'
import { isIP } from 'net'
import { URLError } from '../errors/custom-errors.js'

const MAX_REDIRECTS = 3
const TIMEOUT_MS = 8000

const PRIVATE_RANGES = [
    { start: '10.0.0.0', end: '10.255.255.255' },
    { start: '172.16.0.0', end: '172.31.255.255' },
    { start: '192.168.0.0', end: '192.168.255.255' },
]

function ipToLong(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
}

function isPrivateIPv4(ip) {
    const long = ipToLong(ip)
    return PRIVATE_RANGES.some(
        ({ start, end }) => long >= ipToLong(start) && long <= ipToLong(end)
    )
}

function isPrivateIPv6(ip) {
    const normalized = ip.toLowerCase()
    return (
        normalized === '::1' ||
        normalized === '::' ||
        normalized.startsWith('fc') ||
        normalized.startsWith('fd') ||
        normalized.startsWith('fe80')
    )
}

function isPrivateIP(ip) {
    if (isIP(ip) === 4) return isPrivateIPv4(ip)
    if (isIP(ip) === 6) return isPrivateIPv6(ip)
    return false
}

async function checkSSRF(hostname) {
    const addresses = await dns.promises.resolve4(hostname)

    for (const addr of addresses) {
        if (isPrivateIP(addr)) {
            throw new URLError('URL unreachable')
        }
    }
}

export async function validateUrl(urlString) {
    let parsed
    try {
        parsed = new URL(urlString)
    } catch {
        throw new URLError('Invalid URL format')
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new URLError('Only HTTP and HTTPS URLs are allowed')
    }

    await checkSSRF(parsed.hostname)

    let hops = 0
    let current = urlString

    while (hops <= MAX_REDIRECTS) {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

        try {
            const res = await fetch(current, {
                method: 'HEAD',
                signal: controller.signal,
                redirect: 'manual',
            })

            clearTimeout(timer)

            if ([301, 302, 303, 307, 308].includes(res.status)) {
                hops++
                const location = res.headers.get('location')

                if (!location) {
                    throw new URLError('URL unreachable')
                }

                let redirectUrl
                try {
                    redirectUrl = new URL(location, current)
                } catch {
                    throw new URLError('URL unreachable')
                }

                if (!['http:', 'https:'].includes(redirectUrl.protocol)) {
                    throw new URLError('URL unreachable')
                }

                await checkSSRF(redirectUrl.hostname)

                current = redirectUrl.href
                continue
            }

            if (res.status >= 200 && res.status < 400) {
                return
            }

            throw new URLError('URL unreachable')
        } catch (error) {
            clearTimeout(timer)

            if (error instanceof URLError) throw error

            if (error.name === 'AbortError') {
                throw new URLError('URL unreachable')
            }

            if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
                throw new URLError('URL unreachable')
            }

            if (
                error.code === 'ECONNREFUSED' ||
                error.code === 'ECONNRESET' ||
                error.code === 'ECONNABORTED'
            ) {
                throw new URLError('URL unreachable')
            }

            if (
                error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
                error.code === 'ERR_TLS_CERT_ALTNAME_INVALID' ||
                error.code === 'CERT_HAS_EXPIRED'
            ) {
                throw new URLError('URL unreachable')
            }

            throw new URLError('URL unreachable')
        }
    }

    throw new URLError('URL unreachable')
}
