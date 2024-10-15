export default (content:string) => {
    const regex = /\d{18,20}/;
    const args = content.split(/\s+/);
    let ids: string[] = [];
    args.forEach((arg) => {
        let match = arg.match(regex);
        if (match != null) {
            ids.push(match[0]);
        }
    });
    return ids;
};
