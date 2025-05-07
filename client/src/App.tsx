import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

const personas = ["Recruiting", "Investors", "Customers"];

export default function App() {
  const [company, setCompany] = useState("");
  const [url, setUrl] = useState("");
  const [persona, setPersona] = useState(personas[0]);
  const [brochure, setBrochure] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [comparison, setComparison] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateBrochure = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("http://localhost:5000/api/brochure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, url, persona }),
      });

      const data = await res.json();
      setBrochure(data?.brochure || "");
      setCompetitors(Array.isArray(data?.competitors) ? data.competitors : []);
      setComparison("");
    } catch (err) {
      setError("Failed to generate brochure. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const compareWith = async (comp: string) => {
    try {
      setSelected(comp);
      setLoading(true);
      setError("");
      const res = await fetch("http://localhost:5000/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyA: company,
          urlA: url,
          companyB: comp,
          urlB: `https://www.${comp.replace(/\s/g, "")}.com`,
        }),
      });

      const data = await res.json();
      setComparison(data?.comparison || "");
    } catch (err) {
      setError("Failed to compare companies. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>AI Company Brochure</h1>

      <select value={persona} onChange={(e) => setPersona(e.target.value)}>
        {personas.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>
      <p style={{ fontStyle: "italic", marginBottom: "1rem" }}>
        {persona === "Customers" &&
          "Tailored for potential customers – marketing tone, benefits, and use cases."}
        {persona === "Investors" &&
          "Tailored for investors – business model, vision, market opportunity, team."}
        {persona === "Recruiting" &&
          "Tailored for hiring – company culture, open roles, tech stack, growth."}
      </p>

      <input
        placeholder="Company name"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <input
        placeholder="Website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button onClick={generateBrochure} disabled={loading}>
        {loading ? "Loading…" : "Generate Brochure"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {brochure && (
        <>
          <section className="brochure">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {brochure}
            </ReactMarkdown>
          </section>

          {Array.isArray(competitors) && competitors.length > 0 && (
            <>
              <h3>Choose a competitor to compare</h3>
              {competitors.map((c) => (
                <button
                  key={c}
                  className={c === selected ? "selected" : ""}
                  onClick={() => compareWith(c)}
                >
                  {c}
                </button>
              ))}
            </>
          )}
        </>
      )}

      {comparison && (
        <section className="comparison">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {comparison}
          </ReactMarkdown>
        </section>
      )}
    </div>
  );
}
