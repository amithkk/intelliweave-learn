import {ActionIcon, Anchor, Group, Paper, Stack, Text} from "@mantine/core";
import {IconAdjustments, IconTrash} from "@tabler/icons-react";

export interface LinkProps {
        url: string,
        preview: string
        onClickDelete: () => void
}

export function LinkView({url, preview, onClickDelete} : LinkProps) {
        return <Paper p={"sm"}>
                <Group gap={"2px"} wrap={"nowrap"} w={"100%"} justify={"space-between"}>
                <Stack gap={"4px"}><Text size={"s"} c={"blue"}><Anchor href={url} underline={"hover"} target="_blank">
                        {url}
                </Anchor></Text><Text size={"xs"}>{preview}</Text></Stack>
                        <ActionIcon onClick={() => {onClickDelete()}} variant="outline" color="red" size="xl" aria-label="Settings">
                                <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon>
                </Group>
        </Paper>

}
