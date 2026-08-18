import "./styles.css";

const DATA_ROOT = "/data/cornell";
const categories = {
  communities: { label: "Communities", icon: "◌", description: "Find people and places where your interests have a home." },
  people: { label: "People", icon: "◎", description: "Discover Cornellians, networks, mentors, and paths to connection." },
  events: { label: "Events", icon: "◷", description: "See what is happening across Cornell and its communities." },
  opportunities: { label: "Opportunities", icon: "↗", description: "Find a next step: research, programs, funding, and more." },
  entrepreneurship: { label: "Entrepreneurship", icon: "✦", description: "Explore the people, programs, spaces, and ideas behind Cornell ventures." },
  student_built: { label: "Student-built", icon: "⌘", description: "Surface the tools and resources students make for each other." },
};
const synonyms = {
  founder: ["founders", "startup", "startups", "entrepreneurship", "entrepreneurs"],
  founders: ["founder", "startup", "startups", "entrepreneurship", "entrepreneurs"],
  startup: ["startups", "founder", "founders", "entrepreneurship", "venture"],
  ai: ["artificial intelligence", "generative ai", "technology"],
  climate: ["sustainability", "green technology", "emerging markets"],
  international: ["emerging markets", "global", "alumni"],
  club: ["community", "student organization", "student club"],
  help: ["support", "career", "research", "mentorship"],
};
const stopWords = new Set(["a", "an", "and", "around", "about", "are", "can", "do", "for", "from", "how", "i", "in", "is", "it", "me", "my", "of", "on", "or", "show", "something", "that", "the", "this", "to", "want", "what", "where", "with", "you"]);
const state = { entities: [], relationships: [], route: { page: "home" } };

const escapeHtml = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const slugLabel = (value = "") => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const sourceLabel = (type = "") => ({ official_university: "Official Cornell", official_school_department: "Johnson", cornellian_community: "Cornellian", student_built: "Student-built", external: "External" }[type] || slugLabel(type));
const normalize = (value = "") => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const tokenize = (value = "") => normalize(value).split(/\s+/).filter((token) => token.length > 1 && !stopWords.has(token));

function memory() {
  try { return JSON.parse(localStorage.getItem("student-os-memory") || "{}") || {}; } catch { return {}; }
}
function updateMemory(update) {
  try { localStorage.setItem("student-os-memory", JSON.stringify({ ...memory(), ...update })); } catch { /* optional local session */ }
}
function rememberEntity(id) { const current = memory(); updateMemory({ viewedEntityIds: [id, ...(current.viewedEntityIds || []).filter((item) => item !== id)].slice(0, 12) }); }
function rememberCategory(category) { const current = memory(); updateMemory({ selectedCategories: [category, ...(current.selectedCategories || []).filter((item) => item !== category)].slice(0, 6) }); }
function rememberQuery(query) { const current = memory(); updateMemory({ recentQueries: [query, ...(current.recentQueries || []).filter((item) => item !== query)].slice(0, 6) }); }
function isSaved(id) { return (memory().savedEntityIds || []).includes(id); }
function toggleSaved(id) { const current = memory(); const saved = current.savedEntityIds || []; updateMemory({ savedEntityIds: saved.includes(id) ? saved.filter((item) => item !== id) : [id, ...saved] }); }
function viewedEntities() { return (memory().viewedEntityIds || []).map(getEntityById).filter(Boolean); }

function getEntitiesByCategory(category) { return state.entities.filter((entity) => entity.domains?.includes(category)); }
function getEntityById(id) { return state.entities.find((entity) => entity.id === id); }
function getRelatedEntities(entityId) {
  const linkedIds = state.relationships.filter((item) => item.fromEntityId === entityId || item.toEntityId === entityId).map((item) => item.fromEntityId === entityId ? item.toEntityId : item.fromEntityId);
  return [...new Set(linkedIds)].map(getEntityById).filter(Boolean);
}
function getRelationship(entityId, relatedId) { return state.relationships.find((item) => (item.fromEntityId === entityId && item.toEntityId === relatedId) || (item.toEntityId === entityId && item.fromEntityId === relatedId)); }
function getRelationshipLabel(entityId, relatedId) { const relationship = getRelationship(entityId, relatedId); return relationship ? relationship.type.replaceAll("_", " ") : "related"; }
function iconForEntity(entity) { return categories[entity.domains?.[0]]?.icon || "•"; }

function entitySearchText(entity) {
  const relatedNames = getRelatedEntities(entity.id).map((item) => item.name).join(" ");
  return normalize([entity.name, entity.kind, entity.shortDescription, ...(entity.domains || []), ...(entity.tags || []), ...(entity.interests || []), entity.program, entity.school, entity.department, entity.audience?.audiences?.join(" "), entity.audience?.programs?.join(" "), relatedNames].filter(Boolean).join(" "));
}

function interpretQuery(query) {
  const normalized = normalize(query);
  const expandedTokens = [...tokenize(query), ...tokenize(query).flatMap((token) => synonyms[token] || [])];
  const intent = {
    category: Object.keys(categories).find((category) => normalized.includes(category.replaceAll("_", " ")) || (category === "communities" && /(club|community|people like)/.test(normalized)) || (category === "events" && /(event|happening|this week|tonight)/.test(normalized)) || (category === "opportunities" && /(opportunit|fellowship|competition|funding|research)/.test(normalized))) || null,
    discovery: /(don t know|didn t know|interesting|surprising|new|discover)/.test(normalized),
    terms: expandedTokens,
  };
  return intent;
}

function searchEntities(query) {
  const intent = interpretQuery(query);
  const queryText = normalize(query);
  const scored = state.entities.map((entity) => {
    const text = entitySearchText(entity);
    let score = 0;
    if (normalize(entity.name) === queryText) score += 24;
    if (normalize(entity.name).includes(queryText) && queryText.length > 2) score += 15;
    for (const term of intent.terms) {
      if (normalize(entity.name).includes(term)) score += 9;
      if ((entity.tags || []).some((tag) => normalize(tag).includes(term))) score += 6;
      if (text.includes(term)) score += 2;
    }
    if (intent.category && entity.domains?.includes(intent.category)) score += 8;
    if (entity.source?.sourceType === "student_built" && intent.discovery) score += 3;
    if (memory().viewedEntityIds?.includes(entity.id)) score += 1;
    return { entity, score };
  }).filter((item) => item.score > 2).sort((a, b) => b.score - a.score);
  return { intent, results: scored.slice(0, 12).map((item) => item.entity) };
}

function discoverEntities() {
  const current = memory();
  const viewed = new Set(current.viewedEntityIds || []);
  const selected = new Set(current.selectedCategories || []);
  const anchorIds = [...(current.viewedEntityIds || [])];
  const anchors = anchorIds.map(getEntityById).filter(Boolean);
  const candidates = state.entities.filter((entity) => !viewed.has(entity.id));
  const scored = candidates.map((entity) => {
    let score = entity.source?.sourceType === "student_built" ? 4 : 0;
    const relatedToAnchor = anchors.filter((anchor) => getRelatedEntities(anchor.id).some((item) => item.id === entity.id));
    score += relatedToAnchor.length * 12;
    if (entity.domains?.some((domain) => selected.has(domain))) score += 5;
    if (anchors.some((anchor) => (anchor.tags || []).some((tag) => (entity.tags || []).includes(tag)))) score += 5;
    if (entity.domains?.some((domain) => ["people", "events", "student_built"].includes(domain))) score += 3;
    return { entity, score, relatedToAnchor };
  }).sort((a, b) => b.score - a.score);
  const picks = [];
  const domains = new Set();
  for (const item of scored) {
    const domain = item.entity.domains?.find((candidate) => ["people", "events", "opportunities", "student_built", "communities", "entrepreneurship"].includes(candidate));
    if (domain && (!domains.has(domain) || picks.length < 2) && item.score > 0) { picks.push(item); domains.add(domain); }
    if (picks.length === 5) break;
  }
  if (!picks.length) return state.entities.filter((entity) => ["big-red-ai", "jct-mba-course-planner", "ccem", "life-changing-labs"].includes(entity.id)).map((entity) => ({ entity, score: 0, relatedToAnchor: [] }));
  return picks;
}

function discoveryReason(item) {
  const current = memory();
  if (item.relatedToAnchor[0]) return `Related to ${item.relatedToAnchor[0].name}`;
  if (item.entity.source?.sourceType === "student_built") return "Student-built resource in the Cornell ecosystem";
  if (current.selectedCategories?.length && item.entity.domains?.some((domain) => current.selectedCategories.includes(domain))) return `Because you explored ${categories[current.selectedCategories[0]]?.label || "this area"}`;
  if (item.entity.domains?.includes("people")) return "A people-discovery path in the current dataset";
  if (item.entity.domains?.includes("events")) return "A way into Cornell's active communities";
  return "A useful place to start exploring Cornell";
}

function entityCard(entity, options = {}) {
  const metadata = [entity.audience?.programs?.[0], entity.program, entity.date?.startAt].filter(Boolean);
  return `<article class="entity-card ${options.compact ? "entity-card--compact" : ""}" data-entity-id="${escapeHtml(entity.id)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(entity.name)}"><div class="entity-card__topline"><span class="entity-icon">${iconForEntity(entity)}</span><span class="eyebrow">${escapeHtml(slugLabel(entity.kind))}</span><span class="source-badge source-badge--${escapeHtml(entity.source.sourceType)}">${escapeHtml(sourceLabel(entity.source.sourceType))}</span></div><h3>${escapeHtml(entity.name)}</h3><p>${escapeHtml(entity.shortDescription)}</p><div class="entity-card__bottom"><div class="tag-row">${(entity.tags || []).slice(0, 2).map((tag) => `<span class="tag">${escapeHtml(tag.replaceAll("-", " "))}</span>`).join("")}</div><span class="arrow">↗</span></div>${metadata.length ? `<div class="card-meta">${escapeHtml(metadata.join(" · "))}</div>` : ""}</article>`;
}
function categoryCard(category) { const count = getEntitiesByCategory(category).length; const details = categories[category]; return `<button class="category-card" data-category="${category}"><span class="category-card__icon">${details.icon}</span><span class="category-card__label">${details.label}</span><span class="category-card__description">${details.description}</span><span class="category-card__footer"><strong>${count} resources</strong><span>Explore ↗</span></span></button>`; }
function promptChips() { return `<div class="prompt-row"><button data-ask-query="I'm interested in entrepreneurship but don't know where to start.">I'm curious about entrepreneurship</button><button data-ask-query="Find communities for me.">Find a community</button><button data-ask-query="What events are happening?"><span>What's happening?</span></button></div>`; }
function appShell(content) { return `<div class="app-shell"><header class="topbar"><button class="brand" data-route="home" aria-label="Go to Student OS home"><span class="brand-mark">so</span><span>Student OS</span></button><div class="university-pill"><span class="cornell-dot"></span><span>Cornell University</span></div><nav class="topnav" aria-label="Primary navigation"><button data-route="home" class="topnav__link">Home</button><button data-route="explore" class="topnav__link">Explore</button><button data-route="discover" class="topnav__link">Discover</button></nav><div class="profile-chip"><span class="profile-avatar">P</span><span class="profile-name">Prashant</span></div></header><main>${content}</main><footer class="footer"><span>Student OS · Cornell</span><span>Explore what your university has to offer.</span></footer></div>`; }

function askBar(value = "") { return `<form class="ask-bar" id="ask-form"><span>⌕</span><input id="ask-input" aria-label="What are you looking for?" placeholder="What are you looking for?" value="${escapeHtml(value)}" /><button type="submit">Ask Student OS <span>↗</span></button></form>`; }

function homeView() {
  const discoveries = discoverEntities();
  const recent = viewedEntities().slice(0, 4);
  return appShell(`<section class="hero page-width"><div class="hero__copy"><div class="kicker"><span class="kicker-dot"></span> Cornell University · your discovery layer</div><h1>Your university has <em>more</em> to offer than you know.</h1><p class="hero__lead">Student OS brings Cornell's communities, people, events, opportunities, entrepreneurship, and student-built resources into one discoverable experience.</p></div><div class="search-card"><div class="search-card__label">Ask your university</div>${askBar()}<div class="ask-examples">Try a question or a direction</div>${promptChips()}</div></section><section class="section page-width"><div class="section-heading"><div><span class="section-kicker">Explore</span><h2>Find your way into Cornell.</h2></div><p>Six lenses into one connected ecosystem.</p></div><div class="category-grid">${Object.keys(categories).map(categoryCard).join("")}</div></section><section class="section section--discover page-width"><div class="section-heading"><div><span class="section-kicker section-kicker--spark">Discovery layer</span><h2>✨ You might not know these exist</h2></div><p>${recent.length ? "Based on the trail you're making." : "Useful surprises, connected to the world around you."}</p></div><div class="entity-grid entity-grid--four">${discoveries.map((item) => `<div class="discovery-item">${entityCard(item.entity)}<div class="discovery-reason">${escapeHtml(discoveryReason(item))}</div></div>`).join("")}</div></section>${recent.length ? `<section class="section page-width recent-section"><div class="section-heading"><div><span class="section-kicker">Your trail</span><h2>Recently explored</h2></div></div><div class="entity-grid entity-grid--four">${recent.map((entity) => entityCard(entity, { compact: true })).join("")}</div></section>` : ""}`);
}

function exploreView(category = null) {
  if (!category || !categories[category]) return appShell(`<section class="page-width page-intro"><span class="section-kicker">Explore</span><h1>Find your way into Cornell.</h1><p>Browse by the kind of connection you want to make.</p><div class="category-grid category-grid--explore">${Object.keys(categories).map(categoryCard).join("")}</div></section>`);
  rememberCategory(category);
  const details = categories[category]; const entities = getEntitiesByCategory(category);
  return appShell(`<section class="page-width category-hero"><button class="back-link" data-route="explore">← All areas</button><div class="category-hero__row"><div><span class="category-hero__icon">${details.icon}</span><span class="section-kicker">Explore area</span><h1>${details.label}</h1><p>${details.description}</p></div><div class="category-count"><strong>${entities.length}</strong><span>resources to explore</span></div></div></section><section class="page-width category-results"><div class="results-toolbar"><div><span class="section-kicker">${entities.length} results</span><h2>Explore ${details.label.toLowerCase()}</h2></div><label class="mini-search"><span>⌕</span><input id="category-search" placeholder="Filter this area" aria-label="Filter this area" /></label></div><div id="category-entity-grid" class="entity-grid">${entities.map((entity) => entityCard(entity)).join("")}</div></section>`);
}

function groupedResults(results) {
  const used = new Set();
  const groups = [];
  for (const category of ["people", "communities", "events", "opportunities", "entrepreneurship", "student_built"]) {
    const items = results.filter((entity) => !used.has(entity.id) && entity.domains?.includes(category)).slice(0, 3);
    items.forEach((item) => used.add(item.id));
    if (items.length) groups.push({ category, items });
  }
  return groups.map((group) => `<section class="answer-group"><div class="answer-group__heading"><span class="section-kicker">${categories[group.category].label}</span><span>${group.items.length} ${group.items.length === 1 ? "match" : "matches"}</span></div><div class="entity-grid entity-grid--answer">${group.items.map((entity) => entityCard(entity, { compact: true })).join("")}</div></section>`).join("");
}

function askView(query) {
  const search = searchEntities(query);
  const intent = search.intent;
  const results = intent.discovery && !search.results.length ? discoverEntities().map((item) => item.entity) : search.results;
  rememberQuery(query);
  const strong = results.length >= 1;
  const lead = intent.discovery ? "Here are a few useful surprises from the Cornell ecosystem." : intent.category ? `I found ${results.length} ways into ${categories[intent.category].label.toLowerCase()} and connected areas.` : `I found ${results.length} resources that may help you start exploring.`;
  return appShell(`<section class="page-width ask-page"><div class="ask-page__header"><span class="section-kicker">Ask Student OS</span><h1>${strong ? "A place to start." : "Let's widen the map."}</h1><p>${strong ? lead : "I couldn't find a strong match in the Cornell resources currently indexed."}</p>${askBar(query)}</div>${strong ? `<div class="answer-summary"><span class="answer-summary__mark">✦</span><p>${escapeHtml(query)}</p><span class="answer-summary__hint">${intent.discovery ? "Discovery mode" : "Connected results"}</span></div><div class="answer-groups">${groupedResults(results)}</div>` : `<div class="empty-search"><span>⌕</span><h2>Try a direction instead.</h2><p>Explore a category or ask about entrepreneurship, AI, communities, events, research, or student-built tools.</p><div class="empty-links">${Object.keys(categories).map((category) => `<button data-route="category/${category}">${categories[category].label} ↗</button>`).join("")}</div></div>`}</section>`);
}

function relatedSections(entityId) {
  const related = getRelatedEntities(entityId);
  return ["people", "communities", "events", "opportunities", "entrepreneurship", "student_built"].map((category) => ({ category, items: related.filter((entity) => entity.domains?.includes(category)) })).filter((group) => group.items.length).map((group) => `<section class="related-section"><div class="related-section__heading"><span class="section-kicker">${categories[group.category].label}</span><span>${group.items.length}</span></div>${group.items.map((item) => `<button class="related-row" data-entity-id="${escapeHtml(item.id)}"><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(getRelationshipLabel(entityId, item.id))} · ${escapeHtml(sourceLabel(item.source.sourceType))}</small></span><span>↗</span></button>`).join("")}</section>`).join("");
}

function detailView(id) {
  const entity = getEntityById(id); if (!entity) return homeView(); rememberEntity(id);
  const primaryLink = entity.links?.find((link) => link.isPrimary) || entity.links?.[0]; const category = entity.domains?.find((domain) => categories[domain]);
  return appShell(`<section class="page-width detail-page"><button class="back-link" data-route="${category ? `category/${category}` : "home"}">← Back to ${category ? categories[category].label : "home"}</button><div class="detail-layout"><article class="detail-content"><div class="detail-heading"><span class="entity-icon entity-icon--large">${iconForEntity(entity)}</span><div><div class="entity-card__topline"><span class="eyebrow">${escapeHtml(slugLabel(entity.kind))}</span><span class="source-badge source-badge--${escapeHtml(entity.source.sourceType)}">${escapeHtml(sourceLabel(entity.source.sourceType))}</span></div><h1>${escapeHtml(entity.name)}</h1></div></div><p class="detail-description">${escapeHtml(entity.shortDescription)}</p><div class="detail-tags">${(entity.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag.replaceAll("-", " "))}</span>`).join("")}</div>${entity.audience ? `<div class="detail-block"><span class="section-kicker">Good to know</span><p>${escapeHtml([...(entity.audience.audiences || []), ...(entity.audience.programs || [])].join(" · "))}</p></div>` : ""}<div class="detail-block detail-source"><span class="section-kicker">Source</span><p>${escapeHtml(entity.source.sourceName)}${entity.lastVerifiedAt ? ` · verified ${escapeHtml(entity.lastVerifiedAt)}` : ""}</p></div><div class="detail-actions"><a class="primary-action" href="${escapeHtml(primaryLink?.url || entity.source.sourceUrl)}" target="_blank" rel="noreferrer">Open original resource <span>↗</span></a><button class="save-action ${isSaved(id) ? "save-action--saved" : ""}" data-save-id="${escapeHtml(id)}">${isSaved(id) ? "Saved" : "Save for later"} <span>＋</span></button></div></article><aside class="detail-aside"><div class="aside-note"><span class="aside-note__mark">✦</span><p>Student OS is a discovery layer. When you're ready to act, we take you to the original resource.</p></div><div class="related-panel"><div class="section-kicker">Connected ecosystem</div><h2>Related</h2>${relatedSections(id) || `<p class="muted">Explore a little more and we'll keep building the map.</p>`}</div></aside></div></section>`);
}

function render() { const { page, value } = state.route; document.querySelector("#app").innerHTML = page === "category" ? exploreView(value) : page === "entity" ? detailView(value) : page === "ask" ? askView(value || "") : page === "discover" ? discoverView() : page === "explore" ? exploreView() : homeView(); bindEvents(); }
function discoverView() { const items = discoverEntities(); return appShell(`<section class="page-width page-intro discover-page"><span class="section-kicker section-kicker--spark">Discovery layer</span><h1>✨ You might not know these exist.</h1><p>${items.length ? "Connected possibilities, selected from the trail you're making." : "Explore a few areas first and we'll start finding things for you."}</p><div class="entity-grid entity-grid--four">${items.map((item) => `<div class="discovery-item">${entityCard(item.entity)}<div class="discovery-reason">${escapeHtml(discoveryReason(item))}</div></div>`).join("")}</div></section>`); }
function navigate(path) { const [page, rawValue] = path.split("/"); state.route = { page: page || "home", value: rawValue ? decodeURIComponent(rawValue) : undefined }; history.pushState({}, "", `#${path}`); window.scrollTo({ top: 0, behavior: "smooth" }); render(); }
function bindEvents() {
  document.querySelectorAll("[data-route]").forEach((element) => element.addEventListener("click", () => navigate(element.dataset.route)));
  document.querySelectorAll("[data-category]").forEach((element) => element.addEventListener("click", () => { rememberCategory(element.dataset.category); navigate(`category/${element.dataset.category}`); }));
  document.querySelectorAll("[data-ask-query]").forEach((element) => element.addEventListener("click", () => navigate(`ask/${encodeURIComponent(element.dataset.askQuery)}`)));
  document.querySelectorAll("[data-entity-id]").forEach((element) => { const open = () => navigate(`entity/${element.dataset.entityId}`); element.addEventListener("click", open); element.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } }); });
  document.querySelectorAll("[data-save-id]").forEach((element) => element.addEventListener("click", (event) => { event.stopPropagation(); toggleSaved(element.dataset.saveId); render(); }));
  const askForm = document.querySelector("#ask-form"); if (askForm) askForm.addEventListener("submit", (event) => { event.preventDefault(); const query = document.querySelector("#ask-input")?.value.trim(); if (query) navigate(`ask/${encodeURIComponent(query)}`); });
  const search = document.querySelector("#category-search"); if (search) search.addEventListener("input", () => { const category = state.route.value; const query = normalize(search.value); const filtered = getEntitiesByCategory(category).filter((entity) => entitySearchText(entity).includes(query)); document.querySelector("#category-entity-grid").innerHTML = filtered.length ? filtered.map((entity) => entityCard(entity)).join("") : `<div class="empty-state"><span>⌕</span><h3>No matches yet</h3><p>Try a broader word or explore another area.</p></div>`; bindEvents(); });
}
async function init() { try { const [entitiesResponse, relationshipsResponse] = await Promise.all([fetch(`${DATA_ROOT}/entities.json`), fetch(`${DATA_ROOT}/relationships.json`)]); state.entities = await entitiesResponse.json(); state.relationships = await relationshipsResponse.json(); const hash = window.location.hash.replace(/^#/, "") || "home"; const [page, rawValue] = hash.split("/"); state.route = { page, value: rawValue ? decodeURIComponent(rawValue) : undefined }; render(); } catch (error) { document.querySelector("#app").innerHTML = `<div class="load-error"><h1>Student OS is taking a moment.</h1><p>We couldn't load the Cornell resource dataset.</p><code>${escapeHtml(error.message)}</code></div>`; } }
window.addEventListener("popstate", init); init();
