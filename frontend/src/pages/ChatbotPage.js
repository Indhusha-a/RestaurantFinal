function ChatbotPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 16px",
        background:
          "linear-gradient(180deg, #fff7ed 0%, #fffbeb 52%, #ffffff 100%)",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          display: "grid",
          gap: "20px",
        }}
      >
        <section
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "24px",
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
          }}
        >
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#111827",
            }}
          >
            Restaurant Chatbot
          </h1>
          <p
            style={{
              margin: 0,
              color: "#4b5563",
              fontSize: "1rem",
              lineHeight: 1.6,
            }}
          >
            This page loads the local chatbot service directly. If the service
            on <code>localhost:8100</code> is offline, the frame below will show
            a connection error until it is started.
          </p>
        </section>

        <section
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "16px",
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
          }}
        >
          <iframe
            src="http://localhost:8100/widget"
            title="Restaurant Chatbot"
            style={{
              width: "100%",
              minHeight: "70vh",
              border: "none",
              borderRadius: "16px",
              background: "#ffffff",
            }}
          />
        </section>
      </div>
    </main>
  );
}

export default ChatbotPage;
