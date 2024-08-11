import {
    Card,
    Grid,
    Stack,
    Text,
    Title,
    Image,
    Box,
    Flex,
    Modal,
    TextInput,
    Button,
    Code,
    Group,
    InputBase, useCombobox,
    Combobox,
    Input, Textarea
} from "@mantine/core";
import {IconFilePlus, IconPlus} from "@tabler/icons-react";
import classes from './LessonsList.module.css';
import {useDisclosure} from "@mantine/hooks";
import {hasLength, isEmail, useForm} from "@mantine/form";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {setTopic} from "../../api/intelliweave-connect.ts";

interface LearnerProfile {
    emoji: string;
    value: string;
    description: string;
}

const personas: LearnerProfile[] = [
    { emoji: '👩‍🔧', value: 'Engineer', description: 'Designs and builds solutions, prefers verbose, practical and technical information' },
    { emoji: '👩‍💼', value: 'Executive', description: 'Makes high-level decisions, prefers concise and strategic information' },
    { emoji: '👨‍🎓', value: 'College Student', description: 'Learning new concepts, prefers simple and clear explanations' },
];

function SelectOption({ emoji, value, description }: LearnerProfile) {
    return (
        <Group>
            <Text fz={20}>{emoji}</Text>
            <div>
                <Text fz="sm" fw={500}>
                    {value}
                </Text>
                <Text fz="xs" opacity={0.6}>
                    {description}
                </Text>
            </div>
        </Group>
    );
}

export function SelectOptionComponent() {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const [value, setValue] = useState<string | null>(null);
    const selectedOption = personas.find((item) => item.value === value);

    const options = personas.map((item) => (
        <Combobox.Option value={item.value} key={item.value}>
            <SelectOption {...item} />
        </Combobox.Option>
    ));

    return (
        <Combobox

            store={combobox}
            withinPortal={false}
            onOptionSubmit={(val) => {
                setValue(val);
                combobox.closeDropdown();
            }}
        >
            <Combobox.Target>
                <InputBase
                    component="button"
                    type="button"
                    pointer
                    rightSection={<Combobox.Chevron />}
                    onClick={() => combobox.toggleDropdown()}
                    rightSectionPointerEvents="none"
                    multiline
                >
                    {selectedOption ? (
                        <SelectOption {...selectedOption} />
                    ) : (
                        <Input.Placeholder>Pick persona</Input.Placeholder>
                    )}
                </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>{options}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}

export function LessonsList() {
    const [opened, { open, close }] = useDisclosure(false);
    let navigate = useNavigate();
    const lessons = [
        { id: '1', title: '3D Printing', description: 'New materials in 3D printing such as PEI', img: 'https://unsplash.com/photos/HsefvbLbNWc/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzE0MTIwMzQ5fA&force=true&w=1920' },
        { id: '2', title: 'Test Lesson', description: 'What is new in the deep learning space', img: 'https://unsplash.com/photos/w7ZyuGYNpRQ/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8M3x8ZGVlcCUyMGxlYXJuaW5nfGVufDB8fHx8MTcxNDA3NDAwOXww&force=true&w=1920' },
        // Add more lessons here...
    ];




    const form = useForm({
        mode: 'controlled',
        initialValues: { name: '', persona: '', topic: '' },
        validate: {
            name: hasLength({ min: 3 }, 'Must be at least 3 characters'),

        },
    });
    const [submittedValues, setSubmittedValues] = useState<typeof form.values | null>(null);
    useEffect(() => {
        setTopic(submittedValues?.topic? submittedValues.topic : "")
    }, [submittedValues]);


    return <Stack>

        <Modal opened={opened} onClose={close} size={"xl"}  title="Create a new lesson">

            <form  onSubmit={form.onSubmit(setSubmittedValues)}>
                <TextInput {...form.getInputProps('name')} label="Lesson Name" placeholder="Short name for your lesson"/>
                <Stack mt={"md"} gap={"3px"}>
                    <Text fw={500}  size={"sm"}>Choose Learner Persona</Text>
                    <Text c={"gray.6"} size={"xs"}>A learner persona defines the kind of language and depth expressed in the lesson</Text>
                </Stack>
                <SelectOptionComponent />
                <Textarea
                    mt={"sm"}
                    label="Enter Topic"
                    placeholder="Enter the topic that you'd like to create a lesson for. Be specific"
                />

                <Button type="submit" mt="xl" onClick={() => {navigate("/lessons/AZW1/composer")}}>
                    Start Lesson Composition
                </Button>

            </form>

        </Modal>
        <Stack pb="2em">
            <Title>Lessons</Title>
            <Text> Manage and iterate over your generated lessons</Text>
        </Stack>
        <Grid gutter="md" justify="left">
            <Grid.Col style={{minHeight: "300px"}} span={3}>
                <Flex onClick={open} h={300} className={classes.newlesson} align={"center"} justify={"center"}><Flex
                    justify={"center"} direction={"column"} align={"center"}>
                    <IconFilePlus size={36}></IconFilePlus>
                    <Text>Create New Lesson</Text>
                </Flex></Flex>
            </Grid.Col>
            {lessons.map((lesson) => (
                <Grid.Col style={{ height: "300px" }} key={lesson.id} span={3} >
                    <Card
                        style={{ height: "300px" , cursor: "pointer"}}
                        shadow="sm"
                        padding="xl"
                    >
                        <Card.Section>
                            <Image
                                src={lesson.img}
                                h={160}
                                alt={lesson.title}
                            />
                        </Card.Section>

                        <Text fw={500} size="lg" mt="md">
                            {lesson.title}
                        </Text>

                        <Text mt="xs" c="dimmed" size="sm">
                            {lesson.description}
                        </Text>
                    </Card>
                </Grid.Col>
            ))}
        </Grid>
    </Stack>
}