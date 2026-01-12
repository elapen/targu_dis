'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LoginScreen() {
  const { login } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Құпия сөз енгізіңіз')
      return
    }

    setIsLoading(true)
    setError('')

    const result = await login(password)
    
    if (!result.success) {
      setError(result.error || 'Қате орын алды')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Конвергенция</CardTitle>
            <CardDescription className="mt-2">
              Қауіпсіз бейне байланыс жүйесі
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Құпия сөз
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "h-12 pr-10",
                    error && "border-red-500 focus-visible:ring-red-500"
                  )}
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span>⚠️</span> {error}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12" 
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Тексерілуде...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Кіру
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              🔒 Барлық байланыстар E2E шифрленген
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
