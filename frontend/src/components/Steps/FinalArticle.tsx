import {Box, TagsInput} from "@mantine/core";
import {MDEditor} from "../MDEditor/MDEditor.tsx";
import {StepLoader} from "./StepLoader.tsx";
import {useCallback, useEffect, useState} from "react";
import {LoadableStepProps, mdProc} from "./common.ts";




export function FinalArticle({fetchStateFn}: LoadableStepProps) {

    const [loading, setLoading] = useState(false)
    const [stepState, setStepState] = useState<any>({})


    useEffect(() => {
        (async () => {
            setLoading(true)
            const state = await fetchStateFn()
            console.log("gotStepState", state)
            setStepState(state)
            setLoading(false)
        })()
    }, []);

    const getMd = useCallback(() => {
        if(stepState["article"]) {
            console.log(stepState["article"])
            return stepState["article"]
        }
        return ""
    }, [stepState])
    return <StepLoader title={"Generating Final Article"} description={"Using Gemini to generate every section and then refine the final article based on sources. This will take a while"} isLoading={loading}><Box style={{
        minHeight: "30em",
    }}>

        <MDEditor  maxMode={true}   mdContent={getMd()} defaultTab={"edit"}></MDEditor>
    </Box></StepLoader>


}