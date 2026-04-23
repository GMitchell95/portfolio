import FormBuilderTile from '@/components/tiles/FormBuilderTile'
import MegaMenuTile from '@/components/tiles/MegaMenuTile'

const CONTAINER = { maxWidth: 1100, margin: "0 auto", padding: "0 40px" }

export default function Home() {
  return (
    <>
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-50 border-b border-slate-200">
        <div
          className="flex items-center justify-between"
          style={{ ...CONTAINER, paddingTop: 20, paddingBottom: 20 }}
        >
          <span className="text-slate-900 font-medium text-sm tracking-tight">
            Your Name
          </span>
          <ul className="flex items-center gap-8 list-none">
            <li>
              <a href="#work" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                Work
              </a>
            </li>
            <li>
              <a href="#about" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                About
              </a>
            </li>
            <li>
              <a href="#contact" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                Contact
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Page content */}
      <div style={CONTAINER}>
        {/* Hero Section */}
        <section
          className="relative flex flex-col justify-end bg-slate-50"
          style={{ height: "100vh", paddingBottom: "80px" }}
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
          className="border-t border-slate-200"
          style={{ padding: "80px 0" }}
        >
          <p
            className="text-slate-500 uppercase font-medium mb-8"
            style={{ fontSize: "11px", letterSpacing: "0.06em" }}
          >
            Selected Work
          </p>
          <FormBuilderTile />

          <div className="flex items-center justify-between mt-8 mb-2">
            <span style={{ fontSize: 12, fontWeight: 500, color: '#71717A', letterSpacing: '0.02em' }}>
              Mega menu
            </span>
            <div className="flex items-center gap-1 text-xs" style={{ color: '#A1A1AA' }}>
              <span>Click to open or press</span>
              <kbd style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'white',
                border: '1px solid #E4E4E7',
                borderRadius: 4,
                padding: '1px 6px',
                fontSize: 11,
                fontWeight: 500,
                color: '#71717A',
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                fontFamily: 'inherit',
              }}>
                ⌘ K
              </kbd>
            </div>
          </div>
          <MegaMenuTile />
        </section>
      </div>
    </>
  );
}
