import { generatePath, useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { ROUTES } from '@/constants/routes'
import { useGetChatThreads } from '@/queries/useGetChatThreads'
import { cn } from '@/utils/cn'
import { sortChatThreads } from '@/utils/sortChatThreads'
import { Button } from '../ui/button'

const ChatHistory = () => {
  const { threadId } = useParams()
  const { data: chatThreads } = useGetChatThreads()

  return (
    <div className="grid grid-rows-[64px_1fr] w-64 border-r bg-white">
      <div className="flex items-center gap-1.5 border-b px-2 font-bold">
        <Button asChild size="icon" variant="ghost" className="size-8">
          <Link to={ROUTES.home}>
            <ArrowLeftIcon className="h-4 stroke-[2.25]" />
          </Link>
        </Button>
        Chat History
      </div>
      <div className="overflow-y-auto">
        {[...(chatThreads ?? [])]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .map((thread, idx, arr) => (
            <Link
              key={thread.id}
              to={generatePath(ROUTES.chat, { threadId: thread.id })}
              className={cn(
                'block px-4 py-3 border-b hover:bg-gray-50 transition',
                threadId === thread.id && 'bg-gray-100',
              )}
            >
              <div className="flex flex-col font-bold">
                <span className="text-sm text-gray-800">{`Chat ${arr.length - idx}`}</span>
                <span className="text-xs text-gray-500">
                  {thread.updatedAt ? format(new Date(thread.updatedAt), 'PPpp') : 'No updates'}
                </span>
              </div>
            </Link>
          ))}
      </div>
    </div>
  )
}

export default ChatHistory
