import { useQuery } from '@tanstack/react-query'
import { API_URL } from '@/constants'
import { ControlType } from '@/types/Control'

type ImprovedDocumentsResponse = {
  modified_section_count: number
  original_document: {
    page_content: string
    metadata: {
      name: string
      section_list: {
        section_name: string
        section_text: string
      }[]
    }
  }
  modified_document: {
    page_content: string
    metadata: {
      name: string
      section_list: {
        section_name: string
        section_text: string
      }[]
    }
  }
  controls_improved: ControlType[]
}

const fetchImprovedDocuments = async () => {
  const response = await fetch(`${API_URL}/improved_documents`)

  return response.json()
}

export const useGetImprovedDocuments = () => {
  const query = useQuery<ImprovedDocumentsResponse[]>({
    queryKey: ['improved-documents'],
    queryFn: () => fetchImprovedDocuments(),
  })

  return query
}
