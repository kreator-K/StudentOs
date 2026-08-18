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

const state = { entities: [], relationships: [], route: { page: "home" }, query: "" };

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

const slugLabel = (value = "") => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const sourceLabel = (type = "") => ({
  official_university: "Official Cornell",
  official_school_department: "Johnson",
  cornellian_community: "Cornellian",
  student_built: "Student-built",
  external: "External",
}[type] || slugLabel(type));

function getEntitiesByCategory(category) {
  return state.entities.filter((entity) => entity.domains?.includes(category));
}

function getEntityById(id) {
  return state.entities.find((entity) => entity.id === id);
}

function getRelatedEntities(entityId) {
  const linkedIds = state.relationships
    .filter((relationship) => relationship.fromEntityId === entityId || relationship.toEntityId === entityId)
    .map((relationship) => relationship.fromEntityId === entityId ? relationship.toEntityId : relationship.fromEntityId);
  return [...new Set(linkedIds)].map(getEntityById).filter(Boolean);
}

function getRelationshipLabel(entityId, relatedId) {
  const relationship = state.relationships.find((item) =>
    (item.fromEntityId === entityId && item.toEntityId === relatedId) ||
    (item.toEntityId === entityId && item.fromEntityId === relatedId));
  if (!relationship) return "Related";
  return relationship.fromEntityId === entityId ? relationship.type.replaceAll("_", " ") : relationship.type.replaceAll("_", " ");
}

function getRecentEntities() {
  try {
    return (JSON.parse(localStorage.getItem("student-os-recent") || "[]") || []).map(getEntityById).filter(Boolean);
  } catch { return []; }
}

function rememberEntity(id) {
  try {
    const recent = JSON.parse(localStorage.getItem("student-os-recent") || "[]");
    localStorage.setItem("student-os-recent", JSON.stringify([id, ...recent.filter((item) => item !== id)].slice(0, 5)));
  } catch { /* local session is optional */ }
}

function iconForEntity(entity) {
  return categories[entity.domains?.[0]]?.icon || "•";
}

function entityCard(entity, options = {}) {
  const category = entity.domains?.find((domain) => categories[domain]);
  const metadata = [entity.audience?.programs?.[0], entity.program, entity.date?.startAt].filter(Boolean);
  return `<article class="entity-card ${options.compact ? "entity-card--compact" : ""}" data-entity-id="${escapeHtml(entity.id)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(entity.name)}">
    <div class="entity-card__topline"><span class="entity-icon">${iconForEntity(entity)}</span><span class="eyebrow">${escapeHtml(slugLabel(entity.kind))}</span><span class="source-badge source-badge--${escapeHtml(entity.source.sourceType)}">${escapeHtml(sourceLabel(entity.source.sourceType))}</span></div>
    <h3>${escapeHtml(entity.name)}</h3>
    <p>${escapeHtml(entity.shortDescription)}</p>
    <div class="entity-card__bottom"><div class="tag-row">${(entity.tags || []).slice(0, 2).map((tag) => `<span class="tag">${escapeHtml(tag.replaceAll("-", " "))}</span>`).join("")}</div><span class="arrow">↗</span></div>
    ${metadata.length ? `<div class="card-meta">${escapeHtml(metadata.join(" · "))}</div>` : ""}
  </article>`;
}

function categoryCard(category) {
  const count = getEntitiesByCategory(category).length;
  const details = categories[category];
  return `<button class="category-card" data-category="${category}"><span class="category-card__icon">${details.icon}</span><span class="category-card__label">${details.label}</span><span class="category-card__description">${details.description}</span><span class="category-card__footer"><strong>${count} resources</strong><span>Explore ↗</span></span></button>`;
}

function appShell(content) {
  return `<div class="app-shell"><header class="topbar"><button class="brand" data-route="home" aria-label="Go to Student OS home"><span class="brand-mark">so</span><span>Student OS</span></button><div class="university-pill"><span class="cornell-dot"></span><span>Cornell University</span></div><nav class="topnav" aria-label="Primary navigation"><button data-route="home" class="topnav__link">Home</button><button data-route="explore" class="topnav__link">Explore</button></nav><div class="profile-chip"><span class="profile-avatar">P</span><span class="profile-name">Prashant</span></div></header><main>${content}</main><footer class="footer"><span>Student OS · Cornell</span><span>Explore what your university has to offer.</span></footer></div>`;
}

function homeView() {
  const discoveries = ["big-red-ai", "jct-mba-course-planner", "ccem", "life-changing-labs"].map(getEntityById).filter(Boolean);
  const recent = getRecentEntities();
  return appShell(`<section class="hero page-width"><div class="hero__copy"><div class="kicker"><span class="kicker-dot"></span> Cornell University · your discovery layer</div><h1>Your university has <em>more</em> to offer than you know.</h1><p class="hero__lead">Student OS brings Cornell's communities, people, events, opportunities, entrepreneurship, and student-built resources into one discoverable experience.</p></div><div class="search-card"><div class="search-card__label">Start anywhere</div><div class="search-field"><span>⌕</span><input aria-label="What are you looking for?" placeholder="What are you looking for?" readonly /><span class="search-hint">Visual preview</span></div><div class="prompt-row"><button data-category="entrepreneurship">I'm curious about entrepreneurship</button><button data-category="communities">Find a community</button><button data-category="events">What's happening?</button></div></div></section><section class="section page-width"><div class="section-heading"><div><span class="section-kicker">Explore</span><h2>Find your way into Cornell.</h2></div><p>Six lenses into one connected ecosystem.</p></div><div class="category-grid">${Object.keys(categories).map(categoryCard).join("")}</div></section><section class="section section--discover page-width"><div class="section-heading"><div><span class="section-kicker section-kicker--spark">Discovery layer</span><h2>✨ You might not know these exist</h2></div><p>Useful surprises, connected to the world around you.</p></div><div class="entity-grid entity-grid--four">${discoveries.map((entity) => entityCard(entity)).join("")}</div></section>${recent.length ? `<section class="section page-width recent-section"><div class="section-heading"><div><span class="section-kicker">Your trail</span><h2>Recently explored</h2></div></div><div class="entity-grid entity-grid--four">${recent.map((entity) => entityCard(entity, { compact: true })).join("")}</div></section>` : ""}`);
}

function exploreView(category = null) {
  if (!category || !categories[category]) return appShell(`<section class="page-width page-intro"><span class="section-kicker">Explore</span><h1>Find your way into Cornell.</h1><p>Browse by the kind of connection you want to make.</p><div class="category-grid category-grid--explore">${Object.keys(categories).map(categoryCard).join("")}</div></section>`);
  const details = categories[category];
  const entities = getEntitiesByCategory(category);
  return appShell(`<section class="page-width category-hero"><button class="back-link" data-route="explore">← All areas</button><div class="category-hero__row"><div><span class="category-hero__icon">${details.icon}</span><span class="section-kicker">Explore area</span><h1>${details.label}</h1><p>${details.description}</p></div><div class="category-count"><strong>${entities.length}</strong><span>resources to explore</span></div></div></section><section class="page-width category-results"><div class="results-toolbar"><div><span class="section-kicker">${entities.length} results</span><h2>Explore ${details.label.toLowerCase()}</h2></div><label class="mini-search"><span>⌕</span><input id="category-search" placeholder="Filter this area" aria-label="Filter this area" /></label></div><div id="category-entity-grid" class="entity-grid">${entities.map((entity) => entityCard(entity)).join("")}</div></section>`);
}

function detailView(id) {
  const entity = getEntityById(id);
  if (!entity) return homeView();
  rememberEntity(id);
  const related = getRelatedEntities(id);
  const primaryLink = entity.links?.find((link) => link.isPrimary) || entity.links?.[0];
  const category = entity.domains?.find((domain) => categories[domain]);
  return appShell(`<section class="page-width detail-page"><button class="back-link" data-route="${category ? `category/${category}` : "home"}">← Back to ${category ? categories[category].label : "home"}</button><div class="detail-layout"><article class="detail-content"><div class="detail-heading"><span class="entity-icon entity-icon--large">${iconForEntity(entity)}</span><div><div class="entity-card__topline"><span class="eyebrow">${escapeHtml(slugLabel(entity.kind))}</span><span class="source-badge source-badge--${escapeHtml(entity.source.sourceType)}">${escapeHtml(sourceLabel(entity.source.sourceType))}</span></div><h1>${escapeHtml(entity.name)}</h1></div></div><p class="detail-description">${escapeHtml(entity.shortDescription)}</p><div class="detail-tags">${(entity.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag.replaceAll("-", " "))}</span>`).join("")}</div>${entity.audience ? `<div class="detail-block"><span class="section-kicker">Good to know</span><p>${escapeHtml([...(entity.audience.audiences || []), ...(entity.audience.programs || [])].join(" · "))}</p></div>` : ""}<div class="detail-block detail-source"><span class="section-kicker">Source</span><p>${escapeHtml(entity.source.sourceName)}${entity.lastVerifiedAt ? ` · verified ${escapeHtml(entity.lastVerifiedAt)}` : ""}</p></div><a class="primary-action" href="${escapeHtml(primaryLink?.url || entity.source.sourceUrl)}" target="_blank" rel="noreferrer">Open original resource <span>↗</span></a></article><aside class="detail-aside"><div class="aside-note"><span class="aside-note__mark">✦</span><p>Student OS is a discovery layer. When you're ready to act, we take you to the original resource.</p></div><div class="related-panel"><div class="section-kicker">Connected ecosystem</div><h2>Related</h2>${related.length ? related.map((item) => `<button class="related-row" data-entity-id="${escapeHtml(item.id)}"><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(getRelationshipLabel(id, item.id))} · ${escapeHtml(sourceLabel(item.source.sourceType))}</small></span><span>↗</span></button>`).join("") : `<p class="muted">More connections are coming as the Cornell ecosystem grows.</p>`}</div></aside></div></section>`);
}

function render() {
  const { page, value } = state.route;
  document.querySelector("#app").innerHTML = page === "category" ? exploreView(value) : page === "entity" ? detailView(value) : page === "explore" ? exploreView() : homeView();
  bindEvents();
}

function navigate(path) {
  const [page, value] = path.split("/");
  state.route = { page: page || "home", value };
  history.pushState({}, "", `#${path}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
  render();
}

function bindEvents() {
  document.querySelectorAll("[data-route]").forEach((element) => element.addEventListener("click", () => navigate(element.dataset.route)));
  document.querySelectorAll("[data-category]").forEach((element) => element.addEventListener("click", () => navigate(`category/${element.dataset.category}`)));
  document.querySelectorAll("[data-entity-id]").forEach((element) => {
    const open = () => navigate(`entity/${element.dataset.entityId}`);
    element.addEventListener("click", open);
    element.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } });
  });
  const search = document.querySelector("#category-search");
  if (search) search.addEventListener("input", () => {
    const category = state.route.value;
    const query = search.value.toLowerCase().trim();
    const filtered = getEntitiesByCategory(category).filter((entity) => `${entity.name} ${entity.shortDescription} ${(entity.tags || []).join(" ")}`.toLowerCase().includes(query));
    document.querySelector("#category-entity-grid").innerHTML = filtered.length ? filtered.map((entity) => entityCard(entity)).join("") : `<div class="empty-state"><span>⌕</span><h3>No matches yet</h3><p>Try a broader word or explore another area.</p></div>`;
    bindEvents();
  });
}

async function init() {
  try {
    const [entitiesResponse, relationshipsResponse] = await Promise.all([
      fetch(`${DATA_ROOT}/entities.json`),
      fetch(`${DATA_ROOT}/relationships.json`),
    ]);
    state.entities = await entitiesResponse.json();
    state.relationships = await relationshipsResponse.json();
    const hash = window.location.hash.replace(/^#/, "") || "home";
    const [page, value] = hash.split("/");
    state.route = { page, value };
    render();
  } catch (error) {
    document.querySelector("#app").innerHTML = `<div class="load-error"><h1>Student OS is taking a moment.</h1><p>We couldn't load the Cornell resource dataset.</p><code>${escapeHtml(error.message)}</code></div>`;
  }
}

window.addEventListener("popstate", init);
init();
