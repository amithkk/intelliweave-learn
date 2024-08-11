import {Box, TagsInput} from "@mantine/core";
import {MDEditor} from "../MDEditor/MDEditor.tsx";
import {StepLoader} from "./StepLoader.tsx";
import {useCallback, useEffect, useState} from "react";
import {LoadableStepProps, mdProc} from "./common.ts";




export function FinalOutline({fetchStateFn}: LoadableStepProps) {

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



        if(!stepState["refined_outline"]) {
            return ""
        }
        return mdProc(stepState["refined_outline"])



    }, [stepState])

    const getOrigMd = useCallback(() => {



        if(!stepState["outline"]) {
            return ""
        }
        return mdProc(stepState["outline"][0])


    }, [stepState])

    return <StepLoader title={"Revising Outline based on Interviews"} description={"Using Gemini to revise your outline"} isLoading={loading}><Box style={{
        minHeight: "30em",
        maxHeight: "30em"
    }}>

        <MDEditor mdContent={getMd()} diffMd={getOrigMd()}></MDEditor>
    </Box></StepLoader>


}