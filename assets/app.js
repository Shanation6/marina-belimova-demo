const variants={
 inperson:{eyebrow:'ЛИЧНАЯ ВСТРЕЧА',title:'Очно.<br><em>В Красноярске.</em>',description:'Встреча в кабинете. Точный адрес, время, продолжительность и стоимость консультации уточните у Марины до записи.',label:'В ОДНОМ ПРОСТРАНСТВЕ'},
 online:{eyebrow:'ВСТРЕЧА НА РАССТОЯНИИ',title:'Онлайн.<br><em>Из своего пространства.</em>',description:'Консультация по видеосвязи. Сервис, время и условия встречи согласуете с Мариной. Для разговора важно выбрать место, где вас не будут отвлекать.',label:'НА СВЯЗИ · С ВНИМАНИЕМ К ВАМ'}
};
const tabs=[...document.querySelectorAll('[data-format]')],panel=document.querySelector('#format-panel');
function selectFormat(tab,focus=false){
 const value=variants[tab.dataset.format];
 tabs.forEach(button=>{button.setAttribute('aria-selected',String(button===tab));button.tabIndex=button===tab?0:-1;});
 panel.setAttribute('aria-labelledby',tab.id);panel.dataset.online=String(tab.dataset.format==='online');
 document.querySelector('#format-eyebrow').textContent=value.eyebrow;document.querySelector('#format-title').innerHTML=value.title;document.querySelector('#format-description').textContent=value.description;document.querySelector('#format-art-label').textContent=value.label;
 panel.classList.remove('panel-updated');requestAnimationFrame(()=>panel.classList.add('panel-updated'));if(focus)tab.focus({preventScroll:true});
}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectFormat(tab));tab.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();selectFormat(tabs[next],true);});});
const menuButton=document.querySelector('.menu-toggle'),mobileNav=document.querySelector('#mobile-nav');
function closeMenu(){menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Открыть меню');mobileNav.hidden=true;}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));menuButton.setAttribute('aria-label',open?'Открыть меню':'Закрыть меню');mobileNav.hidden=open;});
mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mobileNav.hidden){closeMenu();menuButton.focus();}});
document.addEventListener('click',event=>{if(!event.target.closest('.header'))closeMenu();});
matchMedia('(max-width:760px)').addEventListener('change',event=>{if(!event.matches)closeMenu();});
const motion=matchMedia('(prefers-reduced-motion:reduce)');
if(!motion.matches&&'IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});document.body.classList.add('motion-ready');document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));motion.addEventListener('change',()=>{if(motion.matches){document.body.classList.remove('motion-ready');observer.disconnect();}});}
