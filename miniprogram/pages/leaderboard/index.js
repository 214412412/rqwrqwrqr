Page({
  data: {
    scores: [],
    activeTab: 'all'
  },

  onLoad() {
    this.loadScores();
  },

  onShow() {
    this.loadScores();
  },

  loadScores() {
    const db = wx.cloud.database();
    let query = db.collection('scores').orderBy('score', 'desc');
    
    if (this.data.activeTab !== 'all') {
      query = query.where({
        difficulty: this.data.activeTab
      });
    }

    query.get().then(res => {
      this.setData({
        scores: res.data
      });
    }).catch(err => {
      console.error('Load scores failed:', err);
    });
  },

  setTab(tab) {
    this.setData({
      activeTab: tab
    });
    this.loadScores();
  },

  getDifficultyText(difficulty) {
    const difficultyMap = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    };
    return difficultyMap[difficulty] || difficulty;
  },

  getRankClass(index) {
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    if (index === 2) return 'bronze';
    return '';
  },

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  },

  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = d.getHours().toString().padStart(2, '0');
    const minute = d.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hour}:${minute}`;
  },

  goToGame() {
    wx.navigateTo({
      url: '/pages/game/index'
    });
  },

  goHome() {
    wx.navigateBack();
  }
});