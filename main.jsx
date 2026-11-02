import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  CalendarDays, Clock3, MapPin, Users, ArrowRight, QrCode, ShieldCheck,
  Utensils, Menu, X, ChevronRight, CheckCircle2, Ticket, Plus, LayoutDashboard,
  ClipboardList, Search, Bell, LogIn, Smartphone, Sparkles, AlertTriangle,
  CircleCheck, CalendarPlus, UserRound, ExternalLink, Copy, ChevronDown
} from 'lucide-react'
import './styles.css'

const STORAGE_KEY = 'weddingslot-prototype-v1'
const seedEvents = [
  {
    id: 'evt-arati',
    title: 'সাহেবের বিবাহ অনুষ্ঠান',
    host: 'পরিবারের পক্ষ থেকে',
    date: '2026-12-12',
    time: 'দুপুর ১২টা – বিকেল ৩টা',
    venue: 'আরতি গ্রাম, পশ্চিম বর্ধমান',
    description: 'আপনার সুবিধামতো খাবারের সময় বেছে নিন। নির্ধারিত স্লটে এসে ভিড় এড়িয়ে খাবার উপভোগ করুন।',
    status: 'approved',
    capacity: 80,
    slotMinutes: 30,
    slots: [
      { id: 's1', label: '12:00 PM – 12:30 PM', capacity: 80 },
      { id: 's2', label: '12:30 PM – 1:00 PM', capacity: 80 },
      { id: 's3', label: '1:00 PM – 1:30 PM', capacity: 80 },
      { id: 's4', label: '1:30 PM – 2:00 PM', capacity: 80 },
      { id: 's5', label: '2:00 PM – 2:30 PM', capacity: 80 },
      { id: 's6', label: '2:30 PM – 3:00 PM', capacity: 80 }
    ]
  },
  {
    id: 'evt-demo',
    title: 'WeddingSlot Demo Event',
    host: 'WeddingSlot Demo',
    date: '2026-12-20',
    time: 'সন্ধ্যা ৬টা – রাত ৯টা',
    venue: 'দুর্গাপুর, পশ্চিম বর্ধমান',
    description: 'এটি শুধু অ্যাপের ফিচার দেখানোর জন্য তৈরি ডেমো অনুষ্ঠান।',
    status: 'approved',
    capacity: 60,
    slotMinutes: 30,
    slots: [
      { id: 'd1', label: '6:00 PM – 6:30 PM', capacity: 60 },
      { id: 'd2', label: '6:30 PM – 7:00 PM', capacity: 60 },
      { id: 'd3', label: '7:00 PM – 7:30 PM', capacity: 60 },
      { id: 'd4', label: '7:30 PM – 8:00 PM', capacity: 60 },
      { id: 'd5', label: '8:00 PM – 8:30 PM', capacity: 60 },
      { id: 'd6', label: '8:30 PM – 9:00 PM', capacity: 60 }
    ]
  }
]

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (parsed && Array.isArray(parsed.events) && Array.isArray(parsed.bookings)) return parsed
  } catch {}
  return { events: seedEvents, bookings: [], applications: [] }
}
function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}
function formatDate(date) {
  if (!date) return 'তারিখ নির্ধারিত নয়'
  return new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00`))
}
function makeCode() {
  return `WS-${Math.random().toString(36).slice(2, 5).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}
function App() {
  const [state, setState] = useState(loadState)
  const [page, setPage] = useState('home')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [guestName, setGuestName] = useState('')
  const [phone, setPhone] = useState('')
  const [partySize, setPartySize] = useState('2')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [lastBooking, setLastBooking] = useState(null)
  const [adminTab, setAdminTab] = useState('overview')
  const [newEvent, setNewEvent] = useState({ title: '', host: '', date: '', venue: '', capacity: '80', start: '12:00', end: '15:00' })

  useEffect(() => saveState(state), [state])
  const approvedEvents = state.events.filter(e => e.status === 'approved')
  const filteredEvents = approvedEvents.filter(e => `${e.title} ${e.venue} ${e.host}`.toLowerCase().includes(search.toLowerCase()))
  const bookingCount = state.bookings.length
  const guestCount = state.bookings.reduce((sum, b) => sum + Number(b.partySize || 0), 0)
  const checkinCount = state.bookings.filter(b => b.checkedIn).length

  function go(next) {
    setPage(next); setMenuOpen(false); setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function openEvent(event) {
    setSelectedEvent(event); setSelectedSlot(''); setGuestName(''); setPhone(''); setPartySize('2'); go('booking')
  }
  function getBooked(eventId, slotId) {
    return state.bookings.filter(b => b.eventId === eventId && b.slotId === slotId && b.status === 'confirmed').reduce((sum, b) => sum + Number(b.partySize), 0)
  }
  function confirmBooking(e) {
    e.preventDefault()
    if (!selectedEvent || !selectedSlot || !guestName.trim() || !/^[0-9+\-\s]{10,15}$/.test(phone.trim())) {
      setNotice('নাম, সঠিক মোবাইল নম্বর এবং খাবারের সময় নির্বাচন করুন।'); return
    }
    const count = Math.max(1, Math.min(20, Number(partySize) || 1))
    const slot = selectedEvent.slots.find(s => s.id === selectedSlot)
    const remaining = slot.capacity - getBooked(selectedEvent.id, selectedSlot)
    if (count > remaining) { setNotice(`এই স্লটে ${remaining} জনের জায়গা বাকি আছে।`); return }
    const booking = {
      id: makeCode(), eventId: selectedEvent.id, eventTitle: selectedEvent.title,
      slotId: selectedSlot, slotLabel: slot.label, guestName: guestName.trim(),
      phone: phone.trim(), partySize: count, status: 'confirmed',
      createdAt: new Date().toISOString(), checkedIn: false
    }
    setState(s => ({ ...s, bookings: [booking, ...s.bookings] }))
    setLastBooking(booking); go('ticket')
  }
  function submitEvent(e) {
    e.preventDefault()
    if (!newEvent.title.trim() || !newEvent.date || !newEvent.venue.trim()) {
      setNotice('অনুষ্ঠানের নাম, তারিখ এবং স্থান পূরণ করুন।'); return
    }
    const slots = []
    const toMinutes = (v) => { const [h, m] = v.split(':').map(Number); return h * 60 + m }
    const start = toMinutes(newEvent.start), end = toMinutes(newEvent.end)
    if (end <= start || end - start > 720) { setNotice('শেষ সময় শুরুর সময়ের পরে হতে হবে।'); return }
    let cursor = start, idx = 1
    while (cursor < end && idx <= 24) {
      const next = Math.min(cursor + 30, end)
      const fmt = mins => {
        const h = Math.floor(mins / 60), m = mins % 60
        const ap = h >= 12 ? 'PM' : 'AM', hh = h % 12 || 12
        return `${hh}:${String(m).padStart(2, '0')} ${ap}`
      }
      slots.push({ id: `new-${Date.now()}-${idx}`, label: `${fmt(cursor)} – ${fmt(next)}`, capacity: Math.max(1, Number(newEvent.capacity) || 1) })
      cursor = next; idx++
    }
    const event = {
      id: `evt-${Date.now()}`, title: newEvent.title.trim(), host: newEvent.host.trim() || 'নতুন আয়োজক',
      date: newEvent.date, time: `${newEvent.start} – ${newEvent.end}`, venue: newEvent.venue.trim(),
      description: 'আয়োজকের জমা দেওয়া অনুষ্ঠান। Super Admin অনুমোদন না করা পর্যন্ত বুকিং চালু হবে না।',
      status: 'pending', capacity: Math.max(1, Number(newEvent.capacity) || 1), slotMinutes: 30, slots
    }
    setState(s => ({ ...s, events: [event, ...s.events] }))
    setNewEvent({ title: '', host: '', date: '', venue: '', capacity: '80', start: '12:00', end: '15:00' })
    setNotice('অনুষ্ঠানটি অনুমোদনের জন্য জমা হয়েছে।'); setAdminTab('events')
  }
  function approveEvent(id) {
    setState(s => ({ ...s, events: s.events.map(e => e.id === id ? { ...e, status: 'approved' } : e) }))
  }
  function cancelBooking(id) {
    setState(s => ({ ...s, bookings: s.bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b) }))
  }
  function checkinBooking(id) {
    setState(s => ({ ...s, bookings: s.bookings.map(b => b.id === id ? { ...b, checkedIn: true } : b) }))
  }
  function resetDemo() {
    if (window.confirm('এই ব্রাউজারের WeddingSlot ডেমো ডেটা মুছে শুরু থেকে চালাবেন?')) {
      const fresh = { events: seedEvents, bookings: [], applications: [] }
      setState(fresh); setLastBooking(null); setNotice('ডেমো ডেটা রিসেট হয়েছে।')
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => go('home')} aria-label="WeddingSlot home">
          <span className="brand-mark"><Utensils size={19}/><span className="brand-dot"/></span>
          <span className="brand-copy"><strong>WeddingSlot</strong><small>SMART MEAL BOOKING</small></span>
        </button>
        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <button className={page === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => go('home')}>হোম</button>
          <button className={page === 'how' ? 'nav-link active' : 'nav-link'} onClick={() => go('how')}>কীভাবে কাজ করে</button>
          <button className={page === 'admin' ? 'nav-link active' : 'nav-link'} onClick={() => go('admin')}>অ্যাডমিন ডেমো</button>
          <button className="button button-small button-dark" onClick={() => go('create')}><Plus size={16}/> অনুষ্ঠান তৈরি</button>
        </nav>
        <button className="icon-button mobile-menu" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">{menuOpen ? <X/> : <Menu/>}</button>
      </header>

      {notice && <div className="notice" role="status"><AlertTriangle size={17}/><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Close"><X size={16}/></button></div>}

      {page === 'home' && <main>
        <section className="hero">
          <div className="hero-glow glow-one"/><div className="hero-glow glow-two"/>
          <div className="hero-content">
            <span className="eyebrow"><Sparkles size={15}/> বিয়েবাড়ির স্মার্ট অভিজ্ঞতা</span>
            <h1>ভিড় নয়,<br/><em>সময় মেনে</em> খাওয়া।</h1>
            <p>আগে থেকে খাবারের সময় বুক করুন। নির্ধারিত স্লটে প্যান্ডেলে যান, পরিবারকে সঙ্গে নিয়ে স্বচ্ছন্দে খাবার উপভোগ করুন।</p>
            <div className="hero-actions">
              <button className="button button-lime" onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}>অনুষ্ঠান খুঁজুন <ArrowRight size={17}/></button>
              <button className="button button-outline" onClick={() => go('how')}>কীভাবে কাজ করে</button>
            </div>
            <div className="hero-points"><span><CheckCircle2 size={15}/> সহজ বুকিং</span><span><CheckCircle2 size={15}/> পরিবারের জন্য</span><span><CheckCircle2 size={15}/> QR বুকিং পাস</span></div>
          </div>
          <div className="hero-visual">
            <div className="ticket-card">
              <div className="ticket-top"><span className="ticket-icon"><Utensils size={18}/></span><span className="ticket-status"><i/> BOOKING OPEN</span></div>
              <div className="ticket-label">YOUR NEXT EVENT</div>
              <h3>সাহেবের বিবাহ অনুষ্ঠান</h3>
              <div className="ticket-meta"><span><CalendarDays size={15}/> ১২ ডিসেম্বর ২০২৬</span><span><MapPin size={15}/> আরতি গ্রাম</span></div>
              <div className="ticket-dash"/>
              <div className="ticket-bottom"><div><small>MEAL TIME</small><strong>12:30 – 1:00 PM</strong><span>২ জন অতিথি</span></div><div className="fake-qr" aria-label="Demo QR pattern"><span/><span/><span/><span/><span/><span/><span/><span/><span/></div></div>
              <div className="ticket-footer"><ShieldCheck size={14}/> ডিজিটাল বুকিং পাসের ডেমো</div>
            </div>
            <div className="float-chip chip-top"><span className="chip-icon"><Clock3 size={16}/></span><span><strong>আপনার সময়</strong><small>আগে থেকেই নির্ধারিত</small></span></div>
            <div className="float-chip chip-bottom"><span className="avatar-stack"><i>অ</i><i>প</i><i>+</i></span><span><strong>পরিবারের বুকিং</strong><small>একসঙ্গে আসুন</small></span></div>
          </div>
          <div className="hero-index">01 <span/> SMART WEDDING EXPERIENCE</div>
        </section>

        <section className="stats-strip">
          <div><span className="stat-icon"><CalendarDays size={18}/></span><span><strong>সহজ বুকিং</strong><small>কয়েকটি ধাপেই সম্পন্ন</small></span></div>
          <div><span className="stat-icon"><Users size={18}/></span><span><strong>পরিবারবান্ধব</strong><small>এক বুকিংয়ে একাধিক অতিথি</small></span></div>
          <div><span className="stat-icon"><QrCode size={18}/></span><span><strong>QR বুকিং পাস</strong><small>দ্রুত যাচাইয়ের পরিকল্পনা</small></span></div>
          <div><span className="stat-icon"><ShieldCheck size={18}/></span><span><strong>নিয়ন্ত্রিত স্লট</strong><small>ধারণক্ষমতা অনুযায়ী বুকিং</small></span></div>
        </section>

        <section className="section events-section" id="events">
          <div className="section-heading"><div><span className="eyebrow eyebrow-green">BOOK YOUR MEAL</span><h2>আসন্ন অনুষ্ঠান</h2><p>আপনার আমন্ত্রণের অনুষ্ঠান খুঁজে সময় বেছে নিন।</p></div><div className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="অনুষ্ঠান বা স্থান খুঁজুন"/></div></div>
          <div className="event-grid">
            {filteredEvents.map((event, i) => <article className="event-card" key={event.id}>
              <div className={`event-art art-${i % 2}`}><span className="art-tag"><CircleCheck size={13}/> অনুমোদিত ডেমো</span><div className="art-ornament"><span/><span/><span/></div><div className="art-monogram">W<span>S</span></div><div className="art-caption">A DAY TO CELEBRATE</div></div>
              <div className="event-card-body"><div className="event-host">{event.host}</div><h3>{event.title}</h3><div className="event-info"><span><CalendarDays size={15}/>{formatDate(event.date)}</span><span><MapPin size={15}/>{event.venue}</span></div><p>{event.description}</p><div className="event-card-bottom"><span className="slot-count"><Clock3 size={15}/>{event.slots.length}টি সময়ের স্লট</span><button className="button button-dark" onClick={() => openEvent(event)}>সময় বেছে নিন <ArrowRight size={16}/></button></div></div>
            </article>)}
            {filteredEvents.length === 0 && <div className="empty-state"><Search size={28}/><strong>কোনো অনুষ্ঠান পাওয়া যায়নি</strong><span>অন্য নাম বা স্থান দিয়ে খুঁজুন।</span></div>}
          </div>
          <div className="demo-warning"><AlertTriangle size={17}/><span><strong>প্রোটোটাইপ:</strong> এখানে দেখানো অনুষ্ঠান ও বুকিং ডেটা উদাহরণ। এগুলি বাস্তব আমন্ত্রণ নয়।</span></div>
        </section>

        <section className="section steps-section"><div className="section-heading centered"><div><span className="eyebrow eyebrow-green">THREE SIMPLE STEPS</span><h2>বুকিং হবে সহজ</h2><p>অতিথির জন্য কম ধাপ, আয়োজকের জন্য পরিষ্কার ব্যবস্থাপনা।</p></div></div><div className="steps-grid"><div className="step-card"><span className="step-number">01</span><div className="step-icon"><QrCode size={24}/></div><h3>অনুষ্ঠান খুলুন</h3><p>আমন্ত্রণের QR স্ক্যান করুন অথবা অ্যাপ থেকে অনুষ্ঠান বেছে নিন।</p></div><div className="step-card"><span className="step-number">02</span><div className="step-icon"><Clock3 size={24}/></div><h3>সময় বেছে নিন</h3><p>খালি স্লট, অতিথির সংখ্যা এবং বুকিংয়ের তথ্য দিন।</p></div><div className="step-card"><span className="step-number">03</span><div className="step-icon"><Ticket size={24}/></div><h3>পাস দেখান</h3><p>বুকিংয়ের তথ্য সংরক্ষণ করুন এবং নির্ধারিত সময়ে পৌঁছান।</p></div></div></section>
        <section className="cta-band"><div><span className="eyebrow">FOR EVENT ORGANIZERS</span><h2>আপনার অনুষ্ঠানেও আনুন<br/>আরও সুন্দর ব্যবস্থাপনা।</h2><p>অনুষ্ঠান তৈরি করুন এবং অনুমোদনের জন্য জমা দিন।</p></div><button className="button button-lime" onClick={() => go('create')}>অনুষ্ঠান তৈরি করুন <ArrowRight size={17}/></button></section>
      </main>}

      {page === 'booking' && selectedEvent && <main className="inner-page">
        <button className="back-link" onClick={() => go('home')}>← অনুষ্ঠানগুলিতে ফিরে যান</button>
        <div className="booking-layout">
          <section className="booking-main">
            <span className="eyebrow eyebrow-green">MEAL SLOT RESERVATION</span><h1 className="page-title">{selectedEvent.title}</h1>
            <div className="booking-event-meta"><span><CalendarDays size={16}/>{formatDate(selectedEvent.date)}</span><span><MapPin size={16}/>{selectedEvent.venue}</span></div>
            <div className="form-panel"><div className="form-heading"><span className="form-step">01</span><div><h2>খাবারের সময় বেছে নিন</h2><p>প্রতি স্লটে অতিথির সংখ্যা সীমিত।</p></div></div>
              <div className="slot-grid">{selectedEvent.slots.map(slot => { const remaining = slot.capacity - getBooked(selectedEvent.id, slot.id); const full = remaining <= 0; return <button type="button" key={slot.id} disabled={full} onClick={() => setSelectedSlot(slot.id)} className={`slot-option ${selectedSlot === slot.id ? 'slot-selected' : ''} ${full ? 'slot-full' : ''}`}><span className="slot-radio">{selectedSlot === slot.id && <i/>}</span><span className="slot-text"><strong>{slot.label}</strong><small>{full ? 'স্লট পূর্ণ' : `${remaining} জনের জায়গা বাকি`}</small></span><span className="slot-arrow"><ChevronRight size={17}/></span></button>})}</div>
            </div>
            <form className="form-panel" onSubmit={confirmBooking}><div className="form-heading"><span className="form-step">02</span><div><h2>আপনার বুকিংয়ের তথ্য</h2><p>অ্যাকাউন্ট খোলার প্রয়োজন নেই।</p></div></div>
              <div className="field-grid"><label className="field full-field">অতিথির নাম<input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="আপনার পুরো নাম" required maxLength={80}/></label><label className="field">মোবাইল নম্বর<input type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10 digit mobile number" required maxLength={15}/><small>এই ডেমোতে OTP যাচাই নেই।</small></label><label className="field">মোট অতিথি<select value={partySize} onChange={e => setPartySize(e.target.value)}>{Array.from({length:20},(_,i)=><option key={i+1} value={i+1}>{i+1} জন</option>)}</select></label></div>
              <div className="privacy-note"><ShieldCheck size={17}/><span>বাস্তব ব্যবহারের আগে নিরাপদ সার্ভার, গোপনীয়তা নীতি এবং বুকিং যাচাই যুক্ত করতে হবে।</span></div>
              <button className="button button-dark button-wide" type="submit">বুকিং নিশ্চিত করুন <ArrowRight size={17}/></button>
            </form>
          </section>
          <aside className="booking-aside"><div className="summary-card"><span className="summary-kicker">YOUR EVENT</span><div className="summary-symbol"><Utensils size={24}/></div><h3>{selectedEvent.title}</h3><div className="summary-line"><CalendarDays size={16}/><span>{formatDate(selectedEvent.date)}</span></div><div className="summary-line"><MapPin size={16}/><span>{selectedEvent.venue}</span></div><div className="summary-line"><Clock3 size={16}/><span>{selectedSlot ? selectedEvent.slots.find(s=>s.id===selectedSlot)?.label : 'সময় নির্বাচন করুন'}</span></div><div className="summary-divider"/><div className="summary-line"><Users size={16}/><span>{partySize} জন অতিথি</span></div><div className="summary-foot"><ShieldCheck size={15}/> ডেমো বুকিং — কোনো পেমেন্ট নেই</div></div><div className="aside-tip"><Sparkles size={18}/><div><strong>একটি ছোট পরামর্শ</strong><p>আপনার পরিবারের সবাইকে একই বুকিংয়ে অন্তর্ভুক্ত করুন, যাতে একই স্লটে জায়গা নেওয়া যায়।</p></div></div></aside>
        </div>
      </main>}

      {page === 'ticket' && lastBooking && <main className="inner-page ticket-page"><div className="success-mark"><CheckCircle2 size={34}/></div><span className="eyebrow eyebrow-green">DEMO BOOKING CREATED</span><h1 className="page-title">বুকিং তৈরি হয়েছে!</h1><p className="page-subtitle">এটি এই ব্রাউজারে সংরক্ষিত একটি ডেমো বুকিং। বাস্তব বুকিং হিসেবে ব্যবহার করবেন না।</p><div className="confirmed-ticket"><div className="confirmed-head"><div><span>WEDDINGSLOT PASS</span><h2>{lastBooking.eventTitle}</h2></div><span className="confirmed-icon"><Ticket size={22}/></span></div><div className="confirmed-details"><div><small>বুকিং নম্বর</small><strong>{lastBooking.id}</strong></div><div><small>অতিথির নাম</small><strong>{lastBooking.guestName}</strong></div><div><small>খাবারের সময়</small><strong>{lastBooking.slotLabel}</strong></div><div><small>অতিথির সংখ্যা</small><strong>{lastBooking.partySize} জন</strong></div></div><div className="qr-ticket-area"><div className="fake-qr big-qr"><span/><span/><span/><span/><span/><span/><span/><span/><span/></div><div><strong>ডেমো QR প্যাটার্ন</strong><p>এটি স্ক্যানযোগ্য বা নিরাপদ QR কোড নয়।</p><span className="status-pill"><CheckCircle2 size={13}/> {lastBooking.status === 'confirmed' ? 'Confirmed (Demo)' : lastBooking.status}</span></div></div><button className="button button-dark button-wide" onClick={() => { navigator.clipboard?.writeText(`WeddingSlot Demo Booking\n${lastBooking.id}\n${lastBooking.eventTitle}\n${lastBooking.guestName}\n${lastBooking.slotLabel}\n${lastBooking.partySize} guests`).then(()=>setNotice('বুকিংয়ের সারাংশ কপি হয়েছে।')).catch(()=>setNotice('কপি করা যায়নি; বুকিং নম্বরটি লিখে রাখুন।')) }}> <Copy size={16}/> বুকিংয়ের সারাংশ কপি করুন</button></div><button className="back-link" onClick={() => go('home')}>← হোমে ফিরে যান</button></main>}

      {page === 'how' && <main className="inner-page"><span className="eyebrow eyebrow-green">HOW IT WORKS</span><h1 className="page-title">ভিড় কমানোর সহজ পরিকল্পনা</h1><p className="page-subtitle">WeddingSlot খাবারের সময় আগে থেকে ভাগ করে অতিথিদের প্রবাহ সামলানোর ধারণার উপর তৈরি।</p><div className="how-grid"><article><div className="how-icon"><QrCode/></div><h3>১. QR বা অ্যাপ</h3><p>অতিথি আমন্ত্রণের QR স্ক্যান করে ওয়েবসাইট খুলবেন অথবা Android অ্যাপ ব্যবহার করবেন।</p></article><article><div className="how-icon"><Clock3/></div><h3>২. স্লট নির্বাচন</h3><p>অতিথিরা খালি সময় বেছে নেবেন। বুকিংয়ের সীমা প্যান্ডেলের ধারণক্ষমতা অনুযায়ী নির্ধারিত হবে।</p></article><article><div className="how-icon"><Users/></div><h3>৩. পরিবারের বুকিং</h3><p>এক বুকিংয়ে একাধিক অতিথি যুক্ত করলে একই স্লটে একসঙ্গে জায়গা পরিকল্পনা করা সহজ হয়।</p></article><article><div className="how-icon"><ShieldCheck/></div><h3>৪. প্রবেশ যাচাই</h3><p>পরবর্তী সংস্করণে কর্মীরা নিরাপদ QR স্ক্যান করে বুকিং যাচাই ও একবারের চেক-ইন নিশ্চিত করবেন।</p></article></div><div className="demo-warning"><AlertTriangle size={18}/><span>এই সংস্করণটি শুধু UI প্রোটোটাইপ। আসল QR যাচাই, একাধিক ডিভাইসে লাইভ ডেটা এবং নিরাপদ লগইন পরে ব্যাকএন্ড দিয়ে যোগ করতে হবে।</span></div></main>}

      {page === 'create' && <main className="inner-page narrow-page"><span className="eyebrow eyebrow-green">ORGANIZER PORTAL · DEMO</span><h1 className="page-title">নতুন অনুষ্ঠান তৈরি করুন</h1><p className="page-subtitle">অনুষ্ঠানের তথ্য দিন। এই প্রোটোটাইপে অনুষ্ঠানটি Pending হিসেবে যোগ হবে; বাস্তবে Super Admin অনুমোদনের পরে প্রকাশিত হবে।</p><form className="form-panel create-form" onSubmit={submitEvent}><div className="field-grid"><label className="field full-field">অনুষ্ঠানের নাম<input value={newEvent.title} onChange={e=>setNewEvent({...newEvent,title:e.target.value})} placeholder="যেমন: বিবাহ অনুষ্ঠান" required maxLength={100}/></label><label className="field">আয়োজকের নাম<input value={newEvent.host} onChange={e=>setNewEvent({...newEvent,host:e.target.value})} placeholder="আপনার নাম" maxLength={80}/></label><label className="field">অনুষ্ঠানের তারিখ<input type="date" value={newEvent.date} onChange={e=>setNewEvent({...newEvent,date:e.target.value})} required/></label><label className="field full-field">স্থান<input value={newEvent.venue} onChange={e=>setNewEvent({...newEvent,venue:e.target.value})} placeholder="গ্রাম, শহর বা ভেন্যু" required maxLength={160}/></label><label className="field">প্রতি স্লটে অতিথি<input type="number" min="1" max="1000" value={newEvent.capacity} onChange={e=>setNewEvent({...newEvent,capacity:e.target.value})} required/></label><label className="field">স্লটের দৈর্ঘ্য<select value="30" disabled><option value="30">৩০ মিনিট (প্রোটোটাইপ)</option></select></label><label className="field">শুরুর সময়<input type="time" value={newEvent.start} onChange={e=>setNewEvent({...newEvent,start:e.target.value})} required/></label><label className="field">শেষ সময়<input type="time" value={newEvent.end} onChange={e=>setNewEvent({...newEvent,end:e.target.value})} required/></label></div><div className="privacy-note"><ShieldCheck size={17}/><span>ডেমোতে অনুমোদন বোতাম সরাসরি Admin Panel-এ আছে। বাস্তবে এটি নিরাপদ অ্যাডমিন অ্যাকাউন্টের মাধ্যমে নিয়ন্ত্রিত হবে।</span></div><button className="button button-dark button-wide" type="submit">অনুমোদনের জন্য জমা দিন <ArrowRight size={17}/></button></form></main>}

      {page === 'admin' && <main className="inner-page admin-page"><div className="admin-heading"><div><span className="eyebrow eyebrow-green">WEDDINGSLOT CONTROL CENTER</span><h1 className="page-title">Admin Dashboard</h1><p className="page-subtitle">এটি লগইনবিহীন ডেমো। বাস্তব সিস্টেমে অ্যাডমিন অথেনটিকেশন আবশ্যক।</p></div><button className="button button-light" onClick={resetDemo}>ডেমো রিসেট</button></div><div className="admin-stats"><div className="admin-stat"><span className="admin-stat-icon"><CalendarDays/></span><small>মোট অনুষ্ঠান</small><strong>{state.events.length}</strong><span>সব স্ট্যাটাস</span></div><div className="admin-stat"><span className="admin-stat-icon"><Ticket/></span><small>মোট বুকিং</small><strong>{bookingCount}</strong><span>এই ব্রাউজারে</span></div><div className="admin-stat"><span className="admin-stat-icon"><Users/></span><small>মোট অতিথি</small><strong>{guestCount}</strong><span>বুকিং অনুযায়ী</span></div><div className="admin-stat"><span className="admin-stat-icon"><CheckCircle2/></span><small>চেক-ইন ডেমো</small><strong>{checkinCount}</strong><span>লোকাল রেকর্ড</span></div></div><div className="admin-tabs"><button className={adminTab==='overview'?'selected':''} onClick={()=>setAdminTab('overview')}><LayoutDashboard size={16}/> ওভারভিউ</button><button className={adminTab==='events'?'selected':''} onClick={()=>setAdminTab('events')}><CalendarDays size={16}/> অনুষ্ঠান ({state.events.length})</button><button className={adminTab==='bookings'?'selected':''} onClick={()=>setAdminTab('bookings')}><ClipboardList size={16}/> বুকিং ({bookingCount})</button><button className={adminTab==='approvals'?'selected':''} onClick={()=>setAdminTab('approvals')}><ShieldCheck size={16}/> অনুমোদন ({state.events.filter(e=>e.status==='pending').length})</button></div>
          {(adminTab==='overview'||adminTab==='events') && <section className="admin-panel"><div className="panel-heading"><div><h2>অনুষ্ঠানসমূহ</h2><p>Pending অনুষ্ঠান অনুমোদন না হওয়া পর্যন্ত অতিথিদের তালিকায় দেখা যাবে না।</p></div><button className="button button-dark button-small" onClick={()=>go('create')}><Plus size={15}/> নতুন অনুষ্ঠান</button></div><div className="table-wrap"><table><thead><tr><th>অনুষ্ঠান</th><th>তারিখ</th><th>অবস্থা</th><th>কাজ</th></tr></thead><tbody>{state.events.map(ev=><tr key={ev.id}><td><strong>{ev.title}</strong><small>{ev.venue}</small></td><td>{formatDate(ev.date)}</td><td><span className={`status-pill ${ev.status==='approved'?'status-approved':'status-pending'}`}>{ev.status==='approved'?'অনুমোদিত':'অনুমোদনের অপেক্ষায়'}</span></td><td>{ev.status==='pending'?<button className="text-action" onClick={()=>approveEvent(ev.id)}>অনুমোদন করুন</button>:<span className="muted-text">প্রকাশিত (ডেমো)</span>}</td></tr>)}</tbody></table></div></section>}
          {adminTab==='approvals' && <section className="admin-panel"><div className="panel-heading"><div><h2>অনুমোদনের অপেক্ষায়</h2><p>প্রোটোটাইপে এই বোতাম দিয়ে অনুমোদন অনুকরণ করা যায়।</p></div></div>{state.events.filter(e=>e.status==='pending').length===0?<div className="empty-state"><CheckCircle2 size={28}/><strong>কোনো Pending অনুষ্ঠান নেই</strong><span>নতুন অনুষ্ঠান তৈরি করলে এখানে দেখা যাবে।</span><button className="button button-dark" onClick={()=>go('create')}>অনুষ্ঠান তৈরি</button></div>:state.events.filter(e=>e.status==='pending').map(ev=><div className="approval-row" key={ev.id}><div><strong>{ev.title}</strong><span>{ev.venue} · {formatDate(ev.date)}</span></div><button className="button button-dark button-small" onClick={()=>approveEvent(ev.id)}>অনুমোদন করুন</button></div>)}</section>}
          {adminTab==='bookings' && <section className="admin-panel"><div className="panel-heading"><div><h2>বুকিং তালিকা</h2><p>শুধু এই ব্রাউজারে তৈরি ডেমো বুকিং।</p></div></div>{state.bookings.length===0?<div className="empty-state"><Ticket size={28}/><strong>এখনও বুকিং নেই</strong><span>হোম পেজ থেকে একটি ডেমো বুকিং তৈরি করুন।</span><button className="button button-dark" onClick={()=>go('home')}>অনুষ্ঠান দেখুন</button></div>:<div className="table-wrap"><table><thead><tr><th>অতিথি</th><th>অনুষ্ঠান / স্লট</th><th>অতিথি সংখ্যা</th><th>স্ট্যাটাস</th><th>চেক-ইন</th></tr></thead><tbody>{state.bookings.map(b=><tr key={b.id}><td><strong>{b.guestName}</strong><small>{b.phone}</small><small>{b.id}</small></td><td><strong>{b.eventTitle}</strong><small>{b.slotLabel}</small></td><td>{b.partySize} জন</td><td><span className={`status-pill ${b.status==='confirmed'?'status-approved':'status-pending'}`}>{b.status==='confirmed'?'নিশ্চিত':'বাতিল'}</span></td><td>{b.checkedIn?<span className="status-pill status-approved">চেক-ইন হয়েছে</span>:b.status==='confirmed'?<button className="text-action" onClick={()=>checkinBooking(b.id)}>ডেমো চেক-ইন</button>:<span>—</span>}</td></tr>)}</tbody></table></div>}</section>}
          <div className="demo-warning"><AlertTriangle size={18}/><span>নিরাপত্তা সতর্কতা: এই Admin Panel-এ লগইন নেই এবং ব্রাউজার ডেটা পরিবর্তনযোগ্য। বাস্তব অনুষ্ঠানে ব্যবহারের আগে সার্ভার-ভিত্তিক অনুমতি ও ডেটাবেস আবশ্যক।</span></div>
        </main>}

      <footer className="footer"><div className="footer-brand"><span className="brand-mark"><Utensils size={18}/></span><span><strong>WeddingSlot</strong><small>Make every gathering smoother.</small></span></div><span className="footer-copy">© 2026 WeddingSlot · Frontend Prototype</span><div className="footer-links"><button onClick={()=>go('how')}>কীভাবে কাজ করে</button><button onClick={()=>go('admin')}>Admin Demo</button></div></footer>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>)
