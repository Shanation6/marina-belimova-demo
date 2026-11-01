import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
if(!process.env.PLAYWRIGHT_MODULE)throw new Error('Set PLAYWRIGHT_MODULE to an installed playwright-core module.');
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[],failed=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400&&r.url().includes('/assets/'))failed.push(r.url());});
const base=process.env.SITE_URL||'http://127.0.0.1:4187/';
const screenshot=options=>page.screenshot({animations:'disabled',...options});
await mkdir('outputs',{recursive:true});
await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
assert.match(await page.title(),/Марина Белимова/);assert.equal(await page.locator('h1').count(),1);
await screenshot({path:'outputs/desktop-hero.png'});
await page.getByRole('tab',{name:/Онлайн/}).click();assert.equal(await page.locator('#format-panel').getAttribute('data-online'),'true');assert.match(await page.locator('#format-title').innerText(),/Из своего пространства/);
await page.getByRole('tab',{name:/Онлайн/}).press('Home');assert.equal(await page.getByRole('tab',{name:/Очно/}).getAttribute('aria-selected'),'true');
await page.locator('summary').first().click();assert.equal(await page.locator('details').first().getAttribute('open'),'');
const widths=[360,390,768,1024,1440];
for(const width of widths){
 await page.setViewportSize({width,height:900});await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 const dimensions=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(dimensions.scroll<=width,`Overflow: ${JSON.stringify(dimensions)}`);
 const broken=await page.locator('img').evaluateAll(async images=>{await Promise.all(images.map(image=>image.decode().catch(()=>{})));return images.filter(image=>!image.complete||!image.naturalWidth).map(image=>image.src);});assert.deepEqual(broken,[]);
 if(width===390){
  await screenshot({path:'outputs/mobile-hero.png'});
  await page.getByRole('button',{name:'Открыть меню'}).click();assert.equal(await page.locator('#mobile-nav').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#mobile-nav').isVisible(),false);
  await page.getByRole('button',{name:'Открыть меню'}).click();await page.locator('#mobile-nav a[href="#formats"]').click();assert.equal(await page.locator('#mobile-nav').isVisible(),false);
  await page.getByRole('tab',{name:/Онлайн/}).click();assert.match(await page.locator('#format-description').innerText(),/видеосвязи/);await screenshot({path:'outputs/mobile-formats.png'});
 }
}
for(const [width,label] of [[1440,'desktop'],[390,'mobile']]){
 await page.setViewportSize({width,height:900});await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(async()=>{document.querySelectorAll('.reveal').forEach(e=>e.classList.add('visible'));await document.fonts.ready;});await screenshot({path:`outputs/${label}-full.png`,fullPage:true});
}
await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base,{waitUntil:'networkidle'});assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('motion-ready')),false);
assert.equal(await page.locator('form').count(),0);assert.equal(await page.locator('input,textarea').count(),0);
assert.equal(await page.locator('a[href="tel:+79080224748"]').count(),1);assert.equal(await page.locator('a[href="mailto:belimovama@gmail.com"]').count(),1);assert.equal(await page.locator('a[href="https://vk.com/im?sel=14873894"]').count(),1);
const brokenAnchors=await page.locator('a[href^="#"]').evaluateAll(links=>links.map(link=>link.getAttribute('href')).filter(href=>!document.getElementById(href.slice(1))));assert.deepEqual(brokenAnchors,[]);
const noScript=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const staticPage=await noScript.newPage();await staticPage.goto(base);assert.equal(await staticPage.locator('#contact').isVisible(),true);await noScript.close();
if(!process.env.SITE_URL){await page.setViewportSize({width:1200,height:630});await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await screenshot({path:'assets/share.jpg',type:'jpeg',quality:88});}
assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);console.log(JSON.stringify({passed:true,base,widths,formats:2,menu:true,faq:true,images:true,contacts:true,noSensitiveInputs:true,noScript:true,reducedMotion:true,consoleErrors:0}));await browser.close();
