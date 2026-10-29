interface User {
  id: string
  username: string
  email: string
  created_at: string
}

interface AuthResponse {
  message: string
  user?: User
  session_id: string
}

class AuthService {
  private baseUrl = "http://localhost:8000"

  async register(username: string, email: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Registration failed")
    }

    const data = await response.json()
    this.setSession(data.session_id)
    return data
  }

  async login(username: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Login failed")
    }

    const data = await response.json()
    this.setSession(data.session_id)
    return data
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        credentials: "include",
      })

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch {
      return null
    }
  }

  async logout(): Promise<void> {
    await fetch(`${this.baseUrl}/logout`, {
      method: "POST",
      credentials: "include",
    })
    this.clearSession()
  }

  private setSession(sessionId: string): void {
    document.cookie = `session_id=${sessionId}; path=/; max-age=86400` // 24 hours
  }

  private clearSession(): void {
    document.cookie = "session_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }

  isAuthenticated(): boolean {
    return document.cookie.includes("session_id=")
  }
}

export const authService = new AuthService()
export type { User, AuthResponse }
