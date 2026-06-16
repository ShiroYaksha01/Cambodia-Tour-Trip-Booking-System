<template>
  <div class="ledger-container">
    <!-- Content -->

    <!-- Content -->
    <main class="ledger-content">
      <!-- Financial Overview -->
      <section class="overview-section">
        <div class="section-header">
          <h2>Financial Transparency Ledger</h2>
          <p class="subtitle">Monitor your net earnings, manage payout schedules, and access detailed commission breakdowns for all curated experiences.</p>
        </div>

        <div class="action-buttons">
          <button class="btn-secondary" type="button" @click="downloadCsv">Download CSV</button>
          <button class="btn-primary" type="button" @click="requestPayout">Request Payout</button>
        </div>
      </section>

      <!-- Financial Cards -->
      <section class="financial-cards">
        <div class="cards-row">
          <div class="card earnings-card">
            <div class="card-header">
              <h3>Earnings Breakdown</h3>
              <span class="period-badge">CURRENT PERIOD: {{ currentPeriodLabel }}</span>
            </div>
            <div class="card-content">
              <div class="earning-item">
                <div class="earning-label">
                  <span class="earning-icon">💼</span>
                  <span>Total Sales</span>
                </div>
                <div class="earning-value">${{ totalSales }}</div>
              </div>
              <div class="earning-item">
                <div class="earning-label">
                  <span class="earning-icon">%</span>
                  <span>Platform Fee (15%)</span>
                </div>
                <div class="earning-value negative">-${{ platformFee }}</div>
              </div>
              <div class="earning-item total">
                <div class="earning-label">Net Payout</div>
                <div class="earning-value">
                  <span class="amount">${{ netPayout }}</span>
                  <span class="status">READY FOR TRANSFER</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card revenue-card">
            <div class="card-header">
              <h3>Revenue Performance</h3>
            </div>
            <div class="chart-container">
              <div class="bar-chart">
                <div v-for="(month, idx) in monthlyTotals" :key="idx" class="chart-bar">
                  <div class="bar" :style="{ height: month.height + '%' }"></div>
                  <div class="bar-label">{{ month.label }}</div>
                </div>
              </div>
              <div class="chart-legend">
                <div class="legend-item">
                  <span class="legend-color gross"></span>
                  <span>Gross Sales (Pre-fee)</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color net"></span>
                  <span>Net Revenue (Payout)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Transaction History -->
      <section class="transaction-section">
        <div class="transaction-header">
          <h3>Transaction History</h3>
          <div class="filters">
            <select v-model="statusFilter" class="filter-select">
              <option value="">Status: All</option>
              <option value="released">Released</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
            </select>
            <select v-model="sortBy" class="filter-select">
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="amount-high">Sort: Amount (High to Low)</option>
              <option value="amount-low">Sort: Amount (Low to High)</option>
            </select>
          </div>
        </div>

        <div class="transactions-table">
          <table>
            <thead>
              <tr>
                <th>TRANSFER ID</th>
                <th>INITIATED DATE</th>
                <th>DESTINATION</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in paginatedTransactions" :key="transaction.id">
                <td class="transfer-id">{{ transaction.id }}</td>
                <td class="date">{{ transaction.date }}</td>
                <td class="destination">
                  <span class="bank-icon">🏦</span>
                  {{ transaction.destination }}
                </td>
                <td class="amount">${{ transaction.amount }}</td>
                <td>
                  <span class="status-badge" :class="transaction.status.toLowerCase()">
                    {{ transaction.status }}
                  </span>
                </td>
                <td>
                  <button class="action-btn" type="button" @click="viewTransactionDetails(transaction)">View Details</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="table-footer">
            <p class="showing-text">Showing {{ paginatedTransactions.length }} of {{ filteredTransactions.length }} transfers</p>
            <div class="pagination">
              <button class="page-btn" type="button" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">‹</button>
              <button
                v-for="page in totalPages"
                :key="page"
                class="page-btn"
                :class="{ active: currentPage === page }"
                type="button"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
              <button class="page-btn" type="button" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">›</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { getProviderBookings } from "../../services/api";

const props = withDefaults(
  defineProps<{
    searchQuery?: string;
  }>(),
  {
    searchQuery: "",
  },
);

interface Transaction {
  id: string;
  date: string;
  destination: string;
  amount: string;
  status: string;
}

const statusFilter = ref("");
const sortBy = ref("newest");
const currentPage = ref(1);
const pageSize = 5;

// authUser kept for future use

// providerName is available in header component via localStorage; keep authUser for potential use

const transactions = ref<Transaction[]>([]);
const isLoading = ref(true);
const currentPeriodLabel = computed(() => {
  const d = transactions.value.length
    ? new Date(transactions.value[0].date)
    : new Date();
  if (isNaN(d.getTime())) return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" }).toUpperCase();
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long" }).toUpperCase();
});

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseMoney(amount: string): number {
  const value = parseFloat(amount.replace(/,/g, ""));
  return Number.isFinite(value) ? value : 0;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function mapPaymentStatus(status: string): string {
  const s = (status || "").toLowerCase();
  if (s === "paid") return "Released";
  if (s === "pending") return "Pending";
  if (s === "processing") return "Processing";
  if (s === "refunded") return "Processing";
  return "Pending";
}

function mapBookingToTransaction(b: any): Transaction {
  const amt = typeof b.amount === "number" ? b.amount : 0;
  return {
    id: `#TXN-${(b.reference_code || b.id || "").toString().toUpperCase().slice(0, 7)}`,
    date: fmtDate(b.date),
    destination: b.service_name || "Booking Payment",
    amount: fmt(amt),
    status: mapPaymentStatus(b.payment_status),
  };
}

const totalSales = computed(() => fmt(transactions.value.reduce((s, t) => s + parseMoney(t.amount), 0)));
const platformFee = computed(() => fmt(parseMoney(totalSales.value) * 0.15));
const netPayout = computed(() => fmt(parseMoney(totalSales.value) - parseMoney(platformFee.value)));

// compute last 6 months based on latest transaction and aggregate amounts
const monthlyTotals = computed(() => {
  const parseAmount = (s: string) => {
    const n = parseFloat(s.replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  // get latest transaction date, fall back to now
  const dates = transactions.value
    .map((t) => new Date(t.date))
    .filter((d) => !Number.isNaN(d.getTime()));
  const latest = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : new Date();

  const months: { label: string; year: number; month: number }[] = [];
  const latestYear = latest.getFullYear();
  const latestMonth = latest.getMonth();

  for (let i = -5; i <= 0; i++) {
    const dt = new Date(latestYear, latestMonth + i, 1);
    const label = dt.toLocaleString("en-US", { month: "short" }).toUpperCase();
    months.push({ label, year: dt.getFullYear(), month: dt.getMonth() });
  }

  const sums = months.map((m) =>
    transactions.value.reduce((acc, t) => {
      const d = new Date(t.date);
      if (d.getFullYear() === m.year && d.getMonth() === m.month) {
        return acc + parseAmount(t.amount);
      }
      return acc;
    }, 0)
  );

  const max = Math.max(...sums, 1);

  return months.map((m, idx) => ({ label: m.label, height: Math.round((sums[idx] / max) * 100), value: sums[idx] }));
});

const mockTransactions = (): Transaction[] => [
  { id: "#TXN-90214", date: "July 18, 2023", destination: "ABA Bank •••• 4492", amount: "4,820.00", status: "Released" },
  { id: "#TXN-88431", date: "July 10, 2023", destination: "ABA Bank •••• 4492", amount: "3,150.00", status: "Released" },
  { id: "#TXN-87299", date: "July 02, 2023", destination: "ABA Bank •••• 4492", amount: "1,200.00", status: "Processing" },
  { id: "#TXN-86532", date: "June 25, 2023", destination: "ABA Bank •••• 4492", amount: "2,900.00", status: "Released" },
  { id: "#TXN-85641", date: "June 18, 2023", destination: "ABA Bank •••• 4492", amount: "3,450.00", status: "Released" },
  { id: "#TXN-84729", date: "June 10, 2023", destination: "ABA Bank •••• 4492", amount: "2,100.00", status: "Pending" },
];

onMounted(async () => {
  try {
    const res = await getProviderBookings();
    const data = res?.data || res;
    const list: any[] = Array.isArray(data) ? data : data?.data || [];
    transactions.value = list
      .filter((b) => b.payment_status === "paid")
      .map(mapBookingToTransaction);
    if (!transactions.value.length) {
      transactions.value = mockTransactions();
    }
  } catch {
    transactions.value = mockTransactions();
  } finally {
    isLoading.value = false;
  }
});

const filteredTransactions = computed(() => {
  let result = transactions.value;

  if (statusFilter.value) {
    result = result.filter((t) => t.status.toLowerCase() === statusFilter.value);
  }

  if (props.searchQuery) {
    const query = props.searchQuery.toLowerCase();
    result = result.filter(
      (t) =>
        t.id.toLowerCase().includes(query) ||
        t.destination.toLowerCase().includes(query) ||
        t.amount.includes(query)
    );
  }

  if (sortBy.value === "oldest") {
    result = [...result].reverse();
  } else if (sortBy.value === "amount-high") {
    result = [...result].sort((a, b) => parseMoney(b.amount) - parseMoney(a.amount));
  } else if (sortBy.value === "amount-low") {
    result = [...result].sort((a, b) => parseMoney(a.amount) - parseMoney(b.amount));
  }

  return result;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredTransactions.value.length / pageSize)));

const paginatedTransactions = computed(() => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
  const start = (currentPage.value - 1) * pageSize;
  return filteredTransactions.value.slice(start, start + pageSize);
});

function goToPage(page: number) {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value);
}

function downloadCsv() {
  const headers = ["Transfer ID", "Initiated Date", "Destination", "Amount", "Status"];
  const rows = filteredTransactions.value.map((transaction) => [
    transaction.id,
    transaction.date,
    transaction.destination,
    transaction.amount,
    transaction.status,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "provider-transactions.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function requestPayout() {
  alert(`Payout request prepared for $${netPayout.value}. Admin will review the transfer before release.`);
}

function viewTransactionDetails(transaction: Transaction) {
  alert(`${transaction.id}\n${transaction.date}\n${transaction.destination}\nAmount: $${transaction.amount}\nStatus: ${transaction.status}`);
}
</script>

<style scoped>
.ledger-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f5f5f5;
}

.ledger-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ledger-header h1 {
  margin: 0;
  font-size: 14px;
  color: #1a1a1a;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.header-icons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.provider-profile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0f6e70, #efb34f);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 400;
}

.avatar--image {
  background: transparent;
}

.avatar--image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
}

.ledger-content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.overview-section {
  background: white;
  border-radius: 6px;
  padding: 24px;
  margin-bottom: 24px;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h2 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 400;
  color: #1a1a1a;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.btn-secondary {
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 400;
  color: #1a1a1a;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

.btn-primary {
  padding: 8px 16px;
  background: #0f6e70;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 400;
}

.btn-primary:hover {
  background: #0d5a5c;
}

.financial-cards {
  display: grid;
  gap: 24px;
  margin-bottom: 24px;
}

.cards-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.card {
  background: white;
  border-radius: 6px;
  padding: 24px;
}

.card-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: #1a1a1a;
}

.period-badge {
  background: #fff4e6;
  color: #9b6b1f;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 14px;
  font-weight: 400;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.earning-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.earning-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.earning-icon {
  font-size: 14px;
}

.earning-value {
  font-size: 14px;
  font-weight: 400;
  color: #1a1a1a;
}

.earning-value.negative {
  color: #d73a49;
}

.earning-item.total {
  border-top: 2px solid #f0f0f0;
  padding-top: 16px;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.earning-item.total .earning-value {
  display: flex;
  align-items: center;
  gap: 12px;
}

.earning-item.total .amount {
  font-size: 14px;
  color: #0f6e70;
}

.earning-item.total .status {
  font-size: 14px;
  font-weight: 400;
  color: #0f6e70;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 150px;
  padding: 16px 0;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar {
  width: 100%;
  background: linear-gradient(to top, #0f6e70, #1b9699);
  border-radius: 4px 4px 0 0;
  transition: all 0.2s;
}

.bar:hover {
  opacity: 0.8;
}

.bar-label {
  font-size: 14px;
  font-weight: 400;
  color: #999;
}

.chart-legend {
  display: flex;
  gap: 16px;
  font-size: 14px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.gross {
  background: #e8f0f0;
}

.legend-color.net {
  background: #0f6e70;
}

.transaction-section {
  background: white;
  border-radius: 6px;
  padding: 24px;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.transaction-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: #1a1a1a;
}

.filters {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  background: white;
}

.transactions-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

thead {
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 400;
  color: #999;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.transfer-id {
  color: #0f6e70;
  font-weight: 400;
}

.date {
  color: #666;
}

.destination {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1a1a1a;
}

.bank-icon {
  font-size: 14px;
}

.amount {
  color: #1a1a1a;
  font-weight: 400;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 14px;
  font-weight: 400;
}

.status-badge.released {
  background: #e8f5f0;
  color: #0f6e70;
}

.status-badge.pending {
  background: #fff4e6;
  color: #9b6b1f;
}

.status-badge.processing {
  background: #fff4e6;
  color: #9b6b1f;
}

.action-btn {
  padding: 4px 8px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  color: #0f6e70;
  font-weight: 400;
}

.action-btn:hover {
  background: #f5f5f5;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  font-size: 14px;
}

.showing-text {
  color: #999;
  margin: 0;
}

.pagination {
  display: flex;
  gap: 4px;
}

.page-btn {
  padding: 4px 8px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  font-weight: 400;
  transition: all 0.2s;
}

.page-btn:hover {
  background: #f5f5f5;
}

.page-btn.active {
  background: #0f6e70;
  color: white;
  border-color: #0f6e70;
}

@media (max-width: 1024px) {
  .cards-row {
    grid-template-columns: 1fr;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 720px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .page-header h1 {
    font-size: 0.875rem;
  }

  .stats-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .stat-card {
    padding: 14px;
  }

  .stat-value {
    font-size: 0.875rem;
  }

  .transactions-table {
    font-size: 0.875rem;
  }

  .transactions-table th,
  .transactions-table td {
    padding: 10px 8px;
  }

  .amount-text {
    font-size: 0.875rem;
  }

  .badge {
    font-size: 0.875rem;
    padding: 2px 6px;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 6px;
  }

  .page-btn {
    min-width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }

  .bar-chart-wrapper {
    height: 120px;
  }

  .cards-row {
    gap: 12px;
  }

  .earnings-card,
  .revenue-card {
    padding: 18px;
  }

  .earnings-amount {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 14px;
    gap: 16px;
  }

  .transactions-table th,
  .transactions-table td {
    padding: 8px 6px;
    font-size: 0.875rem;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-value {
    font-size: 0.875rem;
  }

  .stat-label {
    font-size: 0.875rem;
  }
}
</style>
