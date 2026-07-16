export const renderContentWithLineBreaks = (content) => {
  if (!content) return '';
  
  if (typeof content !== 'string') {
    return String(content);
  }
  
  return content.split('|').map((part, index) => (
    <span key={index}>
      {part}
      {index < content.split('|').length - 1 && <br />}
    </span>
  ));
};