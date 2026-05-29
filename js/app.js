
const select=document.getElementById('tableSelect');
const grid=document.getElementById('grid');
const fact=document.getElementById('fact');
const scoreDiv=document.getElementById('score');
const badgesDiv=document.getElementById('badges');

const colors={2:'#3b82f6',3:'#10b981',4:'#8b5cf6',5:'#f59e0b',6:'#ef4444',7:'#ec4899',8:'#14b8a6',9:'#6366f1',10:'#84cc16'};
const facts={
2:['All multiples are even.'],
5:['Multiples end in 0 or 5.'],
9:['Digits add up to 9.'],
10:['Multiples end in 0.']
};

for(let i=2;i<=20;i++){
 let o=document.createElement('option');
 o.value=i;o.textContent='Table of '+i;
 select.appendChild(o);
}

function colorFor(t){ return colors[t] || '#2563eb'; }

function render(table){
 const max=table<=10?100:200;
 grid.innerHTML='';
 fact.textContent=(facts[table]||['Multiples occur every '+table+' numbers.'])[0];

 for(let i=1;i<=max;i++){
   const d=document.createElement('div');
   d.className='cell '+(i%table===0?'highlight':'dim');
   if(i%table===0)d.style.background=colorFor(table);
   d.textContent=i;
   grid.appendChild(d);
 }
}

async function animateTable(){
 const table=+select.value;
 render(table);
 const cells=[...document.querySelectorAll('.cell')];
 cells.forEach(c=>{
   if(c.classList.contains('highlight')){
      c.style.opacity=.2;
   }
 });
 for(let i=table;i<=(table<=10?100:200);i+=table){
   const cell=cells[i-1];
   cell.style.opacity=1;
   await new Promise(r=>setTimeout(r,350));
 }
}

async function audioTable(){
 const table=+select.value;
 for(let i=table;i<=(table<=10?100:200);i+=table){
   speechSynthesis.speak(new SpeechSynthesisUtterance(String(i)));
   await new Promise(r=>setTimeout(r,700));
 }
}

function getBadges(){return JSON.parse(localStorage.getItem('badges')||'[]');}
function saveBadge(b){
 const set=new Set(getBadges());
 set.add(b);
 localStorage.setItem('badges',JSON.stringify([...set]));
 renderBadges();
}
function renderBadges(){
 badgesDiv.textContent='🏅 '+getBadges().join(' | ');
}

function quizMode(){
 const table=+select.value;
 const max=table<=10?100:200;
 grid.innerHTML='';
 let correct=0,total=0;

 for(let i=1;i<=max;i++){
   const d=document.createElement('div');
   d.className='cell';
   d.textContent=i;
   d.onclick=()=>{
      const is=i%table===0;
      total++;
      if(is){correct++; d.classList.add('correct');}
      else d.classList.add('wrong');

      scoreDiv.textContent=`Score: ${correct}/${total}`;

      const target=Math.floor(max/table);
      if(correct===target){
        saveBadge('Master '+table);
      }
   };
   grid.appendChild(d);
 }
}

document.getElementById('visualBtn').onclick=()=>render(+select.value);
document.getElementById('animateBtn').onclick=animateTable;
document.getElementById('audioBtn').onclick=audioTable;
document.getElementById('quizBtn').onclick=quizMode;
select.onchange=()=>render(+select.value);

select.value=2;
render(2);
renderBadges();
