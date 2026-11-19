
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  FileCode2,
  GitBranch,
  GitPullRequest,
  History,
  LayoutDashboard,
  LoaderCircle,
  RefreshCw,
  ScanSearch,
  Search,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  XCircle,
  ArrowLeft,
  ExternalLink,
  Clock,
} from "lucide-react";

const API = "/api";
const GITHUB_URL = "https://github.com/Chirashrikarmakar/MERGEMAP";
const READ_STORAGE_KEY = "mergemap_seen_analysis_ids";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Analyze PR", icon: ScanSearch },
  { label: "Analysis History", icon: History },
];

const riskColors = {
  LOW: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  MEDIUM: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  HIGH: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  CRITICAL: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

function App() {
  const [page, setPage] = useState("Overview");
  const [prUrl, setPrUrl] = useState("");
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [seenAnalysisIds, setSeenAnalysisIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(READ_STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const loadAnalyses = async () => {
    try {
      const response = await fetch(`${API}/analyses`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load analyses.");
      }

      setAnalyses(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("History loading error:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  // Mark existing analyses as read whenever the user visits Analysis History.
  useEffect(() => {
    if (page !== "Analysis History" || fetching) return;

    const currentIds = analyses
      .map((item) => item._id)
      .filter(Boolean);

    setSeenAnalysisIds((previousIds) => {
      const updatedIds = [...new Set([...previousIds, ...currentIds])];

      try {
        localStorage.setItem(
          READ_STORAGE_KEY,
          JSON.stringify(updatedIds)
        );
      } catch (err) {
        console.error("Could not save read status:", err);
      }

      return updatedIds;
    });
  }, [page, fetching, analyses]);

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setError("");
    setSelectedAnalysis(null);

    if (!prUrl.trim()) {
      setError("Please enter a GitHub Pull Request URL.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/analyses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prUrl: prUrl.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Analysis failed.");
      }

      setSelectedAnalysis(result.data);
      setPage("Analysis Details");
      setPrUrl("");
      await loadAnalyses();
    } catch (err) {
      setError(err.message || "Unable to analyze this pull request.");
    } finally {
      setLoading(false);
    }
  };

  const total = analyses.length;

  const highRisk = analyses.filter(
    (item) => item.riskLevel === "HIGH" || item.riskLevel === "CRITICAL"
  ).length;

  const averageRisk = total
    ? Math.round(
        analyses.reduce((sum, item) => sum + (Number(item.riskScore) || 0), 0) /
          total
      )
    : 0;

  const lowRisk = analyses.filter(
    (item) => item.riskLevel === "LOW"
  ).length;

  const mediumRisk = analyses.filter(
    (item) => item.riskLevel === "MEDIUM"
  ).length;

  const criticalRisk = analyses.filter(
    (item) => item.riskLevel === "CRITICAL"
  ).length;

  const highOnly = analyses.filter(
    (item) => item.riskLevel === "HIGH"
  ).length;

  const recentAnalyses = analyses.slice(0, 5);

  const unreadAnalyses = analyses.filter(
    (item) => item._id && !seenAnalysisIds.includes(item._id)
  );

  const unreadCount = unreadAnalyses.length;

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const searchResults = normalizedSearch
    ? analyses
        .filter((item) => {
          const searchableText = [
            item.title,
            item.owner,
            item.repo,
            item.author,
            item.prNumber,
            `${item.owner || ""}/${item.repo || ""}#${item.prNumber || ""}`,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(normalizedSearch);
        })
        .slice(0, 6)
    : [];

  const openAnalyze = () => {
    setPage("Analyze PR");
    setSelectedAnalysis(null);
    setError("");
    setSearchOpen(false);
    setNotificationsOpen(false);
  };

  const openHistory = () => {
    setPage("Analysis History");
    setSelectedAnalysis(null);
    setError("");
    setSearchOpen(false);
    setNotificationsOpen(false);
  };

  const openAnalysisDetails = (item) => {
    setSelectedAnalysis(item);
    setPage("Analysis Details");
    setError("");
    setSearchQuery("");
    setSearchOpen(false);
    setNotificationsOpen(false);
  };

  const backToHistory = () => {
    setPage("Analysis History");
    setSelectedAnalysis(null);
    setError("");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (searchResults.length > 0) {
      openAnalysisDetails(searchResults[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-200">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-[250px] shrink-0 border-r border-white/[0.07] bg-[#0d1320] lg:flex lg:flex-col">
          <div className="flex h-[82px] items-center gap-3 border-b border-white/[0.07] px-7">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
              <GitBranch size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                MERGEMAP
              </h1>
              <p className="text-[10px] tracking-[2px] text-slate-500">
                INTELLIGENT CODE REVIEW
              </p>
            </div>
          </div>

          <div className="px-5 pt-8">
            <p className="mb-4 px-3 text-[10px] font-bold tracking-[2px] text-slate-600">
              WORKSPACE
            </p>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active =
                  page === item.label ||
                  (page === "Analysis Details" &&
                    item.label === "Analysis History");

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.label === "Analysis History") {
                        openHistory();
                      } else {
                        setPage(item.label);
                        setSelectedAnalysis(null);
                        setError("");
                        setSearchOpen(false);
                        setNotificationsOpen(false);
                      }
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                      active
                        ? "border border-indigo-400/20 bg-indigo-500/10 font-medium text-indigo-300"
                        : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}

                    {item.label === "Analysis History" && unreadCount > 0 && (
                      <span className="ml-auto rounded-md bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-5">
            <div className="rounded-xl border border-indigo-400/15 bg-indigo-500/[0.06] p-4">
              <div className="mb-3 flex items-center gap-2 text-indigo-300">
                <Sparkles size={16} />
                <span className="text-xs font-semibold">MERGEMAP ENGINE</span>
              </div>
              <p className="text-xs leading-5 text-slate-500">
                Intelligent pull request risk detection and review assistance.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-emerald-400">
                  Analysis engine ready
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 border-t border-white/[0.07] pt-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
                MM
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-300">
                  Developer Workspace
                </p>
                <p className="text-[10px] text-slate-600">
                  Local environment
                </p>
              </div>
              <Settings className="ml-auto text-slate-600" size={17} />
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1">
          {/* TOP NAVIGATION */}
          <header className="relative z-30 flex h-[82px] items-center justify-between border-b border-white/[0.07] px-5 sm:px-8 lg:px-10">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 lg:hidden">
                <GitBranch size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{page}</p>
                <p className="mt-0.5 text-[11px] text-slate-600">
                  Workspace / {page}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* SEARCH */}
              <div className="relative hidden md:block">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex w-[230px] items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 transition focus-within:border-indigo-400/40 lg:w-[280px]"
                >
                  <Search size={14} className="shrink-0 text-slate-500" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onFocus={() => setSearchOpen(true)}
                    placeholder="Search analyses..."
                    className="w-full bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchOpen(false);
                      }}
                      className="text-slate-500 hover:text-white"
                      aria-label="Clear search"
                    >
                      <XCircle size={14} />
                    </button>
                  )}
                </form>

                {searchOpen && normalizedSearch && (
                  <div className="absolute right-0 top-12 z-50 w-[320px] overflow-hidden rounded-xl border border-white/10 bg-[#111827] shadow-2xl">
                    <div className="border-b border-white/[0.07] px-4 py-3">
                      <p className="text-[10px] font-bold tracking-wider text-slate-500">
                        SEARCH RESULTS
                      </p>
                    </div>

                    {searchResults.length > 0 ? (
                      searchResults.map((item) => (
                        <button
                          key={item._id}
                          type="button"
                          onClick={() => openAnalysisDetails(item)}
                          className="flex w-full items-start gap-3 border-b border-white/[0.05] px-4 py-3 text-left transition hover:bg-white/[0.05]"
                        >
                          <GitPullRequest
                            size={16}
                            className="mt-0.5 shrink-0 text-indigo-400"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-slate-200">
                              {item.title || `Pull request #${item.prNumber}`}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-500">
                              {item.owner}/{item.repo} · #{item.prNumber}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold ${
                              riskColors[item.riskLevel] || ""
                            }`}
                          >
                            {item.riskLevel}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-7 text-center">
                        <Search
                          size={20}
                          className="mx-auto mb-2 text-slate-600"
                        />
                        <p className="text-xs text-slate-400">
                          No matching analyses found.
                        </p>
                        <p className="mt-1 text-[10px] text-slate-600">
                          Try a repository name or PR number.
                        </p>
                      </div>
                    )}

                    <div className="border-t border-white/[0.07] px-4 py-2">
                      <p className="text-[10px] text-slate-600">
                        Press Enter to open the first result.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* NOTIFICATIONS */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen((current) => !current);
                    setSearchOpen(false);
                  }}
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                  className="relative rounded-lg border border-white/[0.08] p-2.5 text-slate-500 transition hover:bg-white/[0.04] hover:text-white"
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 text-[9px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-12 z-50 w-[310px] overflow-hidden rounded-xl border border-white/10 bg-[#111827] shadow-2xl sm:w-[350px]">
                    <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-4">
                      <div>
                        <h3 className="text-xs font-bold text-white">
                          Notifications
                        </h3>
                        <p className="mt-1 text-[10px] text-slate-500">
                          Recent analysis activity
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-indigo-500/15 px-2 py-1 text-[9px] font-semibold text-indigo-300">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>

                    {recentAnalyses.length > 0 ? (
                      <div className="max-h-[300px] overflow-y-auto">
                        {recentAnalyses.map((item) => {
                          const isUnread =
                            item._id && !seenAnalysisIds.includes(item._id);

                          return (
                            <button
                              key={item._id}
                              type="button"
                              onClick={() => openAnalysisDetails(item)}
                              className="flex w-full items-start gap-3 border-b border-white/[0.05] px-4 py-3 text-left transition hover:bg-white/[0.05]"
                            >
                              <div className="mt-0.5 rounded-lg bg-emerald-400/10 p-2 text-emerald-400">
                                <CheckCircle2 size={15} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-semibold text-slate-200">
                                    Analysis completed
                                  </p>
                                  {isUnread && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                                  )}
                                </div>
                                <p className="mt-1 truncate text-[10px] text-slate-500">
                                  {item.owner}/{item.repo} · PR #
                                  {item.prNumber}
                                </p>
                                <p className="mt-2 text-[10px] text-slate-400">
                                  Risk score: {item.riskScore}/100 ·{" "}
                                  {item.riskLevel}
                                </p>
                              </div>
                              <ArrowRight
                                size={14}
                                className="mt-1 shrink-0 text-slate-600"
                              />
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-10 text-center">
                        <Bell
                          size={22}
                          className="mx-auto mb-3 text-slate-600"
                        />
                        <p className="text-xs text-slate-400">
                          No notifications yet.
                        </p>
                        <p className="mt-1 text-[10px] text-slate-600">
                          Completed analyses will appear here.
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={openHistory}
                      className="flex w-full items-center justify-center gap-2 border-t border-white/[0.07] px-4 py-3 text-xs font-semibold text-indigo-400 transition hover:bg-white/[0.03] hover:text-indigo-300"
                    >
                      View all analyses <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="hidden h-8 w-px bg-white/10 sm:block" />

              {/* GITHUB LINK */}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
                title="Open GitHub"
              >
                <GitBranch size={17} />
                <span className="hidden sm:block">GitHub</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] p-5 sm:p-8 lg:p-10">
            {/* PAGE INTRO */}
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span className="text-[10px] font-bold tracking-[2px] text-indigo-300">
                    DEVELOPER INTELLIGENCE PLATFORM
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {page === "Overview"
                    ? "Code with confidence."
                    : page === "Analyze PR"
                      ? "Analyze a pull request."
                      : page === "Analysis Details"
                        ? "Pull request analysis report."
                        : "Your analysis history."}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {page === "Overview"
                    ? "Understand code changes before they become production risks."
                    : page === "Analyze PR"
                      ? "Inspect a GitHub pull request and uncover potential risks."
                      : page === "Analysis Details"
                        ? "Review detected risks, scoring and recommended actions for this pull request."
                        : "Explore previously analyzed pull requests and their risk reports."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {page === "Analysis Details" && (
                  <button
                    onClick={backToHistory}
                    className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    <ArrowLeft size={15} />
                    Back to History
                  </button>
                )}

                <button
                  onClick={openAnalyze}
                  className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
                >
                  <ScanSearch size={16} />
                  Analyze new PR
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            {/* ANALYSIS INPUT */}
            {(page === "Overview" || page === "Analyze PR") && (
              <section className="mb-8 overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/[0.12] via-[#151b2d] to-[#111827]">
                <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <div className="rounded-lg bg-indigo-400/15 p-2 text-indigo-300">
                        <GitPullRequest size={20} />
                      </div>
                      <span className="text-xs font-semibold tracking-wide text-indigo-200">
                        PULL REQUEST INTELLIGENCE
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white">
                      What are you about to merge?
                    </h3>
                    <p className="mt-2 max-w-xl text-xs leading-6 text-slate-400">
                      Paste a public GitHub pull request URL. MERGEMAP will
                      inspect the changes, calculate a risk score and generate
                      a review checklist.
                    </p>
                  </div>

                  <div className="hidden h-24 w-24 items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-400/[0.06] text-indigo-300 md:flex">
                    <ShieldCheck size={46} strokeWidth={1.2} />
                  </div>

                  <form onSubmit={handleAnalyze} className="md:col-span-2">
                    <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-[#0b1120]/80 p-2 sm:flex-row">
                      <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                        <GitBranch
                          size={19}
                          className="shrink-0 text-slate-500"
                        />
                        <input
                          value={prUrl}
                          onChange={(e) => setPrUrl(e.target.value)}
                          placeholder="https://github.com/owner/repository/pull/123"
                          className="w-full min-w-0 bg-transparent py-3 text-xs text-white outline-none placeholder:text-slate-600"
                        />
                      </div>

                      <button
                        disabled={loading}
                        type="submit"
                        className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-500 px-5 py-3 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <ScanSearch size={16} />
                        )}
                        {loading ? "Analyzing..." : "Analyze pull request"}
                      </button>
                    </div>

                    {error && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-rose-400">
                        <XCircle size={15} />
                        {error}
                      </div>
                    )}
                  </form>
                </div>
              </section>
            )}

            {/* ANALYSIS RESULT / DETAILS */}
            {selectedAnalysis && page === "Analysis Details" && (
              <section className="mb-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 size={19} />
                    <span className="text-sm font-semibold">
                      Analysis report
                    </span>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      riskColors[selectedAnalysis.riskLevel] || ""
                    }`}
                  >
                    {selectedAnalysis.riskLevel} RISK
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">
                  {selectedAnalysis.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedAnalysis.owner}/{selectedAnalysis.repo} · PR #
                  {selectedAnalysis.prNumber}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <ResultMetric
                    label="RISK SCORE"
                    value={`${selectedAnalysis.riskScore}/100`}
                  />
                  <ResultMetric
                    label="CHANGED FILES"
                    value={selectedAnalysis.changedFiles}
                  />
                  <ResultMetric
                    label="TOTAL CHANGES"
                    value={`+${selectedAnalysis.additions} / -${selectedAnalysis.deletions}`}
                  />
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold text-white">
                    Detected risk factors
                  </p>
                  {selectedAnalysis.riskFactors?.length ? (
                    selectedAnalysis.riskFactors.map((factor, index) => (
                      <div
                        key={index}
                        className="mb-2 flex gap-2 text-xs text-slate-400"
                      >
                        <AlertTriangle
                          size={14}
                          className="shrink-0 text-amber-400"
                        />
                        {factor}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">
                      No specific risk factors were detected.
                    </p>
                  )}
                </div>

                <div className="mt-5">
                  <p className="mb-3 text-xs font-semibold text-white">
                    Review checklist
                  </p>
                  {selectedAnalysis.checklist?.length ? (
                    selectedAnalysis.checklist.map((item, index) => (
                      <div
                        key={index}
                        className="mb-2 flex gap-2 text-xs text-slate-400"
                      >
                        <CheckCircle2
                          size={14}
                          className="shrink-0 text-emerald-400"
                        />
                        {item}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">
                      No checklist items are available for this analysis.
                    </p>
                  )}
                </div>

                {selectedAnalysis.htmlUrl && (
                  <a
                    href={selectedAnalysis.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    View pull request on GitHub
                    <ArrowUpRight size={14} />
                  </a>
                )}
              </section>
            )}

            {/* OVERVIEW METRICS */}
            {page === "Overview" && (
              <>
                <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    label="TOTAL ANALYSES"
                    value={total}
                    detail="Pull requests inspected"
                    icon={GitPullRequest}
                    iconColor="text-indigo-400"
                    iconBg="bg-indigo-400/10"
                    trend={<ArrowUpRight size={15} />}
                  />

                  <MetricCard
                    label="HIGH RISK PRs"
                    value={highRisk}
                    detail="High and critical risk"
                    icon={ShieldAlert}
                    iconColor="text-rose-400"
                    iconBg="bg-rose-400/10"
                    trend={<ArrowUpRight size={15} />}
                  />

                  <MetricCard
                    label="AVERAGE RISK"
                    value={`${averageRisk}%`}
                    detail="Across analyzed PRs"
                    icon={Activity}
                    iconColor="text-amber-400"
                    iconBg="bg-amber-400/10"
                    trend={<ArrowDownRight size={15} />}
                  />

                  <MetricCard
                    label="LOW RISK PRs"
                    value={lowRisk}
                    detail="Low risk classifications"
                    icon={ShieldCheck}
                    iconColor="text-emerald-400"
                    iconBg="bg-emerald-400/10"
                    trend={<CheckCircle2 size={15} />}
                  />
                </div>

                {/* ANALYTICS */}
                <div className="mb-7 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
                  <section className="rounded-2xl border border-white/[0.07] bg-[#101725] p-6">
                    <div className="mb-7 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          Risk distribution
                        </h3>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Classification of analyzed pull requests
                        </p>
                      </div>
                      <Activity size={18} className="text-slate-600" />
                    </div>

                    <div className="flex flex-wrap items-center gap-8">
                      <div
                        className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: total
                            ? `conic-gradient(#f43f5e 0% ${
                                (criticalRisk / total) * 100
                              }%, #f97316 ${
                                (criticalRisk / total) * 100
                              }% ${
                                ((criticalRisk + highOnly) / total) * 100
                              }%, #fbbf24 ${
                                ((criticalRisk + highOnly) / total) * 100
                              }% ${
                                ((criticalRisk + highOnly + mediumRisk) /
                                  total) *
                                100
                              }%, #34d399 ${
                                ((criticalRisk + highOnly + mediumRisk) /
                                  total) *
                                100
                              }% 100%)`
                            : "conic-gradient(#263246 0% 100%)",
                        }}
                      >
                        <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#101725]">
                          <span className="text-3xl font-bold text-white">
                            {total}
                          </span>
                          <span className="mt-1 text-[9px] tracking-wider text-slate-500">
                            TOTAL PRs
                          </span>
                        </div>
                      </div>

                      <div className="min-w-[150px] flex-1 space-y-4">
                        <Legend
                          color="bg-emerald-400"
                          label="Low risk"
                          value={lowRisk}
                        />
                        <Legend
                          color="bg-amber-400"
                          label="Medium risk"
                          value={mediumRisk}
                        />
                        <Legend
                          color="bg-orange-500"
                          label="High risk"
                          value={highOnly}
                        />
                        <Legend
                          color="bg-rose-500"
                          label="Critical risk"
                          value={criticalRisk}
                        />
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-white/[0.07] bg-[#101725] p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          Risk overview
                        </h3>
                        <p className="mt-1 text-[11px] text-slate-500">
                          PR classification summary
                        </p>
                      </div>
                      <ShieldCheck size={19} className="text-slate-600" />
                    </div>

                    <div className="space-y-6">
                      <RiskBar
                        label="Low"
                        count={lowRisk}
                        total={total}
                        color="bg-emerald-400"
                      />
                      <RiskBar
                        label="Medium"
                        count={mediumRisk}
                        total={total}
                        color="bg-amber-400"
                      />
                      <RiskBar
                        label="High"
                        count={highOnly}
                        total={total}
                        color="bg-orange-500"
                      />
                      <RiskBar
                        label="Critical"
                        count={criticalRisk}
                        total={total}
                        color="bg-rose-500"
                      />
                    </div>

                    <div className="mt-7 border-t border-white/[0.07] pt-5">
                      <p className="text-[11px] leading-5 text-slate-500">
                        Risk levels are based on the current MERGEMAP analysis
                        engine.
                      </p>
                    </div>
                  </section>
                </div>

                {/* RECENT ANALYSES */}
                <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101725]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] p-6">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Recent analyses
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Your latest inspected pull requests
                      </p>
                    </div>
                    <button
                      onClick={openHistory}
                      className="flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                    >
                      View history <ArrowRight size={14} />
                    </button>
                  </div>

                  <AnalysisTable
                    analyses={recentAnalyses}
                    fetching={fetching}
                    onSelect={openAnalysisDetails}
                  />
                </section>
              </>
            )}

            {/* ANALYSIS HISTORY */}
            {page === "Analysis History" && (
              <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101725]">
                <div className="flex items-center justify-between border-b border-white/[0.07] p-6">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      All analyses
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Your latest saved pull request reports
                    </p>
                  </div>
                  <button
                    onClick={loadAnalyses}
                    className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-white"
                    title="Refresh history"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>

                <AnalysisTable
                  analyses={analyses}
                  fetching={fetching}
                  onSelect={openAnalysisDetails}
                />
              </section>
            )}

            {/* ANALYZE PAGE DETAILS */}
            {page === "Analyze PR" && (
              <section className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.07] bg-[#101725] p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-400/10 p-2.5 text-indigo-400">
                      <ScanSearch size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        How analysis works
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Your PR review pipeline
                      </p>
                    </div>
                  </div>

                  {[
                    [
                      "01",
                      "Fetch pull request",
                      "Retrieve PR metadata and changed files from GitHub.",
                    ],
                    [
                      "02",
                      "Inspect modifications",
                      "Examine filenames, change volume and sensitive areas.",
                    ],
                    [
                      "03",
                      "Calculate risk",
                      "Apply risk rules and classify the pull request.",
                    ],
                    [
                      "04",
                      "Generate checklist",
                      "Produce actionable review recommendations.",
                    ],
                  ].map(([number, title, description]) => (
                    <div
                      key={number}
                      className="flex gap-4 border-t border-white/[0.06] py-4"
                    >
                      <span className="text-xs font-bold text-indigo-400">
                        {number}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">
                          {title}
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-slate-500">
                          {description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-[#101725] p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-400/10 p-2.5 text-emerald-400">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Analysis capabilities
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Current detection rules
                      </p>
                    </div>
                  </div>

                  {[
                    "Authentication and security changes",
                    "Database schema and migrations",
                    "Infrastructure and deployment changes",
                    "Dependency modifications",
                    "Deleted files",
                    "Large pull requests",
                    "Code changes without test-file changes",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 border-t border-white/[0.06] py-3 text-xs text-slate-400"
                    >
                      <CheckCircle2
                        size={15}
                        className="shrink-0 text-emerald-400"
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-6 text-[10px] text-slate-600">
              <span>MERGEMAP · Intelligent Pull Request Risk Analysis</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Local development environment
              </span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#101725] p-5 transition hover:border-white/[0.13]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[1.5px] text-slate-500">
          {label}
        </span>
        <div className={`rounded-lg p-2 ${iconBg} ${iconColor}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
          <p className="mt-2 text-[11px] text-slate-500">{detail}</p>
        </div>
        <span className={iconColor}>{trend}</span>
      </div>
    </div>
  );
}

function ResultMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
      <p className="text-[10px] tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function Legend({ color, label, value }) {
  return (
    <div className="flex items-center justify-between gap-5 text-xs">
      <div className="flex items-center gap-2.5 text-slate-400">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        {label}
      </div>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function RiskBar({ label, count, total, color }) {
  const percentage = total ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="mb-2 flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium text-slate-300">{count}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function AnalysisTable({ analyses, fetching, onSelect }) {
  if (fetching) {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-xs text-slate-500">
        <LoaderCircle size={17} className="animate-spin" />
        Loading analyses...
      </div>
    );
  }

  if (!analyses.length) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
        <div className="mb-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-slate-500">
          <GitPullRequest size={26} />
        </div>
        <h4 className="text-sm font-semibold text-slate-300">
          No analyses yet
        </h4>
        <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
          Analyze your first GitHub pull request to see its risk report here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left">
        <thead>
          <tr className="border-b border-white/[0.06] text-[10px] font-semibold tracking-wider text-slate-600">
            <th className="px-6 py-4">PULL REQUEST</th>
            <th className="px-6 py-4">AUTHOR</th>
            <th className="px-6 py-4">CHANGED FILES</th>
            <th className="px-6 py-4">RISK SCORE</th>
            <th className="px-6 py-4">RISK LEVEL</th>
          </tr>
        </thead>
        <tbody>
          {analyses.map((item) => (
            <tr
              key={item._id}
              onClick={() => onSelect(item)}
              className="cursor-pointer border-b border-white/[0.04] transition hover:bg-white/[0.025]"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-400/10 p-2 text-indigo-400">
                    <GitPullRequest size={16} />
                  </div>
                  <div>
                    <p className="max-w-[220px] truncate text-xs font-semibold text-slate-200">
                      {item.title || `Pull request #${item.prNumber}`}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      {item.owner}/{item.repo} · #{item.prNumber}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-xs text-slate-400">
                {item.author || "Unknown"}
              </td>
              <td className="px-6 py-4 text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <FileCode2 size={14} />
                  {item.changedFiles}
                </span>
              </td>
              <td className="px-6 py-4 text-xs font-bold text-white">
                {item.riskScore}/100
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold ${
                    riskColors[item.riskLevel] || ""
                  }`}
                >
                  {item.riskLevel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
