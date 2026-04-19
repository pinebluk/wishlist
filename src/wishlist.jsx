import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Gift, Star, LogOut } from 'lucide-react';
import { supabase } from './supabase';

const users = ['小粉蓝', '茂茂', '敏敏', '霜霜', '米粒儿'];
const avatarInitial = (name) => name.slice(-1);

const ink = '#2C1F14';
const paper = '#F7F1E6';
const aged = '#E8DCC8';
const rose = '#9B5E52';
const sage = '#6B7D63';
const muted = '#8C7B6A';

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${paper}; font-family: 'Noto Serif SC', serif; color: ${ink}; }
  input, textarea, button { font-family: inherit; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${aged}; }
  ::-webkit-scrollbar-thumb { background: ${muted}; border-radius: 2px; }
`;

const priorityConfig = {
  high:   { label: '❶ 渴望已久', color: rose },
  medium: { label: '❷ 念念不忘', color: muted },
  low:    { label: '❸ 随缘即可', color: sage },
};

const iconBtn = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  color: muted, padding: '0.25rem', borderRadius: 2,
  display: 'flex', alignItems: 'center',
};

const inputStyle = {
  width: '100%', padding: '0.6rem 0.75rem',
  border: `1px solid ${aged}`, borderRadius: 2,
  background: paper, color: ink, fontSize: '0.9rem',
  outline: 'none', letterSpacing: '0.05em',
};

const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(44,31,20,0.4)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    zIndex: 100, padding: '1rem',
  }}>
    <div style={{
      background: paper, borderRadius: '4px 4px 0 0', width: '100%', maxWidth: 480,
      padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 400, letterSpacing: '0.15em', color: ink }}>{title}</h2>
        <button onClick={onClose} style={{ ...iconBtn, fontSize: '1rem' }}><X size={16} /></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>{children}</div>
    </div>
  </div>
);

const FormField = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.72rem', color: muted, letterSpacing: '0.15em', marginBottom: '0.3rem' }}>
      {label}
    </label>
    {children}
  </div>
);

const LoginPage = ({ onLogin }) => (
  <div style={{
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: paper, padding: '2rem',
  }}>
    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
      <div style={{ fontSize: '0.75rem', letterSpacing: '0.4em', color: muted, marginBottom: '0.75rem' }}>
        ── 心 愿 手 账 ──
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 300, color: ink, letterSpacing: '0.15em' }}>
        小粉蓝的心愿单
      </h1>
      <div style={{ width: 48, height: 1, background: rose, margin: '1.25rem auto' }} />
      <p style={{ color: muted, fontSize: '0.8rem', letterSpacing: '0.2em' }}>请选择你的身份</p>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', maxWidth: 300 }}>
      {users.map(u => (
        <button
          key={u}
          onClick={() => onLogin(u)}
          style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '0.85rem 1.25rem',
            background: 'transparent',
            border: `1px solid ${aged}`,
            borderRadius: 2, cursor: 'pointer', color: ink,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = aged; e.currentTarget.style.borderColor = muted; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = aged; }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: aged, border: `1px solid ${muted}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', color: muted, flexShrink: 0,
          }}>
            {avatarInitial(u)}
          </div>
          <span style={{ fontSize: '1rem', letterSpacing: '0.1em' }}>{u}</span>
        </button>
      ))}
    </div>

    <p style={{ marginTop: '3rem', color: aged, fontSize: '0.72rem', letterSpacing: '0.25em' }}>
      记录每一个小心愿
    </p>
  </div>
);

const WishlistMain = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [wishlists, setWishlists] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', imageUrl: '', category: '', priority: 'medium', note: '' });

  useEffect(() => {
    if (currentUser) { setViewingUser(currentUser); loadAllWishlists(); }
  }, [currentUser]);

  const loadAllWishlists = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('wishlists').select('*').order('created_at', { ascending: false });
    if (!error) {
      const grouped = {};
      users.forEach(u => (grouped[u] = []));
      data.forEach(item => { if (grouped[item.user_name]) grouped[item.user_name].push(item); });
      setWishlists(grouped);
    }
    setLoading(false);
  };

  const addItem = async () => {
    if (!newItem.name.trim()) return;
    await supabase.from('wishlists').insert([{
      user_name: currentUser, name: newItem.name, image_url: newItem.imageUrl,
      category: newItem.category, priority: newItem.priority, note: newItem.note,
      gifted: false, added_by: currentUser,
    }]);
    setNewItem({ name: '', imageUrl: '', category: '', priority: 'medium', note: '' });
    setShowAddModal(false);
    loadAllWishlists();
  };

  const toggleGifted = async (item) => {
    await supabase.from('wishlists').update({ gifted: !item.gifted }).eq('id', item.id);
    loadAllWishlists();
  };

  const deleteItem = async (id) => {
    await supabase.from('wishlists').delete().eq('id', id);
    loadAllWishlists();
  };

  const saveEdit = async () => {
    await supabase.from('wishlists').update({
      name: editingItem.name, image_url: editingItem.image_url,
      category: editingItem.category, priority: editingItem.priority, note: editingItem.note,
    }).eq('id', editingItem.id);
    setEditingItem(null);
    loadAllWishlists();
  };

  if (!currentUser) return <LoginPage onLogin={setCurrentUser} />;

  const currentList = wishlists[viewingUser] || [];
  const isOwner = currentUser === viewingUser;

  return (
    <div style={{ minHeight: '100vh', background: paper }}>
      <header style={{
        borderBottom: `1px solid ${aged}`, padding: '1rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: paper, position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.35em', color: muted }}>心 愿 手 账</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 400, color: ink, letterSpacing: '0.1em' }}>小粉蓝的心愿单</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: muted }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: aged,
              border: `1px solid ${muted}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
            }}>{avatarInitial(currentUser)}</div>
            {currentUser}
          </div>
          <button
            onClick={() => setCurrentUser(null)}
            style={{
              background: 'transparent', border: `1px solid ${aged}`, borderRadius: 2,
              padding: '0.3rem 0.6rem', cursor: 'pointer', color: muted, fontSize: '0.75rem',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}>
            <LogOut size={12} /> 退出
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${aged}`, marginBottom: '2rem', overflowX: 'auto' }}>
          {users.map(u => (
            <button key={u} onClick={() => setViewingUser(u)}
              style={{
                padding: '0.6rem 1.2rem', background: 'transparent', border: 'none',
                borderBottom: viewingUser === u ? `2px solid ${rose}` : '2px solid transparent',
                cursor: 'pointer', color: viewingUser === u ? rose : muted,
                fontSize: '0.9rem', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                transition: 'all 0.2s', marginBottom: -1,
              }}>
              {u}{u === currentUser && <span style={{ fontSize: '0.65rem', marginLeft: 4, color: sage }}>· 我</span>}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 400, color: ink, letterSpacing: '0.1em' }}>{viewingUser} 的心愿</h2>
            <div style={{ fontSize: '0.72rem', color: muted, marginTop: '0.2rem' }}>
              {currentList.length} 件心愿 · {currentList.filter(i => i.gifted).length} 件已实现
            </div>
          </div>
          {isOwner && (
            <button onClick={() => setShowAddModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1rem', background: ink, color: paper,
                border: 'none', borderRadius: 2, cursor: 'pointer',
                fontSize: '0.82rem', letterSpacing: '0.1em',
              }}>
              <Plus size={14} /> 记录心愿
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: muted, padding: '4rem 0', letterSpacing: '0.2em' }}>翻阅中…</div>
        ) : currentList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: muted }}>
            <Star size={32} style={{ opacity: 0.3, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
            <p style={{ letterSpacing: '0.2em', fontSize: '0.9rem' }}>还没有心愿，快去记录吧</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: aged }}>
            {currentList.map(item => (
              <div key={item.id} style={{
                background: item.gifted ? '#F0EBE0' : paper,
                padding: '1.25rem 1.5rem',
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                opacity: item.gifted ? 0.7 : 1,
              }}>
                {item.image_url && (
                  <img src={item.image_url} alt={item.name}
                    style={{ width: 72, height: 72, objectFit: 'cover', flexShrink: 0, filter: 'sepia(10%)' }}
                    onError={e => (e.target.style.display = 'none')} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{
                      fontSize: '1rem', fontWeight: 400, color: ink, letterSpacing: '0.05em',
                      textDecoration: item.gifted ? 'line-through' : 'none',
                    }}>{item.name}</h3>
                    <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                      {isOwner && <button onClick={() => setEditingItem(item)} style={iconBtn}><Edit2 size={13} /></button>}
                      <button onClick={() => toggleGifted(item)} title={item.gifted ? '取消已实现' : '标记为已实现'}
                        style={{ ...iconBtn, color: item.gifted ? rose : muted }}><Gift size={13} /></button>
                      {isOwner && <button onClick={() => deleteItem(item.id)} style={iconBtn}><X size={13} /></button>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {item.category && <span style={{ fontSize: '0.72rem', color: sage, letterSpacing: '0.1em' }}># {item.category}</span>}
                    {item.priority && <span style={{ fontSize: '0.72rem', color: priorityConfig[item.priority]?.color, letterSpacing: '0.05em' }}>{priorityConfig[item.priority]?.label}</span>}
                    {item.gifted && <span style={{ fontSize: '0.72rem', color: sage, letterSpacing: '0.1em' }}>✓ 已实现</span>}
                  </div>
                  {item.note && <p style={{ fontSize: '0.8rem', color: muted, marginTop: '0.4rem', letterSpacing: '0.05em' }}>{item.note}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <Modal title="记录新心愿" onClose={() => setShowAddModal(false)}>
          <FormField label="心愿名称 *">
            <input style={inputStyle} placeholder="想要的东西…" value={newItem.name}
              onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
          </FormField>
          <FormField label="图片链接">
            <input style={inputStyle} placeholder="https://..." value={newItem.imageUrl}
              onChange={e => setNewItem({ ...newItem, imageUrl: e.target.value })} />
          </FormField>
          <FormField label="分类">
            <input style={inputStyle} placeholder="书籍 / 化妆品 / 衣服…" value={newItem.category}
              onChange={e => setNewItem({ ...newItem, category: e.target.value })} />
          </FormField>
          <FormField label="心愿程度">
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {Object.entries(priorityConfig).map(([k, v]) => (
                <button key={k} onClick={() => setNewItem({ ...newItem, priority: k })}
                  style={{
                    flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.72rem',
                    border: `1px solid ${newItem.priority === k ? v.color : aged}`,
                    background: newItem.priority === k ? aged : 'transparent',
                    color: newItem.priority === k ? v.color : muted,
                    borderRadius: 2, cursor: 'pointer', letterSpacing: '0.05em',
                  }}>{v.label}</button>
              ))}
            </div>
          </FormField>
          <FormField label="备注">
            <textarea style={{ ...inputStyle, resize: 'none' }} rows={3}
              placeholder="颜色、尺码、偏好…" value={newItem.note}
              onChange={e => setNewItem({ ...newItem, note: e.target.value })} />
          </FormField>
          <button onClick={addItem} disabled={!newItem.name.trim()}
            style={{
              width: '100%', padding: '0.75rem',
              background: newItem.name.trim() ? ink : aged,
              color: newItem.name.trim() ? paper : muted,
              border: 'none', borderRadius: 2,
              cursor: newItem.name.trim() ? 'pointer' : 'default',
              fontSize: '0.9rem', letterSpacing: '0.15em', marginTop: '0.5rem',
            }}>记录心愿</button>
        </Modal>
      )}

      {editingItem && (
        <Modal title="编辑心愿" onClose={() => setEditingItem(null)}>
          <FormField label="心愿名称">
            <input style={inputStyle} value={editingItem.name}
              onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} />
          </FormField>
          <FormField label="图片链接">
            <input style={inputStyle} placeholder="https://..." value={editingItem.image_url || ''}
              onChange={e => setEditingItem({ ...editingItem, image_url: e.target.value })} />
          </FormField>
          <FormField label="分类">
            <input style={inputStyle} value={editingItem.category || ''}
              onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} />
          </FormField>
          <FormField label="备注">
            <textarea style={{ ...inputStyle, resize: 'none' }} rows={3} value={editingItem.note || ''}
              onChange={e => setEditingItem({ ...editingItem, note: e.target.value })} />
          </FormField>
          <button onClick={saveEdit}
            style={{
              width: '100%', padding: '0.75rem', background: ink, color: paper,
              border: 'none', borderRadius: 2, cursor: 'pointer',
              fontSize: '0.9rem', letterSpacing: '0.15em', marginTop: '0.5rem',
            }}>保存</button>
        </Modal>
      )}
    </div>
  );
};

const StyleInjector = () => {
  useEffect(() => {
    const tag = document.createElement('style');
    tag.textContent = globalStyle;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);
  return null;
};

export default function App() {
  return (
    <>
      <StyleInjector />
      <WishlistMain />
    </>
  );
}
