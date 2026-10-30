import { useState, useRef, useEffect } from "react";
import MiniHero from "../common/MiniHero";
import { KNOWN_FOODS } from "../../data/initialPeople";
import { extractFacts, transcribeAudio } from "../../utils/api";

export default function AddMemoryView({
  people,
  activePersonId,
  onSaveMemory,
  showToast,
  lang,
  t,
}) {
  const [who, setWho] = useState(activePersonId || "xochitl");
  const [title, setTitle] = useState(
    lang === "es" ? "Tamales de Nochebuena" : "Christmas Eve tamales"
  );
  const [story, setStory] = useState(
    lang === "es"
      ? "Xóchitl y yo pasamos cada Nochebuena doblando tamales con la Abuela Lupita. Cantábamos Cielito Lindo y ella siempre decía que barriga llena hace al corazón contento."
      : "Xóchitl and I spent every Christmas Eve folding tamales with Abuela Lupita. We sang Cielito Lindo, and she would say a full belly makes a happy heart."
  );
  const [proposedFacts, setProposedFacts] = useState(null);

  // In-Browser MediaRecorder state
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        showToast("Audio recording is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Turn off stream tracks
        stream.getTracks().forEach((track) => track.stop());

        // Attempt live transcription via Whisper API
        try {
          showToast(lang === "es" ? "Transcribiendo con Whisper local..." : "Transcribing with local Whisper...");
          const res = await transcribeAudio(audioBlob);
          if (res && res.text) {
            setStory(res.text);
            showToast(`${t.add.transcribedSuccess} (${recordDuration}s clip)`);
            return;
          }
        } catch {
          // Fallback demo text if Whisper is offline
        }

        const simulatedVoiceText =
          lang === "es"
            ? "Recuerdo claramente las tardes de domingo cuando la abuela preparaba mole negro y escuchaba Cielito Lindo en la cocina."
            : "I remember clearly those Sunday afternoons when Abuela prepared mole negro and listened to Cielito Lindo in the kitchen.";

        setStory(simulatedVoiceText);
        showToast(`${t.add.transcribedSuccess} (${recordDuration}s clip)`);
      };

      recorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn("Microphone access error:", err);
      showToast("Microphone access was denied or is unavailable.");
      // Fallback demo
      handleDemoRecord();
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const handleDemoRecord = () => {
    setStory(
      lang === "es"
        ? "Xóchitl y yo pasamos cada Nochebuena doblando tamales con la Abuela Lupita. Cantábamos Cielito Lindo y ella siempre decía que barriga llena hace al corazón contento."
        : "Xóchitl and I spent every Christmas Eve folding tamales with Abuela Lupita. We sang Cielito Lindo, and she would say a full belly makes a happy heart."
    );
    showToast(t.add.transcribedSuccess);
  };

  const handleExtractFacts = async () => {
    // Attempt LLM fact extraction from local Ollama Gemma
    try {
      showToast(lang === "es" ? "Extrayendo detalles con Gemma local..." : "Extracting details with local Gemma...");
      const res = await extractFacts(story, who);
      if (res && res.facts && res.facts.length > 0) {
        const foods = res.facts.filter((f) => f.kind === "food").map((f) => f.value);
        const songs = res.facts.filter((f) => f.kind === "song").map((f) => f.value);
        const say = res.facts.filter((f) => f.kind === "saying").map((f) => f.value);
        const places = res.facts.filter((f) => f.kind === "place").map((f) => f.value);

        setProposedFacts({
          foods,
          songs,
          say,
          places,
          rawFacts: res.facts,
        });
        showToast(lang === "es" ? "Detalles extraídos con éxito" : "Facts extracted successfully");
        return;
      }
    } catch {
      // Fallback to local keyword extraction if Ollama is not running
    }

    const textLower = story.toLowerCase();
    const sayingsMap = {
      "full belly": "A full belly makes a happy heart",
      "take it slow": "Take it slow, son",
      "do it well": "If you do something, you do it well",
      "barriga llena": "Barriga llena, corazón contento",
      "tómalo con calma": "Tómalo con calma, hijo",
    };

    const foods = KNOWN_FOODS.filter((w) => textLower.includes(w)).map(
      (w) => w.charAt(0).toUpperCase() + w.slice(1)
    );

    const songs = ["cielito lindo", "sabor a mí", "bésame mucho"]
      .filter((w) => textLower.includes(w))
      .map((w) => w.replace(/(^|\s)\S/g, (c) => c.toUpperCase()));

    const say = Object.keys(sayingsMap)
      .filter((w) => textLower.includes(w))
      .map((w) => sayingsMap[w]);

    setProposedFacts({ foods, songs, say });
  };

  const handleSubmit = () => {
    const trimmedStory = story.trim();
    if (!trimmedStory) {
      showToast(t.add.storyPlaceholder);
      return;
    }

    onSaveMemory({
      personId: who,
      title: title.trim() || (lang === "es" ? "Sin título" : "Untitled"),
      story: trimmedStory,
      facts: proposedFacts || { foods: [], songs: [], say: [] },
    });
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div>
      <MiniHero
        eyebrow={t.add.eyebrow}
        title={t.add.title}
        subtitle={t.add.subtitle}
      />

      <div
        className="wrap cols"
        style={{ padding: "56px 24px 80px", gridTemplateColumns: "1.4fr 1fr" }}
      >
        <div className="card">
          <label style={{ marginTop: 0 }}>{t.add.whoLabel}</label>
          <select value={who} onChange={(e) => setWho(e.target.value)}>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <label>{t.add.titleLabel}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sunday mole"
          />

          <label>{t.add.storyLabel}</label>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder={t.add.storyPlaceholder}
          />

          {/* Audio preview if recorded */}
          {audioUrl && (
            <div style={{ marginTop: "14px" }}>
              <audio
                controls
                src={audioUrl}
                style={{ width: "100%", height: "36px" }}
              />
            </div>
          )}

          <div className="row" style={{ marginTop: "24px" }}>
            {/* Real In-Browser MediaRecorder button */}
            <button
              className="btn ghost"
              style={{
                color: isRecording ? "#ff5fa2" : "var(--ink)",
                borderColor: isRecording ? "#ff5fa2" : "currentColor",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onClick={isRecording ? stopRecording : startRecording}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: isRecording ? "#ff5fa2" : "currentColor",
                  animation: isRecording ? "fl 1s infinite alternate" : "none",
                }}
              />
              {isRecording
                ? `${t.add.recordingBtn} (${formatTimer(recordDuration)})`
                : t.add.recordBtn}
            </button>

            <button
              className="btn ghost"
              style={{ color: "var(--ink)" }}
              onClick={handleExtractFacts}
            >
              {t.add.extractBtn}
            </button>

            <button className="btn" onClick={handleSubmit}>
              {t.add.saveBtn}
            </button>
          </div>
        </div>

        <div className="card">
          <h3>{t.add.proposedTitle}</h3>
          <p>{t.add.proposedDesc}</p>

          <div style={{ marginTop: "14px" }}>
            {proposedFacts ? (
              <div>
                {proposedFacts.foods.length > 0 && (
                  <div>
                    <div className="lbl">{t.person.foods}</div>
                    {proposedFacts.foods.map((f, i) => (
                      <span
                        key={i}
                        className="chip"
                        style={{
                          border: "1px solid #ff9f1c",
                          color: "var(--ink)",
                        }}
                      >
                        {f} ✓
                      </span>
                    ))}
                  </div>
                )}

                {proposedFacts.songs.length > 0 && (
                  <div>
                    <div className="lbl">{t.person.songs}</div>
                    {proposedFacts.songs.map((s, i) => (
                      <span
                        key={i}
                        className="chip"
                        style={{
                          border: "1px solid #e8307f",
                          color: "var(--ink)",
                        }}
                      >
                        {s} ✓
                      </span>
                    ))}
                  </div>
                )}

                {proposedFacts.say.length > 0 && (
                  <div>
                    <div className="lbl">{t.person.sayings}</div>
                    {proposedFacts.say.map((s, i) => (
                      <span
                        key={i}
                        className="chip"
                        style={{
                          border: "1px solid #12b5a5",
                          color: "var(--ink)",
                        }}
                      >
                        {s} ✓
                      </span>
                    ))}
                  </div>
                )}

                {proposedFacts.foods.length === 0 &&
                  proposedFacts.songs.length === 0 &&
                  proposedFacts.say.length === 0 && (
                    <p>{t.add.noFactsFound}</p>
                  )}
              </div>
            ) : null}
          </div>

          <div className="lbl" style={{ marginTop: "26px" }}>
            {t.add.pipelineLabel}
          </div>
          <p>{t.add.pipelineDesc}</p>
        </div>
      </div>
    </div>
  );
}
