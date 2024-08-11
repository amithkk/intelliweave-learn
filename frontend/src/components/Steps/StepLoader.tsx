import {Box, Flex, Loader, Title, Text, Stack} from "@mantine/core";
import {Wand} from "../Wand/Wand.tsx";


export function StepLoader({title, description, isLoading, children}: {title: string, description: string, isLoading: boolean, children: any}) {
    return <>
        {
            isLoading ? <Stack  h={"30em"} align={"center"} justify={"center"}>

                <Wand></Wand>
                <Stack align={"center"} gap={"3px"}>
                <Title>{title}</Title>
                <Text>{description}</Text>
                </Stack>
            </Stack> : {...children}
        }
    </>
}