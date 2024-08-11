import {Paper, Title, Text, Stack, Stepper, Button, Group, Box} from "@mantine/core";
import {useState} from "react";
import MarkMap from "../MarkMap/MarkMap.tsx";
import {MDEditor} from "../MDEditor/MDEditor.tsx";
import {RoughOutline} from "../Steps/RoughOutline.tsx";
import {TopicDiscovery} from "../Steps/TopicDiscovery.tsx";
import {GenerateSME} from "../Steps/GenerateSME.tsx";
import {getStateForStep} from "../../api/intelliweave-connect.ts";
import {SMEInterviews} from "../Steps/SMEInterviews.tsx";
import {ReferenceReview} from "../Steps/ReferenceReview.tsx";
import {FinalOutline} from "../Steps/FinalOutline.tsx";
import {FinalArticle} from "../Steps/FinalArticle.tsx";



export function LessonComposer() {
    const [active, setActive] = useState(0);
    const nextStep = () => setActive((current) => (current < 7 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 7 ? current - 1 : current));

    const [proceed, setProceed] = useState(false)

    const sleep = (time: number) => {
        return new Promise<void>((resolve) => {
            // wait 3s before calling fn(par)
            setTimeout(() => resolve(), time)
        })
    }

    const fetchState = async (stepId: string) => {
        setProceed(false)
        const s1 = getStateForStep(stepId, 'AZW1')
        setProceed(true)
        return s1
    }

    const buildFetchState = (stepId: string) => {
        return () => fetchState(stepId)
    }

    return <>
        <Stack >
        <Title>Composer - "Responsible AI"</Title>
        <Text> The composer will enable you to create a lesson by working with generative ai</Text>
        <Paper shadow={"xl"} >
            <Stack p={"5em"}>
                <Stepper size="sm" active={active} onStepClick={setActive}>
                    <Stepper.Step  label="Rough outline" description="Markmind">
                        {/* Step 1 content: Markmind */}
                        <RoughOutline fetchStateFn={buildFetchState('outline_gen')}></RoughOutline>

                    </Stepper.Step>
                    <Stepper.Step label="Topic Discovery" description="Topic Discovery">

                        <TopicDiscovery fetchStateFn={buildFetchState('topic_expansion')}></TopicDiscovery>
                    </Stepper.Step>
                    <Stepper.Step label="Generate SMEs" description="Generating SMEs">
                       <GenerateSME fetchStateFn={buildFetchState('create_smes')}></GenerateSME>
                    </Stepper.Step>
                    <Stepper.Step label="SME Interviews" description="Web exploration">
                        <SMEInterviews fetchStateFn={buildFetchState('conduct_interviews')}></SMEInterviews>
                    </Stepper.Step>
                    <Stepper.Step label="Reference Review" description="Collect references">
                        <ReferenceReview fetchStateFn={buildFetchState('index_references')}></ReferenceReview>
                    </Stepper.Step>
                    <Stepper.Step label="Final Outline" description="Revised Outline">
                       <FinalOutline fetchStateFn={buildFetchState('refine_outline')}></FinalOutline>
                    </Stepper.Step>
                    <Stepper.Step label="Final Article" description="Final draft">
                        <FinalArticle fetchStateFn={buildFetchState('write_article')}></FinalArticle>
                    </Stepper.Step>

                </Stepper>

                <Group justify="center" mt="xl">
                    <Button variant="default" onClick={prevStep}>Back</Button>
                    <Button onClick={nextStep} disabled={!proceed}>{active !== 6 ? "Next step": "Finish and Save"}</Button>
                </Group>
            </Stack>

        </Paper>
        </Stack>
    </>
}