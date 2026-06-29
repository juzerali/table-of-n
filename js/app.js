
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

let audioRunId=0;

function numberToWords(n){
 n=Math.trunc(Number(n));
 if(!Number.isFinite(n)) return String(n);
 if(n<0) return `minus ${numberToWords(-n)}`;
 const ones=['zero','one','two','three','four','five','six','seven','eight','nine'];
 const teens=['ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
 const tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];

 if(n<10) return ones[n];
 if(n<20) return teens[n-10];
 if(n<100){
   const t=Math.floor(n/10);
   const r=n%10;
   return r===0 ? tens[t] : `${tens[t]} ${ones[r]}`;
 }
 if(n<1000){
   const h=Math.floor(n/100);
   const r=n%100;
   return r===0 ? `${ones[h]} hundred` : `${ones[h]} hundred ${numberToWords(r)}`;
 }
 return String(n);
}

function pluralizeNumberWord(word,count){
 if(count===1) return word;
 if(word.endsWith('x')||word.endsWith('s')) return `${word}es`;
 return `${word}s`;
}

for(let i=2;i<=20;i++){
 let o=document.createElement('option');
 o.value=i;o.textContent='Table of '+i;
 select.appendChild(o);
}

function colorFor(t){ return colors[t] || '#2563eb'; }

function hexToHsl(hex){
 const n=parseInt(hex.slice(1),16);
 const r=((n>>16)&255)/255,g=((n>>8)&255)/255,b=(n&255)/255;
 const max=Math.max(r,g,b),min=Math.min(r,g,b);
 let h,s,l=(max+min)/2;
 if(max===min){h=s=0;}
 else{
   const d=max-min;
   s=l>0.5?d/(2-max-min):d/(max+min);
   switch(max){
     case r:h=((g-b)/d+(g<b?6:0))/6;break;
     case g:h=((b-r)/d+2)/6;break;
     case b:h=((r-g)/d+4)/6;break;
   }
 }
 return [h*360,s*100,l*100];
}

function hslToHex(h,s,l){
 s/=100;l/=100;
 const c=(1-Math.abs(2*l-1))*s;
 const x=c*(1-Math.abs((h/60)%2-1));
 const m=l-c/2;
 let r,g,b;
 if(h<60){r=c;g=x;b=0;}
 else if(h<120){r=x;g=c;b=0;}
 else if(h<180){r=0;g=c;b=x;}
 else if(h<240){r=0;g=x;b=c;}
 else if(h<300){r=x;g=0;b=c;}
 else{r=c;g=0;b=x;}
 const toHex=v=>Math.round((v+m)*255).toString(16).padStart(2,'0');
 return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function contrastBorderColor(hex){
 const [h,s,l]=hexToHsl(hex);
 return hslToHex((h+180)%360,Math.min(s+12,92),Math.min(l+18,70));
}

function setGridRows(table){
 grid.style.setProperty('--grid-rows', table<=10 ? 10 : 20);
}

function render(table){
 setGridRows(table);
 const max=table<=10?100:200;
 grid.innerHTML='';
 fact.textContent=(facts[table]||['Multiples occur every '+table+' numbers.'])[0];

 for(let i=1;i<=max;i++){
   const d=document.createElement('div');
   const isMultiple=i%table===0;
   d.className='cell '+(isMultiple?'highlight':'dim');
   if(isMultiple){
     const bg=colorFor(table);
     d.style.setProperty('--table-color',bg);
     d.style.setProperty('--border-color',contrastBorderColor(bg));
     const border=document.createElement('span');
     border.className='multiplicand-border';
     border.textContent='×'+i/table;
     const num=document.createElement('span');
     num.className='cell-number';
     num.textContent=String(i);
     d.appendChild(border);
     d.appendChild(num);
   } else {
     d.textContent=String(i);
   }
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
 const runId=++audioRunId;
 const table=+select.value;
 for(let i=table;i<=(table<=10?100:200);i+=table){
   if(runId!==audioRunId) break;
   const count=i/table;
   const tableWord=numberToWords(table);
   const unit=pluralizeNumberWord(tableWord,count);
   const verb=count===1?'is':'are';
   const countWord=numberToWords(count);
   const productWord=numberToWords(i);
   speechSynthesis.speak(new SpeechSynthesisUtterance(`${countWord} ${unit} ${verb} ${productWord}.`));
   await new Promise(r=>setTimeout(r,700));
 }
}

function stopAudio(){
 audioRunId++;
 speechSynthesis.cancel();
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
 setGridRows(table);
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
document.getElementById('stopBtn').onclick=stopAudio;
document.getElementById('quizBtn').onclick=quizMode;
select.onchange=()=>render(+select.value);

select.value=2;
render(2);
renderBadges();
