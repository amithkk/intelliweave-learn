export interface LoadableStepProps {
    fetchStateFn: () => any
}

export function mdProc(outline: any) {
    if(!outline) {
        return ""
    }
    let md = ""
    md += `# ${outline["page_title"]}\n\n`
    for(let section of  outline["sections"]){
        md += `\n## ${section["section_title"]} \n\n- ${section["description"]}\n`
        if(section["subsections"]) {
            for (let subsection of section["subsections"]) {
                md += `    - ${subsection["subsection_title"]}\n        - ${subsection["description"]}\n`
            }
            md += "\n"
        }

    }
    return md
}