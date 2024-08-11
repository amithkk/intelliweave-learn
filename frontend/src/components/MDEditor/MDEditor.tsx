import {IconEdit, IconMap, IconSettings, IconStars} from "@tabler/icons-react";
import {rem, Tabs} from "@mantine/core";
import {
    MDXEditor,
    UndoRedo,
    BoldItalicUnderlineToggles,
    toolbarPlugin,
    listsPlugin,
    linkPlugin, InsertImage, imagePlugin, linkDialogPlugin, diffSourcePlugin, DiffSourceToggleWrapper, DialogButton
} from '@mdxeditor/editor'
import { headingsPlugin } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import MarkMap from "../MarkMap/MarkMap.tsx";
import classes from "./MDEditor.module.css"

export function MDEditor({mdContent, defaultTab="map", maxMode=false, diffMd=null}: {mdContent: string, defaultTab?: string, maxMode?: boolean, diffMd?: string}) {
    const iconStyle = { width: rem(12), height: rem(12) };
    const diffPlug = diffMd ?  [diffSourcePlugin({ diffMarkdown: diffMd, viewMode: 'rich-text' })]: []

    return  <Tabs mt={"2em"} h={"100%"} variant="outline" defaultValue={defaultTab}>
        <Tabs.List>
            <Tabs.Tab value="map" leftSection={<IconMap style={iconStyle} />}>
                Map View
            </Tabs.Tab>
            <Tabs.Tab value="edit" leftSection={<IconEdit style={iconStyle} />}>
                Human Edit
            </Tabs.Tab>

        </Tabs.List>

        <Tabs.Panel value="map">
            <MarkMap mdContent={mdContent}></MarkMap>
        </Tabs.Panel>

        <Tabs.Panel value="edit">
            <MDXEditor  className={maxMode? classes.editorMax: classes.editor}  markdown={mdContent} onError={({error, source}) => {console.error("CriticalMDXError", error, source)} } plugins={[
                toolbarPlugin({
                    toolbarContents: () => (
                        <>
                            {' '}
                            <UndoRedo />
                            <BoldItalicUnderlineToggles />
                            <DialogButton tooltipTitle={"Iterate with Gemini"} submitButtonTitle={"Run Prompt"} dialogInputPlaceholder={"Enter your prompt to iterate"} onSubmit={(val) => {}} buttonContent={<IconStars />}></DialogButton>
                            <InsertImage></InsertImage>
                            {diffMd ? <DiffSourceToggleWrapper>
                                <UndoRedo />
                            </DiffSourceToggleWrapper>: <></>}
                        </>
                    )
                }), headingsPlugin(), listsPlugin(), linkPlugin(), linkDialogPlugin(),
                imagePlugin({
                    imageUploadHandler: () => {
                        return Promise.resolve('https://picsum.photos/200/300')
                    }}),...diffPlug
            ]} />
        </Tabs.Panel>

    </Tabs>
}