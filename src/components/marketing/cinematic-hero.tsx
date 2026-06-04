"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MessageCircleHeart, NotebookPen, Sparkles } from "lucide-react";

const heroVideoUrl =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

const dashboardVideoUrl =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4";

const ritualCards = [
  {
    title: "Mở hộp",
    copy: "Bắt đầu bằng những vật phẩm nhỏ: ánh nến, hương thơm, thẻ nghi thức và cảm giác được chăm sóc.",
  },
  {
    title: "Ghi nhận cảm xúc",
    copy: "Chọn cảm xúc, mức độ cảm xúc và lý do khiến bạn thấy như vậy hôm nay.",
  },
  {
    title: "Đặt xuống một chút",
    copy: "Viết nhật ký, xả cảm xúc hoặc để LUMIA lắng nghe bạn vài phút.",
  },
] as const;

const boxCards = [
  {
    title: "Hộp LUMIA Khởi đầu",
    price: "390.000đ",
    copy: "Dành cho những ai muốn bắt đầu thật nhẹ.",
    access: "Ghi nhận cảm xúc cơ bản, nhật ký mở đầu và không gian lắng nghe dịu nhẹ.",
  },
  {
    title: "Hộp LUMIA Mỗi ngày",
    price: "890.000đ",
    copy: "Dành cho người muốn duy trì một nghi thức cảm xúc mỗi ngày.",
    access: "Nhật ký không giới hạn, lịch sử cảm xúc 30 ngày và gợi ý dịu nhẹ hơn theo thói quen.",
  },
  {
    title: "Hộp LUMIA Dịu sâu",
    price: "2.390.000đ",
    copy: "Dành cho trải nghiệm đầy đủ hơn với AI lắng nghe và nhật ký cá nhân hóa.",
    access: "LUMIA lắng nghe sâu hơn, lịch sử cảm xúc dài hơn và gợi ý chiêm nghiệm cá nhân hóa.",
  },
  {
    title: "Hộp LUMIA Quà tặng",
    price: "1.290.000đ",
    copy: "Một món quà dịu dàng cho người bạn thương.",
    access: "Mở khóa bằng mã quà tặng và tạo một không gian riêng tư cho người nhận.",
  },
] as const;

const promptCards = [
  "Hôm nay điều gì khiến bạn mệt?",
  "Bạn đang cần điều gì ngay lúc này?",
  "Nếu cảm xúc này có màu sắc, nó là màu gì?",
  "Có điều gì bạn muốn đặt xuống không?",
] as const;

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 26 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.78, ease: [0.22, 1, 0.36, 1], delay },
  } as const;
}

export function CinematicHero() {
  return (
    <div className="overflow-hidden bg-[linear-gradient(180deg,#FFFEFA_0%,#FFFDF5_38%,#FFFEFA_100%)]">
      <section className="relative min-h-screen overflow-hidden px-6 py-12 md:px-12 lg:px-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(248,231,161,0.26),transparent_22%),radial-gradient(circle_at_84%_16%,rgba(184,207,166,0.22),transparent_24%)]" />
        <div className="shell relative grid min-h-[calc(100vh-4rem)] items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div {...fadeUp()} className="max-w-2xl">
            <span className="eyebrow">Nghi thức chăm sóc dịu dàng</span>
            <h1 className="mt-8 font-serif text-6xl leading-[0.94] tracking-[-0.05em] text-foreground md:text-7xl xl:text-[6.4rem]">
              Một nghi thức dịu dàng cho những ngày bạn cần nhẹ lại.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-muted md:text-xl">
              LUMIA kết hợp hộp nghi thức vật lý và không gian số giúp bạn ghi nhận cảm xúc, xả tâm trạng và trò chuyện cùng một AI biết lắng nghe.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/boxes" className="button-primary magnetic-hover px-8 py-4">
                Khám phá hộp LUMIA
              </Link>
              <Link href="/dashboard" className="button-secondary magnetic-hover px-8 py-4">
                Xem không gian của bạn
              </Link>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.08)} className="relative mx-auto w-full max-w-[720px]">
            <div className="absolute left-1/2 top-12 h-56 w-56 -translate-x-1/2 rounded-full bg-[#F4D878]/35 blur-3xl animate-breathe-glow" />
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
              className="relative overflow-hidden rounded-[42px] border border-white/70 bg-white/76 p-5 shadow-[0_24px_80px_rgba(244,216,120,0.22)] backdrop-blur-xl"
            >
              <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-30" src={heroVideoUrl} />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,254,250,0.86),rgba(255,253,245,0.64),rgba(221,232,210,0.28))]" />
              <div className="relative">
                <Image
                  src="/assets/boxes-editorial.svg"
                  alt="Hộp LUMIA trên nền lụa trắng"
                  width={1400}
                  height={960}
                  className="h-[34rem] w-full rounded-[34px] object-cover"
                  priority
                />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 8.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-2 top-16 rounded-[28px] border border-white/70 bg-white/86 px-5 py-4 shadow-[0_16px_44px_rgba(143,168,120,0.12)]"
            >
              <div className="text-xs uppercase tracking-[0.24em] text-muted">Thẻ nghi thức</div>
              <div className="mt-2 font-serif text-2xl text-matcha-deep">Đi chậm lại một chút thôi.</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-1 bottom-16 rounded-full border border-white/70 bg-white/86 px-5 py-3 shadow-[0_18px_44px_rgba(244,216,120,0.18)]"
            >
              <span className="text-sm text-matcha-deep">Ánh nến • lụa trắng • lá matcha</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-28 md:px-12 lg:px-20">
        <div className="shell grid gap-12 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
          <motion.div {...fadeUp()} className="max-w-2xl">
            <span className="eyebrow">LUMIA là gì</span>
            <h2 className="mt-6 font-serif text-5xl leading-[1.02] tracking-[-0.05em] text-matcha-deep md:text-6xl">
              Không phải một ứng dụng phải dùng mỗi ngày. LUMIA là một nơi để bạn quay về khi cần dịu lại.
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted">
              Một chiếc hộp nhỏ cho buổi tối. Một không gian riêng để ghi nhận cảm xúc. Một nơi để viết ra điều đang nặng trong lòng. Và một AI chỉ lắng nghe, không phán xét.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Hộp LUMIA", src: "/assets/boxes-editorial.svg" },
              { title: "Trang nhật ký", src: "/assets/auth-ritual-portrait.svg" },
              { title: "Màn hình không gian riêng", src: "/assets/hero-dashboard.svg" },
            ].map((item, index) => (
              <motion.article key={item.title} {...fadeUp(index * 0.08)} className="soft-card overflow-hidden p-3">
                <Image src={item.src} alt={item.title} width={900} height={1200} className="h-72 w-full rounded-[24px] object-cover" />
                <div className="px-2 pb-2 pt-4 font-serif text-2xl text-matcha-deep">{item.title}</div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-28 md:px-12 lg:px-20">
        <div className="shell">
          <motion.div {...fadeUp()} className="max-w-2xl">
            <span className="eyebrow">Cách LUMIA đồng hành</span>
            <h2 className="mt-6 font-serif text-5xl leading-[1.02] tracking-[-0.05em] text-matcha-deep md:text-6xl">
              Mọi thứ đều bắt đầu từ những việc rất nhỏ.
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-6 xl:grid-cols-3">
            {ritualCards.map((card, index) => (
              <motion.article key={card.title} {...fadeUp(index * 0.08)} whileHover={{ y: -6 }} className="soft-card p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#FFFDF5,#DDE8D2)] text-matcha-deep shadow-[0_14px_34px_rgba(143,168,120,0.12)]">
                  {index === 0 ? <Sparkles className="h-5 w-5" /> : index === 1 ? <CheckCircle2 className="h-5 w-5" /> : <MessageCircleHeart className="h-5 w-5" />}
                </div>
                <h3 className="mt-6 font-serif text-4xl text-matcha-deep">{card.title}</h3>
                <p className="mt-4 text-base leading-7 text-muted">{card.copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-28 md:px-12 lg:px-20">
        <div className="shell">
          <motion.div {...fadeUp()} className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="eyebrow">Hộp LUMIA</span>
              <h2 className="mt-6 font-serif text-5xl leading-[1.02] tracking-[-0.05em] text-matcha-deep md:text-6xl">
                Chọn chiếc hộp phù hợp với nhịp chăm sóc của bạn.
              </h2>
            </div>
            <Link href="/boxes" className="button-secondary magnetic-hover px-7 py-4">
              Xem tất cả hộp
            </Link>
          </motion.div>

          <div className="mt-12 -mx-6 flex snap-x gap-5 overflow-x-auto px-6 pb-4">
            {boxCards.map((box, index) => (
              <motion.article
                key={box.title}
                whileHover={{ y: -6, rotate: index % 2 === 0 ? -1 : 1 }}
                className={`min-w-[310px] max-w-[310px] snap-center rounded-[34px] border bg-white/84 p-5 shadow-[0_20px_60px_rgba(244,216,120,0.14)] ${
                  index === 1 ? "border-champagne/80" : "border-white/70"
                }`}
              >
                <div className="rounded-[28px] bg-[linear-gradient(145deg,rgba(255,254,250,0.96),rgba(255,253,245,0.9),rgba(255,243,199,0.45))] p-4">
                  <Image src="/assets/boxes-editorial.svg" alt={box.title} width={1200} height={900} className="h-52 w-full rounded-[22px] object-cover" />
                </div>
                <h3 className="mt-5 font-serif text-3xl text-matcha-deep">{box.title}</h3>
                <p className="mt-2 text-sm font-medium text-matcha-deep">{box.price}</p>
                <p className="mt-3 text-sm leading-6 text-muted">{box.copy}</p>
                <p className="mt-4 text-sm leading-6 text-muted">{box.access}</p>
                <Link href="/boxes" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-matcha-deep">
                  Xem chi tiết <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-28 md:px-12 lg:px-20" id="khong-gian-rieng">
        <div className="shell grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
          <motion.div {...fadeUp()} className="max-w-xl">
            <span className="eyebrow">Không gian riêng</span>
            <h2 className="mt-6 font-serif text-5xl leading-[1.02] tracking-[-0.05em] text-matcha-deep md:text-6xl">
              Không gian của bạn, nhưng không giống một bảng số liệu.
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted">
              LUMIA không bắt bạn phải phân tích bản thân. Giao diện chỉ hỏi nhẹ: hôm nay bạn đang cảm thấy thế nào, bạn muốn viết ra điều gì, hay bạn cần được lắng nghe một chút?
            </p>
            <Link href="/dashboard" className="button-primary magnetic-hover mt-8 px-8 py-4">
              Xem không gian của bạn
            </Link>
          </motion.div>

          <motion.div {...fadeUp(0.08)} className="soft-card overflow-hidden p-4">
            <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/72">
              <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-20" src={dashboardVideoUrl} />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,254,250,0.92),rgba(255,253,245,0.86),rgba(221,232,210,0.48))]" />
              <div className="relative p-6">
                <div className="rounded-[24px] border border-white/70 bg-white/88 p-5 shadow-[0_16px_44px_rgba(143,168,120,0.08)]">
                  <div className="text-sm text-muted">Chào buổi tối, Linh.</div>
                  <h3 className="mt-3 font-serif text-3xl text-matcha-deep">Hôm nay bạn muốn bắt đầu từ đâu?</h3>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {["Bình yên", "Mệt", "Lo", "Buồn", "Căng", "Trống rỗng"].map((item) => (
                      <span key={item} className="rounded-full border border-matcha-soft bg-white px-4 py-2 text-sm text-matcha-deep">
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[22px] bg-[#FFFDF5] p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-muted">Gợi ý hôm nay</div>
                      <p className="mt-3 text-sm leading-6 text-matcha-deep">Xả cảm xúc trong 3 phút rồi viết một dòng cho mình.</p>
                    </div>
                    <div className="rounded-[22px] bg-[#FFFEFA] p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-muted">Viết nhanh</div>
                      <p className="mt-3 text-sm leading-6 text-matcha-deep">Điều gì khiến bạn thấy nặng nhất lúc này?</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[22px] bg-[#DDE8D2] px-4 py-4 text-sm leading-6 text-matcha-deep">
                    “Hôm nay bạn muốn LUMIA lắng nghe điều gì?”
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-28 md:px-12 lg:px-20">
        <div className="shell">
          <motion.div {...fadeUp()} className="soft-card p-8 md:p-10">
            <span className="eyebrow">LUMIA lắng nghe</span>
            <h2 className="mt-6 font-serif text-5xl leading-[1.02] tracking-[-0.05em] text-matcha-deep md:text-6xl">
              LUMIA lắng nghe, không phán xét.
            </h2>

            <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <motion.div {...fadeUp(0.05)} className="max-w-[78%] rounded-[28px] bg-[#FFFDF5] px-5 py-4 text-sm leading-7 text-matcha-deep">
                  Hôm nay bạn muốn LUMIA lắng nghe điều gì?
                </motion.div>
                <motion.div {...fadeUp(0.12)} className="ml-auto max-w-[80%] rounded-[28px] bg-[#DDE8D2] px-5 py-4 text-sm leading-7 text-matcha-deep">
                  Mình thấy hơi quá tải nhưng không biết nên bắt đầu từ đâu.
                </motion.div>
                <motion.div {...fadeUp(0.18)} className="max-w-[86%] rounded-[28px] bg-white px-5 py-4 text-sm leading-7 text-matcha-deep shadow-[0_14px_34px_rgba(143,168,120,0.08)]">
                  Mình nghe thấy hôm nay bạn đang phải giữ khá nhiều thứ trong lòng. Bạn muốn kể thêm một chút về điều nặng nhất không?
                </motion.div>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/82 p-6">
                <p className="text-sm leading-6 text-muted">LUMIA không thay thế chuyên gia y tế hoặc chuyên gia tâm lý.</p>
                <div className="mt-6 flex items-center gap-3 rounded-[24px] bg-[#FFFDF5] px-4 py-4 text-sm text-matcha-deep">
                  <MessageCircleHeart className="h-4 w-4" />
                  Một không gian hỗ trợ cảm xúc nhẹ nhàng và riêng tư.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-28 md:px-12 lg:px-20">
        <div className="shell grid gap-8 lg:grid-cols-[1.04fr_0.96fr]">
          <motion.div {...fadeUp()} className="hero-card p-8 md:p-10">
            <span className="eyebrow">Nhật ký / Xả cảm xúc</span>
            <h2 className="mt-6 font-serif text-5xl leading-[1.02] tracking-[-0.05em] text-matcha-deep md:text-6xl">
              Cứ viết ra. Không cần đúng. Không cần hay.
            </h2>
            <div className="mt-8 rounded-[34px] border border-white/70 bg-white/86 p-6">
              <div className="text-sm text-muted">Hôm nay có điều gì bạn muốn đặt xuống không?</div>
              <div className="mt-10 min-h-56 text-base leading-8 text-muted">Mình mệt vì đã phải cố ổn suốt cả ngày...</div>
            </div>
            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="text-sm text-muted">Bạn đã đặt cảm xúc này xuống một chút rồi.</p>
              <button type="button" className="button-primary magnetic-hover">
                Xả đi
              </button>
            </div>
          </motion.div>

          <div className="grid gap-4">
            {promptCards.map((prompt, index) => (
              <motion.article key={prompt} {...fadeUp(index * 0.06)} whileHover={{ y: -4 }} className="soft-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#FFFDF5,#DDE8D2)] text-matcha-deep">
                    <NotebookPen className="h-4 w-4" />
                  </div>
                  <p className="text-base leading-7 text-matcha-deep">{prompt}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center px-6 py-24 md:px-12 lg:px-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(248,231,161,0.24),transparent_20%),radial-gradient(circle_at_80%_70%,rgba(184,207,166,0.18),transparent_22%)]" />
        <div className="shell relative">
          <div className="hero-card relative overflow-hidden px-8 py-20 text-center md:px-16">
            <div className="absolute left-1/2 top-16 h-40 w-40 -translate-x-1/2 rounded-full bg-[#F4D878]/26 blur-3xl animate-breathe-glow" />
            <div className="absolute left-1/2 top-24 h-52 w-64 -translate-x-1/2 rounded-[42px] bg-[linear-gradient(145deg,#DDE8D2,#FFF3C7)] shadow-[0_36px_100px_rgba(244,216,120,0.22)]" />
            <div className="relative pt-64">
              <motion.div {...fadeUp()} className="mx-auto max-w-3xl">
                <span className="eyebrow">Bắt đầu tối nay</span>
                <h2 className="mt-6 font-serif text-5xl leading-[1.02] tracking-[-0.05em] text-matcha-deep md:text-6xl">
                  Tối nay, mình bắt đầu nhẹ hơn một chút.
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">
                  Chọn hộp LUMIA phù hợp và mở không gian chăm sóc cảm xúc của riêng bạn.
                </p>
              </motion.div>

              <motion.div {...fadeUp(0.08)} className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link href="/boxes" className="button-primary magnetic-hover px-8 py-4">
                  Khám phá hộp LUMIA
                </Link>
                <Link href="/register" className="button-secondary magnetic-hover px-8 py-4">
                  Bắt đầu miễn phí
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
