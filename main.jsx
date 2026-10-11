import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, CalendarDays,
  Check, CheckCircle2, ChevronDown, CircleAlert, Coffee, CreditCard,
  Download, HeartPulse, LayoutDashboard, Lightbulb, Menu, Plus, RotateCcw,
  ShieldCheck, ShoppingBag, Sparkles, Target, Trash2, Wallet, X, Zap
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import "./styles.css";

const STARTING_BUDGET = 10000;
const DEFAULT_STATE = {
  day: 12,
  income: 10000,
  spent: 2300,
  commitments: [
    { id: 1, name: "Transport pass", amount: 650, due: "Day 15", category: "Transport" },
    { id: 2, name: "Phone bill", amount: 399, due: "Day 20", category: "Bills" },
    { id: 3, name: "Groceries", amount: 900, due: "Day 22", category: "Essentials" },
    { id: 4, name: "Family contribution", amount: 451, due: "Day 25", category: "Family" }
  ],
  subscriptions: [
    { id: 11, name: "Music streaming", amount: 119, active: true },
    { id: 12, name: "Video streaming", amount: 199, active: true },
    { id: 13, name: "Cloud storage", amount: 181, active: true }
  ],
  goals: [
    { id: 21, name: "Emergency fund", target: 3000, saved: 1000, color: "lime" },
    { id: 22, name: "Course / certification", target: 2500, saved: 500, color: "purple" }
  ],
  transactions: [
    { id: 31, name: "Groceries", category: "Essentials", amount: 640, day: 2 },
    { id: 32, name: "Metro & bus", category: "Transport", amount: 280, day: 4 },
    { id: 33, name: "Lunch with friends", category: "Food & coffee", amount: 420, day: 6 },
    { id: 34, name: "Phone recharge", category: "Bills", amount: 239, day: 8 },
    { id: 35, name: "Coffee", category: "Food & coffee", amount: 190, day: 10 },
    { id: 36, name: "Household items", category: "Essentials", amount: 531, day: 11 }
  ],
  savingsContribution: 1500,
  emergencyBuffer: 750
};

const money = (n) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0
}).format(Math.round(n));
const number = (n) => new Intl.NumberFormat("en-IN").format(Math.round(n));
const loadState = () => {
  try {
    const saved = localStorage.getItem("paisa-demo-v1");
    if (!saved) return DEFAULT_STATE;
    const parsed = JSON.parse(saved);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
};

function MetricCard({ label, value, detail, icon: Icon, tone = "green", trend }) {
  return <article className="metric-card">
    <div className="metric-top">
      <span className={`icon-tile ${tone}`}><Icon size={18} /></span>
      {trend && <span className="metric-trend">{trend}</span>}
    </div>
    <p className="metric-label">{label}</p>
    <h3>{value}</h3>
    <p className="metric-detail">{detail}</p>
  </article>;
}

function SectionTitle({ eyebrow, title, detail, action }) {
  return <div className="section-title">
    <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{detail && <p className="muted">{detail}</p>}</div>
    {action}
  </div>;
}

function App() {
  const [data, setData] = useState(loadState);
  const [activeTab, setActiveTab] = useState("Overview");
  const [simAmount, setSimAmount] = useState(800);
  const [simCategory, setSimCategory] = useState("Shopping");
  const [simName, setSimName] = useState("New purchase");
  const [simApplied, setSimApplied] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Essentials");
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    localStorage.setItem("paisa-demo-v1", JSON.stringify(data));
  }, [data]);

  const subscriptionTotal = data.subscriptions.filter(s => s.active).reduce((sum, s) => sum + Number(s.amount), 0);
  const commitmentsTotal = data.commitments.reduce((sum, c) => sum + Number(c.amount), 0);
  const remainingDays = Math.max(1, 30 - data.day + 1);
  const cashRemaining = data.income - data.spent;
  const flexible = cashRemaining - commitmentsTotal - subscriptionTotal - data.savingsContribution;
  const dailyAllowance = Math.max(0, flexible / remainingDays);
  const simFlexible = flexible - Number(simAmount || 0);
  const simDaily = Math.max(0, simFlexible / remainingDays);
  const risk = flexible < 0 ? "Critical" : flexible < data.emergencyBuffer ? "High" : flexible < 1600 ? "Watch" : "Low";
  const healthScore = Math.max(0, Math.min(100, Math.round(
    55 + Math.min(25, Math.max(0, flexible) / 100) +
    (flexible >= data.emergencyBuffer ? 10 : -10) -
    (flexible < 0 ? 35 : 0) +
    (data.goals.some(g => g.saved > 0) ? 5 : 0)
  )));
  const simRisk = simFlexible < 0 ? "Critical" : simFlexible < data.emergencyBuffer ? "High" : simFlexible < 1600 ? "Watch" : "Low";
  const totalGoalTarget = data.goals.reduce((s, g) => s + Number(g.target), 0);
  const totalGoalSaved = data.goals.reduce((s, g) => s + Number(g.saved), 0);
  const goalProgress = totalGoalTarget ? Math.min(100, totalGoalSaved / totalGoalTarget * 100) : 0;

  const forecast = useMemo(() => {
    const arr = [];
    for (let d = data.day; d <= 30; d += 3) {
      const elapsed = d - data.day;
      const baselineDaily = Math.max(0, (data.spent / Math.max(1, data.day)));
      arr.push({
        day: `Day ${Math.min(30, d)}`,
        planned: Math.round(flexible - baselineDaily * elapsed * 0.45),
        cautious: Math.round(flexible - baselineDaily * elapsed)
      });
    }
    if (arr[arr.length - 1]?.day !== "Day 30") {
      const elapsed = 30 - data.day;
      const baselineDaily = Math.max(0, data.spent / Math.max(1, data.day));
      arr.push({
        day: "Day 30",
        planned: Math.round(flexible - baselineDaily * elapsed * 0.45),
        cautious: Math.round(flexible - baselineDaily * elapsed)
      });
    }
    return arr;
  }, [data.day, data.spent, flexible]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  function applySimulation() {
    if (Number(simAmount) <= 0) return showToast("Enter an expense greater than ₹0.");
    if (simFlexible < 0) return showToast("That expense exceeds your flexible budget. Try a smaller amount.");
    const transaction = {
      id: Date.now(), name: simName.trim() || simCategory, category: simCategory,
      amount: Number(simAmount), day: data.day
    };
    setData(prev => ({
      ...prev,
      spent: prev.spent + Number(simAmount),
      transactions: [transaction, ...prev.transactions]
    }));
    setSimApplied(true);
    showToast("Decision recorded and budget recalculated.");
  }

  function addExpense(e) {
    e.preventDefault();
    const amount = Number(expenseAmount);
    if (!expenseName.trim() || !Number.isFinite(amount) || amount <= 0) {
      showToast("Add a name and a valid amount.");
      return;
    }
    const tx = { id: Date.now(), name: expenseName.trim(), category: expenseCategory, amount, day: data.day };
    setData(prev => ({ ...prev, spent: prev.spent + amount, transactions: [tx, ...prev.transactions] }));
    setExpenseName(""); setExpenseAmount(""); setShowExpenseForm(false);
    showToast("Expense added.");
  }

  function toggleSubscription(id) {
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s => s.id === id ? { ...s, active: !s.active } : s)
    }));
    showToast("Subscription plan updated.");
  }

  function addGoal() {
    const name = window.prompt("What are you saving for?");
    if (!name?.trim()) return;
    const target = Number(window.prompt("What is your target amount in rupees?", "2000"));
    if (!Number.isFinite(target) || target <= 0) return showToast("Please enter a valid target.");
    setData(prev => ({ ...prev, goals: [...prev.goals, { id: Date.now(), name: name.trim(), target, saved: 0, color: "blue" }] }));
    showToast("Savings goal created.");
  }

  function contribute(goalId) {
    const amount = Number(window.prompt("How much would you like to mark as saved?", "250"));
    if (!Number.isFinite(amount) || amount <= 0) return showToast("Enter a valid contribution.");
    setData(prev => ({
      ...prev,
      savingsContribution: prev.savingsContribution + amount,
      goals: prev.goals.map(g => g.id === goalId ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g)
    }));
    showToast("Goal updated. Your planned savings increased too.");
  }

  function resetDemo() {
    if (window.confirm("Reset all paisa. demo data to the original example?")) {
      localStorage.removeItem("paisa-demo-v1");
      setData(DEFAULT_STATE); setSimApplied(false); setSimAmount(800);
      showToast("Demo reset to the starting example.");
    }
  }

  function downloadData() {
    const blob = new Blob([JSON.stringify({ ...data, calculated: { cashRemaining, commitmentsTotal, subscriptionTotal, flexible, dailyAllowance, risk, healthScore } }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "paisa-budget.json"; a.click();
    URL.revokeObjectURL(url);
    showToast("Budget data exported.");
  }

  const navItems = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Decision lab", icon: Zap },
    { name: "Savings goals", icon: Target },
    { name: "Commitments", icon: CalendarDays },
    { name: "Transactions", icon: CreditCard }
  ];

  const goTo = (name) => { setActiveTab(name); setMobileNav(false); };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand-row">
        <div className="brand-mark"><Wallet size={22} /></div>
        <div><div className="brand-name">paisa<span>.</span></div><div className="brand-caption">MONEY, MINDFULLY.</div></div>
        <button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18}/></button>
      </div>
      <div className="budget-chip"><span className="live-dot"></span><div><strong>30-day challenge</strong><small>₹10,000 starter budget</small></div></div>
      <p className="nav-label">WORKSPACE</p>
      <nav className="main-nav" aria-label="Main navigation">
        {navItems.map(item => <button key={item.name} className={`nav-item ${activeTab === item.name ? "active" : ""}`} onClick={() => goTo(item.name)}>
          <item.icon size={18}/><span>{item.name}</span>{item.name === "Decision lab" && <span className="nav-new">TRY</span>}
        </button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="side-tip"><div className="tip-icon"><Lightbulb size={17}/></div><strong>Small moves add up.</strong><p>Every rupee you plan is a little more peace of mind.</p></div>
        <button className="nav-item" onClick={downloadData}><Download size={18}/><span>Export my data</span></button>
        <button className="nav-item" onClick={resetDemo}><RotateCcw size={18}/><span>Reset demo</span></button>
        <div className="profile-row"><div className="avatar">P</div><div><strong>Personal workspace</strong><small>Demo account · Local only</small></div><ChevronDown size={16} className="profile-chevron"/></div>
      </div>
    </aside>

    {mobileNav && <button className="mobile-backdrop" onClick={() => setMobileNav(false)} aria-label="Close navigation overlay"/>}

    <main className="main-content">
      <header className="topbar">
        <button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20}/></button>
        <div className="breadcrumb">Your money <span>/</span> <strong>{activeTab}</strong></div>
        <div className="topbar-actions"><span className="demo-badge"><span className="live-dot"></span> DEMO MODE</span><button className="icon-button notification-button" aria-label="Demo notifications" onClick={() => showToast("You're all caught up. No real notifications in demo mode.")}><Bell size={18}/></button></div>
      </header>

      <div className="page-wrap">
        <section className="welcome-row">
          <div><div className="welcome-kicker"><Sparkles size={15}/> YOUR 30-DAY MONEY CHALLENGE</div><h1>{activeTab === "Overview" ? "Make your money" : activeTab === "Decision lab" ? "Think before you spend." : activeTab === "Savings goals" ? "Give your goals a little love." : activeTab === "Commitments" ? "Plan for what’s coming." : "Every rupee has a story."}<br/><span>{activeTab === "Overview" ? "go further." : "with paisa."}</span></h1><p className="welcome-copy">A clearer view of today, a calmer plan for tomorrow.</p></div>
          <div className="day-control"><div className="day-control-top"><CalendarDays size={16}/><span>BUDGET DAY</span></div><div className="day-number">{data.day}<span> / 30</span></div><input aria-label="Current budget day" type="range" min="1" max="30" value={data.day} onChange={e => setData(prev => ({ ...prev, day: Number(e.target.value) }))}/><div className="range-labels"><span>Day 1</span><span>Day 30</span></div></div>
        </section>

        {activeTab === "Overview" && <>
          <section className="metrics-grid">
            <MetricCard label="Flexible balance" value={money(flexible)} detail="After planned costs & savings" icon={Wallet} tone="green" trend={flexible >= 0 ? "IN PLAN" : "OVER BUDGET"}/>
            <MetricCard label="Daily allowance" value={money(dailyAllowance)} detail={`${remainingDays} days including today`} icon={Activity} tone="blue"/>
            <MetricCard label="Already spent" value={money(data.spent)} detail={`${Math.round(data.spent / Math.max(1, data.income) * 100)}% of starting budget`} icon={ArrowDownRight} tone="orange"/>
            <MetricCard label="Savings planned" value={money(data.savingsContribution)} detail="Protected for your goals" icon={ShieldCheck} tone="purple"/>
          </section>

          <section className="overview-grid">
            <article className="panel balance-panel">
              <div className="panel-header"><div><p className="eyebrow">YOUR MONEY MAP</p><h2>Where you stand</h2></div><span className="soft-pill"><span className="live-dot"></span> Live calculations</span></div>
              <div className="balance-hero"><div><p>Cash left after recorded spending</p><h2>{money(cashRemaining)}</h2></div><div className="balance-icon"><Wallet size={22}/></div></div>
              <div className="budget-bar" role="img" aria-label={`${Math.min(100, data.spent / data.income * 100)} percent of starting budget spent`}><div className="bar-spent" style={{ width: `${Math.min(100, data.spent / Math.max(1, data.income) * 100)}%` }}></div></div>
              <div className="bar-legend"><span><i className="legend-dot spent-dot"></i> Spent <strong>{money(data.spent)}</strong></span><span><i className="legend-dot left-dot"></i> Cash left <strong>{money(cashRemaining)}</strong></span></div>
              <div className="allocation-list">
                <div className="allocation-row"><span className="allocation-icon blue"><CalendarDays size={16}/></span><div className="allocation-main"><div><strong>Upcoming commitments</strong><span>{money(commitmentsTotal)}</span></div><div className="mini-track"><i style={{ width: `${Math.min(100, commitmentsTotal / data.income * 100)}%` }} className="blue-track"></i></div></div></div>
                <div className="allocation-row"><span className="allocation-icon purple"><CreditCard size={16}/></span><div className="allocation-main"><div><strong>Subscriptions</strong><span>{money(subscriptionTotal)}</span></div><div className="mini-track"><i style={{ width: `${Math.min(100, subscriptionTotal / data.income * 100)}%` }} className="purple-track"></i></div></div></div>
                <div className="allocation-row"><span className="allocation-icon lime"><Target size={16}/></span><div className="allocation-main"><div><strong>Savings contribution</strong><span>{money(data.savingsContribution)}</span></div><div className="mini-track"><i style={{ width: `${Math.min(100, data.savingsContribution / data.income * 100)}%` }} className="lime-track"></i></div></div></div>
                <div className="allocation-row"><span className="allocation-icon orange"><ShoppingBag size={16}/></span><div className="allocation-main"><div><strong>Flexible after planned costs</strong><span>{money(flexible)}</span></div><div className="mini-track"><i style={{ width: `${Math.max(0, Math.min(100, flexible / data.income * 100))}%` }} className="orange-track"></i></div></div></div>
              </div>
            </article>

            <article className="panel health-panel">
              <div className="panel-header"><div><p className="eyebrow">FINANCIAL WELLNESS</p><h2>Your money pulse</h2></div><HeartPulse size={20} className="subtle-icon"/></div>
              <div className="health-score-row"><div className={`health-ring ${healthScore < 45 ? "ring-low" : healthScore < 70 ? "ring-mid" : ""}`} style={{ "--score": `${healthScore}%` }}><div><strong>{healthScore}</strong><span>/100</span></div></div><div className="health-copy"><span className={`risk-label ${risk.toLowerCase()}`}>{risk} risk</span><h3>{risk === "Low" ? "You're finding your rhythm." : risk === "Watch" ? "Keep an eye on your buffer." : risk === "High" ? "Your buffer is running thin." : "Your plan needs a reset."}</h3><p>{risk === "Low" ? "Your plan leaves room for surprises." : "Review flexible spending before adding new costs."}</p></div></div>
              <div className="health-checks"><div><CheckCircle2 size={16} className={flexible >= data.emergencyBuffer ? "check-ok" : "check-warn"}/><span>Emergency buffer</span><strong>{flexible >= data.emergencyBuffer ? "On track" : "Needs attention"}</strong></div><div><CheckCircle2 size={16} className={data.goals.length ? "check-ok" : "check-warn"}/><span>Savings goals</span><strong>{data.goals.length ? `${data.goals.length} active` : "Add a goal"}</strong></div><div><CheckCircle2 size={16} className={flexible >= 0 ? "check-ok" : "check-warn"}/><span>Planned spending</span><strong>{flexible >= 0 ? "Within budget" : "Over budget"}</strong></div></div>
              <button className="text-action" onClick={() => goTo("Decision lab")}>Improve my money health <ArrowRight size={16}/></button>
            </article>
          </section>

          <section className="lower-grid">
            <article className="panel forecast-panel"><div className="panel-header"><div><p className="eyebrow">LOOKING AHEAD</p><h2>Month-end forecast</h2><p className="muted">Two possible paths from here</p></div><span className="chart-tag">ESTIMATE</span></div><div className="chart-legend"><span><i className="legend-dot left-dot"></i> Planned pace</span><span><i className="legend-dot forecast-dot"></i> Cautious pace</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={forecast} margin={{ top: 12, right: 4, left: -16, bottom: 0 }}><defs><linearGradient id="plannedFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#B7F36B" stopOpacity={0.28}/><stop offset="100%" stopColor="#B7F36B" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#e8eee6" strokeDasharray="3 4" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#8a958b", fontSize: 11 }}/><YAxis tickFormatter={v => `₹${Math.round(v / 1000)}k`} axisLine={false} tickLine={false} tick={{ fill: "#8a958b", fontSize: 11 }}/><Tooltip formatter={v => money(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e5eae3", fontSize: 12 }}/><Area type="monotone" dataKey="planned" name="Planned pace" stroke="#709E32" strokeWidth={2.5} fill="url(#plannedFill)"/><Area type="monotone" dataKey="cautious" name="Cautious pace" stroke="#7B8EC8" strokeWidth={2} strokeDasharray="5 4" fill="transparent"/></AreaChart></ResponsiveContainer></div><div className="forecast-foot"><div><span>Flexible funds now</span><strong>{money(flexible)}</strong></div><div><span>Days left</span><strong>{remainingDays} days</strong></div><div><span>Forecast method</span><strong>Spending trend</strong></div></div></article>

            <article className="panel goals-panel"><div className="panel-header"><div><p className="eyebrow">FUTURE YOU SAYS THANKS</p><h2>Savings goals</h2></div><button className="round-add" onClick={addGoal} aria-label="Add savings goal"><Plus size={18}/></button></div><div className="goal-summary"><div className="goal-summary-icon"><Target size={20}/></div><div><strong>{money(totalGoalSaved)} <span>of {money(totalGoalTarget)}</span></strong><p>Across {data.goals.length} active goals</p></div><div className="goal-percent">{Math.round(goalProgress)}%</div></div><div className="goal-overall-track"><i style={{ width: `${goalProgress}%` }}></i></div><div className="goal-list">{data.goals.slice(0, 3).map(goal => <div className="goal-row" key={goal.id}><div className={`goal-dot ${goal.color}`}></div><div className="goal-row-main"><div><strong>{goal.name}</strong><span>{money(goal.saved)} / {money(goal.target)}</span></div><div className="mini-track"><i style={{ width: `${Math.min(100, goal.saved / Math.max(1, goal.target) * 100)}%` }} className={goal.color === "purple" ? "purple-track" : goal.color === "blue" ? "blue-track" : "lime-track"}></i></div></div><button className="tiny-action" onClick={() => contribute(goal.id)} title="Add contribution">+</button></div>)}</div><button className="text-action" onClick={() => goTo("Savings goals")}>View all goals <ArrowRight size={16}/></button></article>
          </section>

          <section className="panel transactions-panel"><div className="panel-header"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>Your latest moves</h2></div><button className="secondary-button" onClick={() => goTo("Transactions")}>All transactions <ArrowRight size={15}/></button></div><TransactionList transactions={data.transactions.slice(0, 5)} onDelete={id => setData(prev => { const tx = prev.transactions.find(t => t.id === id); return { ...prev, spent: Math.max(0, prev.spent - (tx?.amount || 0)), transactions: prev.transactions.filter(t => t.id !== id) }; })}/></section>
        </>}

        {activeTab === "Decision lab" && <section className="decision-page">
          <div className="panel simulator-panel"><div className="panel-header"><div><p className="eyebrow">THE WHAT-IF STUDIO</p><h2>Before you tap “pay”</h2><p className="muted">Test a money decision before it becomes a transaction.</p></div><div className="sim-icon"><Zap size={23}/></div></div>
            <div className="sim-form"><label htmlFor="sim-name">What are you thinking of buying?</label><input id="sim-name" value={simName} onChange={e => { setSimName(e.target.value); setSimApplied(false); }} placeholder="e.g. Concert ticket"/><label htmlFor="sim-category">Category</label><select id="sim-category" value={simCategory} onChange={e => { setSimCategory(e.target.value); setSimApplied(false); }}><option>Shopping</option><option>Food & coffee</option><option>Entertainment</option><option>Transport</option><option>Unexpected expense</option><option>Essentials</option></select><div className="sim-amount-head"><label htmlFor="sim-amount">Purchase amount</label><strong>{money(simAmount)}</strong></div><input id="sim-amount" className="range-input" type="range" min="0" max="5000" step="100" value={simAmount} onChange={e => { setSimAmount(Number(e.target.value)); setSimApplied(false); }}/><div className="range-labels"><span>₹0</span><span>₹2,500</span><span>₹5,000</span></div><div className="quick-amounts">{[200,500,1000,2000].map(v => <button key={v} className={simAmount === v ? "selected" : ""} onClick={() => { setSimAmount(v); setSimApplied(false); }}>{money(v)}</button>)}</div></div>
            <div className="sim-results"><div className="sim-result-heading"><span>YOUR DECISION, CONNECTED</span><span className={`risk-label ${simRisk.toLowerCase()}`}>{simRisk} risk</span></div><div className="sim-compare-grid"><div><p>Flexible funds now</p><strong>{money(flexible)}</strong><small>After planned costs</small></div><div className="compare-arrow"><ArrowRight size={17}/></div><div><p>After this purchase</p><strong className={simFlexible < 0 ? "danger-text" : ""}>{money(simFlexible)}</strong><small>Available buffer</small></div></div><div className="sim-impact"><div><span>Daily allowance now</span><strong>{money(dailyAllowance)}</strong></div><div><span>Daily allowance after</span><strong>{money(simDaily)}</strong></div><div><span>Daily change</span><strong className={simDaily < dailyAllowance ? "danger-text" : "positive-text"}>{money(simDaily - dailyAllowance)}</strong></div></div>{simFlexible < 0 ? <div className="insight-box danger-insight"><CircleAlert size={19}/><div><strong>This purchase is outside your current plan.</strong><p>You'd exceed flexible funds by {money(Math.abs(simFlexible))}. Try a smaller amount, delay it, or revisit a planned cost.</p></div></div> : simFlexible < data.emergencyBuffer ? <div className="insight-box warning-insight"><CircleAlert size={19}/><div><strong>This leaves a thin safety net.</strong><p>After this purchase, you'd have less than your {money(data.emergencyBuffer)} buffer target available.</p></div></div> : <div className="insight-box"><CheckCircle2 size={19}/><div><strong>This fits your current flexible budget.</strong><p>You'll still have {money(simFlexible)} after planned costs. Keep room for surprises, too.</p></div></div>}<button className="primary-button full-button" disabled={simFlexible < 0 || simAmount <= 0} onClick={applySimulation}><Check size={17}/> Record this decision <ArrowRight size={16}/></button>{simApplied && <p className="success-note"><CheckCircle2 size={15}/> Recorded. Your dashboard, transactions and forecast have updated.</p>}</div>
          </div>
          <aside className="decision-aside"><div className="panel side-insight-panel"><div className="insight-large-icon"><Sparkles size={23}/></div><p className="eyebrow">PAISA INSIGHT</p><h3>{flexible < 0 ? "Protect your essentials first." : flexible < 1600 ? "Give your future self some room." : "A plan gives you options."}</h3><p>{flexible < 0 ? "Your current plan is above the available budget. Start by reviewing optional costs." : flexible < 1600 ? "Your flexible balance is limited. Consider pausing a nonessential subscription or lowering the purchase amount." : "You have some room to make a choice. Check how it affects your buffer and savings goals before you commit."}</p></div><div className="panel side-budget-panel"><p className="eyebrow">YOUR BASELINE</p><div><span>Starting budget</span><strong>{money(data.income)}</strong></div><div><span>Spent so far</span><strong>{money(data.spent)}</strong></div><div><span>Commitments</span><strong>{money(commitmentsTotal)}</strong></div><div><span>Subscriptions</span><strong>{money(subscriptionTotal)}</strong></div><div><span>Savings planned</span><strong>{money(data.savingsContribution)}</strong></div><div className="side-total"><span>Flexible funds</span><strong>{money(flexible)}</strong></div></div></aside>
        </section>}

        {activeTab === "Savings goals" && <section className="panel full-panel"><div className="panel-header"><div><p className="eyebrow">FUTURE YOU SAYS THANKS</p><h2>Your savings goals</h2><p className="muted">Set targets, add contributions and keep an eye on your flexible budget.</p></div><button className="primary-button" onClick={addGoal}><Plus size={16}/> Add a goal</button></div><div className="goals-full-grid">{data.goals.map(g => <article className="goal-card" key={g.id}><div className={`goal-card-icon ${g.color}`}><Target size={21}/></div><h3>{g.name}</h3><p className="muted">A little progress still counts.</p><div className="goal-card-values"><strong>{money(g.saved)}</strong><span>of {money(g.target)}</span></div><div className="goal-overall-track"><i style={{width:`${Math.min(100,g.saved/Math.max(1,g.target)*100)}%`}}></i></div><p className="goal-card-progress">{Math.round(Math.min(100,g.saved/Math.max(1,g.target)*100))}% of goal reached</p><button className="secondary-button" onClick={() => contribute(g.id)}><Plus size={15}/> Add contribution</button></article>)}</div><div className="insight-box"><ShieldCheck size={19}/><div><strong>Planned savings are counted in your budget.</strong><p>Contributions increase your savings plan and reduce flexible funds so the dashboard reflects the trade-off.</p></div></div></section>}

        {activeTab === "Commitments" && <section className="panel full-panel"><div className="panel-header"><div><p className="eyebrow">NO SURPRISES, PLEASE</p><h2>Commitments & subscriptions</h2><p className="muted">These planned costs are deducted before calculating flexible money.</p></div></div><div className="commitment-summary"><div><span>Upcoming commitments</span><strong>{money(commitmentsTotal)}</strong></div><div><span>Active subscriptions</span><strong>{money(subscriptionTotal)}</strong></div><div><span>Combined planned costs</span><strong>{money(commitmentsTotal + subscriptionTotal)}</strong></div></div><h3 className="list-heading">Upcoming commitments</h3><div className="commitment-list">{data.commitments.map(c => <div className="commitment-row" key={c.id}><div className="commitment-icon"><CalendarDays size={18}/></div><div className="commitment-main"><strong>{c.name}</strong><span>{c.category} · Due {c.due}</span></div><strong>{money(c.amount)}</strong></div>)}</div><h3 className="list-heading subscription-heading">Recurring subscriptions</h3><div className="subscription-list">{data.subscriptions.map(s => <div className={`subscription-row ${!s.active ? "subscription-off" : ""}`} key={s.id}><div className="subscription-icon"><CreditCard size={18}/></div><div className="subscription-main"><strong>{s.name}</strong><span>{s.active ? "Included in budget" : "Paused in this simulation"}</span></div><strong>{money(s.amount)}<small>/mo</small></strong><button className={`toggle ${s.active ? "toggle-on" : ""}`} onClick={() => toggleSubscription(s.id)} role="switch" aria-checked={s.active} aria-label={`${s.active ? "Pause" : "Resume"} ${s.name}`}><span/></button></div>)}</div><div className="insight-box"><Lightbulb size={19}/><div><strong>Try pausing one subscription.</strong><p>The flexible balance updates instantly. This is a simulation only; it does not cancel a real service or change an actual payment.</p></div></div></section>}

        {activeTab === "Transactions" && <section className="panel full-panel"><div className="panel-header"><div><p className="eyebrow">YOUR MONEY, ACCOUNTED FOR</p><h2>Transactions</h2><p className="muted">Sample transactions and anything you record during this session.</p></div><button className="primary-button" onClick={() => setShowExpenseForm(v => !v)}><Plus size={16}/> Add expense</button></div>{showExpenseForm && <form className="expense-form" onSubmit={addExpense}><div className="form-grid"><div><label htmlFor="expense-name">Expense name</label><input id="expense-name" value={expenseName} onChange={e => setExpenseName(e.target.value)} placeholder="e.g. Lunch" required/></div><div><label htmlFor="expense-amount">Amount (₹)</label><input id="expense-amount" type="number" min="1" max="100000" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} placeholder="250" required/></div><div><label htmlFor="expense-category">Category</label><select id="expense-category" value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)}><option>Essentials</option><option>Transport</option><option>Food & coffee</option><option>Shopping</option><option>Bills</option><option>Entertainment</option><option>Unexpected expense</option></select></div></div><div className="form-actions"><button type="button" className="secondary-button" onClick={() => setShowExpenseForm(false)}>Cancel</button><button type="submit" className="primary-button">Save expense</button></div></form>}<TransactionList transactions={data.transactions} onDelete={id => setData(prev => { const tx = prev.transactions.find(t => t.id === id); return { ...prev, spent: Math.max(0, prev.spent - (tx?.amount || 0)), transactions: prev.transactions.filter(t => t.id !== id) }; })}/><div className="transaction-foot"><span>Recorded spending total</span><strong>{money(data.spent)}</strong></div></section>}

        <footer className="footer"><span>paisa<span className="brand-period">.</span> <span>Made for more mindful money moves.</span></span><span>Demo data · Saved on this device <span className="footer-dot">●</span></span></footer>
      </div>
    </main>
    {toast && <div className="toast" role="status"><CheckCircle2 size={17}/>{toast}<button onClick={() => setToast("")} aria-label="Dismiss notification"><X size={15}/></button></div>}
  </div>;
}

function TransactionList({ transactions, onDelete }) {
  const iconFor = (category) => category === "Food & coffee" ? Coffee : category === "Shopping" ? ShoppingBag : category === "Transport" ? ArrowUpRight : category === "Unexpected expense" ? CircleAlert : CreditCard;
  if (!transactions.length) return <div className="empty-state"><Wallet size={24}/><strong>No transactions yet</strong><p>Add an expense or record a decision in the Decision Lab.</p></div>;
  return <div className="transaction-list">{transactions.map(tx => { const Icon = iconFor(tx.category); return <div className="transaction-row" key={tx.id}><div className={`transaction-icon ${tx.category === "Food & coffee" ? "orange" : tx.category === "Shopping" ? "purple" : tx.category === "Transport" ? "blue" : "green"}`}><Icon size={17}/></div><div className="transaction-main"><strong>{tx.name}</strong><span>{tx.category} · Day {tx.day}</span></div><div className="transaction-amount"><strong>−{money(tx.amount)}</strong><span>Expense</span></div><button className="delete-button" onClick={() => onDelete(tx.id)} aria-label={`Delete ${tx.name}`} title="Delete transaction"><Trash2 size={15}/></button></div>; })}</div>;
}

createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);
