"use client";

import { useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

// ─── Toolbar ─────────────────────────────────────────────────────────────────

function ToolbarBtn({
  active, title, onClick, children,
}: {
  active?: boolean; title: string; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className={`flex h-7 min-w-7 items-center justify-center rounded-[6px] px-1.5 text-[13px] transition
        ${active
          ? "bg-[var(--green-wash)] font-semibold text-[var(--green-deep)]"
          : "text-[var(--muted)] hover:bg-[var(--surface-warm)] hover:text-[var(--foreground)]"
        }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-[var(--border)]" />;
}

// ─── Main component ───────────────────────────────────────────────────────────

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  minHeight?: number;
}

export function RichEditor({ value, onChange, onImageUpload, placeholder = "Bắt đầu viết...", minHeight = 320 }: RichEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
      Image.configure({ allowBase64: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "outline-none prose prose-sm max-w-none leading-relaxed",
        "data-placeholder": placeholder,
      },
    },
  });

  const insertImage = useCallback(async (file: File) => {
    if (!editor) return;
    let src: string;
    if (onImageUpload) {
      src = await onImageUpload(file);
    } else {
      src = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
    editor.chain().focus().setImage({ src }).run();
  }, [editor, onImageUpload]);

  const insertImageFromUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Nhập URL hình ảnh:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const handleDocx = useCallback(async (file: File) => {
    if (!editor) return;
    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      editor.chain().focus().insertContent(result.value).run();
    } catch {
      alert("Không thể đọc file DOCX. Thử lại.");
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL liên kết:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--surface-card)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--border)] bg-[var(--surface-warm)] px-2 py-1.5">
        {/* Headings */}
        <select
          value={
            editor.isActive("heading", { level: 1 }) ? "1"
              : editor.isActive("heading", { level: 2 }) ? "2"
              : editor.isActive("heading", { level: 3 }) ? "3"
              : "0"
          }
          onChange={e => {
            const v = Number(e.target.value);
            if (v === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().setHeading({ level: v as 1 | 2 | 3 }).run();
          }}
          className="h-7 rounded-[6px] border border-[var(--border)] bg-[var(--surface-card)] px-1.5 text-[12px] text-[var(--muted)] outline-none"
        >
          <option value="0">Đoạn văn</option>
          <option value="1">Tiêu đề 1</option>
          <option value="2">Tiêu đề 2</option>
          <option value="3">Tiêu đề 3</option>
        </select>

        <Divider />

        <ToolbarBtn active={editor.isActive("bold")} title="Đậm (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive("italic")} title="Nghiêng (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive("underline")} title="Gạch dưới (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span style={{ textDecoration: "underline" }}>U</span>
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive("strike")} title="Gạch ngang" onClick={() => editor.chain().focus().toggleStrike().run()}>
          <s>S</s>
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn active={editor.isActive("highlight")} title="Tô sáng" onClick={() => editor.chain().focus().toggleHighlight().run()}>
          <span style={{ background: "#fef08a", borderRadius: 2, padding: "0 2px" }}>H</span>
        </ToolbarBtn>

        {/* Text color */}
        <label title="Màu chữ" className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] hover:bg-[var(--surface-warm)]">
          <span className="font-bold text-[13px]" style={{ color: editor.getAttributes("textStyle").color ?? "currentcolor" }}>A</span>
          <input type="color" className="absolute h-0 w-0 opacity-0"
            onChange={e => editor.chain().focus().setColor(e.target.value).run()} />
        </label>

        <Divider />

        <ToolbarBtn active={editor.isActive({ textAlign: "left" })} title="Canh trái" onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          ≡
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive({ textAlign: "center" })} title="Canh giữa" onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          ☰
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive({ textAlign: "right" })} title="Canh phải" onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          ≡
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn active={editor.isActive("bulletList")} title="Danh sách gạch đầu dòng" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          •≡
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive("orderedList")} title="Danh sách đánh số" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1≡
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive("blockquote")} title="Trích dẫn" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          "
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive("code")} title="Code inline" onClick={() => editor.chain().focus().toggleCode().run()}>
          {"<>"}
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn active={editor.isActive("link")} title="Thêm liên kết" onClick={setLink}>
          🔗
        </ToolbarBtn>

        <ToolbarBtn active={false} title="Chèn ảnh từ URL" onClick={insertImageFromUrl}>
          🖼
        </ToolbarBtn>

        <ToolbarBtn active={false} title="Upload ảnh" onClick={() => fileInputRef.current?.click()}>
          📷
        </ToolbarBtn>

        <ToolbarBtn active={false} title="Import DOCX" onClick={() => docxInputRef.current?.click()}>
          <span className="text-[11px] font-semibold">DOCX</span>
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn active={false} title="Hoàn tác (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()}>
          ↩
        </ToolbarBtn>
        <ToolbarBtn active={false} title="Làm lại (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()}>
          ↪
        </ToolbarBtn>
      </div>

      {/* Editor area */}
      <div
        className="relative px-5 py-4"
        style={{ minHeight }}
        onClick={() => editor.commands.focus()}
      >
        {editor.isEmpty && (
          <p className="pointer-events-none absolute left-5 top-4 text-[14px] text-[var(--muted)]/40 select-none">
            {placeholder}
          </p>
        )}
        <EditorContent
          editor={editor}
          className="text-[14px] leading-relaxed text-[var(--foreground)] [&_.ProseMirror]:outline-none"
        />
      </div>

      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) void insertImage(f); e.target.value = ""; }} />
      <input ref={docxInputRef} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) void handleDocx(f); e.target.value = ""; }} />
    </div>
  );
}
