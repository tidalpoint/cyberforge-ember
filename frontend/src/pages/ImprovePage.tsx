import { useMemo, useState } from 'react'
import ReactDiffViewer from 'react-diff-viewer'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import DocumentEmbed from '@/components/DocumentEmbed'
import ReportIcon from '@/components/icons/ReportIcon'
import RisaLogo from '@/components/icons/RisaLogo'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { useGetImprovedDocument } from '@/queries/useGetImprovedDocument'
import { useGetImprovedDocuments } from '@/queries/useGetImprovedDocuments'
import { useGetInputDocument } from '@/queries/useGetInputDocument'
import { cn } from '@/utils/cn'

type ViewType = 'docs' | 'diff'

const ImprovePage = () => {
  const [view, setView] = useState<ViewType>('docs')
  const { documentName } = useParams()

  const { data: inputDoc } = useGetInputDocument({ fileName: documentName })
  const { data: improvedDoc } = useGetImprovedDocument({ fileName: documentName })

  const { data: improvedDocs } = useGetImprovedDocuments()

  const handleDownload = () => {
    if (!documentName || !improvedDoc) return

    const link = document.createElement('a')
    link.href = improvedDoc
    link.download = documentName
    link.click()
  }

  if (!documentName) {
    return null
  }

  const DIFF = useMemo(() => {
    if (!improvedDocs?.length) return null

    return {
      old: improvedDocs
        .find((doc) => doc.modified_document.metadata.name === documentName)
        ?.original_document.metadata.section_list.map((section) => `${section.section_name}\n${section.section_text}`)
        .join('\n\n'),
      new: improvedDocs
        .find((doc) => doc.modified_document.metadata.name === documentName)
        ?.modified_document.metadata.section_list.map((section) => `${section.section_name}\n${section.section_text}`)
        .join('\n\n'),
    }
  }, [improvedDocs])

  return (
    <div>
      <header className="flex items-center justify-center h-16 border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-[1408px] mx-auto w-full px-8">
          <div className="flex items-center gap-1.5 relative -left-1.5">
            <Button asChild variant="ghost" className="p-0 size-9">
              <Link to={ROUTES.documents}>
                <ArrowLeftIcon className="h-4 stroke-2" />
              </Link>
            </Button>

            <h2 className="font-semibold text-gray-800">{documentName}</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => setView((prev) => (prev === 'diff' ? 'docs' : 'diff'))} variant="outline">
              {view === 'diff' ? 'Show Docs' : 'Show Diff'}
            </Button>
            <Button onClick={() => handleDownload()}>Download</Button>
          </div>
        </div>
      </header>

      <div className="max-w-[1408px] mx-auto w-full px-8 py-12">
        {DIFF && (
          <div className={cn('', view === 'docs' && 'hidden')}>
            <ReactDiffViewer oldValue={DIFF.old} newValue={DIFF.new} splitView={false} />
          </div>
        )}

        {inputDoc && improvedDoc && (
          <div className={cn('flex flex-wrap justify-center gap-12 xl:gap-6', view === 'diff' && 'hidden')}>
            <div className="min-w-[660px]">
              <div className="flex items-center gap-2 font-semibold text-gray-800 text-sm mb-2">
                <ReportIcon className="h-5 stroke-2" />
                <h2 className="text-lg font-semibold">Current Policy</h2>
              </div>
              <DocumentEmbed file={inputDoc} className="outline outline-gray-300 outline-offset-1" />
            </div>

            <div className="min-w-[660px]">
              <div className="flex items-center gap-2 font-semibold text-primary text-sm mb-2">
                <ReportIcon className="h-5 stroke-2" />
                <h2 className="text-lg font-semibold">Suggested Policy</h2>
              </div>

              <div className="relative">
                <DocumentEmbed file={improvedDoc} className="outline outline-primary/50 outline-offset-1" />
                <div className="bg-primary flex items-center justify-center size-8 rounded-full p-2 absolute -top-4 -right-4">
                  <RisaLogo className="text-background" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImprovePage
