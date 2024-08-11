import {Avatar, Box, Flex, Group, Paper, Stack, Text, useMantineTheme} from "@mantine/core";
import {ExpertProps} from "../SMECard/SMECard.tsx";
import {Badge} from "@mantine/core";


export interface MiniSelectProps {
    name: string;
    role: string;
    messages: any;
    onSelectSme: (message: any) => void;
    selected: boolean;
}
export function SMEMiniSelect({role, name, selected, onSelectSme, messages}: MiniSelectProps)  {
    const theme = useMantineTheme();


    return <Paper  style={{
        backgroundColor: selected ? theme.colors.blue[1]: theme.colors.gray[10], cursor: 'pointer'
    }} shadow={"xs"} withBorder={true} onClick={() => onSelectSme(messages)}><Group gap={"xs"} p={"xs"} >
        <Avatar style={{border: "1px solid blue"}} color="blue" radius="lg" size={"sm"}>
            {name.charAt(0)+name.charAt(1)}
        </Avatar>
        <Stack align={"start"} justify={"center"} gap={0}> <Text>{name}</Text><Badge

            size="xs"
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
        >
            {role}
        </Badge></Stack>
    </Group></Paper>
}