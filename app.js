const units = [
  {name:"风筝工坊",topic:"颜色",icon:"🪁",bg:"#fff0d2",accent:"#efa951",words:["red","blue","yellow","green","pink","purple","black","white"],zh:["红色","蓝色","黄色","绿色","粉色","紫色","黑色","白色"],colors:["#ef5b5b","#438ce5","#f5ce3f","#53bb79","#f38fc3","#a679d7","#3c4b5a","#fffdf8"],question:"What color is it?",sample:"It's red."},
  {name:"动物草地",topic:"动物",icon:"🐻",bg:"#e1f3df",accent:"#7fbb8a",words:["cat","dog","bird","fish","duck","rabbit","bear","frog"],zh:["猫","狗","鸟","鱼","鸭子","兔子","熊","青蛙"],icons:["🐱","🐶","🐦","🐟","🦆","🐰","🐻","🐸"],question:"What's this?",sample:"It's a cat."},
  {name:"露露的果园",topic:"水果",icon:"🍎",bg:"#ffe6df",accent:"#e99989",words:["apple","banana","orange","pear","grape","strawberry","peach","watermelon"],zh:["苹果","香蕉","橙子","梨","葡萄","草莓","桃子","西瓜"],icons:["🍎","🍌","🍊","🍐","🍇","🍓","🍑","🍉"],question:"Where's the apple?",sample:"Here it is."},
  {name:"动作舞台",topic:"动作",icon:"🎭",bg:"#e8e8fa",accent:"#a4a5df",words:["jump","run","walk","clap","dance","sing","draw","swim"],zh:["跳","跑","走","拍手","跳舞","唱歌","画画","游泳"],icons:["🤸","🏃","🚶","👏","💃","🎤","🎨","🏊"],question:"What can you do?",sample:"I can jump."}
];
const app = document.getElementById("app");
const progressKey = "lulu-english-month-v1";
let progress = loadProgress();
let session = null;

function loadProgress(){
  try { const data=JSON.parse(localStorage.getItem(progressKey)||"{}"); return data && typeof data==="object" ? data : {}; }
  catch { return {}; }
}
function saveProgress(){ localStorage.setItem(progressKey,JSON.stringify(progress)); }
function lessonInfo(id){
  const unit=Math.floor((id-1)/5), day=(id-1)%5, review=day===4;
  const fresh=review?[]:units[unit].words.slice(day*2,day*2+2);
  let old=[];
  if(!review && day>0){
    old=day===3 && unit===0 ? ["red","pink"] : units[unit].words.slice((day-1)*2,day*2);
  } else if(!review && day===0 && unit>0){
    old=units[unit-1].words.slice(0,2);
  }
  if(review){
    old=[...units[unit].words];
    if(unit===3) old.push("red","cat","apple","banana");
    else if(unit>0) old.push(...units[unit-1].words.slice(0,2));
  }
  return {id,unit,day,review,fresh,old};
}
function unitOfWord(word){return units.findIndex(u=>u.words.includes(word));}
function fullLine(unit,word){
  if(unit===0)return `It's ${word}.`;
  if(unit===1)return `It's a ${word}.`;
  if(unit===2)return `Where's the ${word}?`;
  return `I can ${word}.`;
}
function lineAudioId(unit,word){return ["color","animal","fruit","action"][unit]+"_"+word;}
function fixedAudioId(unit){return ["color_q","animal_q","fruit_a","action_q"][unit];}
let macVoice = null;
function refreshMacVoice(){
  if(!("speechSynthesis" in window)) return;
  macVoice = speechSynthesis.getVoices().find(voice =>
    voice.lang.toLowerCase().replace("_","-") === "en-us" && /^Samantha(?:\s|$)/i.test(voice.name)
  ) || null;
}
if("speechSynthesis" in window){
  refreshMacVoice();
  speechSynthesis.addEventListener("voiceschanged",refreshMacVoice);
}
function speak(text,id){
  if(!("speechSynthesis" in window)) return;
  refreshMacVoice();
  speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang="en-US";
  utterance.rate=.82;
  if(macVoice) utterance.voice=macVoice;
  speechSynthesis.speak(utterance);
}
function visual(word){
  const u=unitOfWord(word), index=units[u].words.indexOf(word);
  if(u===0){
    const color=units[0].colors[index];
    return `<svg viewBox="0 0 100 110" width="95" height="105" role="img" aria-label="${units[0].zh[index]}风筝"><path d="M50 11 85 47 50 75 15 47Z" fill="${color}" stroke="#364f61" stroke-width="2.5"/><path d="M50 75c0 15 20 11 8 26M52 85l-8-5m11 13 8-5" fill="none" stroke="#364f61" stroke-width="2.5" stroke-linecap="round"/><path d="M50 11v64M15 47h70" stroke="#ffffffaa" stroke-width="2"/></svg>`;
  }
  return `<span role="img" aria-label="${units[u].zh[index]}">${units[u].icons[index]}</span>`;
}
function renderHome(){
  session=null;
  const completed=Object.keys(progress).filter(x=>progress[x]?.done).length;
  app.innerHTML=`<section class="hero"><div><div class="eyebrow">A LITTLE ENGLISH EVERY DAY</div><h1>和露露一起，<br>边玩边听英语！</h1><p>4 周的小小探险，从颜色、动物、水果到动作。每天一节，慢慢听，开心玩。</p><div class="summary"><span class="pill">20 节趣味课程</span><span class="pill">32 个生活词汇</span><span class="pill">每节约 8–10 分钟</span></div></div><div class="hero-art" aria-hidden="true"><span class="fox">🦊</span></div></section><div class="section-heading"><h2>选择今天的探险</h2><span>已完成 ${completed} / 20 节</span></div><div class="units">${units.map((u,ui)=>`<section class="unit" style="--unit-bg:${u.bg};--unit-accent:${u.accent}"><div class="unit-head"><div class="unit-icon" aria-hidden="true">${u.icon}</div><div><small>第 ${ui+1} 周 · ${u.topic}</small><h3>${u.name}</h3></div></div><p>认识 ${u.words.slice(0,4).join(" · ")} 等 8 个词</p><div class="lesson-list">${Array.from({length:5},(_,d)=>{const id=ui*5+d+1;return `<button class="lesson-chip ${progress[id]?.done?"done":""} ${d===4?"review":""}" data-lesson="${id}" aria-label="第 ${id} 节${d===4?"复习课":""}"><b>${d===4?"★":id}</b><span>${d===4?"复习":"第"+(d+1)+"天"}</span></button>`}).join("")}</div></section>`).join("")}</div>`;
  app.querySelectorAll("[data-lesson]").forEach(b=>b.addEventListener("click",()=>startLesson(Number(b.dataset.lesson))));
}
function startLesson(id){
  const info=lessonInfo(id);
  session={...info,queue:[],index:0,wrong:false,answered:false,firstCorrect:0,firstCorrectCore:0};
  renderIntro();
  window.scrollTo({top:0,behavior:"smooth"});
}
function renderIntro(){
  const s=session,u=units[s.unit],words=s.review?u.words:s.fresh;
  app.innerHTML=`<div class="lesson-page"><button class="back" id="back">← 返回课程</button><section class="lesson-card" style="--unit-accent:${u.accent}"><div class="lesson-top"><div><span class="step-label">第 ${s.id} 节 · ${s.review?"复习日":"认识新朋友"}</span><h1>${u.name}</h1></div><div class="unit-icon" style="--unit-bg:${u.bg}" aria-hidden="true">${u.icon}</div></div><p class="intro-copy">${s.review?"今天把这一周听过的 8 个词再玩一遍！":"先听听今天的两个新词，想听几次都可以。"}</p><div class="vocab-preview ${s.review?"review-preview":""}">${words.map(w=>`<div class="preview-card"><div class="visual">${visual(w)}</div><strong>${w}</strong><button class="speak" data-word="${w}" aria-label="再听一次 ${w}">🔊</button></div>`).join("")}</div><div class="pattern"><span>本周的英语短句</span><strong>${u.question} &nbsp; ${u.sample}</strong><br><button class="quiet" id="pattern-sound" style="margin-top:10px">🔊 听句子</button></div><button class="primary" id="begin">开始玩 →</button></section></div>`;
  document.getElementById("back").onclick=renderHome;
  document.querySelectorAll("[data-word]").forEach(b=>b.onclick=()=>speak(b.dataset.word,"word_"+b.dataset.word));
  document.getElementById("pattern-sound").onclick=()=>{if(s.unit===2)speak(u.sample,"line_"+fixedAudioId(s.unit));else speak(u.question,"line_"+fixedAudioId(s.unit));};
  document.getElementById("begin").onclick=()=>{buildQueue();renderQuestion();playQuestion();};
}
function buildQueue(){
  const s=session;
  if(s.review){
    s.queue=s.old.map((w,i)=>({word:w,mode:i===6||i===7?"line":"word"}));
  }else{
    const [a,b]=s.fresh;
    const old=s.old.length===2?s.old:[a,b];
    s.queue=[{word:a,mode:"word"},{word:b,mode:"word"},{word:old[0],mode:"word"},{word:a,mode:"line"},{word:old[1],mode:"word"},{word:b,mode:"line"}];
  }
  s.index=0;s.wrong=false;s.answered=false;s.firstCorrect=0;s.firstCorrectCore=0;
}
function distractors(word,count){
  const unitIndex=unitOfWord(word);
  const taughtCount=unitIndex===session.unit && !session.review ? (session.day+1)*2 : 8;
  const candidates=units[unitIndex].words.slice(0,taughtCount).filter(w=>w!==word);
  return shuffle(candidates).slice(0,count-1);
}
function shuffle(arr){return arr.map(x=>({x,r:Math.random()})).sort((a,b)=>a.r-b.r).map(o=>o.x);}
function renderQuestion(){
  const s=session,q=s.queue[s.index],u=units[s.unit];
  if(!q){finishLesson();return;}
  const count=s.review||s.index>=2?3:2;
  if(!q.options)q.options=shuffle([q.word,...distractors(q.word,count)]);
  const dots=s.queue.map((_,i)=>`<span class="dot ${i<s.index?"done":i===s.index?"active":""}"></span>`).join("");
  app.innerHTML=`<div class="lesson-page"><button class="back" id="back">← 返回课程</button><section class="lesson-card" style="--unit-accent:${u.accent}"><div class="lesson-top"><div><span class="step-label">第 ${s.id} 节 · 第 ${s.index+1} / ${s.queue.length} 题</span><h1>听一听，找一找</h1></div><div class="dots" aria-label="课程进度">${dots}</div></div><div class="prompt-area"><button class="sound-big" id="replay" aria-label="再听一次">🔊</button><p class="prompt-line">点喇叭可以再听一次</p></div><div class="choices ${count===2?"two":""}">${q.options.map(w=>`<button class="choice ${s.wrong&&w===q.word?"hint":""}" data-choice="${w}" aria-label="${units[unitOfWord(w)].zh[units[unitOfWord(w)].words.indexOf(w)]}">${visual(w)}</button>`).join("")}</div><div class="feedback ${s.wrong?"try":""}" id="feedback">${s.wrong?"再听一次，试试看！":"&nbsp;"}</div><div id="continue-slot"></div></section></div>`;
  document.getElementById("back").onclick=renderHome;
  document.getElementById("replay").onclick=playQuestion;
  document.querySelectorAll("[data-choice]").forEach(b=>b.onclick=()=>answer(b.dataset.choice));
}
function playQuestion(){
  const q=session.queue[session.index],u=unitOfWord(q.word);
  if(q.mode==="line")speak(fullLine(u,q.word),"line_"+lineAudioId(u,q.word));
  else speak(q.word,"word_"+q.word);
}
function answer(word){
  const s=session,q=s.queue[s.index];
  if(s.answered)return;
  if(word!==q.word){
    s.wrong=true;
    const wrongButton=[...document.querySelectorAll("[data-choice]")].find(b=>b.dataset.choice===word);
    wrongButton?.classList.add("wrong");
    document.querySelector('[data-choice="'+q.word+'"]')?.classList.add("hint");
    const f=document.getElementById("feedback");f.textContent="再听一次，试试看！";f.classList.add("try");
    speak(q.word,"word_"+q.word);
    return;
  }
  if(!s.wrong){s.firstCorrect++;if(s.review&&s.index<8)s.firstCorrectCore++;}
  s.answered=true;
  document.querySelectorAll("[data-choice]").forEach(b=>{b.disabled=true;b.classList.remove("hint");if(b.dataset.choice===word)b.classList.add("correct")});
  const f=document.getElementById("feedback");f.textContent=q.word+" · 做得好！";f.classList.remove("try");
  speak(q.word,"word_"+q.word);
  document.getElementById("continue-slot").innerHTML=`<button class="primary" id="next">${s.index===s.queue.length-1?"完成这一节 ✨":"继续 →"}</button>`;
  document.getElementById("next").onclick=()=>{s.index++;s.wrong=false;s.answered=false;renderQuestion();if(s.index<s.queue.length)playQuestion();};
}
function finishLesson(){
  const s=session,u=units[s.unit];
  const away=["找一件和风筝同色的物品，指给家人看。","模仿一种今天遇到的动物，请家人猜猜它是谁。","在家里或绘本里找一种水果，试着说出它的英文。","和家人一起做一个动作，边做边说 I can...。"][s.unit];
  progress[s.id]={done:true,firstCorrect:s.firstCorrect,total:s.queue.length,firstCorrectCore:s.firstCorrectCore,date:new Date().toISOString()};
  saveProgress();
  app.innerHTML=`<div class="lesson-page"><section class="lesson-card complete"><div class="trophy" aria-hidden="true">${u.icon}</div><div class="eyebrow">LESSON COMPLETE</div><h2>太棒啦，今天的探险完成！</h2><p>你和露露一起听了 ${s.queue.length} 道小题。<br>想再听一遍，随时可以回来玩。</p><div class="pattern"><span>离开屏幕也能玩 · 可选</span><strong>${away}</strong></div><div class="complete-actions"><button class="secondary" id="again">再玩一次</button><button class="primary" id="home" style="margin:0">回到课程</button></div></section></div>`;
  document.getElementById("again").onclick=()=>startLesson(s.id);
  document.getElementById("home").onclick=renderHome;
}
function renderParent(){
  session=null;
  const complete=Array.from({length:20},(_,i)=>i+1).filter(id=>progress[id]?.done);
  const fresh=complete.filter(id=>(id-1)%5!==4).length*2;
  const weeks=units.map((u,i)=>({u,lessons:Array.from({length:5},(_,d)=>i*5+d+1),review:progress[(i+1)*5]}));
  app.innerHTML=`<section class="parent-page"><button class="back" id="back">← 返回课程</button><h1>家长角落</h1><p>这里记录孩子接触过的课程。建议陪孩子听一听、指一指，也可以在生活中找同样的颜色、水果或动作。</p><div class="parent-grid"><div class="parent-stat"><b>${complete.length}</b><span>已完成课次</span></div><div class="parent-stat"><b>${fresh}</b><span>已接触新词</span></div><div class="parent-stat"><b>${weeks.filter(w=>w.review?.done).length}</b><span>已完成周复习</span></div><div class="parent-stat"><b>20</b><span>课程总数</span></div></div><h2>每周进度</h2>${weeks.map((w,i)=>`<div class="parent-unit"><strong>第 ${i+1} 周 · ${w.u.topic} · ${w.lessons.filter(id=>progress[id]?.done).length}/5 节</strong><span>词汇：${w.u.words.join("、")}</span>${w.review?.done?`<p>周复习首次选择：${w.review.firstCorrectCore??0}/8。可随时重玩。</p>`:""}</div>`).join("")}<p>复习记录仅用于推荐重玩，不用来评价孩子。进度只保存在当前浏览器。</p></section>`;
  document.getElementById("back").onclick=renderHome;
}
document.getElementById("home-button").onclick=renderHome;
document.getElementById("parent-button").onclick=renderParent;
renderHome();
