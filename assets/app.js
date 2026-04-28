const body = document.body;
const page = body.dataset.page || "";
const contentRoot = body.dataset.contentRoot || "./content";

const byId = (id) => document.getElementById(id);

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const fetchJson = async (fileName) => {
  const response = await fetch(`${contentRoot}/${fileName}`);
  if (!response.ok) {
    throw new Error(`无法读取内容文件：${fileName}`);
  }
  return response.json();
};

const fetchText = async (fileName) => {
  const response = await fetch(`${contentRoot}/${fileName}`);
  if (!response.ok) {
    throw new Error(`无法读取内容文件：${fileName}`);
  }
  return response.text();
};

const makeList = (items) => {
  if (!items || !items.length) {
    return `<p class="muted">待补充</p>`;
  }

  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
};

const renderMarkdown = (text) => {
  const lines = text.replace(/\r/g, "").split("\n");
  let html = "";
  let inList = false;

  const closeList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      closeList();
      continue;
    }

    if (line.startsWith("# ")) {
      closeList();
      html += `<h2>${escapeHtml(line.slice(2))}</h2>`;
      continue;
    }

    if (line.startsWith("## ")) {
      closeList();
      html += `<h3>${escapeHtml(line.slice(3))}</h3>`;
      continue;
    }

    if (line.startsWith("- ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${escapeHtml(line.slice(2))}</li>`;
      continue;
    }

    closeList();
    html += `<p>${escapeHtml(line)}</p>`;
  }

  closeList();
  return html;
};

const renderStageSummary = (data) => {
  const stageTitle = byId("stage-title");
  const stageSummary = byId("stage-summary");
  const stageProgress = byId("stage-progress");
  const stagePercent = byId("stage-percent");
  const stageFocus = byId("stage-focus");

  if (!stageTitle || !data?.currentStage) {
    return;
  }

  stageTitle.textContent = data.currentStage.title;
  stageSummary.textContent = data.currentStage.summary;

  if (stageProgress) {
    stageProgress.style.width = `${data.currentStage.progressPercent}%`;
  }

  if (stagePercent) {
    stagePercent.textContent = `${data.currentStage.progressPercent}%`;
  }

  if (stageFocus) {
    stageFocus.innerHTML = (data.currentStage.focus || [])
      .map((item) => `<div class="pill">${escapeHtml(item)}</div>`)
      .join("");
  }
};

const renderLatestLogs = (data) => {
  const target = byId("latest-log-list");
  if (!target) {
    return;
  }

  const entries = [...(data.entries || [])].sort((a, b) =>
    a.date < b.date ? 1 : -1
  );

  target.innerHTML = entries
    .slice(0, 3)
    .map(
      (entry) => `
        <article class="entry-card">
          <div class="entry-meta">
            <span>${escapeHtml(entry.date)}</span>
            <span>${escapeHtml(entry.theme)}</span>
          </div>
          <h3>${escapeHtml(entry.title)}</h3>
          <div class="entry-detail">
            <div>
              <strong>学到的内容</strong>
              ${makeList(entry.learned)}
            </div>
            <div>
              <strong>下一步计划</strong>
              ${makeList(entry.nextPlan)}
            </div>
          </div>
        </article>
      `
    )
    .join("");
};

const renderTimeline = (data) => {
  const target = byId("learning-log-list");
  if (!target) {
    return;
  }

  const entries = [...(data.entries || [])].sort((a, b) =>
    a.date > b.date ? 1 : -1
  );

  target.innerHTML = entries
    .map(
      (entry) => `
        <article class="entry-card">
          <div class="entry-meta">
            <span>${escapeHtml(entry.date)}</span>
            <span>${escapeHtml(entry.theme)}</span>
          </div>
          <h3>${escapeHtml(entry.title)}</h3>
          <div class="entry-detail">
            <div>
              <strong>学到的内容</strong>
              ${makeList(entry.learned)}
            </div>
            <div>
              <strong>遇到的问题</strong>
              ${makeList(entry.problems)}
            </div>
            <div>
              <strong>下一步计划</strong>
              ${makeList(entry.nextPlan)}
            </div>
            <div>
              <strong>涉及文件</strong>
              ${makeList(entry.files)}
            </div>
          </div>
        </article>
      `
    )
    .join("");
};

const renderExperiments = (data, targetId, limit = null) => {
  const target = byId(targetId);
  if (!target) {
    return;
  }

  const experiments = limit
    ? data.experiments.slice(0, limit)
    : data.experiments;

  target.innerHTML = experiments
    .map(
      (item) => `
        <article class="entry-card">
          <div class="entry-meta">
            <span>${escapeHtml(item.status)}</span>
            <span>${escapeHtml((item.files || []).join(" / "))}</span>
          </div>
          <h3>${escapeHtml(item.name)}</h3>
          <p>${escapeHtml(item.summary)}</p>
          <div class="entry-detail">
            <div>
              <strong>核心知识点</strong>
              ${makeList(item.coreKnowledge)}
            </div>
            <div>
              <strong>运行方式</strong>
              <p><code>${escapeHtml(item.runMethod)}</code></p>
            </div>
            <div>
              <strong>当前体现出的能力</strong>
              <p>${escapeHtml(item.capability)}</p>
            </div>
            <div>
              <strong>备注</strong>
              <p>${escapeHtml(item.notes)}</p>
            </div>
          </div>
        </article>
      `
    )
    .join("");
};

const renderStrategies = (data) => {
  const target = byId("strategy-list");
  if (!target) {
    return;
  }

  target.innerHTML = (data.strategies || [])
    .map(
      (item) => `
        <article class="strategy-card">
          <h3>${escapeHtml(item.name)}</h3>
          <p>${escapeHtml(item.logic)}</p>
          <div class="entry-detail">
            <div>
              <strong>使用数据</strong>
              <p>${escapeHtml(item.data)}</p>
            </div>
            <div>
              <strong>核心代码</strong>
              <p>${escapeHtml(item.coreCode)}</p>
            </div>
            <div>
              <strong>回测结果</strong>
              <p>${escapeHtml(item.backtestResult)}</p>
            </div>
            <div>
              <strong>风险与不足</strong>
              <p>${escapeHtml(item.riskAndLimitations)}</p>
            </div>
            <div>
              <strong>是否适合实盘</strong>
              <p>${escapeHtml(item.liveTradingSuitability)}</p>
            </div>
            <div>
              <strong>当前备注</strong>
              <p>${escapeHtml(item.notes)}</p>
            </div>
          </div>
          <div class="strategy-status">${escapeHtml(item.status)}</div>
        </article>
      `
    )
    .join("");
};

const renderDisclaimer = async () => {
  const target = byId("disclaimer-markdown");
  if (!target) {
    return;
  }

  try {
    const text = await fetchText("disclaimer.md");
    target.innerHTML = renderMarkdown(text);
  } catch (error) {
    target.innerHTML = `<div class="error-state">${escapeHtml(
      error.message
    )}</div>`;
  }
};

const renderWeeklyTemplate = async () => {
  const target = byId("weekly-template");
  if (!target) {
    return;
  }

  try {
    const text = await fetchText("weekly-review-template.md");
    target.innerHTML = renderMarkdown(text);
  } catch (error) {
    target.innerHTML = `<div class="error-state">${escapeHtml(
      error.message
    )}</div>`;
  }
};

const setCurrentYear = () => {
  const year = byId("current-year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
};

const activateNav = () => {
  document.querySelectorAll(`[data-nav="${page}"]`).forEach((item) => {
    item.classList.add("is-active");
  });
};

const renderHomeSummary = async () => {
  try {
    const [logs, experiments] = await Promise.all([
      fetchJson("learning-log.json"),
      fetchJson("code-experiments.json")
    ]);

    renderStageSummary(logs);
    renderLatestLogs(logs);
    renderExperiments(experiments, "recent-experiments", 2);
  } catch (error) {
    const latest = byId("latest-log-list");
    const recent = byId("recent-experiments");
    const message = `<div class="error-state">${escapeHtml(
      error.message
    )}</div>`;
    if (latest) {
      latest.innerHTML = message;
    }
    if (recent) {
      recent.innerHTML = message;
    }
  }
};

const renderLearningPage = async () => {
  try {
    const logs = await fetchJson("learning-log.json");
    renderStageSummary(logs);
    renderTimeline(logs);
  } catch (error) {
    const target = byId("learning-log-list");
    if (target) {
      target.innerHTML = `<div class="error-state">${escapeHtml(
        error.message
      )}</div>`;
    }
  }
};

const renderCodePage = async () => {
  try {
    const experiments = await fetchJson("code-experiments.json");
    renderExperiments(experiments, "experiments-list");
  } catch (error) {
    const target = byId("experiments-list");
    if (target) {
      target.innerHTML = `<div class="error-state">${escapeHtml(
        error.message
      )}</div>`;
    }
  }
};

const renderStrategyPage = async () => {
  try {
    const strategies = await fetchJson("strategy-lab.json");
    renderStrategies(strategies);
  } catch (error) {
    const target = byId("strategy-list");
    if (target) {
      target.innerHTML = `<div class="error-state">${escapeHtml(
        error.message
      )}</div>`;
    }
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  setCurrentYear();
  activateNav();

  if (page === "home") {
    await renderHomeSummary();
  }

  if (page === "learning-log") {
    await renderLearningPage();
  }

  if (page === "code-experiments") {
    await renderCodePage();
  }

  if (page === "strategy-lab") {
    await renderStrategyPage();
  }

  await renderWeeklyTemplate();
  await renderDisclaimer();
});
