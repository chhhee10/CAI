import React, { useState } from "react";
import { FileUp, Brain, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing({ onOpenDashboard }) {
  const [query, setQuery] = useState("");
  const gutter = "clamp(24px, 5vw, 80px)";

  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const slideUpFade = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 90,
        damping: 15
      }
    }
  };

  const scaleUp = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 85,
        damping: 15,
        delay: 0.2
      }
    }
  };

  const floatCard = {
    hidden: { opacity: 0, y: 150 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 16,
        delay: 0.45
      }
    }
  };


  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div style={{ fontFamily: "'Space Grotesk', sans-serif", width: "100%", overflowX: "hidden" }}>

        {/* ══════════════════════════════════════
            SCREEN 1 — Hero + Stats (100vh)
        ══════════════════════════════════════ */}
        <div style={{ height: "100vh", minHeight: "600px", display: "flex", flexDirection: "column" }}>

          {/* Navbar */}
          <nav style={{
            background: "#F4EFE6",
            padding: `clamp(14px, 2vh, 22px) ${gutter}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(20px, 2.5vw, 28px)", color: "#111", letterSpacing: "1px" }}>
              CAI
            </div>
            <button
              onClick={onOpenDashboard}
              style={{
                background: "#111",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "10px 24px",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: "700",
                fontSize: "clamp(12px, 1vw, 14px)",
                cursor: "pointer",
              }}
            >
              Try CAI →
            </button>
          </nav>

          {/* Hero */}
          <div style={{
            flex: 1,
            background: "#F4EFE6",
            padding: `0 ${gutter} 0`,
            display: "grid",
            gridTemplateColumns: "1fr clamp(260px, 28vw, 400px)",
            gap: "clamp(24px, 4vw, 64px)",
            alignItems: "end",
            overflow: "hidden",
          }}>
            {/* Left */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              style={{ paddingBottom: "clamp(24px, 4vh, 60px)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}
            >
              <motion.h1
                variants={slideUpFade}
                style={{
                  fontFamily: "'Anton', sans-serif",
                  fontSize: "clamp(64px, 13vw, 180px)",
                  lineHeight: 0.88,
                  letterSpacing: "-2px",
                  textTransform: "uppercase",
                  color: "#111",
                  margin: "0 0 clamp(20px, 3vh, 48px) 0",
                }}
              >
                Your files.<br />
                <span style={{ color: "#E84A00" }}>Every answer.</span><br />
                Zero search.
              </motion.h1>

              {/* Search */}
              <motion.div
                variants={slideUpFade}
                whileHover={{ scale: 1.015, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
                whileTap={{ scale: 0.995 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#fff",
                  borderRadius: "8px",
                  padding: "6px 6px 6px 20px",
                  gap: "10px",
                  maxWidth: "clamp(280px, 50vw, 560px)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                }}
              >
                <input
                  type="text"
                  placeholder="Ask anything about your client files..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      onOpenDashboard(query);
                    }
                  }}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "clamp(13px, 1.2vw, 16px)",
                    color: "#111",
                    background: "transparent",
                    padding: "10px 0",
                  }}
                />
                <button
                  onClick={() => onOpenDashboard(query)}
                  style={{
                    background: "#E84A00",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "12px 20px",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: "700",
                    fontSize: "clamp(13px, 1.2vw, 15px)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Ask →
                </button>
              </motion.div>
              <motion.p
                variants={slideUpFade}
                style={{ marginTop: "10px", fontSize: "clamp(11px, 1vw, 13px)", color: "#999", fontWeight: "500" }}
              >
                e.g. "Show me all GST filings for Kapoor & Sons Q3"
              </motion.p>
            </motion.div>

            {/* Memory Card */}
            <motion.div
              variants={floatCard}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -5 }}
              style={{
                background: "#111",
                borderRadius: "12px 12px 0 0",
                padding: "clamp(20px, 2.5vw, 32px)",
                color: "#fff",
                boxShadow: "0 -12px 40px rgba(0,0,0,0.15)",
                alignSelf: "end",
              }}
            >
              <div style={{ color: "#555", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: "700", marginBottom: "18px" }}>
                Memory Active — 8,241 Docs
              </div>
              {[
                { tag: "Recalled", tagStyle: { background: "#1A3A1A", color: "#6BCF6B" }, title: "Mehta Associates — ITR FY23", sub: "Last modified 3 days ago" },
                { tag: "Cross-referenced", tagStyle: { background: "#3A2800", color: "#FFAA33" }, title: "Form 26AS mismatch flagged", sub: "₹2.4L discrepancy" },
                { tag: "Suggested", tagStyle: { background: "#0A1E3A", color: "#5599FF" }, title: "File revised return", sub: "Deadline in 11 days", last: true },
              ].map((item, i) => (
                <div key={i} style={{
                  paddingBottom: item.last ? 0 : "14px",
                  marginBottom: item.last ? 0 : "14px",
                  borderBottom: item.last ? "none" : "1px solid #222",
                }}>
                  <div style={{ display: "inline-block", fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", padding: "2px 8px", borderRadius: "20px", marginBottom: "5px", ...item.tagStyle }}>{item.tag}</div>
                  <div style={{ fontWeight: "600", fontSize: "clamp(11px, 1vw, 13px)", color: "#fff", marginBottom: "2px" }}>{item.title}</div>
                  <div style={{ fontSize: "clamp(10px, 0.9vw, 11px)", color: "#666" }}>{item.sub}</div>
                </div>
              ))}
            </motion.div>

          </div>

          {/* Stats Ribbon */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            style={{ background: "#E84A00", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", flexShrink: 0 }}
          >
            {[
              { val: "0", lbl: "hallucinations — answers grounded in your docs, never invented" },
              { val: "6", lbl: "specialized AI agents — orchestrator, advisory, notice, YoY, anomaly, document" },
              { val: "5", lbl: "memory namespaces — tax, income, notices, deductions, preferences" },
              { val: "∞", lbl: "clients & years — persistent memory across every assessment year" },
            ].map((s, i) => (
              <motion.div
                key={i}
                variants={slideUpFade}
                style={{
                  padding: "clamp(20px, 3vh, 40px) clamp(16px, 3vw, 40px)",
                  borderRight: i < 3 ? "1px solid rgba(255,255,255,0.2)" : "none",
                  color: "#fff",
                }}
              >
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(36px, 5vw, 72px)", letterSpacing: "-1px", lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: "clamp(11px, 1vw, 14px)", fontWeight: "500", opacity: 0.85, marginTop: "6px" }}>{s.lbl}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ══════════════════════════════════════
            SCREEN 2 — How it Works (100vh)
        ══════════════════════════════════════ */}
        <div style={{
          height: "100vh",
          minHeight: "600px",
          background: "#F4EFE6",
          padding: `clamp(32px, 5vh, 72px) ${gutter}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          boxSizing: "border-box",
        }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 70, damping: 15 }}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "clamp(24px, 4vh, 48px)" }}
          >
            <h2 style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: "clamp(40px, 7vw, 96px)",
              lineHeight: 0.9,
              textTransform: "uppercase",
              color: "#111",
              letterSpacing: "-1px",
              margin: 0,
            }}>
              How it<br /><span style={{ color: "#E84A00" }}>actually</span> works
            </h2>
            <p style={{
              fontSize: "clamp(12px, 1.1vw, 15px)",
              color: "#888",
              maxWidth: "220px",
              textAlign: "right",
              lineHeight: 1.65,
              fontWeight: "500",
              margin: 0,
              flexShrink: 0,
            }}>
              No training. No setup hell.<br />Just drop your files and go.
            </p>
          </motion.div>

          {/* Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", flex: 1, alignItems: "end" }}>
            {[
              {
                num: "01", Icon: FileUp, icoStyle: { background: "#D4EDE8", color: "#1A6B5A" },
                title: "Upload everything", desc: "Drop any file type — CAI handles the rest.",
                extra: "Works with PDFs, Excel sheets, Tally exports, email threads, and Word docs. No formatting rules, no renaming required.",
                bg: "#fff", titleColor: "#111", descColor: "#666", numColor: "#111", h: "100%"
              },
              {
                num: "02", Icon: Brain, icoStyle: { background: "#FDDBC8", color: "#E84A00" },
                title: "Memory indexes it", desc: "Every fact stored, tagged, and ready to recall instantly.",
                extra: "Organises client data across tax history, income, notices, and deductions — with full Assessment Year tracking.",
                bg: "#fff", titleColor: "#111", descColor: "#666", numColor: "#111", h: "75%"
              },
              {
                num: "03", Icon: MessageSquare, icoStyle: { background: "rgba(255,255,255,0.15)", color: "#fff" },
                title: "Just ask", desc: "Type like you're texting a very smart colleague who has read everything.",
                extra: "",
                bg: "#1A6B5A", titleColor: "#fff", descColor: "rgba(255,255,255,0.75)", numColor: "#fff", h: "55%"
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ type: "spring", stiffness: 70, damping: 15, delay: i * 0.15 }}
                whileHover={{
                  y: -10,
                  scale: 1.01,
                  boxShadow: s.bg === "#fff" ? "0 16px 36px rgba(0,0,0,0.08)" : "0 16px 36px rgba(26,107,90,0.15)",
                }}
                style={{
                  height: s.h,
                  padding: "clamp(24px, 3.5vw, 44px)",
                  background: s.bg,
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: s.bg === "#fff" ? "0 2px 16px rgba(0,0,0,0.05)" : "none",
                  boxSizing: "border-box"
                }}
              >
                {/* Top — number + icon */}
                <div>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(56px, 8vw, 110px)", opacity: 0.12, lineHeight: 1, marginBottom: "clamp(12px, 2vh, 24px)", color: s.numColor, letterSpacing: "-2px" }}>{s.num}</div>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", ...s.icoStyle }}>
                    <s.Icon size={20} strokeWidth={1.75} color={s.icoStyle.color} />
                  </div>
                </div>

                {/* Bottom — extra text + title + description */}
                <div>
                  {s.extra && (
                    <p style={{ fontSize: "clamp(12px, 1vw, 14px)", lineHeight: 1.7, color: i === 2 ? "rgba(255,255,255,0.5)" : "#aaa", margin: "0 0 14px 0", fontWeight: "500" }}>{s.extra}</p>
                  )}
                  <h3 style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(18px, 2.2vw, 30px)", textTransform: "uppercase", letterSpacing: "-0.3px", margin: "0 0 8px 0", color: s.titleColor }}>{s.title}</h3>
                  <p style={{ fontSize: "clamp(12px, 1vw, 15px)", lineHeight: 1.65, color: s.descColor, margin: 0, fontWeight: "500" }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>


        {/* ══════════════════════════════════════
            SCREEN 3 — Vision + CTA (100vh)
        ══════════════════════════════════════ */}
        <div style={{ height: "100vh", minHeight: "600px", display: "flex", flexDirection: "column" }}>

          {/* Vision — top half */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 70, damping: 15 }}
            style={{
              flex: 1,
              background: "#F4EFE6",
              padding: `clamp(32px, 5vh, 64px) ${gutter}`,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "clamp(24px, 4vw, 80px)",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            <h2 style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: "clamp(36px, 5.5vw, 80px)",
              lineHeight: 0.9,
              color: "#111",
              textTransform: "uppercase",
              letterSpacing: "-1px",
              margin: 0,
            }}>
              "Feels like having a<br />
              junior who never<br />
              <span style={{ color: "#E84A00" }}>forgets anything."</span>
            </h2>
            <div style={{ paddingLeft: "clamp(16px, 3vw, 40px)", borderLeft: "2px solid #C8C0B0" }}>
              <p style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(14px, 1.5vw, 22px)", color: "#111", textTransform: "uppercase", letterSpacing: "-0.3px", marginBottom: "20px", lineHeight: 1.2 }}>
                Built for the modern accounting firm of the future.
              </p>
              <p style={{ fontSize: "clamp(13px, 1.1vw, 16px)", color: "#888", lineHeight: 1.75, margin: 0, fontWeight: "500" }}>
                CAI is an intelligent orchestration layer designed specifically for Chartered Accountants. It securely indexes your chaotic file structures and gives you instant answers, ensuring you never miss a deadline.
              </p>
            </div>
          </motion.div>

          {/* CTA — bottom half */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 70, damping: 15 }}
            style={{
              flex: 1,
              background: "#E84A00",
              padding: `clamp(32px, 5vh, 64px) ${gutter}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "clamp(24px, 4vw, 64px)",
              boxSizing: "border-box",
            }}
          >
            <h2 style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: "clamp(32px, 5.5vw, 80px)",
              color: "#fff",
              lineHeight: 1,
              letterSpacing: "-0.5px",
              margin: 0,
            }}>
              Ready to stop <em style={{ fontStyle: "italic" }}>ctrl+F-ing</em><br />your life?
            </h2>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              <motion.button
                onClick={onOpenDashboard}
                whileHover={{ scale: 1.05, boxShadow: "0 12px 28px rgba(0,0,0,0.25)" }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "#fff",
                  color: "#111",
                  border: "none",
                  borderRadius: "8px",
                  padding: "clamp(14px, 2vh, 20px) clamp(24px, 3vw, 40px)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: "700",
                  fontSize: "clamp(14px, 1.3vw, 18px)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                }}
              >
                Open Dashboard
              </motion.button>
              <p style={{ fontSize: "clamp(10px, 0.85vw, 12px)", color: "rgba(255,255,255,0.55)", margin: 0, fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase", textAlign: "center" }}>
                Powered by Hindsight
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </>
  );
}
