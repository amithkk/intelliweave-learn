import {Box, TagsInput} from "@mantine/core";
import {MDEditor} from "../MDEditor/MDEditor.tsx";
import {StepLoader} from "./StepLoader.tsx";
import {useCallback, useEffect, useState} from "react";
import {LoadableStepProps, mdProc} from "./common.ts";




export function RoughOutline({fetchStateFn}: LoadableStepProps) {

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



        if(!stepState["outline"]) {
            return ""
        }
        return mdProc(stepState["outline"][0])



    }, [stepState])
    return <StepLoader title={"Generating Initial Outline"} description={"Using Gemini to generate an initial outline based on your topic"} isLoading={loading}><Box style={{
        minHeight: "30em",
        maxHeight: "30em"
    }}>

        <MDEditor  mdContent={getMd()}></MDEditor>
    </Box></StepLoader>


}