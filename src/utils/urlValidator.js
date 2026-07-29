import dns from 'dns'
import { isIP } from 'net'
import { URLError } from '../errors/custom-errors.js'

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

    try {
        await checkSSRF(parsed.hostname)
    } catch {
        throw new URLError('URL unreachable')
    }
}
