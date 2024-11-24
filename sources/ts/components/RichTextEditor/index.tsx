/**
 * @file index.tsx
 * @description Rich text editor.
 * @note Work in progress.
 * @todo Fix typing.
 */

'use strict';
import {
    FunctionComponent,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from 'react';
import classNames from 'classnames';
import isHotkey from 'is-hotkey';
import {
    BaseEditor,
    createEditor,
    Editor,
    Transforms,
    Element as SlateElement,
    Path,
    Node,
} from 'slate';
import { Slate, Editable, withReact, useSlate, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';

import { useGlobal } from '@sources/ts/hooks/useGlobal';
import { EditorButton, EditorIcon, EditorToolbar } from './components';
import * as styles from './RichTextEditor.module.css';

// Still figuring out typing in slate.
type MarkFormat = 'bold' | 'italic' | 'underline' | 'code' | 'link';
type BlockFormat =
    | 'paragraph'
    | 'heading-one'
    | 'heading-two'
    | 'block-quote'
    | 'numbered-list'
    | 'bulleted-list'
    | 'left'
    | 'center'
    | 'right'
    | 'justify';
type CustomEditor = BaseEditor & ReactEditor;
type CustomElement = {
    type: BlockFormat;
    children: CustomText[];
    align: 'left' | 'center' | 'right' | 'justify';
};
type CustomText = {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    code?: boolean;
    link?: boolean;
};

declare module 'slate' {
    interface CustomTypes {
        Editor: CustomEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}

const HOTKEYS = {
        'mod+b': 'bold',
        'mod+l': 'link',
        'mod+i': 'italic',
        'mod+u': 'underline',
        'mod+`': 'code',
    },
    LIST_TYPES = ['numbered-list', 'bulleted-list'],
    TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

/**
 * Toggle block format.
 * @param editor Editor instance.
 * @param format Block format.
 */
const toggleBlock = (editor: CustomEditor, format: BlockFormat) => {
    const isActive = isBlockActive(editor, format);
    const isList = LIST_TYPES.includes(format);

    Transforms.unwrapNodes(editor, {
        match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            LIST_TYPES.includes(n.type) &&
            !TEXT_ALIGN_TYPES.includes(format),
        split: true,
    });
    let newProperties: any;
    if (TEXT_ALIGN_TYPES.includes(format)) {
        newProperties = {
            align: isActive ? undefined : format,
        };
    } else {
        newProperties = {
            type: isActive ? 'paragraph' : isList ? 'list-item' : format,
        };
    }
    Transforms.setNodes<SlateElement>(editor, newProperties);

    if (!isActive && isList) {
        const block: SlateElement = {
            type: format,
            children: [],
            align: 'left',
        };
        Transforms.wrapNodes(editor, block);
    }
};

/**
 * Toggle mark format.
 * @param editor Editor instance.
 * @param format Mark format.
 */
const toggleMark = (editor: CustomEditor, format: MarkFormat) => {
    const isActive = isMarkActive(editor, format);
    if (isActive) {
        Editor.removeMark(editor, format);
        return;
    }

    switch (format) {
        case 'link': {
            let link = window.prompt('Nhập liên kết', '');
            if (!link) return;
            Editor.addMark(editor, format, {
                url: link,
                target: '_blank',
            });
            return;
        }
        default: {
            Editor.addMark(editor, format, true);
            return;
        }
    }
};

/**
 * Check if the block format is active.
 * @param editor Editor instance.
 * @param format Block format.
 * @param blockType Block type.
 * @returns Returns true if the block format is active, false otherwise.
 */
const isBlockActive = (editor: CustomEditor, format: BlockFormat) => {
    const blockType = TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type',
        { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
        Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: (node) =>
                !Editor.isEditor(node) &&
                SlateElement.isElement(node) &&
                node[blockType] === format,
        })
    );

    return !!match;
};

/**
 * Check if the mark format is active.
 * @param editor Editor instance.
 * @param format Mark format.
 * @returns Returns true if the mark format is active, false otherwise.
 */
const isMarkActive = (editor: CustomEditor, format: MarkFormat) => {
    const marks = Editor.marks(editor);
    return marks ? !!marks[format] : false;
};

/**
 * The generic render element used by Slate editor.
 * @param props Component properties.
 * @param props.attributes Attributes.
 * @param props.children Children.
 * @param props.element Element.
 * @returns Returns the component.
 */
const Element = ({
    attributes,
    children,
    element,
}: {
    attributes: any;
    children: any;
    element: any;
}) => {
    const style = { textAlign: element.align || 'left' };

    switch (element.type) {
        case 'block-quote':
            return (
                <blockquote style={style} {...attributes}>
                    {children}
                </blockquote>
            );
        case 'bulleted-list':
            return (
                <ul style={style} {...attributes}>
                    {children}
                </ul>
            );
        case 'heading-one':
            return (
                <h4 style={style} {...attributes}>
                    {children}
                </h4>
            );
        case 'heading-two':
            return (
                <h5 style={style} {...attributes}>
                    {children}
                </h5>
            );
        case 'list-item':
            return (
                <li style={style} {...attributes}>
                    {children}
                </li>
            );
        case 'numbered-list':
            return (
                <ol style={style} {...attributes}>
                    {children}
                </ol>
            );
        case 'image':
            return (
                <div {...attributes}>
                    <img
                        src={element.url}
                        style={{ ...style, width: '100%' }}
                    />
                    <div style={{ display: 'none' }}>{children}</div>
                </div>
            );
        default:
            return (
                <p style={style} {...attributes}>
                    {children}
                </p>
            );
    }
};

/**
 * The generic leaf render element used by Slate editor.
 * @param props Component properties.
 * @param props.attributes Attributes.
 * @param props.children Children.
 * @param props.leaf Leaf.
 * @returns Returns the component.
 */
const Leaf = ({
    attributes,
    children,
    leaf,
}: {
    attributes: any;
    children: any;
    leaf: any;
}) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>;
    }

    if (leaf.code) {
        children = <code>{children}</code>;
    }

    if (leaf.link) {
        children = (
            <a
                className={styles['anchor']}
                href={leaf.link.url}
                target={leaf.link.target}
            >
                {children}
            </a>
        );
    }

    if (leaf.italic) {
        children = <em>{children}</em>;
    }

    if (leaf.underline) {
        children = <u>{children}</u>;
    }

    return <span {...attributes}>{children}</span>;
};

/**
 * Mark button.
 * @param props Component properties.
 * @param props.format Mark format.
 * @param props.icon Icon name. (Material icon)
 * @returns Returns the component.
 */
const MarkButton = ({ format, icon }: { format: MarkFormat; icon: string }) => {
    const editor = useSlate();
    return (
        <EditorButton
            active={isMarkActive(editor, format)}
            onMouseDown={(event: any) => {
                event.preventDefault();
                toggleMark(editor, format);
            }}
        >
            <EditorIcon>{icon}</EditorIcon>
        </EditorButton>
    );
};

/**
 * Insert image button.
 * @param props Component properties.
 * @param props.icon Icon name. (Material icon)
 * @returns Returns the component.
 */
const ImageButton = ({ icon }: { icon: string }) => {
    const editor = useSlate();
    return (
        <EditorButton
            active={false}
            onMouseDown={(event: any) => {
                event.preventDefault();
                const url = window.prompt('Nhập địa chỉ liên kết hình ảnh:');
                if (!url) return;

                const { selection } = editor;
                const images = [
                    {
                        type: 'image',
                        url,
                        children: [{ text: '' }],
                    },
                    {
                        type: 'paragraph',
                        children: [{ text: '' }],
                    },
                ] as any[];

                // ReactEditor.focus(editor);

                if (!!selection) {
                    const [parentNode, parentPath]: any = Editor.parent(
                        editor,
                        selection.focus?.path
                    );

                    if (
                        editor.isVoid(parentNode) ||
                        Node.string(parentNode).length
                    ) {
                        Transforms.insertNodes(editor, images, {
                            at: Path.next(parentPath),
                            select: true,
                        });
                    } else {
                        Transforms.removeNodes(editor, { at: parentPath });
                        Transforms.insertNodes(editor, images, {
                            at: parentPath,
                            select: true,
                        });
                    }
                } else {
                    Transforms.insertNodes(editor, images, {
                        at: [editor.children.length],
                    });
                }
            }}
        >
            <EditorIcon>{icon}</EditorIcon>
        </EditorButton>
    );
};

/**
 * Block button.
 * @param props Component properties.
 * @param props.format Block format.
 * @param props.icon Icon name. (Material icon)
 * @returns Returns the component.
 */
const BlockButton = ({
    format,
    icon,
}: {
    format: BlockFormat;
    icon: string;
}) => {
    const editor = useSlate();
    return (
        <EditorButton
            active={isBlockActive(editor, format)}
            onMouseDown={(event: any) => {
                event.preventDefault();
                toggleBlock(editor, format);
            }}
        >
            <EditorIcon>{icon}</EditorIcon>
        </EditorButton>
    );
};

/**
 * Slate rich text editor.
 * @param props Component properties.
 * @param props.initialValue Slate editor initial value. (Uncontrolled mode only)
 * @param props.value Slate editor value. (Controlled mode only)
 * @param props.onValueChange Callback that will be invoked when editor value changes.
 * @param props.readonlyMode Readonly mode.
 * @param props.plaintextMode Plaintext mode.
 * @returns Returns the component.
 */
const RichTextEditor: FunctionComponent<
    {
        initialValue?: string;
        value?: string;
        onValueChange?: (value: string) => void;
        readonlyMode?: boolean;
        plaintextMode?: boolean;
    } & React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    >
> = ({
    className,
    style,
    value,
    initialValue,
    onValueChange,
    readonlyMode = false,
    plaintextMode = false,
}) => {
    const { deviceInfo } = useGlobal();

    const editor = useMemo(() => withHistory(withReact(createEditor())), []),
        editorInitialValue = useMemo(() => {
            return initialValue || value
                ? JSON.parse(initialValue || value)
                : [
                      {
                          type: 'paragraph',
                          children: [{ text: '' }],
                          align: 'left',
                      },
                  ];
        }, []);

    const renderElement = useCallback(
            (props: any) => <Element {...props} />,
            []
        ),
        renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

    const [parsedValue, setParsedValue] = useState(editorInitialValue);

    useEffect(() => {
        if (value && initialValue)
            console.error(
                `[Slate Editor]: Do not use 'value' and 'initialValue' at the same time. Use 'value' for controlled mode and 'initialValue' for uncontrolled mode.`
            );

        if (value) {
            // https://stackoverflow.com/questions/71201725/set-new-intiial-slatejs-editor-value-with-react-oneffect

            let totalNodes = editor.children.length;
            for (let i = 0; i < totalNodes - 1; i++) {
                Transforms.removeNodes(editor, {
                    at: [totalNodes - i - 1],
                });
            }

            for (const node of JSON.parse(value)) {
                Transforms.insertNodes(editor, node, {
                    at: [editor.children.length],
                });
            }

            Transforms.removeNodes(editor, {
                at: [0],
            });

            Transforms.select(editor, Editor.end(editor, []));

            setParsedValue(JSON.parse(value));
        }
    }, [value]);

    return (
        <div
            className={classNames(
                styles['editor'],
                {
                    [styles['readonly-mode']]: readonlyMode || plaintextMode,
                    [styles['plaintext-mode']]: plaintextMode,
                },
                className
            )}
            style={style}
        >
            <Slate
                editor={editor}
                initialValue={editorInitialValue}
                onChange={(value) => {
                    const isAstChange = editor.operations.some(
                        (op: any) => 'set_selection' !== op.type
                    );
                    if (isAstChange && onValueChange)
                        onValueChange(JSON.stringify(value));
                }}
            >
                {!readonlyMode && !plaintextMode && (
                    <EditorToolbar className={styles['toolbar']}>
                        <MarkButton format="bold" icon="format_bold" />
                        <MarkButton format="italic" icon="format_italic" />
                        <MarkButton
                            format="underline"
                            icon="format_underlined"
                        />
                        <MarkButton format="code" icon="code" />
                        <MarkButton format="link" icon="link" />
                        <ImageButton icon="image" />
                        <BlockButton format="heading-one" icon="looks_one" />
                        <BlockButton format="heading-two" icon="looks_two" />
                        <BlockButton format="block-quote" icon="format_quote" />
                        <BlockButton
                            format="numbered-list"
                            icon="format_list_numbered"
                        />
                        <BlockButton
                            format="bulleted-list"
                            icon="format_list_bulleted"
                        />
                        <BlockButton format="left" icon="format_align_left" />
                        <BlockButton
                            format="center"
                            icon="format_align_center"
                        />
                        <BlockButton format="right" icon="format_align_right" />
                        <BlockButton
                            format="justify"
                            icon="format_align_justify"
                        />
                    </EditorToolbar>
                )}
                {plaintextMode && (
                    <span
                        style={{
                            display: 'block',
                            width: '100%',
                            whiteSpace: 'normal',
                            textAlign: 'left',
                        }}
                    >
                        {parsedValue.map((n: any) => Node.string(n)).join('\n')}
                    </span>
                )}
                <Editable
                    readOnly={readonlyMode || plaintextMode}
                    className={classNames(styles['editable'])}
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder="Nhập thông tin sản phẩm"
                    renderPlaceholder={({ children, attributes }) => (
                        <span
                            className={styles['editable-placeholder-wrapper']}
                            style={{
                                display:
                                    readonlyMode || plaintextMode
                                        ? 'none'
                                        : 'block',
                            }}
                            {...attributes}
                        >
                            <span className={styles['editable-placeholder']}>
                                {children}
                            </span>
                        </span>
                    )}
                    spellCheck={false}
                    onKeyDown={(event) => {
                        if (event.code === 'Enter' || event.key === 'Enter') {
                            if (!event.shiftKey) {
                                event.preventDefault();
                                event.stopPropagation();
                                editor.insertBreak();
                                return;
                            } else {
                                event.preventDefault();
                                event.stopPropagation();
                                editor.insertText('\n');
                                return;
                            }
                        }
                        for (const hotkey in HOTKEYS) {
                            if (isHotkey(hotkey, event as any)) {
                                event.preventDefault();
                                const mark = (HOTKEYS as any)[hotkey];
                                toggleMark(editor, mark);
                            }
                        }
                    }}
                    // This fix jumpy behavior when typing into the editor on mobile devices.
                    // However we don't want this auto selection scroll on desktop.
                    scrollSelectionIntoView={
                        deviceInfo.type !== 'desktop'
                            ? (editor, domRange) => {
                                  const leafEl =
                                      domRange.startContainer.parentElement!;
                        leafEl.getBoundingClientRect =
                                      domRange.getBoundingClientRect.bind(
                                          domRange
                                      );
                        leafEl.scrollIntoView({
                            behavior: 'instant',
                            block: 'start',
                            inline: 'center',
                        });
                        delete leafEl.getBoundingClientRect;
                              }
                            : undefined
                    }
                />
            </Slate>
        </div>
    );
};

export default RichTextEditor;
