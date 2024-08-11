import { loadCSS, loadJS } from 'markmap-common';
import { Transformer } from 'markmap-lib';

export const transformer = new Transformer();
const { scripts, styles } = transformer.getAssets();
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
loadCSS(styles);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
loadJS(scripts);
