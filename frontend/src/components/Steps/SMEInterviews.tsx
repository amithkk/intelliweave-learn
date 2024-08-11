import {Box, Flex, Group, Stack, TagsInput, Text, Textarea} from "@mantine/core";
import {StepLoader} from "./StepLoader.tsx";
import {useCallback, useEffect, useState} from "react";
import {LoadableStepProps} from "./common.ts";
import {ExpertProps, SMECard} from "../SMECard/SMECard.tsx";
import {Carousel} from "@mantine/carousel";
import {Message, MessageList, MessageSeparator, TypingIndicator} from "@chatscope/chat-ui-kit-react";
import {SMEMiniSelect} from "../SMEMiniSelect/SMEMiniSelect.tsx";


export function SMEInterviews({fetchStateFn}: LoadableStepProps) {

    const [loading, setLoading] = useState(false)
    const [stepState, setStepState] = useState({})
    const [messages, setMessages] = useState([])
    const [intwResults, setIntwResults] = useState([])
    const [selected, setSelected] = useState(0)

    useEffect(() => {
        (async () => {
            setLoading(true)
            const state = await fetchStateFn()
            setMessages(state["interview_results"][0]["messages"])
            setIntwResults(state["interview_results"])
            setStepState(state)
            setLoading(false)
        })()
    }, []);


    return <StepLoader title={"Interviewing SMEs"} description={"Enabling SME agents to explore the internet using the Gemini Multimodal SoM Explorer"}
                       isLoading={loading}><Stack mt="2em" style={{
        minHeight: "30em",
        maxHeight: "30em"
    }}>
        <Stack mt={"md"} gap={"3px"}>
            <Text fw={500} size={"sm"}>View SME interviews</Text>
            <Text c={"gray.6"} size={"xs"}>These are the chats that have occurred between the SME Agent and the Web
                Explorer Agent to build the source list for this article</Text>
        </Stack>
        <Group>
            {
                intwResults.map((result, idx) => <SMEMiniSelect name={result["editor"]["name"]}
                                                                role={result["editor"]["role"]}
                                                                messages={result["messages"]}
                                                                selected={idx === selected}
                                                                onSelectSme={(messages: any) => {
                                                                    setMessages(messages)
                                                                    setSelected(idx)
                                                                }}
                ></SMEMiniSelect>)
            }

        </Group>
        <MessageList style={{height: "28em", border: '1px solid black', borderRadius: '20px'}}
                     autoScrollToBottomOnMount={false} autoScrollToBottom={false}
        >
            {messages.map((m, i) => <Message key={i} model={{
                message: m["content"],
                sender: m["name"],
                direction: i % 2 == 0 ? 'outgoing' : 'incoming'
            }}/>)}
        </MessageList>

    </Stack></StepLoader>;
}