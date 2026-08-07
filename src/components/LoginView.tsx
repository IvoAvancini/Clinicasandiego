import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { SandiegoLogo } from './SandiegoLogo';
import { Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

const CREDENTIALS = {
  master: { email: 'ivoavancini@hotmail.com',          password: 'Avancini@2025',  role: 'master' as const },
  clinic: { email: 'recepcao@clinicasandiego.com.br',  password: 'Sandiego@2025',  role: 'clinic' as const },
};

export function LoginView() {
  const { login } = useChatStore();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const em = email.trim().toLowerCase();
      if (em === CREDENTIALS.master.email && password === CREDENTIALS.master.password) {
        login('master');
        toast.success('Bem-vindo, Ivo!');
      } else if (em === CREDENTIALS.clinic.email && password === CREDENTIALS.clinic.password) {
        login('clinic');
        toast.success('Bem-vinda, Recepção Sandiego!');
      } else {
        setError('E-mail ou senha incorretos.');
        toast.error('Credenciais inválidas.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&display=swap');

        .login-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }

        /* ── Left panel animated bg ── */
        @keyframes bgShift {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        .left-panel {
          background: linear-gradient(140deg, #050f2e 0%, #0a1f5e 40%, #061840 70%, #0d2a70 100%);
          background-size: 300% 300%;
          animation: bgShift 12s ease infinite;
          position: relative;
          overflow: hidden;
        }

        /* floating orbs */
        @keyframes orbFloat {
          0%,100% { transform: translate(0,0) scale(1);   opacity:.18; }
          50%      { transform: translate(20px,-30px) scale(1.1); opacity:.28; }
        }
        .orb-a { animation: orbFloat 16s ease-in-out infinite; }
        .orb-b { animation: orbFloat 20s ease-in-out infinite reverse; animation-delay:-7s; }

        /* sparkle dots */
        @keyframes twinkle {
          0%,100% { opacity:0.15; transform:scale(1);   }
          50%      { opacity:0.6;  transform:scale(1.5); }
        }
        .spark { animation: twinkle ease-in-out infinite; border-radius:50%; position:absolute; background:#C59B27; }

        /* ── Right panel ── */
        @keyframes rightBg {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        .right-panel {
          background: linear-gradient(135deg, #eef2ff 0%, #f0f4ff 40%, #e8f0fe 70%, #f5f0ff 100%);
          background-size: 300% 300%;
          animation: rightBg 14s ease infinite;
          position: relative;
          overflow: hidden;
        }

        /* decorative rings on right */
        @keyframes ringFloat {
          0%,100% { transform: scale(1) translate(0,0); opacity:.07; }
          50%      { transform: scale(1.08) translate(-12px,16px); opacity:.14; }
        }
        .ring-deco { position:absolute; border-radius:50%; border-style:solid; animation: ringFloat ease-in-out infinite; pointer-events:none; }

        /* card reveal */
        @keyframes cardIn {
          from { opacity:0; transform: translateY(24px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .form-card {
          background: #fff;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 8px 40px rgba(10,31,94,0.10), 0 2px 8px rgba(10,31,94,0.06);
          animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
          position: relative;
          z-index: 2;
        }

        /* Input */
        .field-wrap input {
          width:100%; padding:14px 14px 14px 44px;
          border:1.5px solid #e2e6f0; border-radius:12px;
          background:#fff; font-size:14px; font-weight:600; color:#0a1124;
          outline:none; transition: border-color .2s, box-shadow .2s;
        }
        .field-wrap input:focus {
          border-color:#C59B27;
          box-shadow: 0 0 0 3px rgba(197,155,39,.14);
        }
        .field-wrap input::placeholder { color:#b0b7c8; font-weight:500; }

        /* Submit button */
        @keyframes shimmer {
          0%   { background-position:-200% center; }
          100% { background-position: 200% center; }
        }
        .submit-btn {
          width:100%; padding:15px;
          background: #c8cfe0;
          color: #8a94a8; font-weight:900; font-size:15px;
          border:none; border-radius:14px; cursor:not-allowed;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition: background .3s, color .3s, transform .2s, box-shadow .3s;
          box-shadow: none;
        }
        .submit-btn.active {
          background: #0084ff;
          color: #fff;
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(0,132,255,.38);
        }
        .submit-btn.active:hover {
          background: #0070df;
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(0,132,255,.55);
        }
        .submit-btn:disabled { pointer-events: none; }

        /* Forgot link */
        .forgot-link {
          font-size:11px; font-weight:800; letter-spacing:.08em;
          text-transform:uppercase; color:#b0b7c8;
          cursor:pointer; transition:color .2s; text-decoration:none;
          text-align:center; display:block;
        }
        .forgot-link:hover { color:#C59B27; }

        /* Gold accent bar */
        .gold-bar {
          width:4px; border-radius:4px;
          background: linear-gradient(180deg,#C59B27,#d4af37);
        }
      `}</style>

      <div className="login-wrap" style={{ display:'flex', height:'100vh', width:'100vw', overflow:'hidden' }}>

        {/* ─── LEFT PANEL ─────────────────────────────────── */}
        <div className="left-panel" style={{ flex:'0 0 42%', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'40px 48px' }}>

          {/* Orbs */}
          <div className="orb-a" style={{ position:'absolute', top:'-10%', left:'-10%', width:500, height:500, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(37,99,235,0.30) 0%, transparent 70%)' }} />
          <div className="orb-b" style={{ position:'absolute', bottom:'-15%', right:'-10%', width:600, height:600, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(197,155,39,0.20) 0%, transparent 70%)' }} />

          {/* Sparkles */}
          {[
            {top:'18%',left:'70%',size:5,delay:'0s',dur:'3s'},
            {top:'35%',left:'15%',size:4,delay:'1.2s',dur:'4s'},
            {top:'60%',left:'80%',size:6,delay:'0.5s',dur:'3.5s'},
            {top:'75%',left:'30%',size:3,delay:'2s',dur:'5s'},
            {top:'88%',left:'60%',size:4,delay:'1s',dur:'4.5s'},
            {top:'10%',left:'40%',size:3,delay:'0.8s',dur:'3.8s'},
          ].map((s,i)=>(
            <div key={i} className="spark"
              style={{ top:s.top, left:s.left, width:s.size, height:s.size,
                animationDuration:s.dur, animationDelay:s.delay }} />
          ))}

          {/* Logo top-left */}
          <div style={{ position:'relative', zIndex:2 }}>
            <SandiegoLogo variant="full" size="md" />
          </div>

          {/* Main copy */}
          <div style={{ position:'relative', zIndex:2, flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:24, marginTop:48 }}>

            {/* headline */}
            <div>
              <h1 style={{ fontSize:'clamp(36px,3.5vw,52px)', fontWeight:900, lineHeight:1.1, color:'#fff', margin:0 }}>
                Clínica<br />
                <span style={{ background:'linear-gradient(90deg,#C59B27,#d4af37,#e8c84a)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  Sandiego
                </span>
              </h1>
            </div>

            {/* tagline with gold bar */}
            <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
              <div className="gold-bar" style={{ height:52, marginTop:4 }} />
              <div>
                <p style={{ margin:0, fontSize:17, fontWeight:800, color:'#fff', lineHeight:1.35 }}>
                  Você cuida dos seus pacientes.
                </p>
                <p style={{ margin:0, fontSize:15, fontWeight:600, color:'rgba(255,255,255,0.50)', lineHeight:1.4, marginTop:4 }}>
                  A gente cuida do resto.
                </p>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div style={{ position:'relative', zIndex:2, borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:20, marginTop:32 }}>
            <p style={{ margin:0, fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.25)' }}>
              © 2025 Avancini Digital · Clínica Médica Sandiego
            </p>
          </div>
        </div>

        {/* ─── RIGHT PANEL ─────────────────────────────────── */}
        <div className="right-panel" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 32px' }}>

          {/* Decorative rings */}
          <div className="ring-deco" style={{ width:500, height:500, top:'-15%', right:'-15%', borderColor:'#0a1f5e', borderWidth:1.5, animationDuration:'18s' }} />
          <div className="ring-deco" style={{ width:320, height:320, top:'-8%', right:'-8%', borderColor:'#C59B27', borderWidth:1, animationDuration:'12s', animationDelay:'-4s' }} />
          <div className="ring-deco" style={{ width:380, height:380, bottom:'-12%', left:'-10%', borderColor:'#0a1f5e', borderWidth:1, animationDuration:'22s', animationDelay:'-8s' }} />
          <div className="ring-deco" style={{ width:200, height:200, bottom:'10%', left:'5%', borderColor:'#C59B27', borderWidth:0.8, animationDuration:'16s', animationDelay:'-3s' }} />

          {/* Gold dot accent top-right */}
          <div style={{ position:'absolute', top:32, right:32, width:10, height:10, borderRadius:'50%', background:'#C59B27', opacity:0.4 }} />
          <div style={{ position:'absolute', top:48, right:22, width:6, height:6, borderRadius:'50%', background:'#0a1f5e', opacity:0.2 }} />

          {/* Support button — top right */}
          <a
            href="https://wa.me/5573981019782"
            target="_blank"
            rel="noreferrer"
            style={{
              position:'absolute', top:20, right:24, zIndex:10,
              display:'flex', alignItems:'center', gap:7,
              padding:'8px 14px', borderRadius:999,
              background:'#fff', border:'1.5px solid #e2e6f0',
              boxShadow:'0 2px 12px rgba(10,31,94,0.08)',
              textDecoration:'none', cursor:'pointer',
              transition:'box-shadow .2s, border-color .2s',
            }}
          >
            <svg width="15" height="15" fill="#0084ff" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.535 5.858L.057 23.486a.5.5 0 00.609.61l5.77-1.505A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.031-1.386l-.36-.214-3.733.974.999-3.625-.234-.374A9.818 9.818 0 1112 21.818z"/></svg>
            <span style={{ fontSize:12, fontWeight:800, color:'#0a1124' }}>Fale com suporte</span>
          </a>

          <div className="form-card" style={{ width:'100%', maxWidth:420 }}>

            {/* Greeting */}
            <div style={{ marginBottom:32 }}>
              {/* Gold line accent */}
              <div style={{ width:40, height:4, borderRadius:4, background:'linear-gradient(90deg,#C59B27,#d4af37)', marginBottom:16 }} />
              <h2 style={{ margin:0, fontSize:'clamp(24px,2.8vw,36px)', fontWeight:900, lineHeight:1.2, color:'#0a1124' }}>
                Que bom ter você<br />de volta. 👋
              </h2>
              <p style={{ margin:'10px 0 0', fontSize:14, fontWeight:500, color:'#7a8299', lineHeight:1.5 }}>
                Entre com suas credenciais para continuar.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {/* E-mail */}
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'#9aa3b8', marginBottom:6 }}>
                  E-mail
                </label>
                <div className="field-wrap" style={{ position:'relative' }}>
                  <Mail style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:18, height:18, color:'#b0b7c8' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e=>{ setEmail(e.target.value); setError(''); }}
                    placeholder="seu@email.com.br"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'#9aa3b8', marginBottom:6 }}>
                  Senha
                </label>
                <div className="field-wrap" style={{ position:'relative' }}>
                  <Lock style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:18, height:18, color:'#b0b7c8' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e=>{ setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                    style={{ paddingRight:46 }}
                  />
                  <button type="button" onClick={()=>setShowPw(v=>!v)}
                    style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#b0b7c8', padding:0, display:'flex' }}>
                    {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p style={{ margin:0, fontSize:12, fontWeight:700, color:'#e53e3e', background:'#fff5f5', border:'1px solid #fed7d7', padding:'10px 14px', borderRadius:10 }}>
                  ⚠️ {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`submit-btn ${email && password ? 'active' : ''}`}
                style={{ marginTop:6 }}
              >
                {loading ? (
                  <><span style={{ width:18, height:18, border:'2.5px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} /> Verificando...</>
                ) : (
                  <>Entrar <ArrowRight size={18}/></>
                )}
              </button>

              {/* Forgot */}
              <a
                className="forgot-link"
                onClick={() => window.open('https://wa.me/5573991845988?text=Ol%C3%A1%2C+preciso+de+ajuda+para+acessar+o+sistema+da+Cl%C3%ADnica+Sandiego.', '_blank')}
              >
                Esqueci minha senha
              </a>
            </form>

          </div>
        </div>
      </div>
    </>
  );
}
