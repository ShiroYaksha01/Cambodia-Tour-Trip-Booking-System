<template>
  <main class="provider-shell">
    <DashboardSidebar role="provider" />

    <section class="provider-content">
      <header class="topbar">
        <div class="topbar__left">
          <h1>Inventory & Pricing</h1>
          <span class="sync-pill">⟳ Syncing: All OTAs</span>
        </div>

        <div class="provider-profile">
          <button class="icon-button" type="button" aria-label="Notifications">🔔</button>
          <div class="provider-profile__text">
            <strong>The Heritage Curator</strong>
            <span>Master Admin</span>
          </div>
          <div class="provider-avatar">AT</div>          <LogoutButton />        </div>
      </header>

      <section class="summary-grid" id="overview">
        <article class="summary-card summary-card--teal">
          <span>AVG. OCCUPANCY</span>
          <strong>84.2%</strong>
          <small>+12% from March</small>
        </article>
        <article class="summary-card summary-card--gold">
          <span>REVPAR</span>
          <strong>$142.50</strong>
          <small>Optimal Pricing Active</small>
        </article>
        <article class="summary-card summary-card--red">
          <span>LOW STOCK ALERTS</span>
          <strong>04</strong>
          <small>1 action required: April 14</small>
        </article>
        <article class="summary-card summary-card--forest">
          <span>KHMER NEW YEAR</span>
          <strong>98%</strong>
          <small>Peak Demand Season</small>
        </article>
      </section>

      <section class="workspace-grid">
        <article class="matrix-panel" id="matrix">
          <div class="matrix-toolbar">
            <button type="button" class="date-nav">‹</button>
            <h2>April 2024</h2>
            <button type="button" class="date-nav">›</button>

            <div class="matrix-toggle">
              <button type="button">Month</button>
              <button type="button" class="matrix-toggle__active">Fortnight</button>
            </div>
          </div>

          <div class="pricing-table">
            <div class="pricing-table__head">
              <span>Product / Service</span>
              <span>TUE 10</span>
              <span>TUE 11</span>
              <span>TUE 12</span>
              <span>SAT 13</span>
              <span>SUN 14</span>
              <span>MON 15</span>
            </div>

            <div class="pricing-row">
              <div>
                <strong>Angkor Wat Sunrise Premium</strong>
                <small>Daily Departure (4am)</small>
              </div>
              <span class="slot slot--teal">19 left<br /><small>$85</small></span>
              <span class="slot slot--teal">12 left<br /><small>$85</small></span>
              <span class="slot slot--teal">12 left<br /><small>$85</small></span>
              <span class="slot slot--gold">9 left<br /><small>$120</small></span>
              <span class="slot slot--red">2 left<br /><small>$130</small></span>
              <span class="slot slot--teal">11 left<br /><small>$90</small></span>
            </div>

            <div class="pricing-row">
              <div>
                <strong>Floating Village Photography</strong>
                <small>Afternoon Boat Tour</small>
              </div>
              <span class="slot slot--teal">14 left<br /><small>$45</small></span>
              <span class="slot slot--teal">27 left<br /><small>$45</small></span>
              <span class="slot slot--teal">10 left<br /><small>$45</small></span>
              <span class="slot slot--teal">29 left<br /><small>$45</small></span>
              <span class="slot slot--teal">17 left<br /><small>$45</small></span>
              <span class="slot slot--teal">22 left<br /><small>$45</small></span>
            </div>

            <div class="pricing-row">
              <div>
                <strong>Khmer Cooking Masterclass</strong>
                <small>Limited to 12 Pax</small>
              </div>
              <span class="slot slot--teal">7 left<br /><small>$65</small></span>
              <span class="slot slot--teal">8 left<br /><small>$65</small></span>
              <span class="slot slot--closed">CLOSED<br /><small>$65</small></span>
              <span class="slot slot--teal">5 left<br /><small>$65</small></span>
              <span class="slot slot--teal">5 left<br /><small>$65</small></span>
              <span class="slot slot--teal">9 left<br /><small>$65</small></span>
            </div>
          </div>

          <div class="legend-row">
            <div class="legend-item"><span class="dot dot--teal"></span>Available</div>
            <div class="legend-item"><span class="dot dot--red"></span>Low Stock (&lt;10%)</div>
            <div class="legend-item"><span class="dot dot--gold"></span>Khmer New Year (Peak)</div>
            <a href="#changes">Export Matrix</a>
          </div>
        </article>

        <aside class="side-rail">
          <article class="panel-card" id="pricing">
            <div class="card-header">
              <span class="card-icon">⌘</span>
              <h3>Pricing Engine</h3>
            </div>

            <label class="field">
              <span>RULE TYPE</span>
              <select>
                <option>Add % Markup</option>
                <option>Flat Rate</option>
                <option>Dynamic Demand</option>
              </select>
            </label>

            <label class="field">
              <span>VALUE</span>
              <div class="value-box">% <strong>25</strong></div>
            </label>

            <label class="switch-row">
              <span>AUTO-APPLY LOGIC</span>
              <div class="switch"><span class="switch__knob"></span></div>
              <small>Apply only when stock &lt; 20%</small>
            </label>

            <button type="button" class="primary-button">Update Market Prices</button>
          </article>

          <article class="panel-card" id="controller">
            <div class="card-header card-header--soft">
              <span class="card-icon card-icon--soft">▣</span>
              <h3>Inventory Controller</h3>
            </div>

            <div class="notice-box">
              <strong>KH New Year Focus</strong>
              <p>Apr 13-16 is designated as a high-demand peak period.</p>
            </div>

            <div class="date-grid">
              <label class="field">
                <span>START DATE</span>
                <input type="text" value="04/13/2024" />
              </label>
              <label class="field">
                <span>END DATE</span>
                <input type="text" value="04/16/2024" />
              </label>
            </div>

            <label class="field">
              <span>MAX PAX / DAILY LIMIT</span>
              <input type="text" value="15" />
            </label>

            <small class="helper-text">*Auto-close triggers at 100% occupancy.</small>

            <button type="button" class="outline-button">Batch Process Dates</button>
          </article>

          <article class="panel-card" id="changes">
            <span class="section-kicker">RECENT CHANGES</span>
            <div class="change-item">
              <span class="change-dot change-dot--teal"></span>
              <div>
                <strong>Price Override Applied</strong>
                <small>Angkor Premium · Apr 14-15</small>
              </div>
            </div>
            <div class="change-item">
              <span class="change-dot change-dot--gold"></span>
              <div>
                <strong>Auto-Close Triggered</strong>
                <small>Cooking Class · Apr 12</small>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import DashboardSidebar from '../../components/dashboard/DashboardSidebar.vue'
import LogoutButton from '../../components/LogoutButton.vue'
</script>

<style scoped>
.provider-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 245px minmax(0, 1fr);
  background: #202020;
  box-sizing: border-box;
}

.provider-content {
  display: grid;
  gap: 16px;
  padding: 18px;
  background: linear-gradient(180deg, #f7f7f6 0%, #f9faf9 100%);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 8px 10px;
}

.topbar__left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.topbar h1 {
  margin: 0;
  color: #143b3f;
  font-size: 1.6rem;
  font-weight: 800;
}

.sync-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: #f0f2f1;
  color: #606f6b;
  font-size: 0.72rem;
}

.provider-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-button {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: transparent;
}

.provider-profile__text strong,
.provider-profile__text span {
  display: block;
  line-height: 1.1;
}

.provider-profile__text strong {
  color: #173f42;
  font-size: 0.82rem;
}

.provider-profile__text span {
  color: #73827d;
  font-size: 0.68rem;
}

.provider-avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0f6e70, #efb34f);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 800;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.summary-card {
  padding: 18px 16px 16px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(20, 31, 31, 0.07);
  border-top: 3px solid transparent;
}

.summary-card span {
  display: block;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  color: #7f8b88;
}

.summary-card strong {
  display: block;
  margin-top: 10px;
  color: #173f42;
  font-size: 2rem;
  line-height: 1;
}

.summary-card small {
  display: block;
  margin-top: 6px;
  color: #6c7b77;
  font-size: 0.78rem;
}

.summary-card--teal { border-top-color: #1b8d90; }
.summary-card--gold { border-top-color: #c68a22; }
.summary-card--red { border-top-color: #e03a3a; }
.summary-card--forest { border-top-color: #4a7a65; }

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) 284px;
  gap: 14px;
}

.matrix-panel {
  background: #fff;
  border-radius: 10px;
  padding: 14px;
  box-shadow: 0 12px 28px rgba(20, 31, 31, 0.07);
}

.matrix-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0 12px;
}

.matrix-toolbar h2 {
  margin: 0;
  color: #2c4042;
  font-size: 1.1rem;
  font-weight: 700;
}

.date-nav {
  border: 0;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #f2f4f3;
  color: #556866;
}

.matrix-toggle {
  margin-left: auto;
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: #f0f0f0;
  border-radius: 6px;
}

.matrix-toggle button {
  border: 0;
  background: transparent;
  padding: 5px 10px;
  border-radius: 4px;
  color: #5f6f6d;
  font-size: 0.72rem;
}

.matrix-toggle__active {
  background: #0f6e70 !important;
  color: #fff !important;
}

.pricing-table {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #edf0ef;
}

.pricing-table__head,
.pricing-row {
  display: grid;
  grid-template-columns: 1.6fr repeat(6, 1fr);
}

.pricing-table__head {
  background: #fafafa;
  border-bottom: 1px solid #eef0ef;
}

.pricing-table__head span {
  padding: 10px;
  font-size: 0.68rem;
  font-weight: 800;
  color: #5c6d6a;
  text-align: center;
}

.pricing-table__head span:first-child {
  text-align: left;
}

.pricing-row {
  border-bottom: 1px solid #f0f1f0;
}

.pricing-row:last-child {
  border-bottom: 0;
}

.pricing-row > div {
  padding: 15px 12px;
}

.pricing-row > div strong {
  display: block;
  color: #1b3031;
  font-size: 0.88rem;
}

.pricing-row > div small {
  display: block;
  margin-top: 5px;
  color: #7b8b88;
}

.slot {
  padding: 10px 8px;
  text-align: center;
  font-size: 0.74rem;
  font-weight: 700;
  color: #1e5457;
  border-left: 1px solid #f2f4f3;
}

.slot small {
  display: block;
  margin-top: 4px;
  color: #6c7b77;
  font-size: 0.72rem;
}

.slot--teal { color: #1e6567; }
.slot--gold { background: #fff8ef; color: #a46a00; }
.slot--red { background: #fff3f3; color: #c94f4f; }
.slot--closed { color: #9ea8a6; background: #f7f8f7; }

.legend-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 4px 2px;
  color: #60706d;
  font-size: 0.78rem;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.legend-row a {
  margin-left: auto;
  color: #1d7777;
  text-decoration: none;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.dot--teal { background: #1b8d90; }
.dot--red { background: #df4c4c; }
.dot--gold { background: #efb34f; }

.side-rail {
  display: grid;
  gap: 12px;
}

.panel-card {
  background: #fff;
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 12px 28px rgba(20, 31, 31, 0.07);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.card-header h3 {
  margin: 0;
  color: #263f41;
  font-size: 1rem;
}

.card-icon {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  background: #f4f0dc;
  color: #b08724;
  font-size: 0.74rem;
}

.card-icon--soft {
  background: #eaf3f4;
  color: #4f8b8f;
}

.field {
  display: grid;
  gap: 6px;
  margin-top: 10px;
}

.field span,
.section-kicker {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  color: #7a8784;
}

.field select,
.field input,
.value-box {
  min-height: 36px;
  border: 1px solid #edf0ef;
  border-radius: 4px;
  background: #f7f8f8;
  padding: 0 10px;
  font: inherit;
  color: #345054;
}

.value-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.value-box strong {
  font-size: 1.1rem;
  color: #3a4648;
}

.switch-row {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.switch-row small,
.helper-text,
.notice-box p,
.change-item small {
  color: #778784;
  font-size: 0.72rem;
}

.switch {
  width: 42px;
  height: 22px;
  border-radius: 999px;
  background: #1b8d90;
  position: relative;
}

.switch__knob {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #fff;
  position: absolute;
  top: 2px;
  right: 2px;
}

.primary-button,
.outline-button {
  width: 100%;
  min-height: 40px;
  margin-top: 12px;
  border: 0;
  border-radius: 3px;
  font: inherit;
  font-weight: 700;
}

.primary-button {
  background: #f4a51c;
  color: #fff;
}

.outline-button {
  background: #fff;
  color: #0f6e70;
  border: 1px solid #0f6e70;
}

.notice-box {
  padding: 12px;
  border-left: 3px solid #e9b25e;
  background: #fbf4e8;
  border-radius: 4px;
  margin: 10px 0 12px;
}

.notice-box strong {
  color: #4b3a14;
  font-size: 0.82rem;
}

.date-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.helper-text {
  display: block;
  margin-top: 8px;
}

.recent-changes {
  display: grid;
  gap: 10px;
}

.change-item {
  display: flex;
  gap: 10px;
  align-items: start;
}

.change-item strong {
  display: block;
  color: #2b3f41;
  font-size: 0.82rem;
}

.change-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  margin-top: 5px;
}

.change-dot--teal { background: #0f6e70; }
.change-dot--gold { background: #f4a51c; }

@media (max-width: 1280px) {
  .provider-shell {
    grid-template-columns: 1fr;
  }

  .provider-content {
    padding: 16px;
  }

  .summary-grid,
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .topbar,
  .provider-profile,
  .legend-row,
  .matrix-toolbar,
  .topbar__left {
    flex-direction: column;
    align-items: stretch;
  }

  .pricing-table__head,
  .pricing-row {
    grid-template-columns: 1.3fr repeat(3, 1fr);
  }

  .pricing-table__head span:nth-child(n + 5),
  .pricing-row .slot:nth-child(n + 5) {
    display: none;
  }
}
</style>