import {Box, Flex, Stack, TagsInput, Textarea} from "@mantine/core";
import {MDEditor} from "../MDEditor/MDEditor.tsx";
import {StepLoader} from "./StepLoader.tsx";
import {useEffect, useState} from "react";
import {LoadableStepProps} from "./common.ts";




export function TopicDiscovery({fetchStateFn}: LoadableStepProps) {

    const [loading, setLoading] = useState(false)
    const [stepState, setStepState] = useState({})
    const [values, setValues] = useState([])
    const [inetDump, setInetDump] = useState("")
    useEffect(() => {
        (async () => {
            setLoading(true)
            const state = await fetchStateFn()
            setValues(state["related_subjects"]["topics"])
            setInetDump(state["related_search_dump"])
            setStepState(state)
            setLoading(false)
        })()
    }, []);

    return <StepLoader title={"Discovering Topics"} description={"Extracting related topics from the internet"} isLoading={loading}><Box style={{
        minHeight: "30em",
        maxHeight: "30em"
    }}>
        <Stack mt={"xl"} w={"100%"} style={{ minHeight: "30em",
            maxHeight: "30em"}}>
        <TagsInput label="Related Topics" placeholder="Enter additional topics" description={"Add or change to expand/focus next steps"} value={values} onChange={setValues} />
        <Textarea rows={13} label="Context retrieved from the internet" description={"For your reference, this is not editable"} disabled value={inetDump}></Textarea>
        </Stack>
    </Box></StepLoader>
}