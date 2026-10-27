/* =========================================================
   Typing Master  –  Speed Test + Word Rain Game
   HTML + CSS + JavaScript only
   ========================================================= */
const $ = id => document.getElementById(id);

/* ---------- Dark mode ---------- */
function applyTheme(dark){
  document.body.classList.toggle("dark", dark);
  $("themeBtn").textContent = dark ? "☀️" : "🌙";
}
let darkOn = false;
try { darkOn = localStorage.getItem("tm_dark") === "1"; } catch(e){}
applyTheme(darkOn);
$("themeBtn").addEventListener("click", () => {
  darkOn = !darkOn;
  applyTheme(darkOn);
  try { localStorage.setItem("tm_dark", darkOn ? "1" : "0"); } catch(e){}
});

/* ---------- Best score helpers ---------- */
function getBest(key){ try { return parseInt(localStorage.getItem(key)) || 0; } catch(e){ return 0; } }
function setBest(key, v){ try { localStorage.setItem(key, v); } catch(e){} }

/* ---------- Tabs ---------- */
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const mode = btn.dataset.mode;
    $("testMode").classList.toggle("hidden", mode !== "test");
    $("gameMode").classList.toggle("hidden", mode !== "game");
    if (mode === "test") { stopGame(false); resetTest(); }
    else { clearInterval(timerId); }
  });
});

/* ---------- Result popup ---------- */
let modalAction = null;
function showModal(title, items, btnText, action){
  $("mTitle").textContent = title;
  $("mBody").innerHTML = items.map(i => `<div><b>${i[1]}</b><small>${i[0]}</small></div>`).join("");
  $("mBtn").textContent = btnText;
  modalAction = action;
  $("modal").classList.remove("hidden");
}
$("mBtn").addEventListener("click", () => {
  $("modal").classList.add("hidden");
  if (modalAction) modalAction();
});

/* =========================================================
   1) SPEED TEST
   ========================================================= */
const TEXTS = {
  easy: [
    "The sun is bright and the sky is blue. We go to school by bus and meet our friends every day.",
    "I like to read books in the evening. My mother makes tea and we sit together near the window.",
    "A small cat sat on the mat. It looked at the bird in the tree and then went back to sleep."
  ],
  medium: [
    "Learning to type fast takes regular practice. Keep your fingers on the home row and try not to look at the keyboard while you write.",
    "A good developer writes clean code, tests every feature and keeps learning new tools. Small projects teach big lessons about problem solving.",
    "Students who practise a little every day improve much faster than those who study only before the exam. Consistency is the real secret."
  ],
  hard: [
    "JavaScript runs in the browser, handles events, updates the DOM dynamically, and can fetch data asynchronously; however, poorly structured code quickly becomes difficult to debug.",
    "\"Responsive design\" isn't optional anymore: layouts must adapt to phones, tablets & desktops, while performance (loading time, images, scripts) stays under control.",
    "Version control systems, such as Git, let teams collaborate safely; commits, branches, and pull requests record every change (and who made it) in detail."
  ]
};

let text = "", totalTime = 60, timeLeft = 60, timerId = null, started = false;
let doneCorrect = 0, doneTyped = 0, doneMistakes = 0;
let curCorrect = 0, curTyped = 0, curMistakes = 0;

function loadText(){
  const list = TEXTS[$("difficulty").value];
  text = list[Math.floor(Math.random() * list.length)];
  $("textBox").innerHTML = text.split("").map(ch => `<span>${ch}</span>`).join("");
  $("typeInput").value = "";
  curCorrect = curTyped = curMistakes = 0;
}

function resetTest(){
  clearInterval(timerId);
  started = false;
  totalTime = parseInt($("duration").value);
  timeLeft = totalTime;
  doneCorrect = doneTyped = doneMistakes = 0;
  loadText();
  $("typeInput").disabled = false;
  $("tTime").textContent = timeLeft;
  $("tWpm").textContent = 0;
  $("tAcc").textContent = "100%";
  $("tMis").textContent = 0;
  $("tBest").textContent = getBest("tm_best_wpm");
  $("typeInput").focus();
}

function calcStats(){
  const correct = doneCorrect + curCorrect;
  const typed = doneTyped + curTyped;
  const mistakes = doneMistakes + curMistakes;
  const elapsed = totalTime - timeLeft;
  const wpm = elapsed > 0 ? Math.round((correct / 5) / (elapsed / 60)) : 0;
  const acc = typed > 0 ? Math.round((correct / typed) * 100) : 100;
  return { wpm, acc, mistakes };
}

function renderStats(){
  const s = calcStats();
  $("tWpm").textContent = s.wpm;
  $("tAcc").textContent = s.acc + "%";
  $("tMis").textContent = s.mistakes;
}

function startTimer(){
  started = true;
  timerId = setInterval(() => {
    timeLeft--;
    $("tTime").textContent = timeLeft;
    renderStats();
    if (timeLeft <= 0) finishTest();
  }, 1000);
}

$("typeInput").addEventListener("input", () => {
  if (!started) startTimer();
  const letters = $("textBox").querySelectorAll("span");
  const typed = $("typeInput").value.split("");
  curCorrect = curMistakes = 0;
  curTyped = typed.length;

  letters.forEach((span, i) => {
    span.className = "";
    if (typed[i] == null) return;
    if (typed[i] === span.textContent){ span.className = "correct"; curCorrect++; }
    else { span.className = "wrong"; curMistakes++; }
  });
  if (letters[typed.length]) letters[typed.length].classList.add("current");

  // paragraph poora ho gaya -> agla paragraph
  if (typed.length >= letters.length){
    doneCorrect += curCorrect; doneTyped += curTyped; doneMistakes += curMistakes;
    loadText();
  }
  renderStats();
});

function finishTest(){
  clearInterval(timerId);
  $("typeInput").disabled = true;
  const s = calcStats();
  const best = getBest("tm_best_wpm");
  let title = "⏱️ Time's up!";
  if (s.wpm > best){ setBest("tm_best_wpm", s.wpm); title = "🏆 New Best Score!"; }
  $("tBest").textContent = getBest("tm_best_wpm");
  showModal(title, [["WPM", s.wpm], ["Accuracy", s.acc + "%"], ["Mistakes", s.mistakes], ["Best WPM", getBest("tm_best_wpm")]], "Try Again", resetTest);
}

$("restartTest").addEventListener("click", resetTest);
$("difficulty").addEventListener("change", resetTest);
$("duration").addEventListener("change", resetTest);
resetTest();

/* =========================================================
   2) WORD RAIN GAME
   ========================================================= */
const WORDS = {
  short:  ["cat","sun","pen","book","tree","rain","milk","ship","lamp","road","fish","door","star","moon","cake","bird","hand","code","exam","mouse","chair","table","bread","clock"],
  medium: ["planet","garden","window","school","bridge","coffee","silver","pocket","market","orange","laptop","screen","python","result","college","project","browser","program"],
  long:   ["keyboard","computer","football","language","developer","notebook","network","internet","database","student","algorithm","function","variable","scholarship","university"]
};

const arena = $("arena");
let gWords = [], score = 0, lives = 3, level = 1, kills = 0;
let running = false, paused = false, lastTs = 0, lastSpawn = 0, rafId = null;

function renderLives(){ $("gLives").textContent = lives > 0 ? "❤️".repeat(lives) : "💔"; }
function setArenaMsg(html){
  let m = $("arenaMsg");
  if (!m){ m = document.createElement("div"); m.id = "arenaMsg"; m.className = "arena-msg"; arena.appendChild(m); }
  m.innerHTML = html;
}
function hideArenaMsg(){ const m = $("arenaMsg"); if (m) m.remove(); }

function pickWord(){
  const pool = level < 3 ? WORDS.short : level < 6 ? WORDS.medium.concat(WORDS.short) : WORDS.long.concat(WORDS.medium);
  for (let tries = 0; tries < 30; tries++){
    const w = pool[Math.floor(Math.random() * pool.length)];
    // screen par pehlan wale word naal same ya prefix na ho
    const clash = gWords.some(o => o.text.startsWith(w) || w.startsWith(o.text));
    if (!clash) return w;
  }
  return null;
}

function spawn(){
  const w = pickWord();
  if (!w) return;
  const el = document.createElement("span");
  el.className = "fw";
  el.textContent = w;
  arena.appendChild(el);
  const x = Math.random() * Math.max(10, arena.clientWidth - el.offsetWidth - 10);
  const speed = 38 + level * 9 + Math.random() * 16;     // pixels per second
  gWords.push({ el, text: w, x, y: -10, speed });
}

function loop(ts){
  if (!running) return;
  if (paused){ lastTs = ts; rafId = requestAnimationFrame(loop); return; }
  const dt = Math.min((ts - lastTs) / 1000, 0.1);
  lastTs = ts;

  // naye words
  const interval = Math.max(650, 2100 - level * 160);
  if (ts - lastSpawn > interval){ spawn(); lastSpawn = ts; }

  // move words
  const floor = arena.clientHeight - 38;
  for (let i = gWords.length - 1; i >= 0; i--){
    const w = gWords[i];
    w.y += w.speed * dt;
    w.el.style.transform = `translate(${w.x}px, ${w.y}px)`;
    if (w.y >= floor){                  // zameen te pahunch gaya
      w.el.remove();
      gWords.splice(i, 1);
      lives--;
      renderLives();
      if (lives <= 0){ gameOver(); return; }
    }
  }
  rafId = requestAnimationFrame(loop);
}

function startGame(){
  gWords.forEach(w => w.el.remove());
  gWords = []; score = 0; lives = 3; level = 1; kills = 0;
  $("gScore").textContent = 0; $("gLevel").textContent = 1; renderLives();
  $("gBest").textContent = getBest("tm_best_game");
  hideArenaMsg();
  running = true; paused = false;
  $("gameInput").disabled = false; $("gameInput").value = ""; $("gameInput").focus();
  $("pauseGame").disabled = false; $("pauseGame").textContent = "Pause";
  $("startGame").textContent = "Restart";
  lastTs = performance.now(); lastSpawn = lastTs - 5000;
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
}

function stopGame(showMsg){
  running = false;
  cancelAnimationFrame(rafId);
  gWords.forEach(w => w.el.remove());
  gWords = [];
  $("gameInput").disabled = true;
  $("pauseGame").disabled = true;
  $("startGame").textContent = "Start";
  if (showMsg) setArenaMsg("Type the falling words before they hit the ground!<br>Press <b>Start</b> to play.");
  else setArenaMsg("Type the falling words before they hit the ground!<br>Press <b>Start</b> to play.");
}

function gameOver(){
  running = false;
  cancelAnimationFrame(rafId);
  $("gameInput").disabled = true;
  $("pauseGame").disabled = true;
  let title = "💥 Game Over";
  if (score > getBest("tm_best_game")){ setBest("tm_best_game", score); title = "🏆 New High Score!"; }
  $("gBest").textContent = getBest("tm_best_game");
  showModal(title, [["Score", score], ["Level", level], ["Words typed", kills], ["Best Score", getBest("tm_best_game")]], "Play Again", startGame);
}

$("gameInput").addEventListener("input", () => {
  if (!running || paused) return;
  const val = $("gameInput").value.trim().toLowerCase();

  // highlight matching letters
  gWords.forEach(w => {
    if (val && w.text.startsWith(val)) w.el.innerHTML = `<b>${val}</b>${w.text.slice(val.length)}`;
    else w.el.textContent = w.text;
  });

  const hit = gWords.findIndex(w => w.text === val);
  if (hit !== -1){
    const w = gWords[hit];
    gWords.splice(hit, 1);
    w.el.classList.add("pop");
    setTimeout(() => w.el.remove(), 250);
    score += w.text.length * 10;
    kills++;
    if (kills % 8 === 0){ level++; $("gLevel").textContent = level; }
    $("gScore").textContent = score;
    $("gameInput").value = "";
  }
});

$("startGame").addEventListener("click", startGame);
$("pauseGame").addEventListener("click", () => {
  if (!running) return;
  paused = !paused;
  $("pauseGame").textContent = paused ? "Resume" : "Pause";
  if (paused) setArenaMsg("⏸️ Paused");
  else { hideArenaMsg(); $("gameInput").focus(); }
});
$("gBest").textContent = getBest("tm_best_game");
