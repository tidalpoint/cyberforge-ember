import { FC } from 'react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { CheckBadgeIcon } from '@heroicons/react/24/solid'
import { Textarea } from '@/components/ui/textarea'
import { NOT_ANSWERED_STRING } from '@/pages/QuestionnairePage'
import { QuestionType } from '@/types/Questionnaire'
import { cn } from '@/utils/cn'
import ReportIcon from './icons/ReportIcon'

type Props = {
  question: QuestionType
  order: number
}

const QuestionItem: FC<Props> = ({ question, order }) => {
  return (
    <div className="grid grid-rows-[64px_1fr] rounded-xl shadow-[0_0_0_2px_#5291ed40] relative overflow-hidden">
      <div className="flex items-center justify-between w-full px-4 border-b rounded-tl-xl rounded-tr-xl">
        <div className="flex items-center gap-2 w-full">
          <CheckBadgeIcon className="text-primary shrink-0 h-6" />
          <span className="font-semibold">Question {order}</span>
        </div>

        <div
          className={cn(
            'flex items-center justify-center size-7 rounded-md border border-[rgba(0,0,0,0.1)] bg-green-100 text-primary',
            question.answer === NOT_ANSWERED_STRING && ' bg-red-100',
          )}
        >
          {question.answer !== NOT_ANSWERED_STRING ? (
            <CheckIcon className="h-4 stroke-2 text-green-700" />
          ) : (
            <XMarkIcon className="h-4 stroke-2 text-red-700" />
          )}
        </div>
      </div>

      <div className="grid p-4 bg-[#fbfbfb]">
        <p className="font-semibold text-gray-800 text-[15px]">{question.question}</p>

        <Textarea value={question.answer} readOnly className="mt-6 font-semibold !text-[15px" />

        {!!question.sources.length && (
          <div className="bg-gray-50 border rounded-md mt-5">
            {question.sources.map((source) => (
              <div key={source} className="flex items-center gap-2 p-2 border-b last:border-b-0">
                <ReportIcon className="h-4 text-gray-700" />
                <span className="text-xs font-semibold text-gray-700">{source}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionItem
