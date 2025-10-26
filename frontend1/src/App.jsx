import React, { useState } from "react";

// === Icônes SVG inline (zéro dépendance externe) ===
const Icon = ({ name, className = "w-5 h-5", color = "currentColor" }) => {
  const icons = {
    Search: (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    Loader2: (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className="animate-spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    ),
    MapPin: (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    Briefcase: (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <rect x="2" y="7" width="20" height="15" rx="2" />
        <path d="M16 21V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v17" />
      </svg>
    ),
    CalendarDays: (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  };
  return <i className={className}>{icons[name]}</i>;
};

// === Sidebar (fixe, élégante, minimaliste) ===
const Sidebar = () => (
  <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col justify-between p-6 z-50">
    <div>
      {/* Logo */}
      <div className="flex items-center mb-10">
        <div className="w-10 h-10 bg-indigo-600 text-white font-bold text-lg flex items-center justify-center rounded-lg mr-3">
          W
        </div>
        <h1 className="text-xl font-extrabold text-gray-800">WWWORK</h1>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium shadow-md hover:bg-indigo-700 transition">
          <Icon name="Briefcase" color="white" /> Job Board
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 transition">
          <Icon name="CalendarDays" color="#6366F1" /> Schedule
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 transition">
          💬 Messenger
        </a>
      </nav>

      {/* Upgrade Card simple et légère */}
      <div className="mt-10 bg-indigo-50 rounded-2xl p-4 text-center">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Get Pro Access</h3>
        <p className="text-xs text-gray-500 mb-3">Unlock advanced features.</p>
        <button className="bg-indigo-600 text-white text-xs font-semibold px-3 py-2 rounded-full hover:bg-indigo-700 transition">
          Learn more
        </button>
      </div>
    </div>

    <div className="mt-10 flex items-center justify-center text-sm text-gray-400">
      © 2025 Khadija Mouhtaj
    </div>
  </aside>
);

// === Carte de job stylée ===
const JobCard = ({ job }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-indigo-500 transition-all duration-300">
    <h3 className="text-lg font-bold text-gray-800 mb-1">{job.Job_Title}</h3>
    <p className="text-gray-600 text-sm">{job.Company}</p>
    <p className="text-gray-500 text-sm flex items-center mt-1">
      <Icon name="MapPin" className="w-4 h-4 mr-1 text-gray-400" />
      {job.Location}
    </p>
    <div className="mt-3 flex justify-between items-center">
      <a
        href={job.Link}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition shadow"
      >
        Voir l'offre
      </a>
    <span
  className={`text-xs px-2 py-1 rounded-full font-medium ${
    job.Source?.toLowerCase() === "linkedin"
      ? "bg-blue-50 text-blue-700"
      : "bg-indigo-50 text-indigo-700"
  }`}
>
  {job.Source === "LinkedIn" ? "LinkedIn" : "Indeed"}
</span>


    </div>
  </div>
);

// === Loader moderne (sans image) ===
const LoadingOverlay = () => (
  <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
    <div className="relative">
      <Icon name="Loader2" className="w-12 h-12 text-indigo-600 mb-4" />
      <div className="absolute inset-0 blur-xl opacity-50 bg-indigo-400/30 rounded-full animate-pulse"></div>
    </div>
    <p className="text-indigo-600 font-medium animate-pulse">
      Analyse et extraction des offres en cours...
    </p>
  </div>
);

// === Application principale ===
export default function App() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("maroc");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setMessage("❗ Entrez un mot-clé pour démarrer la recherche.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/scrape?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`
      );
      const data = await response.json();

      if (data.status === "success") {
        
        setJobs(data.jobs);
      } else {
        setJobs([]);
        setMessage("❌ Aucune offre trouvée.");
      }
    } catch (error) {
      console.error(error);
      setMessage("🚨 Erreur de connexion au backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar fixée */}
      <Sidebar />

      {/* Contenu principal */}
      <main className="flex-grow ml-64 p-8 overflow-y-auto transition-all duration-300">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Job Board</h1>
          <p className="text-gray-500">Recherchez des offres réelles depuis Indeed et LinkedIn.</p>
        </header>

        <form
          onSubmit={handleScrape}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-10"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Icon
                name="Search"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Ex : Data Analyst, React Developer..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" className="w-5 h-5 mr-2" />
                  Recherche...
                </>
              ) : (
                <>
                  <Icon name="Search" className="w-5 h-5 mr-2" />
                  Lancer
                </>
              )}
            </button>
          </div>
        </form>

        {loading ? (
          <LoadingOverlay />
        ) : jobs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job, index) => (
              <JobCard key={index} job={job} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10">{message || "Aucune offre à afficher."}</p>
        )}
      </main>
    </div>
  );
}
