let data = null;
let selectedDay = 0;
let flattened = [];

const IST = "Asia/Kolkata";

function at(date, time){
  return new Date(`${date}T${time}:00+05:30`);
}

function flattenSchedule(){
  flattened = [];
  data.days.forEach((day, dayIndex)=>{
    day.sessions.forEach((block, blockIndex)=>{
      if(block.items){
        block.items.forEach((item, itemIndex)=>{
          flattened.push({
            ...item,
            date:day.date,
            dayIndex,
            session:block.session,
            chair:block.chair,
            id:`d${dayIndex}-s${blockIndex}-i${itemIndex}`
          });
        });
      }else{
        flattened.push({
          ...block,
          date:day.date,
          dayIndex,
          id:`d${dayIndex}-b${blockIndex}`
        });
      }
    });
  });
}

function renderTabs(){
  const tabs=document.getElementById("dayTabs");
  tabs.innerHTML=data.days.map((d,i)=>
    `<button class="day-tab ${i===selectedDay?'active':''}" data-day="${i}">
      ${d.label} · ${d.date.slice(8)}
    </button>`
  ).join("");

  tabs.querySelectorAll(".day-tab").forEach(btn=>{
    btn.addEventListener("click",()=>{
      selectedDay=Number(btn.dataset.day);
      renderSchedule();
    });
  });
}

function makeItem(x){
  const el=document.createElement("div");
  el.className=`item ${x.type||""}`;
  el.id=x.id;

  const speaker=x.speaker ? `<div class="speaker">${x.speaker}</div>` : "";
  const institution=x.institution ? `<div class="institution">${x.institution}</div>` : "";

  el.innerHTML=`
    <time>${x.start} – ${x.end}</time>
    <div>
      <div class="title">${x.title}</div>
      ${speaker}
      ${institution}
    </div>`;
  return el;
}

function renderSchedule(){
  const root=document.getElementById("schedule");
  const d=data.days[selectedDay];

  root.innerHTML=`
    <div class="day-heading">
      <h3>${d.label} · ${d.weekday}</h3>
      <span>${data.venue}</span>
    </div>`;

  d.sessions.forEach(block=>{
    const session=document.createElement("div");
    session.className="session";

    if(block.items){
      session.innerHTML=`
        <div class="session-head">
          ${block.session}
          <small> · ${block.items[0].start} — ${block.items.at(-1).end} · Chair: ${block.chair}</small>
        </div>`;
      block.items.forEach(item=>session.appendChild(makeItem(item)));
    }else{
      session.appendChild(makeItem(block));
    }

    root.appendChild(session);
  });

  updateLive(false);
}

function findLiveAndNext(){
  const now=new Date();
  const today=now.toLocaleDateString("en-CA",{timeZone:IST});
  const todays=flattened.filter(x=>x.date===today);

  let live=null;
  let next=null;

  for(const x of todays){
    const start=at(x.date,x.start);
    const end=at(x.date,x.end);

    if(now>=start && now<end){
      live=x;
      break;
    }
    if(now<start && !next) next=x;
  }

  if(!next && live){
    const all=flattened.filter(x=>at(x.date,x.start)>at(live.date,live.end));
    next=all[0]||null;
  }

  return {live,next,now};
}

function updateLive(scroll=true){
  if(!data)return;

  const {live,next,now}=findLiveAndNext();

  const liveTitle=document.getElementById("liveTitle");
  const liveSubtitle=document.getElementById("liveSubtitle");
  const liveTime=document.getElementById("liveTime");
  const nextTitle=document.getElementById("nextTitle");
  const nextSubtitle=document.getElementById("nextSubtitle");
  const nextTime=document.getElementById("nextTime");
  const progress=document.getElementById("progress");
  const progressWrap=document.querySelector(".progress-wrap");

  document.querySelectorAll(".item.live").forEach(e=>e.classList.remove("live"));

  if(live){
    liveTitle.textContent=live.title;
    liveSubtitle.textContent=[live.speaker,live.institution].filter(Boolean).join(" · ");
    liveTime.textContent=`${live.start} – ${live.end}`;

    const start=at(live.date,live.start);
    const end=at(live.date,live.end);
    const pct=Math.max(0,Math.min(100,((now-start)/(end-start))*100));
    progress.style.width=pct+"%";
    progressWrap.style.display="block";

    const el=document.getElementById(live.id);
    if(el){
      el.classList.add("live");
      if(scroll && selectedDay!==live.dayIndex){
        selectedDay=live.dayIndex;
        renderTabs();
        renderSchedule();
      }
    }
  }else{
    liveTitle.textContent="No session happening now";
    liveSubtitle.textContent="";
    liveTime.textContent="";
    progress.style.width="0%";
    progressWrap.style.display="none";
  }

  if(next){
    nextTitle.textContent=next.title;
    nextSubtitle.textContent=[next.speaker,next.institution].filter(Boolean).join(" · ");
    nextTime.textContent=`${next.start} – ${next.end}`;
  }else{
    nextTitle.textContent="No more sessions scheduled";
    nextSubtitle.textContent="";
    nextTime.textContent="";
  }
}

fetch("schedule.json")
  .then(r=>r.json())
  .then(d=>{
    data=d;
    flattenSchedule();
    renderTabs();
    renderSchedule();
    updateLive(false);
    setInterval(()=>updateLive(false),1000);
  })
  .catch(err=>{
    document.getElementById("liveTitle").textContent="Unable to load schedule";
    console.error(err);
  });
