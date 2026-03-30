const state = {
  keyword: '',
  dataset: null,
  section: null
};

const pageMode = document.body.dataset.page || 'hub';

const elements = {
  title: document.getElementById('page-title'),
  subtitle: document.getElementById('page-subtitle'),
  search: document.getElementById('search'),
  list: document.getElementById('tool-list'),
  sectionGrid: document.getElementById('section-grid'),
  metaLine: document.getElementById('meta-line'),
  toolTemplate: document.getElementById('tool-card-template'),
  sectionTemplate: document.getElementById('section-card-template'),
  copyStack: document.getElementById('copy-stack')
};

function normalize(v) {
  return String(v || '').toLowerCase();
}

function copy(text, successText = '已复制') {
  navigator.clipboard
    .writeText(text)
    .then(() => window.alert(successText))
    .catch(() => window.alert('复制失败，请手动复制。'));
}

function hit(tool, keyword) {
  if (!keyword) return true;
  const text = [tool.name, tool.fitFor, tool.whyPick, tool.pricing, ...(tool.tags || [])].join(' ');
  return normalize(text).includes(normalize(keyword));
}

function getToolCountBySection(tools) {
  return tools.reduce((acc, tool) => {
    acc[tool.section] = (acc[tool.section] || 0) + 1;
    return acc;
  }, {});
}

function renderHub() {
  const data = state.dataset;
  if (!data || !elements.sectionGrid || !elements.sectionTemplate) return;

  const counts = getToolCountBySection(data.tools);
  elements.sectionGrid.innerHTML = '';

  data.sections.forEach((section) => {
    const node = elements.sectionTemplate.content.cloneNode(true);
    node.querySelector('.section-name').textContent = section.name;
    node.querySelector('.section-desc').textContent = section.description;
    node.querySelector('.section-count').textContent = `收录工具：${counts[section.id] || 0}`;

    const link = node.querySelector('.section-link');
    link.href = `/ai-nav/${section.id}/`;
    link.textContent = `进入 ${section.name}`;

    elements.sectionGrid.appendChild(node);
  });
}

function renderTrack() {
  const data = state.dataset;
  if (!data || !elements.list || !elements.toolTemplate || !state.section) return;

  const sectionMeta = data.sections.find((s) => s.id === state.section);
  if (!sectionMeta) {
    elements.list.innerHTML = '<p class="panel">赛道不存在，请返回首页。</p>';
    return;
  }

  const tools = data.tools.filter((tool) => tool.section === state.section && hit(tool, state.keyword));
  elements.list.innerHTML = '';

  tools.forEach((tool) => {
    const node = elements.toolTemplate.content.cloneNode(true);
    node.querySelector('.tool-name').textContent = tool.name;
    node.querySelector('.tool-fit').textContent = `适用：${tool.fitFor}`;
    node.querySelector('.tool-why').textContent = `推荐理由：${tool.whyPick}`;
    node.querySelector('.tool-pricing').textContent = `定价：${tool.pricing}`;
    node.querySelector('.tool-template').textContent = tool.template;

    const chips = node.querySelector('.chip-list');
    (tool.tags || []).forEach((tag) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = tag;
      chips.appendChild(chip);
    });

    const copyBtn = node.querySelector('.copy-template');
    copyBtn.addEventListener('click', () => copy(tool.template, `已复制 ${tool.name} 模板`));

    const trialLink = node.querySelector('.trial-link');
    trialLink.href = tool.affiliateUrl;
    trialLink.textContent = tool.affiliateLabel || '去试用';

    elements.list.appendChild(node);
  });

  if (!tools.length) {
    elements.list.innerHTML = '<p class="panel">这个赛道下没有匹配结果，换个关键词试试。</p>';
  }

  if (elements.title) elements.title.textContent = `${sectionMeta.name} · AI 工具导航`;
  if (elements.subtitle) elements.subtitle.textContent = sectionMeta.description;
}

function bindCommonEvents() {
  if (elements.copyStack) {
    elements.copyStack.addEventListener('click', () => {
      const stackText = [
        'AI 导航最小可用工具栈：',
        '1) 内容生产：Notion AI + Perplexity',
        '2) 电商增长：Shopify Magic + Klaviyo',
        '3) 开发效率：Codex CLI + Sentry',
        '4) 销售获客：Apollo + HubSpot',
        '5) 客服支持：Intercom + Langfuse',
        '',
        '建议先选一个赛道打透，再复制到其他赛道。'
      ].join('\n');
      copy(stackText, '多赛道工具栈已复制');
    });
  }
}

function bindTrackEvents() {
  if (!elements.search) return;
  elements.search.addEventListener('input', (event) => {
    state.keyword = event.target.value.trim();
    renderTrack();
  });
}

function detectSectionFromPath() {
  // /ai-nav/{section}/
  const matched = window.location.pathname.match(/^\/ai-nav\/([^/]+)\/?$/);
  return matched ? matched[1] : null;
}

async function bootstrap() {
  const response = await fetch('/ai-nav/data/tools.json', { cache: 'no-store' });
  const data = await response.json();
  state.dataset = data;

  bindCommonEvents();

  if (pageMode === 'track') {
    state.section = document.body.dataset.section || detectSectionFromPath();
    bindTrackEvents();
    renderTrack();
  } else {
    renderHub();
  }

  const totalTools = data.tools.length;
  const totalSections = data.sections.length;
  if (elements.metaLine) {
    elements.metaLine.textContent = `数据版本 ${data.meta.version} · 更新于 ${data.meta.lastUpdated} · ${totalSections} 个赛道 / ${totalTools} 个工具`;
  }
}

bootstrap().catch((error) => {
  if (elements.list) {
    elements.list.innerHTML = '<p class="panel">加载失败，请检查 data/tools.json 是否有效。</p>';
  }
  if (elements.sectionGrid) {
    elements.sectionGrid.innerHTML = '<p class="panel">加载失败，请检查 data/tools.json 是否有效。</p>';
  }
  console.error(error);
});
