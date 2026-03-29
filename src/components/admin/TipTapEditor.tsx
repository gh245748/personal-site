"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold, Italic, Strikethrough, Code, Heading2, Heading3,
  List, ListOrdered, Quote, Image as ImageIcon, Link as LinkIcon,
  Undo, Redo, Minus,
} from "lucide-react";
import { useEffect } from "react";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TipTapEditor({ content, onChange, placeholder = "Yazmaya başla..." }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose-custom min-h-[60vh] focus:outline-none px-2",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!editor) return null;

  const toolbarBtn = (action: () => void, Icon: React.ComponentType<{ size?: number }>, active = false) => (
    <button
      type="button"
      onClick={action}
      className={`p-1.5 rounded-sm transition-colors ${
        active
          ? "bg-amber/20 text-amber"
          : "text-[hsl(var(--muted))] hover:text-[#F0EDE4] hover:bg-[hsl(var(--surface))]"
      }`}
    >
      <Icon size={15} />
    </button>
  );

  const addImage = () => {
    const url = window.prompt("Görsel URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = window.prompt("Link URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border border-[hsl(var(--border))] rounded-sm bg-[hsl(var(--surface-2))] overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[hsl(var(--border))]">
        {toolbarBtn(() => editor.chain().focus().toggleBold().run(), Bold, editor.isActive("bold"))}
        {toolbarBtn(() => editor.chain().focus().toggleItalic().run(), Italic, editor.isActive("italic"))}
        {toolbarBtn(() => editor.chain().focus().toggleStrike().run(), Strikethrough, editor.isActive("strike"))}
        {toolbarBtn(() => editor.chain().focus().toggleCode().run(), Code, editor.isActive("code"))}
        <div className="w-px h-4 bg-[hsl(var(--border))] mx-1" />
        {toolbarBtn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), Heading2, editor.isActive("heading", { level: 2 }))}
        {toolbarBtn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), Heading3, editor.isActive("heading", { level: 3 }))}
        <div className="w-px h-4 bg-[hsl(var(--border))] mx-1" />
        {toolbarBtn(() => editor.chain().focus().toggleBulletList().run(), List, editor.isActive("bulletList"))}
        {toolbarBtn(() => editor.chain().focus().toggleOrderedList().run(), ListOrdered, editor.isActive("orderedList"))}
        {toolbarBtn(() => editor.chain().focus().toggleBlockquote().run(), Quote, editor.isActive("blockquote"))}
        {toolbarBtn(() => editor.chain().focus().setHorizontalRule().run(), Minus)}
        <div className="w-px h-4 bg-[hsl(var(--border))] mx-1" />
        {toolbarBtn(addImage, ImageIcon)}
        {toolbarBtn(addLink, LinkIcon, editor.isActive("link"))}
        <div className="w-px h-4 bg-[hsl(var(--border))] mx-1" />
        {toolbarBtn(() => editor.chain().focus().undo().run(), Undo)}
        {toolbarBtn(() => editor.chain().focus().redo().run(), Redo)}

        <div className="ml-auto text-xs text-[hsl(var(--muted))]" style={{ fontFamily: "var(--font-mono)" }}>
          {editor.storage.characterCount?.characters() ?? 0} karakter
        </div>
      </div>

      {/* Editor area */}
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
