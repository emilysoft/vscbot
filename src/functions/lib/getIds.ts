export default (content: string) => {
  const regex = /\d{18,20}/;
  const args = content.split(/\s+/);
  const ids: string[] = [];
  args.forEach((arg) => {
    const match = arg.match(regex);
    if (match != null) {
      ids.push(match[0]);
    }
  });
  return ids;
};
