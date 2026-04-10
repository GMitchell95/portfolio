export default function Home() {
  return (
    <>
      {/* Fixed Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-slate-50 border-b border-slate-200"
        style={{ padding: "20px 40px" }}
      >
        <span className="text-slate-900 font-medium text-sm tracking-tight">
          Your Name
        </span>
        <ul className="flex items-center gap-8 list-none">
          <li>
            <a
              href="#work"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Work
            </a>
          </li>
          <li>
            <a
              href="#about"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Contact
            </a>
          </li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section
        className="relative flex flex-col justify-end bg-slate-50"
        style={{ height: "100vh", paddingLeft: "40px", paddingBottom: "80px" }}
      >
        <div className="flex flex-col gap-6">
          {/* Label */}
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
            Product &amp; UI Designer
          </p>

          {/* Heading */}
          <h1 className="hero-heading font-semibold text-slate-900">
            Design that
            <br />
            moves people
          </h1>

          {/* Bio */}
          <p
            className="text-slate-500"
            style={{ maxWidth: "340px", lineHeight: "1.6", fontSize: "16px" }}
          >
            I design digital products that are clear, purposeful, and
            considered. Currently open to new projects and full-time roles.
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {["Product Design", "Design Systems", "Interaction", "Prototyping"].map(
              (tag) => (
                <span
                  key={tag}
                  className="border border-slate-200 text-slate-900 uppercase"
                  style={{
                    padding: "8px 16px",
                    fontSize: "11px",
                    letterSpacing: "0.06em",
                    borderRadius: "100px",
                  }}
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Work Section */}
      <section
        id="work"
        className="bg-white border-t border-slate-200"
        style={{ padding: "80px 40px" }}
      >
        <p
          className="text-slate-500 uppercase font-medium mb-8"
          style={{ fontSize: "11px", letterSpacing: "0.06em" }}
        >
          Selected Work
        </p>
        <p className="text-slate-500" style={{ fontSize: "16px" }}>
          Coming soon
        </p>
      </section>
    </>
  );
}
