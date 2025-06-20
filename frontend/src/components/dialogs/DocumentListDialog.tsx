import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DocumentIcon } from '@heroicons/react/24/outline'
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { ROUTES } from '@/constants/routes'
import { useGetDocuments } from '@/queries/useGetDocuments'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

const DocumentListDialog = () => {
  const [open, setOpen] = useState(false)

  const { data: documents, isLoading } = useGetDocuments()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white hover:bg-gray-50 text-foreground border">View Documents</Button>
      </DialogTrigger>

      <DialogContent className="overflow-hidden">
        <DialogHeader className="bg-white">Your Uploaded Documents</DialogHeader>

        <div className="max-h-[50dvh] overflow-y-auto">
          <Table>
            <TableBody className="font-medium text-gray-800">
              {documents?.map((document) => (
                <TableRow
                  key={document.name}
                  className="cursor-pointer bg-[#fafafa] hover:bg-white transition-colors duration-300"
                >
                  <TableCell className="h-16 p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 rounded-lg h-8 w-8 flex items-center justify-center shrink-0">
                        <DocumentIcon className="h-4 stroke-2 text-gray-600" />
                      </div>
                      {document.name}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!documents?.length && !isLoading && (
            <div className="p-5">
              <Card className="flex items-center justify-center flex-col gap-4 h-[320px] border-dashed bg-white select-none">
                <img src="/search.png" className="h-24" />
                <div className="grid gap-0.5 text-center">
                  <p className="text-gray-700 text-lg font-semibold">No Documents Found</p>
                  <p className="text-gray-500 text-sm font-semibold">Uploaded documents will show here</p>
                </div>

                <Button asChild className="mt-3">
                  <Link to={ROUTES.home}>Upload Documents</Link>
                </Button>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DocumentListDialog
