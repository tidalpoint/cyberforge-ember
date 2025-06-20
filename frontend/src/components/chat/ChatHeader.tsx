import { Link } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import { ROUTES } from '@/constants/routes'
import DocumentListDialog from '../dialogs/DocumentListDialog'
import { Button } from '../ui/button'

const ChatHeader = () => {
  return (
    <div className="w-full border-b px-4 flex items-center justify-end gap-3 bg-white">
      <div className="flex items-center gap-3">
        <DocumentListDialog />
        <Button className="pl-3" asChild>
          <Link to={ROUTES.newChat}>
            <PlusIcon className="h-5 stroke-2" />
            New Chat
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default ChatHeader
