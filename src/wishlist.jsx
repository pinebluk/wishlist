import React, { useState, useEffect } from 'react';
import { Heart, Plus, X, Edit2, Gift, Star, Sparkles } from 'lucide-react';
import { supabase } from './supabase';

const users = ['茂茂', '敏敏', '霜霜', '米粒儿', 'D'];

const WishlistApp = () => {
  const [currentUser, setCurrentUser] = useState('小粉蓝');
  const [wishlists, setWishlists] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingUser, setViewingUser] = useState('小粉蓝');
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    imageUrl: '',
    category: '',
    priority: 'medium',
    note: '',
    gifted: false,
    addedBy: '',
  });

  useEffect(() => {
    loadAllWishlists();
  }, []);

  const loadAllWishlists = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('加载失败:', error);
    } else {
      const grouped = {};
      users.forEach(u => (grouped[u] = []));
      data.forEach(item => {
        if (grouped[item.user_name]) {
          grouped[item.user_name].push(item);
        }
      });
      setWishlists(grouped);
    }
    setLoading(false);
  };

  const addItem = async () => {
    if (!newItem.name.trim()) return;
    const { error } = await supabase.from('wishlists').insert([
      {
        user_name: currentUser,
        name: newItem.name,
        image_url: newItem.imageUrl,
        category: newItem.category,
        priority: newItem.priority,
        note: newItem.note,
        gifted: false,
        added_by: currentUser,
      },
    ]);
    if (error) {
      console.error('添加失败:', error);
    } else {
      setNewItem({ name: '', imageUrl: '', category: '', priority: 'medium', note: '', gifted: false, addedBy: '' });
      setShowAddModal(false);
      loadAllWishlists();
    }
  };

  const toggleGifted = async (item) => {
    const { error } = await supabase
      .from('wishlists')
      .update({ gifted: !item.gifted })
      .eq('id', item.id);
    if (!error) loadAllWishlists();
  };

  const deleteItem = async (id) => {
    const { error } = await supabase.from('wishlists').delete().eq('id', id);
    if (!error) loadAllWishlists();
  };

  const saveEdit = async () => {
    const { error } = await supabase
      .from('wishlists')
      .update({
        name: editingItem.name,
        image_url: editingItem.image_url,
        category: editingItem.category,
        priority: editingItem.priority,
        note: editingItem.note,
      })
      .eq('id', editingItem.id);
    if (!error) {
      setEditingItem(null);
      loadAllWishlists();
    }
  };

  const priorityConfig = {
    high: { label: '高优先级', color: 'bg-rose-100 text-rose-600 border-rose-200' },
    medium: { label: '中优先级', color: 'bg-amber-100 text-amber-600 border-amber-200' },
    low: { label: '低优先级', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
  };

  const currentList = wishlists[viewingUser] || [];
  const isOwner = currentUser === viewingUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 mb-1">
            ♡心愿单
          </h1>
          <p className="text-gray-400 text-sm">记录每一个小心愿 ✨</p>
        </div>

        {/* 当前用户选择 */}
        <div className="bg-white/70 backdrop-blur rounded-2xl p-4 mb-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-2 text-center">我是谁？</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {users.map(u => (
              <button
                key={u}
                onClick={() => setCurrentUser(u)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  currentUser === u
                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* 查看谁的心愿单 */}
        <div className="bg-white/70 backdrop-blur rounded-2xl p-4 mb-6 shadow-sm">
          <p className="text-xs text-gray-400 mb-2 text-center">查看谁的心愿单？</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {users.map(u => (
              <button
                key={u}
                onClick={() => setViewingUser(u)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  viewingUser === u
                    ? 'bg-gradient-to-r from-indigo-400 to-purple-400 text-white shadow-md'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* 添加按钮（只有本人能加） */}
        {isOwner && (
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full mb-6 py-3 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> 添加心愿
          </button>
        )}

        {/* 心愿列表 */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">加载中...</div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Star size={40} className="mx-auto mb-3 opacity-30" />
            <p>还没有心愿呢～</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map(item => (
              <div
                key={item.id}
                className={`bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm transition-all ${
                  item.gifted ? 'opacity-60' : ''
                }`}
              >
                <div className="flex gap-3">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                      onError={e => (e.target.style.display = 'none')}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-semibold text-gray-700 ${item.gifted ? 'line-through' : ''}`}>
                        {item.name}
                      </h3>
                      <div className="flex gap-1 flex-shrink-0">
                        {isOwner && (
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => toggleGifted(item)}
                          className={`p-1.5 rounded-lg transition-all ${
                            item.gifted
                              ? 'bg-pink-100 text-pink-400'
                              : 'hover:bg-gray-100 text-gray-400'
                          }`}
                          title={item.gifted ? '取消已送出' : '标记为已送出'}
                        >
                          <Gift size={14} />
                        </button>
                        {isOwner && (
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-400"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {item.category && (
                        <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-400 rounded-full">
                          {item.category}
                        </span>
                      )}
                      {item.priority && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityConfig[item.priority]?.color}`}>
                          {priorityConfig[item.priority]?.label}
                        </span>
                      )}
                      {item.gifted && (
                        <span className="text-xs px-2 py-0.5 bg-green-50 text-green-400 rounded-full">
                          已送出 ✓
                        </span>
                      )}
                    </div>
                    {item.note && (
                      <p className="text-xs text-gray-400 mt-1.5">{item.note}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 添加心愿弹窗 */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                  <Sparkles size={18} className="text-pink-400" /> 添加新心愿
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-300"
                  placeholder="心愿名称 *"
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                />
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-300"
                  placeholder="图片链接（可选）"
                  value={newItem.imageUrl}
                  onChange={e => setNewItem({ ...newItem, imageUrl: e.target.value })}
                />
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-300"
                  placeholder="分类（书籍 / 化妆品 / 衣服...）"
                  value={newItem.category}
                  onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                />
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">优先级</p>
                  <div className="flex gap-2">
                    {['high', 'medium', 'low'].map(p => (
                      <button
                        key={p}
                        onClick={() => setNewItem({ ...newItem, priority: p })}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                          newItem.priority === p
                            ? priorityConfig[p].color + ' border-current'
                            : 'border-gray-200 text-gray-400'
                        }`}
                      >
                        {priorityConfig[p].label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-300 resize-none"
                  placeholder="备注（颜色、尺码、偏好...）"
                  rows={3}
                  value={newItem.note}
                  onChange={e => setNewItem({ ...newItem, note: e.target.value })}
                />
                <button
                  onClick={addItem}
                  disabled={!newItem.name.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium disabled:opacity-40 transition-all"
                >
                  添加到心愿单
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 编辑弹窗 */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-700">编辑心愿</h2>
                <button onClick={() => setEditingItem(null)} className="p-2 rounded-xl hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-300"
                  value={editingItem.name}
                  onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                />
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-300"
                  placeholder="图片链接"
                  value={editingItem.image_url || ''}
                  onChange={e => setEditingItem({ ...editingItem, image_url: e.target.value })}
                />
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-300"
                  placeholder="分类"
                  value={editingItem.category || ''}
                  onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                />
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-300 resize-none"
                  rows={3}
                  value={editingItem.note || ''}
                  onChange={e => setEditingItem({ ...editingItem, note: e.target.value })}
                />
                <button
                  onClick={saveEdit}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistApp;
