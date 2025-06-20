import { FC } from 'react'
import { matchPath, Outlet, useLocation } from 'react-router-dom'
import { HIDE_RISA_ROUTES } from '@/constants'
import RisaFloating from './RisaFloating'

const AppLayout: FC = () => {
  const location = useLocation()

  return (
    <main className="h-dvh w-full">
      <Outlet />
      {!HIDE_RISA_ROUTES.some((route) => matchPath(route, location.pathname)) && <RisaFloating />}
    </main>
  )
}

export default AppLayout
