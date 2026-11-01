/**
 * The Society — Founder Central Command Controller
 * Manages 5 Primary Administrative Sections:
 * 01. Central Command | 02. Membership Intelligence | 03. Operations
 * 04. Communications Control | 05. Governance & Legacy
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Only execute on Founder Central Command (admin.html)
  if (!document.getElementById('adminLayout')) return;

  // Verify Founder permissions
  await verifyFounderSession();

  // Setup Section Navigation
  setupAdminSections();

  // Load Initial Intelligence Data
  await loadCentralCommandMetrics();
  await loadMembershipRoster();
  await loadAuditLogs();

  // Setup Action Handlers (Invite Modal, Challenge Modal, etc.)
  setupAdminModals();

  // Bind Admin Logout
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      localStorage.removeItem('pulse_session');
      if (supabaseClient) {
        try { await supabaseClient.auth.signOut(); } catch (_) {}
      }
      window.location.href = 'login.html';
    });
  }
});

/**
 * Verify Authenticated User possesses Founder Role
 */
async function verifyFounderSession() {
  try {
    const profile = await api.get('/members/me');
    if (!profile || profile.society_role !== 'founder') {
      alert('Access Restricted: Founder Credentials Required');
      window.location.href = 'index.html';
      return;
    }

    const adminCodename = document.getElementById('founderCodenameBadge');
    if (adminCodename) adminCodename.textContent = profile.codename || 'SOVEREIGN';

    // Persist profile and role for seamless chamber navigation
    try {
      localStorage.setItem('society_user_profile', JSON.stringify(profile));
      localStorage.setItem('society_user_role', profile.society_role || 'founder');
    } catch (_) {}
  } catch (err) {
    console.error('Founder auth check failed:', err);
    window.location.href = 'login.html';
  }
}

/**
 * Section Navigation Controller
 */
function setupAdminSections() {
  const navItems = document.querySelectorAll('.society-nav-item[data-section]');
  const sections = document.querySelectorAll('.admin-section');
  const sectionTitle = document.getElementById('currentSectionTitle');
  const sectionSubtitle = document.getElementById('currentSectionSubtitle');

  const subtitles = {
    'secCommand': 'Real-Time Institutional Metrics & System Health',
    'secIntelligence': 'Member Registry, Cryptographic Inductions & Rank Management',
    'secOperations': 'Strategic Operations, Investigative Directives & Challenge Protocols',
    'secCommunications': 'Dispatch Channels, Founder Communiqués & Moderation',
    'secGovernance': 'Society Charter, Institutional Hierarchy & Audit Logs'
  };

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSec = item.getAttribute('data-section');

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      sections.forEach(sec => {
        if (sec.id === targetSec) {
          sec.classList.add('active');
        } else {
          sec.classList.remove('active');
        }
      });

      const label = item.querySelector('.nav-text')?.textContent || 'Central Command';
      if (sectionTitle) sectionTitle.textContent = label.toUpperCase();
      if (sectionSubtitle) sectionSubtitle.textContent = subtitles[targetSec] || '';

      sessionStorage.setItem('society_admin_section', targetSec);
    });
  });

  // Restore saved section or default to Central Command
  const savedSec = sessionStorage.getItem('society_admin_section') || 'secCommand';
  const defaultItem = document.querySelector(`.society-nav-item[data-section="${savedSec}"]`);
  if (defaultItem) defaultItem.click();
}

/**
 * Section 01: Central Command Metrics
 */
async function loadCentralCommandMetrics() {
  try {
    const data = await api.get('/members/metrics');
    if (!data) return;

    const elTotal = document.getElementById('kpiTotalMembers');
    const elActive = document.getElementById('kpiActiveMembers');
    const elLegends = document.getElementById('kpiLegendsCount');

    if (elTotal) elTotal.textContent = data.total_members ?? 0;
    if (elActive) elActive.textContent = data.active_members ?? 0;
    if (elLegends) elLegends.textContent = data.legends_count ?? 0;
  } catch (err) {
    console.warn('Metrics load error:', err);
  }
}

/**
 * Section 02: Membership Intelligence Roster
 */
async function loadMembershipRoster() {
  const tbody = document.getElementById('rosterTableBody');
  if (!tbody) return;

  try {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--muted-grey); padding: 24px;">Scanning intelligence records...</td></tr>';
    
    const roster = await api.get('/members/roster');
    if (!roster || roster.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--muted-grey); padding: 24px;">No members enrolled</td></tr>';
      return;
    }

    tbody.innerHTML = roster.map(m => {
      const induction = m.induction_date ? new Date(m.induction_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Founder';
      const statusClass = m.is_active ? 'active' : 'revoked';
      const statusText = m.is_active ? 'In Good Standing' : 'Suspended';

      return `
        <tr>
          <td><strong style="color: var(--imperial-gold); font-family: var(--font-formal);">${m.codename || 'Initiate'}</strong></td>
          <td><span style="font-family: monospace; color: var(--antique-gold);">${m.member_number || 'SOC-0000'}</span></td>
          <td><span class="rank-badge">${m.society_rank || 'Initiate'}</span></td>
          <td>${(m.points || 0).toLocaleString()} pts</td>
          <td><span class="status-pill ${statusClass}">${statusText}</span></td>
          <td style="color: var(--muted-grey); font-size: 0.78rem;">${induction}</td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error('Failed to load roster:', err);
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--status-revoked); padding: 24px;">Failed to load roster records</td></tr>';
  }
}

/**
 * Section 05: Administrative Audit Logs
 */
async function loadAuditLogs() {
  const container = document.getElementById('auditLogStream');
  if (!container) return;

  try {
    const logs = await api.get('/members/audit-logs');
    if (!logs || logs.length === 0) {
      container.innerHTML = '<div style="color: var(--muted-grey); padding: 12px; text-align: center;">No administrative events recorded yet</div>';
      return;
    }

    container.innerHTML = logs.map(l => {
      const date = l.created_at ? new Date(l.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
      const details = l.details ? Object.entries(l.details).map(([k, v]) => `${k}: ${v}`).join(' • ') : '';
      return `
        <div class="audit-log-item">
          <span class="audit-action-tag">${l.action || 'EVENT'}</span>
          <div>
            <div style="color: var(--ivory);">${l.target_resource ? l.target_resource.toUpperCase() : 'VAULT'}: ${details || 'Logged event'}</div>
            <div class="audit-meta">${date}</div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.warn('Audit logs load error:', err);
    container.innerHTML = '<div style="color: var(--muted-grey); padding: 12px; text-align: center;">Audit logs streaming unavailable</div>';
  }
}

/**
 * Setup Modals (Invitation Creation & Dialogs)
 */
function setupAdminModals() {
  const openInviteBtn = document.getElementById('openInviteModalBtn');
  const closeInviteBtn = document.getElementById('closeInviteModalBtn');
  const modal = document.getElementById('inviteModal');
  const inviteForm = document.getElementById('createInviteForm');

  if (openInviteBtn && modal) {
    openInviteBtn.addEventListener('click', () => {
      modal.classList.add('active');
    });
  }

  if (closeInviteBtn && modal) {
    closeInviteBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      const resultArea = document.getElementById('inviteResultArea');
      if (resultArea) resultArea.style.display = 'none';
    });
  }

  if (inviteForm) {
    inviteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('invIntendedName').value.trim();
      const email = document.getElementById('invIntendedEmail').value.trim();
      const codename = document.getElementById('invCodename').value.trim();
      const rank = document.getElementById('invRank').value;
      const role = document.getElementById('invRole').value;
      const submitBtn = document.getElementById('submitInviteBtn');

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Generating Token...';

        const res = await api.post('/invitations/create', {
          intended_name: name,
          intended_email: email,
          assigned_codename: codename,
          assigned_rank: rank,
          assigned_role: role,
          expiry_days: 7
        });

        if (res && res.plain_token) {
          const resultArea = document.getElementById('inviteResultArea');
          const tokenDisplay = document.getElementById('generatedTokenDisplay');
          if (resultArea && tokenDisplay) {
            tokenDisplay.value = res.plain_token;
            resultArea.style.display = 'block';
          }
          inviteForm.reset();
          await loadCentralCommandMetrics();
        }
      } catch (err) {
        alert(err.message || 'Failed to issue invitation');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Issue Cryptographic Token';
      }
    });
  }
}
