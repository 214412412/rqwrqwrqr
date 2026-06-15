Page({
  data: {
    showDifficulty: false
  },

  startGame() {
    this.setData({
      showDifficulty: true
    });
  },

  closeDifficulty() {
    this.setData({
      showDifficulty: false
    });
  },

  selectDifficulty(e) {
    const difficulty = e.currentTarget.dataset.difficulty;
    this.setData({
      showDifficulty: false
    });
    
    wx.navigateTo({
      url: `/pages/game/index?difficulty=${difficulty}`
    });
  },

  goToLeaderboard() {
    wx.navigateTo({
      url: '/pages/leaderboard/index'
    });
  },

  goToRules() {
    wx.navigateTo({
      url: '/pages/rules/index'
    });
  }
});