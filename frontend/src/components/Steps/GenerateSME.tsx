import {Box, Flex, Group, Stack, TagsInput, Text, Textarea} from "@mantine/core";
import {StepLoader} from "./StepLoader.tsx";
import {useCallback, useEffect, useState} from "react";
import {LoadableStepProps} from "./common.ts";
import {ExpertProps, SMECard} from "../SMECard/SMECard.tsx";
import {Carousel} from "@mantine/carousel";


export function GenerateSME({fetchStateFn}: LoadableStepProps) {

    const [loading, setLoading] = useState(false)
    const [stepState, setStepState] = useState({})
    const [experts, setExperts] = useState([])
    useEffect(() => {
        (async () => {
            setLoading(true)
            const state = await fetchStateFn()
            setExperts(state["editors"])
            setStepState(state)
            setLoading(false)
        })()
    }, []);


    return <StepLoader title={"Generating SMEs"} description={"Creating Subject Matter Expert agents to branch out and research to form an unbiased opinion"} isLoading={loading}><Stack style={{
        minHeight: "24em",
        maxHeight: "24em"
    }}>
        <Stack mt={"md"} gap={"3px"}>
            <Text fw={500} size={"sm"}>View and Edit Generated SMEs</Text>
            <Text c={"gray.6"} size={"xs"}>Each of these SMEs are agents that have their own personality and focus to research and create an unbiased article</Text>
        </Stack>
        <Carousel
            height={"100%"}
            slideGap="md"
             controlsOffset={"sm"}
            slideSize={"20em"}
            align="start"
            slidesToScroll={3}
        >
            {experts.map((expert: ExpertProps, i) => <Carousel.Slide><SMECard affiliation={expert.affiliation}
                                                                           name={expert.name}
                                                                           role={expert.role}
                                                                              key={i}
                                                                           description={expert.description} ></SMECard></Carousel.Slide>)}

        </Carousel>

    </Stack></StepLoader>
}