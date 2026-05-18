import { logoutAction } from '@/app/auth/actions'

export async function POST() {
  await logoutAction()
}
