import React, { useState, useEffect } from 'react';
import { Heart, Plus, X, Edit2, Gift, Star, Sparkles } from 'lucide-react';

const WishlistApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [wishlists, setWishlists] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  
  const users = ['小粉蓝', '闺蜜A', '闺蜜B', '闺蜜C', '闺蜜D'];
  
  const [newItem, setNewItem] = useState({
    name: '',
    imageUrl: '',
    category: '',
    priority: 'medium',
    note: '',
    gifted: false,
    addedBy: '',
    timestamp: Date.now()
  });

  useEffect(() => {
    loadAllWishlists();
  }, []);

  const loadAllWishlists = async () => {
    const loaded = {};
    for (const user of users) {
      try {
        const result = await window.storage.get(`wishlist:${user}`, true);
        loaded[user] = result ? JSON.parse(result.value) : [];
      } catch (e) {
        loaded[user] = [];
      }
    }
    setWishlists(loaded);
  };

  const saveWishlist = async (user, items) => {
    await window.storage.set(`wishlist:${user}`, JSON.stringify(items), true);
    setWishlists(prev => ({ ...prev, [user]: items }));
  };

  const addItem = async () => {
    if (!newItem.name) return;
    
    const item = { ...newItem, id: Date.now(), addedBy: currentUser };
    const updated = [...(wishlists[currentUser] || []), item];
    await saveWishlist(currentUser, updated);
    
    setNewItem({
      name: '', imageUrl: '', category: '', priority: 'medium', 
      note: '', gifted: false, addedBy: '', timestamp: Date.now()
    });
    setShowAddModal(false);
  };

  const updateItem = async (user, itemId, updates) => {
    const updated = wishlists[user].map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    await saveWishlist(user, updated);
  };

  const deleteItem = async (user, itemId) => {
    const updated = wishlists[user].filter(item => item.id !== itemId);
    await saveWishlist(user, updated);
  };

  const priorityColors = {
    high: 'bg-rose-100 text-rose-700 border-rose-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const priorityLabels = { high: '高优先级', medium: '中优先级', low: '低优先级' };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-md w-full border border-amber-100">
          <div className="text-center mb-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-rose-400" />
            <h1 className="text-4xl font-serif text-slate-800 mb-2">闺蜜心愿单</h1>
            <p className="text-slate-500 text-sm">记录每一个想要的小确幸</p>
          </div>
          
          <div className="space-y-3">
            {users.map(user => (
              <button
                key={user}
                onClick={() => {
                  setCurrentUser(user);
                  setViewingUser(user);
                }}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-100 to-amber-100 
                         hover:from-rose-200 hover:to-amber-200 transition-all duration-300 
                         text-slate-700 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
              >
                {user}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentWishlist = wishlists[viewingUser] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-6 border border-amber-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-serif text-slate-800 flex items-center gap-2">
                <Heart className="w-8 h-8 text-rose-400 fill-rose-400" />
                {viewingUser}的心愿单
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                当前用户: {currentUser}
              </p>
            </div>
            
            <div className="flex gap-2">
              {currentUser === viewingUser && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-rose-400 to-orange-400 text-white 
                           rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 
                           transition-all duration-300 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  添加心愿
                </button>
              )}
            </div>
          </div>
          
          {/* User tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {users.map(user => (
              <button
                key={user}
                onClick={() => setViewingUser(user)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  viewingUser === user
                    ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-md'
                    : 'bg-white/50 text-slate-600 hover:bg-white'
                }`}
              >
                {user}
              </button>
            ))}
          </div>
        </div>

        {/* Wishlist Grid */}
        {currentWishlist.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-16 text-center border border-amber-100">
            <Star className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-400 text-lg">还没有心愿呢~</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentWishlist
              .sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              })
              .map(item => (
                <div
                  key={item.id}
                  className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden 
                             border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                    item.gifted ? 'opacity-60 border-green-200' : 'border-amber-100'
                  }`}
                >
                  {item.imageUrl && (
                    <div className="h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-serif text-slate-800 flex-1">{item.name}</h3>
                      {currentUser === viewingUser && (
                        <button
                          onClick={() => deleteItem(viewingUser, item.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    {item.category && (
                      <p className="text-sm text-slate-500 mb-2">📦 {item.category}</p>
                    )}
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[item.priority]}`}>
                        {priorityLabels[item.priority]}
                      </span>
                      
                      {item.gifted && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          已送出
                        </span>
                      )}
                    </div>
                    
                    {item.note && (
                      <p className="text-sm text-slate-600 bg-amber-50 rounded-xl p-3 mb-3 border border-amber-100">
                        💭 {item.note}
                      </p>
                    )}
                    
                    {currentUser !== viewingUser && !item.gifted && (
                      <button
                        onClick={() => updateItem(viewingUser, item.id, { gifted: true })}
                        className="w-full py-2 bg-gradient-to-r from-green-400 to-emerald-400 
                                 text-white rounded-xl font-medium shadow-md hover:shadow-lg 
                                 transform hover:scale-105 transition-all duration-300"
                      >
                        标记为已送出
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif text-slate-800">添加新心愿</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    心愿名称 *
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-amber-100 
                             focus:border-rose-300 focus:outline-none transition-colors"
                    placeholder="想要的东西..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    图片链接
                  </label>
                  <input
                    type="url"
                    value={newItem.imageUrl}
                    onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-amber-100 
                             focus:border-rose-300 focus:outline-none transition-colors"
                    placeholder="https://..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    分类
                  </label>
                  <input
                    type="text"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-amber-100 
                             focus:border-rose-300 focus:outline-none transition-colors"
                    placeholder="书籍 / 化妆品 / 衣服..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    优先级
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['high', 'medium', 'low'].map(priority => (
                      <button
                        key={priority}
                        onClick={() => setNewItem({ ...newItem, priority })}
                        className={`py-3 rounded-xl font-medium transition-all ${
                          newItem.priority === priority
                            ? priorityColors[priority] + ' border-2'
                            : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
                        }`}
                      >
                        {priorityLabels[priority]}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    备注
                  </label>
                  <textarea
                    value={newItem.note}
                    onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-amber-100 
                             focus:border-rose-300 focus:outline-none transition-colors resize-none"
                    rows="3"
                    placeholder="比如颜色、尺码、偏好..."
                  />
                </div>
                
                <button
                  onClick={addItem}
                  disabled={!newItem.name}
                  className="w-full py-4 bg-gradient-to-r from-rose-400 to-orange-400 
                           text-white rounded-2xl font-medium shadow-lg hover:shadow-xl 
                           transform hover:scale-105 transition-all duration-300 
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  添加到心愿单
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
