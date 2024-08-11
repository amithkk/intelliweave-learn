// eslint-disable-next-line no-redeclare
import {Avatar, Text, Button, Paper, Grid, Stack, Badge} from '@mantine/core';
import {IconEdit} from "@tabler/icons-react";
import MStreamWriter from "../MStreamWriter/MStreamWriter.tsx";


export interface ExpertProps {
    affiliation: string;
    name: string;
    role: string;
    description: string;
}
export function SMECard({name, role, affiliation, description}: ExpertProps) {
    return (
        <Paper shadow={"sm"} radius="md" withBorder p="lg"  bg="var(--mantine-color-body)" w={"20em"}>
            <Stack>

            <Grid>
                <Avatar color="blue" radius="xl" size={"lg"}>
                    {name.charAt(0)+name.charAt(1)}
                </Avatar>
                <Stack ml={"sm"} gap={.2} align={"start"} justify={"center"}>
                    <Text fw={"700"}>{name}</Text>
                    <Badge
                        size="xs"
                        variant="gradient"
                        gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                    >
                        {role}
                    </Badge>
                </Stack>
            </Grid>
                <Text size={"sm"}> <Text fw={"700"}>Affiliation</Text> {affiliation}</Text>
                <Text size={"sm"}> <Text fw={"700"}>My Imperative</Text><MStreamWriter>{description}</MStreamWriter></Text>


            </Stack>

            <Button variant="default" leftSection={<IconEdit size={14} />} fullWidth mt="md">
                Edit SME Persona
            </Button>
        </Paper>
    );
}