(() => {
  const content = window.portfolioContent;
  const portfolio = document.querySelector('#portfolio');
  const inventory = document.querySelector('#inventory');
  const panelContent = document.querySelector('#panel-content');
  const buttons = [...document.querySelectorAll('[data-panel]')];
  const closeButton = document.querySelector('#close-panel');
  const reopenButton = document.querySelector('#reopen-card');
  const projectDialog = document.querySelector('#project-dialog');
  const mobileQuery = matchMedia('(max-width: 760px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const pageSize = 12;
  let activePanel = null;
  let lastTrigger = null;
  let projectTrigger = null;
  let inventoryItems = [];
  let inventoryPage = 0;
  let selectedItem = null;
  let soundEnabled = false;
  let audioContext;

  // User-editable text is escaped; SVG markup comes only from the local icon map.
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
  function safeUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    const input = value.trim();
    try {
      const url = new URL(input, location.href);
      if (['http:', 'https:'].includes(url.protocol)) return url.href;
      const relative = !/^[a-z][a-z\d+.-]*:/i.test(input) && !input.startsWith('//');
      if (relative && location.protocol === 'file:' && url.protocol === 'file:' && url.host === location.host) return url.href;
    } catch { /* Omit an invalid or unsafe URL. */ }
    return null;
  }
  function link(url, label, className = '') {
    const href = safeUrl(url);
    return href ? '<a class="' + className + '" href="' + escape(href) + '" target="_blank" rel="noopener noreferrer">' + escape(label) + ' <span aria-hidden="true">↗</span></a>' : '';
  }
  const tags = items => '<div class="tags">' + (items || []).map(item => '<span>' + escape(item) + '</span>').join('') + '</div>';
  const interfaceIcon = id => '<svg aria-hidden="true"><use href="#icon-' + id + '"/></svg>';
  const technologyIcon = id => Object.hasOwn(window.technologyIcons || {}, id) ? window.technologyIcons[id] : interfaceIcon('tools');
  const projectIcon = project => ['mira', 'pipeline', 'familyos'].includes(project.icon) ? project.icon : 'pipeline';

  function clickSound() {
    if (!soundEnabled) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      audioContext.resume().catch(() => {});
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(430, audioContext.currentTime + .08);
      gain.gain.setValueAtTime(.035, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .1);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + .1);
    } catch { /* The portfolio remains usable without audio. */ }
  }

  const itemLists = {
    projects: () => (content.projects || []).map(project => ({
      title: project.caption || project.title,
      art: interfaceIcon(projectIcon(project)),
      kind: 'project',
      project,
    })),
    experience: () => (content.experiences || []).map(experience => {
      const label = experience.label === 'CodeNext' ? 'CodeNext' : 'Internship';
      const icon = ['creditkarma', 'google', 'mastercard'].includes(experience.icon) ? experience.icon : 'mastercard';
      return {
        title: experience.company,
        art: interfaceIcon(icon),
        label,
        detail: '<p class="detail-category">' + escape(label) + '</p><h4>' + escape(experience.role) + '</h4><p>' + escape(experience.company) + '</p>' + (experience.team ? '<p>' + escape(experience.team) + '</p>' : ''),
      };
    }),
    about: () => [
      { title: 'Hello, explorer!', art: interfaceIcon('penguin'), detail: '<p>' + escape(content.about) + '</p>' },
      { title: 'My island', art: interfaceIcon('igloo'), detail: '<p>' + escape(content.aboutDetails) + '</p>' + link(content.github, 'My GitHub profile', 'action-link') },
    ],
    skills: () => (content.skills || []).flatMap(group => group.items.map(skill => ({
      title: skill.name,
      art: technologyIcon(skill.icon),
      detail: '<p class="detail-category">' + escape(group.category) + '</p><div class="skill-detail-icon">' + technologyIcon(skill.icon) + '</div><p>' + escape(skill.name) + '</p>',
    }))),
  };
  const panelTitles = { projects: 'Projects', experience: 'Experience', resume: 'Resume', about: 'About Me', skills: 'Skills' };
  const panelIntroductions = {
    projects: 'Pick a project to open its details.',
    experience: 'Explore my internships and engineering experience.',
    about: 'Meet the penguin behind the projects.',
    skills: 'My technical inventory. Browse both pages.',
  };

  function updateModal() {
    const modal = mobileQuery.matches && Boolean(activePanel);
    inventory.setAttribute('role', mobileQuery.matches ? 'dialog' : 'region');
    inventory.setAttribute('aria-hidden', String(!activePanel));
    if (modal) inventory.setAttribute('aria-modal', 'true');
    else inventory.removeAttribute('aria-modal');
    portfolio.querySelector('.player-card').inert = modal;
    document.querySelectorAll('.world-header, .intro, #reopen-card, .below-card, .world-footer').forEach(element => {
      element.inert = modal;
    });
    document.body.classList.toggle('has-mobile-inventory', modal);
    if (modal && !projectDialog.open && !inventory.contains(document.activeElement)) closeButton.focus({ preventScroll: true });
  }

  function closePanel(restoreFocus = true) {
    if (!activePanel) return;
    clickSound();
    portfolio.classList.remove('is-open');
    inventory.inert = true;
    buttons.forEach(button => button.setAttribute('aria-expanded', 'false'));
    activePanel = null;
    updateModal();
    if (restoreFocus && lastTrigger?.isConnected) lastTrigger.focus({ preventScroll: true });
  }

  function renderInventory() {
    const start = inventoryPage * pageSize;
    const visibleItems = inventoryItems.slice(start, start + pageSize);
    const cells = visibleItems.map((item, offset) => {
      const disclosure = item.kind === 'project' ? 'aria-haspopup="dialog" aria-controls="project-dialog"' : 'aria-controls="item-detail" aria-expanded="false"';
      return '<button class="inventory-item" data-item="' + (start + offset) + '" ' + disclosure + '><span class="item-art" aria-hidden="true">' + item.art + '</span><span class="item-name">' + escape(item.title) + '</span>' + (item.label ? '<span class="item-type">' + escape(item.label) + '</span>' : '') + '</button>';
    });
    while (cells.length < pageSize) cells.push('<span class="inventory-empty" aria-hidden="true"></span>');
    const pages = Math.ceil(inventoryItems.length / pageSize);
    const pagination = pages > 1 ? '<nav class="inventory-pages" aria-label="Inventory pages"><button type="button" data-inventory-page="previous"' + (inventoryPage === 0 ? ' disabled' : '') + ' aria-label="Previous inventory page">←</button><span aria-live="polite">Page ' + (inventoryPage + 1) + ' of ' + pages + '</span><button type="button" data-inventory-page="next"' + (inventoryPage === pages - 1 ? ' disabled' : '') + ' aria-label="Next inventory page">→</button></nav>' : '';
    panelContent.innerHTML = '<p class="panel-intro">' + escape(panelIntroductions[activePanel]) + '</p><div class="item-grid">' + cells.join('') + '</div>' + pagination + '<article class="item-detail" id="item-detail" tabindex="-1" aria-labelledby="detail-title" hidden></article>';
    selectedItem = null;
    document.querySelector('#item-count').textContent = inventoryItems.length + (inventoryItems.length === 1 ? ' item' : ' items');
  }

  function showProject(item, trigger) {
    const project = item.project;
    projectTrigger = trigger;
    document.querySelector('#project-dialog-title').textContent = project.title;
    let details = '<div class="project-preview ' + projectIcon(project) + '-preview">' + item.art + '<span>' + escape(project.caption || project.title) + '</span></div><p class="project-description">' + escape(project.description) + '</p><h3>Tech stack</h3>' + tags(project.tags);
    if (safeUrl(project.demo) || safeUrl(project.github)) {
      details += '<div class="project-links">' + link(project.demo, 'Live demo', 'action-link') + link(project.github, 'GitHub', 'action-link') + '</div>';
    }
    document.querySelector('#project-dialog-content').innerHTML = details;
    projectDialog.showModal();
    projectDialog.scrollTop = 0;
    document.body.classList.add('has-project-dialog');
    document.querySelector('#close-project-dialog').focus({ preventScroll: true });
  }

  function showItem(index, trigger) {
    const item = inventoryItems[index];
    if (!item) return;
    clickSound();
    if (item.kind === 'project') { showProject(item, trigger); return; }
    selectedItem = index;
    const detail = panelContent.querySelector('#item-detail');
    detail.innerHTML = '<div class="detail-heading"><h3 id="detail-title">' + escape(item.title) + '</h3><button class="detail-close" type="button" data-close-detail aria-label="Close ' + escape(item.title) + ' details">×</button></div>' + item.detail;
    detail.hidden = false;
    panelContent.querySelectorAll('[data-item]').forEach(button => {
      const selected = Number(button.dataset.item) === index;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-expanded', String(selected));
    });
    detail.focus({ preventScroll: true });
    detail.scrollIntoView({ block: 'nearest', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }

  document.querySelector('#close-project-dialog').addEventListener('click', () => projectDialog.close());
  projectDialog.addEventListener('close', () => {
    document.body.classList.remove('has-project-dialog');
    if (projectTrigger?.isConnected) projectTrigger.focus({ preventScroll: true });
    projectTrigger = null;
  });
  projectDialog.addEventListener('click', event => {
    if (event.target !== projectDialog) return;
    const bounds = projectDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) projectDialog.close();
  });
  projectDialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...projectDialog.querySelectorAll('button:not(:disabled), a[href]')];
    const first = focusable[0];
    const last = focusable.at(-1);
    if ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  });

  function openPanel(name, trigger) {
    if (!Object.hasOwn(panelTitles, name)) return;
    if (name === 'resume') {
      const href = safeUrl(content.resume);
      if (href) {
        window.open(href, '_blank', 'noopener,noreferrer');
        clickSound();
        return;
      }
    }
    if (activePanel === name) { closePanel(); return; }
    clickSound();
    activePanel = name;
    lastTrigger = trigger;
    inventory.dataset.section = name;
    document.querySelector('#panel-title').textContent = panelTitles[name];
    document.querySelector('#panel-kicker').textContent = name === 'experience' ? 'CAREER INVENTORY' : 'MY INVENTORY';
    inventoryPage = 0;
    if (itemLists[name]) {
      inventoryItems = itemLists[name]();
      renderInventory();
    } else {
      panelContent.innerHTML = '<div class="notice"><strong>Resume coming soon</strong><p>My resume will be available here soon.</p></div>';
      document.querySelector('#item-count').textContent = '';
    }
    panelContent.scrollTop = 0;
    buttons.forEach(button => button.setAttribute('aria-expanded', String(button === trigger)));
    inventory.inert = false;
    portfolio.classList.add('is-open');
    updateModal();
    closeButton.focus({ preventScroll: true });
  }

  panelContent.addEventListener('click', event => {
    const item = event.target.closest('[data-item]');
    if (item) { showItem(Number(item.dataset.item), item); return; }
    const page = event.target.closest('[data-inventory-page]');
    if (page && !page.disabled) {
      inventoryPage += page.dataset.inventoryPage === 'next' ? 1 : -1;
      renderInventory();
      panelContent.scrollTop = 0;
      panelContent.querySelector('[data-item]')?.focus({ preventScroll: true });
      clickSound();
      return;
    }
    if (event.target.closest('[data-close-detail]')) {
      panelContent.querySelector('#item-detail').hidden = true;
      const trigger = panelContent.querySelector('[data-item="' + selectedItem + '"]');
      trigger?.classList.remove('is-selected');
      trigger?.setAttribute('aria-expanded', 'false');
      trigger?.focus();
      selectedItem = null;
      clickSound();
    }
  });
  buttons.forEach(button => button.addEventListener('click', () => openPanel(button.dataset.panel, button)));
  document.querySelector('.dock-link').addEventListener('click', clickSound);
  closeButton.addEventListener('click', () => closePanel());
  document.querySelector('#close-card').addEventListener('click', () => {
    closePanel(false);
    portfolio.hidden = true;
    reopenButton.hidden = false;
    reopenButton.focus();
    clickSound();
  });
  reopenButton.addEventListener('click', () => {
    portfolio.hidden = false;
    reopenButton.hidden = true;
    document.querySelector('#close-card').focus({ preventScroll: true });
    clickSound();
  });
  document.addEventListener('keydown', event => {
    // Native dialog handles Escape and focus while project details are open.
    if (projectDialog.open) return;
    if (event.key === 'Escape') closePanel();
    if (event.key === 'Tab' && activePanel && mobileQuery.matches) {
      const focusable = [...inventory.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]')].filter(element => !element.closest('[hidden]') && element.getClientRects().length);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!inventory.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    }
  });
  updateModal();
  mobileQuery.addEventListener('change', updateModal);

  const soundToggle = document.querySelector('#sound-toggle');
  const backgroundMusic = document.querySelector('#background-music');
  const audioStatus = document.querySelector('#audio-status');
  let playbackAttempt = 0;
  backgroundMusic.volume = .28;
  backgroundMusic.loop = true;

  function updateSoundControl() {
    const label = (soundEnabled ? 'Turn off' : 'Turn on') + ' background music and interface sounds';
    soundToggle.setAttribute('aria-pressed', String(soundEnabled));
    soundToggle.setAttribute('aria-label', label);
    soundToggle.title = label;
    soundToggle.querySelector('span').textContent = soundEnabled ? 'Sound on' : 'Sound off';
  }

  function musicFailed(attempt) {
    if (attempt !== playbackAttempt || !soundEnabled) return;
    soundEnabled = false;
    backgroundMusic.pause();
    updateSoundControl();
    audioStatus.textContent = 'Music could not start. Use Sound on to try again.';
  }

  updateSoundControl();
  soundToggle.addEventListener('click', () => {
    const attempt = ++playbackAttempt;
    soundEnabled = !soundEnabled;
    updateSoundControl();
    if (!soundEnabled) {
      backgroundMusic.pause();
      audioStatus.textContent = 'Background music and interface sounds off.';
      return;
    }
    // Keep play() in the user gesture; a late result must not override a newer toggle.
    audioStatus.textContent = '';
    try {
      const playback = backgroundMusic.play();
      clickSound();
      Promise.resolve(playback).then(() => {
        if (attempt !== playbackAttempt) {
          if (!soundEnabled) backgroundMusic.pause();
          return;
        }
        audioStatus.textContent = 'Background music and interface sounds on.';
      }).catch(() => musicFailed(attempt));
    } catch {
      musicFailed(attempt);
    }
  });
  document.querySelector('#player-name').textContent = content.name;
  const resumeButton = document.querySelector('[data-panel="resume"]');
  resumeButton.setAttribute('aria-label', safeUrl(content.resume) ? 'Open resume in a new tab' : 'Resume coming soon');
  const coins = Number(content.coins);
  document.querySelector('#coin-count').textContent = Number.isFinite(coins) && coins >= 0 ? String(Math.floor(coins)) : '9999';
  document.querySelector('#project-count').textContent = String((content.projects || []).length);
  document.querySelector('#year').textContent = new Date().getFullYear();
})();
