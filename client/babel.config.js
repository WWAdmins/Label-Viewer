module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    ['wildcard', {
        'exts': ["js", "es6", "es", "jsx", "javascript", "png"]
    }]
  ]
}
