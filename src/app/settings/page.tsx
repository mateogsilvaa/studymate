'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useTheme } from '@/lib/theme';
import { Sun, Moon, User, Palette, Bell, Shield } from 'lucide-react';

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={14} style={{ color: 'var(--text-3)' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{description}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ on, label }: { on: boolean; label: string }) {
  const [state, setState] = useState(on);
  return (
    <button
      onClick={() => setState(s => !s)}
      role="switch" aria-checked={state} aria-label={label}
      style={{
        width: 40, height: 22, borderRadius: 999,
        background: state ? 'var(--accent)' : 'var(--border)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.18s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: state ? 21 : 3,
        width: 16, height: 16, borderRadius: 999,
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.18s',
      }} />
    </button>
  );
}

export default function SettingsPage() {
  const { theme, toggle } = useTheme();

  return (
    <AppShell>
      <div style={{ maxWidth: 640 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', marginBottom: 20 }}>Ajustes</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Profile */}
          <Section icon={User} title="Perfil">
            <div style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 999, background: '#6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0,
              }}>M</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>Mateo González</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>mateogonsilva@gmail.com</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Ingeniería · 4to año</div>
              </div>
              <button style={{
                marginLeft: 'auto', padding: '0 14px', height: 30,
                background: 'var(--bg-base)', border: '1px solid var(--border)',
                borderRadius: 7, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer',
              }}>Editar</button>
            </div>
          </Section>

          {/* Appearance */}
          <Section icon={Palette} title="Apariencia">
            <Row label="Tema" description="Cambia entre modo claro y oscuro">
              <div style={{ display: 'flex', gap: 6 }}>
                {(['light', 'dark'] as const).map(t => (
                  <button key={t} onClick={toggle} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 11px', height: 30,
                    background: theme === t ? 'var(--accent-dim)' : 'var(--bg-base)',
                    border: `1px solid ${theme === t ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    color: theme === t ? 'var(--accent)' : 'var(--text-2)',
                    transition: 'all 0.12s',
                  }}>
                    {t === 'light' ? <Sun size={12} /> : <Moon size={12} />}
                    {t === 'light' ? 'Claro' : 'Oscuro'}
                  </button>
                ))}
              </div>
            </Row>
            <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>Idioma</div>
              </div>
              <select style={{ height: 30, padding: '0 10px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, color: 'var(--text-1)', outline: 'none', cursor: 'pointer' }}>
                <option>Español</option>
                <option>English</option>
              </select>
            </div>
          </Section>

          {/* Notifications */}
          <Section icon={Bell} title="Notificaciones">
            {[
              { label: 'Recordatorio de entregas', desc: '24 horas antes del vencimiento', on: true },
              { label: 'Recordatorio de exámenes', desc: '3 días y 1 día antes', on: true },
              { label: 'Tareas vencidas', desc: 'Alertar cuando vence sin completar', on: true },
              { label: 'Resumen semanal', desc: 'Informe cada lunes con tu semana', on: false },
            ].map(row => (
              <Row key={row.label} label={row.label} description={row.desc}>
                <Toggle on={row.on} label={row.label} />
              </Row>
            ))}
          </Section>

          {/* Privacy */}
          <Section icon={Shield} title="Datos y privacidad">
            <Row label="Exportar datos" description="Descarga toda tu información en JSON">
              <button style={{ padding: '0 14px', height: 30, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
                Exportar
              </button>
            </Row>
            <Row label="Eliminar cuenta" description="Esta acción es irreversible">
              <button style={{ padding: '0 14px', height: 30, background: 'var(--urgent-dim)', border: '1px solid var(--urgent)44', borderRadius: 7, fontSize: 12, color: 'var(--urgent)', cursor: 'pointer', fontWeight: 600 }}>
                Eliminar
              </button>
            </Row>
          </Section>
        </div>
      </div>
    </AppShell>
  );
}
