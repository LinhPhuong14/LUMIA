import { Node, mergeAttributes } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";

/**
 * Ảnh kèm chú thích, lưu ra đúng `<figure><img><figcaption>`.
 *
 * Vì sao cần node riêng thay vì dùng thẳng `@tiptap/extension-image`: extension
 * đó chỉ đẻ ra một thẻ `<img>` trần. Nội dung gốc của LUMIA gần như ảnh nào
 * cũng có một dòng chú thích bên dưới ("Ảnh: Internet", "Chọn nệm phù hợp
 * đem lại giấc ngủ chất lượng"), mà nhét dòng đó thành `<p>` riêng thì nó là
 * một khối rời: kéo ảnh đi chỗ khác là chú thích ở lại, và trình đọc màn hình
 * lẫn Google đều không biết đoạn text ấy thuộc về ảnh nào.
 *
 * `content: "inline*"` khiến figcaption thành vùng soạn thảo thật — bấm vào là
 * gõ được, không cần popup. `isolating` chặn con trỏ nhảy ra ngoài khi xoá lùi
 * giữa chú thích, còn `draggable` cho phép kéo cả cụm ảnh + chú thích như một
 * khối duy nhất.
 */

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    figure: {
      /** Chèn một figure mới; con trỏ nhảy vào vùng chú thích để gõ luôn. */
      setFigure: (options: { src: string; alt?: string; caption?: string }) => ReturnType;
    };
  }
}

export const Figure = Node.create({
  name: "figure",
  group: "block",
  content: "inline*",
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      src: { default: null as string | null },
      alt: { default: null as string | null },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
        // Chú thích nằm trong figcaption, phần còn lại của figure (thẻ img) là
        // attribute chứ không phải nội dung soạn thảo.
        contentElement: "figcaption",
        getAttrs: (element) => {
          const img = (element as HTMLElement).querySelector("img");
          if (!img) return false;
          return { src: img.getAttribute("src"), alt: img.getAttribute("alt") };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, ...rest } = HTMLAttributes as Record<string, unknown>;
    return [
      "figure",
      mergeAttributes(rest),
      ["img", { src, alt: alt ?? "" }],
      ["figcaption", 0],
    ];
  },

  addCommands() {
    return {
      setFigure:
        ({ src, alt, caption }) =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: this.name,
              attrs: { src, alt: alt ?? caption ?? "" },
              content: caption ? [{ type: "text", text: caption }] : [],
            })
            // Không có bước này thì con trỏ đứng NGOÀI figure sau khi chèn, và
            // chữ gõ tiếp theo rơi vào đoạn văn phía trên thay vì vào chú thích.
            // Phải dò lại vị trí figure vừa chèn chứ không trừ lùi vài đơn vị
            // từ selection: độ lệch đó phụ thuộc vào khối đang đứng trước nó
            // nên có lúc đúng có lúc trượt.
            .command(({ tr, dispatch }) => {
              if (!dispatch) return true;
              let figurePos: number | null = null;
              tr.doc.nodesBetween(
                Math.max(0, tr.selection.from - 400),
                tr.selection.to,
                (node, pos) => {
                  if (node.type.name === "figure") figurePos = pos;
                },
              );
              if (figurePos === null) return true;
              const node = tr.doc.nodeAt(figurePos);
              if (!node) return true;
              // +1 để vào trong figure, + content.size để đứng ở cuối chú thích
              tr.setSelection(TextSelection.create(tr.doc, figurePos + 1 + node.content.size));
              return true;
            })
            .run(),
    };
  },
});
