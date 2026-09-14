// ---------------------------------------------------------------------------
// TRACKS — this is the only part you need to edit to add your own songs.
// Drop the mp3 file in the /audio folder, then add an entry here.
//   title  – song title, shown in the serif type
//   file   – path to the mp3, relative to this file
//   note   – one line of context (what it's about, how it was recorded, etc.)
// Duration is read automatically from the file, so you don't need to set it.
// ---------------------------------------------------------------------------
const tracks = [
  {
    title: "Sunny's Gatcha Day Song (8/31/2026)",
    file: "audio/Sunnys-Song-(nom-nom-nom).mp3",
    note: "Working demo — unrequited-love song, verse in Em–Am–G, pre-chorus in G–Am–Em–C."
  },
  {
    title: "Track Two",
    file: "audio/02-track-two.mp3",
    note: "Replace this with your next song's title and a line about it."
  },
  {
    title: "Track Three",
    file: "audio/03-track-three.mp3",
    note: "Add as many of these as you like — the player scales automatically."
  }
];

// ---------------------------------------------------------------------------
// State + element refs
// ---------------------------------------------------------------------------
const audio = document.getElementById("audio");
const trackListEl = document.getElementById("track-list");

const npStatus = document.getElementById("np-status");
const npTitle = document.getElementById("np-title");
const npNote = document.getElementById("np-note");

const btnPlay = document.getElementById("btn-play");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const iconPlay = document.getElementById("icon-play");
const iconPause = document.getElementById("icon-pause");

const scrubber = document.getElementById("scrubber");
const scrubberFill = document.getElementById("scrubber-fill");
const scrubberHandle = document.getElementById("scrubber-handle");
const timeCurrent = document.getElementById("time-current");
const timeTotal = document.getElementById("time-total");

let currentIndex = null;
let isScrubbing = false;

// ---------------------------------------------------------------------------
// Render tracklist
// ---------------------------------------------------------------------------
function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function renderTracklist() {
  trackListEl.innerHTML = "";

  tracks.forEach((track, i) => {
    const li = document.createElement("li");
    li.className = "track";
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.setAttribute("aria-label", `Play ${track.title}`);
    li.dataset.index = i;

    li.innerHTML = `
      <span class="track-index">${String(i + 1).padStart(2, "0")}</span>
      <div class="track-body">
        <p class="track-title">${track.title}</p>
        <p class="track-note">${track.note || ""}</p>
      </div>
      <span class="track-duration" id="duration-${i}">--:--</span>
    `;

    li.addEventListener("click", () => selectTrack(i, true));
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectTrack(i, true);
      }
    });

    trackListEl.appendChild(li);
  });

  // Quietly probe each file's duration so the list shows real lengths
  // once you've added your own mp3s. Missing files just stay "--:--".
  tracks.forEach((track, i) => {
    const probe = new Audio();
    probe.preload = "metadata";
    probe.addEventListener("loadedmetadata", () => {
      const el = document.getElementById(`duration-${i}`);
      if (el) el.textContent = formatTime(probe.duration);
    });
    probe.addEventListener("error", () => {}, { once: true });
    probe.src = track.file;
  });
}

function highlightActiveTrack() {
  document.querySelectorAll(".track").forEach((el) => {
    el.classList.toggle("is-active", Number(el.dataset.index) === currentIndex);
  });
}

// ---------------------------------------------------------------------------
// Playback
// ---------------------------------------------------------------------------
function selectTrack(index, autoplay) {
  currentIndex = index;
  const track = tracks[index];

  audio.src = track.file;
  npStatus.textContent = `Track ${index + 1} of ${tracks.length}`;
  npTitle.textContent = track.title;
  npNote.textContent = track.note || "";

  highlightActiveTrack();
  resetScrubber();

  if (autoplay) {
    audio.play().catch(() => {
      // Autoplay can be blocked before any user gesture; the play
      // button still works normally once clicked.
    });
  }
}

function togglePlay() {
  if (currentIndex === null) {
    selectTrack(0, true);
    return;
  }
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

function playNext() {
  if (currentIndex === null) return;
  const next = (currentIndex + 1) % tracks.length;
  selectTrack(next, true);
}

function playPrev() {
  if (currentIndex === null) return;
  const prev = (currentIndex - 1 + tracks.length) % tracks.length;
  selectTrack(prev, true);
}

audio.addEventListener("play", () => {
  iconPlay.style.display = "none";
  iconPause.style.display = "";
});

audio.addEventListener("pause", () => {
  iconPlay.style.display = "";
  iconPause.style.display = "none";
});

audio.addEventListener("ended", playNext);

audio.addEventListener("timeupdate", () => {
  if (isScrubbing) return;
  updateScrubberFromAudio();
});

audio.addEventListener("loadedmetadata", () => {
  timeTotal.textContent = formatTime(audio.duration);
});

audio.addEventListener("error", () => {
  npStatus.textContent = "Couldn't load this file — check it's in /audio";
});

btnPlay.addEventListener("click", togglePlay);
btnNext.addEventListener("click", playNext);
btnPrev.addEventListener("click", playPrev);

// ---------------------------------------------------------------------------
// Scrubber
// ---------------------------------------------------------------------------
function resetScrubber() {
  scrubberFill.style.width = "0%";
  scrubberHandle.style.left = "0%";
  timeCurrent.textContent = "0:00";
  timeTotal.textContent = "0:00";
}

function updateScrubberFromAudio() {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  scrubberFill.style.width = `${pct}%`;
  scrubberHandle.style.left = `${pct}%`;
  timeCurrent.textContent = formatTime(audio.currentTime);
  scrubber.setAttribute("aria-valuenow", Math.round(pct));
}

function seekFromClientX(clientX) {
  if (!audio.duration) return;
  const rect = scrubber.getBoundingClientRect();
  const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  audio.currentTime = pct * audio.duration;
  scrubberFill.style.width = `${pct * 100}%`;
  scrubberHandle.style.left = `${pct * 100}%`;
}

scrubber.addEventListener("pointerdown", (e) => {
  isScrubbing = true;
  seekFromClientX(e.clientX);
  scrubber.setPointerCapture(e.pointerId);
});

scrubber.addEventListener("pointermove", (e) => {
  if (isScrubbing) seekFromClientX(e.clientX);
});

scrubber.addEventListener("pointerup", () => {
  isScrubbing = false;
});

scrubber.addEventListener("keydown", (e) => {
  if (!audio.duration) return;
  const step = 5;
  if (e.key === "ArrowRight") audio.currentTime = Math.min(audio.duration, audio.currentTime + step);
  if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - step);
});

// ---------------------------------------------------------------------------
// Global keyboard: spacebar toggles play when not typing in a control
// ---------------------------------------------------------------------------
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && e.target === document.body) {
    e.preventDefault();
    togglePlay();
  }
});

// ---------------------------------------------------------------------------
renderTracklist();
