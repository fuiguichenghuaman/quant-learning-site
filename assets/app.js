const body = document.body;
const page = body.dataset.page || "";
const contentRoot = body.dataset.contentRoot || "./content";

const byId = (id) => document.getElementById(id);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const ROADMAP_STORAGE_KEY = "quant-lab-roadmap-progress-v1";
const POLL_STORAGE_KEY = "quant-lab-home-poll-v1";
const DISCUSSIONS_URL = "https://github.com/fuiguichenghuaman/quant-learning-site/discussions";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildContentUrl = (fileName) => {
  const normalizedRoot = contentRoot.replace(/\/+$/, "");
  return new URL(`${normalizedRoot}/${fileName}`, window.location.href).toString();
};

const buildRepoUrl = (fileName) =>
  `https://github.com/fuiguichenghuaman/quant-learning-site/blob/main/${fileName}`;

const makeLoadError = (fileName, error) => `
  <div class="error-state">
    <strong>内容文件读取失败，请检查 content 路径</strong>
    <p>当前页面未能读取 <code>${escapeHtml(fileName)}</code>。页面已保留静态核心内容，方便继续阅读。</p>
    ${error?.message ? `<p>${escapeHtml(error.message)}</p>` : ""}
  </div>
`;

const appendLoadError = (target, fileName, error) => {
  if (!target) {
    return;
  }

  if (target.querySelector(".error-state")) {
    return;
  }

  target.insertAdjacentHTML("afterbegin", makeLoadError(fileName, error));
};

const fetchJson = async (fileName) => {
  const response = await fetch(buildContentUrl(fileName));
  if (!response.ok) {
    throw new Error(`文件 ${fileName} 返回状态 ${response.status}`);
  }
  return response.json();
};

const fetchText = async (fileName) => {
  const response = await fetch(buildContentUrl(fileName));
  if (!response.ok) {
    throw new Error(`文件 ${fileName} 返回状态 ${response.status}`);
  }
  return response.text();
};

const makeList = (items, emptyText = "待补充") => {
  if (!items || !items.length) {
    return `<p class="muted">${escapeHtml(emptyText)}</p>`;
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

    if (line.startsWith("### ")) {
      closeList();
      html += `<h4>${escapeHtml(line.slice(4))}</h4>`;
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

const statusClass = (status) => {
  switch (status) {
    case "done":
    case "已完成":
      return "is-done";
    case "in-progress":
    case "current":
    case "正在写":
    case "进行中":
      return "is-current";
    case "planned":
    case "待补充":
      return "is-planned";
    default:
      return "";
  }
};

const statusLabel = (status) => {
  const map = {
    done: "已完成",
    "in-progress": "进行中",
    current: "当前阶段",
    planned: "待补充"
  };
  return map[status] || status || "待补充";
};

const renderBadge = (status) =>
  `<span class="status-badge ${statusClass(status)}">${escapeHtml(statusLabel(status))}</span>`;

const sortByDateDesc = (items = []) =>
  [...items].sort((a, b) => (a.date < b.date ? 1 : -1));

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const readRoadmapProgress = () =>
  safeParse(window.localStorage.getItem(ROADMAP_STORAGE_KEY), {});

const writeRoadmapProgress = (state) =>
  window.localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(state));

const readPollState = () =>
  safeParse(window.localStorage.getItem(POLL_STORAGE_KEY), {
    selected: "",
    counts: {
      pandas: 0,
      movingAverage: 0,
      returns: 0,
      charting: 0,
      backtest: 0
    }
  });

const writePollState = (state) =>
  window.localStorage.setItem(POLL_STORAGE_KEY, JSON.stringify(state));

const setCurrentYear = () => {
  qsa("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
};

const activateNav = () => {
  qsa(`[data-nav="${page}"]`).forEach((node) => {
    node.classList.add("is-active");
  });
};

const renderDiscussionLinks = () => {
  qsa("[data-discussions-link]").forEach((node) => {
    node.setAttribute("href", DISCUSSIONS_URL);
  });
};

const renderHomeDashboard = (roadmap) => {
  const dashboard = roadmap?.dashboard;
  if (!dashboard) {
    return;
  }

  const currentStage = byId("home-current-stage");
  const completed = byId("home-completed-list");
  const active = byId("home-active-list");
  const next = byId("home-next-step");
  const progressFill = byId("home-progress-fill");
  const progressValue = byId("home-progress-value");

  if (currentStage) {
    currentStage.textContent = dashboard.currentStageTitle;
  }

  if (completed) {
    completed.innerHTML = makeList(dashboard.completed);
  }

  if (active) {
    active.innerHTML = makeList(dashboard.active);
  }

  if (next) {
    next.textContent = dashboard.next;
  }

  if (progressFill) {
    progressFill.style.width = `${dashboard.progress}%`;
  }

  if (progressValue) {
    progressValue.textContent = `${dashboard.progress}%`;
  }
};

const renderRoadmapPreview = (roadmap) => {
  const target = byId("home-roadmap-preview");
  if (!target || !roadmap?.stages) {
    return;
  }

  target.innerHTML = roadmap.stages
    .map(
      (stage) => `
        <article class="roadmap-preview-card ${statusClass(stage.status)}">
          <div class="roadmap-card-head">
            <div>
              <p class="card-kicker">${escapeHtml(stage.id.replace("stage-", "阶段 "))}</p>
              <h3>${escapeHtml(stage.title)}</h3>
            </div>
            ${renderBadge(stage.status)}
          </div>
          <p class="card-copy">${escapeHtml(stage.description)}</p>
          <dl class="card-facts">
            <div>
              <dt>代表性成果</dt>
              <dd>${escapeHtml(stage.representativeResult)}</dd>
            </div>
            <div>
              <dt>下一步任务</dt>
              <dd>${escapeHtml(stage.nextTask)}</dd>
            </div>
          </dl>
        </article>
      `
    )
    .join("");
};

const renderHomeLabs = (labs) => {
  const target = byId("home-labs-list");
  if (!target || !labs?.labs) {
    return;
  }

  const latestLabs = sortByDateDesc(labs.labs).slice(0, 2);

  target.innerHTML = latestLabs
    .map(
      (lab) => `
        <article class="lab-summary-card">
          <div class="entry-meta">
            <span>${escapeHtml(lab.date || "进行中")}</span>
            <span>${escapeHtml(lab.status)}</span>
          </div>
          <h3>${escapeHtml(lab.title)}</h3>
          <p>${escapeHtml(lab.goal)}</p>
          <div class="compact-points">
            <div>
              <strong>使用数据</strong>
              <p>${escapeHtml(lab.data)}</p>
            </div>
            <div>
              <strong>下一步</strong>
              <p>${escapeHtml(lab.nextStep)}</p>
            </div>
          </div>
        </article>
      `
    )
    .join("");
};

const renderHomeDebug = (debugData) => {
  const target = byId("home-debug-list");
  if (!target || !debugData?.entries) {
    return;
  }

  target.innerHTML = sortByDateDesc(debugData.entries)
    .slice(0, 3)
    .map(
      (entry) => `
        <article class="debug-mini-card">
          <div class="entry-meta">
            <span>${escapeHtml(entry.date)}</span>
            <span>${escapeHtml(entry.category)}</span>
          </div>
          <h3>${escapeHtml(entry.title)}</h3>
          <p>${escapeHtml(entry.symptom)}</p>
          <p class="mini-lesson"><strong>我学到了什么：</strong>${escapeHtml(entry.learned)}</p>
        </article>
      `
    )
    .join("");
};

const renderHomeReview = (reviewsData) => {
  const target = byId("home-review-summary");
  if (!target || !reviewsData?.reviews?.length) {
    return;
  }

  const latestReview =
    reviewsData.reviews.find((item) => item.id === reviewsData.latest) ||
    reviewsData.reviews[0];

  target.innerHTML = `
    <article class="review-highlight">
      <div class="entry-meta">
        <span>${escapeHtml(latestReview.date)}</span>
        <span>最新周复盘</span>
      </div>
      <h3>${escapeHtml(latestReview.title)}</h3>
      <p>${escapeHtml(latestReview.summary)}</p>
      <div class="entry-detail">
        <div>
          <strong>本周亮点</strong>
          ${makeList(latestReview.highlights)}
        </div>
        <div>
          <strong>下周聚焦</strong>
          ${makeList(latestReview.nextFocus)}
        </div>
      </div>
    </article>
  `;
};

const initPollWidget = () => {
  const form = byId("home-local-poll");
  if (!form) {
    return;
  }

  const summary = byId("home-poll-summary");
  const counts = byId("home-poll-counts");
  const state = readPollState();
  const labels = {
    pandas: "pandas",
    movingAverage: "均线",
    returns: "收益率",
    charting: "画图",
    backtest: "回测"
  };

  const renderPoll = () => {
    qsa("button[data-vote-option]", form).forEach((button) => {
      const option = button.dataset.voteOption || "";
      button.classList.toggle("is-selected", state.selected === option);
    });

    if (summary) {
      summary.textContent = state.selected
        ? `你当前在这台设备上的本地选择是：${labels[state.selected]}。这个结果只保存在你的浏览器里，不会上传。`
        : "你还没有在这台设备上选择下周想优先学习的主题。这个投票只保存在本地浏览器里，不会上传。";
    }

    if (counts) {
      counts.innerHTML = Object.entries(labels)
        .map(
          ([key, label]) => `
            <li>
              <span>${escapeHtml(label)}</span>
              <strong>${escapeHtml(state.counts[key] || 0)}</strong>
            </li>
          `
        )
        .join("");
    }
  };

  form.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-vote-option]");
    if (!button) {
      return;
    }

    const option = button.dataset.voteOption || "";

    if (state.selected && state.counts[state.selected] > 0) {
      state.counts[state.selected] -= 1;
    }

    state.selected = option;
    state.counts[option] = (state.counts[option] || 0) + 1;
    writePollState(state);
    renderPoll();
  });

  renderPoll();
};

const renderHome = async () => {
  const roadmapTarget = byId("home-roadmap-preview");
  const labsTarget = byId("home-labs-list");
  const debugTarget = byId("home-debug-list");
  const reviewTarget = byId("home-review-summary");

  const [roadmapResult, labsResult, debugResult, reviewsResult] =
    await Promise.allSettled([
      fetchJson("roadmap.json"),
      fetchJson("labs.json"),
      fetchJson("debug-log.json"),
      fetchJson("weekly-reviews.json")
    ]);

  if (roadmapResult.status === "fulfilled") {
    renderHomeDashboard(roadmapResult.value);
    renderRoadmapPreview(roadmapResult.value);
  } else {
    appendLoadError(roadmapTarget, "roadmap.json", roadmapResult.reason);
  }

  if (labsResult.status === "fulfilled") {
    renderHomeLabs(labsResult.value);
  } else {
    appendLoadError(labsTarget, "labs.json", labsResult.reason);
  }

  if (debugResult.status === "fulfilled") {
    renderHomeDebug(debugResult.value);
  } else {
    appendLoadError(debugTarget, "debug-log.json", debugResult.reason);
  }

  if (reviewsResult.status === "fulfilled") {
    renderHomeReview(reviewsResult.value);
  } else {
    appendLoadError(reviewTarget, "weekly-reviews.json", reviewsResult.reason);
  }

  initPollWidget();
};

const flattenRoadmapTasks = (roadmap) =>
  (roadmap?.stages || []).flatMap((stage) =>
    (stage.modules || []).flatMap((module) => module.tasks || [])
  );

const renderRoadmapStageDetail = (stage, checkedState) => {
  const target = byId("roadmap-stage-detail");
  if (!target || !stage) {
    return;
  }

  target.innerHTML = `
    <section class="detail-header">
      <div>
        <p class="detail-kicker">${escapeHtml(stage.id.replace("stage-", "阶段 "))}</p>
        <h2>${escapeHtml(stage.title)}</h2>
        <p class="detail-copy">${escapeHtml(stage.description)}</p>
      </div>
      <div class="detail-metrics">
        ${renderBadge(stage.status)}
        <div class="progress-meter">
          <span>官方进度</span>
          <strong>${escapeHtml(stage.progress)}%</strong>
        </div>
      </div>
    </section>
    <section class="detail-snapshot">
      <article>
        <h3>代表性成果</h3>
        <p>${escapeHtml(stage.representativeResult)}</p>
      </article>
      <article>
        <h3>下一步任务</h3>
        <p>${escapeHtml(stage.nextTask)}</p>
      </article>
    </section>
    <section class="detail-modules">
      ${(stage.modules || [])
        .map(
          (module) => `
            <article class="module-panel">
              <div class="module-head">
                <div>
                  <h3>${escapeHtml(module.title)}</h3>
                  <p>${escapeHtml(module.summary)}</p>
                </div>
              </div>
              <div class="task-list">
                ${(module.tasks || [])
                  .map((task) => {
                    const checked = Boolean(checkedState[task.id]);
                    return `
                      <label class="task-item">
                        <div class="task-check">
                          <input type="checkbox" data-roadmap-task="${escapeHtml(task.id)}" ${
                            checked ? "checked" : ""
                          }>
                        </div>
                        <div class="task-copy">
                          <div class="task-title-row">
                            <strong>${escapeHtml(task.title)}</strong>
                            ${renderBadge(task.status)}
                          </div>
                          <p>${escapeHtml(task.output)}</p>
                        </div>
                      </label>
                    `;
                  })
                  .join("")}
              </div>
            </article>
          `
        )
        .join("")}
    </section>
  `;
};

const renderRoadmap = async () => {
  const stageList = byId("roadmap-stage-list");
  const detailTarget = byId("roadmap-stage-detail");
  const progressTarget = byId("roadmap-viewer-progress");

  try {
    const roadmap = await fetchJson("roadmap.json");
    const checkedState = readRoadmapProgress();
    const allTasks = flattenRoadmapTasks(roadmap);
    const selectedFromHash = window.location.hash.replace("#", "");
    let selectedStageId = selectedFromHash || roadmap.currentStage || roadmap.stages?.[0]?.id;

    const updateViewerProgress = () => {
      const checkedCount = allTasks.filter((task) => checkedState[task.id]).length;
      if (progressTarget) {
        progressTarget.textContent = `你已完成 ${checkedCount} / ${allTasks.length} 个任务。这是本地浏览器进度，不会上传。`;
      }
    };

    const renderStageList = () => {
      if (!stageList) {
        return;
      }

      stageList.innerHTML = (roadmap.stages || [])
        .map(
          (stage) => `
            <button class="stage-link ${
              stage.id === selectedStageId ? "is-active" : ""
            }" data-stage-id="${escapeHtml(stage.id)}" type="button">
              <span>${escapeHtml(stage.title)}</span>
              <small>${escapeHtml(stage.progress)}%</small>
            </button>
          `
        )
        .join("");
    };

    const renderCurrentStage = () => {
      const stage = (roadmap.stages || []).find((item) => item.id === selectedStageId);
      renderRoadmapStageDetail(stage, checkedState);
      renderStageList();
      updateViewerProgress();
    };

    stageList?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-stage-id]");
      if (!button) {
        return;
      }

      selectedStageId = button.dataset.stageId || selectedStageId;
      window.location.hash = selectedStageId;
      renderCurrentStage();
    });

    detailTarget?.addEventListener("change", (event) => {
      const checkbox = event.target.closest("input[data-roadmap-task]");
      if (!checkbox) {
        return;
      }

      checkedState[checkbox.dataset.roadmapTask] = checkbox.checked;
      writeRoadmapProgress(checkedState);
      updateViewerProgress();
    });

    renderCurrentStage();
  } catch (error) {
    appendLoadError(detailTarget, "roadmap.json", error);
  }
};

const renderNotes = async () => {
  const moduleNav = byId("notes-module-nav");
  const moduleGrid = byId("notes-module-grid");
  const detailSections = byId("notes-detail-sections");
  const timelineTarget = byId("notes-log-list");

  const [notesResult, logResult] = await Promise.allSettled([
    fetchJson("notes.json"),
    fetchJson("learning-log.json")
  ]);

  if (notesResult.status === "fulfilled") {
    const notesData = notesResult.value;
    const modules = notesData.modules || [];

    if (moduleNav) {
      moduleNav.innerHTML = modules
        .map(
          (module) => `
            <a href="#${escapeHtml(module.id)}" class="anchor-link">
              <span>${escapeHtml(module.title)}</span>
              <small>${escapeHtml((module.items || []).length)} 篇</small>
            </a>
          `
        )
        .join("");
    }

    if (moduleGrid) {
      moduleGrid.innerHTML = modules
        .map(
          (module) => `
            <section class="module-summary" id="${escapeHtml(module.id)}">
              <div class="section-head compact">
                <div>
                  <h2 class="section-title">${escapeHtml(module.title)}</h2>
                  <p class="section-subtitle">${escapeHtml(module.description)}</p>
                </div>
              </div>
              <div class="note-card-grid">
                ${(module.items || [])
                  .map(
                    (item) => `
                      <article class="note-card">
                        <div class="entry-meta">
                          <span>${escapeHtml(item.difficulty)}</span>
                          <span>${escapeHtml(item.status)}</span>
                        </div>
                        <h3>${escapeHtml(item.title)}</h3>
                        <p>${escapeHtml(item.summary)}</p>
                        <div class="note-links">
                          <span class="mini-label">关联实验：${escapeHtml(
                            (item.relatedLabs || []).join(" / ") || "待补充"
                          )}</span>
                          <a href="#${escapeHtml(item.id)}">阅读入口</a>
                        </div>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            </section>
          `
        )
        .join("");
    }

    if (detailSections) {
      detailSections.innerHTML = modules
        .flatMap((module) => module.items || [])
        .map(
          (item) => `
            <article class="note-detail-card" id="${escapeHtml(item.id)}">
              <div class="section-head compact">
                <div>
                  <h3 class="section-title small">${escapeHtml(item.title)}</h3>
                  <p class="section-subtitle">${escapeHtml(item.summary)}</p>
                </div>
                <div class="inline-badges">
                  ${renderBadge(item.status)}
                  <span class="status-badge">${escapeHtml(item.difficulty)}</span>
                </div>
              </div>
              <div class="note-related">
                <strong>关联代码实验：</strong>
                <span>${escapeHtml((item.relatedLabs || []).join(" / ") || "待补充")}</span>
              </div>
              <div class="markdown">
                ${(item.body || [])
                  .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
                  .join("")}
              </div>
            </article>
          `
        )
        .join("");
    }
  } else {
    appendLoadError(moduleGrid, "notes.json", notesResult.reason);
    appendLoadError(detailSections, "notes.json", notesResult.reason);
  }

  if (logResult.status === "fulfilled") {
    const entries = sortByDateDesc(logResult.value.entries || []).slice(0, 4);
    if (timelineTarget) {
      timelineTarget.innerHTML = entries
        .map(
          (entry) => `
            <article class="timeline-entry">
              <div class="timeline-date">${escapeHtml(entry.date)}</div>
              <div class="timeline-card">
                <div class="entry-meta">
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
              </div>
            </article>
          `
        )
        .join("");
    }
  } else {
    appendLoadError(timelineTarget, "learning-log.json", logResult.reason);
  }
};

const renderLabs = async () => {
  const target = byId("labs-report-list");
  if (!target) {
    return;
  }

  try {
    const data = await fetchJson("labs.json");
    target.innerHTML = (data.labs || [])
      .map(
        (lab) => `
          <article class="lab-report">
            <div class="lab-report-head">
              <div>
                <div class="entry-meta">
                  <span>${escapeHtml(lab.date || "待补充")}</span>
                  <span>${escapeHtml(lab.status)}</span>
                </div>
                <h2>${escapeHtml(lab.title)}</h2>
              </div>
              <a class="text-link" href="./debug-log.html">查看踩坑记录</a>
            </div>
            <div class="lab-grid">
              <section>
                <h3>实验目标</h3>
                <p>${escapeHtml(lab.goal)}</p>
              </section>
              <section>
                <h3>使用数据</h3>
                <p>${escapeHtml(lab.data)}</p>
              </section>
              <section>
                <h3>关键代码</h3>
                <pre><code>${escapeHtml(lab.keyCode)}</code></pre>
              </section>
              <section>
                <h3>运行方式</h3>
                <p><code>${escapeHtml(lab.runMethod)}</code></p>
              </section>
              <section>
                <h3>输出结果</h3>
                <p>${escapeHtml(lab.output)}</p>
              </section>
              <section>
                <h3>我遇到的问题</h3>
                ${makeList(lab.problems)}
              </section>
              <section>
                <h3>我学到了什么</h3>
                ${makeList(lab.learned)}
              </section>
              <section>
                <h3>下一步扩展</h3>
                <p>${escapeHtml(lab.nextStep)}</p>
              </section>
            </div>
          </article>
        `
      )
      .join("");
  } catch (error) {
    appendLoadError(target, "labs.json", error);
  }
};

const renderStrategies = async () => {
  const overviewTarget = byId("strategies-overview");
  const firstTarget = byId("strategies-first");
  const checklistTarget = byId("strategies-checklist");
  const templateTarget = byId("strategies-template");

  try {
    const data = await fetchJson("strategies.json");

    if (overviewTarget) {
      overviewTarget.innerHTML = `
        <article class="strategy-overview-card">
          <div class="entry-meta">
            <span>学习准备区</span>
            <span>不展示虚构收益</span>
          </div>
          <h2>${escapeHtml(data.overview.title)}</h2>
          <p>${escapeHtml(data.overview.description)}</p>
          <p class="warning-copy">${escapeHtml(data.overview.warning)}</p>
        </article>
      `;
    }

    if (firstTarget) {
      const strategy = data.firstStrategy;
      firstTarget.innerHTML = `
        <article class="strategy-template-card">
          <div class="section-head compact">
            <div>
              <h2 class="section-title">${escapeHtml(strategy.name)}</h2>
              <p class="section-subtitle">这是当前计划中的第一份策略学习模板，不是成熟策略库。</p>
            </div>
            ${renderBadge(strategy.status)}
          </div>
          <dl class="template-grid">
            <div><dt>核心假设</dt><dd>${escapeHtml(strategy.coreHypothesis)}</dd></div>
            <div><dt>使用数据</dt><dd>${escapeHtml(strategy.data)}</dd></div>
            <div><dt>入场规则</dt><dd>${escapeHtml(strategy.entryRule)}</dd></div>
            <div><dt>出场规则</dt><dd>${escapeHtml(strategy.exitRule)}</dd></div>
            <div><dt>风险控制</dt><dd>${escapeHtml(strategy.riskControl)}</dd></div>
            <div><dt>回测范围</dt><dd>${escapeHtml(strategy.backtestRange)}</dd></div>
            <div><dt>交易成本</dt><dd>${escapeHtml(strategy.transactionCost)}</dd></div>
            <div><dt>结论是否可靠</dt><dd>${escapeHtml(strategy.reliability)}</dd></div>
          </dl>
        </article>
      `;
    }

    if (checklistTarget) {
      checklistTarget.innerHTML = `
        <div class="checklist-card">
          <h2>回测前必须检查的假设</h2>
          ${makeList(data.preflightChecklist)}
        </div>
      `;
    }

    if (templateTarget) {
      templateTarget.innerHTML = `
        <div class="template-list-card">
          <h2>策略模板字段</h2>
          <ol class="ordered-list">
            ${(data.template || [])
              .map((item) => `<li>${escapeHtml(item)}</li>`)
              .join("")}
          </ol>
        </div>
      `;
    }
  } catch (error) {
    appendLoadError(overviewTarget, "strategies.json", error);
    appendLoadError(firstTarget, "strategies.json", error);
  }
};

const renderDebugCards = (entries) =>
  entries
    .map(
      (entry) => `
        <article class="debug-card">
          <div class="entry-meta">
            <span>${escapeHtml(entry.date)}</span>
            <span>${escapeHtml(entry.category)}</span>
          </div>
          <h3>${escapeHtml(entry.title)}</h3>
          <div class="debug-grid">
            <section>
              <h4>错误现象</h4>
              <p>${escapeHtml(entry.symptom)}</p>
            </section>
            <section>
              <h4>当时的误判</h4>
              <p>${escapeHtml(entry.wrongGuess)}</p>
            </section>
            <section>
              <h4>真正原因</h4>
              <p>${escapeHtml(entry.realReason)}</p>
            </section>
            <section>
              <h4>解决办法</h4>
              <p>${escapeHtml(entry.solution)}</p>
            </section>
            <section>
              <h4>我学到了什么</h4>
              <p>${escapeHtml(entry.learned)}</p>
            </section>
            <section>
              <h4>经验提醒</h4>
              <p>${escapeHtml(entry.lesson)}</p>
            </section>
          </div>
        </article>
      `
    )
    .join("");

const renderDebugLog = async () => {
  const filterBar = byId("debug-filter-bar");
  const entryList = byId("debug-entry-list");
  const count = byId("debug-count");

  try {
    const data = await fetchJson("debug-log.json");
    let currentFilter = "全部";

    const render = () => {
      const filteredEntries =
        currentFilter === "全部"
          ? data.entries
          : data.entries.filter((entry) => entry.category === currentFilter);

      if (count) {
        count.textContent = `当前显示 ${filteredEntries.length} 条踩坑记录`;
      }

      if (entryList) {
        entryList.innerHTML = renderDebugCards(filteredEntries);
      }

      if (filterBar) {
        qsa("[data-debug-filter]", filterBar).forEach((button) => {
          button.classList.toggle(
            "is-selected",
            button.dataset.debugFilter === currentFilter
          );
        });
      }
    };

    if (filterBar) {
      filterBar.innerHTML = (data.filters || [])
        .map(
          (filter) => `
            <button type="button" class="filter-chip" data-debug-filter="${escapeHtml(filter)}">
              ${escapeHtml(filter)}
            </button>
          `
        )
        .join("");

      filterBar.addEventListener("click", (event) => {
        const button = event.target.closest("[data-debug-filter]");
        if (!button) {
          return;
        }

        currentFilter = button.dataset.debugFilter || "全部";
        render();
      });
    }

    render();
  } catch (error) {
    appendLoadError(entryList, "debug-log.json", error);
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
    appendLoadError(target, "weekly-review-template.md", error);
  }
};

const renderWeeklyReview = async () => {
  const listTarget = byId("weekly-review-list");
  const featuredTarget = byId("weekly-featured-review");
  const summaryTarget = byId("weekly-latest-summary");

  try {
    const reviewsData = await fetchJson("weekly-reviews.json");
    const reviews = sortByDateDesc(reviewsData.reviews || []);
    const latestReview =
      reviews.find((item) => item.id === reviewsData.latest) || reviews[0];

    if (listTarget) {
      listTarget.innerHTML = reviews
        .map(
          (review) => `
            <article class="review-list-card">
              <div class="entry-meta">
                <span>${escapeHtml(review.date)}</span>
                <span>${review.id === reviewsData.latest ? "最新复盘" : "历史复盘"}</span>
              </div>
              <h3>${escapeHtml(review.title)}</h3>
              <p>${escapeHtml(review.summary)}</p>
              <div class="entry-detail">
                <div>
                  <strong>本周亮点</strong>
                  ${makeList(review.highlights)}
                </div>
                <div>
                  <strong>下周聚焦</strong>
                  ${makeList(review.nextFocus)}
                </div>
              </div>
            </article>
          `
        )
        .join("");
    }

    if (summaryTarget && latestReview) {
      summaryTarget.innerHTML = `
        <div class="summary-card">
          <div class="entry-meta">
            <span>${escapeHtml(latestReview.date)}</span>
            <span>第一篇正式周复盘</span>
          </div>
          <h2>${escapeHtml(latestReview.title)}</h2>
          <p>${escapeHtml(latestReview.summary)}</p>
        </div>
      `;
    }

    if (featuredTarget && latestReview?.file) {
      try {
        const text = await fetchText(latestReview.file);
        featuredTarget.innerHTML = renderMarkdown(text);
      } catch (error) {
        appendLoadError(featuredTarget, latestReview.file, error);
      }
    }
  } catch (error) {
    appendLoadError(listTarget, "weekly-reviews.json", error);
    appendLoadError(featuredTarget, "weekly-reviews.json", error);
  }

  await renderWeeklyTemplate();
};

const renderDisclaimer = async () => {
  const target = byId("about-disclaimer");
  if (!target) {
    return;
  }

  try {
    const text = await fetchText("disclaimer.md");
    target.innerHTML = renderMarkdown(text);
  } catch (error) {
    appendLoadError(target, "disclaimer.md", error);
  }
};

const renderAbout = async () => {
  await renderDisclaimer();
};

document.addEventListener("DOMContentLoaded", async () => {
  setCurrentYear();
  activateNav();
  renderDiscussionLinks();

  if (page === "home") {
    await renderHome();
  }

  if (page === "roadmap") {
    await renderRoadmap();
  }

  if (page === "notes") {
    await renderNotes();
  }

  if (page === "labs") {
    await renderLabs();
  }

  if (page === "strategies") {
    await renderStrategies();
  }

  if (page === "debug-log") {
    await renderDebugLog();
  }

  if (page === "weekly-review") {
    await renderWeeklyReview();
  }

  if (page === "about") {
    await renderAbout();
  }
});
