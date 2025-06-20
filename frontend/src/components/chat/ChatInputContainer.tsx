import { FC, FormEvent, useState } from 'react'
import { useParams } from 'react-router-dom'
import TextareaAutosize from 'react-textarea-autosize'
import { ArrowDownIcon } from '@heroicons/react/24/outline'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { AGENT_NAME } from '@/constants'
import { cn } from '@/utils/cn'
import { Button } from '../ui/button'

type Props = {
  isScrolledUp: boolean
  handleScrollToBottom: () => void
  handleOnSend: ({ message, threadId }: { message: string; threadId?: string }) => void
}

const ChatInputContainer: FC<Props> = ({ isScrolledUp, handleScrollToBottom, handleOnSend }) => {
  const [currMessage, setCurrMessage] = useState('')

  const { threadId } = useParams()

  const handleOnSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!currMessage) return

    handleOnSend({ message: currMessage, threadId })
    setCurrMessage('')
  }

  return (
    <div className="max-w-[900px] w-full mx-auto p-8 pt-0 relative">
      <form
        onSubmit={handleOnSubmit}
        className="grid gap-8 w-full p-4 rounded-2xl bg-background border min-h-16 shadow"
      >
        <div className="flex items-end gap-2 w-full">
          <TextareaAutosize
            autoFocus
            maxRows={6}
            placeholder={`Message ${AGENT_NAME}`}
            value={currMessage}
            onChange={(e) => setCurrMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleOnSubmit(e)
              }
            }}
            className="bg-transparent text-gray-700 font-medium w-full outline-none resize-none flex items-center"
            minRows={2}
          />
          <Button disabled={!currMessage} className="size-10 rounded-full shrink-0">
            <PaperAirplaneIcon className="h-5" />
          </Button>
        </div>
      </form>

      <button
        onClick={() => handleScrollToBottom()}
        className={cn(
          'flex items-center justify-center h-8 w-8 rounded-full bg-background border absolute -top-12 left-1/2 -translate-x-1/2 z-10 shadow-md opacity-0 transition-opacity duration-300',
          isScrolledUp && 'opacity-100',
        )}
      >
        <ArrowDownIcon className="h-4 stroke-[2.75] text-gray-700" />
      </button>
    </div>
  )
}

export default ChatInputContainer
