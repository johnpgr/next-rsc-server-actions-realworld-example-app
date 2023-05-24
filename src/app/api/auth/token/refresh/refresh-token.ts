import { authService } from '~/modules/auth/auth.service'

export type RefreshToken = {
    token: string
    exp: number
}

export async function refreshToken(token: string): Promise<string> {
    return await authService.refreshToken(token)
}
