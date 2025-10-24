import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'util'

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        prefetch: jest.fn(),
    }),
    usePathname: () => '/admin',
    useSearchParams: () => new URLSearchParams(),
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
    useSession: () => ({
        data: {
            user: {
                id: 'test-user-id',
                email: 'admin@test.com',
                role: 'admin',
                name: 'Test Admin',
            },
        },
        status: 'authenticated',
    }),
    signIn: jest.fn(),
    signOut: jest.fn(),
}))

// Mock Next.js server components
jest.mock('next/server', () => ({
    NextRequest: class MockNextRequest {
        url: string
        method: string
        headers: Map<string, string>
        body: any

        constructor(url: string, init?: any) {
            this.url = url
            this.method = init?.method || 'GET'
            this.headers = new Map()
            this.body = init?.body

            if (init?.headers) {
                Object.entries(init.headers).forEach(([key, value]) => {
                    this.headers.set(key, value as string)
                })
            }
        }

        async json() {
            return JSON.parse(this.body || '{}')
        }
    },
    NextResponse: {
        json: (data: any, init?: any) => ({
            json: () => Promise.resolve(data),
            status: init?.status || 200,
            ok: (init?.status || 200) < 400,
        }),
    },
}))

// Mock fetch
global.fetch = jest.fn()

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock global Response
global.Response = class MockResponse {
    body: any
    status: number
    ok: boolean
    headers: Map<string, string>

    constructor(body: any, init?: any) {
        this.body = body
        this.status = init?.status || 200
        this.ok = this.status < 400
        this.headers = new Map()

        if (init?.headers) {
            Object.entries(init.headers).forEach(([key, value]) => {
                this.headers.set(key, value as string)
            })
        }
    }

    async json() {
        return JSON.parse(this.body)
    }

    async text() {
        return this.body
    }
} as any