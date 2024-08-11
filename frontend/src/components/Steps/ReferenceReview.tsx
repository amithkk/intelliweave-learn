import {Box, Flex, Group, Stack, TagsInput, Text, Textarea} from "@mantine/core";
import {StepLoader} from "./StepLoader.tsx";
import {useCallback, useEffect, useState} from "react";
import {LoadableStepProps} from "./common.ts";
import {ExpertProps, SMECard} from "../SMECard/SMECard.tsx";
import {Carousel} from "@mantine/carousel";
import {LinkProps, LinkView} from "../LinkView/LinkView.tsx";

export interface Links {

}
export function ReferenceReview({fetchStateFn}: LoadableStepProps) {

    const [loading, setLoading] = useState(false)
    const [stepState, setStepState] = useState({})
    const [links, setLinks] = useState([])
    useEffect(() => {
        (async () => {
            setLoading(true)
            const state = await fetchStateFn()
            let links = []
            let urlSet = new Set();
            for(const intw of state["interview_results"]) {
                for(const [link, description] of Object.entries(intw["references"])) {
                    if (!urlSet.has(link)) {
                        urlSet.add(link);
                        links.push({
                            url: link,
                            preview: description as string
                        });
                    }
                }
            }
            // @ts-ignore
            setLinks(links)
            setStepState(state)
            setLoading(false)
        })()
    }, []);


    return <StepLoader title={"Extracting References"} description={"Extracting and embedding all available references from interviews"} isLoading={loading}><Stack style={{
        minHeight: "30em",
        maxHeight: "30em"
    }}>

        <Stack mt={"md"} gap={"3px"}>
            <Text fw={500} size={"sm"}>View and Delete potentially unwanted sources</Text>
            <Text c={"gray.6"} size={"xs"}>Review the sources that will be used to make this lesson and delete any unreliable sources </Text>
        </Stack>
        <Stack  gap={"xs"} h={"27em"} p={"sm"} style={{border: "1px solid black",  borderRadius:"12px", overflowY:"scroll"}}>
            {links.map((link, idx) => <LinkView key={link.url+link.preview} preview={link.preview} url={link.url} onClickDelete={() => {
                setLinks(links.slice(0, idx).concat(links.slice(idx+1)))
            }}></LinkView>)}

        </Stack>

    </Stack></StepLoader>
}