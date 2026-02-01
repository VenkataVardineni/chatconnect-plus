module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "net": false,
    "tls": false,
    "fs": false,
    "path": false,
    "crypto": false
  };
  return config;
};

