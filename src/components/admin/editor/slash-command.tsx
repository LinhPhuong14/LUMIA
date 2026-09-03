"use client";

import { Extension, type Editor, type Range } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import {
  forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState,
} from "react";
import {
  Heading1, Heading2, Heading3, Image as ImageIcon, Link2, List, ListOrdered,
  ListTodo, Minus, Quote, Table as TableIcon, Code2, Type,
} from "lucide-react";

/**
 * Hành động duy nhất editor không tự làm được: mở hộp thoại chọn file của hệ
 * điều hành, vì input[type=file] nằm ở component cha.
 */
export type SlashActions = {
  pickImageFile: (editor: Editor) => void;
};

type Item = {
  title: string;
  hint: string;
  /** Từ khoá gõ tắt, có cả bản không dấu để gõ nhanh không cần bật tiếng Việt. */
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
  run: (ctx: { editor: Editor; range: Range; actions: SlashActions }) => void;
};

const ITEMS: Item[] = [
  {
    title: "Văn bản", hint: "Đoạn văn thường", keywords: ["text", "vanban", "van", "paragraph", "p"],
    icon: Type,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Tiêu đề lớn", hint: "Mục chính trong bài", keywords: ["h1", "heading", "tieude"],
    icon: Heading1,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run(),
  },
  {
    title: "Tiêu đề vừa", hint: "Mục phụ — dùng nhiều nhất", keywords: ["h2", "heading", "tieude"],
    icon: Heading2,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
  },
  {
    title: "Tiêu đề nhỏ", hint: "Mục con", keywords: ["h3", "heading", "tieude"],
    icon: Heading3,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
  },
  {
    title: "Danh sách chấm", hint: "Gạch đầu dòng", keywords: ["ul", "bullet", "danhsach", "cham"],
    icon: List,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Danh sách số", hint: "Đánh số 1, 2, 3", keywords: ["ol", "number", "danhsach", "so"],
    icon: ListOrdered,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Danh sách việc", hint: "Ô tích chọn", keywords: ["todo", "task", "checklist", "viec", "danhsach"],
    icon: ListTodo,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: "Ảnh tải lên", hint: "Chọn ảnh từ máy", keywords: ["image", "anh", "hinh", "upload"],
    icon: ImageIcon,
    run: ({ editor, range, actions }) => {
      editor.chain().focus().deleteRange(range).run();
      actions.pickImageFile(editor);
    },
  },
  {
    title: "Ảnh từ URL", hint: "Dán link ảnh có sẵn", keywords: ["image", "anh", "url", "link"],
    icon: Link2,
    run: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const url = window.prompt("Dán URL ảnh:");
      if (url) editor.chain().focus().setFigure({ src: url, caption: "" }).run();
    },
  },
  {
    title: "Trích dẫn", hint: "Khối nhấn mạnh", keywords: ["quote", "trichdan", "blockquote"],
    icon: Quote,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Bảng", hint: "Bảng 3 cột có dòng tiêu đề", keywords: ["table", "bang"],
    icon: TableIcon,
    run: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    title: "Đường kẻ ngang", hint: "Ngăn cách hai phần", keywords: ["hr", "divider", "duongke"],
    icon: Minus,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: "Khối mã", hint: "Giữ nguyên định dạng", keywords: ["code", "khoima", "ma"],
    icon: Code2,
    run: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
];

/** Bỏ dấu để "tieu de" khớp được với "Tiêu đề". */
function deaccent(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();
}

function filterItems(query: string): Item[] {
  const q = deaccent(query.trim());
  if (!q) return ITEMS;
  return ITEMS.filter((item) => {
    const title = deaccent(item.title);
    // Khớp cả cụm, cả từng từ trong tên khối (gõ "vua" ra "Tiêu đề vừa"), và
    // các từ khoá viết liền.
    return title.includes(q)
      || title.split(" ").some((w) => w.startsWith(q))
      || item.keywords.some((k) => deaccent(k).includes(q));
  });
}

// ─── Popup ────────────────────────────────────────────────────────────────────

type MenuProps = {
  items: Item[];
  command: (item: Item) => void;
};
export type MenuHandle = { onKeyDown: (event: KeyboardEvent) => boolean };

const SlashMenu = forwardRef<MenuHandle, MenuProps>(function SlashMenu({ items, command }, ref) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => setActive(0), [items]);

  // Danh sách cuộn được, nên mục đang chọn phải tự kéo vào tầm nhìn khi đi bằng
  // phím mũi tên — không thì gõ mũi tên xuống một lúc là chọn "mù".
  useLayoutEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (!items.length) return false;
      if (event.key === "ArrowUp") {
        setActive((a) => (a + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setActive((a) => (a + 1) % items.length);
        return true;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        command(items[active]);
        return true;
      }
      return false;
    },
  }), [items, active, command]);

  if (!items.length) {
    return (
      <div className="w-[286px] rounded-[14px] border border-[var(--border)] bg-[var(--surface-card)] p-3 text-[12.5px] text-[var(--muted)] shadow-xl">
        Không có khối nào khớp
      </div>
    );
  }

  return (
    <div ref={listRef}
      className="max-h-[320px] w-[286px] overflow-y-auto rounded-[14px] border border-[var(--border)] bg-[var(--surface-card)] p-1.5 shadow-xl">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <button key={item.title} type="button" data-idx={idx}
            onMouseEnter={() => setActive(idx)}
            onMouseDown={(e) => { e.preventDefault(); command(item); }}
            className={`flex w-full items-center gap-2.5 rounded-[10px] px-2 py-1.5 text-left transition ${
              idx === active ? "bg-[var(--green-wash)]" : "hover:bg-[var(--surface-warm)]"
            }`}>
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border ${
              idx === active
                ? "border-[var(--green)]/40 text-[var(--green-deep)]"
                : "border-[var(--border)] text-[var(--muted)]"
            }`}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium text-[var(--foreground)]">{item.title}</span>
              <span className="block truncate text-[11px] text-[var(--muted)]">{item.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
});

// ─── Extension ────────────────────────────────────────────────────────────────

export const SlashCommand = Extension.create<{ actions: SlashActions }>({
  name: "slashCommand",

  addOptions() {
    return {
      actions: { pickImageFile: () => {} },
    };
  },

  addProseMirrorPlugins() {
    const getActions = () => this.options.actions;

    const suggestion: Omit<SuggestionOptions<Item>, "editor"> = {
      char: "/",
      // Dấu cách đóng menu. Cho phép khoảng trắng thì mọi dấu "/" giữa câu
      // (ngày tháng, "và/hoặc", URL) sẽ kéo popup đi theo hết phần còn lại của
      // câu. Đổi lại, từ khoá lọc phải viết liền ("tieude", "danhsach") — nhưng
      // gõ vài chữ đầu của bất kỳ từ nào trong tên khối là đã ra kết quả.
      allowSpaces: false,
      startOfLine: false,
      items: ({ query }) => filterItems(query),
      command: ({ editor, range, props }) => props.run({ editor, range, actions: getActions() }),

      render: () => {
        let renderer: ReactRenderer<MenuHandle, MenuProps> | null = null;
        let box: HTMLDivElement | null = null;

        const place = (rect: DOMRect | null | undefined) => {
          if (!box || !rect) return;
          const h = box.offsetHeight || 320;
          const w = box.offsetWidth || 286;
          // Lật lên trên khi gần đáy màn hình, và ghim trong khung nhìn theo
          // chiều ngang để menu không bị cắt ở mép phải.
          const top = window.innerHeight - rect.bottom < h + 16 ? rect.top - h - 8 : rect.bottom + 8;
          box.style.top = `${Math.max(8, top)}px`;
          box.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - w - 8))}px`;
        };

        return {
          onStart: (props) => {
            renderer = new ReactRenderer(SlashMenu, {
              props: { items: props.items, command: (item: Item) => props.command(item) },
              editor: props.editor,
            });
            box = document.createElement("div");
            box.style.position = "fixed";
            box.style.zIndex = "70";
            box.appendChild(renderer.element);
            document.body.appendChild(box);
            place(props.clientRect?.());
          },
          onUpdate: (props) => {
            renderer?.updateProps({ items: props.items, command: (item: Item) => props.command(item) });
            place(props.clientRect?.());
          },
          onKeyDown: (props) => {
            if (props.event.key === "Escape") return true;
            return renderer?.ref?.onKeyDown(props.event) ?? false;
          },
          onExit: () => {
            box?.remove();
            renderer?.destroy();
            box = null;
            renderer = null;
          },
        };
      },
    };

    return [Suggestion({ editor: this.editor, ...suggestion })];
  },
});
