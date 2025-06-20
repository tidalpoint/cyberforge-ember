import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ROUTES } from '@/constants/routes'
import { ChatPage, OnboardingPage } from '@/pages'
import { ScrollToTop } from './components/ScrollToTop'
import './globals.css'
import NewChatPage from './pages/NewChatPage'

const queryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <Toaster />

        <Routes>
          <Route path={ROUTES.home} element={<OnboardingPage />} />
          <Route path={ROUTES.newChat} element={<NewChatPage />} />
          <Route path={ROUTES.chat} element={<ChatPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
