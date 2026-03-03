module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['support/**/*.js', 'features/step_definitions/**/*.js'],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
    ],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
};
