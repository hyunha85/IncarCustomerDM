// DM 미리보기는 HTML/CSS입니다. PNG는 화면의 계산된 CSS 값으로 Canvas에 다시 그립니다.
const GA4_MEASUREMENT_ID='';
if(/^G-[A-Z0-9]+$/.test(GA4_MEASUREMENT_ID)){const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+GA4_MEASUREMENT_ID;document.head.append(s);window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',GA4_MEASUREMENT_ID)}
function track(name,params={}){if(typeof window.gtag==='function')window.gtag('event',name,params)}
const stage=document.getElementById('dm'),viewport=document.getElementById('viewport');
const customer=document.getElementById('customer'),agent=document.getElementById('agent'),phone=document.getElementById('phone');
const status=document.getElementById('status');
const assets={};
function update(){const name=customer.value.trim()||'OOO';document.getElementById('recipient').textContent=name+' 고객님께';document.getElementById('closing-name').textContent=name+'님의 하루하루에 따스함과 평안함이';document.getElementById('agent-text').textContent=agent.value.trim()||'김인카';document.getElementById('phone-text').textContent=phone.value.trim()||'010.000.0000'}
[customer,agent,phone].forEach(el=>el.addEventListener('input',update));
document.querySelectorAll('input[name=gender]').forEach(el=>el.addEventListener('change',()=>{const gender=document.querySelector('input[name=gender]:checked').value;document.querySelector('.dm-bg').src='images/background_'+gender+'.jpg';track('background_select',{background:gender})}));
function scaleStage(){const scale=Math.min(1,viewport.clientWidth/800);stage.style.transform=`scale(${scale})`;viewport.style.height=(1680*scale)+'px'}
window.addEventListener('resize',scaleStage);scaleStage();update();
// 로컬 file://에서도 이미지 내보내기를 허용하기 위한 내장 이미지 사본.
// 이 파일은 PNG 생성에만 사용하고, 화면은 images/ 폴더의 실제 파일을 사용합니다.
function imageSource(name){return window.DM_LOCAL_IMAGES?.[name]||'images/'+name}
function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src})}
async function loadAssets(){const names=['background_woman.jpg','background_man.jpg','November.png','icon1.png','icon2.png','icon3.png','fa.png','incarLogo.png','kosdaqLogo.png'];await Promise.all(names.map(async n=>assets[n]=await loadImage(imageSource(n))))}
const assetPromise=loadAssets().catch(e=>{console.error(e);status.textContent='이미지를 불러오지 못했습니다.';throw e});
function pos(el){let x=0,y=0;while(el&&el!==stage){x+=el.offsetLeft;y+=el.offsetTop;/* CSS 가운데 정렬 변환을 PNG에도 반영 */if(el.classList?.contains("november")){x-=el.offsetWidth/2}el=el.offsetParent}return{x,y}}
function drawText(ctx,el,x,y,w,h){const cs=getComputedStyle(el);const txt=el.textContent.trim();if(!txt)return;const size=parseFloat(cs.fontSize);const family=cs.fontFamily;ctx.font=`${cs.fontWeight} ${size}px ${family}`;ctx.fillStyle=cs.color;ctx.textBaseline='middle';const align=cs.textAlign;ctx.textAlign=align==='right'?'right':align==='center'?'center':'left';const px=align==='right'?x+w:align==='center'?x+w/2:x;ctx.fillText(txt,px,y+h/2)}
function drawElement(ctx,el){const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden')return;const {x,y}=pos(el),w=el.offsetWidth,h=el.offsetHeight;
 if(el.tagName==='IMG'){const filename=decodeURIComponent(el.getAttribute('src').split('/').pop());const im=assets[filename];if(im)ctx.drawImage(im,x,y,w,h);return}
 if(el!==stage){if(cs.backgroundColor!=='rgba(0, 0, 0, 0)'&&cs.backgroundColor!=='transparent'){ctx.fillStyle=cs.backgroundColor;const r=parseFloat(cs.borderTopLeftRadius)||0;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
  if(parseFloat(cs.borderTopWidth)>0&&cs.borderTopStyle!=='none'){ctx.strokeStyle=cs.borderTopColor;ctx.lineWidth=parseFloat(cs.borderTopWidth);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke()}
  if(parseFloat(cs.borderBottomWidth)>0&&cs.borderBottomStyle!=='none'){const bw=parseFloat(cs.borderBottomWidth);ctx.strokeStyle=cs.borderBottomColor;ctx.lineWidth=bw;ctx.beginPath();ctx.moveTo(x,y+h-bw/2);ctx.lineTo(x+w,y+h-bw/2);ctx.stroke()}
  if(!el.children.length)drawText(ctx,el,x,y,w,h)}
 for(const child of el.children)drawElement(ctx,child)}
function renderPNG(){const canvas=document.createElement('canvas');canvas.width=800;canvas.height=1680;const ctx=canvas.getContext('2d');const cs=getComputedStyle(stage);ctx.fillStyle=cs.backgroundColor;ctx.fillRect(0,0,800,1680);
 // CSS border-box coordinates: child positions are offset from the inner border edge.
 const bw=parseFloat(cs.borderTopWidth)||0;
 ctx.save();ctx.translate(bw,bw);
 for(const el of stage.children)drawElement(ctx,el);
 ctx.restore();ctx.fillStyle=cs.borderTopColor;ctx.fillRect(0,0,800,bw);ctx.fillRect(0,1680-bw,800,bw);ctx.fillRect(0,0,bw,1680);ctx.fillRect(800-bw,0,bw,1680);return canvas.toDataURL('image/png')}
const save=document.getElementById('save');save.addEventListener('click',async()=>{save.disabled=true;save.textContent='PNG 생성 중...';status.textContent='';try{await assetPromise;await document.fonts.ready;const data=renderPNG();const name=(customer.value.trim()||'OOO').replace(/[\\/:*?"<>|]/g,'_');const a=document.createElement('a');a.href=data;a.download='11월_DM_'+name+'고객님.png';document.body.append(a);a.click();a.remove();status.textContent='PNG 다운로드를 요청했습니다. 다운로드 목록을 확인해 주세요.';track('dm_png_download',{background:document.querySelector('input[name=gender]:checked').value})}catch(e){console.error(e);status.textContent='PNG 생성에 실패했습니다. 개발자 도구 콘솔을 확인해 주세요.'}finally{save.disabled=false;save.textContent='이미지(PNG) 다운로드'}});
document.getElementById('ppt').addEventListener('click',()=>track('dm_ppt_download'));

// 모바일 편집 중 미리보기로 빠르게 돌아가기
document.getElementById('back-to-preview')?.addEventListener('click', () => {
  document.querySelector('.preview')?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start'
  });
});
