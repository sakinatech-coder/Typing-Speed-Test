/* =========================================================
   Typing Master – Speed Test, 4 Games, Stats
   Only HTML + CSS + JavaScript (no libraries)
   ========================================================= */
const $ = id => document.getElementById(id);
const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => arr.slice().sort(() => Math.random() - 0.5);

/* ---------- localStorage helper ---------- */
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
};

/* ---------- Preferences: theme, dark mode, sound ---------- */
const prefs = store.get("tm_prefs", { dark:false, theme:"indigo", sound:false });
function applyPrefs(){
  document.body.classList.toggle("dark", prefs.dark);
  document.body.dataset.theme = prefs.theme;
  $("themeBtn").textContent = prefs.dark ? "☀️" : "🌙";
  $("soundBtn").textContent = prefs.sound ? "🔊" : "🔇";
  $("themeSel").value = prefs.theme;
}
applyPrefs();
$("themeBtn").onclick = () => { prefs.dark = !prefs.dark; store.set("tm_prefs", prefs); applyPrefs(); };
$("soundBtn").onclick = () => { prefs.sound = !prefs.sound; store.set("tm_prefs", prefs); applyPrefs(); beep(700, .06); };
$("themeSel").onchange = e => { prefs.theme = e.target.value; store.set("tm_prefs", prefs); applyPrefs(); };

let audioCtx = null;
function beep(freq, dur){
  if (!prefs.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = freq; g.gain.value = 0.04;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch(e){}
}

/* ---------- Result popup ---------- */
let modalAction = null;
function showModal(title, sub, items, btnText, action){
  $("mTitle").textContent = title;
  $("mSub").textContent = sub || "";
  $("mBody").innerHTML = items.map(i => `<div><b>${i[1]}</b><small>${i[0]}</small></div>`).join("");
  $("mBtn").textContent = btnText;
  modalAction = action;
  $("modal").classList.remove("hidden");
}
$("mBtn").onclick = () => { $("modal").classList.add("hidden"); if (modalAction) modalAction(); };

/* ---------- History ---------- */
function addHistory(rec){
  rec.t = Date.now();
  const h = store.get("tm_hist", []);
  h.unshift(rec);
  store.set("tm_hist", h.slice(0, 40));
}
function rankOf(wpm){
  if (wpm < 20) return "Beginner 🐢";
  if (wpm < 40) return "Average 🚶";
  if (wpm < 60) return "Fast 🏃";
  if (wpm < 80) return "Pro ⚡";
  return "Legend 🚀";
}

/* ---------- Paint typed letters (shared by test + race) ---------- */
function paint(box, typed){
  const sp = box.children;
  let c = 0, m = 0;
  for (let i = 0; i < sp.length; i++){
    const s = sp[i];
    s.className = "";
    if (i < typed.length){
      if (typed[i] === s.textContent){ s.className = "correct"; c++; }
      else { s.className = "wrong"; m++; }
    }
  }
  const cur = sp[typed.length];
  if (cur){ cur.classList.add("current"); box.scrollTop = Math.max(0, cur.offsetTop - 70); }
  return { c, m };
}
function renderText(box, text){
  box.innerHTML = text.split("").map(ch => `<span>${ch === "<" ? "&lt;" : ch === "&" ? "&amp;" : ch}</span>`).join("");
  box.scrollTop = 0;
}

/* =========================================================
   PASSAGE BANK
   ========================================================= */
const BANK = {
  general: [
    "The sun rises early in the morning and fills the whole sky with warm golden light.",
    "A good book can take you to faraway places without ever leaving your own room.",
    "Every river begins as a tiny stream and slowly grows stronger as it travels to the sea.",
    "Fresh fruits and green vegetables keep the body healthy and give us energy for the day.",
    "On a rainy evening, nothing feels better than a hot cup of tea and a quiet corner.",
    "The market was full of colourful stalls, loud voices and the smell of fresh food.",
    "Birds fly south for the winter and return when the days become warm and long again.",
    "A small act of kindness can brighten someone's day more than you will ever know.",
    "Mountains look calm from far away, but climbing them teaches patience and courage.",
    "The train moved slowly through the fields while the children counted the passing trees.",
    "Time is precious, so use each day to learn something new and to help someone else.",
    "The old clock on the wall kept ticking softly as the family sat down for dinner."
  ],
  programming: [
    "A variable stores a value in memory, and a function groups instructions that can be reused.",
    "HTML builds the structure of a web page, CSS controls its style, and JavaScript adds behaviour.",
    "Good programmers write clean code, add helpful comments and test every feature before release.",
    "An array keeps many items in one list, and a loop lets you visit each item one by one.",
    "The browser reads your code from top to bottom and shows the final page on the screen.",
    "Debugging means finding the reason a program fails and fixing it step by step.",
    "A database stores data in tables, and a query asks the database for exactly what you need.",
    "Git keeps a history of every change, so you can go back to an older version at any time.",
    "An event listener waits for a click or a key press and then runs a function immediately.",
    "Responsive design makes a website look good on phones, tablets and large desktop screens.",
    "An algorithm is a clear set of steps that solves a problem in a reasonable amount of time.",
    "APIs let two programs talk to each other by sending requests and receiving data in return."
  ],
  student: [
    "Morning classes begin at nine, so I pack my bag the night before and set an alarm.",
    "Group study helps me understand difficult topics because my friends explain things in simple words.",
    "Before the exam, I make short notes, solve old papers and sleep early to stay fresh.",
    "The college library is quiet and peaceful, and it has books on almost every subject.",
    "A good student asks questions, takes notes and never waits until the last day to prepare.",
    "Our project submission is next week, so we divided the work and started coding together.",
    "Living away from home teaches you to manage money, cook simple meals and plan your time.",
    "I check the notice board every day because exam dates and results are put up there.",
    "Practice makes progress, so I spend thirty minutes every day on coding and typing.",
    "Internships give students real experience and help them decide which career they really enjoy.",
    "Our teacher said that mistakes are proof that we are trying, and we should never fear them.",
    "After lectures, we sit in the canteen, share snacks and talk about our future plans."
  ],
  quotes: [
    "Success is the sum of small efforts repeated day after day.",
    "Do not wait for the perfect moment; take the moment and make it perfect.",
    "Every expert was once a beginner who refused to give up.",
    "Dream big, start small, and keep moving forward even when the path is slow.",
    "Your only limit is the amount of effort you are willing to put in today.",
    "A calm mind and a steady hand can finish what a hurried one cannot.",
    "Hard work beats talent when talent does not work hard.",
    "Fall seven times, stand up eight, and learn something every time you fall.",
    "The best way to predict your future is to start building it right now.",
    "Discipline is choosing what you want most over what you want right now."
  ],
  code: [
    "const total = price * qty; // 3 x 25 = 75",
    "if (score >= 40 && lives > 0) { level++; }",
    "<div class=\"card\"><h3>Rice Meals</h3></div>",
    "for (let i = 0; i < 10; i++) { console.log(i); }",
    "body { margin: 0; padding: 16px; background: #f8f5ee; }",
    "let name = \"Sakina\"; alert('Hello, ' + name + '!');",
    "document.getElementById('btn').addEventListener('click', run);",
    "SELECT name, marks FROM students WHERE marks > 75;"
  ]
};
const LEN_WORDS = { short: 15, medium: 35, long: 70 };

function buildPassage(topic, len, punct, caps){
  const pool = shuffle(BANK[topic]);
  let out = [], count = 0, i = 0;
  while (count < LEN_WORDS[len] && i < 40){
    const s = pool[i % pool.length]; i++;
    out.push(s); count += s.split(" ").length;
  }
  let t = out.join(" ");
  if (topic !== "code"){
    if (!punct) t = t.replace(/[^A-Za-z0-9\s]/g, "");
    if (!caps) t = t.toLowerCase();
  }
  return t.replace(/\s+/g, " ").trim();
}

/* =========================================================
   TABS
   ========================================================= */
document.querySelectorAll(".tab").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const mode = btn.dataset.mode;
    $("testMode").classList.toggle("hidden", mode !== "test");
    $("gameMode").classList.toggle("hidden", mode !== "game");
    $("statsMode").classList.toggle("hidden", mode !== "stats");
    stopTest(); stopRain(); stopSprint(); stopRace();
    if (mode === "test") resetTest();
    if (mode === "game") selectGame(currentGame);
    if (mode === "stats") renderStats();
  };
});

/* =========================================================
   1) SPEED TEST
   ========================================================= */
const T = { text:"", total:60, elapsed:0, timer:null, started:false, passageMode:false,
            doneC:0, doneT:0, doneM:0, curC:0, curT:0, curM:0 };

function stopTest(){ clearInterval(T.timer); T.timer = null; }

function newPassage(){
  T.text = buildPassage($("topic").value, $("plen").value, $("optPunct").checked, $("optCaps").checked);
  renderText($("textBox"), T.text);
  $("typeInput").value = "";
  T.curC = T.curT = T.curM = 0;
}

function resetTest(){
  stopTest();
  T.started = false;
  T.total = parseInt($("duration").value);
  T.passageMode = T.total === 0;
  T.elapsed = 0;
  T.doneC = T.doneT = T.doneM = 0;
  $("textBox").style.fontSize = $("fsize").value + "px";
  newPassage();
  $("typeInput").disabled = false;
  $("tTimeLbl").textContent = T.passageMode ? "Time (sec)" : "Time left";
  $("tTime").textContent = T.passageMode ? 0 : T.total;
  $("tWpm").textContent = 0; $("tAcc").textContent = "100%"; $("tMis").textContent = 0;
  $("tBar").style.width = "0%";
  $("tBest").textContent = store.get("tm_best_wpm", 0);
  $("typeInput").focus();
}

function testStats(){
  const correct = T.doneC + T.curC, typed = T.doneT + T.curT, mistakes = T.doneM + T.curM;
  const wpm = T.elapsed > 0 ? Math.round((correct / 5) / (T.elapsed / 60)) : 0;
  const acc = typed > 0 ? Math.round((correct / typed) * 100) : 100;
  return { wpm, acc, mistakes, typed };
}

function renderTestStats(){
  const s = testStats();
  $("tWpm").textContent = s.wpm;
  $("tAcc").textContent = s.acc + "%";
  $("tMis").textContent = s.mistakes;
  const pct = T.passageMode ? (T.curT / T.text.length) * 100 : (T.elapsed / T.total) * 100;
  $("tBar").style.width = Math.min(100, pct) + "%";
}

function startTestTimer(){
  T.started = true;
  T.timer = setInterval(() => {
    T.elapsed++;
    $("tTime").textContent = T.passageMode ? T.elapsed : T.total - T.elapsed;
    renderTestStats();
    if (!T.passageMode && T.elapsed >= T.total) finishTest();
  }, 1000);
}

$("typeInput").addEventListener("input", () => {
  if (!T.started) startTestTimer();
  const typed = $("typeInput").value;
  const prevM = T.curM;
  const r = paint($("textBox"), typed);
  T.curC = r.c; T.curM = r.m; T.curT = typed.length;
  if (r.m > prevM) beep(180, .05); else beep(650, .02);

  if (typed.length >= T.text.length){
    if (T.passageMode){ renderTestStats(); finishTest(); return; }
    T.doneC += T.curC; T.doneT += T.curT; T.doneM += T.curM;   // time baaki hai -> agla passage
    newPassage();
  }
  renderTestStats();
});
["paste","copy","cut","drop"].forEach(ev => $("typeInput").addEventListener(ev, e => e.preventDefault()));

function finishTest(){
  stopTest();
  $("typeInput").disabled = true;
  if (T.passageMode && T.elapsed === 0) T.elapsed = 1;
  const s = testStats();
  const best = store.get("tm_best_wpm", 0);
  let title = "⏱️ Test complete!";
  if (s.wpm > best){ store.set("tm_best_wpm", s.wpm); title = "🏆 New Best Score!"; }
  $("tBest").textContent = store.get("tm_best_wpm", 0);
  addHistory({ kind:"test", label:`Test · ${$("topic").selectedOptions[0].text} · ${$("plen").value}`, main:s.wpm + " WPM", wpm:s.wpm, acc:s.acc });
  showModal(title, "Rank: " + rankOf(s.wpm),
    [["WPM", s.wpm], ["Accuracy", s.acc + "%"], ["Mistakes", s.mistakes], ["Time", T.elapsed + "s"]],
    "Try Again", resetTest);
}

["restartTest"].forEach(id => $(id).onclick = resetTest);
["topic","plen","duration","fsize","optPunct","optCaps"].forEach(id => $(id).onchange = resetTest);
resetTest();

/* =========================================================
   GAME PICKER
   ========================================================= */
let currentGame = "rain";
function selectGame(g){
  currentGame = g;
  stopRain(); stopSprint(); stopRace();
  document.querySelectorAll(".gcard").forEach(c => c.classList.toggle("active", c.dataset.game === g));
  $("rainBox").classList.toggle("hidden", !(g === "rain" || g === "letter"));
  $("sprintBox").classList.toggle("hidden", g !== "sprint");
  $("raceBox").classList.toggle("hidden", g !== "race");
  if (g === "rain" || g === "letter"){
    R.type = g === "rain" ? "word" : "letter";
    $("rCatWrap").classList.toggle("hidden", g === "letter");
    $("gBest").textContent = store.get(R.type === "word" ? "tm_best_rain" : "tm_best_letter", 0);
    rainMessage();
  }
  if (g === "sprint") { $("sBest").textContent = store.get("tm_best_sprint", 0); resetSprintView(); }
  if (g === "race") resetRaceView();
}
document.querySelectorAll(".gcard").forEach(c => c.onclick = () => selectGame(c.dataset.game));

/* =========================================================
   2) WORD RAIN  +  3) LETTER POP   (same engine)
   ========================================================= */
const POOLS = {
  general:     { short:["cat","sun","pen","book","tree","rain","milk","ship","lamp","road","fish","door","star","moon","cake","bird","hand","mouse","chair","table","bread","clock"],
                 medium:["planet","garden","window","school","bridge","coffee","silver","pocket","market","orange","flower","mirror","jungle","pencil"],
                 long:["umbrella","football","language","notebook","mountain","adventure","telescope","chocolate","happiness","wonderful"] },
  programming: { short:["code","bug","web","html","css","java","loop","array","class","file","data","node","git","sql","api","byte"],
                 medium:["python","script","server","client","browser","syntax","object","string","number","method","module","editor","cursor","button"],
                 long:["javascript","function","variable","database","algorithm","framework","developer","repository","responsive","compiler"] },
  student:     { short:["exam","pass","quiz","note","test","book","bag","pen","desk","lab","mark","fee","bus","class"],
                 medium:["college","project","result","subject","teacher","lecture","library","seminar","degree","campus","report","assignment"],
                 long:["university","scholarship","internship","attendance","programming","presentation","examination","certificate","semester","placement"] }
};
const DIFF = { easy:{lives:5,speed:.8,gap:1.25}, normal:{lives:3,speed:1,gap:1}, hard:{lives:2,speed:1.3,gap:.8} };
const arena = $("arena");
const R = { type:"word", words:[], score:0, lives:3, level:1, kills:0, running:false, paused:false, last:0, lastSpawn:0, raf:null, diff:DIFF.normal };

function rainMessage(){
  stopRain();
  arena.innerHTML = `<div class="arena-msg">${R.type === "word"
    ? "Type the falling words before they hit the ground!"
    : "Press the letter keys to pop the falling letters!"}<br>Press <b>Start</b> to play.</div>`;
}
function renderLives(){ $("gLives").textContent = R.lives > 0 ? "❤️".repeat(R.lives) : "💔"; }

function rainWord(){
  if (R.type === "letter") return rand("abcdefghijklmnopqrstuvwxyz".split(""));
  const p = POOLS[$("rCat").value];
  const pool = R.level < 3 ? p.short : R.level < 6 ? p.short.concat(p.medium) : p.medium.concat(p.long);
  for (let i = 0; i < 30; i++){
    const w = rand(pool);
    if (!R.words.some(o => o.text.startsWith(w) || w.startsWith(o.text))) return w;
  }
  return null;
}

function spawnRain(){
  const w = rainWord();
  if (!w) return;
  const el = document.createElement("span");
  el.className = "fw" + (R.type === "letter" ? " letter" : "");
  el.textContent = w;
  arena.appendChild(el);
  const x = Math.random() * Math.max(10, arena.clientWidth - el.offsetWidth - 10);
  const speed = (36 + R.level * 9 + Math.random() * 16) * R.diff.speed;
  R.words.push({ el, text:w, x, y:-10, speed });
}

function rainLoop(ts){
  if (!R.running) return;
  if (R.paused){ R.last = ts; R.raf = requestAnimationFrame(rainLoop); return; }
  const dt = Math.min((ts - R.last) / 1000, 0.1);
  R.last = ts;
  const interval = Math.max(600, (2100 - R.level * 160) * R.diff.gap);
  if (ts - R.lastSpawn > interval){ spawnRain(); R.lastSpawn = ts; }
  const floor = arena.clientHeight - 38;
  for (let i = R.words.length - 1; i >= 0; i--){
    const w = R.words[i];
    w.y += w.speed * dt;
    w.el.style.transform = `translate(${w.x}px, ${w.y}px)`;
    if (w.y >= floor){
      w.el.remove(); R.words.splice(i, 1);
      R.lives--; renderLives(); beep(150, .15);
      if (R.lives <= 0){ rainOver(); return; }
    }
  }
  R.raf = requestAnimationFrame(rainLoop);
}

function startRain(){
  stopRain();
  R.diff = DIFF[$("rDiff").value];
  R.score = 0; R.lives = R.diff.lives; R.level = 1; R.kills = 0;
  $("gScore").textContent = 0; $("gLevel").textContent = 1; renderLives();
  $("gBest").textContent = store.get(R.type === "word" ? "tm_best_rain" : "tm_best_letter", 0);
  arena.innerHTML = "";
  R.running = true; R.paused = false;
  $("rInput").disabled = false; $("rInput").value = ""; $("rInput").focus();
  $("rPause").disabled = false; $("rPause").textContent = "Pause";
  $("rStart").textContent = "Restart";
  R.last = performance.now(); R.lastSpawn = R.last - 5000;
  R.raf = requestAnimationFrame(rainLoop);
}

function stopRain(){
  R.running = false;
  cancelAnimationFrame(R.raf);
  R.words = [];
  $("rInput").disabled = true;
  $("rPause").disabled = true;
  $("rStart").textContent = "Start";
}

function rainOver(){
  R.running = false;
  cancelAnimationFrame(R.raf);
  $("rInput").disabled = true; $("rPause").disabled = true;
  const key = R.type === "word" ? "tm_best_rain" : "tm_best_letter";
  let title = "💥 Game Over";
  if (R.score > store.get(key, 0)){ store.set(key, R.score); title = "🏆 New High Score!"; }
  $("gBest").textContent = store.get(key, 0);
  addHistory({ kind:"game", label:(R.type === "word" ? "Word Rain" : "Letter Pop") + " · " + $("rDiff").value, main:R.score + " pts" });
  showModal(title, "", [["Score", R.score], ["Level", R.level], ["Typed", R.kills], ["Best", store.get(key, 0)]], "Play Again", startRain);
}

function killWord(w){
  R.words.splice(R.words.indexOf(w), 1);
  w.el.classList.add("pop");
  setTimeout(() => w.el.remove(), 250);
  R.score += R.type === "letter" ? 15 : w.text.length * 10;
  R.kills++;
  if (R.kills % (R.type === "letter" ? 10 : 8) === 0){ R.level++; $("gLevel").textContent = R.level; }
  $("gScore").textContent = R.score;
  beep(880, .05);
}

$("rInput").addEventListener("input", () => {
  if (!R.running || R.paused) return;
  let val = $("rInput").value.toLowerCase().trim();
  if (R.type === "letter"){
    if (!val) return;
    val = val.slice(-1);
    $("rInput").value = "";
    const hit = R.words.filter(w => w.text === val).sort((a, b) => b.y - a.y)[0];
    if (hit) killWord(hit); else beep(180, .05);
    return;
  }
  R.words.forEach(w => {
    if (val && w.text.startsWith(val)) w.el.innerHTML = `<b>${val}</b>${w.text.slice(val.length)}`;
    else w.el.textContent = w.text;
  });
  const hit = R.words.find(w => w.text === val);
  if (hit){ killWord(hit); $("rInput").value = ""; }
});
$("rStart").onclick = startRain;
$("rPause").onclick = () => {
  if (!R.running) return;
  R.paused = !R.paused;
  $("rPause").textContent = R.paused ? "Resume" : "Pause";
  if (R.paused) arena.insertAdjacentHTML("beforeend", '<div class="arena-msg" id="pauseMsg">⏸️ Paused</div>');
  else { const p = $("pauseMsg"); if (p) p.remove(); $("rInput").focus(); }
};

/* =========================================================
   4) WORD SPRINT
   ========================================================= */
const S = { running:false, left:60, timer:null, count:0, chars:0, mist:0, word:"", bad:false };

function sprintPool(){
  const p = POOLS[$("sCat").value], l = $("sLen").value;
  return l === "short" ? p.short : l === "long" ? p.long : p.short.concat(p.medium, p.long);
}
function nextSprintWord(){
  let w; do { w = rand(sprintPool()); } while (w === S.word);
  S.word = w; S.bad = false;
  $("sWord").textContent = w;
  $("sInput").value = ""; $("sInput").classList.remove("bad");
}
function resetSprintView(){
  stopSprint();
  $("sLeft").textContent = $("sTime").value; $("sCount").textContent = 0; $("sMis").textContent = 0;
  $("sWord").textContent = "Press Start";
}
function stopSprint(){
  S.running = false; clearInterval(S.timer);
  $("sInput").disabled = true; $("sStart").textContent = "Start";
}
function startSprint(){
  stopSprint();
  S.running = true; S.left = parseInt($("sTime").value); S.count = 0; S.chars = 0; S.mist = 0; S.word = "";
  $("sLeft").textContent = S.left; $("sCount").textContent = 0; $("sMis").textContent = 0;
  $("sInput").disabled = false; $("sInput").focus();
  $("sStart").textContent = "Restart";
  nextSprintWord();
  S.timer = setInterval(() => {
    S.left--; $("sLeft").textContent = S.left;
    if (S.left <= 0) finishSprint();
  }, 1000);
}
function finishSprint(){
  const total = parseInt($("sTime").value);
  stopSprint();
  const wpm = Math.round((S.chars / 5) / (total / 60));
  let title = "⚡ Time's up!";
  if (S.count > store.get("tm_best_sprint", 0)){ store.set("tm_best_sprint", S.count); title = "🏆 New Best!"; }
  $("sBest").textContent = store.get("tm_best_sprint", 0);
  addHistory({ kind:"game", label:`Word Sprint · ${total}s`, main:S.count + " words" });
  showModal(title, "", [["Words typed", S.count], ["Mistakes", S.mist], ["Speed (WPM)", wpm], ["Best words", store.get("tm_best_sprint", 0)]], "Play Again", startSprint);
}
$("sInput").addEventListener("input", () => {
  if (!S.running) return;
  const val = $("sInput").value.toLowerCase().trim();
  if (S.word.startsWith(val)){ S.bad = false; $("sInput").classList.remove("bad"); }
  else { if (!S.bad){ S.mist++; $("sMis").textContent = S.mist; beep(180, .05); } S.bad = true; $("sInput").classList.add("bad"); }
  if (val === S.word){
    S.count++; S.chars += S.word.length;
    $("sCount").textContent = S.count; beep(880, .04);
    nextSprintWord();
  }
});
$("sStart").onclick = startSprint;
["sTime","sCat","sLen"].forEach(id => $(id).onchange = resetSprintView);

/* =========================================================
   5) RACE VS BOT
   ========================================================= */
const G = { running:false, text:"", bot:50, start:0, iv:null, cd:null };

function stopRace(){
  G.running = false; clearInterval(G.iv); clearTimeout(G.cd);
  $("raceInput").disabled = true; $("raceStart").textContent = "Start Race";
}
function setCars(me, bot){
  $("car").style.left = (me * 92) + "%";
  $("botcar").style.left = (bot * 92) + "%";
}
function resetRaceView(){
  stopRace(); setCars(0, 0);
  $("raceMsg").textContent = "Press Start to race!";
  $("raceText").innerHTML = ""; $("raceInput").value = "";
}
function startRace(){
  stopRace(); setCars(0, 0);
  G.bot = parseInt($("bSpeed").value);
  G.text = buildPassage($("bTopic").value, $("bLen").value, true, true);
  renderText($("raceText"), G.text);
  $("raceInput").value = "";
  $("raceStart").textContent = "Restart";
  let n = 3;
  const tick = () => {
    if (n > 0){ $("raceMsg").textContent = n + "…"; beep(500, .1); n--; G.cd = setTimeout(tick, 800); }
    else go();
  };
  tick();
}
function go(){
  $("raceMsg").textContent = "GO! 🚦"; beep(900, .2);
  G.running = true; G.start = performance.now();
  $("raceInput").disabled = false; $("raceInput").focus();
  G.iv = setInterval(() => {
    const sec = (performance.now() - G.start) / 1000;
    const botProg = Math.min(1, (sec * G.bot * 5 / 60) / G.text.length);
    const me = Math.min(1, $("raceInput").value.length / G.text.length);
    setCars(me, botProg);
    if (botProg >= 1) finishRace(false);
  }, 100);
}
$("raceInput").addEventListener("input", () => {
  if (!G.running) return;
  const typed = $("raceInput").value;
  paint($("raceText"), typed);
  if (typed.length >= G.text.length) finishRace(true);
});
["paste","copy","cut","drop"].forEach(ev => $("raceInput").addEventListener(ev, e => e.preventDefault()));

function finishRace(won){
  if (!G.running) return;
  G.running = false; clearInterval(G.iv);
  $("raceInput").disabled = true;
  const sec = Math.max(1, (performance.now() - G.start) / 1000);
  const typed = $("raceInput").value;
  let c = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === G.text[i]) c++;
  const wpm = Math.round((c / 5) / (sec / 60));
  const acc = typed.length ? Math.round((c / typed.length) * 100) : 0;
  const rec = store.get("tm_race", { w:0, l:0 });
  if (won) rec.w++; else rec.l++;
  store.set("tm_race", rec);
  addHistory({ kind:"race", label:`Race vs ${G.bot} WPM bot`, main:(won ? "Won · " : "Lost · ") + wpm + " WPM", wpm:won ? wpm : null, acc });
  $("raceMsg").textContent = won ? "🏆 You win!" : "🤖 Bot wins!";
  showModal(won ? "🏆 You won the race!" : "🤖 The bot won", won ? "You beat a " + G.bot + " WPM bot." : "Try again, you can beat it!",
    [["Your WPM", wpm], ["Accuracy", acc + "%"], ["Bot speed", G.bot + " WPM"], ["Wins / Losses", rec.w + " / " + rec.l]], "Race Again", startRace);
}
$("raceStart").onclick = startRace;
["bSpeed","bLen","bTopic"].forEach(id => $(id).onchange = resetRaceView);

/* =========================================================
   6) MY STATS
   ========================================================= */
function renderStats(){
  const race = store.get("tm_race", { w:0, l:0 });
  const cards = [
    ["Best WPM", store.get("tm_best_wpm", 0)],
    ["Word Rain", store.get("tm_best_rain", 0)],
    ["Letter Pop", store.get("tm_best_letter", 0)],
    ["Sprint words", store.get("tm_best_sprint", 0)],
    ["Race W / L", race.w + " / " + race.l]
  ];
  $("statCards").innerHTML = cards.map(c => `<div class="stat best"><span>${c[1]}</span><small>${c[0]}</small></div>`).join("");

  const hist = store.get("tm_hist", []);
  const tests = hist.filter(h => h.kind === "test").slice(0, 10).reverse();
  const max = Math.max(20, ...tests.map(t => t.wpm));
  $("chart").innerHTML = tests.length
    ? tests.map(t => `<div class="col">${t.wpm}<i style="height:${Math.max(3, (t.wpm / max) * 100)}%"></i></div>`).join("")
    : '<span class="empty">Take a speed test to see your progress here.</span>';

  const rows = hist.slice(0, 10).map(h => {
    const d = new Date(h.t);
    return `<tr><td>${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</td><td>${h.label}</td><td>${h.main}</td><td>${h.acc != null ? h.acc + "%" : "-"}</td></tr>`;
  }).join("");
  $("histTable").innerHTML = "<tr><th>When</th><th>Activity</th><th>Result</th><th>Accuracy</th></tr>" +
    (rows || '<tr><td colspan="4">No activity yet.</td></tr>');
}
$("clearData").onclick = () => {
  if (!confirm("Delete all your scores and history?")) return;
  ["tm_best_wpm","tm_best_rain","tm_best_letter","tm_best_sprint","tm_race","tm_hist"].forEach(k => { try { localStorage.removeItem(k); } catch(e){} });
  renderStats();
};
