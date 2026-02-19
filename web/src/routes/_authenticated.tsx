import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getAuthToken } from '#/api/auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !getAuthToken()) {
      throw redirect({ to: '/signin' })
    }
  },
  component: () => <Outlet />,
})
