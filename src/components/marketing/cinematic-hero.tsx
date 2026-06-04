"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircleHeart,
  NotebookPen,
  Sparkles,
} from "lucide-react";

const heroVideoSources = [
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4",
] as const;

const ritualCards = [
  {
    title: "Mở hộp",
    copy: "Bắt đầu bằng ánh nến, thẻ ritual và cảm giác được chăm sóc vừa đủ.",
    icon: Sparkles,
  },
  {
    title: "Check-in cảm xúc",
    copy: "Chọn mood, mức độ và lý do theo cách nhẹ nhàng, không áp lực.",
    icon: CheckCircle2,
  },
  {
    title: "Đặt xuống một chút",
    copy: "Viết ra hoặc để LUMIA lắng nghe bạn thêm vài phút trước khi nghỉ ngơi.",
    icon: MessageCircleHeart,
  },
] as const;

const boxCards = [
  {
    title: "Hộp LUMIA Khởi đầu",
    price: "x.000đ",
    copy: "Bắt đầu thật nhẹ với ritual cơ bản và không gian riêng đầu tiên.",
  },

  {
    title: "Hộp LUMIA Dịu sâu",
    price: "x.000đ",
    copy: "Mở thêm nhiều lớp trải nghiệm riêng tư và cá nhân hóa hơn.",
  },
  {
    title: "Hộp LUMIA Dịu sâu",
    price: "x.000đ",
    copy: "Mở thêm nhiều lớp trải nghiệm riêng tư và cá nhân hóa hơn.",
  },
] as const;

const testimonials = [
  {
    quote:
      "Lần đầu tiên trong nhiều tháng mình ngủ được thật sự. Cái nghi thức nhỏ đó đã thay đổi cả buổi tối của mình.",
    tag: "Hộp Khởi đầu",
  },
  {
    quote:
      "Mình không ngờ là chỉ cần viết ra vài dòng mà lòng nhẹ đến vậy. LUMIA như người bạn không phán xét.",
    tag: "Workspace",
  },
  {
    quote:
      "Cái hộp đến tay mình vào đúng một tuần rất khó. Mình đã khóc và cảm ơn vì điều đó.",
    tag: "Hộp Dịu sâu",
  },
  {
    quote:
      "AI của LUMIA lắng nghe theo cách mình chưa từng thấy ở bất kỳ app nào. Nó không cố sửa mình.",
    tag: "LUMIA lắng nghe",
  },
  {
    quote:
      "Từ khi có LUMIA, buổi tối của mình có một cái neo. Mình biết mình sẽ dừng lại ở đâu đó trong ngày.",
    tag: "Hộp Mỗi ngày",
  },
  {
    quote:
      "Mình mua tặng bạn thân và nó nhắn lại rằng đó là món quà ý nghĩa nhất năm nay.",
    tag: "Hộp Quà tặng",
  },
  {
    quote:
      "Nhật ký LUMIA giúp mình nhìn lại cảm xúc theo tuần. Mình thấy rõ mình hơn rất nhiều.",
    tag: "Workspace",
  },
  {
    quote:
      "Hương thơm trong hộp, ánh nến nhỏ — những thứ tưởng vô nghĩa lại tạo ra sự khác biệt thật sự.",
    tag: "Hộp Dịu sâu",
  },
  {
    quote:
      "Mình đã từng nghĩ mình không cần được lắng nghe. Bây giờ mình biết mình đã sai.",
    tag: "LUMIA lắng nghe",
  },
] as const;

const col1 = testimonials.slice(0, 3);
const col2 = testimonials.slice(3, 6);
const col3 = testimonials.slice(6, 9);

const cardShadow =
  "0px 0px 0px 1px rgba(14,63,126,0.04), 0px 1px 1px -0.5px rgba(42,51,69,0.04), 0px 3px 3px -1.5px rgba(42,51,70,0.04), 0px 6px 6px -3px rgba(42,51,70,0.04), 0px 12px 12px -6px rgba(14,63,126,0.04), 0px 24px 24px -12px rgba(14,63,126,0.04)";

function TestimonialCard({ quote, tag }: { quote: string; tag: string }) {
  return (
    <div
      className="rounded-3xl bg-white p-6 mb-4 flex-shrink-0"
      style={{ boxShadow: cardShadow }}
    >
      <p className="font-serif text-xl font-medium leading-relaxed tracking-wide text-foreground/80 mb-4 text-pretty">
        "{quote}"
      </p>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-foreground">Khách hàng LUMIA</p>
          <p className="text-xs text-muted-foreground">Việt Nam</p>
        </div>
        <span className="text-xs tracking-wide text-primary/70 bg-primary/5 px-2 py-1 rounded-full whitespace-nowrap">
          {tag}
        </span>
      </div>
    </div>
  );
}

function ScrollColumn({
  items,
  direction,
}: {
  items: typeof col1;
  direction: "up" | "down";
}) {
  const animClass =
    direction === "up"
      ? "animate-scroll-up hover:animate-scroll-up-slow"
      : "animate-scroll-down hover:animate-scroll-down-slow";

  return (
    <div className="relative overflow-hidden">
      <div className={animClass}>
        {[...items, ...items].map((t, i) => (
          <TestimonialCard key={i} quote={t.quote} tag={t.tag} />
        ))}
      </div>
    </div>
  );
}
function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.22 },
    transition: { duration: 0.78, ease: [0.22, 1, 0.36, 1], delay },
  } as const;
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <motion.div {...fadeUp()} className="relative z-[1] max-w-2xl">
      <span className="eyebrow">{eyebrow}</span>

      <h2 className="mt-5 font-serif text-[3.1rem] leading-[0.96] tracking-[-0.05em] text-matcha-deep md:text-[4.3rem] lg:text-[4.8rem]">
        {title}
      </h2>

      {body ? (
        <p className="mt-5 max-w-xl text-base leading-7 text-muted md:text-lg">
          {body}
        </p>
      ) : null}
    </motion.div>
  );
}

function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);

  const [videoSourceIndex, setVideoSourceIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const fadeDuration = 0.5;
    let active = true;

    const startPlayback = async () => {
      try {
        await video.play();
      } catch {
        // Keep fallback visible if autoplay is blocked.
      }
    };

    const tick = () => {
      if (!active) return;

      const current = video.currentTime;
      const duration = video.duration;

      if (!duration) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (current < fadeDuration) {
        video.style.opacity = String(current / fadeDuration);
      } else if (current > duration - fadeDuration) {
        video.style.opacity = String((duration - current) / fadeDuration);
      } else {
        video.style.opacity = "1";
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const handleEnded = () => {
      video.style.opacity = "0";

      restartTimeoutRef.current = window.setTimeout(() => {
        if (!active) return;

        video.currentTime = 0;
        startPlayback();
      }, 100);
    };

    const handleLoadedData = () => {
      setVideoReady(true);
      setVideoFailed(false);
      startPlayback();
    };

    const handleError = () => {
      if (videoSourceIndex < heroVideoSources.length - 1) {
        setVideoReady(false);
        setVideoSourceIndex((current) => current + 1);
        return;
      }

      setVideoReady(false);
      setVideoFailed(true);
    };

    video.style.opacity = "0";

    rafRef.current = requestAnimationFrame(tick);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      active = false;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (restartTimeoutRef.current) {
        window.clearTimeout(restartTimeoutRef.current);
      }

      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [videoSourceIndex]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-white">
      {!videoFailed ? (
        <video
          ref={videoRef}
          key={heroVideoSources[videoSourceIndex]}
          muted
          playsInline
          autoPlay
          preload="metadata"
          crossOrigin="anonymous"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: videoReady ? 1 : 0,
            transition: "opacity 600ms ease",
          }}
        >
          <source src={heroVideoSources[videoSourceIndex]} type="video/mp4" />
        </video>
      ) : null}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.72)_24%,rgba(255,255,255,0.16)_56%,rgba(248,246,239,0.7)_100%)]" />
    </div>
  );
}

export function CinematicHero() {
  return (
    <div className="overflow-hidden bg-[#F8F6EF]">
      <section className="relative isolate min-h-screen overflow-visible bg-[#F8F6EF]">
        <HeroVideoBackground />

        <div className="pointer-events-none absolute inset-x-0 -bottom-44 z-30 h-[34rem] bg-gradient-to-b from-transparent via-[#F8F6EF]/95 to-[#F8F6EF]" />

        <nav className="absolute inset-x-0 top-0 z-40">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-8">
            <Link
              href="/"
              className="font-serif text-[2rem] tracking-[-0.05em] text-matcha-deep"
            >
              LUMIA
            </Link>

            <div className="hidden items-center gap-8 rounded-full border border-white/80 bg-white/72 px-5 py-3 text-sm text-muted backdrop-blur-xl md:flex">
              <a
                href="#ve-lumia"
                className="transition-colors hover:text-matcha-deep"
              >
                Về LUMIA
              </a>
              <a
                href="#hop-lumia"
                className="transition-colors hover:text-matcha-deep"
              >
                Hộp LUMIA
              </a>
              <a
                href="#testimonials"
                className="transition-colors hover:text-matcha-deep"
              >
                Feedback
              </a>
            </div>

            <Link
              href="/register?next=/boxes?onboarding=1"
              className="button-primary px-6"
            >
              Bắt đầu
            </Link>
          </div>
        </nav>

        <div className="relative z-50 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6  text-center">
          <motion.div {...fadeUp()} className="mx-auto max-w-5xl">
            <h1 className="font-serif text-[3.2rem] leading-[0.88] tracking-[-0.07em] text-matcha-deep md:text-[4.5rem]  xl:text-[5rem]">
              Một ritual dịu dàng cho những ngày bạn cần{" "}
              <span className="text-[#a7bf8c]">nhẹ lại.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-md leading-8 pb-[12vh] text-[#66725e]">
              LUMIA kết hợp healing box vật lý và không gian digital để bạn ghi
              nhận cảm xúc, viết ra và được lắng nghe theo cách thật nhẹ.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link href="/boxes" className="button-primary px-8 py-4">
                Khám phá LUMIA Box
              </Link>

              <Link
                href="/register?next=/dashboard"
                className="button-secondary px-8 py-4"
              >
                Xem dashboard của bạn
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* <section
        id="ve-lumia"
        className="relative z-10 -mt-10 bg-[#F8F6EF] px-6 pb-28 pt-36 md:px-10 md:pb-36 lg:px-16"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHeading
            eyebrow="LUMIA là gì"
            title="Không phải một app phải dùng mỗi ngày."
            body="LUMIA là một nơi để bạn quay về khi cần dịu lại. Một chiếc hộp nhỏ cho buổi tối, một dashboard riêng để ghi nhận cảm xúc, viết ra và được lắng nghe."
          />

          <div className="relative z-[1] grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
            <PlaceholderPanel
              title="Hộp LUMIA"
              copy="Không gian cho ảnh hero box, lụa trắng hoặc ánh sáng vàng mềm."
            />

            <div className="grid gap-4">
              <PlaceholderPanel
                title="Journal"
                copy="Khung nhỏ cho journal, ritual card hoặc bàn tay cầm thẻ."
                compact
              />

              <PlaceholderPanel
                title="Dashboard"
                copy="Khung nhỏ cho mockup dashboard thật sau này."
                compact
              />
            </div>
          </div>
        </div>
      </section> */}

      <section className="relative bg-[#F8F6EF] px-6 py-28 md:px-10 md:py-36 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Cách LUMIA đồng hành"
            title="Ba bước rất nhỏ, đủ để buổi tối nhẹ hơn."
          />

          <div className="relative z-[1] mt-12 grid gap-5 md:grid-cols-3">
            {ritualCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <motion.article
                  key={card.title}
                  {...fadeUp(index * 0.07)}
                  whileHover={{ y: -6 }}
                  className="liquid-panel p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#FFFDF5,#DDE8D2)] text-matcha-deep shadow-[0_16px_36px_rgba(143,168,120,0.14)]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 font-serif text-4xl leading-none text-matcha-deep">
                    {card.title}
                  </h3>

                  <p className="mt-4 max-w-sm text-sm leading-7 text-muted">
                    {card.copy}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="hop-lumia"
        className="relative bg-[#F8F6EF] px-6 py-28 md:px-10 md:py-36 lg:px-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="relative z-[1] flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Hộp LUMIA"
              title="Chọn chiếc hộp phù hợp với nhịp chăm sóc của bạn."
              body="Mỗi hộp mở một mức trải nghiệm digital khác nhau, từ check-in cảm xúc cơ bản đến không gian lắng nghe sâu hơn."
            />

            <Link href="/boxes" className="button-secondary px-7 py-4">
              Xem tất cả hộp
            </Link>
          </div>

          <div className="relative z-[1] mt-12 grid gap-5 lg:grid-cols-3">
            {boxCards.map((box, index) => (
              <motion.article
                key={box.title}
                {...fadeUp(index * 0.07)}
                whileHover={{ y: -6 }}
                className={`liquid-panel p-5 ${
                  index === 1 ? "ring-1 ring-[#F4D878]/70" : ""
                }`}
              >
                <div className="rounded-[28px] border border-white/75 bg-white/40 p-5 text-sm leading-6 text-muted">
                  Ảnh box sẽ được cập nhật sau.
                </div>

                <h3 className="mt-5 font-serif text-3xl leading-none text-matcha-deep">
                  {box.title}
                </h3>

                <p className="mt-2 text-sm font-medium text-matcha-deep">
                  {box.price}
                </p>

                <p className="mt-3 text-sm leading-6 text-muted">{box.copy}</p>

                <Link
                  href="/boxes"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-matcha-deep"
                >
                  Xem chi tiết <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#F8F6EF] px-6 py-28 md:px-10 md:py-36 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <motion.div {...fadeUp()} className="liquid-panel p-7 md:p-8">
            <span className="eyebrow">LUMIA lắng nghe</span>

            <h2 className="mt-5 font-serif text-[3.4rem] leading-[0.96] tracking-[-0.05em] text-matcha-deep md:text-[4.4rem]">
              Lắng nghe, không phán xét.
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[28px] bg-white/72 px-5 py-4 text-sm leading-7 text-matcha-deep">
                Hôm nay bạn muốn LUMIA lắng nghe điều gì?
              </div>

              <div className="ml-auto max-w-[84%] rounded-[28px] bg-matcha-soft/92 px-5 py-4 text-sm leading-7 text-matcha-deep">
                Mình thấy hơi quá tải nhưng không biết nên bắt đầu từ đâu.
              </div>

              <div className="max-w-[88%] rounded-[28px] bg-white/84 px-5 py-4 text-sm leading-7 text-matcha-deep shadow-[0_18px_40px_rgba(143,168,120,0.1)]">
                Mình nghe thấy hôm nay bạn đang phải giữ khá nhiều thứ trong
                lòng. Bạn muốn kể thêm một chút về điều nặng nhất không?
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4">
            <motion.article {...fadeUp(0.05)} className="liquid-panel p-6">
              <div className="text-sm leading-7 text-muted">
                LUMIA không thay thế chuyên gia y tế hoặc chuyên gia tâm lý.
              </div>
            </motion.article>

            <motion.article {...fadeUp(0.1)} className="liquid-panel p-6">
              <div className="font-serif text-3xl leading-none text-matcha-deep">
                Cứ viết ra.
              </div>

              <p className="mt-3 text-sm leading-6 text-muted">
                Không cần đúng. Không cần hay. Chỉ cần đủ thật để bạn thấy mình
                nhẹ đi một chút.
              </p>
            </motion.article>

            <motion.article {...fadeUp(0.15)} className="liquid-panel p-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#FFFDF5,#DDE8D2)] text-matcha-deep">
                  <NotebookPen className="h-4 w-4" />
                </div>

                <p className="text-sm leading-6 text-matcha-deep">
                  Bạn đã đặt cảm xúc này xuống một chút rồi.
                </p>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      <section
        id="testimonials"
        className="relative section-screen section-bridge px-6 md:px-10 lg:px-16"
      >
        <div className="max-w-7xl mx-auto w-full">
          {/* Heading */}
          <div className="text-center mb-16 flex flex-col items-center">
            <SectionHeading
              eyebrow="Những lời dịu dàng"
              title="Được yêu mến bởi những LUMIERs."
            />
          </div>

          {/* Scroll wall */}
          <div className="relative">
            {/* top/bottom fade */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

            {/* mobile: 1 column */}
            <div className="md:hidden h-[600px]">
              <div className="relative overflow-hidden h-full">
                <div className="animate-scroll-down hover:animate-scroll-down-slow">
                  {[...testimonials, ...testimonials].map((t, i) => (
                    <TestimonialCard key={i} quote={t.quote} tag={t.tag} />
                  ))}
                </div>
              </div>
            </div>

            {/* desktop: 3 columns */}
            <div className="hidden md:grid md:grid-cols-3 gap-4 h-[600px]">
              <ScrollColumn items={col1} direction="down" />
              <ScrollColumn items={col2} direction="up" />
              <ScrollColumn items={col3} direction="down" />
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-[#F8F6EF] px-6 py-28 md:px-10 md:py-36 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(244,216,120,0.22),transparent_18%),radial-gradient(circle_at_78%_66%,rgba(159,195,133,0.14),transparent_22%)]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="liquid-panel relative overflow-hidden px-8 py-16 text-center md:px-16">
            <div className="absolute left-1/2 top-14 h-44 w-44 -translate-x-1/2 rounded-full bg-[#F4D878]/28 blur-3xl animate-breathe-glow" />

            <div className="absolute left-1/2 top-24 h-56 w-72 -translate-x-1/2 rounded-[42px] bg-[linear-gradient(145deg,#DDE8D2,#FFF3C7)] shadow-[0_36px_100px_rgba(244,216,120,0.22)]" />

            <div className="relative pt-64">
              <motion.div {...fadeUp()} className="mx-auto max-w-3xl">
                <span className="eyebrow">Bắt đầu tối nay</span>

                <h2 className="mt-5 font-serif text-[3.8rem] leading-[0.94] tracking-[-0.05em] text-matcha-deep md:text-[5rem]">
                  Tối nay, mình bắt đầu nhẹ hơn một chút.
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted">
                  Chọn LUMIA Box phù hợp và mở không gian chăm sóc cảm xúc của
                  riêng bạn.
                </p>
              </motion.div>

              <motion.div
                {...fadeUp(0.08)}
                className="mt-9 flex flex-wrap items-center justify-center gap-4"
              >
                <Link href="/boxes" className="button-primary px-8 py-4">
                  Khám phá LUMIA Box
                </Link>

                <Link
                  href="/register?next=/dashboard"
                  className="button-secondary px-8 py-4"
                >
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
