import React, { useRef } from 'react';
import { Modal } from '../ui/primitives';
import { useTranslation } from 'react-i18next';
import { Download, } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface IdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalType?: string;
  user: {
    name: string;
    id: string;
    currentPlan?: string;
    profile_image_path?: string;
    mobile?: string;
    joining_date?: number;
    latest_subscription_details?: {
      subscription_id?: string;
      subscription_name?: string;
      start_date?: number | string;
      end_date?: number | string;
      status?: boolean;
    } | null;
    qr_url?: string;
    metadata?: {
      dob?: number;
      gender?: string;
      fitness_goal?: string;
      profile_image_path?: string;
      emergency_contact?: string;
      workout_time?: string;
    };
    role?: string;
  };
}

import { useGymStore } from '../../store/gymStore';

export const IdCardModal: React.FC<IdCardModalProps> = ({ isOpen, onClose, user, portalType }) => {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const { publicAppConfig } = useGymStore();
  const brandName = publicAppConfig?.brand_name || "ForgeFit";
  const brandLogo = publicAppConfig?.logo_image_path;

  const handlePrint = () => {
    const printContent = cardRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>{brandName} - ID Card - ${user.name}</title>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
          <style>
            body { margin: 0; padding: 20px; display: flex; justify-content: center; }
            ${idCardStyles}
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = () => {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = async () => {
    if (cardRef.current) {
      const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 1.0, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${brandName.replace(/\s+/g, '_')}_ID_${(user.name || 'Member').replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const formatDate = (ts?: number) => {
    if (!ts) return "N/A";
    return new Date(ts * 1000).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const formatValidTill = (ts?: number | string) => {
    if (!ts) return "N/A";
    const d = new Date(Number(ts) * 1000);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatFitnessGoal = (raw?: string) => {
    if (!raw) return "Fitness";
    return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const role = user.role?.toLowerCase() || 'user';
  const isUser = role === "user";
  const username = (user as any).username || (user.id ? user.id.split("-")[0].toUpperCase() : 'MEMBER');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
      className="!bg-transparent !border-none !shadow-none"
    >
      <div className="flex flex-col items-center py-6">
        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] mb-8">
          {brandName} Gym Portal · Member ID Card
        </div>

        {/* Action Buttons at Top (Accessibility Fix) */}
        <div className="flex gap-4 w-full justify-center mb-10">
          <button
            onClick={handlePrint}
            className="px-8 md:px-10 h-14 rounded-xl text-[11px] font-black uppercase tracking-widest bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] hover:scale-105 transition-all border border-[var(--border-subtle)]"
          >
            {t("print") || "Print Card"}
          </button>
          <button
            onClick={handleDownload}
            className="px-6 h-14 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[var(--text-primary)] text-[var(--bg-card)] transition-all flex items-center justify-center border border-transparent hover:border-[var(--accent-orange)]"
            title="Download Image"
          >
            <Download size={18} />
          </button>
        </div>

        {/* The Card */}
        <div ref={cardRef} className="id-card-render-container">
          <style>{idCardStyles}</style>
          <div className="card" id="card">

            {/* ── DARK TOP SECTION ── */}
            <div className="card-top">
              {/* Logo */}
              <div className="logo-row">
                <div className="logo-left">
                  <div className="flame-wrap overflow-hidden">
                    {brandLogo ? (
                      <img src={brandLogo} alt="Logo" className="h-full w-full object-contain" />
                    ) : (
                      <svg width="26" height="28" viewBox="0 0 26 28" fill="none">
                        <path d="M13 1C11.5 5 9.5 7 10.5 11C8.5 9 8.5 6 9.5 4C6 8 5 13 8 16.5C6.5 15.5 5.5 13.5 6 12C4 15 5 20 9.5 21.5C8 21 7 19 7.5 17.5C6 20 7 24.5 11.5 26L14.5 26C19 24.5 20 20 18.5 17.5C19 19 18 21 16.5 21.5C21 20 22 15 20 12C20.5 13.5 19.5 15.5 18 16.5C21 13 20 8 16.5 4C17.5 6 17.5 9 15.5 11C16.5 7 14.5 5 13 1Z" fill="url(#fg)" />
                        <defs>
                          <linearGradient id="fg" x1="13" y1="1" x2="13" y2="26" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="55%" stopColor="#f07040" />
                            <stop offset="100%" stopColor="#e8501a" />
                          </linearGradient>
                        </defs>
                      </svg>
                    )}
                  </div>
                  <div className="logo-text-block">
                    <div className="logo-wordmark">{brandName}</div>
                    <div className="logo-sub">{publicAppConfig?.description || "Strength · Performance · Results"}</div>
                  </div>
                </div>
                <div className="id-badge">{(user.role?.toUpperCase() || 'USER')}</div>
              </div>

              {/* Profile */}
              <div className="profile-area">
                <div className="avatar-ring">
                  <div className="avatar-inner">
                    {(user.profile_image_path || user.metadata?.profile_image_path) ? (
                      <img src={user.profile_image_path || user.metadata?.profile_image_path} alt="Photo" style={{ display: 'block' }} />
                    ) : (
                      <svg width="56" height="68" viewBox="0 0 56 68" fill="none">
                        <circle cx="28" cy="22" r="15" fill="rgba(255,255,255,0.18)" />
                        <path d="M2 68C2 50 54 50 54 68" fill="rgba(255,255,255,0.18)" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="hero-info">
                  <div className="hero-name">{(user.name || '').length > 21 ? (user.name || '').slice(0, 21) + '...' : user.name}</div>
                  <div className="status-row">
                    <span className="tag tag-teal">● Active</span>
                    {isUser && user.metadata?.gender && (
                      <span className="tag tag-orange" style={{ textTransform: 'capitalize' }}>{user.metadata.gender}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Wave transition */}
            <div className="wave-divider">
              <svg viewBox="0 0 400 28" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0 Q100 28 200 14 Q300 0 400 22 L400 28 L0 28Z" fill="#faf9f4" />
              </svg>
            </div>

            {/* ── BODY ── */}
            <div className="card-body">
              {/* QR Code Section (Centered & Large) */}
              <div className="qr-center-wrapper">
                <div className="qr-frame-lg">
                  {user.qr_url ? (
                    <img src={user.qr_url} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <QrSvg value={JSON.stringify({
                      user_id: user.id,
                      subscription_id: user.latest_subscription_details?.subscription_id || null,
                      subscription_name: user.latest_subscription_details?.subscription_name || null,
                      start_date: user.latest_subscription_details?.start_date || null,
                      end_date: user.latest_subscription_details?.end_date || null,
                    })} />
                  )}
                </div>
                <div className="qr-info-center">
                  <div className="qr-code-id">{username}</div>
                  <div className="qr-status">
                    <span className="live-dot"></span> Valid Member
                  </div>
                </div>
              </div>

              {/* Membership Tier */}
              {isUser && user.latest_subscription_details && (
                <div className="tier-panel-wide">
                  <div className="tier-icon-wrap">
                    <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                      <path d="M2 18 L4 8 L9 14 L14 2 L19 14 L24 8 L26 18Z" fill="#c9922a" opacity="0.9" />
                      <rect x="2" y="18" width="24" height="3" rx="1.5" fill="#c9922a" />
                      <circle cx="2" cy="8" r="2" fill="#c9922a" />
                      <circle cx="14" cy="2" r="2" fill="#c9922a" />
                      <circle cx="26" cy="8" r="2" fill="#c9922a" />
                    </svg>
                  </div>
                  <div className="tier-text-stack">
                    <div className="tier-label-sm">Membership Plan</div>
                    <div className="tier-name">{user.latest_subscription_details.subscription_name || 'N/A'}</div>
                  </div>
                </div>
              )}

              {/* Detail cells — role-aware */}
              <div className="details-grid">
                {!isUser ? (
                  <>
                    <div className="detail-cell">
                      <div className="d-label">Date of Birth</div>
                      <div className="d-value">{formatDate(user.metadata?.dob)}</div>
                    </div>
                    <div className="detail-cell">
                      <div className="d-label">Gender</div>
                      <div className="d-value accent" style={{ textTransform: 'capitalize' }}>{user.metadata?.gender || 'N/A'}</div>
                    </div>
                    <div className="detail-cell">
                      <div className="d-label">Mobile</div>
                      <div className="d-value">{user.mobile || 'N/A'}</div>
                    </div>
                    <div className="detail-cell">
                      <div className="d-label">Emergency</div>
                      <div className="d-value">{user.metadata?.emergency_contact || 'N/A'}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="detail-cell">
                      <div className="d-label">Contact / Emergency</div>
                      <div className="d-value">
                        {user.mobile || 'N/A'}
                        {user.metadata?.emergency_contact ? ` / ${user.metadata.emergency_contact}` : ''}
                      </div>
                    </div>
                    <div className="detail-cell">
                      <div className="d-label">Workout Time</div>
                      <div className="d-value" style={{ textTransform: 'capitalize' }}>{user.metadata?.workout_time || 'N/A'}</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── FOOTER STRIP ── */}
            <div className="card-footer">
              <div className="footer-text">{(publicAppConfig as any)?.website || 'gymportal.in'} &nbsp;·&nbsp; strength begins here</div>
              <div className="footer-dots">
                <div className="footer-dot"></div>
                <div className="footer-dot"></div>
                <div className="footer-dot"></div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </Modal>
  );
};

const QrSvg = ({ value }: { value: string }) => {
  // Simple deterministic pseudo-QR generator matching user's design
  const total = 78, cell = 6, cols = Math.floor(total / cell);
  const fixed = new Set<string>();

  let seed = 0;
  for (let c of value) seed = (seed * 31 + c.charCodeAt(0)) & 0xffffffff;
  const rng = () => { seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; };

  const addFinder = (ox: number, oy: number) => {
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) fixed.add(`${ox + c},${oy + r}`);
  };
  addFinder(0, 0);
  addFinder(cols - 7, 0);
  addFinder(0, cols - 7);

  const rects: React.ReactNode[] = [];

  // Finder patterns
  const drawFinder = (ox: number, oy: number) => {
    rects.push(<rect key={`f-bg-${ox}-${oy}`} x={ox * cell} y={oy * cell} width={7 * cell} height={7 * cell} fill="#1c1410" />);
    rects.push(<rect key={`f-in-${ox}-${oy}`} x={(ox + 1) * cell} y={(oy + 1) * cell} width={5 * cell} height={5 * cell} fill="#fff" />);
    rects.push(<rect key={`f-dot-${ox}-${oy}`} x={(ox + 2) * cell} y={(oy + 2) * cell} width={3 * cell} height={3 * cell} fill="#1c1410" />);
  };
  drawFinder(0, 0);
  drawFinder(cols - 7, 0);
  drawFinder(0, cols - 7);

  for (let r = 0; r < cols; r++) {
    for (let c = 0; c < cols; c++) {
      if (!fixed.has(`${c},${r}`) && rng() > 0.45) {
        rects.push(<rect key={`c-${c}-${r}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#1c1410" />);
      }
    }
  }

  return (
    <svg viewBox="0 0 78 78" xmlns="http://www.w3.org/2000/svg" width="78" height="78">
      <rect width="78" height="78" fill="#fff" />
      {rects}
    </svg>
  );
};

const idCardStyles = `
  .id-card-render-container {
    --cream:#faf8f3;
    --paper:#f2ede3;
    --warm-white:#fff9f4;
    --ink:#1c1410;
    --ink-soft:#3d3028;
    --ink-muted:#7a6e64;
    --ink-faint:#b5ada4;
    --orange:#e8501a;
    --orange-lt:#f07040;
    --orange-pale:#fde8df;
    --teal:#1a6e6a;
    --teal-pale:#d6eeec;
    --gold:#c9922a;
    --gold-pale:#f5e8cc;
    --card-w:320px;
    font-family:'Outfit',sans-serif;
  }

  .card {
    width:var(--card-w);
    background:var(--warm-white);
    border-radius:24px;
    overflow:hidden;
    position:relative;
    box-shadow: 0 30px 60px rgba(80,50,20,0.22);
    text-align: left;
    display: flex;
    flex-direction: column;
  }

  .card-top {
    background: var(--ink);
    position:relative;
    overflow:hidden;
    padding:20px 24px 0;
  }

  .card-top::before {
    content:'';
    position:absolute;
    inset:0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 17 L60 35 L30 52 L0 35 L0 17Z' fill='none' stroke='rgba(255,255,255,0.04)' stroke-width='1'/%3E%3C/svg%3E");
    background-size:60px 52px;
  }

  .card-top::after {
    content:'';
    position:absolute;
    top:0;left:0;right:0;
    height:4px;
    background: linear-gradient(90deg, var(--orange) 0%, var(--orange-lt) 50%, transparent 100%);
  }

  .logo-row {
    display:flex;
    align-items:center;
    justify-content:space-between;
    position:relative;
    z-index:1;
  }

  .logo-left { display:flex; align-items:center; gap:12px; }
  
  .flame-wrap {
    width:44px;height:44px;
    background:rgba(232,80,26,0.15);
    border:1.5px solid rgba(232,80,26,0.35);
    border-radius:12px;
    display:flex;align-items:center;justify-content:center;
  }

  .logo-text-block { line-height:1; }

  .logo-wordmark {
    font-family:'Playfair Display',serif;
    font-size:24px;
    font-weight:900;
    color:#fff;
    letter-spacing:1px;
  }

  .logo-wordmark em { font-style:normal; color:var(--orange-lt); }

  .logo-sub {
    font-size:8px;
    letter-spacing:3px;
    color:rgba(255,255,255,0.35);
    text-transform:uppercase;
    margin-top:3px;
  }

  .id-badge {
    background:rgba(232,80,26,0.18);
    border:1px solid rgba(232,80,26,0.45);
    border-radius:20px;
    padding:5px 13px;
    font-size:9px;
    font-weight:600;
    letter-spacing:2px;
    color:var(--orange-lt);
    text-transform:uppercase;
  }

  .profile-area {
    position:relative;
    z-index:1;
    display:flex;
    align-items:center;
    gap:16px;
    padding:16px 24px 0;
  }

  .avatar-ring {
    width:80px; height:80px;
    border-radius:50%;
    background: conic-gradient(var(--orange) 0deg, var(--orange-lt) 120deg, rgba(232,80,26,0.2) 120deg);
    padding:3px;
    flex-shrink:0;
    position:relative;
    bottom:-1px;
  }

  .avatar-inner {
    width:100%; height:100%;
    border-radius:50%;
    overflow:hidden;
    background:var(--ink-soft);
    display:flex;align-items:center;justify-content:center;
  }

  .avatar-inner img { width:100%; height:100%; object-fit:cover; }

  .hero-info { padding-bottom:16px; flex:1; min-width:0; }

  .hero-name {
    font-family:'Playfair Display',serif;
    font-size:20px;
    font-weight:700;
    color:#fff;
    line-height:1.1;
    margin-bottom:5px;
    max-width:260px;
    word-wrap:break-word;
    overflow-wrap:break-word;
    white-space:normal;
  }

  @media (max-width: 340px) {
    .hero-name {
      font-size:16px;
      max-width:220px;
    }
  }

  .hero-id {
    font-family:'JetBrains Mono',monospace;
    font-size:11px;
    color:var(--orange-lt);
    letter-spacing:2px;
    margin-bottom:10px;
  }

  .status-row { display:flex; gap:6px; flex-wrap:wrap; }

  .tag {
    display:inline-flex;
    align-items:center;
    gap:4px;
    border-radius:20px;
    padding:3px 10px;
    font-size:8px;
    font-weight:600;
    letter-spacing:1.5px;
    text-transform:uppercase;
  }

  .tag-orange {
    background:rgba(232,80,26,0.2);
    color:var(--orange-lt);
    border:1px solid rgba(232,80,26,0.4);
  }

  .tag-teal {
    background:rgba(26,110,106,0.25);
    color:#4ecdc4;
    border:1px solid rgba(78,205,196,0.35);
  }

  .tag-neutral {
    background:rgba(255,255,255,0.1);
    color:rgba(255,255,255,0.55);
    border:1px solid rgba(255,255,255,0.15);
  }

  .wave-divider {
    display:block;
    width:100%;
    height:28px;
    background:var(--ink);
    position:relative;
  }

  .wave-divider svg {
    position:absolute;
    bottom:0;left:0;right:0;
    width:100%;
    display:block;
  }

  .card-body {
    background:var(--warm-white);
    padding:12px 20px 12px;
    display: flex;
    flex-direction: column;
  }

  .details-grid {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:1px;
    background:rgba(180,160,140,0.15);
    border-radius:14px;
    overflow:hidden;
    border:1px solid rgba(180,160,140,0.2);
    margin-bottom:0px;
  }

  .detail-cell {
    background:var(--warm-white);
    padding:8px 12px;
    position:relative;
  }

  .d-label {
    font-size:7px;
    font-weight:600;
    letter-spacing:1.5px;
    text-transform:uppercase;
    color:var(--ink-faint);
    margin-bottom:2px;
  }

  .d-value {
    font-size:11px;
    font-weight:500;
    color:var(--ink);
    line-height:1.2;
  }

  .d-value.accent {
    color:var(--orange);
    font-family:'JetBrains Mono',monospace;
    font-size:11px;
  }

  .d-value.teal { color:var(--teal); font-weight:600; }

  .qr-center-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    gap: 8px;
  }

  .qr-frame-lg {
    width: 110px;
    height: 110px;
    background: #fff;
    border-radius: 14px;
    padding: 1px;
    border: 1px solid rgba(180,160,140,0.3);
    box-shadow: 0 10px 30px rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .qr-frame-lg svg {
    width: 100%;
    height: 100%;
  }

  .qr-info-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .qr-code-id {
    font-family:'JetBrains Mono',monospace;
    font-size:14px;
    font-weight:600;
    color:var(--ink);
    letter-spacing:1px;
  }

  .qr-status {
    display:flex;
    align-items:center;
    gap:6px;
    font-size:10px;
    font-weight:600;
    color:#2ea87e;
    text-transform:uppercase;
    letter-spacing:1px;
  }

  .live-dot {
    width:6px;height:6px;
    border-radius:50%;
    background:#2ea87e;
    box-shadow: 0 0 0 2px rgba(46,168,126,0.2);
  }

  .tier-panel-wide {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 8px 16px;
    background: var(--gold-pale);
    border: 1px solid rgba(201,146,42,0.3);
    border-radius: 12px;
    margin-bottom: 12px;
  }

  .tier-text-stack {
    display: flex;
    flex-direction: column;
  }

  .tier-label-sm {
    font-size:8px;
    font-weight:700;
    letter-spacing:1.5px;
    text-transform:uppercase;
    color:var(--gold);
    margin-bottom:2px;
  }

  .tier-name {
    font-family:'Playfair Display',serif;
    font-size:18px;
    font-weight:800;
    color:var(--gold);
    line-height:1;
  }

  .card-footer {
    background:var(--ink);
    padding:8px 24px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-top: auto;
  }

  .footer-text {
    font-size:7px;
    letter-spacing:1px;
    text-transform:uppercase;
    color:rgba(255,255,255,0.3);
  }

  .footer-dots { display:flex; gap:3px; }
  .footer-dot { width:4px; height:4px; border-radius:50%; background:rgba(232,80,26,0.5); }
  .footer-dot:first-child { background:var(--orange); }
`;
