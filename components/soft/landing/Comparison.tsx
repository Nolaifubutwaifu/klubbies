import { Reveal } from "@/components/soft/Reveal";
import { SectionFx } from "@/components/soft/SectionFx";

const COLUMNS = ["Klubbies", "Google Drive", "Instagram", "Facebook group"];

const ROWS: { label: string; cells: string[] }[] = [
  {
    label: "Private to your club",
    cells: ["Roster checked at every login", "Anyone with the link", "Public, or a shared password", "Whoever's still in the group"],
  },
  {
    label: "Full quality",
    cells: ["Originals, in and out", "Yes, if nobody zips it", "Crushed and cropped", "Crushed"],
  },
  {
    label: "Finding yourself",
    cells: ["By event, date and favourites", "Scroll 4,000 filenames", "Only if you got tagged", "Buried under the feed"],
  },
  {
    label: "When someone leaves",
    cells: ["Access winds down over 30 days", "They keep the link forever", "Nothing happens", "Nothing happens"],
  },
  {
    label: "Handover",
    cells: ["One click, club keeps everything", "It's in Dana's personal account", "Password in a group chat", "Admin graduated in 2022"],
  },
];

/** One line per alternative, for the phone layout where the table can't fit. */
const ALTERNATIVES = [
  { name: "Google Drive", body: "Anyone with the link gets in, and it's in Dana's personal account. She graduated." },
  { name: "Instagram", body: "Crushed, cropped, public, and you only find yourself if someone tagged you." },
  { name: "Facebook group", body: "Buried under the feed, nobody leaves when they graduate, admin left in 2022." },
];

/** Honest comparison, with our column highlighted rather than the others rubbished. */
export function Comparison() {
  return (
    <section className="soft-fx-host border-y border-[color-mix(in_srgb,var(--color-text)_6%,transparent)] bg-[color:var(--color-surface)]">
      <SectionFx dots="faint" />
      <div className="mx-auto w-full max-w-[1100px] px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="text-[clamp(28px,4vw,40px)]">What clubs use now, honestly compared.</h2>
          <p className="mt-3 max-w-[58ch] text-[17px] text-[color:var(--ink-70)]">
            Five things that decide whether your photos survive the year.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-8 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[820px] border-collapse text-[14px]">
              <thead>
                <tr>
                  <th scope="col" className="w-[24%] px-3.5 py-3 text-left font-bold text-[color:var(--ink-70)]">
                    <span className="sr-only">Feature</span>
                  </th>
                  {COLUMNS.map((column, i) => (
                    <th
                      key={column}
                      scope="col"
                      className={`px-3.5 py-3 text-left ${
                        i === 0
                          ? "soft-display rounded-t-[16px] bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface))] text-[17px] text-accent-700"
                          : "font-bold"
                      }`}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, r) => (
                  <tr key={row.label}>
                    <th scope="row" className="border-t border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] px-3.5 py-3.5 text-left font-bold">
                      {row.label}
                    </th>
                    {row.cells.map((cell, i) => (
                      <td
                        key={`${row.label}-${i}`}
                        className={`border-t border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] px-3.5 py-3.5 ${
                          i === 0
                            ? `bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface))] font-bold text-accent-700 ${r === ROWS.length - 1 ? "rounded-b-[16px]" : ""}`
                            : "text-[color:var(--ink-70)]"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phone layout: the winning column as a list, then a line each. */}
          <div className="mt-8 flex flex-col gap-3 md:hidden">
            <div className="rounded-[var(--soft-r)] bg-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-surface))] p-5">
              <h3 className="text-[19px] text-accent-700">Klubbies</h3>
              <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0 text-[13px] text-accent-700">
                {ROWS.map((row) => (
                  <li key={row.label} className="flex gap-2.5">
                    <span className="mt-0.5 shrink-0" aria-hidden>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M4 12.5 9.5 18 20 6.5" />
                      </svg>
                    </span>
                    {row.cells[0]}
                  </li>
                ))}
              </ul>
            </div>
            {ALTERNATIVES.map((alt) => (
              <div key={alt.name} className="rounded-[var(--soft-r)] border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[color:var(--color-bg)] p-4">
                <h3 className="text-[16px]">{alt.name}</h3>
                <p className="mt-1.5 text-[13px] text-[color:var(--ink-70)]">{alt.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
