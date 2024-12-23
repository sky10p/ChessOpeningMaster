import * as React from "react";
import ReactDOM from "react-dom/client";
import "typeface-roboto";
import "./tailwind-home.css";

/** Estructura de un repertorio */
interface Repertoire {
  id: number;
  name: string;
  description: string;
  tags: string[];
}

/** Posibles secciones o "tabs" del menú */
type Tab = "Dashboard" | "Repertoires" | "Favorites" | "Settings";

const App = () => {
  /***************************************************************************
   * 1. ESTADOS PRINCIPALES
   ***************************************************************************/
  // Control del menú lateral (responsive)
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Sección o "tab" actual
  const [currentTab, setCurrentTab] = React.useState<Tab>("Dashboard");

  // Lista de repertorios
  const [repertoires, setRepertoires] = React.useState<Repertoire[]>([
    {
      id: 1,
      name: "Repertoire 1",
      description: "King's Indian Defense",
      tags: ["Black", "Aggressive"],
    },
    {
      id: 2,
      name: "Repertoire 2",
      description: "Ruy Lopez",
      tags: ["White", "Classical"],
    },
    {
      id: 3,
      name: "Repertoire 3",
      description: "Sicilian Defense",
      tags: ["Black", "Counterplay"],
    },
    {
      id: 4,
      name: "Repertoire 4",
      description: "French Defense",
      tags: ["Black", "Solid"],
    },
    {
      id: 5,
      name: "Repertoire 5",
      description: "Italian Game",
      tags: ["White", "Classical"],
    },
    {
      id: 6,
      name: "Repertoire 6",
      description: "Caro-Kann Defense",
      tags: ["Black", "Solid"],
    },
    {
      id: 7,
      name: "Repertoire 7",
      description: "Scandinavian Defense",
      tags: ["Black", "Counterplay"],
    },
    {
      id: 8,
      name: "Repertoire 8",
      description: "Queen's Gambit",
      tags: ["White", "Aggressive"],
    },
  ]);

  // --- Estados para búsqueda y filtrado en Repertoires ---
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedTag, setSelectedTag] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  // --- Modal para crear/editar repertorios ---
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [modalRepertoire, setModalRepertoire] = React.useState<Repertoire>({
    id: 0,
    name: "",
    description: "",
    tags: [],
  });

  const [isFavoritesOpen, setIsFavoritesOpen] = React.useState(false);

  /***************************************************************************
   * 2. FUNCIONES GENERALES
   ***************************************************************************/

  /** Permite cambiar de sección y cierra el menú (en móvil). */
  const selectTab = (tab: Tab) => {
    setCurrentTab(tab);
    setIsMenuOpen(false);
  };

  /***************************************************************************
   * 3. CREAR / EDITAR / ELIMINAR REPERTORIOS
   ***************************************************************************/

  /** Abre el modal en modo "crear" */
  const openCreateModal = () => {
    setIsEditMode(false);
    setModalRepertoire({
      id: new Date().getTime(), // Generamos un ID simple para el nuevo
      name: "",
      description: "",
      tags: [],
    });
    setIsModalOpen(true);
  };

  /** Abre el modal en modo "editar" */
  const openEditModal = (rep: Repertoire) => {
    setIsEditMode(true);
    setModalRepertoire(rep);
    setIsModalOpen(true);
  };

  /** Cierra el modal */
  const closeModal = () => {
    setIsModalOpen(false);
  };

  /** Maneja cambios en el formulario del modal */
  const handleModalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setModalRepertoire((prev) => ({ ...prev, [name]: value }));
  };

  /** Guarda el repertorio (nuevo o editado) */
  const saveRepertoire = () => {
    if (!modalRepertoire.name.trim()) {
      alert("El nombre del repertorio no puede estar vacío.");
      return;
    }

    if (isEditMode) {
      // Editar
      setRepertoires((prev) =>
        prev.map((r) => (r.id === modalRepertoire.id ? modalRepertoire : r))
      );
    } else {
      // Crear
      setRepertoires((prev) => [...prev, modalRepertoire]);
    }
    setIsModalOpen(false);
  };

  /** Elimina un repertorio */
  const deleteRepertoire = (id: number) => {
    setRepertoires((prev) => prev.filter((rep) => rep.id !== id));
  };

  const toggleFavorite = (id: number) => {
    setRepertoires((prev) =>
      prev.map((rep) =>
        rep.id === id
          ? {
              ...rep,
              tags: rep.tags.includes("Favorite")
                ? rep.tags.filter((tag) => tag !== "Favorite")
                : [...rep.tags, "Favorite"],
            }
          : rep
      )
    );
  };

  /***************************************************************************
   * 4. FILTRADO Y PAGINACIÓN DE REPERTORIOS
   ***************************************************************************/
  // Filtrado por nombre y por tag
  const filteredRepertoires = repertoires
    .filter((r) => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((r) => (selectedTag ? r.tags.includes(selectedTag) : true));

  // Lógica de paginación
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredRepertoires.length / itemsPerPage);
  const paginatedRepertoires = filteredRepertoires.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /** Reinicia paginación al cambiar la búsqueda, los tags o la lista */
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTag, repertoires]);

  const favorites = repertoires.filter((rep) => rep.tags.includes("Favorite"));

  /***************************************************************************
   * 5. RENDERIZADO DE SECCIONES
   ***************************************************************************/

  /** Sección: Dashboard */
  const renderDashboard = () => (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-accent tracking-wide">Dashboard</h2>
      <p className="text-textDark">
        Aquí podrías mostrar métricas generales, estadísticas de uso, etc.
      </p>
    </section>
  );

  const exportRepertoires = () => {
    // ...placeholder function...
    alert("Exporting repertoires...");
  };

  /** Sección: Repertoires (con búsqueda, filtrado y paginación) */
  const renderRepertoires = () => (
    <section className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-accent tracking-wide">
          Tus Repertorios
        </h2>
        <div className="space-x-2">
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-accent text-primary rounded hover:bg-accent/80 transition"
          >
            Añadir Repertorio
          </button>
          <button
            onClick={exportRepertoires}
            className="px-4 py-2 bg-secondary text-textLight rounded hover:bg-secondary/80 transition"
          >
            Exportar
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Buscar repertorios..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 bg-secondary text-textLight rounded border border-primary focus:outline-none focus:ring-2 focus:ring-accent"
      />

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["All", "White", "Black", "Aggressive", "Classical", "Solid", "Counterplay"].map(
          (tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === "All" ? "" : tag)}
              className={`px-3 py-1 rounded ${
                selectedTag === tag
                  ? "bg-accent text-primary"
                  : "bg-secondary text-textLight hover:bg-secondary/80"
              }`}
            >
              {tag}
            </button>
          )
        )}
      </div>

      {/* Lista de repertorios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedRepertoires.map((rep) => (
          <div
            key={rep.id}
            className="p-6 bg-primary rounded-lg shadow-md hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg">{rep.name}</h3>
            <p className="text-sm text-textDark mt-2">{rep.description}</p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {rep.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs py-1 px-2 bg-secondary text-textLight rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                className={`px-4 py-2 rounded transition ${
                  rep.tags.includes("Favorite")
                    ? "bg-yellow-500 text-primary hover:bg-yellow-400"
                    : "bg-secondary text-textLight hover:bg-secondary/80"
                }`}
                onClick={() => toggleFavorite(rep.id)}
              >
                {rep.tags.includes("Favorite") ? "Unfavorite" : "Favorite"}
              </button>
              <button
                className="px-4 py-2 bg-accent text-primary rounded hover:bg-accent/80 transition"
                onClick={() => openEditModal(rep)}
              >
                Edit
              </button>
              <button
                className="px-4 py-2 bg-danger text-textLight rounded hover:bg-danger/80 transition"
                onClick={() => deleteRepertoire(rep.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-accent text-primary"
                  : "bg-secondary text-textLight hover:bg-secondary/80"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </section>
  );

  /** Sección: Settings */
  const renderSettings = () => (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-accent tracking-wide">Settings</h2>
      <p className="text-textDark">
        Configuración de la cuenta, preferencias de la aplicación, etc.
      </p>
    </section>
  );

  /***************************************************************************
   * 6. RETURN PRINCIPAL (RENDER GENERAL)
   ***************************************************************************/
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-background text-textLight">
      {/* Header */}
      <header className="bg-primary shadow-md p-4 flex items-center gap-4">
        <button
          className="sm:hidden p-2 bg-secondary text-textLight rounded-md hover:bg-secondary/80 transition"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className={`${isMenuOpen ? "rotate-90" : ""} w-6 h-6 transition-transform`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-accent tracking-wide">ChessKeep</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-transparent z-20 sm:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
        <aside
          className={`bg-secondary p-4 shadow-lg transition-all sm:w-64 sm:flex-shrink-0 sm:overflow-y-auto
            ${isMenuOpen
              ? "absolute inset-y-0 left-0 w-64 translate-x-0 z-30 pointer-events-auto sm:relative sm:translate-x-0 sm:z-auto"
              : "absolute inset-y-0 left-0 w-0 -translate-x-full overflow-hidden pointer-events-none sm:pointer-events-auto sm:relative sm:translate-x-0 sm:z-auto"}
          `}
        >
          <nav className="space-y-4">
            <button
              onClick={() => selectTab("Dashboard")}
              className={`block w-full text-left text-textLight font-medium p-2 rounded hover:bg-accent hover:text-primary transition ${
                currentTab === "Dashboard" ? "bg-accent text-primary" : ""
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => selectTab("Repertoires")}
              className={`block w-full text-left text-textLight font-medium p-2 rounded hover:bg-accent hover:text-primary transition ${
                currentTab === "Repertoires" ? "bg-accent text-primary" : ""
              }`}
            >
              Repertoires
            </button>
            <button
              onClick={() => {
                setIsFavoritesOpen(!isFavoritesOpen);
              }}
              className="block w-full text-left text-textLight font-medium p-2 rounded hover:bg-accent hover:text-primary transition flex justify-between items-center"
            >
              Favorites
              <svg
                className={`w-4 h-4 transition-transform ${isFavoritesOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isFavoritesOpen && (
              <div className="mt-2 max-h-40 overflow-y-auto">
                {favorites.length === 0 ? (
                  <p className="text-sm text-textDark">No hay favoritos aún.</p>
                ) : (
                  <ul className="space-y-2">
                    {favorites.map((fav) => (
                      <li key={fav.id} className="p-2 bg-primary rounded">
                        <h4 className="font-bold">{fav.name}</h4>
                        <p className="text-xs text-textDark">{fav.description}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <button
              onClick={() => selectTab("Settings")}
              className={`block w-full text-left text-textLight font-medium p-2 rounded hover:bg-accent hover:text-primary transition ${
                currentTab === "Settings" ? "bg-accent text-primary" : ""
              }`}
            >
              Settings
            </button>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto px-4 sm:p-6 scrollbar-custom">
          {currentTab === "Dashboard" && renderDashboard()}
          {currentTab === "Repertoires" && renderRepertoires()}
          {currentTab === "Settings" && renderSettings()}
        </main>
      </div>

      {/** Modal para crear o editar repertorios */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary text-textLight p-6 rounded shadow-lg w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-textDark hover:text-accent"
              onClick={closeModal}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">
              {isEditMode ? "Editar Repertorio" : "Crear Repertorio"}
            </h2>

            {/* FORMULARIO DENTRO DEL MODAL */}
            <label className="block mb-2">
              <span className="text-sm text-textLight">Nombre</span>
              <input
                type="text"
                name="name"
                value={modalRepertoire.name}
                onChange={handleModalChange}
                className="block w-full mt-1 p-2 rounded bg-background text-textLight border border-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>

            <label className="block mb-2">
              <span className="text-sm text-textLight">Descripción</span>
              <textarea
                name="description"
                rows={3}
                value={modalRepertoire.description}
                onChange={handleModalChange}
                className="block w-full mt-1 p-2 rounded bg-background text-textLight border border-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>

            <label className="block mb-4">
              <span className="text-sm text-textLight">Tags (separadas por comas)</span>
              <input
                type="text"
                name="tags"
                value={modalRepertoire.tags.join(", ")}
                onChange={(e) =>
                  setModalRepertoire({
                    ...modalRepertoire,
                    tags: e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
                className="block w-full mt-1 p-2 rounded bg-background text-textLight border border-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>

            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-secondary text-textLight rounded hover:bg-secondary/80 transition"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-accent text-primary rounded hover:bg-accent/80 transition"
                onClick={saveRepertoire}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/** Montaje de la app en el root principal (index.html). */
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
