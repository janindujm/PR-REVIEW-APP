module.exports = {
  feature: {
    maxFiles: 10,
    requireTests: true,
    description: "Feature development"
  },
  bugfix: {
    maxFiles: 5,
    requireTests: false,
    description: "Bug fix"
  },
  hotfix: {
    maxFiles: 2,
    requireTests: false,
    description: "Critical hotfix"
  }
};
