export const translations = {
  en: {
    nav: {
      home: "Home",
      ofrenda: "Ofrenda",
      add: "Add memory",
      ask: "Ask",
      keepsake: "Keepsake",
      soundOn: "Sound On",
      soundOff: "Ambient",
    },
    home: {
      eyebrow: "Inspired by the Day of the Dead",
      heroTitle1: "Keep their light",
      heroTitle2: "burning.",
      heroDesc: "A private place to keep the stories of the people you love, their voices, recipes, songs and sayings, on an ofrenda that glows brighter each time you remember them.",
      visitOfrenda: "Visit the ofrenda",
      addMemory: "Add a memory",
      traditionEyebrow: "The tradition",
      traditionTitle: "An altar made of love",
      traditionP1: "Each year on November 1 and 2, families welcome back loved ones with an ofrenda: marigolds to guide them, candles to light the way, their favorite foods, and photographs. As long as someone remembers them, they are never truly gone.",
      traditionP2: "The Last Remembering brings that idea home all year, privately and offline.",
      howTitle: "Four gentle steps",
      steps: [
        ["Record", "Speak or write a story. Whisper transcribes it on your own device."],
        ["Confirm", "A local Gemma model suggests foods, songs and sayings. You approve each one."],
        ["Keep the light", "Each candle glows with the stories you add, and dims if someone goes unvisited."],
        ["Ask", "Answers come only from what you saved, always with a link to the source."]
      ],
      whyOpenTitle: "A memory should outlive a service",
      whyOpenItems: [
        ["Private", "Voices and photos of your family never reach a server you do not control."],
        ["Offline", "Works at a family gathering with no signal at all."],
        ["Durable", "Weights, database and files are yours. No shutdown can erase them."],
        ["Swappable", "Change the model any time and compare how it answers."]
      ],
      bottomTitle: "Begin with one person.",
      bottomDesc: "I did not grow up with this tradition. I am learning it, and this is how I honor the people in my own life.",
      startBtn: "Start remembering"
    },
    ofrenda: {
      eyebrow: "Memorial altar",
      title: "Your ofrenda",
      subtitle: "Each candle shows how recently and how richly someone has been remembered.",
      daysAgo: "days ago",
      unvisitedAlert: "has not been visited in",
      unvisitedAlertEnd: "days, and her candle is nearly out.",
      addStory: "Add a story"
    },
    person: {
      storiesKept: "stories kept",
      storyKept: "story kept",
      addPhoto: "Add a photo",
      photoSaved: "Photo added. It stays on this device.",
      foods: "Foods",
      songs: "Songs",
      sayings: "Sayings",
      stories: "Stories",
      noStories: "No stories yet. A single small memory is enough to light the candle.",
      addMemoryBtn: "Add memory",
      askBtn: "Ask"
    },
    add: {
      eyebrow: "New memory",
      title: "Add a memory",
      subtitle: "Record or write a story. Everything is processed on your own device.",
      whoLabel: "Who is this about?",
      titleLabel: "Title",
      storyLabel: "Story",
      storyPlaceholder: "Write it here, or press Record…",
      recordBtn: "Record Voice",
      recordingBtn: "Recording... Click to Stop",
      extractBtn: "Extract facts",
      saveBtn: "Save memory",
      proposedTitle: "Proposed facts",
      proposedDesc: "Nothing is saved until you approve it. Local Gemma model detects items with verbatim quotes.",
      noFactsFound: "No facts found yet. Try mentioning a favorite food, song, or saying.",
      savedSuccess: "Saved. The candle burns brighter.",
      transcribedSuccess: "Transcribed locally with Whisper",
      pipelineLabel: "Local pipeline",
      pipelineDesc: "Whisper → Gemma → your SQLite file"
    },
    ask: {
      eyebrow: "Search",
      title: "Ask a memory",
      subtitle: "Answers come only from stories you have saved. Nothing is invented.",
      everyone: "Everyone",
      placeholder: "What did Abuelo sing in the truck?",
      askBtn: "Ask",
      tryLabel: "Try:",
      notFound: "I don’t have a memory of that yet.",
      addOne: "Add one →",
      source: "SOURCE"
    },
    keepsake: {
      eyebrow: "Keepsake",
      title: "Remembrance page",
      subtitle: "A printable page to place beside the candle.",
      printBtn: "Print",
      listenBtn: "Listen (Piper TTS)",
      listeningBtn: "Speaking...",
      alwaysInMemory: "Always in our memory",
      defaultExcerpt: "Their story is still waiting to be told."
    },
    status: {
      burning: "Burning bright",
      glowing: "Glowing",
      fading: "Fading",
      dark: "Nearly dark"
    }
  },
  es: {
    nav: {
      home: "Inicio",
      ofrenda: "Ofrenda",
      add: "Añadir recuerdo",
      ask: "Preguntar",
      keepsake: "Recuerdo impreso",
      soundOn: "Sonido Activo",
      soundOff: "Ambiente",
    },
    home: {
      eyebrow: "Inspirado en el Día de los Muertos",
      heroTitle1: "Mantén su luz",
      heroTitle2: "encendida.",
      heroDesc: "Un espacio íntimo para preservar las historias, voces, recetas, canciones y dichos de quienes amas, en una ofrenda que brilla más cada vez que los recuerdas.",
      visitOfrenda: "Visitar la ofrenda",
      addMemory: "Añadir un recuerdo",
      traditionEyebrow: "La tradición",
      traditionTitle: "Un altar hecho de amor",
      traditionP1: "Cada año el 1 y 2 de noviembre, las familias dan la bienvenida a sus seres queridos con una ofrenda: cempasúchil para guiarlos, velas para alumbrar su camino, sus platillos favoritos y fotografías. Mientras alguien los recuerde, nunca se habrán ido del todo.",
      traditionP2: "The Last Remembering trae esa hermosa tradición a tu hogar todo el año, de forma privada y sin conexión.",
      howTitle: "Cuatro pasos serenos",
      steps: [
        ["Grabar", "Habla o escribe un relato. Whisper lo transcribe en tu propio dispositivo."],
        ["Confirmar", "Un modelo local Gemma sugiere comidas, canciones y frases. Tú apruebas cada una."],
        ["Mantener la llama", "Cada vela resplandece con las historias que añades y se atenúa si pasa tiempo sin visitas."],
        ["Preguntar", "Las respuestas provienen únicamente de lo guardado, siempre citando el recuerdo original."]
      ],
      whyOpenTitle: "Un recuerdo debe perdurar más que un servicio",
      whyOpenItems: [
        ["Privado", "Las voces y fotografías de tu familia jamás viajan a servidores que no controlas."],
        ["Sin conexión", "Funciona en reuniones familiares sin necesidad de señal o internet."],
        ["Duradero", "Los modelos, la base de datos y los archivos son tuyos. Ningún cierre de empresa los borrará."],
        ["Intercambiable", "Cambia el modelo en cualquier momento y compara sus respuestas."]
      ],
      bottomTitle: "Comienza con una persona.",
      bottomDesc: "No crecí con esta tradición. La estoy aprendiendo con profundo respeto para honrar a las personas en mi vida.",
      startBtn: "Comenzar a recordar"
    },
    ofrenda: {
      eyebrow: "Altar conmemorativo",
      title: "Tu ofrenda",
      subtitle: "Cada vela refleja cuán recientemente y con cuánta devoción ha sido recordada cada persona.",
      daysAgo: "días atrás",
      unvisitedAlert: "no ha sido visitada en",
      unvisitedAlertEnd: "días, y su vela está casi extinta.",
      addStory: "Añadir relato"
    },
    person: {
      storiesKept: "historias guardadas",
      storyKept: "historia guardada",
      addPhoto: "Añadir fotografía",
      photoSaved: "Fotografía guardada. Permanece en este dispositivo.",
      foods: "Platillos favoritos",
      songs: "Canciones",
      sayings: "Dichos y frases",
      stories: "Relatos",
      noStories: "Aún no hay historias. Un solo recuerdo basta para encender la vela.",
      addMemoryBtn: "Añadir recuerdo",
      askBtn: "Preguntar"
    },
    add: {
      eyebrow: "Nuevo recuerdo",
      title: "Añadir un recuerdo",
      subtitle: "Graba tu voz o escribe una historia. Todo se procesa localmente en tu equipo.",
      whoLabel: "¿Sobre quién es este recuerdo?",
      titleLabel: "Título",
      storyLabel: "Relato",
      storyPlaceholder: "Escríbelo aquí o presiona Grabar Voz…",
      recordBtn: "Grabar Voz",
      recordingBtn: "Grabando... Clic para detener",
      extractBtn: "Extraer detalles",
      saveBtn: "Guardar recuerdo",
      proposedTitle: "Detalles propuestos",
      proposedDesc: "Nada se guarda sin tu aprobación. El modelo local Gemma detecta elementos con citas textuales.",
      noFactsFound: "No se encontraron elementos aún. Menciona un platillo, canción o dicho.",
      savedSuccess: "Guardado. La llama resplandece con más fuerza.",
      transcribedSuccess: "Transcrito localmente con Whisper",
      pipelineLabel: "Procesamiento local",
      pipelineDesc: "Whisper → Gemma → tu archivo SQLite"
    },
    ask: {
      eyebrow: "Búsqueda en recuerdos",
      title: "Preguntar a la memoria",
      subtitle: "Las respuestas provienen únicamente de las historias que has guardado. Nada se inventa.",
      everyone: "Todos",
      placeholder: "¿Qué cantaba el Abuelo en la camioneta?",
      askBtn: "Preguntar",
      tryLabel: "Prueba con:",
      notFound: "Aún no tengo un recuerdo sobre eso.",
      addOne: "Añadir uno →",
      source: "FUENTE"
    },
    keepsake: {
      eyebrow: "Recuerdo conmemorativo",
      title: "Hoja de ofrenda",
      subtitle: "Una página lista para imprimir y colocar junto a la vela.",
      printBtn: "Imprimir",
      listenBtn: "Escuchar (Piper TTS)",
      listeningBtn: "Reproduciendo...",
      alwaysInMemory: "Siempre en nuestra memoria",
      defaultExcerpt: "Su historia aún está esperando ser contada."
    },
    status: {
      burning: "Llama viva",
      glowing: "Resplandeciente",
      fading: "Atenuándose",
      dark: "Casi extinta"
    }
  }
};
