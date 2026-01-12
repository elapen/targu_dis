import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ACCESS_PASSWORD = process.env.APP_ACCESS_PASSWORD || 'convergence2024'
const AUTH_COOKIE_NAME = 'convergence_auth'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ success: false, error: 'Құпия сөз енгізіңіз' }, { status: 400 })
    }

    if (password !== ACCESS_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Құпия сөз қате' }, { status: 401 })
    }

    // Create a simple token (in production, use JWT or similar)
    const token = Buffer.from(`${password}:${Date.now()}`).toString('base64')

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ success: false, error: 'Қате орын алды' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)

    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    // Verify token (simple check)
    try {
      const decoded = Buffer.from(token.value, 'base64').toString()
      const [password] = decoded.split(':')
      
      if (password === ACCESS_PASSWORD) {
        return NextResponse.json({ authenticated: true })
      }
    } catch {
      // Invalid token
    }

    return NextResponse.json({ authenticated: false })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(AUTH_COOKIE_NAME)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false })
  }
}
