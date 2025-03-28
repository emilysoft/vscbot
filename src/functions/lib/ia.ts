export default async function (prompt:string) {
    let response;
    fetch(`https://gemini-rest.vercel.app/api/?prompt=${encodeURIComponent(prompt)}`)
        .then(res => res.json())
        .then(res => {
            response = res.response
        })
    return response
}