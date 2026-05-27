export function shareResult(result) {
  const text = `🎉 I scored ${result.percentage}% (${result.score}/${result.total}) on RPREP CBT App!\n\n📚 Subject: ${result.subject || 'Nursing'}\n✅ Correct: ${result.correct}\n❌ Wrong: ${result.wrong}\n\nDownload RPREP now: https://rprep.online`;
  
  if (navigator.share) {
    navigator.share({ title: 'My RPREP Test Result', text });
  } else {
    navigator.clipboard.writeText(text).then(() => alert('Result copied! Share with friends.'));
  }
}
