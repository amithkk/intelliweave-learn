export interface ResearchState {
    topic: string
    outline: Outline[]
    refined_outline: RefinedOutline
    editors: Editor[]
    interview_results: InterviewResult[]
    related_subjects: RelatedSubjects
    related_search_dump: string
    sections: Section3[]
    article: string
}

export interface Outline {
    page_title: string
    sections: Section[]
}

export interface Section {
    section_title: string
    description: string
    subsections?: Subsection[]
}

export interface Subsection {
    subsection_title: string
    description: string
}

export interface RefinedOutline {
    page_title: string
    sections: Section2[]
}

export interface Section2 {
    section_title: string
    description: string
    subsections?: Subsection2[]
}

export interface Subsection2 {
    subsection_title: string
    description: string
}

export interface Editor {
    affiliation: string
    name: string
    role: string
    description: string
}

export interface InterviewResult {
    messages: Message[]
    references: any
    editor: Editor2
}

export interface Message {
    content: string
    additional_kwargs: AdditionalKwargs
    response_metadata: ResponseMetadata
    type: string
    name: string
    id?: string
    example: boolean
    tool_calls: any[]
    invalid_tool_calls: any[]
}

export interface AdditionalKwargs {}

export interface ResponseMetadata {
    finish_reason?: string
}

export interface Editor2 {
    affiliation: string
    name: string
    role: string
    description: string
}

export interface RelatedSubjects {
    topics: string[]
}

export interface Section3 {
    section_title: string
    content: string
    subsections?: Subsection3[]
    citations: string[]
}

export interface Subsection3 {
    subsection_title: string
    description: string
}

let lessonTopic = ""
let researchState = {}
export const setTopic = (topic: string) => {lessonTopic = topic}
export const setState = (state: any) => {researchState = state}

export const getStateForStep = async (stepId: string, lessonId: string): Promise<ResearchState> => {

   let body;
    if(stepId == "outline_gen"){
      body = {
          "topic": lessonTopic
      }
   } else {
        body = {
            "state": researchState
        }
    }

    let res = await fetch(`http://localhost:8000/lessons/${lessonId}/step/${stepId}\``, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    let updState = await res.json()

    setState(await updState.json())
    return updState as ResearchState;

}