import React, { useState, useRef, useEffect } from 'react';
import { Markmap } from 'markmap-view';
import { transformer } from './mmap';
import { Toolbar } from 'markmap-toolbar';
import 'markmap-toolbar/dist/style.css';

function renderToolbar(mm: Markmap, wrapper: HTMLElement) {
    while (wrapper?.firstChild) wrapper.firstChild.remove();
    if (mm && wrapper) {
        const toolbar = new Toolbar();
        toolbar.attach(mm);
        // Register custom buttons
        console.log(Toolbar.defaultItems)
        toolbar.setItems([...Toolbar.defaultItems]);
        wrapper.append(toolbar.render());
    }
}
export default function MarkMap({mdContent}: {mdContent: string}) {
    // Ref for SVG element
    const refSvg = useRef<SVGSVGElement>();
    // Ref for markmap object
    const refMm = useRef<Markmap>();
    // Ref for toolbar wrapper
    const refToolbar = useRef<HTMLDivElement>();

    useEffect(() => {
        // Create markmap and save to refMm
        if (refMm.current) return;
        const mm = Markmap.create(refSvg.current);
        console.log('create', refSvg.current);
        refMm.current = mm;
        renderToolbar(refMm.current, refToolbar.current);
    }, [refSvg.current]);

    useEffect(() => {
        // Update data for markmap once value is changed
        const mm = refMm.current;
        if (!mm) return;
        const { root } = transformer.transform(mdContent);
        mm.setOptions({
            maxWidth: 600,
        })
        mm.setData(root);
        mm.fit();
    }, [refMm.current, mdContent]);


    return (
        <React.Fragment>

            <svg className="flex-1" ref={refSvg} style={{
                width:"100%",
                minHeight: "27em"
            }} />
            <div className="absolute bottom-1 right-1" ref={refToolbar}></div>
        </React.Fragment>
    );
}
