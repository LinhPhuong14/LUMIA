"use client";

import { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Code2, GripVertical, Highlighter,
  Image as ImageIcon, Italic, Link2, List, ListOrdered, Plus, Quote, Redo2,
  Strikethrough, Table as TableIcon, Trash2, Underline as UnderlineIcon, Undo2,
} from "lucide-react";

import { Figure } from "@/components/admin/editor/figure";
import { SlashCommand, type SlashActions } from "@/components/admin/editor/slash-command";

// ─── Toolbar primitives ───────────────────────────────────────────────────────

function ToolbarBtn({
  active, title, onClick, children,
}: {
  active?: boolean; title: string; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      // mousedown + preventDefault: click sẽ làm editor mất selection trước khi
      // lệnh chạy, nên nút định dạng bấm vào là mất chỗ đang bôi đen.
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`flex h-7 min-w-7 items-center justify-center rounded-[6px] px-1.5 text-[13px] transition ${
        active
          ? "bg-[var(--green-wash)] font-semibold text-[var(--green-deep)]"
          : "text-[var(--muted)] hover:bg-[var(--surface-warm)] hover:text-[var(--foreground)]"
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="mx-1 h-5 w-px bg-[var(--border)]" />;
}

const BLOCK_OPTIONS = [
  { value: "p", label: "Đoạn văn" },
  { value: "1", label: "Tiêu đề 1" },
  { value: "2", label: "Tiêu đề 2" },
  { value: "3", label: "Tiêu đề 3" },
  { value: "quote", label: "Trích dẫn" },
  { value: "code", label: "Khối mã" },
] as const;

function currentBlock(editor: Editor): string {
  if (editor.isActive("heading", { level: 1 })) return "1";
  if (editor.isActive("heading", { level: 2 })) return "2";
  if (editor.isActive("heading", { level: 3 })) return "3";
  if (editor.isActive("blockquote")) return "quote";
  if (editor.isActive("codeBlock")) return "code";
  return "p";
}

function applyBlock(editor: Editor, value: string) {
  const c = editor.chain().focus();
  if (value === "quote") return c.toggleBlockquote().run();
  if (value === "code") return c.toggleCodeBlock().run();
  if (value === "p") return c.setParagraph().run();
  return c.setHeading({ level: Number(value) as 1 | 2 | 3 }).run();
}

// ─── Main component ───────────────────────────────────────────────────────────

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  minHeight?: number;
}

export function RichEditor({
  value,
  onChange,
  onImageUpload,
  placeholder = "Nhấn '/' để chèn khối, hoặc bắt đầu viết…",
  minHeight = 320,
}: RichEditorProps) {
  const [uploading, setUploading] = useState(false);

  /**
   * Mở hộp chọn file bằng một input dựng ngay lúc bấm, thay vì input ẩn cắm sẵn
   * trong cây DOM rồi giữ ref tới nó.
   *
   * Lý do không dùng ref: menu gạch chéo cần gọi được hàm này, mà nó phải nằm
   * trong danh sách extension — tức là được dựng trong lúc render. Đọc
   * `ref.current` từ đó là truy cập ref khi đang render, đúng thứ React
   * Compiler chặn. Nhận `editor` làm tham số cũng gỡ luôn vòng phụ thuộc: hàm
   * này không cần biết tới biến `editor` vốn chưa tồn tại lúc dựng extension.
   */
  const openFilePicker = useCallback((accept: string, onPick: (file: File) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (file) onPick(file);
    });
    input.click();
  }, []);

  const insertImage = useCallback(async (ed: Editor, file: File) => {
    setUploading(true);
    try {
      let src: string;
      if (onImageUpload) {
        src = await onImageUpload(file);
        if (!src) {
          alert("Tải ảnh lên thất bại. Thử lại.");
          return;
        }
      } else {
        src = await new Promise<string>((res) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
      ed.chain().focus().setFigure({ src, caption: "" }).run();
    } finally {
      setUploading(false);
    }
  }, [onImageUpload]);

  const pickImageFile = useCallback((ed: Editor) => {
    openFilePicker("image/jpeg,image/png,image/webp,image/gif", (file) => void insertImage(ed, file));
  }, [openFilePicker, insertImage]);

  const editor = useEditor({
    // Next dựng sẵn HTML ở server rồi hydrate, mà ProseMirror lại sửa DOM ngay
    // khi khởi tạo — không tắt render phía server thì hydration lệch.
    immediatelyRender: false,
    extensions: [
      // Link và Underline nằm sẵn trong StarterKit v3. Bản trước import thêm
      // hai extension đó nữa nên tiptap báo trùng tên; cấu hình xuyên qua
      // StarterKit vừa hết trùng vừa giữ nguyên tuỳ chọn.
      StarterKit.configure({
        link: { openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } },
        codeBlock: { HTMLAttributes: { class: "rounded-[10px] bg-[var(--surface-warm)] p-3 text-[13px]" } },
      }),
      Highlight.configure({ multicolor: true }),
      Image.configure({ allowBase64: true }),
      Figure,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({ nested: true }),
      TableKit.configure({ table: { resizable: true } }),
      Placeholder.configure({
        // Chỉ gợi ý ở khối đang đứng con trỏ. Hiện trên mọi khối rỗng thì trang
        // đầy chữ mờ, đọc rối hơn là hữu ích.
        showOnlyCurrent: true,
        placeholder: ({ node }) =>
          node.type.name === "heading" ? "Tiêu đề…"
            : node.type.name === "figure" ? "Viết chú thích cho ảnh…"
            : placeholder,
      }),
      SlashCommand.configure({ actions: { pickImageFile } satisfies SlashActions }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "outline-none" },
    },
  });

  // Đổi bài đang sửa mà không đóng form thì `value` thay đổi nhưng editor vẫn
  // giữ nội dung cũ — bản trước chỉ nạp `value` đúng một lần lúc khởi tạo. So
  // với getHTML() trước khi ghi đè để không cắt ngang lúc người dùng đang gõ.
  useEffect(() => {
    if (!editor) return;
    const incoming = value || "";
    if (incoming !== editor.getHTML()) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
    // Chủ ý chỉ theo dõi `value`: thêm `editor` vào đây sẽ nạp lại nội dung mỗi
    // lần editor tạo lại instance và làm mất vị trí con trỏ.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const importDocx = useCallback((ed: Editor) => {
    openFilePicker(".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document", async (file) => {
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
        ed.chain().focus().insertContent(result.value).run();
      } catch {
        alert("Không thể đọc file DOCX. Thử lại.");
      }
    });
  }, [openFilePicker]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL liên kết:", prev ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const inTable = editor.isActive("table");

  return (
    <div className="overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--surface-card)]">
      {/* ── Thanh công cụ ── */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-0.5 border-b border-[var(--border)] bg-[var(--surface-warm)] px-2 py-1.5">
        <select
          value={currentBlock(editor)}
          onChange={(e) => applyBlock(editor, e.target.value)}
          className="h-7 rounded-[6px] border border-[var(--border)] bg-[var(--surface-card)] px-1.5 text-[12px] text-[var(--muted)] outline-none"
        >
          {BLOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <Sep />
        <ToolbarBtn active={editor.isActive("bold")} title="Đậm (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive("italic")} title="Nghiêng (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive("underline")} title="Gạch dưới (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive("strike")} title="Gạch ngang" onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive("highlight")} title="Tô sáng" onClick={() => editor.chain().focus().toggleHighlight().run()}><Highlighter className="h-3.5 w-3.5" /></ToolbarBtn>

        <label title="Màu chữ" className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-[6px] hover:bg-[var(--surface-warm)]">
          <span className="text-[13px] font-bold" style={{ color: (editor.getAttributes("textStyle").color as string) ?? "currentcolor" }}>A</span>
          <input type="color" className="absolute h-0 w-0 opacity-0"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} />
        </label>

        <Sep />
        <ToolbarBtn active={editor.isActive({ textAlign: "left" })} title="Canh trái" onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive({ textAlign: "center" })} title="Canh giữa" onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive({ textAlign: "right" })} title="Canh phải" onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight className="h-3.5 w-3.5" /></ToolbarBtn>

        <Sep />
        <ToolbarBtn active={editor.isActive("bulletList")} title="Danh sách chấm" onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive("orderedList")} title="Danh sách số" onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive("blockquote")} title="Trích dẫn" onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive("code")} title="Mã inline" onClick={() => editor.chain().focus().toggleCode().run()}><Code2 className="h-3.5 w-3.5" /></ToolbarBtn>

        <Sep />
        <ToolbarBtn active={editor.isActive("link")} title="Liên kết" onClick={setLink}><Link2 className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={false} title={uploading ? "Đang tải ảnh…" : "Chèn ảnh"} onClick={() => pickImageFile(editor)}><ImageIcon className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={false} title="Chèn bảng" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={false} title="Nhập từ file DOCX" onClick={() => importDocx(editor)}><span className="text-[10px] font-semibold">DOCX</span></ToolbarBtn>

        <Sep />
        <ToolbarBtn active={false} title="Hoàn tác (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()}><Undo2 className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={false} title="Làm lại (Ctrl+Shift+Z)" onClick={() => editor.chain().focus().redo().run()}><Redo2 className="h-3.5 w-3.5" /></ToolbarBtn>

        {/* Nút bảng chỉ hiện khi con trỏ đang trong bảng — bày sẵn thì thanh
            công cụ dài thêm mà 99% thời gian bấm vào không có tác dụng. */}
        {inTable && (
          <>
            <Sep />
            <ToolbarBtn active={false} title="Thêm cột" onClick={() => editor.chain().focus().addColumnAfter().run()}>+Cột</ToolbarBtn>
            <ToolbarBtn active={false} title="Thêm dòng" onClick={() => editor.chain().focus().addRowAfter().run()}>+Dòng</ToolbarBtn>
            <ToolbarBtn active={false} title="Xoá bảng" onClick={() => editor.chain().focus().deleteTable().run()}><Trash2 className="h-3.5 w-3.5" /></ToolbarBtn>
          </>
        )}

        <span className="ml-auto hidden pr-1 text-[11px] text-[var(--muted)] sm:block">
          Gõ <kbd className="rounded border border-[var(--border)] bg-[var(--surface-card)] px-1">/</kbd> để chèn khối
        </span>
      </div>

      {/* ── Vùng soạn thảo ── */}
      <div className="relative py-4 pl-12 pr-5" style={{ minHeight }}>
        {/* Tay cầm kéo thả: hiện khi rê chuột vào một khối, kéo để đổi thứ tự,
            nút + chèn đoạn mới ngay dưới. */}
        <DragHandle editor={editor} className="lumia-drag-handle flex items-center gap-0.5">
          <button type="button" title="Chèn khối bên dưới"
            onClick={() => editor.chain().focus().insertContentAt(editor.state.selection.to, { type: "paragraph" }).run()}
            className="flex h-6 w-5 items-center justify-center rounded-[5px] text-[var(--muted)] transition hover:bg-[var(--surface-warm)] hover:text-[var(--foreground)]">
            <Plus className="h-3.5 w-3.5" />
          </button>
          <span title="Kéo để đổi vị trí"
            className="flex h-6 w-5 cursor-grab items-center justify-center rounded-[5px] text-[var(--muted)] transition hover:bg-[var(--surface-warm)] hover:text-[var(--foreground)] active:cursor-grabbing">
            <GripVertical className="h-3.5 w-3.5" />
          </span>
        </DragHandle>

        {/* Thanh nổi khi bôi đen — định dạng nhanh mà không phải với lên toolbar */}
        <BubbleMenu editor={editor}
          className="flex items-center gap-0.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface-card)] p-1 shadow-lg">
          <ToolbarBtn active={editor.isActive("bold")} title="Đậm" onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-3.5 w-3.5" /></ToolbarBtn>
          <ToolbarBtn active={editor.isActive("italic")} title="Nghiêng" onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-3.5 w-3.5" /></ToolbarBtn>
          <ToolbarBtn active={editor.isActive("underline")} title="Gạch dưới" onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="h-3.5 w-3.5" /></ToolbarBtn>
          <ToolbarBtn active={editor.isActive("highlight")} title="Tô sáng" onClick={() => editor.chain().focus().toggleHighlight().run()}><Highlighter className="h-3.5 w-3.5" /></ToolbarBtn>
          <ToolbarBtn active={editor.isActive("link")} title="Liên kết" onClick={setLink}><Link2 className="h-3.5 w-3.5" /></ToolbarBtn>
        </BubbleMenu>

        <EditorContent editor={editor} className="lumia-doc text-[15px] leading-[1.75] text-[var(--foreground)]" />
      </div>
    </div>
  );
}
