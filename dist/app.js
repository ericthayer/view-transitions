'use strict';
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const root = document.documentElement;
const media = matchMedia('(prefers-reduced-motion: reduce)');
const stage = $('#stage');
const ids = ['shared','reorder','layout','filter','tabs','pagination','gallery','navigation','reveal'];
let current = 'shared', step = 0, busy = false, activeTransition = null, runId = 0;
const escapeHTML = text => text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const art = (index = 0) => {
  const content = [
    '<path d="M100 15 164 52v75l-64 38-64-38V52Z" fill="var(--art-ink)"/><path d="m36 52 64 38 64-38M100 90v75" fill="none" stroke="var(--art-paper)" stroke-width="1.5"/><path d="m100 15 64 37-64 38-64-38Z" fill="var(--art-accent)"/><path d="M22 145h40M42 125v40M157 16v24M145 28h24" stroke="var(--art-ink)" stroke-width="1"/>',
    '<circle cx="100" cy="90" r="66" fill="none" stroke="var(--art-ink)" stroke-width="28"/><path d="M100 24a66 66 0 0 1 0 132" fill="none" stroke="var(--art-accent)" stroke-width="28"/><path d="M100 3v174M13 90h174" stroke="var(--art-ink)" stroke-width="1"/><circle cx="100" cy="90" r="6" fill="var(--art-accent)"/>',
    '<path d="m100 14 76 142H24Z" fill="var(--art-accent)"/><path d="m100 51 55 104H45Z" fill="var(--art-paper)"/><path d="m100 88 35 67H65Z" fill="var(--art-ink)"/><path d="M10 166h180M100 0v20" stroke="var(--art-ink)" stroke-width="1"/>'
  ][index % 3];
  return `<svg viewBox="0 0 200 180" role="img" aria-label="${['Geometric cube with a red top face','Split circular form with a red semicircle','Nested geometric triangles'][index%3]}">${content}</svg>`;
};
const specimenHTML = () => `<button class="specimen" id="specimen" aria-expanded="false" aria-label="Expand Form 01"><span class="specimen-art">${art()}</span><span class="specimen-copy"><span class="eyebrow">OBJECT STUDY / 001</span><span class="specimen-title" style="display:block">FORM / 01</span><span class="specimen-detail">A single object. Two perspectives. The browser connects its position, size, and identity.</span><span class="specimen-footer"><span>CLICK TO EXPLORE</span><span aria-hidden="true">↗</span></span></span></button>`;
const shapes = ['◒','△','⊞','◎','◇','▥'];
const tileHTML = (i, prefix='tile') => `<div class="demo-tile" data-kind="${i%2 ? 'line':'solid'}" style="view-transition-name:${prefix}-${i}"><span class="tile-icon" aria-hidden="true">${shapes[i]}</span><span class="tile-label">FORM ${String(i+1).padStart(2,'0')} / ${i%2?'LINE':'SOLID'}</span></div>`;
const rowHTML = () => `<ol class="demo-list" id="demo-list">${['Capture the before','Update the DOM','Animate the change','Return to interaction'].map((s,i)=>`<li style="view-transition-name:task-${i}"><span>${String(i+1).padStart(2,'0')}</span><span>${s}</span><span>↕</span></li>`).join('')}</ol>`;
const tabsHTML = () => `<div class="demo-tab-scene"><div role="tablist" aria-label="Specimen details" class="demo-tab-list">${['Overview','Materials','Dimensions'].map((s,i)=>`<button role="tab" id="spec-tab-${i}" aria-selected="${i===0}" aria-controls="spec-panel" tabindex="${i===0?0:-1}" data-demo-tab="${i}">${s.toUpperCase()}</button>`).join('')}</div><section class="demo-tab-content" id="spec-panel" role="tabpanel" tabindex="0" aria-labelledby="spec-tab-0"><h4>LESS, BUT<br>IN MOTION.</h4><p>A study in form, proportion, and continuity.</p></section></div>`;
const pageHTML = () => `<div class="pagination-scene"><div class="page-content" id="page-content"><span class="page-number">01</span><h4>Establish the context.</h4><p>A clear starting point makes the next step feel natural.</p></div><div class="pagination-controls"><button data-page-dir="-1" aria-label="Previous step">←</button><span id="page-count">01 / 03</span><button data-page-dir="1" aria-label="Next step">→</button></div></div>`;
const galleryHTML = () => `<div class="gallery-scene"><div class="gallery-main" id="gallery-main">${art()}</div><div class="gallery-controls" aria-label="Choose a geometric study">${[0,1,2].map(i=>`<button data-gallery="${i}" aria-pressed="${i===0}" aria-label="Show study ${i+1}">0${i+1}</button>`).join('')}<span class="gallery-caption" id="gallery-caption">CUBE / 001</span></div></div>`;
const revealHTML = () => `<div class="reveal-scene"><button id="reveal-card" class="reveal-card" aria-pressed="false" aria-label="Signal found"><span class="eyebrow">FIELD SIGNAL / 009</span><span class="reveal-title">ALL<br>QUIET.</span><span class="reveal-caption">Click to reveal the next state ↗</span></button><div class="origin-controls" aria-label="Reveal origin"><span>ORIGIN</span><button data-origin="20% 50%" aria-pressed="false">LEFT</button><button data-origin="50% 50%" aria-pressed="true">CENTER</button><button data-origin="80% 50%" aria-pressed="false">RIGHT</button></div></div>`;
const links = {
  using:['MDN / Using view transitions','https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using'],
  names:['MDN / view-transition-name','https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-transition-name'],
  css:['CSS-Tricks / View transitions','https://css-tricks.com/almanac/rules/v/view-transition/'],
  motion:['MDN / Reduced motion','https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion'],
  pages:['MDN / Cross-document opt-in','https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@view-transition'],
  clip:['CSS-Tricks / Clip-path animation','https://css-tricks.com/animating-with-clip-path/'],
  ready:['MDN / Transition lifecycle','https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition/ready'],
  chrome:['Chrome / Transition patterns','https://developer.chrome.com/docs/web-platform/view-transitions/']
};
const experiments = {
  shared:{label:'Shared element',title:'Keep the connection.',meta:'01 / SHARED ELEMENT',description:'Turn a compact card into a detailed view. A shared name tells the browser: this is still the same object.',hint:'CLICK THE CARD OR RUN THE TRANSITION',html:specimenHTML,css:'.specimen { view-transition-name: specimen; }\n.specimen-art { view-transition-name: specimen-art; }\n.specimen-title { view-transition-name: specimen-title; }',js:`const card = document.querySelector('.specimen');
card.addEventListener('click', () => {
  transition(() => {
    const open = card.classList.toggle('is-expanded');
    card.setAttribute('aria-expanded', open);
    card.setAttribute('aria-label', open
      ? 'Collapse Form 01' : 'Expand Form 01');
  });
});`,practices:[['Match the object, not the location.','Keep the same name on the compact and expanded representations. The browser interpolates their bounding boxes.'],['Separate the parts that matter.','Give artwork and title their own names to avoid stretching text with the entire card. Do not give two visible elements the same name.'],['Resolve assets before capturing.','For remote images, load and decode them before the update. This specimen uses inline SVG, so the artwork is already available.']],access:[['Keep the trigger in the DOM.','This card remains the same button in both layouts, so keyboard focus stays on it. Enter and Space work without custom key handlers.'],['Expose expanded state.','Update aria-expanded and the action label together. An actual modal would also need dialog semantics, focus containment, and focus restoration.'],['Let the change happen without motion.','With reduced motion or no API, apply the same layout update immediately. The content and controls remain usable.']],resources:['names','using','motion']},
  reorder:{label:'List reorder',title:'Follow every item.',meta:'02 / LIST REORDER',description:'Reverse the sequence while each item keeps its identity. Watch the rows travel to their new positions.',hint:'RUN TO REVERSE THE LIST',html:rowHTML,css:'/* Stable IDs, not the current array index. */\n/* Each row has its own view-transition-name. */',js:`const list = document.querySelector('.demo-list');
const trigger = document.querySelector('#demo-action');
trigger.addEventListener('click', () => {
  transition(() => {
    list.append(...[...list.children].reverse());
  });
});`,practices:[['Use data identity.','Assign names from stable record IDs before the first snapshot. Changing names with sort order makes the browser follow the wrong record.'],['Move the existing nodes.','Appending existing nodes reorders them without rebuilding their content. Keep the DOM order aligned with the visible order.'],['Limit independent snapshots.','A handful of moving rows is useful. Large datasets need profiling, pagination, or a smaller set of named elements.']],access:[['Announce the result.','After sorting, give a short status such as “Order reversed.” Avoid announcing every item on every animation frame.'],['Use a real sort control.','A button makes sorting available to keyboard and touch users. Do not make dragging the only way to reorder a list.'],['Keep reading order honest.','Change DOM order, not only CSS order. Screen reader navigation then follows the same sequence sighted users see.']],resources:['names','ready','chrome']},
  layout:{label:'Grid ↔ list',title:'Change the perspective.',meta:'03 / LAYOUT SWITCH',description:'Switch the same collection between a grid and a list. The browser handles position and size together.',hint:'RUN TO TOGGLE THE LAYOUT',html:()=>`<div class="demo-tiles" id="demo-tiles">${[0,1,2,3].map(i=>tileHTML(i)).join('')}</div>`,css:'.demo-tiles { display: grid; grid-template-columns: repeat(3, 1fr); }\n.demo-tiles.is-list { grid-template-columns: 1fr; }',js:`const grid = document.querySelector('.demo-tiles');
const trigger = document.querySelector('#demo-action');
trigger.setAttribute('aria-pressed', 'false');
trigger.addEventListener('click', () => {
  transition(() => {
    const list = grid.classList.toggle('is-list');
    trigger.setAttribute('aria-pressed', list);
  });
});`,practices:[['Keep data and layout separate.','Only the layout class changes. Stable per-item names connect each tile to its corresponding row.'],['Let CSS define both endpoints.','The browser measures the before and after layouts. You do not need to calculate coordinates or manually animate widths.'],['Watch long labels.','Text can reflow when a tile becomes a row. Use sensible constraints and test with realistic content.']],access:[['Expose the selected layout.','In a product, use a labeled toggle or a pair of buttons with aria-pressed. Here the Run control reports whether list layout is active.'],['Preserve order and focus.','Grid and list use the same DOM order. Changing the arrangement should not change keyboard navigation unexpectedly.'],['Test at higher zoom.','Allow the layout to collapse on narrow screens. Motion is no substitute for reflow and readable text.']],resources:['names','using','motion']},
  filter:{label:'Filter a collection',title:'Make room for change.',meta:'04 / FILTERING',description:'Remove a category and let the remaining forms close the gaps. Returning items fade into the collection.',hint:'CHOOSE A FILTER OR RUN THE TRANSITION',html:()=>`<div class="filter-scene"><div class="filter-controls" aria-label="Filter forms"><button data-filter="all" aria-pressed="true">ALL FORMS</button><button data-filter="solid" aria-pressed="false">SOLID ONLY</button></div><div class="demo-tiles" id="filter-tiles">${[0,1,2,3,4,5].map(i=>tileHTML(i,'filter')).join('')}</div></div>`,css:'/* Keep a distinct name on every form. */\n.demo-tile[hidden] { display: none; }',js:`document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    transition(() => {
      const filter = button.dataset.filter;
      document.querySelectorAll('[data-kind]').forEach(item => {
        item.hidden = filter !== 'all'
          && item.dataset.kind !== filter;
      });
      document.querySelectorAll('[data-filter]').forEach(b => {
        b.setAttribute('aria-pressed', b === button);
      });
    });
  });
});`,practices:[['Keep names stable across filters.','Retained items move to fill the gaps; items with only a before or after snapshot can fade out or in.'],['Do the work before the animation.','For a server-backed filter, fetch results first, then commit the short DOM update in the transition callback.'],['Handle an empty result.','A real search needs a useful empty state and a way to clear the filter. Never leave a collection unexplained.']],access:[['Keep focus on the filter.','The filter buttons stay in place while the result set changes. Hidden results are removed from layout and the accessibility tree.'],['Announce a result count.','Use a polite live region for “3 forms shown.” Avoid putting the entire collection in a live region.'],['Make filter state explicit.','Use aria-pressed for these mutually exclusive filter buttons. Visible labels should describe the filter without relying on color.']],resources:['names','using','motion']},
  tabs:{label:'Tab content',title:'Switch without the jump.',meta:'05 / TAB CONTENT',description:'Crossfade the panel while the tab controls stay still. Motion connects the content without moving your place.',hint:'ARROW KEYS MOVE BETWEEN TABS',html:tabsHTML,css:'.demo-tab-content { view-transition-name: tab-content; }',js:`const tabs = [...document.querySelectorAll('[data-demo-tab]')];
const panel = document.querySelector('#spec-panel');
const copy = [
  ['LESS, BUT IN MOTION.', 'A study in form and continuity.'],
  ['INK. PAPER. PIXELS.', 'Simple materials, precise geometry.'],
  ['200 × 180', 'A constant canvas for changing ideas.']
];
function selectTab(index) {
  transition(() => {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', i === index);
      tab.tabIndex = i === index ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', tabs[index].id);
    panel.innerHTML = '<h4>' + copy[index][0]
      + '</h4><p>' + copy[index][1] + '</p>';
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(index));
  tab.addEventListener('keydown', event => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    let next = event.key === 'Home' ? 0 : event.key === 'End' ? 2
      : (index + (event.key === 'ArrowRight' ? 1 : -1) + 3) % 3;
    tabs[next].focus();
    selectTab(next);
  });
});`,practices:[['Name only the changing panel.','The tabs remain visually anchored. Isolating the panel avoids a whole-page crossfade for a small content change.'],['Keep the panel height steady.','A stable minimum height prevents content below the tabbed region from jumping during a short transition.'],['Choose activation deliberately.','These local panels activate with arrow keys because they are immediately available. For slow network content, consider manual activation.']],access:[['Implement the complete tab pattern.','Use tablist, tab, tabpanel, aria-selected, aria-controls, and aria-labelledby. Only the active tab belongs in the normal Tab sequence.'],['Support directional keys.','Left and Right move between tabs; Home and End reach the first and last tab. Tab then reaches the active panel.'],['Keep focus on the selected tab.','The panel updates without stealing focus. A focusable panel lets keyboard users enter the content deliberately.']],resources:['using','ready','motion']},
  pagination:{label:'Directional paging',title:'Give motion a direction.',meta:'06 / PAGINATION',description:'Move forward and backward through a sequence. Directional snapshot animations reinforce where you are going.',hint:'USE THE ARROWS TO CHANGE DIRECTION',html:pageHTML,css:'.page-content { view-transition-name: page-content; }\n::view-transition-old(page-content) { animation-name: slide-out; }\n::view-transition-new(page-content) { animation-name: slide-in; }\n@keyframes slide-out { to { opacity: 0; transform: translateX(calc(-40px * var(--direction, 1))); } }\n@keyframes slide-in { from { opacity: 0; transform: translateX(calc(40px * var(--direction, 1))); } }',js:`let page = 0;
const titles = ['Establish the context.', 'Connect the change.', 'Keep your bearings.'];
document.querySelectorAll('[data-page-dir]').forEach(button => {
  button.addEventListener('click', () => {
    const direction = Number(button.dataset.pageDir);
    document.documentElement.style.setProperty('--direction', direction);
    transition(() => {
      page = (page + direction + 3) % 3;
      document.querySelector('.page-number').textContent = '0' + (page + 1);
      document.querySelector('.page-content h4').textContent = titles[page];
      document.querySelector('#page-count').textContent = '0' + (page + 1) + ' / 03';
    });
  });
});`,practices:[['Choose direction before starting.','Set the direction variable before the old snapshot is taken. The old and new animations then agree about which way to move.'],['Keep travel modest.','A short translation and fade communicate progression without sweeping the whole viewport. Tune the duration to the interaction.'],['Separate paging from routing.','This is local pagination. A full route change also needs history, title, scroll, and focus management; a transition does not provide these.']],access:[['Label both arrow buttons.','Visible arrows need accessible names such as “Previous step” and “Next step.” Keep the current position visible as text.'],['Announce the new step.','The live status names the step and its position. Focus remains on the persistent paging control.'],['Honor motion preference.','Sliding is spatial motion. The reduced-motion path updates the step immediately with the same announcement.']],resources:['using','ready','motion']},
  gallery:{label:'Gallery swap',title:'Keep the frame. Change the view.',meta:'07 / GALLERY',description:'Swap between geometric studies inside a fixed frame. Only the artwork crossfades; the gallery stays grounded.',hint:'SELECT A STUDY OR RUN THE TRANSITION',html:galleryHTML,css:'.gallery-main { view-transition-name: gallery-image; }',js:`const options = [...document.querySelectorAll('[data-gallery]')];
const frame = document.querySelector('#gallery-main');
const studies = [...document.querySelectorAll('template')];
options.forEach((button, index) => {
  button.addEventListener('click', () => {
    transition(() => {
      frame.replaceChildren(studies[index].content.cloneNode(true));
      options.forEach(b => b.setAttribute('aria-pressed', b === button));
      document.querySelector('#gallery-caption').textContent = ['CUBE / 001', 'ORBIT / 002', 'PEAK / 003'][index];
    });
  });
});`,practices:[['Prepare the next image.','With raster images, await image.decode() before starting the transition. The update callback should not wait on a slow download.'],['Reserve the frame.','Set an aspect ratio or fixed preview dimensions to avoid layout shifts. This gallery swaps inline SVG studies in a stable frame.'],['Animate one region.','A single shared name on the frame gives the old and new artwork a crossfade, without capturing every gallery control separately.']],access:[['Describe the artwork.','Each SVG has a meaningful image label. For photos, write useful alt text and provide a visible caption where appropriate.'],['Keep selection discoverable.','Thumbnail buttons expose their current selection with aria-pressed and retain keyboard focus. The selected study is also announced.'],['Avoid auto-advancing.','The gallery changes only after an explicit action. Users control both the pace and the amount of motion.']],resources:['using','names','motion']},
  navigation:{label:'Page navigation',title:'Go beyond one document.',meta:'08 / CROSS-DOCUMENT',description:'Navigate between two real HTML pages on this site. Both pages opt in with CSS; ordinary links do the rest.',hint:'OPENS THE TWO-PAGE DEMO IN THIS TAB',html:()=>`<div class="navigation-scene"><span class="eyebrow">SAME ORIGIN / TWO DOCUMENTS</span><h4>FROM HERE.<br>TO THERE.</h4><p>Step into a real page-to-page transition, then follow the return link to the lab.</p><a id="open-pages" href="page-a.html">OPEN NAVIGATION DEMO <span>↗</span></a></div>`,css:'/* Include in BOTH documents. */\n@view-transition { navigation: auto; }\n\n/* The same unique name on each page. */\n.route-object { view-transition-name: route-object; }\n\n@media (prefers-reduced-motion: reduce) {\n  @view-transition { navigation: none; }\n}',js:'// No startViewTransition() needed.\n// Use a same-origin link in page A:\n// <a href="page-b.html">Next page →</a>\n// Page B links back to page-a.html.\n// Normal navigation is the fallback.',practices:[['Opt in on both pages.','Add @view-transition { navigation: auto; } to both documents. The navigation must stay on the same origin, including redirects.'],['Use stable names across documents.','Explicit names can link related objects on different pages. match-element names cannot be transferred to another document.'],['Check the separate support surface.','Support for document.startViewTransition does not guarantee cross-document support. A regular link must work either way.']],access:[['Keep native navigation.','Use an anchor with a meaningful label. Browser history, opening in a new tab, and normal page navigation remain available.'],['Provide a title and heading.','Each destination has its own document title, heading, and return link. Do not treat the animation as a replacement for page structure.'],['Carry the motion preference.','These demo pages honor the OS setting and carry the lab’s reduce-motion or fallback setting through the URL. Both pages can opt out of animation.']],resources:['pages','css','motion']}
  ,reveal:{label:'Circular reveal',title:'Reveal a new state.',meta:'09 / CUSTOM SNAPSHOT ANIMATION',description:'Replace the default crossfade with a circular wipe. Choose an origin, then reveal the next signal state.',hint:'CLICK THE SIGNAL OR RUN THE TRANSITION',html:revealHTML,css:`.reveal-card { view-transition-name: reveal-surface; }
::view-transition-old(reveal-surface) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-new(reveal-surface) {
  animation-name: reveal-in;
  mix-blend-mode: normal;
}
@keyframes reveal-in {
  from { clip-path: circle(0% at var(--reveal-origin, 50% 50%)); }
  to { clip-path: circle(150% at var(--reveal-origin, 50% 50%)); }
}`,js:`const signal = document.querySelector('#reveal-card');
document.querySelectorAll('[data-origin]').forEach(button => {
  button.addEventListener('click', () => {
    document.documentElement.style.setProperty('--reveal-origin', button.dataset.origin);
    document.querySelectorAll('[data-origin]').forEach(b => {
      b.setAttribute('aria-pressed', b === button);
    });
  });
});
signal.addEventListener('click', () => {
  transition(() => {
    const found = signal.classList.toggle('is-signal');
    signal.setAttribute('aria-pressed', found);
    signal.querySelector('.reveal-title').innerHTML = found
      ? 'SIGNAL<br>FOUND.' : 'ALL<br>QUIET.';
  });
});`,practices:[['Animate the new snapshot.','Keep the old snapshot visible while clip-path reveals the new one above it. A custom CSS keyframe replaces the default crossfade.'],['Set the origin before capture.','The origin variable is chosen before starting the transition. Use a generous final radius so the wipe reaches every corner.'],['Limit the effect to one region.','A named snapshot keeps the wipe inside the signal panel. Reserve full-screen reveals for changes that warrant that amount of motion.']],access:[['Keep a stable trigger.','The signal remains the same button in both states. Enter and Space activate it, and aria-pressed exposes whether a signal is found.'],['Support more than pointer coordinates.','The origin controls work with keyboard and touch. A centered origin is a useful default when there is no pointer position.'],['Skip spatial motion when requested.','The shared wrapper updates immediately for reduced motion or missing API support. The visual state and accessible pressed state still change together.']],resources:['using','clip','motion']}

};
const wrapperCode = () => `// Progressive enhancement: the update always runs.\nfunction announce() {\n  const status = document.querySelector('#demo-status');\n  if (status) status.textContent = 'View updated.';\n}\nconst motion = matchMedia('(prefers-reduced-motion: reduce)');\nlet active;\nasync function transition(update) {\n  active?.skipTransition();\n  const reduceMotion = ${$('#reduce-motion').checked};\n  const simulateNoAPI = ${$('#fallback').checked};\n  if (!document.startViewTransition || motion.matches\n      || reduceMotion || simulateNoAPI) {\n    update();\n    announce();\n    return;\n  }\n  active = document.startViewTransition(() => {\n    update();\n    announce();\n  });\n  active.ready.catch(() => {}); // Can be skipped.\n  try { await active.finished; }\n  catch (error) { console.error(error); }\n}\nmotion.addEventListener('change', event => {\n  if (event.matches) active?.skipTransition();\n});`;
function timingCSS(){return `::view-transition-group(*),\n::view-transition-old(*),\n::view-transition-new(*) {\n  animation-duration: ${$('#duration').value}ms;\n  animation-timing-function: ${$('#easing').value};\n}\n@media (prefers-reduced-motion: reduce) {\n  ::view-transition-group(*),\n  ::view-transition-old(*),\n  ::view-transition-new(*) { animation: none !important; }\n}`;}
function highlighted(code){return code.split('\n').map(line=>{const escaped=escapeHTML(line);if(/^\s*(\/\/|\/\*|\*|<!--)/.test(line))return `<span class="syntax-comment">${escaped}</span>`;return escaped.replace(/(&#39;.*?&#39;|&quot;.*?&quot;)/g,'<span class="syntax-string">$1</span>').replace(/\b(const|let|async|await|function|return|if)\b/g,'<span class="syntax-keyword">$1</span>');}).join('\n');}
function updateCode(){const d=experiments[current];$('#code').innerHTML=highlighted(`/* CSS */\n${d.css}\n\n${timingCSS()}\n\n// JAVASCRIPT\n${d.js}`);$('#wrapper-code').textContent=wrapperCode();}
function renderNotes(kind,items){$('#panel-'+kind).innerHTML=`<div class="note-panel">${items.map(([title,body],i)=>`<article class="note-block"><span>0${i+1} /</span><h4>${title}</h4><p>${body}</p></article>`).join('')}</div>`;}
function phase(name){$$('[data-phase]').forEach(el=>el.dataset.active=String(el.dataset.phase===name));}
function status(message){$('#run-status').textContent=message;}
function reduced(){return media.matches || $('#reduce-motion').checked;}
function applyTiming(){root.style.setProperty('--duration',$('#duration').value+'ms');root.style.setProperty('--ease',$('#easing').value);$('#duration-output').value=$('#duration').value+' ms';updateCode();updatePageLink();}
function updatePageLink(){const link=$('#open-pages');if(link){const query=new URLSearchParams({duration:$('#duration').value,easing:$('#easing').value,motion:reduced()||$('#fallback').checked?'reduce':'auto'});link.href='page-a.html?'+query;}}
function updateMotion(){if(reduced()||$('#fallback').checked)activeTransition?.skipTransition();$('#motion-note').textContent=media.matches?'SYSTEM: REDUCED MOTION — transitions are skipped.':$('#reduce-motion').checked?'REDUCED MOTION — state changes without animation.':$('#fallback').checked?'FALLBACK — updates run without the View Transitions API.':'System motion preference is always respected.';updateCode();updatePageLink();}
async function perform(update,message){
  if(busy)return;
  const thisRun=++runId;busy=true;$('#run').setAttribute('aria-disabled','true');
  phase('capture');
  const doUpdate=()=>{if(thisRun!==runId)return;phase('update');update();$('#state-label').textContent=stateLabel();};
  try{
    if(!document.startViewTransition||reduced()||$('#fallback').checked){doUpdate();phase(null);status(message+' · Updated without animation.');return;}
    const transition=document.startViewTransition(doUpdate);activeTransition=transition;
    transition.ready.then(()=>{if(thisRun===runId){phase('animate');status('Animating the new view…');}}).catch(()=>{});
    await transition.finished;
    if(thisRun===runId){phase(null);status(message+' · Transition complete.');}
  }catch(error){if(thisRun===runId)status('The animation was skipped. The state update still applies.');console.error(error);}
  finally{if(thisRun===runId){activeTransition=null;busy=false;$('#run').removeAttribute('aria-disabled');}}
}
function stateLabel(){if(current==='navigation')return 'TWO DOCUMENTS';if(['tabs','pagination','gallery'].includes(current))return `STATE ${'ABC'[step%3]}`;return step%2?'STATE B':'STATE A';}
function runDemo(target){
  if(busy)return;
  if(current==='navigation'){location.href=$('#open-pages').href;return;}
  let next=typeof target==='number'?target:step+1;
  if(['tabs','gallery'].includes(current)&&next%3===step%3)return;
  if(current==='reveal')perform(()=>{step=next;const found=step%2===1;const panel=$('#reveal-card');panel.classList.toggle('is-signal',found);panel.setAttribute('aria-pressed',found);$('.reveal-title',panel).innerHTML=found?'SIGNAL<br>FOUND.':'ALL<br>QUIET.';},step%2?'Signal cleared.':'Signal found.');
  if(current==='shared')perform(()=>{step=next;const card=$('.specimen');const open=step%2===1;card.classList.toggle('is-expanded',open);card.setAttribute('aria-expanded',open);card.setAttribute('aria-label',open?'Collapse Form 01':'Expand Form 01');$('.specimen-footer span',card).textContent=open?'CLICK TO COLLAPSE':'CLICK TO EXPLORE';},step%2?'Card collapsed.':'Card expanded.');
  if(current==='reorder')perform(()=>{step=next;const list=$('.demo-list');list.append(...[...list.children].reverse());},'List order reversed.');
  if(current==='layout')perform(()=>{step=next;const list=step%2===1;$('.demo-tiles').classList.toggle('is-list',list);$('#run').setAttribute('aria-pressed',list);},step%2?'Grid layout selected.':'List layout selected.');
  if(current==='filter'){const solid=next%2===1;if(solid===Boolean(step%2))return;perform(()=>{step=next;$$('[data-kind]',stage).forEach(item=>item.hidden=solid&&item.dataset.kind!=='solid');$$('[data-filter]',stage).forEach(button=>button.setAttribute('aria-pressed',solid?button.dataset.filter==='solid':button.dataset.filter==='all'));},solid?'3 solid forms shown.':'All 6 forms shown.');}
  if(current==='tabs'){const copy=[['LESS, BUT<br>IN MOTION.','A study in form, proportion, and continuity.'],['INK. PAPER.<br>PIXELS.','Simple materials. Precise geometry. Nothing extra.'],['200 × 180','A constant canvas for changing ideas.']];next%=3;perform(()=>{step=next;$$('[data-demo-tab]',stage).forEach((button,i)=>{button.setAttribute('aria-selected',i===step);button.tabIndex=i===step?0:-1;});$('#spec-panel').setAttribute('aria-labelledby','spec-tab-'+step);$('#spec-panel').innerHTML=`<h4>${copy[step][0]}</h4><p>${copy[step][1]}</p>`;},['Overview','Materials','Dimensions'][next]+' panel selected.');}
  if(current==='pagination'){const dir=typeof target==='number'?target:1;root.style.setProperty('--direction',dir);next=(step+dir+3)%3;const copy=[['Establish the context.','A clear starting point makes the next step feel natural.'],['Connect the change.','Let direction show how one moment relates to the next.'],['Keep your bearings.','The content changes. Your place in the sequence stays clear.']];perform(()=>{step=next;$('.page-number').textContent='0'+(step+1);$('.page-content h4').textContent=copy[step][0];$('.page-content p').textContent=copy[step][1];$('#page-count').textContent=`0${step+1} / 03`;},`Step ${next+1} of 3. ${copy[next][0]}`);}
  if(current==='gallery'){next%=3;perform(()=>{step=next;$('#gallery-main').innerHTML=art(step);$$('[data-gallery]',stage).forEach((button,i)=>button.setAttribute('aria-pressed',i===step));$('#gallery-caption').textContent=['CUBE / 001','ORBIT / 002','PEAK / 003'][step];},['Cube','Orbit','Peak'][next]+' study selected.');}
}
function selectExperiment(id,{announce=true}={}){
  if(!experiments[id])id='shared';
  runId++;activeTransition?.skipTransition();activeTransition=null;busy=false;current=id;step=0;
  $('#run').removeAttribute('aria-disabled');$('#run').removeAttribute('aria-pressed');if(id==='layout')$('#run').setAttribute('aria-pressed','false');
  const d=experiments[id];$$('[data-experiment]').forEach(b=>b.setAttribute('aria-current',b.dataset.experiment===id));
  $('#demo-meta').textContent=d.meta;$('#demo-title').textContent=d.title;$('#demo-description').textContent=d.description;$('#stage-hint').textContent=d.hint;
  root.style.setProperty('--reveal-origin','50% 50%');
  stage.innerHTML=d.html();$('#state-label').textContent=stateLabel();$('#run-label').textContent=id==='navigation'?'OPEN NAVIGATION DEMO':'RUN TRANSITION';
  renderNotes('practice',d.practices);renderNotes('access',d.access);$('#resource-links').innerHTML=d.resources.map(k=>`<a href="${links[k][1]}" target="_blank" rel="noopener noreferrer">${links[k][0]} <span aria-hidden="true">↗</span></a>`).join('');
  $('#copy').textContent=id==='navigation'?'COPY CSS ⧉':'COPY ⧉';
  $('#panel-code .code-note p').innerHTML=id==='navigation'?'Shared CSS for both HTML documents.<br>Use the links in the navigation demo.':'Copy includes runnable HTML + safety wrapper.<br>Timing follows your controls.';
  $('.wrapper').hidden=id==='navigation';phase(null);status(announce?`${d.label} selected. Ready when you are.`:'Ready when you are.');updateCode();updatePageLink();
  const url=new URL(location.href);url.searchParams.set('demo',id);history.replaceState(null,'',url);
}
$$('[data-experiment-count]').forEach(el=>{const count=String(ids.length).padStart(2,'0');el.textContent=el.hasAttribute('data-brackets')?'['+count+']':count;});
$('#experiment-list').innerHTML=ids.map((id,i)=>`<button data-experiment="${id}" type="button" aria-current="${i===0}"><span>${String(i+1).padStart(2,'0')}</span>${experiments[id].label}<span class="index-arrow" aria-hidden="true">↗</span></button>`).join('');
$('#experiment-list').addEventListener('click',event=>{const button=event.target.closest('[data-experiment]');if(button)selectExperiment(button.dataset.experiment);});
$('#run').addEventListener('click',()=>runDemo());
$('#reset').addEventListener('click',()=>{selectExperiment(current,{announce:false});status('Experiment reset to its starting state.');});
stage.addEventListener('click',event=>{if(event.target.closest('.specimen')||event.target.closest('#reveal-card'))runDemo();const origin=event.target.closest('[data-origin]');if(origin){root.style.setProperty('--reveal-origin',origin.dataset.origin);$$('[data-origin]',stage).forEach(button=>button.setAttribute('aria-pressed',button===origin));}const filter=event.target.closest('[data-filter]');if(filter)runDemo(filter.dataset.filter==='solid'?1:0);const tab=event.target.closest('[data-demo-tab]');if(tab)runDemo(Number(tab.dataset.demoTab));const page=event.target.closest('[data-page-dir]');if(page)runDemo(Number(page.dataset.pageDir));const gallery=event.target.closest('[data-gallery]');if(gallery)runDemo(Number(gallery.dataset.gallery));});
stage.addEventListener('keydown',event=>{const tab=event.target.closest('[data-demo-tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();if(busy)return;const index=Number(tab.dataset.demoTab);const next=event.key==='Home'?0:event.key==='End'?2:(index+(event.key==='ArrowRight'?1:-1)+3)%3;$('#spec-tab-'+next).focus();runDemo(next);});
$$('.inspector-tabs [role=tab]').forEach((tab,index,tabs)=>{const activate=()=>{tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',selected);t.tabIndex=selected?0:-1;$('#'+t.getAttribute('aria-controls')).hidden=!selected;});};tab.addEventListener('click',activate);tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();tabs[next].focus();});});
$('#duration').addEventListener('input',applyTiming);$('#easing').addEventListener('change',applyTiming);$('#reduce-motion').addEventListener('change',updateMotion);$('#fallback').addEventListener('change',updateMotion);media.addEventListener('change',updateMotion);
$('#support-label').innerHTML='<span class="status-dot"></span>'+(document.startViewTransition?'SAME-DOCUMENT API SUPPORTED':'FALLBACK MODE / NO SAME-DOCUMENT API');
const standaloneCSS = `body{margin:0;padding:32px;background:var(--paper);color:var(--ink);font-family:system-ui}button{cursor:pointer;color:inherit}button:focus-visible{outline:3px solid var(--red);outline-offset:4px}main{max-width:600px;margin:auto}svg{max-width:100%}.eyebrow,.tile-label{font-size:11px}.specimen{width:230px;border:1px solid;background:var(--paper);text-align:left;padding:0;display:grid}.specimen-art{display:grid;place-items:center;height:160px;border-bottom:1px solid}.specimen-art svg{width:160px;height:140px}.specimen-copy{padding:20px}.specimen-title{font-size:28px;font-weight:800}.specimen-detail{display:none;line-height:1.6}.specimen-footer{display:flex;justify-content:space-between;margin-top:12px;font-size:11px}.specimen.is-expanded{width:100%;grid-template-columns:1fr 1fr}.specimen.is-expanded .specimen-art{height:100%;border-right:1px solid;border-bottom:0}.specimen.is-expanded .specimen-detail{display:block}.demo-list{list-style:none;padding:0;display:grid;gap:10px}.demo-list li{padding:20px;border:1px solid;display:flex;gap:15px}.demo-list li span:last-child{margin-left:auto}.demo-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.demo-tile{border:1px solid;padding:20px;display:flex;flex-direction:column;gap:10px}.tile-icon{font-size:35px;color:var(--red)}.demo-tiles.is-list{grid-template-columns:1fr}.demo-tiles.is-list .demo-tile{flex-direction:row;align-items:center}.filter-controls,.gallery-controls{display:flex;gap:12px;margin:20px 0}.filter-controls button,.gallery-controls button{padding:10px;border:1px solid;background:var(--paper)}[aria-pressed=true]{outline:2px solid var(--red)}.demo-tab-list{display:flex;border-bottom:1px solid}.demo-tab-list button{flex:1;padding:14px;border:0;background:var(--paper)}[aria-selected=true]{border-bottom:3px solid var(--red)!important}.demo-tab-content{padding:30px;border:1px solid;min-height:150px}h4{font-size:28px;margin:8px 0}.pagination-scene{padding:25px;border:1px solid}.page-number{font-size:80px;color:var(--red)}.pagination-controls{display:flex;justify-content:space-between}.pagination-controls button{padding:10px}.gallery-main{height:250px;border:1px solid;display:grid;place-items:center}.gallery-main svg{height:220px}.gallery-caption{align-self:center}#demo-action{margin:24px 0;padding:14px 20px;background:var(--red);color:var(--on-accent);border:0}[hidden]{display:none!important}@media(max-width:500px){body{padding:18px}.demo-tile{padding:12px}.specimen.is-expanded{grid-template-columns:1fr}.specimen.is-expanded .specimen-art{height:150px;border-right:0;border-bottom:1px solid}}`;
const extraExampleCSS = '.reveal-scene{width:100%;max-width:420px}.reveal-card{display:flex;flex-direction:column;gap:18px;width:100%;min-height:220px;border:1px solid;background:var(--paper);color:var(--ink);padding:22px;text-align:left}.reveal-card.is-signal{background:var(--red);color:var(--on-accent)}.reveal-title{font-size:44px;font-weight:800;line-height:.95}.reveal-caption{font-size:11px}.origin-controls{display:flex;align-items:center;gap:8px;margin-top:12px;font-size:10px}.origin-controls button{border:1px solid;background:var(--paper);color:var(--ink);padding:8px;font-size:10px}';
function exportThemeCSS(){
  const palette = getComputedStyle(root);
  const names = ['paper','ink','red','on-accent','art-ink','art-paper','art-accent'];
  return ':root{color-scheme:' + (root.dataset.theme === 'light' ? 'light' : 'dark') + ';'
    + names.map(name => '--' + name + ':' + palette.getPropertyValue('--' + name).trim() + ';').join('') + '}';
}
function exportExample(){const d=experiments[current];if(current==='navigation')return d.css+'\n\n'+timingCSS()+'\n\n/* Use ordinary same-origin links between page-a.html and page-b.html. No JavaScript is required. */';
  const action=['reorder','layout'].includes(current)?'<button id="demo-action">'+(current==='layout'?'Toggle list layout':'Reverse order')+'</button>':'';
  const templates=current==='gallery'?[0,1,2].map(i=>`<template>${art(i)}</template>`).join(''):'';
  return `<!doctype html>\n<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${d.label} — VT/LAB example</title>\n<style>\n${exportThemeCSS()}\n${standaloneCSS}\n${extraExampleCSS}\n${d.css}\n${timingCSS()}\n</style>\n<main><h1>${d.label}</h1>\n${d.html()}\n${action}\n<p id="demo-status" role="status" aria-live="polite"></p></main>\n${templates}\n<script>\n${wrapperCode()}\n${d.js}\n</script></html>`;
}
$('#copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(exportExample());$('#copy').textContent='COPIED ✓';status(current==='navigation'?'Cross-document CSS copied. Add it to both pages.':'Standalone example copied. Save as an HTML file and open in a browser.');}catch{const code=$('#code');const selection=getSelection();const range=document.createRange();range.selectNodeContents(code);selection.removeAllRanges();selection.addRange(range);status('Clipboard unavailable. The displayed code is selected; use your browser’s Copy command.');} });
const initial = new URLSearchParams(location.search);
if(initial.has('duration'))$('#duration').value=String(Math.max(100,Math.min(2000,Number(initial.get('duration'))||600)));
if([...$('#easing').options].some(option=>option.value===initial.get('easing')))$('#easing').value=initial.get('easing');
if(initial.get('motion')==='reduce')$('#reduce-motion').checked=true;
selectExperiment(initial.get('demo')||'shared',{announce:false});applyTiming();updateMotion();
