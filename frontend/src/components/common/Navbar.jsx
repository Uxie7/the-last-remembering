export default function Navbar({ currentRoute, onNavigate }) {
  return (
    <nav>
      <div className="pill">
        <a className="logo" onClick={() => onNavigate("home")}>
          <svg width="26" height="26">
            <use href="#mg" width="26" height="26" />
          </svg>
          The Last Remembering
        </a>
        <a
          className={`l ${currentRoute === "home" ? "on" : ""}`}
          onClick={() => onNavigate("home")}
        >
          Home
        </a>
        <a
          className={`l ${
            currentRoute === "ofrenda" || currentRoute === "person" ? "on" : ""
          }`}
          onClick={() => onNavigate("ofrenda")}
        >
          Ofrenda
        </a>
        <a
          className={`l ${currentRoute === "add" ? "on" : ""}`}
          onClick={() => onNavigate("add")}
        >
          Add memory
        </a>
        <a
          className={`l ${currentRoute === "ask" ? "on" : ""}`}
          onClick={() => onNavigate("ask")}
        >
          Ask
        </a>
        <a
          className={`l ${currentRoute === "export" ? "on" : ""}`}
          onClick={() => onNavigate("export")}
        >
          Keepsake
        </a>
      </div>
    </nav>
  );
}
